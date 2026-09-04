import { Router, type Request, type Response } from 'express';
import { readServerDB } from '../db/store';
import { checkPostgresHealth } from '../db/postgresStore';
import { validateEnvironment } from '../config/environmentValidator';
import { pesapalProvider } from '../services/pesapalService';
import { healthMonitor } from '../services/healthMonitor';
import { resilienceEngine } from '../services/resilienceEngine';
import { SCHOOLSOUL_V6_MANIFEST } from '../config/version';

const router = Router();

// Startup timestamp
const startTime = Date.now();

/**
 * Standard Liveness Health Check: /health & /api/health
 * Returns operational status, uptime, memory, version, and sanitized environment state.
 */
router.get(['/health', '/api/health'], async (req: Request, res: Response) => {
  const db = readServerDB();
  const envReport = validateEnvironment();
  const pgHealth = await checkPostgresHealth();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    status: 'online',
    system: 'SchoolSoul Production Operating System',
    version: SCHOOLSOUL_V6_MANIFEST.version,
    schemaVersion: SCHOOLSOUL_V6_MANIFEST.schemaVersion,
    buildIdentifier: SCHOOLSOUL_V6_MANIFEST.buildIdentifier,
    freezeStatus: SCHOOLSOUL_V6_MANIFEST.freezeStatus,
    uptimeSeconds,
    environment: envReport.nodeEnv,
    timestamp: new Date().toISOString(),
    schoolConfigured: Boolean(db.schoolProfile && db.schoolProfile.isConfigured),
    database: {
      type: envReport.databaseType,
      connected: pgHealth.connected || envReport.databaseType === 'LocalPersistentStore',
      postgresActive: pgHealth.connected,
      poolActive: pgHealth.poolActive,
    },
    pesapalGateway: {
      environment: envReport.pesapal.environment,
      status: envReport.pesapal.status,
      paymentsEnabled: envReport.pesapal.paymentsEnabled,
      ipnConfigured: envReport.pesapal.ipnConfigured,
      ipnIdMasked: envReport.pesapal.ipnIdMasked,
    },
    stats: {
      studentsCount: db.students?.length || 0,
      usersCount: db.users?.length || 0,
      rolesCount: db.roles?.length || 0,
      auditLogsCount: db.auditLogs?.length || 0,
      financialRecordsCount: db.paymentRecords?.length || 0,
    },
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  });
});

/**
 * Readiness Probe: /ready & /api/ready
 * Used by Render / container orchestrators to verify traffic can be received.
 */
router.get(['/ready', '/api/ready'], async (req: Request, res: Response) => {
  try {
    const pgHealth = await checkPostgresHealth();
    const envReport = validateEnvironment();
    
    // In production with PostgreSQL, ensure database connection is reachable
    if (envReport.databaseType === 'PostgreSQL' && !pgHealth.connected) {
      return res.status(503).json({
        ready: false,
        status: 'DEGRADED',
        error: 'Database connection check failed',
        details: pgHealth.error,
      });
    }

    res.json({
      ready: true,
      status: 'READY',
      timestamp: new Date().toISOString(),
      service: 'SchoolSoul Web Service',
    });
  } catch (err: any) {
    res.status(503).json({
      ready: false,
      status: 'UNAVAILABLE',
      error: err.message,
    });
  }
});

/**
 * Pesapal Diagnostics & Connectivity Health Check: /api/payments/pesapal/health
 */
router.get(['/payments/pesapal/health', '/billing/pesapal/health'], async (req: Request, res: Response) => {
  try {
    const status = await pesapalProvider.getHealthStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({
      error: 'Pesapal health check evaluation failed',
      details: err.message,
    });
  }
});

/**
 * V5 Comprehensive Health Diagnostics: /api/health/diagnostics
 * Adaptive polling with full component breakdown
 */
router.get('/health/diagnostics', async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true';
    const report = await healthMonitor.getHealthReport(force);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message, code: 'DIAGNOSTICS_FAILED' });
  }
});

/**
 * V5 Controlled Self-Healing Trigger: /api/health/self-heal
 * Executes safe Level 1 repairs with verification
 */
router.post('/health/self-heal', async (req: Request, res: Response) => {
  try {
    const { scope } = req.body || {};

    const events = [];
    if (!scope || scope === 'all' || scope === 'cache') {
      const cacheEvent = await resilienceEngine.healCorruptedCache();
      events.push(cacheEvent);
    }
    if (!scope || scope === 'all' || scope === 'worker') {
      const workerEvent = resilienceEngine.healBackgroundWorker();
      events.push(workerEvent);
    }
    if (!scope || scope === 'all' || scope === 'queue') {
      const queueEvent = resilienceEngine.healStuckSyncQueue();
      events.push(queueEvent);
    }
    if (!scope || scope === 'all' || scope === 'storage') {
      const storageEvent = resilienceEngine.healTemporaryStorageDebris();
      events.push(storageEvent);
    }

    res.json({
      success: true,
      healedEventsCount: events.length,
      events,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, code: 'SELF_HEAL_FAILED' });
  }
});

/**
 * V5 Query Self-Healing Events Log: /api/health/healing-events
 */
router.get('/health/healing-events', (req: Request, res: Response) => {
  try {
    const events = resilienceEngine.getHealingEvents(100);
    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
