import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  DatabaseBackup,
  Activity,
  User,
  GraduationCap,
  Sparkles,
  CheckSquare,
  UserCheck,
  FileSpreadsheet,
  UserPlus,
  BarChart3,
  Calendar,
  Building2,
  Wallet,
  Layers,
  CreditCard,
  Smartphone,
  Rocket,
  Award,
  PieChart,
  BookOpen,
  Bell,
  MessageSquare,
  MessageCircle,
  Newspaper,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  LifeBuoy,
  BarChart2,
  Globe,
  ShoppingBag,
  Handshake,
  Heart,
  Palette,
  Cpu,
  Image,
  Lightbulb,
  Radio,
  Key,
  Video,
  Zap,
  Target,
  Briefcase,
  FolderOpen,
  TrendingUp,
  Eye,
  HeartHandshake,
  QrCode,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { ModuleName } from '../../types';
import { checkRouteAccess } from '../../security/accessControl';
import { SchoolSoulMarkSVG } from '../common/SchoolSoulLogo';
import { UniversalQRScannerModal } from '../common/UniversalQRScannerModal';
import { SchoolQRCodeModal } from '../common/SchoolQRCodeModal';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export interface NavItemConfig {
  id: string;
  label: string;
  module: ModuleName;
  icon: React.ElementType;
  level: number;
  levelName: string;
}

export const NAVIGATION_LEVELS = [
  { level: 1, name: 'Level 1: School Overview', short: 'Overview' },
  { level: 2, name: 'Level 2: Admissions & People', short: 'Admissions & People' },
  { level: 3, name: 'Level 3: Academic Structure', short: 'Academic Structure' },
  { level: 4, name: 'Level 4: Teaching & Learning', short: 'Teaching & Learning' },
  { level: 5, name: 'Level 5: Student Development', short: 'Student Development' },
  { level: 6, name: 'Level 6: School Operations', short: 'Operations & Welfare' },
  { level: 7, name: 'Level 7: Communication', short: 'Communication' },
  { level: 8, name: 'Level 8: Finance & Commerce', short: 'Finance & Commerce' },
  { level: 9, name: 'Level 9: Reporting & Intelligence', short: 'Reporting & AI' },
  { level: 10, name: 'Level 10: System Administration', short: 'Administration' },
];

