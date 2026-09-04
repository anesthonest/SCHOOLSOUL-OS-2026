import React, { useState } from 'react';
import { Upload, X, Check, FileText, Link, Sparkles } from 'lucide-react';
import { OpportunityService } from '../../services/opportunityService';
import type { SkillDefinition, SkillLevel } from '../../types';

interface SubmitEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillDefinition[];
  onSuccess: () => void;
}

export const SubmitEvidenceModal: React.FC<SubmitEvidenceModalProps> = ({
  isOpen,
  onClose,
  skills,
  onSuccess,
}) => {
  const [skillName, setSkillName] = useState(skills[0]?.name || '');
  const [levelDemonstrated, setLevelDemonstrated] = useState<SkillLevel>('CAPABLE');
  const [source, setSource] = useState<'PROJECT' | 'MISSION' | 'EXPERIMENT' | 'COMMUNITY' | 'MARKET_ENTERPRISE'>('PROJECT');
  const [sourceTitle, setSourceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !skillName) {
      setError('Please provide a skill name and detailed evidence description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedDef = skills.find((s) => s.name === skillName);
      const mediaUrls = mediaUrlInput
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);

      await OpportunityService.submitSkillEvidence({
        skillId: selectedDef?.id || 'skill-gen',
        skillName,
        levelDemonstrated,
        source,
        sourceTitle: sourceTitle || 'Independent Student Submission',
        description,
        mediaUrls,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit evidence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-scale-in my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Submit Practical Skill Evidence</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Competency / Skill
            </label>
            <select
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {skills.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.category})
                </option>
              ))}
              <option value="Other Custom Skill">Other Custom Skill / Practical Craft</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Level Demonstrated
              </label>
              <select
                value={levelDemonstrated}
                onChange={(e) => setLevelDemonstrated(e.target.value as SkillLevel)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="FOUNDATIONAL">Foundational (Level 1)</option>
                <option value="DEVELOPING">Developing (Level 2)</option>
                <option value="CAPABLE">Capable (Level 3)</option>
                <option value="PROFICIENT">Proficient (Level 4)</option>
                <option value="ADVANCED">Advanced (Level 5)</option>
                <option value="MASTERY">Mastery (Level 6)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Evidence Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="PROJECT">School Project / Assignment</option>
                <option value="MISSION">School Mission Deliverable</option>
                <option value="EXPERIMENT">Lab Experiment / Prototype</option>
                <option value="COMMUNITY">Community / Club Activity</option>
                <option value="MARKET_ENTERPRISE">School Market Product</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Project / Activity Title
            </label>
            <input
              type="text"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g. Solar Greenhouse Sensor Rig or Rainwater Collector"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Evidence & Demonstration Rationale
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you built, calculated, or created. Include methods, measurements, code logic, or results..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Media / Photo / GitHub Links (One per line)
            </label>
            <textarea
              rows={2}
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              placeholder="https://example.com/prototype-photo.jpg&#10;https://github.com/my-project"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit to Teacher for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
