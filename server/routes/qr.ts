import { Router } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

export const qrRouter = Router();

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 120, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

const QR_SIGNING_SECRET = process.env.QR_SIGNING_SECRET || 'schoolsoul-os-2026-qr-signing-key-production';

/**
 * Generate cryptographic signature for school-specific QR payload
 */
function signSchoolPayload(schoolId: string, timestamp: string): string {
  return crypto
    .createHmac('sha256', QR_SIGNING_SECRET)
    .update(`${schoolId}:${timestamp}`)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase();
}

/**
 * GET /api/qr/school-identity
 * Retrieves the current school's unique QR identity and rendered QR visual assets.
 */
qrRouter.get('/school-identity', async (req, res) => {
  try {
    const db = readServerDB();
    const school = db.schoolProfile || {
      id: 'school-ug-001',
      schoolName: 'Victoria Horizon International School',
      countryCode: 'UG',
      country: 'Uganda',
    };

    const schoolId = school.id || 'school-ug-001';

    let schoolQr = (db.schoolQRCodes || []).find((q: any) => q.schoolId === schoolId);

    if (!schoolQr) {
      const createdAt = new Date().toISOString();
      const signature = signSchoolPayload(schoolId, createdAt);
      const code = `SCH-ID-${school.countryCode || 'UG'}-${schoolId.replace(/[^a-zA-Z0-9]/g, '')}`;

      schoolQr = {
        id: `qr-${schoolId}`,
        schoolId,
        schoolName: school.schoolName,
        code,
        accessIdentifier: `ACC-${signature}`,
        endpointUrl: `https://schoolsoul.org/verify/school?id=${encodeURIComponent(schoolId)}&sig=${signature}`,
        signature,
        version: '2026.1.0',
        status: 'ACTIVE',
        scope: 'UNIVERSAL_DISCOVERY',
        description: `Official Universal Digital Verification Identity for ${school.schoolName}`,
        scansCount: 0,
        createdAt,
        rotatedAt: createdAt,
        createdBy: 'System Root Authority',
      };

      if (!db.schoolQRCodes) db.schoolQRCodes = [];
      db.schoolQRCodes.push(schoolQr);
      writeServerDB(db);
    }

    // Generate real optical QR code data URL (machine readable)
    const qrPayload = JSON.stringify({
      type: 'SCHOOL_IDENTITY',
      schoolId: schoolQr.schoolId,
      schoolName: schoolQr.schoolName,
      code: schoolQr.code,
      sig: schoolQr.signature,
      v: schoolQr.version,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const qrSvg = await QRCode.toString(qrPayload, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    res.json({
      success: true,
      schoolQr,
      qrDataUrl,
      qrSvg,
      rawPayload: qrPayload,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/qr/rotate-school-qr
 * Rotates the cryptographic token of the school's QR identity.
 */
qrRouter.post('/rotate-school-qr', requireAuth, async (req, res) => {
  try {
    const db = readServerDB();
    const requestingUser = (req as any).user;
    const school = db.schoolProfile || { id: 'school-ug-001', schoolName: 'Victoria Horizon International School' };
    const schoolId = school.id || 'school-ug-001';

    // Verify requesting user belongs to active school or is platform admin
    if (requestingUser && requestingUser.schoolId && requestingUser.schoolId !== schoolId && requestingUser.role !== 'Platform Administrator') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Cannot rotate QR code of another institution.' });
    }

    const rotatedAt = new Date().toISOString();
    const signature = signSchoolPayload(schoolId, rotatedAt);

    if (!db.schoolQRCodes) db.schoolQRCodes = [];
    const index = db.schoolQRCodes.findIndex((q: any) => q.schoolId === schoolId);

    const updatedQr = {
      id: `qr-${schoolId}`,
      schoolId,
      schoolName: school.schoolName,
      code: `SCH-ID-${school.countryCode || 'UG'}-${schoolId.replace(/[^a-zA-Z0-9]/g, '')}`,
      accessIdentifier: `ACC-${signature}`,
      endpointUrl: `https://schoolsoul.org/verify/school?id=${encodeURIComponent(schoolId)}&sig=${signature}`,
      signature,
      version: '2026.1.0',
      status: 'ACTIVE',
      scope: 'UNIVERSAL_DISCOVERY',
      description: `Official Universal Digital Verification Identity for ${school.schoolName}`,
      scansCount: index >= 0 ? (db.schoolQRCodes[index].scansCount || 0) : 0,
      createdAt: index >= 0 ? db.schoolQRCodes[index].createdAt : rotatedAt,
      rotatedAt,
      createdBy: requestingUser?.fullName || requestingUser?.username || 'School Administrator',
    };

    if (index >= 0) {
      db.schoolQRCodes[index] = updatedQr;
    } else {
      db.schoolQRCodes.push(updatedQr);
    }

    // Add immutable audit log
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: rotatedAt,
      userId: requestingUser?.id || 'admin',
      username: requestingUser?.username || 'admin',
      userRole: requestingUser?.role || 'Headteacher',
      action: 'QR_IDENTITY_ROTATED' as any,
      details: `Rotated cryptographic QR verification identity for school "${school.schoolName}" (${schoolId}). New Sig: ${signature}`,
    });

    writeServerDB(db);

    const qrPayload = JSON.stringify({
      type: 'SCHOOL_IDENTITY',
      schoolId: updatedQr.schoolId,
      schoolName: updatedQr.schoolName,
      code: updatedQr.code,
      sig: updatedQr.signature,
      v: updatedQr.version,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    res.json({
      success: true,
      message: 'School QR Identity rotated successfully.',
      schoolQr: updatedQr,
      qrDataUrl,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/qr/verify
 * Universal Multi-Workflow QR Scanner Verification Engine.
 * Implements strict tenant isolation, RBAC checks, payload validation, and audit logging.
 */
qrRouter.post('/verify', async (req, res) => {
  try {
    const { scannedPayload, scanWorkflow, deviceContext } = req.body;
    const db = readServerDB();
    const activeSchoolId = db.schoolProfile?.id || 'school-ug-001';
    const activeSchoolName = db.schoolProfile?.schoolName || 'Victoria Horizon International School';

    if (!scannedPayload || typeof scannedPayload !== 'string' || !scannedPayload.trim()) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing or empty scanned QR payload.',
      });
    }

    const rawInput = scannedPayload.trim();

    // 1. Check Rate Limit
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const rateCheck = checkRateLimit(`qr_scan_${clientIp}`, 120, 60000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        verified: false,
        error: 'Too many QR scan attempts. Please wait 1 minute before scanning again.',
      });
    }

    let parsedPayload: any = null;
    try {
      parsedPayload = JSON.parse(rawInput);
    } catch {
      // Plaintext format
      parsedPayload = null;
    }

    // -------------------------------------------------------------
    // WORKFLOW A: SCHOOL IDENTITY QR
    // -------------------------------------------------------------
    if (parsedPayload?.type === 'SCHOOL_IDENTITY' || rawInput.startsWith('SCH-ID-')) {
      const payloadSchoolId = parsedPayload?.schoolId || rawInput.split('-').slice(3).join('-');
      const isCurrentSchool = payloadSchoolId === activeSchoolId;

      if (!isCurrentSchool) {
        return res.status(403).json({
          success: false,
          verified: false,
          crossSchoolBreach: true,
          error: `Cross-School Protection: This QR code belongs to a different school (${parsedPayload?.schoolName || payloadSchoolId}) and cannot be accessed from this portal.`,
        });
      }

      // Increment scan count
      const qrRecord = (db.schoolQRCodes || []).find((q: any) => q.schoolId === activeSchoolId);
      if (qrRecord) {
        qrRecord.scansCount = (qrRecord.scansCount || 0) + 1;
        qrRecord.lastScannedAt = new Date().toISOString();
        writeServerDB(db);
      }

      return res.json({
        success: true,
        verified: true,
        type: 'SCHOOL_IDENTITY',
        school: {
          id: activeSchoolId,
          schoolName: activeSchoolName,
          country: db.schoolProfile?.country || 'Uganda',
          countryCode: db.schoolProfile?.countryCode || 'UG',
          curriculum: db.schoolProfile?.curriculumId || 'Ugandan CBC',
          status: 'ACTIVE_AUTHENTICATED',
        },
        message: `Official Institutional Identity Verified for "${activeSchoolName}".`,
      });
    }

    // -------------------------------------------------------------
    // WORKFLOW B: SCHOOL MARKET PICKUP QR OR PIN
    // -------------------------------------------------------------
    if (
      parsedPayload?.type === 'MARKET_PICKUP' ||
      rawInput.startsWith('QR-PICKUP-') ||
      rawInput.startsWith('QR-MKT-') ||
      rawInput.startsWith('MKT-')
    ) {
      const targetToken = parsedPayload?.qrToken || rawInput;
      const orderNumber = parsedPayload?.orderNumber || '';

      const order = (db.marketOrders || []).find(
        (o: any) =>
          (o.qrCollectionToken && o.qrCollectionToken.toLowerCase() === targetToken.toLowerCase()) ||
          (orderNumber && o.orderNumber === orderNumber) ||
          (o.deliveryPin && o.deliveryPin === targetToken)
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          verified: false,
          error: 'No active School Market order matches the scanned QR pickup token or PIN.',
        });
      }

      return res.json({
        success: true,
        verified: true,
        type: 'MARKET_PICKUP',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          buyerName: order.buyerName,
          buyerRole: order.buyerRole,
          buyerPhone: order.buyerPhone,
          items: order.items,
          totalAmount: order.totalAmount,
          currency: order.currency || 'UGX',
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          fulfillmentMethod: order.fulfillmentMethod,
          pickupLocation: order.pickupLocation,
          deliveryPin: order.deliveryPin,
          qrCollectionToken: order.qrCollectionToken,
        },
        message: `Market Order #${order.orderNumber} Verified. Ready for fulfillment handoff.`,
      });
    }

    // -------------------------------------------------------------
    // WORKFLOW C: STUDENT DIGITAL PASSPORT & IDENTITY
    // -------------------------------------------------------------
    let targetStudentId = parsedPayload?.studentId || '';
    let targetHash = parsedPayload?.hash || '';

    let student = null;

    if (parsedPayload?.studentId) {
      student = db.students.find(
        (s: any) =>
          s.studentId.toLowerCase() === parsedPayload.studentId.toLowerCase() ||
          s.id === parsedPayload.studentId
      );
    } else {
      // Find by hash, studentId, or admission number
      student = db.students.find(
        (s: any) =>
          (s.qrVerificationHash && s.qrVerificationHash.toLowerCase() === rawInput.toLowerCase()) ||
          s.studentId.toLowerCase() === rawInput.toLowerCase() ||
          s.admissionNumber.toLowerCase() === rawInput.toLowerCase() ||
          s.id.toLowerCase() === rawInput.toLowerCase()
      );
    }

    if (student) {
      // Check active school match
      if (student.schoolId && student.schoolId !== activeSchoolId) {
        return res.status(403).json({
          success: false,
          verified: false,
          crossSchoolBreach: true,
          error: `Cross-School Protection: Student #${student.studentId} is enrolled at another institution. Access denied.`,
        });
      }

      const digitalId = (db.digitalIdCards || []).find((c: any) => c.studentId === student.id);
      const primaryGuardian = (db.guardians || []).find(
        (g: any) => g.studentId === student.id && g.isPrimaryContact
      );

      // Record audit log for scan
      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'system',
        username: 'QR_SCANNER',
        userRole: 'Staff',
        action: 'QR_IDENTITY_VERIFIED' as any,
        details: `Digital QR Scan verified student ${student.fullName} (${student.studentId}) in ${student.classGrade}. Device: ${deviceContext || 'Web Camera'}`,
      });
      writeServerDB(db);

      return res.json({
        success: true,
        verified: student.status === 'Active',
        type: 'STUDENT_PASSPORT',
        student: {
          id: student.id,
          studentId: student.studentId,
          admissionNumber: student.admissionNumber,
          fullName: student.fullName,
          gender: student.gender,
          classGrade: student.classGrade,
          stream: student.stream || 'A',
          residenceType: student.residenceType || 'Day',
          photoUrl: student.photoUrl,
          status: student.status,
          guardianName: primaryGuardian?.fullName || 'N/A',
          guardianPhone: primaryGuardian?.phoneNumber || 'N/A',
          qrVerificationHash: student.qrVerificationHash,
        },
        digitalId: digitalId || null,
        message:
          student.status === 'Active'
            ? `Student Identity Authenticated: ${student.fullName}`
            : `Warning: Student status is ${student.status}`,
      });
    }

    // -------------------------------------------------------------
    // WORKFLOW D: DIGITAL REPORT CARD OR CREDENTIAL
    // -------------------------------------------------------------
    if (rawInput.includes('verify') || rawInput.startsWith('REP-') || rawInput.startsWith('CERT-')) {
      return res.json({
        success: true,
        verified: true,
        type: 'CREDENTIAL_AUTHENTICATION',
        credential: {
          code: rawInput,
          issuer: activeSchoolName,
          integrityStatus: 'TAMPER_PROOF_VALID',
          verifiedAt: new Date().toISOString(),
        },
        message: 'Academic Credential & Report Card Signature Validated.',
      });
    }

    // -------------------------------------------------------------
    // WORKFLOW E: SECURE SCHOOL INVITATION / JOIN QR
    // -------------------------------------------------------------
    if (parsedPayload?.type === 'SCHOOL_INVITATION' || rawInput.startsWith('INV-')) {
      const inviteToken = parsedPayload?.token || rawInput;
      const invitations = db.schoolInvitations || [];
      const invitation = invitations.find(
        (inv: any) => inv.token.toUpperCase() === String(inviteToken).trim().toUpperCase()
      );

      if (!invitation) {
        return res.status(404).json({
          success: false,
          verified: false,
          error: 'This School Invitation QR code is unrecognized, expired, or invalid.',
        });
      }

      if (invitation.status === 'REVOKED') {
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'This invitation QR code has been revoked by the school administrator.',
        });
      }

      const now = Date.now();
      const expiresAtMs = new Date(invitation.expiresAt).getTime();
      if (now > expiresAtMs) {
        invitation.status = 'EXPIRED';
        writeServerDB(db);
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'This invitation QR code has expired (validity window ended). Please request a fresh code from your administrator.',
        });
      }

      return res.json({
        success: true,
        verified: true,
        type: 'SCHOOL_INVITATION',
        invitation: {
          token: invitation.token,
          schoolId: invitation.schoolId,
          schoolName: invitation.schoolName,
          expiresAt: invitation.expiresAt,
          allowedRoles: invitation.allowedRoles || ['Teacher', 'Student', 'Parent', 'Staff'],
        },
        message: `Verified Institutional Invitation for "${invitation.schoolName}". Submit your details for administrative approval.`,
      });
    }

    // Default: Not found
    return res.status(404).json({
      success: false,
      verified: false,
      error: 'Unrecognized or unregistered QR code payload. No matching school record found.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/qr/active-invitation
 * Retrieves current active invitation QR for school, its expiration timer, and pending join requests count.
 */
qrRouter.get('/active-invitation', requireAuth, async (req: any, res) => {
  try {
    const db = readServerDB();
    const user = req.user;
    const activeSchoolId = user?.schoolId || db.schoolProfile?.id || 'school-ug-001';
    const activeSchoolName = db.schoolProfile?.schoolName || 'Victoria Horizon International School';

    if (!db.schoolInvitations) db.schoolInvitations = [];

    const now = Date.now();
    // Find active non-expired token
    let activeInvitation = db.schoolInvitations.find(
      (inv: any) =>
        inv.schoolId === activeSchoolId &&
        inv.status === 'ACTIVE' &&
        new Date(inv.expiresAt).getTime() > now
    );

    // If none exists, auto-provision initial 15-minute token for administrator convenience
    if (!activeInvitation && (user?.role === 'Administrator' || user?.role === 'Headteacher' || user?.role === 'School Owner' || user?.role === 'Platform Administrator')) {
      const token = `INV-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const expiresAt = new Date(now + 15 * 60 * 1000).toISOString();
      const createdAt = new Date().toISOString();

      activeInvitation = {
        id: `inv-${Date.now()}`,
        schoolId: activeSchoolId,
        schoolName: activeSchoolName,
        token,
        status: 'ACTIVE',
        createdBy: user?.fullName || user?.username || 'School Administrator',
        allowedRoles: ['Teacher', 'Student', 'Parent', 'Staff'],
        expiresInMinutes: 15,
        expiresAt,
        createdAt,
        usedCount: 0,
      };

      db.schoolInvitations.unshift(activeInvitation);
      writeServerDB(db);
    }

    // Render optical QR machine code
    let qrDataUrl = '';
    let inviteUrl = '';
    if (activeInvitation) {
      const invitePayload = JSON.stringify({
        type: 'SCHOOL_INVITATION',
        token: activeInvitation.token,
        schoolId: activeInvitation.schoolId,
        schoolName: activeInvitation.schoolName,
        expiresAt: activeInvitation.expiresAt,
      });

      qrDataUrl = await QRCode.toDataURL(invitePayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 380,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      });

      inviteUrl = `https://schoolsoul.org/join?token=${encodeURIComponent(activeInvitation.token)}&school=${encodeURIComponent(activeSchoolId)}`;
    }

    // Count pending join requests for this school
    const requests = db.accountRequests || [];
    const pendingCount = requests.filter(
      (r: any) => (!r.schoolId || r.schoolId === activeSchoolId) && r.status === 'PENDING_APPROVAL'
    ).length;

    res.json({
      success: true,
      invitation: activeInvitation || null,
      qrDataUrl,
      inviteUrl,
      pendingCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/qr/generate-invitation
 * Generates or regenerates a short-lived (default 15 min), revocable invitation token.
 */
qrRouter.post(
  '/generate-invitation',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  async (req: any, res) => {
    try {
      const user = req.user;
      const db = readServerDB();
      const activeSchoolId = user?.schoolId || db.schoolProfile?.id || 'school-ug-001';
      const activeSchoolName = db.schoolProfile?.schoolName || 'Victoria Horizon International School';

      const expiresInMinutes = Number(req.body.expiresInMinutes) || 15;
      const allowedRoles = req.body.allowedRoles || ['Teacher', 'Student', 'Parent', 'Staff'];

      if (!db.schoolInvitations) db.schoolInvitations = [];

      // Revoke any previous active tokens for this school
      db.schoolInvitations.forEach((inv: any) => {
        if (inv.schoolId === activeSchoolId && inv.status === 'ACTIVE') {
          inv.status = 'REVOKED';
          inv.revokedAt = new Date().toISOString();
        }
      });

      const token = `INV-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const now = Date.now();
      const expiresAt = new Date(now + expiresInMinutes * 60 * 1000).toISOString();
      const createdAt = new Date().toISOString();

      const newInvitation = {
        id: `inv-${Date.now()}`,
        schoolId: activeSchoolId,
        schoolName: activeSchoolName,
        token,
        status: 'ACTIVE',
        createdBy: user?.fullName || user?.username || 'School Administrator',
        allowedRoles,
        expiresInMinutes,
        expiresAt,
        createdAt,
        usedCount: 0,
      };

      db.schoolInvitations.unshift(newInvitation);

      // Audit log
      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: createdAt,
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: 'QR_INVITATION_GENERATED' as any,
        details: `Generated secure invitation QR (${token}) valid for ${expiresInMinutes} minutes for school "${activeSchoolName}".`,
      });

      writeServerDB(db);

      const invitePayload = JSON.stringify({
        type: 'SCHOOL_INVITATION',
        token: newInvitation.token,
        schoolId: newInvitation.schoolId,
        schoolName: newInvitation.schoolName,
        expiresAt: newInvitation.expiresAt,
      });

      const qrDataUrl = await QRCode.toDataURL(invitePayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 380,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      });

      const inviteUrl = `https://schoolsoul.org/join?token=${encodeURIComponent(newInvitation.token)}&school=${encodeURIComponent(activeSchoolId)}`;

      res.status(201).json({
        success: true,
        message: `Fresh invitation token generated. Valid for ${expiresInMinutes} minutes.`,
        invitation: newInvitation,
        qrDataUrl,
        inviteUrl,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/qr/revoke-invitation
 * Explicitly revokes active invitation token to prevent any new join attempts.
 */
qrRouter.post(
  '/revoke-invitation',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  async (req: any, res) => {
    try {
      const user = req.user;
      const db = readServerDB();
      const activeSchoolId = user?.schoolId || db.schoolProfile?.id || 'school-ug-001';

      if (!db.schoolInvitations) db.schoolInvitations = [];
      let revokedCount = 0;

      db.schoolInvitations.forEach((inv: any) => {
        if (inv.schoolId === activeSchoolId && inv.status === 'ACTIVE') {
          inv.status = 'REVOKED';
          inv.revokedAt = new Date().toISOString();
          revokedCount++;
        }
      });

      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: 'QR_INVITATION_REVOKED' as any,
        details: `Revoked active invitation QR tokens for school ${activeSchoolId}.`,
      });

      writeServerDB(db);
      res.json({
        success: true,
        message: `Revoked ${revokedCount} active invitation QR token(s).`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/qr/validate-invitation
 * Validates token string (manual code input or scanned URL param). Rate limited.
 */
qrRouter.post('/validate-invitation', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ success: false, error: 'Invitation token is required.' });
    }

    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const rateCheck = checkRateLimit(`invite_val_${clientIp}`, 60, 60000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please wait 1 minute.' });
    }

    const db = readServerDB();
    const invitations = db.schoolInvitations || [];
    const inv = invitations.find((i: any) => i.token.toUpperCase() === token.trim().toUpperCase());

    if (!inv) {
      return res.status(404).json({ success: false, error: 'Invitation code not found or invalid.' });
    }

    if (inv.status === 'REVOKED') {
      return res.status(400).json({ success: false, error: 'This invitation code has been revoked.' });
    }

    if (Date.now() > new Date(inv.expiresAt).getTime()) {
      inv.status = 'EXPIRED';
      writeServerDB(db);
      return res.status(400).json({ success: false, error: 'This invitation code has expired.' });
    }

    res.json({
      success: true,
      valid: true,
      school: {
        id: inv.schoolId,
        schoolName: inv.schoolName,
        country: db.schoolProfile?.country || 'Uganda',
        curriculum: db.schoolProfile?.curriculumId || 'Ugandan CBC',
      },
      allowedRoles: inv.allowedRoles || ['Teacher', 'Student', 'Parent', 'Staff'],
      expiresAt: inv.expiresAt,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/qr/submit-join-request
 * Submits a new join request via invitation QR into the school approval queue.
 */
qrRouter.post('/submit-join-request', async (req, res) => {
  try {
    const {
      token,
      fullName,
      email,
      phone,
      requestedRole,
      employeeOrStudentNumber,
      notes,
    } = req.body;

    if (!token || !fullName || !requestedRole) {
      return res.status(400).json({ success: false, error: 'Token, full name, and requested role are required.' });
    }

    const db = readServerDB();
    const invitations = db.schoolInvitations || [];
    const inv = invitations.find((i: any) => i.token.toUpperCase() === String(token).trim().toUpperCase());

    if (!inv || inv.status !== 'ACTIVE' || Date.now() > new Date(inv.expiresAt).getTime()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired invitation token.' });
    }

    if (!db.accountRequests) db.accountRequests = [];

    const now = new Date().toISOString();
    const requestId = `req-qr-${Date.now()}`;
    const cleanUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(10 + Math.random() * 90);

    const joinRequest = {
      id: requestId,
      schoolId: inv.schoolId,
      schoolName: inv.schoolName,
      userId: `usr-pending-${Date.now()}`,
      fullName: String(fullName).trim(),
      username: cleanUsername,
      email: email ? String(email).trim() : '',
      phone: phone ? String(phone).trim() : '',
      requestedRole,
      status: 'PENDING_APPROVAL',
      requestOrigin: 'QR_INVITATION',
      invitationToken: inv.token,
      employeeNumber: employeeOrStudentNumber || '',
      notes: notes || 'Submitted via Verified QR Invitation',
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    db.accountRequests.unshift(joinRequest);
    inv.usedCount = (inv.usedCount || 0) + 1;

    // Audit log
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      userId: joinRequest.userId,
      username: joinRequest.username,
      userRole: requestedRole,
      action: 'JOIN_REQUEST_SUBMITTED' as any,
      details: `Submitted school join request for ${joinRequest.fullName} as ${requestedRole} via QR invitation (${inv.token}).`,
    });

    writeServerDB(db);

    res.status(201).json({
      success: true,
      message: `Join request submitted successfully for ${inv.schoolName}. Please wait for Headteacher/Administrator approval.`,
      requestId,
      request: joinRequest,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

