import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Smartphone,
  MessageCircle,
  HelpCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  BarChart2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const CommunicationDashboardsPage: React.FC = () => {
  const [roleView, setRoleView] = useState<'Headteacher' | 'Teacher' | 'Parent'>('Headteacher');

  return (
    <div className="space-y-6 pb-12">
      {/* Role Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-400" /> Multi-Role Communication & Engagement Dashboards
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tailored analytics & action centers for Headteacher leadership, Teachers, and Parents.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start">
          {(['Headteacher', 'Teacher', 'Parent'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleView(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleView === role
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {role} View
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: HEADTEACHER DASHBOARD */}
      {roleView === 'Headteacher' && (
        <div className="space-y-6">
          {/* Executive Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Parent Engagement Index
              </span>
              <p className="text-2xl font-black text-emerald-400 font-mono">88.6%</p>
              <span className="text-[10px] text-emerald-500 font-bold">+4.2% from last month</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SMS Telecom Costs (Term)
              </span>
              <p className="text-2xl font-black text-amber-400 font-mono">UGX 420,000</p>
              <span className="text-[10px] text-slate-500 font-mono">12,000 SMS Dispatched</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                WhatsApp Delivery Rate
              </span>
              <p className="text-2xl font-black text-sky-400 font-mono">94.2%</p>
              <span className="text-[10px] text-slate-500 font-mono">Read Receipt Verification</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PTM Parent Attendance
              </span>
              <p className="text-2xl font-black text-purple-400 font-mono">91.0%</p>
              <span className="text-[10px] text-slate-500 font-mono">185 Meetings Booked</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                SMS vs WhatsApp Provider Dispatch Volume
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>Africa's Talking SMS API</span>
                    <span>6,200 SMS (51.6%)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[51.6%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>MTN Uganda Direct Bulk</span>
                    <span>3,400 SMS (28.3%)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[28.3%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>Airtel Uganda SMS</span>
                    <span>2,400 SMS (20.1%)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[20.1%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Helpdesk Resolution Metrics
              </h3>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Average Ticket Resolution SLA:</span>
                  <strong className="text-emerald-400 font-mono">2.4 Hours</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Support Tickets Term 1:</span>
                  <strong className="text-white font-mono">142 Tickets</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolved Rate:</span>
                  <strong className="text-sky-400 font-mono">98.5%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TEACHER DASHBOARD */}
      {roleView === 'Teacher' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Pending Parent Conversations
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="font-bold text-white">Mr. Mugisha David (Emmanuel's Father)</p>
                <p className="text-slate-400 text-[11px] truncate">Inquiring about Physics homework submission date.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Upcoming PTM Consultative Slots
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-white">09:15 AM - Mr. Mugisha David</p>
                <p className="text-slate-400">Student: Mugisha Emmanuel (Senior 1 North)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                Confirmed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PARENT DASHBOARD */}
      {roleView === 'Parent' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Parent Action & Notification Feed
          </h3>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <p className="font-bold text-white">Mugisha Emmanuel (Senior 1 North)</p>
            <p className="text-slate-400">✓ Attendance recorded on time today at 07:15 AM.</p>
            <p className="text-slate-400">✓ Biology homework assigned (Due Monday).</p>
          </div>
        </div>
      )}
    </div>
  );
};
