const API_BASE = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

async function api<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

export async function fetchHealth() {
  return api('/health');
}

export async function fetchModels() {
  return api<{ models: Array<{ id: string; input_per_1m_usd: number; output_per_1m_usd: number }>; currency: string; network: string }>('/models');
}

export async function fetchStats() {
  return api<{ members: number; apiCalls: number; totalVolumeUsdc: number }>('/stats');
}

export async function joinMember(wallet: string, handle: string) {
  return api('/api/join', {
    method: 'POST',
    body: JSON.stringify({ wallet, handle }),
  });
}

export async function fetchBalance(address: string) {
  return api<{ address: string; balance_usdc: number; balance_micro: number; member: { handle: string; total_deposited: number; total_spent: number } | null }>(`/api/balance/${address}`);
}

export async function recordDeposit(wallet: string, amount: string, txHash: string, source = 'direct_usdc') {
  return api('/api/deposit', {
    method: 'POST',
    body: JSON.stringify({ wallet, amount, tx_hash: txHash, source }),
  });
}

export async function fetchUsage(address: string, limit = 50) {
  return api<{ usage: Array<{ id: number; model: string; input_tokens: number; output_tokens: number; cost_usdc: number; payment_mode: string; created_at: string }> }>(`/api/usage/${address}?limit=${limit}`);
}

export async function createPool(name: string, adminWallet: string) {
  return api('/api/pools', {
    method: 'POST',
    body: JSON.stringify({ name, admin_wallet: adminWallet }),
  });
}

export async function fetchPool(id: string) {
  return api(`/api/pools/${id}`);
}

export async function joinPool(poolId: string, wallet: string) {
  return api(`/api/pools/${poolId}/join`, {
    method: 'POST',
    body: JSON.stringify({ wallet }),
  });
}

export async function fundPool(poolId: string, wallet: string, amount: string) {
  return api(`/api/pools/${poolId}/fund`, {
    method: 'POST',
    body: JSON.stringify({ wallet, amount }),
  });
}

export function formatUsdc(micro: number): string {
  return `$${(micro / 1_000_000).toFixed(2)}`;
}

export function formatUsdcPrecise(micro: number): string {
  return `$${(micro / 1_000_000).toFixed(6)}`;
}

export function shortenAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
