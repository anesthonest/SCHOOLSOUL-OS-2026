import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
} from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../../services/api';

interface JoinRequest {
  id: string;
  schoolId: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  requestedRole: string;
  effectiveRole?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  requestOrigin?: string;
  invitationToken?: string;
  employeeNumber?: string;
  notes?: string;
  requestedAt: string;
  reviewerComment?: string;
}

interface SchoolJoinRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const SchoolJoinRequestsModal: React.FC<SchoolJoinRequestsModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedRoleOverride, setSelectedRoleOverride] = useState<Record<string, string>>({});
  const [reviewComment, setReviewComment] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/users/approval-requests?status=${statusFilter}`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load join requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req: JoinRequest) => {
    setProcessingId(req.id);
    setActionError(null);
    setActionSuccess(null);

    const effectiveRole = selectedRoleOverride[req.id] || req.requestedRole || 'Teacher';
    const comment = reviewComment[req.id] || 'Approved by School Administrator via QR Queue';

    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/users/approval-requests/${req.id}/approve`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          effectiveRole,
          comment,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Approval failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      setActionSuccess(`Approved ${req.fullName} as ${effectiveRole}. Access has been activated.`);
      await loadRequests();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: JoinRequest) => {
    const reason = window.prompt(`Provide rejection reason for ${req.fullName}:`, 'Information could not be verified by administration');
    if (reason === null) return;

    setProcessingId(req.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/users/approval-requests/${req.id}/reject`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Information could not be verified',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Rejection failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      setActionSuccess(`Rejected join request for ${req.fullName}.`);
      await loadRequests();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject request.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  const pendingCount = requests.filter((r) => r.status === 'PENDING_APPROVAL').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                QR Join & Account Approval Queue
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
                    {pendingCount} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authoritative verification gate. No user receives school access without explicit administrative approval.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Filter Status:</span>
            {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={loadRequests}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 cursor-pointer font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Feedback banners */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Request List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading && requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin text-indigo-500" />
              <p className="text-xs">Loading pending join requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Approval Queue Clear</p>
              <p className="text-[11px]">There are currently no {statusFilter.toLowerCase()} join requests awaiting verification.</p>
            </div>
          ) : (
            requests.map((r) => {
              const isPending = r.status === 'PENDING_APPROVAL';
              const isProcessing = processingId === r.id;

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {r.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                          Requested: {r.requestedRole}
                        </span>
                        {r.requestOrigin === 'QR_INVITATION' && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-semibold">
                            QR Invite #{r.invitationToken || 'Verified'}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                              : r.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                        {r.phone && <span>Phone: {r.phone}</span>}
                        {r.email && <span>Email: {r.email}</span>}
                        {r.employeeNumber && <span>ID: {r.employeeNumber}</span>}
                        <span>Requested: {new Date(r.requestedAt).toLocaleDateString()}</span>
                      </div>

                      {r.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          {r.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for pending requests */}
                  {isPending && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          Final Role:
                        </label>
                        <select
                          value={selectedRoleOverride[r.id] || r.requestedRole}
                          onChange={(e) =>
                            setSelectedRoleOverride({ ...selectedRoleOverride, [r.id]: e.target.value })
                          }
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        >
                          <option value="Teacher">Teacher</option>
                          <option value="Student">Student</option>
                          <option value="Parent">Parent / Guardian</option>
                          <option value="Staff">General Staff</option>
                          <option value="Administrator">Administrator</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleReject(r)}
                          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 dark:bg-slate-700 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 font-bold text-xs transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleApprove(r)}
                          className="min-h-[40px] px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
