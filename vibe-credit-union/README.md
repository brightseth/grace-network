# VIBE Credit Union

A cooperative compute credit pool for the vibe coding community.

Built by [Spirit Protocol](https://spiritprotocol.io). Powered by [x402](https://www.x402.org/) and Base.

## What is this?

VIBE fills the gap between $200/month Claude Pro and $1000+/month raw API. Two modes:

- **Direct x402** — Any wallet pays per API call in USDC. No membership, no deposit, no signup.
- **Prepaid balance** — Members deposit USDC and API calls deduct from their balance. For teams and heavy users.

## Architecture

```
vibe-credit-union/
├── server/     # Express + x402 middleware + Anthropic proxy (api.vibe.spiritprotocol.io)
├── web/        # Next.js + Tailwind + wagmi frontend (vibe.spiritprotocol.io)
├── cli/        # @vibe/cli tool
└── contracts/  # Optional on-chain pool vault (phase 2)
```

## Quick Start

### Server

```bash
cd server
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY and RECEIVER_WALLET

pnpm install
pnpm dev
```

The server runs on `http://localhost:3001`.

### Frontend

```bash
cd web
pnpm install
pnpm dev
```

The frontend runs on `http://localhost:3000`.

### CLI

```bash
cd cli
pnpm install
node index.mjs setup     # Configure wallet + API URL
node index.mjs balance   # Check balance
node index.mjs estimate  # Cost estimator
```

## Using the Proxy

### Pay as you go (x402)

```js
import { wrapFetch } from 'x402-fetch';

const x402Fetch = wrapFetch(fetch, wallet);
const res = await x402Fetch('https://api.vibe.spiritprotocol.io/v1/messages', {
  method: 'POST',
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
  }),
});
```

### Prepaid balance (for Claude Code)

```bash
export ANTHROPIC_BASE_URL=https://api.vibe.spiritprotocol.io
export VIBE_ACCOUNT=0xYourWallet
```

Or use the local proxy:

```bash
npx @vibe/cli setup
npx @vibe/cli proxy start

# Then:
export ANTHROPIC_BASE_URL=http://localhost:3001
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /v1/messages` | Anthropic proxy (x402 or balance) |
| `POST /api/join` | Register member |
| `GET /api/balance/:address` | Account balance |
| `POST /api/deposit` | Record deposit |
| `GET /api/usage/:address` | Usage history |
| `POST /api/pools` | Create pool |
| `POST /api/pools/:id/join` | Join pool |
| `POST /api/pools/:id/fund` | Fund pool |
| `GET /api/pools/:id` | Pool info |
| `GET /health` | Health check |
| `GET /models` | Supported models + pricing |
| `GET /stats` | Public stats |

## Model Pricing

| Model | Input / 1M tokens | Output / 1M tokens |
|---|---|---|
| claude-sonnet-4-20250514 | $3.00 | $15.00 |
| claude-opus-4-20250514 | $15.00 | $75.00 |
| claude-haiku-4-5-20251001 | $0.80 | $4.00 |

All prices in USDC. Pass-through Anthropic pricing.

## Environment Variables

```
ANTHROPIC_API_KEY    # Anthropic API key (pooled for all users)
RECEIVER_WALLET      # 0x address for USDC payments
FACILITATOR_URL      # x402 facilitator (default: https://x402.org/facilitator)
NETWORK              # Chain ID (default: eip155:84532 for Base Sepolia)
DATABASE_PATH        # SQLite database path
```

## Stack

- **Server**: Express, TypeScript, @x402/express, better-sqlite3
- **Frontend**: Next.js 14, Tailwind, wagmi v2, viem, OnchainKit
- **CLI**: Node.js, Commander.js
- **Payments**: USDC on Base via x402 protocol
- **Settlement**: Coinbase CDP facilitator

---

Spirit Protocol · [spiritprotocol.io](https://spiritprotocol.io) · Base Network
