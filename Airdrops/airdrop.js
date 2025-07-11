import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { config, getNetworkUrl } from './config.js';

class AirdropTool {
    constructor() {
        this.client = new SuiClient({ url: getNetworkUrl() });
        
        // Initialize keypair from environment variable or generate new one
        if (process.env.PRIVATE_KEY) {
            try {
                this.keypair = Ed25519Keypair.fromSecretKey(process.env.PRIVATE_KEY);
                console.log('🔑 Using private key from environment variable');
            } catch (error) {
                console.error('❌ Invalid private key in environment variable:', error.message);
                console.log('🔄 Generating new keypair instead');
                this.keypair = new Ed25519Keypair();
            }
        } else {
            console.log('⚠️  No PRIVATE_KEY found in environment, generating new keypair');
            this.keypair = new Ed25519Keypair();
        }
        
        this.processedAddresses = new Set();
        this.loadProcessedAddresses();
    }

    // Load already processed addresses from dropped files
    loadProcessedAddresses() {
        const files = this.getCsvFiles();
        files.forEach(file => {
            const droppedFile = this.getDroppedFileName(file);
            if (existsSync(droppedFile)) {
                const content = readFileSync(droppedFile, 'utf8');
                const addresses = content.split('\n')
                    .filter(line => line.trim())
                    .map(line => line.split(',')[0].trim());
                addresses.forEach(addr => this.processedAddresses.add(addr));
            }
        });
    }

    // Get all CSV files in the current directory
    getCsvFiles() {
        return readdirSync('.')
            .filter(file => file.endsWith('.csv') && !file.endsWith('-dropped.csv'));
    }

    // Get the dropped file name for a given CSV file
    getDroppedFileName(csvFile) {
        const name = basename(csvFile, '.csv');
        return `${name}${config.droppedFileSuffix}`;
    }

