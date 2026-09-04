import React, { useState, useEffect } from 'react';
import {
  Award,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle,
  ThumbsUp,
  Ban,
  Bell,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { BehaviourRecord } from '../types';

export const BehaviourDisciplinePage: React.FC = () => {
  const [records, setRecords] = useState<BehaviourRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    studentId: 'STU-1005',
    studentName: 'Daniel Tumusiime',
    classGrade: 'Senior 3 Red',
    type: 'Positive Commendation' as BehaviourRecord['type'],
    category: 'Merit Points' as BehaviourRecord['category'],
    points: 10,
    description: '',
    sanctionOrReward: 'House Commendation & Certificate',
    parentNotified: true,
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const data = await v7Api.getBehaviourRecords();
    setRecords(data);
    setLoading(false);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    const created = await v7Api.saveBehaviourRecord({
      ...formData,
      status: formData.type === 'Positive Commendation' ? 'Award Issued' : 'Pending Review',
      recordedBy: 'Mugisha Patrick (House Master)',
    });

    setRecords([created, ...records]);
    setShowModal(false);
    setFormData({
      studentId: 'STU-1005',
      studentName: 'Daniel Tumusiime',
      classGrade: 'Senior 3 Red',
      type: 'Positive Commendation',
      category: 'Merit Points',
      points: 10,
      description: '',
      sanctionOrReward: 'House Commendation & Certificate',
      parentNotified: true,
    });
  };

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.classGrade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalMerits = records.filter((r) => r.type === 'Positive Commendation').reduce((sum, r) => sum + r.points, 0);
  const totalDemerits = records.filter((r) => r.type === 'Incident Violation').reduce((sum, r) => sum + Math.abs(r.points), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-orange-950 p-6 rounded-2xl border border-amber-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>SchoolSoul Behaviour, Merits & Discipline Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Behaviour & Discipline</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Manage positive commendations, merit points, conduct warnings, detentions, restorative meetings, and automated parent notifications.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Behaviour / Merit</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Commendations</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {records.filter((r) => r.type === 'Positive Commendation').length}
          </p>
          <span className="text-[10px] text-amber-400 font-medium">+{totalMerits} Merit Points</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Incident Violations</span>
          <p className="text-2xl font-black text-rose-400 mt-1">
            {records.filter((r) => r.type === 'Incident Violation').length}
          </p>
          <span className="text-[10px] text-rose-400 font-medium">-{totalDemerits} Demerit Points</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Parents Notified</span>
          <p className="text-2xl font-black text-sky-400 mt-1">
            {records.filter((r) => r.parentNotified).length}
          </p>
          <span className="text-[10px] text-sky-400 font-medium">SMS / App Alert sent</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Restorative Meetings</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {records.filter((r) => r.category === 'Restorative Meeting').length}
          </p>
          <span className="text-[10px] text-emerald-400 font-medium font-bold">Resolved constructively</span>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl focus:outline-none w-full md:w-auto"
        >
          <option value="All">All Types</option>
          <option value="Positive Commendation">Positive Commendations</option>
          <option value="Incident Violation">Incident Violations</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Student & Class</th>
              <th className="p-3">Type & Category</th>
              <th className="p-3">Points</th>
              <th className="p-3">Description</th>
              <th className="p-3">Reward / Sanction</th>
              <th className="p-3">Parent Alert</th>
              <th className="p-3">Logged By</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((r) => {
              const isPositive = r.type === 'Positive Commendation';
              return (
                <tr key={r.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-semibold text-white">
                    <div>{r.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{r.classGrade}</div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        isPositive ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {r.category}
                    </span>
                  </td>

                  <td className="p-3 font-black text-sm">
                    <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                      {isPositive ? `+${r.points}` : `-${Math.abs(r.points)}`}
                    </span>
                  </td>

                  <td className="p-3 max-w-xs text-slate-300 truncate" title={r.description}>
                    {r.description}
                  </td>

                  <td className="p-3 text-slate-200 font-medium">{r.sanctionOrReward}</td>

                  <td className="p-3">
                    {r.parentNotified ? (
                      <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Notified
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Pending</span>
                    )}
                  </td>

                  <td className="p-3 text-slate-400">{r.recordedBy}</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{r.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Log Student Conduct / Commendation</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Student & Class</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Student Name"
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                  <input
                    type="text"
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    placeholder="Class Grade"
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Positive Commendation">Commendation (+)</option>
                    <option value="Incident Violation">Incident (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Merit Points">Merit Points</option>
                    <option value="Classroom Disruption">Classroom Disruption</option>
                    <option value="Late Arrival">Late Arrival</option>
                    <option value="Dress Code">Dress Code Violation</option>
                    <option value="Bullying">Bullying Incident</option>
                    <option value="Honor Student">Honor Student</option>
                    <option value="Restorative Meeting">Restorative Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Points</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Details / Specific Context</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide context regarding the merit or conduct issue..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sanction / Award Action</label>
                <input
                  type="text"
                  value={formData.sanctionOrReward}
                  onChange={(e) => setFormData({ ...formData, sanctionOrReward: e.target.value })}
                  placeholder="e.g., Certificate issued, Saturday detention, Parent conference"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="parentNotify"
                  checked={formData.parentNotified}
                  onChange={(e) => setFormData({ ...formData, parentNotified: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500"
                />
                <label htmlFor="parentNotify" className="text-xs text-slate-300">
                  Automatically dispatch SMS / Parent Portal notification
                </label>
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
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Save Behaviour Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
