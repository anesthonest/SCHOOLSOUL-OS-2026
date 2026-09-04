import { Router, type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { readServerDB, writeServerDB } from '../db/store';

export const docsRouter = Router();

// Canonical filename for SchoolSoul OS 2026.1.0 Official User Guide
export const OFFICIAL_USER_GUIDE_FILENAME = 'SchoolSoul_OS_User_Guideline_Book_2026.1.0.pdf';
export const OFFICIAL_USER_GUIDE_ALIAS = 'SchoolSoul_OS_2026.1.0_Official_User_Guide.pdf';

/**
 * Locate the authoritative User Guide PDF file on the server filesystem.
 * Strictly limited to approved target locations (no user-controlled paths).
 */
export function getOfficialUserGuidePath(): string | null {
  const candidatePaths = [
    path.join(process.cwd(), 'public', OFFICIAL_USER_GUIDE_FILENAME),
    path.join(process.cwd(), 'public', OFFICIAL_USER_GUIDE_ALIAS),
    path.join(process.cwd(), OFFICIAL_USER_GUIDE_FILENAME),
    path.join(process.cwd(), OFFICIAL_USER_GUIDE_ALIAS),
    path.join(process.cwd(), 'dist', OFFICIAL_USER_GUIDE_FILENAME),
    path.join(process.cwd(), 'dist', OFFICIAL_USER_GUIDE_ALIAS),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const stats = fs.statSync(p);
        if (stats.isFile() && stats.size > 0) {
          return p;
        }
      } catch {
        // Continue checking candidates
      }
    }
  }

  return null;
}

/**
 * Record an audit entry for user guide access/download
 */
function logDocumentAccess(req: Request, action: 'USER_GUIDE_OPENED' | 'USER_GUIDE_DOWNLOADED') {
  try {
    const user = (req as any).user;
    const db = readServerDB();
    const newLog = {
      id: 'audit-doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      username: user?.username || user?.fullName || 'Authenticated User',
      userRole: user?.role || 'User',
      action: action,
      details: `Accessed official documentation: ${OFFICIAL_USER_GUIDE_FILENAME} (Release 2026.1.0)`,
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
      deviceInfo: req.headers['user-agent'] || '',
    };
    db.auditLogs.unshift(newLog);
    writeServerDB(db);
  } catch {
    // Non-blocking audit failure
  }
}

/**
 * GET /api/docs/user-guide/metadata
 * Return document status, version, and availability without exposing secrets or paths.
 */
docsRouter.get('/user-guide/metadata', (req: Request, res: Response) => {
  const guidePath = getOfficialUserGuidePath();
  const exists = guidePath !== null;

  let sizeBytes = 0;
  if (exists && guidePath) {
    try {
      sizeBytes = fs.statSync(guidePath).size;
    } catch {
      sizeBytes = 0;
    }
  }

  res.json({
    success: true,
    document: {
      title: 'SchoolSoul OS 2026.1.0 User Guideline & Operations Book',
      version: '2026.1.0',
      filename: OFFICIAL_USER_GUIDE_FILENAME,
      documentType: 'USER_GUIDE',
      status: exists ? 'ACTIVE' : 'AWAITING_UPLOAD',
      description: 'Official SchoolSoul OS 2026.1.0 user guideline and operations manual. Learn how to navigate and use SchoolSoul OS, its dashboards, workflows, School Market, communication tools, and payment features.',
      isAvailable: exists,
      sizeBytes,
      mimeType: 'application/pdf',
      publicUrl: `/${OFFICIAL_USER_GUIDE_FILENAME}`,
      downloadUrl: '/api/docs/user-guide/download',
      openUrl: '/api/docs/user-guide/open',
      permittedRoles: [
        'Platform Administrator',
        'School Administrator',
        'Director of Studies (DOS)',
        'Teacher',
        'Bursar',
        'Student',
        'Parent'
      ],
      security: {
        pathTraversalProtected: true,
        tenantIsolated: true,
        readOnly: true
      }
    }
  });
});

/**
 * GET /api/docs/user-guide/open
 * Stream/serve the official PDF for browser viewing (inline)
 */
docsRouter.get('/user-guide/open', (req: Request, res: Response) => {
  const guidePath = getOfficialUserGuidePath();

  if (!guidePath) {
    return res.status(404).json({
      success: false,
      error: 'The User Guide could not be loaded. Please try again or contact your school administrator.',
      code: 'DOCUMENT_NOT_FOUND',
      filename: OFFICIAL_USER_GUIDE_FILENAME
    });
  }

  logDocumentAccess(req, 'USER_GUIDE_OPENED');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${OFFICIAL_USER_GUIDE_FILENAME}"`);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const stream = fs.createReadStream(guidePath);
  stream.pipe(res);
});

/**
 * GET /api/docs/user-guide/download
 * Force download the official PDF (attachment)
 */
docsRouter.get('/user-guide/download', (req: Request, res: Response) => {
  const guidePath = getOfficialUserGuidePath();

  if (!guidePath) {
    return res.status(404).json({
      success: false,
      error: 'The User Guide could not be loaded. Please try again or contact your school administrator.',
      code: 'DOCUMENT_NOT_FOUND',
      filename: OFFICIAL_USER_GUIDE_FILENAME
    });
  }

  logDocumentAccess(req, 'USER_GUIDE_DOWNLOADED');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${OFFICIAL_USER_GUIDE_FILENAME}"`);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const stream = fs.createReadStream(guidePath);
  stream.pipe(res);
});

/**
 * Path Traversal & Arbitrary File Access Quarantine Guard
 * Explicitly reject any attempts to request custom or user-controlled files.
 */
docsRouter.get('/*', (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    error: 'Access denied. Arbitrary file requests are strictly forbidden by SchoolSoul Security Policy.',
    code: 'SECURITY_VIOLATION'
  });
});
