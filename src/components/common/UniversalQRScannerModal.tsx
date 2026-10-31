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
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Briefcase,
  ShieldAlert,
  Clock,
  ArrowRight,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import jsQR from 'jsqr';
import { verifyUniversalQR, submitQRJoinRequest, type QRVerificationResult } from '../../services/qrApi';

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

  // QR Membership Enrollment Flow State
  const [qrFlowStep, setQrFlowStep] = useState<'CONFIRM_SCHOOL' | 'MEMBER_TYPE' | 'FORM'>('CONFIRM_SCHOOL');
  const [memberCategory, setMemberCategory] = useState<'Student' | 'Parent' | 'Teacher' | 'Staff' | 'Administrator'>('Student');
  const [joinFullName, setJoinFullName] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinUsername, setJoinUsername] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinConfirmPassword, setJoinConfirmPassword] = useState('');
  const [joinNotes, setJoinNotes] = useState('');

  // Role-Specific State
  // Student
  const [studentDob, setStudentDob] = useState('');
  const [studentClass, setStudentClass] = useState('Senior 1');
  const [studentStream, setStudentStream] = useState('A');
  const [studentAdmission, setStudentAdmission] = useState('');
  // Parent
  const [parentRelationship, setParentRelationship] = useState('Mother');
  const [parentChildName, setParentChildName] = useState('');
  const [parentChildAdmission, setParentChildAdmission] = useState('');
  const [parentChildClass, setParentChildClass] = useState('Senior 1');
  // Teacher
  const [teacherDepartment, setTeacherDepartment] = useState('Sciences');
  const [teacherSubjects, setTeacherSubjects] = useState('');
  const [teacherEmpNumber, setTeacherEmpNumber] = useState('');
  // Staff
  const [staffCategory, setStaffCategory] = useState<string>('Office');
  const [staffJobTitle, setStaffJobTitle] = useState('');
  const [staffEmpNumber, setStaffEmpNumber] = useState('');
  // Administrator
  const [adminPosition, setAdminPosition] = useState('Deputy Headteacher');
  const [adminStaffId, setAdminStaffId] = useState('');

  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [joinSuccessData, setJoinSuccessData] = useState<any | null>(null);
  const [joinSuccessMessage, setJoinSuccessMessage] = useState<string | null>(null);
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);

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
        setQrFlowStep('CONFIRM_SCHOOL');
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

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanResult?.invitation?.token) return;

    if (joinConfirmPassword && joinPassword !== joinConfirmPassword) {
      setJoinErrorMessage('Passwords do not match. Please verify that both password fields match.');
      return;
    }

    setIsSubmittingJoin(true);
    setJoinErrorMessage(null);
    setJoinSuccessMessage(null);

    try {
      let finalRequestedRole = memberCategory as string;
      if (memberCategory === 'Staff') {
        finalRequestedRole = staffCategory ? `Staff - ${staffCategory}` : 'Staff';
      } else if (memberCategory === 'Administrator') {
        finalRequestedRole = adminPosition || 'Administrator';
      }

      const payload: any = {
        token: scanResult.invitation.token,
        fullName: joinFullName.trim(),
        phone: joinPhone.trim(),
        email: joinEmail.trim(),
        username: joinUsername.trim(),
        password: joinPassword.trim(),
        memberCategory,
        requestedRole: finalRequestedRole,
        notes: joinNotes || `Self-registered via Universal School QR door for ${scanResult.invitation.schoolName}`,
      };

      if (memberCategory === 'Student') {
        payload.dateOfBirth = studentDob;
        payload.classGrade = studentClass;
        payload.stream = studentStream;
        payload.admissionNumber = studentAdmission.trim();
        payload.employeeOrStudentNumber = studentAdmission.trim();
      } else if (memberCategory === 'Parent') {
        payload.relationship = parentRelationship;
        payload.childName = parentChildName.trim();
        payload.childAdmissionNumber = parentChildAdmission.trim();
        payload.childClass = parentChildClass;
      } else if (memberCategory === 'Teacher') {
        payload.department = teacherDepartment;
        payload.subjectsTaught = teacherSubjects.trim();
        payload.employeeNumber = teacherEmpNumber.trim();
        payload.employeeOrStudentNumber = teacherEmpNumber.trim();
      } else if (memberCategory === 'Staff') {
        payload.staffCategory = staffCategory;
        payload.jobTitle = staffJobTitle.trim();
        payload.employeeNumber = staffEmpNumber.trim();
        payload.employeeOrStudentNumber = staffEmpNumber.trim();
      } else if (memberCategory === 'Administrator') {
        payload.position = adminPosition;
        payload.staffId = adminStaffId.trim();
        payload.employeeOrStudentNumber = adminStaffId.trim();
      }

      const res = await submitQRJoinRequest(payload);

      setJoinSuccessData({
        ...res,
        fullName: joinFullName.trim(),
        submittedAt: res.submittedAt || new Date().toISOString(),
        schoolName: res.schoolName || scanResult.invitation.schoolName,
        memberCategory,
        requestedRole: finalRequestedRole,
      });
      setJoinSuccessMessage(res.message || 'Join request submitted! Awaiting administrator approval.');
    } catch (err: any) {
      setJoinErrorMessage(err.message || 'Failed to submit join request.');
    } finally {
      setIsSubmittingJoin(false);
    }
  };

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

              {/* SCHOOL INVITATION & UNIVERSAL QR MEMBERSHIP ENROLLMENT FLOW */}
              {scanResult.invitation && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-3 text-xs">
                  {joinSuccessData ? (
                    /* CLEAR PENDING APPROVAL STATUS SCREEN */
                    <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 mx-auto flex items-center justify-center shadow-xs">
                        <Clock className="w-7 h-7 animate-pulse" />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black tracking-widest uppercase text-amber-600 dark:text-amber-400 block">
                          REQUEST SUBMITTED
                        </span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                          Your request to join {joinSuccessData.schoolName} has been submitted successfully.
                        </h4>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-xs mt-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          <span>Status: PENDING APPROVAL</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
                          Your school administrator or headteacher must approve your membership before you can access school services.
                        </p>
                      </div>

                      {/* Verification Summary Card */}
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/80 dark:border-slate-800 text-left space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>Applicant:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{joinSuccessData.fullName}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>Requested membership:</span>
                          <span className="font-bold text-purple-700 dark:text-purple-300">
                            {joinSuccessData.memberCategory}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>School:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{joinSuccessData.schoolName}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>Submitted:</span>
                          <span className="font-mono text-[11px]">{new Date(joinSuccessData.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>Reference ID:</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{joinSuccessData.requestId}</span>
                        </div>
                      </div>

                      {/* Zero-Leakage Reassurance Banner */}
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2 text-left">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Zero Private Data Disclosure:</strong> No student records, attendance rolls, fees, or operational systems are accessible while your status is <em>Pending Approval</em>.
                        </span>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setJoinSuccessData(null);
                            onClose();
                          }}
                          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>SIGN OUT / CLOSE</span>
                        </button>
                      </div>
                    </div>
                  ) : qrFlowStep === 'CONFIRM_SCHOOL' ? (
                    /* STEP 1: SCHOOL CONFIRMATION */
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center shadow-xs">
                        <Building2 className="w-8 h-8" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 tracking-wider uppercase block">
                          SchoolSoul OS
                        </span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                          {scanResult.invitation.schoolName}
                        </h3>
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                          "You are joining this school's digital system."
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                          Verify that this is your school. Once confirmed, you will select your member type and submit your access request for administrator review.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-[11px] text-purple-800 dark:text-purple-200 flex items-center gap-2 text-left">
                        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Institutional door authenticated. No confidential school information is shown before administrator approval.</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setQrFlowStep('MEMBER_TYPE')}
                        className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer transition"
                      >
                        <span>CONTINUE</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : qrFlowStep === 'MEMBER_TYPE' ? (
                    /* STEP 2: MEMBER TYPE SCREEN */
                    <div className="space-y-4 p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                          {scanResult.invitation.schoolName}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                          Who are you in this school?
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Your school administrator must approve your membership before you can access school services.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: 'Student', label: 'STUDENT', desc: 'Enrolled learner or pupil', icon: GraduationCap },
                          { id: 'Parent', label: 'PARENT / GUARDIAN', desc: 'Parent, sponsor, or legal guardian', icon: HeartHandshake },
                          { id: 'Teacher', label: 'TEACHER', desc: 'Educator or subject instructor', icon: BookOpen },
                          { id: 'Staff', label: 'SCHOOL STAFF', desc: 'Nurse, Canteen, Security, Transport, etc.', icon: Briefcase },
                          { id: 'Administrator', label: 'SCHOOL MANAGEMENT', desc: 'Requires administrator verification', icon: ShieldAlert, alert: true },
                        ].map((cat) => {
                          const IconComp = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setMemberCategory(cat.id as any);
                                setQrFlowStep('FORM');
                              }}
                              className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between min-h-[58px] cursor-pointer hover:border-purple-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:shadow-xs ${
                                cat.id === 'Administrator' ? 'sm:col-span-2 border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  cat.alert
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                                }`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-extrabold text-xs block tracking-wide">{cat.label}</span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{cat.desc}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Request only:</strong> Selecting a role does not grant immediate privileges. Every account is created in <em>Pending Approval</em> status.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setQrFlowStep('CONFIRM_SCHOOL')}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 inline-flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to School Confirmation
                      </button>
                    </div>
                  ) : (
                    /* STEP 3: ROLE-SPECIFIC REGISTRATION & ACCOUNT CREATION FORM */
                    <form onSubmit={handleJoinSubmit} className="space-y-4 p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {/* Form Header with Category Badge */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Requested Role
                          </span>
                          <span className="font-extrabold text-purple-700 dark:text-purple-300 text-sm">
                            {memberCategory.toUpperCase()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setQrFlowStep('MEMBER_TYPE')}
                          className="px-2.5 py-1 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
                        >
                          Change Role
                        </button>
                      </div>

                      {joinErrorMessage && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                          {joinErrorMessage}
                        </div>
                      )}

                      {/* Common Personal Information & Credentials */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Personal Information & Account Credentials
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Full Legal Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sarah Namugga"
                              value={joinFullName}
                              onChange={(e) => setJoinFullName(e.target.value)}
                              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="+256 700 000000"
                              value={joinPhone}
                              onChange={(e) => setJoinPhone(e.target.value)}
                              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Email (Optional)
                            </label>
                            <input
                              type="email"
                              placeholder="user@school.org"
                              value={joinEmail}
                              onChange={(e) => setJoinEmail(e.target.value)}
                              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Desired Username *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. snamugga"
                              value={joinUsername}
                              onChange={(e) => setJoinUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Account Password *
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="At least 6 characters"
                              value={joinPassword}
                              onChange={(e) => setJoinPassword(e.target.value)}
                              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Confirm Password *
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="Confirm password"
                              value={joinConfirmPassword}
                              onChange={(e) => setJoinConfirmPassword(e.target.value)}
                              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ROLE-SPECIFIC INPUT SECTIONS */}
                      {/* 1. STUDENT SPECIFIC */}
                      {memberCategory === 'Student' && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Student Enrollment Details
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Admission No. / LIN *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. LIN-2026-1042 or ADM-889"
                                value={studentAdmission}
                                onChange={(e) => setStudentAdmission(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                value={studentDob}
                                onChange={(e) => setStudentDob(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Class / Form *
                              </label>
                              <select
                                value={studentClass}
                                onChange={(e) => setStudentClass(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                              >
                                <option value="Senior 1">Senior 1 / Grade 7</option>
                                <option value="Senior 2">Senior 2 / Grade 8</option>
                                <option value="Senior 3">Senior 3 / Grade 9</option>
                                <option value="Senior 4">Senior 4 / Grade 10</option>
                                <option value="Senior 5">Senior 5 / Grade 11</option>
                                <option value="Senior 6">Senior 6 / Grade 12</option>
                                <option value="Primary 1">Primary 1</option>
                                <option value="Primary 6">Primary 6</option>
                                <option value="Primary 7">Primary 7</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Stream / Section
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Stream A, Blue, East"
                                value={studentStream}
                                onChange={(e) => setStudentStream(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. PARENT SPECIFIC */}
                      {memberCategory === 'Parent' && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block flex items-center gap-1">
                            <HeartHandshake className="w-3.5 h-3.5" />
                            Guardian & Student Linkage Details
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Relationship to Student *
                              </label>
                              <select
                                value={parentRelationship}
                                onChange={(e) => setParentRelationship(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                              >
                                <option value="Mother">Mother</option>
                                <option value="Father">Father</option>
                                <option value="Guardian">Legal Guardian</option>
                                <option value="Sponsor">Education Sponsor</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Child's Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. David Mukasa"
                                value={parentChildName}
                                onChange={(e) => setParentChildName(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Child's Admission No. / LIN *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. LIN-2026-1042"
                                value={parentChildAdmission}
                                onChange={(e) => setParentChildAdmission(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Child's Class
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Senior 1 A"
                                value={parentChildClass}
                                onChange={(e) => setParentChildClass(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. TEACHER SPECIFIC */}
                      {memberCategory === 'Teacher' && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            Academic & Departmental Credentials
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Staff / Employee No. *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. EMP-2026-04"
                                value={teacherEmpNumber}
                                onChange={(e) => setTeacherEmpNumber(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Department *
                              </label>
                              <select
                                value={teacherDepartment}
                                onChange={(e) => setTeacherDepartment(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                              >
                                <option value="Sciences">Sciences & Technology</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Humanities">Humanities & Social Studies</option>
                                <option value="Languages">Languages & Literature</option>
                                <option value="Vocational">Vocational & Business</option>
                                <option value="Physical Education">Physical Education & Sports</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Subjects Taught *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Physics & Mathematics"
                                value={teacherSubjects}
                                onChange={(e) => setTeacherSubjects(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. NON-TEACHING STAFF SPECIFIC */}
                      {memberCategory === 'Staff' && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            Staff Operational Role & Category
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Staff Category *
                              </label>
                              <select
                                value={staffCategory}
                                onChange={(e) => setStaffCategory(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                              >
                                <option value="Nurse">School Nurse / Sickbay</option>
                                <option value="Canteen">Canteen & Catering</option>
                                <option value="Library">Library</option>
                                <option value="Security">Campus Security</option>
                                <option value="Transport">Transport & Driver</option>
                                <option value="Office">Office / Secretarial</option>
                                <option value="Cleaner">Grounds & Cleaner</option>
                                <option value="Technician">IT / Lab Technician</option>
                                <option value="Other">Other Operational</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Employee Number
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. STF-2026-12"
                                value={staffEmpNumber}
                                onChange={(e) => setStaffEmpNumber(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Job Title / Primary Duties *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Sickbay Head Nurse"
                                value={staffJobTitle}
                                onChange={(e) => setStaffJobTitle(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. SCHOOL ADMINISTRATION / MANAGEMENT SPECIFIC */}
                      {memberCategory === 'Administrator' && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block">Management access requires administrator verification.</span>
                              <span>Administrative permissions carry institutional operational authority. Account requests are held in a secure pending queue and require in-person validation by the Headteacher or Board of Governors.</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Staff ID *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. ADM-HQ-01"
                                value={adminStaffId}
                                onChange={(e) => setAdminStaffId(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                Position / Designation *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Deputy Headteacher or DOS"
                                value={adminPosition}
                                onChange={(e) => setAdminPosition(e.target.value)}
                                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => setQrFlowStep('MEMBER_TYPE')}
                          className="min-h-[48px] py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                        >
                          ← Change Role
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingJoin}
                          className="flex-1 min-h-[48px] py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSubmittingJoin ? 'Submitting Application...' : 'CREATE ACCOUNT & REQUEST ACCESS'}</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </form>
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
