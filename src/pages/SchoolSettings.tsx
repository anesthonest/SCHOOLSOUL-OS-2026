import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Calendar,
  Shield,
  Palette,
  MessageSquare,
  Save,
  CheckCircle2,
  Sparkles,
  Globe2,
  Lock,
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { db } from '../db/indexedDB';
import { logAuditEvent, isServerOnline, API_BASE, getAuthHeaders } from '../services/api';
import { SchoolLogoUploader } from '../components/common/SchoolLogoUploader';
import { CountryMigrationModal } from '../components/modals/CountryMigrationModal';
import { GlobalCountriesService } from '../framework/globalCountries';
import { CountryFrameworkRegistry } from '../framework/countryRegistry';
import { SupportedCountryCode } from '../framework/types';

export const SchoolSettings: React.FC = () => {
  const { schoolProfile, user, refreshSchoolProfile } = useAuth();
  const { setHasUnsavedChanges } = useNavigation();

  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'country' | 'security' | 'branding' | 'notifications'>('profile');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [brandingLogo, setBrandingLogo] = useState<string | undefined>(schoolProfile?.schoolLogo);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  // School Profile Form State
  const [profileForm, setProfileForm] = useState({
    schoolName: schoolProfile?.schoolName || '',
    schoolMotto: schoolProfile?.schoolMotto || '',
    registrationNumber: schoolProfile?.registrationNumber || '',
    physicalAddress: schoolProfile?.physicalAddress || '',
    district: schoolProfile?.district || '',
    region: schoolProfile?.region || '',
    telephone: schoolProfile?.telephone || '',
    email: schoolProfile?.email || '',
    website: schoolProfile?.website || '',
  });

  // Academic Period State
  const [academicForm, setAcademicForm] = useState({
    academicYear: schoolProfile?.academicYear || '2026',
    academicTerm: schoolProfile?.academicTerm || 'Term I',
  });

  // Security Policy State
  const [securityForm, setSecurityForm] = useState({
    inactivityTimeoutMinutes: 15,
    maxFailedLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    requireStrongPassword: true,
  });

  // Notifications Provider State
  const [notifForm, setNotifForm] = useState({
    inApp: true,
    smsEnabled: false,
    smsApiKey: '',
    emailEnabled: false,
    smtpHost: '',
    whatsAppEnabled: false,
    whatsAppApiKey: '',
  });

  const updateProfileField = (field: string, value: any) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true, {
      message: 'You have modified School Settings without saving. Leaving will discard these changes.',
      onSave: async () => {
        if (!schoolProfile) return true;
        const updated = {
          ...schoolProfile,
          ...profileForm,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };
        await db.schoolProfile.put(updated as any);
        await refreshSchoolProfile();
        setHasUnsavedChanges(false);
        return true;
      },
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!schoolProfile) return;
      const updated = {
        ...schoolProfile,
        ...profileForm,
        updatedAt: new Date().toISOString(),
      };

      await db.schoolProfile.put(updated);

      if (await isServerOnline()) {
        await fetch(`${API_BASE}/school/profile`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(profileForm),
        });
      }

      await logAuditEvent(
        user?.id || 'admin',
        user?.username || 'Admin',
        user?.role || 'Administrator',
        'SETTINGS_UPDATE',
        'Updated School Profile settings'
      );

      await refreshSchoolProfile();
      setHasUnsavedChanges(false);
      setSaveError('');
      setSaveSuccess('School Profile updated successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError('Failed to save profile: ' + (err.message || 'Unknown error'));
      setTimeout(() => setSaveError(''), 4000);
    }
  };

  const handleSaveAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!schoolProfile) return;
      const updated = {
        ...schoolProfile,
        ...academicForm,
        updatedAt: new Date().toISOString(),
      };

      await db.schoolProfile.put(updated as any);

      if (await isServerOnline()) {
        await fetch(`${API_BASE}/school/profile`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(academicForm),
        });
      }

      await logAuditEvent(
        user?.id || 'admin',
        user?.username || 'Admin',
        user?.role || 'Administrator',
        'SETTINGS_UPDATE',
        `Academic period set to ${academicForm.academicTerm} ${academicForm.academicYear}`
      );

      await refreshSchoolProfile();
      setSaveError('');
      setSaveSuccess('Academic year and term updated.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError('Failed to save calendar: ' + (err.message || 'Unknown error'));
      setTimeout(() => setSaveError(''), 4000);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!schoolProfile) return;
      const updated = {
        ...schoolProfile,
        schoolLogo: brandingLogo || '',
        updatedAt: new Date().toISOString(),
      };

      await db.schoolProfile.put(updated as any);

      if (await isServerOnline()) {
        await fetch(`${API_BASE}/school/profile`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ schoolLogo: brandingLogo || '' }),
        });
      }

      await logAuditEvent(
        user?.id || 'admin',
        user?.username || 'Admin',
        user?.role || 'Administrator',
        'SETTINGS_UPDATE',
        'Updated official School Logo & Branding settings'
      );

      await refreshSchoolProfile();
      setSaveError('');
      setSaveSuccess('Official School Logo & Branding updated successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError('Failed to save branding: ' + (err.message || 'Unknown error'));
      setTimeout(() => setSaveError(''), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          School & System Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure school identity, official logo & branding, academic calendar, security parameters, and notification channels.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 text-xs text-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 text-xs text-rose-800 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold gap-2">
        <button
          id="tab-profile-btn"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          School Profile
        </button>

        <button
          id="tab-branding-btn"
          onClick={() => setActiveTab('branding')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'branding'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          Branding & Logo
        </button>

        <button
          id="tab-country-btn"
          onClick={() => setActiveTab('country')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'country'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          Country & Framework
        </button>

        <button
          id="tab-academic-btn"
          onClick={() => setActiveTab('academic')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'academic'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Academic Calendar
        </button>

        <button
          id="tab-security-btn"
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security Policies
        </button>

        <button
          id="tab-notifications-btn"
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Notification Providers
        </button>
      </div>

      {/* TAB CONTENT: School Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">School Name</label>
              <input
                type="text"
                value={profileForm.schoolName}
                onChange={(e) => updateProfileField('schoolName', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">School Motto</label>
              <input
                type="text"
                value={profileForm.schoolMotto}
                onChange={(e) => updateProfileField('schoolMotto', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registration / EMIS Number</label>
              <input
                type="text"
                value={profileForm.registrationNumber}
                onChange={(e) => updateProfileField('registrationNumber', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
              <input
                type="text"
                value={profileForm.district}
                onChange={(e) => updateProfileField('district', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Address</label>
              <input
                type="text"
                value={profileForm.physicalAddress}
                onChange={(e) => setProfileForm({ ...profileForm, physicalAddress: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
              <input
                type="text"
                value={profileForm.telephone}
                onChange={(e) => setProfileForm({ ...profileForm, telephone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="save-school-profile-btn"
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: School Branding & Logo */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs max-w-4xl">
          <SchoolLogoUploader
            currentLogo={brandingLogo}
            schoolName={schoolProfile?.schoolName}
            schoolMotto={schoolProfile?.schoolMotto}
            registrationNumber={schoolProfile?.registrationNumber}
            academicTerm={schoolProfile?.academicTerm}
            academicYear={schoolProfile?.academicYear}
            onChange={(logoBase64) => setBrandingLogo(logoBase64)}
            showPreview={true}
          />

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              id="save-school-branding-btn"
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Branding Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: Academic Calendar */}
      {activeTab === 'academic' && (
        <form onSubmit={handleSaveAcademic} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs max-w-lg">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicForm.academicYear}
              onChange={(e) => setAcademicForm({ ...academicForm, academicYear: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Term</label>
            <select
              value={academicForm.academicTerm}
              onChange={(e) => setAcademicForm({ ...academicForm, academicTerm: e.target.value as any })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            >
              <option value="Term I">Term I</option>
              <option value="Term II">Term II</option>
              <option value="Term III">Term III</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="save-academic-period-btn"
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Term Period
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: Country & Framework */}
      {activeTab === 'country' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-3xl">
                {GlobalCountriesService.getCountryByCode(schoolProfile?.countryCode || 'UG').flagEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {schoolProfile?.country || 'Uganda'}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                    {schoolProfile?.countryCode || 'UG'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    <Lock className="w-3 h-3" />
                    Locked & Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  National Authority: {CountryFrameworkRegistry.getCountryPack((schoolProfile?.countryCode || 'UG') as SupportedCountryCode).nationalEducationAuthority}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="open-country-migration-btn"
              onClick={() => setIsMigrationModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Relocate School / Migrate Country
            </button>
          </div>

          {/* Framework Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 text-[11px] uppercase font-semibold">Active Currency</span>
              <p className="text-base font-bold text-slate-900 dark:text-white font-mono">
                {schoolProfile?.currency || 'UGX'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Primary financial ledger currency
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 text-[11px] uppercase font-semibold">School Timezone</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
                {schoolProfile?.timeZone || 'Africa/Kampala'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Attendance & timestamp sync
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 text-[11px] uppercase font-semibold">Operating Language</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {schoolProfile?.preferredLanguage || 'English'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Report card & UI localization
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Country-First Tenant Protection Notice
              </p>
              <p className="text-[11px] leading-relaxed">
                School country identity is protected to guarantee student marks and fee records are not disrupted.
                If this school is opening a new campus or relocating across borders, please use the Relocation & Migration workflow to preserve historical record fidelity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Country Relocation & Migration Modal */}
      <CountryMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        currentCountryCode={schoolProfile?.countryCode || 'UG'}
        onMigrationComplete={() => {
          setSaveSuccess('School country framework successfully migrated.');
          setTimeout(() => setSaveSuccess(''), 4000);
        }}
      />

      {/* TAB CONTENT: Security Policies */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs max-w-lg">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Inactivity Lockout Timeout (Minutes)
            </label>
            <input
              type="number"
              value={securityForm.inactivityTimeoutMinutes}
              onChange={(e) => setSecurityForm({ ...securityForm, inactivityTimeoutMinutes: parseInt(e.target.value) || 15 })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Max Failed Login Attempts before Lockout
            </label>
            <input
              type="number"
              value={securityForm.maxFailedLoginAttempts}
              onChange={(e) => setSecurityForm({ ...securityForm, maxFailedLoginAttempts: parseInt(e.target.value) || 5 })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-200">
            <p className="font-bold mb-1">Active Password Hashing Algorithm:</p>
            <p>Bcrypt JS 10-round salt & JWT RSA secret signature active.</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Notification Channels */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs max-w-xl">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">In-App Notification Engine</p>
              <p className="text-slate-500 text-[11px]">Always active in local IndexedDB storage.</p>
            </div>
            <span className="text-emerald-600 font-bold">ENABLED</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">SMS Gateway Abstraction</p>
              <p className="text-slate-500 text-[11px]">Africa's Talking / Twilio interface ready for API keys.</p>
            </div>
            <span className="text-slate-400 font-medium">READY</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">WhatsApp Business Cloud API</p>
              <p className="text-slate-500 text-[11px]">Meta webhook & API provider abstraction.</p>
            </div>
            <span className="text-slate-400 font-medium">READY</span>
          </div>
        </div>
      )}
    </div>
  );
};
