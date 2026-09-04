import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FlaskConical,
  Code2,
  ChevronDown,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  getEnvironmentMode,
  setEnvironmentMode,
  getEnvironmentStatus,
  purgeDemoDataForProduction,
  seedPilotSandboxData,
  EnvironmentMode,
  EnvironmentStatus,
} from '../../services/environmentModeService';
import { useAuth } from '../../context/AuthContext';

export const EnvironmentModeBadge: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<EnvironmentMode>(getEnvironmentMode());
  const [status, setStatus] = useState<EnvironmentStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadStatus = async () => {
    const s = await getEnvironmentStatus();
    setStatus(s);
    setMode(s.mode);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleModeChange = async (newMode: EnvironmentMode) => {
    setIsProcessing(true);
    await setEnvironmentMode(newMode, user);
    setMode(newMode);
    await loadStatus();
    setIsProcessing(false);
    setFeedback(`System mode switched to ${newMode.toUpperCase()}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePurgeDemoData = async () => {
    if (!user) return;
    const confirm = window.confirm(
      'Are you sure you want to purge synthetic demo records? This will leave your system clean for live school operations.'
    );
    if (!confirm) return;

    setIsProcessing(true);
    const result = await purgeDemoDataForProduction(user);
    await loadStatus();
    setIsProcessing(false);
    setFeedback(`Purged ${result.purgedStudents} demo students and related records.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSeedPilotData = async () => {
    if (!user) return;
    setIsProcessing(true);
    const result = await seedPilotSandboxData(user);
    await loadStatus();
    setIsProcessing(false);
    setFeedback(result.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  const isProduction = mode === 'production';
  const isPilot = mode === 'pilot';

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider flex items-center gap-1.5 border transition-all ${
          isProduction
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            : isPilot
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
        }`}
      >
        {isProduction ? (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        ) : isPilot ? (
          <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
        )}
        <span>{isProduction ? 'LIVE PRODUCTION' : isPilot ? 'PILOT SANDBOX' : 'DEV MODE'}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Environment Control
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {status?.totalStudents || 0} Students in Store
            </span>
          </div>

          {feedback && (
            <div className="my-2 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Mode Options */}
          <div className="py-3 space-y-1.5">
            <button
              onClick={() => handleModeChange('production')}
              className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                isProduction
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Live Production Mode</div>
                  <div className="text-[10px] text-slate-400">Authoritative real school records</div>
                </div>
              </div>
              {isProduction && <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>}
            </button>

            <button
              onClick={() => handleModeChange('pilot')}
              className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                isPilot
                  ? 'bg-amber-950/40 border border-amber-500/40 text-amber-200'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Pilot Sandbox Mode</div>
                  <div className="text-[10px] text-slate-400">Safe evaluation environment</div>
                </div>
              </div>
              {isPilot && <span className="text-[10px] text-amber-400 font-bold">ACTIVE</span>}
            </button>
          </div>

          {/* Data Hygiene Tools */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Data Cleanliness & Tools
            </div>

            {status?.isDemoDataPresent && (
              <button
                onClick={handlePurgeDemoData}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Purge Demo Data for Production
              </button>
            )}

            {isPilot && (
              <button
                onClick={handleSeedPilotData}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Seed Pilot Evaluation Data
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
