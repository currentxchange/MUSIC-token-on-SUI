#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Sui Airdrop Tool...\n');

// Run the airdrop script
const airdropProcess = spawn('node', ['airdrop.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

airdropProcess.on('close', (code) => {
    console.log(`\n✨ Airdrop process completed with code ${code}`);
    process.exit(code);
});

airdropProcess.on('error', (error) => {
    console.error('❌ Failed to start airdrop process:', error);
    process.exit(1);
}); 