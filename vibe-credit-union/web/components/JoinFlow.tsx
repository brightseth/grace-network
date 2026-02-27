'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { joinMember } from '@/lib/utils';

interface JoinFlowProps {
  onJoined: () => void;
}

export default function JoinFlow({ onJoined }: JoinFlowProps) {
  const { address } = useAccount();
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !handle.trim()) return;

    setError('');
    setLoading(true);

    try {
      await joinMember(address, handle.trim());
      onJoined();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl mb-2">Join VIBE Credit Union</h2>
      <p className="text-vibe-muted mb-6">
        Choose a handle for your account. Your wallet address will be your member ID.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Handle</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g. seth"
            className="input"
            required
            minLength={2}
            maxLength={32}
          />
        </div>

        <div>
          <label className="label">Wallet</label>
          <div className="font-mono text-sm text-vibe-muted bg-vibe-dark border border-vibe-border rounded-lg px-4 py-3">
            {address}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !handle.trim()}
          className="btn-primary w-full"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
