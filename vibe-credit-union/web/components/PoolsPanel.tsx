'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { createPool, fundPool, fetchPool } from '@/lib/utils';

interface Pool {
  id: string;
  name: string;
  admin_id: string;
  balance_usdc: number;
  members?: Array<{ id: string; handle: string }>;
}

interface PoolsPanelProps {
  onRefresh: () => void;
}

export default function PoolsPanel({ onRefresh }: PoolsPanelProps) {
  const { address } = useAccount();
  const [pools, setPools] = useState<Pool[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [fundingPool, setFundingPool] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !newPoolName.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { pool } = await createPool(newPoolName.trim(), address);
      setPools((prev) => [...prev, pool]);
      setNewPoolName('');
      setShowCreate(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFund(poolId: string) {
    if (!address || !fundAmount) return;
    setError('');
    setLoading(true);

    try {
      await fundPool(poolId, address, fundAmount);
      setFundAmount('');
      setFundingPool(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Pools</h2>
          <p className="text-vibe-muted">Cooperative credit pools for teams</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-secondary text-sm"
        >
          {showCreate ? 'Cancel' : 'Create Pool'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {showCreate && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div>
            <label className="label">Pool Name</label>
            <input
              type="text"
              value={newPoolName}
              onChange={(e) => setNewPoolName(e.target.value)}
              placeholder="e.g. /5 Vibe Squad"
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {pools.length === 0 && !showCreate && (
        <div className="card text-center text-vibe-muted py-12">
          <p>No pools yet. Create one to start sharing compute credits.</p>
        </div>
      )}

      {pools.map((pool) => (
        <div key={pool.id} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg">{pool.name}</h3>
            <span className="stat-number text-lg">
              ${(pool.balance_usdc / 1_000_000).toFixed(2)}
            </span>
          </div>

          {pool.members && (
            <div className="text-sm text-vibe-muted mb-4">
              {pool.members.length} member{pool.members.length !== 1 ? 's' : ''}
            </div>
          )}

          {fundingPool === pool.id ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Amount (USDC)"
                className="input flex-1"
                step="0.01"
                min="0.01"
              />
              <button
                onClick={() => handleFund(pool.id)}
                disabled={loading || !fundAmount}
                className="btn-primary text-sm"
              >
                Fund
              </button>
              <button
                onClick={() => setFundingPool(null)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setFundingPool(pool.id)}
              className="btn-secondary text-sm"
            >
              Fund Pool
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
