import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Printer,
  QrCode,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Search,
  Building,
  UserCheck,
} from 'lucide-react';
import {
  generateReportCardsForClass,
  getReportCards,
  getSchoolClasses,
} from '../services/academicsApi';
import type { ReportCard, SchoolClass } from '../types';

export const ReportCardEnginePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('Senior 1');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedYear, setSelectedYear] = useState('2026');

  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [activeCard, setActiveCard] = useState<ReportCard | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, rList] = await Promise.all([
        getSchoolClasses(),
        getReportCards(selectedClass, selectedTerm),
      ]);
      setClasses(cList);
      setReportCards(rList);
      if (rList.length > 0) {
        setActiveCard(rList[0]);
      } else {
        setActiveCard(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    setGenerating(true);
    try {
      const generated = await generateReportCardsForClass(selectedClass, selectedTerm, selectedYear);
      setReportCards(generated);
      if (generated.length > 0) {
        setActiveCard(generated[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && reportCards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" /> Official Report Card Generator & QR Verifier
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Batch generate student terminal reports with subject marks, attendance records, fee policy blocks & cryptographic QR verification.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {activeCard && !activeCard.isFeeBlocked && (
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Active Report
            </button>
          )}

          <button
            onClick={handleGenerateBatch}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> {generating ? 'Generating...' : 'Batch Generate Reports'}
          </button>
        </div>
      </div>

      {/* Selector Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-emerald-400 font-bold">
          {reportCards.length} Report Cards Ready for {selectedClass}
        </span>
      </div>

      {/* Main View: Split List & Active Report Document */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Student Reports List
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {reportCards.map((card) => (
              <div
                key={card.id}
                onClick={() => setActiveCard(card)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeCard?.id === card.id
                    ? 'bg-blue-950/40 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">{card.studentName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{card.admissionNumber}</p>
                </div>

                <div className="text-right">
                  {card.isFeeBlocked ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-bold border border-rose-500/20 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Fee Blocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      Avg: {card.averageScore}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Preview Card Document */}
        <div className="lg:col-span-2">
          {activeCard ? (
            activeCard.isFeeBlocked ? (
              <div className="p-8 rounded-3xl bg-slate-900 border border-rose-800/60 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Report Card Blocked by Fee Clearance Policy</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                    Student <strong className="text-white">{activeCard.studentName}</strong> has an outstanding fee balance of{' '}
                    <strong className="text-rose-400 font-mono">
                      UGX {activeCard.outstandingBalanceUGX?.toLocaleString()}
                    </strong>.
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Per Term Policy, student must clear outstanding balance to unlock official terminal performance report.
                </p>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white text-slate-900 space-y-6 shadow-2xl border border-slate-200">
                {/* Printable School Banner */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      Vinexsah High School
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">P.O. Box 7062 Kampala, Uganda • Tel: +256 700 000000</p>
                    <p className="text-xs font-bold text-blue-900 uppercase mt-1">
                      Official Student Terminal Progress Report Card
                    </p>
                  </div>

                  <div className="text-center">
                    <img src={activeCard.qrCodeUrl} alt="QR Verification" className="w-16 h-16 mx-auto border border-slate-300 p-0.5 rounded" />
                    <p className="text-[8px] font-mono text-slate-500 mt-0.5">Scan to Verify</p>
                  </div>
                </div>

                {/* Student Details Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-3 rounded-xl text-xs font-medium border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Student Name</span>
                    <strong className="text-slate-900">{activeCard.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Admission No.</span>
                    <strong className="text-slate-900 font-mono">{activeCard.admissionNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Class / Stream</span>
                    <strong className="text-slate-900">{activeCard.classGrade} ({activeCard.stream})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Academic Year / Term</span>
                    <strong className="text-slate-900">{activeCard.academicYear} {activeCard.term}</strong>
                  </div>
                </div>

                {/* Subject Performance Table */}
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                    Subject Performance Summary
                  </h3>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                        <th className="p-2 border border-slate-300">Subject Name</th>
                        <th className="p-2 border border-slate-300 text-center">CA Score (20)</th>
                        <th className="p-2 border border-slate-300 text-center">Exam Score (80)</th>
                        <th className="p-2 border border-slate-300 text-center">Total Score (100)</th>
                        <th className="p-2 border border-slate-300 text-center">Grade</th>
                        <th className="p-2 border border-slate-300">Subject Teacher Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCard.subjectGrades.map((sub, idx) => (
                        <tr key={idx} className="border-b border-slate-200 font-medium">
                          <td className="p-2 border border-slate-300 font-bold text-slate-900">{sub.subjectName}</td>
                          <td className="p-2 border border-slate-300 text-center">{sub.caScore}</td>
                          <td className="p-2 border border-slate-300 text-center">{sub.examScore}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-slate-900">{sub.totalScore}%</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-blue-900">{sub.grade}</td>
                          <td className="p-2 border border-slate-300 text-slate-700 text-[11px]">{sub.teacherComment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Overall Comments & Verification Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Class Teacher Comment</span>
                    <p className="text-slate-700 italic">{activeCard.classTeacherComment}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Headteacher Signature & Stamp</span>
                    <p className="text-slate-700 italic">{activeCard.headTeacherComment}</p>
                    <div className="mt-3 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Status: {activeCard.promotionStatus}</span>
                      <span>Verified Stamp ✓</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center border-t border-slate-200 text-[9px] text-slate-500 font-mono">
                  Cryptographic Verification Hash: {activeCard.verificationHash}
                </div>
              </div>
            )
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
              Select a report card from the left panel to preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
