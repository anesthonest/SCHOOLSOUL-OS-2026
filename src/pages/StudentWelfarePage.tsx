import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  User,
  CheckSquare,
  FileText,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { WelfareObservation } from '../types';

export const StudentWelfarePage: React.FC = () => {
  const [observations, setObservations] = useState<WelfareObservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    studentId: 'STU-1015',
    studentName: 'Joshua Katende',
    classGrade: 'Senior 2 Yellow',
    category: 'Financial Hardship' as WelfareObservation['category'],
    concernLevel: 'Moderate' as WelfareObservation['concernLevel'],
    description: '',
    actionPlan: '',
    assignedOfficer: 'Akello Susan (Welfare Officer)',
  });

  useEffect(() => {
    loadWelfare();
  }, []);

  const loadWelfare = async () => {
    setLoading(true);
    const data = await v7Api.getWelfareObservations();
    setObservations(data);
    setLoading(false);
  };

  const handleCreateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    const created = await v7Api.saveWelfareObservation({
      ...formData,
      status: 'Active Monitoring',
    });

    setObservations([created, ...observations]);
    setShowModal(false);
    setFormData({
      studentId: 'STU-1015',
      studentName: 'Joshua Katende',
      classGrade: 'Senior 2 Yellow',
      category: 'Financial Hardship',
      concernLevel: 'Moderate',
      description: '',
      actionPlan: '',
      assignedOfficer: 'Akello Susan (Welfare Officer)',
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: WelfareObservation['status']) => {
    const target = observations.find((o) => o.id === id);
    if (!target) return;
    const updated = await v7Api.saveWelfareObservation({ ...target, status: newStatus });
    setObservations(observations.map((o) => (o.id === updated.id ? updated : o)));
  };

  const filtered = observations.filter((o) => {
    const matchesSearch =
      o.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.classGrade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || o.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 rounded-2xl border border-emerald-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>SchoolSoul Student Support & Welfare System</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Student Welfare & Hardship</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Track student emotional wellbeing, financial hardship support, meal subsidies, boarding care, and targeted welfare intervention plans.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Welfare Observation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Welfare Cases</span>
          <p className="text-2xl font-black text-white mt-1">{observations.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Active Interventions</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {observations.filter((o) => o.status === 'Intervention Active' || o.status === 'Active Monitoring').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Financial Hardship Bursaries</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {observations.filter((o) => o.category === 'Financial Hardship').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Resolved Outcomes</span>
          <p className="text-2xl font-black text-sky-400 mt-1">
            {observations.filter((o) => o.status === 'Resolved').length}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl focus:outline-none w-full md:w- auto"
        >
          <option value="All">All Categories</option>
          <option value="Financial Hardship">Financial Hardship</option>
          <option value="Attendance Concern">Attendance Concern</option>
          <option value="Family Distress">Family Distress</option>
          <option value="Emotional Wellbeing">Emotional Wellbeing</option>
          <option value="Academic Support">Academic Support</option>
          <option value="Boarding Welfare">Boarding Welfare</option>
        </select>
      </div>

      {/* Grid of Welfare Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((o) => (
          <div key={o.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {o.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{o.studentName}</h3>
                <p className="text-xs text-slate-400">{o.classGrade}</p>
              </div>

              <select
                value={o.status}
                onChange={(e) => handleUpdateStatus(o.id, e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 p-1.5 rounded-lg focus:outline-none"
              >
                <option value="Active Monitoring">Active Monitoring</option>
                <option value="Intervention Active">Intervention Active</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Observation</span>
              <p className="text-slate-300 leading-relaxed">{o.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">Action Plan</span>
              <p className="text-emerald-200">{o.actionPlan}</p>
            </div>

            {o.outcomesTracked && (
              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-slate-300">Outcome:</span> {o.outcomesTracked}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
              <span>Assigned: {o.assignedOfficer}</span>
              <span>{o.createdAt}</span>
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
                <HeartHandshake className="w-5 h-5 text-emerald-400" />
                <span>Log Welfare & Support Plan</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateObservation} className="space-y-3 text-xs">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Financial Hardship">Financial Hardship</option>
                    <option value="Attendance Concern">Attendance Concern</option>
                    <option value="Family Distress">Family Distress</option>
                    <option value="Emotional Wellbeing">Emotional Wellbeing</option>
                    <option value="Academic Support">Academic Support</option>
                    <option value="Boarding Welfare">Boarding Welfare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Concern Level</label>
                  <select
                    value={formData.concernLevel}
                    onChange={(e) => setFormData({ ...formData, concernLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observation Details</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe observed student needs or circumstance..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Proposed Action / Support Plan</label>
                <textarea
                  rows={2}
                  value={formData.actionPlan}
                  onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
                  placeholder="e.g., Provide feeding waiver, weekly counselor check-in..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Welfare Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
