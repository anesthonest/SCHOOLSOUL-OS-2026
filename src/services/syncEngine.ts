import { db } from '../db/indexedDB';
import { API_BASE, isServerOnline, getAuthHeaders } from './api';
import type { SyncQueueItem } from '../types';

class SyncEngineService {
  private isSyncing = false;
  private listeners: Array<(isSyncing: boolean, count: number) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.triggerSync());
    }
  }

  public subscribe(listener: (isSyncing: boolean, count: number) => void) {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notify() {
    try {
      const pendingCount = await db.syncQueue.where('status').equals('pending').count();
      this.listeners.forEach((l) => l(this.isSyncing, pendingCount));
    } catch {
      // ignore Dexie closing errors
    }
  }

  public async getPendingQueueCount(): Promise<number> {
    try {
      return await db.syncQueue.where('status').equals('pending').count();
    } catch {
      return 0;
    }
  }

  public async triggerSync(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, message: 'Sync already in progress' };
    }

    const online = await isServerOnline();
    if (!online) {
      return { success: false, syncedCount: 0, message: 'Server is currently offline' };
    }

    this.isSyncing = true;
    await this.notify();

    try {
      const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();
      if (pendingItems.length === 0) {
        this.isSyncing = false;
        await this.notify();
        return { success: true, syncedCount: 0, message: 'Queue is clear. No items to sync.' };
      }

      // Mark items as syncing
      await db.syncQueue.where('status').equals('pending').modify({ status: 'syncing' });

      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/sync/push`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items: pendingItems }),
      });

      if (res.status === 401) {
        // Unauthenticated - defer sync until valid session without throwing errors
        await db.syncQueue.where('status').equals('syncing').modify({ status: 'pending' });
        this.isSyncing = false;
        await this.notify();
        return {
          success: false,
          syncedCount: 0,
          message: 'Sync deferred: Authentication session required.',
        };
      }

      if (!res.ok) {
        throw new Error(`Sync server returned ${res.status}`);
      }

      const data = await res.json();

      // Remove synced items
      const syncedIds = pendingItems.map((item) => item.id);
      await db.syncQueue.bulkDelete(syncedIds);

      this.isSyncing = false;
      await this.notify();

      return {
        success: true,
        syncedCount: data.processedCount || pendingItems.length,
        message: `Successfully synchronized ${data.processedCount || pendingItems.length} changes with server.`,
      };
    } catch (error: any) {
      console.warn('Background Sync status:', error.message || error);
      // Revert status to pending with retry count increment
      try {
        const pendingItems = await db.syncQueue.where('status').equals('syncing').toArray();
        for (const item of pendingItems) {
          await db.syncQueue.update(item.id, {
            status: 'pending',
            retryCount: (item.retryCount || 0) + 1,
            errorMessage: error.message || 'Network error during sync',
          });
        }
      } catch {
        // ignore
      }

      this.isSyncing = false;
      await this.notify();

      return {
        success: false,
        syncedCount: 0,
        message: `Sync failed: ${error.message || 'Network error'}`,
      };
    }
  }
}

export const syncEngine = new SyncEngineService();
