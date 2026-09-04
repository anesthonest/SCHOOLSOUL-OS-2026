import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

export const feedbackRouter = Router();

export interface SystemFeedbackItem {
  id: string;
  schoolId: string;
  userId: string;
  username: string;
  submittingRole: string;
  category: 'BUG_REPORT' | 'FEATURE_REQUEST' | 'SUGGESTION' | 'COMPLAINT' | 'USABILITY' | 'PERFORMANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'IN_REVIEW' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  affectedModule: string;
  title: string;
  message: string;
  technicalContext?: {
    userAgent?: string;
    screenResolution?: string;
    urlPath?: string;
    networkStatus?: string;
    appVersion?: string;
  };
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  auditHistory: {
    action: string;
    performedBy: string;
    timestamp: string;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalErrorReport {
  id: string;
  errorId: string;
  schoolId: string;
  userId?: string;
  userRole?: string;
  module: string;
  errorMessage: string;
  errorStack?: string;
  context?: Record<string, any>;
  timestamp: string;
  status?: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED' | 'IGNORED';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

// 1. Submit Feedback (Open to all authenticated users)
feedbackRouter.post('/', requireAuth, (req, res) => {
  try {
    const user = (req as any).user;
    const {
      category = 'SUGGESTION',
      priority = 'MEDIUM',
      affectedModule = 'General',
      title,
      message,
      technicalContext,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const db = readServerDB();
    if (!db.systemFeedback) db.systemFeedback = [];

    const now = new Date().toISOString();
    const feedbackId = `FB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newFeedback: SystemFeedbackItem = {
      id: feedbackId,
      schoolId: user?.schoolId || 'global',
      userId: user?.id || 'anonymous',
      username: user?.username || 'User',
      submittingRole: user?.role || 'Staff',
      category,
      priority,
      status: 'NEW',
      affectedModule,
      title,
      message,
      technicalContext: technicalContext || {
        userAgent: req.headers['user-agent'],
      },
      auditHistory: [
        {
          action: 'FEEDBACK_SUBMITTED',
          performedBy: user?.username || 'User',
          timestamp: now,
          notes: 'Feedback item submitted into system',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    db.systemFeedback.unshift(newFeedback);

    // Audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      userId: user?.id || 'usr-1',
      username: user?.username || 'User',
      userRole: user?.role || 'Staff',
      action: 'FEEDBACK_SUBMIT',
      details: `Submitted ${category} feedback [${feedbackId}]: ${title}`,
    });

    writeServerDB(db);
    res.status(201).json({ success: true, feedback: newFeedback });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit feedback' });
  }
});

// 2. Get Feedback List (Protected - Admins & Headteachers get all for their school, regular users get only their submissions)
feedbackRouter.get('/', requireAuth, (req, res) => {
  try {
    const user = (req as any).user;
    const db = readServerDB();
    const all = db.systemFeedback || [];

    const isGlobalAdmin = ['Super Admin', 'Developer'].includes(user?.role);
    const isSchoolAdmin = ['Administrator', 'School Owner', 'Head Teacher', 'Headteacher'].includes(user?.role);

    let list = all;
    if (isGlobalAdmin) {
      // Sees all feedback
      list = all;
    } else if (isSchoolAdmin) {
      // Sees feedback from their school
      list = all.filter((item: SystemFeedbackItem) => item.schoolId === user?.schoolId || item.schoolId === 'global');
    } else {
      // Standard user sees only own feedback
      list = all.filter((item: SystemFeedbackItem) => item.userId === user?.id);
    }

    const { status, category, priority } = req.query;
    if (status && status !== 'ALL') {
      list = list.filter((i: SystemFeedbackItem) => i.status === status);
    }
    if (category && category !== 'ALL') {
      list = list.filter((i: SystemFeedbackItem) => i.category === category);
    }
    if (priority && priority !== 'ALL') {
      list = list.filter((i: SystemFeedbackItem) => i.priority === priority);
    }

    res.json({ success: true, feedback: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch feedback' });
  }
});

// 3. Update Feedback Status & Resolution (Admin / Headteacher only)
feedbackRouter.patch('/:id/status', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Admin', 'Developer'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const user = (req as any).user;

    const validStatuses = ['NEW', 'IN_REVIEW', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const db = readServerDB();
    const item = (db.systemFeedback || []).find((f: SystemFeedbackItem) => f.id === id);

    if (!item) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    const now = new Date().toISOString();
    item.status = status;
    item.updatedAt = now;
    if (resolutionNotes) item.resolutionNotes = resolutionNotes;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      item.resolvedBy = user?.username || 'Admin';
      item.resolvedAt = now;
    }

    item.auditHistory.push({
      action: `STATUS_CHANGED_TO_${status}`,
      performedBy: user?.username || 'Admin',
      timestamp: now,
      notes: resolutionNotes || `Status transitioned to ${status}`,
    });

    writeServerDB(db);
    res.json({ success: true, feedback: item });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update feedback status' });
  }
});

// 4. Safe Technical Error Reporting Endpoint
feedbackRouter.post('/report-error', (req, res) => {
  try {
    const { module = 'Applet', errorMessage, errorStack, context } = req.body;
    const user = (req as any).user;

    const db = readServerDB();
    if (!db.systemErrors) db.systemErrors = [];

    const now = new Date().toISOString();
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Filter out any potential secrets from context
    const sanitizedContext: Record<string, any> = {};
    if (context && typeof context === 'object') {
      for (const [key, val] of Object.entries(context)) {
        if (!/password|token|secret|key|authorization/i.test(key)) {
          sanitizedContext[key] = typeof val === 'object' ? JSON.stringify(val).substring(0, 500) : val;
        }
      }
    }

    const report: TechnicalErrorReport = {
      id: `err-log-${Date.now()}`,
      errorId,
      schoolId: user?.schoolId || 'global',
      userId: user?.id,
      userRole: user?.role,
      module,
      errorMessage: String(errorMessage || 'Unknown Error').substring(0, 1000),
      errorStack: errorStack ? String(errorStack).substring(0, 3000) : undefined,
      context: sanitizedContext,
      timestamp: now,
      status: 'UNRESOLVED',
    };

    db.systemErrors.unshift(report);
    if (db.systemErrors.length > 500) {
      db.systemErrors = db.systemErrors.slice(0, 500); // Cap in memory
    }

    writeServerDB(db);
    res.status(201).json({ success: true, errorId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record error report' });
  }
});

// 5. Get Error Reports (Admin / Developer only)
feedbackRouter.get('/errors', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Admin', 'Super Administrator', 'Developer'), (req, res) => {
  try {
    const db = readServerDB();
    const statusFilter = req.query.status as string;
    let errors = db.systemErrors || [];
    if (statusFilter && statusFilter !== 'ALL') {
      errors = errors.filter((e: any) => (e.status || 'UNRESOLVED') === statusFilter);
    }
    res.json({ success: true, errors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Resolve a single technical error (Admin / Developer only)
feedbackRouter.post('/errors/:id/resolve', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Admin', 'Super Administrator', 'Developer'), (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const user = (req as any).user;
    const db = readServerDB();
    if (!db.systemErrors) db.systemErrors = [];

    const errIndex = db.systemErrors.findIndex((e: any) => e.id === id || e.errorId === id);
    if (errIndex === -1) {
      return res.status(404).json({ error: 'System error not found' });
    }

    const now = new Date().toISOString();
    db.systemErrors[errIndex].status = 'RESOLVED';
    db.systemErrors[errIndex].resolutionNotes = resolutionNotes || 'Resolved by administrator';
    db.systemErrors[errIndex].resolvedBy = user?.username || 'Administrator';
    db.systemErrors[errIndex].resolvedAt = now;

    writeServerDB(db);
    res.json({ success: true, error: db.systemErrors[errIndex] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Resolve all technical errors (Bulk resolve)
feedbackRouter.post('/errors/resolve-all', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Admin', 'Super Administrator', 'Developer'), (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const user = (req as any).user;
    const db = readServerDB();
    if (!db.systemErrors) db.systemErrors = [];

    const now = new Date().toISOString();
    let count = 0;
    db.systemErrors.forEach((e: any) => {
      if (e.status !== 'RESOLVED') {
        e.status = 'RESOLVED';
        e.resolutionNotes = resolutionNotes || 'Bulk resolved by administrator';
        e.resolvedBy = user?.username || 'Administrator';
        e.resolvedAt = now;
        count++;
      }
    });

    writeServerDB(db);
    res.json({ success: true, resolvedCount: count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Clear resolved errors
feedbackRouter.delete('/errors/clear-resolved', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Admin', 'Super Administrator', 'Developer'), (req, res) => {
  try {
    const db = readServerDB();
    if (!db.systemErrors) db.systemErrors = [];
    const beforeCount = db.systemErrors.length;
    db.systemErrors = db.systemErrors.filter((e: any) => e.status !== 'RESOLVED');
    writeServerDB(db);
    res.json({ success: true, clearedCount: beforeCount - db.systemErrors.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Bulk resolve feedback incidents (Admin only)
feedbackRouter.post('/resolve-all', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Super Admin', 'Super Administrator', 'Developer'), (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const user = (req as any).user;
    const db = readServerDB();
    if (!db.systemFeedback) db.systemFeedback = [];

    const now = new Date().toISOString();
    let count = 0;
    db.systemFeedback.forEach((f: any) => {
      if (f.status !== 'RESOLVED' && f.status !== 'CLOSED') {
        f.status = 'RESOLVED';
        f.resolutionNotes = resolutionNotes || 'Bulk resolved by administrator';
        f.resolvedBy = user?.username || 'Administrator';
        f.resolvedAt = now;
        f.updatedAt = now;
        if (!f.auditHistory) f.auditHistory = [];
        f.auditHistory.push({
          action: 'STATUS_CHANGE:RESOLVED',
          performedBy: user?.username || 'Administrator',
          timestamp: now,
          notes: resolutionNotes || 'Bulk resolved by administrator',
        });
        count++;
      }
    });

    writeServerDB(db);
    res.json({ success: true, resolvedCount: count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
