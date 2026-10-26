import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export const PWAUpdateNotification: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Listen for custom swUpdated event or registerSW callback
    const handleSWUpdate = () => {
      setNeedRefresh(true);
    };

    const handleSWOffline = () => {
      setOfflineReady(true);
      setTimeout(() => setOfflineReady(false), 5000);
    };

    window.addEventListener('schoolsoul-sw-updated', handleSWUpdate);
    window.addEventListener('schoolsoul-sw-offline-ready', handleSWOffline);

    // Also check standard service worker registration updatefound
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setNeedRefresh(true);
            }
          });
        });
      });
    }

    return () => {
      window.removeEventListener('schoolsoul-sw-updated', handleSWUpdate);
      window.removeEventListener('schoolsoul-sw-offline-ready', handleSWOffline);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    window.location.reload();
  };

  if (offlineReady) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-2xl animate-in slide-in-from-bottom duration-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="font-medium">SchoolSoul OS is ready for offline operation.</span>
      </div>
    );
  }

  if (!needRefresh || dismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl bg-slate-900 border-2 border-blue-500 p-4 text-white shadow-2xl animate-in slide-in-from-bottom duration-300 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 shrink-0 border border-blue-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300">New Version Available</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              A new update for SchoolSoul OS is ready to install. Unsynced changes remain safely preserved in local storage.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleUpdate}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Update Now</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
        >
          Later
        </button>
      </div>
    </div>
  );
};
