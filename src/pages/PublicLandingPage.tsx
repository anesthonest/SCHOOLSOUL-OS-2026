import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  WifiOff,
  CreditCard,
  BookOpen,
  Users,
  CheckCircle2,
  ArrowRight,
  School,
  Lock,
  Phone,
  Mail,
  Building2,
  Globe2,
  HeartHandshake,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  MessageSquare,
  FileCheck,
  Video,
  Award,
  ChevronDown,
  UserPlus,
  Compass,
  Play,
  Activity,
  Server,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { SchoolSoulMarkSVG } from '../components/common/SchoolSoulLogo';
import { PWAInstallBanner, PWAInstallButton } from '../components/common/PWAInstallBanner';
import { ProductShowcase } from '../components/landing/ProductShowcase';
import { ROIEstimator } from '../components/landing/ROIEstimator';
import { PlanComparisonTable } from '../components/landing/PlanComparisonTable';
import { ExploreSandboxModal } from '../components/landing/ExploreSandboxModal';
import { VideoWalkthroughModal } from '../components/landing/VideoWalkthroughModal';
import { SystemStatusModal } from '../components/landing/SystemStatusModal';
import { LanDeploymentModal } from '../components/landing/LanDeploymentModal';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  STUDENT_PRICING_PLANS,
  SUPPORTED_CURRENCY_RATES,
  COMMERCIAL_ADDONS,
  calculateStudentSubscriptionQuote,
} from '../services/pricingEngineService';

