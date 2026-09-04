import React, { useState } from 'react';
import { Award, X, Sparkles, Check } from 'lucide-react';
import { OpportunityService } from '../../services/opportunityService';
import type { AchievementCategory, AchievementLevel } from '../../types';

interface AwardAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AwardAchievementModal: React.FC<AwardAchievementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [studentId, setStudentId] = useState('usr-student-1');
  const [studentName, setStudentName] = useState('Allan Ssekandi');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AchievementCategory>('INNOVATION');
  const [level, setLevel] = useState<AchievementLevel>('DISTINCTION');
  const [generateCertificate, setGenerateCertificate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !title.trim() || !description.trim()) {
      setError('Student name, title, and achievement description are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await OpportunityService.awardAchievement({
        studentId: studentId || 'usr-student-1',
        studentName,
        title,
        description,
        category,
        level,
        generateCertificate,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to award achievement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-scale-in my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Award Verified School Achievement</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Allan Ssekandi"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AchievementCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="INNOVATION">Innovation & Science</option>
                <option value="ACADEMIC">Academic Excellence</option>
                <option value="LEADERSHIP">Student Leadership</option>
                <option value="ENTREPRENEURSHIP">Student Enterprise & Market</option>
                <option value="COMMUNITY">Community Service & Pastoral</option>
                <option value="COMPETITION">Inter-School Competition</option>
                <option value="MISSION">Mission Completion</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Achievement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distinction in Clean Water Purification Engineering"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Commendation & Official Citation
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the rigor, verified outcomes, and reasons for this award..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Honors Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as AchievementLevel)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="DISTINCTION">Distinction (Highest Honor)</option>
                <option value="GOLD">Gold (Exemplary)</option>
                <option value="SILVER">Silver (High Merit)</option>
                <option value="BRONZE">Bronze (Merit)</option>
                <option value="PARTICIPATION">Participation & Effort</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 mt-4">
              <input
                type="checkbox"
                id="genCert"
                checked={generateCertificate}
                onChange={(e) => setGenerateCertificate(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <label htmlFor="genCert" className="text-xs font-medium text-amber-900 dark:text-amber-200 cursor-pointer">
                Issue Authenticated Digital Certificate
              </label>
            </div>
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-colors shadow-sm"
            >
              {loading ? 'Awarding...' : 'Record Award & Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
