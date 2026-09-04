import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  X,
  RotateCw,
  CheckCircle2,
  GraduationCap,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  Building2,
  FileText,
} from 'lucide-react';
import { SchoolSoulMarkSVG } from './SchoolSoulLogo';

interface SchoolLogoUploaderProps {
  currentLogo?: string;
  schoolName?: string;
  schoolMotto?: string;
  registrationNumber?: string;
  academicTerm?: string;
  academicYear?: string;
  onChange: (logoBase64: string | undefined) => void;
  showPreview?: boolean;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const SchoolLogoUploader: React.FC<SchoolLogoUploaderProps> = ({
  currentLogo,
  schoolName = 'SchoolName High School',
  schoolMotto = 'Knowledge & Character',
  registrationNumber = 'EMIS-100482',
  academicTerm = 'Term I',
  academicYear = '2026',
  onChange,
  showPreview = true,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase()) && !file.name.match(/\.(png|jpe?g|svg|webp)$/i)) {
      setError(`Unsupported file format (${file.name}). Please upload PNG, JPG, JPEG, SVG, or WEBP.`);
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size exceeds 5 MB limit (Uploaded file is ${sizeMB} MB). Please choose a smaller image.`);
      return;
    }

    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
        setRotation(0);
      }
      setProcessing(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
      setProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRotate = () => {
    if (!currentLogo) return;
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);

    // If logo is SVG or standard image, perform canvas rotation to persist
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (newRotation % 180 === 90) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((newRotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedDataUrl = canvas.toDataURL('image/png');
      onChange(rotatedDataUrl);
      setRotation(0);
    };
    img.src = currentLogo;
  };

  const handleRemove = () => {
    setError(null);
    onChange(undefined);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Helper */}
      <div className="flex items-start justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>School Logo or Badge (Optional)</span>
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Upload your school's official logo or badge. If skipped, a default SchoolSoul school emblem will be used until one is uploaded later.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
          Optional
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Box / Active Preview Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7">
          {!currentLogo ? (
            /* Dropzone when no logo */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative cursor-pointer p-6 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center min-h-[170px] ${
                dragOver
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-4 ring-blue-500/20 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                {processing ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Drag & Drop school emblem here, or <span className="text-blue-600 dark:text-blue-400 underline">Browse Files</span>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Supported: PNG, JPG, JPEG, SVG, WEBP • Max 5 MB
              </p>
            </div>
          ) : (
            /* Uploaded Logo Card */
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 shadow-sm flex items-center justify-center overflow-hidden">
                  <img
                    src={currentLogo}
                    alt="Uploaded School Logo"
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                </div>
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold shadow-xs">
                  Uploaded
                </span>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Official School Logo Active
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    This logo will be automatically applied to all official certificates, report cards, ID cards, and navigation headers.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    Replace
                  </button>

                  <button
                    type="button"
                    onClick={handleRotate}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                    Rotate 90°
                  </button>

                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Branding Standards</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>High resolution PNG or SVG recommended for clear printing.</li>
              <li>Transparent background files render best on colored backgrounds.</li>
              <li>Will be stored locally for full offline access & synchronized securely.</li>
            </ul>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Status:</span>
            <span className={`font-semibold ${currentLogo ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {currentLogo ? 'Custom Logo Loaded' : 'Using Default Emblem'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Branding Preview Mockups */}
      {showPreview && (
        <div className="pt-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Live Platform Branding Preview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Preview 1: Sidebar Header */}
            <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block border-b border-slate-800 pb-1">
                1. Sidebar Branding
              </span>
              <div className="flex items-center gap-2.5">
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt="Sidebar Preview"
                    className="w-8 h-8 rounded-lg object-contain bg-slate-800 p-0.5 border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center shrink-0">
                    <SchoolSoulMarkSVG size={24} idPrefix="ss-prev-side" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{schoolName || 'School Name'}</p>
                  <p className="text-[10px] text-slate-400 truncate italic">"{schoolMotto}"</p>
                </div>
              </div>
            </div>

            {/* Preview 2: Dashboard Header */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block border-b border-slate-100 dark:border-slate-800 pb-1">
                2. Navbar / Header
              </span>
              <div className="flex items-center gap-2">
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt="Header Preview"
                    className="w-7 h-7 rounded-md object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-700 p-0.5 flex items-center justify-center shrink-0">
                    <SchoolSoulMarkSVG size={20} idPrefix="ss-prev-nav" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold truncate">{schoolName || 'School Name'}</p>
                  <p className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">{academicTerm} • {academicYear}</p>
                </div>
              </div>
            </div>

            {/* Preview 3: Official Report / Receipt Header */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                <span>3. Official Report Card</span>
                <FileText className="w-3 h-3 text-slate-400" />
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px]">
                  <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{schoolName}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[9px]">{registrationNumber}</p>
                </div>
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt="Report Preview"
                    className="w-8 h-8 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center shrink-0">
                    <SchoolSoulMarkSVG size={20} idPrefix="ss-prev-rep" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
