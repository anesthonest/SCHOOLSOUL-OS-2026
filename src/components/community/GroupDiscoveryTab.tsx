import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  Compass,
  Check,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Trophy,
  Code,
  GraduationCap,
  HeartHandshake,
  MessageSquare,
  Lock,
  LogOut,
  RefreshCw,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { digitalCommunityApi } from '../../services/digitalCommunityApi';
import { DigitalGroup, User } from '../../types';

interface GroupDiscoveryTabProps {
  currentUser: User;
  onOpenGroupChat: (groupId: string) => void;
  onRefreshData?: () => void;
}

export const GroupDiscoveryTab: React.FC<GroupDiscoveryTabProps> = ({
  currentUser,
  onOpenGroupChat,
  onRefreshData,
}) => {
  const [discoverGroups, setDiscoverGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals & Actions
  const [requestModalGroup, setRequestModalGroup] = useState<any | null>(null);
  const [joinReason, setJoinReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Leave Confirmation Modal
  const [leaveModalGroup, setLeaveModalGroup] = useState<any | null>(null);
  const [leavingGroup, setLeavingGroup] = useState(false);

  // Auto-Enrollment Loading
  const [isAutoEnrolling, setIsAutoEnrolling] = useState(false);

  const fetchDiscoveryData = async () => {
    setLoading(true);
    try {
      const data = await digitalCommunityApi.discoverGroups({
        userId: currentUser.id,
        schoolId: currentUser.schoolId || 'school-001',
        category: selectedCategory,
        query: searchQuery,
      });
      setDiscoverGroups(data);
    } catch (error) {
      console.error('Error discovering groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryData();
  }, [selectedCategory, searchQuery, currentUser.id]);

  const handleJoinClick = async (group: any) => {
    setFeedbackMessage(null);
    if (group.isAutoJoin) {
      // Instant auto-join
      try {
        const res = await digitalCommunityApi.requestJoinGroup(
          group.id,
          {
            studentId: currentUser.id,
            studentName: currentUser.fullName || currentUser.username,
            studentEmail: currentUser.email,
            studentGrade: (currentUser as any).classGrade || 'Senior 4',
            studentStream: (currentUser as any).stream || 'Stream A',
            reason: 'Auto-joined public school group.',
          },
          currentUser.schoolId
        );
        if (res.success) {
          setFeedbackMessage({ type: 'success', text: `Successfully joined ${group.name}!` });
          fetchDiscoveryData();
          if (onRefreshData) onRefreshData();
        } else {
          setFeedbackMessage({ type: 'error', text: res.message });
        }
      } catch (err: any) {
        setFeedbackMessage({ type: 'error', text: err.message || 'Failed to join group' });
      }
    } else {
      // Open modal for request with reason
      setRequestModalGroup(group);
      setJoinReason('');
    }
  };

  const handleSendJoinRequest = async () => {
    if (!requestModalGroup) return;
    setSubmittingRequest(true);
    try {
      const res = await digitalCommunityApi.requestJoinGroup(
        requestModalGroup.id,
        {
          studentId: currentUser.id,
          studentName: currentUser.fullName || currentUser.username,
          studentEmail: currentUser.email,
          studentGrade: (currentUser as any).classGrade || 'Senior 4',
          studentStream: (currentUser as any).stream || 'Stream A',
          reason: joinReason.trim() || 'Interested in contributing to this group activities.',
        },
        currentUser.schoolId
      );

      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: res.autoApproved
            ? `Welcome! You have been automatically added to ${requestModalGroup.name}.`
            : `Request submitted to the teacher patron of ${requestModalGroup.name}. You will be notified upon approval!`,
        });
        setRequestModalGroup(null);
        fetchDiscoveryData();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedbackMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Request failed' });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleConfirmLeaveGroup = async () => {
    if (!leaveModalGroup) return;
    setLeavingGroup(true);
    try {
      const res = await digitalCommunityApi.leaveGroup(
        leaveModalGroup.id,
        currentUser.id,
        currentUser.role,
        currentUser.schoolId
      );
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: `You have left ${leaveModalGroup.name}.` });
        setLeaveModalGroup(null);
        fetchDiscoveryData();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedbackMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to leave group' });
    } finally {
      setLeavingGroup(false);
    }
  };

  const handleTriggerAutoEnroll = async () => {
    setIsAutoEnrolling(true);
    try {
      const res = await digitalCommunityApi.autoEnrollAcademicGroups(
        {
          userId: currentUser.id,
          userName: currentUser.fullName || currentUser.username,
          userRole: currentUser.role,
          classGrade: (currentUser as any).classGrade || 'Senior 4',
          stream: (currentUser as any).stream || 'Stream A',
          subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
        },
        currentUser.schoolId
      );
      if (res.success && res.enrolledGroups.length > 0) {
        setFeedbackMessage({
          type: 'success',
          text: `Auto-enrolled in: ${res.enrolledGroups.join(', ')}`,
        });
      } else {
        setFeedbackMessage({
          type: 'success',
          text: 'Your academic group memberships are fully synchronized and up to date.',
        });
      }
      fetchDiscoveryData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Auto-enrollment synchronization error' });
    } finally {
      setIsAutoEnrolling(false);
    }
  };

  const categoryChips = [
    { id: 'ALL', label: 'All Groups', icon: Compass },
    { id: 'CLASS', label: 'Classes & Cohorts', icon: GraduationCap },
    { id: 'SUBJECT', label: 'Academic & STEM', icon: BookOpen },
    { id: 'CLUB', label: 'Clubs & Societies', icon: Code },
    { id: 'SPORT', label: 'Sports & Athletics', icon: Trophy },
    { id: 'STUDY', label: 'Peer Study Circles', icon: HeartHandshake },
  ];

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'CLASS':
        return GraduationCap;
      case 'SUBJECT':
        return BookOpen;
      case 'CLUB':
        return Code;
      case 'SPORT':
        return Trophy;
      case 'STUDY':
        return HeartHandshake;
      default:
        return Users;
    }
  };

  return (
    <div id="group-discovery-container" className="space-y-6">
      {/* Top Banner / Academic Enrollment Quick Action */}
      <div
        id="discovery-hero-card"
        className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              School Group Directory
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Discover & Connect with School Communities
            </h2>
            <p className="text-blue-100/90 text-sm leading-relaxed">
              Explore teacher-moderated study circles, academic subject labs, sports teams, and innovation clubs. Request membership safely with built-in safeguarding.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center shrink-0">
            <button
              id="btn-auto-enroll-sync"
              onClick={handleTriggerAutoEnroll}
              disabled={isAutoEnrolling}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAutoEnrolling ? 'animate-spin' : ''}`} />
              {isAutoEnrolling ? 'Syncing...' : 'Sync Academic Groups'}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedbackMessage && (
        <div
          id="discovery-feedback-toast"
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs uppercase tracking-wider font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div id="discovery-controls" className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-discovery-search"
              type="text"
              placeholder="Search groups by name, subject (e.g. PHY401), teacher patron, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            onClick={fetchDiscoveryData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryChips.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                id={`chip-cat-${chip.id.toLowerCase()}`}
                onClick={() => setSelectedCategory(chip.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div id="discovery-loading" className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-sm font-medium">Loading school group catalog...</p>
        </div>
      ) : discoverGroups.length === 0 ? (
        <div id="discovery-empty-state" className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching groups found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords or switching category filters to discover active school communities.
          </p>
        </div>
      ) : (
        <div id="discovery-groups-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {discoverGroups.map((group) => {
            const Icon = getGroupIcon(group.type);
            const isJoined = group.isMember;
            const hasPending = group.hasPendingRequest;
            const canLeave = group.canStudentLeave !== false && group.type !== 'CLASS';

            return (
              <div
                key={group.id}
                id={`card-group-${group.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md space-y-4"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                        {group.type}
                      </span>
                      {group.autoJoinEligible || group.requireApproval === false ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Instant Join
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Approval Req.
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {group.description || 'School communication group for curriculum and student collaboration.'}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{group.memberCount || 1} members</span>
                    </div>
                    {group.ownerName && (
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-slate-400">•</span>
                        <span className="truncate">Patron: {group.ownerName}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {group.tags && group.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {group.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[11px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isJoined ? (
                    <>
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <Check className="w-4 h-4" />
                        <span>Active Member</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-open-chat-${group.id}`}
                          onClick={() => onOpenGroupChat(group.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Open
                        </button>
                        {canLeave && (
                          <button
                            id={`btn-leave-${group.id}`}
                            onClick={() => setLeaveModalGroup(group)}
                            title="Leave group"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : hasPending ? (
                    <div className="w-full flex items-center justify-between bg-amber-50 text-amber-800 px-3 py-2 rounded-xl text-xs font-medium border border-amber-200">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span>Join Request Pending</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      id={`btn-join-${group.id}`}
                      onClick={() => handleJoinClick(group)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                    >
                      {group.autoJoinEligible || group.requireApproval === false ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Join Now
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-3.5 h-3.5" />
                          Request to Join
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REQUEST TO JOIN MODAL */}
      {requestModalGroup && (
        <div
          id="modal-request-to-join"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Membership Application
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Request to Join {requestModalGroup.name}
                </h3>
              </div>
              <button
                onClick={() => setRequestModalGroup(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <p>
                <strong>Patron:</strong> {requestModalGroup.ownerName || 'Staff Facilitator'}
              </p>
              <p>
                <strong>Group Rules:</strong>{' '}
                {requestModalGroup.rules && requestModalGroup.rules.length > 0
                  ? requestModalGroup.rules.join(', ')
                  : 'Respectful, academic discourse only.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Reason for Joining / Candidate Note
              </label>
              <textarea
                id="textarea-join-reason"
                rows={3}
                placeholder="Explain your interest (e.g., 'I want to build robotics projects' or 'Preparing for national debate competitions')..."
                value={joinReason}
                onChange={(e) => setJoinReason(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
              <p className="text-[11px] text-slate-400">
                This note will be reviewed by the patron/teacher before approval.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRequestModalGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="btn-submit-join-request"
                onClick={handleSendJoinRequest}
                disabled={submittingRequest}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submittingRequest && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE GROUP CONFIRMATION MODAL */}
      {leaveModalGroup && (
        <div
          id="modal-confirm-leave-group"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Leave {leaveModalGroup.name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You will no longer receive updates or participate in discussions for this group. You can request to rejoin at any time.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setLeaveModalGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-leave-group"
                onClick={handleConfirmLeaveGroup}
                disabled={leavingGroup}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {leavingGroup ? 'Leaving...' : 'Confirm Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
