import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncEngine } from '../services/syncEngine';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingQueueCount: number;
  triggerSyncNow: () => Promise<{ success: boolean; syncedCount: number; message: string }>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);

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
    return await syncEngine.triggerSync();
  }, []);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingQueueCount,
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
