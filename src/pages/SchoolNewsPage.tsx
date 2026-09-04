import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, CheckCircle2, Clock, Eye, User, Sparkles } from 'lucide-react';
import { getNewsArticles, createNewsArticle, approveAndPublishNews } from '../services/communicationApi';
import type { SchoolNewsArticle } from '../types';

export const SchoolNewsPage: React.FC = () => {
  const [articles, setArticles] = useState<SchoolNewsArticle[]>([]);
  const [activeTab, setActiveTab] = useState<'Published' | 'Pending Approval' | 'Draft'>('Published');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SchoolNewsArticle['category']>('Academic Achievements');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await getNewsArticles();
      setArticles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await createNewsArticle({
        title,
        category,
        summary,
        content,
        authorName: 'Tr. Sarah Akello',
        authorRole: 'Teacher',
        status: 'Pending Approval',
      });

      setShowModal(false);
      setTitle('');
      setSummary('');
      setContent('');
      await loadNews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAndPublishNews(id, 'Dr. Joseph Mukasa (Headteacher)');
      await loadNews();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = articles.filter((a) => a.status === activeTab);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-sky-400" /> School News Publishing & Editorial Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish campus stories, achievements, photos & manage teacher submission approval workflow.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" /> Submit News Article
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        {['Published', 'Pending Approval', 'Draft'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab} Articles
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((art) => (
          <div key={art.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <img
                src={art.featuredImageUrl}
                alt={art.title}
                className="w-full h-40 object-cover rounded-2xl border border-slate-800"
              />

              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 font-bold text-[10px]">
                {art.category}
              </span>

              <h3 className="text-sm font-bold text-white line-clamp-2">{art.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{art.summary || art.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>By {art.authorName}</span>
              {art.status === 'Pending Approval' ? (
                <button
                  onClick={() => handleApprove(art.id)}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                </button>
              ) : (
                <span className="flex items-center gap-1 font-mono text-slate-500">
                  <Eye className="w-3 h-3 text-sky-400" /> {art.viewsCount} views
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Article Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-lg space-y-4">
            <h3 className="text-sm font-bold text-white">Submit News Article for Approval</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior 4 Students Excel in Regional Debate League"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Summary / Lead Paragraph</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary sentence..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Full Article Content</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Full article content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                />
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
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
