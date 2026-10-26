import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  Wifi,
  WifiOff,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  CheckCircle,
  Menu,
  BookOpen,
  QrCode,
  Building2,
  HelpCircle,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';
import { EnvironmentModeBadge } from '../common/EnvironmentModeBadge';
import { MultiSchoolSwitcher } from '../common/MultiSchoolSwitcher';
import { CommandPaletteModal } from '../common/CommandPaletteModal';
import { SchoolSoulMarkSVG } from '../common/SchoolSoulLogo';
import { UniversalQRScannerModal } from '../common/UniversalQRScannerModal';
import { SchoolQRCodeModal } from '../common/SchoolQRCodeModal';
import { OnboardingGuideModal } from '../common/OnboardingGuideModal';
import { HelpDrawerModal } from '../common/HelpDrawerModal';
import { SyncCenterModal } from '../common/SyncCenterModal';
import { PWAInstallButton } from '../common/PWAInstallBanner';

interface NavbarProps {
  onToggleSidebarMobile: () => void;
  activeView: string;
  onNavigate?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebarMobile, activeView, onNavigate }) => {
  const { user, activeRole, setActiveRole, schoolProfile, roles, logout } = useAuth();
  const { isOnline, pendingQueueCount, triggerSyncNow } = useSync();
  const { theme, toggleTheme } = useTheme();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSchoolQROpen, setIsSchoolQROpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  // Evaluate if first login for onboarding prompt
  useEffect(() => {
    if (user && activeRole) {
      const key = `schoolsoul_onboarded_${user.id}_${activeRole}`;
      const dismissed = localStorage.getItem(key);
      if (!dismissed) {
        setIsOnboardingOpen(true);
      }
    }
  }, [user, activeRole]);

  const handleDismissOnboarding = () => {
    if (user && activeRole) {
      localStorage.setItem(`schoolsoul_onboarded_${user.id}_${activeRole}`, 'true');
    }
    setIsOnboardingOpen(false);
  };

  return (
    <header id="app-top-navbar" className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5">
        {/* Left Section: Mobile Toggle, Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebarMobile}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          {schoolProfile?.schoolLogo && !logoLoadError ? (
            <img
              src={schoolProfile.schoolLogo}
              alt={schoolProfile.schoolName || 'School Logo'}
              onError={() => setLogoLoadError(true)}
              className="w-8 h-8 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 p-0.5 flex items-center justify-center shadow-2xs shrink-0">
              <SchoolSoulMarkSVG size={22} idPrefix="ss-nav-top" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
                {schoolProfile?.schoolName || 'SchoolSoul OS'}
              </span>
              {schoolProfile?.academicTerm && (
                <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400">
                  · {schoolProfile.academicTerm} {schoolProfile.academicYear}
                </span>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 capitalize truncate leading-tight">
              {activeView.replace(/-/g, ' ')}
            </h1>
          </div>
        </div>

        {/* Center Section: Global Search Bar & Command Palette */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <CommandPaletteModal />
        </div>

        {/* Right Section: Status, Theme, Help, Notifs & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Multi-School & Country Framework Switcher */}
          <MultiSchoolSwitcher />

          {/* Environment Mode Switcher */}
          <div className="hidden xl:block">
            <EnvironmentModeBadge />
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton className="hidden md:inline-flex" />

          {/* Connectivity Status Indicator & Sync Center Trigger */}
          <button
            id="navbar-sync-trigger-btn"
            onClick={() => setIsSyncCenterOpen(true)}
            title={isOnline ? 'Connected to Server — Click to open Sync Center' : 'Offline Mode — Local storage active. Click to open Sync Center'}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[38px] ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80'
                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            {pendingQueueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-md bg-amber-500 text-white font-bold text-[10px]">
                {pendingQueueCount}
              </span>
            )}
          </button>

          {/* Quick Universal QR Scanner Button */}
          <button
            id="navbar-open-qr-scanner-btn"
            onClick={() => setIsScannerOpen(true)}
            title="Scan Student QR Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer min-h-[38px]"
          >
            <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">Scan QR</span>
          </button>

          {/* Help & Quick Guides Button */}
          <button
            id="navbar-help-drawer-btn"
            onClick={() => setIsHelpDrawerOpen(true)}
            title="Help, Guides & Keyboard Shortcuts"
            aria-label="Open Help and Guides"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-700" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notif-dropdown-btn"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              aria-label="View notifications"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-40 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                  <Badge variant="primary" size="sm">System Active</Badge>
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">SchoolSoul OS Operational</p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">IndexedDB storage verified with background sync queue.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Offline Protection Enabled</p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">All student records & admin actions persist without internet.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              id="role-switcher-dropdown-btn"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Role: <strong className="text-slate-900 dark:text-white">{activeRole}</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-40 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role Preview
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setActiveRole(r.name);
                        setShowRoleSwitcher(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                        activeRole === r.name ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{r.name}</span>
                      {activeRole === r.name && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              id="user-profile-dropdown-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <div className="hidden xl:block text-left pr-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{activeRole}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-40 animate-fade-in">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">@{user?.username}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-blue-600" />
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{activeRole}</span>
                  </div>
                </div>

                <div className="space-y-0.5 text-xs text-slate-700 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setIsOnboardingOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Workspace Onboarding Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onNavigate) onNavigate('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>Profile & Account Settings</span>
                  </button>

                  <button
                    id="navbar-user-guide-btn"
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onNavigate) onNavigate('user-guide');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-left font-medium cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Official User Guide</span>
                  </button>

                  <button
                    id="navbar-logout-btn"
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Navbar QR Scanner Modal */}
      <UniversalQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectStudent={(studentId) => {
          if (onNavigate) onNavigate('student-detail');
        }}
      />

      {/* Global Navbar School QR Modal */}
      <SchoolQRCodeModal
        isOpen={isSchoolQROpen}
        onClose={() => setIsSchoolQROpen(false)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Role-Based Onboarding Guide Modal */}
      <OnboardingGuideModal
        isOpen={isOnboardingOpen}
        onClose={handleDismissOnboarding}
        role={activeRole}
        userName={user?.fullName}
        onNavigate={(view) => {
          if (onNavigate) onNavigate(view);
        }}
      />

      {/* Quick Help & Shortcuts Drawer */}
      <HelpDrawerModal
        isOpen={isHelpDrawerOpen}
        onClose={() => setIsHelpDrawerOpen(false)}
        onReplayOnboarding={() => setIsOnboardingOpen(true)}
        onNavigate={(view) => {
          if (onNavigate) onNavigate(view);
        }}
      />

      {/* Sync & Offline Resilience Center Modal */}
      <SyncCenterModal
        isOpen={isSyncCenterOpen}
        onClose={() => setIsSyncCenterOpen(false)}
      />
    </header>
  );
};
