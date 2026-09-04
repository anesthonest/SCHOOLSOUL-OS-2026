/**
 * SchoolSoul Operation-Based Synchronization & Conflict Engine
 * Implements strict offline-first operation tracking, idempotency,
 * conflict detection, quarantine, and audit trails.
 */

import crypto from 'crypto';
import { readServerDB, writeServerDB, type ServerDBData } from '../db/store';

export type SyncOperationStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'RETRYING'
  | 'CONFLICT'
  | 'QUARANTINED';

export interface SyncOperation {
  operationId: string; // e.g. OP-20260902-XXXX
  schoolId: string;
  deviceId: string;
  userId: string;
  userRole: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  version: number;
  timestamp: string;
  payload: any;
  checksum: string; // SHA-256 of payload
  status: SyncOperationStatus;
  retryCount: number;
  createdAt: string;
  lastAttemptAt?: string;
  errorState?: string | null;
}

export interface ConflictRecord {
  conflictId: string; // CONF-YYYYMMDD-XXXX
  operationId: string;
  schoolId: string;
  entityType: string;
  entityId: string;
  detectedAt: string;
  existingVersion: number;
  incomingVersion: number;
  existingPayload: any;
  incomingPayload: any;
  resolutionStatus: 'QUARANTINED' | 'RESOLVED_EXISTING' | 'RESOLVED_INCOMING' | 'RESOLVED_MERGED';
  resolvedBy?: string;
  resolvedAt?: string;
  auditTrail: string[];
}

export interface OperationProcessResult {
  operationId: string;
  status: SyncOperationStatus;
  success: boolean;
  message: string;
  conflictId?: string;
  serverTimestamp: string;
}

export class SyncEngineService {
  // Critical entities that require strict conflict preservation & quarantine (no blind LWW)
  private readonly CRITICAL_ENTITIES = new Set([
    'student',
    'studentAttendance',
    'staffAttendance',
    'feeStructure',
    'studentFeeAccount',
    'paymentRecord',
    'scholarship',
    'user',
    'role',
    'auditLog',
    'admission',
  ]);

  /**
   * Generates a deterministic SHA-256 checksum of an entity payload
   */
  public calculateChecksum(payload: any): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Process a batch of offline operations with full transaction boundaries & idempotency
   */
  public processOperationBatch(
    operations: SyncOperation[],
    currentUserId: string,
    currentUserRole: string,
    activeSchoolId?: string
  ): {
    results: OperationProcessResult[];
    totalProcessed: number;
    syncedCount: number;
    conflictCount: number;
    quarantinedCount: number;
  } {
    const db = readServerDB();
    if (!db.syncQueue) db.syncQueue = [];
    if (!db.conflictRecords) db.conflictRecords = [];
    if (!db.quarantinedOperations) db.quarantinedOperations = [];

    const results: OperationProcessResult[] = [];
    let syncedCount = 0;
    let conflictCount = 0;
    let quarantinedCount = 0;

    for (const op of operations) {
      const res = this.processSingleOperation(op, db, currentUserId, currentUserRole, activeSchoolId);
      results.push(res);
      if (res.status === 'SYNCED') syncedCount++;
      else if (res.status === 'CONFLICT') conflictCount++;
      else if (res.status === 'QUARANTINED') quarantinedCount++;
    }

    // Save state atomically
    writeServerDB(db);

    return {
      results,
      totalProcessed: operations.length,
      syncedCount,
      conflictCount,
      quarantinedCount,
    };
  }

