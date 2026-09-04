/**
 * SchoolSoul Adaptive Health Monitor
 * Performs lightweight health assessments across Database, Filesystem, Cloud,
 * Sync Engine, Memory, Workers, and Backups with adaptive intervals.
 */

import fs from 'fs';
import path from 'path';
import { readServerDB, type ServerDBData } from '../db/store';
import { checkPostgresHealth } from '../db/postgresStore';
import { cloudStorageProvider } from './cloudStorageService';
import { backgroundWorker } from './backgroundWorker';

export type SystemHealthState =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'FAILING'
  | 'RECOVERING'
  | 'RECOVERED'
  | 'QUARANTINED'
  | 'REQUIRES_ADMIN';

export interface ComponentHealth {
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'STANDBY';
  message: string;
  latencyMs?: number;
  details?: Record<string, any>;
}

export interface ComprehensiveHealthReport {
  overallState: SystemHealthState;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  components: {
    localDatabase: ComponentHealth;
    fileSystem: ComponentHealth;
    cloudConnectivity: ComponentHealth;
    syncEngine: ComponentHealth;
    backgroundWorker: ComponentHealth;
    memoryAndResources: ComponentHealth;
    backupAndRecovery: ComponentHealth;
    resilienceEngine: ComponentHealth;
  };
  metrics: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
    studentsCount: number;
    usersCount: number;
    auditLogsCount: number;
    pendingSyncCount: number;
    quarantinedCount: number;
    conflictsCount: number;
    healingEventsCount: number;
  };
  adaptiveIntervalSeconds: number;
}

export class HealthMonitorService {
  private startTime = Date.now();
  private lastReport: ComprehensiveHealthReport | null = null;
  private lastReportTime = 0;
  private currentIntervalMs = 30000; // 30s base interval

  /**
   * Evaluates comprehensive health with adaptive caching to avoid expensive tight-loop checks
   */
  public async getHealthReport(forceRefresh = false): Promise<ComprehensiveHealthReport> {
    const now = Date.now();
    if (!forceRefresh && this.lastReport && now - this.lastReportTime < 5000) {
      return this.lastReport;
    }

    const start = Date.now();
    let db: ServerDBData;
    let localDbHealth: ComponentHealth;

    // 1. Local Database Health
    try {
      db = readServerDB();
      const pgHealth = await checkPostgresHealth();
      localDbHealth = {
        status: 'UP',
        message: pgHealth.connected
          ? 'PostgreSQL active with local persistent fallback replica'
          : 'Local atomic file storage fully operational',
        details: {
          storeType: pgHealth.connected ? 'PostgreSQL' : 'LocalPersistentFileStore',
          isPgActive: pgHealth.connected,
          recordCount: (db.students?.length || 0) + (db.users?.length || 0),
        },
      };
    } catch (err: any) {
      db = { students: [], users: [], roles: [], auditLogs: [], syncQueue: [] } as any;
      localDbHealth = {
        status: 'DOWN',
        message: `Database store error: ${err.message}`,
      };
    }

    // 2. File System Storage Health (Check write ability and directory structure)
    let fsHealth: ComponentHealth;
    const probePath = path.join(process.cwd(), 'data', `.probe_${Date.now()}.tmp`);
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(probePath, 'probe');
      fs.unlinkSync(probePath);
      fsHealth = {
        status: 'UP',
        message: 'Data volume is writable and healthy',
      };
    } catch (err: any) {
      fsHealth = {
        status: 'DOWN',
        message: `Filesystem write probe failed: ${err.message}`,
      };
    }

    // 3. Cloud Connectivity Health
    const cloudStart = Date.now();
    const isCloudOnline = await cloudStorageProvider.isAvailable();
    const cloudLatency = Date.now() - cloudStart;
    const cloudHealth: ComponentHealth = {
      status: isCloudOnline ? 'UP' : 'DEGRADED',
      message: isCloudOnline
        ? 'Cloud services reachable and synchronized'
        : 'Cloud services currently unreachable (Safe Local-First Mode active)',
      latencyMs: cloudLatency,
      details: {
        offlineModeSupported: true,
        cloudProvider: cloudStorageProvider.name,
      },
    };

    // 4. Sync Engine & Operation Queue
    const pendingSyncCount = (db.syncQueue || []).filter((q: any) => q.status === 'PENDING' || q.status === 'pending').length;
    const conflictsCount = (db.conflictRecords || []).filter((c: any) => c.resolutionStatus === 'QUARANTINED').length;
    const quarantinedCount = (db.quarantinedOperations || []).filter((q: any) => q.status === 'QUARANTINED' || q.status === 'CONFLICT').length;

