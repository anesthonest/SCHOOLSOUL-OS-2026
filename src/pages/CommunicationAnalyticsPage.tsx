import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  Download,
  Users,
  Smartphone,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { getCommunicationAnalytics } from '../services/communicationApi';

export const CommunicationAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getCommunicationAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" /> Communication & Engagement Analytics Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep reporting on SMS delivery success rates, WhatsApp read rates, parent portal engagement & survey feedback.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" /> Export Analytics Report PDF
        </button>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SMS Delivery Rate
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {analytics.smsDeliveryRatePercent}%
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{analytics.totalSmsDispatched} SMS Total</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            WhatsApp Read Rate
          </span>
          <p className="text-2xl font-black text-sky-400 font-mono">
            {analytics.whatsAppReadRatePercent}%
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{analytics.totalWhatsAppMessages} Sent</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Parent Portal Active Frequency
          </span>
          <p className="text-2xl font-black text-purple-400 font-mono">
            {analytics.parentPortalActiveRatePercent}%
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Daily/Weekly Logins</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            PTM Attendance Rate
          </span>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {analytics.ptmAttendanceRatePercent}%
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Booked Slot Completion</span>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Multi-Channel Broadcast Performance Comparison
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1">
                <span>SMS Telecom Gateway</span>
                <span className="text-emerald-400 font-mono">98.4% Delivered</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="h-full bg-emerald-500 rounded-full w-[98.4%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1">
                <span>WhatsApp Business API</span>
                <span className="text-sky-400 font-mono">94.2% Read</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="h-full bg-sky-500 rounded-full w-[94.2%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1">
                <span>Parent Portal Push Notifications</span>
                <span className="text-purple-400 font-mono">88.6% Opened</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="h-full bg-purple-500 rounded-full w-[88.6%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Survey & Support SLA Performance
          </h3>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Parent Survey Participation:</span>
              <span className="text-amber-400 font-mono font-bold">{analytics.surveyParticipationPercent}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Helpdesk Ticket Resolution Avg:</span>
              <span className="text-emerald-400 font-mono font-bold">{analytics.helpdeskAvgResolutionHours} Hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Inquiries Processed:</span>
              <span className="text-white font-mono font-bold">{analytics.totalHelpTickets} Tickets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
