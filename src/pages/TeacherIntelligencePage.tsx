import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  BookOpen,
  MessageSquare,
  BarChart3,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { v8IntelligenceApi } from '../services/v8IntelligenceApi';
import type { TeacherInsightRecord } from '../types';

export const TeacherIntelligencePage: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherInsightRecord[]>([]);
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStaff, setSelectedStaff] = useState<TeacherInsightRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await v8IntelligenceApi.getTeacherInsights();
    setTeachers(data);
    if (data.length > 0 && !selectedStaff) {
      setSelectedStaff(data[0]);
    }
    setLoading(false);
  };

  const filteredTeachers = teachers.filter(
    (t) => selectedDept === 'All Departments' || t.department.includes(selectedDept)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Staff Development & Workload Intelligence
            </span>
            <span className="text-xs text-slate-400">Vision 7 & Vision 5 Integration</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Teacher Intelligence & Workload Analytics
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Monitor teaching load index, lesson scheme completion, assessment timeliness, CPD training hours, and student performance correlations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none"
          >
            <option value="All Departments">All Departments</option>
            <option value="ICT">ICT & Computer Science</option>
            <option value="Languages">Languages & Literature</option>
            <option value="Sciences">Sciences & Mathematics</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Staff Roster (Left) & Teacher Intelligence Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Roster */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-300 flex items-center justify-between">
            <span>Teaching Staff Profiles</span>
            <span className="text-xs text-slate-500 font-mono">{filteredTeachers.length} Staff</span>
          </h2>

          <div className="space-y-2.5">
            {filteredTeachers.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedStaff(t)}
                className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                  selectedStaff?.id === t.id
                    ? 'bg-blue-950/40 border-blue-600 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs">{t.staffName}</div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.performanceTrend === 'Improving'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : t.performanceTrend === 'Stable'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {t.performanceTrend}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t.department}</span>
                  <span className="font-mono text-slate-300">{t.weeklyLessons} Periods/Wk</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>Workload Score: <strong className="text-slate-300">{t.workloadScore}/100</strong></span>
                  <span>CPD: <strong className="text-purple-300">{t.cpdHours} hrs</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Staff Intelligence Profile */}
        <div className="lg:col-span-2">
          {selectedStaff ? (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs text-blue-400 font-mono font-bold">{selectedStaff.staffId}</span>
                  <h2 className="text-xl font-extrabold text-white">{selectedStaff.staffName}</h2>
                  <p className="text-xs text-slate-400">
                    {selectedStaff.department} • <span className="text-slate-300">{selectedStaff.subject}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Teaching Load</span>
                    <span className="text-lg font-black text-blue-400 font-mono">
                      {selectedStaff.weeklyLessons} <span className="text-xs font-normal">periods</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">CPD Training</span>
                    <span className="text-lg font-black text-purple-400 font-mono">
                      {selectedStaff.cpdHours} <span className="text-xs font-normal">hours</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Indicator Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Attendance Rate</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {selectedStaff.attendanceRate}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Lesson Scheme Done</span>
                  <span className="text-base font-black text-blue-400 font-mono">
                    {selectedStaff.lessonCompletionRate}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Marking Timeliness</span>
                  <span className="text-base font-black text-purple-400 font-mono">
                    {selectedStaff.assessmentTimelinessRate}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Student Score Avg</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {selectedStaff.studentAverageScore}%
                  </span>
                </div>
              </div>

              {/* AI Professional Development & Workload Recommendations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Growth & Support Recommendations
                </h3>

                <div className="space-y-2">
                  {selectedStaff.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
