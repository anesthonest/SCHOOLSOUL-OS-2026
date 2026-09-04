import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { NewsArticle } from '../../types';

export const NewsMediaCentrePage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NewsArticle['category']>('School News');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const data = await v9PublicEngagementApi.getNewsArticles();
    setArticles(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    await v9PublicEngagementApi.createNewsArticle({
      title,
      category,
      author: 'Media Desk',
      summary,
      content: content || summary,
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'Published',
      isFeatured: false,
    });

    setTitle('');
    setSummary('');
    setContent('');
    setShowModal(false);
    loadArticles();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5" /> Module 7: News & Media Publishing Desk
            </span>
            <span className="text-xs text-slate-400">Press Releases & Success Stories</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            School News, Press Releases & Media Hub
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Publish official announcements, academic achievements, student spotlights, and press releases to the public website.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Publish Article / News
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  {art.category}
                </span>

                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-pink-400" /> {art.views} Views
                </span>
              </div>

              <h2 className="text-base font-bold text-white">{art.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{art.summary}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>By {art.author}</span>
              <span className="font-mono text-[11px]">{art.publishedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-pink-400" /> Publish School Article
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Science Fair Gold Medal Winners"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="School News">School News</option>
                  <option value="Press Release">Press Release</option>
                  <option value="Success Story">Success Story</option>
                  <option value="Student Spotlight">Student Spotlight</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief 2-sentence summary for main page..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
