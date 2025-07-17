import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkStatus() {
  console.log('📊 SUI Richlist Status Check');
  console.log('============================\n');

  const csvFile = path.join(__dirname, 'sui-richlist.csv');
  const summaryFile = path.join(__dirname, 'richlist-summary.txt');

  // Check CSV file
  if (fs.existsSync(csvFile)) {
    const stats = fs.statSync(csvFile);
    const content = fs.readFileSync(csvFile, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    console.log('📁 CSV File Status:');
    console.log(`   File: ${csvFile}`);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Lines: ${lines.length.toLocaleString()}`);
    console.log(`   Progress: ${((lines.length / 1000000) * 100).toFixed(2)}% of 1,000,000 addresses`);
    
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      const [lastAddress, lastAmount] = lastLine.split(', ');
      console.log(`   Last address: ${lastAddress.substring(0, 20)}...`);
      console.log(`   Last amount: ${parseFloat(lastAmount).toLocaleString()} SUI`);
    }
  } else {
    console.log('📁 CSV File: Not found');
  }

  // Check summary file
  if (fs.existsSync(summaryFile)) {
    const stats = fs.statSync(summaryFile);
    console.log('\n📋 Summary File Status:');
    console.log(`   File: ${summaryFile}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Last modified: ${stats.mtime.toLocaleString()}`);
  } else {
    console.log('\n📋 Summary File: Not found');
  }

  // Calculate resume info
  if (fs.existsSync(csvFile)) {
    const content = fs.readFileSync(csvFile, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    const totalFetched = lines.length;
    const resumePage = Math.floor(totalFetched / 100);
    
    console.log('\n🔄 Resume Information:');
    console.log(`   Next page to fetch: ${resumePage}`);
    console.log(`   Addresses already fetched: ${totalFetched.toLocaleString()}`);
    console.log(`   Remaining to fetch: ${Math.max(0, 1000000 - totalFetched).toLocaleString()}`);
    
    if (totalFetched > 0) {
      const estimatedTime = Math.ceil((1000000 - totalFetched) / 100) * 1; // 1 second per page
      const hours = Math.floor(estimatedTime / 3600);
      const minutes = Math.floor((estimatedTime % 3600) / 60);
      console.log(`   Estimated time remaining: ${hours}h ${minutes}m`);
    }
  }

  console.log('\n💡 To continue generation: npm start');
  console.log('💡 To start fresh: rm sui-richlist.csv && npm start');
}

checkStatus(); 