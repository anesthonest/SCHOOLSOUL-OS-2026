import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  XCircle,
  User,
  Layers,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  getLessonPlans,
  getSchoolClasses,
  getSubjects,
  createLessonPlan,
  updateLessonPlan,
  deleteLessonPlan,
} from '../services/academicsApi';
import type { LessonPlan, SchoolClass, Subject } from '../types';

export const LessonPlannerPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedClass, setSelectedClass] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classGrade, setClassGrade] = useState('Senior 1');
  const [stream, setStream] = useState('North');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [competenciesTargeted, setCompetenciesTargeted] = useState('');
  const [resourcesNeeded, setResourcesNeeded] = useState('');
  const [reflections, setReflections] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lPlans, cList, sList] = await Promise.all([
        getLessonPlans(selectedClass === 'ALL' ? undefined : selectedClass),
        getSchoolClasses(),
        getSubjects(),
      ]);
      setPlans(lPlans);
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
    setEditingPlanId(null);
    setTitle('');
    setLearningOutcomes('');
    setCompetenciesTargeted('');
    setResourcesNeeded('');
    setReflections('');
    if (subjects.length > 0) setSubjectId(subjects[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: LessonPlan) => {
    setEditingPlanId(p.id);
    setTitle(p.title);
    setSubjectId(p.subjectId);
    setClassGrade(p.classGrade);
    setStream(p.stream);
    setLearningOutcomes(p.learningOutcomes);
    setCompetenciesTargeted(p.competenciesTargeted);
    setResourcesNeeded(p.resourcesNeeded);
    setReflections(p.reflections || '');
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === subjectId);
    if (!subj || !title) return;

    try {
      if (editingPlanId) {
        await updateLessonPlan(editingPlanId, {
          title,
          subjectId: subj.id,
          subjectName: subj.subjectName,
          classGrade,
          stream,
          learningOutcomes,
          competenciesTargeted,
          resourcesNeeded,
          reflections,
        });
      } else {
        await createLessonPlan({
          title,
          subjectId: subj.id,
          subjectName: subj.subjectName,
          classGrade,
          stream,
          teacherId: 't-okello',
          teacherName: 'Mr. Okello Patrick',
          lessonDate: new Date().toISOString().split('T')[0],
          learningOutcomes,
          competenciesTargeted,
          resourcesNeeded,
          status: 'Approved',
          reflections,
        });
      }

      setIsModalOpen(false);
      setEditingPlanId(null);
      setTitle('');
      setLearningOutcomes('');
      setCompetenciesTargeted('');
      setResourcesNeeded('');
      setReflections('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlan = async (id: string, planTitle: string) => {
    if (window.confirm(`Are you sure you want to delete lesson plan "${planTitle}"?`)) {
      try {
        await deleteLessonPlan(id);
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
            <FileText className="w-5 h-5 text-amber-400" /> Digital Lesson Planner & Competencies
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create reusable lesson plans linked to NCDC CBC outcomes, learning aids, and post-lesson reflections.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Create Lesson Plan
        </button>
      </div>

      {/* Class Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Filter by Class:</label>
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

        <span className="text-xs text-amber-400 font-bold">
          {plans.length} Lesson Plan(s) Registered
        </span>
      </div>

      {/* Lesson Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                {p.subjectName} • {p.classGrade} ({p.stream})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">{p.lessonDate}</span>
                <button
                  onClick={() => handleOpenEditModal(p)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 transition-all"
                  title="Edit Lesson Plan"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePlan(p.id, p.title)}
                  className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                  title="Delete Lesson Plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white">{p.title}</h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Learning Outcomes</span>
                <p className="text-slate-300 leading-relaxed">{p.learningOutcomes}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Competencies</span>
                <p className="text-slate-300 leading-relaxed">{p.competenciesTargeted}</p>
              </div>

              {p.reflections && (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-300">
                  <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Post-Lesson Reflection</span>
                  <p className="leading-relaxed">{p.reflections}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Teacher: <span className="text-white font-semibold">{p.teacherName}</span></span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create/Edit Lesson Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                {editingPlanId ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Lesson Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quadratic Equations & Graph Plotting"
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
                <label className="block font-semibold text-slate-300 mb-1">Learning Outcomes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe what students will learn by the end of the lesson..."
                  value={learningOutcomes}
                  onChange={(e) => setLearningOutcomes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Competencies Targeted (CBC)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Critical thinking, mathematical reasoning, collaboration..."
                  value={competenciesTargeted}
                  onChange={(e) => setCompetenciesTargeted(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Learning Aids & Resources</label>
                <input
                  type="text"
                  placeholder="Graph books, geometric sets, projector..."
                  value={resourcesNeeded}
                  onChange={(e) => setResourcesNeeded(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Teacher Reflection (Optional)</label>
                <input
                  type="text"
                  placeholder="Notes on student understanding or remediation required..."
                  value={reflections}
                  onChange={(e) => setReflections(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-600/30 flex items-center gap-2"
                >
                  {editingPlanId ? 'Update Lesson Plan' : 'Save Lesson Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
