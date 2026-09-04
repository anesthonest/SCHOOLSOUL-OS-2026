import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Globe,
  Users,
  DollarSign,
  Heart,
  Eye,
  Sparkles,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { PublicAnalyticsData } from '../../types';

export const PublicAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<PublicAnalyticsData | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await v9PublicEngagementApi.getPublicAnalytics();
    setStats(data);
  };

  if (!stats) return <div className="p-6 text-slate-400">Loading Analytics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Module 15: Public Analytics & Growth Insights
            </span>
            <span className="text-xs text-slate-400">Executive Engagement Dashboard</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Website Traffic, Admission Enquiries & Community Analytics
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time analytics measuring public reach, online admission requests, alumni activity, gallery views, and fundraising drive conversions.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Monthly Site Visitors</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.monthlyVisitors.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 font-bold">↑ +14% vs previous month</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Admission Enquiries</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.admissionEnquiriesThisMonth}</p>
          <p className="text-[10px] text-purple-300">Active leads for 2026 intake</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Total Donations Raised</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">${stats.totalDonationsRaised.toLocaleString()} USD</p>
          <p className="text-[10px] text-emerald-300">Crowdfunding & alumni drives</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Active Alumni Profiles</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.activeAlumniRegistered}</p>
          <p className="text-[10px] text-rose-300">Registered for mentorship</p>
        </div>
      </div>
    </div>
  );
};
