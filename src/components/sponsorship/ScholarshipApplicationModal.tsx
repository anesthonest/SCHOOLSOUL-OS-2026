import React, { useState } from 'react';
import { X, Award, FileText, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import type { ScholarshipOpportunity } from '../../types';
import { SponsorshipService } from '../../services/sponsorshipService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scholarship: ScholarshipOpportunity | null;
  studentId?: string;
  candidateId?: string;
  studentName?: string;
}

export const ScholarshipApplicationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  scholarship,
  studentId = 'usr-student-1',
  candidateId = 'SS-CANDIDATE-2048',
  studentName = 'Allan Ssekandi',
}) => {
  const [statementOfPurpose, setStatementOfPurpose] = useState('');
  const [teacherRecommendationNote, setTeacherRecommendationNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !scholarship) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statementOfPurpose.trim()) {
      setError('Please provide your statement of purpose and academic goals');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await SponsorshipService.submitApplication({
        opportunityId: scholarship.id,
        opportunityTitle: scholarship.title,
        candidateId,
        studentId,
        studentName,
        gradeBand: scholarship.eligibleGradeBands[0] || 'Senior Secondary',
        statementOfPurpose: statementOfPurpose.trim(),
        supportingEvidenceSummary: [
          'Verified Skills Passport badges',
          'Completed Real-World Mission certificates',
          'Academic term evaluation records',
        ],
        teacherRecommendationNote: teacherRecommendationNote.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit scholarship application');
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
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Apply for Opportunity</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{scholarship.sponsorName}</p>
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

          {/* Scholarship summary pill */}
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
            <h3 className="text-sm font-semibold text-purple-950 dark:text-purple-200 mb-1">{scholarship.title}</h3>
            <p className="text-xs text-purple-800 dark:text-purple-300 mb-2">{scholarship.description}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-purple-200/60 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-semibold">
                Value: ${scholarship.amountValue} {scholarship.currency}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Statement of Purpose & Academic Goals *
            </label>
            <textarea
              required
              rows={4}
              value={statementOfPurpose}
              onChange={e => setStatementOfPurpose(e.target.value)}
              placeholder="Detail your academic passion, how you intend to use this grant/scholarship, and what innovations or community solutions you are developing..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Teacher or Academic Mentor Recommendation Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={teacherRecommendationNote}
              onChange={e => setTeacherRecommendationNote(e.target.value)}
              placeholder="Include notes from your supervising teacher (e.g. Dr. Sarah Nabakooza) or project lead..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p>
              Your application is reviewed by your school principal/DOS first. Once verified for academic integrity and safeguarding compliance, it is forwarded securely to {scholarship.sponsorName}.
            </p>
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
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              {submitting ? 'Submitting Application...' : 'Submit Application via School Bridge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
