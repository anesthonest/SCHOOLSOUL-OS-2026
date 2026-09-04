import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  User,
  XCircle,
  Edit3,
  Trash2,
  Send,
} from 'lucide-react';
import {
  getHomeworkAssignments,
  getSchoolClasses,
  getSubjects,
  createHomeworkAssignment,
  updateHomeworkAssignment,
  deleteHomeworkAssignment,
  submitHomework,
} from '../services/academicsApi';
import type { HomeworkAssignment, SchoolClass, Subject } from '../types';

export const HomeworkAssignmentsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedClass, setSelectedClass] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHwId, setEditingHwId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classGrade, setClassGrade] = useState('Senior 1');
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState(20);
  const [attachmentName, setAttachmentName] = useState('');

  // Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submittingHw, setSubmittingHw] = useState<HomeworkAssignment | null>(null);
  const [studentName, setStudentName] = useState('Kato Emmanuel');
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hList, cList, sList] = await Promise.all([
        getHomeworkAssignments(selectedClass === 'ALL' ? undefined : selectedClass),
        getSchoolClasses(),
        getSubjects(),
      ]);
      setAssignments(hList);
      setClasses(cList);
      setSubjects(sList);
      if (sList.length > 0 && !subjectId) {
        setSubjectId(sList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingHwId(null);
    setTitle('');
    setDescription('');
    setAttachmentName('');
    setDueDate('');
    setTotalPoints(20);
    if (subjects.length > 0) setSubjectId(subjects[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hw: HomeworkAssignment) => {
    setEditingHwId(hw.id);
    setTitle(hw.title);
    setDescription(hw.description);
    setSubjectId(hw.subjectId);
    setClassGrade(hw.classGrade);
    setDueDate(hw.dueDate);
    setTotalPoints(hw.totalPoints);
    setAttachmentName(hw.attachmentName || '');
    setIsModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === subjectId);
    if (!subj || !title) return;

    try {
      if (editingHwId) {
        await updateHomeworkAssignment(editingHwId, {
          title,
          description,
          subjectId: subj.id,
          subjectName: subj.subjectName,
          classGrade,
          dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          totalPoints,
          attachmentName,
        });
      } else {
        await createHomeworkAssignment({
          title,
          description,
          subjectId: subj.id,
          subjectName: subj.subjectName,
          classGrade,
          stream: 'North',
          teacherId: 't-okello',
          teacherName: 'Mr. Okello Patrick',
          dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          totalPoints,
          attachmentName,
        });
      }

      setIsModalOpen(false);
      setEditingHwId(null);
      setTitle('');
      setDescription('');
      setAttachmentName('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssignment = async (id: string, hwTitle: string) => {
    if (window.confirm(`Are you sure you want to delete assignment "${hwTitle}"?`)) {
      try {
        await deleteHomeworkAssignment(id);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenSubmitModal = (hw: HomeworkAssignment) => {
    setSubmittingHw(hw);
    setSubmissionText('');
    setIsSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw) return;

    try {
      await submitHomework({
        homeworkId: submittingHw.id,
        studentId: 'std-kato-1',
        studentName,
        classGrade: submittingHw.classGrade,
        submissionText: submissionText || 'Answer sheet submitted online',
        status: 'Pending',
      });
      setIsSubmitModalOpen(false);
      setSubmittingHw(null);
      await loadData();
    } catch (err) {
      console.error(err);
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
            <Bookmark className="w-5 h-5 text-cyan-400" /> Homework & Submissions Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign homework tasks, set submission deadlines, attach worksheets, and record student submissions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Create Homework
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Class Filter:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-cyan-400 font-bold">
          {assignments.length} Homework Item(s) Active
        </span>
      </div>

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((hw) => (
          <div key={hw.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                  {hw.subjectName} • {hw.classGrade}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Due: {hw.dueDate}
                  </span>
                  <button
                    onClick={() => handleOpenEditModal(hw)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 transition-all"
                    title="Edit Assignment"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(hw.id, hw.title)}
                    className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white">{hw.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{hw.description}</p>

              {hw.attachmentName && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-blue-400 font-medium">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{hw.attachmentName}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Points: <strong className="text-white">{hw.totalPoints} Marks</strong></span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-bold text-[10px]">
                  {hw.submissionsCount} Submissions
                </span>
                <button
                  onClick={() => handleOpenSubmitModal(hw)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1 transition-all"
                >
                  <Send className="w-3 h-3" /> Submit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create/Edit Homework */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-cyan-400" />
                {editingHwId ? 'Edit Homework' : 'Assign Homework'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Wave Calculations Sheet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
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
                  <label className="block font-semibold text-slate-300 mb-1">Class Grade</label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
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

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Instructions / Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide detailed instructions for students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Total Points / Marks</label>
                  <input
                    type="number"
                    required
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Worksheet Attachment Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Physics_Worksheet_01.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/30 flex items-center gap-2"
                >
                  {editingHwId ? 'Update Homework' : 'Publish Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Homework */}
      {isSubmitModalOpen && submittingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" /> Submit Homework Work
              </h2>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assignment</span>
                <p className="text-white font-bold">{submittingHw.title} ({submittingHw.subjectName})</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Answers / Work Submission Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter answers, working steps, or submission notes..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
