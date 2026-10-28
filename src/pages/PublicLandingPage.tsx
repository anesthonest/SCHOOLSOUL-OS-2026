import React from 'react';
import {
  Lock,
  UserPlus,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SchoolSoulMarkSVG } from '../components/common/SchoolSoulLogo';
import { PWAInstallButton } from '../components/common/PWAInstallBanner';
import { useTheme } from '../context/ThemeContext';

interface PublicLandingPageProps {
  onGoToAuth: (initialTab?: 'LOGIN' | 'REGISTER' | 'STATUS') => void;
  onGoToRegisterSchool?: () => void;
  schoolName?: string;
  schoolLogo?: string;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onGoToAuth,
  onGoToRegisterSchool,
  schoolName = 'SchoolSoul OS',
  schoolLogo,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* 1. Compact Header */}
      <header className="shrink-0 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt={schoolName}
                className="w-8 h-8 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xs">
                <SchoolSoulMarkSVG size={22} idPrefix="ss-header-brand" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                {schoolName}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
                School Operating System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton className="hidden sm:inline-flex" />
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Centered Application Entry Viewport */}
      <main className="grow flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-md mx-auto text-center space-y-5 sm:space-y-6">
          {/* Identity */}
          <div className="space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 flex items-center justify-center mx-auto shadow-sm">
              <SchoolSoulMarkSVG size={32} idPrefix="ss-landing-mark" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight uppercase pt-1">
              SchoolSoul OS
            </h1>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              School Operating System
            </p>
          </div>

          {/* Short Description */}
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
              "One operating system for the modern school."
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Manage your school from one secure, resilient platform.
            </p>
          </div>

          {/* Large Primary Action Buttons */}
          <div className="space-y-3 pt-1 w-full max-w-xs sm:max-w-sm mx-auto">
            <Button
              variant="primary"
              size="lg"
              data-testid="first-screen-login-btn"
              onClick={() => onGoToAuth('LOGIN')}
              iconLeading={<Lock className="w-5 h-5" />}
              className="w-full justify-center px-8 py-3.5 sm:py-4 text-base font-extrabold tracking-wide uppercase bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/50 cursor-pointer min-h-[50px] rounded-xl"
            >
              LOGIN
            </Button>

            <Button
              variant="secondary"
              size="lg"
              data-testid="first-screen-register-btn"
              onClick={() => (onGoToRegisterSchool ? onGoToRegisterSchool() : onGoToAuth('REGISTER'))}
              iconLeading={<UserPlus className="w-5 h-5" />}
              className="w-full justify-center px-8 py-3.5 sm:py-4 text-base font-extrabold tracking-wide uppercase border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-xs cursor-pointer min-h-[50px] rounded-xl"
            >
              REGISTER SCHOOL
            </Button>
          </div>

          {/* Join Existing School */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onGoToAuth('REGISTER')}
              className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1 transition-colors"
            >
              <span>Join Existing School</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* 3. Small Footer with Attribution & Essential Actions */}
      <footer className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-4 text-center space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-medium">
          <button
            onClick={() => onGoToAuth('LOGIN')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <button
            onClick={() => (onGoToRegisterSchool ? onGoToRegisterSchool() : onGoToAuth('REGISTER'))}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Register School
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <button
            onClick={() => onGoToAuth('REGISTER')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Join Existing School
          </button>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          SchoolSoul OS — Developed by VINEXSAH TECHNOLOGIES. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
