import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncEngine } from '../services/syncEngine';

export type SyncStatusState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED' | 'SYNC_ERROR';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  syncStatus: SyncStatusState;
  pendingQueueCount: number;
  lastSyncTime: Date | null;
  lastSyncMessage: string | null;
  triggerSyncNow: () => Promise<{ success: boolean; syncedCount: number; message: string }>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    try {
      const stored = localStorage.getItem('schoolsoul_last_sync_time');
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  });
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  // Derive syncStatus
  const syncStatus: SyncStatusState = !isOnline
    ? 'OFFLINE'
    : isSyncing
    ? 'SYNCING'
    : lastSyncMessage && lastSyncMessage.toLowerCase().includes('fail')
    ? 'SYNC_ERROR'
    : pendingQueueCount === 0 && lastSyncTime
    ? 'SYNCED'
    : 'ONLINE';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = syncEngine.subscribe((syncing, count) => {
      setIsSyncing(syncing);
      setPendingQueueCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const triggerSyncNow = useCallback(async () => {
    const res = await syncEngine.triggerSync();
    setLastSyncMessage(res.message);
    if (res.success) {
      const now = new Date();
      setLastSyncTime(now);
      try {
        localStorage.setItem('schoolsoul_last_sync_time', now.toISOString());
      } catch {
        // ignore
      }
    }
    return res;
  }, []);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        syncStatus,
        pendingQueueCount,
        lastSyncTime,
        lastSyncMessage,
        triggerSyncNow,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within a SyncProvider');
  return context;
};
