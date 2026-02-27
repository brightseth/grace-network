'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { fetchBalance, fetchUsage } from '@/lib/utils';
import DepositPanel from './DepositPanel';
import PoolsPanel from './PoolsPanel';

type Tab = 'overview' | 'deposit' | 'pools' | 'api' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'pools', label: 'Pools' },
  { id: 'api', label: 'API Setup' },
  { id: 'settings', label: 'Settings' },
];

interface BalanceData {
  balance_usdc: number;
  balance_micro: number;
  member: { handle: string; total_deposited: number; total_spent: number } | null;
}

interface UsageEntry {
  id: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usdc: number;
  payment_mode: string;
  created_at: string;
}

export default function Dashboard() {
  const { address } = useAccount();
  const [tab, setTab] = useState<Tab>('overview');
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [recentUsage, setRecentUsage] = useState<UsageEntry[]>([]);

  const refresh = useCallback(() => {
    if (!address) return;
    fetchBalance(address).then(setBalance).catch(() => {});
    fetchUsage(address, 10).then((d) => setRecentUsage(d.usage)).catch(() => {});
  }, [address]);

  useEffect(() => { refresh(); }, [refresh]);

  function modelShort(model: string) {
    if (model.includes('opus')) return 'Opus 4.6';
    if (model.includes('sonnet')) return 'Sonnet 4';
    if (model.includes('haiku')) return 'Haiku 4.5';
    return model;
  }

  const monthSpend = recentUsage.reduce((sum, u) => sum + u.cost_usdc, 0);

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <nav className="w-56 border-r border-vibe-border p-4 space-y-1 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'sidebar-link-active w-full text-left' : 'sidebar-link w-full text-left'}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-8 max-w-4xl">
        {tab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1">
                {balance?.member?.handle ? `Welcome, ${balance.member.handle}` : 'Overview'}
              </h2>
              <p className="text-vibe-muted">Your VIBE Credit Union account</p>
            </div>

            {/* Balance + spend cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-sm text-vibe-muted mb-1">Balance</p>
                <p className="stat-number">
                  ${balance ? (balance.balance_micro / 1_000_000).toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-vibe-muted mt-1">USDC</p>
              </div>
              <div className="card">
                <p className="text-sm text-vibe-muted mb-1">Recent Spend</p>
                <p className="stat-number">
                  ${(monthSpend / 1_000_000).toFixed(4)}
                </p>
                <p className="text-xs text-vibe-muted mt-1">USDC</p>
              </div>
              <div className="card">
                <p className="text-sm text-vibe-muted mb-1">API Calls</p>
                <p className="stat-number">{recentUsage.length}</p>
                <p className="text-xs text-vibe-muted mt-1">recent</p>
              </div>
            </div>

            {/* Quick deposit */}
            <button onClick={() => setTab('deposit')} className="btn-primary">
              Deposit USDC
            </button>

            {/* Recent calls */}
            {recentUsage.length > 0 && (
              <div>
                <h3 className="text-lg mb-3">Recent API Calls</h3>
                <div className="space-y-2">
                  {recentUsage.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="card flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <span className="text-vibe-gold font-medium text-sm">
                          {modelShort(entry.model)}
                        </span>
                        <span className="font-mono text-xs text-vibe-muted">
                          {entry.input_tokens.toLocaleString()} in / {entry.output_tokens.toLocaleString()} out
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm text-vibe-green">
                          ${(entry.cost_usdc / 1_000_000).toFixed(6)}
                        </span>
                        <span className="text-xs text-vibe-muted ml-2">
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'deposit' && balance && (
          <DepositPanel balance={balance.balance_micro} onRefresh={refresh} />
        )}

        {tab === 'pools' && (
          <PoolsPanel onRefresh={refresh} />
        )}

        {tab === 'api' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1">API Setup</h2>
              <p className="text-vibe-muted">Two ways to use Opus 4.6 through the VIBE proxy</p>
            </div>

            {/* Prepaid balance */}
            <div className="card">
              <h3 className="text-lg mb-2">Prepaid balance (for Claude Code / heavy use)</h3>
              <p className="text-sm text-vibe-muted mb-4">
                Deposit USDC, then point your tools at the VIBE proxy. No wallet signatures per call.
                Opus 4.6 is the default model.
              </p>
              <div className="code-block mb-3">
                <pre>{`# Add to your shell config or .env
export ANTHROPIC_BASE_URL=https://api.vibe.spiritprotocol.io
export VIBE_ACCOUNT=${address || '0xYourWallet'}

# Opus 4.6 is default. Claude Code just works.
# Or use the CLI for guided setup:
npx @vibe/cli setup`}</pre>
              </div>
            </div>

            {/* x402 direct */}
            <div className="card">
              <h3 className="text-lg mb-2">Pay as you go (x402 direct)</h3>
              <p className="text-sm text-vibe-muted mb-4">
                No account needed. Any wallet, any call. Your wallet handles USDC payment at the HTTP layer.
              </p>
              <div className="code-block mb-3">
                <code>npm install x402-fetch</code>
              </div>
              <div className="code-block">
                <pre>{`import { wrapFetch } from 'x402-fetch';

const x402Fetch = wrapFetch(fetch, wallet);

const res = await x402Fetch(
  'https://api.vibe.spiritprotocol.io/v1/messages',
  {
    method: 'POST',
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: '...' }],
    }),
  }
);`}</pre>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg mb-3">Model Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Opus 4.6', id: 'claude-opus-4-6', input: '$15.00', output: '$75.00', featured: true },
                  { name: 'Sonnet 4', id: 'claude-sonnet-4-20250514', input: '$3.00', output: '$15.00', featured: false },
                  { name: 'Haiku 4.5', id: 'claude-haiku-4-5-20251001', input: '$0.80', output: '$4.00', featured: false },
                ].map((model) => (
                  <div key={model.name} className={`card text-center ${model.featured ? 'border-vibe-gold' : ''}`}>
                    <h4 className={`font-medium mb-1 ${model.featured ? 'text-vibe-gold text-lg' : 'text-vibe-cream'}`}>
                      {model.name}
                    </h4>
                    <p className="text-xs text-vibe-muted font-mono mb-3">{model.id}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-vibe-muted">Input</span>
                        <span className="font-mono">{model.input}/1M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-vibe-muted">Output</span>
                        <span className="font-mono">{model.output}/1M</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1">Settings</h2>
              <p className="text-vibe-muted">Account configuration</p>
            </div>

            <div className="card">
              <label className="label">Handle</label>
              <p className="font-mono text-vibe-gold">{balance?.member?.handle || '\u2014'}</p>
            </div>

            <div className="card">
              <label className="label">Wallet Address</label>
              <p className="font-mono text-sm text-vibe-cream break-all">{address}</p>
            </div>

            <div className="card">
              <label className="label">Total Deposited</label>
              <p className="font-mono">
                ${balance?.member ? (balance.member.total_deposited / 1_000_000).toFixed(2) : '0.00'} USDC
              </p>
            </div>

            <div className="card">
              <label className="label">Total Spent</label>
              <p className="font-mono">
                ${balance?.member ? (balance.member.total_spent / 1_000_000).toFixed(6) : '0.000000'} USDC
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
