import React, { useState } from 'react';
import { Target, X, Plus, Trash2 } from 'lucide-react';
import { OpportunityService } from '../../services/opportunityService';
import type { MissionCategory, MissionDifficulty } from '../../types';

interface LaunchMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LaunchMissionModal: React.FC<LaunchMissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MissionCategory>('INNOVATION');
  const [difficulty, setDifficulty] = useState<MissionDifficulty>('INTERMEDIATE');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [isTeamMission, setIsTeamMission] = useState(true);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [rewardTitle, setRewardTitle] = useState('Certificate of Innovation & Merit');
  const [instructionsText, setInstructionsText] = useState('1. Form team & identify problem\n2. Build prototype\n3. Record measurements\n4. Submit report & video');
  const [requiredSkillsText, setRequiredSkillsText] = useState('Critical Problem Solving, Collaborative Team Leadership');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !objective.trim()) {
      setError('Title, description, and core objective are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const instructions = instructionsText
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean);

      const requiredSkills = requiredSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await OpportunityService.createMission({
        title,
        category,
        difficulty,
        description,
        objective,
        isTeamMission,
        maxTeamSize: Number(maxTeamSize) || 4,
        rewardTitle,
        instructions,
        requiredSkills,
        submissionRequirements: ['Working Prototype / Photos', 'Results Data Log', 'Reflection Summary'],
        evaluationCriteria: ['Problem Solving & Efficacy (40%)', 'Documentation (30%)', 'Collaboration (30%)'],
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create mission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scale-in my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Launch School Challenge / Mission</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Mission Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Community Clean Water & Sand Filter Challenge"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MissionCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INNOVATION">Innovation & Prototyping</option>
                <option value="ENVIRONMENTAL">Environmental & Ecology</option>
                <option value="COMMUNITY">Community Problem-Solving</option>
                <option value="ENTREPRENEURSHIP">Student Enterprise & Market</option>
                <option value="TECHNOLOGY">Robotics & Software</option>
                <option value="ACADEMIC">Academic Deep Research</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as MissionDifficulty)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BEGINNER">Beginner (Introductory)</option>
                <option value="INTERMEDIATE">Intermediate (Practical Application)</option>
                <option value="ADVANCED">Advanced (Rigorous Engineering / Research)</option>
                <option value="EXPERT">Expert (Mastery / Competition Level)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Core Objective & Impact Goal
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Design a low-cost water purification unit providing 50L/day for local gardens."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Detailed Description & Problem Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background, real-world relevance, constraints, and safety guidelines..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                id="isTeam"
                checked={isTeamMission}
                onChange={(e) => setIsTeamMission(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="isTeam" className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                Collaborative Team Mission (Allows groups)
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Max Team Size
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Instructions & Milestones (One per line)
            </label>
            <textarea
              rows={3}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Required Skills (Comma separated)
            </label>
            <input
              type="text"
              value={requiredSkillsText}
              onChange={(e) => setRequiredSkillsText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Reward / Certificate Title
            </label>
            <input
              type="text"
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm"
            >
              {loading ? 'Publishing...' : 'Publish Mission for School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
