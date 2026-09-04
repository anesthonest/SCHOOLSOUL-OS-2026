import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { readServerDB } from '../db/store';

export const JWT_SECRET = process.env.JWT_SECRET || 'schoolsoul-master-secret-key-2026';
export const REFRESH_SECRET = process.env.REFRESH_SECRET || 'schoolsoul-refresh-secret-key-2026';

export function generateJWT(payload: any, expiresIn: string | number = '8h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

export function generateRefreshToken(payload: any, expiresIn: string | number = '7d'): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn } as any);
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    schoolId?: string;
  };
}

// In-memory rate limiting map for sensitive endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests = 60, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again shortly.',
        retryAfter: retryAfterSec,
      });
    }

    next();
  };
}

// Security Headers Middleware
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=*, microphone=*, geolocation=()');
  next();
}

// Token Extraction & Verification Middleware
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: 'Authentication token expired or invalid.' });
      }
      req.user = decoded;
      next();
    });
  } else {
    // If no authorization token is provided, do NOT inject admin privileges
    req.user = undefined;
    next();
  }
}

// Strict Authentication Enforcement
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required to access this resource.' });
  }

  // Dynamic user status validation against current server state
  try {
    const db = readServerDB();
    const currentUser = db.users?.find((u) => u.id === req.user?.id);
    if (currentUser) {
      // Invalidate session if token was issued before the last password reset
      if (req.user && (req.user as any).iat && currentUser.passwordChangedAt) {
        const tokenIssuedAt = (req.user as any).iat * 1000;
        const passwordChangedAtTime = new Date(currentUser.passwordChangedAt).getTime();
        if (tokenIssuedAt < passwordChangedAtTime) {
          return res.status(401).json({
            error: 'Session invalidated due to recent password reset. Please log in again with your new password.',
            sessionInvalidated: true,
          });
        }
      }

      if (currentUser.status === 'PENDING_APPROVAL' || currentUser.status === 'Pending Approval') {
        return res.status(403).json({ error: 'Account pending Headteacher approval. System access restricted.', status: 'PENDING_APPROVAL' });
      }
      if (currentUser.status === 'Suspended' || currentUser.status === 'SUSPENDED') {
        return res.status(403).json({ error: 'Account has been suspended by school administration.', status: 'SUSPENDED' });
      }
      if (currentUser.status === 'REJECTED' || currentUser.status === 'Rejected') {
        return res.status(403).json({ error: 'Account application has been rejected.', status: 'REJECTED' });
      }
      if (currentUser.status === 'REVOKED' || currentUser.status === 'Revoked') {
        return res.status(403).json({ error: 'Account access has been revoked.', status: 'REVOKED' });
      }
      if (currentUser.status === 'Inactive') {
        return res.status(403).json({ error: 'Account is inactive.', status: 'INACTIVE' });
      }
    }
  } catch {
    // Non-blocking fallback for offline/isolated runtime
  }

  next();
}

// Role-Based Access Control (RBAC) Enforcement
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = req.user.role?.toLowerCase() || '';
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    const isAllowed =
      userRole === 'administrator' ||
      userRole === 'school owner' ||
      userRole === 'head teacher' ||
      userRole === 'headteacher' ||
      normalizedAllowed.includes(userRole);

    if (!isAllowed) {
      return res.status(403).json({
        error: `Access Denied: Role '${req.user.role}' is not authorized to perform this operation.`,
      });
    }

    next();
  };
}

// Tenant Isolation Enforcement
export function requireSchoolTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required for tenant verification.' });
  }
  const requestedSchoolId = req.headers['x-school-id'] as string || req.body?.schoolId || req.query?.schoolId;
  if (requestedSchoolId && req.user.schoolId && req.user.schoolId !== requestedSchoolId) {
    return res.status(403).json({ error: 'Cross-school tenant isolation violation: Unauthorized access attempt.' });
  }
  next();
}

