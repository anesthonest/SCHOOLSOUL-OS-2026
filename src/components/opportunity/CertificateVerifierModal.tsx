import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, ShieldCheck, X, Award, ExternalLink, Calendar, User } from 'lucide-react';
import { OpportunityService } from '../../services/opportunityService';

interface CertificateVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const CertificateVerifierModal: React.FC<CertificateVerifierModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await OpportunityService.verifyCertificatePublic(code.trim());
      if (data.verified) {
        setResult(data);
      } else {
        setError(data.message || 'No active verified certificate found matching this identifier.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification lookup failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Digital Certificate Verification Desk</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter the unique SchoolSoul Verification ID stamped on the student's digital certificate (e.g. <span className="font-mono text-blue-600 dark:text-blue-400">VER-SS-UG-XXXXXX</span>) to query the school database ledger.
          </p>

          <form onSubmit={handleVerify} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. VER-SS-UG-123456"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {/* Error / Not Found Display */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-sm animate-fade-in">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-semibold">Verification Notice</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Success / Verified Result Display */}
          {result && (
            <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Valid & Authenticated Certificate</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  {result.verificationId}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/40 text-sm">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{result.achievementTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  <span>Recipient: <strong className="text-slate-800 dark:text-slate-200">{result.studentName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Issued: {result.dateIssued} by {result.issuerName} ({result.issuerTitle})</span>
                </div>
                <div className="pt-1 text-[11px] font-mono text-slate-500 break-all">
                  Digital Signature: {result.signatureHash}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
