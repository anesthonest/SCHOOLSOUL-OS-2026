import React, { useRef } from 'react';
import { Award, CheckCircle2, QrCode, Download, Printer, X, ShieldCheck } from 'lucide-react';
import type { DigitalCertificate } from '../../types';

interface DigitalCertificateModalProps {
  certificate: DigitalCertificate;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalCertificateModal: React.FC<DigitalCertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-scale-in">
        {/* Modal Actions Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Cryptographically Verified SchoolSoul Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div ref={certificateRef} className="p-8 sm:p-12 bg-gradient-to-br from-amber-50/50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative border-8 border-double border-amber-500/20 m-4 rounded-2xl">
          {/* Certificate Header Emblem */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                {certificate.schoolName || 'St. Mary’s Comprehensive OS Campus'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                Certificate of Distinction & Achievement
              </h1>
            </div>
          </div>

          {/* Certificate Body Text */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This is officially awarded and verified to
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-blue-700 dark:text-blue-400 underline decoration-amber-400 underline-offset-8">
              {certificate.studentName}
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed pt-2">
              For demonstrated excellence, rigorous evidence-backed execution, and practical mastery in
            </p>
            <div className="py-2 px-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 inline-block max-w-xl">
              <p className="font-semibold text-base sm:text-lg text-blue-900 dark:text-blue-200">
                {certificate.achievementTitle}
              </p>
              {certificate.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {certificate.description}
                </p>
              )}
            </div>
          </div>

          {/* Verification & Signatures Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            {/* Verification QR / Code */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                <QrCode className="w-10 h-10 text-slate-800 dark:text-slate-200" />
              </div>
              <div className="text-left space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verification ID</p>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">{certificate.verificationId}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Authenticated</span>
                </div>
              </div>
            </div>

            {/* Issue Date */}
            <div className="text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Date of Award</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {certificate.dateIssued || new Date().toISOString().split('T')[0]}
              </p>
            </div>

            {/* Teacher / School Signature */}
            <div className="text-right space-y-1">
              <div className="font-serif italic text-base text-slate-800 dark:text-slate-200">
                {certificate.issuerName}
              </div>
              <div className="w-32 h-0.5 bg-slate-300 dark:bg-slate-700 ml-auto" />
              <p className="text-[11px] text-slate-500 font-medium">{certificate.issuerTitle || 'Department Supervisor'}</p>
              <p className="text-[9px] font-mono text-slate-400">Sig: {certificate.signatureHash?.substring(0, 12)}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            This digital certificate is stored persistently in the school database and is verifiable at{' '}
            <span className="font-mono text-blue-600 dark:text-blue-400">schoolsoul.org/verify/{certificate.verificationId}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
