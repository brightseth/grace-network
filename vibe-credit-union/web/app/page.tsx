'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletConnect from '@/components/WalletConnect';
import JoinFlow from '@/components/JoinFlow';
import Dashboard from '@/components/Dashboard';
import { fetchBalance, fetchStats } from '@/lib/utils';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ members: 0, apiCalls: 0, totalVolumeUsdc: 0 });
  const [activeTab, setActiveTab] = useState<'x402' | 'prepaid'>('prepaid');

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (!address) {
      setIsMember(null);
      return;
    }
    fetchBalance(address)
      .then((data) => setIsMember(data.member !== null))
      .catch(() => setIsMember(false));
  }, [address]);

  // Connected member -> dashboard
  if (isConnected && isMember === true) {
    return (
      <div className="min-h-screen">
        <Header />
        <Dashboard />
      </div>
    );
  }

  // Connected but not a member -> join flow
  if (isConnected && isMember === false) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto py-20 px-6">
          <JoinFlow onJoined={() => setIsMember(true)} />
        </div>
      </div>
    );
  }

  // Not connected -> landing page
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-vibe-border bg-vibe-card text-sm text-vibe-gold font-mono">
          claude-opus-4-6 available now
        </div>
        <h1 className="text-5xl md:text-6xl mb-6 font-serif leading-tight">
          <span className="text-vibe-gold">Opus 4.6</span> for vibecoders.
          <br />
          <span className="text-vibe-cream">Pay what you use.</span>
        </h1>
        <p className="text-xl text-vibe-muted max-w-2xl mx-auto mb-10">
          Access Claude&apos;s most capable model without a $200/month subscription.
          Pay per API call in USDC on Base.
        </p>
        <div className="flex gap-4 justify-center">
          <WalletConnect />
          <a href="#how-it-works" className="btn-secondary">Learn More</a>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg text-vibe-gold mb-2">One model. Best model.</h3>
            <p className="text-sm text-vibe-muted">
              Opus 4.6 -- Anthropic&apos;s most capable model.
              No tier gymnastics. No plan downgrades.
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg text-vibe-gold mb-2">Pay per call in USDC</h3>
            <p className="text-sm text-vibe-muted">
              x402 micropayments on Base. No account needed.
              Point your wallet at the API and go.
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg text-vibe-gold mb-2">Pool with your crew</h3>
            <p className="text-sm text-vibe-muted">
              Cooperative credit sharing for squads and teams.
              Shared balance, transparent usage, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* API Setup section on landing page */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-3xl text-center mb-4">Start in 30 seconds</h2>
        <p className="text-center text-vibe-muted mb-8">Two lines. That&apos;s it.</p>

        {/* Tabs */}
        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={() => setActiveTab('prepaid')}
            className={activeTab === 'prepaid' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
          >
            Claude Code / SDK
          </button>
          <button
            onClick={() => setActiveTab('x402')}
            className={activeTab === 'x402' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
          >
            x402 Direct
          </button>
        </div>

        {activeTab === 'prepaid' && (
          <div className="card">
            <div className="code-block">
              <pre className="text-sm">{`# Point Claude Code at VIBE
export ANTHROPIC_BASE_URL=https://api.vibe.spiritprotocol.io
export VIBE_ACCOUNT=0xYourWallet

# That's it. Opus 4.6 is the default.
# claude-opus-4-6 -- $15/M input, $75/M output`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'x402' && (
          <div className="card">
            <div className="code-block">
              <pre className="text-sm">{`import { wrapFetch } from 'x402-fetch';

const x402Fetch = wrapFetch(fetch, wallet);

const res = await x402Fetch(
  'https://api.vibe.spiritprotocol.io/v1/messages',
  {
    method: 'POST',
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: 'Build me something great.' }],
    }),
  }
);`}</pre>
            </div>
          </div>
        )}
      </section>

      {/* Stats bar */}
      <section className="border-y border-vibe-border py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="stat-number">{stats.members}</p>
            <p className="text-sm text-vibe-muted">Members</p>
          </div>
          <div>
            <p className="stat-number">{stats.apiCalls.toLocaleString()}</p>
            <p className="text-sm text-vibe-muted">API Calls Served</p>
          </div>
          <div>
            <p className="stat-number">${stats.totalVolumeUsdc.toFixed(2)}</p>
            <p className="text-sm text-vibe-muted">USDC Volume</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-vibe-card border border-vibe-border flex items-center justify-center mx-auto mb-4">
              <span className="text-vibe-gold font-mono font-semibold">1</span>
            </div>
            <h3 className="text-lg mb-2">Connect</h3>
            <p className="text-sm text-vibe-muted">
              Connect your wallet on Base. Coinbase Wallet, MetaMask, or WalletConnect.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-vibe-card border border-vibe-border flex items-center justify-center mx-auto mb-4">
              <span className="text-vibe-gold font-mono font-semibold">2</span>
            </div>
            <h3 className="text-lg mb-2">Fund</h3>
            <p className="text-sm text-vibe-muted">
              Deposit USDC or skip this and pay per call with x402. No minimums.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-vibe-card border border-vibe-border flex items-center justify-center mx-auto mb-4">
              <span className="text-vibe-gold font-mono font-semibold">3</span>
            </div>
            <h3 className="text-lg mb-2">Code with Opus 4.6</h3>
            <p className="text-sm text-vibe-muted">
              Set ANTHROPIC_BASE_URL to our proxy. Claude Code, SDKs, and agents just work.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-3xl text-center mb-4">Transparent pricing</h2>
        <p className="text-center text-vibe-muted mb-8">Anthropic pass-through. No markup. No surprises.</p>
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
      </section>

      {/* Footer */}
      <footer className="border-t border-vibe-border py-8 text-center text-sm text-vibe-muted">
        <p>Powered by Spirit Protocol &middot; x402 &middot; Base</p>
        <p className="mt-1">
          <a href="https://spiritprotocol.io" className="hover:text-vibe-cream transition-colors">spiritprotocol.io</a>
        </p>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-vibe-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-vibe-gold-dim">&#9678;</span>
          <span className="font-serif text-lg">VIBE</span>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
