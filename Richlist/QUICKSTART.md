# Quick Start Guide

Get your SUI richlist up and running in 3 simple steps:

## Step 1: Setup
```bash
npm run setup
```

## Step 2: Get API Key
1. Visit [Blockberry API](https://api.blockberry.one/)
2. Sign up and get your API key
3. Edit the `.env` file and replace `your_api_key_here` with your actual key

## Step 3: Generate Richlist
```bash
npm start
```

That's it! The script will:
- Fetch the top 1,000,000 SUI addresses by balance
- Save them to `sui-richlist.csv` in the same format as your existing files
- Generate a summary in `richlist-summary.txt`

## Test First
Before running the full generator, test your API connection:
```bash
npm test
```

## Need Help?
- Check the main `README.md` for detailed documentation
- The script includes automatic error handling and retry logic
- Progress is shown in real-time during generation 