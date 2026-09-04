/**
 * SchoolSoul Production PostgreSQL Storage Adapter
 * Provides high-performance connection pooling, automatic schema creation,
 * tenant isolation indexes, and asynchronous state synchronization for Render Cloud.
 */

import { Pool, type PoolConfig } from 'pg';

let pgPool: Pool | null = null;
let isInitialized = false;
let lastDbError: string | null = null;

export function getPostgresPool(): Pool | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
    return null;
  }

  if (!pgPool) {
    try {
      const config: PoolConfig = {
        connectionString: databaseUrl,
        max: 20, // Connection pool limit for Render Postgres
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      };

      // Enable SSL for cloud PostgreSQL (Render, Neon, Supabase)
      if (databaseUrl.includes('render.com') || databaseUrl.includes('sslmode=require') || process.env.NODE_ENV === 'production') {
        config.ssl = {
          rejectUnauthorized: false,
        };
      }

      pgPool = new Pool(config);

      pgPool.on('error', (err) => {
        console.error('Unexpected PostgreSQL Pool Error:', err);
        lastDbError = err.message;
      });
    } catch (e: any) {
      console.error('Failed to initialize PostgreSQL Pool:', e);
      lastDbError = e.message;
      return null;
    }
  }

  return pgPool;
}

export async function initializePostgresSchema(): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) {
    return false;
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Key-Value & Collection Store
      await client.query(`
        CREATE TABLE IF NOT EXISTS schoolsoul_state (
          key VARCHAR(128) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Dedicated Audit Log Table for High-Throughput Compliance
      await client.query(`
        CREATE TABLE IF NOT EXISTS schoolsoul_audit_events (
          id VARCHAR(128) PRIMARY KEY,
          school_id VARCHAR(128),
          user_id VARCHAR(128),
          action VARCHAR(128) NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_audit_school ON schoolsoul_audit_events(school_id);
        CREATE INDEX IF NOT EXISTS idx_audit_created ON schoolsoul_audit_events(created_at);
      `);

      // 3. Dedicated Financial & Pesapal Transactions Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS schoolsoul_payments (
          id VARCHAR(128) PRIMARY KEY,
          school_id VARCHAR(128) NOT NULL,
          invoice_id VARCHAR(128),
          merchant_reference VARCHAR(128) UNIQUE NOT NULL,
          tracking_id VARCHAR(128),
          provider VARCHAR(64) NOT NULL,
          amount NUMERIC(14, 2) NOT NULL,
          currency VARCHAR(16) NOT NULL,
          status VARCHAR(32) NOT NULL,
          signature_sha256 VARCHAR(256),
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_pay_school ON schoolsoul_payments(school_id);
        CREATE INDEX IF NOT EXISTS idx_pay_merchant_ref ON schoolsoul_payments(merchant_reference);
        CREATE INDEX IF NOT EXISTS idx_pay_tracking_id ON schoolsoul_payments(tracking_id);
        CREATE INDEX IF NOT EXISTS idx_pay_status ON schoolsoul_payments(status);
      `);

      // 4. Dedicated Digital Community & Safeguarding Tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS schoolsoul_community_groups (
          id VARCHAR(128) PRIMARY KEY,
          school_id VARCHAR(128) NOT NULL,
          type VARCHAR(64) NOT NULL,
          visibility VARCHAR(32) NOT NULL,
          status VARCHAR(32) NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_comm_groups_school ON schoolsoul_community_groups(school_id);
        CREATE INDEX IF NOT EXISTS idx_comm_groups_type ON schoolsoul_community_groups(type);

        CREATE TABLE IF NOT EXISTS schoolsoul_community_messages (
          id VARCHAR(128) PRIMARY KEY,
          client_message_id VARCHAR(128),
          school_id VARCHAR(128) NOT NULL,
          group_id VARCHAR(128) NOT NULL,
          sender_id VARCHAR(128) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_comm_msgs_school ON schoolsoul_community_messages(school_id);
        CREATE INDEX IF NOT EXISTS idx_comm_msgs_group ON schoolsoul_community_messages(group_id);
        CREATE INDEX IF NOT EXISTS idx_comm_msgs_client_id ON schoolsoul_community_messages(client_message_id);

        CREATE TABLE IF NOT EXISTS schoolsoul_community_reports (
          id VARCHAR(128) PRIMARY KEY,
          school_id VARCHAR(128) NOT NULL,
          target_type VARCHAR(64) NOT NULL,
          target_id VARCHAR(128) NOT NULL,
          reported_by VARCHAR(128) NOT NULL,
          status VARCHAR(32) NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_comm_reports_school ON schoolsoul_community_reports(school_id);
        CREATE INDEX IF NOT EXISTS idx_comm_reports_status ON schoolsoul_community_reports(status);
      `);

      await client.query('COMMIT');
      isInitialized = true;
      lastDbError = null;
      console.log('✅ PostgreSQL Production Schema & Multi-Tenant Indexes Verified on Render.');
      return true;
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('PostgreSQL Schema Initialization Error:', err);
      lastDbError = err.message;
      return false;
    } finally {
      client.release();
    }
  } catch (e: any) {
    console.error('PostgreSQL Connection Error during initialization:', e);
    lastDbError = e.message;
    return false;
  }
}

export async function saveStateToPostgres(key: string, data: any): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;

  try {
    const query = `
      INSERT INTO schoolsoul_state (key, data, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(query, [key, JSON.stringify(data)]);
    return true;
  } catch (err: any) {
    console.error(`Failed to save state [${key}] to PostgreSQL:`, err);
    lastDbError = err.message;
    return false;
  }
}

export async function loadStateFromPostgres(key: string): Promise<any | null> {
  const pool = getPostgresPool();
  if (!pool) return null;

  try {
    const res = await pool.query('SELECT data FROM schoolsoul_state WHERE key = $1', [key]);
    if (res.rows.length > 0) {
      return res.rows[0].data;
    }
    return null;
  } catch (err: any) {
    console.error(`Failed to load state [${key}] from PostgreSQL:`, err);
    lastDbError = err.message;
    return null;
  }
}

export async function checkPostgresHealth(): Promise<{
  connected: boolean;
  poolActive: boolean;
  totalCount?: number;
  idleCount?: number;
  waitingCount?: number;
  error?: string | null;
}> {
  const pool = getPostgresPool();
  if (!pool) {
    return {
      connected: false,
      poolActive: false,
      error: 'DATABASE_URL not configured (using local storage)',
    };
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as current_time, 1 as active');
      return {
        connected: Boolean(res.rows[0]?.active),
        poolActive: true,
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
        error: null,
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      connected: false,
      poolActive: true,
      error: err.message || lastDbError,
    };
  }
}

export async function closePostgresPool(): Promise<void> {
  if (pgPool) {
    try {
      await pgPool.end();
      pgPool = null;
    } catch (err) {
      console.error('Error closing PostgreSQL pool during shutdown:', err);
    }
  }
}
