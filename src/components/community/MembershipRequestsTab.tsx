import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  User,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { digitalCommunityApi } from '../../services/digitalCommunityApi';
import { GroupMembershipRequest, User as UserType } from '../../types';

interface MembershipRequestsTabProps {
  currentUser: UserType;
  onOpenGroupChat?: (groupId: string) => void;
  onRefreshData?: () => void;
}

export const MembershipRequestsTab: React.FC<MembershipRequestsTabProps> = ({
  currentUser,
  onOpenGroupChat,
  onRefreshData,
}) => {
  const isTeacherOrAdmin = ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'ICT Administrator'].includes(
    currentUser.role
  );

  const [activeSubTab, setActiveSubTab] = useState<'admin_queue' | 'my_requests'>(
    isTeacherOrAdmin ? 'admin_queue' : 'my_requests'
  );
  const [requests, setRequests] = useState<GroupMembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<GroupMembershipRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'admin_queue') {
        const data = await digitalCommunityApi.getAdminRequests(
          currentUser.id,
          undefined,
          currentUser.schoolId || 'school-001'
        );
        setRequests(data);
      } else {
        const data = await digitalCommunityApi.getMyRequests(
          currentUser.id,
          currentUser.schoolId || 'school-001'
        );
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch membership requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeSubTab, currentUser.id]);

  const handleOpenReviewModal = (req: GroupMembershipRequest, action: 'APPROVE' | 'REJECT') => {
    setSelectedRequest(req);
    setReviewAction(action);
    setReviewNotes('');
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;
    setSubmittingReview(true);
    try {
      const res = await digitalCommunityApi.reviewJoinRequest(
        selectedRequest.id,
        {
          action: reviewAction,
          reviewerId: currentUser.id,
          reviewerName: currentUser.fullName || currentUser.username,
          reviewerRole: currentUser.role,
          reviewNotes: reviewNotes.trim() || undefined,
        },
        currentUser.schoolId
      );

      if (res.success) {
        setFeedback({
          type: 'success',
          text: reviewAction === 'APPROVE'
            ? `Approved ${selectedRequest.studentName} for "${selectedRequest.groupName}"`
            : `Declined request from ${selectedRequest.studentName}`,
        });
        setSelectedRequest(null);
        fetchRequests();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Review failed' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const ok = await digitalCommunityApi.cancelJoinRequest(requestId, currentUser.id, currentUser.schoolId);
      if (ok) {
        setFeedback({ type: 'success', text: 'Request cancelled successfully.' });
        fetchRequests();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedback({ type: 'error', text: 'Failed to cancel request.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error while cancelling request.' });
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.studentName?.toLowerCase().includes(q);
      const matchGroup = r.groupName?.toLowerCase().includes(q);
      const matchReason = r.reason?.toLowerCase().includes(q);
      return matchName || matchGroup || matchReason;
    }
    return true;
  });

  return (
    <div id="membership-requests-container" className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Group Membership Requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Safeguarded review queue for group discovery and student enrollment.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          {isTeacherOrAdmin && (
            <button
              id="btn-subtab-admin-queue"
              onClick={() => setActiveSubTab('admin_queue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'admin_queue'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teacher Review Queue
            </button>
          )}
          <button
            id="btn-subtab-my-requests"
            onClick={() => setActiveSubTab('my_requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'my_requests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Submitted Requests
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          id="requests-feedback-toast"
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold uppercase opacity-70">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-requests-search"
            type="text"
            placeholder="Search candidate, group, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
            <button
              key={st}
              id={`filter-req-status-${st.toLowerCase()}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Status' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
          <button
            onClick={fetchRequests}
            title="Refresh"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div id="requests-loading-spinner" className="py-16 text-center text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-xs font-medium">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div id="requests-empty-card" className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-1" />
          <h4 className="text-sm font-bold text-slate-700">No membership requests found</h4>
          <p className="text-xs text-slate-400">
            {activeSubTab === 'admin_queue'
              ? 'No pending applications in your review queue.'
              : 'You have not submitted any join requests.'}
          </p>
        </div>
      ) : (
        <div id="requests-list-container" className="space-y-3">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';
            const isCancelled = req.status === 'CANCELLED';

            return (
              <div
                key={req.id}
                id={`request-item-${req.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {req.studentName}
                    </span>
                    {req.studentGrade && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {req.studentGrade} {req.studentStream ? `(${req.studentStream})` : ''}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">applied to</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {req.groupName || 'Community Group'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : isApproved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isRejected
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Statement / Reason */}
                  {req.reason && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{req.reason}"
                    </p>
                  )}

                  {/* Review Notes (if reviewed) */}
                  {req.reviewNotes && (
                    <p className="text-xs text-slate-500">
                      <strong>Patron feedback:</strong> {req.reviewNotes} (by {req.reviewedByName || 'Patron'})
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Requested on {new Date(req.requestedAt).toLocaleDateString()}</span>
                    {req.reviewedAt && (
                      <span>• Reviewed on {new Date(req.reviewedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {activeSubTab === 'admin_queue' && isPending ? (
                    <>
                      <button
                        id={`btn-approve-${req.id}`}
                        onClick={() => handleOpenReviewModal(req, 'APPROVE')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        id={`btn-reject-${req.id}`}
                        onClick={() => handleOpenReviewModal(req, 'REJECT')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </>
                  ) : null}

                  {activeSubTab === 'my_requests' && isPending ? (
                    <button
                      id={`btn-cancel-${req.id}`}
                      onClick={() => handleCancelRequest(req.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  ) : null}

                  {isApproved && onOpenGroupChat ? (
                    <button
                      onClick={() => onOpenGroupChat(req.groupId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Open Group
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REVIEW CONFIRMATION MODAL */}
      {selectedRequest && (
        <div
          id="modal-review-membership-request"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    reviewAction === 'APPROVE' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {reviewAction === 'APPROVE' ? 'Approve Membership' : 'Decline Application'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedRequest.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  Target Group: {selectedRequest.groupName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Reviewer Note / Feedback (Optional)
              </label>
              <textarea
                id="textarea-review-notes"
                rows={3}
                placeholder={
                  reviewAction === 'APPROVE'
                    ? 'e.g. Approved. Welcome to the lab sessions on Fridays!'
                    : 'e.g. Please consult with the academic dean regarding prerequisite coursework.'
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-review-submit"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-2 ${
                  reviewAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submittingReview && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm {reviewAction === 'APPROVE' ? 'Approval' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
