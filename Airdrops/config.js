import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Airdrop Configuration
export const config = {
    // Network configuration
    network: process.env.NETWORK || 'testnet', // 'testnet', 'devnet', 'mainnet'
    
    // Token configuration
    tokenType: process.env.TOKEN_TYPE || '0x839e59fae416e39f9b6e839a4f6cfeb6794f1e79b5c2f64e123c7cfdd344960a::music::MUSIC', // Token type to send
    tokenDecimals: parseInt(process.env.TOKEN_DECIMALS) || 6, // Number of decimal places for the token
    
    // Batch processing settings
    batchSize: parseInt(process.env.BATCH_SIZE) || 10, // Number of transactions per batch
    delayBetweenBatches: parseInt(process.env.DELAY_BETWEEN_BATCHES) || 2000, // Delay in milliseconds between batches
    delayBetweenTransactions: parseInt(process.env.DELAY_BETWEEN_TRANSACTIONS) || 500, // Delay in milliseconds between individual transactions
    
    // Gas settings
    gasBudget: parseInt(process.env.GAS_BUDGET) || 2000000, // Gas budget per transaction (in MIST)
    
    // File settings
    csvDelimiter: ',', // CSV delimiter
    droppedFileSuffix: '-dropped.csv', // Suffix for processed files
    
    // Logging
    verbose: true, // Enable detailed logging
    showTransactionDigests: true, // Show transaction digests in output
};

// Helper function to get network URL
export function getNetworkUrl() {
    const urls = {
        testnet: 'https://fullnode.testnet.sui.io',
        devnet: 'https://fullnode.devnet.sui.io',
        mainnet: 'https://fullnode.mainnet.sui.io'
    };
    return urls[config.network] || urls.testnet;
} 