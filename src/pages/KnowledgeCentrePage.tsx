import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Shield,
  FileText,
  Download,
  ExternalLink,
  Layers,
  Filter,
  X,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';
import type { KnowledgeDoc } from '../types';

export const KnowledgeCentrePage: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedAccess, setSelectedAccess] = useState('All Access Levels');
  const [readingDoc, setReadingDoc] = useState<KnowledgeDoc | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await v8IntelligenceApi.getKnowledgeDocs();
    setDocs(data);
  };

  const filteredDocs = docs.filter((d) => {
    const matchesQuery =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All Categories' || d.category === selectedCategory;
    const matchesAccess = selectedAccess === 'All Access Levels' || d.accessLevel === selectedAccess;
    return matchesQuery && matchesCat && matchesAccess;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Institutional Repository
            </span>
            <span className="text-xs text-slate-400">Policy & Circular Hub</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Knowledge Centre & Policy Search
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Searchable repository for safeguarding regulations, staff handbooks, Ministry inspection standards, and Board circulars.
          </p>
        </div>

        {/* Quick User Guide Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open('/api/docs/user-guide/open', '_blank', 'noopener,noreferrer')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open User Guide PDF</span>
          </button>
          <a
            href="/api/docs/user-guide/download"
            download="SchoolSoul_OS_User_Guideline_Book_2026.1.0.pdf"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Guide</span>
          </a>
        </div>
      </div>

      {/* Official User Guide Highlight Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">SchoolSoul OS 2026.1.0 Official User Guide</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 font-bold">PDF MANUAL</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive operations book covering role dashboards, School Market, payments, and system integrity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => window.open('/api/docs/user-guide/open', '_blank', 'noopener,noreferrer')}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </button>
          <a
            href="/api/docs/user-guide/download"
            download="SchoolSoul_OS_User_Guideline_Book_2026.1.0.pdf"
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Download
          </a>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search policies, tags, or circular numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none"
        >
          <option value="All Categories">All Categories</option>
          <option value="Policy">Policy Documents</option>
          <option value="Standard Operating Procedure">Standard Operating Procedures</option>
          <option value="Inspection Report">Inspection Reports</option>
          <option value="Meeting Minutes">Meeting Minutes</option>
        </select>

        <select
          value={selectedAccess}
          onChange={(e) => setSelectedAccess(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none"
        >
          <option value="All Access Levels">All Access Levels</option>
          <option value="Public">Public Staff Documents</option>
          <option value="Restricted">Restricted Leadership</option>
          <option value="Confidential">Confidential Board</option>
        </select>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {doc.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    doc.accessLevel === 'Public'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : doc.accessLevel === 'Restricted'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {doc.accessLevel}
                </span>
              </div>

              <h2 className="text-sm font-bold text-white">{doc.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{doc.summary}</p>

              <div className="flex flex-wrap gap-1 pt-1">
                {doc.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-purple-400" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
              <span>Updated: {doc.lastUpdated}</span>
              <button
                type="button"
                onClick={() => setReadingDoc(doc)}
                className="hover:text-white text-blue-400 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Read / Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Reader Modal */}
      {readingDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {readingDoc.category} • {readingDoc.accessLevel}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{readingDoc.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setReadingDoc(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-white text-slate-900 space-y-4 text-xs font-serif leading-relaxed">
              <div className="border-b pb-3 border-slate-200 flex justify-between items-center font-sans">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">SchoolSoul Institutional Framework</h4>
                  <p className="text-[10px] text-slate-500">Document ID: {readingDoc.id} | Last Revised: {readingDoc.lastUpdated}</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  APPROVED POLICY
                </span>
              </div>

              <div className="space-y-3 font-sans text-xs text-slate-800">
                <h5 className="font-bold text-slate-900 text-sm">1. Purpose & Scope</h5>
                <p>{readingDoc.summary}</p>
                <p>
                  This official institutional instrument governs standard operational procedures, compliance standards, and administrative requirements across all academic departments, administrative officers, and student welfare desks.
                </p>

                <h5 className="font-bold text-slate-900 text-sm">2. Compliance & Verification</h5>
                <p>
                  All faculty, staff, and leadership teams are mandated to review and adhere to the stipulated guidelines. Cryptographic change logs and compliance checklists are maintained within the central SchoolSoul OS audit ledger.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ministry & Board Certified
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Policy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([`SchoolSoul Policy Document: ${readingDoc.title}\nCategory: ${readingDoc.category}\nAccess: ${readingDoc.accessLevel}\nLast Updated: ${readingDoc.lastUpdated}\n\nSummary:\n${readingDoc.summary}`], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${readingDoc.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
                    a.click();
                    setReadingDoc(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
