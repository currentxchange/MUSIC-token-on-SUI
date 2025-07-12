import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function setup() {
  console.log('🔧 SUI Richlist Generator Setup');
  console.log('================================\n');

  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    const content = fs.readFileSync(envPath, 'utf8');
    if (content.includes('BLOCKBERRY_API_KEY=')) {
      console.log('✅ API key is configured');
    } else {
      console.log('⚠️  API key is not configured in .env file');
    }
  } else {
    console.log('📝 Creating .env file...');
    const envContent = `# Blockberry API Key (required)
# Get your API key from: https://api.blockberry.one/
BLOCKBERRY_API_KEY=your_api_key_here
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created');
  }

  console.log('\n📋 Next steps:');
  console.log('1. Get your API key from https://api.blockberry.one/');
  console.log('2. Edit the .env file and replace "your_api_key_here" with your actual API key');
  console.log('3. Test the connection: node test-api.js');
  console.log('4. Run the generator: npm start');
  
  console.log('\n💡 Need help? Check the README.md file for detailed instructions.');
}

setup(); 