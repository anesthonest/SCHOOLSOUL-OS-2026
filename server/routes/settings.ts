import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// GET settings (Protected)
router.get('/', requireAuth, (req, res) => {
  const db = readServerDB();
  res.json({ settings: db.settings });
});

// PUT update settings (Protected - Admin & School Owner & Headteacher)
router.put('/', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const db = readServerDB();
    const newSettings = {
      ...db.settings,
      ...req.body,
    };

    db.settings = newSettings;

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || req.body.operatorUserId || 'admin',
      username: (req as any).user?.username || req.body.operatorUsername || 'Admin',
      userRole: (req as any).user?.role || 'Administrator',
      action: 'SETTINGS_UPDATE',
      details: 'System settings & security policies updated',
    });

    writeServerDB(db);

    res.json({ success: true, settings: newSettings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
