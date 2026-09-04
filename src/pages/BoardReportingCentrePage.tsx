import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Printer,
  Sparkles,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';

export const BoardReportingCentrePage: React.FC = () => {
  const [reportFormat, setReportFormat] = useState('board_governance_pack');
  const [isCompiling, setIsCompiling] = useState(false);
  const [reportOutput, setReportOutput] = useState<string | null>(null);

  const handleCompileBoardReport = async () => {
    setIsCompiling(true);
    let promptText = '';
    if (reportFormat === 'board_governance_pack') {
      promptText = 'Compile the Official Board of Governors Executive Pack for Term 2 2026 including financial surplus, academic UNEB pass projections, safeguarding cases, and strategic goals.';
    } else if (reportFormat === 'pta_brief') {
      promptText = 'Compile the PTA Executive Summary covering school fee utilization, infrastructure upgrades, sports/welfare activities, and parent engagement.';
    } else {
      promptText = 'Compile the Ministry of Education & Sports Inspection Compliance Pack summarizing teacher ratios, sanitation standards, syllabus coverage, and financial audits.';
    }

    try {
      const res = await v8IntelligenceApi.queryAiAssistant(promptText, 'Executive Board Scope', 'Board Member');
      setReportOutput(res.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Governance & Board Reporting
            </span>
            <span className="text-xs text-slate-400">Executive Report Compiler</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Board & Executive Reporting Centre
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Generate formal executive packs for Board of Governors, PTA Committees, and Ministry Inspectors with automated tables and charts.
          </p>
        </div>
      </div>

      {/* Compiler Controls & Template Selection */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" /> Select Executive Document Template
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setReportFormat('board_governance_pack')}
            className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
              reportFormat === 'board_governance_pack'
                ? 'bg-purple-950/40 border-purple-600 shadow-lg'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-white block">Board of Governors Executive Pack</span>
            <p className="text-[11px] text-slate-400">
              Comprehensive governance brief: Revenue, UNEB projections, staff headcount, and risk audit.
            </p>
          </div>

          <div
            onClick={() => setReportFormat('pta_brief')}
            className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
              reportFormat === 'pta_brief'
                ? 'bg-purple-950/40 border-purple-600 shadow-lg'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-white block">PTA Executive Brief</span>
            <p className="text-[11px] text-slate-400">
              Parent-Teacher Association report: Fee utilization, welfare, academic performance, and events.
            </p>
          </div>

          <div
            onClick={() => setReportFormat('inspection_compliance')}
            className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
              reportFormat === 'inspection_compliance'
                ? 'bg-purple-950/40 border-purple-600 shadow-lg'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-white block">Ministry Inspection Compliance Audit</span>
            <p className="text-[11px] text-slate-400">
              Official Ministry standards report: Sanitation, teacher CPD, licensing, and safety records.
            </p>
          </div>
        </div>

        <button
          onClick={handleCompileBoardReport}
          disabled={isCompiling}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          {isCompiling ? 'Synthesizing Executive Board Pack...' : 'Compile Executive Pack Now'}
        </button>
      </div>

      {/* Compiled Board Pack Document Output */}
      {reportOutput && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-purple-800/60 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Compiled Document Preview
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(reportOutput)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Text
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([reportOutput], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `SchoolSoul_Board_Report_${reportFormat.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Board Pack
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {reportOutput}
          </div>
        </div>
      )}
    </div>
  );
};
