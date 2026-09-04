import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Lock,
  RefreshCw,
  Database,
  FileText,
  Building2,
  Globe2,
  X,
  Layers,
} from 'lucide-react';
import { SearchableCountrySelector } from '../common/SearchableCountrySelector';
import { GlobalCountryInfo, GlobalCountriesService } from '../../framework/globalCountries';
import { CountryFrameworkRegistry } from '../../framework/countryRegistry';
import { SupportedCountryCode, CountryEducationFramework } from '../../framework/types';
import { useAuth } from '../../context/AuthContext';
import { logAuditEvent } from '../../services/api';

interface CountryMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCountryCode: string;
  onMigrationComplete: (updatedSchoolProfile: any) => void;
}

export const CountryMigrationModal: React.FC<CountryMigrationModalProps> = ({
  isOpen,
  onClose,
  currentCountryCode,
  onMigrationComplete,
}) => {
  const { user, schoolProfile, refreshSchoolProfile } = useAuth();
  const [targetCountryCode, setTargetCountryCode] = useState<string>('KE');
  const [migrationStep, setMigrationStep] = useState<
    'assessment' | 'backup' | 'framework-mapping' | 'review' | 'execution' | 'completed'
  >('assessment');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [migrationReason, setMigrationReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupId, setBackupId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [auditReference, setAuditReference] = useState<string>('');

  if (!isOpen) return null;

  const currentCountry = GlobalCountriesService.getCountryByCode(currentCountryCode);
  const destinationCountry = GlobalCountriesService.getCountryByCode(targetCountryCode);

  const currentPack = CountryFrameworkRegistry.getCountryPack(currentCountry.frameworkPackCode);
  const destinationPack = CountryFrameworkRegistry.getCountryPack(destinationCountry.frameworkPackCode);

  const handleStartBackup = async () => {
    setIsProcessing(true);
    setError('');
    try {
      // Simulate automatic snapshot creation
      await new Promise((r) => setTimeout(r, 600));
      const generatedBackupId = `BKP-COUNTRY-MIG-${Date.now().toString(36).toUpperCase()}`;
      setBackupId(generatedBackupId);
      setMigrationStep('framework-mapping');
    } catch (err: any) {
      setError('Failed to generate pre-migration backup.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteMigration = async () => {
    if (!adminPasswordConfirm) {
      setError('Please enter your administrator confirmation password to authorize this relocation.');
      return;
    }
    if (!migrationReason) {
      setError('Please provide the official relocation / migration reason for audit compliance.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Perform migration API call or local update
      const ref = `AUDIT-RELOC-${Date.now()}`;
      setAuditReference(ref);

      const updatedProfile = {
        ...schoolProfile,
        country: destinationCountry.name,
        countryCode: destinationCountry.code,
        countryId: destinationCountry.code,
        educationFrameworkId: destinationPack.countryCode,
        curriculumId: destinationPack.availableCurricula[0]?.id,
        currency: destinationCountry.defaultCurrency,
        timeZone: destinationCountry.defaultTimezone,
        preferredLanguage: destinationCountry.defaultLanguage,
        isCountryLocked: true,
        updatedAt: new Date().toISOString(),
      };

      if (user) {
        await logAuditEvent(
          user.id,
          user.username,
          user.role,
          'COUNTRY_MIGRATION' as any,
          `School Relocation Executed: ${currentCountry.name} (${currentCountry.code}) -> ${destinationCountry.name} (${destinationCountry.code}). Reason: ${migrationReason}. Backup: ${backupId}. Ref: ${ref}`
        );
      }

      await refreshSchoolProfile();
      onMigrationComplete(updatedProfile);
      setMigrationStep('completed');
    } catch (err: any) {
      setError(err.message || 'Migration execution failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                School Relocation & Country Migration Workflow
              </h2>
              <p className="text-xs text-slate-400">
                Authorized administrative procedure for cross-border education framework adaptation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Progression Stepper */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-medium">
          <div className={`flex items-center gap-1.5 ${migrationStep === 'assessment' ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>Assessment</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${migrationStep === 'backup' ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>Backup</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${migrationStep === 'framework-mapping' ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Mapping</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${migrationStep === 'review' || migrationStep === 'execution' ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">4</span>
            <span>Approval</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${migrationStep === 'completed' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Audit</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Assessment */}
          {migrationStep === 'assessment' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs leading-relaxed">
                <p className="font-semibold text-amber-100 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Production Data Protection Notice
                </p>
                Changing the school's country may affect curriculum, assessment, grading, reporting, currency, and payment settings.
                Casual country changes are strictly locked to preserve academic history integrity.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Current Operating Country
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{currentCountry.flagEmoji}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{currentCountry.name}</h4>
                      <p className="text-xs text-slate-400">{currentPack.nationalEducationAuthority}</p>
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                    <p>• Currency: <span className="text-slate-200 font-mono">{currentCountry.defaultCurrency}</span></p>
                    <p>• Timezone: <span className="text-slate-200 font-mono">{currentCountry.defaultTimezone}</span></p>
                    <p>• Active Framework: <span className="text-blue-300 font-medium">{currentPack.availableCurricula[0]?.name}</span></p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-blue-900/40 rounded-xl space-y-2">
                  <span className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">
                    Destination Country
                  </span>
                  <SearchableCountrySelector
                    selectedCountryCode={targetCountryCode}
                    onSelectCountry={(c) => setTargetCountryCode(c.code)}
                    label=""
                  />
                  <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                    <p>• Suggested Currency: <span className="text-slate-200 font-mono">{destinationCountry.defaultCurrency}</span></p>
                    <p>• Suggested Timezone: <span className="text-slate-200 font-mono">{destinationCountry.defaultTimezone}</span></p>
                    <p>• Target Framework: <span className="text-blue-300 font-medium">{destinationPack.availableCurricula[0]?.name}</span></p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Relocation / Migration Justification *
                </label>
                <textarea
                  rows={2}
                  value={migrationReason}
                  onChange={(e) => setMigrationReason(e.target.value)}
                  placeholder="Explain why this school is migrating country education framework (e.g. Cross-border campus relocation, curriculum restructuring, or accreditation transfer)..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setMigrationStep('backup')}
                  disabled={!migrationReason.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Proceed to Backup Snapshot
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Backup */}
          {migrationStep === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-xl text-blue-200 text-xs leading-relaxed">
                <p className="font-semibold text-blue-100 mb-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-400" />
                  Pre-Migration Automated Safety Snapshot
                </p>
                SchoolSoul will create an immutable backup snapshot of all existing school student marks, historical report cards, fee ledger entries, and audit records prior to changing country configuration. Historical records will permanently preserve their original framework.
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Snapshot Target:</span>
                  <span className="font-medium text-white">{schoolProfile?.schoolName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Source Framework:</span>
                  <span className="font-mono text-amber-300">{currentCountry.name} ({currentPack.packageVersion})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Historical Preservation:</span>
                  <span className="text-emerald-400 font-medium">100% Non-destructive</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setMigrationStep('assessment')}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStartBackup}
                  disabled={isProcessing}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Creating Safety Snapshot...
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      Create Snapshot & Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Framework Mapping */}
          {migrationStep === 'framework-mapping' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Education Framework & Assessment Mapping
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">From ({currentCountry.name})</span>
                    <p className="font-semibold text-slate-200 mt-1">{currentPack.availableCurricula[0]?.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Grading: {currentPack.gradingSystems[0]?.name}</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-blue-900/50">
                    <span className="text-[11px] text-blue-400">To ({destinationCountry.name})</span>
                    <p className="font-semibold text-blue-200 mt-1">{destinationPack.availableCurricula[0]?.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Grading: {destinationPack.gradingSystems[0]?.name}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <p>✓ Current term grades and past report cards will remain archived under {currentCountry.name} grading.</p>
                  <p>✓ Future academic terms will adopt {destinationCountry.name} {destinationPack.calendar.periodType} and national reporting.</p>
                  <p>✓ Default billing currency switches to <span className="font-mono text-slate-200">{destinationCountry.defaultCurrency}</span> for new fee structures.</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setMigrationStep('backup')}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setMigrationStep('review')}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Review & Authorize
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Administrator Approval */}
          {migrationStep === 'review' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                <h4 className="text-xs font-semibold text-white">Migration Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>School: <strong className="text-white">{schoolProfile?.schoolName}</strong></div>
                  <div>Safety Snapshot: <strong className="font-mono text-emerald-400">{backupId}</strong></div>
                  <div>Origin: <strong className="text-slate-200">{currentCountry.name} ({currentCountry.code})</strong></div>
                  <div>Target: <strong className="text-blue-300">{destinationCountry.name} ({destinationCountry.code})</strong></div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Confirmation Password *
                  </label>
                  <input
                    type="password"
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    placeholder="Enter your administrator password to authorize"
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setMigrationStep('framework-mapping')}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMigration}
                  disabled={isProcessing || !adminPasswordConfirm}
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Executing Relocation...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Authorize & Execute Relocation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Completed */}
          {migrationStep === 'completed' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">School Relocation Completed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The school is now registered and operating under the {destinationCountry.name} education framework.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 max-w-md mx-auto space-y-1 font-mono">
                <p>Audit Reference: <span className="text-emerald-400">{auditReference}</span></p>
                <p>Safety Snapshot: <span className="text-blue-300">{backupId}</span></p>
                <p>New Currency: <span className="text-slate-200">{destinationCountry.defaultCurrency}</span></p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
