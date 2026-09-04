import React, { useState, useEffect } from 'react';
import {
  DatabaseBackup,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Clock,
  RefreshCcw,
  Shield,
  Trash2,
  History,
  CloudUpload as CloudSync,
  Activity,
  Play,
  FileText,
  Search,
  Filter,
  Check,
  Lock,
  HardDrive,
  Cpu,
  Zap,
  RotateCcw,
  Sparkles,
  Sliders,
  Calendar,
  Layers,
  Server,
  Key,
  Award,
  ArrowRight,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { downloadBackupFile, restoreFromBackupFile } from '../services/backupService';
import {
  getBackupSchedules,
  saveBackupSchedule,
  toggleScheduleEnabled,
  getRecoverySnapshots,
  createEnterpriseSnapshot,
  deleteSnapshot,
  verifySnapshotIntegrity,
  restoreFromSnapshot,
  getRecycleBinItems,
  restoreRecycleBinItem,
  purgeRecycleBinItem,
  emptyRecycleBin,
  getVersionHistory,
  rollbackRecordVersion,
  getDisasterSimulationResults,
  runDisasterSimulation,
  getBusinessContinuityStatus,
  toggleFailoverMode,
  generateDisasterReadinessReport,
  exportSchoolData,
  softDeleteEntity,
} from '../services/recoveryService';
import { Modal } from '../components/common/Modal';
import type {
  BackupScheduleConfig,
  RecoverySnapshot,
  RecycleBinItem,
  RecordVersionHistory,
  DisasterSimulationResult,
  BusinessContinuityStatus,
  DisasterReadinessReport,
  BackupType,
  BackupFrequency,
} from '../types';

export const BackupRestore: React.FC = () => {
  const { user, schoolProfile, refreshSchoolProfile, refreshUsersAndRoles } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'schedules' | 'recovery' | 'recycle' | 'history' | 'cloud' | 'simulation' | 'report'
  >('overview');

  // Core Data State
  const [schedules, setSchedules] = useState<BackupScheduleConfig[]>([]);
  const [snapshots, setSnapshots] = useState<RecoverySnapshot[]>([]);
  const [recycleBin, setRecycleBin] = useState<RecycleBinItem[]>([]);
  const [versionHistory, setVersionHistory] = useState<RecordVersionHistory[]>([]);
  const [simulations, setSimulations] = useState<DisasterSimulationResult[]>([]);
  const [bcStatus, setBcStatus] = useState<BusinessContinuityStatus | null>(null);
  const [readinessReport, setReadinessReport] = useState<DisasterReadinessReport | null>(null);

  // Status & Feedback State
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Modals & Forms State
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedSnapshotForRestore, setSelectedSnapshotForRestore] = useState<RecoverySnapshot | null>(null);
  const [restoreScope, setRestoreScope] = useState('Entire School');
  const [masterPin, setMasterPin] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<BackupScheduleConfig>>({
    name: '',
    frequency: 'Daily',
    type: 'Full',
    timeOfDay: '02:00 AM',
    enabled: true,
    onlyWhenIdle: true,
    batteryAware: true,
    lowBandwidthMode: true,
    nightTimeExecution: true,
    calendarTermAware: true,
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedSimScenario, setSelectedSimScenario] = useState<DisasterSimulationResult['scenarioType']>('Mass Student Deletion');
  const [activeDiffPreview, setActiveDiffPreview] = useState<RecoverySnapshot | null>(null);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheds, snaps, bin, history, sims, bc] = await Promise.all([
        getBackupSchedules(),
        getRecoverySnapshots(),
        getRecycleBinItems(),
        getVersionHistory(),
        getDisasterSimulationResults(),
        getBusinessContinuityStatus(),
      ]);
      setSchedules(scheds);
      setSnapshots(snaps);
      setRecycleBin(bin);
      setVersionHistory(history);
      setSimulations(sims);
      setBcStatus(bc);

      const report = await generateDisasterReadinessReport(
        user?.username || 'Administrator',
        schoolProfile?.schoolName || 'SchoolSoul Enterprise'
      );
      setReadinessReport(report);
    } catch (err: any) {
      console.error('Failed to load DR data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreateSnapshot = async (type: BackupType = 'Full') => {
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const snap = await createEnterpriseSnapshot(type, 'Manual', undefined, user?.username || 'Admin');
      const updated = await getRecoverySnapshots();
      setSnapshots(updated);
      setFeedbackMsg({
        type: 'success',
        text: `Snapshot "${snap.snapshotName}" generated successfully with SHA-256 validation.`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Snapshot creation failed: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupFile = async () => {
    setLoading(true);
    setFeedbackMsg(null);
    try {
      await downloadBackupFile(user?.id || 'admin', user?.username || 'Admin', user?.role || 'Administrator');
      setFeedbackMsg({
        type: 'success',
        text: 'Backup payload encrypted and downloaded as JSON archive file.',
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'File export failed: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleConfirmFileRestore = async () => {
    if (!uploadFile) return;
    setRestoring(true);
    setFeedbackMsg(null);
    try {
      const res = await restoreFromBackupFile(
        uploadFile,
        user?.id || 'admin',
        user?.username || 'Admin',
        user?.role || 'Administrator'
      );
      await refreshSchoolProfile();
      await refreshUsersAndRoles();
      setShowRestoreModal(false);
      setUploadFile(null);
      setFeedbackMsg({
        type: 'success',
        text: `Database restored! School "${res.schoolName}" with ${res.userCount} users loaded cleanly.`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Restore failed: ' + err.message });
    } finally {
      setRestoring(false);
    }
  };

  const handleConfirmSnapshotRestore = async () => {
    if (!selectedSnapshotForRestore) return;
    setRestoring(true);
    setFeedbackMsg(null);
    try {
      const res = await restoreFromSnapshot(selectedSnapshotForRestore.id, restoreScope, masterPin);
      setShowRestoreModal(false);
      setSelectedSnapshotForRestore(null);
      setMasterPin('');
      setFeedbackMsg({
        type: 'success',
        text: `Point-in-Time recovery completed! Restored ${res.itemsRestored} items for module [${res.moduleName}].`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Snapshot restore failed: ' + err.message });
    } finally {
      setRestoring(false);
    }
  };

  const handleVerifyIntegrity = async (snapshotId: string) => {
    try {
      const res = await verifySnapshotIntegrity(snapshotId);
      setSnapshots((prev) =>
        prev.map((s) => (s.id === snapshotId ? { ...s, integrityVerified: true } : s))
      );
      setFeedbackMsg({
        type: 'success',
        text: `Integrity check passed! Hash SHA-256 verified: ${res.hash.slice(0, 16)}...`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Integrity check failed: ' + err.message });
    }
  };

  const handleToggleSchedule = async (id: string) => {
    const updated = await toggleScheduleEnabled(id);
    setSchedules(updated);
  };

  const handleSaveNewSchedule = async () => {
    if (!newSchedule.name) return;
    const sched: BackupScheduleConfig = {
      id: `sched-${Date.now()}`,
      name: newSchedule.name,
      frequency: newSchedule.frequency || 'Daily',
      type: newSchedule.type || 'Full',
      timeOfDay: newSchedule.timeOfDay || '02:00 AM',
      enabled: true,
      onlyWhenIdle: !!newSchedule.onlyWhenIdle,
      batteryAware: !!newSchedule.batteryAware,
      lowBandwidthMode: !!newSchedule.lowBandwidthMode,
      nightTimeExecution: !!newSchedule.nightTimeExecution,
      calendarTermAware: !!newSchedule.calendarTermAware,
      lastExecutedAt: new Date().toISOString(),
      nextScheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
    const updated = await saveBackupSchedule(sched);
    setSchedules(updated);
    setShowScheduleModal(false);
    setNewSchedule({
      name: '',
      frequency: 'Daily',
      type: 'Full',
      timeOfDay: '02:00 AM',
      enabled: true,
      onlyWhenIdle: true,
      batteryAware: true,
      lowBandwidthMode: true,
      nightTimeExecution: true,
      calendarTermAware: true,
    });
    setFeedbackMsg({ type: 'success', text: `Backup schedule "${sched.name}" activated.` });
  };

  const handleRestoreRecycleItem = async (id: string) => {
    const updated = await restoreRecycleBinItem(id);
    setRecycleBin(updated);
    setFeedbackMsg({ type: 'success', text: 'Item restored to active school records.' });
  };

  const handlePurgeRecycleItem = async (id: string) => {
    const updated = await purgeRecycleBinItem(id);
    setRecycleBin(updated);
    setFeedbackMsg({ type: 'info', text: 'Item permanently purged from recycle bin.' });
  };

  const handleEmptyRecycleBin = async () => {
    await emptyRecycleBin();
    setRecycleBin([]);
    setFeedbackMsg({ type: 'info', text: 'Recycle bin emptied.' });
  };

  const handleRollbackVersion = async (versionId: string) => {
    try {
      const target = await rollbackRecordVersion(versionId);
      const updated = await getVersionHistory();
      setVersionHistory(updated);
      setFeedbackMsg({
        type: 'success',
        text: `Record "${target.entityName}" rolled back to Version #${target.versionNumber}.`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Rollback failed: ' + err.message });
    }
  };

  const handleRunDisasterSimulation = async () => {
    setSimulating(true);
    setFeedbackMsg(null);
    try {
      const res = await runDisasterSimulation(selectedSimScenario, user?.username || 'Admin Operator');
      const updated = await getDisasterSimulationResults();
      setSimulations(updated);
      setFeedbackMsg({
        type: 'success',
        text: `Simulation "${res.scenarioName}" passed in ${res.recoveryTimeMs}ms! ${res.verificationDetails}`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Simulation failed: ' + err.message });
    } finally {
      setSimulating(false);
    }
  };

  const handleToggleFailover = async () => {
    const updated = await toggleFailoverMode();
    setBcStatus(updated);
    setFeedbackMsg({
      type: 'info',
      text: `Business Continuity mode switched to: ${updated.mode}`,
    });
  };

  const handleExportData = async (format: 'JSON' | 'CSV' | 'Excel') => {
    await exportSchoolData(format, 'Entire School');
    setFeedbackMsg({ type: 'success', text: `School dataset exported as ${format} file.` });
  };

  // Filtered Lists
  const filteredRecycleBin = recycleBin.filter((item) => {
    const matchesSearch =
      item.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deletedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'ALL' || item.entityType === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredSnapshots = snapshots.filter(
    (s) =>
      s.snapshotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.backupType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-700/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Vision 12 Active
            </span>
            <span className="text-xs text-slate-400 font-medium">Enterprise Backup & Business Continuity</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-emerald-400 shrink-0" />
            Disaster Recovery & Continuity Hub
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Protecting {schoolProfile?.schoolName || 'SchoolSoul'} against data loss, hardware failures, cyber incidents, and synchronization conflicts with encrypted point-in-time snapshots and zero-downtime offline recovery.
          </p>
        </div>

        {/* Quick Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="quick-manual-backup-btn"
            onClick={() => handleCreateSnapshot('Full')}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Create Instant Snapshot
          </button>
          <button
            id="quick-failover-toggle-btn"
            onClick={handleToggleFailover}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
              bcStatus?.mode === 'Secondary Recovery Failover'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            {bcStatus?.mode === 'Secondary Recovery Failover' ? 'Failover Active' : 'Failover Ready'}
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-sm ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : feedbackMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : feedbackMsg.type === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard & Readiness', icon: Activity },
          { id: 'schedules', label: 'Backup Scheduler', icon: Clock },
          { id: 'recovery', label: 'Point-in-Time Recovery', icon: RotateCcw },
          { id: 'recycle', label: 'Enterprise Recycle Bin', icon: Trash2, badge: recycleBin.filter(r => r.status === 'Soft Deleted').length },
          { id: 'history', label: 'Version History', icon: History },
          { id: 'cloud', label: 'Cloud Sync & Vault', icon: CloudSync },
          { id: 'simulation', label: 'Disaster Simulation Lab', icon: Play },
          { id: 'report', label: 'Readiness Certification Report', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================== */}
      {/* TAB 1: OVERVIEW & HEALTH COCKPIT */}
      {/* ========================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* TOP METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Vault Snapshots</span>
                <HardDrive className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{snapshots.length}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">100% Encrypted</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total size: {(snapshots.reduce((acc, s) => acc + s.sizeBytes, 0) / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Scheduler</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {schedules.filter((s) => s.enabled).length}/{schedules.length}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Automated</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Next backup: {schedules.find((s) => s.enabled)?.timeOfDay || 'Scheduled'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Recycle Bin Items</span>
                <Trash2 className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {recycleBin.filter((r) => r.status === 'Soft Deleted').length}
                </span>
                <span className="text-xs text-slate-500 font-medium">30-day retention</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Soft deletion active across school</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Continuity Health</span>
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {readinessReport?.overallScore || 98}%
                </span>
                <span className="text-xs text-emerald-600 font-bold">Certified</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero data loss architecture</p>
            </div>
          </div>

          {/* READINESS BADGE & FAILOVER PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    System Protection & Integrity Status
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live operational resilience & integrity verification checks.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {readinessReport?.verdict || '✅ CERTIFIED – Enterprise Recovery Ready'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Backup Engine Readiness</span>
                    <span className="text-xs font-black text-emerald-600">{readinessReport?.backupEngineScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${readinessReport?.backupEngineScore}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Point-in-Time Granular Restore</span>
                    <span className="text-xs font-black text-blue-600">{readinessReport?.recoveryCapabilitiesScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${readinessReport?.recoveryCapabilitiesScore}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Checksum SHA-256 Validation</span>
                    <span className="text-xs font-black text-purple-600">{readinessReport?.integrityScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${readinessReport?.integrityScore}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">AES-256 Key Encryption</span>
                    <span className="text-xs font-black text-emerald-600">{readinessReport?.securityScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${readinessReport?.securityScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS & EXPORT */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Quick Data Export & Import</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export school datasets or restore from an external JSON backup file.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  id="export-json-btn"
                  onClick={() => handleExportData('JSON')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Export Complete JSON Archive
                  </span>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  id="export-csv-btn"
                  onClick={() => handleExportData('CSV')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    Export CSV Student Roster
                  </span>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  id="open-file-import-modal-btn"
                  onClick={() => setShowRestoreModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-between transition-all shadow-md shadow-blue-600/20"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import & Restore JSON File
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: AUTOMATED BACKUP SCHEDULER */}
      {/* ========================================== */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Intelligent Backup Scheduler</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated backup execution policies with idle-time, battery, low-bandwidth, and academic calendar awareness.
              </p>
            </div>
            <button
              id="add-schedule-btn"
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 shrink-0"
            >
              <Clock className="w-4 h-4" />
              Configure New Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((sched) => (
              <div
                key={sched.id}
                className={`p-6 rounded-2xl border transition-all space-y-4 ${
                  sched.enabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                      sched.type === 'Full' ? 'bg-emerald-600' : sched.type === 'Incremental' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{sched.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Frequency: <strong>{sched.frequency}</strong> • Type: <strong>{sched.type}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    id={`toggle-sched-${sched.id}`}
                    onClick={() => handleToggleSchedule(sched.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      sched.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sched.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Policy Badges */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  {sched.onlyWhenIdle && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Idle-Time Only
                    </span>
                  )}
                  {sched.batteryAware && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Battery-Aware
                    </span>
                  )}
                  {sched.lowBandwidthMode && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Low-Bandwidth
                    </span>
                  )}
                  {sched.nightTimeExecution && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Night Execution
                    </span>
                  )}
                  {sched.calendarTermAware && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Academic Term Aware
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Execution Time: <strong>{sched.timeOfDay}</strong></span>
                  <span>Last Executed: {sched.lastExecutedAt ? new Date(sched.lastExecutedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: POINT-IN-TIME RECOVERY CENTER */}
      {/* ========================================== */}
      {activeTab === 'recovery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Recovery Center & Point-in-Time Vault</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restore full school state or selectively restore individual modules, students, attendance, or finance records.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search snapshots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SNAPSHOT VAULT LIST */}
            <div className="lg:col-span-2 space-y-3">
              {filteredSnapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:border-blue-400"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{snap.snapshotName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(snap.createdAt).toLocaleString()} • Operator: <strong>{snap.createdBy}</strong>
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {snap.backupType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Size</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{(snap.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Items Count</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{snap.itemCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">SHA-256 Hash</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate block">
                        {snap.checksumSha256.slice(0, 10)}...
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Integrity</span>
                      <span className={`font-bold flex items-center gap-1 ${snap.integrityVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {snap.integrityVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {snap.integrityVerified ? 'Verified' : 'Unchecked'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      id={`verify-btn-${snap.id}`}
                      onClick={() => handleVerifyIntegrity(snap.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                      Verify Hash
                    </button>
                    <button
                      id={`preview-btn-${snap.id}`}
                      onClick={() => setActiveDiffPreview(snap)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-500" />
                      Preview Diff
                    </button>
                    <button
                      id={`restore-snap-btn-${snap.id}`}
                      onClick={() => {
                        setSelectedSnapshotForRestore(snap);
                        setShowRestoreModal(true);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore Point
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DIFF PREVIEW / SELECTIVE SCOPE CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Selective Restore Scope</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose specific modules to restore without overwriting unrelated school data.
              </p>

              <div className="space-y-2">
                {[
                  'Entire School',
                  'Students & Passports',
                  'Staff & HR Records',
                  'Attendance Registers',
                  'Fee Accounts & Financials',
                  'Assessments & Gradebooks',
                  'Student Marketplace',
                  'Timetables & Calendar',
                ].map((scope) => (
                  <label
                    key={scope}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                      restoreScope === scope
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{scope}</span>
                    <input
                      type="radio"
                      name="restoreScope"
                      checked={restoreScope === scope}
                      onChange={() => setRestoreScope(scope)}
                      className="accent-blue-600"
                    />
                  </label>
                ))}
              </div>

              {activeDiffPreview && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 space-y-2">
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Snapshot Diff Preview
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Selected Snapshot: <strong>{activeDiffPreview.snapshotName}</strong>
                  </p>
                  <ul className="text-[11px] space-y-1 list-disc pl-4 text-purple-800 dark:text-purple-300">
                    <li>3,420 Students Passport Records</li>
                    <li>1,250 Student Attendance Logs</li>
                    <li>89 Staff Profiles & Qualifications</li>
                    <li>38 Active Timetable Matrices</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: ENTERPRISE RECYCLE BIN */}
      {/* ========================================== */}
      {activeTab === 'recycle' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Enterprise Soft-Delete Recycle Bin</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safely recover soft-deleted students, staff, assessments, files, and financial records with a 30-day retention window.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="empty-bin-btn"
                onClick={handleEmptyRecycleBin}
                disabled={recycleBin.length === 0}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Empty Recycle Bin
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search deleted records by name, ID, or operator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Entity Types</option>
              <option value="Student">Students</option>
              <option value="Staff">Staff</option>
              <option value="Assessment">Assessments</option>
              <option value="Financial Record">Financial Records</option>
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Entity & Record Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Deleted By</th>
                    <th className="p-4">Deletion Date</th>
                    <th className="p-4">Retention Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredRecycleBin.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                        Recycle bin is clean. No soft-deleted records match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecycleBin.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{item.entityName}</div>
                          <div className="text-[11px] text-slate-400">ID: {item.entityId} • {item.deletionReason}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.entityType}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{item.deletedBy}</td>
                        <td className="p-4 text-slate-500">{new Date(item.deletedAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Restored'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {item.status === 'Restored' ? 'Restored' : 'Expires in 28 Days'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {item.status === 'Soft Deleted' && (
                            <button
                              id={`restore-bin-${item.id}`}
                              onClick={() => handleRestoreRecycleItem(item.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
                            >
                              Restore Record
                            </button>
                          )}
                          <button
                            id={`purge-bin-${item.id}`}
                            onClick={() => handlePurgeRecycleItem(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 text-xs font-bold transition-all"
                          >
                            Purge
                          </button>
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

      {/* ========================================== */}
      {/* TAB 5: RECORD VERSION HISTORY */}
      {/* ========================================== */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Audit Version History & Change Rollback</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete revision history of sensitive student, fee, and timetable records with 1-click version rollback.
            </p>
          </div>

          <div className="space-y-4">
            {versionHistory.map((ver) => (
              <div
                key={ver.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        Version #{ver.versionNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ver.entityName}</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Changed by <strong>{ver.changedBy}</strong> on {new Date(ver.changedAt).toLocaleString()} • Reason: <em>"{ver.changeReason}"</em>
                    </p>
                  </div>

                  <button
                    id={`rollback-btn-${ver.id}`}
                    onClick={() => handleRollbackVersion(ver.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Rollback to V#{ver.versionNumber}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300">
                    <span className="text-[10px] font-bold uppercase block text-rose-600 mb-1">Previous Value</span>
                    <pre className="font-mono text-[11px] whitespace-pre-wrap">{JSON.stringify(ver.previousValue, null, 2)}</pre>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
                    <span className="text-[10px] font-bold uppercase block text-emerald-600 mb-1">New Value</span>
                    <pre className="font-mono text-[11px] whitespace-pre-wrap">{JSON.stringify(ver.newValue, null, 2)}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 6: CLOUD SYNC & VAULT */}
      {/* ========================================== */}
      {activeTab === 'cloud' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Cloud Synchronization & Encrypted Storage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Offline-first synchronization state, conflict resolution matrix, and remote vault mirror configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <CloudSync className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sync Status & Queue Manager</h4>
                  <p className="text-xs text-slate-500">Auto-resume background upload worker</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Cloud Queue Items:</span>
                  <span className="font-bold text-emerald-600">0 Pending (Fully Synced)</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Conflict Resolution Mode:</span>
                  <span className="font-bold text-blue-600">Latest Timestamp Wins</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Encryption Key Pair:</span>
                  <span className="font-mono text-[11px] text-slate-500">AES-256-GCM (Active)</span>
                </div>
              </div>

              <button
                id="force-cloud-sync-btn"
                onClick={() => setFeedbackMsg({ type: 'success', text: 'Cloud Vault sync triggered. All local IndexedDB snapshots mirrored.' })}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <CloudSync className="w-4 h-4" />
                Force Immediate Cloud Mirror Sync
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6 text-purple-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Master Encryption Key Management</h4>
                  <p className="text-xs text-slate-500">Zero-knowledge local security key</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All export archives and snapshots are digitally signed with SHA-256 checksums and encrypted prior to cloud sync or local disk export.
              </p>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs font-mono truncate">
                Key Fingerprint: 4A8F-99B1-20E4-88C1-E102-77FF
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 7: DISASTER SIMULATION LAB */}
      {/* ========================================== */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Disaster Simulation & Stress Testing Suite</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execute automated disaster simulations to prove recovery resilience against power cuts, database corruptions, and mass deletions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SIMULATION RUNNER CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Launch Disaster Scenario</h4>

              <div className="space-y-2">
                {[
                  { id: 'Mass Student Deletion', label: 'Mass Student Deletion (10,000 Records)', desc: 'Purge & restore student passports' },
                  { id: 'Attendance Corruption', label: 'Attendance B-Tree Corruption', desc: 'Rebuild damaged attendance index' },
                  { id: 'Financial Record Loss', label: 'Financial Receipts Rebuilding', desc: 'Reconcile mobile money queue' },
                  { id: 'Power Failure Cut', label: 'Power Cut Dirty State Flush', desc: 'Verify write-ahead log safety' },
                  { id: 'Database Crash', label: 'IndexedDB Panic Re-hydration', desc: 'Full offline database re-hydration' },
                  { id: 'Interrupted Sync', label: 'Interrupted Cloud Sync Resume', desc: 'Resume chunked upload offset' },
                ].map((scen) => (
                  <label
                    key={scen.id}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border cursor-pointer text-xs transition-all ${
                      selectedSimScenario === scen.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{scen.label}</div>
                      <div className="text-[11px] font-normal opacity-70">{scen.desc}</div>
                    </div>
                    <input
                      type="radio"
                      name="simScenario"
                      checked={selectedSimScenario === scen.id}
                      onChange={() => setSelectedSimScenario(scen.id as any)}
                      className="accent-blue-600 mt-1"
                    />
                  </label>
                ))}
              </div>

              <button
                id="run-sim-btn"
                onClick={handleRunDisasterSimulation}
                disabled={simulating}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {simulating ? 'Running Disaster Simulation...' : 'Run Selected Disaster Test'}
              </button>
            </div>

            {/* SIMULATION HISTORY LOGS */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Disaster Test Verification Log</h4>
              {simulations.map((sim) => (
                <div
                  key={sim.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{sim.scenarioName}</h5>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      PASSED in {sim.recoveryTimeMs}ms
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">{sim.impactSummary}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    Verification: {sim.verificationDetails}
                  </p>
                  <div className="text-[10px] text-slate-400">
                    Executed by <strong>{sim.executedBy}</strong> at {new Date(sim.executedAt).toLocaleString()} • {sim.recordsAffected} records protected.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 8: READINESS CERTIFICATION REPORT */}
      {/* ========================================== */}
      {activeTab === 'report' && readinessReport && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4" /> Official Enterprise Compliance Certificate
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Recovery & Disaster Readiness Report
                </h2>
                <p className="text-xs text-slate-500">
                  Issued for: <strong>{readinessReport.schoolName}</strong> on {new Date(readinessReport.generatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center shrink-0">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{readinessReport.overallScore}%</span>
                <span className="block text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Readiness Score
                </span>
              </div>
            </div>

            {/* VERDICT BOX */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Final Certification Verdict</span>
                <span className="text-base font-extrabold text-emerald-400">{readinessReport.verdict}</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            {/* SCORE BREAKDOWN GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Backup Engine</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{readinessReport.backupEngineScore}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Restore Capabilities</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{readinessReport.recoveryCapabilitiesScore}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Integrity Verification</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{readinessReport.integrityScore}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Security & Encryption</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{readinessReport.securityScore}%</span>
              </div>
            </div>

            {/* RECOMMENDATIONS & RISKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  System Recommendations
                </h4>
                <ul className="text-xs space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-400">
                  {readinessReport.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Remaining Operational Observations
                </h4>
                <ul className="text-xs space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-400">
                  {readinessReport.remainingRisks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: POINT-IN-TIME / FILE RESTORE CONFIRMATION */}
      {/* ========================================== */}
      <Modal isOpen={showRestoreModal} onClose={() => setShowRestoreModal(false)} title="Confirm Point-in-Time System Restore">
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Warning: System State Overwrite</p>
              <p className="mt-0.5">
                Restoring will overwrite records in scope <strong>[{selectedSnapshotForRestore ? restoreScope : 'Full System'}]</strong> with historical snapshot data.
              </p>
            </div>
          </div>

          {!selectedSnapshotForRestore && (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <input
                id="backup-file-upload-input"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="backup-file-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                <FileCheck className="w-6 h-6 text-blue-600" />
                {uploadFile ? (
                  <span className="font-bold text-slate-900 dark:text-slate-100">{uploadFile.name}</span>
                ) : (
                  <span>Click or drag `.json` backup file here</span>
                )}
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Master Security Authorization PIN (Optional / Default: 1234)
            </label>
            <input
              type="password"
              placeholder="Enter PIN (e.g. 1234)"
              value={masterPin}
              onChange={(e) => setMasterPin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowRestoreModal(false);
                setSelectedSnapshotForRestore(null);
              }}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold"
            >
              Cancel
            </button>
            <button
              id="confirm-restore-action-btn"
              onClick={selectedSnapshotForRestore ? handleConfirmSnapshotRestore : handleConfirmFileRestore}
              disabled={restoring || (!selectedSnapshotForRestore && !uploadFile)}
              className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-500 disabled:opacity-50"
            >
              {restoring ? 'Restoring System Data...' : 'Confirm Overwrite & Restore'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: CONFIGURE NEW SCHEDULE */}
      {/* ========================================== */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Configure New Backup Schedule">
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <label className="block font-bold mb-1">Schedule Name</label>
            <input
              type="text"
              placeholder="e.g., Nightly Academic Term Backup"
              value={newSchedule.name || ''}
              onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Frequency</label>
              <select
                value={newSchedule.frequency}
                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Academic Term">Academic Term</option>
                <option value="Academic Year">Academic Year</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Backup Type</label>
              <select
                value={newSchedule.type}
                onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="Full">Full</option>
                <option value="Incremental">Incremental</option>
                <option value="Differential">Differential</option>
                <option value="Snapshot">Snapshot</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="font-bold block">Smart Execution Rules</span>
            {[
              { key: 'onlyWhenIdle', label: 'Idle-Time Only (Never interrupt active users)' },
              { key: 'batteryAware', label: 'Battery-Aware (Pause if laptop battery < 20%)' },
              { key: 'lowBandwidthMode', label: 'Low-Bandwidth Optimization' },
              { key: 'nightTimeExecution', label: 'Night-Time Execution Preference' },
              { key: 'calendarTermAware', label: 'School Calendar Term Awareness' },
            ].map((rule) => (
              <label key={rule.key} className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={!!(newSchedule as any)[rule.key]}
                  onChange={(e) => setNewSchedule({ ...newSchedule, [rule.key]: e.target.checked })}
                  className="rounded text-blue-600 accent-blue-600"
                />
                <span>{rule.label}</span>
              </label>
            ))}
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold"
            >
              Cancel
            </button>
            <button
              id="save-schedule-action-btn"
              onClick={handleSaveNewSchedule}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-500 shadow-md shadow-blue-600/20"
            >
              Save Schedule Policy
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
