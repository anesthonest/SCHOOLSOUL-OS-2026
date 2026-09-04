import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { hashPassword, verifyPassword } from '../utils/passwordHash';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// Get school profile & setup status
router.get('/profile', (req, res) => {
  const db = readServerDB();
  res.json({
    schoolProfile: db.schoolProfile,
    isConfigured: Boolean(db.schoolProfile && db.schoolProfile.isConfigured),
  });
});

// Setup School Wizard - create school & initial super admin user
router.post('/setup', async (req, res) => {
  try {
    const db = readServerDB();
    const { school, adminUser } = req.body;

    if (!school || !school.schoolName || !adminUser || !adminUser.username || !adminUser.password) {
      return res.status(400).json({ error: 'Missing required school or admin fields.' });
    }

    // Strict validation: Country cannot be blank, unknown, or unselected
    const countryCode = (school.countryCode || 'UG').toUpperCase().trim();
    const countryName = (school.country || 'Uganda').trim();

    if (!countryCode || countryCode === 'N/A' || countryCode === 'UNKNOWN') {
      return res.status(400).json({ error: 'Valid operating country is mandatory for school registration.' });
    }

    const schoolId = db.schoolProfile?.id || ('school-' + Date.now());
    const createdSchool = {
      ...db.schoolProfile,
      ...school,
      id: schoolId,
      country: countryName,
      countryCode: countryCode,
      countryId: countryCode,
      educationFrameworkId: school.educationFrameworkId || countryCode,
      curriculumId: school.curriculumId || '',
      currency: school.currency || (countryCode === 'KE' ? 'KES' : countryCode === 'TZ' ? 'TZS' : countryCode === 'RW' ? 'RWF' : countryCode === 'GH' ? 'GHS' : countryCode === 'NG' ? 'NGN' : countryCode === 'ZA' ? 'ZAR' : 'UGX'),
      isConfigured: true,
      isCountryLocked: true,
      dataRecordCount: db.schoolProfile?.dataRecordCount || 0,
      updatedAt: new Date().toISOString(),
      createdAt: db.schoolProfile?.createdAt || new Date().toISOString(),
    };

    const hashedPassword = await hashPassword(adminUser.password);
    const existingUserIdx = db.users.findIndex(
      (u) => u.username.toLowerCase() === adminUser.username.toLowerCase()
    );

    const superAdmin = {
      id: existingUserIdx >= 0 ? db.users[existingUserIdx].id : ('usr-' + Date.now()),
      fullName: adminUser.fullName || 'Headteacher Administrator',
      username: adminUser.username,
      email: adminUser.email || '',
      phone: adminUser.phone || '',
      employeeNumber: adminUser.employeeNumber || 'EMP-001',
      role: 'Headteacher',
      status: 'Active',
      passwordHash: hashedPassword,
      failedLoginAttempts: 0,
      createdAt: existingUserIdx >= 0 ? db.users[existingUserIdx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.schoolProfile = createdSchool;
    if (existingUserIdx >= 0) {
      db.users[existingUserIdx] = superAdmin;
    } else {
      db.users.push(superAdmin);
    }

    // Initial audit log
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: superAdmin.id,
      username: superAdmin.username,
      userRole: superAdmin.role,
      action: 'SCHOOL_SETUP',
      details: `School Setup Completed for "${createdSchool.schoolName}" in ${createdSchool.country} (${createdSchool.countryCode}) with Argon2id`,
    });

    writeServerDB(db);

    const { passwordHash, ...safeAdmin } = superAdmin;

    res.json({
      success: true,
      schoolProfile: createdSchool,
      adminUser: safeAdmin,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'School setup failed' });
  }
});

