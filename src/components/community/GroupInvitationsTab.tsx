import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Plus,
  Search,
  UserCheck,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Users,
  Check,
  X,
} from 'lucide-react';
import { digitalCommunityApi } from '../../services/digitalCommunityApi';
import { GroupInvitation, DigitalGroup, User } from '../../types';

interface GroupInvitationsTabProps {
  currentUser: User;
  onOpenGroupChat?: (groupId: string) => void;
  onRefreshData?: () => void;
}

export const GroupInvitationsTab: React.FC<GroupInvitationsTabProps> = ({
  currentUser,
  onOpenGroupChat,
  onRefreshData,
}) => {
  const isTeacherOrAdmin = ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'ICT Administrator'].includes(
    currentUser.role
  );

  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Send Invitation Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [groups, setGroups] = useState<DigitalGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeUserId, setInviteeUserId] = useState('');
  const [inviteeRole, setInviteeRole] = useState<'Student' | 'Teacher'>('Student');
  const [sendingInvite, setSendingInvite] = useState(false);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await digitalCommunityApi.getInvitations({
        userId: currentUser.id,
        schoolId: currentUser.schoolId || 'school-001',
      });
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
    if (isTeacherOrAdmin) {
      digitalCommunityApi
        .getGroups({ schoolId: currentUser.schoolId || 'school-001' })
        .then((grps) => {
          setGroups(grps);
          if (grps.length > 0) setSelectedGroupId(grps[0].id);
        })
        .catch(() => {});
    }
  }, [currentUser.id]);

  const handleRespond = async (invitationId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const res = await digitalCommunityApi.respondToInvitation(
        invitationId,
        action,
        currentUser.id,
        currentUser.schoolId
      );
      if (res.success) {
        setFeedback({
          type: 'success',
          text: action === 'ACCEPT'
            ? 'Invitation accepted! You are now a member of the group.'
            : 'Invitation declined.',
        });
        fetchInvitations();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Action failed' });
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !inviteeName.trim()) {
      setFeedback({ type: 'error', text: 'Please choose a group and enter candidate name.' });
      return;
    }

    setSendingInvite(true);
    try {
      const res = await digitalCommunityApi.inviteUser(
        selectedGroupId,
        {
          invitedUserId: inviteeUserId.trim() || `usr-student-${Date.now().toString().slice(-4)}`,
          invitedUserName: inviteeName.trim(),
          invitedUserRole: inviteeRole,
          invitedByUserId: currentUser.id,
          invitedByUserName: currentUser.fullName || currentUser.username,
          invitedByUserRole: currentUser.role,
          expiresDays: 7,
        },
        currentUser.schoolId
      );

      if (res.success) {
        setFeedback({ type: 'success', text: `Invitation sent to ${inviteeName.trim()} successfully!` });
        setShowInviteModal(false);
        setInviteeName('');
        setInviteeUserId('');
        fetchInvitations();
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Invitation failed' });
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div id="group-invitations-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Group Invitations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal invitations extended by teachers, patrons, and club coordinators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInvitations}
            title="Refresh"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isTeacherOrAdmin && (
            <button
              id="btn-open-invite-modal"
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Invite Student
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          id="invitations-feedback-toast"
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

      {/* Invitations List */}
      {loading ? (
        <div id="invitations-loading" className="py-16 text-center text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-xs font-medium">Checking invitations...</p>
        </div>
      ) : invitations.length === 0 ? (
        <div id="invitations-empty-card" className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Mail className="w-8 h-8 text-slate-300 mx-auto mb-1" />
          <h4 className="text-sm font-bold text-slate-700">No active invitations</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no pending group invitations. Explore the group directory to discover and request to join school communities!
          </p>
        </div>
      ) : (
        <div id="invitations-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitations.map((inv) => {
            const isPending = inv.status === 'PENDING';
            const isAccepted = inv.status === 'ACCEPTED';
            const isDeclined = inv.status === 'DECLINED';
            const isExpired = inv.status === 'EXPIRED';

            return (
              <div
                key={inv.id}
                id={`invitation-card-${inv.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                      {inv.groupType || 'CLUB'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : isAccepted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">
                      {inv.groupName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {inv.groupDescription || 'School communication and collaboration channel.'}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <p>
                      <strong>Invited by:</strong> {inv.invitedByUserName} ({inv.invitedByUserRole || 'Patron'})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Sent on {new Date(inv.invitedAt).toLocaleDateString()} • Expires{' '}
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isPending ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        id={`btn-accept-invite-${inv.id}`}
                        onClick={() => handleRespond(inv.id, 'ACCEPT')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        id={`btn-decline-invite-${inv.id}`}
                        onClick={() => handleRespond(inv.id, 'DECLINE')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  ) : isAccepted && onOpenGroupChat ? (
                    <button
                      onClick={() => onOpenGroupChat(inv.groupId)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Open Group Forum
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Response recorded ({inv.status.toLowerCase()})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INVITE CANDIDATE MODAL */}
      {showInviteModal && (
        <div
          id="modal-send-invitation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Group Invitation Dispatch
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Invite Member to Group
                </h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvitation} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Group
                </label>
                <select
                  id="select-invite-group"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Student / Member Full Name
                </label>
                <input
                  id="input-invitee-name"
                  type="text"
                  placeholder="e.g. Grace Nakato"
                  value={inviteeName}
                  onChange={(e) => setInviteeName(e.target.value)}
                  required
                  className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Role in Group
                  </label>
                  <select
                    id="select-invite-role"
                    value={inviteeRole}
                    onChange={(e) => setInviteeRole(e.target.value as any)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher / Co-Patron</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Optional User ID
                  </label>
                  <input
                    id="input-invitee-userid"
                    type="text"
                    placeholder="e.g. usr-student-1"
                    value={inviteeUserId}
                    onChange={(e) => setInviteeUserId(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-send-invite"
                  disabled={sendingInvite}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {sendingInvite && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