    let syncHealth: ComponentHealth;
    if (conflictsCount > 0 || quarantinedCount > 0) {
      syncHealth = {
        status: 'DEGRADED',
        message: `${conflictsCount} conflict(s) and ${quarantinedCount} quarantined operation(s) awaiting administrator decision`,
        details: { pendingSyncCount, conflictsCount, quarantinedCount },
      };
    } else {
      syncHealth = {
        status: 'UP',
        message: `Queue clear (${pendingSyncCount} pending operations)`,
        details: { pendingSyncCount, conflictsCount: 0, quarantinedCount: 0 },
      };
    }

    // 5. Background Worker Health
    const workerStatus = backgroundWorker.getStatus();
    const workerHealth: ComponentHealth = {
      status: workerStatus.isRunning ? 'UP' : 'DEGRADED',
      message: workerStatus.isRunning ? 'Background reconciliation worker running' : 'Background worker idle or stopped',
      details: workerStatus,
    };

    // 6. Memory & Resources Health
    const mem = process.memoryUsage();
    const rssMb = Math.round(mem.rss / 1024 / 1024);
    const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024);

    let memHealth: ComponentHealth = {
      status: 'UP',
      message: `Memory consumption normal (Heap: ${heapUsedMb}MB / RSS: ${rssMb}MB)`,
      details: { rssMb, heapUsedMb, heapTotalMb },
    };
    if (heapUsedMb > 500) {
      memHealth = {
        status: 'DEGRADED',
        message: `High heap utilization detected (${heapUsedMb}MB)`,
        details: { rssMb, heapUsedMb, heapTotalMb },
      };
    }

    // 7. Backup & Recovery Health
    const backupList = db.backupHistory || [];
    const lastBackup = backupList[0];
    const backupHealth: ComponentHealth = {
      status: lastBackup?.verified ? 'UP' : 'STANDBY',
      message: lastBackup
        ? `Last verified backup: ${lastBackup.createdAt || lastBackup.timestamp}`
        : 'No backups recorded yet',
      details: { totalBackups: backupList.length, lastVerified: lastBackup?.verified || false },
    };

    // 8. Resilience Engine Health
    const healingEventsCount = (db.resilienceEvents || []).length;
    const resilienceHealth: ComponentHealth = {
      status: 'UP',
      message: `Self-healing active (${healingEventsCount} recorded healing events)`,
      details: { totalEvents: healingEventsCount },
    };

    // Determine Overall State
    let overallState: SystemHealthState = 'HEALTHY';
    if (localDbHealth.status === 'DOWN' || fsHealth.status === 'DOWN') {
      overallState = 'FAILING';
    } else if (conflictsCount > 0) {
      overallState = 'QUARANTINED';
    } else if (cloudHealth.status === 'DEGRADED') {
      overallState = 'DEGRADED'; // Clean offline degradation
    }

    // Compute Adaptive Polling Interval
    if (overallState === 'FAILING' || overallState === 'QUARANTINED') {
      this.currentIntervalMs = 10000; // 10s when attention needed
    } else if (overallState === 'DEGRADED') {
      this.currentIntervalMs = 20000; // 20s in offline mode
    } else {
      this.currentIntervalMs = 45000; // 45s when healthy to save CPU
    }

    const report: ComprehensiveHealthReport = {
      overallState,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || 'production',
      components: {
        localDatabase: localDbHealth,
        fileSystem: fsHealth,
        cloudConnectivity: cloudHealth,
        syncEngine: syncHealth,
        backgroundWorker: workerHealth,
        memoryAndResources: memHealth,
        backupAndRecovery: backupHealth,
        resilienceEngine: resilienceHealth,
      },
      metrics: {
        rssMb,
        heapUsedMb,
        heapTotalMb,
        studentsCount: db.students?.length || 0,
        usersCount: db.users?.length || 0,
        auditLogsCount: db.auditLogs?.length || 0,
        pendingSyncCount,
        quarantinedCount,
        conflictsCount,
        healingEventsCount,
      },
      adaptiveIntervalSeconds: Math.round(this.currentIntervalMs / 1000),
    };

    this.lastReport = report;
    this.lastReportTime = Date.now();
    return report;
  }
}

export const healthMonitor = new HealthMonitorService();
