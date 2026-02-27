// VIBE Credit Union — x402-enabled Claude API Proxy
// api.vibe.spiritprotocol.io

import { config } from 'dotenv';
config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';

import { initDb, getDb } from './db.js';
import { forwardToAnthropic, forwardToAnthropicStream } from './anthropic.js';
import {
  DEFAULT_MODEL,
  estimateCallCost,
  calculateActualCost,
  formatUsdcPrice,
  getModelList,
  resolveModel,
} from './pricing.js';
import {
  joinMember,
  getMember,
  getBalance,
  deductFromBalance,
  refundBalance,
  creditBalance,
  logUsage,
  getUsageHistory,
  getStats,
  recordDeposit,
} from './members.js';
import {
  createPool,
  getPool,
  joinPool,
  fundPool,
  deductFromPool,
} from './pools.js';

// --- Config ---

type Network = `${string}:${string}`;

const PORT = parseInt(process.env.PORT || '3001', 10);
const RECEIVER_WALLET = process.env.RECEIVER_WALLET as `0x${string}`;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402.org/facilitator';
const NETWORK = (process.env.NETWORK || 'eip155:84532') as Network; // Base Sepolia for dev

if (!RECEIVER_WALLET) {
  console.error('Missing RECEIVER_WALLET — set it in .env');
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY — set it in .env');
  process.exit(1);
}

// --- Initialize ---

initDb();

const app: express.Express = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- x402 Setup ---

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

// Extend Express Request for VIBE-specific fields
declare global {
  namespace Express {
    interface Request {
      vibePaymentMode?: 'x402' | 'balance' | 'pool';
      vibeEstimatedCost?: number;
      vibeAccountId?: string;
      vibePoolId?: string;
    }
  }
}

// --- Balance/Pool Pre-check Middleware ---
// If x-vibe-account header is present and has sufficient balance,
// deduct and skip x402 payment. Otherwise fall through to x402.

function balanceCheckMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'POST' || req.path !== '/v1/messages') {
    next();
    return;
  }

  const accountId = req.headers['x-vibe-account'] as string | undefined;
  const poolId = req.headers['x-vibe-pool'] as string | undefined;

  if (!accountId) {
    next();
    return;
  }

  const model = req.body?.model;
  if (!model) {
    next();
    return;
  }

  const estimatedCost = estimateCallCost(model, req.body);

  // Try pool balance first if specified
  if (poolId) {
    if (deductFromPool(poolId, estimatedCost)) {
      req.vibePaymentMode = 'pool';
      req.vibeEstimatedCost = estimatedCost;
      req.vibeAccountId = accountId;
      req.vibePoolId = poolId;
      next('route'); // Skip x402 middleware, go to handler
      return;
    }
  }

  // Try personal balance
  if (deductFromBalance(accountId, estimatedCost)) {
    req.vibePaymentMode = 'balance';
    req.vibeEstimatedCost = estimatedCost;
    req.vibeAccountId = accountId;
    next('route'); // Skip x402 middleware, go to handler
    return;
  }

  // Insufficient balance — fall through to x402
  next();
}

// --- x402 Payment Middleware ---
// Gates POST /v1/messages with USDC micropayment via x402 protocol.
// Default price covers a typical Opus 4.6 call; dynamic pricing planned.

const defaultPrice = formatUsdcPrice(estimateCallCost(DEFAULT_MODEL, {
  messages: [{ role: 'user', content: 'Hello' }],
  max_tokens: 1024,
}));

app.use(balanceCheckMiddleware);

// x402 payment gate — wraps the middleware with async error handling
// so the server doesn't crash when the facilitator is unreachable (dev/testing).
const x402MW = paymentMiddleware(
  {
    'POST /v1/messages': {
      accepts: [{
        scheme: 'exact',
        price: defaultPrice,
        network: NETWORK,
        payTo: RECEIVER_WALLET,
      }],
      description: 'Claude API call via VIBE Credit Union',
      mimeType: 'application/json',
    },
  },
  resourceServer,
  undefined, // paywallConfig
  undefined, // paywall
  false, // syncFacilitatorOnStart — we call initialize() manually below
);

app.use((req: Request, res: Response, next: NextFunction) => {
  // If already paid via balance/pool, skip x402
  if (req.vibePaymentMode) {
    next();
    return;
  }
  // Run x402 middleware, catch async errors gracefully
  Promise.resolve(x402MW(req, res, next)).catch((err: any) => {
    console.error('x402 middleware error:', err.message);
    res.status(500).json({
      error: 'Payment processing unavailable',
      detail: err.message,
    });
  });
});

// Sync facilitator support on startup (non-blocking)
resourceServer.initialize().catch((err: any) => {
  console.warn(`  x402 facilitator sync failed: ${err.message}`);
  console.warn('  x402 payments will fail until facilitator is reachable');
});

// ============================================================
//  ROUTES
// ============================================================

// --- Main Proxy Endpoint ---