interface PublicLandingPageProps {
  onGoToAuth: (initialTab?: 'LOGIN' | 'REGISTER' | 'STATUS') => void;
  onGoToRegisterSchool?: () => void;
  schoolName?: string;
  schoolLogo?: string;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onGoToAuth,
  onGoToRegisterSchool,
  schoolName = 'SchoolSoul OS',
  schoolLogo,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { showSuccess } = useToast();

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isLanModalOpen, setIsLanModalOpen] = useState(false);

  const [demoForm, setDemoForm] = useState({
    schoolName: '',
    contactPerson: '',
    email: '',
    phone: '+256 ',
    country: 'Uganda',
    estimatedStudents: '500-1000',
    notes: '',
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  // Student-based Pricing Calculator State
  const [calcStudents, setCalcStudents] = useState<number>(500);
  const [calcCycle, setCalcCycle] = useState<'Annual' | 'Monthly'>('Annual');
  const [calcCurrency, setCalcCurrency] = useState<string>('UGX');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitting(true);
    setTimeout(() => {
      setDemoSubmitting(false);
      setDemoSubmitted(true);
      showSuccess('Demo Request Received', 'A SchoolSoul education specialist will contact you shortly.');
    }, 600);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* 0. Top PWA Install Banner */}
      <PWAInstallBanner onOpenApp={() => onGoToAuth('LOGIN')} />

      {/* 1. Public Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt={schoolName}
                className="w-9 h-9 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xs">
                <SchoolSoulMarkSVG size={26} idPrefix="ss-landing-brand" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                {schoolName}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
                School Operating System
              </p>
            </div>
          </div>

          {/* Header Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-blue-600" />
              <span>Watch Video</span>
            </button>

            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Pricing
            </a>

            <PWAInstallButton className="hidden sm:inline-flex" />

            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex text-xs font-semibold"
            >
              Request a Demo
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section - The Critical First Visible Screen */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:pt-8 sm:pb-12 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-white via-slate-50 to-slate-100/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          {/* Natural Editorial Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="tracking-wide">SCHOOLSOUL OS 2026</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>UNIFIED SCHOOL OPERATING SYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight uppercase">
            SchoolSoul OS
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-200 max-w-3xl mx-auto">
            "One operating system for the modern school."
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A modern school operating system designed to help schools manage their people, academics, operations, communication, finance and digital learning environment.
          </p>

          {/* PRIMARY FIRST-SCREEN ACTIONS */}
          <div className="pt-1 sm:pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
              <Button
                variant="primary"
                size="lg"
                data-testid="first-screen-login-btn"
                onClick={() => onGoToAuth('LOGIN')}
                iconLeading={<Lock className="w-5 h-5" />}
                iconTrailing={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold tracking-wide uppercase bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/50 cursor-pointer min-h-[48px]"
              >
                LOGIN
              </Button>

              <Button
                variant="secondary"
                size="lg"
                data-testid="first-screen-register-btn"
                onClick={() => (onGoToRegisterSchool ? onGoToRegisterSchool() : onGoToAuth('REGISTER'))}
                iconLeading={<UserPlus className="w-5 h-5" />}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold tracking-wide uppercase border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-sm cursor-pointer min-h-[48px]"
              >
                REGISTER / JOIN SCHOOL
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="mt-3 sm:mt-3.5 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
              <button
                type="button"
                data-testid="first-screen-explore-btn"
                onClick={() => setIsExploreModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Explore SchoolSoul</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>

              <button
                type="button"
                data-testid="first-screen-demo-btn"
                onClick={() => setIsDemoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Request a Demo</span>
              </button>

              <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>

              <button
                type="button"
                data-testid="first-screen-status-btn"
                onClick={() => onGoToAuth('STATUS')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Check Application Status</span>
              </button>

              <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>

              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Watch Overview</span>
              </button>
            </div>
          </div>

          {/* Core Trust & Resilience Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 100% Offline-First LAN Mode
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> MTN & Airtel MoMo + Pesapal
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> CBC, UNEB & Multi-Curriculum
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Tamper-Evident Safeguarding Logs
            </span>
          </div>
        </div>
      </section>

      {/* 2.5 Product Interface Showcase Section */}
      <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>INTERACTIVE PRODUCT EXPERIENCE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Built for Real East African School Operations
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Click through key operational stations to see how SchoolSoul handles real-world leadership, CBC marks, fees, and offline attendance.
          </p>
        </div>
        <ProductShowcase />
      </section>

      {/* 3. Problems Solved & Value Architecture */}
      <section id="explore-features" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Designed for Real School Realities
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            SchoolSoul eliminates paperwork bottlenecks, fee leakages, and connectivity failures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Offline-First Architecture
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Schools never stop when the internet drops. Staff enter marks, record fees, and take attendance locally. All updates sync safely when internet resumes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Automated Fee Accounting
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Integrated with Pesapal, MTN Mobile Money, Airtel Money, and bank deposits. Instant parent receipts, automated SMS reminders, and zero cash leakage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Multi-Curriculum Mastery
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Native support for Competency-Based Curricula (CBC), UNEB grading, KNEC, and international scales. Automated report cards generated in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Child Safeguarding & Auditing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Confidential incident logging, behavioral records, and tamper-evident audit trails protect both student welfare and school leadership accountability.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Tailored for Every School Role */}
      <section id="audience" className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Tailored for Every School Role
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Granular role-based permissions give everyone exactly what they need without confusion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" /> Headteachers & Principals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Executive dashboard, staff attendance, compliance, financial health cockpits, and ministry reporting.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" /> Bursars & Finance Officers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Fee structure creation, student fee ledgers, automated MoMo reconciliation, expenditure vouchers, and budgets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Teachers & Subject Heads
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Digital gradebooks, timetable schedules, homework assignments, lesson planning, and attendance registers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600" /> Parents & Guardians
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Transparent student report cards, daily attendance alerts, seamless fee payments via mobile phone, and teacher chat.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" /> Students
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Opportunity & Skills Passport, homework submissions, virtual classroom sessions, and club activities.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-600" /> School Boards & Trustees
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Strategic financial statements, long-term asset management, academic trend forecasts, and audit integrity reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 ROI & Administrative Efficiency Calculator */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800">
        <ROIEstimator initialCurrency={calcCurrency} />
      </section>

      {/* 5. Student-Based Pricing Architecture & Live Calculator */}
      <section id="pricing" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>VINEXSAH COMMERCIAL PRICING</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Predictable Student-Based Economics</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Transparent, Student-Based Pricing for Every School
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            No hidden setup fees. No arbitrary user limits. Scale smoothly from 100 to over 10,000 students.
            All plans include a full 30-day trial with complete module access.
          </p>
        </div>

        {/* Interactive Controls Bar: Currency, Student Band, and Billing Cycle */}
        <div className="max-w-4xl mx-auto mb-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Billing Currency
              </label>
              <select
                value={calcCurrency}
                onChange={(e) => setCalcCurrency(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {Object.values(SUPPORTED_CURRENCY_RATES).map((curr) => (
                  <option key={curr.currency} value={curr.currency}>
                    {curr.currency} ({curr.symbol}) — {curr.name} {curr.taxRatePercent > 0 ? `· ${curr.taxLabel}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cycle Toggle */}
            <div className="flex flex-col items-start md:items-end">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Billing Frequency
              </label>
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCalcCycle('Annual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calcCycle === 'Annual'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Annual (Save 20%)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcCycle('Monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calcCycle === 'Monthly'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>

          {/* Student Capacity Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Your School's Student Population:
              </label>
              <span className="text-base font-black text-blue-600 dark:text-blue-400">
                {calcStudents.toLocaleString()} Students
              </span>
            </div>

            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={calcStudents}
              onChange={(e) => setCalcStudents(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>100 Students (Starter)</span>
              <span>1,000 Students</span>
              <span>2,000 Students</span>
              <span>3,000+ Students (Enterprise)</span>
            </div>
          </div>

          {/* Optional Add-ons Selection */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Optional Add-on Capabilities:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {COMMERCIAL_ADDONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAddon(addon.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="font-semibold block">{addon.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{addon.description}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3 Tier Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {STUDENT_PRICING_PLANS.map((plan) => {
            const isStandard = plan.id === 'standard';
            const quote = calculateStudentSubscriptionQuote({
              planId: plan.id,
              studentCount: calcStudents,
              billingCycle: calcCycle,
              currency: calcCurrency,
              selectedAddonIds: selectedAddons,
            });

            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all relative ${
                  isStandard
                    ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-2xl ring-4 ring-blue-600/10'
                    : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg'
                }`}
              >
                {isStandard && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                    Recommended for Most Schools
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {plan.description}
                    </p>
                  </div>

                  {/* Calculated Price Display */}
                  <div className="pt-2 pb-1 border-y border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {quote.currencySymbol}
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {quote.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        / {quote.billingCycle.toLowerCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Approximately {quote.currencySymbol} {quote.ratePerStudent.toLocaleString()} per student / {calcCycle === 'Annual' ? 'year' : 'mo'}
                      {quote.taxRatePercent > 0 ? ` (Includes ${quote.taxRatePercent}% tax)` : ''}
                    </p>

                    {calcCycle === 'Annual' && quote.annualSavingsAmount > 0 && (
                      <div className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {quote.savingsFormatted}
                      </div>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Included Capabilities:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <Button
                    variant={isStandard ? 'primary' : 'outline'}
                    size="md"
                    className="w-full justify-center min-h-[44px]"
                    onClick={() => {
                      if (plan.isCustom) {
                        setIsDemoModalOpen(true);
                      } else if (onGoToRegisterSchool) {
                        onGoToRegisterSchool();
                      } else {
                        onGoToAuth('REGISTER');
                      }
                    }}
                    iconTrailing={<ArrowRight className="w-4 h-4" />}
                  >
                    {plan.isCustom ? 'Request Enterprise Quote' : 'Start 30-Day Free Trial'}
                  </Button>
                  <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
                    Full access · No credit card required to start
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Plan Feature Comparison */}
        <div className="mt-16">
          <PlanComparisonTable
            onSelectPlan={(planId) => {
              if (planId === 'enterprise') {
                setIsDemoModalOpen(true);
              } else if (onGoToRegisterSchool) {
                onGoToRegisterSchool();
              } else {
                onGoToAuth('REGISTER');
              }
            }}
          />
        </div>
      </section>

      {/* 6. Why Schools Trust SchoolSoul (Strictly Honest Trust Architecture) */}
      <section id="trust" className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Why School Leadership Trusts SchoolSoul
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Engineered with strict tenant isolation, cryptographic integrity, and zero third-party vendor lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">01. Data Sovereignty</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Your Data Belongs to You</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Export complete school records in standardized CSV and JSON formats anytime. One-click backup and offline restore.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">02. Tamper-Evident Security</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Bank-Grade Audit Trails</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every financial modification, grade change, and attendance entry is signed with authoritative audit logs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">03. Local LAN Ready</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Zero Internet Dependency</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Deploy on a local school server or laptop and connect teacher tablets over local Wi-Fi without active internet bundles.
            </p>
          </div>
        </div>

        {/* Regional Curriculum Alignment Badges */}
        <div className="p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Verified Regional Curriculum Compliance
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold block text-slate-900 dark:text-slate-100">Kenya CBC (KICD)</span>
              <span className="text-[11px] text-slate-500">Formative & Summative Rubrics</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold block text-slate-900 dark:text-slate-100">Uganda UNEB / NCDC</span>
              <span className="text-[11px] text-slate-500">New Lower Secondary & Primary</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold block text-slate-900 dark:text-slate-100">Tanzania NECTA</span>
              <span className="text-[11px] text-slate-500">Standard Division Scales</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold block text-slate-900 dark:text-slate-100">Cambridge & IB</span>
              <span className="text-[11px] text-slate-500">International Letter Grades</span>
            </div>
          </div>
        </div>

        {/* Ready to start banner */}
        <div className="p-8 rounded-3xl bg-linear-to-r from-blue-700 to-indigo-900 text-white shadow-xl space-y-4">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Ready to Transform Your School Operations?
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            Get your school started in minutes or schedule a guided walk-through with our education specialists.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => onGoToAuth('LOGIN')}
              className="min-h-[44px]"
            >
              Sign In to Your Account
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsDemoModalOpen(true)}
              className="text-white border-white/40 hover:bg-white/10 min-h-[44px]"
            >
              Book School Demo
            </Button>
          </div>
        </div>
      </section>

      {/* 7. About VINEXSAH TECHNOLOGIES */}
      <section id="about-vinexsah" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto shadow-md">
            <SchoolSoulMarkSVG size={30} idPrefix="ss-about" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Engineered by VINEXSAH TECHNOLOGIES
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            VINEXSAH TECHNOLOGIES is an African software engineering firm dedicated to building sovereign, resilient digital infrastructure for institutions across the continent. We reject fragile cloud-only architectures and vendor lock-in. Our mission is to ensure every school operates continuously, protects learner data sovereignty, and prospers financially.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>📍 Kampala, Uganda / East Africa</span>
            <span aria-hidden="true">·</span>
            <span>🔒 Sovereign Student Data</span>
            <span aria-hidden="true">·</span>
            <span>⚡ 100% Offline-First LAN</span>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SchoolSoulMarkSVG size={20} idPrefix="ss-footer" />
            <span className="font-bold text-slate-800 dark:text-slate-200">SchoolSoul OS</span>
            <span>— Developed by VINEXSAH TECHNOLOGIES. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button
              onClick={() => onGoToAuth('LOGIN')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => (onGoToRegisterSchool ? onGoToRegisterSchool() : onGoToAuth('REGISTER'))}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Register School
            </button>
            <button
              onClick={() => onGoToAuth('REGISTER')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Join Existing School
            </button>
            <button
              onClick={() => onGoToAuth('STATUS')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Check Status
            </button>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              System Status
            </button>
            <button
              onClick={() => setIsLanModalOpen(true)}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Local LAN Guide
            </button>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Request Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Request a Demo Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => {
          setIsDemoModalOpen(false);
          setDemoSubmitted(false);
        }}
        title="Request a SchoolSoul OS Demo"
        maxWidth="lg"
        id="request-demo-modal"
      >
        {demoSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Demo Request Received!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Thank you for your interest in SchoolSoul OS. Our school implementation team will reach out via WhatsApp and email within 24 hours.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setIsDemoModalOpen(false);
                setDemoSubmitted(false);
              }}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fill in your school details to schedule a tailored presentation or test deployment for your institution.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="School Name"
                placeholder="e.g. Vinexsah Academy"
                required
                value={demoForm.schoolName}
                onChange={(e) => setDemoForm({ ...demoForm, schoolName: e.target.value })}
              />
              <Input
                label="Contact Person Name"
                placeholder="e.g. Dr. Sarah Namubiru"
                required
                value={demoForm.contactPerson}
                onChange={(e) => setDemoForm({ ...demoForm, contactPerson: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Official Email"
                type="email"
                placeholder="school@example.com"
                required
                value={demoForm.email}
                onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
              />
              <Input
                label="Phone / WhatsApp Number"
                placeholder="+256 700 000 000"
                required
                value={demoForm.phone}
                onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Country"
                value={demoForm.country}
                onChange={(e) => setDemoForm({ ...demoForm, country: e.target.value })}
                options={[
                  { value: 'Uganda', label: 'Uganda' },
                  { value: 'Kenya', label: 'Kenya' },
                  { value: 'Tanzania', label: 'Tanzania' },
                  { value: 'Rwanda', label: 'Rwanda' },
                  { value: 'Nigeria', label: 'Nigeria' },
                  { value: 'Ghana', label: 'Ghana' },
                  { value: 'South Africa', label: 'South Africa' },
                  { value: 'Other', label: 'Other Country' },
                ]}
              />

              <Select
                label="Estimated Student Population"
                value={demoForm.estimatedStudents}
                onChange={(e) => setDemoForm({ ...demoForm, estimatedStudents: e.target.value })}
                options={[
                  { value: '100-300', label: '100 - 300 Students' },
                  { value: '300-800', label: '300 - 800 Students' },
                  { value: '800-2000', label: '800 - 2,000 Students' },
                  { value: '2000+', label: '2,000+ Students' },
                ]}
              />
            </div>

            <Textarea
              label="Special Inquiries or Current Bottlenecks"
              placeholder="e.g., We need offline LAN grading for 60 teachers and MTN/Airtel fee collection..."
              value={demoForm.notes}
              onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
              rows={2}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsDemoModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={demoSubmitting}
                loadingText="Submitting..."
              >
                Submit Demo Request
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Guided Product Architecture Explorer Modal */}
      <ExploreSandboxModal
        isOpen={isExploreModalOpen}
        onClose={() => setIsExploreModalOpen(false)}
        onGoToAuth={onGoToAuth}
        onGoToRegisterSchool={onGoToRegisterSchool}
      />

      {/* Institutional Demo Video Walkthrough Modal */}
      <VideoWalkthroughModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onGoToRegisterSchool={onGoToRegisterSchool}
      />

      {/* System Infrastructure Status Modal */}
      <SystemStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

      {/* On-Premise Local Server & LAN Setup Guide Modal */}
      <LanDeploymentModal
        isOpen={isLanModalOpen}
        onClose={() => setIsLanModalOpen(false)}
      />
    </div>
  );
};
