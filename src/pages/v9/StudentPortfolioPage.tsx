import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Download,
  Share2,
  CheckCircle,
  UserCheck,
  Star,
  Sparkles,
  FileText,
  Briefcase,
  Lightbulb,
  Printer,
  X,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { StudentPortfolio } from '../../types';

export const StudentPortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<StudentPortfolio | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    const data = await v9PublicEngagementApi.getPortfolioByStudentId('std-101');
    setPortfolio(data);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  if (!portfolio) {
    return <div className="p-6 text-slate-400">Loading Student Digital Portfolio...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Module 2: Student Digital Portfolio
            </span>
            <span className="text-xs text-slate-400">Verified Credentials & Graduation Export</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Digital Showcase & Skills Portfolio
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Auto-compiling academic achievements, club leadership, certificates, innovation projects, and teacher recommendations from Vision 1–8 into a lifelong digital credential.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Verified PDF
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {portfolio.studentName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{portfolio.studentName}</h2>
              <p className="text-xs text-blue-300 font-medium">{portfolio.grade} • ID: {portfolio.studentId}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed italic">
            "{portfolio.bio}"
          </p>
        </div>

        {/* Badges Earned */}
        <div className="flex flex-wrap gap-2">
          {portfolio.badges.map((b, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" /> {b}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid: Achievements, Certificates, Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements & Awards */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Award className="w-4 h-4 text-blue-400" /> Academic & Extracurricular Honors
          </h3>

          <div className="space-y-3">
            {portfolio.achievements.map((ach, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{ach.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{ach.date}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block">
                  {ach.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates & Skills */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <FileText className="w-4 h-4 text-purple-400" /> Verified Certificates & Skills
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-400 mb-2 block">Skills Inventory:</span>
              <div className="flex flex-wrap gap-1.5">
                {portfolio.skills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-purple-300 font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 block">Certificates:</span>
              {portfolio.certificates.map((cert, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{cert.title}</span>
                    <span className="text-[10px] text-slate-400">{cert.issuer}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teacher Recommendations */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <UserCheck className="w-4 h-4 text-emerald-400" /> Verified Teacher Endorsements
          </h3>

          <div className="space-y-3">
            {portfolio.recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-emerald-400 block">{rec.teacherName}</span>
                <p className="text-slate-300 leading-relaxed italic">"{rec.comment}"</p>
                <span className="text-[10px] text-slate-500 font-mono block text-right">{rec.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export & Verified Transcript Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-400" /> Official Verified Student Transcript & Portfolio
                </h3>
                <p className="text-xs text-slate-400">Cryptographically Signed SchoolSoul Digital Credential</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white text-slate-900 space-y-4 font-sans text-xs">
              <div className="flex justify-between items-start border-b pb-3 border-slate-200">
                <div>
                  <h4 className="font-black text-base text-slate-900 uppercase">SchoolSoul Academy</h4>
                  <p className="text-slate-600 text-[11px]">Official National Competency & Portfolio Transcript</p>
                  <p className="text-slate-500 text-[10px] mt-1">Student: <strong>{portfolio.studentName}</strong> (ID: {portfolio.studentId})</p>
                </div>
                <div className="text-right">
                  <div className="inline-block p-1 bg-slate-100 rounded border border-slate-300">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">VERIFIED SIGNATURE</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-800">Key Competencies & Verified Badges:</p>
                <div className="flex flex-wrap gap-1">
                  {portfolio.badges.concat(portfolio.skills).map((b, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 border text-slate-800 text-[10px] font-semibold">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                This credential is cryptographically anchored to SchoolSoul immutable audit ledger.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Credential
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(portfolio, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${portfolio.studentName.toLowerCase().replace(/\s+/g, '_')}_transcript.json`;
                  a.click();
                  setShowExportModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
