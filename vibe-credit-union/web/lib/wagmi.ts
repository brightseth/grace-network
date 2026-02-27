'use client';

import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'VIBE Credit Union',
      preference: 'smartWalletOnly',
    }),
    metaMask(),
    ...(projectId
      ? [walletConnect({ projectId, metadata: { name: 'VIBE Credit Union', description: 'Cooperative compute credit pool', url: 'https://vibe.spiritprotocol.io', icons: [] } })]
      : []),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
