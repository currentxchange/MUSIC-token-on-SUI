import fs from 'fs';
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(`
Usage: node sum-csv-amounts.js <input-file.csv>

This script sums all the amounts in a CSV file with lines like:
address, amount
`);
  process.exit(1);
}

const inputFile = args[0];
let total = 0;
let count = 0;
const PRECISION = 1000000; // 6 decimal places

try {
  const content = fs.readFileSync(inputFile, 'utf8');
  const lines = content.trim().split('\n');
  lines.forEach((line, idx) => {
    // Try splitting by ', ' first, then fall back to ','
    let parts = line.split(', ');
    if (parts.length !== 2) {
      parts = line.split(',');
      if (parts.length !== 2) {
        console.warn(`Line ${idx + 1}: Skipped (cannot split): ${line}`);
        return;
      }
    }
    const amount = parseFloat(parts[1].trim());
    if (!isNaN(amount)) {
      // Convert to integer by multiplying by PRECISION
      const amountInt = Math.round(amount * PRECISION);
      total += amountInt;
      count++;
      console.log(`Line ${idx + 1}: Parsed amount ${(amountInt / PRECISION).toFixed(6)} from: ${line}`);
    } else {
      console.warn(`Line ${idx + 1}: Invalid amount: ${parts[1]} (from: ${line})`);
    }
  });
  console.log(`✅ Processed ${count} lines`);
  console.log(`🔢 Total sum: ${(total / PRECISION).toFixed(6)}`);
} catch (err) {
  console.error('❌ Error:', err.message);
} 