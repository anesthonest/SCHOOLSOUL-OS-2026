import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Send,
  MessageSquare,
  Building,
} from 'lucide-react';
import type { MarketplaceDispute, User } from '../../types';
import { fetchMarketDisputes, submitMarketDispute, resolveMarketDispute } from '../../services/marketplaceApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  activeSchoolId: string;
}

export const MarketDisputesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  activeSchoolId,
}) => {
  const [disputes, setDisputes] = useState<MarketplaceDispute[]>([]);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [reasonInput, setReasonInput] = useState('Item Not Received / Pickup Issue');
  const [detailsInput, setDetailsInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const isStaffOrAdmin = ['administrator', 'super admin', 'admin', 'headteacher', 'bursar', 'dos'].includes(
    (currentUser?.role || '').toLowerCase()
  );

  const loadDisputes = async () => {
    try {
      const res = await fetchMarketDisputes(currentUser, activeSchoolId);
      if (res.success && res.data) {
        setDisputes(res.data);
      }
    } catch (err) {
      console.error('Failed to load disputes:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDisputes();
    }
  }, [isOpen, activeSchoolId]);

  if (!isOpen) return null;

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !detailsInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Order ID and issue explanation are required.' });
      return;
    }

    try {
      const res = await submitMarketDispute(
        { orderId: orderIdInput.trim(), reason: reasonInput, details: detailsInput.trim() },
        currentUser,
        activeSchoolId
      );

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Dispute submitted. The School Administrator & Bursar desk will investigate.',
        });
        setOrderIdInput('');
        setDetailsInput('');
        loadDisputes();
        setTimeout(() => setIsSubmittingNew(false), 1200);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to submit dispute.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Submission error.' });
    }
  };

  const handleResolve = async (disputeId: string) => {
    if (!resolutionNotes.trim()) return;
    try {
      const res = await resolveMarketDispute(disputeId, resolutionNotes.trim(), currentUser, activeSchoolId);
      if (res.success) {
        setResolvingId(null);
        setResolutionNotes('');
        loadDisputes();
      }
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">School Market Dispute & Resolution Desk</h2>
              <p className="text-xs text-slate-500">Fair resolution for purchases, refunds, and order claims</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {!isSubmittingNew ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Active & Resolved Cases</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmittingNew(true);
                    setStatusMessage(null);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  + Open New Claim / Issue
                </button>
              </div>

              {disputes.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="text-sm font-semibold text-slate-700">No active disputes reported</p>
                  <p className="text-xs text-slate-400">All orders are operating smoothly.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disputes.map((disp) => (
                    <div
                      key={disp.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{disp.reason}</span>
                          <span className="text-slate-400">• Order #{disp.orderId}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            disp.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {disp.status}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                        {disp.details}
                      </p>

                      {disp.resolutionNotes && (
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
                          <span className="font-bold block mb-1">Resolution by Admin / Bursar:</span>
                          <p>{disp.resolutionNotes}</p>
                        </div>
                      )}

                      {isStaffOrAdmin && disp.status !== 'RESOLVED' && (
                        <div className="pt-2 border-t border-slate-200">
                          {resolvingId === disp.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="State the agreed resolution (e.g. Full cash refund issued at Bursar desk / Item exchanged)..."
                                className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setResolvingId(null)}
                                  className="px-3 py-1 text-slate-600 font-medium"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolve(disp.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                                >
                                  Mark as Resolved
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setResolvingId(disp.id)}
                              className="text-amber-700 hover:text-amber-800 font-bold"
                            >
                              Resolve Dispute
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateDispute} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">File an Order Issue or Refund Claim</h3>
                <button
                  type="button"
                  onClick={() => setIsSubmittingNew(false)}
                  className="text-xs text-amber-600 font-semibold hover:underline"
                >
                  Back to List
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Number or Token ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORD-SCH-2026-12345"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Claim *
                </label>
                <select
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Item Not Received / Pickup Issue">Item Not Received / Pickup Issue</option>
                  <option value="Damaged or Defective Item">Damaged or Defective Item</option>
                  <option value="Incorrect Item or Quantity">Incorrect Item or Quantity</option>
                  <option value="Refund Request / Overpayment">Refund Request / Overpayment</option>
                  <option value="Other School Enterprise Issue">Other School Enterprise Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Explanation *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain what happened, items involved, and your requested solution..."
                  value={detailsInput}
                  onChange={(e) => setDetailsInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmittingNew(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
