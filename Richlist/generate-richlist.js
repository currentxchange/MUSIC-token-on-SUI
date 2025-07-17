import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = 'https://api.blockberry.one/sui/v1';
const COIN_TYPE = '0x2::sui::SUI';
const MAX_ADDRESSES = 1000000;
const PAGE_SIZE = 100; // Maximum allowed by API
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay to be respectful to API

// Load environment variables if .env file exists
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (error) {
  console.log('dotenv not available, using environment variables directly');
}

class RichlistGenerator {
  constructor() {
    this.apiKey = process.env.BLOCKBERRY_API_KEY;
    this.addresses = [];
    this.currentPage = 0;
    this.totalFetched = 0;
    this.outputFile = path.join(__dirname, 'sui-richlist.csv');
    this.resumeFromPage = 0;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if we can resume from existing file
  async checkResumeStatus() {
    if (!fs.existsSync(this.outputFile)) {
      console.log('📁 No existing CSV file found. Starting fresh...');
      return false;
    }

    const stats = fs.statSync(this.outputFile);
    if (stats.size === 0) {
      console.log('📁 Existing CSV file is empty. Starting fresh...');
      return false;
    }

    try {
      const content = fs.readFileSync(this.outputFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        console.log('📁 Existing CSV file has no valid lines. Starting fresh...');
        return false;
      }

      // Calculate how many pages we've already processed
      this.totalFetched = lines.length;
      this.resumeFromPage = Math.floor(this.totalFetched / PAGE_SIZE);
      
      console.log(`📁 Found existing CSV file with ${this.totalFetched.toLocaleString()} addresses`);
      console.log(`🔄 Resuming from page ${this.resumeFromPage} (${this.totalFetched.toLocaleString()} addresses already fetched)`);
      
      // Load existing addresses into memory for summary generation
      this.addresses = lines.map(line => {
        const [address, amount] = line.split(', ');
        return { address: address.trim(), amount: amount.trim() };
      });

      return true;
    } catch (error) {
      console.log('❌ Error reading existing CSV file. Starting fresh...');
      return false;
    }
  }

  async fetchHolders(page, size = PAGE_SIZE) {
    const url = `${API_BASE_URL}/coins/${encodeURIComponent(COIN_TYPE)}/holders`;
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      orderBy: 'DESC',
      sortBy: 'AMOUNT'
    });

    const headers = {
      'accept': '*/*',
      'User-Agent': 'SUI-Richlist-Generator/1.0'
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    try {
      console.log(`Fetching page ${page} with ${size} addresses...`);
      
      const response = await fetch(`${url}?${params}`, { headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(`Authentication required. Please provide a valid API key in your .env file. Status: ${response.status}`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded. Status: ${response.status}`);
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      throw error;
    }
  }

  async fetchAllHolders() {
    console.log(`Starting to fetch top ${MAX_ADDRESSES.toLocaleString()} SUI addresses...`);
    console.log(`Output file: ${this.outputFile}`);
    
    if (this.apiKey) {
      console.log('✅ Using API key for authentication');
    } else {
      console.log('❌ No API key provided!');
      console.log('Please create a .env file with your BLOCKBERRY_API_KEY');
      console.log('Get your API key from: https://api.blockberry.one/');
      process.exit(1);
    }

    // Check if we can resume from existing file
    const canResume = await this.checkResumeStatus();
    
    if (!canResume) {
      // Create/clear output file for fresh start
      fs.writeFileSync(this.outputFile, '');
      this.currentPage = 0;
      this.totalFetched = 0;
      this.addresses = [];
    } else {
      // Set current page to resume from
      this.currentPage = this.resumeFromPage;
    }

    while (this.totalFetched < MAX_ADDRESSES) {
      try {
        const data = await this.fetchHolders(this.currentPage, PAGE_SIZE);
        
        if (!data || !data.content || data.content.length === 0) {
          console.log('No more data available');
          break;
        }

        // Process addresses from this page
        for (const holder of data.content) {
          if (this.totalFetched >= MAX_ADDRESSES) {
            break;
          }

          const address = holder.holderAddress;
          const amount = parseFloat(holder.amount || 0);
          
          // Format amount to match existing CSV format (3 decimal places)
          const formattedAmount = amount.toFixed(3);
          
          // Add to addresses array
          this.addresses.push({
            address,
            amount: formattedAmount
          });

          this.totalFetched++;
        }

        // Write to file in real-time
        await this.writeToFile(data.content);

        console.log(`Fetched ${data.content.length} addresses. Total: ${this.totalFetched.toLocaleString()}/${MAX_ADDRESSES.toLocaleString()}`);

        // Check if we've reached the end
        if (data.content.length < PAGE_SIZE) {
          console.log('Reached end of available data');
          break;
        }

        this.currentPage++;

        // Add delay between requests to be respectful to the API
        if (this.currentPage > 0) {
          await this.delay(DELAY_BETWEEN_REQUESTS);
        }

      } catch (error) {
        console.error(`Error on page ${this.currentPage}:`, error.message);
        
        // If it's a rate limit error, wait longer
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          console.log('Rate limit hit, waiting 30 seconds...');
          await this.delay(30000);
        } else {
          // For other errors, wait a bit and retry
          console.log('Waiting 5 seconds before retry...');
          await this.delay(5000);
        }
      }
    }

    console.log(`\n✅ Richlist generation complete!`);
    console.log(`📊 Total addresses fetched: ${this.totalFetched.toLocaleString()}`);
    console.log(`📁 Output file: ${this.outputFile}`);
    
    // Generate summary
    await this.generateSummary();
  }

  async writeToFile(holders) {
    const lines = holders.map(holder => {
      const address = holder.holderAddress;
      const amount = parseFloat(holder.amount || 0).toFixed(3);
      return `${address}, ${amount}`;
    });

    fs.appendFileSync(this.outputFile, lines.join('\n') + '\n');
  }

  async generateSummary() {
    const summaryFile = path.join(__dirname, 'richlist-summary.txt');
    const totalAddresses = this.addresses.length;
    const totalSUI = this.addresses.reduce((sum, addr) => sum + parseFloat(addr.amount), 0);
    
    const summary = `
SUI Richlist Summary
===================
Generated: ${new Date().toISOString()}
Total Addresses: ${totalAddresses.toLocaleString()}
Total SUI: ${totalSUI.toLocaleString()}
Average SUI per address: ${(totalSUI / totalAddresses).toFixed(3)}

Top 10 Addresses:
${this.addresses.slice(0, 10).map((addr, index) => 
  `${index + 1}. ${addr.address}: ${parseFloat(addr.amount).toLocaleString()} SUI`
).join('\n')}

Output file: ${this.outputFile}
`;

    fs.writeFileSync(summaryFile, summary);
    console.log(`📋 Summary saved to: ${summaryFile}`);
  }
}

// Main execution
async function main() {
  const generator = new RichlistGenerator();
  
  try {
    await generator.fetchAllHolders();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default RichlistGenerator; 