import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  QrCode,
  FileSpreadsheet,
  Plus,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Building2,
  Phone,
  User,
  LayoutGrid,
  List,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAllStudents, createStudentPassport } from '../services/studentApi';
import { QRScannerModal } from '../components/students/QRScannerModal';
import { BulkImportModal } from '../components/students/BulkImportModal';
import type { Student, StudentStatus, ResidenceType } from '../types';

interface StudentPassportListPageProps {
  onSelectStudent: (studentId: string) => void;
}

export const StudentPassportListPage: React.FC<StudentPassportListPageProps> = ({ onSelectStudent }) => {
  const { user, hasPermission } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [residenceFilter, setResidenceFilter] = useState('All');

  // Modals
  const [showQRModal, setShowQRModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Student Passport Form
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    dateOfBirth: '2013-05-15',
    classGrade: 'Primary 1',
    stream: 'A',
    residenceType: 'Day' as ResidenceType,
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: 'Parent',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [classFilter, statusFilter]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const list = await fetchAllStudents(searchQuery, classFilter, statusFilter);
      setStudents(list);
    } catch (err) {
      console.error('Failed to fetch student list:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (residenceFilter !== 'All' && s.residenceType !== residenceFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q) ||
      (s.nationalIdOrBirthCert && s.nationalIdOrBirthCert.toLowerCase().includes(q))
    );
  });

  const handleCreatePassportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.guardianPhone.trim()) {
      setFormError('Please fill in all required fields (First Name, Last Name, Guardian Phone).');
      return;
    }

    const proposedFullName = [
      formData.firstName.trim(),
      (formData.middleName || '').trim(),
      formData.lastName.trim(),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Check duplicate student by full name + DOB
    const isDuplicate = students.some(
      (s) => s.fullName.toLowerCase() === proposedFullName && s.dateOfBirth === formData.dateOfBirth
    );
    if (isDuplicate) {
      setFormError(`A student named "${formData.firstName} ${formData.lastName}" with Date of Birth (${formData.dateOfBirth}) is already registered.`);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createStudentPassport(formData, user?.id, user?.fullName);
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        gender: 'Male',
        dateOfBirth: '2013-05-15',
        classGrade: 'Primary 1',
        stream: 'A',
        residenceType: 'Day',
        guardianName: '',
        guardianPhone: '',
        guardianRelationship: 'Parent',
      });
      loadStudents();
      if (created?.id) onSelectStudent(created.id);
    } catch (err: any) {
      setFormError(err.message || 'Failed to register student passport.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;
    const header = 'LIN_Student_ID,Admission_No,Full_Name,Gender,Class,Stream,Residence,Status,Enrolment_Date\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.studentId}","${s.admissionNumber}","${s.fullName}","${s.gender}","${s.classGrade}","${s.stream}","${s.residenceType}","${s.status}","${s.enrolmentDate}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolSoul_Student_Passports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Metrics
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.status === 'Active').length;
  const boardingCount = students.filter((s) => s.residenceType === 'Boarding').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" /> Student Lifecycle Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Student Passport Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            360-degree offline student passport profiles, national LIN identifier & class stream directory.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" /> Verify QR / Scan ID
          </button>

          {hasPermission('Student Passport', 'Create') && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Bulk CSV Import
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Student Passport
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Passports
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</div>
          <span className="text-[11px] text-slate-400">Registered in School DB</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Students
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <span className="text-[11px] text-emerald-500/80">Currently Enrolled</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Boarders Ratio
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{boardingCount}</div>
          <span className="text-[11px] text-indigo-500/80">Boarding Section</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Data Export
          </span>
          <button
            onClick={handleExportCSV}
            className="w-full mt-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Records
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                placeholder="Search Student Name, LIN, Admission No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Grades</option>
              <option value="Primary 1">Primary 1</option>
              <option value="Primary 5">Primary 5</option>
              <option value="Primary 6">Primary 6</option>
              <option value="Primary 7">Primary 7</option>
              <option value="Senior 1">Senior 1</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Transferred">Transferred</option>
              <option value="Graduated">Graduated</option>
            </select>

            <select
              value={residenceFilter}
              onChange={(e) => setResidenceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Residence</option>
              <option value="Day">Day</option>
              <option value="Boarding">Boarding</option>
            </select>
          </div>

          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white dark:bg-slate-950">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Render */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading student passports...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No student passport records found matching search filters.
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-4">Student LIN / ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Class & Stream</th>
                  <th className="p-3.5">Residence</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelectStudent(s.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="p-3.5 pl-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {s.studentId}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Adm: {s.admissionNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {s.fullName}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {s.gender} • DOB: {s.dateOfBirth}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {s.classGrade} ({s.stream || 'A'})
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.residenceType === 'Boarding'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {s.residenceType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      <button className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-xs font-bold transition inline-flex items-center gap-1">
                        Open Passport <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectStudent(s.id)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition cursor-pointer shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {s.studentId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">{s.fullName}</h3>
                  <p className="text-xs text-slate-500">
                    {s.classGrade} ({s.stream || 'A'}) • {s.residenceType}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Enrolled: {s.enrolmentDate}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                    View 360 Passport <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        onSelectStudent={onSelectStudent}
      />

      {/* Bulk CSV Import Modal */}
      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={loadStudents}
      />

      {/* Direct Student Passport Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Direct Student Passport Registration
            </h3>

            <form onSubmit={handleCreatePassportSubmit} className="space-y-3 text-xs">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Class Grade</label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Primary 1">Primary 1</option>
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6">Primary 6</option>
                    <option value="Primary 7">Primary 7</option>
                    <option value="Senior 1">Senior 1</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stream</label>
                  <input
                    type="text"
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Residence</label>
                  <select
                    value={formData.residenceType}
                    onChange={(e) => setFormData({ ...formData, residenceType: e.target.value as ResidenceType })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Day">Day</option>
                    <option value="Boarding">Boarding</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Guardian Contact</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Guardian Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+256 700 000 000"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  {submitting ? 'Registering...' : 'Create Passport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
