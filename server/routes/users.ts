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
      if (statusFilter === 'PENDING' || statusFilter === 'PENDING_APPROVAL') {
        requests = requests.filter((r: any) => !r.status || r.status.toUpperCase() === 'PENDING' || r.status.toUpperCase() === 'PENDING_APPROVAL' || r.status.toUpperCase() === 'PENDING_VERIFICATION');
      } else {
        requests = requests.filter((r: any) => r.status?.toUpperCase() === statusFilter);
      }
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
    const { effectiveRole, approvedRole, comment } = req.body;
    const db = readServerDB();

    if (!db.accountRequests) db.accountRequests = [];
    const request = db.accountRequests.find((r) => r.id === id);
    if (!request) return res.status(404).json({ error: 'Approval request not found.' });

    const user = db.users.find((u) => u.id === request.userId || u.username.toLowerCase() === request.username.toLowerCase());
    const finalRole = approvedRole || effectiveRole || request.requestedRole || request.memberCategory || 'Teacher';

    const now = new Date().toISOString();
    const operatorId = (req as any).user?.id || 'admin';
    const operatorUsername = (req as any).user?.username || 'Headteacher';

    request.status = 'APPROVED';
    request.effectiveRole = finalRole;
    request.approvedRole = finalRole;
    request.decision = 'APPROVED';
    request.decisionReason = comment || 'Approved by School Administration';
    request.approvedBy = operatorId;
    request.approvedByUsername = operatorUsername;
    request.approvedAt = now;
    request.reviewedAt = now;
    request.reviewedBy = operatorId;
    request.reviewerUsername = operatorUsername;
    request.reviewerComment = comment || 'Approved by School Administration';

    if (user) {
      user.status = 'Active';
      user.approvalStatus = 'APPROVED';
      user.role = finalRole;
      user.approvedRole = finalRole;
      user.approvedBy = operatorId;
      user.approvedAt = now;
      user.approvalComment = comment || 'Approved by School Administration';
      user.updatedAt = now;
    }

    // Role-specific record sync & entity activation
    if (finalRole === 'Student' || request.memberCategory === 'Student') {
      if (!db.students) db.students = [];
      const studentIdNum = request.admissionNumber || request.studentIdOrLin || request.employeeNumber || `LIN-${Date.now().toString().slice(-6)}`;
      let existingStudent = db.students.find((s: any) => s.id === user?.id || s.admissionNumber === studentIdNum || s.studentId === studentIdNum);
      if (!existingStudent) {
        db.students.push({
          id: user?.id || `stu-${Date.now()}`,
          studentId: studentIdNum,
          admissionNumber: studentIdNum,
          schoolId: request.schoolId || db.schoolProfile?.id || 'school-ug-001',
          fullName: request.fullName,
          gender: 'Other',
          classGrade: request.classGrade || 'Senior 1',
          stream: request.stream || 'A',
          residenceType: 'Day',
          status: 'Active',
          dob: request.dateOfBirth || '',
          enrollmentDate: now.split('T')[0],
          createdAt: now,
          updatedAt: now,
        });
      } else {
        existingStudent.status = 'Active';
        if (request.classGrade) existingStudent.classGrade = request.classGrade;
        if (request.stream) existingStudent.stream = request.stream;
      }
    }

    if (finalRole === 'Teacher' || request.memberCategory === 'Teacher') {
      if (!db.staff) db.staff = [];
      const staffEmpNum = request.employeeNumber || `EMP-${Date.now().toString().slice(-4)}`;
      let existingStaff = db.staff.find((st: any) => st.id === user?.id || st.employeeNumber === staffEmpNum);
      if (!existingStaff) {
        db.staff.push({
          id: user?.id || `stf-${Date.now()}`,
          employeeNumber: staffEmpNum,
          schoolId: request.schoolId || db.schoolProfile?.id || 'school-ug-001',
          fullName: request.fullName,
          email: request.email || '',
          phone: request.phone || '',
          role: 'Teacher',
          department: request.department || 'General Academics',
          subjectsTaught: request.subjectsTaught ? (Array.isArray(request.subjectsTaught) ? request.subjectsTaught : [request.subjectsTaught]) : ['General Studies'],
          status: 'Active',
          employmentType: 'Full-Time',
          createdAt: now,
          updatedAt: now,
        });
      } else {
        existingStaff.status = 'Active';
        if (request.department) existingStaff.department = request.department;
        if (request.subjectsTaught) existingStaff.subjectsTaught = Array.isArray(request.subjectsTaught) ? request.subjectsTaught : [request.subjectsTaught];
      }
    }

    if (finalRole === 'Parent' || request.memberCategory === 'Parent') {
      if (!db.guardians) db.guardians = [];
      const childIdentifier = request.childAdmissionNumber || request.childLinOrNin || '';
      let targetStudent = childIdentifier ? db.students?.find((s: any) => s.admissionNumber?.toLowerCase() === childIdentifier.toLowerCase() || s.studentId?.toLowerCase() === childIdentifier.toLowerCase() || s.fullName?.toLowerCase() === request.childName?.toLowerCase()) : null;
      db.guardians.push({
        id: `grd-${Date.now()}`,
        userId: user?.id,
        studentId: targetStudent?.id || 'unlinked',
        fullName: request.fullName,
        relationship: request.relationship || 'Guardian',
        phoneNumber: request.phone || '',
        email: request.email || '',
        isPrimaryContact: true,
        canPickup: true,
        schoolId: request.schoolId || db.schoolProfile?.id || 'school-ug-001',
        createdAt: now,
      });
      if (user && targetStudent) {
        user.linkedChildrenIds = [targetStudent.id];
      }
    }

    // Notify user
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'School Access Approved',
      message: `Your account request for '${finalRole}' has been approved by the Headteacher. You can now access your dashboard.`,
      type: 'success',
      priority: 'high',
      createdAt: now,
      read: false,
    });

    // Audit logs: ROLE_ASSIGNED, ACCOUNT_APPROVED, ACCOUNT_APPROVE
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: now,
      userId: operatorId,
      username: operatorUsername,
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'ROLE_ASSIGNED',
      details: `Assigned role '${finalRole}' to ${request.fullName} (${request.username}) upon school membership approval.`,
    });

    db.auditLogs.unshift({
      id: 'audit-' + (Date.now() + 1),
      timestamp: now,
      userId: operatorId,
      username: operatorUsername,
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'ACCOUNT_APPROVED',
      details: `Approved membership request for ${request.fullName} (${request.username}) with role '${finalRole}'. Decision reason: ${comment || 'Approved by Administration'}`,
    });

    db.auditLogs.unshift({
      id: 'audit-' + (Date.now() + 2),
      timestamp: now,
      userId: operatorId,
      username: operatorUsername,
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'ACCOUNT_APPROVE',
      details: `Approved account request for ${request.fullName} (${request.username}) with role '${finalRole}'`,
    });

    writeServerDB(db);
    res.json({ success: true, request, approvedRole: finalRole, user: user ? { ...user, passwordHash: undefined } : undefined });
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
    const now = new Date().toISOString();
    const operatorId = (req as any).user?.id || 'admin';
    const operatorUsername = (req as any).user?.username || 'Headteacher';

    request.status = 'REJECTED';
    request.decision = 'REJECTED';
    request.decisionReason = rejectionReason;
    request.rejectionReason = rejectionReason;
    request.reviewedAt = now;
    request.reviewedBy = operatorId;
    request.reviewerUsername = operatorUsername;
    request.reviewerComment = comment || rejectionReason;

    if (user) {
      user.status = 'REJECTED';
      user.approvalStatus = 'REJECTED';
      user.rejectionReason = rejectionReason;
      user.updatedAt = now;
    }

    // Audit logs: ACCOUNT_REJECTED and ACCOUNT_REJECT
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: now,
      userId: operatorId,
      username: operatorUsername,
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'ACCOUNT_REJECTED',
      details: `Rejected membership request for ${request.fullName} (${request.username}) - Reason: ${rejectionReason}`,
    });

    db.auditLogs.unshift({
      id: 'audit-' + (Date.now() + 1),
      timestamp: now,
      userId: operatorId,
      username: operatorUsername,
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
