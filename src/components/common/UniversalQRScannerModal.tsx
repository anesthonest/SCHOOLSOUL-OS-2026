import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  QrCode,
  Camera,
  Upload,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Search,
  Building2,
  User,
  ShoppingBag,
  Award,
  Zap,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import jsQR from 'jsqr';
import { verifyUniversalQR, type QRVerificationResult } from '../../services/qrApi';

interface UniversalQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (studentId: string) => void;
  onNavigateToOrder?: (orderId: string) => void;
  workflowContext?: 'GENERAL' | 'STUDENTS' | 'ATTENDANCE' | 'MARKET' | 'VISITORS' | 'CREDENTIALS';
}

export const UniversalQRScannerModal: React.FC<UniversalQRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
  onNavigateToOrder,
  workflowContext = 'GENERAL',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<QRVerificationResult | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play subtle high-pitch beep on successful scan
  const playScanBeep = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Handle QR verification call
  const handleVerifyPayload = useCallback(async (payloadString: string) => {
    if (!payloadString || !payloadString.trim()) return;
    setIsVerifying(true);
    setScanResult(null);

    try {
      const res = await verifyUniversalQR(payloadString.trim(), workflowContext);
      setScanResult(res);
      if (res.verified) {
        playScanBeep();
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        verified: false,
        error: err.message || 'Failed to verify QR payload.',
      });
    } finally {
      setIsVerifying(false);
    }
  }, [workflowContext, playScanBeep]);

  // Stop active video stream
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Frame processing loop
  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          // Detected code!
          stopCamera();
          handleVerifyPayload(code.data);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [stopCamera, handleVerifyPayload]);

  // Start video stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera stream not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      // Check flashlight support
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      setHasTorch(Boolean(capabilities?.torch));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        animFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      let errorMsg = 'Could not access optical camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission denied. Please allow camera permissions or use manual entry.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No optical camera device found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is in use by another application.';
      }
      setCameraError(errorMsg);
      setActiveTab('manual');
    }
  }, [cameraFacing, stopCamera, tick]);

  // Toggle torch / flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && (track as any).applyConstraints) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Flashlight error:', err);
      }
    }
  };

  // Image File Upload Decoder
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleVerifyPayload(code.data);
          } else {
            setScanResult({
              success: false,
              verified: false,
              error: 'No readable QR code found in the uploaded image. Please try another image or manual entry.',
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                SchoolSoul QR Scanner
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[10px] font-mono font-bold">
                  2026.1.0
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Universal optical scanner with school-specific tenant isolation
              </p>
            </div>
          </div>
          <button
            id="close-qr-scanner-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 p-1.5 gap-1">
          <button
            id="qr-tab-camera-btn"
            onClick={() => {
              setActiveTab('camera');
              setScanResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Optical Camera
          </button>
          <button
            id="qr-tab-upload-btn"
            onClick={() => {
              setActiveTab('upload');
              setScanResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
          <button
            id="qr-tab-manual-btn"
            onClick={() => {
              setActiveTab('manual');
              setScanResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Manual Entry
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: Optical Camera Scanner */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-square max-h-72 w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-dashed border-slate-700/80">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Animated Laser Scanning Reticle */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                    <div className="w-48 h-48 border-2 border-blue-400/80 rounded-2xl relative shadow-2xl shadow-blue-500/30">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-blue-500 rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-blue-500 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-blue-500 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-blue-500 rounded-br" />

                      {/* Moving laser scan line */}
                      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-lg shadow-cyan-400/50" />
                    </div>
                  </div>
                )}

                {/* Camera Error Display */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-rose-300 space-y-2">
                    <AlertTriangle className="w-10 h-10 text-rose-400 mb-1" />
                    <p className="text-xs font-semibold">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Point camera at QR code
                </span>
                <div className="flex items-center gap-2">
                  {hasTorch && (
                    <button
                      onClick={toggleTorch}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition flex items-center gap-1 ${
                        torchOn
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Flash
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Flip Camera
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Image File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-800/40"
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Select or Drop QR Code Image
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports PNG, JPG, WEBP, or screenshot containing QR code
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Manual Entry */}
          {activeTab === 'manual' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyPayload(manualInput);
              }}
              className="space-y-3"
            >
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter Student LIN / ID, Admission No, Order Token, or QR Code String
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. LIN-2026-1042, ADM-2026-001, QR-PICKUP-..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  autoFocus
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="submit"
                  disabled={isVerifying || !manualInput.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                >
                  {isVerifying ? 'Checking...' : 'Verify'}
                </button>
              </div>

              {/* Sample test shortcuts */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                  Quick Testing Identifiers
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setManualInput('LIN-2026-1042');
                      handleVerifyPayload('LIN-2026-1042');
                    }}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    LIN-2026-1042
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualInput('SCH-ID-UG-school-ug-001');
                      handleVerifyPayload('SCH-ID-UG-school-ug-001');
                    }}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    School Identity
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Verification Loading State */}
          {isVerifying && (
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Verifying Cryptographic QR Token...
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Checking institution bounds, RBAC signature, and revocation status
                </p>
              </div>
            </div>
          )}

          {/* Result Card: Verified or Rejected */}
          {scanResult && !isVerifying && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                scanResult.verified
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.verified ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-sm">
                    {scanResult.verified
                      ? 'Authentication & Verification Succeeded'
                      : scanResult.crossSchoolBreach
                      ? 'Cross-School Access Violation'
                      : 'Verification Unsuccessful'}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90">
                    {scanResult.message || scanResult.error}
                  </p>
                </div>
              </div>

              {/* STUDENT PASSPORT RESULT */}
              {scanResult.student && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-2 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Student Full Name
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {scanResult.student.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Student ID / LIN
                      </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {scanResult.student.studentId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Class & Stream
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {scanResult.student.classGrade} ({scanResult.student.stream || 'A'})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Guardian Contact
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {scanResult.student.guardianName}
                      </span>
                    </div>
                  </div>

                  {onSelectStudent && (
                    <button
                      id="qr-open-student-passport-btn"
                      onClick={() => {
                        onSelectStudent(scanResult.student!.id);
                        onClose();
                      }}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <User className="w-3.5 h-3.5" />
                      Open Full Student Passport
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* SCHOOL IDENTITY RESULT */}
              {scanResult.school && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-2 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {scanResult.school.schoolName}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Country: {scanResult.school.country} ({scanResult.school.countryCode}) • Curriculum: {scanResult.school.curriculum}
                    </p>
                  </div>
                </div>
              )}

              {/* MARKET PICKUP RESULT */}
              {scanResult.order && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-2 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Order #{scanResult.order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {scanResult.order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      Buyer: {scanResult.order.buyerName} ({scanResult.order.buyerPhone})
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Total: {scanResult.order.currency} {scanResult.order.totalAmount.toLocaleString()}
                    </p>
                  </div>

                  {onNavigateToOrder && (
                    <button
                      onClick={() => {
                        onNavigateToOrder(scanResult.order!.id);
                        onClose();
                      }}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Confirm Order Pickup
                    </button>
                  )}
                </div>
              )}

              {/* Scan Another Button */}
              <button
                onClick={() => {
                  setScanResult(null);
                  if (activeTab === 'camera') startCamera();
                }}
                className="mt-3 w-full py-1.5 px-3 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold transition"
              >
                Scan Another QR Code
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            School Tenant Protection Active
          </span>
          <span className="font-mono text-[10px]">PESAPAL 3.0 LOCKED</span>
        </div>
      </div>
    </div>
  );
};
