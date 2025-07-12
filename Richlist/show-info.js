import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function showInfo() {
  console.log('🎯 SUI Richlist Generator');
  console.log('=========================\n');

  console.log('📁 Files created:');
  const files = [
    'generate-richlist.js - Main generator script',
    'test-api.js - API connection tester',
    'setup.js - Environment setup helper',
    'package.json - Dependencies and scripts',
    'README.md - Detailed documentation',
    'QUICKSTART.md - Quick start guide',
    'env.example - Environment variables template'
  ];

  files.forEach(file => {
    const filePath = path.join(__dirname, file.split(' - ')[0]);
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
  });

  console.log('\n🚀 Available commands:');
  console.log('  npm run setup    - Setup environment');
  console.log('  npm test         - Test API connection');
  console.log('  npm start        - Generate richlist');
  console.log('  npm run generate - Generate richlist (alias)');

  console.log('\n📊 What it does:');
  console.log('  • Fetches top 1,000,000 SUI addresses by balance');
  console.log('  • Uses Blockberry API (requires API key)');
  console.log('  • Outputs CSV in same format as your existing files');
  console.log('  • Includes error handling and rate limiting');
  console.log('  • Generates summary statistics');

  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run setup');
  console.log('2. Get API key from: https://api.blockberry.one/');
  console.log('3. Edit .env file with your API key');
  console.log('4. Test: npm test');
  console.log('5. Generate: npm start');

  console.log('\n💡 For detailed help, see README.md');
}

showInfo(); 