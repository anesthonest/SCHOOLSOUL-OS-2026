import { db } from '../db/indexedDB';
import { isServerOnline, API_BASE, logAuditEvent } from './api';
import type { BackupPayload } from '../types';

export async function generateBackupPayload(): Promise<BackupPayload> {
  const schoolProfile = (await db.schoolProfile.toArray())[0] || null;
  const users = await db.users.toArray();
  const roles = await db.roles.toArray();
  const settings = (await db.settings.toArray())[0] || null;
  const auditLogs = await db.auditLogs.toArray();

  const payload: BackupPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    schoolProfile,
    users,
    roles,
    settings,
    auditLogs,
    checksum: `SS-V1-${Date.now()}-${users.length}`,
  };

  return payload;
}

export async function downloadBackupFile(operatorUserId: string, operatorUsername: string, operatorRole: string) {
  const payload = await generateBackupPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const schoolNameClean = (payload.schoolProfile?.schoolName || 'SchoolSoul').replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `${schoolNameClean}_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  await logAuditEvent(
    operatorUserId,
    operatorUsername,
    operatorRole,
    'BACKUP_CREATED',
    `Manual backup generated and downloaded (${payload.users.length} users, ${payload.auditLogs.length} audit logs)`
  );

  return payload;
}

export async function restoreFromBackupFile(
  file: File,
  operatorUserId: string,
  operatorUsername: string,
  operatorRole: string
): Promise<{ success: boolean; schoolName: string; userCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const payload: BackupPayload = JSON.parse(content);

        if (!payload || !payload.version || !payload.schoolProfile) {
          throw new Error('Invalid backup file format or missing school profile.');
        }

        // Restore Client IndexedDB
        await db.schoolProfile.clear();
        await db.schoolProfile.put(payload.schoolProfile);

        if (Array.isArray(payload.users)) {
          await db.users.clear();
          await db.users.bulkPut(payload.users);
        }

        if (Array.isArray(payload.roles)) {
          await db.roles.clear();
          await db.roles.bulkPut(payload.roles);
        }

        if (payload.settings) {
          await db.settings.clear();
          await db.settings.put(payload.settings);
        }

        if (Array.isArray(payload.auditLogs)) {
          await db.auditLogs.clear();
          await db.auditLogs.bulkPut(payload.auditLogs);
        }

        // Log audit event
        await logAuditEvent(
          operatorUserId,
          operatorUsername,
          operatorRole,
          'BACKUP_RESTORED',
          `System database restored from backup file exported on ${payload.exportedAt}`
        );

        // Also push restore to server if online
        if (await isServerOnline()) {
          try {
            await fetch(`${API_BASE}/backup/restore`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ backupPayload: payload, operatorUsername }),
            });
          } catch (serverErr) {
            console.warn('Failed to push restore payload to server', serverErr);
          }
        }

        resolve({
          success: true,
          schoolName: payload.schoolProfile.schoolName,
          userCount: payload.users.length,
        });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
}
