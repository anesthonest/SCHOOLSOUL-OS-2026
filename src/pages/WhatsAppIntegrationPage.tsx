import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  CheckCheck,
  FileCode,
  Phone,
  Bot,
  Sliders,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getWhatsAppLogs, sendWhatsAppNotification } from '../services/communicationApi';
import type { WhatsAppLog } from '../types';

export const WhatsAppIntegrationPage: React.FC = () => {
  const [waLogs, setWaLogs] = useState<WhatsAppLog[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('report_card_ready_v1');
  const [phone, setPhone] = useState('+256772123456');
  const [name, setName] = useState('Mugisha David');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const logs = await getWhatsAppLogs();
      setWaLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  const templates = [
    {
      id: 'report_card_ready_v1',
      title: 'Terminal Report Card Release Notice',
      body: 'Dear {{1}}, {{2}}\'s Term 1 Report Card is ready on SchoolSoul. Click button below to view report.',
      buttons: ['View Report Card', 'Pay Fee Balance'],
    },
    {
      id: 'fee_reminder_urgent_v2',
      title: 'Fee Balance Payment Reminder',
      body: 'Dear {{1}}, Outstanding fee balance for {{2}} is UGX {{3}}. Please process payment via Airtel/MTN Money.',
      buttons: ['Pay Mobile Money', 'Contact Bursar'],
    },
    {
      id: 'ptm_invitation_v1',
      title: 'Parent-Teacher Meeting Invitation',
      body: 'You are cordially invited to Vinexsah High School PTM on Friday Aug 5th. Book teacher slot now.',
      buttons: ['Book Time Slot', 'Decline'],
    },
  ];

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const tpl = templates.find((t) => t.id === selectedTemplate) || templates[0];
      await sendWhatsAppNotification(phone, name, tpl.id, tpl.body, tpl.buttons);
      alert('WhatsApp Business API notification dispatched!');
      await loadLogs();
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
          <MessageCircle className="w-5 h-5 text-emerald-400" /> WhatsApp Business API Framework & Broadcast Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interactive WhatsApp templates, click-to-chat links, interactive quick reply buttons & delivery tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selector & Dispatch */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Dispatch WhatsApp Template
          </h3>

          <form onSubmit={handleSendWhatsApp} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Approved Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Parent Phone (+256...)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Parent Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Template Card Preview */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Template Preview
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {templates.find((t) => t.id === selectedTemplate)?.body}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {templates
                  .find((t) => t.id === selectedTemplate)
                  ?.buttons.map((b, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30"
                    >
                      🔘 {b}
                    </span>
                  ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" /> Send WhatsApp Message
            </button>
          </form>
        </div>

        {/* WhatsApp Logs */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">WhatsApp Delivery & Status Log</h3>
          <div className="space-y-3">
            {waLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.recipientName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{log.recipientPhone}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold text-[10px] flex items-center gap-1 border border-sky-500/20">
                    <CheckCheck className="w-3 h-3" /> {log.providerStatus}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{log.messageContent}</p>
                {log.interactiveButtons && (
                  <div className="flex gap-2 pt-1">
                    {log.interactiveButtons.map((btn, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded">
                        {btn}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
