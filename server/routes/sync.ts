import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { rateLimiter, requireAuth } from '../middleware/authMiddleware';

const router = Router();

// POST process client offline sync queue batch with idempotency & strict domain handling
router.post('/push', rateLimiter(120, 60000), requireAuth, (req, res) => {
  try {
    const { items } = req.body; // Array of SyncQueueItem
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, processedCount: 0 });
    }

    const db = readServerDB();
    let processedCount = 0;
    const user = (req as any).user;
    const userRole = user?.role || 'Administrator';
    const isStaffOrAdmin = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Teacher', 'Registrar', 'Director of Studies (DOS)', 'Bursar', 'Super Administrator', 'ICT Administrator'].includes(userRole);

    if (!isStaffOrAdmin) {
      return res.status(403).json({ error: 'Unauthorized to push sync mutations' });
    }

    for (const item of items) {
      const { entity, action, payload } = item;
      if (!payload) continue;

      if (entity === 'user') {
        // Only admin / owner / headteacher can sync users
        if (!['Administrator', 'School Owner', 'Head Teacher', 'Headteacher'].includes(userRole)) continue;
        if (action === 'CREATE') {
          if (!db.users.some((u) => u.id === payload.id)) {
            db.users.push(payload);
            processedCount++;
          }
        } else if (action === 'UPDATE') {
          const idx = db.users.findIndex((u) => u.id === payload.id);
          if (idx !== -1) {
            db.users[idx] = { ...db.users[idx], ...payload, updatedAt: new Date().toISOString() };
            processedCount++;
          }
        }
      } else if (entity === 'student') {
        if (action === 'CREATE') {
          if (!db.students.some((s) => s.id === payload.id)) {
            db.students.push(payload);
            processedCount++;
          }
        } else if (action === 'UPDATE') {
          const idx = db.students.findIndex((s) => s.id === payload.id);
          if (idx !== -1) {
            db.students[idx] = { ...db.students[idx], ...payload, updatedAt: new Date().toISOString() };
            processedCount++;
          }
        }
      } else if (entity === 'attendance') {
        if (!db.studentAttendance.some((a) => a.id === payload.id)) {
          db.studentAttendance.push(payload);
          processedCount++;
        }
      } else if (entity === 'school') {
        if (['Administrator', 'School Owner', 'Head Teacher', 'Headteacher'].includes(userRole)) {
          db.schoolProfile = { ...db.schoolProfile, ...payload, updatedAt: new Date().toISOString() };
          processedCount++;
        }
      } else if (entity === 'role') {
        if (['Administrator', 'School Owner', 'Head Teacher', 'Headteacher'].includes(userRole)) {
          if (action === 'CREATE') {
            if (!db.roles.some((r) => r.id === payload.id)) {
              db.roles.push(payload);
              processedCount++;
            }
          } else if (action === 'UPDATE') {
            const idx = db.roles.findIndex((r) => r.id === payload.id);
            if (idx !== -1) {
              db.roles[idx] = { ...db.roles[idx], ...payload };
              processedCount++;
            }
          }
        }
      } else if (entity === 'audit') {
        if (!db.auditLogs.some((a) => a.id === payload.id)) {
          db.auditLogs.unshift(payload);
          processedCount++;
        }
      } else if (entity === 'payment') {
        if (!db.paymentRecords.some((p: any) => p.id === payload.id || p.transactionReference === payload.transactionReference)) {
          db.paymentRecords.unshift(payload);
          processedCount++;
        }
      } else if (entity === 'feeStructure') {
        if (action === 'CREATE') {
          if (!db.feeStructures.some((f: any) => f.id === payload.id)) {
            db.feeStructures.push(payload);
            processedCount++;
          }
        } else if (action === 'UPDATE') {
          const idx = db.feeStructures.findIndex((f: any) => f.id === payload.id);
          if (idx !== -1) {
            db.feeStructures[idx] = { ...db.feeStructures[idx], ...payload };
            processedCount++;
          }
        }
      } else if (entity === 'admission') {
        if (!db.admissions.some((a: any) => a.id === payload.id)) {
          db.admissions.unshift(payload);
          processedCount++;
        }
      }
    }

    // Add sync audit record
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || 'sync-engine',
      username: (req as any).user?.username || 'OfflineSync',
      userRole: userRole,
      action: 'SYNC_OPERATION',
      details: `Processed ${processedCount} offline queue mutations successfully`,
    });

    writeServerDB(db);

    res.json({
      success: true,
      processedCount,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// V5 POST process operation batch with idempotency, checksums, and conflict quarantine
router.post('/operations', rateLimiter(120, 60000), requireAuth, (req, res) => {
  try {
    const { operations } = req.body;
    if (!Array.isArray(operations) || operations.length === 0) {
      return res.json({ success: true, totalProcessed: 0, results: [] });
    }

    const user = (req as any).user;
    const currentUserId = user?.id || 'sys-user';
    const currentUserRole = user?.role || 'Administrator';
    const activeSchoolId = req.headers['x-school-id'] as string || undefined;

    const { syncEngine } = require('../services/syncService');
    const batchResult = syncEngine.processOperationBatch(
      operations,
      currentUserId,
      currentUserRole,
      activeSchoolId
    );

    res.json({
      success: true,
      ...batchResult,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, code: 'SYNC_OPERATIONS_ERROR' });
  }
});

// V5 GET query quarantined conflicts awaiting administrator review
router.get('/conflicts', requireAuth, (req, res) => {
  const user = (req as any).user;
  const isStaffOrAdmin = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Administrator', 'ICT Administrator'].includes(user?.role);
  if (!isStaffOrAdmin) {
    return res.status(403).json({ error: 'Only administrators can inspect quarantined conflicts' });
  }

  const db = readServerDB();
  const conflicts = (db.conflictRecords || []).filter((c: any) => c.resolutionStatus === 'QUARANTINED');
  res.json({
    success: true,
    conflicts,
    count: conflicts.length,
    timestamp: new Date().toISOString(),
  });
});

// V5 POST resolve a quarantined conflict with explicit authorized administrator decision
router.post('/conflicts/:conflictId/resolve', requireAuth, (req, res) => {
  const user = (req as any).user;
  const isStaffOrAdmin = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Administrator', 'ICT Administrator'].includes(user?.role);
  if (!isStaffOrAdmin) {
    return res.status(403).json({ error: 'Only administrators can resolve conflicts' });
  }

  const { conflictId } = req.params;
  const { decision, mergedPayload } = req.body;
  if (!decision || !['KEEP_EXISTING', 'ACCEPT_INCOMING', 'MANUAL_MERGE'].includes(decision)) {
    return res.status(400).json({ error: 'Valid decision required: KEEP_EXISTING | ACCEPT_INCOMING | MANUAL_MERGE' });
  }

  const { syncEngine } = require('../services/syncService');
  const result = syncEngine.resolveConflict(
    conflictId,
    decision,
    { id: user.id, username: user.username, role: user.role },
    mergedPayload
  );

  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST resolve all quarantined conflicts (Bulk resolution)
router.post('/conflicts/resolve-all', requireAuth, (req, res) => {
  const user = (req as any).user;
  const isStaffOrAdmin = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Administrator', 'ICT Administrator'].includes(user?.role);
  if (!isStaffOrAdmin) {
    return res.status(403).json({ error: 'Only administrators can resolve conflicts' });
  }

  const { decision = 'KEEP_EXISTING' } = req.body;
  const db = readServerDB();
  if (!db.conflictRecords) db.conflictRecords = [];

  const openConflicts = db.conflictRecords.filter((c: any) => c.resolutionStatus === 'QUARANTINED');
  const { syncEngine } = require('../services/syncService');
  let resolvedCount = 0;

  for (const c of openConflicts) {
    const result = syncEngine.resolveConflict(
      c.conflictId,
      decision,
      { id: user.id, username: user.username, role: user.role }
    );
    if (result.success) resolvedCount++;
  }

  res.json({ success: true, resolvedCount, total: openConflicts.length });
});

// GET all quarantined operations
router.get('/quarantined', requireAuth, (req, res) => {
  const user = (req as any).user;
  const isStaffOrAdmin = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Administrator', 'ICT Administrator'].includes(user?.role);
  if (!isStaffOrAdmin) {
    return res.status(403).json({ error: 'Only administrators can inspect quarantined operations' });
  }

  const db = readServerDB();
  const quarantined = (db.quarantinedOperations || []).filter((q: any) => q.status === 'QUARANTINED' || q.status === 'CONFLICT');
  res.json({
    success: true,
    quarantined,
    count: quarantined.length,
    timestamp: new Date().toISOString(),
  });
});

// POST resolve / acknowledge a single quarantined operation
router.post('/quarantined/:operationId/resolve', requireAuth, (req, res) => {
  const user = (req as any).user;
  const isStaffOrAdmin = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Administrator', 'ICT Administrator'].includes(user?.role);
  if (!isStaffOrAdmin) {
    return res.status(403).json({ error: 'Only administrators can resolve quarantined operations' });
  }

  const { operationId } = req.params;
  const db = readServerDB();
  if (!db.quarantinedOperations) db.quarantinedOperations = [];

  const target = db.quarantinedOperations.find((q: any) => q.operationId === operationId || q.id === operationId);
  if (!target) {
    return res.status(404).json({ error: 'Quarantined operation not found' });
  }

  target.status = 'AUDITED_RESOLVED';
  target.resolvedBy = user?.username || 'Administrator';
  target.resolvedAt = new Date().toISOString();

  writeServerDB(db);
  res.json({ success: true, operation: target });
});

// POST resolve / clear all quarantined operations
router.post('/quarantined/resolve-all', requireAuth, (req, res) => {
  const user = (req as any).user;
  const isStaffOrAdmin = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Administrator', 'ICT Administrator'].includes(user?.role);
  if (!isStaffOrAdmin) {
    return res.status(403).json({ error: 'Only administrators can resolve quarantined operations' });
  }

  const db = readServerDB();
  if (!db.quarantinedOperations) db.quarantinedOperations = [];

  const now = new Date().toISOString();
  let count = 0;
  db.quarantinedOperations.forEach((q: any) => {
    if (q.status === 'QUARANTINED' || q.status === 'CONFLICT') {
      q.status = 'AUDITED_RESOLVED';
      q.resolvedBy = user?.username || 'Administrator';
      q.resolvedAt = now;
      count++;
    }
  });

  writeServerDB(db);
  res.json({ success: true, resolvedCount: count });
});

// V5 GET overall sync queue and engine telemetry
router.get('/status', requireAuth, (req, res) => {
  const db = readServerDB();
  const pendingCount = (db.syncQueue || []).filter((q: any) => q.status === 'PENDING' || q.status === 'pending').length;
  const syncedCount = (db.syncQueue || []).filter((q: any) => q.status === 'SYNCED').length;
  const conflictsCount = (db.conflictRecords || []).filter((c: any) => c.resolutionStatus === 'QUARANTINED').length;
  const quarantinedCount = (db.quarantinedOperations || []).filter((q: any) => q.status === 'QUARANTINED' || q.status === 'CONFLICT').length;

  res.json({
    status: 'OPERATIONAL',
    pendingCount,
    syncedCount,
    conflictsCount,
    quarantinedCount,
    lastSyncTimestamp: db.syncQueue?.[0]?.processedAt || db.syncQueue?.[0]?.timestamp || null,
    serverTime: new Date().toISOString(),
  });
});

// GET pull all server state for client sync initialization (Protected)
router.get('/pull', rateLimiter(60, 60000), requireAuth, (req, res) => {
  const db = readServerDB();
  const safeUsers = db.users.map(({ passwordHash, ...u }) => u);
  res.json({
    schoolProfile: db.schoolProfile,
    users: safeUsers,
    roles: db.roles,
    settings: db.settings,
    students: db.students || [],
    studentAttendance: db.studentAttendance || [],
    auditLogs: db.auditLogs.slice(0, 100),
    serverTimestamp: new Date().toISOString(),
  });
});

export default router;
