'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { shortenAddress } from '@/lib/utils';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-vibe-gold">
          {shortenAddress(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm text-vibe-muted hover:text-vibe-cream transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="btn-primary text-sm"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
}
