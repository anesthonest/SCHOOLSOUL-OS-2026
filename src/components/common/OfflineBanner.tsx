import React, { useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { SyncCenterModal } from './SyncCenterModal';

export const OfflineBanner: React.FC = () => {
  const { isOnline, isSyncing, syncStatus, pendingQueueCount, triggerSyncNow } = useSync();
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState<boolean>(false);

  const handleSyncClick = async () => {
    const res = await triggerSyncNow();
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  if (isOnline && pendingQueueCount === 0 && !syncFeedback) return null;

  return (
    <>
      <div id="offline-status-banner" className="bg-slate-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-slate-800">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium text-amber-300">
                Working Offline Mode
              </span>
              <span className="text-slate-400 hidden sm:inline">
                – All data is safely saved locally in IndexedDB and queued for auto-sync.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-emerald-300">Connected to School Server</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {pendingQueueCount > 0 && (
            <button
              onClick={() => setIsSyncCenterOpen(true)}
              title="Click to view pending records in Sync Center"
              className="px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-mono text-[11px] cursor-pointer transition flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              <span>{pendingQueueCount} pending change{pendingQueueCount > 1 ? 's' : ''}</span>
            </button>
          )}

          {syncFeedback ? (
            <span className="text-slate-300 animate-fade-in flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
              {syncFeedback}
            </span>
          ) : (
            <button
              id="sync-now-btn"
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-colors disabled:opacity-50 cursor-pointer min-h-[30px]"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}

          <button
            onClick={() => setIsSyncCenterOpen(true)}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
          >
            Sync Center
          </button>
        </div>
      </div>

      <SyncCenterModal
        isOpen={isSyncCenterOpen}
        onClose={() => setIsSyncCenterOpen(false)}
      />
    </>
  );
};
