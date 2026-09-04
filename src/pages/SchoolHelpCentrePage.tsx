import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Plus,
  MessageCircle,
  CheckCircle2,
  Clock,
  Send,
  User,
  ShieldAlert,
  BookOpen,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  getHelpDeskTickets,
  createHelpTicket,
  replyHelpTicket,
  resolveHelpTicket,
} from '../services/communicationApi';
import type { HelpDeskTicket } from '../types';

export const SchoolHelpCentrePage: React.FC = () => {
  const [tickets, setTickets] = useState<HelpDeskTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<HelpDeskTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Form state
  const [category, setCategory] = useState<HelpDeskTicket['category']>('Fee Inquiry');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<HelpDeskTicket['priority']>('Medium');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await getHelpDeskTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    try {
      await createHelpTicket({
        category,
        subject,
        description,
        priority,
        requesterName: 'Mugisha David',
        requesterRole: 'Parent',
        requesterPhone: '+256772123456',
      });

      setShowCreateModal(false);
      setSubject('');
      setDescription('');
      await loadTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const updated = await replyHelpTicket(selectedTicket.id, 'Mugisha David', 'Parent', replyText);
      setSelectedTicket(updated);
      setReplyText('');
      await loadTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveHelpTicket(id);
      await loadTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-sky-400" /> Integrated School Helpdesk & Support Ticketing Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit inquiries regarding fees, academic progress, busing & IT access with tracked SLA response times.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" /> Open Support Ticket
        </button>
      </div>

      {/* Official User Guide Quick Link Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/50 to-slate-900 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white">Looking for the Official Operations Manual?</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 font-bold">Release 2026.1.0</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Read or download the complete SchoolSoul OS 2026.1.0 User Guideline Book PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => window.open('/api/docs/user-guide/open', '_blank', 'noopener,noreferrer')}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Guide PDF
          </button>
          <a
            href="/api/docs/user-guide/download"
            download="SchoolSoul_OS_User_Guideline_Book_2026.1.0.pdf"
            className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Download PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Your Support Tickets</h3>
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedTicket?.id === t.id
                  ? 'bg-sky-600/10 border-sky-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="font-mono text-sky-400">{t.ticketNumber}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                  {t.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1.5 truncate">{t.subject}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.category}</p>
            </div>
          ))}
        </div>

        {/* Selected Ticket Thread */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col min-h-[500px]">
          {selectedTicket ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400">{selectedTicket.ticketNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{selectedTicket.subject}</h3>
                </div>

                {selectedTicket.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolve(selectedTicket.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                )}
              </div>

              {/* Initial Request Description */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{selectedTicket.requesterName} ({selectedTicket.requesterRole})</span>
                  <span className="font-mono">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-200 pt-1 leading-relaxed">{selectedTicket.description}</p>
              </div>

              {/* Thread Replies */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
                {selectedTicket.replies.map((rep, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <strong className="text-sky-400">{rep.senderName} ({rep.role})</strong>
                      <span className="font-mono">{new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-200">{rep.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type reply to school staff..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-950 text-white text-xs px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a ticket to view conversation thread.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Open Support Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                >
                  {['Fee Inquiry', 'Academic Concern', 'Transport & Busing', 'IT & Portal Access', 'General Request'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mobile Money Receipt Clearance"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
