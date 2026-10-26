import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share, PlusSquare, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { SchoolSoulMarkSVG } from './SchoolSoulLogo';

interface PWAInstallBannerProps {
  variant?: 'banner' | 'button' | 'compact';
  className?: string;
  onOpenApp?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  variant = 'banner',
  className = '',
  onOpenApp,
}) => {
  const { isInstallable, isInstalled, isIOS, hasDismissedPrompt, install, dismissPrompt } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If running in standalone mode already
  if (isInstalled) {
    if (variant === 'button') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          SchoolSoul App Installed
        </span>
      );
    }
    return null;
  }

  // Handle direct install click
  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General prompt for desktop or unsupported
      setShowIOSModal(true);
    }
  };

  // 1. Compact Button Variant (e.g. for Navbar or Sidebar)
  if (variant === 'button' || variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
            variant === 'compact'
              ? 'bg-blue-600/10 text-blue-700 dark:text-blue-300 hover:bg-blue-600/20 border border-blue-500/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${className}`}
          title="Install SchoolSoul OS Progressive Web Application"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isIOS ? 'Add to Home Screen' : 'Install SchoolSoul'}</span>
        </button>

        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} isIOS={isIOS} />
        )}
      </>
    );
  }

  // 2. Full Top / In-page Banner Variant
  if (hasDismissedPrompt && !showIOSModal) {
    return null;
  }

  return (
    <>
      <div
        className={`bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white border-b border-blue-800/40 px-4 py-2.5 sm:py-3 transition-colors ${className}`}
        role="region"
        aria-label="PWA Installation Notice"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 p-1">
              <SchoolSoulMarkSVG size={22} idPrefix="pwa-banner-emblem" />
            </div>
            <div>
              <p className="font-bold tracking-tight text-white flex items-center gap-2">
                <span>Install SchoolSoul OS Application</span>
                <span className="hidden sm:inline-block text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded font-mono">
                  OFFLINE-READY PWA
                </span>
              </p>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                Install as a standalone app on your desktop, Android, or iPad for 100% offline access, instant attendance, and LAN sync.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIOS ? 'Add to Home Screen' : 'Install App'}</span>
            </button>

            {onOpenApp && (
              <button
                type="button"
                onClick={onOpenApp}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <span>Launch</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={dismissPrompt}
              aria-label="Dismiss install banner"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} isIOS={isIOS} />
      )}
    </>
  );
};

export const IOSInstallModal: React.FC<{ onClose: () => void; isIOS?: boolean }> = ({ onClose, isIOS = true }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center p-1">
              <SchoolSoulMarkSVG size={24} idPrefix="pwa-guide-modal" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Install SchoolSoul OS</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isIOS ? 'Apple iOS / iPadOS Setup' : 'Browser App Installation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Follow these simple steps in Safari to add SchoolSoul to your home screen:
            </p>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Share className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Step 1: Tap Share</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap the <strong>Share</strong> icon in the bottom menu bar of Safari.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <PlusSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Step 2: Add to Home Screen</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Step 3: Launch SchoolSoul</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap <strong>Add</strong> in the top right. SchoolSoul OS will now appear on your home screen with offline capability!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <p>
              To install SchoolSoul on Chrome, Edge, or Android:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs">
              <li>Look for the <strong>Install</strong> icon in the right side of the address bar.</li>
              <li>Or click the browser menu (⋮) and select <strong>"Install SchoolSoul OS..."</strong></li>
              <li>Confirm the install prompt to launch the standalone desktop app.</li>
            </ol>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <PWAInstallBanner variant="button" className={className} />
);

