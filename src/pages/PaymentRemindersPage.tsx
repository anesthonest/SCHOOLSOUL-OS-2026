import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  XCircle,
  Smartphone,
  Mail,
  Printer,
} from 'lucide-react';
import {
  getPaymentReminders,
  getStudentFeeAccounts,
  sendPaymentReminder,
  formatUGX,
} from '../services/financeApi';
import type { PaymentReminder, StudentFeeAccount } from '../types';

export const PaymentRemindersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [accounts, setAccounts] = useState<StudentFeeAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [channel, setChannel] = useState<'SMS' | 'WhatsApp' | 'Email' | 'In-App'>('SMS');
  const [reminderType, setReminderType] = useState<'Upcoming Installment' | 'Overdue Fee Notice' | 'Custom Notice'>('Overdue Fee Notice');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rems, accs] = await Promise.all([
        getPaymentReminders(),
        getStudentFeeAccounts(),
      ]);
      setReminders(rems);
      setAccounts(accs);
      if (accs.length > 0 && !selectedStudentId) {
        const defaulter = accs.find((a) => a.outstandingBalanceUGX > 0) || accs[0];
        setSelectedStudentId(defaulter.studentId);
        setMessage(`DEAR PARENT: Outstanding school fee balance for ${defaulter.studentName} is ${formatUGX(defaulter.outstandingBalanceUGX)}. Please pay via Mobile Money. Thank you - SchoolSoul.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (stId: string) => {
    setSelectedStudentId(stId);
    const acc = accounts.find((a) => a.studentId === stId);
    if (acc) {
      setMessage(`DEAR PARENT: Outstanding school fee balance for ${acc.studentName} is ${formatUGX(acc.outstandingBalanceUGX)}. Please pay via Mobile Money. Thank you - SchoolSoul.`);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = accounts.find((a) => a.studentId === selectedStudentId);
    if (!student || !message.trim()) return;

    try {
      await sendPaymentReminder({
        studentId: student.studentId,
        studentName: student.studentName,
        parentPhone: '0772123456',
        outstandingBalanceUGX: student.outstandingBalanceUGX,
        dueDate: `${new Date().getFullYear()}-03-30`,
        reminderType,
        channel,
        message,
        status: 'Delivered',
        sentAt: new Date().toISOString(),
      });

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
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
            <Bell className="w-5 h-5 text-orange-400" /> Fee Payment Reminders Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch automated SMS, WhatsApp & Email fee notifications to parents of defaulting or upcoming installment students.
          </p>
        </div>

        <button
          id="btn-send-reminder"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2 self-start"
        >
          <Send className="w-4 h-4" /> Send Payment Notice
        </button>
      </div>

      {/* Reminders History Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
          Dispatched Fee Reminders Log ({reminders.length})
        </h2>

        {reminders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No fee reminders sent yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Notice Type</th>
                <th className="pb-3">Message Content</th>
                <th className="pb-3 text-right">Balance Notified</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {reminders.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-white">{r.studentName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{r.parentPhone}</div>
                  </td>
                  <td className="py-3 font-semibold text-orange-400">{r.channel}</td>
                  <td className="py-3 text-slate-300">{r.reminderType}</td>
                  <td className="py-3 text-slate-400 max-w-xs truncate">{r.message}</td>
                  <td className="py-3 text-right font-extrabold text-rose-400">
                    {formatUGX(r.outstandingBalanceUGX)}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Dispatch Reminder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-orange-400" /> Dispatch Fee Reminder
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Student Account</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.studentId} value={a.studentId}>
                      {a.studentName} ({formatUGX(a.outstandingBalanceUGX)} balance)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dispatch Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="SMS">SMS Message</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="In-App">In-App Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Notice Type</label>
                  <select
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Overdue Fee Notice">Overdue Fee Notice</option>
                    <option value="Upcoming Installment">Upcoming Installment</option>
                    <option value="Custom Notice">Custom Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Message Text</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md shadow-orange-600/30 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