export const NAV_ITEMS: NavItemConfig[] = [
  // ==========================================
  // LEVEL 1: SCHOOL OVERVIEW
  // ==========================================
  { id: 'dashboard', label: 'Central Dashboard', module: 'Dashboard', icon: LayoutDashboard, level: 1, levelName: 'School Overview' },
  { id: 'executive-cockpit', label: 'Executive Growth Cockpit', module: 'Dashboard', icon: BarChart3, level: 1, levelName: 'School Overview' },
  { id: 'global-framework', label: 'Global Education Framework', module: 'School Settings', icon: Globe, level: 1, levelName: 'School Overview' },
  { id: 'real-world-activation', label: 'Real-World Activation', module: 'School Settings', icon: Sparkles, level: 1, levelName: 'School Overview' },
  { id: 'emergency-alerts', label: 'System Alerts & Emergency', module: 'Emergency Alerts', icon: AlertTriangle, level: 1, levelName: 'School Overview' },

  // ==========================================
  // LEVEL 2: ADMISSIONS & PEOPLE
  // ==========================================
  { id: 'admissions', label: 'Admissions Engine', module: 'Admissions Engine', icon: FileText, level: 2, levelName: 'Admissions & People' },
  { id: 'students', label: 'Student Passports', module: 'Student Passport', icon: GraduationCap, level: 2, levelName: 'Admissions & People' },
  { id: 'staff-hr', label: 'Staff HR Directory', module: 'User Management', icon: Users, level: 2, levelName: 'Admissions & People' },
  { id: 'teacher-intelligence', label: 'Teacher Intelligence', module: 'Dashboard', icon: Award, level: 2, levelName: 'Admissions & People' },
  { id: 'parent-portal', label: 'Parent Portal Hub', module: 'Parent Portal', icon: Users, level: 2, levelName: 'Admissions & People' },
  { id: 'ptm-meetings', label: 'Parent-Teacher Meetings', module: 'Parent-Teacher Meetings', icon: UserCheck, level: 2, levelName: 'Admissions & People' },

  // ==========================================
  // LEVEL 3: ACADEMIC STRUCTURE
  // ==========================================
  { id: 'academic-structure', label: 'Classes & Structure', module: 'Academic Structure', icon: Layers, level: 3, levelName: 'Academic Structure' },
  { id: 'subject-management', label: 'Subject Administration', module: 'Subject Management', icon: BookOpen, level: 3, levelName: 'Academic Structure' },
  { id: 'academic-calendar', label: 'Academic Calendar', module: 'Academic Calendar', icon: Calendar, level: 3, levelName: 'Academic Structure' },
  { id: 'timetable-engine', label: 'Timetable Generator', module: 'Timetable Engine', icon: Calendar, level: 3, levelName: 'Academic Structure' },
  { id: 'lesson-planner', label: 'Lesson Planner', module: 'Lesson Planner', icon: FileText, level: 3, levelName: 'Academic Structure' },

  // ==========================================
  // LEVEL 4: TEACHING & LEARNING
  // ==========================================
  { id: 'academics-hub', label: 'Academics Hub', module: 'Academic Structure', icon: GraduationCap, level: 4, levelName: 'Teaching & Learning' },
  { id: 'live-learning', label: 'Live Virtual Classroom', module: 'Academics', icon: Video, level: 4, levelName: 'Teaching & Learning' },
  { id: 'homework-assignments', label: 'Homework & Tasks', module: 'Homework & Assignments', icon: CheckSquare, level: 4, levelName: 'Teaching & Learning' },
  { id: 'assessment-exams', label: 'Assessments & Exams', module: 'Assessment Engine', icon: Award, level: 4, levelName: 'Teaching & Learning' },
  { id: 'teacher-gradebook', label: 'Teacher Gradebook', module: 'Teacher Gradebook', icon: BarChart3, level: 4, levelName: 'Teaching & Learning' },
  { id: 'report-cards', label: 'Report Cards & QR', module: 'Report Card Engine', icon: GraduationCap, level: 4, levelName: 'Teaching & Learning' },
  { id: 'certificates-transcripts', label: 'Transcripts & Certs', module: 'Certificates & Transcripts', icon: Award, level: 4, levelName: 'Teaching & Learning' },
  { id: 'student-attendance', label: 'Student Register', module: 'Attendance Engine', icon: CheckSquare, level: 4, levelName: 'Teaching & Learning' },
  { id: 'daily-register', label: 'Daily Master Register', module: 'Attendance Engine', icon: FileSpreadsheet, level: 4, levelName: 'Teaching & Learning' },
  { id: 'attendance-analytics', label: 'Attendance Analytics', module: 'Attendance Engine', icon: BarChart3, level: 4, levelName: 'Teaching & Learning' },

  // ==========================================
  // LEVEL 5: STUDENT DEVELOPMENT
  // ==========================================
  { id: 'skills-passport', label: 'Student Skills Passport', module: 'Student Skills Passport', icon: Zap, level: 5, levelName: 'Student Development' },
  { id: 'opportunity-hub', label: 'Opportunity & Achievement Hub', module: 'Opportunity & Achievement Engine', icon: Sparkles, level: 5, levelName: 'Student Development' },
  { id: 'digital-portfolio', label: 'Verified Digital Portfolio', module: 'Verified Digital Portfolio', icon: FolderOpen, level: 5, levelName: 'Student Development' },
  { id: 'v11-student-innovation-hub', label: 'Student Innovation Hub', module: 'Dashboard', icon: Lightbulb, level: 5, levelName: 'Student Development' },
  { id: 'v9-innovation-hub', label: 'Innovation & STEM Hub', module: 'Dashboard', icon: Cpu, level: 5, levelName: 'Student Development' },
  { id: 'school-missions', label: 'School Missions & Challenges', module: 'School Missions', icon: Target, level: 5, levelName: 'Student Development' },
  { id: 'opportunity-board', label: 'Opportunity Board & Match', module: 'Opportunity Board', icon: Briefcase, level: 5, levelName: 'Student Development' },
  { id: 'achievements-certs', label: 'Achievements & Digital Certs', module: 'Achievement System', icon: Award, level: 5, levelName: 'Student Development' },
  { id: 'school-showcase', label: 'School Showcase & Inventions', module: 'School Showcase', icon: Eye, level: 5, levelName: 'Student Development' },
  { id: 'clubs-mentorship', label: 'Clubs & Mentorship Guild', module: 'Clubs & Activities', icon: Users, level: 5, levelName: 'Student Development' },
  { id: 'v9-student-voice', label: 'Student Voice & Proposals', module: 'Dashboard', icon: MessageSquare, level: 5, levelName: 'Student Development' },
  { id: 'v9-student-portfolio', label: 'Student Portfolio Gallery', module: 'Dashboard', icon: Award, level: 5, levelName: 'Student Development' },
  { id: 'sponsorship-bridge', label: 'Sponsorship & Opportunity Bridge', module: 'Sponsorship & Opportunity Bridge', icon: HeartHandshake, level: 5, levelName: 'Student Development' },
  { id: 'sponsor-dashboard', label: 'Sponsor Portal & Discovery', module: 'Sponsor Dashboard', icon: Building2, level: 5, levelName: 'Student Development' },
  { id: 'school-sponsorship', label: 'School Sponsorship Oversight', module: 'School Sponsorship Center', icon: ShieldCheck, level: 5, levelName: 'Student Development' },
  { id: 'scholarships-grants', label: 'Scholarships & Grants Board', module: 'Scholarships & Grants', icon: Award, level: 5, levelName: 'Student Development' },

  // ==========================================
  // LEVEL 6: SCHOOL OPERATIONS
  // ==========================================
  { id: 'daily-operations', label: 'Operations Hub', module: 'Daily Operations', icon: Activity, level: 6, levelName: 'School Operations' },
  { id: 'visitor-management', label: 'Visitor Register', module: 'Visitor Register', icon: UserPlus, level: 6, levelName: 'School Operations' },
  { id: 'staff-leave', label: 'Staff Leave Engine', module: 'Staff Leave Engine', icon: UserCheck, level: 6, levelName: 'School Operations' },
  { id: 'staff-attendance-leave', label: 'Staff & Leave Engine', module: 'Staff Leave Engine', icon: UserCheck, level: 6, levelName: 'School Operations' },
  { id: 'staff-appraisals', label: 'Staff Appraisals', module: 'User Management', icon: Award, level: 6, levelName: 'School Operations' },
  { id: 'staff-cpd', label: 'Staff CPD & Training', module: 'User Management', icon: GraduationCap, level: 6, levelName: 'School Operations' },
  { id: 'asset-management', label: 'Asset Management', module: 'School Settings', icon: Building2, level: 6, levelName: 'School Operations' },
  { id: 'inventory-management', label: 'Stores & Inventory', module: 'School Settings', icon: FileSpreadsheet, level: 6, levelName: 'School Operations' },
  { id: 'safeguarding-centre', label: 'Safeguarding Centre', module: 'User Management', icon: ShieldCheck, level: 6, levelName: 'School Operations' },
  { id: 'student-welfare', label: 'Student Welfare', module: 'User Management', icon: Users, level: 6, levelName: 'School Operations' },
  { id: 'behaviour-discipline', label: 'Behaviour & Discipline', module: 'User Management', icon: Award, level: 6, levelName: 'School Operations' },
  { id: 'counselling-services', label: 'Counselling Services', module: 'User Management', icon: Activity, level: 6, levelName: 'School Operations' },
  { id: 'school-health-centre', label: 'School Health Centre', module: 'User Management', icon: Activity, level: 6, levelName: 'School Operations' },
  { id: 'incident-management', label: 'Incident Management', module: 'User Management', icon: AlertTriangle, level: 6, levelName: 'School Operations' },
  { id: 'policy-centre', label: 'Policy Document Centre', module: 'School Settings', icon: FileCheck, level: 6, levelName: 'School Operations' },
  { id: 'school-administration', label: 'School Administration', module: 'School Settings', icon: Building2, level: 6, levelName: 'School Operations' },
  { id: 'v25-learnguard', label: 'SchoolSoul LearnGuard', module: 'School Settings', icon: Smartphone, level: 6, levelName: 'School Operations' },

  // ==========================================
  // LEVEL 7: COMMUNICATION
  // ==========================================
  { id: 'direct-messaging', label: 'School Messaging', module: 'Direct Messaging', icon: MessageSquare, level: 7, levelName: 'Communication' },
  { id: 'sms-engine', label: 'SMS Gateway Engine', module: 'SMS Engine', icon: Smartphone, level: 7, levelName: 'Communication' },
  { id: 'whatsapp-integration', label: 'WhatsApp Business', module: 'WhatsApp Integration', icon: MessageCircle, level: 7, levelName: 'Communication' },
  { id: 'announcements', label: 'Announcement Centre', module: 'Announcement Center', icon: Bell, level: 7, levelName: 'Communication' },
  { id: 'school-news', label: 'School News & Articles', module: 'School News', icon: Newspaper, level: 7, levelName: 'Communication' },
  { id: 'events-management', label: 'Events & Calendar', module: 'Events & Calendar', icon: Calendar, level: 7, levelName: 'Communication' },
  { id: 'consent-forms', label: 'Digital Consent Slips', module: 'Digital Consent Forms', icon: FileCheck, level: 7, levelName: 'Communication' },
  { id: 'feedback-surveys', label: 'Feedback & Surveys', module: 'Feedback & Surveys', icon: HelpCircle, level: 7, levelName: 'Communication' },
  { id: 'help-centre', label: 'School Helpdesk', module: 'School Help Centre', icon: LifeBuoy, level: 7, levelName: 'Communication' },
  { id: 'digital-community', label: 'Digital Community Hub', module: 'Digital Community', icon: Users, level: 7, levelName: 'Communication' },
  { id: 'community-groups', label: 'Community Groups', module: 'Community Groups', icon: Users, level: 7, levelName: 'Communication' },
  { id: 'v14-communication-suite', label: 'V14 Comms & Mail Merge', module: 'Direct Messaging', icon: MessageSquare, level: 7, levelName: 'Communication' },
  { id: 'v13-connect', label: 'SchoolSoul Connect (LAN)', module: 'Dashboard', icon: Radio, level: 7, levelName: 'Communication' },
  { id: 'communication-dashboards', label: 'Role Dashboards', module: 'Parent Portal', icon: LayoutDashboard, level: 7, levelName: 'Communication' },
  { id: 'communication-analytics', label: 'Engagement Analytics', module: 'Communication Analytics', icon: BarChart2, level: 7, levelName: 'Communication' },

  // ==========================================
  // LEVEL 8: FINANCE & COMMERCE
  // ==========================================
  { id: 'finance-hub', label: 'Finance Operations Hub', module: 'Financial Reporting', icon: Wallet, level: 8, levelName: 'Finance & Commerce' },
  { id: 'fee-structures', label: 'Fee Structures', module: 'Fee Structure', icon: Layers, level: 8, levelName: 'Finance & Commerce' },
  { id: 'student-fee-accounts', label: 'Student Fee Accounts', module: 'Fee Accounts', icon: CreditCard, level: 8, levelName: 'Finance & Commerce' },
  { id: 'payment-processing', label: 'Payment & MoMo Engine', module: 'Payment Engine', icon: Smartphone, level: 8, levelName: 'Finance & Commerce' },
  { id: 'income-expenditure', label: 'Cashbook & Expenses', module: 'Income & Expenditure', icon: BookOpen, level: 8, levelName: 'Finance & Commerce' },
  { id: 'budget-management', label: 'Budget Management', module: 'Budget Management', icon: PieChart, level: 8, levelName: 'Finance & Commerce' },
  { id: 'scholarships-discounts', label: 'Scholarships & Bursaries', module: 'Scholarships & Discounts', icon: Award, level: 8, levelName: 'Finance & Commerce' },
  { id: 'financial-reports', label: 'Financial Reports', module: 'Financial Reporting', icon: FileSpreadsheet, level: 8, levelName: 'Finance & Commerce' },
  { id: 'financial-dashboards', label: 'Financial Dashboards', module: 'Financial Reporting', icon: ShieldCheck, level: 8, levelName: 'Finance & Commerce' },
  { id: 'payment-reminders', label: 'Fee Reminders', module: 'Notifications', icon: Bell, level: 8, levelName: 'Finance & Commerce' },
  { id: 'v9-student-marketplace', label: 'School Market & Canteen', module: 'Dashboard', icon: ShoppingBag, level: 8, levelName: 'Finance & Commerce' },
  { id: 'commercial-value-center', label: 'Commercial & Value Center', module: 'School Settings', icon: CreditCard, level: 8, levelName: 'Finance & Commerce' },
  { id: 'unified-subscription', label: 'Unified Subscription', module: 'School Settings', icon: CreditCard, level: 8, levelName: 'Finance & Commerce' },

  // ==========================================
  // LEVEL 9: REPORTING & INTELLIGENCE
  // ==========================================
  { id: 'performance-analytics', label: 'Performance & Resources', module: 'Dashboard', icon: Layers, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'student-intelligence', label: 'Student Risk Analytics', module: 'Dashboard', icon: Users, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'financial-intelligence', label: 'Financial AI & Simulator', module: 'Dashboard', icon: Wallet, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'academic-analytics', label: 'Academic Analytics', module: 'Academic Analytics', icon: PieChart, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'board-reporting', label: 'Board & Executive Packs', module: 'Dashboard', icon: Building2, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'improvement-tracker', label: 'School Improvement Plan', module: 'Dashboard', icon: CheckSquare, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'knowledge-centre', label: 'Knowledge & Policy Search', module: 'Dashboard', icon: BookOpen, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'ai-assistant', label: 'AI Assistant & Reports', module: 'Dashboard', icon: Sparkles, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'school-impact', label: 'School Impact & Accreditation', module: 'School Impact Dashboard', icon: TrendingUp, level: 9, levelName: 'Reporting & Intelligence' },
  { id: 'v9-public-analytics', label: 'Public Analytics', module: 'Dashboard', icon: BarChart3, level: 9, levelName: 'Reporting & Intelligence' },

  // ==========================================
  // LEVEL 10: SYSTEM ADMINISTRATION
  // ==========================================
  { id: 'users', label: 'User Management', module: 'User Management', icon: Users, level: 10, levelName: 'System Administration' },
  { id: 'roles', label: 'Roles & Permissions', module: 'Roles & Permissions', icon: ShieldCheck, level: 10, levelName: 'System Administration' },
  { id: 'settings', label: 'School Settings', module: 'School Settings', icon: Settings, level: 10, levelName: 'System Administration' },
  { id: 'v26-final-system-integrity', label: 'System Integrity (V26)', module: 'School Settings', icon: Key, level: 10, levelName: 'System Administration' },
  { id: 'compliance-audit', label: 'Compliance & Audit', module: 'Audit System', icon: ShieldCheck, level: 10, levelName: 'System Administration' },
  { id: 'admin-feedback', label: 'Admin Feedback Centre', module: 'Audit System', icon: MessageSquare, level: 10, levelName: 'System Administration' },
  { id: 'ai-governance', label: 'AI Controls & Audit Logs', module: 'Dashboard', icon: ShieldCheck, level: 10, levelName: 'System Administration' },
  { id: 'health', label: 'System Health', module: 'System Health', icon: Activity, level: 10, levelName: 'System Administration' },
  { id: 'backup', label: 'Backup & Restore', module: 'Backup & Restore', icon: DatabaseBackup, level: 10, levelName: 'System Administration' },
  { id: 'audit', label: 'Audit Logs', module: 'Audit System', icon: FileText, level: 10, levelName: 'System Administration' },
  { id: 'user-guide', label: 'Official User Guide (PDF)', module: 'Dashboard', icon: BookOpen, level: 10, levelName: 'System Administration' },
  { id: 'v24-final-pre-deployment-pilot', label: 'Pre-Deployment (V24)', module: 'School Settings', icon: ShieldCheck, level: 10, levelName: 'System Administration' },
  { id: 'v23-unified-education-os', label: 'Unified Education OS (V23)', module: 'School Settings', icon: GraduationCap, level: 10, levelName: 'System Administration' },
  { id: 'v21-final-production-release', label: 'V21 Release Certification', module: 'School Settings', icon: Award, level: 10, levelName: 'System Administration' },
  { id: 'v20-vinexsah-control-center', label: 'V20 VINEXSAH Console', module: 'School Settings', icon: Building2, level: 10, levelName: 'System Administration' },
  { id: 'v19-deployment-success', label: 'V19 Customer Success', module: 'School Settings', icon: Rocket, level: 10, levelName: 'System Administration' },
  { id: 'v18-mobile-license-integration', label: 'V18 Mobile License Sync', module: 'School Settings', icon: Smartphone, level: 10, levelName: 'System Administration' },
  { id: 'v16-market-readiness', label: 'V16 Market Readiness', module: 'School Settings', icon: ShieldCheck, level: 10, levelName: 'System Administration' },
  { id: 'pilot-release-center', label: 'Pilot Release Center', module: 'School Settings', icon: ShieldCheck, level: 10, levelName: 'System Administration' },
  { id: 'v15-license-management', label: 'V15 License Management', module: 'School Settings', icon: Key, level: 10, levelName: 'System Administration' },
  { id: 'profile', label: 'Profile Settings', module: 'Dashboard', icon: User, level: 10, levelName: 'System Administration' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, activeRole, schoolProfile, hasPermission } = useAuth();
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: false,
    6: false,
    7: false,
    8: true,
    9: false,
    10: false,
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSchoolQROpen, setIsSchoolQROpen] = useState(false);

  const toggleLevel = (lvl: number) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [lvl]: !prev[lvl],
    }));
  };

  // Filter items based on access permissions and search query
  const accessibleItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      const access = checkRouteAccess(user, activeRole, item.id, hasPermission);
      if (!access.allowed && item.id !== 'dashboard' && item.id !== 'profile') return false;

      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        return (
          item.label.toLowerCase().includes(query) ||
          item.levelName.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [user, activeRole, hasPermission, searchFilter]);

  // Group items by level
  const groupedByLevel = useMemo(() => {
    const map: Record<number, NavItemConfig[]> = {};
    for (const lvl of NAVIGATION_LEVELS) {
      map[lvl.level] = accessibleItems.filter((i) => i.level === lvl.level);
    }
    return map;
  }, [accessibleItems]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 w-64 select-none">
      {/* Header Branding */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {schoolProfile?.schoolLogo ? (
            <img
              src={schoolProfile.schoolLogo}
              alt={schoolProfile.schoolName || 'School Logo'}
              className="w-9 h-9 rounded-xl object-contain bg-slate-800 p-0.5 border border-slate-700 shadow-md shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-md shrink-0">
              <SchoolSoulMarkSVG size={32} idPrefix="ss-sidebar-header" />
            </div>
          )}
          <div className="overflow-hidden">
            <h2 className="font-bold text-xs text-white truncate tracking-tight uppercase">
              {schoolProfile?.schoolName || 'SchoolSoul OS'}
            </h2>
            <p className="text-[10px] text-slate-400 truncate">
              {schoolProfile?.country || 'Uganda'} • {activeRole}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Universal QR Scanner & Identity Strip */}
      <div className="px-3 pt-2.5 pb-1 grid grid-cols-2 gap-1.5 border-b border-slate-800/80">
        <button
          id="sidebar-quick-scan-qr-btn"
          onClick={() => setIsScannerOpen(true)}
          className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
        >
          <QrCode className="w-3.5 h-3.5" /> Scan QR
        </button>
        <button
          id="sidebar-quick-school-qr-btn"
          onClick={() => setIsSchoolQROpen(true)}
          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-400" /> School QR
        </button>
      </div>

      {/* Search / Filter Navigation Box */}
      <div className="p-2.5 pb-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Search dashboards & tools..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Navigation Levels List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
        {NAVIGATION_LEVELS.map((lvl) => {
          const items = groupedByLevel[lvl.level] || [];
          if (items.length === 0) return null;

          const isExpanded = searchFilter.trim() ? true : Boolean(expandedLevels[lvl.level]);
          const hasActiveChild = items.some((i) => i.id === activeView);

          return (
            <div key={lvl.level} className="space-y-0.5">
              {/* Level Group Header Button */}
              <button
                type="button"
                onClick={() => toggleLevel(lvl.level)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                  hasActiveChild
                    ? 'text-blue-400 bg-blue-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
                  {lvl.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                    {items.length}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Child Items */}
              {isExpanded && (
                <div className="pl-1.5 space-y-0.5 pt-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                      <button
                        key={item.id}
                        id={`nav-link-${item.id}`}
                        onClick={() => {
                          onNavigate(item.id);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate flex-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-300">SchoolSoul OS</p>
          <p className="text-[10px] text-slate-500">2026.1.0 Universal</p>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-800/60 font-mono text-[10px]">
          10 LEVELS
        </span>
      </div>

      {/* Global Modals Mounted on Sidebar */}
      <UniversalQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectStudent={(studentId) => {
          onNavigate('student-detail');
        }}
      />

      <SchoolQRCodeModal
        isOpen={isSchoolQROpen}
        onClose={() => setIsSchoolQROpen(false)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
