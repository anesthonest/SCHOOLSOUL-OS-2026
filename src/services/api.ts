import { db, DEFAULT_BUILTIN_ROLES, DEFAULT_SETTINGS } from '../db/indexedDB';
import type { SchoolProfile, User, RoleDefinition, SystemSettings, AuditLog, SyncQueueItem, AccountRequest } from '../types';

export const API_BASE = ((import.meta as any).env?.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL}/api` : '/api');

export function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token =
    localStorage.getItem('schoolsoul_token') ||
    sessionStorage.getItem('schoolsoul_token') ||
    localStorage.getItem('schoolsoul_jwt_token') ||
    sessionStorage.getItem('schoolsoul_jwt_token') ||
    localStorage.getItem('schoolsoul_auth_token') ||
    sessionStorage.getItem('schoolsoul_auth_token');
  const userStr = localStorage.getItem('schoolsoul_user') || sessionStorage.getItem('schoolsoul_user');
  let schoolId = localStorage.getItem('schoolsoul_active_school_id') || '';
  let userId = localStorage.getItem('schoolsoul_user_id') || '';
  let userRole = localStorage.getItem('schoolsoul_user_role') || '';
  let userName = localStorage.getItem('schoolsoul_user_name') || '';

  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.schoolId) schoolId = u.schoolId;
      if (u.id) userId = u.id;
      if (u.role) userRole = u.role;
      if (u.fullName || u.name || u.username) userName = u.fullName || u.name || u.username;
    } catch {
      // ignore JSON parse error
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (schoolId) {
    headers['X-School-ID'] = schoolId;
  }
  if (userId) {
    headers['X-User-ID'] = userId;
  }
  if (userRole) {
    headers['X-User-Role'] = userRole;
  }
  if (userName) {
    headers['X-User-Name'] = userName;
  }

  return headers;
}

export const apiClient = {
  get: async (url: string, headers: Record<string, string> = {}) => {
    return fetch(url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`, {
      method: 'GET',
      headers: getAuthHeaders(headers),
    });
  },
  post: async (url: string, body?: any, headers: Record<string, string> = {}) => {
    return fetch(url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`, {
      method: 'POST',
      headers: getAuthHeaders(headers),
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
  },
  put: async (url: string, body?: any, headers: Record<string, string> = {}) => {
    return fetch(url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`, {
      method: 'PUT',
      headers: getAuthHeaders(headers),
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
  },
  delete: async (url: string, headers: Record<string, string> = {}) => {
    return fetch(url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`, {
      method: 'DELETE',
      headers: getAuthHeaders(headers),
    });
  },
};

export async function isServerOnline(): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Initialize Local IndexedDB with defaults if empty
let isInitializingDefaultsPromise: Promise<void> | null = null;

export async function initializeLocalStoreDefaults(): Promise<void> {
  if (isInitializingDefaultsPromise) {
    return isInitializingDefaultsPromise;
  }

  isInitializingDefaultsPromise = (async () => {
    try {
      const roleCount = await db.roles.count();
      if (roleCount === 0) {
        await db.roles.bulkPut(DEFAULT_BUILTIN_ROLES);
      }
    } catch (err) {
      console.warn('initializeLocalStoreDefaults roles warning (handled):', err);
      try {
        await db.roles.bulkPut(DEFAULT_BUILTIN_ROLES);
      } catch (putErr) {
        console.warn('bulkPut fallback roles warning:', putErr);
      }
    }

    try {
      const settingsCount = await db.settings.count();
      if (settingsCount === 0) {
        await db.settings.put(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.warn('initializeLocalStoreDefaults settings warning (handled):', err);
      try {
        await db.settings.put(DEFAULT_SETTINGS);
      } catch (putErr) {
        console.warn('settings put fallback warning:', putErr);
      }
    }
  })().finally(() => {
    isInitializingDefaultsPromise = null;
  });

  return isInitializingDefaultsPromise;
}

// Queue offline action
export async function queueOfflineAction(entity: SyncQueueItem['entity'], action: SyncQueueItem['action'], payload: any) {
  const item: SyncQueueItem = {
    id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    entity,
    action,
    payload,
    timestamp: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };
  await db.syncQueue.add(item);
  return item;
}

// School API
export async function fetchSchoolProfile(): Promise<{ schoolProfile: SchoolProfile | null; isConfigured: boolean }> {
  try {
    if (await isServerOnline()) {
      const res = await fetch(`${API_BASE}/school/profile`);
      if (res.ok) {
        const data = await res.json();
        if (data.schoolProfile) {
          await db.schoolProfile.put(data.schoolProfile);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Network fetchSchoolProfile failed, falling back to IndexedDB', err);
  }

  // Fallback to IndexedDB
  const local = await db.schoolProfile.toArray();
  const profile = local[0] || null;
  return {
    schoolProfile: profile,
    isConfigured: Boolean(profile && profile.isConfigured),
  };
}

export async function setupSchool(school: Partial<SchoolProfile>, adminUser: Partial<User> & { password?: string }) {
  await initializeLocalStoreDefaults();

  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/school/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ school, adminUser }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'School setup failed');

    if (data.schoolProfile) {
      await db.schoolProfile.clear();
      await db.schoolProfile.put(data.schoolProfile);
    }
    if (data.adminUser) await db.users.put(data.adminUser);

    // Populate academic year / term if empty
    const yearCount = await db.academicYears.count();
    if (yearCount === 0) {
      const yearId = 'ay-' + Date.now();
      await db.academicYears.put({
        id: yearId,
        yearName: school.academicYear || '2026',
        startDate: '2026-02-01',
        endDate: '2026-12-05',
        isCurrent: true,
      });
      const termNameValue =
        school.academicTerm === 'Term II'
          ? 'Term 2'
          : school.academicTerm === 'Term III'
          ? 'Term 3'
          : 'Term 1';

      await db.academicTerms.put({
        id: 'term-' + Date.now(),
        yearId: yearId,
        termName: termNameValue,
        startDate: '2026-02-01',
        endDate: '2026-05-01',
        isCurrent: true,
        reportReleaseFeePolicy: 'Allow All',
      });
    }

    return data;
  } else {
    // Local Offline Setup
    const schoolId = 'school-' + Date.now();
    const countryCode = school.countryCode || (school.country === 'Kenya' ? 'KE' : school.country === 'Tanzania' ? 'TZ' : school.country === 'Rwanda' ? 'RW' : school.country === 'Ghana' ? 'GH' : school.country === 'Nigeria' ? 'NG' : school.country === 'South Africa' ? 'ZA' : 'UG');
    const createdSchool: SchoolProfile = {
      id: schoolId,
      schoolName: school.schoolName || 'My School',
      schoolMotto: school.schoolMotto || 'Knowledge is Power',
      schoolType: school.schoolType || 'Secondary',
      schoolLevel: school.schoolLevel || 'District',
      registrationNumber: school.registrationNumber || 'REG-1001',
      physicalAddress: school.physicalAddress || 'Kampala, Uganda',
      district: school.district || 'Kampala',
      region: school.region || 'Central',
      country: school.country || 'Uganda',
      countryCode: countryCode,
      countryId: countryCode,
      educationFrameworkId: school.educationFrameworkId || countryCode,
      curriculumId: school.curriculumId || '',
      currency: school.currency || (countryCode === 'KE' ? 'KES' : countryCode === 'TZ' ? 'TZS' : countryCode === 'RW' ? 'RWF' : countryCode === 'GH' ? 'GHS' : countryCode === 'NG' ? 'NGN' : countryCode === 'ZA' ? 'ZAR' : 'UGX'),
      telephone: school.telephone || '+256 700 000 000',
      email: school.email || 'info@school.ac.ug',
      website: school.website || '',
      academicYear: school.academicYear || '2026',
      academicTerm: school.academicTerm || 'Term I',
      timeZone: school.timeZone || 'Africa/Kampala',
      preferredLanguage: school.preferredLanguage || 'English',
      isConfigured: true,
      isCountryLocked: true,
      dataRecordCount: 0,
      configuration: school.configuration || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const superAdmin: User = {
      id: 'usr-' + Date.now(),
      fullName: adminUser.fullName || 'Headteacher Administrator',
      username: adminUser.username || 'admin',
      email: adminUser.email || 'admin@school.ac.ug',
      phone: adminUser.phone || '+256700000000',
      employeeNumber: adminUser.employeeNumber || 'EMP-001',
      role: 'Headteacher',
      status: 'Active',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.schoolProfile.clear();
    await db.schoolProfile.put(createdSchool);
    await db.users.put(superAdmin);

    // Initial Academic Year & Term
    const yearCount = await db.academicYears.count();
    if (yearCount === 0) {
      const yearId = 'ay-' + Date.now();
      await db.academicYears.put({
        id: yearId,
        yearName: school.academicYear || '2026',
        startDate: '2026-02-01',
        endDate: '2026-12-05',
        isCurrent: true,
      });
      const termNameValue =
        school.academicTerm === 'Term II'
          ? 'Term 2'
          : school.academicTerm === 'Term III'
          ? 'Term 3'
          : 'Term 1';

      await db.academicTerms.put({
        id: 'term-' + Date.now(),
        yearId: yearId,
        termName: termNameValue,
        startDate: '2026-02-01',
        endDate: '2026-05-01',
        isCurrent: true,
        reportReleaseFeePolicy: 'Allow All',
      });
    }

    await queueOfflineAction('school', 'CREATE', createdSchool);
    await queueOfflineAction('user', 'CREATE', superAdmin);

    return { success: true, schoolProfile: createdSchool, adminUser: superAdmin };
  }
}

// User API
export async function fetchAllUsers(): Promise<User[]> {
  try {
    if (await isServerOnline()) {
      const res = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          await db.users.bulkPut(data.users);
          return data.users;
        }
      }
    }
  } catch (e) {
    console.warn('Network fetchAllUsers failed, falling back to IndexedDB', e);
  }
  return await db.users.toArray();
}

export async function createUser(userData: Partial<User> & { password?: string }, creatorUserId?: string, creatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...userData, creatorUserId, creatorUsername }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    if (data.user) await db.users.put(data.user);
    return data.user;
  } else {
    // Offline User Creation
    const newUser: User = {
      id: 'usr-' + Date.now(),
      fullName: userData.fullName || 'New User',
      username: userData.username || 'user' + Math.floor(Math.random() * 1000),
      email: userData.email || '',
      phone: userData.phone || '',
      employeeNumber: userData.employeeNumber || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: userData.role || 'Teacher',
      status: userData.status || 'Active',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.users.put(newUser);
    await queueOfflineAction('user', 'CREATE', newUser);
    return newUser;
  }
}

export async function updateUser(id: string, updates: Partial<User>, editorUserId?: string, editorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...updates, editorUserId, editorUsername }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');
    if (data.user) await db.users.put(data.user);
    return data.user;
  } else {
    const existing = await db.users.get(id);
    if (!existing) throw new Error('User not found in local database');
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await db.users.put(updated);
    await queueOfflineAction('user', 'UPDATE', updated);
    return updated;
  }
}

export async function updateUserStatus(id: string, status: User['status'], operatorUserId?: string, operatorUsername?: string) {
  return updateUser(id, { status }, operatorUserId, operatorUsername);
}

// Roles API
export async function fetchAllRoles(): Promise<RoleDefinition[]> {
  try {
    if (await isServerOnline()) {
      const res = await fetch(`${API_BASE}/roles`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.roles) && data.roles.length > 0) {
          await db.roles.bulkPut(data.roles);
          return data.roles;
        }
      }
    }
  } catch (e) {
    console.warn('Network fetchAllRoles failed, falling back to IndexedDB', e);
  }
  const local = await db.roles.toArray();
  if (local.length === 0) {
    try {
      await db.roles.bulkPut(DEFAULT_BUILTIN_ROLES);
    } catch (putErr) {
      console.warn('fetchAllRoles bulkPut fallback warning (handled):', putErr);
    }
    return DEFAULT_BUILTIN_ROLES;
  }
  return local;
}

export async function createCustomRole(name: string, description: string, permissions: any[], creatorUserId?: string, creatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/roles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, permissions, creatorUserId, creatorUsername }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create role');
    if (data.role) await db.roles.put(data.role);
    return data.role;
  } else {
    const newRole: RoleDefinition = {
      id: 'role-' + Date.now(),
      name,
      description,
      isBuiltIn: false,
      permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.roles.put(newRole);
    await queueOfflineAction('role', 'CREATE', newRole);
    return newRole;
  }
}

export async function updateRolePermissions(id: string, permissions: any[], description?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions, description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update role');
    if (data.role) await db.roles.put(data.role);
    return data.role;
  } else {
    const existing = await db.roles.get(id);
    if (!existing) throw new Error('Role not found');
    const updated = { ...existing, permissions, description: description ?? existing.description, updatedAt: new Date().toISOString() };
    await db.roles.put(updated);
    await queueOfflineAction('role', 'UPDATE', updated);
    return updated;
  }
}

// Audit Logs API
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    if (await isServerOnline()) {
      const res = await fetch(`${API_BASE}/audit`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.auditLogs)) {
          await db.auditLogs.bulkPut(data.auditLogs);
          return data.auditLogs;
        }
      }
    }
  } catch (e) {
    console.warn('Network fetchAuditLogs failed', e);
  }
  return await db.auditLogs.orderBy('timestamp').reverse().toArray();
}

export async function logAuditEvent(
  userId: string,
  username: string,
  userRole: string,
  action: AuditLog['action'],
  details: string
) {
  const log: AuditLog = {
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    userId,
    username,
    userRole,
    action,
    details,
  };

  await db.auditLogs.put(log);

  if (await isServerOnline()) {
    try {
      await fetch(`${API_BASE}/audit`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(log),
      });
    } catch {
      await queueOfflineAction('audit', 'CREATE', log);
    }
  } else {
    await queueOfflineAction('audit', 'CREATE', log);
  }

  return log;
}

// Account Approval Requests API (Layer A Registration & Layer B Approval)
export async function submitAccountRequest(payload: {
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  requestedRole: string;
  schoolId?: string;
  nationalIdOrNin?: string;
  studentIdOrLin?: string;
  childLinOrNin?: string;
  tinNumber?: string;
  nssfNumber?: string;
  department?: string;
}): Promise<any> {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/auth/register-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit account request.');
    return data;
  } else {
    // Offline local fallback
    const requestId = 'req-' + Date.now();
    const userId = 'usr-' + Date.now();
    const mockUser: User = {
      id: userId,
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email || '',
      phone: payload.phone || '',
      employeeNumber: '',
      role: payload.requestedRole,
      status: 'PENDING_APPROVAL',
      approvalStatus: 'PENDING_APPROVAL',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.users.put(mockUser);
    return {
      success: true,
      message: 'Your account has been submitted and is pending Headteacher approval.',
      requestId,
      status: 'PENDING_APPROVAL',
    };
  }
}

export async function checkAccountStatus(identifier: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/auth/check-status/${encodeURIComponent(identifier)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to check status');
    return data;
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function fetchAccountRequests(statusFilter: string = 'ALL'): Promise<AccountRequest[]> {
  try {
    const res = await fetch(`${API_BASE}/users/approval-requests?status=${encodeURIComponent(statusFilter)}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.requests || [];
    }
  } catch (e) {
    console.warn('fetchAccountRequests failed:', e);
  }
  return [];
}

export async function approveAccountRequest(id: string, effectiveRole?: string, comment?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/approval-requests/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ effectiveRole, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to approve account request');
  return data;
}

export async function rejectAccountRequest(id: string, reason?: string, comment?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/approval-requests/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reject account request');
  return data;
}

export async function suspendAccountRequest(id: string, reason?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/approval-requests/${id}/suspend`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to suspend account');
  return data;
}

export async function revokeAccountRequest(id: string, reason?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/approval-requests/${id}/revoke`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to revoke account');
  return data;
}

// ==========================================
// ACCOUNT RECOVERY & PASSWORD RESET API
// ==========================================

export async function requestAccountRecovery(payload: {
  identifier?: string;
  recoveryType?: 'FORGOT_PASSWORD' | 'FORGOT_EMAIL' | 'FORGOT_PHONE' | 'LOST_BOTH_CONTACTS' | 'HEADTEACHER_RECOVERY';
  contactProvided?: string;
  nationalIdOrNin?: string;
  studentIdOrLin?: string;
  recoveryNotes?: string;
  newEmail?: string;
  newPhone?: string;
  fullName?: string;
  schoolId?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/recovery/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to initiate recovery');
  return data;
}

export async function verifyRecoveryOtp(requestId: string, otpCode: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/recovery/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, otpCode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid verification code');
  return data;
}

export async function completePasswordReset(requestId: string, resetToken: string, newPassword: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/recovery/complete-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, resetToken, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to complete password reset');
  return data;
}

export async function fetchAccountRecoveryRequests(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/auth/recovery/requests`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.requests || [];
    }
  } catch (e) {
    console.warn('fetchAccountRecoveryRequests failed:', e);
  }
  return [];
}

export async function resolveAccountRecoveryRequest(payload: {
  requestId: string;
  action: 'APPROVE_RESET' | 'UPDATE_CONTACTS' | 'REJECT';
  newTemporaryPassword?: string;
  newEmail?: string;
  newPhone?: string;
  reviewerNotes?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/recovery/resolve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to resolve recovery request');
  return data;
}

// ==========================================
// HEADTEACHER SUCCESSION & HISTORY API
// ==========================================

export async function fetchHeadteacherHistory(): Promise<{ headteacherHistory: any[]; currentHeadteacher: any }> {
  try {
    const res = await fetch(`${API_BASE}/school/headteacher-history`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('fetchHeadteacherHistory failed:', e);
  }
  return { headteacherHistory: [], currentHeadteacher: null };
}

export async function fetchHeadteacherSuccessionRequests(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/school/headteacher-succession/requests`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.requests || [];
    }
  } catch (e) {
    console.warn('fetchHeadteacherSuccessionRequests failed:', e);
  }
  return [];
}

export async function requestHeadteacherSuccession(payload: {
  incomingFullName: string;
  incomingUsername: string;
  incomingEmail?: string;
  incomingPhone?: string;
  incomingNationalIdOrNin?: string;
  incomingTeacherRegNumber?: string;
  incomingPassword?: string;
  reasonForSuccession: string;
  handoverDocumentRef?: string;
  effectiveDate?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/school/headteacher-succession/request`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit succession request');
  return data;
}

export async function approveHeadteacherSuccession(requestId: string, handoverNotes?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/school/headteacher-succession/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ requestId, handoverNotes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to approve succession');
  return data;
}

export async function rejectHeadteacherSuccession(requestId: string, rejectionReason?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/school/headteacher-succession/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ requestId, rejectionReason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reject succession');
  return data;
}

