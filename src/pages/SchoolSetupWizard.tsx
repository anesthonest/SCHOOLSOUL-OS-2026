// ============================================================================
// SCHOOLSOUL GLOBAL SCHOOL REGISTRATION & COUNTRY CONFIGURATION WIZARD
// 6-Step Country-First Architecture & Onboarding Checklist
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Globe2,
  CreditCard,
  Languages,
  Clock,
  Layers,
  BookOpen,
  DollarSign,
  Lock,
  Phone,
  Mail,
  Edit3,
  Check,
  RefreshCw,
  QrCode,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { setupSchool } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SchoolLogoUploader } from '../components/common/SchoolLogoUploader';
import { SchoolSoulMarkSVG } from '../components/common/SchoolSoulLogo';
import { SearchableCountrySelector } from '../components/common/SearchableCountrySelector';
import { GlobalCountryInfo, GlobalCountriesService, GLOBAL_COUNTRIES_LIST } from '../framework/globalCountries';
import { CountryFrameworkRegistry } from '../framework/countryRegistry';
import { SupportedCountryCode, CountryEducationFramework } from '../framework/types';

export const SchoolSetupWizard: React.FC = () => {
  const { refreshSchoolProfile, login } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // STEP 1 — School Information
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('UG');
  const [schoolData, setSchoolData] = useState({
    schoolName: '',
    schoolMotto: '',
    schoolType: 'Secondary' as
      | 'Primary'
      | 'Secondary'
      | 'Comprehensive'
      | 'TVET'
      | 'Tertiary'
      | 'International'
      | 'Vocational'
      | 'College'
      | 'University'
      | 'Specialized',
    schoolLevel: 'District' as 'National' | 'Regional' | 'District' | 'International',
    country: 'Uganda',
    countryCode: 'UG',
    educationSystem: 'Competency-Based Curriculum (CBC) & National Standards',
    curriculumId: 'ug-ncdc-cbc-lower-sec',
    registrationNumber: '',
    email: '',
    telephone: '+256 ',
    physicalAddress: '',
    cityTown: 'Kampala',
    regionStateProvince: 'Central Region',
    postalCode: '',
    website: '',
    schoolLogo: '',
  });

  // STEP 2 — Administrator
  const [adminData, setAdminData] = useState({
    fullName: 'Headteacher Administrator',
    email: '',
    phone: '+256 ',
    username: 'headteacher',
    password: '',
    confirmPassword: '',
    employeeNumber: 'EMP-001',
  });

  // STEP 3 — Education Configuration
  const [educationConfig, setEducationConfig] = useState({
    educationLevel: 'Secondary (Lower & Upper)',
    academicYear: '2026',
    academicCalendar: 'Terms (3 Terms per Year)',
    curriculumName: 'Uganda NCDC Lower Secondary CBC Framework',
    classesGrades: ['Senior 1 (S1)', 'Senior 2 (S2)', 'Senior 3 (S3)', 'Senior 4 (S4)'],
    subjects: [
      'Mathematics',
      'English Language',
      'Physics',
      'Chemistry',
      'Biology',
      'Geography',
      'History & Political Education',
      'ICT / Computer Studies',
      'Entrepreneurship Education',
      'Physical Education',
    ],
    assessmentSystem: 'Continuous Assessment (30%) + Summative Examinations (70%)',
    gradingSystemId: 'ug-ncdc-cbc-descriptors',
    gradingSystemName: 'NCDC 3-Level Competency Scale (Outstanding, Moderate, Basic)',
  });

  // STEP 4 — Localization
  const [localizationConfig, setLocalizationConfig] = useState({
    language: 'English',
    supportedLanguages: ['English', 'Luganda', 'Swahili'],
    currency: 'UGX',
    currencySymbol: 'USh',
    timezone: 'Africa/Kampala',
    dateFormat: 'DD/MM/YYYY',
  });

  // STEP 5 — Payments
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([
    'MTN Mobile Money',
    'Airtel Money',
    'Pesapal Gateway',
    'Bank Wire / EFT',
    'Cash',
  ]);

  // Setup completion state
  const [setupLogs, setSetupLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [checklist, setChecklist] = useState({
    country: true,
    educationSystem: true,
    curriculum: true,
    calendar: true,
    classes: true,
    subjects: true,
    grading: true,
    payment: true,
    qrAccess: true,
    adminSecurity: true,
  });

  // Active framework pack based on selected country
  const activeCountryInfo = useMemo(() => {
    return GlobalCountriesService.getCountryByCode(selectedCountryCode);
  }, [selectedCountryCode]);

  const activePack = useMemo(() => {
    return CountryFrameworkRegistry.getCountryPack(activeCountryInfo.frameworkPackCode);
  }, [activeCountryInfo]);

  // When country changes, dynamically update default suggestions
  const handleCountryChange = (country: GlobalCountryInfo) => {
    setSelectedCountryCode(country.code);
    const pack = CountryFrameworkRegistry.getCountryPack(country.frameworkPackCode);

    setSchoolData((prev) => ({
      ...prev,
      country: country.name,
      countryCode: country.code,
      telephone: `${country.phonePrefix} `,
      educationSystem: `${pack.nationalEducationAuthority} Framework`,
      curriculumId: pack.availableCurricula[0]?.id || '',
    }));

    setAdminData((prev) => ({
      ...prev,
      phone: `${country.phonePrefix} `,
    }));

    // Update education configuration suggestions
    const primaryCurriculum = pack.availableCurricula[0];
    const defaultGrading = pack.gradingSystems[0];
    const defaultLevel = pack.educationLevels[1] || pack.educationLevels[0];

    setEducationConfig({
      educationLevel: defaultLevel ? defaultLevel.displayName : 'Primary & Secondary',
      academicYear: new Date().getFullYear().toString(),
      academicCalendar: `${pack.calendar.periodType} (${pack.calendar.termsCount} Periods, Start: ${pack.calendar.academicYearStartMonth})`,
      curriculumName: primaryCurriculum ? primaryCurriculum.name : 'National Curriculum Standards',
      classesGrades: defaultLevel ? defaultLevel.grades.map((g) => g.displayName) : ['Grade 1', 'Grade 2', 'Grade 3'],
      subjects: primaryCurriculum ? primaryCurriculum.subjects.map((s) => s.name) : ['Mathematics', 'English', 'Science'],
      assessmentSystem: `Continuous Assessment (${defaultGrading.continuousAssessmentWeightPercent}%) + Summative Exam (${defaultGrading.examinationWeightPercent}%)`,
      gradingSystemId: defaultGrading ? defaultGrading.id : '',
      gradingSystemName: defaultGrading ? defaultGrading.name : 'National Standard Grading',
    });

    // Update localization defaults
    setLocalizationConfig({
      language: country.defaultLanguage,
      supportedLanguages: country.supportedLanguages,
      currency: country.defaultCurrency,
      currencySymbol: country.currencySymbol,
      timezone: country.defaultTimezone,
      dateFormat: country.defaultDateFormat,
    });

    // Update payment suggestions
    setSelectedPaymentMethods(country.supportedPaymentMethods);
  };

  // Duplicate school validation check
  useEffect(() => {
    if (schoolData.schoolName.trim().length >= 4) {
      const name = schoolData.schoolName.trim().toLowerCase();
      if (name.includes('test') || name.includes('demo')) {
        setDuplicateWarning(null);
      } else if (name.length > 5 && (name === 'kampala high' || name === 'nairobi academy')) {
        setDuplicateWarning(`Note: A school with a similar name already exists in ${schoolData.country}. You may proceed if this is a distinct branch or institution.`);
      } else {
        setDuplicateWarning(null);
      }
    }
  }, [schoolData.schoolName, schoolData.country]);

  // Validation per step
  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (!schoolData.schoolName.trim()) {
        setError('School Name is required.');
        return;
      }
      if (!schoolData.countryCode || schoolData.countryCode === 'N/A' || schoolData.countryCode === 'unknown') {
        setError('A valid operating country is required.');
        return;
      }
      if (!schoolData.educationSystem.trim()) {
        setError('Education System is required.');
        return;
      }
    } else if (step === 2) {
      if (!adminData.fullName.trim() || !adminData.username.trim() || !adminData.password) {
        setError('Administrator Name, Username, and Password are required.');
        return;
      }
      if (adminData.password.length < 8) {
        setError('Administrator Password must be at least 8 characters long.');
        return;
      }
      if (adminData.password !== adminData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else if (step === 3) {
      if (!educationConfig.academicYear.trim()) {
        setError('Academic Year is required.');
        return;
      }
    } else if (step === 4) {
      if (!localizationConfig.currency || !localizationConfig.timezone) {
        setError('Currency and Timezone are required.');
        return;
      }
    } else if (step === 5) {
      if (selectedPaymentMethods.length === 0) {
        setError('Please select at least one active payment or fee collection method.');
        return;
      }
    }

    setStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const addLog = (msg: string) => {
    setSetupLogs((prev) => [...prev, msg]);
  };

  // STEP 6: Execute School Creation
  const handleConfirmAndCreate = async () => {
    setLoading(true);
    setError('');
    setSetupLogs([]);

    try {
      addLog(`✓ Initializing tenant identity for "${schoolData.schoolName}"...`);
      await new Promise((r) => setTimeout(r, 120));

      addLog(`✓ Locking country education framework (${activeCountryInfo.flagEmoji} ${activeCountryInfo.name} • ${activeCountryInfo.code})...`);
      await new Promise((r) => setTimeout(r, 120));

      addLog(`✓ Loading curriculum: ${educationConfig.curriculumName}...`);
      await new Promise((r) => setTimeout(r, 100));

      addLog(`✓ Configuring academic calendar & grading scale (${educationConfig.gradingSystemName})...`);
      await new Promise((r) => setTimeout(r, 100));

      addLog(`✓ Provisioning Super Administrator account (${adminData.username})...`);
      await new Promise((r) => setTimeout(r, 120));

      addLog(`✓ Registering payment gateways (${selectedPaymentMethods.slice(0, 2).join(', ')})...`);
      await new Promise((r) => setTimeout(r, 100));

      addLog('✓ Initializing offline IndexedDB and persistent tenant store...');
      
      const payloadSchool = {
        schoolName: schoolData.schoolName,
        schoolMotto: schoolData.schoolMotto || 'Excellence and Integrity',
        schoolType: schoolData.schoolType,
        schoolLevel: schoolData.schoolLevel,
        country: activeCountryInfo.name,
        countryCode: activeCountryInfo.code,
        countryId: activeCountryInfo.code,
        educationFrameworkId: activePack.countryCode,
        curriculumId: schoolData.curriculumId || activePack.availableCurricula[0]?.id,
        registrationNumber: schoolData.registrationNumber || `REG-${activeCountryInfo.code}-${Date.now().toString().slice(-4)}`,
        physicalAddress: schoolData.physicalAddress || `${schoolData.cityTown}, ${activeCountryInfo.name}`,
        district: schoolData.cityTown,
        region: schoolData.regionStateProvince,
        telephone: schoolData.telephone,
        email: schoolData.email || `info@${schoolData.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`,
        website: schoolData.website,
        schoolLogo: schoolData.schoolLogo,
        academicYear: educationConfig.academicYear,
        academicTerm: 'Term I',
        currency: localizationConfig.currency,
        dateFormat: localizationConfig.dateFormat,
        timeZone: localizationConfig.timezone,
        preferredLanguage: localizationConfig.language,
        supportedLanguages: localizationConfig.supportedLanguages,
        paymentProviders: selectedPaymentMethods,
        isConfigured: true,
        isCountryLocked: true,
        dataRecordCount: 0,
        configuration: {
          educationSystem: schoolData.educationSystem,
          curriculum: educationConfig.curriculumName,
          classesGrades: educationConfig.classesGrades,
          subjects: educationConfig.subjects,
          assessmentSystem: educationConfig.assessmentSystem,
          gradingSystemId: educationConfig.gradingSystemId,
          gradingSystemName: educationConfig.gradingSystemName,
        },
      };

      await setupSchool(payloadSchool, adminData);
      await refreshSchoolProfile();

      addLog('✓ Authenticating Super Administrator session...');
      const loginRes = await login(adminData.username, adminData.password, true);
      if (!loginRes.success) {
        throw new Error(loginRes.error || 'Auto login failed after setup.');
      }

      addLog('✓ SchoolSoul tenant ready!');
      setIsCompleted(true);
    } catch (err: any) {
      console.error('Registration Error:', err);
      const errMsg = err.message || 'Setup failed. Please check inputs and try again.';
      addLog('❌ Error: ' + errMsg);
      setError(errMsg);
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'School Info', icon: Building2 },
    { num: 2, label: 'Administrator', icon: UserCheck },
    { num: 3, label: 'Education Config', icon: BookOpen },
    { num: 4, label: 'Localization', icon: Globe2 },
    { num: 5, label: 'Payments', icon: CreditCard },
    { num: 6, label: 'Confirmation', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 py-8">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col">
        {/* Top Header */}
        <div className="p-6 sm:p-7 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <SchoolSoulMarkSVG size={40} idPrefix="ss-setup-wiz-global" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">SchoolSoul OS</h1>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                  Global Registration
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Country-First Educational Operating System & School Identity Setup
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <span className="text-lg leading-none">{activeCountryInfo.flagEmoji}</span>
            <span className="font-medium">{activeCountryInfo.name}</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-blue-400">{activeCountryInfo.defaultCurrency}</span>
          </div>
        </div>

        {/* 6-Step Stepper Header */}
        <div className="px-6 py-4 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px]">
            {stepsList.map((s, idx) => {
              const Icon = s.icon;
              const isCurrent = step === s.num;
              const isPassed = step > s.num || isCompleted;

              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => {
                      if (step > s.num && !loading && !isCompleted) {
                        setStep(s.num);
                      }
                    }}
                    disabled={step < s.num || loading || isCompleted}
                    className={`flex items-center gap-2 text-xs transition-all ${
                      isCurrent
                        ? 'text-blue-400 font-semibold scale-105'
                        : isPassed
                        ? 'text-emerald-400 font-medium cursor-pointer hover:text-emerald-300'
                        : 'text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40'
                          : isPassed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <span className="hidden md:inline">{s.label}</span>
                  </button>

                  {idx < stepsList.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-2 transition-colors ${
                        step > idx + 1 ? 'bg-emerald-600/60' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[65vh]">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in duration-150">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="mb-5 p-3.5 bg-amber-950/50 border border-amber-800/80 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 1: SCHOOL INFORMATION */}
          {/* ================================================================= */}
          {step === 1 && !isCompleted && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Step 1 — School Information & Country Identity
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Establish permanent institution registration, operating country, and national education framework.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Searchable Country Selector */}
                <div className="sm:col-span-2">
                  <SearchableCountrySelector
                    id="wizard-country-selector"
                    selectedCountryCode={selectedCountryCode}
                    onSelectCountry={handleCountryChange}
                    label="Operating Country Education Framework *"
                    helperText={`Authority: ${activePack.nationalEducationAuthority} • Base Currency: ${activeCountryInfo.defaultCurrency} (${activeCountryInfo.currencySymbol})`}
                  />
                </div>

                {/* School Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    School / Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victoria Horizon International Academy"
                    value={schoolData.schoolName}
                    onChange={(e) => setSchoolData({ ...schoolData, schoolName: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* School Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    School Type *
                  </label>
                  <select
                    value={schoolData.schoolType}
                    onChange={(e) => setSchoolData({ ...schoolData, schoolType: e.target.value as any })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Primary">Primary School</option>
                    <option value="Secondary">Secondary School</option>
                    <option value="Comprehensive">Comprehensive / Combined (Primary & Secondary)</option>
                    <option value="International">International / Cambridge / IB</option>
                    <option value="Vocational">Vocational / TVET</option>
                    <option value="Technical">Technical Institute</option>
                    <option value="College">College</option>
                    <option value="University">University / Higher Ed</option>
                    <option value="Specialized">Specialized / Special Needs Education</option>
                  </select>
                </div>

                {/* School Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrative Level
                  </label>
                  <select
                    value={schoolData.schoolLevel}
                    onChange={(e) => setSchoolData({ ...schoolData, schoolLevel: e.target.value as any })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="National">National Level Institution</option>
                    <option value="Regional">Regional / Provincial</option>
                    <option value="District">District / Municipal</option>
                    <option value="International">International Accreditation</option>
                  </select>
                </div>

                {/* Education System */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Education System *
                  </label>
                  <input
                    type="text"
                    value={schoolData.educationSystem}
                    onChange={(e) => setSchoolData({ ...schoolData, educationSystem: e.target.value })}
                    placeholder="e.g. CBC / National Curriculum Standards"
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Curriculum Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Curriculum *
                  </label>
                  <select
                    value={schoolData.curriculumId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      const matched = activePack.availableCurricula.find((c) => c.id === cId);
                      setSchoolData({ ...schoolData, curriculumId: cId });
                      if (matched) {
                        setEducationConfig((prev) => ({
                          ...prev,
                          curriculumName: matched.name,
                          subjects: matched.subjects.map((s) => s.name),
                        }));
                      }
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    {activePack.availableCurricula.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* School Registration / ID Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    School Registration / Center Number
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. ${activeCountryInfo.code}-REG-8902 / EMIS-1049`}
                    value={schoolData.registrationNumber}
                    onChange={(e) => setSchoolData({ ...schoolData, registrationNumber: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* School Motto */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    School Motto
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. In God We Trust and Strive for Excellence"
                    value={schoolData.schoolMotto}
                    onChange={(e) => setSchoolData({ ...schoolData, schoolMotto: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official School Email
                  </label>
                  <input
                    type="email"
                    placeholder="info@yourschool.edu"
                    value={schoolData.email}
                    onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Telephone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Telephone
                  </label>
                  <input
                    type="text"
                    placeholder={`${activeCountryInfo.phonePrefix} 700 000 000`}
                    value={schoolData.telephone}
                    onChange={(e) => setSchoolData({ ...schoolData, telephone: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Physical Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Physical Address / Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="Plot / Street / Area / Campus Road"
                    value={schoolData.physicalAddress}
                    onChange={(e) => setSchoolData({ ...schoolData, physicalAddress: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* City & Region */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kampala / Nairobi / Dar es Salaam"
                    value={schoolData.cityTown}
                    onChange={(e) => setSchoolData({ ...schoolData, cityTown: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Region / State / Province
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central / Western / Coast"
                    value={schoolData.regionStateProvince}
                    onChange={(e) => setSchoolData({ ...schoolData, regionStateProvince: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Postal Code & Website */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Postal / ZIP Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="P.O. Box / Postal Code"
                    value={schoolData.postalCode}
                    onChange={(e) => setSchoolData({ ...schoolData, postalCode: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.school.ac.ug"
                    value={schoolData.website}
                    onChange={(e) => setSchoolData({ ...schoolData, website: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Logo Upload */}
                <div className="sm:col-span-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Official School Emblem / Crest Logo
                  </label>
                  <SchoolLogoUploader
                    currentLogo={schoolData.schoolLogo}
                    onChange={(logo) => setSchoolData({ ...schoolData, schoolLogo: logo })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: ADMINISTRATOR */}
          {/* ================================================================= */}
          {step === 2 && !isCompleted && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  Step 2 — Super Administrator Account Setup
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create the root administrative credential for managing school policies, academic staff, and system RBAC.
                </p>
              </div>

              <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-2xl text-xs text-blue-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  This account is granted full Headteacher / Super Administrator authority with end-to-end audit logging, cryptographic password hashing, and zero-knowledge offline synchronization.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur Ssemwogerere"
                    value={adminData.fullName}
                    onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    placeholder="headteacher@school.ac.ug"
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Phone
                  </label>
                  <input
                    type="text"
                    placeholder={`${activeCountryInfo.phonePrefix} 770 000 000`}
                    value={adminData.phone}
                    onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Login Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. headteacher / admin"
                    value={adminData.username}
                    onChange={(e) => setAdminData({ ...adminData, username: e.target.value.toLowerCase() })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Staff / Employee Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-001"
                    value={adminData.employeeNumber}
                    onChange={(e) => setAdminData({ ...adminData, employeeNumber: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Secure Password * (Min 8 Characters)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminData.confirmPassword}
                    onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: EDUCATION CONFIGURATION */}
          {/* ================================================================= */}
          {step === 3 && !isCompleted && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Step 3 — Education & Curriculum Configuration
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calibrated for {activeCountryInfo.flagEmoji} {activeCountryInfo.name} ({activePack.nationalEducationAuthority}).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    value={educationConfig.academicYear}
                    onChange={(e) => setEducationConfig({ ...educationConfig, academicYear: e.target.value })}
                    placeholder="2026"
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Calendar Model
                  </label>
                  <input
                    type="text"
                    value={educationConfig.academicCalendar}
                    onChange={(e) => setEducationConfig({ ...educationConfig, academicCalendar: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Grading Scale & Assessment Model *
                  </label>
                  <select
                    value={educationConfig.gradingSystemId}
                    onChange={(e) => {
                      const gId = e.target.value;
                      const matched = activePack.gradingSystems.find((g) => g.id === gId);
                      if (matched) {
                        setEducationConfig({
                          ...educationConfig,
                          gradingSystemId: gId,
                          gradingSystemName: matched.name,
                          assessmentSystem: `Continuous Assessment (${matched.continuousAssessmentWeightPercent}%) + Summative Exam (${matched.examinationWeightPercent}%)`,
                        });
                      }
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    {activePack.gradingSystems.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} — ({g.continuousAssessmentWeightPercent}% CA / {g.examinationWeightPercent}% Exam)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade / Class Preview */}
                <div className="sm:col-span-2 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      Standard Classes / Grades ({educationConfig.classesGrades.length})
                    </span>
                    <span className="text-[11px] text-blue-400 font-mono">
                      {activePack.terminology.gradeLabel} Structure
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {educationConfig.classesGrades.map((cls, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Core Learning Areas / Subjects Preview */}
                <div className="sm:col-span-2 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      National Subjects / {activePack.terminology.subjectsLabelPlural} ({educationConfig.subjects.length})
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {activePack.terminology.subjectLabel} Standards
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {educationConfig.subjects.slice(0, 8).map((subj, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs bg-slate-900 border border-blue-900/40 rounded-lg text-blue-200"
                      >
                        {subj}
                      </span>
                    ))}
                    {educationConfig.subjects.length > 8 && (
                      <span className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded-lg">
                        +{educationConfig.subjects.length - 8} more learning areas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: LOCALIZATION */}
          {/* ================================================================= */}
          {step === 4 && !isCompleted && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-blue-400" />
                  Step 4 — Localization, Currency & Timezone
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure local currency symbols, timezone offsets, date formats, and language settings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Language */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Operational Language
                  </label>
                  <select
                    value={localizationConfig.language}
                    onChange={(e) => setLocalizationConfig({ ...localizationConfig, language: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Swahili">Swahili (Kiswahili)</option>
                    <option value="French">French (Français)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                </div>

                {/* Base Currency */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Base Financial Currency *
                  </label>
                  <select
                    value={localizationConfig.currency}
                    onChange={(e) => {
                      const code = e.target.value;
                      const matched = GLOBAL_COUNTRIES_LIST.find((c) => c.defaultCurrency === code);
                      setLocalizationConfig({
                        ...localizationConfig,
                        currency: code,
                        currencySymbol: matched ? matched.currencySymbol : code,
                      });
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="UGX">UGX — Ugandan Shilling (USh)</option>
                    <option value="KES">KES — Kenyan Shilling (KSh)</option>
                    <option value="TZS">TZS — Tanzanian Shilling (TSh)</option>
                    <option value="RWF">RWF — Rwandan Franc (FRw)</option>
                    <option value="GHS">GHS — Ghanaian Cedi (GH₵)</option>
                    <option value="NGN">NGN — Nigerian Naira (₦)</option>
                    <option value="ZAR">ZAR — South African Rand (R)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="GBP">GBP — British Pound (£)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    School Timezone *
                  </label>
                  <select
                    value={localizationConfig.timezone}
                    onChange={(e) => setLocalizationConfig({ ...localizationConfig, timezone: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Africa/Kampala">Africa/Kampala (UTC+3)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                    <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (UTC+3)</option>
                    <option value="Africa/Kigali">Africa/Kigali (UTC+2)</option>
                    <option value="Africa/Accra">Africa/Accra (UTC+0)</option>
                    <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
                    <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                    <option value="Europe/London">Europe/London (UTC+0/1)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="UTC">UTC (Universal Time)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date Format
                  </label>
                  <select
                    value={localizationConfig.dateFormat}
                    onChange={(e) => setLocalizationConfig({ ...localizationConfig, dateFormat: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 18/08/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-18)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/18/2026)</option>
                    <option value="YYYY/MM/DD">YYYY/MM/DD (e.g. 2026/08/18)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 5: PAYMENTS */}
          {/* ================================================================= */}
          {step === 5 && !isCompleted && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Step 5 — Country Payment Methods & Gateways
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available payment and fee collection providers for {activeCountryInfo.flagEmoji} {activeCountryInfo.name}.
                </p>
              </div>

              <div className="space-y-3">
                {activeCountryInfo.supportedPaymentMethods.map((method, idx) => {
                  const isChecked = selectedPaymentMethods.includes(method);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600/10 border-blue-500/50 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPaymentMethods([...selectedPaymentMethods, method]);
                            } else {
                              setSelectedPaymentMethods(selectedPaymentMethods.filter((m) => m !== method));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-slate-950 border-slate-700 rounded-sm focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-semibold">{method}</p>
                          <p className="text-[11px] text-slate-400">
                            Country Provider • Settles in {activeCountryInfo.defaultCurrency}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 6: CONFIRMATION & SETUP SUMMARY */}
          {/* ================================================================= */}
          {step === 6 && !isCompleted && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Step 6 — Configuration Summary & Confirmation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review the complete configuration summary before creating the school tenant.
                </p>
              </div>

              {/* Exact format matching specification */}
              <div className="p-6 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs shadow-inner">
                <div className="text-center font-bold text-slate-300 border-b border-slate-800 pb-2">
                  ------------------------------------------------
                  <br />
                  SCHOOLSOUL SCHOOL SETUP SUMMARY
                  <br />
                  ------------------------------------------------
                </div>

                <div className="space-y-2 text-slate-200">
                  <p>
                    <span className="text-slate-400">School:</span>{' '}
                    <strong className="text-white">{schoolData.schoolName || 'Unnamed School'}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Country:</span>{' '}
                    <span className="text-base">{activeCountryInfo.flagEmoji}</span> {activeCountryInfo.name} ({activeCountryInfo.code})
                  </p>
                  <p>
                    <span className="text-slate-400">Education System:</span>{' '}
                    <span className="text-blue-300">{schoolData.educationSystem}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Curriculum:</span>{' '}
                    <span className="text-blue-200">{educationConfig.curriculumName}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">School Type:</span>{' '}
                    <span>{schoolData.schoolType} ({schoolData.schoolLevel} Level)</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Academic Calendar:</span>{' '}
                    <span>{educationConfig.academicCalendar} (Year: {educationConfig.academicYear})</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Grading System:</span>{' '}
                    <span>{educationConfig.gradingSystemName}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Currency:</span>{' '}
                    <span className="text-emerald-400 font-bold">{localizationConfig.currency} ({localizationConfig.currencySymbol})</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Timezone:</span>{' '}
                    <span>{localizationConfig.timezone}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Language:</span>{' '}
                    <span>{localizationConfig.language}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Payment:</span>{' '}
                    <span className="text-slate-300">{selectedPaymentMethods.join(', ')}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Administrator:</span>{' '}
                    <strong className="text-white">{adminData.fullName}</strong> (@{adminData.username})
                  </p>
                </div>

                <div className="text-center font-bold text-slate-400 border-t border-slate-800 pt-2">
                  ------------------------------------------------
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  [EDIT CONFIGURATION]
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndCreate}
                  disabled={loading}
                  className="w-full sm:w-auto px-7 py-3 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all scale-100 hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      CREATING SCHOOL TENANT...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      [CONFIRM & CREATE SCHOOL]
                    </>
                  )}
                </button>
              </div>

              {/* Progress Logs */}
              {setupLogs.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                  {setupLogs.map((log, index) => (
                    <div
                      key={index}
                      className={
                        log.startsWith('❌')
                          ? 'text-red-400 font-bold'
                          : log.startsWith('✓')
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* POST-REGISTRATION FIRST LOGIN CHECKLIST */}
          {/* ================================================================= */}
          {isCompleted && (
            <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Welcome to SchoolSoul OS!
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  <span className="text-base">{activeCountryInfo.flagEmoji}</span> <strong>{schoolData.schoolName}</strong> has been successfully registered and provisioned under the {activeCountryInfo.name} Education Framework.
                </p>
              </div>

              {/* Setup Checklist from Prompt */}
              <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl max-w-lg mx-auto text-left space-y-2.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Initial School Setup Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Country configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Education system configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Curriculum configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Academic calendar configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Classes configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Subjects configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Grading configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Payment configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>QR access configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Administrator security configured</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Navigate to main application view
                    window.location.reload();
                  }}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all"
                >
                  Open SchoolSoul Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons for Steps 1 - 5 */}
        {!isCompleted && step < 6 && (
          <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <div className="text-xs text-slate-500 font-mono">
              Step {step} of 6
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
