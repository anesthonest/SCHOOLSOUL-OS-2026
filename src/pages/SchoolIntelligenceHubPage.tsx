import React from 'react';
import {
  Sparkles,
  BarChart3,
  Bot,
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  CheckSquare,
  BookOpen,
  Lock,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';

interface SchoolIntelligenceHubPageProps {
  onNavigate: (view: string) => void;
}

export const SchoolIntelligenceHubPage: React.FC<SchoolIntelligenceHubPageProps> = ({
  onNavigate,
}) => {
  const v8Modules = [
    {
      id: 'executive-cockpit',
      title: '1. Executive Growth Cockpit',
      description: 'Central decision-support system synthesizing KPIs across enrolment, attendance, pass rates, fee collections, and safeguarding.',
      icon: BarChart3,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Master Cockpit',
    },
    {
      id: 'ai-assistant',
      title: '2. AI Assistant & Report Generator',
      description: 'Natural language operational queries, citation-grounded answers, and editable executive report drafts ready for export.',
      icon: Bot,
      color: 'from-purple-600 to-pink-600',
      badge: 'Gemini AI',
    },
    {
      id: 'student-intelligence',
      title: '3. Student Success & Risk Radar',
      description: 'Predictive analytics engine for attendance risk, academic decline, welfare concerns, and fee default probability.',
      icon: Users,
      color: 'from-rose-600 to-amber-600',
      badge: 'Early Warning',
    },
    {
      id: 'teacher-intelligence',
      title: '4. Teacher Intelligence & CPD',
      description: 'Workload balancing index, lesson scheme completion, marking timeliness, student outcomes, and peer mentoring.',
      icon: Award,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Staff Load',
    },
    {
      id: 'financial-intelligence',
      title: '5. Financial Intelligence & Simulator',
      description: 'Revenue vs expense forecasts, fee balance age analysis, and interactive what-if scenario planners.',
      icon: DollarSign,
      color: 'from-emerald-600 to-blue-600',
      badge: 'Cash Flow',
    },
    {
      id: 'performance-analytics',
      title: '6. Performance & Resource Intelligence',
      description: 'Cross-analysis matrices across terms, classes, departments, ICT lab utilization, and school transport occupancy.',
      icon: Layers,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Cross Matrix',
    },
    {
      id: 'improvement-tracker',
      title: '7. School Improvement Plan (SIP)',
      description: 'Strategic 5-year goals, annual objectives, department action items, staff ownership, and evidence uploads.',
      icon: CheckSquare,
      color: 'from-blue-600 to-cyan-600',
      badge: 'Goals & KPIs',
    },
    {
      id: 'board-reporting',
      title: '8. Board & Executive Reporting',
      description: 'One-click executive board packs, PTA briefs, and Ministry inspection compliance reports with PDF / Excel exports.',
      icon: Building2,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Board Packs',
    },
    {
      id: 'knowledge-centre',
      title: '9. Knowledge Centre & Policy Search',
      description: 'Institutional repository of safeguarding policies, SOPs, circulars, meeting minutes, and staff handbooks.',
      icon: BookOpen,
      color: 'from-teal-600 to-emerald-600',
      badge: 'Repository',
    },
    {
      id: 'ai-governance',
      title: '10. Security & AI Governance Controls',
      description: 'AI feature toggles, human-in-the-loop safeguards, confidence thresholds, and prompt audit logs.',
      icon: Lock,
      color: 'from-slate-700 to-slate-900',
      badge: 'Audit & Safety',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-purple-950 border border-blue-800/60 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" /> Vision 8 Core Module
          </span>
          <span className="text-xs font-mono text-slate-400">VINEXSAH TECHNOLOGIES • SchoolSoul V8</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">
            School Intelligence, Growth Cockpit & AI Assistant
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Welcome to the SchoolSoul V8 Master Intelligence Platform. This decision-support system turns real operational data collected across Vision 1–7 into evidence-based insights, predictive risk alerts, financial forecasts, and executive reports.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('executive-cockpit')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg"
          >
            Launch Executive Growth Cockpit <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg"
          >
            Open AI School Assistant <Bot className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" /> Vision 8 Intelligence Sub-System Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {v8Modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-3 shadow-lg group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                    {mod.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end text-xs font-bold text-blue-400 group-hover:underline">
                  Explore Module <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
