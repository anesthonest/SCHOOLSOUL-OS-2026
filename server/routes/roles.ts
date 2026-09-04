import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// GET all roles (Protected)
router.get('/', requireAuth, (req, res) => {
  const db = readServerDB();
  res.json({ roles: db.roles });
});

// POST create custom role (Admin Protected)
router.post('/', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const { name, description, permissions, creatorUserId, creatorUsername } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Role name is required.' });
    }

    const db = readServerDB();

    const newRole = {
      id: 'role-' + Date.now(),
      name: String(name).trim(),
      description: description || '',
      isBuiltIn: false,
      permissions: permissions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.roles.push(newRole);

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: creatorUserId || (req as any).user?.id || 'admin',
      username: creatorUsername || (req as any).user?.username || 'Admin',
      userRole: (req as any).user?.role || 'Administrator',
      action: 'ROLE_CREATE',
      details: `Created new custom role: ${name}`,
    });

    writeServerDB(db);
    res.json({ success: true, role: newRole });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update role permissions (Admin Protected)
router.put('/:id', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, description, editorUserId, editorUsername } = req.body;
    const db = readServerDB();

    const roleIndex = db.roles.findIndex((r) => r.id === id);
    if (roleIndex === -1) return res.status(404).json({ error: 'Role not found' });

    db.roles[roleIndex] = {
      ...db.roles[roleIndex],
      permissions: permissions || db.roles[roleIndex].permissions,
      description: description !== undefined ? description : db.roles[roleIndex].description,
      updatedAt: new Date().toISOString(),
    };

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: editorUserId || (req as any).user?.id || 'admin',
      username: editorUsername || (req as any).user?.username || 'Admin',
      userRole: (req as any).user?.role || 'Administrator',
      action: 'ROLE_UPDATE',
      details: `Updated permissions for role: ${db.roles[roleIndex].name}`,
    });

    writeServerDB(db);
    res.json({ success: true, role: db.roles[roleIndex] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
