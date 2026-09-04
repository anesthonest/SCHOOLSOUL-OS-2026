import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Download,
  ExternalLink,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
  Users,
  CreditCard,
  GraduationCap,
  ShoppingBag,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuthHeaders } from '../services/api';

export interface UserGuideMetadata {
  title: string;
  version: string;
  filename: string;
  documentType: string;
  status: string;
  description: string;
  isAvailable: boolean;
  sizeBytes: number;
  mimeType: string;
  publicUrl: string;
  downloadUrl: string;
  openUrl: string;
  permittedRoles: string[];
}

export const UserGuidePage: React.FC = () => {
  const { activeRole } = useAuth();

  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<UserGuideMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const canonicalFilename = 'SchoolSoul_OS_User_Guideline_Book_2026.1.0.pdf';
  const directPdfUrl = `/${canonicalFilename}`;
  const apiDownloadUrl = `/api/docs/user-guide/download`;
  const apiOpenUrl = `/api/docs/user-guide/open`;

  const fetchDocumentMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/docs/user-guide/metadata', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.document) {
          setMetadata(json.document);
        }
      } else {
        // Fallback default structure
        setMetadata({
          title: 'SchoolSoul OS 2026.1.0 User Guideline & Operations Book',
          version: '2026.1.0',
          filename: canonicalFilename,
          documentType: 'USER_GUIDE',
          status: 'ACTIVE',
          description:
            'Official SchoolSoul OS 2026.1.0 user guideline and operations manual. Learn how to navigate and use SchoolSoul OS, its dashboards, workflows, School Market, communication tools, and payment features.',
          isAvailable: false,
          sizeBytes: 0,
          mimeType: 'application/pdf',
          publicUrl: directPdfUrl,
          downloadUrl: apiDownloadUrl,
          openUrl: apiOpenUrl,
          permittedRoles: [
            'Platform Administrator',
            'School Administrator',
            'Director of Studies (DOS)',
            'Teacher',
            'Bursar',
            'Student',
            'Parent',
          ],
        });
      }
    } catch {
      // Set fallback
      setMetadata({
        title: 'SchoolSoul OS 2026.1.0 User Guideline & Operations Book',
        version: '2026.1.0',
        filename: canonicalFilename,
        documentType: 'USER_GUIDE',
        status: 'ACTIVE',
        description:
          'Official SchoolSoul OS 2026.1.0 user guideline and operations manual. Learn how to navigate and use SchoolSoul OS, its dashboards, workflows, School Market, communication tools, and payment features.',
        isAvailable: false,
        sizeBytes: 0,
        mimeType: 'application/pdf',
        publicUrl: directPdfUrl,
        downloadUrl: apiDownloadUrl,
        openUrl: apiOpenUrl,
        permittedRoles: [
          'Platform Administrator',
          'School Administrator',
          'Director of Studies (DOS)',
          'Teacher',
          'Bursar',
          'Student',
          'Parent',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentMetadata();
  }, []);

  const handleOpenGuide = () => {
    // Open the official PDF URL in a new browser tab/window
    window.open(apiOpenUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create anchor element for download
      const link = document.createElement('a');
      link.href = apiDownloadUrl;
      link.setAttribute('download', canonicalFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError('The User Guide could not be loaded. Please try again or contact your school administrator.');
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const chapters = [
    {
      number: '01',
      title: 'Platform Architecture & Role Dashboards',
      icon: Layers,
      summary: '7-Tier Role-Based Access Control, Tenant Isolation, and Adaptive Dashboards for Admin, Academic, Financial, and Parent portals.',
    },
    {
      number: '02',
      title: 'School Market & Student Enterprise Guild',
      icon: ShoppingBag,
      summary: 'Practical enterprise projects, 8-photo + 90-second video limits, magic byte security, and student safeguarding.',
    },
    {
      number: '03',
      title: 'Academic Structure, Attendance & Report Cards',
      icon: GraduationCap,
      summary: 'Class & stream registers, continuous assessment, teacher gradebook, automated report card generation with verification QR codes.',
    },
    {
      number: '04',
      title: 'Fee Management & Pesapal 3.0 Integration',
      icon: CreditCard,
      summary: 'Student fee accounts, Pesapal API 3.0 Mobile Money & Card settlements, IPN reconciliations, and cryptographic receipts.',
    },
    {
      number: '05',
      title: 'Communication, Helpdesk & Community',
      icon: Users,
      summary: 'SMS broadcast engine, WhatsApp alerts, institutional Knowledge Centre, and help desk ticket management.',
    },
    {
      number: '06',
      title: 'Offline Sync & System Security Protocols',
      icon: ShieldCheck,
      summary: 'IndexedDB local offline storage, background synchronization queue, and immutable audit logs.',
    },
  ];

  return (
    <div id="user-guide-screen" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Official Documentation
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Release 2026.1.0
            </span>
            <span className="text-xs text-slate-400">Universal Access (All 7 Roles)</span>
          </div>

          <h1 id="user-guide-header" className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            SchoolSoul OS 2026.1.0 User Guide
          </h1>

          <p id="user-guide-description" className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Learn how to navigate and use SchoolSoul OS, its dashboards, workflows, School Market, communication tools, and payment features.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
          <button
            id="btn-open-official-user-guide"
            type="button"
            onClick={handleOpenGuide}
            aria-label="Open Official User Guide in new tab"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition-all transform active:scale-95 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Guide</span>
          </button>

          <button
            id="btn-download-official-user-guide"
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label="Download Official User Guide PDF"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 shadow-md transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isDownloading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <Download className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>

          <button
            id="btn-print-user-guide"
            type="button"
            onClick={handlePrint}
            aria-label="Print User Guide Documentation"
            className="hidden sm:flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold border border-slate-700/80 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Error or Notice Alert if Guide is pending upload */}
      {error && (
        <div id="user-guide-error-alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-300">{error}</p>
              <p className="text-xs text-rose-400/80 mt-0.5">
                The authoritative document <code className="text-xs font-mono bg-rose-950/50 px-1.5 py-0.5 rounded">{canonicalFilename}</code> is registered in SchoolSoul system records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchDocumentMetadata}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Official Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
            <FileText className="w-4 h-4" />
            <span>Authoritative Document</span>
          </div>
          <p className="text-sm font-bold text-white truncate">
            {metadata?.title || 'SchoolSoul OS 2026.1.0 User Guideline & Operations Book'}
          </p>
          <div className="text-xs text-slate-400 space-y-1">
            <p>File: <code className="text-slate-200 font-mono text-[11px]">{canonicalFilename}</code></p>
            <p>Type: <span className="font-semibold text-slate-300">USER_GUIDE (Immutable PDF)</span></p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Security & RBAC Scope</span>
          </div>
          <p className="text-sm font-bold text-white">Universal 7-Tier Authorization</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Active role <span className="text-emerald-300 font-semibold">({activeRole || 'User'})</span> is fully authorized. Path traversal protected, read-only system asset.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Release & Deployment</span>
          </div>
          <p className="text-sm font-bold text-white">Production Release 2026.1.0</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Packaged for local development, production containers, and Render cloud deployments.
          </p>
        </div>
      </div>

      {/* Document Overview & Table of Contents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Official Guideline Book Structure & Modules
          </h2>
          <span className="text-xs text-slate-400">Complete Operational Reference</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chap) => {
            const Icon = chap.icon;
            return (
              <div
                key={chap.number}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Module {chap.number}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{chap.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{chap.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Authoritative Specification</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Included in PDF
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Based Quick Reference Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          Permitted Role Guidance Matrix
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-blue-400">Administrators & Owners</span>
            <p className="text-slate-400 text-[11px] leading-normal">
              School profiling, staff onboarding, role assignment, system integrity, and audit logs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400">DOS & Academic Staff</span>
            <p className="text-slate-400 text-[11px] leading-normal">
              Timetable engine, lesson planner, attendance registers, assessments, and report cards.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400">Bursar & Finance</span>
            <p className="text-slate-400 text-[11px] leading-normal">
              Fee structures, student ledgers, Pesapal 3.0 payments, reconciliations, and cashbooks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-purple-400">Students & Parents</span>
            <p className="text-slate-400 text-[11px] leading-normal">
              Student passports, digital portfolio, School Market projects, live class, and notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
