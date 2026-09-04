import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Pin,
  Calendar,
  Tag,
  Filter,
  Trash2,
  Send,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { getAnnouncements, createAnnouncement } from '../services/communicationApi';
import type { Announcement } from '../types';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('General');
  const [audienceScope, setAudienceScope] = useState<Announcement['audienceScope']>('All');
  const [classGrade, setClassGrade] = useState('Senior 1');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [smsTriggered, setSmsTriggered] = useState(false);
  const [expiryDate, setExpiryDate] = useState('2026-08-30');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await createAnnouncement({
        title,
        category,
        audienceScope,
        classGrade: audienceScope === 'SpecificClass' ? classGrade : undefined,
        content,
        isPinned,
        smsTriggered,
        expiryDate,
      });

      setShowModal(false);
      setTitle('');
      setContent('');
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = announcements.filter(
    (a) => filterCategory === 'All' || a.category === filterCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" /> Announcement Centre & Official Notice Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish targeted notices for parents, students and staff with optional instant SMS trigger dispatches.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" /> Create New Announcement
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        {['All', 'General', 'Academics', 'Events', 'Exams', 'Sports', 'Emergencies', 'Holidays'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl transition-all border ${
              filterCategory === cat
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-3xl border transition-all space-y-3 relative ${
              item.isPinned
                ? 'bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border-purple-500/50 shadow-xl'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            {item.isPinned && (
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 flex items-center gap-1">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-400 font-bold text-[10px]">
                {item.category}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Scope: {item.audienceScope} {item.classGrade ? `(${item.classGrade})` : ''}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white pr-16">{item.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
              <span>By: <strong className="text-white">{item.authorName}</strong></span>
              <span className="font-mono">Expires: {item.expiryDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-lg space-y-4">
            <h3 className="text-sm font-bold text-white">Create Official Announcement</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., End of Term 1 Examinations Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    {['General', 'Academics', 'Events', 'Exams', 'Sports', 'Emergencies', 'Holidays'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Audience Scope</label>
                  <select
                    value={audienceScope}
                    onChange={(e) => setAudienceScope(e.target.value as any)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    <option value="All">All School</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Staff">Staff Only</option>
                    <option value="SpecificClass">Specific Class Grade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Announcement Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write clear, concise details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span className="text-white font-bold">Pin to Top of Noticeboard</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsTriggered}
                    onChange={(e) => setSmsTriggered(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span className="text-amber-400 font-bold">Auto-Dispatch SMS Alert</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
