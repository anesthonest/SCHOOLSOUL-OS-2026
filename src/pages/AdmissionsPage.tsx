import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Building2,
  Phone,
  ChevronRight,
  Eye,
  GraduationCap,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAllAdmissions,
  createAdmissionApplication,
  updateAdmissionStatus,
  enrollAdmissionApplicant,
} from '../services/studentApi';
import type { AdmissionApplication, AdmissionStatus, ResidenceType } from '../types';

interface AdmissionsPageProps {
  onNavigateToStudent?: (studentId: string) => void;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ onNavigateToStudent }) => {
  const { user, hasPermission } = useAuth();
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Modal States
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // New Application Form State
  const [formData, setFormData] = useState({
    applicantFirstName: '',
    applicantMiddleName: '',
    applicantLastName: '',
    dateOfBirth: '2014-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    appliedGrade: 'Primary 1',
    residenceType: 'Day' as ResidenceType,
    previousSchoolName: '',
    previousGrade: '',
    previousAggregate: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: 'Parent',
    guardianEmail: '',
    guardianAddress: '',
    medicalNotes: '',
    specialNeeds: '',
  });

  // Enroll Form State
  const [enrollGrade, setEnrollGrade] = useState('');
  const [enrollStream, setEnrollStream] = useState('A');
  const [enrollHouse, setEnrollHouse] = useState('Nyerere House');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAdmissions();
  }, [activeTab, gradeFilter]);

  const loadAdmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAdmissions(activeTab, gradeFilter);
      setAdmissions(data);
    } catch (err) {
      console.error('Failed to load admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmissions = admissions.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.applicationNumber.toLowerCase().includes(q) ||
      a.applicantFullName.toLowerCase().includes(q) ||
      a.guardianName.toLowerCase().includes(q) ||
      a.guardianPhone.includes(q)
    );
  });

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.applicantFirstName.trim() || !formData.applicantLastName.trim() || !formData.guardianPhone.trim()) {
      setFormError('Please fill in all required fields (First Name, Last Name, Guardian Phone).');
      return;
    }

    const proposedFullName = [
      formData.applicantFirstName.trim(),
      (formData.applicantMiddleName || '').trim(),
      formData.applicantLastName.trim(),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Check duplicate admission application
    const isDuplicate = admissions.some(
      (a) =>
        a.applicantFullName.toLowerCase() === proposedFullName &&
        a.dateOfBirth === formData.dateOfBirth
    );
    if (isDuplicate) {
      setFormError(`An admission application for "${formData.applicantFirstName} ${formData.applicantLastName}" with DOB (${formData.dateOfBirth}) already exists.`);
      return;
    }

    setSubmitting(true);
    try {
      await createAdmissionApplication(formData, user?.id, user?.fullName);
      setShowNewAppModal(false);
      setFormData({
        applicantFirstName: '',
        applicantMiddleName: '',
        applicantLastName: '',
        dateOfBirth: '2014-01-01',
        gender: 'Male',
        appliedGrade: 'Primary 1',
        residenceType: 'Day',
        previousSchoolName: '',
        previousGrade: '',
        previousAggregate: '',
        guardianName: '',
        guardianPhone: '',
        guardianRelationship: 'Parent',
        guardianEmail: '',
        guardianAddress: '',
        medicalNotes: '',
        specialNeeds: '',
      });
      loadAdmissions();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AdmissionStatus) => {
    try {
      await updateAdmissionStatus(id, newStatus, 'Status updated in admissions dashboard', user?.id, user?.fullName);
      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
      loadAdmissions();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    try {
      const result = await enrollAdmissionApplicant(
        selectedApp.id,
        enrollGrade || selectedApp.appliedGrade,
        enrollStream,
        enrollHouse,
        user?.id,
        user?.fullName
      );
      setShowEnrollModal(false);
      setSelectedApp(null);
      loadAdmissions();
      if (onNavigateToStudent && result.student?.id) {
        onNavigateToStudent(result.student.id);
      }
    } catch (err) {
      alert('Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalApps = admissions.length;
  const pendingCount = admissions.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length;
  const approvedCount = admissions.filter((a) => a.status === 'Approved').length;
  const enrolledCount = admissions.filter((a) => a.status === 'Enrolled').length;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Vision 2 Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Admissions Engine & Application Workflow
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Offline-first school admission pipeline, applicant evaluation & one-click enrolment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdmissions}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {hasPermission('Admissions Engine', 'Create') && (
            <button
              onClick={() => setShowNewAppModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Admission Application
            </button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Applications</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalApps}</div>
          <span className="text-[11px] text-slate-400">Academic Year 2026</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</div>
          <span className="text-[11px] text-amber-500/80">Requires Registrar Action</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{approvedCount}</div>
          <span className="text-[11px] text-emerald-500/80">Ready for Enrolment</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Enrolled Passports</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{enrolledCount}</div>
          <span className="text-[11px] text-purple-500/80">Active Student Passports</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Submitted', 'Under Review', 'Approved', 'Enrolled', 'Waitlisted', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === status
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search & Grade Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search applicant or guardian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Grades</option>
              <option value="Primary 1">Primary 1</option>
              <option value="Primary 5">Primary 5</option>
              <option value="Primary 6">Primary 6</option>
              <option value="Primary 7">Primary 7</option>
              <option value="Senior 1">Senior 1</option>
              <option value="Senior 4">Senior 4</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 pl-4">Application No</th>
                <th className="p-3.5">Applicant Name</th>
                <th className="p-3.5">Applied Grade</th>
                <th className="p-3.5">Residence</th>
                <th className="p-3.5">Guardian Contact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading admissions applications...
                  </td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No admission records match your filters.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((app) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {app.status}
                    </span>
                  );
                  if (app.status === 'Approved') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Approved
                      </span>
                    );
                  } else if (app.status === 'Under Review' || app.status === 'Submitted') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {app.status}
                      </span>
                    );
                  } else if (app.status === 'Enrolled') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        Enrolled
                      </span>
                    );
                  } else if (app.status === 'Rejected') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Rejected
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="p-3.5 pl-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {app.applicationNumber}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        {app.applicantFullName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          DOB: {app.dateOfBirth} ({app.gender})
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {app.appliedGrade}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            app.residenceType === 'Boarding'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {app.residenceType}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        <div className="font-medium">{app.guardianName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{app.guardianPhone}</div>
                      </td>
                      <td className="p-3.5">{statusBadge}</td>
                      <td className="p-3.5 pr-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(app);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Application
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail & Review Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {selectedApp.applicationNumber}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedApp.applicantFullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <div className="text-xs">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Current Workflow Status</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedApp.status}</span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedApp.status !== 'Approved' && selectedApp.status !== 'Enrolled' && (
                    <button
                      onClick={() => handleStatusChange(selectedApp.id, 'Approved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      Approve Application
                    </button>
                  )}
                  {selectedApp.status === 'Approved' && (
                    <button
                      onClick={() => {
                        setEnrollGrade(selectedApp.appliedGrade);
                        setShowEnrollModal(true);
                      }}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                    >
                      <GraduationCap className="w-4 h-4" /> Enroll & Create Student Passport
                    </button>
                  )}
                  {selectedApp.status === 'Enrolled' && selectedApp.createdStudentId && (
                    <button
                      onClick={() => {
                        if (onNavigateToStudent && selectedApp.createdStudentId) {
                          onNavigateToStudent(selectedApp.createdStudentId);
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      View Student Passport
                    </button>
                  )}
                </div>
              </div>

              {/* Applicant Bio */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Applicant Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Applied Grade</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedApp.appliedGrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Residence Type</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedApp.residenceType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gender</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedApp.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedApp.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Previous School</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedApp.previousSchoolName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Previous Score</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedApp.previousAggregate || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Guardian Contact */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parent / Guardian Information</h4>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedApp.guardianName}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold text-[10px]">
                      {selectedApp.guardianRelationship}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div>Phone: <span className="font-mono font-medium">{selectedApp.guardianPhone}</span></div>
                    <div>Email: <span className="font-medium">{selectedApp.guardianEmail || 'N/A'}</span></div>
                    <div className="col-span-2">Address: <span className="font-medium">{selectedApp.guardianAddress || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* Medical & Special Notes */}
              {(selectedApp.medicalNotes || selectedApp.specialNeeds) && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medical & Special Conditions</h4>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    {selectedApp.medicalNotes && <p><strong>Medical Notes:</strong> {selectedApp.medicalNotes}</p>}
                    {selectedApp.specialNeeds && <p><strong>Special Needs:</strong> {selectedApp.specialNeeds}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {showNewAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                New Admission Application Registration
              </h3>
              <button
                onClick={() => setShowNewAppModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="p-6 space-y-4 overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.applicantFirstName}
                    onChange={(e) => setFormData({ ...formData, applicantFirstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.applicantMiddleName}
                    onChange={(e) => setFormData({ ...formData, applicantMiddleName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.applicantLastName}
                    onChange={(e) => setFormData({ ...formData, applicantLastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Applied Grade</label>
                  <select
                    value={formData.appliedGrade}
                    onChange={(e) => setFormData({ ...formData, appliedGrade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Primary 1">Primary 1</option>
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6">Primary 6</option>
                    <option value="Primary 7">Primary 7</option>
                    <option value="Senior 1">Senior 1</option>
                    <option value="Senior 4">Senior 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Residence Type</label>
                  <select
                    value={formData.residenceType}
                    onChange={(e) => setFormData({ ...formData, residenceType: e.target.value as ResidenceType })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Day">Day Student</option>
                    <option value="Boarding">Boarding Student</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Previous School Name</label>
                  <input
                    type="text"
                    value={formData.previousSchoolName}
                    onChange={(e) => setFormData({ ...formData, previousSchoolName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Guardian / Parent Contact Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Guardian Phone Number *</label>
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

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enroll Student & Issue Passport
            </h3>
            <p className="text-xs text-slate-500">
              Assign final class and stream for <strong>{selectedApp.applicantFullName}</strong>. This will auto-generate a LIN Student ID, Digital ID Card, and Guardian File.
            </p>

            <form onSubmit={handleEnrollSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Assigned Grade/Class</label>
                <input
                  type="text"
                  required
                  value={enrollGrade}
                  onChange={(e) => setEnrollGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Stream</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A, East, Blue"
                  value={enrollStream}
                  onChange={(e) => setEnrollStream(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">House / Dormitory (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Nyerere House"
                  value={enrollHouse}
                  onChange={(e) => setEnrollHouse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  {submitting ? 'Enrolling...' : 'Confirm Enrolment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
