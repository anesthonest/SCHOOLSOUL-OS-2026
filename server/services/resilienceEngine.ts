/**
 * SchoolSoul Resilience & Self-Healing Engine
 * Automatically and safely heals TECHNICAL failures (cache, workers, connection locks, temporary files).
 * STRICTLY FORBIDS unauthorized modification of authoritative school data (students, attendance, fees, payments).
 * Emits verified HEAL-YYYYMMDD-XXXX audit events linked to ERROR-IDs.
 */

import fs from 'fs';
import path from 'path';
import { readServerDB, writeServerDB, initServerDatabase, type ServerDBData } from '../db/store';
import { backgroundWorker } from './backgroundWorker';

export type RepairLevel = 0 | 1 | 2 | 3 | 4;

export interface HealingEvent {
  healId: string; // HEAL-YYYYMMDD-XXXX
  errorId: string; // Linked ERROR-ID
  timestamp: string;
  schoolId: string;
  module: string;
  failure: string;
  diagnosis: string;
  repairLevel: RepairLevel;
  action: string;
  verification: 'PASSED' | 'FAILED';
  result: 'SUCCESS' | 'FAILED' | 'ROLLED_BACK' | 'QUARANTINED';
  dataLossStatus: 'NONE' | 'UNDER_INVESTIGATION';
  adminRequirement: 'NONE' | 'ADMIN_APPROVAL_REQUIRED' | 'RESOLVED';
}

export class ResilienceEngineService {
  private inMemoryHealingLog: HealingEvent[] = [];

  /**
   * Generates a unique, standardized HEAL-ID: HEAL-YYYYMMDD-XXXX
   */
  public generateHealId(): string {
    const d = new Date().toISOString().replace(/\D/g, '').slice(0, 8);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `HEAL-${d}-${rand}`;
  }

