import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRECISION = 1000000; // 6 decimal places

/**
 * Divides amounts in CSV files by 100 (only if amount > 3)
 * @param {string} inputFile - Path to input CSV file
 * @param {string} outputFile - Path to output CSV file (optional)
 */
function divideAmounts(inputFile, outputFile = null) {
    try {
        // Read the input file
        const content = fs.readFileSync(inputFile, 'utf8');
        const lines = content.trim().split('\n');
        
        // Process each line
        const processedLines = lines.map(line => {
            // Split by comma and space to separate address and amount
            const parts = line.split(', ');
            if (parts.length !== 2) {
                console.warn(`Warning: Skipping malformed line: ${line}`);
                return line; // Keep original line if malformed
            }
            
            const address = parts[0].trim();
            const amount = parseFloat(parts[1].trim());
            
            if (isNaN(amount)) {
                console.warn(`Warning: Invalid amount in line: ${line}`);
                return line; // Keep original line if amount is invalid
            }
            
            // Convert to integer for precise math
            const amountInt = Math.round(amount * PRECISION);
            
            // Only divide if amount is over 3 MUSIC (using integer comparison)
            const newAmountInt = amountInt > (3 * PRECISION) ? Math.round(amountInt / 1000) : amountInt;
            
            // Convert back to decimal for output
            const newAmount = newAmountInt / PRECISION;
            
            return `${address}, ${newAmount.toFixed(6)}`;
        });
        
        // Determine output file name
        const finalOutputFile = outputFile || inputFile.replace('.csv', '-divided.csv');
        
        // Write the processed data
        fs.writeFileSync(finalOutputFile, processedLines.join('\n') + '\n');
        
        console.log(`✅ Successfully processed ${lines.length} lines`);
        console.log(`📁 Output saved to: ${finalOutputFile}`);
        
        // Show a few examples
        console.log('\n📊 Sample results:');
        processedLines.slice(0, 5).forEach(line => {
            console.log(`   ${line}`);
        });
        
    } catch (error) {
        console.error('❌ Error processing file:', error.message);
    }
}

/**
 * Process multiple files in a directory
 * @param {string} directory - Directory containing CSV files
 * @param {string} pattern - File pattern to match (e.g., '*.csv')
 */
function processDirectory(directory, pattern = '*.csv') {
    try {
        const files = fs.readdirSync(directory);
        const csvFiles = files.filter(file => file.endsWith('.csv'));
        
        if (csvFiles.length === 0) {
            console.log(`No CSV files found in ${directory}`);
            return;
        }
        
        console.log(`Found ${csvFiles.length} CSV files in ${directory}:`);
        csvFiles.forEach(file => console.log(`  - ${file}`));
        
        csvFiles.forEach(file => {
            const inputPath = path.join(directory, file);
            console.log(`\n🔄 Processing: ${file}`);
            divideAmounts(inputPath);
        });
        
    } catch (error) {
        console.error('❌ Error processing directory:', error.message);
    }
}

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log(`
🔧 Amount Divider Tool
=====================

Usage:
  node divide-amounts.js <input-file> [output-file]
  node divide-amounts.js --dir <directory>

Examples:
  node divide-amounts.js Richlist/sui-music.csv
  node divide-amounts.js Airdrops/done/suiba.csv suiba-divided.csv
  node divide-amounts.js --dir Airdrops/done

This tool divides amounts in CSV files by 10000.
Format expected: address, amount
    `);
    process.exit(0);
}

if (args[0] === '--dir') {
    if (args.length < 2) {
        console.error('❌ Please specify a directory: node divide-amounts.js --dir <directory>');
        process.exit(1);
    }
    processDirectory(args[1]);
} else {
    const inputFile = args[0];
    const outputFile = args[1] || null;
    divideAmounts(inputFile, outputFile);
} 