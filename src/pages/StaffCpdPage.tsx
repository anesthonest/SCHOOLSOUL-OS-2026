import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  Plus,
  Search,
  CheckCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { StaffCpdRecord } from '../types';

export const StaffCpdPage: React.FC = () => {
  const [cpdRecords, setCpdRecords] = useState<StaffCpdRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    staffId: 'STF-001',
    staffName: 'Grace Nalubega',
    courseTitle: 'Competence Based Curriculum (CBC) Advanced Pedagogy',
    providerOrg: 'Ministry of Education & Sports Uganda',
    cpdHours: 12,
    completionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadCpd();
  }, []);

  const loadCpd = async () => {
    setLoading(true);
    const data = await v7Api.getCpdRecords();
    setCpdRecords(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseTitle) return;

    const created = await v7Api.saveCpdRecord({
      ...formData,
      status: 'Verified',
      certificateRef: `CERT-CPD-${Date.now().toString().slice(-4)}`,
    });

    setCpdRecords([created, ...cpdRecords]);
    setShowModal(false);
  };

  const filtered = cpdRecords.filter(
    (c) =>
      c.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHours = cpdRecords.reduce((sum, c) => sum + c.cpdHours, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900 via-slate-900 to-purple-950 p-6 rounded-2xl border border-violet-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>SchoolSoul Teacher Professional Development & Training</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Staff CPD & Training</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Track teacher Continuing Professional Development (CPD) hours, pedagogy workshops, Ministry training certificates, and skill upgrades.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log CPD Training</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total CPD Courses Logged</span>
          <p className="text-2xl font-black text-white mt-1">{cpdRecords.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Training Hours</span>
          <p className="text-2xl font-black text-violet-400 mt-1">{totalHours} Hours</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Certificates Verified</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {cpdRecords.filter((c) => c.status === 'Verified').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">MoES CBC Compliant</span>
          <p className="text-2xl font-black text-purple-400 mt-1">100%</p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff or training course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Staff Member</th>
              <th className="p-3">Course / Workshop Title</th>
              <th className="p-3">Provider / Authority</th>
              <th className="p-3">CPD Hours</th>
              <th className="p-3">Certificate Ref</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/50">
                <td className="p-3 font-bold text-white">{c.staffName}</td>
                <td className="p-3 font-medium text-violet-300">{c.courseTitle}</td>
                <td className="p-3 text-slate-400">{c.providerOrg}</td>
                <td className="p-3 font-black text-white">{c.cpdHours} hrs</td>
                <td className="p-3 font-mono text-[11px] text-slate-400">{c.certificateRef || 'N/A'}</td>
                <td className="p-3">
                  <span className="text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                    {c.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500 font-mono text-[11px]">{c.completionDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-violet-400" />
                <span>Log CPD Training Certificate</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Staff Name</label>
                <input
                  type="text"
                  value={formData.staffName}
                  onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Course / Workshop Title</label>
                <input
                  type="text"
                  value={formData.courseTitle}
                  onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Training Provider</label>
                  <input
                    type="text"
                    value={formData.providerOrg}
                    onChange={(e) => setFormData({ ...formData, providerOrg: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CPD Hours Earned</label>
                  <input
                    type="number"
                    value={formData.cpdHours}
                    onChange={(e) => setFormData({ ...formData, cpdHours: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  Save Training Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