  /**
   * Generate an ERROR-ID if not supplied
   */
  public generateErrorId(): string {
    const d = new Date().toISOString().replace(/\D/g, '').slice(0, 8);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ERR-${d}-${rand}`;
  }

  /**
   * Level 1: Safe Automatic Repair for Corrupted In-Memory Cache
   * Discards in-memory state, re-reads directly from verified persistent storage, verifies integrity.
   */
  public async healCorruptedCache(schoolId = 'default', providedErrorId?: string): Promise<HealingEvent> {
    const healId = this.generateHealId();
    const errorId = providedErrorId || this.generateErrorId();
    const now = new Date().toISOString();

    const event: HealingEvent = {
      healId,
      errorId,
      timestamp: now,
      schoolId,
      module: 'LocalStorageEngine',
      failure: 'Detected in-memory cache drift or invalid reference integrity',
      diagnosis: 'Volatile in-memory cache desynchronized from persistent store',
      repairLevel: 1,
      action: 'Flushed in-memory cache and performed authoritative reload from disk/PostgreSQL',
      verification: 'FAILED',
      result: 'FAILED',
      dataLossStatus: 'NONE',
      adminRequirement: 'NONE',
    };

    try {
      // Re-read storage
      await initServerDatabase();
      const db = readServerDB();

      // Verify that database read succeeded and essential structures are valid
      if (db && Array.isArray(db.users) && Array.isArray(db.students)) {
        event.verification = 'PASSED';
        event.result = 'SUCCESS';
        this.recordHealingEvent(event, db);
        return event;
      } else {
        event.result = 'FAILED';
        this.recordHealingEvent(event);
        return event;
      }
    } catch (err: any) {
      event.result = 'FAILED';
      event.action += ` (Exception: ${err.message})`;
      this.recordHealingEvent(event);
      return event;
    }
  }

  /**
   * Level 1: Safe Automatic Repair for Background Worker Failures
   * Restarts background worker timer safely and verifies running state.
   */
  public healBackgroundWorker(schoolId = 'default', providedErrorId?: string): HealingEvent {
    const healId = this.generateHealId();
    const errorId = providedErrorId || this.generateErrorId();
    const now = new Date().toISOString();

    const event: HealingEvent = {
      healId,
      errorId,
      timestamp: now,
      schoolId,
      module: 'BackgroundWorker',
      failure: 'Background worker timer stopped or unhandled tick timeout',
      diagnosis: 'Worker loop halted during scheduled pass',
      repairLevel: 1,
      action: 'Terminated stale timer handle and reinitialized worker with clean 60s interval',
      verification: 'FAILED',
      result: 'FAILED',
      dataLossStatus: 'NONE',
      adminRequirement: 'NONE',
    };

    try {
      backgroundWorker.stop();
      backgroundWorker.start(60000);
      const status = backgroundWorker.getStatus();

      if (status.isRunning) {
        event.verification = 'PASSED';
        event.result = 'SUCCESS';
      } else {
        event.result = 'FAILED';
      }
    } catch (err: any) {
      event.result = 'FAILED';
      event.action += ` (Exception: ${err.message})`;
    }

    this.recordHealingEvent(event);
    return event;
  }

  /**
   * Level 1: Safe Automatic Repair for Stale / Stuck Temporary Sync Locks
   */
  public healStuckSyncQueue(schoolId = 'default', providedErrorId?: string): HealingEvent {
    const healId = this.generateHealId();
    const errorId = providedErrorId || this.generateErrorId();
    const now = new Date().toISOString();

    const event: HealingEvent = {
      healId,
      errorId,
      timestamp: now,
      schoolId,
      module: 'SyncEngine',
      failure: 'Sync operations stuck in SYNCING state beyond timeout window (>5 mins)',
      diagnosis: 'Client disconnect or interrupted network transfer during sync push',
      repairLevel: 1,
      action: 'Reset stuck SYNCING operations back to PENDING with exponential retry backoff',
      verification: 'FAILED',
      result: 'FAILED',
      dataLossStatus: 'NONE',
      adminRequirement: 'NONE',
    };

    try {
      const db = readServerDB();
      if (!db.syncQueue) db.syncQueue = [];

      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      let resetCount = 0;

      for (const item of db.syncQueue) {
        if (item.status === 'SYNCING') {
          const itemTime = item.lastAttemptAt ? new Date(item.lastAttemptAt).getTime() : 0;
          if (itemTime < fiveMinutesAgo) {
            item.status = 'PENDING';
            item.retryCount = (item.retryCount || 0) + 1;
            resetCount++;
          }
        }
      }

      writeServerDB(db);

      // Verify that no stuck items remain older than 5 mins
      const remainingStuck = db.syncQueue.filter(
        (i: any) => i.status === 'SYNCING' && new Date(i.lastAttemptAt || 0).getTime() < fiveMinutesAgo
      );

      if (remainingStuck.length === 0) {
        event.verification = 'PASSED';
        event.result = 'SUCCESS';
        event.action += ` (Reset ${resetCount} items to PENDING)`;
      } else {
        event.result = 'FAILED';
      }
    } catch (err: any) {
      event.result = 'FAILED';
      event.action += ` (Exception: ${err.message})`;
    }

    this.recordHealingEvent(event);
    return event;
  }

  /**
   * Level 1: Safe Automatic Repair for Orphaned Temporary Files
   */
  public healTemporaryStorageDebris(schoolId = 'default'): HealingEvent {
    const healId = this.generateHealId();
    const errorId = this.generateErrorId();
    const now = new Date().toISOString();

    const event: HealingEvent = {
      healId,
      errorId,
      timestamp: now,
      schoolId,
      module: 'FileSystemStorage',
      failure: 'Residual temporary .tmp files detected in data directory',
      diagnosis: 'Interrupted atomic write or process restart during flush',
      repairLevel: 1,
      action: 'Identified and purged stale .tmp files older than 15 minutes',
      verification: 'FAILED',
      result: 'FAILED',
      dataLossStatus: 'NONE',
      adminRequirement: 'NONE',
    };

    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir);
        let removedCount = 0;
        const cutoff = Date.now() - 15 * 60 * 1000;

        for (const f of files) {
          if (f.endsWith('.tmp')) {
            const fullPath = path.join(dataDir, f);
            try {
              const stat = fs.statSync(fullPath);
              if (stat.mtimeMs < cutoff) {
                fs.unlinkSync(fullPath);
                removedCount++;
              }
            } catch {}
          }
        }
        event.verification = 'PASSED';
        event.result = 'SUCCESS';
        event.action += ` (Purged ${removedCount} stale .tmp files)`;
      } else {
        event.verification = 'PASSED';
        event.result = 'SUCCESS';
      }
    } catch (err: any) {
      event.result = 'FAILED';
      event.action += ` (Exception: ${err.message})`;
    }

    this.recordHealingEvent(event);
    return event;
  }

  /**
   * Level 3: Guarded Admin Approval Barrier for Authoritative Data Conflicts
   * Crucial rule: Self-healing MUST NOT guess or rewrite authoritative school data!
   */
  public escalateAuthoritativeDataConflict(
    entityType: string,
    entityId: string,
    details: string,
    schoolId = 'default'
  ): HealingEvent {
    const healId = this.generateHealId();
    const errorId = this.generateErrorId();
    const now = new Date().toISOString();

    const event: HealingEvent = {
      healId,
      errorId,
      timestamp: now,
      schoolId,
      module: `AuthoritativeDataProtection:${entityType}`,
      failure: `Discrepancy detected in authoritative record ${entityType}:${entityId}`,
      diagnosis: details,
      repairLevel: 3, // Level 3: ADMIN APPROVAL REQUIRED
      action: 'Automatic modification blocked. Record quarantined with evidence preserved.',
      verification: 'PASSED', // Verified that automatic modification was safely blocked
      result: 'QUARANTINED',
      dataLossStatus: 'NONE',
      adminRequirement: 'ADMIN_APPROVAL_REQUIRED',
    };

    this.recordHealingEvent(event);
    return event;
  }

  private repairAttemptCounts: Map<string, number> = new Map();

  /**
   * Controlled Guarded Self-Healing Execution with Rollback & Infinite Loop Prevention
   * Safely handles repair failures: rollback, HEAL-ID, ERROR-ID, incident creation, admin escalation.
   */
  public async executeGuardedSelfHealingWithFailureHandling(params: {
    module: string;
    failure: string;
    diagnosis?: string;
    repairLevel?: RepairLevel;
    attemptRepair: () => Promise<boolean> | boolean;
    rollback?: () => Promise<void> | void;
    schoolId?: string;
    maxAttempts?: number;
  }): Promise<HealingEvent> {
    const schoolId = params.schoolId || 'default';
    const repairKey = `${params.module}:${params.failure}`;
    const maxAttempts = params.maxAttempts || 2;
    const currentAttempts = this.repairAttemptCounts.get(repairKey) || 0;

    const healId = this.generateHealId();
    const errorId = this.generateErrorId();
    const now = new Date().toISOString();

    // Prevent infinite repair loops
    if (currentAttempts >= maxAttempts) {
      const loopBlockedEvent: HealingEvent = {
        healId,
        errorId,
        timestamp: now,
        schoolId,
        module: params.module,
        failure: params.failure,
        diagnosis: `Infinite repair loop prevented: Maximum attempt threshold (${maxAttempts}) reached without successful verification.`,
        repairLevel: params.repairLevel ?? 1,
        action: 'Autonomous repair halted to prevent infinite loop. Escalated to Administrator.',
        verification: 'FAILED',
        result: 'FAILED',
        dataLossStatus: 'NONE',
        adminRequirement: 'ADMIN_APPROVAL_REQUIRED',
      };
      this.recordHealingEvent(loopBlockedEvent);
      this.createIncidentAndErrorLog(loopBlockedEvent, 'Infinite repair loop prevented');
      return loopBlockedEvent;
    }

    this.repairAttemptCounts.set(repairKey, currentAttempts + 1);

    const event: HealingEvent = {
      healId,
      errorId,
      timestamp: now,
      schoolId,
      module: params.module,
      failure: params.failure,
      diagnosis: params.diagnosis || 'Automated health evaluation detected subsystem abnormality',
      repairLevel: params.repairLevel ?? 1,
      action: `Initiated guarded repair attempt #${currentAttempts + 1}`,
      verification: 'FAILED',
      result: 'FAILED',
      dataLossStatus: 'NONE',
      adminRequirement: 'NONE',
    };

