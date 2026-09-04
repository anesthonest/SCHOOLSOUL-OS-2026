import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { getAcademicAnalyticsOverview, getReportCards } from '../services/academicsApi';
import type { ReportCard } from '../types';

export const AcademicAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'Headteacher' | 'Teacher' | 'Parent' | 'Student'>('Headteacher');
  const [overview, setOverview] = useState({
    totalClasses: 6,
    totalSubjects: 10,
    activeLessonPlans: 1,
    assignedHomework: 1,
    totalAssessments: 1,
    generatedReportsCount: 3,
    schoolAveragePerformance: 74,
    overallPassRatePercent: 92,
  });

  const [topPerformers, setTopPerformers] = useState<ReportCard[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await getAcademicAnalyticsOverview();
      const cards = await getReportCards();
      setOverview(stats);
      setTopPerformers(cards.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            <TrendingUp className="w-5 h-5 text-sky-400" /> Academic Performance Analytics Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-role intelligence dashboards for Headteachers, Teachers, Parents, and Students.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start">
          {(['Headteacher', 'Teacher', 'Parent', 'Student'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                role === r ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r} Dashboard
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase">School Average Mark</p>
          <p className="text-2xl font-black text-sky-400 mt-1">{overview.schoolAveragePerformance}%</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">↑ 3.2% vs last term</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Overall Pass Rate</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{overview.overallPassRatePercent}%</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Threshold ≥ 50%</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Assessments</p>
          <p className="text-2xl font-black text-purple-400 mt-1">{overview.totalAssessments}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">CBC AOI & Exam</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Reports Generated</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{overview.generatedReportsCount}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Terminal cards</p>
        </div>
      </div>

      {/* Role View: Headteacher Analysis */}
      {role === 'Headteacher' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Class Performance Ranking Leaderboard
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Student Candidate Name</th>
                    <th className="pb-3">Class & Stream</th>
                    <th className="pb-3 text-center">Average Score</th>
                    <th className="pb-3 text-center">UNEB / CBC Grade</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {topPerformers.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-amber-400">#{idx + 1}</td>
                      <td className="py-3 font-bold text-white">{st.studentName}</td>
                      <td className="py-3">{st.classGrade} ({st.stream})</td>
                      <td className="py-3 text-center font-bold text-sky-400">{st.averageScore}%</td>
                      <td className="py-3 text-center font-bold text-emerald-400">{st.overallGrade}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{st.promotionStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Role View: Teacher Dashboard */}
      {role === 'Teacher' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Teacher Class Pass Rate Analysis
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Science subjects (Physics, Chemistry, Mathematics) show strong AOI activity participation (86% completion).
            Remediation recommended for Luganda Language and History essay structuring ahead of term exams.
          </p>
        </div>
      )}

      {/* Role View: Parent & Student */}
      {(role === 'Parent' || role === 'Student') && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Personal Subject Growth & Attendance Metrics
          </h2>
          <p className="text-slate-300">
            Attendance: <strong className="text-emerald-400">95% Present</strong> (57 / 60 School Days)
          </p>
          <p className="text-slate-300">
            Current Position: <strong className="text-sky-400">Top 5% in Senior 1 North Stream</strong>
          </p>
        </div>
      )}
    </div>
  );
};
