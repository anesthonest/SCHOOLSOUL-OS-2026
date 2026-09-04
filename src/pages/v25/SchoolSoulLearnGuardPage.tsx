import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  BookOpen,
  Camera,
  Video,
  FileText,
  Award,
  CheckCircle2,
  Lock,
  Clock,
  Play,
  Zap,
  Users,
  Eye,
  Globe,
  Radio,
  Search,
  Upload,
  Sparkles,
  AlertTriangle,
  Sliders,
  Send,
  Wifi,
  WifiOff,
  Layers,
  ChevronRight,
  BarChart3,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Download,
  Filter,
  Check,
  Plus,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logAuditEvent } from '../../services/api';

export type SystemModeState =
  | 'NORMAL'
  | 'LEARNING_MODE'
  | 'EXAM_MODE'
  | 'RESTRICTED_MODE'
  | 'EMERGENCY_MODE';

export type DeviceClassification = 'PERSONAL' | 'SCHOOL_MANAGED';

export type ActivityType =
  | 'RESEARCH_TASK'
  | 'PHOTO_TASK'
  | 'VIDEO_TASK'
  | 'PRESENTATION'
  | 'QUIZ'
  | 'GROUP_DISCUSSION'
  | 'PROJECT'
  | 'FIELDWORK'
  | 'POLL'
  | 'SURVEY'
  | 'ASSIGNMENT'
  | 'REFLECTION'
  | 'COMPETENCY_EVIDENCE';

export interface LearnGuardActivity {
  id: string;
  title: string;
  subject: string;
  className: string;
  teacherName: string;
  type: ActivityType;
  description: string;
  dueDate: string;
  timeLimitMinutes?: number;
  lowDataMode: boolean;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  submissionsCount: number;
  totalStudents: number;
}

export interface ApprovedResource {
  id: string;
  title: string;
  category: 'Website' | 'Digital Textbook' | 'Curriculum' | 'Video Resource';
  url: string;
  subject: string;
  verifiedByNCDC: boolean;
}

export interface PortfolioEvidence {
  id: string;
  studentName: string;
  activityTitle: string;
  subject: string;
  mediaType: 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'RESEARCH_NOTE';
  mediaUrl?: string;
  caption: string;
  gradeScore?: string;
  moderationStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'FLAGGED';
  submittedAt: string;
}

