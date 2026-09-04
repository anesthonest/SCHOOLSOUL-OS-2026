import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Users,
  Search,
} from 'lucide-react';
import {
  fetchStaffAttendance,
  recordStaffAttendance,
  fetchStaffLeaveRequests,
  submitStaffLeaveRequest,
  reviewStaffLeaveRequest,
  deleteStaffLeaveRequest,
} from '../services/attendanceApi';
import { v7Api } from '../services/v7Api';
import type { StaffAttendanceRecord, StaffLeaveRequest, StaffLeaveType, StaffProfile } from '../types';

export const StaffAttendanceAndLeavePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave'>('attendance');
  const [todayDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<StaffLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // New Leave Modal state
  const [showNewLeaveModal, setShowNewLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    staffName: '',
    role: 'Teacher',
    leaveType: 'Annual' as StaffLeaveType,
    startDate: todayDate,
    endDate: todayDate,
    totalDays: 1,
    reason: '',
  });

  // Review modal state
  const [reviewingLeaveId, setReviewingLeaveId] = useState<string | null>(null);
  const [reviewerComments, setReviewerComments] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [profiles, att, leave] = await Promise.all([
        v7Api.getStaffProfiles(),
        fetchStaffAttendance(todayDate),
        fetchStaffLeaveRequests(),
      ]);

      // Fallback default staff if none in database
      if (profiles.length === 0) {
        const defaultProfiles: StaffProfile[] = [
          {
            id: 'STAFF-101',
            staffCode: 'EMP-101',
            fullName: 'Patrick Mugisha',
            role: 'Teacher',
            department: 'Sciences',
            designation: 'Biology Lead Teacher',
            email: 'patrick.mugisha@schoolos.ug',
            phone: '+256 700 111222',
            qualifications: ['B.Ed Sciences'],
            employmentType: 'Full Time Teaching',
            contractStartDate: '2025-01-01',
            status: 'Active',
            jobDescription: 'Senior Biology Teacher',
            salaryGradeRef: 'SCALE-U3',
            totalCPDPoints: 15,
            performanceRating: 'Exceeds Expectations',
            emergencyContact: 'Sarah Mugisha (Spouse)',
            createdAt: '2025-01-01',
          },
          {
            id: 'STAFF-102',
            staffCode: 'EMP-102',
            fullName: 'Sarah Nabatanzi',
            role: 'Teacher',
            department: 'Languages',
            designation: 'English Language Teacher',
            email: 'sarah.nabatanzi@schoolos.ug',
            phone: '+256 700 333444',
            qualifications: ['B.A Education'],
            employmentType: 'Full Time Teaching',
            contractStartDate: '2025-01-01',
            status: 'Active',
            jobDescription: 'English Teacher',
            salaryGradeRef: 'SCALE-U3',
            totalCPDPoints: 12,
            performanceRating: 'Meets Expectations',
            emergencyContact: 'John Nabatanzi (Brother)',
            createdAt: '2025-01-01',
          },
        ];
        setStaffList(defaultProfiles);
      } else {
        setStaffList(profiles);
      }

      setStaffAttendance(att);
      setLeaveRequests(leave);
    } catch (err) {
      console.error('Failed to load staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Staff Check-in Handler
  const handleStaffCheckIn = async (staffId: string, staffName: string, role: string) => {
    await recordStaffAttendance(
      {
        staffId,
        staffName,
        role,
        date: todayDate,
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Present',
        remarks: 'Terminal Check-in',
      },
      'usr-1',
      'Administrator'
    );
    await loadData();
  };

  // Submit Leave Request
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      alert('Please provide a reason for the leave application');
      return;
    }

    const selected = staffList.find((s) => s.id === leaveForm.staffId) || staffList[0];
    const staffName = selected?.fullName || leaveForm.staffName;
    const role = selected?.role || leaveForm.role;

    await submitStaffLeaveRequest(
      {
        ...leaveForm,
        staffName,
        role,
      },
      leaveForm.staffId || 'usr-teacher-1',
      staffName
    );

    setShowNewLeaveModal(false);
    setLeaveForm({
      staffId: '',
      staffName: '',
      role: 'Teacher',
      leaveType: 'Annual',
      startDate: todayDate,
      endDate: todayDate,
      totalDays: 1,
      reason: '',
    });
    await loadData();
  };

  // Review Leave Request
  const handleReviewLeave = async (status: 'Approved' | 'Rejected') => {
    if (!reviewingLeaveId) return;
    await reviewStaffLeaveRequest(reviewingLeaveId, status, reviewerComments, 'usr-headteacher', 'Headteacher');
    setReviewingLeaveId(null);
    setReviewerComments('');
    await loadData();
  };

  const handleDeleteLeave = async (id: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to delete leave application for "${staffName}"?`)) {
      await deleteStaffLeaveRequest(id);
      await loadData();
    }
  };

  const filteredStaff = staffList.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.staffCode.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
  });

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Daily Operations Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff Attendance & Leave Engine</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Teacher & Staff check-in terminal, daily attendance register, and Headteacher leave approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (staffList.length > 0) {
                setLeaveForm((prev) => ({
                  ...prev,
                  staffId: staffList[0].id,
                  staffName: staffList[0].fullName,
                  role: staffList[0].role,
                }));
              }
              setShowNewLeaveModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Apply for Leave
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Staff Daily Register
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'leave'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Staff Leave Engine ({pendingLeaves})
        </button>
      </div>

      {activeTab === 'attendance' ? (
        /* Staff Attendance Tab */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Staff Daily Check-In Register ({todayDate})
              </h2>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member & Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Check-In Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4 text-right">Terminal Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Loading staff attendance records...
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No staff records found.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const record = staffAttendance.find((r) => r.staffId === staff.id || r.staffName === staff.fullName);
                      const isCheckedIn = !!record?.checkInTime;

                      return (
                        <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{staff.fullName}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{staff.role} • <span className="font-mono text-blue-600 dark:text-blue-400">{staff.staffCode}</span></div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {staff.department}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {isCheckedIn ? record.checkInTime : 'Not Checked In'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                record?.status === 'Present'
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                  : record?.status === 'Late'
                                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {record?.status || 'Pending'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{record?.remarks || '—'}</td>

                          <td className="py-3.5 px-4 text-right">
                            {!isCheckedIn ? (
                              <button
                                onClick={() => handleStaffCheckIn(staff.id, staff.fullName, staff.role)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
                              >
                                Instant Check-In
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Recorded
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Staff Leave Tab */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Staff Leave Applications & Approvals
            </h2>

            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No staff leave applications currently recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{req.staffName}</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">({req.role})</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            req.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : req.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                        Leave Type: {req.leaveType} · Duration: {req.totalDays} Day(s) ({req.startDate} to {req.endDate})
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic font-medium">"{req.reason}"</p>

                      {req.reviewedBy && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          Reviewed by <span className="font-bold text-slate-700 dark:text-slate-200">{req.reviewedBy}</span>: {req.reviewerComments || 'No comments'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'Pending' && (
                        <button
                          onClick={() => setReviewingLeaveId(req.id)}
                          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                        >
                          Review Request
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLeave(req.id, req.staffName)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center transition"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Leave Application Modal */}
      {showNewLeaveModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Staff Leave Application</h3>
              <button
                onClick={() => setShowNewLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Staff Member *
                </label>
                <select
                  value={leaveForm.staffId}
                  onChange={(e) => {
                    const sel = staffList.find((s) => s.id === e.target.value);
                    setLeaveForm({
                      ...leaveForm,
                      staffId: e.target.value,
                      staffName: sel?.fullName || '',
                      role: sel?.role || 'Teacher',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.staffCode} - {s.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Leave Category
                  </label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as StaffLeaveType })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Compassionate">Compassionate Leave</option>
                    <option value="Study">Study / UNEB Seminar</option>
                    <option value="Official Duty">Official School Duty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={leaveForm.totalDays}
                    onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Leave *
                </label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Provide specific details for Headteacher review..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewLeaveModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Leave Modal */}
      {reviewingLeaveId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-slate-900 dark:text-white text-base mb-3">Headteacher Leave Review</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reviewer Comments / Directives
              </label>
              <textarea
                rows={3}
                value={reviewerComments}
                onChange={(e) => setReviewerComments(e.target.value)}
                placeholder="Enter comments or relief teacher instructions..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setReviewingLeaveId(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewLeave('Rejected')}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
              >
                Reject Leave
              </button>
              <button
                type="button"
                onClick={() => handleReviewLeave('Approved')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
              >
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
