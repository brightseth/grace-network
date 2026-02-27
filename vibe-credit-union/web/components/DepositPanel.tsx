'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface DepositPanelProps {
  balance: number;
  onRefresh: () => void;
}

export default function DepositPanel({ balance, onRefresh }: DepositPanelProps) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Deposit</h2>
        <p className="text-vibe-muted">Add USDC to your VIBE account</p>
      </div>

      {/* Current balance */}
      <div className="card">
        <p className="text-sm text-vibe-muted mb-1">Current Balance</p>
        <p className="stat-number">${(balance / 1_000_000).toFixed(2)} USDC</p>
      </div>

      {/* Send USDC */}
      <div className="card">
        <h3 className="text-lg mb-4">Send USDC on Base</h3>
        <p className="text-sm text-vibe-muted mb-4">
          Send USDC to your wallet address on Base network. After the transaction confirms,
          your VIBE balance will be credited (minus 1% service fee).
        </p>

        <div className="bg-vibe-dark border border-vibe-border rounded-lg p-4 flex items-center justify-between gap-4">
          <code className="font-mono text-sm text-vibe-cream break-all">{address}</code>
          <button
            onClick={copyAddress}
            className="text-sm text-vibe-gold hover:text-vibe-cream transition-colors whitespace-nowrap"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 text-sm text-vibe-muted space-y-1">
          <div className="flex justify-between">
            <span>Network</span>
            <span className="text-vibe-cream">Base</span>
          </div>
          <div className="flex justify-between">
            <span>Token</span>
            <span className="text-vibe-cream">USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee</span>
            <span className="text-vibe-cream">1%</span>
          </div>
        </div>
      </div>

      {/* Coinbase Onramp placeholder */}
      <div className="card">
        <h3 className="text-lg mb-4">Buy with Card</h3>
        <p className="text-sm text-vibe-muted mb-4">
          Purchase USDC directly with a credit card or bank account via Coinbase Onramp.
        </p>
        <button className="btn-secondary w-full" disabled>
          Coinbase Onramp — Coming Soon
        </button>
      </div>
    </div>
  );
}
