'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { fetchUsage } from '@/lib/utils';

interface UsageEntry {
  id: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usdc: number;
  payment_mode: string;
  created_at: string;
}

export default function UsagePanel() {
  const { address } = useAccount();
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    fetchUsage(address)
      .then((data) => setUsage(data.usage))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address]);

  function modelShort(model: string) {
    if (model.includes('sonnet')) return 'Sonnet';
    if (model.includes('opus')) return 'Opus';
    if (model.includes('haiku')) return 'Haiku';
    return model;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Usage</h2>
        <p className="text-vibe-muted">Your API call history</p>
      </div>

      {loading ? (
        <div className="card text-center text-vibe-muted py-12">Loading...</div>
      ) : usage.length === 0 ? (
        <div className="card text-center text-vibe-muted py-12">
          <p>No API calls yet. Set up your environment and start coding.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 text-xs text-vibe-muted px-4 py-2">
            <span>Model</span>
            <span className="text-right">Input</span>
            <span className="text-right">Output</span>
            <span className="text-right">Cost</span>
            <span>Mode</span>
            <span className="text-right">Time</span>
          </div>

          {usage.map((entry) => (
            <div key={entry.id} className="card grid grid-cols-6 gap-4 text-sm py-4">
              <span className="text-vibe-gold font-medium">
                {modelShort(entry.model)}
              </span>
              <span className="text-right font-mono">
                {entry.input_tokens.toLocaleString()}
              </span>
              <span className="text-right font-mono">
                {entry.output_tokens.toLocaleString()}
              </span>
              <span className="text-right font-mono text-vibe-green">
                ${(entry.cost_usdc / 1_000_000).toFixed(6)}
              </span>
              <span className="text-vibe-muted">
                {entry.payment_mode}
              </span>
              <span className="text-right text-vibe-muted text-xs">
                {new Date(entry.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
