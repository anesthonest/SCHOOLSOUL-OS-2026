import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Server,
  Clock,
  ShieldCheck,
  Layers,
  Smartphone,
  Info,
  Database,
  ArrowUpRight,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { Badge } from './Badge';
import { useSync, SyncStatusState } from '../../context/SyncContext';
import { db } from '../../db/indexedDB';
import type { SyncQueueItem } from '../../types';

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({ isOpen, onClose }) => {
  const { isOnline, isSyncing, syncStatus, pendingQueueCount, lastSyncTime, lastSyncMessage, triggerSyncNow } = useSync();
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [storageEstimate, setStorageEstimate] = useState<{ usageMb: number; quotaMb: number } | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load pending items from IndexedDB
    const loadQueue = async () => {
      try {
        if (db?.syncQueue) {
          const items = await db.syncQueue.toArray();
          setQueueItems(items);
        }
      } catch {
        // Safe fallback in node or restricted environments
      }
    };

    // Load storage estimate
    const loadStorage = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          const usageMb = estimate.usage ? Math.round((estimate.usage / (1024 * 1024)) * 10) / 10 : 0;
          const quotaMb = estimate.quota ? Math.round((estimate.quota / (1024 * 1024)) * 10) / 10 : 0;
          setStorageEstimate({ usageMb, quotaMb });
        }
      } catch {
        // Ignore unsupported storage
      }
    };

    loadQueue();
    loadStorage();
  }, [isOpen, pendingQueueCount, isSyncing]);

  const handleManualSync = async () => {
    setIsRetrying(true);
    setSyncFeedback(null);
    try {
      const result = await triggerSyncNow();
      setSyncFeedback(result.message);
      // Reload queue
      if (db?.syncQueue) {
        const items = await db.syncQueue.toArray();
        setQueueItems(items);
      }
    } catch (err: any) {
      setSyncFeedback(err.message || 'Sync encounter an issue.');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadge = (status: SyncStatusState) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ONLINE — Connected to School Server
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            OFFLINE — Local Storage Protection Active
          </span>
        );
      case 'SYNCING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
            SYNCING — Pushing Local Records to Server
          </span>
        );
      case 'SYNCED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            SYNCED — All Changes Reconciled
          </span>
        );
      case 'SYNC_ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            SYNC ISSUE — Queued for Auto-Retry
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const formattedLastSync = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'System Startup / This Session';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SchoolSoul Sync & Resilience Center"
      maxWidth="2xl"
      id="sync-center-modal"
    >
      <div className="space-y-5 text-slate-900 dark:text-slate-100">
        {/* Status Header */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Current State
              </span>
              <div className="mt-1">{getStatusBadge(syncStatus)}</div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSync}
              isLoading={isSyncing || isRetrying}
              loadingText="Synchronizing..."
              iconLeading={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isRetrying ? 'animate-spin' : ''}`} />}
            >
              Trigger Sync Now
            </Button>
          </div>

          {syncFeedback && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{syncFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" /> Last Successful Sync
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
                {formattedLastSync}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-500" /> Pending Changes
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                {pendingQueueCount} record{pendingQueueCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-emerald-500" /> Local Database
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                {storageEstimate ? `${storageEstimate.usageMb} MB utilized` : 'IndexedDB Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Changes Table / List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" /> Local Change Queue
            </h4>
            <span className="text-xs text-slate-500">
              {queueItems.length} item{queueItems.length === 1 ? '' : 's'} awaiting sync
            </span>
          </div>

          {queueItems.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-center space-y-1.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Queue Clear — All Local Data Reconciled
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Attendance marks, student records, and fee receipts are completely synchronized with the main school database.
              </p>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {queueItems.map((item, idx) => (
                <div key={item.id || idx} className="p-3 text-xs flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 uppercase">
                        {item.action}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        Record: {item.entity || item.recordType || 'System'}
                      </span>
                      {item.retryCount && item.retryCount > 0 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {item.retryCount} retries
                        </span>
                      ) : null}
                    </div>
                    {item.errorMessage ? (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 truncate">
                        Error: {item.errorMessage}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Queued: {item.timestamp || item.createdAt || 'Staged'}
                      </p>
                    )}
                  </div>

                  <Badge variant={item.status === 'syncing' ? 'primary' : item.status === 'failed' ? 'danger' : 'warning'} size="sm">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offline Guarantee Reassurance Card */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h5 className="font-bold text-blue-950 dark:text-blue-100">
              Offline-First Guarantee
            </h5>
            <p className="text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
              SchoolSoul OS never loses data when power or internet fails. Any attendance entered, fees receipted, or student edits made offline are cryptographically staged in browser storage and will automatically push the moment a server connection is established.
            </p>
          </div>
        </div>

        {/* Device & Client Info */}
        <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            Device Mode: {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? 'Installed PWA (Standalone)' : 'Web Browser Session'}
          </span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            V6 Offline License: Persistent 30-Day Window Active
          </span>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