    // Parse CSV file and return address-amount pairs
    parseCsvFile(filename) {
        const content = readFileSync(filename, 'utf8');
        return content.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [address, amount] = line.split(config.csvDelimiter).map(s => s.trim());
                // Convert decimal amount to integer using configurable decimals
                const multiplier = Math.pow(10, config.tokenDecimals);
                const amountInSmallestUnit = Math.floor(parseFloat(amount) * multiplier);
                return { address, amount: amountInSmallestUnit };
            })
            .filter(item => item.address && !isNaN(item.amount));
    }

    // Send a single transaction
    async sendTransaction(recipient, amount) {
        try {
            const tx = new Transaction();
            const walletAddress = this.keypair.getPublicKey().toSuiAddress();
            
            // Check if recipient already has a balance of this token
            const recipientBalance = await this.client.getBalance({
                owner: recipient,
                coinType: config.tokenType,
            });
            
            if (parseInt(recipientBalance.totalBalance) > 0) {
                const balanceInDecimal = (parseInt(recipientBalance.totalBalance) / Math.pow(10, config.tokenDecimals)).toFixed(config.tokenDecimals).replace(/\.?0+$/, '');
                const tokenName = config.tokenType.split('::').pop();
                throw new Error(`Recipient ${recipient} already has ${balanceInDecimal} ${tokenName} balance`);
            }
            
            // For custom tokens (like MUSIC), we need to find and use existing coins
            const coins = await this.client.getCoins({
                owner: walletAddress,
                coinType: config.tokenType,
            });
            
            if (coins.data.length === 0) {
                throw new Error(`No ${config.tokenType} coins found in wallet ${walletAddress}`);
            }
            
            // Find a coin with sufficient balance
            const coinWithBalance = coins.data.find(coin => 
                BigInt(coin.balance) >= BigInt(amount)
            );
            
            if (!coinWithBalance) {
                throw new Error(`Insufficient ${config.tokenType} balance in wallet ${walletAddress}`);
            }
            
            // Split the coin and transfer the new coin to recipient
            const [coin] = tx.splitCoins(coinWithBalance.coinObjectId, [amount]);
            tx.transferObjects([coin], recipient);
            
            const result = await this.client.signAndExecuteTransaction({
                signer: this.keypair,
                transaction: tx,
                options: {
                    showEffects: true,
                    showEvents: false,
                    showInput: false,
                    showObjectChanges: false,
                    showBalanceChanges: false,
                }
            });
            
            if (config.verbose) {
                const tokenName = config.tokenType.split('::').pop();
                const amountInDecimal = (amount / Math.pow(10, config.tokenDecimals)).toFixed(config.tokenDecimals).replace(/\.?0+$/, '');
                console.log(`✅ Sent ${amountInDecimal} ${tokenName} to ${recipient}`);
                if (config.showTransactionDigests) {
                    console.log(`   Transaction: ${result.digest}`);
                }
            }
            return result.digest;
        } catch (error) {
            const amountInDecimal = (amount / Math.pow(10, config.tokenDecimals)).toFixed(config.tokenDecimals).replace(/\.?0+$/, '');
            console.error(`❌ Failed to send ${amountInDecimal} ${config.tokenType} to ${recipient}:`, error.message);
            return null;
        }
    }

    // Process a batch of transactions
    async processBatch(batch) {
        const results = [];
        for (const { address, amount } of batch) {
            const digest = await this.sendTransaction(address, amount);
            if (digest) {
                results.push({ address, amount, digest });
                this.processedAddresses.add(address);
            }
            // Small delay between transactions
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenTransactions));
        }
        return results;
    }

    // Save processed addresses to dropped file
    saveProcessedAddresses(filename, processedItems) {
        const droppedFile = this.getDroppedFileName(filename);
        const content = processedItems
            .map(item => {
                const amountInDecimal = (item.amount / Math.pow(10, config.tokenDecimals)).toFixed(config.tokenDecimals).replace(/\.?0+$/, '');
                return `${item.address}, ${amountInDecimal}, ${item.digest}`;
            })
            .join('\n') + '\n';
        
        writeFileSync(droppedFile, content, { flag: 'a' });
        console.log(`📝 Saved processed addresses to ${droppedFile}`);
    }

    // Check wallet balance
    async checkBalance() {
        try {
            const walletAddress = this.keypair.getPublicKey().toSuiAddress();
            const balance = await this.client.getBalance({
                owner: walletAddress,
                coinType: config.tokenType,
            });
            
            const tokenName = config.tokenType.split('::').pop();
            const balanceInDecimal = (parseInt(balance.totalBalance) / Math.pow(10, config.tokenDecimals)).toFixed(config.tokenDecimals).replace(/\.?0+$/, '');
            console.log(`💰 Wallet balance: ${balanceInDecimal} ${tokenName}`);
            return parseInt(balance.totalBalance);
        } catch (error) {
            const walletAddress = this.keypair.getPublicKey().toSuiAddress();
            console.error(`❌ Failed to check balance for wallet ${walletAddress}:`, error.message);
            return 0;
        }
    }

    // Main airdrop function
    async runAirdrop() {
        console.log(`🚀 Starting airdrop on ${config.network} network`);
        console.log(`🔑 Sender address: ${this.keypair.getPublicKey().toSuiAddress()}`);
        console.log(`🪙 Token type: ${config.tokenType}`);
        
        // Check balance before starting
        const balance = await this.checkBalance();
        if (balance === 0) {
            console.log('⚠️  Warning: Wallet has zero balance for the specified token');
        }
        
        const files = this.getCsvFiles();
        console.log(`📁 Found ${files.length} CSV files to process`);
        
        for (const file of files) {
            console.log(`\n📄 Processing file: ${file}`);
            
            const items = this.parseCsvFile(file);
            const unprocessedItems = items.filter(item => 
                !this.processedAddresses.has(item.address)
            );
            
            if (unprocessedItems.length === 0) {
                console.log(`   All addresses in ${file} have already been processed`);
                continue;
            }
            
            console.log(`   Found ${unprocessedItems.length} unprocessed addresses`);
            
            // Process in batches
            for (let i = 0; i < unprocessedItems.length; i += config.batchSize) {
                const batch = unprocessedItems.slice(i, i + config.batchSize);
                console.log(`\n   Processing batch ${Math.floor(i/config.batchSize) + 1}/${Math.ceil(unprocessedItems.length/config.batchSize)}`);
                
                const results = await this.processBatch(batch);
                this.saveProcessedAddresses(file, results);
                
                // Delay between batches
                if (i + config.batchSize < unprocessedItems.length) {
                    console.log(`   Waiting ${config.delayBetweenBatches}ms before next batch...`);
                    await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
                }
            }
        }
        
        console.log(`\n🎉 Airdrop completed!`);
    }
}

// Run the airdrop
const airdropTool = new AirdropTool();
airdropTool.runAirdrop().catch(console.error); 