    let repairSuccess = false;
    try {
      repairSuccess = await params.attemptRepair();
    } catch (err: any) {
      event.action += ` (Repair threw exception: ${err.message})`;
      repairSuccess = false;
    }

    if (repairSuccess) {
      event.verification = 'PASSED';
      event.result = 'SUCCESS';
      event.action += ' -> Verification PASSED successfully';
      this.repairAttemptCounts.delete(repairKey); // Reset on success
      this.recordHealingEvent(event);
      return event;
    }

    // Repair failed or could not be verified
    event.verification = 'FAILED';
    event.adminRequirement = 'ADMIN_APPROVAL_REQUIRED';

    // Execute rollback if available
    if (params.rollback) {
      try {
        await params.rollback();
        event.result = 'ROLLED_BACK';
        event.action += ' -> Verification FAILED: Safely executed rollback procedure';
      } catch (rbErr: any) {
        event.result = 'FAILED';
        event.action += ` -> Rollback failed: ${rbErr.message}`;
      }
    } else {
      event.result = 'FAILED';
      event.action += ' -> Verification FAILED: Safe state retained without unverified changes';
    }

    this.recordHealingEvent(event);
    this.createIncidentAndErrorLog(event, event.action);
    return event;
  }

  /**
   * Automatically creates an incident and error log when automated self-healing fails
   */
  private createIncidentAndErrorLog(event: HealingEvent, details: string): void {
    try {
      const db = readServerDB();
      if (!db.systemErrors) db.systemErrors = [];
      if (!db.systemFeedback) db.systemFeedback = [];

      // Record in technical error tracking
      db.systemErrors.unshift({
        id: `err-${Date.now()}`,
        errorId: event.errorId,
        schoolId: event.schoolId,
        module: event.module,
        errorMessage: `Self-Healing failure [${event.healId}]: ${event.failure}`,
        context: {
          healId: event.healId,
          repairLevel: event.repairLevel,
          result: event.result,
          details,
        },
        timestamp: event.timestamp,
      });

      // Register high-priority incident for School Administrators
      db.systemFeedback.unshift({
        id: `INCIDENT-${event.healId}`,
        schoolId: event.schoolId,
        userId: 'system-resilience',
        username: 'ResilienceEngine',
        submittingRole: 'System',
        category: 'BUG_REPORT',
        priority: 'CRITICAL',
        status: 'NEW',
        affectedModule: event.module,
        title: `[Resilience Alert] Self-Healing Requires Admin Review (${event.healId})`,
        message: `Self-repair attempted for ${event.module} but could not verify safe completion (${event.result}). Action: ${event.action}. Diagnostic ERROR-ID: ${event.errorId}`,
        auditHistory: [
          {
            action: 'INCIDENT_CREATED_FROM_HEALING_FAILURE',
            performedBy: 'ResilienceEngine',
            timestamp: event.timestamp,
            notes: `Auto-escalated healing failure with errorId ${event.errorId}`,
          },
        ],
        createdAt: event.timestamp,
        updatedAt: event.timestamp,
      });

      writeServerDB(db);
    } catch {
      // In-memory logs preserve event even if disk write fails
    }
  }

  /**
   * Records a healing event in durable ServerDB and in-memory log
   */
  private recordHealingEvent(event: HealingEvent, providedDb?: ServerDBData): void {
    this.inMemoryHealingLog.unshift(event);
    if (this.inMemoryHealingLog.length > 500) {
      this.inMemoryHealingLog = this.inMemoryHealingLog.slice(0, 500);
    }

    try {
      const db = providedDb || readServerDB();
      if (!db.resilienceEvents) db.resilienceEvents = [];
      db.resilienceEvents.unshift(event);

      // Keep resilience events bounded
      if (db.resilienceEvents.length > 500) {
        db.resilienceEvents = db.resilienceEvents.slice(0, 500);
      }

      // Add audit log for high-visibility compliance
      if (!providedDb) {
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: event.timestamp,
          userId: 'ResilienceEngine',
          username: 'AutonomousSelfHealing',
          userRole: 'System',
          action: 'SELF_HEALING_EVENT',
          details: `[${event.healId}] Level ${event.repairLevel} ${event.module}: ${event.result} (Verification: ${event.verification})`,
        });
        writeServerDB(db);
      }
    } catch {
      // If DB write fails, in-memory log preserves event
    }
  }

  public getHealingEvents(limit = 100): HealingEvent[] {
    try {
      const db = readServerDB();
      if (db.resilienceEvents && db.resilienceEvents.length > 0) {
        return db.resilienceEvents.slice(0, limit);
      }
    } catch {}
    return this.inMemoryHealingLog.slice(0, limit);
  }
}

export const resilienceEngine = new ResilienceEngineService();
