import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { readServerDB, writeServerDB } from '../db/store';
import { JWT_SECRET, REFRESH_SECRET, rateLimiter, requireAuth, requireRoles } from '../middleware/authMiddleware';
import { hashPassword, verifyPassword } from '../utils/passwordHash';

const router = Router();

// Login Route with lockout protection, rate limiting, and Argon2id verification with auto-upgrade
router.post('/login', rateLimiter(15, 60000), async (req, res) => {
  try {
    const { usernameOrEmail, password, rememberMe } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required.' });
    }

    const db = readServerDB();
    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === String(usernameOrEmail).trim().toLowerCase() ||
        (u.email && u.email.toLowerCase() === String(usernameOrEmail).trim().toLowerCase())
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check account status and approval state
    if (user.status === 'PENDING_APPROVAL' || user.status === 'Pending Approval') {
      return res.status(403).json({
        error: 'Your school access is pending approval by the Headteacher.',
        status: 'PENDING_APPROVAL',
        requestedRole: user.requestedRole || user.role,
      });
    }
    if (user.status === 'PENDING_VERIFICATION' || user.status === 'Pending Verification') {
      return res.status(403).json({
        error: 'Your account is pending identity verification.',
        status: 'PENDING_VERIFICATION',
      });
    }
    if (user.status === 'REJECTED' || user.status === 'Rejected') {
      return res.status(403).json({
        error: `Your account request was rejected${user.rejectionReason ? ': ' + user.rejectionReason : '. Please contact school administration.'}`,
        status: 'REJECTED',
        rejectionReason: user.rejectionReason,
      });
    }
    if (user.status === 'REVOKED' || user.status === 'Revoked') {
      return res.status(403).json({
        error: 'Your school access has been revoked by administration.',
        status: 'REVOKED',
      });
    }
    if (user.status === 'Suspended' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: 'Your account has been suspended. Please contact the Headteacher or ICT Administrator.',
        status: 'SUSPENDED',
      });
    }
    if (user.status === 'Inactive') {
      return res.status(403).json({
        error: 'Account is inactive. Please contact school administration.',
        status: 'INACTIVE',
      });
    }

    // Check account lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 60000);
      return res.status(429).json({
        error: `Account is locked due to repeated failed login attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    // Verify Password using Argon2id with automatic backward-compatible bcrypt detection
    const { isValid, needsRehash } = await verifyPassword(password, user.passwordHash || '');
    if (!isValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutMsg = '';
      if (user.failedLoginAttempts >= 5) {
        const lockoutTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        user.lockoutUntil = lockoutTime;
        lockoutMsg = ' Account has been locked for 15 minutes due to 5 failed attempts.';
      }

      db.auditLogs.unshift({
        id: 'audit-' + Date.now(),
        timestamp: new Date().toISOString(),
        userId: user.id,
        username: user.username,
        userRole: user.role,
        action: 'LOGIN_FAILED',
        details: `Failed login attempt (${user.failedLoginAttempts}/5).${lockoutMsg}`,
      });

      writeServerDB(db);
      return res.status(401).json({
        error: `Invalid credentials.${lockoutMsg}`,
        failedAttempts: user.failedLoginAttempts,
      });
    }

    // If password was verified using legacy bcrypt or needs upgrade, seamlessly migrate hash to Argon2id
    if (needsRehash) {
      user.passwordHash = await hashPassword(password);
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.lastLoginAt = new Date().toISOString();

    // Determine school tenant ID (if available)
    const schoolId = user.schoolId || db.schoolProfile?.schoolCode || 'school-001';

    // Generate JWT and Refresh Token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      schoolId: schoolId,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: rememberMe ? '30d' : '12h' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });

    // Log success in audit
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.username,
      userRole: user.role,
      action: 'LOGIN_SUCCESS',
      details: `User logged in successfully (${user.role}) - Argon2id verified`,
    });

    writeServerDB(db);

    const { passwordHash, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      token,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Refresh token route
router.post('/refresh-token', rateLimiter(30, 60000), (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  jwt.verify(refreshToken, REFRESH_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired refresh token' });
    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role, schoolId: decoded.schoolId },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token: newToken });
  });
});

// Change Password Route
router.post('/change-password', rateLimiter(10, 60000), requireAuth, async (req: any, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'User ID, current password, and new password are required.' });
    }
    // Authorization check: users can only change their own password unless Super Admin
    if (req.user?.id && req.user.id !== userId && req.user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access denied: cannot change password of another user.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const db = readServerDB();
    const user = db.users.find((u) => u.id === userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { isValid } = await verifyPassword(currentPassword, user.passwordHash || '');
    if (!isValid) return res.status(400).json({ error: 'Current password is incorrect' });

    // Hash with modern Argon2id
    user.passwordHash = await hashPassword(newPassword);
    user.passwordChangedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.username,
      userRole: user.role,
      action: 'PASSWORD_CHANGE',
      details: 'User updated their password using Argon2id hashing',
    });

    writeServerDB(db);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Password Reset Route
router.post('/reset-password', rateLimiter(10, 60000), requireAuth, requireRoles('Super Admin', 'Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Principal'), async (req: any, res) => {
  try {
    const { targetUserId, newPassword, adminUserId } = req.body;
    if (!targetUserId || !newPassword) {
      return res.status(400).json({ error: 'Target user ID and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const db = readServerDB();
    const user = db.users.find((u) => u.id === targetUserId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Tenant Isolation Check: Admin cannot reset password for a user from another school
    const operatorSchoolId = req.user?.schoolId;
    const operatorRole = req.user?.role;
    if (operatorSchoolId && operatorRole !== 'Super Admin' && user.schoolId && user.schoolId !== operatorSchoolId) {
      return res.status(403).json({ error: 'Access denied: cannot reset password for a user in another school.' });
    }

    // Hash with Argon2id
    user.passwordHash = await hashPassword(newPassword);
    user.passwordChangedAt = new Date().toISOString();
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: adminUserId || req.user?.id || 'system',
      username: req.user?.username || adminUserId || 'Admin',
      userRole: req.user?.role || 'Administrator',
      action: 'PASSWORD_CHANGE',
      details: `Password reset by administrator for user ${user.username} with Argon2id`,
    });

    writeServerDB(db);
    res.json({ success: true, message: `Password for ${user.username} reset successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Self-Registration / School Account Request Route (Layer A Identity + Layer B Authorization Request)
router.post('/register-request', rateLimiter(20, 60000), async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      phone,
      password,
      requestedRole,
      schoolId,
      nationalIdOrNin,
      studentIdOrLin,
      childLinOrNin,
      tinNumber,
      nssfNumber,
      department,
    } = req.body;

    if (!fullName || !username || !password || !requestedRole) {
      return res.status(400).json({ error: 'Full name, username, password, and requested role are required.' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const db = readServerDB();

    // Check username uniqueness
    const normalizedUsername = String(username).trim().toLowerCase();
    if (db.users.some((u) => u.username.toLowerCase() === normalizedUsername)) {
      return res.status(400).json({ error: 'Username is already registered. Please sign in or use another username.' });
    }

    const currentSchool = db.schoolProfile;
    const targetSchoolId = schoolId || currentSchool?.id || currentSchool?.schoolCode || 'school-001';
    const targetSchoolName = currentSchool?.schoolName || 'SchoolSoul Academy';

    // Student specific LIN validation if provided
    let matchedStudentId = '';
    let matchedStudentName = '';
    if (requestedRole === 'Student' && studentIdOrLin) {
      const trimmedLin = String(studentIdOrLin).trim().toLowerCase();
      const matched = db.students?.find(
        (s) =>
          (s.learnerIdentificationNumber && s.learnerIdentificationNumber.toLowerCase() === trimmedLin) ||
          (s.lin && s.lin.toLowerCase() === trimmedLin) ||
          (s.studentId && s.studentId.toLowerCase() === trimmedLin) ||
          (s.admissionNumber && s.admissionNumber.toLowerCase() === trimmedLin)
      );
      if (matched) {
        matchedStudentId = matched.id;
        matchedStudentName = matched.fullName;
      }
    }

    // Parent specific Child LIN validation if provided
    let linkedChildrenIds: string[] = [];
    if (requestedRole === 'Parent' && childLinOrNin) {
      const trimmedChildId = String(childLinOrNin).trim().toLowerCase();
      const matched = db.students?.find(
        (s) =>
          (s.learnerIdentificationNumber && s.learnerIdentificationNumber.toLowerCase() === trimmedChildId) ||
          (s.lin && s.lin.toLowerCase() === trimmedChildId) ||
          (s.nationalIdOrBirthCert && s.nationalIdOrBirthCert.toLowerCase() === trimmedChildId) ||
          (s.admissionNumber && s.admissionNumber.toLowerCase() === trimmedChildId)
      );
      if (matched) {
        linkedChildrenIds = [matched.id];
      }
    }

    const hashedPassword = await hashPassword(password);
    const userId = 'usr-' + Date.now();
    const requestId = 'req-' + Date.now();

    const newUser = {
      id: userId,
      fullName: String(fullName).trim(),
      username: String(username).trim(),
      email: email ? String(email).trim() : '',
      phone: phone ? String(phone).trim() : '',
      employeeNumber: requestedRole === 'Student' || requestedRole === 'Parent' ? '' : `EMP-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      role: requestedRole,
      requestedRole: requestedRole,
      status: 'PENDING_APPROVAL',
      approvalStatus: 'PENDING_APPROVAL',
      verificationStatus: 'VERIFIED',
      schoolId: targetSchoolId,
      matchedStudentId: matchedStudentId || undefined,
      linkedChildrenIds: linkedChildrenIds.length > 0 ? linkedChildrenIds : undefined,
      tinNumber: tinNumber ? String(tinNumber).trim() : undefined,
      nssfNumber: nssfNumber ? String(nssfNumber).trim() : undefined,
      passwordHash: hashedPassword,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newRequest = {
      id: requestId,
      userId: userId,
      fullName: String(fullName).trim(),
      username: String(username).trim(),
      email: email ? String(email).trim() : '',
      phone: phone ? String(phone).trim() : '',
      requestedRole: requestedRole,
      schoolId: targetSchoolId,
      schoolName: targetSchoolName,
      status: 'PENDING_APPROVAL',
      verificationStatus: 'VERIFIED',
      nationalIdOrNin: nationalIdOrNin ? String(nationalIdOrNin).trim() : undefined,
      studentIdOrLin: studentIdOrLin ? String(studentIdOrLin).trim() : undefined,
      matchedStudentId: matchedStudentId || undefined,
      matchedStudentName: matchedStudentName || undefined,
      childLinOrNin: childLinOrNin ? String(childLinOrNin).trim() : undefined,
      tinNumber: tinNumber ? String(tinNumber).trim() : undefined,
      nssfNumber: nssfNumber ? String(nssfNumber).trim() : undefined,
      department: department ? String(department).trim() : undefined,
      requestedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    if (!db.accountRequests) db.accountRequests = [];
    db.accountRequests.unshift(newRequest);

    // Notify Headteacher & School Admins
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'New Account Approval Request',
      message: `${fullName} has requested a '${requestedRole}' account for ${targetSchoolName}.`,
      type: 'approval',
      priority: 'high',
      createdAt: new Date().toISOString(),
      read: false,
    });

    // Audit Trail
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: userId,
      username: newUser.username,
      userRole: requestedRole,
      action: 'ACCOUNT_REQUEST_SUBMIT',
      details: `Submitted account request for role ${requestedRole} at school ${targetSchoolId}`,
    });

    writeServerDB(db);

    res.status(201).json({
      success: true,
      message: 'Your account has been created and your school access request has been submitted for Headteacher approval.',
      requestId: requestId,
      userId: userId,
      status: 'PENDING_APPROVAL',
      requestedRole: requestedRole,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Account request submission failed.' });
  }
});

// Check account approval status
router.get('/check-status/:identifier', rateLimiter(30, 60000), (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) return res.status(400).json({ error: 'Username or email required.' });

    const db = readServerDB();
    const cleanId = String(identifier).trim().toLowerCase();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === cleanId || (u.email && u.email.toLowerCase() === cleanId)
    );

    if (!user) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    res.json({
      username: user.username,
      fullName: user.fullName,
      status: user.status,
      approvalStatus: user.approvalStatus || (user.status === 'Active' ? 'APPROVED' : user.status),
      requestedRole: user.requestedRole || user.role,
      role: user.role,
      schoolId: user.schoolId,
      rejectionReason: user.rejectionReason,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ACCOUNT RECOVERY & SELF-SERVICE PASSWORD RESET
// ==========================================

// 1. Submit Recovery Request / Generate OTP
router.post('/recovery/request', rateLimiter(15, 60000), async (req, res) => {
  try {
    const {
      identifier,
      recoveryType = 'FORGOT_PASSWORD',
      contactProvided,
      nationalIdOrNin,
      studentIdOrLin,
      recoveryNotes,
      newEmail,
      newPhone,
      schoolId,
    } = req.body;

    if (!identifier && !nationalIdOrNin && !studentIdOrLin) {
      return res.status(400).json({ error: 'Please provide your Username, Registered Email, Phone, NIN, or Student LIN.' });
    }

    const db = readServerDB();
    const cleanId = identifier ? String(identifier).trim().toLowerCase() : '';
    const cleanNin = nationalIdOrNin ? String(nationalIdOrNin).trim().toLowerCase() : '';
    const cleanLin = studentIdOrLin ? String(studentIdOrLin).trim().toLowerCase() : '';

    // Search for user match with optional tenant scoping
    const user = db.users.find((u) => {
      if (schoolId && u.schoolId && u.schoolId !== schoolId) {
        return false;
      }
      if (cleanId && (u.username.toLowerCase() === cleanId || (u.email && u.email.toLowerCase() === cleanId) || (u.phone && u.phone.includes(cleanId)))) {
        return true;
      }
      if (cleanNin && (u.nationalIdOrNin && u.nationalIdOrNin.toLowerCase() === cleanNin)) {
        return true;
      }
      if (cleanLin && (u.studentIdOrLin && u.studentIdOrLin.toLowerCase() === cleanLin)) {
        return true;
      }
      return false;
    });

    if (!user && recoveryType !== 'LOST_BOTH_CONTACTS' && recoveryType !== 'HEADTEACHER_RECOVERY') {
      return res.status(404).json({ error: 'No user account found matching the provided identifier in this school.' });
    }

    const isPrivilegedUser = user && (user.role === 'Headteacher' || user.role === 'Head Teacher' || user.role === 'Administrator' || user.role === 'School Owner');
    const isEscalation = recoveryType === 'LOST_BOTH_CONTACTS' || recoveryType === 'HEADTEACHER_RECOVERY';

    // If privileged user has no registered contact on file, force escalation workflow
    if (isPrivilegedUser && !isEscalation && !user?.email && !user?.phone) {
      return res.status(400).json({
        error: 'Privileged administrative accounts without a registered security contact must submit an institutional recovery escalation.',
        requiresEscalation: true,
      });
    }

    const requestId = 'rec-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    // Cryptographically secure 6-digit OTP
    const generatedOtp = crypto.randomInt(100000, 1000000).toString();

    // Mask phone or email for privacy display
    let maskedContact = 'Registered Security Contact';
    if (user?.email) {
      const parts = user.email.split('@');
      maskedContact = parts[0].slice(0, 2) + '***@' + (parts[1] || '');
    } else if (user?.phone) {
      maskedContact = user.phone.slice(0, 4) + '***' + user.phone.slice(-3);
    }

    const recoveryRecord = {
      id: requestId,
      recoveryType,
      targetUserId: user?.id,
      identifier: identifier || nationalIdOrNin || studentIdOrLin || 'Unknown',
      fullName: user?.fullName || req.body.fullName || 'School Member',
      schoolId: user?.schoolId || schoolId || db.schoolProfile?.id || 'school-ug-001',
      schoolName: db.schoolProfile?.schoolName || 'SchoolSoul OS',
      userRole: user?.role || 'Staff/Student',
      contactProvided: contactProvided || (user ? (user.email || user.phone) : ''),
      newEmail: newEmail ? String(newEmail).trim() : undefined,
      newPhone: newPhone ? String(newPhone).trim() : undefined,
      nationalIdOrNin: nationalIdOrNin ? String(nationalIdOrNin).trim() : user?.nationalIdOrNin,
      studentIdOrLin: studentIdOrLin ? String(studentIdOrLin).trim() : user?.studentIdOrLin,
      recoveryNotes: recoveryNotes ? String(recoveryNotes).trim() : undefined,
      otpCodeHash: generatedOtp,
      otpExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      otpAttempts: 0,
      status: isEscalation ? 'HEADTEACHER_RECOVERY_PENDING' : 'PENDING_VERIFICATION',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.accountRecoveryRequests) db.accountRecoveryRequests = [];
    db.accountRecoveryRequests.unshift(recoveryRecord);

    if (isEscalation) {
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: 'notif-' + Date.now(),
        title: 'Emergency Account Recovery Request',
        message: `${recoveryRecord.fullName} (${user?.username || identifier}) lost contact credentials and requested Headteacher recovery review.`,
        type: 'approval',
        priority: 'high',
        createdAt: new Date().toISOString(),
        read: false,
      });
    } else if (isPrivilegedUser) {
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: 'notif-' + Date.now(),
        title: 'Security Alert: Privileged Account Password Reset Initiated',
        message: `A password reset OTP was dispatched for privileged account @${user?.username} (${user?.role}).`,
        type: 'system',
        priority: 'high',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // Audit Log
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      username: user?.username || identifier || 'Guest',
      userRole: user?.role || 'Anonymous',
      action: (isPrivilegedUser ? 'PRIVILEGED_RECOVERY_INITIATED' : 'RECOVERY_REQUESTED') as any,
      details: `Account recovery requested for ${identifier} (${recoveryType})`,
    });

    writeServerDB(db);

    res.status(201).json({
      success: true,
      requestId: requestId,
      recoveryType,
      status: recoveryRecord.status,
      maskedContact,
      simulatedOtp: generatedOtp, // Provided for instant sandbox testing / preview
      message: isEscalation
        ? 'Your recovery escalation has been submitted to the Headteacher & ICT Admin for identity verification.'
        : `A 6-digit verification code has been dispatched to ${maskedContact}. Code expires in 15 minutes.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Account recovery initiation failed.' });
  }
});

// 2. Verify Recovery OTP Code
router.post('/recovery/verify-otp', rateLimiter(20, 60000), (req, res) => {
  try {
    const { requestId, otpCode } = req.body;
    if (!requestId || !otpCode) {
      return res.status(400).json({ error: 'Request ID and 6-digit OTP code are required.' });
    }

    const db = readServerDB();
    if (!db.accountRecoveryRequests) db.accountRecoveryRequests = [];

    const request = db.accountRecoveryRequests.find((r) => r.id === requestId);
    if (!request) {
      return res.status(404).json({ error: 'Recovery session not found or expired.' });
    }

    if (request.status === 'COMPLETED') {
      return res.status(400).json({ error: 'This recovery request has already been used and completed.' });
    }

    if (request.status !== 'PENDING_VERIFICATION' && request.status !== 'PENDING_OTP_VERIFICATION') {
      return res.status(400).json({ error: 'This recovery session is no longer awaiting OTP verification.' });
    }

    if (new Date() > new Date(request.otpExpiry)) {
      request.status = 'EXPIRED';
      writeServerDB(db);
      return res.status(400).json({ error: 'The 6-digit verification code has expired. Please request a new code.' });
    }

    request.otpAttempts = (request.otpAttempts || 0) + 1;
    if (request.otpAttempts > 5) {
      request.status = 'REJECTED';
      writeServerDB(db);
      return res.status(403).json({ error: 'Too many incorrect attempts. Recovery session terminated for security.' });
    }

    if (String(request.otpCodeHash).trim() !== String(otpCode).trim()) {
      writeServerDB(db);
      return res.status(400).json({ error: `Invalid verification code. ${5 - request.otpAttempts} attempts remaining.` });
    }

    // OTP is valid! Generate cryptographically secure one-time reset token and invalidate the OTP code
    const resetToken = 'rst-' + Date.now() + '-' + crypto.randomBytes(32).toString('hex');
    request.status = 'VERIFIED';
    request.otpCodeHash = undefined; // Invalidate OTP to prevent replay
    request.resetTokenHash = resetToken;
    request.resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    request.updatedAt = new Date().toISOString();

    writeServerDB(db);

    res.json({
      success: true,
      verified: true,
      requestId,
      resetToken,
      message: 'Code verified successfully. You may now set a new password.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Complete Password Reset
router.post('/recovery/complete-reset', rateLimiter(10, 60000), async (req, res) => {
  try {
    const { requestId, resetToken, newPassword } = req.body;
    if (!requestId || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Request ID, reset token, and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    // Check password strength: requires letters and numbers/symbols
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbersOrSymbols = /[\d\W]/.test(newPassword);
    if (!hasLetters || !hasNumbersOrSymbols) {
      return res.status(400).json({ error: 'Password must contain a mix of letters and numbers/symbols.' });
    }

    const db = readServerDB();
    if (!db.accountRecoveryRequests) db.accountRecoveryRequests = [];

    const request = db.accountRecoveryRequests.find((r) => r.id === requestId);
    if (!request || request.status !== 'VERIFIED' || request.resetTokenHash !== resetToken) {
      return res.status(403).json({ error: 'Invalid, unverified, or already used reset token.' });
    }

    if (new Date() > new Date(request.resetTokenExpiry || '')) {
      return res.status(403).json({ error: 'Reset token has expired. Please initiate recovery again.' });
    }

    const user = db.users.find((u) => u.id === request.targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'Associated user account no longer exists.' });
    }

    // Update password hash with Argon2id
    user.passwordHash = await hashPassword(newPassword);
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.passwordChangedAt = new Date().toISOString(); // Invalidate all prior JWT sessions
    user.updatedAt = new Date().toISOString();

    // Mark request completed and destroy the reset token to prevent reuse
    request.status = 'COMPLETED';
    request.resetTokenHash = undefined;
    request.resolutionAction = 'PASSWORD_RESET';
    request.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.username,
      userRole: user.role,
      action: 'PASSWORD_RESET_SELF' as any,
      details: `User @${user.username} completed self-service password reset via OTP verification`,
    });

    writeServerDB(db);

    res.json({
      success: true,
      message: `Password for @${user.username} has been updated successfully. You can now sign in with your new password.`,
      username: user.username,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get Account Recovery Requests (Headteacher / Admin)
router.get('/recovery/requests', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const db = readServerDB();
    const currentUser = (req as any).user;
    let requests = db.accountRecoveryRequests || [];
    // Tenant isolation
    if (currentUser?.schoolId) {
      requests = requests.filter((r) => !r.schoolId || r.schoolId === currentUser.schoolId);
    }
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Headteacher/Admin Resolve Recovery Escalation
router.post('/recovery/resolve', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), async (req, res) => {
  try {
    const { requestId, action, newTemporaryPassword, newEmail, newPhone, reviewerNotes } = req.body;
    if (!requestId || !action) {
      return res.status(400).json({ error: 'Request ID and resolution action are required.' });
    }

    const db = readServerDB();
    if (!db.accountRecoveryRequests) db.accountRecoveryRequests = [];

    const request = db.accountRecoveryRequests.find((r) => r.id === requestId);
    if (!request) {
      return res.status(404).json({ error: 'Recovery request not found.' });
    }

    const reviewer = (req as any).user;
    const targetUser = db.users.find((u) => u.id === request.targetUserId);

    // Tenant Isolation Check
    if (reviewer?.schoolId && request.schoolId && reviewer.schoolId !== request.schoolId) {
      return res.status(403).json({ error: 'Cross-tenant security violation: You cannot resolve requests from another school.' });
    }

    // Privilege Escalation Protection:
    // Only a School Owner or Headteacher can override or reset another Headteacher/School Owner account.
    if (targetUser && (targetUser.role === 'Headteacher' || targetUser.role === 'Head Teacher' || targetUser.role === 'School Owner')) {
      const reviewerRole = reviewer?.role?.toLowerCase() || '';
      if (reviewerRole !== 'school owner' && reviewerRole !== 'headteacher' && reviewerRole !== 'head teacher') {
        return res.status(403).json({
          error: 'Privilege restriction: Only the School Owner or authorized Headteacher can resolve recovery for institutional executive accounts.',
        });
      }
    }

    if (action === 'APPROVE_RESET') {
      const tempPass = newTemporaryPassword || ('TempPass' + crypto.randomInt(1000, 9999) + '!');
      if (targetUser) {
        targetUser.passwordHash = await hashPassword(tempPass);
        targetUser.failedLoginAttempts = 0;
        targetUser.lockoutUntil = undefined;
        targetUser.passwordChangedAt = new Date().toISOString(); // Invalidate all prior sessions
        targetUser.updatedAt = new Date().toISOString();
      }
      request.status = 'COMPLETED';
      request.resolutionAction = 'PASSWORD_RESET';
      request.reviewerNotes = reviewerNotes || `Admin approved reset. Temporary credentials assigned.`;
      request.reviewedBy = reviewer?.id || 'admin';
      request.reviewerUsername = reviewer?.username || 'Headteacher';
      request.reviewedAt = new Date().toISOString();
      request.updatedAt = new Date().toISOString();

      db.auditLogs.unshift({
        id: 'audit-' + Date.now(),
        timestamp: new Date().toISOString(),
        userId: reviewer?.id || 'admin',
        username: reviewer?.username || 'Headteacher',
        userRole: reviewer?.role || 'Headteacher',
        action: 'PASSWORD_RESET_OVERRIDE' as any,
        details: `Administrator @${reviewer?.username} approved password recovery for user ${request.fullName} (@${request.identifier})`,
      });

      writeServerDB(db);
      return res.json({
        success: true,
        message: `Recovery approved. Temporary password set to: ${tempPass}`,
        temporaryPassword: tempPass,
        request,
      });
    } else if (action === 'UPDATE_CONTACTS') {
      const oldEmail = targetUser?.email || 'None';
      const oldPhone = targetUser?.phone || 'None';
      if (targetUser) {
        if (newEmail || request.newEmail) targetUser.email = (newEmail || request.newEmail).trim();
        if (newPhone || request.newPhone) targetUser.phone = (newPhone || request.newPhone).trim();
        targetUser.updatedAt = new Date().toISOString();
      }
      request.status = 'COMPLETED';
      request.resolutionAction = 'CONTACT_UPDATED';
      request.reviewerNotes = reviewerNotes || `Contacts updated. User can now self-reset via OTP.`;
      request.reviewedBy = reviewer?.id || 'admin';
      request.reviewerUsername = reviewer?.username || 'Headteacher';
      request.reviewedAt = new Date().toISOString();
      request.updatedAt = new Date().toISOString();

      db.auditLogs.unshift({
        id: 'audit-' + Date.now(),
        timestamp: new Date().toISOString(),
        userId: reviewer?.id || 'admin',
        username: reviewer?.username || 'Headteacher',
        userRole: reviewer?.role || 'Headteacher',
        action: 'CONTACT_OVERRIDE' as any,
        details: `Administrator @${reviewer?.username} updated contact details for user ${request.fullName} (Email: ${oldEmail} -> ${targetUser?.email}, Phone: ${oldPhone} -> ${targetUser?.phone})`,
      });

      writeServerDB(db);
      return res.json({
        success: true,
        message: `Contact information updated. User can now receive reset OTP codes.`,
        request,
      });
    } else if (action === 'REJECT') {
      request.status = 'REJECTED';
      request.reviewerNotes = reviewerNotes || 'Recovery request rejected during identity verification.';
      request.reviewedBy = reviewer?.id || 'admin';
      request.reviewerUsername = reviewer?.username || 'Headteacher';
      request.reviewedAt = new Date().toISOString();
      request.updatedAt = new Date().toISOString();

      db.auditLogs.unshift({
        id: 'audit-' + Date.now(),
        timestamp: new Date().toISOString(),
        userId: reviewer?.id || 'admin',
        username: reviewer?.username || 'Headteacher',
        userRole: reviewer?.role || 'Headteacher',
        action: 'RECOVERY_REJECTED' as any,
        details: `Administrator @${reviewer?.username} rejected account recovery for user ${request.fullName}: ${request.reviewerNotes}`,
      });

      writeServerDB(db);
      return res.json({
        success: true,
        message: 'Recovery request rejected.',
        request,
      });
    }

    return res.status(400).json({ error: 'Unsupported resolution action.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
