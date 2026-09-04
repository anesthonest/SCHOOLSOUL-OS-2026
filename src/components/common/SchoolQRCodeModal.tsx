import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  X,
  ShieldCheck,
  Building2,
  Lock,
  Globe,
  Share2,
  Camera,
} from 'lucide-react';
import { fetchSchoolQRIdentity, rotateSchoolQRIdentity, type SchoolQRIdentityResponse } from '../../services/qrApi';
import { useAuth } from '../../context/AuthContext';

interface SchoolQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
}

export const SchoolQRCodeModal: React.FC<SchoolQRCodeModalProps> = ({
  isOpen,
  onClose,
  onOpenScanner,
}) => {
  const { schoolProfile, user, activeRole } = useAuth();
  const [data, setData] = useState<SchoolQRIdentityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printableAreaRef = useRef<HTMLDivElement | null>(null);

  const canRotate = activeRole === 'Platform Administrator' || activeRole === 'School Administrator' || user?.role === 'Headteacher' || user?.role === 'School Owner';

  const loadQR = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSchoolQRIdentity();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load school QR identity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQR();
    }
  }, [isOpen]);

  const handleRotate = async () => {
    if (!window.confirm('Are you sure you want to rotate this school\'s cryptographic QR identity? Existing printed physical badges will be updated to the new verification sequence.')) {
      return;
    }

    setRotating(true);
    try {
      const res = await rotateSchoolQRIdentity();
      if (data) {
        setData({
          ...data,
          schoolQr: res.schoolQr,
          qrDataUrl: res.qrDataUrl,
        });
      }
    } catch (err: any) {
      alert('Failed to rotate QR: ' + err.message);
    } finally {
      setRotating(false);
    }
  };

  const handleCopyLink = () => {
    if (!data?.schoolQr?.endpointUrl) return;
    navigator.clipboard.writeText(data.schoolQr.endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!data?.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = data.qrDataUrl;
    a.download = `SchoolSoul-QR-${(schoolProfile?.schoolName || 'School').replace(/\s+/g, '-')}-${data.schoolQr.code}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                School QR Identity
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">
                  ISOLATED
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official verified cryptographic identity for {schoolProfile?.schoolName || 'Institution'}
              </p>
            </div>
          </div>
          <button
            id="close-school-qr-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading && (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Generating cryptographic school QR identity...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <p className="font-bold">Error loading QR identity:</p>
              <p>{error}</p>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Printable Official School QR Card */}
              <div
                ref={printableAreaRef}
                className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-tight">
                    {data.schoolQr.schoolName}
                  </h4>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official Verification Portal & Discovery Identity
                </p>

                {/* QR Code Container */}
                <div className="p-3 bg-white rounded-2xl inline-block shadow-md border border-slate-200 mx-auto">
                  <img
                    src={data.qrDataUrl}
                    alt="School Official QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                    {data.schoolQr.code}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Cryptographic Sig: <span className="font-mono">{data.schoolQr.signature}</span>
                  </p>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="school-qr-download-png-btn"
                  onClick={handleDownloadPNG}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button
                  id="school-qr-print-btn"
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Badge
                </button>
                <button
                  id="school-qr-copy-link-btn"
                  onClick={handleCopyLink}
                  className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied URL!' : 'Copy Reference'}
                </button>
                {onOpenScanner && (
                  <button
                    id="school-qr-open-scanner-btn"
                    onClick={() => {
                      onClose();
                      onOpenScanner();
                    }}
                    className="py-2 px-3 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" /> Open Camera Scan
                  </button>
                )}
              </div>

              {/* Administrative Rotate Action */}
              {canRotate && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-500 text-[11px]">
                    <span>Scans Recorded: <strong>{data.schoolQr.scansCount || 0}</strong></span>
                    <span className="mx-2">•</span>
                    <span>Rotated: {new Date(data.schoolQr.rotatedAt || data.schoolQr.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    id="school-qr-rotate-sig-btn"
                    disabled={rotating}
                    onClick={handleRotate}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${rotating ? 'animate-spin' : ''}`} />
                    Rotate Token
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            No credentials or passwords in QR payload
          </span>
          <span className="font-mono text-[10px]">AUTH-SIGNED</span>
        </div>
      </div>
    </div>
  );
};
