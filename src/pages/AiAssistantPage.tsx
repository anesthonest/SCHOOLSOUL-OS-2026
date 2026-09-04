import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  FileText,
  Copy,
  Check,
  Download,
  Search,
  BookOpen,
  Users,
  Building2,
  Calendar,
  Layers,
  Bot,
  User,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';
import type { AiQueryMessage } from '../types';

export const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<AiQueryMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am your SchoolSoul V8 AI Assistant. How can I assist with your school operations today?\n\nYou can ask me natural language queries, request custom administrative reports, draft parent communications, or look up school policies.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataSourcesCited: [
        { title: 'SchoolSoul Unified System (Vision 1-7)', category: 'System-Wide', count: 1240 },
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick preset prompts
  const samplePrompts = [
    'Show students with declining attendance in Senior 3',
    'Summarise Term 2 financial collection vs expenditure',
    'Which academic classes need science lab intervention?',
    'Draft a parent meeting invite regarding UNEB mock exams',
    'Policy lookup: What are the guidelines for student mobile phones?',
  ];

  // Report Generator presets
  const [reportType, setReportType] = useState('headteacher_weekly');
  const [reportPreview, setReportPreview] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleSendMessage = async (queryText?: string) => {
    const promptToUse = queryText || inputText;
    if (!promptToUse.trim()) return;

    const userMsg: AiQueryMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToUse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsTyping(true);

    try {
      const assistantMsg = await v8IntelligenceApi.queryAiAssistant(promptToUse);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    let promptText = '';
    if (reportType === 'headteacher_weekly') {
      promptText = 'Generate a comprehensive Weekly Headteacher Brief for Term 2 covering attendance, fees, safeguarding, and academic progress.';
    } else if (reportType === 'finance_digest') {
      promptText = 'Generate a Monthly Financial Health & Fee Collection Digest detailing revenue, outstanding fee age analysis, and cash flow projections.';
    } else if (reportType === 'student_intervention') {
      promptText = 'Generate a Student Academic & Attendance Risk Brief identifying high-risk cohorts and recommended intervention plans.';
    } else {
      promptText = 'Generate an Executive School Improvement & Board Brief summarizing strategic goals and audit indicators.';
    }

    try {
      const res = await v8IntelligenceApi.queryAiAssistant(promptText, 'Executive Reporting Scope', 'Headteacher');
      setReportPreview(res.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> Powered by Gemini & Local AI Engine
            </span>
            <span className="text-xs text-slate-400">Explainable & Data-Grounded</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            School AI Assistant & Report Generator
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Ask natural language operational questions, generate editable executive reports, draft guardian notes, and query policies with full data citations to Vision 1–7.
          </p>
        </div>
      </div>

      {/* Main Grid: AI Chat (Left 2 cols) & Report Generator / Presets (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Natural Language AI Assistant Chat */}
        <div className="lg:col-span-2 flex flex-col h-[650px] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Chat Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">SchoolSoul Intelligence Assistant</h2>
                <p className="text-[11px] text-slate-400">Grounded in local school registers, fee accounts & gradebooks</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Audit Mode Active
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600/80 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-2xl text-xs space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                  {/* Data Source Citations Badge */}
                  {msg.dataSourcesCited && msg.dataSourcesCited.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400">
                      <span className="font-bold text-purple-300 block">Underlying SchoolSoul Data Cited:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.dataSourcesCited.map((cite, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 flex items-center gap-1"
                          >
                            <Layers className="w-3 h-3 text-purple-400" />
                            {cite.title} ({cite.category})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Response
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-purple-600/80 text-white flex items-center justify-center text-xs shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 italic">
                  Analyzing school records & synthesizing data-grounded insights...
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets Carousel */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-slate-500 shrink-0 font-bold">Suggested:</span>
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 transition cursor-pointer"
              >
                "{prompt.slice(0, 32)}..."
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about school attendance, fees, academics, policies..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: AI Report Generator & Drafts */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">Natural Language AI Report Generator</h2>
            </div>
            <p className="text-xs text-slate-400">
              Instantly compile executive reports ready for export to PDF, Word, or print.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Select Report Template</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="headteacher_weekly">Weekly Headteacher Brief</option>
                  <option value="finance_digest">Monthly Finance & Fee Digest</option>
                  <option value="student_intervention">Student Risk & Academic Intervention Brief</option>
                  <option value="board_summary">Board of Governors Strategic Summary</option>
                </select>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingReport ? 'Compiling Report...' : 'Generate Editable Report Draft'}
              </button>
            </div>
          </div>

          {/* Generated Report Preview Modal / Card */}
          {reportPreview && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-800/60 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Report Draft Preview
                </span>
                <button
                  onClick={() => copyToClipboard('report-preview', reportPreview)}
                  className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copy Text
                </button>
              </div>

              <textarea
                value={reportPreview}
                onChange={(e) => setReportPreview(e.target.value)}
                className="w-full h-64 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 leading-relaxed resize-y"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Check className="w-3 h-3" /> Fully editable before exporting
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([reportPreview], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `SchoolSoul_AI_Report_${Date.now()}.txt`;
                      a.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Governance Reminder Notice */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-1.5">
            <span className="font-bold text-blue-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-400" /> Human-in-the-Loop Governance
            </span>
            <p className="text-slate-300 text-[11px]">
              AI outputs assist school decision-making and must be reviewed and verified by authorized school leadership before formal publication or policy changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
