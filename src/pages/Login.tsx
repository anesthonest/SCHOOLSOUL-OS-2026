import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  KeyRound,
  CheckCircle2,
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import {
  submitAccountRequest,
  checkAccountStatus,
  requestAccountRecovery,
  verifyRecoveryOtp,
  completePasswordReset,
} from '../services/api';
import { Modal } from '../components/common/Modal';
import { SchoolSoulMarkSVG } from '../components/common/SchoolSoulLogo';

export const Login: React.FC = () => {
  const { login, schoolProfile } = useAuth();
  const { isOnline } = useSync();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'STATUS'>('LOGIN');

  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Request Account state
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
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Status check state
  const [statusQuery, setStatusQuery] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Enhanced Account Recovery & Password Reset state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryTab, setRecoveryTab] = useState<'OTP_RESET' | 'LOST_CONTACTS'>('OTP_RESET');
  const [recoveryStep, setRecoveryStep] = useState<'REQUEST' | 'VERIFY_OTP' | 'SET_PASSWORD' | 'SUCCESS'>('REQUEST');

  // Step 1: Identifier & dispatch
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryRequestId, setRecoveryRequestId] = useState('');
  const [recoveryMaskedContact, setRecoveryMaskedContact] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // Step 2: OTP Entry
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Tab 2: Lost Contacts & Headteacher Escalation Form
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(usernameOrEmail, password, rememberMe);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regForm.fullName || !regForm.username || !regForm.password) {
      setRegError('Full Name, Username, and Password are required.');
      return;
    }

    if (regForm.password.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await submitAccountRequest({
        fullName: regForm.fullName,
        username: regForm.username,
        email: regForm.email,
        phone: regForm.phone,
        password: regForm.password,
        requestedRole: regForm.requestedRole,
        schoolId: schoolProfile?.id,
        nationalIdOrNin: regForm.nationalIdOrNin,
        studentIdOrLin: regForm.studentIdOrLin,
        childLinOrNin: regForm.childLinOrNin,
        tinNumber: regForm.tinNumber,
        nssfNumber: regForm.nssfNumber,
        department: regForm.department,
      });

      setRegSuccess(
        `Account request submitted successfully! Your application for '${regForm.requestedRole}' is now pending approval by the Headteacher.`
      );
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
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusQuery.trim()) {
      setStatusError('Enter your username or email.');
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

  // Recovery handlers
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-6">
          {schoolProfile?.schoolLogo ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 p-1 border border-slate-700 shadow-lg shadow-blue-600/30 mb-3 overflow-hidden">
              <img
                src={schoolProfile.schoolLogo}
                alt={schoolProfile.schoolName || 'School Logo'}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="inline-flex flex-col items-center justify-center mb-3">
              <div className="p-2 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-xl shadow-amber-500/10">
                <SchoolSoulMarkSVG size={64} idPrefix="ss-login" />
              </div>
            </div>
          )}
          <h1 className="text-xl font-black text-white tracking-tight uppercase">
            {schoolProfile?.schoolName || 'SchoolSoul OS'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 italic">
            "{schoolProfile?.schoolMotto || 'Knowledge • Character • Integrity'}"
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-medium text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{schoolProfile?.academicTerm || 'Term I'} • {schoolProfile?.academicYear || '2026'}</span>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Request Account vs Status */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800 text-xs font-semibold">
          <button
            id="tab-sign-in"
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            id="tab-request-account"
            type="button"
            onClick={() => {
              setActiveTab('REGISTER');
              setRegError('');
              setRegSuccess('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'REGISTER'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Join School
          </button>
          <button
            id="tab-check-status"
            type="button"
            onClick={() => {
              setActiveTab('STATUS');
              setStatusError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'STATUS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Check Status
          </button>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="mb-4 p-2.5 text-xs text-amber-300 bg-amber-950/50 border border-amber-800 rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Offline Mode Active – Local offline credentials will be verified.</span>
          </div>
        )}

        {/* ================= TAB 1: SIGN IN ================= */}
        {activeTab === 'LOGIN' && (
          <div>
            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 text-xs text-rose-300 bg-rose-950/60 border border-rose-800 rounded-xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>{error}</span>
                  {error.includes('pending approval') && (
                    <p className="text-[11px] text-amber-300/90 font-medium">
                      Tip: Your account was received. The Headteacher reviews and approves staff/parent/student accounts in User Management.
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-username-input"
                    type="text"
                    placeholder="headteacher, teacher, dos or email"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    id="login-forgot-pwd-btn"
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="login-remember-me-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to SchoolSoul'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 2: REQUEST SCHOOL ACCOUNT ================= */}
        {activeTab === 'REGISTER' && (
          <div>
            {regError && (
              <div className="mb-4 p-3 text-xs text-rose-300 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-200">Application Submitted</h3>
                <p className="text-xs text-emerald-300/90 leading-relaxed">{regSuccess}</p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('LOGIN')}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                  >
                    Go to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('STATUS')}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                  >
                    Check Application Status
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                <div className="p-2.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-[11px] text-blue-300 leading-relaxed">
                  <span className="font-semibold text-blue-200">Layer A Identity & Layer B Access:</span>{' '}
                  Register your school profile. Accounts require review and administrative approval by the <strong>Headteacher</strong> before private operational records can be accessed.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Bosco Mukasa"
                      value={regForm.fullName}
                      onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. jmukasa"
                      value={regForm.username}
                      onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="jmukasa@school.ac.ug"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+256 700 000 000"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Requested Role *
                  </label>
                  <select
                    value={regForm.requestedRole}
                    onChange={(e) => setRegForm({ ...regForm, requestedRole: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Teacher">Teacher (Academic & Class Instructor)</option>
                    <option value="Deputy Headteacher">Director of Studies (DOS) / Deputy Headteacher</option>
                    <option value="Bursar">Bursar / Accounts Officer</option>
                    <option value="Administrator">Administrator / Registrar</option>
                    <option value="Parent">Parent / Guardian</option>
                    <option value="Student">Student / Learner</option>
                  </select>
                </div>

                {/* Role-Specific Contextual Fields */}
                {(regForm.requestedRole === 'Teacher' || regForm.requestedRole === 'Deputy Headteacher' || regForm.requestedRole === 'Bursar') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Sciences, Arts"
                        value={regForm.department}
                        onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">TIN (Optional)</label>
                      <input
                        type="text"
                        placeholder="10-digit TIN"
                        value={regForm.tinNumber}
                        onChange={(e) => setRegForm({ ...regForm, tinNumber: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">NSSF (Optional)</label>
                      <input
                        type="text"
                        placeholder="NSSF No"
                        value={regForm.nssfNumber}
                        onChange={(e) => setRegForm({ ...regForm, nssfNumber: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>
                )}

                {regForm.requestedRole === 'Student' && (
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Learner Identification Number (LIN) or Admission No *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LIN-2026-0042 or ADM-1002"
                      value={regForm.studentIdOrLin}
                      onChange={(e) => setRegForm({ ...regForm, studentIdOrLin: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded text-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Matched automatically to your student academic passport.</p>
                  </div>
                )}

                {regForm.requestedRole === 'Parent' && (
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Child's LIN, Admission No, or National ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LIN-2026-0042 or ADM-1002"
                      value={regForm.childLinOrNin}
                      onChange={(e) => setRegForm({ ...regForm, childLinOrNin: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded text-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Links your parent portal to your child's fee accounts & report cards.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min 8 characters"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-3"
                >
                  {regLoading ? 'Submitting Application...' : 'Submit School Account Application'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 3: CHECK APPLICATION STATUS ================= */}
        {activeTab === 'STATUS' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Check the live status of your account request submitted to the Headteacher.
            </p>

            <form onSubmit={handleCheckStatus} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username or email address"
                value={statusQuery}
                onChange={(e) => setStatusQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={statusLoading}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Search className="w-3.5 h-3.5" />
                {statusLoading ? 'Checking...' : 'Check'}
              </button>
            </form>

            {statusError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            {statusResult && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{statusResult.fullName || statusResult.username}</h4>
                    <p className="text-xs text-slate-400">@{statusResult.username} • Role: {statusResult.requestedRole || statusResult.role}</p>
                  </div>
                  <div>
                    {statusResult.status === 'Active' || statusResult.approvalStatus === 'APPROVED' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        APPROVED & ACTIVE
                      </span>
                    ) : statusResult.status === 'PENDING_APPROVAL' || statusResult.approvalStatus === 'PENDING_APPROVAL' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
                        PENDING HEADTEACHER APPROVAL
                      </span>
                    ) : statusResult.status === 'REJECTED' || statusResult.approvalStatus === 'REJECTED' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                        REJECTED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                        {statusResult.status}
                      </span>
                    )}
                  </div>
                </div>

                {statusResult.status === 'PENDING_APPROVAL' && (
                  <p className="text-xs text-amber-300/90 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/60">
                    Your application is currently in the Headteacher's verification queue. You will be able to log in immediately once approved.
                  </p>
                )}

                {(statusResult.status === 'REJECTED' || statusResult.approvalStatus === 'REJECTED') && (
                  <div className="text-xs text-rose-300/90 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60">
                    <span className="font-semibold text-rose-200">Rejection Reason:</span>{' '}
                    {statusResult.rejectionReason || 'Application could not be verified with school records.'}
                  </div>
                )}

                {statusResult.status === 'Active' && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameOrEmail(statusResult.username);
                      setActiveTab('LOGIN');
                    }}
                    className="w-full py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                  >
                    Proceed to Sign In as @{statusResult.username}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span>Protected by Argon2id, JWT Session & Headteacher Approval Matrix</span>
        </div>
      </div>

      {/* Account Recovery & Password Reset Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={resetRecoveryModal}
        title="Account Recovery & Identity Verification"
      >
        <div className="space-y-4 text-xs">
          {/* Recovery Type Tabs */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setRecoveryTab('OTP_RESET');
                setRecoveryError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                recoveryTab === 'OTP_RESET'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Reset with Code (OTP)
            </button>
            <button
              type="button"
              onClick={() => {
                setRecoveryTab('LOST_CONTACTS');
                setRecoveryError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                recoveryTab === 'LOST_CONTACTS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Lost Email/Phone / Headteacher Recovery
            </button>
          </div>

          {/* ================= TAB 1: OTP PASSWORD RESET ================= */}
          {recoveryTab === 'OTP_RESET' && (
            <div className="space-y-4">
              {recoveryError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {/* STEP 1: REQUEST OTP */}
              {recoveryStep === 'REQUEST' && (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Enter your <strong>Username</strong>, registered <strong>Email</strong>, <strong>Phone Number</strong>, <strong>National ID / NIN</strong>, or <strong>Student LIN</strong>. A secure 6-digit verification code will be dispatched to your registered contact.
                  </p>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Account Identifier *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. jmukasa, jmukasa@school.ac.ug, or +256..."
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetRecoveryModal}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {recoveryLoading ? 'Dispatching...' : 'Send Verification Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: ENTER OTP */}
              {recoveryStep === 'VERIFY_OTP' && (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                    <div className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      Code Dispatched
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 text-[11px]">
                      A 6-digit code has been sent to <strong>{recoveryMaskedContact}</strong>. Code valid for 15 minutes.
                    </p>
                    {simulatedOtp && (
                      <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between text-[11px]">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Sandbox Simulation Passcode:</span>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 tracking-wider">
                          {simulatedOtp}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter 6-Digit Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      placeholder="e.g. 123456"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-lg font-mono tracking-widest px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('REQUEST')}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Change identifier / Resend
                    </button>
                    <button
                      type="submit"
                      disabled={recoveryLoading || enteredOtp.length < 6}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {recoveryLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: SET NEW PASSWORD */}
              {recoveryStep === 'SET_PASSWORD' && (
                <form onSubmit={handleCompletePasswordReset} className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Identity Verified
                    </div>
                    <p className="text-[11px] mt-0.5">Please choose a new, strong password (minimum 8 characters).</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-md"
                    >
                      <Key className="w-3.5 h-3.5" />
                      {recoveryLoading ? 'Updating...' : 'Save New Password & Unlock Account'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: SUCCESS */}
              {recoveryStep === 'SUCCESS' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Password Updated Successfully</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                    {resetSuccessMsg}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetRecoveryModal();
                        setActiveTab('LOGIN');
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md"
                    >
                      Proceed to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: LOST EMAIL/PHONE & HEADTEACHER ESCALATION ================= */}
          {recoveryTab === 'LOST_CONTACTS' && (
            <div className="space-y-3">
              {escalationError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{escalationError}</span>
                </div>
              )}

              {escalationSuccess ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">Escalation Logged</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                    {escalationSuccess}
                  </p>
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={resetRecoveryModal}
                      className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEscalationSubmit} className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    <span className="font-bold">Administrative Identity Verification:</span> If you have changed your phone number, lost your email, or are locked out completely, submit your institutional credentials below. The <strong>Headteacher</strong> will inspect the school registry and override credentials safely.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Mukasa"
                        value={escalationForm.fullName}
                        onChange={(e) => setEscalationForm({ ...escalationForm, fullName: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Username (if remembered)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. jmukasa"
                        value={escalationForm.identifier}
                        onChange={(e) => setEscalationForm({ ...escalationForm, identifier: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        National ID / NIN (Staff/Parents)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CM90012345XYZ"
                        value={escalationForm.nationalIdOrNin}
                        onChange={(e) => setEscalationForm({ ...escalationForm, nationalIdOrNin: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Student LIN / Admission No
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. LIN-88421 or ADM-2026"
                        value={escalationForm.studentIdOrLin}
                        onChange={(e) => setEscalationForm({ ...escalationForm, studentIdOrLin: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        New Contact Email
                      </label>
                      <input
                        type="email"
                        placeholder="newemail@domain.com"
                        value={escalationForm.newEmail}
                        onChange={(e) => setEscalationForm({ ...escalationForm, newEmail: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        New Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+256 700 000 000"
                        value={escalationForm.newPhone}
                        onChange={(e) => setEscalationForm({ ...escalationForm, newPhone: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reason for Contact Loss & Notes *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Lost SIM card and swapped to new number; need password reset to login for Term I marks entry."
                      value={escalationForm.recoveryNotes}
                      onChange={(e) => setEscalationForm({ ...escalationForm, recoveryNotes: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetRecoveryModal}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={escalationLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-md"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {escalationLoading ? 'Submitting...' : 'Submit to Headteacher'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </Modal>

      <footer className="mt-6 text-center text-[11px] text-slate-500">
        <p>© 2026 SchoolSoul OS. All Rights Reserved.</p>
        <p className="mt-0.5 text-[10px] text-slate-500/80">
          Developed under the VINEXSAH TECHNOLOGIES project.
        </p>
      </footer>
    </div>
  );
};

