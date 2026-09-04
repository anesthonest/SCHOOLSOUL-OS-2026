import React, { useState } from 'react';
import { X, Sparkles, DollarSign, Package, Users, FileText } from 'lucide-react';
import type { SponsorSupportType } from '../../types';
import { SponsorshipService } from '../../services/sponsorshipService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  candidateId?: string;
}

export const ProjectSupportRequestModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, candidateId = 'SS-CANDIDATE-2048' }) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('Clean Technology & Health');
  const [teamName, setTeamName] = useState('');
  const [memberCount, setMemberCount] = useState('3');
  const [summary, setSummary] = useState('');
  const [materialsText, setMaterialsText] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('350');
  const [currency, setCurrency] = useState('USD');
  const [selectedSupportTypes, setSelectedSupportTypes] = useState<SponsorSupportType[]>(['EQUIPMENT', 'PROJECT_FUNDING']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !summary.trim() || !estimatedBudget) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const materials = materialsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      await SponsorshipService.createProjectRequest({
        projectTitle: projectTitle.trim(),
        projectCategory: projectCategory.trim(),
        teamLeadCandidateId: candidateId,
        teamName: teamName.trim() || 'Student Innovation Group',
        memberCount: Number(memberCount) || 1,
        summary: summary.trim(),
        materialsNeeded: materials.length > 0 ? materials : ['Hardware components', 'Prototyping materials'],
        supportTypesNeeded: selectedSupportTypes,
        estimatedBudget: Number(estimatedBudget),
        currency,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit project request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Request Project Support</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Connect your verified student innovation with educational sponsors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              placeholder="e.g. Solar-Powered Biological Water Column Filtration"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={projectCategory}
                onChange={e => setProjectCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Clean Technology & Health">Clean Technology & Health</option>
                <option value="Agro-Tech & IoT">Agro-Tech & IoT</option>
                <option value="Robotics & Electronics">Robotics & Electronics</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Community Software & AI">Community Software & AI</option>
                <option value="Creative Arts & Media">Creative Arts & Media</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Team Name & Members
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Team HydroPure"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={memberCount}
                  onChange={e => setMemberCount(e.target.value)}
                  title="Number of members"
                  className="w-16 px-2 py-2.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Summary & Community Solution *
            </label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Explain what practical problem this solves and how it impacts your school or local community..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Materials & Equipment Needed (One per line)
            </label>
            <textarea
              rows={3}
              value={materialsText}
              onChange={e => setMaterialsText(e.target.value)}
              placeholder="12V 50W Solar Panel&#10;Submersible Micro-Pump&#10;UV Sterilization Tube"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Budget *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  required
                  min={10}
                  value={estimatedBudget}
                  onChange={e => setEstimatedBudget(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="USD">USD ($)</option>
                <option value="UGX">UGX (USh)</option>
                <option value="KES">KES (KSh)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              {submitting ? 'Submitting Request...' : 'Submit for School Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
