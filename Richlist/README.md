# SUI Richlist Generator

A Node.js tool to generate a richlist CSV of the top 1,000,000 SUI addresses using the Blockberry API.

## Features

- Fetches top SUI holders by balance from Blockberry API
- Generates CSV in the same format as your existing airdrop files
- Real-time progress tracking and error handling
- Rate limiting to respect API limits
- Optional API key support for higher rate limits
- Generates summary statistics

## Installation

1. Navigate to the Richlist directory:
```bash
cd Richlist
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up API key for higher rate limits:
```bash
cp env.example .env
# Edit .env and add your Blockberry API key
```

## Usage

### With API Key (Required)
The Blockberry API requires authentication. You'll need to:

1. Get your API key from [Blockberry API](https://api.blockberry.one/)
2. Create a `.env` file with your API key:
```bash
BLOCKBERRY_API_KEY=your_api_key_here
```
3. Run the generator:
```bash
npm start
```

### Test API Connection
Before running the full generator, you can test the API connection:
```bash
node test-api.js
```

## Output Files

- `sui-richlist.csv` - Main CSV file with addresses and balances
- `richlist-summary.txt` - Summary statistics and top 10 addresses

## CSV Format

The output CSV follows the same format as your existing airdrop files:
```
address, amount
0x1234..., 1000.000
0x5678..., 500.250
```

## Configuration

You can modify the following constants in `generate-richlist.js`:

- `MAX_ADDRESSES`: Maximum number of addresses to fetch (default: 1,000,000)
- `PAGE_SIZE`: Number of addresses per API request (default: 100)
- `DELAY_BETWEEN_REQUESTS`: Delay between requests in milliseconds (default: 1000)

## API Endpoint

This tool uses the Blockberry API endpoint:
```
GET https://api.blockberry.one/sui/v1/coins/0x2::sui::SUI/holders
```

Parameters:
- `page`: Page number (0-based)
- `size`: Number of results per page (1-100)
- `orderBy`: Sort order (DESC for highest first)
- `sortBy`: Sort field (AMOUNT for balance)

## Error Handling

The tool includes robust error handling:
- Automatic retry on network errors
- Extended delays on rate limit errors (429)
- Graceful handling of API limits
- Progress tracking and recovery

## Performance

- Fetches 100 addresses per request (API maximum)
- 1-second delay between requests to respect rate limits
- Real-time file writing to prevent data loss
- Memory-efficient processing

## Notes

- The API may have rate limits for public access
- Using an API key provides higher rate limits
- The tool will stop when no more data is available
- Progress is logged to console in real-time

## Troubleshooting

### Rate Limit Errors
If you encounter rate limit errors, the tool will automatically wait 30 seconds before retrying.

### Network Errors
The tool will retry failed requests with a 5-second delay.

### API Key Issues
Make sure your API key is valid and has the necessary permissions for the holders endpoint. 