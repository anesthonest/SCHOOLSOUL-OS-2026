import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  KeyRound,
  CheckCircle2,
  GraduationCap,
  Building2,
  UserPlus,
  Search,
  Clock,
  AlertCircle,
  BookOpen,
  Briefcase,
  UserCheck,
  ShieldCheck,
  School,
  Smartphone,
  Mail,
  FileText,
  Key,
  RefreshCw,
  Send,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Info,
  Check,
  Globe2,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  submitAccountRequest,
  checkAccountStatus,
  requestAccountRecovery,
  verifyRecoveryOtp,
  completePasswordReset,
} from '../services/api';
import { Modal } from '../components/common/Modal';
import { SchoolSoulMarkSVG } from '../components/common/SchoolSoulLogo';
import { UniversalQRScannerModal } from '../components/common/UniversalQRScannerModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Select } from '../components/ui/Select';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { PublicLandingPage } from './PublicLandingPage';
import { SchoolSetupWizard } from './SchoolSetupWizard';

export const Login: React.FC = () => {
  const { login, schoolProfile } = useAuth();
  const { isOnline } = useSync();
  const { theme, toggleTheme } = useTheme();
  const { showSuccess, showError } = useToast();

  // Mode: Public Landing vs Auth Gateway vs School Registration
  const [viewMode, setViewMode] = useState<'AUTH' | 'LANDING' | 'REGISTER_SCHOOL'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('register') || params.get('setup') || params.get('action') === 'register-school' || params.get('tab') === 'register-school') {
        return 'REGISTER_SCHOOL';
      }
      const hash = window.location.hash;
      if (hash === '#register' || hash === '#register-school' || hash === '#school-registration' || hash === '#setup') {
        return 'REGISTER_SCHOOL';
      }
      if (params.get('auth') || params.get('login') || params.get('action') || params.get('tab') || params.get('view') === 'auth') {
        return 'AUTH';
      }
      if (hash === '#login' || hash === '#signin' || hash === '#auth') {
        return 'AUTH';
      }
    }
    return 'LANDING';
  });
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'STATUS'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || params.get('action');
      if (tab?.toUpperCase() === 'REGISTER') return 'REGISTER';
      if (tab?.toUpperCase() === 'STATUS') return 'STATUS';
    }
    return 'LOGIN';
  });

  // Sign In Form State
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [pendingNotice, setPendingNotice] = useState<{ message: string; requestedRole?: string; schoolName?: string; username?: string } | null>(null);

  // Multi-Step Join School Registration State
  const [regStep, setRegStep] = useState<number>(1);
  const [regForm, setRegForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '+256 ',
    password: '',
    confirmPassword: '',
    requestedRole: 'Teacher',
    nationalIdOrNin: '',
    studentIdOrLin: '',
    childLinOrNin: '',
    tinNumber: '',
    nssfNumber: '',
    department: '',
  });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regRequestId, setRegRequestId] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Status Check State
  const [statusQuery, setStatusQuery] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Password Recovery State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryTab, setRecoveryTab] = useState<'OTP_RESET' | 'LOST_CONTACTS'>('OTP_RESET');
  const [recoveryStep, setRecoveryStep] = useState<'REQUEST' | 'VERIFY_OTP' | 'SET_PASSWORD' | 'SUCCESS'>('REQUEST');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryRequestId, setRecoveryRequestId] = useState('');
  const [recoveryMaskedContact, setRecoveryMaskedContact] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Lost Contacts & Headteacher Escalation State
  const [escalationForm, setEscalationForm] = useState({
    fullName: '',
    identifier: '',
    nationalIdOrNin: '',
    studentIdOrLin: '',
    newEmail: '',
    newPhone: '+256 ',
    recoveryNotes: '',
  });
  const [escalationSuccess, setEscalationSuccess] = useState('');
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [escalationError, setEscalationError] = useState('');

  // Informational Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError('Please provide your username or institutional email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(usernameOrEmail.trim(), password, rememberMe);
    setLoading(false);

    if (!res.success) {
      if ((res as any).status === 'PENDING_APPROVAL' || res.error?.toLowerCase().includes('pending approval')) {
        setPendingNotice({
          message: res.error,
          requestedRole: (res as any).requestedRole,
          schoolName: schoolProfile?.schoolName,
          username: usernameOrEmail.trim(),
        });
      } else {
        setError(res.error || 'Invalid credentials. Please verify your login details.');
      }
    } else {
      showSuccess('Welcome back!', 'Session authenticated successfully.');
    }
  };

  // Step Validation for Registration Wizard
  const validateStep = (stepNumber: number): boolean => {
    setRegError('');
    if (stepNumber === 1) {
      if (!regForm.fullName.trim()) {
        setRegError('Full Name is required.');
        return false;
      }
      if (!regForm.username.trim() || regForm.username.length < 3) {
        setRegError('Username must be at least 3 characters.');
        return false;
      }
      if (regForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) {
        setRegError('Please provide a valid email format or leave blank.');
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      if (!regForm.requestedRole) {
        setRegError('Please select your role.');
        return false;
      }
      if (regForm.requestedRole === 'Student' && !regForm.studentIdOrLin.trim()) {
        setRegError('Student ID or Learner Identification Number (LIN) is required for student accounts.');
        return false;
      }
      if (regForm.requestedRole === 'Parent' && !regForm.childLinOrNin.trim()) {
        setRegError('Child\'s LIN or Student ID is required to link guardian records.');
        return false;
      }
      return true;
    }

    if (stepNumber === 3) {
      // Optional details - always valid
      return true;
    }

    if (stepNumber === 4) {
      if (!regForm.password || regForm.password.length < 8) {
        setRegError('Password must be at least 8 characters long.');
        return false;
      }
      if (regForm.password !== regForm.confirmPassword) {
        setRegError('Passwords do not match.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(regStep)) {
      setRegStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setRegError('');
    setRegStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!validateStep(1) || !validateStep(2) || !validateStep(4)) {
      return;
    }

    setRegLoading(true);
    try {
      const res = await submitAccountRequest({
        fullName: regForm.fullName.trim(),
        username: regForm.username.trim(),
        email: regForm.email.trim(),
        phone: regForm.phone.trim(),
        password: regForm.password,
        requestedRole: regForm.requestedRole,
        schoolId: schoolProfile?.id,
        nationalIdOrNin: regForm.nationalIdOrNin.trim(),
        studentIdOrLin: regForm.studentIdOrLin.trim(),
        childLinOrNin: regForm.childLinOrNin.trim(),
        tinNumber: regForm.tinNumber.trim(),
        nssfNumber: regForm.nssfNumber.trim(),
        department: regForm.department.trim(),
      });

      setRegRequestId(res.requestId || 'REQ-' + Date.now().toString().slice(-6));
      setRegSuccess(
        res.message ||
          `Account request submitted successfully! Your application for '${regForm.requestedRole}' is now pending review by the School Administration.`
      );
      showSuccess('Application Submitted', 'Your registration is in the review queue.');
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Please check your network or try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const resetRegisterWizard = () => {
    setRegStep(1);
    setRegSuccess(null);
    setRegRequestId(null);
    setRegError('');
    setRegForm({
      fullName: '',
      username: '',
      email: '',
      phone: '+256 ',
      password: '',
      confirmPassword: '',
      requestedRole: 'Teacher',
      nationalIdOrNin: '',
      studentIdOrLin: '',
      childLinOrNin: '',
      tinNumber: '',
      nssfNumber: '',
      department: '',
    });
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusQuery.trim()) {
      setStatusError('Enter your registered username, email, phone number, or Reference ID.');
      return;
    }
    setStatusLoading(true);
    setStatusError('');
    setStatusResult(null);

    const result = await checkAccountStatus(statusQuery.trim());
    setStatusLoading(false);
    if (result.error) {
      setStatusError(result.error);
    } else {
      setStatusResult(result);
    }
  };

  // Recovery Handlers
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      setRecoveryError('Please enter your registered username, email, phone, NIN, or LIN.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError('');

    try {
      const res = await requestAccountRecovery({
        identifier: recoveryIdentifier.trim(),
        recoveryType: 'FORGOT_PASSWORD',
        schoolId: schoolProfile?.id,
      });

      setRecoveryRequestId(res.requestId);
      setRecoveryMaskedContact(res.maskedContact || 'Registered Contact');
      if (res.simulatedOtp) {
        setSimulatedOtp(res.simulatedOtp);
      }
      setRecoveryStep('VERIFY_OTP');
    } catch (err: any) {
      setRecoveryError(err.message || 'Account not found. If your contact changed, switch to the Lost Contacts tab.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim() || enteredOtp.trim().length < 6) {
      setRecoveryError('Please enter the 6-digit verification code.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError('');

    try {
      const res = await verifyRecoveryOtp(recoveryRequestId, enteredOtp.trim());
      setResetToken(res.resetToken);
      setRecoveryStep('SET_PASSWORD');
    } catch (err: any) {
      setRecoveryError(err.message || 'Invalid verification code.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setRecoveryError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setRecoveryError('Passwords do not match.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError('');

    try {
      const res = await completePasswordReset(recoveryRequestId, resetToken, newPassword);
      setResetSuccessMsg(res.message || 'Password successfully updated.');
      if (res.username) {
        setUsernameOrEmail(res.username);
      }
      setRecoveryStep('SUCCESS');
      showSuccess('Password Reset Complete', 'You may now log in with your new password.');
    } catch (err: any) {
      setRecoveryError(err.message || 'Password reset failed.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleEscalationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationForm.fullName || (!escalationForm.identifier && !escalationForm.nationalIdOrNin)) {
      setEscalationError('Full Name and Username/NIN are required for identity escalation.');
      return;
    }

    setEscalationLoading(true);
    setEscalationError('');
    setEscalationSuccess('');

    try {
      const res = await requestAccountRecovery({
        identifier: escalationForm.identifier || escalationForm.fullName,
        fullName: escalationForm.fullName,
        recoveryType: 'LOST_BOTH_CONTACTS',
        nationalIdOrNin: escalationForm.nationalIdOrNin,
        studentIdOrLin: escalationForm.studentIdOrLin,
        newEmail: escalationForm.newEmail,
        newPhone: escalationForm.newPhone,
        recoveryNotes: escalationForm.recoveryNotes,
        schoolId: schoolProfile?.id,
      });

      setEscalationSuccess(
        `Your recovery request (Ref: ${res.requestId}) has been dispatched to the Headteacher & ICT Admin. You can follow up with the administration with your National ID/LIN for identity verification.`
      );
      showSuccess('Escalation Sent', 'Request registered with school administration.');
    } catch (err: any) {
      setEscalationError(err.message || 'Failed to submit escalation.');
    } finally {
      setEscalationLoading(false);
    }
  };

  const resetRecoveryModal = () => {
    setShowForgotModal(false);
    setRecoveryStep('REQUEST');
    setRecoveryIdentifier('');
    setRecoveryError('');
    setRecoveryRequestId('');
    setEnteredOtp('');
    setSimulatedOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetSuccessMsg('');
    setEscalationSuccess('');
    setEscalationError('');
  };

  // If in public landing mode, render the public landing experience
  if (viewMode === 'LANDING') {
    return (
      <PublicLandingPage
        onGoToAuth={(initialTab) => {
          if (initialTab) setActiveTab(initialTab);
          setViewMode('AUTH');
        }}
        onGoToRegisterSchool={() => {
          setViewMode('REGISTER_SCHOOL');
        }}
        schoolName={schoolProfile?.schoolName}
        schoolLogo={schoolProfile?.schoolLogo}
      />
    );
  }

  // If in School Registration mode, render the authoritative School Registration Wizard (Step 1 — School Information & Country Identity)
  if (viewMode === 'REGISTER_SCHOOL') {
    return (
      <SchoolSetupWizard
        onBackToLanding={() => setViewMode('LANDING')}
        onGoToJoinExisting={() => {
          setActiveTab('REGISTER');
          setViewMode('AUTH');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Bar with Brand Link & Theme Toggle */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-2 px-2">
        <button
          onClick={() => setViewMode('LANDING')}
          data-testid="auth-back-to-landing-btn"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-200/50 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SchoolSoul Landing</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            aria-label="Need Help with SchoolSoul"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Help & Guidance</span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="w-full max-w-lg mx-auto my-auto py-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 transition-colors duration-200">
          {/* Institutional Branding Header */}
          <div className="text-center mb-6">
            {schoolProfile?.schoolLogo ? (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-xs mb-3 overflow-hidden">
                <img
                  src={schoolProfile.schoolLogo}
                  alt={schoolProfile.schoolName || 'School Logo'}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mb-3 shadow-xs">
                <SchoolSoulMarkSVG size={36} idPrefix="ss-login-main" />
              </div>
            )}

            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">
              {schoolProfile?.schoolName || 'SchoolSoul OS'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">
              "{schoolProfile?.schoolMotto || 'Knowledge · Character · Integrity'}"
            </p>

            <div className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
              <span>{schoolProfile?.academicTerm || 'Term I'}</span>
              <span aria-hidden="true" className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
              <span>Academic Year {schoolProfile?.academicYear || '2026'}</span>
            </div>
          </div>

          {/* Segmented Tab Switcher (Sign In / Join School / Check Status) */}
          <div className="mb-6">
            <SegmentedTabs
              fullWidth
              size="md"
              activeTab={activeTab}
              onChange={(tab) => {
                setActiveTab(tab as any);
                setError('');
                setRegError('');
                setStatusError('');
              }}
              tabs={[
                { id: 'LOGIN', label: 'Sign In', icon: <Lock className="w-3.5 h-3.5" /> },
                { id: 'REGISTER', label: 'Join Existing School', icon: <UserPlus className="w-3.5 h-3.5" /> },
                { id: 'STATUS', label: 'Check Status', icon: <Clock className="w-3.5 h-3.5" /> },
              ]}
            />
          </div>

          {/* Offline Indicator Alert */}
          {!isOnline && (
            <div className="mb-4 p-3 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>Offline Local Mode active. Local offline credentials will be validated.</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: SIGN IN                                                    */}
          {/* ================================================================= */}
          {activeTab === 'LOGIN' && (
            pendingNotice ? (
              <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center shadow-xs">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Status: Pending Approval</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
                    Access Pending Institutional Verification
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Your request has been submitted to <strong>{pendingNotice.schoolName || schoolProfile?.schoolName || 'the school'}</strong>. The Headteacher or School Administrator must review and approve your membership before you can access the school system.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-slate-800 text-left text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Account:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">@{pendingNotice.username}</span>
                  </div>
                  {pendingNotice.requestedRole && (
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Requested Role:</span>
                      <span className="font-bold text-purple-700 dark:text-purple-300">{pendingNotice.requestedRole}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Institution:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{pendingNotice.schoolName || schoolProfile?.schoolName}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2 text-left">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero-Leakage Guarantee:</strong> No student records, attendance rolls, marks, or financial accounts are displayed while pending administrative approval.
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setPendingNotice(null);
                    setPassword('');
                  }}
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3.5 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Sign In Failed</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <Input
                label="Username or Institutional Email"
                placeholder="e.g. jmukasa or teacher@school.edu"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                iconLeading={<UserIcon className="w-4 h-4" aria-hidden="true" />}
                autoComplete="username"
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your account password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-2 space-y-2.5">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  loadingText="Authenticating..."
                  iconTrailing={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to SchoolSoul
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQRScanner(true)}
                    className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Scan School Join QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('REGISTER_SCHOOL')}
                    className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Register New School</span>
                  </button>
                </div>
              </div>

              {/* Security Reassurance */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <p className="flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Protected by institutional role-based access control (RBAC).</span>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="hover:underline text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Privacy Information
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="hover:underline text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Need Help?
                  </button>
                </div>
              </div>
            </form>
            )
          )}

          {/* ================================================================= */}
          {/* TAB 2: MULTI-STEP JOIN SCHOOL WIZARD                              */}
          {/* ================================================================= */}
          {activeTab === 'REGISTER' && (
            <div>
              {regSuccess ? (
                /* Submission Confirmation View */
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Application Received!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {regSuccess}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Application Reference:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{regRequestId}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Reviewer:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Headteacher & School Registrar</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Status:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Pending Review</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        setStatusQuery(regForm.username || regRequestId || '');
                        setActiveTab('STATUS');
                      }}
                    >
                      Track Application Status
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      onClick={resetRegisterWizard}
                    >
                      Submit Another
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Callout to distinguish creating a new school from joining an existing school */}
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <span className="font-bold">Registering a new school or campus?</span>
                      <p className="text-[11px] text-blue-700 dark:text-blue-400">Establish a complete school institution with national curricula & finance.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewMode('REGISTER_SCHOOL')}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Create School →
                    </button>
                  </div>

                  {/* Dedicated School Join QR Fast-Track Callout */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border-2 border-dashed border-purple-300 dark:border-purple-800 text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-sm">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Have a School Join QR Code?
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Scan your school's digital door to identify your school and select your member type.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>SCAN SCHOOL QR TO JOIN</span>
                    </button>
                  </div>

                  {/* Multi-Step Registration Form for Joining Existing School */}
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  {/* Step Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>Step {regStep} of 5</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {regStep === 1 && 'Personal Information'}
                        {regStep === 2 && 'School & Role'}
                        {regStep === 3 && 'Professional Details'}
                        {regStep === 4 && 'Account Security'}
                        {regStep === 5 && 'Review & Submit'}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 h-1.5">
                      {[1, 2, 3, 4, 5].map((stepNum) => (
                        <div
                          key={stepNum}
                          className={`h-full rounded-full transition-all duration-200 ${
                            stepNum <= regStep
                              ? 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {regError && (
                    <div
                      role="alert"
                      className="p-3 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* STEP 1: Personal Information */}
                  {regStep === 1 && (
                    <div className="space-y-3.5">
                      <Input
                        label="Full Legal Name"
                        placeholder="e.g. Sarah Akwero"
                        required
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        iconLeading={<UserIcon className="w-4 h-4" aria-hidden="true" />}
                      />

                      <Input
                        label="Desired Username"
                        placeholder="e.g. sakwero"
                        required
                        hint="Must be unique, 3-20 characters without spaces."
                        value={regForm.username}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                          })
                        }
                        iconLeading={<UserCheck className="w-4 h-4" aria-hidden="true" />}
                      />

                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="e.g. sakwero@school.edu"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        iconLeading={<Mail className="w-4 h-4" aria-hidden="true" />}
                      />

                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+256 700 000 000"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        iconLeading={<Smartphone className="w-4 h-4" aria-hidden="true" />}
                      />
                    </div>
                  )}

                  {/* STEP 2: School & Role Selection */}
                  {regStep === 2 && (
                    <div className="space-y-3.5">
                      <Select
                        label="Requested Role at School"
                        required
                        value={regForm.requestedRole}
                        onChange={(e) => setRegForm({ ...regForm, requestedRole: e.target.value })}
                        options={[
                          { value: 'Teacher', label: 'Teacher / Subject Instructor' },
                          { value: 'Class Teacher', label: 'Class Teacher / Stream In-Charge' },
                          { value: 'Parent', label: 'Parent / Legal Guardian' },
                          { value: 'Student', label: 'Student / Learner' },
                          { value: 'Bursar', label: 'Bursar / Accounts Officer' },
                          { value: 'Librarian', label: 'School Librarian' },
                          { value: 'School Nurse', label: 'School Nurse / Health Officer' },
                          { value: 'Welfare Officer', label: 'Welfare / Safeguarding Officer' },
                          { value: 'Director of Studies', label: 'Director of Studies (DOS)' },
                          { value: 'Support Staff', label: 'Support Staff / Driver / Warden' },
                        ]}
                      />

                      {regForm.requestedRole === 'Student' && (
                        <Input
                          label="Learner Identification Number (LIN) or Student ID"
                          placeholder="e.g. LIN-2026-8812"
                          required
                          hint="Issued by the Ministry of Education or school registry."
                          value={regForm.studentIdOrLin}
                          onChange={(e) => setRegForm({ ...regForm, studentIdOrLin: e.target.value })}
                          iconLeading={<GraduationCap className="w-4 h-4" aria-hidden="true" />}
                        />
                      )}

                      {regForm.requestedRole === 'Parent' && (
                        <Input
                          label="Child's LIN or Student Admission Number"
                          placeholder="e.g. LIN-2026-1042"
                          required
                          hint="Used to securely link your parent portal to your child's records."
                          value={regForm.childLinOrNin}
                          onChange={(e) => setRegForm({ ...regForm, childLinOrNin: e.target.value })}
                          iconLeading={<GraduationCap className="w-4 h-4" aria-hidden="true" />}
                        />
                      )}

                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                        <span className="font-semibold">Institutional Validation:</span> Roles carry permissions that determine access to grades, student records, and finances. The Headteacher validates role requests against the school roll.
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Professional & Optional Details */}
                  {regStep === 3 && (
                    <div className="space-y-3.5">
                      <Input
                        label="Department / Subject Group"
                        placeholder="e.g. Sciences, Humanities, Languages, Sports"
                        value={regForm.department}
                        onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                        iconLeading={<Briefcase className="w-4 h-4" aria-hidden="true" />}
                      />

                      <Input
                        label="National ID Number (NIN)"
                        placeholder="e.g. CM90012345XYZ"
                        hint="For staff and parent identity verification."
                        value={regForm.nationalIdOrNin}
                        onChange={(e) => setRegForm({ ...regForm, nationalIdOrNin: e.target.value })}
                        iconLeading={<FileText className="w-4 h-4" aria-hidden="true" />}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Tax Identification Number (TIN)"
                          placeholder="e.g. 1000234567"
                          value={regForm.tinNumber}
                          onChange={(e) => setRegForm({ ...regForm, tinNumber: e.target.value })}
                        />

                        <Input
                          label="NSSF / Social Security Number"
                          placeholder="e.g. 2001928374"
                          value={regForm.nssfNumber}
                          onChange={(e) => setRegForm({ ...regForm, nssfNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Account Security */}
                  {regStep === 4 && (
                    <div className="space-y-3.5">
                      <PasswordInput
                        label="Create Account Password"
                        placeholder="Enter at least 8 characters"
                        required
                        showStrengthMeter
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      />

                      <PasswordInput
                        label="Confirm Account Password"
                        placeholder="Re-enter your password to confirm"
                        required
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      />

                      {regForm.password && regForm.confirmPassword && (
                        <p
                          className={`text-xs font-semibold flex items-center gap-1.5 ${
                            regForm.password === regForm.confirmPassword
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {regForm.password === regForm.confirmPassword ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Passwords match
                            </>
                          ) : (
                            'Passwords do not match yet'
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* STEP 5: Review & Submit */}
                  {regStep === 5 && (
                    <div className="space-y-3.5">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                          Application Summary
                        </h4>

                        <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Full Name:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{regForm.fullName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Username:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{regForm.username}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Requested Role:</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{regForm.requestedRole}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Phone:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{regForm.phone}</span>
                          </div>
                          {regForm.email && (
                            <div className="col-span-2">
                              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Email:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{regForm.email}</span>
                            </div>
                          )}
                          {regForm.studentIdOrLin && (
                            <div className="col-span-2">
                              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Student LIN/ID:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{regForm.studentIdOrLin}</span>
                            </div>
                          )}
                          {regForm.childLinOrNin && (
                            <div className="col-span-2">
                              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Child LIN/ID:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{regForm.childLinOrNin}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                        By submitting, you confirm that your identity details are accurate. SchoolSoul enforces audit logging on all registration submissions.
                      </div>
                    </div>
                  )}

                  {/* Wizard Navigation Controls */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {regStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={handlePrevStep}
                        iconLeading={<ArrowLeft className="w-4 h-4" />}
                      >
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {regStep < 5 ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleNextStep}
                        iconTrailing={<ArrowRight className="w-4 h-4" />}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={regLoading}
                        loadingText="Submitting..."
                        iconLeading={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Submit Application
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: CHECK APPLICATION STATUS                                  */}
          {/* ================================================================= */}
          {activeTab === 'STATUS' && (
            <div className="space-y-4">
              <form onSubmit={handleCheckStatus} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter your registered username, official email, phone number, or Application Reference ID to inspect review status.
                </p>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g. sakwero or REQ-291038"
                      value={statusQuery}
                      onChange={(e) => setStatusQuery(e.target.value)}
                      iconLeading={<Search className="w-4 h-4" aria-hidden="true" />}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={statusLoading}
                    loadingText="Checking..."
                  >
                    Check
                  </Button>
                </div>
              </form>

              {statusError && (
                <div
                  role="alert"
                  className="p-3 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{statusError}</span>
                </div>
              )}

              {statusResult && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {statusResult.fullName || statusResult.username || 'Applicant'}
                      </p>
                      <p className="text-slate-500 text-[11px]">Role: {statusResult.requestedRole || statusResult.role}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          statusResult.status === 'APPROVED' || statusResult.approvalStatus === 'APPROVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : statusResult.status === 'REJECTED' || statusResult.approvalStatus === 'REJECTED'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {statusResult.status || statusResult.approvalStatus || 'PENDING_APPROVAL'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {statusResult.reviewerComment && (
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] mb-0.5">
                          Reviewer Notes:
                        </span>
                        <p className="italic text-slate-600 dark:text-slate-400">{statusResult.reviewerComment}</p>
                      </div>
                    )}

                    <p>
                      <strong className="text-slate-800 dark:text-slate-200">Next Action: </strong>
                      {statusResult.status === 'APPROVED' || statusResult.approvalStatus === 'APPROVED' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Your account has been commissioned! You may now sign in using your username and password.
                        </span>
                      ) : statusResult.status === 'REJECTED' || statusResult.approvalStatus === 'REJECTED' ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          Application was not approved. Please consult the school office for requirements or re-apply.
                        </span>
                      ) : (
                        <span>
                          Your application is currently under review by the Headteacher or ICT Administrator. Please check back periodically.
                        </span>
                      )}
                    </p>
                  </div>

                  {(statusResult.status === 'APPROVED' || statusResult.approvalStatus === 'APPROVED') && (
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setUsernameOrEmail(statusResult.username || '');
                          setActiveTab('LOGIN');
                        }}
                      >
                        Proceed to Sign In
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Global Footer Attribution */}
      <footer className="w-full max-w-4xl mx-auto py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          SchoolSoul OS — Developed by VINEXSAH TECHNOLOGIES. All rights reserved.
        </p>
      </footer>

      {/* ===================================================================== */}
      {/* PASSWORD RECOVERY & HEADTEACHER ESCALATION MODAL                      */}
      {/* ===================================================================== */}
      <Modal
        isOpen={showForgotModal}
        onClose={resetRecoveryModal}
        title="Account Recovery & Identity Verification"
        maxWidth="lg"
        id="account-recovery-modal"
      >
        <div className="space-y-4">
          <SegmentedTabs
            fullWidth
            size="sm"
            activeTab={recoveryTab}
            onChange={(tab) => {
              setRecoveryTab(tab as any);
              setRecoveryError('');
            }}
            tabs={[
              { id: 'OTP_RESET', label: 'SMS / Email OTP Reset', icon: <KeyRound className="w-3.5 h-3.5" /> },
              { id: 'LOST_CONTACTS', label: 'Lost Contacts Escalation', icon: <FileText className="w-3.5 h-3.5" /> },
            ]}
          />

          {recoveryError && (
            <div
              role="alert"
              className="p-3 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{recoveryError}</span>
            </div>
          )}

          {/* TAB A: OTP RESET */}
          {recoveryTab === 'OTP_RESET' && (
            <div>
              {recoveryStep === 'REQUEST' && (
                <form onSubmit={handleRequestOtp} className="space-y-3.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Provide your registered username, official email, phone number, or Learner ID (LIN). A 6-digit verification code will be dispatched.
                  </p>

                  <Input
                    label="Account Identifier"
                    placeholder="e.g. jmukasa, teacher@school.edu, or LIN-2026-1042"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    iconLeading={<UserIcon className="w-4 h-4" aria-hidden="true" />}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="md" onClick={resetRecoveryModal}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={recoveryLoading}
                      loadingText="Sending Code..."
                    >
                      Send Verification Code
                    </Button>
                  </div>
                </form>
              )}

              {recoveryStep === 'VERIFY_OTP' && (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    We sent a 6-digit code to <strong className="text-slate-800 dark:text-slate-200">{recoveryMaskedContact}</strong>. Enter the code below to verify your identity.
                  </p>

                  {simulatedOtp && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                      <strong>Offline/Local Verification:</strong> Simulated SMS OTP is <code className="font-bold underline">{simulatedOtp}</code>.
                    </div>
                  )}

                  <Input
                    label="6-Digit Verification Code"
                    placeholder="123456"
                    required
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    iconLeading={<Key className="w-4 h-4" aria-hidden="true" />}
                  />

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('REQUEST')}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Change Identifier
                    </button>

                    <div className="flex gap-2">
                      <Button variant="outline" size="md" onClick={resetRecoveryModal}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={recoveryLoading}
                        loadingText="Verifying..."
                      >
                        Verify Code
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {recoveryStep === 'SET_PASSWORD' && (
                <form onSubmit={handleCompletePasswordReset} className="space-y-3.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Identity verified successfully! Enter your new password below.
                  </p>

                  <PasswordInput
                    label="New Password"
                    placeholder="Enter at least 8 characters"
                    required
                    showStrengthMeter
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="md" onClick={resetRecoveryModal}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={recoveryLoading}
                      loadingText="Updating Password..."
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              )}

              {recoveryStep === 'SUCCESS' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Password Reset Complete
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {resetSuccessMsg || 'Your password has been updated. You can now log into your SchoolSoul workspace.'}
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      resetRecoveryModal();
                      setActiveTab('LOGIN');
                    }}
                  >
                    Return to Sign In
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB B: LOST CONTACTS ESCALATION */}
          {recoveryTab === 'LOST_CONTACTS' && (
            <div>
              {escalationSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Escalation Logged
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {escalationSuccess}
                  </p>
                  <Button variant="primary" size="md" onClick={resetRecoveryModal}>
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleEscalationSubmit} className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                    <span className="font-semibold">Headteacher Identity Review:</span> If you have changed your phone number, lost email access, or are locked out completely, submit institutional credentials below. The Headteacher will verify your physical school identity and authorize credential updates.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Full Legal Name"
                      placeholder="e.g. John Mukasa"
                      required
                      value={escalationForm.fullName}
                      onChange={(e) => setEscalationForm({ ...escalationForm, fullName: e.target.value })}
                    />
                    <Input
                      label="Username (if remembered)"
                      placeholder="e.g. jmukasa"
                      value={escalationForm.identifier}
                      onChange={(e) => setEscalationForm({ ...escalationForm, identifier: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="National ID / NIN (Staff / Parents)"
                      placeholder="e.g. CM90012345XYZ"
                      value={escalationForm.nationalIdOrNin}
                      onChange={(e) => setEscalationForm({ ...escalationForm, nationalIdOrNin: e.target.value })}
                    />
                    <Input
                      label="Student LIN / Admission No"
                      placeholder="e.g. LIN-88421"
                      value={escalationForm.studentIdOrLin}
                      onChange={(e) => setEscalationForm({ ...escalationForm, studentIdOrLin: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="New Contact Email"
                      type="email"
                      placeholder="newemail@domain.com"
                      value={escalationForm.newEmail}
                      onChange={(e) => setEscalationForm({ ...escalationForm, newEmail: e.target.value })}
                    />
                    <Input
                      label="New Phone Number"
                      type="tel"
                      placeholder="+256 700 000 000"
                      value={escalationForm.newPhone}
                      onChange={(e) => setEscalationForm({ ...escalationForm, newPhone: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Reason for Contact Loss & Notes"
                    placeholder="e.g. Lost SIM card; need reset to submit Term marks."
                    required
                    value={escalationForm.recoveryNotes}
                    onChange={(e) => setEscalationForm({ ...escalationForm, recoveryNotes: e.target.value })}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="md" onClick={resetRecoveryModal}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={escalationLoading}
                      loadingText="Submitting..."
                      iconLeading={<FileText className="w-4 h-4" />}
                    >
                      Submit to Headteacher
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* INFORMATIONAL HELP MODAL                                              */}
      {/* ===================================================================== */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="SchoolSoul Sign In Guidance"
        maxWidth="md"
        id="login-help-modal"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Where do I get my login details?</h4>
            <p>
              Your initial username and temporary password are provided by your school's ICT Administrator or Headteacher upon enrollment or staffing appointment.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Can I join without an existing account?</h4>
            <p>
              Yes! Click the <strong>Join School</strong> tab to submit an application. Select your intended role (Teacher, Student, Parent, Bursar) and fill in your details. The school leadership will review and approve your access.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Does SchoolSoul work offline?</h4>
            <p>
              Yes. If your school uses a local server or LAN network, you can log in even when internet connectivity is interrupted. Offline actions sync safely once connection resumes.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowHelpModal(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* PRIVACY & DATA PROTECTION NOTICE MODAL                                */}
      {/* ===================================================================== */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy & Student Data Safeguards"
        maxWidth="md"
        id="login-privacy-modal"
      >
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
            <p className="font-semibold mb-1">Institutional Data Sovereignty</p>
            <p>
              All academic, financial, attendance, and biometric records are owned exclusively by your school institution. SchoolSoul does not sell, broker, or monetize learner or guardian information.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Role-Based Data Partitioning</h4>
            <p>
              Teachers only access grades and registers for their assigned classes. Financial ledgers are strictly restricted to authorized bursars and the headteacher. Child safeguarding incidents are protected by immutable audit logs.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Questions or Data Inquiries</h4>
            <p>
              For data modification, transcript requests, or deletion inquiries, contact your school administration or ICT officer directly.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowPrivacyModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Universal School Join QR Scanner Modal */}
      {showQRScanner && (
        <UniversalQRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          workflowContext="GENERAL"
        />
      )}
    </div>
  );
};
