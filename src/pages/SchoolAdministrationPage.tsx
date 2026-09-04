import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  CheckSquare,
  Clock,
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { AdministrativeTask } from '../types';

export const SchoolAdministrationPage: React.FC = () => {
  const [tasks, setTasks] = useState<AdministrativeTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Term Preparation' as AdministrativeTask['category'],
    assignedTo: 'Mugisha Patrick (Deputy Headteacher)',
    priority: 'High' as AdministrativeTask['priority'],
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await v7Api.getAdminTasks();
    setTasks(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const created = await v7Api.saveAdminTask({
      ...formData,
      status: 'In Progress',
    });

    setTasks([created, ...tasks]);
    setShowModal(false);
    setFormData({
      title: '',
      category: 'Term Preparation',
      assignedTo: 'Mugisha Patrick (Deputy Headteacher)',
      priority: 'High',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      description: '',
    });
  };

  const handleStatusChange = async (id: string, newStatus: AdministrativeTask['status']) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const updated = await v7Api.saveAdminTask({
      ...target,
      status: newStatus,
    });

    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
  };

  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-2xl border border-indigo-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>SchoolSoul General School Administration & Task Centre</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">School Administration & Workflow</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Track term preparation checklists, UNEB exam centre registration milestones, Board of Governors resolutions, and operational task assignments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Admin Task</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Active Tasks</span>
          <p className="text-2xl font-black text-white mt-1">{tasks.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">In Progress</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">
            {tasks.filter((t) => t.status === 'In Progress').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">High Priority Milestones</span>
          <p className="text-2xl font-black text-rose-400 mt-1">
            {tasks.filter((t) => t.priority === 'High' || t.priority === 'Critical').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Completed Tasks</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {tasks.filter((t) => t.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search task or officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                  {t.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{t.title}</h3>
                <p className="text-xs text-slate-400">Assigned To: {t.assignedTo}</p>
              </div>

              <select
                value={t.status}
                onChange={(e) => handleStatusChange(t.id, e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 p-1.5 rounded-lg focus:outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              {t.description}
            </p>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span className="font-mono text-rose-400 font-semibold">Due: {t.dueDate}</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  t.priority === 'Critical' || t.priority === 'High'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {t.priority} Priority
              </span>
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
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Assign Administrative Task</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Finalise UNEB Candidate Index Registration"
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
                    <option value="Term Preparation">Term Preparation</option>
                    <option value="UNEB Registration">UNEB Registration</option>
                    <option value="Board Resolution">Board Resolution</option>
                    <option value="MoES Inspection Prep">MoES Inspection Prep</option>
                    <option value="Campus Maintenance">Campus Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assigned Officer</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Task Details & Deliverables</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="State clear deliverables and expectation..."
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
