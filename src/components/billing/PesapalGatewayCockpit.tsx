import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  PlayCircle,
  ExternalLink,
  Zap,
  Lock,
  Globe,
  Radio,
  FileText,
  Activity,
  Server,
  ArrowUpRight,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PesapalClientService,
  type PesapalHealthInfo,
  type PesapalTestSuiteReport,
} from '../../services/pesapalClientService';

interface PesapalGatewayCockpitProps {
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export function PesapalGatewayCockpit({ onShowToast }: PesapalGatewayCockpitProps) {
  const [health, setHealth] = useState<PesapalHealthInfo | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [testReport, setTestReport] = useState<PesapalTestSuiteReport | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [registeringIPN, setRegisteringIPN] = useState(false);
  const [customIPNUrl, setCustomIPNUrl] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [reconciling, setReconciling] = useState(false);
  const [expandedTestCategory, setExpandedTestCategory] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await PesapalClientService.getHealth();
      setHealth(data);
      if (data.ipnUrl) {
        setCustomIPNUrl(data.ipnUrl);
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to fetch Pesapal health', 'error');
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await PesapalClientService.getAuditLogs();
      setAuditLogs(data.logs || []);
      setPaymentRecords(data.payments || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchLogs();
  }, []);

  const handleRegisterIPN = async () => {
    setRegisteringIPN(true);
    try {
      const res = await PesapalClientService.registerIPN(customIPNUrl || undefined);
      if (onShowToast) onShowToast(`IPN Registered successfully! ID: ${res.ipn_id}`, 'success');
      await fetchHealth();
      await fetchLogs();
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'IPN Registration failed', 'error');
    } finally {
      setRegisteringIPN(false);
    }
  };

  const handleRunTestSuite = async () => {
    setRunningTests(true);
    try {
      const report = await PesapalClientService.runSandboxTests();
      setTestReport(report);
      if (report.failed === 0) {
        if (onShowToast) onShowToast(`All ${report.passed} Pesapal API 3.0 test suites PASSED!`, 'success');
      } else {
        if (onShowToast) onShowToast(`${report.failed} tests failed in Pesapal test harness`, 'warning');
      }
      await fetchLogs();
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to execute test harness', 'error');
    } finally {
      setRunningTests(false);
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    try {
      const res = await PesapalClientService.runReconciliation();
      if (onShowToast) onShowToast(res.message || 'Reconciliation completed', 'info');
      await fetchLogs();
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Reconciliation failed', 'error');
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Indicator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Pesapal API 3.0 Production Payment Gateway
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                    health?.environment === 'production'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {health?.environment === 'production' ? 'PRODUCTION LIVE' : 'SANDBOX / CYBQA'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse text-blue-400" /> REST 3.0 OAuth
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative Uganda (UGX) & Global (USD) Payment Settlement · Zero-Trust Independent Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} /> Refresh Diagnostics
            </button>

            <button
              onClick={handleRunTestSuite}
              disabled={runningTests}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {runningTests ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
              Run 15-Point Test Suite
            </button>
          </div>
        </div>

        {/* Diagnostic Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Environment & Base URL */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-400" /> API Base Endpoint</span>
              <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-300">v3.0</span>
            </div>
            <div className="font-mono text-xs text-white truncate" title={health?.baseUrl}>
              {health?.baseUrl || 'https://cybqa.pesapal.com/pesapalv3'}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              Mode: <strong className="text-slate-200 uppercase">{health?.environment || 'sandbox'}</strong>
            </div>
          </div>

          {/* Card 2: Bearer Token Cache */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> Short-Lived JWT Token</span>
              <span className={`w-2 h-2 rounded-full ${health?.tokenHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              {health?.tokenHealthy ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Token Active (Cached 5m)
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Token On-Demand
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Key: <span className="font-mono text-slate-300">{health?.consumerKeyMasked || '••••••••'}</span>
            </div>
          </div>

          {/* Card 3: IPN Notification Registration */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> IPN Webhook URL</span>
              <span className={`w-2 h-2 rounded-full ${health?.ipnConfigured ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            </div>
            <div className="font-mono text-xs text-white truncate" title={health?.ipnId || 'Not Registered'}>
              {health?.ipnConfigured ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ID: {health.ipnId?.substring(0, 16)}...
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> IPN Registration Required
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Type: <strong className="text-slate-300">POST (JSON)</strong>
            </div>
          </div>

          {/* Card 4: Payments Enabled Switch */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Gateway Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xs font-bold text-white">
              {health?.paymentsEnabled !== false ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Live Payments Enabled
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Payments Disabled by Admin
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Zero-Trust Verification: <strong className="text-emerald-400">ENFORCED</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive IPN Registration & Configuration Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Server className="w-5 h-5 text-blue-400" />
          Pesapal IPN Webhook Registration
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Pesapal sends Instant Payment Notifications (IPNs) to notify SchoolSoul of payment transactions. Registering your live or ngrok callback endpoint establishes the authoritative webhook listener.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Authoritative Webhook Endpoint URL:
            </label>
            <input
              type="url"
              value={customIPNUrl}
              onChange={(e) => setCustomIPNUrl(e.target.value)}
              placeholder="https://your-domain.com/api/billing/pesapal/ipn"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRegisterIPN}
              disabled={registeringIPN}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {registeringIPN ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Register / Update IPN
            </button>
          </div>
        </div>
      </div>

      {/* 3. Automated 15-Point Test Suite Results */}
      {testReport && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-emerald-400" />
                Pesapal API 3.0 Compliance Test Suite Results
              </h3>
              <p className="text-xs text-slate-400">
                Automated end-to-end verification covering Authentication, Token Caching, Order Submission, Zero-Trust Status Verification, IPN Idempotency, and Subscription Activation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-extrabold">
                {testReport.passed} / {testReport.totalTests} PASSED
              </span>
              {testReport.failed > 0 && (
                <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-extrabold">
                  {testReport.failed} FAILED
                </span>
              )}
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/60">
            {testReport.results.map((t) => (
              <div key={t.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  {t.status === 'PASSED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : t.status === 'FAILED' ? (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{t.id}</span>
                      <span>{t.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[10px] text-slate-500">{t.durationMs}ms</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'PASSED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Payment Records & IPN Audit Ledger */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Pesapal Live Transaction & Webhook Audit Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Immutable ledger of all Pesapal order submissions, webhook receipts, and independent verification logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReconcile}
              disabled={reconciling}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? 'animate-spin' : ''}`} /> Run Pending Reconciliation
            </button>
          </div>
        </div>

        {paymentRecords.length === 0 && auditLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
            No live transactions recorded in this session. Initiate a subscription order or run the 15-Point Test Suite to populate this ledger.
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Reference / Order ID</th>
                  <th className="p-3">School</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Tracking ID</th>
                  <th className="p-3">Provider Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paymentRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono text-slate-200">{r.merchantReference}</td>
                    <td className="p-3 text-slate-300">{r.schoolId}</td>
                    <td className="p-3 font-bold text-white">
                      {r.currency} {r.amount?.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">
                      {r.pesapalTrackingId || '—'}
                    </td>
                    <td className="p-3 text-slate-300">{r.paymentMethod || 'Pesapal 3.0'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : r.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(r.createdAt || Date.now()).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
