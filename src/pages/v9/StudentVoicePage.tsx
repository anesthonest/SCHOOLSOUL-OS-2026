import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Plus,
  CheckCircle,
  Clock,
  ThumbsUp,
  Award,
  Filter,
  ShieldAlert,
  Send,
  Eye,
  BookOpen,
  Camera,
  Lightbulb,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { StudentVoiceItem } from '../../types';

export const StudentVoicePage: React.FC = () => {
  const [items, setItems] = useState<StudentVoiceItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StudentVoiceItem['category']>('Idea');
  const [content, setContent] = useState('');
  const [studentName, setStudentName] = useState('Amina Kwame');
  const [grade, setGrade] = useState('Form 4 Science');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await v9PublicEngagementApi.getVoiceItems();
    setItems(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    await v9PublicEngagementApi.createVoiceItem({
      studentId: `std-${Date.now()}`,
      studentName,
      grade,
      title,
      category,
      content,
      status: 'Pending Review',
    });

    setTitle('');
    setContent('');
    setShowNewModal(false);
    loadItems();
  };

  const handleStatusChange = async (id: string, newStatus: StudentVoiceItem['status']) => {
    await v9PublicEngagementApi.updateVoiceStatus(id, newStatus, 'Moderated by Teacher/Patron');
    loadItems();
  };

  const filteredItems = items.filter((item) => {
    const catMatch = activeCategory === 'All' || item.category === activeCategory;
    const statusMatch = activeStatus === 'All' || item.status === activeStatus;
    return catMatch && statusMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Module 1: Student Voice Platform
            </span>
            <span className="text-xs text-slate-400">Moderated & Safeguarded</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Student Voice, Ideas & Creative Submissions
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Empowering students to publish ideas, school improvement proposals, articles, photography, and science innovations under teacher supervision.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Submit Idea / Proposal
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-purple-400" /> Category:
          </span>
          {['All', 'Idea', 'Proposal', 'Creative Writing', 'Science Project', 'Innovation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published (Public)</option>
            <option value="Pending Review">Pending Teacher Review</option>
            <option value="Draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {item.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'Published'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : item.status === 'Pending Review'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h2 className="text-sm font-bold text-white line-clamp-2">{item.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">{item.content}</p>

              {item.teacherFeedback && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-purple-300 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-purple-400">
                    <ShieldAlert className="w-3 h-3" /> Teacher Feedback:
                  </span>
                  <span>{item.teacherFeedback}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium text-slate-200">By {item.studentName} ({item.grade})</span>
                {item.badgeEarned && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1 text-[10px]">
                    <Award className="w-3 h-3" /> {item.badgeEarned}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-slate-400">
                    <ThumbsUp className="w-3 h-3 text-purple-400" /> {item.likesCount}
                  </span>
                  <span>{item.createdAt}</span>
                </span>

                {/* Moderation Controls */}
                {item.status === 'Pending Review' && (
                  <button
                    onClick={() => handleStatusChange(item.id, 'Published')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-bold text-[10px] cursor-pointer"
                  >
                    Approve & Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Submission Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-400" /> Submit Student Proposal or Article
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Student Name & Grade</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Idea">Idea / Proposal</option>
                  <option value="Article">Article</option>
                  <option value="Creative Writing">Creative Writing / Poem</option>
                  <option value="Science Project">Science Project</option>
                  <option value="Innovation">Innovation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Food Waste Composting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Description / Proposal Content</label>
                <textarea
                  rows={4}
                  placeholder="Describe your proposal, objectives, and required materials..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
                Note: Submissions pass through teacher moderation before appearing on the school public website.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
