import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  MessageSquare,
  Megaphone,
  FolderGit2,
  ShieldCheck,
  Plus,
  Search,
  Lock,
  Globe,
  Pin,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Flag,
  UserCheck,
  BookOpen,
  Filter,
  Check,
  X,
  Share2,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  CornerDownRight,
  Eye,
  Trash2,
  RefreshCw,
  Compass,
  Bell,
  Mail,
  UserPlus,
} from 'lucide-react';
import { digitalCommunityApi } from '../services/digitalCommunityApi';
import { GroupDiscoveryTab } from '../components/community/GroupDiscoveryTab';
import { MembershipRequestsTab } from '../components/community/MembershipRequestsTab';
import { GroupInvitationsTab } from '../components/community/GroupInvitationsTab';
import { GroupNotificationsModal } from '../components/community/GroupNotificationsModal';
import {
  DigitalGroup,
  GroupMembership,
  CommunityMessage,
  CommunityAnnouncement,
  CommunityProject,
  CommunityReport,
  CommunityModerationAction,
  User,
  CommunityAttachment,
} from '../types';

interface DigitalCommunityPageProps {
  currentUser?: User;
}

export const DigitalCommunityPage: React.FC<DigitalCommunityPageProps> = ({ currentUser }) => {
  const activeUser: User = currentUser || {
    id: 'usr-admin-1',
    username: 'admin',
    fullName: 'Administrator Desk',
    email: 'admin@schoolsoul.org',
    phone: '+256700000000',
    employeeNumber: 'ADM-001',
    role: 'Administrator',
    status: 'Active',
    schoolId: 'school-001',
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const isStaffOrAdmin = ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'ICT Administrator'].includes(activeUser.role);
  const isModerator = ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'].includes(activeUser.role);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'discussions' | 'discovery' | 'requests' | 'invitations' | 'announcements' | 'projects' | 'moderation'>('discussions');

  // Groups & Chat State
  const [groups, setGroups] = useState<DigitalGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupTypeFilter, setGroupTypeFilter] = useState<string>('ALL');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [members, setMembers] = useState<GroupMembership[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showGroupInfoDrawer, setShowGroupInfoDrawer] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Badge & Notification Counts
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>([]);
  const [announcementScopeFilter, setAnnouncementScopeFilter] = useState<string>('ALL');

  // Projects State
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('ALL');

  // Safeguarding & Moderation State
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [moderationLogs, setModerationLogs] = useState<CommunityModerationAction[]>([]);
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('PENDING');

  // Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'MESSAGE' | 'USER' | 'GROUP'; id: string; name?: string; content?: string } | null>(null);
  const [showResolveReportModal, setShowResolveReportModal] = useState<CommunityReport | null>(null);

  // Form States for Group Creation
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupType, setNewGroupType] = useState<'CLASS' | 'SUBJECT' | 'CLUB' | 'HOUSE' | 'STAFF' | 'OTHER'>('CLUB');
  const [newGroupVisibility, setNewGroupVisibility] = useState<'SCHOOL_DISCOVERABLE' | 'SCHOOL_VISIBLE' | 'PRIVATE' | 'INVITE_ONLY'>('SCHOOL_DISCOVERABLE');
  const [newGroupAllowStudentPosts, setNewGroupAllowStudentPosts] = useState(true);
  const [newGroupRequireApproval, setNewGroupRequireApproval] = useState(true);
  const [newGroupAutoJoinEligible, setNewGroupAutoJoinEligible] = useState(false);
  const [newGroupCanStudentLeave, setNewGroupCanStudentLeave] = useState(true);
  const [newGroupAllowedGrades, setNewGroupAllowedGrades] = useState('Senior 1, Senior 2, Senior 3, Senior 4, Senior 5, Senior 6');
  const [newGroupRules, setNewGroupRules] = useState('1. Respect peer opinions\n2. No abusive language\n3. Stay on educational topic');

  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [newAnnScope, setNewAnnScope] = useState<'SCHOOL_WIDE' | 'CLASS' | 'CLUB' | 'STAFF_ONLY'>('SCHOOL_WIDE');

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjSubject, setNewProjSubject] = useState('STEM & Science');
  const [newProjTasks, setNewProjTasks] = useState('Project design schematic\nComponent assembly & coding\nTesting & demonstration video');

  const [reportReason, setReportReason] = useState<'BULLYING' | 'HARASSMENT' | 'THREAT' | 'SEXUAL_CONTENT' | 'HATE_SPEECH' | 'SPAM' | 'INAPPROPRIATE_MEDIA' | 'OTHER'>('BULLYING');
  const [reportDetails, setReportDetails] = useState('');

  const [moderationActionType, setModerationActionType] = useState<string>('HIDE_MESSAGE');
  const [moderationNotes, setModerationNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------
  // DATA LOADING
  // ----------------------------------------------------
  const loadAllData = async () => {
    try {
      const [fetchedGroups, fetchedAnnouncements, fetchedProjects, notifs, invites, reqs] = await Promise.all([
        digitalCommunityApi.getGroups({ schoolId: activeUser.schoolId }),
        digitalCommunityApi.getAnnouncements({ schoolId: activeUser.schoolId }),
        digitalCommunityApi.getProjects({ schoolId: activeUser.schoolId }),
        digitalCommunityApi.getNotifications(activeUser.id, activeUser.schoolId),
        digitalCommunityApi.getInvitations({ userId: activeUser.id, schoolId: activeUser.schoolId }),
        isModerator
          ? digitalCommunityApi.getAdminRequests(activeUser.id, undefined, activeUser.schoolId)
          : digitalCommunityApi.getMyRequests(activeUser.id, activeUser.schoolId),
      ]);

      setGroups(fetchedGroups);
      setAnnouncements(fetchedAnnouncements);
      setProjects(fetchedProjects);
      setUnreadNotifsCount(notifs.filter((n) => !n.read).length);
      setPendingInvitationsCount(invites.filter((i) => i.status === 'PENDING').length);
      setPendingRequestsCount(reqs.filter((r) => r.status === 'PENDING').length);

      if (fetchedGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(fetchedGroups[0].id);
      }

      if (isModerator) {
        const [fetchedReports, fetchedLogs] = await Promise.all([
          digitalCommunityApi.getReports(undefined, activeUser.schoolId),
          digitalCommunityApi.getModerationLogs(activeUser.schoolId),
        ]);
        setReports(fetchedReports);
        setModerationLogs(fetchedLogs);
      }
    } catch (err) {
      console.error('Error loading community data:', err);
    }
  };

  const handleOpenGroupChat = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveTab('discussions');
  };

  useEffect(() => {
    loadAllData();
  }, [activeUser.schoolId]);

  // Load Messages when Selected Group Changes
  useEffect(() => {
    if (!selectedGroupId) return;

    let isMounted = true;
    setIsLoadingMessages(true);

    const loadGroupDetails = async () => {
      try {
        const [fetchedMsgs, fetchedMems] = await Promise.all([
          digitalCommunityApi.getMessages(selectedGroupId, isModerator, activeUser.schoolId),
          digitalCommunityApi.getGroupMembers(selectedGroupId, activeUser.schoolId),
        ]);
        if (isMounted) {
          setMessages(fetchedMsgs);
          setMembers(fetchedMems);
          setIsLoadingMessages(false);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Failed to load group messages:', err);
        if (isMounted) setIsLoadingMessages(false);
      }
    };

    loadGroupDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedGroupId, isModerator]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ----------------------------------------------------
  // GROUP ACTIONS
  // ----------------------------------------------------
  const selectedGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchType = groupTypeFilter === 'ALL' || g.type === groupTypeFilter;
      const matchQuery =
        !groupSearchQuery ||
        g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(groupSearchQuery.toLowerCase()));
      return matchType && matchQuery;
    });
  }, [groups, groupTypeFilter, groupSearchQuery]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const rulesArray = newGroupRules
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const gradesArray = newGroupAllowedGrades
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const newGroup = await digitalCommunityApi.createGroup(
      {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        type: newGroupType,
        visibility: newGroupVisibility,
        ownerId: activeUser.id,
        ownerName: activeUser.fullName || activeUser.username,
        ownerRole: activeUser.role,
        allowStudentPosts: newGroupAllowStudentPosts,
        requireApproval: newGroupRequireApproval,
        autoJoinEligible: newGroupAutoJoinEligible,
        canStudentLeave: newGroupCanStudentLeave,
        allowedGradeLevels: gradesArray.length > 0 ? gradesArray : undefined,
        rules: rulesArray,
        tags: [newGroupType, 'Community'],
      },
      activeUser.schoolId
    );

    setGroups((prev) => [newGroup, ...prev]);
    setSelectedGroupId(newGroup.id);
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    loadAllData();
  };

  // ----------------------------------------------------
  // MESSAGE SEND & REACTIONS
  // ----------------------------------------------------
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGroupId || !messageInput.trim()) return;

    const textToSend = messageInput.trim();
    setMessageInput('');

    const newMsg = await digitalCommunityApi.sendMessage(
      selectedGroupId,
      {
        senderId: activeUser.id,
        senderName: activeUser.fullName || activeUser.username,
        senderRole: activeUser.role,
        content: textToSend,
        messageType: 'TEXT',
        replyToMessageId: replyingTo?.id,
        replyToPreview: replyingTo
          ? {
              id: replyingTo.id,
              senderName: replyingTo.senderName,
              content: replyingTo.content.substring(0, 80),
            }
          : undefined,
      },
      activeUser.schoolId
    );

    setMessages((prev) => [...prev, newMsg]);
    setReplyingTo(null);
    scrollToBottom();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedGroupId) return;

    try {
      setIsUploading(true);
      const attachment = await digitalCommunityApi.uploadMedia(file, activeUser.schoolId);

      const newMsg = await digitalCommunityApi.sendMessage(
        selectedGroupId,
        {
          senderId: activeUser.id,
          senderName: activeUser.fullName || activeUser.username,
          senderRole: activeUser.role,
          content: `Shared file: ${attachment.fileName}`,
          messageType: attachment.fileType === 'image' ? 'IMAGE' : 'FILE',
          attachments: [attachment],
        },
        activeUser.schoolId
      );

      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const updated = await digitalCommunityApi.reactToMessage(messageId, emoji, activeUser.id, activeUser.schoolId);
    if (updated) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
    }
  };

  const handlePinMessage = async (messageId: string) => {
    const updated = await digitalCommunityApi.pinMessage(messageId, activeUser.schoolId);
    if (updated) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to remove this message?')) return;
    await digitalCommunityApi.deleteMessage(messageId, activeUser.schoolId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // ----------------------------------------------------
  // ANNOUNCEMENTS ACTIONS
  // ----------------------------------------------------
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    const newAnn = await digitalCommunityApi.createAnnouncement(
      {
        title: newAnnTitle.trim(),
        content: newAnnContent.trim(),
        priority: newAnnPriority,
        targetScope: newAnnScope,
        authorId: activeUser.id,
        authorName: activeUser.fullName || activeUser.username,
        authorRole: activeUser.role,
        isPinned: newAnnPriority === 'CRITICAL' || newAnnPriority === 'HIGH',
      },
      activeUser.schoolId
    );

    setAnnouncements((prev) => [newAnn, ...prev]);
    setShowCreateAnnouncementModal(false);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  const handleAcknowledgeAnnouncement = async (annId: string) => {
    await digitalCommunityApi.acknowledgeAnnouncement(annId, activeUser.id, activeUser.schoolId);
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === annId) {
          const acks = a.acknowledgements || [];
          return {
            ...a,
            acknowledgements: acks.includes(activeUser.id) ? acks : [...acks, activeUser.id],
          };
        }
        return a;
      })
    );
  };

  // ----------------------------------------------------
  // PROJECTS ACTIONS
  // ----------------------------------------------------
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !selectedGroupId) return;

    const taskList = newProjTasks
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title) => ({
        id: `tsk-${Math.random().toString(36).substring(2, 7)}`,
        title,
        isCompleted: false,
      }));

    const newProj = await digitalCommunityApi.createProject(
      {
        groupId: selectedGroupId,
        title: newProjTitle.trim(),
        description: newProjDesc.trim(),
        subject: newProjSubject.trim(),
        leadTeacherId: activeUser.id,
        leadTeacherName: activeUser.fullName || activeUser.username,
        studentMemberIds: [activeUser.id],
        studentMemberNames: [activeUser.fullName || activeUser.username],
        tasks: taskList,
      },
      activeUser.schoolId
    );

    setProjects((prev) => [newProj, ...prev]);
    setShowCreateProjectModal(false);
    setNewProjTitle('');
    setNewProjDesc('');
  };

  const handleToggleTask = async (projectId: string, taskId: string, currentStatus: boolean) => {
    const updated = await digitalCommunityApi.updateProjectTask(
      projectId,
      { taskId, isCompleted: !currentStatus },
      activeUser.schoolId
    );
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    }
  };

  // ----------------------------------------------------
  // SAFEGUARDING & REPORT MODAL
  // ----------------------------------------------------
  const handleOpenReportModal = (target: { type: 'MESSAGE' | 'USER' | 'GROUP'; id: string; name?: string; content?: string }) => {
    setReportTarget(target);
    setReportReason('BULLYING');
    setReportDetails('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;

    const newRep = await digitalCommunityApi.submitReport(
      {
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        groupId: selectedGroupId || undefined,
        groupName: selectedGroup?.name,
        reportedUserName: reportTarget.name,
        reportedByUserId: activeUser.id,
        reportedByUserName: activeUser.fullName || activeUser.username,
        reportedByUserRole: activeUser.role,
        reasonCategory: reportReason,
        reasonDetails: reportDetails.trim(),
        evidenceContent: reportTarget.content,
      },
      activeUser.schoolId
    );

    setReports((prev) => [newRep, ...prev]);
    setShowReportModal(false);
    alert('Thank you. Your safeguarding report has been submitted confidentially to the school moderation desk.');
  };

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResolveReportModal) return;

    const updated = await digitalCommunityApi.resolveReport(
      showResolveReportModal.id,
      {
        actionType: moderationActionType,
        resolutionNotes: moderationNotes.trim(),
        moderatorId: activeUser.id,
        moderatorName: activeUser.fullName || activeUser.username,
        moderatorRole: activeUser.role,
      },
      activeUser.schoolId
    );

    if (updated) {
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      // Refresh logs & messages
      const logs = await digitalCommunityApi.getModerationLogs(activeUser.schoolId);
      setModerationLogs(logs);
      if (selectedGroupId) {
        const msgs = await digitalCommunityApi.getMessages(selectedGroupId, isModerator, activeUser.schoolId);
        setMessages(msgs);
      }
    }
    setShowResolveReportModal(null);
    setModerationNotes('');
  };

  const pinnedMessage = useMemo(() => {
    return messages.find((m) => m.isPinned && m.status === 'ACTIVE');
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER & SUMMARY METRICS BANNER */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Digital Community & Collaboration Hub</h1>
                <p className="text-sm text-slate-500">
                  Secure, school-controlled digital spaces for academic discussions, STEM projects, and institutional notices.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Community Activity Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span>Alerts</span>
              {unreadNotifsCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('discovery')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Explore Groups</span>
            </button>

            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Channel</span>
            </button>

            {isStaffOrAdmin && (
              <button
                onClick={() => setShowCreateAnnouncementModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Megaphone className="w-4 h-4 text-slate-600" />
                <span>Post Notice</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 font-semibold">
              {groups.length}
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Active Channels</div>
              <div className="text-sm font-bold text-slate-800">{groups.filter((g) => g.status === 'ACTIVE').length} Running</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-semibold">
              {announcements.length}
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Campus Bulletins</div>
              <div className="text-sm font-bold text-slate-800">{announcements.filter((a) => a.isPinned).length} Pinned Priority</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 font-semibold">
              {projects.length}
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Collaborative STEM</div>
              <div className="text-sm font-bold text-slate-800">{projects.filter((p) => p.status === 'IN_PROGRESS').length} In Progress</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Safeguarding Mode</div>
              <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Active & Monitored
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* NAVIGATION TABS */}
      {/* ---------------------------------------------------- */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-6 min-w-max">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'discussions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Channels & Discussions</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {groups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('discovery')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'discovery'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Discover Groups</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amber-500" />
            <span>Membership Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'invitations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-500" />
            <span>Invitations</span>
            {pendingInvitationsCount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {pendingInvitationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'announcements'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Campus Bulletins</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {announcements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Student STEM Hub & Projects</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {projects.length}
            </span>
          </button>

          {isModerator && (
            <button
              onClick={() => setActiveTab('moderation')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'moderation'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Safeguarding & Moderation Desk</span>
              {reports.filter((r) => r.status === 'PENDING').length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                  {reports.filter((r) => r.status === 'PENDING').length} Pending
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: CHANNELS & REAL-TIME DISCUSSIONS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Left Column: Channels / Groups Explorer (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
            <div className="p-3.5 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search channels or topics..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {['ALL', 'CLASS', 'SUBJECT', 'CLUB', 'STAFF', 'OTHER'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setGroupTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                      groupTypeFilter === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'ALL' ? 'All Channels' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredGroups.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  No channels match your filter.
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = group.id === selectedGroupId;
                  return (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {group.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{group.name}</h4>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                            {group.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{group.description || 'General discussions'}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {group.memberCount} members
                          </span>
                          {group.visibility === 'PRIVATE' ? (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Lock className="w-3 h-3" /> Private
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Globe className="w-3 h-3" /> Public
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Middle Column: Chat & Message Thread (8 cols if drawer closed) */}
          <div className={`${showGroupInfoDrawer ? 'lg:col-span-5' : 'lg:col-span-8'} flex flex-col h-full bg-white`}>
            {selectedGroup ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {selectedGroup.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 truncate">{selectedGroup.name}</h3>
                        <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {selectedGroup.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedGroup.memberCount} members • Moderated by {selectedGroup.ownerName} ({selectedGroup.ownerRole})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGroupInfoDrawer(!showGroupInfoDrawer)}
                      className={`p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ${
                        showGroupInfoDrawer ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                      title="Group Details & Rules"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Pinned Message Banner */}
                {pinnedMessage && (
                  <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2 truncate">
                      <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold">{pinnedMessage.senderName}:</span>
                      <span className="truncate">{pinnedMessage.content}</span>
                    </div>
                    {isModerator && (
                      <button
                        onClick={() => handlePinMessage(pinnedMessage.id)}
                        className="text-amber-700 hover:underline shrink-0 ml-2"
                      >
                        Unpin
                      </button>
                    )}
                  </div>
                )}

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading discussion...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
                      <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                      <h4 className="text-sm font-semibold text-slate-700">No messages in this channel yet</h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Start the academic discussion or ask a question. All posts are school-monitored.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === activeUser.id;
                      const isDeleted = msg.status === 'DELETED';
                      const isFlagged = msg.status === 'FLAGGED';

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0">
                            {msg.senderName.substring(0, 2).toUpperCase()}
                          </div>

                          <div className={`max-w-[78%] space-y-1 ${isOwn ? 'items-end' : ''}`}>
                            {/* Author Name and Role */}
                            <div className={`flex items-center gap-2 text-xs ${isOwn ? 'justify-end' : ''}`}>
                              <span className="font-semibold text-slate-800">{msg.senderName}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-sm font-medium ${
                                  msg.senderRole === 'Teacher'
                                    ? 'bg-blue-100 text-blue-800'
                                    : msg.senderRole === 'Headteacher' || msg.senderRole === 'Administrator'
                                    ? 'bg-purple-100 text-purple-800'
                                    : msg.senderRole === 'Parent'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {msg.senderRole}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Reply-To Preview */}
                            {msg.replyToPreview && (
                              <div className="text-xs bg-slate-200/70 border-l-2 border-blue-500 rounded-r-md px-2.5 py-1 text-slate-600 flex items-center gap-1.5">
                                <CornerDownRight className="w-3 h-3 text-blue-600" />
                                <span className="font-semibold">{msg.replyToPreview.senderName}:</span>
                                <span className="truncate">{msg.replyToPreview.content}</span>
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`p-3 rounded-xl text-sm leading-relaxed ${
                                isDeleted
                                  ? 'bg-slate-100 text-slate-400 italic'
                                  : isFlagged && isModerator
                                  ? 'bg-amber-50 border border-amber-300 text-amber-900'
                                  : isOwn
                                  ? 'bg-blue-600 text-white rounded-tr-xs'
                                  : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-2xs'
                              }`}
                            >
                              {isFlagged && isModerator && (
                                <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mb-1">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Flagged by Safeguarding Scanner
                                </div>
                              )}

                              <div>{msg.content}</div>

                              {/* Media Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.attachments.map((att) => (
                                    <div key={att.id} className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-2">
                                      {att.fileType === 'image' ? (
                                        <img src={att.url} alt={att.fileName} className="max-h-48 rounded-md object-contain" />
                                      ) : (
                                        <a
                                          href={att.url}
                                          download={att.fileName}
                                          className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
                                        >
                                          <FileText className="w-4 h-4" />
                                          <span>{att.fileName}</span>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Emoji Reactions Strip */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                {msg.reactions.map((r, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleReaction(msg.id, r.emoji)}
                                    className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                                      r.userIds.includes(activeUser.id)
                                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span>{r.emoji}</span>
                                    <span>{r.count}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Message Hover Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 pt-0.5 text-xs text-slate-400">
                              <button
                                onClick={() => setReplyingTo(msg)}
                                className="hover:text-blue-600 flex items-center gap-1"
                              >
                                Reply
                              </button>

                              {/* Quick Reaction buttons */}
                              {['👍', '💡', '❤️', '👏'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}

                              {isModerator && (
                                <button
                                  onClick={() => handlePinMessage(msg.id)}
                                  className="hover:text-amber-600"
                                  title="Pin message"
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {(isOwn || isModerator) && (
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="hover:text-red-600"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {!isOwn && (
                                <button
                                  onClick={() =>
                                    handleOpenReportModal({
                                      type: 'MESSAGE',
                                      id: msg.id,
                                      name: msg.senderName,
                                      content: msg.content,
                                    })
                                  }
                                  className="hover:text-red-600 flex items-center gap-1 text-[11px]"
                                  title="Report for safeguarding review"
                                >
                                  <Flag className="w-3 h-3 text-slate-400 hover:text-red-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Replying Banner */}
                {replyingTo && (
                  <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-blue-600" />
                      <span>Replying to <strong>{replyingTo.senderName}</strong>: "{replyingTo.content.substring(0, 50)}..."</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Message Input Box */}
                <div className="p-3 border-t border-slate-200 bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Upload safe document or image (Max 25MB)"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      placeholder={
                        selectedGroup.allowStudentPosts || isStaffOrAdmin
                          ? 'Type an educational message or query...'
                          : 'Only teachers and administrators can post in this channel'
                      }
                      disabled={!selectedGroup.allowStudentPosts && !isStaffOrAdmin}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />

                    <button
                      type="submit"
                      disabled={(!messageInput.trim() && !isUploading) || (!selectedGroup.allowStudentPosts && !isStaffOrAdmin)}
                      className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 px-1">
                    <span>Press Enter to send • Verified School Network</span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck className="w-3 h-3" /> Anti-Bullying Monitored
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <Users className="w-12 h-12 text-slate-300 mb-2" />
                <p>Select a channel from the left to start collaborating.</p>
              </div>
            )}
          </div>

          {/* Right Drawer: Group Information & Rules (3 cols if open) */}
          {showGroupInfoDrawer && selectedGroup && (
            <div className="lg:col-span-3 border-l border-slate-200 p-4 bg-slate-50/70 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Channel Overview</h4>
                <button onClick={() => setShowGroupInfoDrawer(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Group Metadata Card */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Channel Name:</span>
                  <div className="font-semibold text-slate-800">{selectedGroup.name}</div>
                </div>
                <div>
                  <span className="text-slate-400">Purpose:</span>
                  <div className="text-slate-600">{selectedGroup.description || 'Academic collaboration forum.'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Owner / Facilitator:</span>
                  <div className="font-medium text-blue-700">{selectedGroup.ownerName} ({selectedGroup.ownerRole})</div>
                </div>
              </div>

              {/* Group Rules */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Community Rules
                </h5>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  {selectedGroup.rules && selectedGroup.rules.length > 0 ? (
                    selectedGroup.rules.map((rule, idx) => <li key={idx}>{rule}</li>)
                  ) : (
                    <li>Respectful educational language only</li>
                  )}
                </ul>
              </div>

              {/* Members List */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Channel Members ({members.length})
                </h5>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {members.map((mem) => (
                    <div key={mem.id} className="py-1.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-slate-800">{mem.userName}</div>
                        <div className="text-[10px] text-slate-400">{mem.userRole}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                        {mem.groupRole}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: DISCOVER & JOIN GROUPS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'discovery' && (
        <GroupDiscoveryTab
          currentUser={activeUser}
          onOpenGroupChat={handleOpenGroupChat}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: MEMBERSHIP REQUESTS (STUDENT & TEACHER REVIEW) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'requests' && (
        <MembershipRequestsTab
          currentUser={activeUser}
          onOpenGroupChat={handleOpenGroupChat}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: GROUP INVITATIONS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'invitations' && (
        <GroupInvitationsTab
          currentUser={activeUser}
          onOpenGroupChat={handleOpenGroupChat}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: CAMPUS BULLETINS & ANNOUNCEMENTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2">
              {['ALL', 'SCHOOL_WIDE', 'CLASS', 'CLUB', 'STAFF_ONLY'].map((scope) => (
                <button
                  key={scope}
                  onClick={() => setAnnouncementScopeFilter(scope)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    announcementScopeFilter === scope
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {scope === 'ALL' ? 'All Scope' : scope.replace('_', ' ')}
                </button>
              ))}
            </div>

            {isStaffOrAdmin && (
              <button
                onClick={() => setShowCreateAnnouncementModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campus Notice</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements
              .filter((a) => announcementScopeFilter === 'ALL' || a.targetScope === announcementScopeFilter)
              .map((ann) => {
                const isAcknowledged = ann.acknowledgements?.includes(activeUser.id);
                return (
                  <div
                    key={ann.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 relative ${
                      ann.priority === 'CRITICAL'
                        ? 'border-red-300 bg-red-50/30'
                        : ann.priority === 'HIGH'
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {ann.isPinned && (
                      <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ann.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : ann.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{ann.targetScope.replace('_', ' ')}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div>
                        Issued by <strong>{ann.authorName}</strong> ({ann.authorRole}) • {new Date(ann.createdAt).toLocaleDateString()}
                      </div>

                      <button
                        onClick={() => handleAcknowledgeAnnouncement(ann.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                          isAcknowledged
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isAcknowledged ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: STUDENT STEM HUB & COLLABORATIVE PROJECTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2">
              {['ALL', 'IN_PROGRESS', 'SUBMITTED', 'ASSESSED', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setProjectStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    projectStatusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Launch STEM Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects
              .filter((p) => projectStatusFilter === 'ALL' || p.status === projectStatusFilter)
              .map((proj) => {
                const totalTasks = proj.tasks.length;
                const completedTasks = proj.tasks.filter((t) => t.isCompleted).length;
                const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={proj.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                          {proj.subject}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            proj.status === 'ASSESSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {proj.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{proj.description}</p>

                      {/* Progress Meter */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                          <span>Team Deliverables</span>
                          <span>{progressPct}% ({completedTasks}/{totalTasks})</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Interactive Tasks List */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-xs font-semibold text-slate-700">Milestone Tasks:</span>
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {proj.tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleToggleTask(proj.id, task.id, task.isCompleted)}
                              className="flex items-center gap-2 text-xs p-1.5 rounded-md hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200"
                            >
                              <input
                                type="checkbox"
                                checked={task.isCompleted}
                                readOnly
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className={`flex-1 truncate ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Teacher Feedback Badge */}
                      {proj.teacherFeedback && proj.teacherFeedback.length > 0 && (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1 text-emerald-900">
                          <div className="font-bold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-emerald-600" />
                              Evaluated by {proj.teacherFeedback[0].teacherName}
                            </span>
                            {proj.teacherFeedback[0].gradeScore !== undefined && (
                              <span className="bg-emerald-200 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                                {proj.teacherFeedback[0].gradeScore}%
                              </span>
                            )}
                          </div>
                          <p className="text-emerald-800 italic">"{proj.teacherFeedback[0].comments}"</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                      <div>Lead: <strong>{proj.leadTeacherName}</strong></div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: SAFEGUARDING & MODERATION CENTRE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'moderation' && isModerator && (
        <div className="space-y-6">
          {/* Top Safeguarding Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900">
              <div className="text-xs font-semibold text-red-700 uppercase">Pending Incident Queue</div>
              <div className="text-2xl font-extrabold mt-1">{reports.filter((r) => r.status === 'PENDING').length}</div>
              <div className="text-xs text-red-600 mt-1">Requires immediate pedagogical or disciplinary review</div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
              <div className="text-xs font-semibold text-emerald-700 uppercase">Resolved Actions</div>
              <div className="text-2xl font-extrabold mt-1">{reports.filter((r) => r.status === 'ACTION_TAKEN').length}</div>
              <div className="text-xs text-emerald-600 mt-1">Mitigated with logged audit trails</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Flagged Events</div>
              <div className="text-2xl font-extrabold mt-1">{moderationLogs.length}</div>
              <div className="text-xs text-slate-500 mt-1">Immutable disciplinary audit records stored</div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <span>Safeguarding Incident Reports</span>
              </h3>

              <div className="flex gap-2 text-xs">
                {['ALL', 'PENDING', 'ACTION_TAKEN', 'DISMISSED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      reportStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {reports
                .filter((r) => reportStatusFilter === 'ALL' || r.status === reportStatusFilter)
                .map((rep) => (
                  <div key={rep.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rep.status === 'PENDING'
                              ? 'bg-red-100 text-red-800'
                              : rep.status === 'ACTION_TAKEN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rep.status}
                        </span>
                        <span className="text-xs font-bold text-slate-800 uppercase">{rep.reasonCategory}</span>
                        <span className="text-xs text-slate-400">• Channel: {rep.groupName || 'Direct'}</span>
                      </div>

                      <div className="text-sm font-semibold text-slate-900">
                        Reported User: <span className="text-red-700">{rep.reportedUserName || 'Target User'}</span> • By:{' '}
                        <span className="text-slate-700">{rep.reportedByUserName}</span> ({rep.reportedByUserRole})
                      </div>

                      {rep.reasonDetails && <p className="text-xs text-slate-600">{rep.reasonDetails}</p>}

                      {rep.evidenceContent && (
                        <div className="text-xs bg-slate-100 border border-slate-200 rounded-md p-2 text-slate-700 italic">
                          "{rep.evidenceContent}"
                        </div>
                      )}

                      {rep.resolutionNotes && (
                        <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md p-2">
                          <strong>Resolution by {rep.assignedModeratorName}:</strong> {rep.resolutionNotes}
                        </div>
                      )}
                    </div>

                    {rep.status === 'PENDING' && (
                      <button
                        onClick={() => setShowResolveReportModal(rep)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shrink-0"
                      >
                        Take Action
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Immutable Moderation Logs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Disciplinary & Moderation Audit Trail</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Action Applied</th>
                    <th className="p-2.5">Target</th>
                    <th className="p-2.5">Moderator</th>
                    <th className="p-2.5">Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {moderationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-2.5 font-bold text-slate-800">{log.actionType}</td>
                      <td className="p-2.5 text-slate-600">{log.targetType}</td>
                      <td className="p-2.5 text-slate-700">{log.moderatorName} ({log.moderatorRole})</td>
                      <td className="p-2.5 text-slate-600 italic">{log.actionDetails}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE CHANNEL / GROUP */}
      {/* ---------------------------------------------------- */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Academic / Community Channel</h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior 4 Biology STEM Forum"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Group Type</label>
                  <select
                    value={newGroupType}
                    onChange={(e: any) => setNewGroupType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CLASS">Class Stream Forum</option>
                    <option value="SUBJECT">Academic Subject & STEM Lab</option>
                    <option value="CLUB">Extracurricular Club & Society</option>
                    <option value="HOUSE">School House</option>
                    <option value="STAFF">Teaching / Staff Room</option>
                    <option value="OTHER">General Community / PTA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discovery Visibility</label>
                  <select
                    value={newGroupVisibility}
                    onChange={(e: any) => setNewGroupVisibility(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SCHOOL_DISCOVERABLE">Discoverable to All Students</option>
                    <option value="SCHOOL_VISIBLE">Visible in Catalog</option>
                    <option value="INVITE_ONLY">Invite Only (Not in Catalog)</option>
                    <option value="PRIVATE">Strictly Private / Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed Grade Levels (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Senior 1, Senior 2, Senior 3"
                  value={newGroupAllowedGrades}
                  onChange={(e) => setNewGroupAllowedGrades(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                />
                <span className="text-[10px] text-slate-400">Leave blank or enter grades to filter student discovery</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Learning Objectives</label>
                <textarea
                  rows={2}
                  placeholder="Briefly state what this group covers..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Guidelines / Rules (One per line)</label>
                <textarea
                  rows={2}
                  value={newGroupRules}
                  onChange={(e) => setNewGroupRules(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-2 pt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={newGroupRequireApproval}
                    onChange={(e) => setNewGroupRequireApproval(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="requireApproval" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Require Teacher / Admin Approval to Join
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoJoinEligible"
                    checked={newGroupAutoJoinEligible}
                    onChange={(e) => setNewGroupAutoJoinEligible(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoJoinEligible" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Auto-enroll students in matching grade/stream
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canStudentLeave"
                    checked={newGroupCanStudentLeave}
                    onChange={(e) => setNewGroupCanStudentLeave(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="canStudentLeave" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Allow students to leave group freely
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowPosts"
                    checked={newGroupAllowStudentPosts}
                    onChange={(e) => setNewGroupAllowStudentPosts(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="allowPosts" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Allow student messages & replies (otherwise read-only)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: POST CAMPUS NOTICE / ANNOUNCEMENT */}
      {/* ---------------------------------------------------- */}
      {showCreateAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Publish Campus Notice</h3>
              <button onClick={() => setShowCreateAnnouncementModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mid-Term Assessment Timetable"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={newAnnScope}
                    onChange={(e: any) => setNewAnnScope(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SCHOOL_WIDE">Whole School (All)</option>
                    <option value="CLASS">Specific Class Grade</option>
                    <option value="CLUB">Club Members</option>
                    <option value="STAFF_ONLY">Staff Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={newAnnPriority}
                    onChange={(e: any) => setNewAnnPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High (Pinned)</option>
                    <option value="CRITICAL">Critical Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide full instructions..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateAnnouncementModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: LAUNCH STEM PROJECT */}
      {/* ---------------------------------------------------- */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Launch Collaborative STEM Project</h3>
              <button onClick={() => setShowCreateProjectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Automated Greenhouse Sensor Kit"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Domain</label>
                <input
                  type="text"
                  placeholder="e.g., Physics, Robotics, Agriculture"
                  value={newProjSubject}
                  onChange={(e) => setNewProjSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Objectives & Brief</label>
                <textarea
                  rows={2}
                  placeholder="Explain the problem being solved..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Key Milestone Tasks (One per line)</label>
                <textarea
                  rows={3}
                  value={newProjTasks}
                  onChange={(e) => setNewProjTasks(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Start Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: SUBMIT SAFEGUARDING REPORT */}
      {/* ---------------------------------------------------- */}
      {showReportModal && reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-red-700 flex items-center gap-2">
                <Flag className="w-5 h-5" />
                <span>Safeguarding & Incident Report</span>
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Your report is sent confidentially to school safeguarding officers to protect students from cyberbullying,
              harassment, or harmful materials.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Violation Category *</label>
                <select
                  value={reportReason}
                  onChange={(e: any) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  <option value="BULLYING">Cyberbullying / Harassment</option>
                  <option value="HATE_SPEECH">Hate Speech / Discrimination</option>
                  <option value="THREAT">Physical Threat / Intimidation</option>
                  <option value="INAPPROPRIATE_MEDIA">Inappropriate Media or Upload</option>
                  <option value="SPAM">Spam / Exam Cheating / Solicitation</option>
                  <option value="OTHER">Other Safety Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Details & Context *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what happened..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              {reportTarget.content && (
                <div className="text-xs bg-slate-100 p-2.5 rounded-md border border-slate-200 text-slate-700 italic">
                  <strong>Attached Message Evidence:</strong> "{reportTarget.content}"
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: RESOLVE REPORT & TAKE ACTION */}
      {/* ---------------------------------------------------- */}
      {showResolveReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Take Moderation / Disciplinary Action</h3>
              <button onClick={() => setShowResolveReportModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveReport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disciplinary Action</label>
                <select
                  value={moderationActionType}
                  onChange={(e) => setModerationActionType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HIDE_MESSAGE">Hide Content from Public View</option>
                  <option value="REMOVE_MESSAGE">Permanently Remove Message</option>
                  <option value="WARN_USER">Issue Formal Pedagogical Warning</option>
                  <option value="MUTE_USER">Mute User from Posting (24 Hours)</option>
                  <option value="DISMISS_REPORT">Dismiss Report (No Violation Found)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Moderator Resolution Justification *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record official notes for the institutional audit log..."
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowResolveReportModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-black rounded-lg shadow-xs"
                >
                  Apply & Log Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: COMMUNITY NOTIFICATIONS */}
      {/* ---------------------------------------------------- */}
      <GroupNotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => {
          setShowNotificationsModal(false);
          loadAllData();
        }}
        currentUser={activeUser}
        onOpenGroupChat={handleOpenGroupChat}
      />
    </div>
  );
};
export default DigitalCommunityPage;
