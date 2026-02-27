#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { createServer } from 'http';
import express from 'express';

const CONFIG_DIR = join(homedir(), '.vibe');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return { wallet: '', apiUrl: 'https://api.vibe.spiritprotocol.io', proxyPort: 3001 };
  }
}

function saveConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

async function api(path, options) {
  const config = loadConfig();
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

program
  .name('vibe')
  .description('VIBE Credit Union CLI')
  .version('0.1.0');

// --- setup ---
program
  .command('setup')
  .description('Interactive setup: configure wallet and API URL')
  .action(async () => {
    const config = loadConfig();
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

    console.log('\n  ◎ VIBE Credit Union Setup\n');

    const wallet = await ask(`  Wallet address [${config.wallet || 'none'}]: `);
    if (wallet.trim()) config.wallet = wallet.trim();

    const apiUrl = await ask(`  API URL [${config.apiUrl}]: `);
    if (apiUrl.trim()) config.apiUrl = apiUrl.trim();

    const port = await ask(`  Local proxy port [${config.proxyPort}]: `);
    if (port.trim()) config.proxyPort = parseInt(port.trim(), 10);

    rl.close();

    saveConfig(config);
    console.log(`\n  Config saved to ${CONFIG_PATH}`);

    console.log('\n  Add to your shell config:\n');
    console.log(`    export ANTHROPIC_BASE_URL=http://localhost:${config.proxyPort}`);
    console.log(`    export VIBE_ACCOUNT=${config.wallet}`);
    console.log('\n  Then run: vibe proxy start\n');
  });

// --- balance ---
program
  .command('balance')
  .description('Check account balance')
  .action(async () => {
    const config = loadConfig();
    if (!config.wallet) {
      console.error('No wallet configured. Run: vibe setup');
      process.exit(1);
    }

    try {
      const data = await api(`/api/balance/${config.wallet}`);
      console.log(`\n  ◎ VIBE Balance\n`);
      console.log(`  Wallet:    ${data.address}`);
      console.log(`  Balance:   $${data.balance_usdc.toFixed(6)} USDC`);
      if (data.member) {
        console.log(`  Handle:    ${data.member.handle}`);
        console.log(`  Deposited: $${(data.member.total_deposited / 1_000_000).toFixed(2)} USDC`);
        console.log(`  Spent:     $${(data.member.total_spent / 1_000_000).toFixed(6)} USDC`);
      }
      console.log('');
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// --- usage ---
program
  .command('usage')
  .description('Recent usage and costs')
  .option('-n, --limit <number>', 'Number of entries', '20')
  .action(async (opts) => {
    const config = loadConfig();
    if (!config.wallet) {
      console.error('No wallet configured. Run: vibe setup');
      process.exit(1);
    }

    try {
      const data = await api(`/api/usage/${config.wallet}?limit=${opts.limit}`);
      console.log(`\n  ◎ VIBE Usage (last ${opts.limit})\n`);

      if (data.usage.length === 0) {
        console.log('  No API calls yet.\n');
        return;
      }

      console.log('  Model     Input    Output   Cost         Mode     Time');
      console.log('  ' + '-'.repeat(70));

      for (const u of data.usage) {
        const model = u.model.includes('sonnet') ? 'Sonnet' : u.model.includes('opus') ? 'Opus' : u.model.includes('haiku') ? 'Haiku' : u.model.slice(0, 8);
        const cost = `$${(u.cost_usdc / 1_000_000).toFixed(6)}`;
        const time = new Date(u.created_at).toLocaleTimeString();
        console.log(`  ${model.padEnd(10)} ${String(u.input_tokens).padStart(6)}   ${String(u.output_tokens).padStart(6)}   ${cost.padEnd(13)} ${u.payment_mode.padEnd(9)} ${time}`);
      }
      console.log('');
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// --- estimate ---
program
  .command('estimate')
  .description('Estimate cost for a model + token count')
  .option('-m, --model <model>', 'Model name', 'claude-sonnet-4-20250514')
  .option('-i, --input <tokens>', 'Input tokens', '1000')
  .option('-o, --output <tokens>', 'Output tokens', '1024')
  .action((opts) => {
    const rates = {
      'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
      'claude-opus-4-20250514': { input: 15.0, output: 75.0 },
      'claude-haiku-4-5-20251001': { input: 0.8, output: 4.0 },
    };

    const model = opts.model;
    const rate = rates[model];
    if (!rate) {
      console.error(`Unknown model: ${model}`);
      console.error(`Supported: ${Object.keys(rates).join(', ')}`);
      process.exit(1);
    }

    const inputTokens = parseInt(opts.input, 10);
    const outputTokens = parseInt(opts.output, 10);
    const inputCost = (inputTokens / 1_000_000) * rate.input;
    const outputCost = (outputTokens / 1_000_000) * rate.output;
    const total = inputCost + outputCost;

    console.log(`\n  ◎ Cost Estimate\n`);
    console.log(`  Model:   ${model}`);
    console.log(`  Input:   ${inputTokens.toLocaleString()} tokens  →  $${inputCost.toFixed(6)}`);
    console.log(`  Output:  ${outputTokens.toLocaleString()} tokens  →  $${outputCost.toFixed(6)}`);
    console.log(`  Total:   $${total.toFixed(6)} USDC\n`);
  });

// --- deposit ---
program
  .command('deposit [amount]')
  .description('Open deposit page in browser')
  .action((amount) => {
    const config = loadConfig();
    const url = config.apiUrl.replace('api.', '').replace(/:\d+$/, ':3000');
    console.log(`\n  Open the deposit page in your browser:`);
    console.log(`  ${url}\n`);
  });

// --- proxy start ---
program
  .command('proxy')
  .description('Local proxy: localhost → api.vibe.spiritprotocol.io')
  .command('start')
  .description('Start local proxy server')
  .action(() => {
    const config = loadConfig();
    if (!config.wallet) {
      console.error('No wallet configured. Run: vibe setup');
      process.exit(1);
    }

    const app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.text({ type: '*/*', limit: '10mb' }));

    app.all('*', async (req, res) => {
      const targetUrl = `${config.apiUrl}${req.originalUrl}`;

      try {
        const headers = { ...req.headers };
        delete headers.host;
        headers['x-vibe-account'] = config.wallet;

        const response = await fetch(targetUrl, {
          method: req.method,
          headers,
          body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
        });

        const body = await response.text();
        res.status(response.status);
        for (const [key, value] of response.headers) {
          if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(key.toLowerCase())) {
            res.setHeader(key, value);
          }
        }
        res.send(body);
      } catch (err) {
        res.status(502).json({ error: 'Proxy error', detail: err.message });
      }
    });

    app.listen(config.proxyPort, () => {
      console.log('');
      console.log('  ◎ VIBE Local Proxy');
      console.log('');
      console.log(`  Listening:  http://localhost:${config.proxyPort}`);
      console.log(`  Upstream:   ${config.apiUrl}`);
      console.log(`  Account:    ${config.wallet}`);
      console.log('');
      console.log('  Set this in your environment:');
      console.log(`  export ANTHROPIC_BASE_URL=http://localhost:${config.proxyPort}`);
      console.log('');
    });
  });

program.parse();
