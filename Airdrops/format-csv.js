import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate a random number between 0.0001 and 1.2
function generateRandomNumber() {
    return (Math.random() * 1.1999 + 0.0001).toFixed(3);
}

// Function to format a CSV file
function formatCSVFile(filePath) {
    try {
        // Read the file
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        const formattedLines = [];
        
        for (const line of lines) {
            // Skip header lines or lines that start with #
            if (line.startsWith('#') || line.startsWith('Address') || line.startsWith('Amount') || line.startsWith('Percentage')) {
                continue;
            }
            
            // Extract address from the line
            // Look for a pattern that matches a hex address (0x followed by 64 hex characters)
            const addressMatch = line.match(/0x[a-fA-F0-9]{64}/);
            
            if (addressMatch) {
                const address = addressMatch[0];
                const randomNumber = generateRandomNumber();
                formattedLines.push(`${address}, ${randomNumber}`);
            }
        }
        
        // Write the formatted content back to the file
        fs.writeFileSync(filePath, formattedLines.join('\n'));
        console.log(`✅ Formatted: ${path.basename(filePath)}`);
        
    } catch (error) {
        console.error(`❌ Error formatting ${path.basename(filePath)}:`, error.message);
    }
}

// Function to find and format all CSV files that don't end with -dropped
function formatAllCSVs() {
    const currentDir = __dirname;
    
    try {
        const files = fs.readdirSync(currentDir);
        
        for (const file of files) {
            if (file.endsWith('.csv') && !file.endsWith('-dropped.csv')) {
                const filePath = path.join(currentDir, file);
                formatCSVFile(filePath);
            }
        }
        
        console.log('\n🎉 All CSV files have been formatted!');
        
    } catch (error) {
        console.error('❌ Error reading directory:', error.message);
    }
}

// Run the formatter
console.log('🚀 Starting CSV formatter...\n');
formatAllCSVs(); 