import { API_BASE, getAuthHeaders, isServerOnline } from './api';

export interface FeedbackSubmission {
  category: 'BUG_REPORT' | 'FEATURE_REQUEST' | 'SUGGESTION' | 'COMPLAINT' | 'USABILITY' | 'PERFORMANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedModule: string;
  title: string;
  message: string;
  technicalContext?: Record<string, any>;
}

export interface FeedbackItem {
  id: string;
  schoolId: string;
  userId: string;
  username: string;
  submittingRole: string;
  category: string;
  priority: string;
  status: 'NEW' | 'IN_REVIEW' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  affectedModule: string;
  title: string;
  message: string;
  technicalContext?: Record<string, any>;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  auditHistory: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export async function submitSystemFeedback(payload: FeedbackSubmission): Promise<{ success: boolean; feedback?: FeedbackItem; error?: string }> {
  try {
    const techCtx = {
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      urlPath: window.location.pathname,
      networkStatus: navigator.onLine ? 'ONLINE' : 'OFFLINE',
      appVersion: '7.4.0-production',
      ...payload.technicalContext,
    };

    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...payload, technicalContext: techCtx }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit feedback');
    }
    return data;
  } catch (err: any) {
    console.error('Feedback submit error:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchSystemFeedback(filters?: { status?: string; category?: string; priority?: string }): Promise<FeedbackItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);

    const res = await fetch(`${API_BASE}/feedback?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      return data.feedback || [];
    }
  } catch (err) {
    console.error('Fetch feedback error:', err);
  }
  return [];
}

export async function updateFeedbackStatus(
  id: string,
  status: 'NEW' | 'IN_REVIEW' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED',
  resolutionNotes?: string
): Promise<{ success: boolean; feedback?: FeedbackItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/feedback/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, resolutionNotes }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update feedback status');
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reportTechnicalError(
  module: string,
  error: Error | string,
  context?: Record<string, any>
): Promise<string | null> {
  try {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const res = await fetch(`${API_BASE}/feedback/report-error`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        module,
        errorMessage,
        errorStack,
        context: {
          url: window.location.pathname,
          userAgent: navigator.userAgent,
          ...context,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.errorId || null;
    }
  } catch (err) {
    console.warn('Technical error reporting failed:', err);
  }
  return null;
}

export interface TechnicalErrorItem {
  id: string;
  errorId: string;
  schoolId: string;
  userId?: string;
  userRole?: string;
  module: string;
  errorMessage: string;
  errorStack?: string;
  context?: Record<string, any>;
  timestamp: string;
  status?: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED' | 'IGNORED';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export async function fetchTechnicalErrors(status?: string): Promise<TechnicalErrorItem[]> {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    const res = await fetch(`${API_BASE}/feedback/errors?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.errors || [];
    }
  } catch (err) {
    console.error('Fetch technical errors error:', err);
  }
  return [];
}

export async function resolveTechnicalError(id: string, resolutionNotes?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/feedback/errors/${id}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ resolutionNotes }),
    });
    return res.ok;
  } catch (err) {
    console.error('Resolve technical error failed:', err);
    return false;
  }
}

export async function resolveAllTechnicalErrors(resolutionNotes?: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/feedback/errors/resolve-all`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ resolutionNotes }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.resolvedCount || 0;
    }
  } catch (err) {
    console.error('Resolve all technical errors failed:', err);
  }
  return 0;
}

export async function clearResolvedTechnicalErrors(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/feedback/errors/clear-resolved`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.clearedCount || 0;
    }
  } catch (err) {
    console.error('Clear resolved technical errors failed:', err);
  }
  return 0;
}

export async function resolveAllFeedbackIncidents(resolutionNotes?: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/feedback/resolve-all`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ resolutionNotes }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.resolvedCount || 0;
    }
  } catch (err) {
    console.error('Resolve all feedback incidents failed:', err);
  }
  return 0;
}

export async function fetchQuarantinedOperations(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/sync/quarantined`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.quarantined || [];
    }
  } catch (err) {
    console.error('Fetch quarantined operations error:', err);
  }
  return [];
}

export async function resolveQuarantinedOperation(operationId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sync/quarantined/${operationId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Resolve quarantined operation error:', err);
    return false;
  }
}

export async function resolveAllQuarantinedOperations(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/sync/quarantined/resolve-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.resolvedCount || 0;
    }
  } catch (err) {
    console.error('Resolve all quarantined operations error:', err);
  }
  return 0;
}

export async function resolveAllConflicts(decision: 'KEEP_EXISTING' | 'ACCEPT_INCOMING' = 'KEEP_EXISTING'): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/sync/conflicts/resolve-all`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ decision }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.resolvedCount || 0;
    }
  } catch (err) {
    console.error('Resolve all conflicts error:', err);
  }
  return 0;
}
