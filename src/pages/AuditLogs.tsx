import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Shield,
  Eye,
  Activity,
} from 'lucide-react';
import { fetchAuditLogs } from '../services/api';
import type { AuditLog } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error('Audit log fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = (logs || []).filter((log) => {
    if (!log) return false;
    const username = log.username || '';
    const details = log.details || '';
    const action = log.action || '';
    const matchesSearch =
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Details', 'IP Address', 'Device'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp || ''}"`,
      `"${l.username || ''}"`,
      `"${l.userRole || ''}"`,
      `"${l.action || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.deviceInfo || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolSoul_AuditTrail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-600" />
            System Audit & Security Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable audit trail logging all user authentication, admin actions, role changes, and data mutations.
          </p>
        </div>

        <button
          id="export-audit-csv-btn"
          onClick={exportAuditCSV}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Audit Trail CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="audit-search-input"
            type="text"
            placeholder="Search audit details, usernames, actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="audit-action-filter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
          >
            <option value="ALL">All Event Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="USER_CREATE">USER_CREATE</option>
            <option value="USER_UPDATE">USER_UPDATE</option>
            <option value="USER_STATUS_CHANGE">USER_STATUS_CHANGE</option>
            <option value="ROLE_CREATE">ROLE_CREATE</option>
            <option value="ROLE_UPDATE">ROLE_UPDATE</option>
            <option value="SETTINGS_UPDATE">SETTINGS_UPDATE</option>
            <option value="BACKUP_CREATED">BACKUP_CREATED</option>
            <option value="BACKUP_RESTORED">BACKUP_RESTORED</option>
            <option value="SCHOOL_SETUP">SCHOOL_SETUP</option>
            <option value="SYNC_OPERATION">SYNC_OPERATION</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                <th className="p-3.5 pl-4">Timestamp</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Log Details</th>
                <th className="p-3.5 pr-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading security audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No audit records matching your filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 pl-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-UG')}
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{log.username}</p>
                      <p className="text-[10px] text-slate-400">{log.userRole}</p>
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant={
                          log.action.includes('FAILED') || log.action.includes('DELETE')
                            ? 'danger'
                            : log.action.includes('SUCCESS') || log.action.includes('CREATE')
                            ? 'success'
                            : 'primary'
                        }
                      >
                        {log.action}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-slate-800 dark:text-slate-200 max-w-md truncate">
                      {log.details}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT AUDIT LOG MODAL */}
      <Modal isOpen={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} title="Audit Event Details">
        {selectedLog && (
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <p><strong>Log ID:</strong> <span className="font-mono">{selectedLog.id}</span></p>
              <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toString()}</p>
              <p><strong>Actor:</strong> {selectedLog.username} ({selectedLog.userRole})</p>
              <p><strong>Action:</strong> <Badge variant="primary">{selectedLog.action}</Badge></p>
              <p><strong>IP Address:</strong> {selectedLog.ipAddress || '127.0.0.1 (Local Browser)'}</p>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Details & Payload Description:</p>
              <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto">
                {selectedLog.details}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
