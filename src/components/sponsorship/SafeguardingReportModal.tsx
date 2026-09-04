import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { SafeguardingReport, RoleType } from '../../types';
import { SponsorshipService } from '../../services/sponsorshipService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sponsorId?: string;
  sponsorName?: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: RoleType;
}

export const SafeguardingReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  sponsorId,
  sponsorName,
  currentUserId = 'usr-student-1',
  currentUserName = 'Allan Ssekandi',
  currentUserRole = 'Student',
}) => {
  const [reasonCategory, setReasonCategory] = useState<SafeguardingReport['reasonCategory']>('POLICY_VIOLATION');
  const [severity, setSeverity] = useState<SafeguardingReport['severity']>('HIGH');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide detailed information regarding the safety concern');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await SponsorshipService.reportSafeguarding({
        reportedByUserId: currentUserId,
        reportedByName: currentUserName,
        reportedByRole: currentUserRole,
        sponsorId,
        sponsorName,
        reasonCategory,
        description: description.trim(),
        severity,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit safeguarding report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 dark:border-rose-900/50 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Confidential Safeguarding Report</h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Escalated directly to Headteacher & Safeguarding Officer</p>
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

          {sponsorName && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              Reporting entity: <strong className="text-slate-900 dark:text-white">{sponsorName}</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Issue Category *
            </label>
            <select
              value={reasonCategory}
              onChange={e => setReasonCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="INAPPROPRIATE_CONTACT_ATTEMPT">Inappropriate Direct Contact Attempt (Outside School Oversight)</option>
              <option value="REQUEST_FOR_PRIVATE_DATA">Unauthorized Request for Student Private Data (Phone, Address, Family)</option>
              <option value="UNAUTHORIZED_PAYMENT_PROPOSAL">Direct / Unsupervised Financial Solicitation</option>
              <option value="EXPLOITATION_RISK">Commercial Exploitation of Student Work / Idea Theft</option>
              <option value="POLICY_VIOLATION">School Policy or Verification Terms Breach</option>
              <option value="OTHER">Other Child Safety Concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    severity === lvl
                      ? lvl === 'CRITICAL' || lvl === 'HIGH'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description of Incident or Concern *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide specific details, dates, messages, or circumstances..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
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
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              {submitting ? 'Lodging Report...' : 'Lodge Safeguarding Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
