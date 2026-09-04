import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Send,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Filter,
  RefreshCw,
  Sliders,
  Layers,
  PhoneCall,
  Clock,
  Zap,
} from 'lucide-react';
import { getSmsLogs, sendSingleSms, sendBatchSms } from '../services/communicationApi';
import type { SmsLog } from '../types';

export const SmsEnginePage: React.FC = () => {
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispatch Form State
  const [recipientScope, setRecipientScope] = useState<'individual' | 'class' | 'school'>('individual');
  const [phoneInput, setPhoneInput] = useState('+256772123456');
  const [nameInput, setNameInput] = useState('Mugisha David');
  const [messageContent, setMessageContent] = useState('Vinexsah High School: Term 1 Parent-Teacher Consultative Meeting will be held on Friday Aug 5th.');
  const [selectedProvider, setSelectedProvider] = useState<'AfricasTalking' | 'Twilio' | 'AirtelUganda' | 'MtnUganda'>('AfricasTalking');
  const [triggerType, setTriggerType] = useState<SmsLog['triggerType']>('Manual');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const logs = await getSmsLogs();
      setSmsLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    const costPerSms = selectedProvider === 'AirtelUganda' || selectedProvider === 'MtnUganda' ? 30 : 35;
    const count = recipientScope === 'individual' ? 1 : recipientScope === 'class' ? 60 : 450;
    return count * costPerSms;
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    setIsSending(true);
    try {
      if (recipientScope === 'individual') {
        await sendSingleSms(phoneInput, nameInput, messageContent, selectedProvider, triggerType);
      } else {
        const mockRecipients = Array.from({ length: recipientScope === 'class' ? 60 : 450 }).map((_, i) => ({
          phone: `+25677${(100000 + i).toString()}`,
          name: `Guardian ${i + 1}`,
        }));
        await sendBatchSms(mockRecipients, messageContent, selectedProvider, triggerType);
      }

      alert('SMS successfully queued and dispatched to telecom gateway!');
      setMessageContent('');
      await loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" /> Multi-Provider SMS Engine & Gateway Framework
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Offline-resilient SMS dispatch, automated triggers, telecom provider fallback & cost estimation.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:text-white flex items-center gap-2 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
        </button>
      </div>

      {/* Top Provider Status Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'Africa\'s Talking', status: 'Active (Primary)', rate: 'UGX 35 / SMS', icon: '🌍' },
          { name: 'MTN Uganda SMS', status: 'Active (Direct)', rate: 'UGX 30 / SMS', icon: '🟡' },
          { name: 'Airtel Uganda SMS', status: 'Active (Direct)', rate: 'UGX 30 / SMS', icon: '🔴' },
          { name: 'Twilio Gateway', status: 'Fallback Ready', rate: '$ 0.015 / SMS', icon: '⚡' },
        ].map((prov, i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>{prov.icon} {prov.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[10px] text-emerald-400 font-bold">{prov.status}</p>
            <p className="text-[11px] text-slate-400 font-mono pt-1">{prov.rate}</p>
          </div>
        ))}
      </div>

      {/* Dispatch Panel + Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatch Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Compose & Send SMS
          </h3>

          <form onSubmit={handleSendSms} className="space-y-4 text-xs">
            {/* Target Scope */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">Target Audience Scope</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'individual', label: 'Single Parent' },
                  { id: 'class', label: 'Class Stream' },
                  { id: 'school', label: 'Entire School' },
                ].map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setRecipientScope(s.id as any)}
                    className={`py-2 rounded-xl font-bold transition-all border ${
                      recipientScope === s.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Details if single */}
            {recipientScope === 'individual' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Recipient Phone</label>
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Parent Name</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Provider Selector */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">Gateway Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as any)}
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="AfricasTalking">Africa's Talking SMS API (Primary)</option>
                <option value="MtnUganda">MTN Uganda Direct Bulk SMS</option>
                <option value="AirtelUganda">Airtel Uganda Telecom Gateway</option>
                <option value="Twilio">Twilio Global Gateway</option>
              </select>
            </div>

            {/* Message Content */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">SMS Content ({messageContent.length} / 160 chars)</label>
              <textarea
                required
                rows={4}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              />
            </div>

            {/* Cost Estimator Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Dispatch Cost</span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  UGX {calculateTotalCost().toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {recipientScope === 'individual' ? '1 Recipient' : recipientScope === 'class' ? '60 Recipients' : '450 Recipients'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Dispatch SMS Broadcast
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: SMS Logs Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent SMS Gateway Logs</h3>
            <span className="text-xs text-slate-400 font-mono">Total Sent: {smsLogs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Message Preview</th>
                  <th className="p-3">Trigger</th>
                  <th className="p-3 text-right">Cost (UGX)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {smsLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <p className="font-bold text-white">{log.recipientName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.recipientPhone}</p>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300">{log.provider}</td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">{log.messageText}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                        {log.triggerType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">{log.costUGX}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
