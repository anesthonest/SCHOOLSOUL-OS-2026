import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Layers,
  PieChart,
  Building2,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';
import type { ResourceUtilizationRecord } from '../types';

export const SchoolPerformanceAnalyticsPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceUtilizationRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await v8IntelligenceApi.getResourceUtilizations();
    setResources(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Multi-Dimensional Analytics
            </span>
            <span className="text-xs text-slate-400">Cross-Vision Operations</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            School Performance & Resource Intelligence
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Cross-analysis matrices across terms, classes, departments, ICT laboratories, library circulation, and fleet occupancy.
          </p>
        </div>
      </div>

      {/* Cross Analysis Performance Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" /> Academic & Operations Cross-Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Class / Cohort</th>
                <th className="p-3">Enrolment</th>
                <th className="p-3">Attendance %</th>
                <th className="p-3">Academic Pass %</th>
                <th className="p-3">Fee Paid %</th>
                <th className="p-3">Parent App Use</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-bold text-white">Primary 7 Candidate Class</td>
                <td className="p-3">120</td>
                <td className="p-3 text-emerald-400 font-mono">96.8%</td>
                <td className="p-3 text-purple-400 font-mono">94.5%</td>
                <td className="p-3 text-emerald-400 font-mono">92.0%</td>
                <td className="p-3">88.0%</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Optimal</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-bold text-white">Senior 3 (O-Level)</td>
                <td className="p-3">145</td>
                <td className="p-3 text-amber-400 font-mono">88.2%</td>
                <td className="p-3 text-blue-400 font-mono">84.0%</td>
                <td className="p-3 text-amber-400 font-mono">81.5%</td>
                <td className="p-3">74.2%</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">Needs Support</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-bold text-white">Senior 4 Candidate Class</td>
                <td className="p-3">130</td>
                <td className="p-3 text-emerald-400 font-mono">95.4%</td>
                <td className="p-3 text-purple-400 font-mono">91.8%</td>
                <td className="p-3 text-rose-400 font-mono">78.2%</td>
                <td className="p-3">82.1%</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400">Fee Alert</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-bold text-white">Senior 6 (A-Level Arts & Science)</td>
                <td className="p-3">95</td>
                <td className="p-3 text-emerald-400 font-mono">98.1%</td>
                <td className="p-3 text-purple-400 font-mono">96.2%</td>
                <td className="p-3 text-emerald-400 font-mono">94.8%</td>
                <td className="p-3">90.5%</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">High Growth</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Utilization Intelligence Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" /> Facility & Resource Utilization Intelligence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{res.category}</span>
                  <h3 className="text-sm font-bold text-white">{res.resourceName}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    res.conditionStatus === 'Overcrowded'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : res.conditionStatus === 'Optimal'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {res.conditionStatus} ({res.currentUtilizationPercentage}%)
                </span>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    res.currentUtilizationPercentage > 90
                      ? 'bg-rose-500'
                      : res.currentUtilizationPercentage > 75
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${res.currentUtilizationPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Capacity: <strong className="text-white">{res.capacity}</strong></span>
                <span>Peak Hours: <strong className="text-purple-300 font-mono">{res.peakHours}</strong></span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="text-purple-300 font-bold block mb-0.5">AI Optimization Recommendation:</span>
                {res.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