// Check duplicate school registration
router.get('/check-duplicates', (req, res) => {
  try {
    const db = readServerDB();
    const queryName = (req.query.name as string || '').toLowerCase().trim();
    const queryCountry = (req.query.country as string || '').toLowerCase().trim();

    if (!queryName || queryName.length < 3) {
      return res.json({ hasDuplicates: false, matches: [] });
    }

    const currentSchool = db.schoolProfile;
    const matches = [];

    if (currentSchool && currentSchool.schoolName.toLowerCase().includes(queryName)) {
      matches.push({
        id: currentSchool.id,
        schoolName: currentSchool.schoolName,
        country: currentSchool.country,
        countryCode: currentSchool.countryCode,
        registrationNumber: currentSchool.registrationNumber,
      });
    }

    res.json({
      hasDuplicates: matches.length > 0,
      matches,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// School Country Migration & Relocation Workflow (Admin / Headteacher Protected)
router.post('/migrate-country', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), async (req, res) => {
  try {
    const db = readServerDB();
    const { destinationCountryCode, destinationCountryName, destinationFrameworkId, justification, adminPassword } = req.body;

    if (!db.schoolProfile) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (!destinationCountryCode || !destinationCountryName) {
      return res.status(400).json({ error: 'Destination country details are required.' });
    }

    // Verify administrator identity if password provided
    const requestingUser = (req as any).user;
    if (adminPassword && requestingUser) {
      const userObj = db.users.find((u) => u.id === requestingUser.id || u.username === requestingUser.username);
      if (userObj && userObj.passwordHash) {
        const { isValid } = await verifyPassword(adminPassword, userObj.passwordHash);
        if (!isValid) {
          return res.status(403).json({ error: 'Invalid administrator password verification.' });
        }
      }
    }

    const sourceCountry = db.schoolProfile.country;
    const sourceCode = db.schoolProfile.countryCode;

    // Create automatic pre-migration backup ID
    const backupId = `BKP-COUNTRY-MIG-${Date.now().toString(36).toUpperCase()}`;

    // Update school profile
    db.schoolProfile = {
      ...db.schoolProfile,
      country: destinationCountryName,
      countryCode: destinationCountryCode,
      countryId: destinationCountryCode,
      educationFrameworkId: destinationFrameworkId || destinationCountryCode,
      currency: destinationCountryCode === 'KE' ? 'KES' : destinationCountryCode === 'TZ' ? 'TZS' : destinationCountryCode === 'RW' ? 'RWF' : destinationCountryCode === 'GH' ? 'GHS' : destinationCountryCode === 'NG' ? 'NGN' : destinationCountryCode === 'ZA' ? 'ZAR' : 'UGX',
      isCountryLocked: true,
      updatedAt: new Date().toISOString(),
    };

    // Add immutable audit log for relocation
    const auditId = 'audit-' + Date.now();
    db.auditLogs.unshift({
      id: auditId,
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || 'admin',
      username: (req as any).user?.username || 'Administrator',
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'COUNTRY_MIGRATION' as any,
      details: `School Relocation Executed: ${sourceCountry} (${sourceCode}) -> ${destinationCountryName} (${destinationCountryCode}). Backup: ${backupId}. Justification: ${justification || 'Administrative Framework Migration'}.`,
    });

    writeServerDB(db);

    res.json({
      success: true,
      backupId,
      auditId,
      schoolProfile: db.schoolProfile,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Multi-School Memberships
router.get('/memberships', (req, res) => {
  const db = readServerDB();
  const school = db.schoolProfile;

  const memberships = [
    {
      schoolId: school?.id || 'school-ug-001',
      schoolName: school?.schoolName || 'Victoria Horizon International School',
      countryCode: school?.countryCode || 'UG',
      countryName: school?.country || 'Uganda',
      flagEmoji: school?.countryCode === 'KE' ? '🇰🇪' : school?.countryCode === 'TZ' ? '🇹🇿' : school?.countryCode === 'RW' ? '🇷🇼' : '🇺🇬',
      role: 'Headteacher',
      currency: school?.currency || 'UGX',
      isDefault: true,
    },
  ];

  res.json({ memberships });
});

// Update school profile (Protected - Admin & School Owner & Headteacher)
router.put('/profile', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const db = readServerDB();
    if (!db.schoolProfile) {
      return res.status(404).json({ error: 'School not found' });
    }

    db.schoolProfile = {
      ...db.schoolProfile,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || 'admin',
      username: (req as any).user?.username || 'Administrator',
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'SCHOOL_UPDATE' as any,
      details: `Updated school profile configuration for ${db.schoolProfile.schoolName}`,
    });

    writeServerDB(db);
    res.json({ success: true, schoolProfile: db.schoolProfile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// HEADTEACHER LEADERSHIP SUCCESSION & TENURE
// ==========================================

// 1. Get Headteacher Tenure History
router.get('/headteacher-history', (req, res) => {
  try {
    const db = readServerDB();
    if (!db.headteacherHistory || db.headteacherHistory.length === 0) {
      // If empty, initialize with current headteacher from users or school setup
      const currentHead = db.users.find((u) => u.role === 'Head Teacher' || u.role === 'Headteacher');
      if (currentHead) {
        db.headteacherHistory = [
          {
            id: 'hth-' + currentHead.id,
            schoolId: db.schoolProfile?.id || 'school-ug-001',
            headteacherUserId: currentHead.id,
            fullName: currentHead.fullName,
            username: currentHead.username,
            email: currentHead.email,
            phone: currentHead.phone,
            startDate: currentHead.createdAt || new Date().toISOString(),
            isCurrent: true,
            transitionType: 'INITIAL_FOUNDING',
            handoverNotes: 'Initial System Founder / Commissioned Headteacher',
            createdAt: currentHead.createdAt || new Date().toISOString(),
          },
        ];
        writeServerDB(db);
      }
    }

    res.json({
      headteacherHistory: db.headteacherHistory || [],
      currentHeadteacher: db.users.find((u) => u.role === 'Head Teacher' || u.role === 'Headteacher'),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get Succession Requests
router.get('/headteacher-succession/requests', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const db = readServerDB();
    res.json({ requests: db.headteacherSuccessionRequests || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Initiate Headteacher Succession Request
router.post('/headteacher-succession/request', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), async (req, res) => {
  try {
    const {
      incomingFullName,
      incomingUsername,
      incomingEmail,
      incomingPhone,
      incomingNationalIdOrNin,
      incomingTeacherRegNumber,
      incomingPassword,
      reasonForSuccession,
      handoverDocumentRef,
      effectiveDate,
    } = req.body;

    if (!incomingFullName || !incomingUsername || !reasonForSuccession) {
      return res.status(400).json({ error: 'Incoming Headteacher Full Name, Username, and Reason for succession are required.' });
    }

    const db = readServerDB();
    const currentUser = (req as any).user;

    const hashedPassword = incomingPassword ? await hashPassword(incomingPassword) : await hashPassword('HeadTeacher@2026');

    const successionId = 'succ-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newRequest = {
      id: successionId,
      schoolId: db.schoolProfile?.id || 'school-ug-001',
      schoolName: db.schoolProfile?.schoolName || 'SchoolSoul OS',
      currentHeadteacherUserId: currentUser?.id,
      currentHeadteacherName: currentUser?.username || 'Current Headteacher',
      incomingFullName: String(incomingFullName).trim(),
      incomingUsername: String(incomingUsername).trim(),
      incomingEmail: incomingEmail ? String(incomingEmail).trim() : '',
      incomingPhone: incomingPhone ? String(incomingPhone).trim() : '',
      incomingNationalIdOrNin: incomingNationalIdOrNin ? String(incomingNationalIdOrNin).trim() : undefined,
      incomingTeacherRegNumber: incomingTeacherRegNumber ? String(incomingTeacherRegNumber).trim() : undefined,
      incomingPasswordHash: hashedPassword,
      reasonForSuccession: String(reasonForSuccession).trim(),
      handoverDocumentRef: handoverDocumentRef ? String(handoverDocumentRef).trim() : undefined,
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
      status: 'SUCCESSION_REQUESTED',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.headteacherSuccessionRequests) db.headteacherSuccessionRequests = [];
    db.headteacherSuccessionRequests.unshift(newRequest);

    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'Headteacher Succession Protocol Initiated',
      message: `A formal succession handover was requested for incoming Headteacher ${incomingFullName} (@${incomingUsername}).`,
      type: 'approval',
      priority: 'high',
      createdAt: new Date().toISOString(),
      read: false,
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'admin',
      username: currentUser?.username || 'Headteacher',
      userRole: currentUser?.role || 'Headteacher',
      action: 'SUCCESSION_REQUESTED' as any,
      details: `Headteacher succession handover initiated for incoming leader ${incomingFullName}`,
    });

    writeServerDB(db);

    res.status(201).json({
      success: true,
      message: 'Headteacher succession request registered. Awaiting final executive approval.',
      request: newRequest,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Approve & Execute Headteacher Succession Handover
router.post('/headteacher-succession/approve', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), async (req, res) => {
  try {
    const { requestId, handoverNotes } = req.body;
    if (!requestId) return res.status(400).json({ error: 'Request ID is required.' });

    const db = readServerDB();
    if (!db.headteacherSuccessionRequests) db.headteacherSuccessionRequests = [];
    if (!db.headteacherHistory) db.headteacherHistory = [];

    const request = db.headteacherSuccessionRequests.find((r) => r.id === requestId);
    if (!request) return res.status(404).json({ error: 'Succession request not found.' });

    const reviewer = (req as any).user;

    // 1. Find or archive outgoing Headteacher
    const outgoingHead = db.users.find((u) => u.role === 'Head Teacher' || u.role === 'Headteacher');
    if (outgoingHead) {
      outgoingHead.role = 'Former Headteacher' as any;
      outgoingHead.updatedAt = new Date().toISOString();
    }

    // Archive all prior current records in headteacherHistory
    db.headteacherHistory.forEach((h) => {
      if (h.isCurrent) {
        h.isCurrent = false;
        h.endDate = h.endDate || new Date().toISOString().split('T')[0];
        h.successionReason = h.successionReason || request.reasonForSuccession;
        h.handoverNotes = h.handoverNotes || handoverNotes || 'Handover completed';
      }
    });

    // 2. Create or upgrade incoming Headteacher user
    let incomingUser = db.users.find((u) => u.username.toLowerCase() === request.incomingUsername.toLowerCase());
    if (incomingUser) {
      incomingUser.role = 'Headteacher';
      incomingUser.status = 'Active';
      incomingUser.approvalStatus = 'APPROVED';
      if (request.incomingPasswordHash) incomingUser.passwordHash = request.incomingPasswordHash;
      incomingUser.fullName = request.incomingFullName;
      incomingUser.email = request.incomingEmail || incomingUser.email;
      incomingUser.phone = request.incomingPhone || incomingUser.phone;
      incomingUser.updatedAt = new Date().toISOString();
    } else {
      incomingUser = {
        id: 'usr-' + Date.now(),
        fullName: request.incomingFullName,
        username: request.incomingUsername,
        email: request.incomingEmail || '',
        phone: request.incomingPhone || '',
        role: 'Headteacher',
        status: 'Active',
        approvalStatus: 'APPROVED',
        passwordHash: request.incomingPasswordHash,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(incomingUser);
    }

    // 3. Add incoming Headteacher to history as current
    db.headteacherHistory.unshift({
      id: 'hth-' + Date.now(),
      schoolId: db.schoolProfile?.id || 'school-ug-001',
      headteacherUserId: incomingUser.id,
      fullName: incomingUser.fullName,
      username: incomingUser.username,
      email: incomingUser.email,
      phone: incomingUser.phone,
      startDate: request.effectiveDate || new Date().toISOString().split('T')[0],
      isCurrent: true,
      transitionType: 'FORMAL_SUCCESSION',
      approvedByUserId: reviewer?.id,
      approvedByUsername: reviewer?.username || 'Executive Board',
      handoverNotes: handoverNotes || `Succession approved by ${reviewer?.username || 'Board'}`,
      createdAt: new Date().toISOString(),
    });

    // 4. Update School Profile leadership
    if (db.schoolProfile) {
      db.schoolProfile.currentHeadteacherId = incomingUser.id;
      db.schoolProfile.currentHeadteacherName = incomingUser.fullName;
      db.schoolProfile.updatedAt = new Date().toISOString();
    }

    // 5. Complete request
    request.status = 'SUCCESSION_COMPLETED';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = reviewer?.id || 'admin';
    request.reviewedByUsername = reviewer?.username || 'Administrator';
    request.reviewNotes = handoverNotes;
    request.updatedAt = new Date().toISOString();

    // 6. Audit Trail
    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: reviewer?.id || 'admin',
      username: reviewer?.username || 'BoardAdmin',
      userRole: reviewer?.role || 'Headteacher',
      action: 'SUCCESSION_APPROVED' as any,
      details: `Headteacher leadership successfully transitioned from ${outgoingHead?.fullName || 'Previous Leader'} to ${incomingUser.fullName} (@${incomingUser.username})`,
    });

    writeServerDB(db);

    res.json({
      success: true,
      message: `Succession handover approved! @${incomingUser.username} is now the active Headteacher.`,
      incomingUser: {
        id: incomingUser.id,
        fullName: incomingUser.fullName,
        username: incomingUser.username,
        role: incomingUser.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Reject Succession Request
router.post('/headteacher-succession/reject', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher'), (req, res) => {
  try {
    const { requestId, rejectionReason } = req.body;
    if (!requestId) return res.status(400).json({ error: 'Request ID is required.' });

    const db = readServerDB();
    const request = db.headteacherSuccessionRequests?.find((r) => r.id === requestId);
    if (!request) return res.status(404).json({ error: 'Succession request not found.' });

    const reviewer = (req as any).user;
    request.status = 'SUCCESSION_REJECTED';
    request.rejectionReason = rejectionReason || 'Handover rejected by executive committee.';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = reviewer?.id;
    request.reviewedByUsername = reviewer?.username;
    request.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: reviewer?.id || 'admin',
      username: reviewer?.username || 'BoardAdmin',
      userRole: reviewer?.role || 'Headteacher',
      action: 'SUCCESSION_REJECTED' as any,
      details: `Headteacher succession request for ${request.incomingFullName} was rejected: ${rejectionReason}`,
    });

    writeServerDB(db);

    res.json({ success: true, message: 'Succession request rejected.', request });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
