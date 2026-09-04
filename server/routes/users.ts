import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { hashPassword } from '../utils/passwordHash';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// GET all users (Protected - Safe projection omitting password hashes)
router.get('/', requireAuth, (req: any, res) => {
  const db = readServerDB();
  let safeUsers = db.users.map(({ passwordHash, ...u }) => u);
  
  // Tenant Isolation Check
  const userSchoolId = req.user?.schoolId;
  const userRole = req.user?.role;
  if (userSchoolId && userRole !== 'Super Admin' && userRole !== 'Platform Administrator') {
    safeUsers = safeUsers.filter((u: any) => !u.schoolId || u.schoolId === userSchoolId);
  }
  
  res.json({ users: safeUsers });
});

// POST create user (Protected - Admin & School Owner & Headteacher)
router.post('/', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), async (req: any, res) => {
  try {
    const { fullName, username, email, phone, employeeNumber, role, status, password, creatorUserId, creatorUsername } = req.body;
    if (!username || !fullName) {
      return res.status(400).json({ error: 'Full name and username are required.' });
    }

    const db = readServerDB();

    if (db.users.some((u) => u.username.toLowerCase() === String(username).trim().toLowerCase())) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    const userSchoolId = req.user?.schoolId;
    const initialPassword = password || 'SchoolSoul@2026';
    const hashedPassword = await hashPassword(initialPassword);
    const newUser = {
      id: 'usr-' + Date.now(),
      schoolId: userSchoolId || req.body.schoolId || db.schoolProfile?.id || 'default',
      fullName: String(fullName).trim(),
      username: String(username).trim(),
      email: email ? String(email).trim() : '',
      phone: phone ? String(phone).trim() : '',
      employeeNumber: employeeNumber || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: role || 'Teacher',
      status: status || 'Active',
      passwordHash: hashedPassword,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: creatorUserId || req.user?.id || 'admin',
      username: creatorUsername || req.user?.username || 'Admin',
      userRole: req.user?.role || 'Administrator',
      action: 'USER_CREATE',
      details: `Created new user ${newUser.username} (${newUser.role}) with Argon2id`,
    });

    writeServerDB(db);

    const { passwordHash, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user (Protected - Admin & School Owner & Headteacher)
router.put('/:id', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readServerDB();

    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    const existing = db.users[index];

    // Tenant Isolation Check
    const userSchoolId = req.user?.schoolId;
    const userRole = req.user?.role;
    if (userSchoolId && userRole !== 'Super Admin' && userRole !== 'Platform Administrator' && existing.schoolId && existing.schoolId !== userSchoolId) {
      return res.status(403).json({ error: 'Access denied: cannot modify user from another school.' });
    }

    // Prevent direct password overwrite via generic update route
    delete updates.passwordHash;
    delete updates.password;

    db.users[index] = {
      ...db.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: updates.editorUserId || req.user?.id || 'admin',
      username: updates.editorUsername || req.user?.username || 'Admin',
      userRole: req.user?.role || 'Administrator',
      action: 'USER_UPDATE',
      details: `Updated user profile for ${db.users[index].username}`,
    });

    writeServerDB(db);

    const { passwordHash, ...safeUser } = db.users[index];
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT change user status (Active / Inactive / Suspended / Revoked)
router.put('/:id/status', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, operatorUserId, operatorUsername, reason } = req.body;
    const db = readServerDB();

    const user = db.users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Tenant Isolation Check
    const userSchoolId = req.user?.schoolId;
    const userRole = req.user?.role;
    if (userSchoolId && userRole !== 'Super Admin' && userRole !== 'Platform Administrator' && user.schoolId && user.schoolId !== userSchoolId) {
      return res.status(403).json({ error: 'Access denied: cannot modify user status from another school.' });
    }

    // Protect primary Headteacher from unauthorized suspension or demotion
    const operatorRole = req.user?.role || '';
    if (user.role === 'Headteacher' && req.user?.id !== user.id && operatorRole !== 'Platform Administrator' && operatorRole !== 'Super Administrator') {
      return res.status(403).json({ error: 'Headteacher account protection: Cannot modify primary Headteacher status without authorization.' });
    }

    user.status = status;
    user.approvalStatus = status === 'Active' ? 'APPROVED' : status === 'Suspended' ? 'SUSPENDED' : status === 'REVOKED' ? 'REVOKED' : user.approvalStatus;
    if (reason) user.rejectionReason = reason;
    user.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: operatorUserId || req.user?.id || 'admin',
      username: operatorUsername || req.user?.username || 'Admin',
      userRole: req.user?.role || 'Administrator',
      action: 'USER_STATUS_CHANGE',
      details: `Changed status of ${user.username} to ${status}${reason ? ' (Reason: ' + reason + ')' : ''}`,
    });

    writeServerDB(db);
    res.json({ success: true, status: user.status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all account approval requests (Protected - Headteacher & Admin)
router.get('/approval-requests', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req: any, res) => {
  try {
    const db = readServerDB();
    const statusFilter = (req.query.status as string || 'ALL').toUpperCase();

    let requests = db.accountRequests || [];
    const userSchoolId = req.user?.schoolId;
    const userRole = req.user?.role;
    if (userSchoolId && userRole !== 'Super Admin' && userRole !== 'Platform Administrator') {
      requests = requests.filter((r: any) => !r.schoolId || r.schoolId === userSchoolId);
    }
    if (statusFilter !== 'ALL') {
      requests = requests.filter((r) => r.status?.toUpperCase() === statusFilter);
    }

    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Approve Account Request
router.post('/approval-requests/:id/approve', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const { id } = req.params;
    const { effectiveRole, comment } = req.body;
    const db = readServerDB();

    if (!db.accountRequests) db.accountRequests = [];
    const request = db.accountRequests.find((r) => r.id === id);
    if (!request) return res.status(404).json({ error: 'Approval request not found.' });

    const user = db.users.find((u) => u.id === request.userId || u.username.toLowerCase() === request.username.toLowerCase());
    const finalRole = effectiveRole || request.requestedRole || 'Teacher';

    request.status = 'APPROVED';
    request.effectiveRole = finalRole;
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = (req as any).user?.id || 'admin';
    request.reviewerUsername = (req as any).user?.username || 'Headteacher';
    request.reviewerComment = comment || 'Approved by School Administration';

    if (user) {
      user.status = 'Active';
      user.approvalStatus = 'APPROVED';
      user.role = finalRole;
      user.approvalComment = comment || 'Approved by School Administration';
      user.updatedAt = new Date().toISOString();
    }

    // Notify user
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'School Access Approved',
      message: `Your account request for '${finalRole}' has been approved by the Headteacher. You can now access your dashboard.`,
      type: 'success',
      priority: 'high',
      createdAt: new Date().toISOString(),
      read: false,
    });

    // Audit log
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || 'admin',
      username: (req as any).user?.username || 'Headteacher',
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'ACCOUNT_APPROVE',
      details: `Approved account request for ${request.fullName} (${request.username}) with role '${finalRole}'`,
    });

    writeServerDB(db);
    res.json({ success: true, request, user: user ? { ...user, passwordHash: undefined } : undefined });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Reject Account Request
router.post('/approval-requests/:id/reject', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comment } = req.body;
    const db = readServerDB();

    if (!db.accountRequests) db.accountRequests = [];
    const request = db.accountRequests.find((r) => r.id === id);
    if (!request) return res.status(404).json({ error: 'Approval request not found.' });

    const user = db.users.find((u) => u.id === request.userId || u.username.toLowerCase() === request.username.toLowerCase());
    const rejectionReason = reason || comment || 'Application does not meet current verification criteria.';

    request.status = 'REJECTED';
    request.rejectionReason = rejectionReason;
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = (req as any).user?.id || 'admin';
    request.reviewerUsername = (req as any).user?.username || 'Headteacher';
    request.reviewerComment = comment || rejectionReason;

    if (user) {
      user.status = 'REJECTED';
      user.approvalStatus = 'REJECTED';
      user.rejectionReason = rejectionReason;
      user.updatedAt = new Date().toISOString();
    }

    // Audit log
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || 'admin',
      username: (req as any).user?.username || 'Headteacher',
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'ACCOUNT_REJECT',
      details: `Rejected account request for ${request.fullName} (${request.username}) - Reason: ${rejectionReason}`,
    });

    writeServerDB(db);
    res.json({ success: true, request });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Suspend Account
