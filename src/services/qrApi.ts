import { API_BASE, getAuthHeaders } from './api';
import type { SchoolQRCode } from '../types';

export interface QRVerificationResult {
  success: boolean;
  verified: boolean;
  type?: 'SCHOOL_IDENTITY' | 'STUDENT_PASSPORT' | 'MARKET_PICKUP' | 'CREDENTIAL_AUTHENTICATION' | 'SCHOOL_INVITATION';
  invitation?: {
    token: string;
    schoolId: string;
    schoolName: string;
    expiresAt: string;
    allowedRoles?: string[];
  };
  school?: {
    id: string;
    schoolName: string;
    country: string;
    countryCode: string;
    curriculum: string;
    status: string;
  };
  student?: {
    id: string;
    studentId: string;
    admissionNumber: string;
    fullName: string;
    gender: string;
    classGrade: string;
    stream: string;
    residenceType: string;
    photoUrl?: string;
    status: string;
    guardianName: string;
    guardianPhone: string;
    qrVerificationHash: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    buyerName: string;
    buyerRole: string;
    buyerPhone: string;
    items: any[];
    totalAmount: number;
    currency: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    fulfillmentMethod: string;
    pickupLocation?: string;
    deliveryPin?: string;
    qrCollectionToken?: string;
  };
  credential?: {
    code: string;
    issuer: string;
    integrityStatus: string;
    verifiedAt: string;
  };
  digitalId?: any;
  message?: string;
  error?: string;
  crossSchoolBreach?: boolean;
}

export interface SchoolQRIdentityResponse {
  success: boolean;
  schoolQr: SchoolQRCode;
  qrDataUrl: string;
  qrSvg: string;
  rawPayload: string;
}

export async function fetchSchoolQRIdentity(): Promise<SchoolQRIdentityResponse> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/qr/school-identity`, {
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch school QR identity' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return await res.json();
}

export async function rotateSchoolQRIdentity(): Promise<{
  success: boolean;
  message: string;
  schoolQr: SchoolQRCode;
  qrDataUrl: string;
}> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/qr/rotate-school-qr`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to rotate school QR identity' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return await res.json();
}

export async function verifyUniversalQR(
  scannedPayload: string,
  scanWorkflow?: string,
  deviceContext?: string
): Promise<QRVerificationResult> {
  const headers = getAuthHeaders();
  try {
    const res = await fetch(`${API_BASE}/qr/verify`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scannedPayload,
        scanWorkflow: scanWorkflow || 'GENERAL_SCANNER',
        deviceContext: deviceContext || navigator.userAgent,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      verified: false,
      error: err.message || 'Network error verifying QR code.',
    };
  }
}

export interface SchoolInvitationInfo {
  id: string;
  schoolId: string;
  schoolName: string;
  token: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdBy: string;
  allowedRoles: string[];
  expiresInMinutes: number;
  expiresAt: string;
  createdAt: string;
  usedCount: number;
}

export interface ActiveInvitationResponse {
  success: boolean;
  invitation: SchoolInvitationInfo | null;
  qrDataUrl: string;
  inviteUrl: string;
  pendingCount: number;
}

export async function fetchActiveSchoolInvitation(): Promise<ActiveInvitationResponse> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/qr/active-invitation`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch active invitation' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function generateSchoolInvitation(expiresInMinutes: number = 15): Promise<{
  success: boolean;
  message: string;
  invitation: SchoolInvitationInfo;
  qrDataUrl: string;
  inviteUrl: string;
}> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/qr/generate-invitation`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresInMinutes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to generate invitation QR' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function revokeSchoolInvitation(): Promise<{ success: boolean; message: string }> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/qr/revoke-invitation`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to revoke invitation QR' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function validateSchoolInvitation(token: string): Promise<{
  success: boolean;
  valid: boolean;
  school: {
    id: string;
    schoolName: string;
    country: string;
    curriculum: string;
  };
  allowedRoles: string[];
  expiresAt: string;
}> {
  const res = await fetch(`${API_BASE}/qr/validate-invitation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid invitation code');
  }
  return data;
}

export async function submitQRJoinRequest(payload: {
  token: string;
  fullName: string;
  email?: string;
  phone?: string;
  requestedRole: string;
  employeeOrStudentNumber?: string;
  notes?: string;
}): Promise<{
  success: boolean;
  message: string;
  requestId: string;
  request: any;
}> {
  const res = await fetch(`${API_BASE}/qr/submit-join-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit join request');
  }
  return data;
}

