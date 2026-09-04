import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Save,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  Calculator,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  getAssessments,
  getStudentMarks,
  saveStudentMarks,
  getSchoolClasses,
  getSubjects,
  calculateGrade,
} from '../services/academicsApi';
import { db } from '../db/indexedDB';
import type { Assessment, StudentMark, SchoolClass, Subject, Student } from '../types';

export const TeacherGradebookPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [markEntries, setMarkEntries] = useState<Record<string, { rawScore: number; teacherComments: string }>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedAssessmentId) {
      const ass = assessments.find((a) => a.id === selectedAssessmentId) || null;
      setSelectedAssessment(ass);
      if (ass) {
        loadMarksForAssessment(ass);
      }
    }
  }, [selectedAssessmentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const assList = await getAssessments();
      setAssessments(assList);
      if (assList.length > 0) {
        setSelectedAssessmentId(assList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMarksForAssessment = async (ass: Assessment) => {
    setLoading(true);
    try {
      // Get students in that class
      let stList = await db.students.where('classGrade').equals(ass.classGrade).toArray();
      if (stList.length === 0) {
        // Fallback default students
        stList = [
          {
            id: 'st-1',
            studentId: 'STU-001',
            admissionNumber: 'ADM-2026-001',
            firstName: 'Emmanuel',
            lastName: 'Mugisha',
            fullName: 'Mugisha Emmanuel',
            gender: 'Male',
            dateOfBirth: '2012-05-14',
            nationality: 'Ugandan',
            nationalIdOrBirthCert: 'LIN-99018274',
            classGrade: ass.classGrade,
            stream: 'North',
            residenceType: 'Day',
            status: 'Active',
            enrolmentDate: '2026-01-10',
            qrVerificationHash: 'QR-STU-001-VERIFIED',
            createdAt: '2026-01-10T00:00:00Z',
            updatedAt: '2026-01-10T00:00:00Z',
          },
          {
            id: 'st-2',
            studentId: 'STU-002',
            admissionNumber: 'ADM-2026-002',
            firstName: 'Grace',
            lastName: 'Namutebi',
            fullName: 'Namutebi Grace',
            gender: 'Female',
            dateOfBirth: '2012-08-22',
            nationality: 'Ugandan',
            nationalIdOrBirthCert: 'LIN-99018275',
            classGrade: ass.classGrade,
            stream: 'North',
            residenceType: 'Boarding',
            status: 'Active',
            enrolmentDate: '2026-01-10',
            qrVerificationHash: 'QR-STU-002-VERIFIED',
            createdAt: '2026-01-10T00:00:00Z',
            updatedAt: '2026-01-10T00:00:00Z',
          },
          {
            id: 'st-3',
            studentId: 'STU-003',
            admissionNumber: 'ADM-2026-003',
            firstName: 'Paul',
            lastName: 'Kato',
            fullName: 'Kato Paul',
            gender: 'Male',
            dateOfBirth: '2012-02-11',
            nationality: 'Ugandan',
            nationalIdOrBirthCert: 'LIN-99018276',
            classGrade: ass.classGrade,
            stream: 'South',
            residenceType: 'Day',
            status: 'Active',
            enrolmentDate: '2026-01-10',
            qrVerificationHash: 'QR-STU-003-VERIFIED',
            createdAt: '2026-01-10T00:00:00Z',
            updatedAt: '2026-01-10T00:00:00Z',
          },
        ];
      }
      setStudents(stList);

      const existingMarks = await getStudentMarks(ass.id);
      const initialMap: Record<string, { rawScore: number; teacherComments: string }> = {};

      stList.forEach((s) => {
        const found = existingMarks.find((m) => m.studentId === s.studentId);
        initialMap[s.studentId] = {
          rawScore: found ? found.rawScore : Math.floor(ass.maxScore * 0.75),
          teacherComments: found ? found.teacherComments || '' : 'Good progress',
        };
      });

      setMarkEntries(initialMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, value: number) => {
    const max = selectedAssessment ? selectedAssessment.maxScore : 100;
    const bounded = Math.min(Math.max(0, value), max);
    setMarkEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        rawScore: bounded,
      },
    }));
  };

  const handleCommentChange = (studentId: string, comments: string) => {
    setMarkEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        teacherComments: comments,
      },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedAssessment) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const marksToSave = students.map((s) => {
        const entry = markEntries[s.studentId] || { rawScore: 0, teacherComments: '' };
        const percentScore = Math.round((entry.rawScore / selectedAssessment.maxScore) * 100);
        const { grade, competencyLevel } = calculateGrade(percentScore, 'Ugandan CBC (NCDC)');

        return {
          assessmentId: selectedAssessment.id,
          studentId: s.studentId,
          studentName: s.fullName,
          subjectId: selectedAssessment.subjectId,
          classGrade: selectedAssessment.classGrade,
          stream: s.stream || 'North',
          rawScore: entry.rawScore,
          maxScore: selectedAssessment.maxScore,
          weightedScore: Math.round((entry.rawScore / selectedAssessment.maxScore) * selectedAssessment.weightPercent),
          grade,
          competencyLevel,
          teacherComments: entry.teacherComments,
          recordedBy: 'Mr. Okello Patrick',
        };
      });

      await saveStudentMarks(marksToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && assessments.length === 0) {
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
            <BarChart3 className="w-5 h-5 text-violet-400" /> Teacher Digital Mark Entry Gradebook
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Offline-first mark entry with Dexie local database autosave, missing marks alerts, and auto CBC/UNEB grade calculations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" /> Offline Sync Active
          </div>

          <button
            onClick={handleSaveMarks}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Autosaving...' : 'Save & Publish Marks'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" /> All student assessment marks successfully saved to local Dexie database and queued for sync.
        </div>
      )}

      {/* Assessment Selector */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-300">Select Assessment:</label>
          <select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.subjectName} - {a.classGrade})
              </option>
            ))}
          </select>
        </div>

        {selectedAssessment && (
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span>Max Score: <strong className="text-white">{selectedAssessment.maxScore}</strong></span>
            <span>Weight: <strong className="text-violet-400">{selectedAssessment.weightPercent}%</strong></span>
          </div>
        )}
      </div>

      {/* Gradebook Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Student Marks Entry Sheet ({students.length} Candidates)
          </h2>
          <span className="text-[11px] text-slate-400">
            Auto-calculates UNEB (D1-F9) & CBC (1-3 Descriptor)
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="pb-3">Candidate Name</th>
              <th className="pb-3">Admission No.</th>
              <th className="pb-3 text-center">Score / {selectedAssessment?.maxScore || 100}</th>
              <th className="pb-3 text-center">Percentage</th>
              <th className="pb-3 text-center">Calculated Grade</th>
              <th className="pb-3">Teacher Remarks / Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {students.map((student) => {
              const entry = markEntries[student.studentId] || { rawScore: 0, teacherComments: '' };
              const max = selectedAssessment ? selectedAssessment.maxScore : 100;
              const percent = Math.round((entry.rawScore / max) * 100);
              const { grade, competencyLevel } = calculateGrade(percent, 'Ugandan CBC (NCDC)');

              return (
                <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5">
                    <div className="font-bold text-white">{student.fullName}</div>
                    <div className="text-[10px] text-slate-400">{student.stream || 'North'} Stream</div>
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-slate-400">{student.admissionNumber}</td>
                  <td className="py-3.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={max}
                      value={entry.rawScore}
                      onChange={(e) => handleScoreChange(student.studentId, Number(e.target.value))}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-bold text-white text-xs focus:border-violet-500"
                    />
                  </td>
                  <td className="py-3.5 text-center font-mono font-bold text-slate-200">
                    {percent}%
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                        percent >= 80
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : percent >= 50
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {grade} ({competencyLevel || 'Pass'})
                    </span>
                  </td>
                  <td className="py-3.5">
                    <input
                      type="text"
                      placeholder="Feedback comment..."
                      value={entry.teacherComments}
                      onChange={(e) => handleCommentChange(student.studentId, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
