import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Cpu,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { InnovationProject } from '../../types';

export const InnovationHubPage: React.FC = () => {
  const [projects, setProjects] = useState<InnovationProject[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<InnovationProject['category']>('STEM');
  const [teamLead, setTeamLead] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await v9PublicEngagementApi.getInnovationProjects();
    setProjects(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !teamLead) return;

    await v9PublicEngagementApi.addInnovationProject({
      title,
      category,
      teamLead,
      teamMembers: [teamLead],
      mentorName: mentorName || 'Assigned STEM Faculty',
      progressPercent: 25,
      description,
      milestones: [
        { id: 'm-1', title: 'Prototype Design Brief', completed: true, dueDate: '2026-08-01' },
        { id: 'm-2', title: 'Component Assembly', completed: false, dueDate: '2026-08-15' },
      ],
      demoDayDate: '2026-08-20',
      status: 'Active Development',
    });

    setTitle('');
    setDescription('');
    setTeamLead('');
    setMentorName('');
    setShowAddModal(false);
    loadProjects();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Module 3: Innovation Hub & STEM Incubator
            </span>
            <span className="text-xs text-slate-400">School Lab & FabLab Projects</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Student Innovation Incubator & Project Teams
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Managing student STEM, Agriculture, Robotics, ICT, and Business projects from concept through team milestone tracking to Demonstration Days.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register New Project Team
        </button>
      </div>

      {/* Innovation Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {proj.category}
                </span>

                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {proj.status}
                </span>
              </div>

              <h2 className="text-base font-bold text-white">{proj.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Project Progress</span>
                  <span className="text-indigo-400 font-bold font-mono">{proj.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-400" /> Key Milestones:
                </span>
                <div className="space-y-1.5">
                  {proj.milestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className={`flex items-center gap-1.5 ${m.completed ? 'text-emerald-400 line-through' : 'text-slate-300'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${m.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                        {m.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{m.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="space-y-0.5">
                <span className="text-[11px] block text-slate-200">
                  <strong>Lead:</strong> {proj.teamLead}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Mentor: {proj.mentorName}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-purple-400 font-bold block flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Demo Day:
                </span>
                <span className="font-mono text-white text-xs">{proj.demoDayDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Register Innovation Project
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Solar Food Dehydrator"
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
                  <option value="STEM">STEM</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="ICT">ICT / Software</option>
                  <option value="Research">Research</option>
                  <option value="Business">Business Idea</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Student Team Lead</label>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={teamLead}
                    onChange={(e) => setTeamLead(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Faculty Mentor</label>
                  <input
                    type="text"
                    placeholder="Teacher Name"
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Problem Statement & Objective</label>
                <textarea
                  rows={3}
                  placeholder="Describe what real-world problem this project solves..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Register Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