app.post('/v1/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const model = req.body.model;
    if (!model) {
      res.status(400).json({ error: 'model is required' });
      return;
    }

    if (!resolveModel(model)) {
      res.status(400).json({
        error: `Unsupported model: ${model}`,
        supported: Object.keys(getModelList()),
      });
      return;
    }

    const paymentMode = req.vibePaymentMode || 'x402';
    const estimatedCost = req.vibeEstimatedCost || 0;

    // --- Streaming path ---
    if (req.body.stream === true) {
      try {
        const usage = await forwardToAnthropicStream(req.body, res);

        const actualCost = calculateActualCost(
          model,
          usage.input_tokens,
          usage.output_tokens,
        );

        // Reconcile: refund overcharge or log underpayment
        if (paymentMode === 'balance' && req.vibeAccountId) {
          if (actualCost < estimatedCost) {
            refundBalance(req.vibeAccountId, estimatedCost - actualCost);
          } else if (actualCost > estimatedCost) {
            console.warn(
              `Underpayment for ${req.vibeAccountId}: estimated=${estimatedCost} actual=${actualCost} delta=${actualCost - estimatedCost}`,
            );
          }
        }

        if (paymentMode === 'pool' && req.vibePoolId) {
          if (actualCost < estimatedCost) {
            // Refund pool for overpayment
            getDb().prepare(
              'UPDATE pools SET balance_usdc = balance_usdc + ? WHERE id = ?',
            ).run(estimatedCost - actualCost, req.vibePoolId);
          }
        }

        logUsage({
          memberId: req.vibeAccountId || null,
          poolId: req.vibePoolId || null,
          model,
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
          costUsdc: actualCost,
          estimatedCost,
          paymentMode,
          txHash: null,
        });
      } catch (err: any) {
        // If the stream errored before any data was sent, we can still send JSON
        if (!res.headersSent) {
          res.status(502).json({ error: 'Upstream API error', detail: err.message });
        } else {
          // Stream already started — write an SSE error event and end
          res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
          res.end();
        }
      }
      return;
    }

    // --- Non-streaming path (unchanged) ---
    const response = await forwardToAnthropic(req.body);

    const actualCost = calculateActualCost(
      model,
      response.usage.input_tokens,
      response.usage.output_tokens,
    );

    // If balance mode and actual < estimated, refund the difference
    if (paymentMode === 'balance' && req.vibeAccountId && actualCost < estimatedCost) {
      refundBalance(req.vibeAccountId, estimatedCost - actualCost);
    }

    logUsage({
      memberId: req.vibeAccountId || null,
      poolId: req.vibePoolId || null,
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      costUsdc: actualCost,
      estimatedCost,
      paymentMode,
      txHash: null,
    });

    res.json({
      ...response,
      _vibe: {
        cost_usdc: actualCost / 1_000_000,
        estimated_usdc: estimatedCost / 1_000_000,
        payment_mode: paymentMode,
        model,
      },
    });
  } catch (err: any) {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Upstream API error', detail: err.message });
  }
});

// --- Account Management ---

