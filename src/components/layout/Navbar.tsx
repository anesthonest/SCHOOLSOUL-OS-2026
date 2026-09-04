import React, { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSchoolQROpen, setIsSchoolQROpen] = useState(false);

  return (
    <header id="app-top-navbar" className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left Section: Mobile Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebarMobile}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {schoolProfile?.schoolLogo ? (
            <img
              src={schoolProfile.schoolLogo}
              alt={schoolProfile.schoolName || 'Logo'}
              className="w-8 h-8 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 p-0.5 flex items-center justify-center shadow-xs shrink-0">
              <SchoolSoulMarkSVG size={24} idPrefix="ss-nav-top" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {schoolProfile?.schoolName || 'SchoolSoul OS V1'}
              </span>
              {schoolProfile?.academicTerm && (
                <Badge variant="primary" size="sm">
                  {schoolProfile.academicTerm} • {schoolProfile.academicYear}
                </Badge>
              )}
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">
              {activeView.replace('-', ' ')}
            </h1>
          </div>
        </div>

        {/* Center Section: Global Search Bar & Command Palette */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <CommandPaletteModal />
        </div>

        {/* Right Section: Status Pills, Theme, Notifs & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-School & Country Framework Switcher */}
          <MultiSchoolSwitcher />

          {/* Environment Mode Switcher */}
          <EnvironmentModeBadge />

          {/* Connectivity Pill */}
          <button
            id="navbar-sync-trigger-btn"
            onClick={triggerSyncNow}
            title={isOnline ? 'Online - Click to sync' : 'Offline - Saved locally'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            {pendingQueueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                {pendingQueueCount}
              </span>
            )}
          </button>

          {/* Quick Universal QR Scanner Button */}
          <button
            id="navbar-open-qr-scanner-btn"
            onClick={() => setIsScannerOpen(true)}
            title="Scan QR Code (Camera / Image / Manual)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 dark:border-blue-800 transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Scan QR</span>
          </button>

          {/* School QR Identity Button */}
          <button
            id="navbar-open-school-qr-btn"
            onClick={() => setIsSchoolQROpen(true)}
            title="School Official QR Identity"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>School QR</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notif-dropdown-btn"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-40">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                  <Badge variant="primary" size="sm">System Active</Badge>
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">SchoolSoul V1 System Active</p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">Local database IndexedDB operational with background sync queue.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Offline Protection Enabled</p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">All student records & admin actions persist without internet.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Quick Pill */}
          <div className="relative">
            <button
              id="role-switcher-dropdown-btn"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Role: <strong className="text-slate-900 dark:text-white">{activeRole}</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-40">
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
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
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
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <div className="hidden xl:block text-left pr-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{activeRole}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-40">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg mb-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">@{user?.username} • {user?.employeeNumber}</p>
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
                      if (onNavigate) onNavigate('profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
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
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors text-left font-medium"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Official User Guide</span>
                  </button>
                  <button
                    id="navbar-logout-btn"
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
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
    </header>
  );
};
