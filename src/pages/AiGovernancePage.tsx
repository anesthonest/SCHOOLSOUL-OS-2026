import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Settings,
  Lock,
  History,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';
import type { AiGovernanceSetting, AiAuditLogEntry } from '../types';

export const AiGovernancePage: React.FC = () => {
  const [settings, setSettings] = useState<AiGovernanceSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<AiAuditLogEntry[]>([]);
  const [searchLog, setSearchLog] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const loadedSettings = await v8IntelligenceApi.getAiGovernanceSettings();
    const loadedLogs = await v8IntelligenceApi.getAiAuditLogs();
    setSettings(loadedSettings);
    setAuditLogs(loadedLogs);
    setLoading(false);
  };

  const toggleFeature = async (id: string) => {
    const updated = settings.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s));
    setSettings(updated);
    await v8IntelligenceApi.saveAiGovernanceSettings(updated);
  };

  const toggleHumanApproval = async (id: string) => {
    const updated = settings.map((s) => (s.id === id ? { ...s, requiresHumanApproval: !s.requiresHumanApproval } : s));
    setSettings(updated);
    await v8IntelligenceApi.saveAiGovernanceSettings(updated);
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.promptUsed.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.actionType.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Security & Privacy Governance
            </span>
            <span className="text-xs text-slate-400">School Control Panel</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            AI Feature Controls & Audit Logs
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure AI capability feature toggles, confidence thresholds, human-in-the-loop safeguards, and inspect prompt audit logs.
          </p>
        </div>
      </div>

      {/* Main Grid: AI Feature Controls (Left) & Audit Logs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Toggles & Privacy Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-400" /> AI Capability Toggles
            </h2>
            <span className="text-xs text-slate-400">Schools can disable specific AI features</span>
          </div>

          <div className="space-y-3">
            {settings.map((set) => (
              <div
                key={set.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{set.featureName}</span>
                    <span className="text-[11px] text-slate-400">{set.description}</span>
                  </div>

                  <button
                    onClick={() => toggleFeature(set.id)}
                    className="cursor-pointer text-slate-300 hover:text-white transition"
                  >
                    {set.isEnabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    Human Verification Required:
                    <button
                      onClick={() => toggleHumanApproval(set.id)}
                      className={`font-bold ml-1 hover:underline cursor-pointer ${
                        set.requiresHumanApproval ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {set.requiresHumanApproval ? 'YES (Mandatory)' : 'NO (Optional)'}
                    </button>
                  </span>

                  <span className="font-mono text-purple-300">Min Threshold: {set.minConfidenceThreshold}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs Inspector */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" /> Transparent AI Audit Logs
            </h2>
            <span className="text-xs text-slate-500 font-mono">{filteredLogs.length} Records</span>
          </div>

          <input
            type="text"
            placeholder="Search prompt history or staff user..."
            value={searchLog}
            onChange={(e) => setSearchLog(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{log.userName} ({log.role})</span>
                  <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                </div>

                <div className="text-[11px] text-purple-300 font-mono bg-slate-900 p-2 rounded border border-slate-800/80">
                  "{log.promptUsed}"
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Scope: <strong className="text-slate-300">{log.dataScopeAccessed}</strong></span>
                  <span className="font-mono text-blue-400">{log.modelUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
