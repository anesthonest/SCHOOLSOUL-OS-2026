import React, { useState, useEffect } from 'react';
import {
  Layers,
  Calendar,
  Building,
  Home,
  Users,
  Plus,
  CheckCircle2,
  BookOpen,
  XCircle,
  Sparkles,
  Settings,
  Shield,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  getAcademicYears,
  getAcademicTerms,
  getSchoolClasses,
  getAcademicDepartments,
  getSchoolHouses,
  getAcademicClubs,
  addSchoolClass,
  updateSchoolClass,
  deleteSchoolClass,
  addAcademicDepartment,
  deleteAcademicDepartment,
  addSchoolHouse,
  deleteSchoolHouse,
  addAcademicClub,
  deleteAcademicClub,
} from '../services/academicsApi';
import type {
  AcademicYearConfig,
  AcademicTermConfig,
  SchoolClass,
  AcademicDepartment,
  SchoolHouse,
  AcademicClub,
  CurriculumType,
} from '../types';

export const AcademicStructurePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'YearsTerms' | 'ClassesStreams' | 'Departments' | 'HousesClubs' | 'Curriculum'>('ClassesStreams');
  const [loading, setLoading] = useState(true);

  const [years, setYears] = useState<AcademicYearConfig[]>([]);
  const [terms, setTerms] = useState<AcademicTermConfig[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [houses, setHouses] = useState<SchoolHouse[]>([]);
  const [clubs, setClubs] = useState<AcademicClub[]>([]);

  // Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newLevel, setNewLevel] = useState<'Primary' | 'Lower Secondary' | 'Upper Secondary' | 'TVET' | 'Tertiary'>('Lower Secondary');
  const [newCurriculum, setNewCurriculum] = useState<CurriculumType>('Ugandan CBC (NCDC)');
  const [newStreams, setNewStreams] = useState('North, South, East');

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptHod, setDeptHod] = useState('');

  // House Modal State
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [houseName, setHouseName] = useState('');
  const [houseColor, setHouseColor] = useState('#3b82f6');
  const [housePatron, setHousePatron] = useState('');

  // Club Modal State
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubCategory, setClubCategory] = useState<'Academic' | 'Sports' | 'Social & Leadership' | 'Arts & Culture'>('Academic');
  const [clubPatron, setClubPatron] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [yrs, trms, cls, depts, hs, clbs] = await Promise.all([
        getAcademicYears(),
        getAcademicTerms(),
        getSchoolClasses(),
        getAcademicDepartments(),
        getSchoolHouses(),
        getAcademicClubs(),
      ]);
      setYears(yrs);
      setTerms(trms);
      setClasses(cls);
      setDepartments(depts);
      setHouses(hs);
      setClubs(clbs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateClassModal = () => {
    setEditingClassId(null);
    setNewClassName('');
    setNewClassCode('');
    setNewLevel('Lower Secondary');
    setNewCurriculum('Ugandan CBC (NCDC)');
    setNewStreams('North, South, East');
    setIsClassModalOpen(true);
  };

  const handleOpenEditClassModal = (c: SchoolClass) => {
    setEditingClassId(c.id);
    setNewClassName(c.className);
    setNewClassCode(c.classCode);
    setNewLevel(c.level as any);
    setNewCurriculum(c.curriculumType);
    setNewStreams(c.streams.join(', '));
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassCode) return;

    try {
      const streamList = newStreams.split(',').map((s) => s.trim()).filter(Boolean);
      if (editingClassId) {
        await updateSchoolClass(editingClassId, {
          className: newClassName,
          classCode: newClassCode,
          level: newLevel,
          curriculumType: newCurriculum,
          streams: streamList,
        });
      } else {
        await addSchoolClass({
          className: newClassName,
          classCode: newClassCode,
          level: newLevel,
          curriculumType: newCurriculum,
          streams: streamList,
        });
      }

      setIsClassModalOpen(false);
      setEditingClassId(null);
      setNewClassName('');
      setNewClassCode('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete class "${name}"?`)) {
      try {
        await deleteSchoolClass(id);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptCode || !deptName) return;

    try {
      await addAcademicDepartment({
        code: deptCode,
        name: deptName,
        headOfDepartmentName: deptHod || 'Unassigned',
      });
      setIsDeptModalOpen(false);
      setDeptCode('');
      setDeptName('');
      setDeptHod('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete department "${name}"?`)) {
      try {
        await deleteAcademicDepartment(id);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseName) return;

    try {
      await addSchoolHouse({
        houseName,
        colorHex: houseColor,
        patronTeacherName: housePatron || 'Unassigned Staff',
      });
      setIsHouseModalOpen(false);
      setHouseName('');
      setHousePatron('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHouse = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete house "${name}"?`)) {
      try {
        await deleteSchoolHouse(id);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName) return;

    try {
      await addAcademicClub({
        clubName,
        category: clubCategory,
        patronTeacherName: clubPatron || 'Unassigned Staff',
      });
      setIsClubModalOpen(false);
      setClubName('');
      setClubPatron('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClub = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete club "${name}"?`)) {
      try {
        await deleteAcademicClub(id);
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
            <Layers className="w-5 h-5 text-blue-400" /> Academic Structure & Curriculum Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Academic Calendar Years, Terms, Classes, Streams, Departments, Houses, Clubs & Ugandan NCDC CBC Curriculum parameters.
          </p>
        </div>

        {activeTab === 'ClassesStreams' && (
          <button
            onClick={handleOpenCreateClassModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" /> Add Class & Streams
          </button>
        )}

        {activeTab === 'Departments' && (
          <button
            onClick={() => setIsDeptModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        )}

        {activeTab === 'HousesClubs' && (
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => setIsHouseModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add House
            </button>
            <button
              onClick={() => setIsClubModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Club
            </button>
          </div>
        )}
      </div>

      {/* Tabs Nav */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('ClassesStreams')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ClassesStreams'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Classes & Streams ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('YearsTerms')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'YearsTerms'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Academic Years & Terms
        </button>

        <button
          onClick={() => setActiveTab('Departments')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'Departments'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('HousesClubs')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'HousesClubs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Home className="w-4 h-4" /> Houses & Clubs ({houses.length + clubs.length})
        </button>

        <button
          onClick={() => setActiveTab('Curriculum')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'Curriculum'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Curriculum Frameworks
        </button>
      </div>

      {/* Tab Content: Classes & Streams */}
      {activeTab === 'ClassesStreams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-mono text-xs font-bold border border-blue-500/20">
                  {cls.classCode}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">
                    {cls.level}
                  </span>
                  <button
                    onClick={() => handleOpenEditClassModal(cls)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 transition-all"
                    title="Edit Class"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.className)}
                    className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                    title="Delete Class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{cls.className}</h3>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                  Curriculum: {cls.curriculumType}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Active Class Streams ({cls.streams.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cls.streams.map((st) => (
                    <span key={st} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700">
                      {st} Stream
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Academic Years & Terms */}
      {activeTab === 'YearsTerms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Academic Years Registry
            </h2>
            <div className="space-y-3">
              {years.map((y) => (
                <div key={y.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{y.yearName} Academic Year</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {y.startDate} to {y.endDate}
                    </p>
                  </div>
                  {y.isCurrent && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      Active Year
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" /> Terms & Report Release Policy
            </h2>
            <div className="space-y-3">
              {terms.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{t.termName}</h3>
                    {t.isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                        Current Active Term
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Duration: {t.startDate} to {t.endDate}
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Report Card Release Policy:</span>
                    <span className="font-bold text-orange-400">{t.reportReleaseFeePolicy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Departments */}
      {activeTab === 'Departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-mono font-bold border border-purple-500/20">
                  {d.code}
                </span>
                <button
                  onClick={() => handleDeleteDepartment(d.id, d.name)}
                  className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                  title="Delete Department"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-white">{d.name}</h3>
              <p className="text-xs text-slate-400">
                HOD: <span className="text-slate-200 font-semibold">{d.headOfDepartmentName || 'Unassigned'}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Houses & Clubs */}
      {activeTab === 'HousesClubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" /> School Houses
            </h2>
            <div className="space-y-2">
              {houses.map((h) => (
                <div key={h.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-white/20 shadow-md" style={{ backgroundColor: h.colorHex }} />
                    <div>
                      <h4 className="text-xs font-bold text-white">{h.houseName}</h4>
                      <p className="text-[10px] text-slate-400">Patron: {h.patronTeacherName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteHouse(h.id, h.houseName)}
                    className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                    title="Delete House"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Co-Curricular Clubs
            </h2>
            <div className="space-y-2">
              {clubs.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.clubName}</h4>
                    <p className="text-[10px] text-slate-400">Patron: {c.patronTeacherName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                      {c.category}
                    </span>
                    <button
                      onClick={() => handleDeleteClub(c.id, c.clubName)}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                      title="Delete Club"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Curriculum Frameworks */}
      {activeTab === 'Curriculum' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" /> Supported Curriculum Frameworks
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-blue-400">Ugandan CBC (NCDC Lower Secondary)</h3>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">DEFAULT</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Competency-Based Curriculum introduced by NCDC. Features Activity of Integration (AOI) weighted at 20% Continuous Assessment + 80% Summative Exam, with 1-3 Descriptor scale.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-extrabold text-white">Ugandan UNEB Traditional (O/A-Level)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Classic UNEB assessment with Distinction 1 (D1) to Fail 9 (F9) grading scale for O-Level, and Principal Passes A-E for A-Level.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-extrabold text-white">Primary Thematic Curriculum</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Integrated literacy, numeracy, and environmental studies for Primary 1 to Primary 7.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-extrabold text-white">Cambridge & International Baccalaureate (IB)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Future-ready framework supporting IGCSE / A-Level letter grades and IB 1-7 scale.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Class */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                {editingClassId ? 'Edit Class & Streams' : 'Create Class & Assign Streams'}
              </h2>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Class Title (e.g. Senior 1)</label>
                <input
                  type="text"
                  required
                  placeholder="Senior 1"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Class Code (e.g. S.1)</label>
                <input
                  type="text"
                  required
                  placeholder="S.1"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Education Level</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Primary">Primary</option>
                  <option value="Lower Secondary">Lower Secondary</option>
                  <option value="Upper Secondary">Upper Secondary</option>
                  <option value="TVET">TVET</option>
                  <option value="Tertiary">Tertiary</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Curriculum Framework</label>
                <select
                  value={newCurriculum}
                  onChange={(e) => setNewCurriculum(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Ugandan CBC (NCDC)">Ugandan CBC (NCDC)</option>
                  <option value="Ugandan UNEB Traditional">Ugandan UNEB Traditional</option>
                  <option value="Primary Thematic">Primary Thematic</option>
                  <option value="Cambridge International">Cambridge International</option>
                  <option value="IB World School">IB World School</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Streams (Comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="North, South, East, West"
                  value={newStreams}
                  onChange={(e) => setNewStreams(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 flex items-center gap-2"
                >
                  {editingClassId ? 'Update Class' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Department */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" /> Create Academic Department
              </h2>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department Code (e.g. SCI)</label>
                <input
                  type="text"
                  required
                  placeholder="SCI"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="Science Department"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Head of Department (HOD) Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Nabirye Sarah"
                  value={deptHod}
                  onChange={(e) => setDeptHod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30 flex items-center gap-2"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add House */}
      {isHouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-400" /> Register School House
              </h2>
              <button
                onClick={() => setIsHouseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHouse} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">House Name (e.g. Mandela House)</label>
                <input
                  type="text"
                  required
                  placeholder="Mandela House"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">House Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={houseColor}
                    onChange={(e) => setHouseColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <span className="font-mono text-slate-300">{houseColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Patron / Housemaster Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Okello Patrick"
                  value={housePatron}
                  onChange={(e) => setHousePatron(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsHouseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2"
                >
                  Save House
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Club */}
      {isClubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Register Co-Curricular Club
              </h2>
              <button
                onClick={() => setIsClubModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClub} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Club Name (e.g. Robotics Club)</label>
                <input
                  type="text"
                  required
                  placeholder="Robotics & Coding Club"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={clubCategory}
                  onChange={(e) => setClubCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="Sports">Sports</option>
                  <option value="Social & Leadership">Social & Leadership</option>
                  <option value="Arts & Culture">Arts & Culture</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Patron Teacher Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ssemwogerere David"
                  value={clubPatron}
                  onChange={(e) => setClubPatron(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClubModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/30 flex items-center gap-2"
                >
                  Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
