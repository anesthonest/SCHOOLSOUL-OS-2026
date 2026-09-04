import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Plus,
  Shield,
  ExternalLink,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { SchoolPolicy } from '../types';

export const PolicyDocumentCentrePage: React.FC = () => {
  const [policies, setPolicies] = useState<SchoolPolicy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    title: '',
    code: `POL-${Date.now().toString().slice(-4)}`,
    category: 'Safeguarding' as SchoolPolicy['category'],
    summary: '',
    documentUrl: '#',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
    approvedBy: 'Board of Governors',
    version: '1.0',
    mandatoryReadForRoles: ['All Teachers', 'Staff'],
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await v7Api.getSchoolPolicies();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load policies, using fallback empty array:', err);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) return;

    try {
      const created = await v7Api.saveSchoolPolicy({
        ...formData,
        status: 'Active',
      });

      setPolicies([created, ...(policies || [])]);
      setShowModal(false);
      setFormData({
        title: '',
        code: `POL-${Date.now().toString().slice(-4)}`,
        category: 'Safeguarding',
        summary: '',
        documentUrl: '#',
        effectiveDate: new Date().toISOString().split('T')[0],
        reviewDate: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
        approvedBy: 'Board of Governors',
        version: '1.0',
        mandatoryReadForRoles: ['All Teachers', 'Staff'],
      });
    } catch (err) {
      console.error('Error creating policy document:', err);
    }
  };

  const filtered = (policies || []).filter((p) => {
    if (!p) return false;
    const title = p.title || '';
    const code = p.code || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 rounded-2xl border border-purple-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            <span>SchoolSoul Governance, Policy & Compliance Repository</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Policy & Document Centre</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Central repository for Board-approved school policies, safeguarding charters, MoES guidelines, staff codes of conduct, and mandatory read acknowledgments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Policy Document</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Active Policies</span>
          <p className="text-2xl font-black text-white mt-1">{(policies || []).length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Mandatory Safeguarding</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {(policies || []).filter((p) => p && p.category === 'Safeguarding').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">MoES / UNEB Guidelines</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {(policies || []).filter((p) => p && p.category === 'Academic').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Staff Acknowledgment Rate</span>
          <p className="text-2xl font-black text-sky-400 mt-1">98.4%</p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search policy title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl focus:outline-none w-full md:w-auto"
        >
          <option value="All">All Categories</option>
          <option value="Safeguarding">Safeguarding</option>
          <option value="Academic">Academic</option>
          <option value="HR & Conduct">HR & Conduct</option>
          <option value="Health & Safety">Health & Safety</option>
          <option value="Finance & Procurement">Finance & Procurement</option>
          <option value="Data Protection & Privacy">Data Protection & Privacy</option>
        </select>
      </div>

      {/* Policy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => {
          const roles = p.mandatoryReadForRoles || p.targetRoles || [];
          const summaryText = p.summary || p.description || 'Board-approved institutional policy document.';
          const codeText = p.code || 'POL-DOC';
          const approvedText = p.approvedBy || p.author || 'Board of Governors';
          return (
            <div key={p.id || Math.random().toString()} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-purple-400">{codeText}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-800">
                      {p.category || 'General'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{p.title || 'Untitled Policy'}</h3>
                </div>

                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  v{p.version || '1.0'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                {summaryText}
              </p>

              {roles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {roles.map((role) => (
                    <span key={role} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Mandatory: {role}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                <span>Approved by: {approvedText}</span>
                <button className="px-2.5 py-1 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-xs font-semibold flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-400" />
                <span>Publish Policy Document</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Policy Document Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Child Protection & Student Safeguarding Charter"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Safeguarding">Safeguarding</option>
                    <option value="Academic">Academic</option>
                    <option value="HR & Conduct">HR & Conduct</option>
                    <option value="Health & Safety">Health & Safety</option>
                    <option value="Finance & Procurement">Finance & Procurement</option>
                    <option value="Data Protection & Privacy">Data Protection & Privacy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Approved By</label>
                  <input
                    type="text"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Policy Executive Summary</label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Provide brief outline of scope, compliance mandate, and enforcement..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Publish Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
