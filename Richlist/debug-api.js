import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'https://api.blockberry.one/sui/v1';
const COIN_TYPE = '0x2::sui::SUI';

async function debugAPI() {
  console.log('🔍 Debugging Blockberry API...\n');
  
  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  console.log(`📁 .env file exists: ${fs.existsSync(envPath)}`);
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 .env content:');
    console.log(envContent);
  }
  
  // Load environment variables
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
    console.log(`🔑 API Key loaded: ${process.env.BLOCKBERRY_API_KEY ? 'YES' : 'NO'}`);
    if (process.env.BLOCKBERRY_API_KEY) {
      console.log(`🔑 API Key starts with: ${process.env.BLOCKBERRY_API_KEY.substring(0, 10)}...`);
    }
  } catch (error) {
    console.log('❌ dotenv not available');
  }
  
  const url = `${API_BASE_URL}/coins/${encodeURIComponent(COIN_TYPE)}/holders`;
  const params = new URLSearchParams({
    page: '0',
    size: '5',
    orderBy: 'DESC',
    sortBy: 'AMOUNT'
  });

  const headers = {
    'accept': '*/*',
    'User-Agent': 'SUI-Richlist-Generator/1.0'
  };

  if (process.env.BLOCKBERRY_API_KEY) {
    headers['x-api-key'] = process.env.BLOCKBERRY_API_KEY;
  }

  console.log('\n🌐 Making API request...');
  console.log(`URL: ${url}?${params}`);
  console.log('Headers:', JSON.stringify(headers, null, 2));

  try {
    const response = await fetch(`${url}?${params}`, { headers });
    
    console.log(`\n📡 Response Status: ${response.status} ${response.statusText}`);
    console.log('Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    const responseText = await response.text();
    console.log(`\n📄 Response Body (first 500 chars):`);
    console.log(responseText.substring(0, 500));
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n✅ Parsed JSON response:');
        console.log(JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log('\n❌ Failed to parse JSON:', parseError.message);
      }
    } else {
      console.log('\n❌ Request failed');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

debugAPI(); 