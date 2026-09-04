import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Settings,
  Layers,
  BarChart3,
  ShieldCheck,
  Building2,
  FileText,
  Activity,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';
import type { ExecutiveKPI, CockpitWidgetConfig } from '../types';

interface ExecutiveGrowthCockpitPageProps {
  onNavigate?: (view: string) => void;
}

export const ExecutiveGrowthCockpitPage: React.FC<ExecutiveGrowthCockpitPageProps> = ({
  onNavigate,
}) => {
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [widgets, setWidgets] = useState<CockpitWidgetConfig[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('Term 2 2026');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const loadedKpis = await v8IntelligenceApi.getExecutiveKPIs();
    const loadedWidgets = await v8IntelligenceApi.getCockpitWidgets();
    setKpis(loadedKpis);
    setWidgets(loadedWidgets);
    setLoading(false);
  };

  const toggleWidget = async (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, isEnabled: !w.isEnabled } : w));
    setWidgets(updated);
    await v8IntelligenceApi.saveCockpitWidgets(updated);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> SchoolSoul V8
            </span>
            <span className="text-xs text-slate-400">Decision-Support System</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Executive Growth Cockpit
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time operational dashboard synthesizing student attendance, academic pass rates, fee collections, welfare cases, teacher workload, and audit indicators across Vision 1–7.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="Term 1 2026" className="bg-slate-900">Term 1 2026</option>
              <option value="Term 2 2026" className="bg-slate-900">Term 2 2026 (Active)</option>
              <option value="Term 3 2026" className="bg-slate-900">Term 3 2026</option>
            </select>
          </div>

          <button
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            {isConfiguring ? 'Done Editing' : 'Configure Widgets'}
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Widget Configuration Drawer */}
      {isConfiguring && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Toggle Executive Cockpit Cards
            </h3>
            <span className="text-xs text-slate-400">Click to show/hide widgets in real-time</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {widgets.map((w) => (
              <button
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={`p-2.5 rounded-lg border text-xs text-left font-semibold flex items-center justify-between transition cursor-pointer ${
                  w.isEnabled
                    ? 'bg-blue-900/40 border-blue-600 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="truncate">{w.title}</span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    w.isEnabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Summary Cards Grid */}
      {widgets.find((w) => w.id === 'w-kpis')?.isEnabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    kpi.status === 'good'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : kpi.status === 'warning'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {kpi.category}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-white tracking-tight">
                  {kpi.value}{' '}
                  {kpi.unit && <span className="text-xs text-slate-400 font-medium">{kpi.unit}</span>}
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-bold ${
                    kpi.trend === 'up'
                      ? 'text-emerald-400'
                      : kpi.trend === 'down'
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : kpi.trend === 'down' ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : null}
                  {kpi.change}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 line-clamp-2">{kpi.description}</div>

              {kpi.target && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Target Benchmark</span>
                  <span className="font-mono text-slate-300 font-bold">{kpi.target}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolment & Retention Trends Card */}
        {widgets.find((w) => w.id === 'w-enrolment')?.isEnabled && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" /> Student Enrolment & Attendance
                </h2>
                <p className="text-xs text-slate-400">Term-on-term active registration trajectory</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('student-attendance')}
                className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Register <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Nursery & Primary</span>
                  <span className="text-lg font-black text-white">480</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">O-Level (S1-S4)</span>
                  <span className="text-lg font-black text-white">560</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">A-Level (S5-S6)</span>
                  <span className="text-lg font-black text-white">200</span>
                </div>
              </div>

              {/* Visual Bar Graph simulation */}
              <div className="space-y-2 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Term 1 2025</span>
                    <span className="font-mono">1,120 Students (89% Att.)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Term 3 2025</span>
                    <span className="font-mono">1,180 Students (92% Att.)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white font-semibold">
                    <span>Term 2 2026 (Current)</span>
                    <span className="font-mono text-emerald-400">1,240 Students (94.2% Att.)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finance & Expenditure Card */}
        {widgets.find((w) => w.id === 'w-finance')?.isEnabled && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Financial Revenue & Collection
                </h2>
                <p className="text-xs text-slate-400">Fee accounts, bursary allocations, and cashflow</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('financial-intelligence')}
                className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Financial AI <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Billed Tuition (Term 2)</span>
                  <span className="font-mono font-bold text-white">UGX 620,000,000</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Collected via MoMo & Banks</span>
                  <span className="font-mono font-bold text-emerald-400">UGX 548,700,000 (88.5%)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Outstanding Balances</span>
                  <span className="font-mono font-bold text-rose-400">UGX 71,300,000</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88.5%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block">Early Warning Notice</span>
                  <span className="text-slate-300">
                    UGX 38.5M balance remains outstanding for S4 candidate class ahead of UNEB registration.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Risk Detection Radar */}
        {widgets.find((w) => w.id === 'w-risks')?.isEnabled && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> AI Risk Detection Radar
                </h2>
                <p className="text-xs text-slate-400">Automated indicators across absenteeism, fees, and safety</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('student-intelligence')}
                className="text-xs text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Student Risks <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Absenteeism Spike in S3 West</div>
                  <div className="text-[11px] text-slate-400">14% drop in Friday attendance rate</div>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Critical Risk
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Physics Lab Reagent Shortage</div>
                  <div className="text-[11px] text-slate-400">Store inventory stock at 12% threshold</div>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Medium Risk
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Safeguarding Incident Resolution</div>
                  <div className="text-[11px] text-slate-400">2 welfare cases resolved, 2 active</div>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Monitoring
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Academic Pass Trends */}
        {widgets.find((w) => w.id === 'w-academics')?.isEnabled && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-400" /> Academic & Exam Outcomes
                </h2>
                <p className="text-xs text-slate-400">Midterm & UNEB Division projection distributions</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('academic-analytics')}
                className="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Academics Hub <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Division 1</span>
                <span className="text-lg font-black text-emerald-400">38%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Division 2</span>
                <span className="text-lg font-black text-blue-400">42%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Division 3</span>
                <span className="text-lg font-black text-amber-400">14%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Div 4 / Fail</span>
                <span className="text-lg font-black text-rose-400">6%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Top Performing Department</span>
              <span className="font-bold text-purple-300">Sciences & Mathematics (84.2% Avg)</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Toolbar to V8 Intelligence Hubs */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-800/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" /> Explore Specialized Intelligence Modules
          </h3>
          <p className="text-xs text-slate-400">Jump directly to deep analytics, predictions, and report tools</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate && onNavigate('ai-assistant')}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            AI Assistant & Reports
          </button>
          <button
            onClick={() => onNavigate && onNavigate('student-intelligence')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
          >
            Student Risk Predictions
          </button>
          <button
            onClick={() => onNavigate && onNavigate('financial-intelligence')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
          >
            Financial Forecasting
          </button>
          <button
            onClick={() => onNavigate && onNavigate('board-reporting')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
          >
            Board Packs & Exports
          </button>
        </div>
      </div>
    </div>
  );
};
