import React, { useState } from 'react';
import { X, HeartHandshake, DollarSign, Package, ShieldCheck } from 'lucide-react';
import type { SponsorSupportType, SponsorProfile } from '../../types';
import { SponsorshipService } from '../../services/sponsorshipService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetType: 'CANDIDATE_PROFILE' | 'PROJECT_REQUEST' | 'SCHOOL_PROGRAM';
  targetId: string;
  targetTitle: string;
  activeSponsor?: SponsorProfile | null;
}

export const SponsorInterestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  targetType,
  targetId,
  targetTitle,
  activeSponsor,
}) => {
  const [supportType, setSupportType] = useState<SponsorSupportType>('PROJECT_FUNDING');
  const [offeredDetails, setOfferedDetails] = useState('');
  const [offeredValue, setOfferedValue] = useState('350');
  const [currency, setCurrency] = useState('USD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sponsorId = activeSponsor?.id || 'spon-afri-tech-foundation';
  const sponsorName = activeSponsor?.name || 'AfriTech Educational Foundation';
  const sponsorOrgType = activeSponsor?.organizationType || 'FOUNDATION';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredDetails.trim()) {
      setError('Please specify the details of the support or mentorship you are offering');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await SponsorshipService.submitSponsorInterest({
        sponsorId,
        sponsorName,
        sponsorType: sponsorOrgType,
        targetType,
        targetId,
        targetTitle,
        offeredSupportType: supportType,
        offeredDetails: offeredDetails.trim(),
        offeredValue: offeredValue ? Number(offeredValue) : undefined,
        currency,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit support interest');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Offer Educational Support</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Supervised SchoolSoul Connection Pipeline</p>
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

          {/* Target pill */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Target Opportunity</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{targetTitle}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Support Category *
            </label>
            <select
              value={supportType}
              onChange={e => setSupportType(e.target.value as SponsorSupportType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="PROJECT_FUNDING">Project Hardware & Prototyping Grant</option>
              <option value="EQUIPMENT">Dedicated Laptops / Robotics Kits</option>
              <option value="SCHOLARSHIP">Tuition & Academic Fees Scholarship</option>
              <option value="MENTORSHIP">Supervised Technical Mentorship</option>
              <option value="TRAINING">Specialized Workshop / Training Access</option>
              <option value="INNOVATION_GRANT">Innovation Challenge Prize</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pledge / Support Details *
            </label>
            <textarea
              required
              rows={3}
              value={offeredDetails}
              onChange={e => setOfferedDetails(e.target.value)}
              placeholder="Specify the support structure, e.g. 'Pledging $350 for the solar filtration UV column components with fortnightly remote engineering reviews...'"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Financial Value
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min={0}
                  value={offeredValue}
                  onChange={e => setOfferedValue(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="UGX">UGX (USh)</option>
                <option value="KES">KES (KSh)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p>
              Your expression of interest is submitted to the school administration. Once approved and confirmed by the candidate’s parent/guardian, you will receive supervised access to coordinate support.
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              {submitting ? 'Submitting Interest...' : 'Submit Support Interest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
