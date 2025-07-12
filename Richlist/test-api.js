import fetch from 'node-fetch';

// Load environment variables
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (error) {
  console.log('dotenv not available, using environment variables directly');
}

const API_BASE_URL = 'https://api.blockberry.one/sui/v1';
const COIN_TYPE = '0x2::sui::SUI';

async function testAPI() {
  console.log('Testing Blockberry API connection...');
  
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

  const apiKey = process.env.BLOCKBERRY_API_KEY;
  if (apiKey) {
    headers['x-api-key'] = apiKey;
    console.log(`Using API key: ${apiKey.substring(0, 10)}...`);
  } else {
    console.log('No API key found in environment variables');
  }

  try {
    const response = await fetch(`${url}?${params}`, { headers });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(`Authentication required. Please provide a valid API key. Status: ${response.status}`);
      } else if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Status: ${response.status}`);
      } else {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    console.log('✅ API connection successful!');
    console.log(`📊 Response structure:`, {
      hasContent: !!data.content,
      contentLength: data.content?.length || 0,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      pageable: data.pageable
    });

    if (data.content && data.content.length > 0) {
      console.log('\n📋 Sample data structure:');
      console.log(JSON.stringify(data.content[0], null, 2));
      
      console.log('\n💰 Top 5 SUI holders:');
      data.content.forEach((holder, index) => {
        console.log(`${index + 1}. ${holder.holderAddress}: ${holder.amount} SUI`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// Run test
testAPI().then(success => {
  if (success) {
    console.log('\n🎉 API is working correctly! You can now run the main generator.');
  } else {
    console.log('\n💡 Check your internet connection and try again.');
  }
}); 