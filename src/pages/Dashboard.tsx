import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Activity,
  DatabaseBackup,
  RefreshCw,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  UserPlus,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { fetchAllUsers, fetchAuditLogs } from '../services/api';
import type { User, AuditLog } from '../types';
import { Badge } from '../components/common/Badge';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, activeRole, schoolProfile } = useAuth();
  const { isOnline, pendingQueueCount, triggerSyncNow, isSyncing } = useSync();

  const [usersCount, setUsersCount] = useState<number>(0);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const users = await fetchAllUsers();
        setUsersList(users);
        setUsersCount(users.length);

        const logs = await fetchAuditLogs();
        setRecentAudits(logs.slice(0, 6));
      } catch (err) {
        console.warn('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentDateStr = new Date().toLocaleDateString('en-UG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Welcome Header Banner Widget */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {activeRole} Workspace
              </span>
              <span className="text-xs text-blue-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {currentDateStr}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName || 'User'}!
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-xl">
              {schoolProfile?.schoolName || 'SchoolSoul V1'} • {schoolProfile?.academicTerm || 'Term I'}{' '}
              {schoolProfile?.academicYear || '2026'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('commercial-value-center')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> Commercial & Value Center
            </button>
            <button
              onClick={() => onNavigate('v9-hub')}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> V9 Engagement Hub
            </button>
            <button
              id="dashboard-sync-btn"
              onClick={triggerSyncNow}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Server'}</span>
            </button>
            <button
              id="dashboard-settings-btn"
              onClick={() => onNavigate('settings')}
              className="px-4 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold transition-all shadow-md"
            >
              School Settings
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <div
          onClick={() => onNavigate('users')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total System Users</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{usersCount}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Active Users
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Manage accounts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 2: Offline Status & Queue */}
        <div
          onClick={() => onNavigate('health')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Database Engine</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isOnline ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">IndexedDB</span>
            <Badge variant={isOnline ? 'success' : 'warning'}>
              {isOnline ? 'Online' : 'Offline Mode'}
            </Badge>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{pendingQueueCount} pending sync items</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 3: Active Academic Term */}
        <div
          onClick={() => onNavigate('settings')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Academic Period</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {schoolProfile?.academicTerm || 'Term I'}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {schoolProfile?.academicYear || '2026'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{schoolProfile?.schoolType || 'Secondary'} Level</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 4: Backup & Security */}
        <div
          onClick={() => onNavigate('backup')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Data Vault & Backup</span>
            <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <DatabaseBackup className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Encrypted</span>
            <Badge variant="info">Ready</Badge>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Export database JSON</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Bar - Role Aware */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>{activeRole} Quick Actions & Operational Engines</span>
          <span className="text-[10px] text-blue-500 font-normal">Adaptive role workspace</span>
        </h3>
        
        {/* Parent Role Quick Actions */}
        {(activeRole === 'Parent' || activeRole === 'Guardian') && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <button
              id="quick-action-parent-portal"
              onClick={() => onNavigate('parent-portal')}
              className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all text-left flex flex-col items-start gap-2 shadow-xs"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold">My Children Portal</span>
            </button>
            <button
              onClick={() => onNavigate('direct-messaging')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-sky-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Bell className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-semibold">Teacher Messages</span>
            </button>
            <button
              onClick={() => onNavigate('announcements')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold">Announcements</span>
            </button>
            <button
              onClick={() => onNavigate('events-management')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Building2 className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold">School Calendar</span>
            </button>
            <button
              onClick={() => onNavigate('consent-forms')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-semibold">Consent Slips</span>
            </button>
            <button
              onClick={() => onNavigate('ptm-meetings')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-200 hover:text-cyan-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Users className="w-5 h-5 text-cyan-600" />
              <span className="text-xs font-semibold">PTA Meetings</span>
            </button>
          </div>
        )}

        {/* Student Role Quick Actions */}
        {activeRole === 'Student' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <button
              onClick={() => onNavigate('v9-student-portfolio')}
              className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all text-left flex flex-col items-start gap-2 shadow-xs"
            >
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold">My Portfolio</span>
            </button>
            <button
              onClick={() => onNavigate('v25-learnguard')}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all text-left flex flex-col items-start gap-2 shadow-xs"
            >
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold">LearnGuard Safe App</span>
            </button>
            <button
              onClick={() => onNavigate('homework-assignments')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold">My Homework</span>
            </button>
            <button
              onClick={() => onNavigate('timetable-engine')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold">Timetable</span>
            </button>
            <button
              onClick={() => onNavigate('v9-student-voice')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-sky-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Bell className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-semibold">Student Voice</span>
            </button>
            <button
              onClick={() => onNavigate('v9-school-clubs')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Users className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-semibold">Clubs & Societies</span>
            </button>
          </div>
        )}

        {/* Teacher Role Quick Actions */}
        {activeRole === 'Teacher' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <button
              onClick={() => onNavigate('teacher-gradebook')}
              className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all text-left flex flex-col items-start gap-2 shadow-xs"
            >
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold">Teacher Gradebook</span>
            </button>
            <button
              onClick={() => onNavigate('student-attendance')}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all text-left flex flex-col items-start gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold">Class Attendance</span>
            </button>
            <button
              onClick={() => onNavigate('lesson-planner')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold">Lesson Planner</span>
            </button>
            <button
              onClick={() => onNavigate('homework-assignments')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold">Homework & Tasks</span>
            </button>
            <button
              onClick={() => onNavigate('assessment-exams')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-200 hover:text-cyan-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Building2 className="w-5 h-5 text-cyan-600" />
              <span className="text-xs font-semibold">Assessments & Exams</span>
            </button>
            <button
              onClick={() => onNavigate('staff-attendance-leave')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Users className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-semibold">Staff Leave</span>
            </button>
          </div>
        )}

        {/* Bursar / Finance Role Quick Actions */}
        {(activeRole === 'Bursar' || activeRole === 'Finance Officer') && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <button
              onClick={() => onNavigate('finance-hub')}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all text-left flex flex-col items-start gap-2 shadow-xs"
            >
              <Activity className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold">Finance Operations Hub</span>
            </button>
            <button
              onClick={() => onNavigate('payment-processing')}
              className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all text-left flex flex-col items-start gap-2 shadow-xs"
            >
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold">Payment & MoMo</span>
            </button>
            <button
              onClick={() => onNavigate('student-fee-accounts')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold">Student Fee Accounts</span>
            </button>
            <button
              onClick={() => onNavigate('fee-structures')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold">Fee Structures</span>
            </button>
            <button
              onClick={() => onNavigate('income-expenditure')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Activity className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-semibold">Cashbook & Expenses</span>
            </button>
            <button
              onClick={() => onNavigate('financial-reports')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-200 hover:text-cyan-600 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <DatabaseBackup className="w-5 h-5 text-cyan-600" />
              <span className="text-xs font-semibold">Financial Statements</span>
            </button>
          </div>
        )}

        {/* Administration, Headteacher & Executive Roles Quick Actions */}
        {activeRole !== 'Parent' && activeRole !== 'Guardian' && activeRole !== 'Student' && activeRole !== 'Teacher' && activeRole !== 'Bursar' && activeRole !== 'Finance Officer' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            <button
              id="quick-action-parent-portal"
              onClick={() => onNavigate('parent-portal')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold">Parent Portal</span>
            </button>

            <button
              id="quick-action-direct-messaging"
              onClick={() => onNavigate('direct-messaging')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Bell className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-semibold">Messaging</span>
            </button>

            <button
              id="quick-action-finance-hub"
              onClick={() => onNavigate('finance-hub')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Activity className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold">Finance Hub</span>
            </button>

            <button
              id="quick-action-momo-pay"
              onClick={() => onNavigate('payment-processing')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold">MoMo & Fees</span>
            </button>

            <button
              id="quick-action-operations"
              onClick={() => onNavigate('daily-operations')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <Activity className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold">Operations</span>
            </button>

            <button
              id="quick-action-student-att"
              onClick={() => onNavigate('student-attendance')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold">Student Roll</span>
            </button>

            <button
              id="quick-action-admissions"
              onClick={() => onNavigate('admissions')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <GraduationCap className="w-5 h-5 text-cyan-600" />
              <span className="text-xs font-semibold">Admissions</span>
            </button>

            <button
              id="quick-action-backup"
              onClick={() => onNavigate('backup')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-all text-left flex flex-col items-start gap-2"
            >
              <DatabaseBackup className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold">Backup DB</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Two-Column Details Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Activity Feed & User Roster Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audit Logs Stream */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Recent System Audit Trail
              </h3>
              <button
                id="view-all-audit-logs-btn"
                onClick={() => onNavigate('audit')}
                className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
              >
                View All Logs
              </button>
            </div>

            <div className="space-y-3">
              {recentAudits.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No audit records recorded yet.</p>
              ) : (
                recentAudits.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary">{log.action}</Badge>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {log.username} ({log.userRole})
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Roles Breakdown */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Staff & User Roster Overview
              </h3>
              <button
                onClick={() => onNavigate('users')}
                className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
              >
                Manage Users
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {usersList.slice(0, 6).map((u) => (
                <div key={u.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{u.fullName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.role}</p>
                  <Badge variant={u.status === 'Active' ? 'success' : 'danger'} size="sm" className="mt-1">
                    {u.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: School Profile Card & System Health Panel */}
        <div className="space-y-6">
          {/* School Identity Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              School Profile
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <p><strong>Name:</strong> {schoolProfile?.schoolName}</p>
              <p><strong>Registration:</strong> {schoolProfile?.registrationNumber}</p>
              <p><strong>Type:</strong> {schoolProfile?.schoolType} ({schoolProfile?.schoolLevel})</p>
              <p><strong>District:</strong> {schoolProfile?.district}, {schoolProfile?.region}</p>
              <p><strong>Phone:</strong> {schoolProfile?.telephone}</p>
              <p><strong>Email:</strong> {schoolProfile?.email}</p>
            </div>
          </div>

          {/* System Security & Offline Integrity */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Security & Offline Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Local Offline DB
                </span>
                <span className="font-mono font-bold">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Lockout Policy
                </span>
                <span className="font-mono font-bold">5 FAILS / 15 MIN</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span className="font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Inactivity Lock
                </span>
                <span className="font-mono font-bold">15 MINS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
