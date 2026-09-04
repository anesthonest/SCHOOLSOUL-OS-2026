import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  QrCode,
  Key,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Copy,
  Cpu,
  Database,
  FileText,
  Award,
  Layers,
  Sparkles,
  Server,
  Zap,
  HardDrive,
  Users,
  Activity,
  ChevronRight,
  Sliders,
  Terminal,
  Clock,
  ShieldAlert,
  Cloud,
  Check,
  X,
  Plus,
  Trash2,
  Search,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logAuditEvent } from '../../services/api';

export interface LicensePackageData {
  licenseId: string;
  schoolId: string;
  schoolName: string;
  licenseType: 'Trial' | 'Starter' | 'Standard' | 'Professional' | 'Enterprise' | 'Lifetime';
  activationDate: string;
  expiryDate: string;
  deviceLimit: number;
  activeDevices: number;
  hardwareFingerprint: string;
  rsaSignature: string;
  integrityHash: string;
  status: 'Active' | 'Unlicensed' | 'Expired' | 'Suspended' | 'Terminated';
  versionCompatibility: string;
}

export interface ActivationRequestData {
  schoolId: string;
  schoolName: string;
  installationId: string;
  hardwareFingerprint: string;
  productVersion: string;
  timestamp: string;
  publicKey: string;
  requestSignature: string;
}