export const SchoolSoulLearnGuardPage: React.FC = () => {
  const { user, schoolProfile } = useAuth();

  // Active Role View Filter (Student, Teacher, Headteacher)
  const [activeRoleView, setActiveRoleView] = useState<'STUDENT' | 'TEACHER' | 'HEADTEACHER'>(
    user?.role === 'Student' ? 'STUDENT' : user?.role === 'Teacher' ? 'TEACHER' : 'HEADTEACHER'
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'my-learning'
    | 'live-session'
    | 'activity-creator'
    | 'approved-resources'
    | 'digital-portfolio'
    | 'digital-safety'
    | 'policy-engine'
  >('my-learning');

  // Device & System Mode States
  const [systemMode, setSystemMode] = useState<SystemModeState>('LEARNING_MODE');
  const [deviceType, setDeviceType] = useState<DeviceClassification>('PERSONAL');
  const [lowDataMode, setLowDataMode] = useState<boolean>(true);
  const [offlineStatus, setOfflineStatus] = useState<boolean>(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- SAMPLE ACTIVITIES DATA ---
  const [activities, setActivities] = useState<LearnGuardActivity[]>([
    {
      id: 'ACT-101',
      title: 'Biology Fieldwork: Plant Adaptation Samples',
      subject: 'Biology',
      className: 'S.2 Blue',
      teacherName: 'Dr. Jane Mukasa',
      type: 'FIELDWORK',
      description: 'Capture 3 distinct photographs of leaf adaptations around the school botanical lawn and describe xerophytic features.',
      dueDate: 'Today, 10:40 AM',
      timeLimitMinutes: 40,
      lowDataMode: true,
      status: 'ACTIVE',
      submissionsCount: 24,
      totalStudents: 32,
    },
    {
      id: 'ACT-102',
      title: 'Physics Practical: Pendulum Period Video Demonstration',
      subject: 'Physics',
      className: 'S.3 Green',
      teacherName: 'Mr. David Okello',
      type: 'VIDEO_TASK',
      description: 'Record a compressed 45-second video demonstrating string length effect on oscillation period.',
      dueDate: 'Today, 02:00 PM',
      timeLimitMinutes: 30,
      lowDataMode: true,
      status: 'ACTIVE',
      submissionsCount: 18,
      totalStudents: 30,
    },
    {
      id: 'ACT-103',
      title: 'History Digital Research: Uganda Independence Primary Sources',
      subject: 'History',
      className: 'S.4 Red',
      teacherName: 'Mrs. Sarah Akello',
      type: 'RESEARCH_TASK',
      description: 'Access the Uganda National Archives digital portal via approved resources and summarize 3 constitutional clauses.',
      dueDate: 'Tomorrow, 11:00 AM',
      timeLimitMinutes: 60,
      lowDataMode: false,
      status: 'UPCOMING',
      submissionsCount: 0,
      totalStudents: 35,
    },
  ]);

  // --- SAMPLE APPROVED RESOURCES ---
  const approvedResources: ApprovedResource[] = [
    { id: 'RES-01', title: 'Uganda NCDC Lower Secondary Curriculum Hub', category: 'Curriculum', url: 'https://ncdc.go.ug/curriculum', subject: 'General', verifiedByNCDC: true },
    { id: 'RES-02', title: 'East African Digital Science Textbook Library', category: 'Digital Textbook', url: 'https://eascience.org/library', subject: 'Science', verifiedByNCDC: true },
    { id: 'RES-03', title: 'Uganda National Archives Historical Documents', category: 'Website', url: 'https://archives.go.ug/history', subject: 'History', verifiedByNCDC: true },
    { id: 'RES-04', title: 'Khan Academy Offline Mathematics Video Archive', category: 'Video Resource', url: 'https://khan.org/offline-math', subject: 'Mathematics', verifiedByNCDC: true },
  ];

  // --- SAMPLE PORTFOLIO EVIDENCE ---
  const [portfolioEvidence, setPortfolioEvidence] = useState<PortfolioEvidence[]>([
    {
      id: 'EV-01',
      studentName: 'Kato Paul (S.2 Blue)',
      activityTitle: 'Biology Fieldwork: Plant Adaptation Samples',
      subject: 'Biology',
      mediaType: 'PHOTO',
      mediaUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80',
      caption: 'Observed thick waxy cuticle on Eucalyptus leaf reducing transpiration during noon hours.',
      gradeScore: 'Competency Achieved (Grade A)',
      moderationStatus: 'APPROVED',
      submittedAt: 'Today, 10:22 AM',
    },
    {
      id: 'EV-02',
      studentName: 'Nassolo Sarah (S.3 Green)',
      activityTitle: 'Physics Practical: Pendulum Demonstration',
      subject: 'Physics',
      mediaType: 'VIDEO',
      caption: '45-second video recording showing period T variation against length L with zero parallex error.',
      gradeScore: 'Pending Evaluation',
      moderationStatus: 'PENDING',
      submittedAt: 'Today, 11:05 AM',
    },
  ]);

  // --- NEW ACTIVITY CREATOR STATE ---
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Biology');
  const [newClass, setNewClass] = useState('S.2 Blue');
  const [newType, setNewType] = useState<ActivityType>('FIELDWORK');
  const [newDescription, setNewDescription] = useState('');

  // Handle Activity Creation
  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) {
      showToast('Please complete activity title and instructions.', 'warning');
      return;
    }

    const created: LearnGuardActivity = {
      id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      subject: newSubject,
      className: newClass,
      teacherName: user?.fullName || 'Teacher',
      type: newType,
      description: newDescription,
      dueDate: 'Today, 03:30 PM',
      timeLimitMinutes: 45,
      lowDataMode: lowDataMode,
      status: 'ACTIVE',
      submissionsCount: 0,
      totalStudents: 32,
    };

    setActivities([created, ...activities]);
    setNewTitle('');
    setNewDescription('');
    showToast('Digital Activity Published! Students notified in Learning Mode.');

    logAuditEvent(
      user?.id || 'usr-teacher',
      user?.fullName || 'Teacher',
      user?.role || 'Teacher',
      'System Settings' as any,
      `Published LearnGuard Digital Activity: ${newTitle}`
    );
  };

  // Camera Submission Simulation
  const handleSimulateCameraSubmit = () => {
    showToast('Capturing field photo evidence with low-data auto-compression...', 'info');
    setTimeout(() => {
      const newEv: PortfolioEvidence = {
        id: `EV-${Math.floor(10 + Math.random() * 90)}`,
        studentName: user?.fullName || 'Current Student',
        activityTitle: 'Biology Fieldwork: Plant Adaptation Samples',
        subject: 'Biology',
        mediaType: 'PHOTO',
        mediaUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80',
        caption: 'Captured succulent leaf structure retaining water in arid soil sample.',
        gradeScore: 'Submitted — Pending Review',
        moderationStatus: 'PENDING',
        submittedAt: 'Just now',
      };
      setPortfolioEvidence([newEv, ...portfolioEvidence]);
      showToast('Photo evidence uploaded to Student Digital Portfolio!');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-16 antialiased">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl text-white shadow-2xl animate-fade-in text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-red-900 border border-red-500'
              : toast.type === 'warning'
              ? 'bg-amber-900 border border-amber-500'
              : 'bg-slate-900 border border-emerald-500'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-teal-950 to-indigo-950 border border-teal-800/50 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] uppercase tracking-wider border border-teal-400/30 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-teal-400" /> SchoolSoul LearnGuard
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30">
                Controlled Digital Learning System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Transforming Student Phones into Controlled Educational Tools
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Replacing phone bans with structured, privacy-respecting digital learning. Supports teacher-controlled activities, fieldwork camera evidence, approved resources, low-data compression, and digital portfolios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* View As Toggle */}
            <div className="p-1 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-1 text-[11px] font-bold">
              {(['STUDENT', 'TEACHER', 'HEADTEACHER'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRoleView(role)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeRoleView === role
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role === 'STUDENT' ? 'Student View' : role === 'TEACHER' ? 'Teacher View' : 'Headteacher Admin'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Controls Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Mode Switcher */}
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-bold">System Mode:</span>
            <select
              value={systemMode}
              onChange={(e) => {
                const nextMode = e.target.value as SystemModeState;
                setSystemMode(nextMode);
                showToast(`System Mode switched to ${nextMode}`);
              }}
              className="bg-teal-950 text-teal-300 font-bold font-mono px-2 py-1 rounded-xl border border-teal-500/30 text-[11px]"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="LEARNING_MODE">LEARNING MODE ACTIVE</option>
              <option value="EXAM_MODE">EXAM MODE LOCK</option>
              <option value="RESTRICTED_MODE">RESTRICTED MODE</option>
              <option value="EMERGENCY_MODE">EMERGENCY MODE</option>
            </select>
          </div>

          {/* Device Classification */}
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-bold">Device Ownership:</span>
            <button
              onClick={() => {
                const nextDev = deviceType === 'PERSONAL' ? 'SCHOOL_MANAGED' : 'PERSONAL';
                setDeviceType(nextDev);
                showToast(`Device classified as ${nextDev}`);
              }}
              className={`px-2.5 py-1 rounded-xl font-mono font-bold text-[10px] ${
                deviceType === 'SCHOOL_MANAGED'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {deviceType}
            </button>
          </div>

          {/* Low Data Mode Toggle */}
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-bold">Low-Data Compression:</span>
            <button
              onClick={() => {
                setLowDataMode(!lowDataMode);
                showToast(`Low-Data Mode ${!lowDataMode ? 'Enabled' : 'Disabled'}`);
              }}
              className={`px-2.5 py-1 rounded-xl font-bold text-[10px] ${
                lowDataMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {lowDataMode ? 'ACTIVE (Compressed)' : 'OFF'}
            </button>
          </div>

          {/* Offline Sync State */}
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-bold">Offline Queue:</span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-teal-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>0 Queued</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'my-learning', label: '1. My Learning Console', icon: BookOpen },
            { id: 'live-session', label: '2. Live Class Session', icon: Radio, badge: 'ACTIVE' },
            { id: 'activity-creator', label: '3. Create Activity', icon: Plus },
            { id: 'approved-resources', label: '4. Approved Resources', icon: Globe },
            { id: 'digital-portfolio', label: '5. Student Portfolio', icon: Award },
            { id: 'digital-safety', label: '6. Digital Citizenship', icon: ShieldCheck },
            { id: 'policy-engine', label: '7. School Policy Engine', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500 text-slate-950 font-black rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SYSTEM STATE BANNER FOR STUDENTS */}
      {systemMode === 'LEARNING_MODE' && (
        <div className="p-4 rounded-2xl bg-teal-900/30 border border-teal-500/40 text-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500 text-slate-950 rounded-xl font-black">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black uppercase tracking-wider text-[11px] text-teal-400">
                LEARNING MODE ACTIVE
              </span>
              <p className="text-slate-300">
                Active Lesson: <strong className="text-white">S.2 Biology (Fieldwork)</strong> — Your phone is configured for approved educational activities.
              </p>
            </div>
          </div>
          <button
            onClick={handleSimulateCameraSubmit}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" /> Take Fieldwork Photo Evidence
          </button>
        </div>
      )}

      {/* TAB 1: MY LEARNING CONSOLE (STUDENT DASHBOARD) */}
      {activeTab === 'my-learning' && (
        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Class Card */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Current Timetable Period</span>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">S.2 Blue Biology</h3>
                <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                  10:00 - 10:40 AM
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Teacher: Dr. Jane Mukasa</p>
              <div className="pt-2 flex items-center justify-between text-slate-400 text-[10px]">
                <span>Status: Session Active</span>
                <span className="text-emerald-500 font-bold">28 / 32 Joined</span>
              </div>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-slate-400 font-bold uppercase text-[10px]">LearnGuard Privacy Assurance</span>
              <h3 className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Transparent & Non-Spying
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Zero hidden recording of cameras, microphones, or personal messages. Only submitted activity evidence is processed.
              </p>
            </div>

            {/* Digital Citizenship Card */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Digital Citizenship Score</span>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">92 / 100</h3>
                <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                  Exemplary Learner
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Based on completed cyber safety lessons, responsible citation, and ethics training.
              </p>
            </div>
          </div>

          {/* Assigned Activities List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              Assigned Educational Activities
            </h3>

            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                        {act.subject} ({act.className})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-[10px]">
                        {act.type}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{act.title}</h4>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">{act.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                      <span>Teacher: {act.teacherName}</span>
                      <span>Due: {act.dueDate}</span>
                      <span>Submissions: {act.submissionsCount}/{act.totalStudents}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleSimulateCameraSubmit}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Submit Media
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CLASS SESSION */}
      {activeTab === 'live-session' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Live Classroom Session Controller (S.2 Blue Biology)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time connection monitoring, task dispatch, and student engagement tracking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-teal-950 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold text-[10px]">
                    LIVE BROADCAST ACTIVE
                  </span>
                  <span className="font-mono text-teal-400">Session ID: SESS-BIO-2026</span>
                </div>
                <h4 className="text-lg font-black">Fieldwork Activity: Leaf Adaptation Observations</h4>
                <p className="text-slate-300 text-[11px]">
                  Students are currently exploring the botanical lawn in pairs, gathering photo evidence of leaf adaptation.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">JOINED STUDENTS</span>
                    <strong className="text-emerald-400 text-base">28 / 32</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SUBMISSIONS</span>
                    <strong className="text-teal-300 text-base">24 / 32</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TIME REMAINING</span>
                    <strong className="text-amber-400 text-base">18 mins</strong>
                  </div>
                </div>
              </div>

              {/* Student Roster Connection Status */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Joined Students Roster</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {[
                    { name: 'Kato Paul', status: 'Submitted Photo', color: 'text-emerald-600' },
                    { name: 'Nassolo Sarah', status: 'In Activity', color: 'text-teal-600' },
                    { name: 'Opio David', status: 'Submitted Photo', color: 'text-emerald-600' },
                    { name: 'Akello Grace', status: 'In Activity', color: 'text-teal-600' },
                    { name: 'Muwanguzi Ivan', status: 'Submitted Video', color: 'text-emerald-600' },
                    { name: 'Okello James', status: 'Submitted Photo', color: 'text-emerald-600' },
                  ].map((s, i) => (
                    <div key={i} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                      <span className={`font-bold ${s.color} text-[10px]`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Session Controls */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Session Control Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => showToast('Dispatched Live Poll Question to all student phones!')}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Dispatch Quick Poll Question
                </button>
                <button
                  onClick={() => showToast('Triggered Fieldwork Time Warning (5 Mins Remaining)')}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Send Time Alert
                </button>
                <button
                  onClick={() => showToast('Closed Active Fieldwork Session & Generated Summary Report')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> End Live Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE ACTIVITY */}
      {activeTab === 'activity-creator' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Create Teacher-Controlled Educational Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Design competency-based tasks with controlled camera evidence, fieldwork media, research questions, or quizzes.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateActivity} className="space-y-4 max-w-2xl">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Activity Title:</label>
              <input
                type="text"
                placeholder="e.g. Geography Fieldwork: Soil Profile Photographs"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Subject:</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold mt-1"
                >
                  <option value="Biology">Biology</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Geography">Geography</option>
                  <option value="History">History</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="ICT">ICT</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Class:</label>
                <select
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold mt-1"
                >
                  <option value="S.1 Red">S.1 Red</option>
                  <option value="S.2 Blue">S.2 Blue</option>
                  <option value="S.3 Green">S.3 Green</option>
                  <option value="S.4 Yellow">S.4 Yellow</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Activity Type:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ActivityType)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold mt-1"
                >
                  <option value="FIELDWORK">Fieldwork (Photo Evidence)</option>
                  <option value="PHOTO_TASK">Photo Task</option>
                  <option value="VIDEO_TASK">Video Task</option>
                  <option value="RESEARCH_TASK">Research Task</option>
                  <option value="PROJECT">Project Evidence</option>
                  <option value="QUIZ">Quiz / Assessment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Instructions & Required Evidence:</label>
              <textarea
                rows={3}
                placeholder="Describe what students must observe, capture with camera, or summarize..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium mt-1"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Publish Digital Activity to Class
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: APPROVED RESOURCES */}
      {activeTab === 'approved-resources' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Approved Educational Web & Digital Library Resources
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Curated whitelist of educational portals accessible during Learning Mode and Digital Research Mode.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                    {res.category}
                  </span>
                  <span className="text-emerald-600 font-bold text-[10px]">Verified NCDC Resource</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{res.title}</h4>
                <p className="font-mono text-slate-400 text-[10px]">{res.url}</p>
                <button
                  onClick={() => showToast(`Opening Whitelisted Portal: ${res.title}`)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Access Portal
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT DIGITAL PORTFOLIO */}
      {activeTab === 'digital-portfolio' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Student Digital Portfolio & Competency Vault
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authentic evidence repository showcasing student fieldwork photos, videos, research notes, and teacher competency grades.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioEvidence.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                {ev.mediaUrl && (
                  <img
                    src={ev.mediaUrl}
                    alt="Evidence"
                    className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{ev.studentName}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      {ev.moderationStatus}
                    </span>
                  </div>
                  <h5 className="font-bold text-teal-600">{ev.activityTitle} ({ev.subject})</h5>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{ev.caption}</p>
                  <div className="pt-2 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-indigo-600 font-bold">{ev.gradeScore}</span>
                    <span className="text-slate-400">{ev.submittedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DIGITAL SAFETY CENTER */}
      {activeTab === 'digital-safety' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Digital Citizenship & Cyber Safety Training Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Educating students on privacy awareness, cyberbullying prevention, password hygiene, and digital ethics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: 'Module 1: Password Safety & Privacy', desc: 'Understanding two-factor security, safe device storage, and account protection.', status: 'Completed' },
              { title: 'Module 2: Academic Honesty & Citation', desc: 'Proper attribution of primary web research and avoiding digital plagiarism.', status: 'Completed' },
              { title: 'Module 3: Respectful Communication', desc: 'Preventing cyberbullying and fostering constructive peer project collaboration.', status: 'In Progress' },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  {m.status}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{m.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SCHOOL PHONE POLICY ENGINE */}
      {activeTab === 'policy-engine' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                School Phone Policy & Schedule Configuration Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure school hours, device policies, camera evidence rules, and data retention parameters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Institution Phone Policy</h4>
              <div className="space-y-3">
                {[
                  { label: 'Controlled Educational Use (Recommended)', selected: true },
                  { label: 'Restricted to Exam & Fieldwork Periods', selected: false },
                  { label: 'Prohibited Outside Learning Mode', selected: false },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{p.label}</span>
                    <input type="radio" checked={p.selected} readOnly className="accent-teal-600" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Low-Data & Storage Policy</h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Max Video Duration:</span>
                  <span className="font-bold text-teal-600">60 Seconds</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Photo Auto-Compression:</span>
                  <span className="font-bold text-emerald-600">Active (WebP 80% Quality)</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Offline Queue Cache Limit:</span>
                  <span className="font-bold text-blue-600">500 MB / Student</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
