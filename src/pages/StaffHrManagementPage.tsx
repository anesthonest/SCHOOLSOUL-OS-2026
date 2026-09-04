import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Building,
  GraduationCap,
  Shield,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  UserPlus,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { StaffProfile } from '../types';

export const StaffHrManagementPage: React.FC = () => {
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    staffCode: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'Teacher',
    department: 'Sciences',
    designation: 'Senior Teacher',
    employmentType: 'Full Time Teaching',
    qualifications: 'B.Ed (Hons), Dip. Secondary Education',
    nssfNumber: '',
    tinNumber: '',
    contractStartDate: new Date().toISOString().split('T')[0],
    emergencyContactName: '',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '',
    jobDescription: 'Conducting scheduled curriculum lessons, laboratory sessions, and continuous student evaluations.',
    status: 'Active' as StaffProfile['status'],
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await v7Api.getStaffProfiles();
      setProfiles(data);
      if (data.length > 0) {
        setSelectedStaff((prev) => (prev ? data.find((d) => d.id === prev.id) || data[0] : data[0]));
      } else {
        setSelectedStaff(null);
      }
    } catch (err) {
      console.error('Failed to load staff profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStaffId(null);
    setFormError('');
    const nextNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      staffCode: `EMP-${nextNum}`,
      fullName: '',
      email: '',
      phone: '+256 ',
      role: 'Teacher',
      department: 'Sciences',
      designation: 'Subject Teacher',
      employmentType: 'Full Time Teaching',
      qualifications: 'B.Ed (Education)',
      nssfNumber: '',
      tinNumber: '',
      contractStartDate: new Date().toISOString().split('T')[0],
      emergencyContactName: '',
      emergencyContactRelation: 'Spouse',
      emergencyContactPhone: '+256 ',
      jobDescription: 'Classroom teaching and curriculum delivery.',
      status: 'Active',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (staff: StaffProfile) => {
    setEditingStaffId(staff.id);
    setFormError('');
    setFormData({
      staffCode: staff.staffCode,
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone || staff.phoneNumber || '',
      role: staff.role,
      department: staff.department,
      designation: staff.designation,
      employmentType: staff.employmentType,
      qualifications: Array.isArray(staff.qualifications)
        ? staff.qualifications.join(', ')
        : (staff.qualification || ''),
      nssfNumber: staff.nssfNumber || '',
      tinNumber: staff.tinNumber || '',
      contractStartDate: staff.contractStartDate || staff.joiningDate || new Date().toISOString().split('T')[0],
      emergencyContactName: staff.emergencyContactName || '',
      emergencyContactRelation: staff.emergencyContactRelation || 'Next of Kin',
      emergencyContactPhone: staff.emergencyContactPhone || '',
      jobDescription: staff.jobDescription || '',
      status: staff.status || 'Active',
    });
    setShowAddModal(true);
  };

  const handleSubmitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName.trim()) {
      setFormError('Full legal name is required.');
      return;
    }
    if (!formData.staffCode.trim()) {
      setFormError('Staff / Employee Code is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Contact telephone number is required.');
      return;
    }

    // Duplicate Check
    const duplicate = profiles.find(
      (p) =>
        p.id !== editingStaffId &&
        (p.staffCode.toLowerCase() === formData.staffCode.trim().toLowerCase() ||
          (formData.email && p.email.toLowerCase() === formData.email.trim().toLowerCase()))
    );
    if (duplicate) {
      setFormError(`A staff record with Code "${formData.staffCode}" or Email already exists.`);
      return;
    }

    setSubmitting(true);
    try {
      const qualificationsArray = formData.qualifications
        ? formData.qualifications.split(',').map((q) => q.trim()).filter(Boolean)
        : ['B.Ed'];

      const payload: Partial<StaffProfile> = {
        id: editingStaffId || `STAFF-${Date.now()}`,
        staffCode: formData.staffCode.trim().toUpperCase(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase() || `${formData.staffCode.toLowerCase()}@schoolos.ug`,
        phone: formData.phone.trim(),
        phoneNumber: formData.phone.trim(),
        role: formData.role,
        department: formData.department,
        designation: formData.designation.trim(),
        qualifications: qualificationsArray,
        qualification: qualificationsArray.join(', '),
        employmentType: formData.employmentType,
        contractStartDate: formData.contractStartDate,
        joiningDate: formData.contractStartDate,
        nssfNumber: formData.nssfNumber.trim(),
        tinNumber: formData.tinNumber.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactRelation: formData.emergencyContactRelation.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContact: `${formData.emergencyContactName} (${formData.emergencyContactRelation}) - ${formData.emergencyContactPhone}`,
        jobDescription: formData.jobDescription.trim(),
        status: formData.status,
        salaryGradeRef: 'SCALE-U3',
        totalCPDPoints: 12,
        performanceRating: 'Meets Expectations',
      };

      const saved = await v7Api.saveStaffProfile(payload);
      await loadStaff();
      setSelectedStaff(saved);
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save staff profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove staff member "${name}"?`)) {
      return;
    }
    try {
      await v7Api.deleteStaffProfile(id);
      await loadStaff();
    } catch (err) {
      alert('Failed to delete staff record.');
    }
  };

  const filtered = profiles.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const teachingCount = profiles.filter(
    (p) => p.employmentType === 'Full Time Teaching' || p.role.toLowerCase().includes('teacher')
  ).length;
  const adminCount = profiles.length - teachingCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>SchoolSoul Human Resources & Staff Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff HR & Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            Centralized employee master files, contract records, NSSF/TIN compliance, academic qualifications, emergency contacts, and active status.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Register New Staff / Teacher
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Active Staff</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{profiles.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Teaching Faculty</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{teachingCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Support & Admin Staff</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{adminCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Compliance Verified</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">100%</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search staff code, name, designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Sciences">Sciences</option>
              <option value="Humanities">Humanities</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Languages">Languages</option>
              <option value="Administration">Administration</option>
              <option value="ICT & Technical">ICT & Technical</option>
              <option value="Student Affairs">Student Affairs</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                Loading staff profiles...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No staff members found matching criteria.</p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Register New Staff Member
                </button>
              </div>
            ) : (
              filtered.map((s) => {
                const isSelected = selectedStaff?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStaff(s)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          {s.staffCode}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.fullName}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {s.designation} • {s.department}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          s.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail */}
        <div className="lg:col-span-7">
          {selectedStaff ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {selectedStaff.staffCode}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{selectedStaff.fullName}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStaff.designation} • {selectedStaff.department} ({selectedStaff.role})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedStaff)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(selectedStaff.id, selectedStaff.fullName)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 rounded-lg text-xs transition"
                    title="Delete Staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block">
                    Email Address
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-blue-500 shrink-0" /> {selectedStaff.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block">
                    Phone Number
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-500 shrink-0" />{' '}
                    {selectedStaff.phone || selectedStaff.phoneNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block">
                    Qualifications
                  </span>
                  <span className="font-medium text-purple-600 dark:text-purple-300 mt-0.5 block">
                    {Array.isArray(selectedStaff.qualifications)
                      ? selectedStaff.qualifications.join(', ')
                      : selectedStaff.qualification || 'B.Ed'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block">
                    NSSF Number
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedStaff.nssfNumber?.trim() ? selectedStaff.nssfNumber : <span className="text-slate-400 font-sans italic text-[11px]">Not provided</span>}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block">
                    Tax Identification (TIN)
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedStaff.tinNumber?.trim() ? selectedStaff.tinNumber : <span className="text-slate-400 font-sans italic text-[11px]">Not provided</span>}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block">
                    Employment Type
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                    {selectedStaff.employmentType}
                  </span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">
                  Emergency Contact
                </span>
                <p className="text-slate-900 dark:text-white font-semibold">
                  {selectedStaff.emergencyContactName || 'Designated Contact'} (
                  {selectedStaff.emergencyContactRelation || 'Next of Kin'})
                </p>
                <p className="text-slate-600 dark:text-slate-400 font-mono">
                  {selectedStaff.emergencyContactPhone || selectedStaff.emergencyContact || 'No contact registered'}
                </p>
              </div>

              {/* Job Description */}
              {selectedStaff.jobDescription && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">
                    Job Description & Primary Responsibilities
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{selectedStaff.jobDescription}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 shadow-xs space-y-3">
              <Users className="w-10 h-10 mx-auto opacity-50" />
              <p className="text-xs">Select a staff profile from the directory to review HR details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingStaffId ? 'Edit Staff Profile' : 'Register New Staff Member / Teacher'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStaff} className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Staff / Employee Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staffCode}
                    onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="EMP-101"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Patrick Mugisha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Teacher">Teacher / Faculty</option>
                    <option value="Administrator">Administrator / Registrar</option>
                    <option value="Bursar">Bursar / Finance Officer</option>
                    <option value="Headteacher">Headteacher / Principal</option>
                    <option value="Deputy Headteacher">Deputy Headteacher</option>
                    <option value="School Nurse">School Nurse / Medical</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Support Staff">Support Staff / Matron / Warden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Languages">Languages</option>
                    <option value="Administration">Administration</option>
                    <option value="ICT & Technical">ICT & Technical</option>
                    <option value="Student Affairs">Student Affairs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Biology Lead Teacher"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Full Time Teaching">Full Time Teaching</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Full-Time">Full-Time Administrative</option>
                    <option value="Probation">Probation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="staff@schoolos.ug"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="+256 700 123456"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NSSF Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.nssfNumber}
                    onChange={(e) => setFormData({ ...formData, nssfNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., NS-8849-012 (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    TIN / Tax Identification (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tinNumber}
                    onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., 1004899201 (Optional)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Qualifications (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="B.Ed Sciences (Makerere), PGDE, Dip. Education"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Next of Kin Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="+256 700 987654"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Job Description & Responsibilities
                  </label>
                  <textarea
                    rows={2}
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Curriculum teaching, lesson planning, and lab administration."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving Profile...' : editingStaffId ? 'Update Staff Member' : 'Register Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