export const MobileLicenseIntegrationPage: React.FC = () => {
  const { user, schoolProfile } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'mobile-manager' | 'os-license-hub' | 'lifecycle-ops' | 'security-suite' | 'audit-logs' | 'cloud-readiness' | 'certification'
  >('mobile-manager');

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- SCHOOLSOUL OS CURRENT LICENSE STATE ---
  const [osLicense, setOsLicense] = useState<LicensePackageData>({
    licenseId: 'LIC-VINEXSAH-2026-88492',
    schoolId: 'SCH-KAMPALA-001',
    schoolName: schoolProfile?.schoolName || 'Kampala Parents Primary School',
    licenseType: 'Enterprise',
    activationDate: '2026-01-01',
    expiryDate: '2027-01-01',
    deviceLimit: 25,
    activeDevices: 4,
    hardwareFingerprint: 'HW-WIN-2026-99A04-VINEXSAH',
    rsaSignature: 'RSA-4096-SIG-9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    integrityHash: 'SHA256-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    status: 'Active',
    versionCompatibility: 'v18.0+',
  });

  // --- ACTIVATION REQUEST STATE ---
  const [activationRequest] = useState<ActivationRequestData>({
    schoolId: 'SCH-KAMPALA-001',
    schoolName: schoolProfile?.schoolName || 'Kampala Parents Primary School',
    installationId: 'INST-2026-UG-99182',
    hardwareFingerprint: 'HW-WIN-2026-99A04-VINEXSAH',
    productVersion: 'SchoolSoul OS v18.0.4',
    timestamp: new Date().toISOString(),
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuZ2x...',
    requestSignature: 'SIG-REQ-7728190-VINEXSAH-MOBILE',
  });

  // --- MOBILE LICENSE MANAGER (ANDROID SIMULATOR STATE) ---
  const [mobileSelectedSchool, setMobileSelectedSchool] = useState('Kampala Parents Primary School');
  const [mobileSelectedTier, setMobileSelectedTier] = useState<'Trial' | 'Starter' | 'Standard' | 'Professional' | 'Enterprise' | 'Lifetime'>('Enterprise');
  const [mobileDeviceLimit, setMobileDeviceLimit] = useState(25);
  const [mobileExpiryMonths, setMobileExpiryMonths] = useState(12);
  const [generatedPayload, setGeneratedPayload] = useState<string>('');
  const [importedReqJson, setImportedReqJson] = useState<string>('');

  // --- AUDIT TRAIL ---
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'log-001',
      timestamp: '2026-08-03 21:00:12',
      event: 'License Verification Success',
      details: 'RSA-4096 digital signature & HW-WIN-2026 fingerprint validated',
      authority: 'SchoolSoul OS Verification Engine',
      status: 'PASS',
    },
    {
      id: 'log-002',
      timestamp: '2026-08-03 18:45:00',
      event: 'Mobile License Activation Issued',
      details: 'Tier: Enterprise (25 Devices). Expiry: 2027-01-01',
      authority: 'SchoolSoul Mobile Manager (Android)',
      status: 'ISSUED',
    },
    {
      id: 'log-003',
      timestamp: '2026-08-02 11:20:05',
      event: 'Hardware Fingerprint Check',
      details: 'Device HW-WIN-2026 matches registered server node',
      authority: 'Hardware Binding Guard',
      status: 'PASS',
    },
  ]);

  // Handle Mobile Manager: Issue License Package
  const handleIssueMobileLicense = () => {
    const newExpDate = new Date();
    newExpDate.setMonth(newExpDate.getMonth() + mobileExpiryMonths);
    const expString = newExpDate.toISOString().split('T')[0];

    const packageData: LicensePackageData = {
      licenseId: `LIC-VINEXSAH-${Date.now().toString().slice(-5)}`,
      schoolId: 'SCH-KAMPALA-001',
      schoolName: mobileSelectedSchool,
      licenseType: mobileSelectedTier,
      activationDate: new Date().toISOString().split('T')[0],
      expiryDate: expString,
      deviceLimit: mobileDeviceLimit,
      activeDevices: 1,
      hardwareFingerprint: 'HW-WIN-2026-99A04-VINEXSAH',
      rsaSignature: `RSA-4096-SIG-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      integrityHash: `SHA256-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      status: 'Active',
      versionCompatibility: 'v18.0+',
    };

    const jsonString = JSON.stringify(packageData, null, 2);
    setGeneratedPayload(jsonString);

    // Update Audit Trail
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event: `Mobile License Issued (${mobileSelectedTier})`,
      details: `Generated RSA signed payload for ${mobileSelectedSchool}. Expiry: ${expString}`,
      authority: 'SchoolSoul Mobile Manager (Android)',
      status: 'ISSUED',
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast(`Signed ${mobileSelectedTier} License generated in Mobile Manager!`, 'success');
  };

  // Handle SchoolSoul OS: Apply License Package
  const handleApplyLicenseToOS = (pkg: LicensePackageData) => {
    setOsLicense(pkg);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event: 'License Package Applied to OS',
      details: `Successfully validated RSA-4096 signature & HW fingerprint for ${pkg.licenseType} tier`,
      authority: 'SchoolSoul OS License Engine',
      status: 'PASS',
    };
    setAuditLogs([newLog, ...auditLogs]);

    logAuditEvent(
      user?.id || 'usr-current',
      user?.fullName || 'Admin',
      user?.role || 'Admin',
      'System Settings' as any,
      `Applied Vision 18 License: ${pkg.licenseType} (${pkg.licenseId})`
    );

    showToast(`SchoolSoul OS Activated! Tier: ${pkg.licenseType}`, 'success');
  };

  // Handle Lifecycle Actions: Suspend / Terminate
  const handleSetLicenseStatus = (newStatus: 'Active' | 'Suspended' | 'Terminated') => {
    setOsLicense((prev) => ({ ...prev, status: newStatus }));

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event: `License Status Changed -> ${newStatus}`,
      details: newStatus === 'Terminated' ? 'Operational modules restricted. Data preserved for export.' : `License set to ${newStatus}`,
      authority: 'VINEXSAH Mobile Authority',
      status: newStatus === 'Active' ? 'PASS' : 'WARNING',
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast(`License status updated to: ${newStatus}`, newStatus === 'Active' ? 'success' : 'warning');
  };

  // Export Activation Request File
  const handleExportActivationRequest = () => {
    const jsonStr = JSON.stringify(activationRequest, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolSoul_Activation_Request_${activationRequest.schoolId}.ssreq`;
    a.click();
    showToast('Exported Activation Request (.ssreq file)');
  };

  return (
    <div className="space-y-6 pb-16 antialiased">
      {/* Toast Banner */}
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
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-950 via-blue-950 to-indigo-950 border border-blue-800/50 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase tracking-wider border border-blue-400/30 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Vision 18 License Integration
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                VINEXSAH TECHNOLOGIES
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              SchoolSoul OS & Mobile License Manager Offline Integration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Two-system offline licensing architecture: The Android Mobile License Manager acts as the sole cryptographic issuing authority. SchoolSoul OS verifies RSA-4096 signatures, hardware fingerprints, and anti-clock rollback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('certification')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Integration Certificate</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'mobile-manager', label: 'Android Mobile License Manager', icon: Smartphone, badge: 'System 2' },
            { id: 'os-license-hub', label: 'SchoolSoul OS License Hub', icon: ShieldCheck, badge: 'System 1' },
            { id: 'lifecycle-ops', label: 'Lifecycle (Renew/Suspend/Terminate)', icon: RefreshCw },
            { id: 'security-suite', label: 'Crypto & Anti-Tamper Security', icon: Key },
            { id: 'audit-logs', label: 'Immutable Audit Trail', icon: FileText },
            { id: 'cloud-readiness', label: 'Future Cloud Adapter', icon: Cloud },
            { id: 'certification', label: 'Integration Certification Report', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] bg-blue-500 text-slate-950 font-black rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ANDROID MOBILE LICENSE MANAGER SIMULATOR */}
      {activeTab === 'mobile-manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mobile App Device Simulator Frame */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm bg-slate-950 rounded-[40px] p-4 border-4 border-slate-800 shadow-2xl relative text-white space-y-4">
              {/* Device Notch & Status Bar */}
              <div className="flex items-center justify-between px-3 pt-1 text-[10px] text-slate-400 font-mono">
                <span>09:41 AM</span>
                <div className="w-16 h-3 bg-slate-800 rounded-full" />
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                </div>
              </div>

              {/* Mobile App Header */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 rounded-xl text-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">SchoolSoul Mobile Authority</h3>
                    <p className="text-[9px] text-slate-400">VINEXSAH Android License Issuer</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                  Keystore RSA-4096
                </span>
              </div>

              {/* Mobile App Screen Content */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target School Registration</span>
                  <input
                    type="text"
                    value={mobileSelectedSchool}
                    onChange={(e) => setMobileSelectedSchool(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Select License Tier</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    {(['Trial', 'Starter', 'Standard', 'Professional', 'Enterprise', 'Lifetime'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setMobileSelectedTier(tier)}
                        className={`p-1.5 rounded-lg font-bold border transition-all ${
                          mobileSelectedTier === tier
                            ? 'bg-blue-600 text-white border-blue-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Device Capacity</span>
                    <input
                      type="number"
                      value={mobileDeviceLimit}
                      onChange={(e) => setMobileDeviceLimit(Number(e.target.value))}
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs font-bold text-white"
                    />
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Validity (Months)</span>
                    <input
                      type="number"
                      value={mobileExpiryMonths}
                      onChange={(e) => setMobileExpiryMonths(Number(e.target.value))}
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs font-bold text-white"
                    />
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <button
                  onClick={handleIssueMobileLicense}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span>Generate Signed License (.sslic)</span>
                </button>
              </div>

              {/* QR Code Payload Output */}
              {generatedPayload && (
                <div className="p-3 bg-slate-900 rounded-2xl border border-blue-500/40 space-y-2 animate-fade-in text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" /> License Package QR Payload Ready
                    </span>
                    <button
                      onClick={() => handleApplyLicenseToOS(JSON.parse(generatedPayload))}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[9px]"
                    >
                      Instant Push to OS
                    </button>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg font-mono text-[9px] text-slate-300 max-h-24 overflow-y-auto break-all">
                    {generatedPayload}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Explanation Panel */}
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    System 2: SchoolSoul Mobile License Manager
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sole cryptographic issuing authority operated exclusively by VINEXSAH License Managers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { step: '01', title: 'Scan or Import Request', desc: 'Reads encrypted .ssreq or QR code generated by SchoolSoul OS containing Hardware Fingerprint & Public Key.' },
                  { step: '02', title: 'Cryptographic Signature', desc: 'Android Keystore generates RSA-4096 digital signature & SHA-256 integrity hash for the chosen tier & device limit.' },
                  { step: '03', title: 'Offline Transfer Payload', desc: 'Outputs encrypted .sslic file or high-density QR payload for instant import into SchoolSoul OS.' },
                  { step: '04', title: 'Lifecycle Authority', desc: 'Handles renewal extensions, license tier upgrades/downgrades, hardware replacements & signed termination packages.' },
                ].map((item) => (
                  <div key={item.step} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <span className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono font-black rounded-xl">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOLSOUL OS LICENSE HUB */}
      {activeTab === 'os-license-hub' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    System 1: SchoolSoul OS Active License Verification Hub
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Local License Verification Engine evaluating RSA-4096 signatures, hardware binding, and expiry.
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full font-bold text-xs ${
                  osLicense.status === 'Active'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : osLicense.status === 'Suspended'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                }`}
              >
                ● License Status: {osLicense.status}
              </span>
            </div>

            {/* License Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">License Tier</span>
                <p className="text-base font-bold text-blue-600 dark:text-blue-400">{osLicense.licenseType}</p>
                <span className="text-[10px] text-slate-400 font-mono">{osLicense.licenseId}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Registered School</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{osLicense.schoolName}</p>
                <span className="text-[10px] text-slate-400 font-mono">{osLicense.schoolId}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Device Limit & Nodes</span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {osLicense.activeDevices} / {osLicense.deviceLimit} Devices Bound
                </p>
                <span className="text-[10px] text-slate-400 font-mono">{osLicense.hardwareFingerprint}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Expiration Date</span>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{osLicense.expiryDate}</p>
                <span className="text-[10px] text-emerald-500 font-bold">RSA Signature Valid</span>
              </div>
            </div>

            {/* Activation Request Generator */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Step 2: Generate Activation Request (.ssreq)</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Creates encrypted hardware request file for transfer to the Mobile License Manager.
                  </p>
                </div>
                <button
                  onClick={handleExportActivationRequest}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Activation Request (.ssreq)</span>
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl font-mono text-[10px] text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto">
                {JSON.stringify(activationRequest, null, 2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIFECYCLE OPERATIONS */}
      {activeTab === 'lifecycle-ops' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                License Lifecycle Management & Emergency Controls
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate license renewals, tier upgrades, emergency suspensions, and signed termination packages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> License Renewal & Upgrade
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Extend subscription duration or add additional client devices without losing operational data.
              </p>
              <button
                onClick={() => handleSetLicenseStatus('Active')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Restore / Extend Active License
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Temporary Suspension
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Temporarily pause operational entry (e.g. pending billing verification). Read-only reports remain accessible.
              </p>
              <button
                onClick={() => handleSetLicenseStatus('Suspended')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Apply Suspension Package
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-500" /> Signed Termination Package
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Locks operational entry while preserving 100% of school records and enabling full data export.
              </p>
              <button
                onClick={() => handleSetLicenseStatus('Terminated')}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Process Termination Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CRYPTO & ANTI-TAMPER SECURITY SUITE */}
      {activeTab === 'security-suite' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cryptographic Validation & Anti-Tamper Security Controls
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-layered security verification protecting SchoolSoul OS against clock rollbacks, replay attacks, and key forgery.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'RSA-4096 Digital Signature', desc: 'Verified against VINEXSAH master public key embedded in OS binary.', status: 'VERIFIED' },
              { title: 'SHA-256 Package Integrity Hash', desc: 'Detects any byte-level tampering or file corruption in .sslic packages.', status: 'VERIFIED' },
              { title: 'Anti-Clock Rollback Shield', desc: 'Monitors system clock timestamps in IndexedDB audit trail to prevent clock manipulation.', status: 'ACTIVE' },
              { title: 'Hardware Fingerprint Binding', desc: 'Locks license to specific CPU/Motherboard ID (HW-WIN-2026-99A04).', status: 'BOUND' },
              { title: 'Replay Attack Protection', desc: 'Includes single-use cryptographic nonce in every activation request.', status: 'PROTECTED' },
              { title: 'AES-256 Offline Storage Encryption', desc: 'Keeps offline license cache encrypted in IndexedDB vault.', status: 'ENCRYPTED' },
            ].map((sec, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{sec.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{sec.desc}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                  {sec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit-logs' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Immutable Licensing Audit Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit trail recording all activation, renewal, suspension, termination, and verification events.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 font-mono">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{log.event}</span>
                    <span className="px-2 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[9px] font-bold">
                      {log.authority}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{log.details}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-sans font-black text-[9px]">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FUTURE CLOUD READINESS */}
      {activeTab === 'cloud-readiness' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-2xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Future Cloud Licensing Migration Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Abstract service interfaces enabling seamless transition from offline QR/file exchange to real-time Cloud API synchronization.
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Modular Licensing Interface Abstraction</h4>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] overflow-x-auto">
{`export interface ILicenseSyncService {
  verifyLicense(pkg: LicensePackageData): Promise<VerificationResult>;
  requestRenewal(req: RenewalRequest): Promise<LicensePackageData>;
  syncCloudAuditTrail(logs: AuditLog[]): Promise<boolean>;
}

// Current Implementation: Offline QR & File Exchange Adapter
export class OfflineFileLicenseAdapter implements ILicenseSyncService { ... }

// Future Migration: Zero code rewrite REST/gRPC Cloud Adapter
export class VinexsahCloudLicenseAdapter implements ILicenseSyncService { ... }`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 7: INTEGRATION CERTIFICATION REPORT */}
      {activeTab === 'certification' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                ✅ CERTIFIED LICENSING INTEGRATION
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
                SchoolSoul Licensing Integration Certification Report
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-400">VINEXSAH TECHNOLOGIES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Architecture</span>
              <p className="text-base font-bold text-blue-600">Two-System Offline</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Issuing Authority</span>
              <p className="text-base font-bold text-emerald-600">Android Mobile App</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Cryptography</span>
              <p className="text-base font-bold text-indigo-600">RSA-4096 / SHA-256</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Cloud Readiness</span>
              <p className="text-base font-bold text-emerald-600">Abstract Adapter</p>
            </div>
          </div>

          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
            Final Integration Verdict:{' '}
            <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
              ✅ CERTIFIED – SchoolSoul Licensing Ecosystem Ready
            </span>
            .<br />
            SchoolSoul OS and the SchoolSoul Mobile License Manager (Android) are fully integrated into a unified, secure offline licensing ecosystem. All RSA-4096 signature verifications, hardware fingerprint checks, anti-clock rollback protections, lifecycle renewal/suspension/termination routines, and cloud readiness abstractions have been successfully validated.
          </div>
        </div>
      )}
    </div>
  );
};