  private processSingleOperation(
    op: SyncOperation,
    db: ServerDBData,
    currentUserId: string,
    currentUserRole: string,
    activeSchoolId?: string
  ): OperationProcessResult {
    const now = new Date().toISOString();

    // 1. Structure & Checksum Validation
    if (!op.operationId || !op.entityType || !op.entityId || !op.action || !op.payload) {
      return {
        operationId: op.operationId || 'OP-INVALID',
        status: 'FAILED',
        success: false,
        message: 'Invalid operation structure: missing required fields',
        serverTimestamp: now,
      };
    }

    // 2. Tenant Isolation Check
    const effectiveSchoolId = activeSchoolId || db.schoolProfile?.id;
    if (op.schoolId && effectiveSchoolId && op.schoolId !== effectiveSchoolId) {
      // Quarantine cross-school injection attempts
      const qOp = { ...op, status: 'QUARANTINED' as const, errorState: 'TENANT_MISMATCH_DETECTED' };
      db.quarantinedOperations.unshift(qOp);
      return {
        operationId: op.operationId,
        status: 'QUARANTINED',
        success: false,
        message: 'Tenant mismatch: Operation school ID does not match active school boundary',
        serverTimestamp: now,
      };
    }

    // 3. Payload Integrity Check
    const computedChecksum = this.calculateChecksum(op.payload);
    if (op.checksum && op.checksum !== computedChecksum) {
      const qOp = { ...op, status: 'QUARANTINED' as const, errorState: 'PAYLOAD_CHECKSUM_MISMATCH' };
      db.quarantinedOperations.unshift(qOp);
      return {
        operationId: op.operationId,
        status: 'QUARANTINED',
        success: false,
        message: 'Payload checksum verification failed. Quarantined for security inspection.',
        serverTimestamp: now,
      };
    }

    // 4. Idempotency Check (Check if operation ID was already applied)
    const existingOp = db.syncQueue.find((q: any) => q.operationId === op.operationId || q.id === op.operationId);
    if (existingOp && existingOp.status === 'SYNCED') {
      return {
        operationId: op.operationId,
        status: 'SYNCED',
        success: true,
        message: 'Operation already synchronized (Idempotent ACK)',
        serverTimestamp: now,
      };
    }

    // 5. RBAC Authorization Gate
    const hasPermission = this.verifyOperationPermission(op.entityType, op.action, currentUserRole);
    if (!hasPermission) {
      return {
        operationId: op.operationId,
        status: 'FAILED',
        success: false,
        message: `RBAC Forbidden: Role ${currentUserRole} cannot perform ${op.action} on ${op.entityType}`,
        serverTimestamp: now,
      };
    }

    // 6. Conflict Detection on Critical Records
    const targetCollection = this.getCollectionForEntity(db, op.entityType);
    const existingEntity = targetCollection ? targetCollection.find((item: any) => item.id === op.entityId) : null;

    if (existingEntity && this.CRITICAL_ENTITIES.has(op.entityType)) {
      const existingChecksum = this.calculateChecksum(existingEntity);
      const incomingChecksum = computedChecksum;

      // If entity already exists and payload differs, inspect version
      if (existingChecksum !== incomingChecksum) {
        const existingVersion = Number(existingEntity.version || existingEntity._version || 1);
        const incomingVersion = Number(op.version || 1);

        // Version Conflict: Incoming operation is not strictly newer or has diverged
        if (incomingVersion <= existingVersion) {
          const conflictId = `CONF-${new Date().toISOString().replace(/\D/g, '').slice(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;
          const conflictRecord: ConflictRecord = {
            conflictId,
            operationId: op.operationId,
            schoolId: op.schoolId || effectiveSchoolId || 'default',
            entityType: op.entityType,
            entityId: op.entityId,
            detectedAt: now,
            existingVersion,
            incomingVersion,
            existingPayload: existingEntity,
            incomingPayload: op.payload,
            resolutionStatus: 'QUARANTINED',
            auditTrail: [
              `[${now}] Conflict detected by SyncEngine on critical record ${op.entityType}:${op.entityId}. Both versions preserved safely.`,
            ],
          };

          db.conflictRecords.unshift(conflictRecord);
          db.quarantinedOperations.unshift({
            ...op,
            status: 'CONFLICT',
            conflictId,
            lastAttemptAt: now,
            errorState: 'CRITICAL_RECORD_VERSION_CONFLICT',
          });

          // Create audit log for security & compliance visibility
          db.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            timestamp: now,
            userId: currentUserId,
            username: currentUserRole,
            userRole: currentUserRole,
            action: 'SYNC_CONFLICT_QUARANTINED',
            details: `Critical ${op.entityType} record conflict quarantined (${conflictId}). Preserved authoritative copy.`,
          });

          return {
            operationId: op.operationId,
            status: 'CONFLICT',
            success: false,
            conflictId,
            message: `Conflict detected on critical school record (${op.entityType}). Quarantined without data overwrite.`,
            serverTimestamp: now,
          };
        }
      }
    }

    // 7. Apply Mutation to Authoritative Local Database
    this.applyMutation(db, op);

    // 8. Record in Sync Queue as Synced
    const recordOp = {
      ...op,
      status: 'SYNCED' as const,
      checksum: computedChecksum,
      processedAt: now,
    };
    db.syncQueue.unshift(recordOp);

    // Limit syncQueue retention in memory/db to prevent memory bloat
    if (db.syncQueue.length > 5000) {
      db.syncQueue = db.syncQueue.slice(0, 4000);
    }

    return {
      operationId: op.operationId,
      status: 'SYNCED',
      success: true,
      message: 'Operation synchronized successfully.',
      serverTimestamp: now,
    };
  }

  private verifyOperationPermission(entityType: string, action: string, role: string): boolean {
    const adminRoles = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Administrator', 'ICT Administrator'];
    if (adminRoles.includes(role)) return true;

    if (entityType === 'studentAttendance' || entityType === 'attendance') {
      return ['Teacher', 'Director of Studies (DOS)', 'Registrar', ...adminRoles].includes(role);
    }
    if (entityType === 'student') {
      return ['Registrar', 'Director of Studies (DOS)', ...adminRoles].includes(role);
    }
    if (entityType === 'paymentRecord' || entityType === 'feeStructure' || entityType === 'studentFeeAccount') {
      return ['Bursar', ...adminRoles].includes(role);
    }
    if (entityType === 'communityMessage' || entityType === 'liveClass') {
      return true; // General authenticated participants
    }
    return false;
  }

  private getCollectionForEntity(db: ServerDBData, entityType: string): any[] | null {
    switch (entityType) {
      case 'student': return db.students;
      case 'studentAttendance':
      case 'attendance': return db.studentAttendance;
      case 'staffAttendance': return db.staffAttendance;
      case 'user': return db.users;
      case 'role': return db.roles;
      case 'payment':
      case 'paymentRecord': return db.paymentRecords;
      case 'feeStructure': return db.feeStructures;
      case 'studentFeeAccount': return db.studentFeeAccounts;
      case 'admission': return db.admissions;
      default: return null;
    }
  }

  private applyMutation(db: ServerDBData, op: SyncOperation): void {
    const coll = this.getCollectionForEntity(db, op.entityType);
    if (!coll) return;

    if (op.action === 'CREATE') {
      const idx = coll.findIndex((item: any) => item.id === op.entityId);
      if (idx === -1) {
        coll.push(op.payload);
      } else {
        coll[idx] = { ...coll[idx], ...op.payload, _version: (coll[idx]._version || 1) + 1 };
      }
    } else if (op.action === 'UPDATE') {
      const idx = coll.findIndex((item: any) => item.id === op.entityId);
      if (idx !== -1) {
        coll[idx] = { ...coll[idx], ...op.payload, _version: (coll[idx]._version || 1) + 1, updatedAt: new Date().toISOString() };
      } else {
        coll.push(op.payload);
      }
    } else if (op.action === 'DELETE') {
      const idx = coll.findIndex((item: any) => item.id === op.entityId);
      if (idx !== -1) {
        coll.splice(idx, 1);
      }
    }
  }

  /**
   * Resolve an existing quarantined conflict with explicit authorized administrator decision
   */
  public resolveConflict(
    conflictId: string,
    decision: 'KEEP_EXISTING' | 'ACCEPT_INCOMING' | 'MANUAL_MERGE',
    adminUser: { id: string; username: string; role: string },
    mergedPayload?: any
  ): { success: boolean; message: string } {
    const db = readServerDB();
    const conflict = (db.conflictRecords || []).find((c: any) => c.conflictId === conflictId);
    if (!conflict) {
      return { success: false, message: `Conflict ${conflictId} not found` };
    }

    const now = new Date().toISOString();
    const coll = this.getCollectionForEntity(db, conflict.entityType);

    if (decision === 'ACCEPT_INCOMING') {
      if (coll) {
        const idx = coll.findIndex((i: any) => i.id === conflict.entityId);
        if (idx !== -1) {
          coll[idx] = { ...conflict.incomingPayload, _version: (conflict.incomingVersion || 1) + 1, updatedAt: now };
        } else {
          coll.push(conflict.incomingPayload);
        }
      }
      conflict.resolutionStatus = 'RESOLVED_INCOMING';
    } else if (decision === 'KEEP_EXISTING') {
      conflict.resolutionStatus = 'RESOLVED_EXISTING';
    } else if (decision === 'MANUAL_MERGE' && mergedPayload) {
      if (coll) {
        const idx = coll.findIndex((i: any) => i.id === conflict.entityId);
        if (idx !== -1) {
          coll[idx] = { ...mergedPayload, _version: (conflict.existingVersion || 1) + 1, updatedAt: now };
        }
      }
      conflict.resolutionStatus = 'RESOLVED_MERGED';
    }

    conflict.resolvedBy = `${adminUser.username} (${adminUser.role})`;
    conflict.resolvedAt = now;
    conflict.auditTrail.push(`[${now}] Resolved by ${adminUser.username} with decision: ${decision}`);

    // Update quarantined operation record status
    if (db.quarantinedOperations) {
      const qOp = db.quarantinedOperations.find((q: any) => q.conflictId === conflictId);
      if (qOp) {
        qOp.status = 'SYNCED';
        qOp.resolvedAt = now;
      }
    }

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      userId: adminUser.id,
      username: adminUser.username,
      userRole: adminUser.role,
      action: 'CONFLICT_RESOLVED',
      details: `Administrator resolved conflict ${conflictId} on ${conflict.entityType}:${conflict.entityId} with ${decision}`,
    });

    writeServerDB(db);
    return { success: true, message: `Conflict ${conflictId} resolved successfully.` };
  }
}

export const syncEngine = new SyncEngineService();
