import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  QrCode,
  WifiOff,
  Users,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Award,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'cbc' | 'fees' | 'attendance' | 'lan'>('admin');

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Admin Cockpit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cbc')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cbc'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>CBC Marksheets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fee Collections</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lan')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'lan'
              ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>Offline LAN Node</span>
        </button>
      </div>

      {/* Screen Frame Mock */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Mock Window Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              schoolsoul.app / applet / {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected · Sync Active
            </span>
            <span className="text-slate-400 text-[11px]">SchoolSoul OS v6.0.0</span>
          </div>
        </div>

        {/* Mock Content Surfaces */}
        <div className="p-5 sm:p-8">
          {activeTab === 'admin' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Institutional Governance Cockpit
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time operational indicators across attendance, fee reconciliations, and academic compliance.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-xs">
                  Term 1, 2026 Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Active Enrollment</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">1,248</p>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ 100% Verified Profiles</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Today's Attendance</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">96.4%</p>
                  <span className="text-[10px] text-slate-500">1,203 Present / 45 Absent</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Fee Collection Rate</span>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">84.2%</p>
                  <span className="text-[10px] text-blue-600 font-bold">Pesapal & MoMo Reconciled</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Active Teaching Staff</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">64 / 64</p>
                  <span className="text-[10px] text-emerald-600 font-bold">CBC Certified Lessons</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cbc' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    CBC Continuous Assessment Gradebook
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Grade 7 Integrated Science · Term 1 Formative & Summative Rubrics with Automated Skill Passports.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs">
                  Kenya KICD / Uganda CBC Formats
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Learner Name</th>
                      <th className="p-3">Assessment 1 (Exceeding)</th>
                      <th className="p-3">Practical Project</th>
                      <th className="p-3">Summative Mark</th>
                      <th className="p-3">CBC Competency Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-semibold">Amina Nakato (ADM-042)</td>
                      <td className="p-3 text-emerald-600 font-bold">Level 4 (Exceeding Expectation)</td>
                      <td className="p-3">92%</td>
                      <td className="p-3 font-mono font-bold">88 / 100</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Exceeding</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Emmanuel Kiptoo (ADM-079)</td>
                      <td className="p-3 text-blue-600 font-bold">Level 3 (Meeting Expectation)</td>
                      <td className="p-3">84%</td>
                      <td className="p-3 font-mono font-bold">79 / 100</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Meeting</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Grace Mwangi (ADM-112)</td>
                      <td className="p-3 text-blue-600 font-bold">Level 3 (Meeting Expectation)</td>
                      <td className="p-3">81%</td>
                      <td className="p-3 font-mono font-bold">76 / 100</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Meeting</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Automated Fee Accounting & Pesapal Engine
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Zero cash handling risks. Automated mobile money reconciliation for MTN, Airtel, and bank cards.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-xs">
                  Automated SMS Receipts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-1">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase">Today's Collections</span>
                  <p className="text-xl font-black text-amber-950 dark:text-amber-100">UGX 14,850,000</p>
                  <span className="text-[10px] text-slate-500">28 transactions settled via Pesapal</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">Automated Parent Receipts</span>
                  <p className="text-xl font-black text-emerald-950 dark:text-emerald-100">28 Sent via SMS</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Zero discrepancies detected</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-1">
                  <span className="text-[10px] text-blue-800 dark:text-blue-300 font-bold uppercase">Term Target Progress</span>
                  <p className="text-xl font-black text-blue-950 dark:text-blue-100">84.2% Collected</p>
                  <span className="text-[10px] text-blue-600 font-bold">Defaulter lists updated daily</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Universal QR Attendance & Verification
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Scan student badges or digital IDs in &lt; 0.5s. Works offline without internet connectivity.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-bold text-xs">
                  Instant Parent SMS Alert
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    QR
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">Main School Gate Scanner 01</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tablet terminal operated by Security Officer</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> 1,203 Scanned Today
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-300">Average check-in time: 0.4 seconds</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lan' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    100% Offline-First Local Node Architecture
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Schools continue operations uninterrupted through fiber cuts, mobile network outages, and power rationing.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 font-bold text-xs">
                  Zero Cloud Hostage
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" /> Local Server / Wi-Fi Router
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Install on a laptop or school server. All teacher devices connect via ordinary school Wi-Fi without internet bundles.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Dexie IndexedDB Cache
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Local client stores all student profiles, CBC marksheets, and receipts safely in high-performance browser storage.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Automatic Delta Sync
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    When internet reconnects, cryptographic delta updates push pending changes without duplicate records or lost data.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
