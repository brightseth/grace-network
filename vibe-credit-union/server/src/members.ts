// VIBE Credit Union — Member Registry + Balances

import { getDb } from './db.js';

export interface Member {
  id: string;
  handle: string | null;
  balance_usdc: number;
  total_deposited: number;
  total_spent: number;
  created_at: string;
}

export interface UsageEntry {
  memberId: string | null;
  poolId: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsdc: number;
  estimatedCost: number;
  paymentMode: 'x402' | 'balance' | 'pool';
  txHash: string | null;
}

/**
 * Register a new member by wallet address.
 */
export function joinMember(walletAddress: string, handle: string): Member {
  const db = getDb();
  const id = walletAddress.toLowerCase();

  const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(id) as Member | undefined;
  if (existing) {
    throw new Error('Member already registered');
  }

  const handleTaken = db.prepare('SELECT id FROM members WHERE handle = ?').get(handle);
  if (handleTaken) {
    throw new Error('Handle already taken');
  }

  db.prepare(
    'INSERT INTO members (id, handle) VALUES (?, ?)'
  ).run(id, handle);

  return db.prepare('SELECT * FROM members WHERE id = ?').get(id) as Member;
}

/**
 * Get member by wallet address.
 */
export function getMember(walletAddress: string): Member | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM members WHERE id = ?').get(walletAddress.toLowerCase());
  return (row as Member) ?? null;
}

/**
 * Get member balance in micro-USDC.
 */
export function getBalance(walletAddress: string): number {
  const member = getMember(walletAddress);
  return member?.balance_usdc ?? 0;
}

/**
 * Try to deduct cost from member balance.
 * Returns true if successful, false if insufficient funds.
 */
export function deductFromBalance(walletAddress: string, costMicroUsdc: number): boolean {
  const db = getDb();
  const id = walletAddress.toLowerCase();

  const result = db.prepare(
    'UPDATE members SET balance_usdc = balance_usdc - ?, total_spent = total_spent + ? WHERE id = ? AND balance_usdc >= ?'
  ).run(costMicroUsdc, costMicroUsdc, id, costMicroUsdc);

  return result.changes > 0;
}

/**
 * Credit a member's balance from a deposit.
 */
export function creditBalance(walletAddress: string, amountMicroUsdc: number): void {
  const db = getDb();
  const id = walletAddress.toLowerCase();

  db.prepare(
    'UPDATE members SET balance_usdc = balance_usdc + ?, total_deposited = total_deposited + ? WHERE id = ?'
  ).run(amountMicroUsdc, amountMicroUsdc, id);
}

/**
 * Refund overpayment back to member balance (does NOT count as a deposit).
 */
export function refundBalance(walletAddress: string, amountMicroUsdc: number): void {
  const db = getDb();
  const id = walletAddress.toLowerCase();

  db.prepare(
    'UPDATE members SET balance_usdc = balance_usdc + ?, total_spent = total_spent - ? WHERE id = ?'
  ).run(amountMicroUsdc, amountMicroUsdc, id);
}

/**
 * Record a deposit.
 */
export function recordDeposit(
  walletAddress: string,
  amountMicroUsdc: number,
  txHash: string,
  source: string = 'direct_usdc',
): void {
  const db = getDb();
  const id = walletAddress.toLowerCase();

  db.prepare(
    'INSERT INTO deposits (member_id, amount_usdc, tx_hash, source) VALUES (?, ?, ?, ?)'
  ).run(id, amountMicroUsdc, txHash, source);

  creditBalance(id, amountMicroUsdc);
}

/**
 * Log an API usage entry.
 */
export function logUsage(entry: UsageEntry): void {
  const db = getDb();

  db.prepare(`
    INSERT INTO usage_log (member_id, pool_id, model, input_tokens, output_tokens, cost_usdc, estimated_cost, payment_mode, tx_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.memberId?.toLowerCase() ?? null,
    entry.poolId,
    entry.model,
    entry.inputTokens,
    entry.outputTokens,
    entry.costUsdc,
    entry.estimatedCost,
    entry.paymentMode,
    entry.txHash,
  );
}

/**
 * Get usage history for a member.
 */
export function getUsageHistory(walletAddress: string, limit: number = 50) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM usage_log WHERE member_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(walletAddress.toLowerCase(), limit);
}

/**
 * Get aggregate stats.
 */
export function getStats() {
  const db = getDb();
  const members = db.prepare('SELECT COUNT(*) as count FROM members').get() as { count: number };
  const calls = db.prepare('SELECT COUNT(*) as count FROM usage_log').get() as { count: number };
  const volume = db.prepare('SELECT COALESCE(SUM(cost_usdc), 0) as total FROM usage_log').get() as { total: number };

  return {
    members: members.count,
    apiCalls: calls.count,
    totalVolumeUsdc: volume.total / 1_000_000,
  };
}
