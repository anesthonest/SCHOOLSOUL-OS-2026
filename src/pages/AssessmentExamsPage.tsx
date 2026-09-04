import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  User,
  Shield,
  XCircle,
  FileText,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  getAssessments,
  getExamSchedules,
  getExamSlots,
  getSchoolClasses,
  getSubjects,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  createExamSchedule,
  addExamSlot,
  deleteExamSlot,
} from '../services/academicsApi';
import type { Assessment, AssessmentType, ExamSchedule, ExamSlot, SchoolClass, Subject } from '../types';

export const AssessmentExamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ContinuousAssessment' | 'ExamSchedules'>('ContinuousAssessment');
  const [loading, setLoading] = useState(true);

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Assessment Modal
  const [isAssModalOpen, setIsAssModalOpen] = useState(false);
  const [editingAssId, setEditingAssId] = useState<string | null>(null);
  const [assTitle, setAssTitle] = useState('');
  const [assType, setAssType] = useState<AssessmentType>('Activity of Integration (AOI)');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClass, setSelectedClass] = useState('Senior 1');
  const [maxScore, setMaxScore] = useState(20);
  const [weightPercent, setWeightPercent] = useState(20);

  // Exam Slot Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('09:00 AM');
  const [slotEndTime, setSlotEndTime] = useState('11:00 AM');
  const [slotSubjectId, setSlotSubjectId] = useState('');
  const [slotClassGrade, setSlotClassGrade] = useState('Senior 1');
  const [slotRoom, setSlotRoom] = useState('Main Hall Block A');
  const [slotInvigilator, setSlotInvigilator] = useState('Mr. Patrick Okello');
  const [slotCandidates, setSlotCandidates] = useState(48);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aList, sList, cList, subjList] = await Promise.all([
        getAssessments(),
        getExamSchedules(),
        getSchoolClasses(),
        getSubjects(),
      ]);
      setAssessments(aList);
      setSchedules(sList);
      setClasses(cList);
      setSubjects(subjList);

      if (sList.length > 0) {
        const slots = await getExamSlots(sList[0].id);
        setExamSlots(slots);
      }

      if (subjList.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjList[0].id);
        setSlotSubjectId(subjList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateAssModal = () => {
    setEditingAssId(null);
    setAssTitle('');
    setAssType('Activity of Integration (AOI)');
    setMaxScore(20);
    setWeightPercent(20);
    if (subjects.length > 0) setSelectedSubjectId(subjects[0].id);
    setIsAssModalOpen(true);
  };

  const handleOpenEditAssModal = (a: Assessment) => {
    setEditingAssId(a.id);
    setAssTitle(a.title);
    setAssType(a.assessmentType);
    setSelectedSubjectId(a.subjectId);
    setSelectedClass(a.classGrade);
    setMaxScore(a.maxScore);
    setWeightPercent(a.weightPercent);
    setIsAssModalOpen(true);
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === selectedSubjectId);
    if (!subj || !assTitle) return;

    try {
      if (editingAssId) {
        await updateAssessment(editingAssId, {
          title: assTitle,
          assessmentType: assType,
          subjectId: subj.id,
          subjectName: subj.subjectName,
          classGrade: selectedClass,
          maxScore,
          weightPercent,
        });
      } else {
        await createAssessment({
          title: assTitle,
          assessmentType: assType,
          subjectId: subj.id,
          subjectName: subj.subjectName,
          classGrade: selectedClass,
          stream: 'North',
          academicYear: '2026',
          term: 'Term 1',
          maxScore,
          weightPercent,
          status: 'Published',
          createdBy: 'Dr. Nabirye Sarah',
        });
      }

      setIsAssModalOpen(false);
      setEditingAssId(null);
      setAssTitle('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssessment = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete assessment "${title}"?`)) {
      try {
        await deleteAssessment(id);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === slotSubjectId);
    if (!subj || schedules.length === 0) return;

    try {
      await addExamSlot({
        examScheduleId: schedules[0].id,
        examDate: slotDate || new Date().toISOString().split('T')[0],
        startTime: slotStartTime,
        endTime: slotEndTime,
        subjectId: subj.id,
        subjectName: subj.subjectName,
        classGrade: slotClassGrade,
        roomName: slotRoom,
        invigilatorName: slotInvigilator,
        candidatesCount: slotCandidates,
      });

      setIsSlotModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSlot = async (slotId: string, subjName: string) => {
    if (window.confirm(`Delete exam slot for ${subjName}?`)) {
      try {
        await deleteExamSlot(slotId);
        await loadData();
      } catch (err) {
        console.error(err);
      }
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
            <FileCheck className="w-5 h-5 text-rose-400" /> Assessment & Examination Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous Assessment (AOI, Tests, Projects) and End-of-Term Examination schedules, candidate lists, and moderation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {activeTab === 'ContinuousAssessment' ? (
            <button
              onClick={handleOpenCreateAssModal}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Assessment
            </button>
          ) : (
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Schedule Exam Slot
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('ContinuousAssessment')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ContinuousAssessment'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Continuous Assessments ({assessments.length})
        </button>

        <button
          onClick={() => setActiveTab('ExamSchedules')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ExamSchedules'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Examination Timetable ({examSlots.length})
        </button>
      </div>

      {/* Tab: Continuous Assessment */}
      {activeTab === 'ContinuousAssessment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((a) => (
            <div key={a.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                    {a.assessmentType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Weight: {a.weightPercent}%</span>
                    <button
                      onClick={() => handleOpenEditAssModal(a)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 transition-all"
                      title="Edit Assessment"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssessment(a.id, a.title)}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                      title="Delete Assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white">{a.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Subject: <strong className="text-slate-200">{a.subjectName}</strong>
                </p>
                <p className="text-xs text-slate-400">
                  Target: <strong className="text-slate-200">{a.classGrade} ({a.term})</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Max Marks: <strong className="text-white">{a.maxScore}</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Exam Schedules */}
      {activeTab === 'ExamSchedules' && (
        <div className="space-y-4">
          {schedules.map((sch) => (
            <div key={sch.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white">{sch.examName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sch.academicYear} {sch.term} • Period: {sch.startDate} to {sch.endDate}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                  {sch.status}
                </span>
              </div>

              {/* Slots Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
                      <th className="pb-2">Date & Time</th>
                      <th className="pb-2">Exam Subject</th>
                      <th className="pb-2">Target Class</th>
                      <th className="pb-2">Exam Hall / Room</th>
                      <th className="pb-2">Invigilator</th>
                      <th className="pb-2 text-right">Candidates</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {examSlots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-slate-800/40">
                        <td className="py-3 font-mono text-[11px] text-rose-300 font-bold">
                          {slot.examDate} ({slot.startTime} - {slot.endTime})
                        </td>
                        <td className="py-3 font-bold text-white">{slot.subjectName}</td>
                        <td className="py-3">{slot.classGrade}</td>
                        <td className="py-3 text-slate-400">{slot.roomName}</td>
                        <td className="py-3 text-slate-300">{slot.invigilatorName}</td>
                        <td className="py-3 text-right font-bold text-emerald-400">{slot.candidatesCount}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteSlot(slot.id, slot.subjectName)}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create/Edit Assessment */}
      {isAssModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-rose-400" />
                {editingAssId ? 'Edit Assessment' : 'Register Continuous Assessment'}
              </h2>
              <button
                onClick={() => setIsAssModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Activity of Integration 1"
                  value={assTitle}
                  onChange={(e) => setAssTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assessment Type</label>
                <select
                  value={assType}
                  onChange={(e) => setAssType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Activity of Integration (AOI)">Activity of Integration (AOI) - CBC</option>
                  <option value="Class Test">Class Test</option>
                  <option value="Project">Project / Practical</option>
                  <option value="Coursework">Coursework</option>
                  <option value="End of Term Exam">End of Term Exam</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.className}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Score</label>
                  <input
                    type="number"
                    required
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Final Weight (%)</label>
                  <input
                    type="number"
                    required
                    value={weightPercent}
                    onChange={(e) => setWeightPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/30 flex items-center gap-2"
                >
                  {editingAssId ? 'Update Assessment' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Exam Slot */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-400" /> Schedule Examination Slot
              </h2>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Class</label>
                  <select
                    value={slotClassGrade}
                    onChange={(e) => setSlotClassGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.className}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    placeholder="11:00 AM"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={slotSubjectId}
                  onChange={(e) => setSlotSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    required
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Invigilator</label>
                  <input
                    type="text"
                    required
                    value={slotInvigilator}
                    onChange={(e) => setSlotInvigilator(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Number of Candidates</label>
                <input
                  type="number"
                  required
                  value={slotCandidates}
                  onChange={(e) => setSlotCandidates(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/30 flex items-center gap-2"
                >
                  Save Exam Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
