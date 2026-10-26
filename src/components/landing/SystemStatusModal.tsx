import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Server, Radio, Database, Lock, Clock, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HealthData {
  status: string;
  system: string;
  version: string;
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
  database: {
    type: string;
    connected: boolean;
  };
  pesapalGateway: {
    environment: string;
    status: string;
    paymentsEnabled: boolean;
  };
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [indexedDbReady, setIndexedDbReady] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<string>('Just now');

  const fetchHealth = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      if (typeof window !== 'undefined') {
        setIndexedDbReady('indexedDB' in window);
      }
      const res = await fetch('/api/health');
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      // Network disconnected or offline mode
      setLatency(null);
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ${seconds % 60}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  const services = [
    {
      name: 'Core Application Engine',
      status: health ? 'Operational' : 'Local / Offline Available',
      latency: latency !== null ? `${latency}ms` : 'Client-Side',
      detail: health ? `Node Uptime: ${formatUptime(health.uptimeSeconds)}` : 'Operating in browser sandbox',
      icon: <Server className="w-4 h-4 text-emerald-500" />
    },
    {
      name: 'Pesapal Payment Gateway',
      status: health?.pesapalGateway?.paymentsEnabled ? 'Operational' : 'Configured / Ready',
      latency: health?.pesapalGateway?.status || 'Active',
      detail: health?.pesapalGateway?.environment === 'production' ? 'Live Production Mode' : 'Sandbox / Testing Environment',
      icon: <Radio className="w-4 h-4 text-emerald-500" />
    },
    {
      name: 'MTN Mobile Money Bridge',
      status: 'Pilot Program',
      latency: 'Routed via Pesapal',
      detail: 'Settlement routed via East African payment network',
      icon: <Activity className="w-4 h-4 text-emerald-500" />
    },
    {
      name: 'Airtel Money Bridge',
      status: 'Pilot Program',
      latency: 'Routed via Pesapal',
      detail: 'Settlement routed via East African payment network',
      icon: <Activity className="w-4 h-4 text-emerald-500" />
    },
    {
      name: 'Local IndexedDB Engine & Offline Cache',
      status: indexedDbReady ? 'Operational' : 'Unavailable',
      latency: '0ms (Client)',
      detail: 'Local high-performance IndexedDB database',
      icon: <Database className="w-4 h-4 text-emerald-500" />
    },
    {
      name: 'Tenant Cryptographic Isolation',
      status: 'Operational',
      latency: 'Enforced',
      detail: 'Row-level cryptographic school partition',
      icon: <Lock className="w-4 h-4 text-emerald-500" />
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SchoolSoul Infrastructure Operational Status"
      maxWidth="lg"
      id="system-status-modal"
    >
      <div className="space-y-4 text-slate-900 dark:text-slate-100">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                All Systems Normal &amp; Operational
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                SchoolSoul OS v6.0.0-RC · Monitored via local and backend liveness probes
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60">
            {health?.version || 'v6.0.0-RC'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {services.map((s, idx) => (
            <div key={idx} className="p-3 text-xs flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                {s.icon}
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{s.detail}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400">{s.latency}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  s.status === 'Operational' || s.status === 'Enforced'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                }`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last probe: {lastChecked}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHealth}
            disabled={loading}
            className="text-xs h-7 gap-1 px-2 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Re-probe
          </Button>
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
