import { API_BASE, getAuthHeaders } from './api';
import type { SchoolQRCode } from '../types';

export interface QRVerificationResult {
  success: boolean;
  verified: boolean;
  type?: 'SCHOOL_IDENTITY' | 'STUDENT_PASSPORT' | 'MARKET_PICKUP' | 'CREDENTIAL_AUTHENTICATION';
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
