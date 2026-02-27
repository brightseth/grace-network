// VIBE Credit Union — Database Layer (SQLite via better-sqlite3)

import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || './data/vibe.db';
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      handle TEXT UNIQUE,
      balance_usdc INTEGER DEFAULT 0,
      total_deposited INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      admin_id TEXT REFERENCES members(id),
      balance_usdc INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pool_members (
      pool_id TEXT REFERENCES pools(id),
      member_id TEXT REFERENCES members(id),
      PRIMARY KEY (pool_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS usage_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT,
      pool_id TEXT,
      model TEXT,
      input_tokens INTEGER,
      output_tokens INTEGER,
      cost_usdc INTEGER,
      estimated_cost INTEGER,
      payment_mode TEXT,
      tx_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT REFERENCES members(id),
      amount_usdc INTEGER,
      tx_hash TEXT,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function closeDb(): void {
  if (db) {
    db.close();
  }
}
