# Sui Airdrop Tool

Simple tool to send SUI tokens to addresses in CSV files.

## Quick Start

1. **Install:** `npm install`
2. **Setup:** `cp env.example .env` then edit `.env` with your private key
3. **Run:** `node run.js`

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy the example environment file and configure it:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and set your configuration:
   ```bash
   # Your private key (base64 encoded)
   PRIVATE_KEY=your_private_key_here
   
   # Token type to send
   TOKEN_TYPE=0x2::sui::SUI
   
   # Network
   NETWORK=testnet
   ```

3. **Get your private key:**
   ```bash
   # Export your private key from Sui CLI
   sui keytool export <your_key_alias> --format base64
   ```
   
   Or generate a new one:
   ```bash
   sui client new-address ed25519
   ```

## CSV Format

Your CSV files should have this format:
```csv
0x1234567890abcdef..., 0.5
0xabcdef1234567890..., 1.0
```

- First column: Sui address
- Second column: Amount in MIST (1 SUI = 1,000,000,000 MIST)

## Usage

### Quick Start
```bash
node run.js
```

### Alternative Commands
```bash
npm start
# or
npm run airdrop
# or directly
node airdrop.js
```

## How It Works

1. **Scans for CSV files** in the current directory
2. **Loads processed addresses** from existing `-dropped.csv` files
3. **Filters out already processed addresses** to prevent double-drops
4. **Processes addresses in batches** with configurable delays
5. **Saves successful transactions** to `[filename]-dropped.csv` files

## Output Files

For each `filename.csv`, the tool creates:
- `filename-dropped.csv` - Contains processed addresses with transaction digests

Format:
```csv
0x1234567890abcdef..., 0.5, 0xabc123...
0xabcdef1234567890..., 1.0, 0xdef456...
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PRIVATE_KEY` | - | Your private key (base64 encoded) |
| `TOKEN_TYPE` | `'0x2::sui::SUI'` | Token type to send |
| `NETWORK` | `'testnet'` | Network to use: 'testnet', 'devnet', 'mainnet' |
| `BATCH_SIZE` | `10` | Number of transactions per batch |
| `DELAY_BETWEEN_BATCHES` | `2000` | Delay between batches in milliseconds |
| `DELAY_BETWEEN_TRANSACTIONS` | `500` | Delay between individual transactions |
| `GAS_BUDGET` | `10000000` | Gas budget per transaction (in MIST) |

## Example

```bash
# Install dependencies
npm install

# Run airdrop
node run.js
```

Output:
```
🚀 Starting Sui Airdrop Tool...

🚀 Starting airdrop on testnet network
🔑 Sender address: 0x1234567890abcdef...
🪙 Token type: 0x2::sui::SUI
💰 Wallet balance: 1000000000 SUI
📁 Found 1 CSV files to process

📄 Processing file: lofi.csv
   Found 195 unprocessed addresses

   Processing batch 1/20
✅ Sent 0.234 SUI to 0x206a81cb1c41a86a382ecfe13dafabeee8d3b869c9b710306875c56650b008d6
   Transaction: 0xabc123...
📝 Saved processed addresses to lofi-dropped.csv
   Waiting 2000ms before next batch...

🎉 Airdrop completed!
```

## Notes

- The tool uses MIST (the smallest unit of SUI) for amounts
- 1 SUI = 1,000,000,000 MIST
- Make sure you have enough tokens in your wallet for the airdrop
- For SUI tokens, the tool automatically handles gas fees by splitting coins from the gas object
- For custom tokens, make sure you have enough SUI for gas fees
- The tool supports any token type that follows the Sui coin standard
