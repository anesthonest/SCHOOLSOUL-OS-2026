import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Building,
  UserCheck,
  Tag,
  Filter,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  getSubjects,
  getAcademicDepartments,
  getSchoolClasses,
  addSubject,
  updateSubject,
  deleteSubject,
} from '../services/academicsApi';
import type { Subject, AcademicDepartment, SchoolClass, CurriculumType } from '../types';

export const SubjectManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [department, setDepartment] = useState('');
  const [classification, setClassification] = useState<'Core' | 'Elective' | 'Vocational' | 'Practical / Lab'>('Core');
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('Ugandan CBC (NCDC)');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjs, depts, cls] = await Promise.all([
        getSubjects(),
        getAcademicDepartments(),
        getSchoolClasses(),
      ]);
      setSubjects(subjs);
      setDepartments(depts);
      setClasses(cls);
      if (depts.length > 0 && !department) {
        setDepartment(depts[0].name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSubjectId(null);
    setSubjectCode('');
    setSubjectName('');
    setClassification('Core');
    setCurriculumType('Ugandan CBC (NCDC)');
    if (departments.length > 0) setDepartment(departments[0].name);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Subject) => {
    setEditingSubjectId(s.id);
    setSubjectCode(s.subjectCode);
    setSubjectName(s.subjectName);
    setDepartment(s.department);
    setClassification(s.classification as any);
    setCurriculumType(s.curriculumType);
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode || !subjectName || !department) return;

    try {
      if (editingSubjectId) {
        await updateSubject(editingSubjectId, {
          subjectCode,
          subjectName,
          department,
          classification,
          curriculumType,
        });
      } else {
        await addSubject({
          subjectCode,
          subjectName,
          department,
          classification,
          curriculumType,
          classIds: classes.map((c) => c.id),
          teacherIds: ['t-okello'],
          isActive: true,
        });
      }

      setIsModalOpen(false);
      setEditingSubjectId(null);
      setSubjectCode('');
      setSubjectName('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteSubject(id);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleStatus = async (subj: Subject) => {
    try {
      await updateSubject(subj.id, { isActive: !subj.isActive });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

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
            <BookOpen className="w-5 h-5 text-emerald-400" /> Academic Subject Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage subject codes, core vs elective classification, department assignments, and class allocations.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subject name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
          Configured Subjects ({filteredSubjects.length})
        </h2>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="pb-3">Subject Code & Name</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Classification</th>
              <th className="pb-3">Curriculum Framework</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredSubjects.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-1 rounded bg-slate-800 text-emerald-400 font-mono text-[10px] font-bold border border-slate-700">
                      {s.subjectCode}
                    </span>
                    <span className="font-bold text-white text-xs">{s.subjectName}</span>
                  </div>
                </td>
                <td className="py-3.5 text-slate-300 font-medium">{s.department}</td>
                <td className="py-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.classification === 'Core'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : s.classification === 'Vocational'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {s.classification}
                  </span>
                </td>
                <td className="py-3.5 text-slate-400">{s.curriculumType}</td>
                <td className="py-3.5 text-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => toggleStatus(s)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all"
                    >
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(s)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-all"
                      title="Edit Subject"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(s.id, s.subjectName)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 transition-all"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit Subject */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                {editingSubjectId ? 'Edit Subject' : 'Register New Subject'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject Code (e.g. MTH 101)</label>
                <input
                  type="text"
                  required
                  placeholder="MTH 101"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="Mathematics"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Academic Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject Classification</label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Core">Core Subject</option>
                  <option value="Elective">Elective</option>
                  <option value="Vocational">Vocational</option>
                  <option value="Practical / Lab">Practical / Lab</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Curriculum Framework</label>
                <select
                  value={curriculumType}
                  onChange={(e) => setCurriculumType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Ugandan CBC (NCDC)">Ugandan CBC (NCDC)</option>
                  <option value="Ugandan UNEB Traditional">Ugandan UNEB Traditional</option>
                  <option value="Primary Thematic">Primary Thematic</option>
                  <option value="Cambridge International">Cambridge International</option>
                  <option value="IB World School">IB World School</option>
                  <option value="Custom Curriculum">Custom Curriculum</option>
                </select>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2"
                >
                  {editingSubjectId ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
