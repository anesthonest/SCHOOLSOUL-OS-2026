import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sliders,
  Sparkles,
  PieChart,
  BarChart3,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';
import type { FinancialForecastRecord } from '../types';

export const FinancialIntelligencePage: React.FC = () => {
  const [forecasts, setForecasts] = useState<FinancialForecastRecord[]>([]);

  // What-If Simulator Controls
  const [feeIncrease, setFeeIncrease] = useState<number>(0); // -10% to +20%
  const [bursaryExpand, setBursaryExpand] = useState<number>(0); // 0% to +30%
  const [staffPayAdjust, setStaffPayAdjust] = useState<number>(0); // 0% to +15%

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await v8IntelligenceApi.getFinancialForecasts();
    setForecasts(data);
  };

  const baseRevenue = forecasts[0]?.projectedRevenueUgx || 620000000;
  const baseExpense = forecasts[0]?.projectedExpenseUgx || 480000000;

  // Calculate simulated numbers
  const simulatedRevenue = baseRevenue * (1 + feeIncrease / 100) - (baseRevenue * (bursaryExpand / 100) * 0.1);
  const simulatedExpense = baseExpense * (1 + staffPayAdjust / 100);
  const simulatedSurplus = simulatedRevenue - simulatedExpense;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Financial Decision Support
            </span>
            <span className="text-xs text-slate-400">Vision 4 Finance Integration</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Financial Intelligence & Cash Flow Forecasting
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Revenue vs expenditure projections, fee collection default risk warnings, and interactive scenario planners for school leadership.
          </p>
        </div>
      </div>

      {/* Main Grid: Forecast Cards & Scenario Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Overview & Early Warnings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {forecasts.map((f) => (
            <div key={f.id} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{f.academicYear}</span>
                  <h2 className="text-lg font-bold text-white">{f.termName} Financial Forecast</h2>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950 text-slate-300 border border-slate-800">
                  Collection Rate Target: {f.expectedCollectionRate}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Projected Revenue</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    UGX {(f.projectedRevenueUgx / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Projected Expenses</span>
                  <span className="text-lg font-black text-rose-400 font-mono">
                    UGX {(f.projectedExpenseUgx / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Net Surplus / Cashflow</span>
                  <span className="text-lg font-black text-blue-400 font-mono">
                    UGX {((f.projectedRevenueUgx - f.projectedExpenseUgx) / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>

              {/* Risk Warnings List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Bursary & Early Warning Alerts
                </span>
                {f.riskAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      alert.level === 'Critical'
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                        : alert.level === 'Warning'
                        ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                        : 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* What-If Scenario Simulator Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Interactive What-If Scenario Planner</h2>
          </div>
          <p className="text-xs text-slate-400">
            Simulate financial impacts of fee changes, bursary expansions, or payroll adjustments.
          </p>

          <div className="space-y-4">
            {/* Control 1: Fee Adjustment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Tuition Fee Adjustment</span>
                <span className="font-mono text-emerald-400">{feeIncrease > 0 ? `+${feeIncrease}%` : `${feeIncrease}%`}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="20"
                step="1"
                value={feeIncrease}
                onChange={(e) => setFeeIncrease(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Control 2: Bursary Expansion */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Scholarship / Bursary Expansion</span>
                <span className="font-mono text-purple-400">+{bursaryExpand}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={bursaryExpand}
                onChange={(e) => setBursaryExpand(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Control 3: Staff Salary Adjustment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Staff Salary Increment</span>
                <span className="font-mono text-rose-400">+{staffPayAdjust}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={staffPayAdjust}
                onChange={(e) => setStaffPayAdjust(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-800/60 space-y-3">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
              Simulated Financial Outcome
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Simulated Revenue:</span>
                <span className="font-mono font-bold text-white">UGX {(simulatedRevenue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Simulated Expenditure:</span>
                <span className="font-mono font-bold text-rose-300">UGX {(simulatedExpense / 1000000).toFixed(1)}M</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-slate-200">Net Surplus / (Deficit):</span>
                <span
                  className={`font-mono text-sm ${
                    simulatedSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  UGX {(simulatedSurplus / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
