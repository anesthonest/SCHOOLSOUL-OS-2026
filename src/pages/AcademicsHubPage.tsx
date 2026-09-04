import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  FileCheck,
  Award,
  Layers,
  Users,
  TrendingUp,
  Sparkles,
  BarChart3,
  CheckCircle2,
  FileText,
  Bookmark,
  ShieldCheck,
  Send,
  Building,
} from 'lucide-react';
import { getAcademicAnalyticsOverview } from '../services/academicsApi';

interface AcademicsHubProps {
  onNavigate: (view: string) => void;
}

export const AcademicsHubPage: React.FC<AcademicsHubProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 6,
    totalSubjects: 10,
    activeLessonPlans: 1,
    assignedHomework: 1,
    totalAssessments: 1,
    generatedReportsCount: 0,
    schoolAveragePerformance: 72,
    overallPassRatePercent: 88,
  });

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await getAcademicAnalyticsOverview();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const academicModules = [
    {
      id: 'academic-structure',
      title: 'Academic Structure & Curriculum',
      description: 'Configure Academic Years, Terms, Classes, Streams, Departments, Houses, Clubs, and Ugandan NCDC CBC / UNEB Curricula.',
      icon: Layers,
      color: 'from-blue-600 to-indigo-600',
      tag: 'Module 1 & 2',
    },
    {
      id: 'subject-management',
      title: 'Subject Administration',
      description: 'Manage subject codes, department allocations, core vs elective status, and teacher assignments.',
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-600',
      tag: 'Module 3',
    },
    {
      id: 'timetable-engine',
      title: 'Timetable Generator Engine',
      description: 'Automated & drag-and-drop class timetables, teacher schedules, room allocations, and collision detection.',
      icon: Clock,
      color: 'from-purple-600 to-pink-600',
      tag: 'Module 4',
    },
    {
      id: 'lesson-planner',
      title: 'Lesson Planner & Outcomes',
      description: 'Digitized lesson plans linked to curriculum competencies, resources, objectives, and post-lesson reflections.',
      icon: FileText,
      color: 'from-amber-600 to-orange-600',
      tag: 'Module 5',
    },
    {
      id: 'homework-assignments',
      title: 'Homework & Submissions',
      description: 'Dispatch homework, track student submissions, grade work, and allow parent & student monitoring.',
      icon: Bookmark,
      color: 'from-cyan-600 to-blue-600',
      tag: 'Module 6',
    },
    {
      id: 'assessment-exams',
      title: 'Assessments & Examination Engine',
      description: 'Continuous Assessment (AOI, Test, Coursework) and Exam schedules, invigilation, candidate lists & moderation.',
      icon: FileCheck,
      color: 'from-rose-600 to-red-600',
      tag: 'Module 7 & 8',
    },
    {
      id: 'teacher-gradebook',
      title: 'Teacher Digital Gradebook',
      description: 'Offline-first mark entry sheet with Dexie autosave, missing marks alerts, and auto UNEB / CBC grade calculation.',
      icon: BarChart3,
      color: 'from-indigo-600 to-violet-600',
      tag: 'Module 9 & 11',
    },
    {
      id: 'report-cards',
      title: 'Report Card Engine & QR Verification',
      description: 'Batch generate official report cards with attendance, conduct, subject marks, fee policy checks & QR security code.',
      icon: GraduationCap,
      color: 'from-emerald-600 to-green-600',
      tag: 'Module 10',
    },
    {
      id: 'academic-analytics',
      title: 'Academic Performance Analytics',
      description: 'Headteacher, Teacher, Parent, and Student multi-role dashboards for pass rates, rank analysis, and trends.',
      icon: TrendingUp,
      color: 'from-sky-600 to-blue-700',
      tag: 'Module 12',
    },
    {
      id: 'certificates-transcripts',
      title: 'Certificates & Transcripts',
      description: 'Generate verified Academic Transcripts, School Leaving Certificates, and Testimonials with digital signature.',
      icon: Award,
      color: 'from-yellow-600 to-amber-600',
      tag: 'Module 13',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 border border-blue-800/60 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> SchoolSoul V5 – Academics & Assessment Operating Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Academics, Assessment & Reporting Operations Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            Ugandan Curriculum aligned (NCDC Lower Secondary CBC, UNEB O/A-Level & Primary Thematic) with automated timetables, lesson plans, offline digital gradebooks, report cards with QR cryptographic verification, and transcripts.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Classes</p>
            <p className="text-xl font-black text-white mt-0.5">{stats.totalClasses}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Configured Subjects</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{stats.totalSubjects}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pass Rate Average</p>
            <p className="text-xl font-black text-blue-400 mt-0.5">{stats.overallPassRatePercent}%</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Generated Reports</p>
            <p className="text-xl font-black text-purple-400 mt-0.5">{stats.generatedReportsCount}</p>
          </div>
        </div>
      </div>

      {/* Modules Directory Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" /> Academic Engine Sub-Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {academicModules.map((mod) => {
            const IconComp = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="group relative p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${mod.color} text-white shadow-md`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                      {mod.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open Module</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
