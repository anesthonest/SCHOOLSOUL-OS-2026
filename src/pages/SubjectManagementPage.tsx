import React, { useState, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  Layers,
  GraduationCap,
  Users,
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
import { useAuth } from '../context/AuthContext';

export const SubjectManagementPage: React.FC = () => {
  const { user, activeRole, schoolProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [department, setDepartment] = useState('');
  const [classification, setClassification] = useState<'Core' | 'Elective' | 'Vocational' | 'Practical / Lab'>('Core');
  const [educationLevel, setEducationLevel] = useState<'Primary' | 'Lower Secondary' | 'Upper Secondary' | 'TVET' | 'All Levels'>('Lower Secondary');
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('Ugandan CBC (NCDC)');
  const [description, setDescription] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  // RBAC permissions
  const canManageSubjects =
    activeRole === 'Administrator' ||
    activeRole === 'School Owner' ||
    activeRole === 'Head Teacher' ||
    activeRole === 'Headteacher' ||
    activeRole === 'Platform Administrator' ||
    user?.role === 'Administrator' ||
    user?.role === 'Headteacher' ||
    user?.role === 'School Owner';

  const isBursarBlocked = activeRole === 'Bursar' || activeRole === 'Finance Officer' || user?.role === 'Bursar';

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
      console.error('Error loading subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSubjectId(null);
    setFormError(null);
    setSubjectCode('');
    setSubjectName('');
    setClassification('Core');
    setEducationLevel('Lower Secondary');
    setCurriculumType('Ugandan CBC (NCDC)');
    setDescription('');
    setSelectedClassIds(classes.map((c) => c.id));
    if (departments.length > 0) setDepartment(departments[0].name);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Subject) => {
    setEditingSubjectId(s.id);
    setFormError(null);
    setSubjectCode(s.subjectCode);
    setSubjectName(s.subjectName);
    setDepartment(s.department);
    setClassification(s.classification as any);
    setEducationLevel((s.educationLevel as any) || 'Lower Secondary');
    setCurriculumType(s.curriculumType);
    setDescription(s.description || '');
    setSelectedClassIds(s.classIds || []);
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const normCode = subjectCode.trim().toUpperCase();
    const normName = subjectName.trim();

    if (!normCode || !normName || !department) {
      setFormError('Please fill in Subject Code, Subject Name, and Department.');
      return;
    }

    // Check unique code within school
    const isDup = subjects.some(
      (s) => s.id !== editingSubjectId && s.subjectCode.toUpperCase() === normCode
    );
    if (isDup) {
      setFormError(`Subject code "${normCode}" is already taken by another subject. Please provide a distinct code.`);
      return;
    }

    try {
      if (editingSubjectId) {
        await updateSubject(editingSubjectId, {
          subjectCode: normCode,
          subjectName: normName,
          department,
          classification,
          educationLevel,
          curriculumType,
          description,
          classIds: selectedClassIds,
        });
      } else {
        await addSubject({
          subjectCode: normCode,
          subjectName: normName,
          department,
          classification,
          educationLevel,
          curriculumType,
          description,
          classIds: selectedClassIds,
          teacherIds: ['t-assigned'],
          isActive: true,
          schoolId: schoolProfile?.id,
        });
      }

      setIsModalOpen(false);
      setEditingSubjectId(null);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save subject. Please check inputs.');
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove or deactivate subject "${name}"? If timetable slots reference this subject, it will be safely deactivated to preserve existing records.`)) {
      return;
    }
    try {
      await deleteSubject(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject.');
    }
  };

  const toggleStatus = async (subj: Subject) => {
    try {
      await updateSubject(subj.id, { isActive: !subj.isActive });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to change subject status.');
    }
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  // Filtered Subject List
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        s.subjectName.toLowerCase().includes(q) ||
        s.subjectCode.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q));

      const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
      const matchesLevel = selectedLevel === 'ALL' || (s.educationLevel || 'Lower Secondary') === selectedLevel;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && s.isActive !== false) ||
        (selectedStatus === 'INACTIVE' && s.isActive === false);

      return matchesSearch && matchesDept && matchesLevel && matchesStatus;
    });
  }, [subjects, searchTerm, selectedDept, selectedLevel, selectedStatus]);

  // Security Gate: Bursar role blocked from modifying academic curriculum
  if (isBursarBlocked) {
    return (
      <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 max-w-2xl mx-auto my-12 space-y-4 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold">Academic Administration Access Boundary</h2>
        <p className="text-xs leading-relaxed">
          Subject and curriculum syllabus administration is strictly reserved for Academic Leadership (Headteacher, Deputy Academics, and System Administrators). The Bursar and Finance Office roles are restricted to financial operations, fee structures, and collection ledgers.
        </p>
      </div>
    );
  }

  if (loading && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Curriculum Subject Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authoritative institutional syllabus catalog, codes, education levels, department alignments, and class allocations.
          </p>
        </div>

        {canManageSubjects && (
          <button
            onClick={handleOpenCreateModal}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 self-start cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        )}
      </div>

      {/* Filter Matrix Bar with 48px touch targets & visible chevrons */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search subjects by name or code"
              placeholder="Search by code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[48px] pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Department"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full min-h-[48px] appearance-none rounded-xl px-3.5 py-3 pr-10 text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300">
              <ChevronDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>

          {/* Education Level Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Education Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full min-h-[48px] appearance-none rounded-xl px-3.5 py-3 pr-10 text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Education Levels</option>
              <option value="Primary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Primary</option>
              <option value="Lower Secondary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lower Secondary</option>
              <option value="Upper Secondary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Upper Secondary</option>
              <option value="TVET" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TVET / Vocational</option>
              <option value="All Levels" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Levels</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300">
              <ChevronDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>

          {/* Active Status Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full min-h-[48px] appearance-none rounded-xl px-3.5 py-3 pr-10 text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses ({subjects.length})</option>
              <option value="ACTIVE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Active Only</option>
              <option value="INACTIVE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Inactive Only</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300">
              <ChevronDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Registered Curriculum Subjects ({filteredSubjects.length})
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Tenant Isolated • School: {schoolProfile?.schoolName || 'Victoria Horizon'}
          </span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No subjects match your filter criteria.
          </div>
        ) : (
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Subject Code & Name</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Classification</th>
                <th className="pb-3">Education Level</th>
                <th className="pb-3">Curriculum Framework</th>
                <th className="pb-3 text-center">Status</th>
                {canManageSubjects && <th className="pb-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredSubjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                        {s.subjectCode}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">
                          {s.subjectName}
                        </span>
                        {s.description && (
                          <span className="text-[10px] text-slate-400 truncate max-w-xs block">
                            {s.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-slate-700 dark:text-slate-300">{s.department}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        s.classification === 'Core'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                          : s.classification === 'Vocational'
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                      }`}
                    >
                      {s.classification}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                    {s.educationLevel || 'Lower Secondary'}
                  </td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">{s.curriculumType}</td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        s.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                      }`}
                    >
                      {s.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canManageSubjects && (
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleStatus(s)}
                          className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            s.isActive !== false
                              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {s.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-all cursor-pointer flex items-center justify-center"
                          title="Edit Subject"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(s.id, s.subjectName)}
                          className="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                          title="Delete or Deactivate Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Add or Edit Subject */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingSubjectId ? 'Edit Subject Configuration' : 'Register New Curriculum Subject'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubject} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                    Subject Code (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MTH 101"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                    Subject Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                    Department *
                  </label>
                  <div className="relative">
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full min-h-[48px] appearance-none rounded-xl px-3.5 py-3 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300">
                      <ChevronDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                    Classification *
                  </label>
                  <div className="relative">
                    <select
                      value={classification}
                      onChange={(e) => setClassification(e.target.value as any)}
                      className="w-full min-h-[48px] appearance-none rounded-xl px-3.5 py-3 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                    >
                      <option value="Core" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Core Subject</option>
                      <option value="Elective" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Elective</option>
                      <option value="Vocational" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Vocational</option>
                      <option value="Practical / Lab" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Practical / Lab</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300">
                      <ChevronDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                    Education Level
                  </label>
                  <div className="relative">
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value as any)}
                      className="w-full min-h-[48px] appearance-none rounded-xl px-3.5 py-3 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                    >
                      <option value="Lower Secondary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lower Secondary (O-Level)</option>
                      <option value="Upper Secondary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Upper Secondary (A-Level)</option>
                      <option value="Primary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Primary</option>
                      <option value="TVET" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TVET / Technical</option>
                      <option value="All Levels" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Levels</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300">
                      <ChevronDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                    Curriculum Framework
                  </label>
                  <div className="relative">
                    <select
                      value={curriculumType}
                      onChange={(e) => setCurriculumType(e.target.value as any)}
                      className="w-full min-h-[48px] appearance-none rounded-xl px-3.5 py-3 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                    >
                      <option value="Ugandan CBC (NCDC)" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ugandan CBC (NCDC)</option>
                      <option value="Ugandan UNEB Traditional" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ugandan UNEB Traditional</option>
                      <option value="Primary Thematic" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Primary Thematic</option>
                      <option value="Cambridge International" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cambridge International</option>
                      <option value="IB World School" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">IB World School</option>
                      <option value="Custom Curriculum" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Custom Curriculum</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300">
                      <ChevronDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                  Target Classes / Grades
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 max-h-32 overflow-y-auto">
                  {classes.map((c) => {
                    const isSelected = selectedClassIds.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleClassSelection(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {c.className}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                  Subject Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline core themes, activities of integration, or lab requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
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
