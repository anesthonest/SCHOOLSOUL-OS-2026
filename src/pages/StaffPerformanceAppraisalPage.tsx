import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  Search,
  Plus,
  CheckCircle,
  FileText,
  UserCheck,
  Star,
  Target,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { StaffAppraisal } from '../types';

export const StaffPerformanceAppraisalPage: React.FC = () => {
  const [appraisals, setAppraisals] = useState<StaffAppraisal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    staffId: 'STF-001',
    staffName: 'Grace Nalubega',
    department: 'Mathematics',
    academicTerm: 'Term 2 2026',
    teachingExcellenceScore: 4,
    studentResultsScore: 5,
    punctualityScore: 4,
    professionalismScore: 5,
    keyStrengths: 'Excellent curriculum delivery and student engagement',
    areasForGrowth: 'Integration of digital science simulations',
    appraiserName: 'Dr. John Baptist (Headteacher)',
  });

  useEffect(() => {
    loadAppraisals();
  }, []);

  const loadAppraisals = async () => {
    setLoading(true);
    const data = await v7Api.getAppraisals();
    setAppraisals(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const overall = (
      (formData.teachingExcellenceScore +
        formData.studentResultsScore +
        formData.punctualityScore +
        formData.professionalismScore) /
      4
    ).toFixed(1);

    const created = await v7Api.saveAppraisal({
      ...formData,
      overallRating: parseFloat(overall),
      status: 'Finalized',
      appraisalDate: new Date().toISOString().split('T')[0],
    });

    setAppraisals([created, ...appraisals]);
    setShowModal(false);
  };

  const filtered = appraisals.filter(
    (a) =>
      a.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 p-6 rounded-2xl border border-indigo-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>SchoolSoul Teacher Performance & Appraisal Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Staff Appraisals & Performance</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Conduct termly teacher performance evaluations, assess pedagogical quality, track student output metrics, and set professional growth targets.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Staff Appraisal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Appraisals Conducted</span>
          <p className="text-2xl font-black text-white mt-1">{appraisals.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Average Performance Rating</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">4.6 / 5.0</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Exceeding Expectations</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">85%</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Completed This Term</span>
          <p className="text-2xl font-black text-purple-400 mt-1">100%</p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {a.academicTerm}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{a.staffName}</h3>
                <p className="text-xs text-slate-400">{a.department} Department</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">Overall Rating</span>
                <span className="text-lg font-black text-amber-400 flex items-center gap-1 justify-end">
                  <Star className="w-4 h-4 fill-amber-400" /> {a.overallRating} / 5.0
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>Teaching Excellence: <strong className="text-indigo-400">{a.teachingExcellenceScore}/5</strong></div>
              <div>Student Results: <strong className="text-indigo-400">{a.studentResultsScore}/5</strong></div>
              <div>Punctuality: <strong className="text-indigo-400">{a.punctualityScore}/5</strong></div>
              <div>Professionalism: <strong className="text-indigo-400">{a.professionalismScore}/5</strong></div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">Key Strengths</span>
              <p className="text-slate-300">{a.keyStrengths}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Appraiser: {a.appraiserName}</span>
              <span>Date: {a.appraisalDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <span>New Staff Performance Evaluation</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Staff Name & Department</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.staffName}
                    onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    placeholder="Staff Name"
                    required
                  />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    placeholder="Department"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Teaching Excellence (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.teachingExcellenceScore}
                    onChange={(e) => setFormData({ ...formData, teachingExcellenceScore: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Student Results (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.studentResultsScore}
                    onChange={(e) => setFormData({ ...formData, studentResultsScore: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Key Strengths & Achievements</label>
                <textarea
                  rows={2}
                  value={formData.keyStrengths}
                  onChange={(e) => setFormData({ ...formData, keyStrengths: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