router.post('/approval-requests/:id/suspend', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = readServerDB();

    if (!db.accountRequests) db.accountRequests = [];
    const request = db.accountRequests.find((r) => r.id === id);
    const user = db.users.find((u) => (request && u.id === request.userId) || u.id === id || (request && u.username.toLowerCase() === request.username.toLowerCase()));

    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Protect Headteacher
    if (user.role === 'Headteacher' && (req as any).user?.id !== user.id) {
      return res.status(403).json({ error: 'Cannot suspend primary Headteacher account.' });
    }

    user.status = 'Suspended';
    user.approvalStatus = 'SUSPENDED';
    user.rejectionReason = reason || 'Suspended by school administration';
    user.updatedAt = new Date().toISOString();

    if (request) {
      request.status = 'SUSPENDED';
      request.reviewerComment = reason || 'Suspended by school administration';
    }

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || 'admin',
      username: (req as any).user?.username || 'Headteacher',
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'ACCOUNT_SUSPEND',
      details: `Suspended account for user ${user.username}`,
    });

    writeServerDB(db);
    res.json({ success: true, message: `Account for ${user.username} suspended.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Revoke Account
router.post('/approval-requests/:id/revoke', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = readServerDB();

    if (!db.accountRequests) db.accountRequests = [];
    const request = db.accountRequests.find((r) => r.id === id);
    const user = db.users.find((u) => (request && u.id === request.userId) || u.id === id || (request && u.username.toLowerCase() === request.username.toLowerCase()));

    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.role === 'Headteacher' && (req as any).user?.id !== user.id) {
      return res.status(403).json({ error: 'Cannot revoke primary Headteacher account.' });
    }

    user.status = 'REVOKED';
    user.approvalStatus = 'REVOKED';
    user.rejectionReason = reason || 'Access permanently revoked by school administration';
    user.updatedAt = new Date().toISOString();

    if (request) {
      request.status = 'REVOKED';
      request.reviewerComment = reason || 'Access revoked';
    }

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || 'admin',
      username: (req as any).user?.username || 'Headteacher',
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'ACCOUNT_REVOKE',
      details: `Revoked access for user ${user.username}`,
    });

    writeServerDB(db);
    res.json({ success: true, message: `Access for ${user.username} revoked.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
