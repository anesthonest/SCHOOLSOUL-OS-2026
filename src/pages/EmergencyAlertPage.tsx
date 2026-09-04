import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Send,
  ShieldAlert,
  Radio,
  CheckCircle2,
  Bell,
  Clock,
  Smartphone,
  MessageCircle,
} from 'lucide-react';
import { getEmergencyAlerts, dispatchEmergencyAlert } from '../services/communicationApi';
import type { EmergencyAlertRecord } from '../types';

export const EmergencyAlertPage: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlertRecord[]>([]);
  const [sending, setSending] = useState(false);

  // Broadcast Form
  const [alertTitle, setAlertTitle] = useState('Unscheduled Early School Dismissal');
  const [emergencyType, setEmergencyType] = useState<EmergencyAlertRecord['emergencyType']>('Unscheduled School Closure');
  const [severity, setSeverity] = useState<'High' | 'Critical'>('Critical');
  const [messageContent, setMessageContent] = useState('EMERGENCY NOTICE: Due to severe flash flooding warnings along Jinja Road, school will dismiss at 01:00 PM today. School buses will pick up day scholars at 01:15 PM.');
  const [targetAudience, setTargetAudience] = useState<EmergencyAlertRecord['targetAudience']>('All Parents & Staff');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getEmergencyAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !messageContent.trim()) return;

    setSending(true);
    try {
      await dispatchEmergencyAlert(
        alertTitle,
        emergencyType,
        severity,
        messageContent,
        targetAudience,
        ['SMS', 'WhatsApp', 'Push Notification', 'In-App Alert']
      );

      alert('CRITICAL EMERGENCY BROADCAST DISPATCHED TO ALL CHANNELS (SMS, WHATSAPP, IN-APP)!');
      await loadAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" /> Emergency Alert & Crisis Broadcast System
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          High-priority instant broadcast overriding normal queues across SMS, WhatsApp, In-App alerts & Push notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-rose-900/50 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" /> Trigger Instant Crisis Broadcast
          </div>

          <form onSubmit={handleDispatch} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Emergency Title</label>
              <input
                type="text"
                required
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-rose-800/80 focus:outline-none focus:border-rose-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Emergency Type</label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value as any)}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                >
                  {['Security Incident', 'Severe Weather', 'Unscheduled School Closure', 'Health & Epidemic', 'Transport Emergency'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 text-rose-400 font-bold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                >
                  <option value="High">High Severity</option>
                  <option value="Critical">Critical Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="All Parents & Staff">All Parents & Staff</option>
                <option value="Boarding Parents">Boarding School Parents Only</option>
                <option value="Day Parents">Day Scholar Parents Only</option>
                <option value="All Staff Only">All Teaching & Non-Teaching Staff</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Broadcast Message</label>
              <textarea
                rows={4}
                required
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full bg-slate-950 text-white p-3 rounded-xl border border-rose-800/80 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 space-y-1">
              <span className="font-bold block">Active Multi-Channel Gateway Dispatch:</span>
              <p>✓ SMS Broadcast (Africa's Talking)</p>
              <p>✓ WhatsApp Business Alert</p>
              <p>✓ In-App Parent Portal Banner</p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 uppercase tracking-wider text-xs"
            >
              <Send className="w-4 h-4" /> Trigger Emergency Broadcast Now
            </button>
          </form>
        </div>

        {/* Emergency Broadcast Logs */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Emergency Broadcast Log History</h3>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="p-4 rounded-2xl bg-slate-950 border border-rose-900/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">
                      {a.severity}
                    </span>
                    <h4 className="font-bold text-white">{a.alertTitle}</h4>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {new Date(a.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{a.messageContent}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Sent By: <strong className="text-white">{a.sentBy}</strong></span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Delivered: {a.deliveredCount} / {a.totalRecipients} (99.1%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
