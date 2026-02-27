// VIBE Credit Union — Cooperative Pool Management

import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db.js';

export interface Pool {
  id: string;
  name: string;
  admin_id: string;
  balance_usdc: number;
  created_at: string;
}

export interface PoolMember {
  pool_id: string;
  member_id: string;
}

/**
 * Create a new pool.
 */
export function createPool(name: string, adminWallet: string): Pool {
  const db = getDb();
  const id = uuidv4();
  const adminId = adminWallet.toLowerCase();

  db.prepare('INSERT INTO pools (id, name, admin_id) VALUES (?, ?, ?)').run(id, name, adminId);
  db.prepare('INSERT INTO pool_members (pool_id, member_id) VALUES (?, ?)').run(id, adminId);

  return db.prepare('SELECT * FROM pools WHERE id = ?').get(id) as Pool;
}

/**
 * Get pool by ID with member list.
 */
export function getPool(poolId: string) {
  const db = getDb();
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(poolId) as Pool | undefined;
  if (!pool) return null;

  const members = db.prepare(
    'SELECT m.id, m.handle FROM pool_members pm JOIN members m ON pm.member_id = m.id WHERE pm.pool_id = ?'
  ).all(poolId);

  return { ...pool, members };
}

/**
 * Join an existing pool.
 */
export function joinPool(poolId: string, walletAddress: string): void {
  const db = getDb();
  const memberId = walletAddress.toLowerCase();

  const pool = db.prepare('SELECT id FROM pools WHERE id = ?').get(poolId);
  if (!pool) throw new Error('Pool not found');

  const existing = db.prepare(
    'SELECT 1 FROM pool_members WHERE pool_id = ? AND member_id = ?'
  ).get(poolId, memberId);
  if (existing) throw new Error('Already a member of this pool');

  db.prepare('INSERT INTO pool_members (pool_id, member_id) VALUES (?, ?)').run(poolId, memberId);
}

/**
 * Fund a pool from a member's personal balance.
 */
export function fundPool(poolId: string, walletAddress: string, amountMicroUsdc: number): void {
  const db = getDb();
  const memberId = walletAddress.toLowerCase();

  const deducted = db.prepare(
    'UPDATE members SET balance_usdc = balance_usdc - ? WHERE id = ? AND balance_usdc >= ?'
  ).run(amountMicroUsdc, memberId, amountMicroUsdc);

  if (deducted.changes === 0) throw new Error('Insufficient balance');

  db.prepare(
    'UPDATE pools SET balance_usdc = balance_usdc + ? WHERE id = ?'
  ).run(amountMicroUsdc, poolId);
}

/**
 * Deduct from pool balance (for API calls charged to pool).
 */
export function deductFromPool(poolId: string, costMicroUsdc: number): boolean {
  const db = getDb();
  const result = db.prepare(
    'UPDATE pools SET balance_usdc = balance_usdc - ? WHERE id = ? AND balance_usdc >= ?'
  ).run(costMicroUsdc, poolId, costMicroUsdc);
  return result.changes > 0;
}

/**
 * Get all pools a member belongs to.
 */
export function getMemberPools(walletAddress: string) {
  const db = getDb();
  return db.prepare(`
    SELECT p.* FROM pools p
    JOIN pool_members pm ON p.id = pm.pool_id
    WHERE pm.member_id = ?
  `).all(walletAddress.toLowerCase());
}
