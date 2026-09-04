import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// GET audit logs (Protected - Admin, Headteacher, DOS, Bursar)
router.get('/', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)', 'Bursar / Accountant'), (req, res) => {
  const db = readServerDB();
  res.json({ auditLogs: db.auditLogs });
});

// POST new audit entry (Protected or internal)
router.post('/', (req, res) => {
  try {
    const { userId, username, userRole, action, details, deviceInfo } = req.body;
    const db = readServerDB();

    const newLog = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      userId: userId || (req as any).user?.id || 'anonymous',
      username: username || (req as any).user?.username || 'System',
      userRole: userRole || (req as any).user?.role || 'System',
      action: action || 'LOGIN_SUCCESS',
      details: details || '',
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
      deviceInfo: deviceInfo || req.headers['user-agent'] || '',
    };

    db.auditLogs.unshift(newLog);
    writeServerDB(db);

    res.json({ success: true, log: newLog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
