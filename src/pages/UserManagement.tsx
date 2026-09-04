import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Lock,
  Ban,
  CheckCircle,
  Download,
  ShieldAlert,
  KeyRound,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  FileCheck,
  Crown,
  History,
  UserCog,
  Shield,
  FileSignature,
  Award,
  Smartphone,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAllUsers,
  createUser,
  updateUser,
  updateUserStatus,
  logAuditEvent,
  fetchAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
  suspendAccountRequest,
  revokeAccountRequest,
  fetchAccountRecoveryRequests,
  resolveAccountRecoveryRequest,
  fetchHeadteacherHistory,
  fetchHeadteacherSuccessionRequests,
  requestHeadteacherSuccession,
  approveHeadteacherSuccession,
  rejectHeadteacherSuccession,
  getAuthHeaders,
} from '../services/api';
import type {
  User,
  RoleType,
  UserStatus,
  AccountRequest,
  AccountRecoveryRequest,
  HeadteacherSuccessionRequest,
  HeadteacherHistoryRecord,
} from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const UserManagement: React.FC = () => {
  const { user: currentUser, roles, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'USERS' | 'APPROVAL_REQUESTS' | 'RECOVERY_REQUESTS' | 'HEADTEACHER_SUCCESSION'>('USERS');

  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<AccountRecoveryRequest[]>([]);
  const [successionRequests, setSuccessionRequests] = useState<HeadteacherSuccessionRequest[]>([]);
  const [headteacherHistory, setHeadteacherHistory] = useState<HeadteacherHistoryRecord[]>([]);
  const [currentHeadteacherLeader, setCurrentHeadteacherLeader] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [successionLoading, setSuccessionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPwdModal, setShowResetPwdModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Approval Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [effectiveRole, setEffectiveRole] = useState<string>('Teacher');
  const [approvalComment, setApprovalComment] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  // Recovery Resolve Modal States
  const [showResolveRecoveryModal, setShowResolveRecoveryModal] = useState(false);
  const [selectedRecovery, setSelectedRecovery] = useState<AccountRecoveryRequest | null>(null);
  const [recoveryActionType, setRecoveryActionType] = useState<'APPROVE_RESET' | 'UPDATE_CONTACTS' | 'REJECT'>('APPROVE_RESET');
  const [recoveryTempPassword, setRecoveryTempPassword] = useState('Welcome@2026');
  const [recoveryNewEmail, setRecoveryNewEmail] = useState('');
  const [recoveryNewPhone, setRecoveryNewPhone] = useState('');
  const [recoveryReviewNotes, setRecoveryReviewNotes] = useState('');

  // Succession Handover Modal States
  const [showSuccessionModal, setShowSuccessionModal] = useState(false);
  const [showApproveSuccessionModal, setShowApproveSuccessionModal] = useState(false);
  const [selectedSuccession, setSelectedSuccession] = useState<HeadteacherSuccessionRequest | null>(null);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [successionForm, setSuccessionForm] = useState({
    incomingFullName: '',
    incomingUsername: '',
    incomingEmail: '',
    incomingPhone: '+256 ',
    incomingNationalIdOrNin: '',
    incomingTeacherRegNumber: '',
    incomingPassword: 'HeadTeacher@2026',
    reasonForSuccession: 'Formal end of institutional tenure & appointment of new leadership.',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '+256 ',
    employeeNumber: '',
    role: 'Teacher' as RoleType,
    status: 'Active' as UserStatus,
    password: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const canManageUsers = hasPermission('User Management', 'Manage Users');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const reqList = await fetchAccountRequests(requestStatusFilter);
      setRequests(reqList);
    } catch (e) {
      console.error('Failed to load account requests:', e);
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadRecoveryRequests = async () => {
    setRecoveryLoading(true);
    try {
      const list = await fetchAccountRecoveryRequests();
      setRecoveryRequests(list);
    } catch (e) {
      console.error('Failed to load recovery requests:', e);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const loadSuccessionData = async () => {
    setSuccessionLoading(true);
    try {
      const [historyData, succList] = await Promise.all([
        fetchHeadteacherHistory(),
        fetchHeadteacherSuccessionRequests(),
      ]);
      setHeadteacherHistory(historyData.headteacherHistory || []);
      setCurrentHeadteacherLeader(historyData.currentHeadteacher || null);
      setSuccessionRequests(succList || []);
    } catch (e) {
      console.error('Failed to load succession data:', e);
    } finally {
      setSuccessionLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRequests();
    loadRecoveryRequests();
    loadSuccessionData();
  }, []);

  useEffect(() => {
    loadRequests();
  }, [requestStatusFilter]);

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING_APPROVAL').length;
  const pendingRecoveryCount = recoveryRequests.filter((r) => r.status === 'PENDING_HEADTEACHER_REVIEW' || r.status === 'PENDING_OTP_VERIFICATION').length;
  const pendingSuccessionCount = successionRequests.filter((r) => r.status === 'SUCCESSION_REQUESTED').length;

  const handleOpenApproveModal = (req: AccountRequest) => {
    setSelectedRequest(req);
    setEffectiveRole(req.requestedRole || 'Teacher');
    setApprovalComment('');
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await approveAccountRequest(selectedRequest.id, effectiveRole, approvalComment);
      await logAuditEvent(
        currentUser?.id || 'admin',
        currentUser?.username || 'Headteacher',
        currentUser?.role || 'Headteacher',
        'USER_UPDATE',
        `Approved account request for ${selectedRequest.username} as ${effectiveRole}`
      );
      setShowApproveModal(false);
      loadRequests();
      loadUsers();
    } catch (err: any) {
      alert('Approval failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (req: AccountRequest) => {
    setSelectedRequest(req);
    setRejectionReason('Unable to verify affiliation with school records.');
    setApprovalComment('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await rejectAccountRequest(selectedRequest.id, rejectionReason, approvalComment);
      await logAuditEvent(
        currentUser?.id || 'admin',
        currentUser?.username || 'Headteacher',
        currentUser?.role || 'Headteacher',
        'USER_UPDATE',
        `Rejected account request for ${selectedRequest.username}: ${rejectionReason}`
      );
      setShowRejectModal(false);
      loadRequests();
      loadUsers();
    } catch (err: any) {
      alert('Rejection failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Recovery handlers
  const handleOpenResolveRecovery = (req: AccountRecoveryRequest) => {
    setSelectedRecovery(req);
    setRecoveryActionType('APPROVE_RESET');
    setRecoveryTempPassword('School@2026');
    setRecoveryNewEmail(req.newEmail || '');
    setRecoveryNewPhone(req.newPhone || '');
    setRecoveryReviewNotes('');
    setShowResolveRecoveryModal(true);
  };

  const handleConfirmResolveRecovery = async () => {
    if (!selectedRecovery) return;
    setActionLoading(true);
    try {
      await resolveAccountRecoveryRequest({
        requestId: selectedRecovery.id,
        action: recoveryActionType,
        newTemporaryPassword: recoveryActionType === 'APPROVE_RESET' ? recoveryTempPassword : undefined,
        newEmail: recoveryNewEmail ? recoveryNewEmail.trim() : undefined,
        newPhone: recoveryNewPhone ? recoveryNewPhone.trim() : undefined,
        reviewerNotes: recoveryReviewNotes.trim(),
      });

      await logAuditEvent(
        currentUser?.id || 'admin',
        currentUser?.username || 'Headteacher',
        currentUser?.role || 'Headteacher',
        'USER_UPDATE',
        `Resolved account recovery for ${selectedRecovery.identifier || selectedRecovery.fullName} with action ${recoveryActionType}`
      );

      setShowResolveRecoveryModal(false);
      loadRecoveryRequests();
      loadUsers();
    } catch (err: any) {
      alert('Action failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Succession Handover handlers
  const handleSubmitSuccessionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!successionForm.incomingFullName || !successionForm.incomingUsername || !successionForm.reasonForSuccession) {
      alert('Please fill in incoming Headteacher Full Name, Username, and reason for succession.');
      return;
    }
    setActionLoading(true);
    try {
      await requestHeadteacherSuccession({
        incomingFullName: successionForm.incomingFullName,
        incomingUsername: successionForm.incomingUsername,
        incomingEmail: successionForm.incomingEmail,
        incomingPhone: successionForm.incomingPhone,
        incomingNationalIdOrNin: successionForm.incomingNationalIdOrNin,
        incomingTeacherRegNumber: successionForm.incomingTeacherRegNumber,
        incomingPassword: successionForm.incomingPassword,
        reasonForSuccession: successionForm.reasonForSuccession,
        effectiveDate: successionForm.effectiveDate,
      });

      setShowSuccessionModal(false);
      loadSuccessionData();
      alert('Headteacher succession request registered successfully.');
    } catch (err: any) {
      alert('Succession submission failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenApproveSuccession = (succ: HeadteacherSuccessionRequest) => {
    setSelectedSuccession(succ);
    setHandoverNotes('Confirmed by School Board of Governors / Executive Director.');
    setShowApproveSuccessionModal(true);
  };

  const handleConfirmApproveSuccession = async () => {
    if (!selectedSuccession) return;
    setActionLoading(true);
    try {
      const res = await approveHeadteacherSuccession(selectedSuccession.id, handoverNotes);
      setShowApproveSuccessionModal(false);
      loadSuccessionData();
      loadUsers();
      alert(res.message || 'Headteacher leadership successfully transitioned!');
    } catch (err: any) {
      alert('Succession approval failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSuccession = async (succ: HeadteacherSuccessionRequest) => {
    const reason = prompt('Please enter the reason for rejecting this succession handover:');
    if (!reason) return;
    try {
      await rejectHeadteacherSuccession(succ.id, reason);
      loadSuccessionData();
      alert('Succession request rejected.');
    } catch (err: any) {
      alert('Rejection failed: ' + err.message);
    }
  };

  const handleSuspendRequest = async (req: AccountRequest) => {
    if (!confirm(`Are you sure you want to suspend access for ${req.fullName || req.username}?`)) return;
    try {
      await suspendAccountRequest(req.id, 'Administrative suspension by Headteacher');
      loadRequests();
      loadUsers();
    } catch (err: any) {
      alert('Suspension failed: ' + err.message);
    }
  };

  const handleRevokeRequest = async (req: AccountRequest) => {
    if (!confirm(`Are you sure you want to permanently revoke access for ${req.fullName || req.username}?`)) return;
    try {
      await revokeAccountRequest(req.id, 'Access revoked by Headteacher');
      loadRequests();
      loadUsers();
    } catch (err: any) {
      alert('Revocation failed: ' + err.message);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle Add User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!formData.fullName || !formData.username || !formData.password) {
      setModalError('Full Name, Username, and Password are required.');
      return;
    }

    try {
      await createUser(
        formData,
        currentUser?.id,
        currentUser?.username
      );
      await logAuditEvent(
        currentUser?.id || 'admin',
        currentUser?.username || 'Admin',
        currentUser?.role || 'Administrator',
        'USER_CREATE',
        `Created new user ${formData.username} (${formData.role})`
      );
      setShowAddModal(false);
      loadUsers();
      setFormData({
        fullName: '',
        username: '',
        email: '',
        phone: '+256 ',
        employeeNumber: '',
        role: 'Teacher',
        status: 'Active',
        password: '',
      });
    } catch (err: any) {
      setModalError(err.message || 'Failed to create user');
    }
  };

  // Handle Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalError('');

    try {
      await updateUser(
        selectedUser.id,
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          employeeNumber: formData.employeeNumber,
          role: formData.role,
          status: formData.status,
        },
        currentUser?.id,
        currentUser?.username
      );
      setShowEditModal(false);
      loadUsers();
    } catch (err: any) {
      setModalError(err.message || 'Failed to update user');
    }
  };

  // Handle Toggle Status (Suspend / Activate)
  const handleToggleStatus = async (targetUser: User) => {
    const nextStatus: UserStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateUserStatus(targetUser.id, nextStatus, currentUser?.id, currentUser?.username);
      loadUsers();
    } catch (e: any) {
      alert('Status change failed: ' + e.message);
    }
  };

  // Handle Admin Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    if (newPassword.length < 8) {
      setModalError('Password must be at least 8 characters long.');
      return;
    }

    try {
      if (navigator.onLine) {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            targetUserId: selectedUser.id,
            newPassword,
            adminUserId: currentUser?.id,
          }),
        });
        if (!res.ok) throw new Error('Password reset failed on server.');
      }

      await logAuditEvent(
        currentUser?.id || 'admin',
        currentUser?.username || 'Admin',
        currentUser?.role || 'Administrator',
        'PASSWORD_CHANGE',
        `Admin reset password for user ${selectedUser.username}`
      );

      setModalSuccess(`Password for ${selectedUser.username} successfully reset.`);
      setTimeout(() => {
        setShowResetPwdModal(false);
        setModalSuccess('');
        setNewPassword('');
      }, 1500);
    } catch (err: any) {
      setModalError(err.message || 'Failed to reset password');
    }
  };

  // Export CSV
  const exportUsersCSV = () => {
    const headers = ['Full Name', 'Username', 'Role', 'Status', 'Employee No', 'Phone', 'Email', 'Created At'];
    const rows = filteredUsers.map((u) => [
      `"${u.fullName}"`,
      `"${u.username}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.employeeNumber}"`,
      `"${u.phone}"`,
      `"${u.email}"`,
      `"${u.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolSoul_Users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Management & Approval Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, approve, manage, suspend, and configure school community accounts with Layer A identity & Layer B authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'USERS' && (
            <button
              id="export-users-csv-btn"
              onClick={exportUsersCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>
          )}

          {canManageUsers && activeTab === 'USERS' && (
            <button
              id="open-add-user-modal-btn"
              onClick={() => {
                setModalError('');
                setShowAddModal(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Add Direct User
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher: Active Users vs Account Approval Requests vs Recovery vs Succession */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active System Accounts</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-900/20 text-white font-mono">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVAL_REQUESTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'APPROVAL_REQUESTS'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Account Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold font-mono animate-pulse">
              {pendingRequestsCount} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RECOVERY_REQUESTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'RECOVERY_REQUESTS'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Password & Recovery Escalations</span>
          {pendingRecoveryCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold font-mono animate-pulse">
              {pendingRecoveryCount} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('HEADTEACHER_SUCCESSION')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'HEADTEACHER_SUCCESSION'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Headteacher Leadership & Tenure</span>
          {pendingSuccessionCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-500 text-white font-bold font-mono animate-pulse">
              {pendingSuccessionCount} pending
            </span>
          )}
        </button>
      </div>

      {/* ================= TAB 1: USERS DIRECT MANAGEMENT ================= */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="user-search-input"
                type="text"
                placeholder="Search by name, username, employee ID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Role:</span>
              </div>
              <select
                id="role-filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="ALL">All Built-In & Custom Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5 pl-4">Staff / User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Employee / ID</th>
                    <th className="p-3.5">Contact Phone & Email</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Loading users database...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No users matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isHeadteacherAccount = u.role === 'Headteacher' || u.role === 'Super Administrator';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 pl-4 font-medium text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                                {u.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                  <span>{u.fullName}</span>
                                  {isHeadteacherAccount && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-500 font-bold">
                                      PROTECTED
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400">@{u.username}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <Badge variant={isHeadteacherAccount ? 'warning' : 'primary'}>{u.role}</Badge>
                          </td>

                          <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {u.employeeNumber || 'N/A'}
                          </td>

                          <td className="p-3.5">
                            <p>{u.phone || 'No phone'}</p>
                            <p className="text-[11px] text-slate-400">{u.email || 'No email'}</p>
                          </td>

                          <td className="p-3.5">
                            <Badge
                              variant={u.status === 'Active' ? 'success' : u.status === 'Suspended' ? 'danger' : 'neutral'}
                            >
                              {u.status}
                            </Badge>
                          </td>

                          <td className="p-3.5 pr-4 text-right space-x-1">
                            {canManageUsers && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setFormData({
                                      fullName: u.fullName,
                                      username: u.username,
                                      email: u.email || '',
                                      phone: u.phone || '',
                                      employeeNumber: u.employeeNumber || '',
                                      role: u.role,
                                      status: u.status,
                                      password: '',
                                    });
                                    setShowEditModal(true);
                                  }}
                                  title="Edit User Details"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setNewPassword('');
                                    setModalError('');
                                    setShowResetPwdModal(true);
                                  }}
                                  title="Reset Password"
                                  className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>

                                {!isHeadteacherAccount && (
                                  <button
                                    onClick={() => handleToggleStatus(u)}
                                    title={u.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      u.status === 'Active'
                                        ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                        : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                    }`}
                                  >
                                    {u.status === 'Active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ACCOUNT APPROVAL REQUESTS ================= */}
      {activeTab === 'APPROVAL_REQUESTS' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-500" />
                School Registration & Identity Approval Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Headteachers review Layer A registration submissions before granting Layer B operational dashboard access.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Application Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval Only</option>
                <option value="APPROVED">Approved Only</option>
                <option value="REJECTED">Rejected Only</option>
                <option value="SUSPENDED">Suspended Only</option>
                <option value="REVOKED">Revoked Only</option>
              </select>

              <button
                onClick={loadRequests}
                className="p-2 text-slate-500 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                title="Refresh requests"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${requestsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5 pl-4">Applicant</th>
                    <th className="p-3.5">Requested Role</th>
                    <th className="p-3.5">Identity / Reference</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Application Status</th>
                    <th className="p-3.5 pr-4 text-right">Headteacher Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {requestsLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Loading account approval queue...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No account requests found for status "{requestStatusFilter}".
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 pl-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{r.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">@{r.username}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Submitted: {new Date(r.createdAt || r.requestedAt || Date.now()).toLocaleDateString()}</p>
                        </td>

                        <td className="p-3.5">
                          <Badge variant="primary">{r.requestedRole}</Badge>
                          {r.department && (
                            <p className="text-[11px] text-slate-400 mt-1">Dept: {r.department}</p>
                          )}
                        </td>

                        <td className="p-3.5 space-y-0.5 font-mono text-[11px]">
                          {r.studentIdOrLin && <p className="text-blue-600 dark:text-blue-400">LIN: {r.studentIdOrLin}</p>}
                          {r.childLinOrNin && <p className="text-amber-600 dark:text-amber-400">Child LIN: {r.childLinOrNin}</p>}
                          {r.nationalIdOrNin && <p className="text-slate-500">NIN: {r.nationalIdOrNin}</p>}
                          {r.tinNumber && <p className="text-slate-500">TIN: {r.tinNumber}</p>}
                          {r.nssfNumber && <p className="text-slate-500">NSSF: {r.nssfNumber}</p>}
                          {!r.studentIdOrLin && !r.childLinOrNin && !r.nationalIdOrNin && !r.tinNumber && (
                            <span className="text-slate-400 italic">No extra credentials</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <p className="text-slate-800 dark:text-slate-200">{r.phone || 'No phone'}</p>
                          <p className="text-[11px] text-slate-400">{r.email || 'No email'}</p>
                        </td>

                        <td className="p-3.5">
                          {r.status === 'PENDING_APPROVAL' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Clock className="w-3 h-3" />
                              Pending Approval
                            </span>
                          ) : r.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          ) : r.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <UserX className="w-3 h-3" />
                              Rejected
                            </span>
                          ) : r.status === 'SUSPENDED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                              <Ban className="w-3 h-3" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {r.status}
                            </span>
                          )}
                          {r.rejectionReason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 max-w-[180px] truncate" title={r.rejectionReason}>
                              Reason: {r.rejectionReason}
                            </p>
                          )}
                        </td>

                        <td className="p-3.5 pr-4 text-right space-x-1.5">
                          {r.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleOpenApproveModal(r)}
                                className="px-2.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg inline-flex items-center gap-1 shadow-xs"
                                title="Approve and activate account"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(r)}
                                className="px-2.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg inline-flex items-center gap-1 shadow-xs"
                                title="Reject account request"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}

                          {r.status === 'APPROVED' && (
                            <>
                              <button
                                onClick={() => handleSuspendRequest(r)}
                                className="px-2 py-1 text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-200 rounded-lg inline-flex items-center gap-1"
                                title="Temporarily suspend access"
                              >
                                <Ban className="w-3 h-3" />
                                Suspend
                              </button>
                              <button
                                onClick={() => handleRevokeRequest(r)}
                                className="px-2 py-1 text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 hover:bg-rose-200 rounded-lg inline-flex items-center gap-1"
                                title="Permanently revoke access"
                              >
                                <Trash2 className="w-3 h-3" />
                                Revoke
                              </button>
                            </>
                          )}

                          {r.status === 'REJECTED' && (
                            <button
                              onClick={() => handleOpenApproveModal(r)}
                              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Re-evaluate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PASSWORD & RECOVERY ESCALATIONS ================= */}
      {activeTab === 'RECOVERY_REQUESTS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Password Resets & Identity Escalation Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review offline password reset requests, lost SIM/phone contact updates, and institutional identity escalations.
              </p>
            </div>
            <button
              onClick={loadRecoveryRequests}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recoveryLoading ? 'animate-spin' : ''}`} />
              Refresh Queue
            </button>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Applicant & Identifier</th>
                    <th className="px-4 py-3">Escalation Type</th>
                    <th className="px-4 py-3">Institutional Credentials</th>
                    <th className="px-4 py-3">Requested Contact Changes</th>
                    <th className="px-4 py-3">Reason / Applicant Notes</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recoveryRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">All clear!</p>
                        <p className="text-xs">No pending password recovery escalations.</p>
                      </td>
                    </tr>
                  ) : (
                    recoveryRequests.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {rec.fullName || rec.identifier || 'Unknown Applicant'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            @{rec.identifier}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(rec.requestedAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                            {rec.recoveryType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                          {rec.nationalIdOrNin && (
                            <div><span className="text-slate-400 font-medium">NIN:</span> {rec.nationalIdOrNin}</div>
                          )}
                          {rec.studentIdOrLin && (
                            <div><span className="text-slate-400 font-medium">LIN:</span> {rec.studentIdOrLin}</div>
                          )}
                          {!rec.nationalIdOrNin && !rec.studentIdOrLin && (
                            <span className="text-slate-400 italic">Self-service OTP</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                          {rec.newEmail && (
                            <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {rec.newEmail}</div>
                          )}
                          {rec.newPhone && (
                            <div className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-slate-400" /> {rec.newPhone}</div>
                          )}
                          {!rec.newEmail && !rec.newPhone && <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="px-4 py-3 max-w-xs text-[11px] text-slate-600 dark:text-slate-300">
                          <p className="line-clamp-2">{rec.recoveryNotes || 'Self-service verification code request'}</p>
                        </td>
                        <td className="px-4 py-3">
                          {rec.status === 'PENDING_HEADTEACHER_REVIEW' ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                              HEADTEACHER ACTION
                            </span>
                          ) : rec.status === 'PENDING_OTP_VERIFICATION' ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                              AWAITING OTP
                            </span>
                          ) : rec.status === 'RESOLVED_APPROVED' || rec.status === 'RESOLVED_PASSWORD_RESET' ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              RESOLVED (RESET)
                            </span>
                          ) : rec.status === 'RESOLVED_CONTACTS_UPDATED' ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              CONTACTS UPDATED
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                              {rec.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {(rec.status === 'PENDING_HEADTEACHER_REVIEW' || rec.status === 'PENDING_OTP_VERIFICATION') && (
                            <button
                              onClick={() => handleOpenResolveRecovery(rec)}
                              className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Review & Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: HEADTEACHER LEADERSHIP & TENURE ================= */}
      {activeTab === 'HEADTEACHER_SUCCESSION' && (
        <div className="space-y-6">
          {/* Current Serving Leader Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xl font-bold shadow-inner">
                  <Crown className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wide">
                      Active Commission
                    </span>
                    <span className="text-xs text-blue-200">Institutional Executive Leader</span>
                  </div>
                  <h3 className="text-lg font-extrabold mt-1">
                    {currentHeadteacherLeader?.fullName || 'Active Headteacher'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    @{currentHeadteacherLeader?.username || 'headteacher'} • {currentHeadteacherLeader?.email || 'school.admin@school.ac.ug'} • {currentHeadteacherLeader?.phone || '+256 700 000 000'}
                  </p>
                </div>
              </div>

              {canManageUsers && (
                <button
                  onClick={() => setShowSuccessionModal(true)}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <FileSignature className="w-4 h-4" />
                  Initiate Leadership Handover
                </button>
              )}
            </div>
          </div>

          {/* Pending Succession Handover Requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Leadership Succession Protocols & Approvals
              </h4>
              <button
                onClick={loadSuccessionData}
                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${successionLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Incoming Leader</th>
                    <th className="px-4 py-3">Credentials & Verification</th>
                    <th className="px-4 py-3">Reason for Succession</th>
                    <th className="px-4 py-3">Effective Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {successionRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                        No pending succession handover requests.
                      </td>
                    </tr>
                  ) : (
                    successionRequests.map((succ) => (
                      <tr key={succ.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{succ.incomingFullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">@{succ.incomingUsername}</div>
                          <div className="text-[10px] text-slate-400">{succ.incomingEmail} • {succ.incomingPhone}</div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                          {succ.incomingNationalIdOrNin && <div><span className="text-slate-400">NIN:</span> {succ.incomingNationalIdOrNin}</div>}
                          {succ.incomingTeacherRegNumber && <div><span className="text-slate-400">Teacher Reg:</span> {succ.incomingTeacherRegNumber}</div>}
                        </td>
                        <td className="px-4 py-3 max-w-xs text-[11px] text-slate-600 dark:text-slate-300">
                          {succ.reasonForSuccession}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          {succ.effectiveDate}
                        </td>
                        <td className="px-4 py-3">
                          {succ.status === 'SUCCESSION_REQUESTED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                              AWAITING BOARD APPROVAL
                            </span>
                          ) : succ.status === 'SUCCESSION_COMPLETED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              HANDOVER COMPLETED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                              REJECTED
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {succ.status === 'SUCCESSION_REQUESTED' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenApproveSuccession(succ)}
                                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 shadow-xs"
                              >
                                <Award className="w-3.5 h-3.5" />
                                Approve Handover
                              </button>
                              <button
                                onClick={() => handleRejectSuccession(succ)}
                                className="px-2.5 py-1.5 text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 rounded-lg"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Leadership Roll / Tenure History */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Institutional Headteacher Leadership Tenure Roll
            </h4>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Tenure Leader</th>
                    <th className="px-4 py-3">Transition Type</th>
                    <th className="px-4 py-3">Tenure Duration</th>
                    <th className="px-4 py-3">Handover / Commission Notes</th>
                    <th className="px-4 py-3">Authorized By</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {headteacherHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                        No leadership history records archived.
                      </td>
                    </tr>
                  ) : (
                    headteacherHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{h.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">@{h.username}</div>
                          <div className="text-[10px] text-slate-400">{h.email} • {h.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {h.transitionType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono">
                          {h.startDate} → {h.isCurrent ? 'Present (Active)' : h.endDate || 'Concluded'}
                        </td>
                        <td className="px-4 py-3 max-w-xs text-[11px] text-slate-600 dark:text-slate-300">
                          {h.handoverNotes || 'Initial system founder commission'}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500">
                          {h.approvedByUsername || 'Board of Governors'}
                        </td>
                        <td className="px-4 py-3">
                          {h.isCurrent ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              CURRENT SERVING
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              HONORARY / FORMER
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE REQUEST MODAL */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title={`Approve Account: ${selectedRequest?.fullName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              Confirming verification for @{selectedRequest?.username}
            </p>
            <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
              Approving this request will immediately activate the account and grant system authorization.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Effective System Role *
            </label>
            <select
              value={effectiveRole}
              onChange={(e) => setEffectiveRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              You can adjust the granted role (e.g. from Teacher to DOS or Head of Department).
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Headteacher Review Note / Approval Comment (Optional)
            </label>
            <textarea
              rows={2}
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              placeholder="e.g. Verified with staff registry on 26-Aug-2026."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowApproveModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirmApprove}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              {actionLoading ? 'Approving...' : 'Confirm Approval'}
            </button>
          </div>
        </div>
      </Modal>

      {/* REJECT REQUEST MODAL */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={`Reject Account: ${selectedRequest?.fullName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
            <p className="font-semibold text-rose-800 dark:text-rose-300">
              Rejecting application for @{selectedRequest?.username}
            </p>
            <p className="text-rose-700 dark:text-rose-400 mt-0.5">
              The user will be blocked from logging in with a clear explanation.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Rejection *
            </label>
            <input
              type="text"
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Identity not recognized in student or staff registry"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Additional Details / Comments (Optional)
            </label>
            <textarea
              rows={2}
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              placeholder="Provide guidance to applicant on how to resolve with administration."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirmReject}
              className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 flex items-center gap-1.5"
            >
              <UserX className="w-4 h-4" />
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ADD USER MODAL */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New System Account">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-2.5 text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Samuel Musoke"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Username *</label>
              <input
                type="text"
                placeholder="smusoke"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee Number</label>
              <input
                type="text"
                placeholder="EMP-102"
                value={formData.employeeNumber}
                onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="samuel@school.ac.ug"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500">
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User Account">
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-2.5 text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ADMIN RESET PASSWORD MODAL */}
      <Modal isOpen={showResetPwdModal} onClose={() => setShowResetPwdModal(false)} title={`Reset Password: @${selectedUser?.username}`}>
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-2.5 text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
              {modalError}
            </div>
          )}
          {modalSuccess && (
            <div className="p-2.5 text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200">
              {modalSuccess}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (min 8 chars) *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowResetPwdModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500">
              Reset Password Now
            </button>
          </div>
        </form>
      </Modal>

      {/* RESOLVE ACCOUNT RECOVERY MODAL */}
      <Modal
        isOpen={showResolveRecoveryModal}
        onClose={() => setShowResolveRecoveryModal(false)}
        title={`Resolve Recovery: ${selectedRecovery?.fullName || selectedRecovery?.identifier}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Applicant Identifier:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">@{selectedRecovery?.identifier}</span>
            </div>
            {selectedRecovery?.nationalIdOrNin && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">National ID (NIN):</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedRecovery.nationalIdOrNin}</span>
              </div>
            )}
            {selectedRecovery?.studentIdOrLin && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Student ID / LIN:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedRecovery.studentIdOrLin}</span>
              </div>
            )}
            <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="font-semibold">Claim Notes: </span>
              {selectedRecovery?.recoveryNotes || 'Self-service verification code request'}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Resolution Protocol *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRecoveryActionType('APPROVE_RESET')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  recoveryActionType === 'APPROVE_RESET'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => setRecoveryActionType('UPDATE_CONTACTS')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  recoveryActionType === 'UPDATE_CONTACTS'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Update Contacts
              </button>
              <button
                type="button"
                onClick={() => setRecoveryActionType('REJECT')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  recoveryActionType === 'REJECT'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Reject Claim
              </button>
            </div>
          </div>

          {recoveryActionType === 'APPROVE_RESET' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Temporary / Reset Password *
              </label>
              <input
                type="text"
                value={recoveryTempPassword}
                onChange={(e) => setRecoveryTempPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The user can immediately log in with this password and will be prompted to choose a new private password.
              </p>
            </div>
          )}

          {(recoveryActionType === 'APPROVE_RESET' || recoveryActionType === 'UPDATE_CONTACTS') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Updated Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="user@school.ac.ug"
                  value={recoveryNewEmail}
                  onChange={(e) => setRecoveryNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Updated Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+256 700 000 000"
                  value={recoveryNewPhone}
                  onChange={(e) => setRecoveryNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reviewer Notes / Verification Audit Trail
            </label>
            <textarea
              rows={2}
              value={recoveryReviewNotes}
              onChange={(e) => setRecoveryReviewNotes(e.target.value)}
              placeholder="e.g. Identity verified manually with physical staff ID card on 26-Aug-2026."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowResolveRecoveryModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirmResolveRecovery}
              className={`px-4 py-2 text-white font-bold rounded-lg flex items-center gap-1.5 ${
                recoveryActionType === 'REJECT'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {actionLoading ? 'Processing...' : 'Confirm Resolution'}
            </button>
          </div>
        </div>
      </Modal>

      {/* INITIATE HEADTEACHER SUCCESSION MODAL */}
      <Modal
        isOpen={showSuccessionModal}
        onClose={() => setShowSuccessionModal(false)}
        title="Initiate Headteacher Leadership Handover Protocol"
      >
        <form onSubmit={handleSubmitSuccessionRequest} className="space-y-3.5 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300">
            <p className="font-bold flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-600" />
              Statutory Executive Leadership Handover
            </p>
            <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-400">
              This initiates the transition of the primary institutional Headteacher commission to a new appointee.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Incoming Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Christine Namubiru"
                value={successionForm.incomingFullName}
                onChange={(e) => setSuccessionForm({ ...successionForm, incomingFullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Headteacher Username *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. cnamubiru.headteacher"
                value={successionForm.incomingUsername}
                onChange={(e) => setSuccessionForm({ ...successionForm, incomingUsername: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                placeholder="headteacher@school.ac.ug"
                value={successionForm.incomingEmail}
                onChange={(e) => setSuccessionForm({ ...successionForm, incomingEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Direct Telephone
              </label>
              <input
                type="text"
                placeholder="+256 772 000 000"
                value={successionForm.incomingPhone}
                onChange={(e) => setSuccessionForm({ ...successionForm, incomingPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                National ID (NIN)
              </label>
              <input
                type="text"
                placeholder="CM800000000000"
                value={successionForm.incomingNationalIdOrNin}
                onChange={(e) => setSuccessionForm({ ...successionForm, incomingNationalIdOrNin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teacher Reg. Number (MoES / UNEB)
              </label>
              <input
                type="text"
                placeholder="TRN/UG/2026/890"
                value={successionForm.incomingTeacherRegNumber}
                onChange={(e) => setSuccessionForm({ ...successionForm, incomingTeacherRegNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Account Password *
              </label>
              <input
                type="password"
                required
                value={successionForm.incomingPassword}
                onChange={(e) => setSuccessionForm({ ...successionForm, incomingPassword: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Effective Handover Date *
              </label>
              <input
                type="date"
                required
                value={successionForm.effectiveDate}
                onChange={(e) => setSuccessionForm({ ...successionForm, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Handover Terms & Minutes Reference *
            </label>
            <textarea
              rows={2}
              required
              value={successionForm.reasonForSuccession}
              onChange={(e) => setSuccessionForm({ ...successionForm, reasonForSuccession: e.target.value })}
              placeholder="e.g. Appointment per Board of Governors resolution Minute 4/2026."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSuccessionModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shadow-md"
            >
              <Crown className="w-4 h-4" />
              {actionLoading ? 'Submitting...' : 'Register Handover Protocol'}
            </button>
          </div>
        </form>
      </Modal>

      {/* APPROVE SUCCESSION MODAL */}
      <Modal
        isOpen={showApproveSuccessionModal}
        onClose={() => setShowApproveSuccessionModal(false)}
        title={`Authorize Leadership Handover to: ${selectedSuccession?.incomingFullName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300">
            <p className="font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" />
              Executive Seal & Handover Confirmation
            </p>
            <p className="text-[11px] mt-0.5 text-purple-800 dark:text-purple-400">
              Approving will immediately promote @{selectedSuccession?.incomingUsername} to Headteacher, archive the current Headteacher tenure to historical records, and log the executive audit trail.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Handover / Board of Governors Authorization Note
            </label>
            <textarea
              rows={2}
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="e.g. Formal handover verified by Board Chairman and Ministry Inspector."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowApproveSuccessionModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirmApproveSuccession}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading ? 'Executing Handover...' : 'Approve & Seal Handover'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
