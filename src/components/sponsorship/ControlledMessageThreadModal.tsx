import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, Lock, User, Clock } from 'lucide-react';
import type { ControlledOpportunityMessage, RoleType } from '../../types';
import { SponsorshipService } from '../../services/sponsorshipService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
  threadTitle: string;
  sponsorId: string;
  sponsorName: string;
  currentUserName?: string;
  currentUserRole?: RoleType | 'SPONSOR';
}

export const ControlledMessageThreadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  threadId,
  threadTitle,
  sponsorId,
  sponsorName,
  currentUserName = 'School Administrator',
  currentUserRole = 'Super Administrator',
}) => {
  const [messages, setMessages] = useState<ControlledOpportunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && threadId) {
      loadMessages();
    }
  }, [isOpen, threadId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await SponsorshipService.getThreadMessages(threadId);
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const sent = await SponsorshipService.sendMessage({
        threadId,
        sponsorId,
        sponsorName,
        senderType: currentUserRole === 'SPONSOR' ? 'SPONSOR' : 'SCHOOL_ADMIN',
        senderName: currentUserName,
        recipientDescription: `Supervised Opportunity Channel (${sponsorName})`,
        subject: `Update on ${threadTitle}`,
        content: newMessage.trim(),
      });
      setMessages([...messages, sent]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{threadTitle}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Moderated Channel
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Between {sponsorName} and School Administration Oversight</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading moderated thread history...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No messages in this supervised thread yet. Start the conversation below.
            </div>
          ) : (
            messages.map(msg => {
              const isSender = msg.senderName === currentUserName;
              return (
                <div key={msg.id} className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                    <span>({msg.senderType})</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isSender
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Safeguarding notice & Input */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2.5">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>All communications are permanently archived in the SchoolSoul audit vault.</span>
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type message to sponsor / school authorities..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