app.post('/api/join', (req: Request, res: Response): void => {
  try {
    const { wallet, handle } = req.body;
    if (!wallet || !handle) {
      res.status(400).json({ error: 'wallet and handle are required' });
      return;
    }
    const member = joinMember(wallet, handle);
    res.json({ member });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/balance/:address', (req: Request, res: Response): void => {
  const address = req.params.address as string;
  const balance = getBalance(address);
  const member = getMember(address);
  res.json({
    address,
    balance_usdc: balance / 1_000_000,
    balance_micro: balance,
    member: member ? { handle: member.handle, total_deposited: member.total_deposited, total_spent: member.total_spent } : null,
  });
});

app.post('/api/deposit', (req: Request, res: Response): void => {
  try {
    const { wallet, amount, tx_hash, source } = req.body;
    if (!wallet || !amount || !tx_hash) {
      res.status(400).json({ error: 'wallet, amount, and tx_hash are required' });
      return;
    }
    // amount is in USDC (e.g., 10.5), convert to micro-USDC
    const microUsdc = Math.floor(parseFloat(amount) * 1_000_000);
    recordDeposit(wallet, microUsdc, tx_hash, source || 'direct_usdc');
    res.json({ success: true, credited: microUsdc / 1_000_000 });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/usage/:address', (req: Request, res: Response): void => {
  const address = req.params.address as string;
  const limit = parseInt(req.query.limit as string) || 50;
  const history = getUsageHistory(address, limit);
  res.json({ usage: history });
});

// --- Withdraw ---

app.post('/api/withdraw', (req: Request, res: Response): void => {
  try {
    const { address, amount } = req.body;
    if (!address || amount == null) {
      res.status(400).json({ error: 'address and amount are required' });
      return;
    }

    const microUsdc = Math.floor(parseFloat(amount) * 1_000_000);
    if (microUsdc <= 0) {
      res.status(400).json({ error: 'amount must be positive' });
      return;
    }

    const member = getMember(address);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    if (member.balance_usdc < microUsdc) {
      res.status(400).json({
        error: 'Insufficient balance',
        balance_usdc: member.balance_usdc / 1_000_000,
        requested_usdc: microUsdc / 1_000_000,
      });
      return;
    }

    // Deduct from balance
    if (!deductFromBalance(address, microUsdc)) {
      res.status(400).json({ error: 'Insufficient balance (race condition)' });
      return;
    }

    // Record the withdrawal transaction in usage_log
    logUsage({
      memberId: address,
      poolId: null,
      model: 'withdrawal',
      inputTokens: 0,
      outputTokens: 0,
      costUsdc: microUsdc,
      estimatedCost: microUsdc,
      paymentMode: 'balance',
      txHash: null,
    });

    const updatedBalance = getBalance(address);
    res.json({
      success: true,
      withdrawn_usdc: microUsdc / 1_000_000,
      balance_usdc: updatedBalance / 1_000_000,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Pool Management ---

app.post('/api/pools', (req: Request, res: Response): void => {
  try {
    const { name, admin_wallet } = req.body;
    if (!name || !admin_wallet) {
      res.status(400).json({ error: 'name and admin_wallet are required' });
      return;
    }
    const pool = createPool(name, admin_wallet);
    res.json({ pool });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/pools/:id/join', (req: Request, res: Response): void => {
  try {
    const { wallet } = req.body;
    if (!wallet) {
      res.status(400).json({ error: 'wallet is required' });
      return;
    }
    joinPool(req.params.id as string, wallet);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/pools/:id/fund', (req: Request, res: Response): void => {
  try {
    const { wallet, amount } = req.body;
    if (!wallet || !amount) {
      res.status(400).json({ error: 'wallet and amount are required' });
      return;
    }
    const microUsdc = Math.floor(parseFloat(amount) * 1_000_000);
    fundPool(req.params.id as string, wallet, microUsdc);
    res.json({ success: true, funded: microUsdc / 1_000_000 });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/pools/:id', (req: Request, res: Response): void => {
  const pool = getPool(req.params.id as string);
  if (!pool) {
    res.status(404).json({ error: 'Pool not found' });
    return;
  }
  res.json({ pool });
});

// --- Pool Allocate (Admin only) ---

app.post('/api/pools/:id/allocate', (req: Request, res: Response): void => {
  try {
    const poolId = req.params.id as string;
    const { address, amount } = req.body;
    if (!address || amount == null) {
      res.status(400).json({ error: 'address and amount are required' });
      return;
    }

    const microUsdc = Math.floor(parseFloat(amount) * 1_000_000);
    if (microUsdc <= 0) {
      res.status(400).json({ error: 'amount must be positive' });
      return;
    }

    const pool = getPool(poolId);
    if (!pool) {
      res.status(404).json({ error: 'Pool not found' });
      return;
    }

    // Verify caller is pool admin via x-vibe-account header
    const callerId = req.headers['x-vibe-account'] as string | undefined;
    if (!callerId || callerId.toLowerCase() !== pool.admin_id.toLowerCase()) {
      res.status(403).json({ error: 'Only pool admin can allocate funds' });
      return;
    }

    // Verify the target is a pool member
    const isMember = (pool as any).members?.some(
      (m: any) => m.id.toLowerCase() === address.toLowerCase(),
    );
    if (!isMember) {
      res.status(400).json({ error: 'Target address is not a member of this pool' });
      return;
    }

    // Deduct from pool
    if (!deductFromPool(poolId, microUsdc)) {
      res.status(400).json({
        error: 'Insufficient pool balance',
        pool_balance_usdc: pool.balance_usdc / 1_000_000,
        requested_usdc: microUsdc / 1_000_000,
      });
      return;
    }

    // Credit the member's personal balance
    creditBalance(address, microUsdc);

    // Return updated balances
    const updatedPool = getPool(poolId);
    const memberBalance = getBalance(address);

    res.json({
      success: true,
      allocated_usdc: microUsdc / 1_000_000,
      pool_balance_usdc: (updatedPool?.balance_usdc ?? 0) / 1_000_000,
      member_balance_usdc: memberBalance / 1_000_000,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Public ---

app.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    service: 'vibe-credit-union',
    version: '0.2.0',
    network: NETWORK,
    default_model: DEFAULT_MODEL,
  });
});

app.get('/models', (_req: Request, res: Response): void => {
  res.json({
    models: getModelList(),
    default_model: DEFAULT_MODEL,
    currency: 'USDC',
    network: NETWORK,
  });
});

app.get('/stats', (_req: Request, res: Response): void => {
  const stats = getStats();
  res.json(stats);
});

// --- Start ---

app.listen(PORT, () => {
  console.log('');
  console.log('  \u25ce VIBE Credit Union');
  console.log('  Opus 4.6 for vibecoders. Pay what you use.');
  console.log('');
  console.log(`  API:         http://localhost:${PORT}`);
  console.log(`  Proxy:       POST /v1/messages (streaming + non-streaming)`);
  console.log(`  Default:     ${DEFAULT_MODEL}`);
  console.log(`  Network:     ${NETWORK}`);
  console.log(`  Receiver:    ${RECEIVER_WALLET}`);
  console.log(`  Facilitator: ${FACILITATOR_URL}`);
  console.log('');
});

export default app;
