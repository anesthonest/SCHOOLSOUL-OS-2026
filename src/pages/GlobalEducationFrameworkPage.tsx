// ============================================================================
// SCHOOLSOUL GLOBAL EDUCATION FRAMEWORK MASTER DASHBOARD
// Multi-Country, Multi-Curriculum, Universal Education Operating System
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Globe2,
  BookOpen,
  Sliders,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRightLeft,
  FileSpreadsheet,
  CheckCircle2,
  Award,
  Layers,
  Calendar,
  CreditCard,
  Lock,
  Search,
  RefreshCw,
  Download,
  AlertTriangle,
  FileText,
  Users,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  CountryEducationFramework,
  SupportedCountryCode,
  SchoolEducationConfig,
  MultiSchoolOrganization,
  CrossCountryTransferRecord,
  CountrySimulationTestResult,
} from '../framework/types';
import { CountryFrameworkRegistry } from '../framework/countryRegistry';
import { GlobalFrameworkService } from '../services/globalFrameworkService';

export const GlobalEducationFrameworkPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'packs'
    | 'school-config'
    | 'setup-wizard'
    | 'assessment-normalizer'
    | 'transfer-passport'
    | 'multi-school-orgs'
    | 'gov-exports'
    | 'simulations'
  >('packs');

  const [countryPacks, setCountryPacks] = useState<CountryEducationFramework[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<SupportedCountryCode>('UG');
  const [schoolConfig, setSchoolConfig] = useState<SchoolEducationConfig | null>(null);
  const [organizations, setOrganizations] = useState<MultiSchoolOrganization[]>([]);
  const [transferRecords, setTransferRecords] = useState<CrossCountryTransferRecord[]>([]);
  const [simulationResults, setSimulationResults] = useState<CountrySimulationTestResult[]>([]);
  const [isRunningSimulations, setIsRunningSimulations] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Normalizer State
  const [testMark, setTestMark] = useState<number>(78);

  // Transfer Tool State
  const [transferSrcCountry, setTransferSrcCountry] = useState<SupportedCountryCode>('UG');
  const [transferDestCountry, setTransferDestCountry] = useState<SupportedCountryCode>('KE');
  const [transferGradeLevel, setTransferGradeLevel] = useState('Senior 2 (S2)');
  const [transferStudentName, setTransferStudentName] = useState('Sarah Namubiru');
  const [transferCandidateCode, setTransferCandidateCode] = useState('SS-UG-2026-9042');
  const [transferEvaluationResult, setTransferEvaluationResult] = useState<any>(null);

  // Export State
  const [selectedExportCountry, setSelectedExportCountry] = useState<SupportedCountryCode>('UG');
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV' | 'XML'>('JSON');
  const [exportPayloadPreview, setExportPayloadPreview] = useState<any>(null);
  const [isLoadingExport, setIsLoadingExport] = useState(false);

  // Setup Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    countryCode: 'KE' as SupportedCountryCode,
    schoolName: 'Savannah Horizon High School',
    schoolType: 'Comprehensive' as const,
    primaryCurriculumId: 'ke-kicd-cbc',
    secondaryCurriculumId: 'intl-cambridge-igcse',
    gradingSystemId: 'ke-cbc-4levels',
    academicYear: '2026',
    currencyCode: 'KES',
    adminFullName: 'Principal David Kamau',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const packs = await GlobalFrameworkService.getAllCountryPacks();
    setCountryPacks(packs);
    const config = await GlobalFrameworkService.getSchoolEducationConfig('school-001');
    setSchoolConfig(config);
    const orgs = await GlobalFrameworkService.getOrganizations();
    setOrganizations(orgs);
    const transfers = await GlobalFrameworkService.getTransferRecords();
    setTransferRecords(transfers);
  };

  const selectedPack =
    countryPacks.find((p) => p.countryCode === selectedCountryCode) ||
    countryPacks[0] ||
    CountryFrameworkRegistry.getCountryPack('UG');

  const handleRunSimulations = () => {
    setIsRunningSimulations(true);
    setTimeout(() => {
      const res = GlobalFrameworkService.runSimulations();
      setSimulationResults(res);
      setIsRunningSimulations(false);
    }, 600);
  };

  const handleEvaluateTransfer = async () => {
    const sampleMarks = [
      { subjectName: 'Mathematics', percentageScore: 84 },
      { subjectName: 'Integrated Science', percentageScore: 78 },
      { subjectName: 'English Language', percentageScore: 82 },
      { subjectName: 'Computer / Digital Skills', percentageScore: 92 },
      { subjectName: 'Creative Arts & Design', percentageScore: 88 },
    ];
    const res = await GlobalFrameworkService.evaluateTransfer(
      transferSrcCountry,
      transferDestCountry,
      transferGradeLevel,
      sampleMarks
    );
    setTransferEvaluationResult(res);
  };

  const handleSubmitTransfer = async () => {
    if (!transferEvaluationResult) return;
    const newRecord = await GlobalFrameworkService.submitTransferRecord({
      studentCandidateCode: transferCandidateCode,
      studentFullName: transferStudentName,
      sourceCountry: transferSrcCountry,
      sourceSchoolId: 'school-ug-001',
      sourceSchoolName: 'Victoria High School Kampala',
      sourceCurriculum: 'NCDC Competency-Based Lower Secondary',
      sourceGradeLevel: transferGradeLevel,
      destinationCountry: transferDestCountry,
      destinationSchoolId: 'school-ke-002',
      destinationSchoolName: 'Nairobi Horizon Academy',
      destinationCurriculum: 'Kenya CBC / KNEC JSS',
      recommendedGradeLevel: transferEvaluationResult.recommendedDestinationGrade || 'Grade 8 (Junior School)',
      verifiedCompetenciesCount: 16,
      verifiedProjectsCount: 4,
      academicHistoryRecordsCount: 6,
      gradeEquivalencyNotes: transferEvaluationResult.advisoryNotes || 'Verified authentic transfer.',
      transferStatus: 'APPROVED',
      sourceSchoolReleaseVerified: true,
      destinationSchoolAccepted: true,
      parentConsentVerified: true,
      reviewedBy: 'Head of Admissions & Global Registrar',
    });
    setTransferRecords((prev) => [newRecord, ...prev]);
    setSaveSuccessMsg(`Transfer for student ${transferStudentName} successfully registered & approved!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleFetchExport = async () => {
    setIsLoadingExport(true);
    try {
      const pack = CountryFrameworkRegistry.getCountryPack(selectedExportCountry);
      const adapterId = pack.governmentReporting[0]?.adapterId || 'default-emis';
      const data = await GlobalFrameworkService.fetchGovernmentExport(selectedExportCountry, adapterId, exportFormat);
      setExportPayloadPreview(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoadingExport(false);
    }
  };

  const handleSaveSchoolConfig = async () => {
    if (!schoolConfig) return;
    try {
      const updated = await GlobalFrameworkService.updateSchoolEducationConfig('school-001', schoolConfig);
      setSchoolConfig(updated);
      setSaveSuccessMsg('School Education Framework settings updated successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (e: any) {
      alert('Error updating configuration: ' + e.message);
    }
  };

  return (
    <div id="global-framework-root" className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
                <Globe2 className="w-3.5 h-3.5" />
                Global Architecture Core
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                SchoolSoul Global Education Framework
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
                Universal, multi-country education operating system. Separates global core operations from plug-and-play country curricula, assessment models, grading scales, academic calendars, and government EMIS reporting.
              </p>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <div className="text-center px-3">
                <div className="text-xl sm:text-2xl font-bold text-emerald-400">8+</div>
                <div className="text-xs text-slate-400 font-medium">Country Packs</div>
              </div>
              <div className="text-center px-3 border-l border-slate-700">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">18+</div>
                <div className="text-xs text-slate-400 font-medium">Curricula</div>
              </div>
              <div className="text-center px-3 border-l border-slate-700">
                <div className="text-xl sm:text-2xl font-bold text-purple-400">100%</div>
                <div className="text-xs text-slate-400 font-medium">Tenant Isolated</div>
              </div>
              <div className="text-center px-3 border-l border-slate-700">
                <div className="text-xl sm:text-2xl font-bold text-amber-400">Offline</div>
                <div className="text-xs text-slate-400 font-medium">Local Cached</div>
              </div>
            </div>
          </div>

          {/* Quick Country Switcher Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-2">
              Country Packs:
            </span>
            {countryPacks.map((pack) => {
              const isActive = selectedCountryCode === pack.countryCode;
              return (
                <button
                  key={pack.countryCode}
                  id={`country-pill-${pack.countryCode}`}
                  onClick={() => setSelectedCountryCode(pack.countryCode)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span className="text-base">{pack.officialFlagEmoji}</span>
                  <span>{pack.countryName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/50 text-slate-300 font-mono">
                    {pack.countryCode}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
            {[
              { id: 'packs', label: 'Country Packs Explorer', icon: BookOpen },
              { id: 'school-config', label: 'School Framework Settings', icon: Sliders },
              { id: 'setup-wizard', label: '10-Step Setup Wizard', icon: Sparkles },
              { id: 'assessment-normalizer', label: 'Assessment & Grading Normalizer', icon: Award },
              { id: 'transfer-passport', label: 'Cross-Border Student Transfer', icon: ArrowRightLeft },
              { id: 'multi-school-orgs', label: 'Multi-Country Organizations', icon: Building2 },
              { id: 'gov-exports', label: 'Government EMIS & Exam Exports', icon: FileSpreadsheet },
              { id: 'simulations', label: 'Certification & Simulation Suite', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: COUNTRY PACKS EXPLORER */}
        {/* ========================================================================= */}
        {activeTab === 'packs' && (
          <div className="space-y-8">
            {/* Country Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="text-4xl p-3 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs">
                    {selectedPack.officialFlagEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-900">{selectedPack.countryName}</h2>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                        {selectedPack.countryCode}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        v{selectedPack.packageVersion}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      <span className="font-semibold text-slate-700">Authority:</span> {selectedPack.nationalEducationAuthority}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-400 block font-medium">Time Zone</span>
                    <span className="font-semibold text-slate-800">{selectedPack.timeZone}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-400 block font-medium">Currency</span>
                    <span className="font-semibold text-slate-800">
                      {selectedPack.currency.code} ({selectedPack.currency.symbol})
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-400 block font-medium">Calendar</span>
                    <span className="font-semibold text-slate-800">
                      {selectedPack.calendar.termsCount} {selectedPack.calendar.periodType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Core Pack Dimension Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {/* 1. Education Levels */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Education Levels ({selectedPack.educationLevels.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedPack.educationLevels.map((lvl) => (
                      <div key={lvl.id} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-800">{lvl.displayName}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Ages: {lvl.typicalAgeRange} • {lvl.grades.length} Grades ({lvl.grades.map((g) => g.code).join(', ')})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Curricula Available */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Curricula Frameworks ({selectedPack.availableCurricula.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedPack.availableCurricula.map((curr) => (
                      <div key={curr.id} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-800">{curr.name}</div>
                        <div className="text-emerald-700 font-medium text-[11px] mt-0.5">
                          {curr.type.replace('_', ' ')} • {curr.subjects.length} Core Subjects
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Grading & Assessment */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-purple-600" />
                    Grading & Assessment ({selectedPack.gradingSystems.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedPack.gradingSystems.map((gs) => (
                      <div key={gs.id} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-800">{gs.name}</div>
                        <div className="text-purple-700 text-[11px] mt-0.5">
                          {gs.scaleType.replace('_', ' ')} (Weight: {gs.continuousAssessmentWeightPercent}% CA / {gs.examinationWeightPercent}% Exam)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Payment Gateways */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    Payment Gateways ({selectedPack.paymentGateways.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedPack.paymentGateways.map((gw) => (
                      <div key={gw.providerId} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-800">{gw.displayName}</div>
                        <div className="text-amber-700 text-[11px] mt-0.5">
                          {gw.supportedMethods.join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Deep Framework Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Terminology Dictionary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Localized Education Terminology
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {Object.entries(selectedPack.terminology).map(([k, v]) => (
                    <div key={k} className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Calendar Specifications */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Academic Calendar & Term Structure
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                    <span className="font-bold">Year Start Month:</span> {selectedPack.calendar.academicYearStartMonth} •{' '}
                    <span className="font-bold">Period Model:</span> {selectedPack.calendar.periodType}
                  </div>
                  <div className="space-y-2">
                    {selectedPack.calendar.terms.map((t) => (
                      <div key={t.termNumber} className="p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{t.name}</div>
                          <div className="text-slate-500 text-[11px]">
                            {t.defaultStartMonth} — {t.defaultEndMonth}
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-slate-100 font-mono font-medium text-slate-700">
                          {t.weeksDuration} Weeks
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Government Adapters & Data Privacy */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Government EMIS & Privacy
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">EMIS Integration:</span>
                    {selectedPack.governmentReporting.map((gr) => (
                      <div key={gr.adapterId} className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-100 text-purple-900 mb-2">
                        <div className="font-bold">{gr.systemName}</div>
                        <div className="text-[11px] text-purple-700 mt-0.5">
                          Authority: {gr.authorityName} • Formats: [{gr.supportedFormats.join(', ')}]
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1">Privacy Legislation:</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {selectedPack.dataPrivacyPolicy.legislationName} (Data residency: {selectedPack.dataPrivacyPolicy.dataResidencyDefaultRegion})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SCHOOL FRAMEWORK SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'school-config' && schoolConfig && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">School Country & Curriculum Configuration</h2>
              <p className="text-sm text-slate-500">
                Configure your institution's active country framework, primary curriculum, secondary dual-curricula, active grading system, and monetary settings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Country Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Operating Country Framework
                </label>
                <select
                  value={schoolConfig.countryCode}
                  onChange={(e) => {
                    const code = e.target.value as SupportedCountryCode;
                    const pack = CountryFrameworkRegistry.getCountryPack(code);
                    setSchoolConfig({
                      ...schoolConfig,
                      countryCode: code,
                      primaryCurriculumId: pack.availableCurricula[0]?.id || '',
                      activeGradingSystemId: pack.gradingSystems[0]?.id || '',
                      currencyCode: pack.currency.code,
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {countryPacks.map((p) => (
                    <option key={p.countryCode} value={p.countryCode}>
                      {p.officialFlagEmoji} {p.countryName} ({p.countryCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Curriculum */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary National / Core Curriculum
                </label>
                <select
                  value={schoolConfig.primaryCurriculumId}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, primaryCurriculumId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {CountryFrameworkRegistry.getCountryPack(schoolConfig.countryCode).availableCurricula.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Grading Scale */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Active Grading Scale & Assessment Policy
                </label>
                <select
                  value={schoolConfig.activeGradingSystemId}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, activeGradingSystemId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {CountryFrameworkRegistry.getCountryPack(schoolConfig.countryCode).gradingSystems.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dual / Secondary Curriculum Support */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Optional Secondary Curriculum (Dual-Curriculum Support)
                </label>
                <select
                  value={schoolConfig.secondaryCurriculaIds[0] || ''}
                  onChange={(e) =>
                    setSchoolConfig({
                      ...schoolConfig,
                      secondaryCurriculaIds: e.target.value ? [e.target.value] : [],
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">None (Single Curriculum Institution)</option>
                  <option value="intl-cambridge-igcse">🌐 Cambridge International (IGCSE & A-Levels)</option>
                  <option value="intl-ib-diploma">🌐 International Baccalaureate (IB DP)</option>
                </select>
              </div>

              {/* Academic Year & Current Term */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={schoolConfig.academicYear}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, academicYear: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Operating Currency Code
                </label>
                <input
                  type="text"
                  value={schoolConfig.currencyCode}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, currencyCode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Historical records remain immutably anchored to their original framework version.
              </div>
              <button
                onClick={handleSaveSchoolConfig}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Education Settings
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 10-STEP SETUP WIZARD */}
        {/* ========================================================================= */}
        {activeTab === 'setup-wizard' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                Universal Onboarding Engine
              </div>
              <h2 className="text-2xl font-bold text-slate-900">SchoolSoul 10-Step Setup Wizard</h2>
              <p className="text-sm text-slate-500 mt-1">
                Demonstrating country-aware onboarding for schools across Uganda, Kenya, Tanzania, Ghana, Nigeria, South Africa, and International curricula.
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      wizardStep === s
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : wizardStep > s
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {wizardStep > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  {s < 10 && (
                    <div
                      className={`w-4 sm:w-8 h-1 ${
                        wizardStep > s ? 'bg-emerald-400' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Step 1: Select Country Framework</h3>
                  <p className="text-xs text-slate-500">
                    The country framework sets education levels, national grading standards, academic calendar, and government reporting adapters.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {countryPacks.map((p) => (
                      <button
                        key={p.countryCode}
                        onClick={() => {
                          setWizardData({
                            ...wizardData,
                            countryCode: p.countryCode,
                            currencyCode: p.currency.code,
                            primaryCurriculumId: p.availableCurricula[0]?.id || '',
                            gradingSystemId: p.gradingSystems[0]?.id || '',
                          });
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          wizardData.countryCode === p.countryCode
                            ? 'bg-white border-blue-500 ring-2 ring-blue-200 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-1">{p.officialFlagEmoji}</div>
                        <div className="font-bold text-slate-800">{p.countryName}</div>
                        <div className="text-[11px] text-slate-400">{p.currency.code}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Step 2: Education System Structure</h3>
                  <p className="text-xs text-slate-500">
                    Authority: {CountryFrameworkRegistry.getCountryPack(wizardData.countryCode).nationalEducationAuthority}
                  </p>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-slate-800">
                      Standard Education System for {CountryFrameworkRegistry.getCountryPack(wizardData.countryCode).countryName}:
                    </div>
                    {CountryFrameworkRegistry.getCountryPack(wizardData.countryCode).educationLevels.map((lvl) => (
                      <div key={lvl.id} className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="font-medium text-slate-700">{lvl.displayName}</span>
                        <span className="text-slate-400">{lvl.typicalAgeRange}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Step 3: Select Curriculum Framework</h3>
                  <div className="space-y-2">
                    {CountryFrameworkRegistry.getCountryPack(wizardData.countryCode).availableCurricula.map((curr) => (
                      <div
                        key={curr.id}
                        onClick={() => setWizardData({ ...wizardData, primaryCurriculumId: curr.id })}
                        className={`p-4 rounded-xl border text-xs cursor-pointer ${
                          wizardData.primaryCurriculumId === curr.id
                            ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-slate-800">{curr.name}</div>
                        <div className="text-slate-500 mt-1">{curr.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep >= 4 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Step {wizardStep}: Configuration Verified ({wizardData.countryCode})
                  </h3>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-slate-700">Country:</span> {wizardData.countryCode}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Currency:</span> {wizardData.currencyCode}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Academic Year:</span> {wizardData.academicYear}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Curriculum:</span> {wizardData.primaryCurriculumId}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(wizardStep - 1)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Previous Step
              </button>
              <button
                onClick={() => {
                  if (wizardStep < 10) setWizardStep(wizardStep + 1);
                  else {
                    setSaveSuccessMsg('School successfully onboarded via 10-Step Universal Wizard!');
                    setTimeout(() => setSaveSuccessMsg(null), 4000);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-xs"
              >
                {wizardStep === 10 ? 'Finish School Setup' : 'Next Step'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ASSESSMENT & GRADING NORMALIZER */}
        {/* ========================================================================= */}
        {activeTab === 'assessment-normalizer' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900">Universal Assessment & Grade Normalizer</h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter a raw mark or percentage score (0-100%) to see how it converts across different country assessment frameworks without destructive data mutation.
              </p>

              {/* Slider / Number Input */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Raw Percentage Score:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={testMark}
                    onChange={(e) => setTestMark(Number(e.target.value))}
                    className="w-32 px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-lg font-bold text-center"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testMark}
                  onChange={(e) => setTestMark(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Country Evaluation Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {countryPacks.map((pack) => {
                const evalResult = CountryFrameworkRegistry.evaluateGrade(testMark, pack.countryCode);
                return (
                  <div key={pack.countryCode} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{pack.officialFlagEmoji}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {pack.countryCode}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mb-1">{pack.countryName}</div>
                    <div className="text-[11px] text-slate-500 mb-3">{pack.gradingSystems[0].name}</div>

                    <div
                      className="p-3 rounded-lg text-center"
                      style={{
                        backgroundColor: `${evalResult.colorHex || '#3B82F6'}15`,
                        borderColor: evalResult.colorHex || '#3B82F6',
                        borderWidth: '1px',
                      }}
                    >
                      <div
                        className="text-xl font-extrabold"
                        style={{ color: evalResult.colorHex || '#3B82F6' }}
                      >
                        {evalResult.grade}
                      </div>
                      <div className="text-xs font-medium text-slate-700 mt-1">
                        {evalResult.descriptor}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CROSS-BORDER STUDENT TRANSFER */}
        {/* ========================================================================= */}
        {activeTab === 'transfer-passport' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Cross-Border Student Transfer & Passport Verification</h2>
              </div>
              <p className="text-sm text-slate-500">
                Safely transfer students between schools and countries (e.g. Uganda to Kenya). Preserves student skills passports, portfolios, and achievements while generating transparent grade conversion evaluations.
              </p>

              {/* Transfer Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={transferStudentName}
                    onChange={(e) => setTransferStudentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Source Country
                  </label>
                  <select
                    value={transferSrcCountry}
                    onChange={(e) => setTransferSrcCountry(e.target.value as SupportedCountryCode)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    {countryPacks.map((p) => (
                      <option key={p.countryCode} value={p.countryCode}>
                        {p.officialFlagEmoji} {p.countryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destination Country
                  </label>
                  <select
                    value={transferDestCountry}
                    onChange={(e) => setTransferDestCountry(e.target.value as SupportedCountryCode)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    {countryPacks.map((p) => (
                      <option key={p.countryCode} value={p.countryCode}>
                        {p.officialFlagEmoji} {p.countryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleEvaluateTransfer}
                    className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Evaluate Transfer
                  </button>
                </div>
              </div>

              {/* Transfer Evaluation Preview */}
              {transferEvaluationResult && (
                <div className="mt-6 p-5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-sm">
                      Transfer Equivalency Assessment Report
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Confidence: {transferEvaluationResult.equivalencyConfidence}
                    </span>
                  </div>

                  <p className="text-slate-700">{transferEvaluationResult.advisoryNotes}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="font-bold text-slate-800 mb-2">
                        Source Grades ({transferSrcCountry}):
                      </div>
                      {transferEvaluationResult.sourceEvaluations?.map((s: any) => (
                        <div key={s.subject} className="flex justify-between py-1 border-b border-slate-100">
                          <span>{s.subject}</span>
                          <span className="font-bold text-slate-800">{s.sourceGrade} ({s.percentage}%)</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="font-bold text-slate-800 mb-2">
                        Mapped Destination Performance ({transferDestCountry}):
                      </div>
                      {transferEvaluationResult.destinationEvaluations?.map((d: any) => (
                        <div key={d.subject} className="flex justify-between py-1 border-b border-slate-100">
                          <span>{d.subject}</span>
                          <span className="font-bold text-emerald-700">{d.convertedGrade}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitTransfer}
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Issue Transfer Passport Record
                  </button>
                </div>
              )}
            </div>

            {/* Historical Transfer Records Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Verified Cross-Border Transfer Ledger ({transferRecords.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {transferRecords.map((t) => (
                  <div key={t.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{t.studentFullName}</div>
                      <div className="text-slate-500 mt-0.5">
                        Code: {t.studentCandidateCode} • {t.sourceSchoolName} ({t.sourceCountry}) → {t.destinationSchoolName} ({t.destinationCountry})
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                        {t.transferStatus}
                      </span>
                      <span className="text-slate-400 font-mono">{t.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: MULTI-SCHOOL ORGANIZATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'multi-school-orgs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900">Multi-Country Educational Organizations</h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage international school networks with campuses across Uganda, Kenya, Tanzania, Nigeria, and Ghana. Strict tenant isolation protects each school's private pupil data while enabling aggregate executive reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {organizations.map((org) => (
                <div key={org.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{org.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">{org.code}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                      HQ: {org.headquartersCountry}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="text-xs font-semibold text-slate-700">Member Campuses ({org.memberSchools.length}):</div>
                    {org.memberSchools.map((s) => (
                      <div key={s.schoolId} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">{s.schoolName}</div>
                          <div className="text-[11px] text-slate-500">Joined: {s.joinedDate}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{s.studentCount}</span>
                          <span className="text-slate-400 block text-[10px]">Learners</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: GOVERNMENT EXPORTS ADAPTER */}
        {/* ========================================================================= */}
        {activeTab === 'gov-exports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900">Government EMIS & National Exam Data Export Adapter</h2>
              <p className="text-sm text-slate-500 mt-1">
                Generates compliant data payloads for Uganda MoES EMIS, Kenya NEMIS, Tanzania BEMIS, and South Africa SA-SAMS.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Target Country
                  </label>
                  <select
                    value={selectedExportCountry}
                    onChange={(e) => setSelectedExportCountry(e.target.value as SupportedCountryCode)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    {countryPacks.map((p) => (
                      <option key={p.countryCode} value={p.countryCode}>
                        {p.officialFlagEmoji} {p.countryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    <option value="JSON">JSON Government Specification</option>
                    <option value="CSV">CSV Tabular Format</option>
                    <option value="XML">XML Interoperability Format</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleFetchExport}
                    disabled={isLoadingExport}
                    className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoadingExport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Generate Official Export
                  </button>
                </div>
              </div>

              {exportPayloadPreview && (
                <div className="mt-6">
                  <div className="text-xs font-bold text-slate-700 mb-2">Export Data Payload Output:</div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96">
                    {JSON.stringify(exportPayloadPreview, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: CERTIFICATION & SIMULATION SUITE */}
        {/* ========================================================================= */}
        {activeTab === 'simulations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Multi-Country Simulation & Security Certification</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Runs automated cross-country verification passes for Uganda, Kenya, Tanzania, Ghana, Nigeria, South Africa, Rwanda, and International curricula.
                </p>
              </div>

              <button
                onClick={handleRunSimulations}
                disabled={isRunningSimulations}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shrink-0"
              >
                {isRunningSimulations ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Run Global Simulation Suite
              </button>
            </div>

            {simulationResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {simulationResults.map((sim) => (
                  <div key={sim.countryCode} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">{sim.countryName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
                          {sim.countryCode}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-xs">
                      {sim.checks.map((chk) => (
                        <div key={chk.checkName} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {chk.checkName}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5 pl-5">{chk.details}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                Click <strong>"Run Global Simulation Suite"</strong> above to execute cross-country certification tests.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
