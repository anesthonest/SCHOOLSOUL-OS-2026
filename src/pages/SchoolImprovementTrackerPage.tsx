import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Sparkles,
  Plus,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  Upload,
  FileText,
  Clock,
  X,
  FileCheck,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';
import type { StrategicGoalKPI } from '../types';

export const SchoolImprovementTrackerPage: React.FC = () => {
  const [goals, setGoals] = useState<StrategicGoalKPI[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedGoalForEvidence, setSelectedGoalForEvidence] = useState<StrategicGoalKPI | null>(null);
  const [evidenceName, setEvidenceName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Academic' | 'Financial' | 'Infrastructure' | 'Staffing' | 'Welfare' | 'Digital'>('Academic');
  const [newTarget, setNewTarget] = useState(100);
  const [newDeadline, setNewDeadline] = useState('2026-12-31');
  const [newOwner, setNewOwner] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await v8IntelligenceApi.getStrategicGoals();
    setGoals(data);
  };

  const handleToggleAction = async (goalId: string, actionId: string) => {
    await v8IntelligenceApi.toggleActionItem(goalId, actionId);
    loadData();
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await v8IntelligenceApi.saveStrategicGoal({
      title: newTitle,
      category: newCategory,
      targetValue: newTarget,
      currentValue: 0,
      unit: '%',
      deadline: newDeadline,
      ownerDepartment: 'School Management',
      ownerStaffName: newOwner || 'Headteacher',
      status: 'On Track',
      actionItems: [
        { id: `act-${Date.now()}-1`, title: 'Formulate implementation framework', assignedTo: newOwner || 'Headteacher', isDone: false, dueDate: newDeadline },
      ],
      evidenceCount: 0,
    });

    setNewTitle('');
    setShowNewModal(false);
    loadData();
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForEvidence || !evidenceName.trim()) return;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === selectedGoalForEvidence.id
          ? { ...g, evidenceCount: (g.evidenceCount || 0) + 1 }
          : g
      )
    );
    setEvidenceName('');
    setSelectedGoalForEvidence(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" /> Strategic Planning & Goals
            </span>
            <span className="text-xs text-slate-400">School Improvement Plan (SIP)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            School Improvement Tracker & Goal Engine
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Track annual strategic objectives, department action plans, responsible staff assignments, and evidence documentation.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition flex items-center gap-1.5 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" /> Create Strategic Objective
        </button>
      </div>

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

          return (
            <div key={goal.id} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {goal.category}
                  </span>
                  <h2 className="text-base font-bold text-white leading-snug">{goal.title}</h2>
                </div>

                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold shrink-0 ${
                    goal.status === 'On Track'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : goal.status === 'At Risk'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {goal.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Target Progress</span>
                  <span className="font-mono text-emerald-400">
                    {goal.currentValue} / {goal.targetValue} {goal.unit} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Items Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Action Steps ({goal.actionItems.filter((a) => a.isDone).length} / {goal.actionItems.length} Completed)
                </span>

                <div className="space-y-2">
                  {goal.actionItems.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => handleToggleAction(goal.id, act.id)}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs cursor-pointer hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        {act.isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={`text-slate-200 ${act.isDone ? 'line-through text-slate-500' : ''}`}>
                          {act.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{act.assignedTo}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Meta & Evidence Upload */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-400" /> {goal.ownerStaffName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> {goal.deadline}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGoalForEvidence(goal)}
                  className="hover:text-white flex items-center gap-1 cursor-pointer text-blue-400 font-bold"
                >
                  <Upload className="w-3.5 h-3.5" /> {goal.evidenceCount || 0} Evidences
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Upload & Management Modal */}
      {selectedGoalForEvidence && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" /> Improvement Evidence Vault
                </h3>
                <p className="text-[11px] text-slate-400 truncate max-w-xs">{selectedGoalForEvidence.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGoalForEvidence(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400">Attached Documents & Proof:</span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 text-xs p-1.5 rounded bg-slate-900">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Signed_Implementation_Report.pdf
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                </div>
                {selectedGoalForEvidence.evidenceCount > 1 && (
                  <div className="flex items-center justify-between text-slate-300 text-xs p-1.5 rounded bg-slate-900">
                    <span className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-purple-400" /> Milestone_Receipts_And_Photos.zip
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleAddEvidence} className="space-y-3 text-xs pt-1">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Attach New Evidence Document / Link</label>
                <input
                  type="text"
                  required
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  placeholder="e.g. Lab Equipment Inspection Sign-off.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForEvidence(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Strategic Goal Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Create New Strategic Objective</h2>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Objective Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Upgrade Computer Lab to 60 Workstations"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Financial">Financial</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Staffing">Staffing</option>
                    <option value="Digital">Digital</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Value (%)</label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Owner / Assigned Lead</label>
                <input
                  type="text"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="e.g. Dr. Mukasa Godfrey (DOS)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Deadline Target Date</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Save Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
