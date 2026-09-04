import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  UserCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { StaffLeaveRequest } from '../types';
import { useAuth } from '../context/AuthContext';

export const StaffLeaveManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<StaffLeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    staffName: user?.fullName || 'Senior Teacher',
    leaveType: 'Annual Leave' as StaffLeaveRequest['leaveType'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    daysCount: 3,
    reason: '',
    reliefStaffName: 'Mr. Kato Francis',
  });

  useEffect(() => {
    loadLeave();
  }, []);

  const loadLeave = async () => {
    setLoading(true);
    const data = await v7Api.getLeaveRequests();
    setLeaveRequests(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) return;

    const created = await v7Api.saveLeaveRequest({
      ...formData,
      staffId: 'STF-001',
      status: 'Pending',
    });

    setLeaveRequests([created, ...leaveRequests]);
    setShowModal(false);
    setFormData({
      staffName: user?.fullName || 'Senior Teacher',
      leaveType: 'Annual Leave',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      daysCount: 3,
      reason: '',
      reliefStaffName: 'Mr. Kato Francis',
    });
  };

  const handleStatusChange = async (id: string, newStatus: StaffLeaveRequest['status']) => {
    const target = leaveRequests.find((l) => l.id === id);
    if (!target) return;

    const updated = await v7Api.saveLeaveRequest({
      ...target,
      status: newStatus,
      approvedBy: user?.fullName || 'Headteacher',
    });

    setLeaveRequests(leaveRequests.map((l) => (l.id === updated.id ? updated : l)));
  };

  const filtered = leaveRequests.filter(
    (l) =>
      l.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 rounded-2xl border border-teal-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>SchoolSoul Staff Absence & Leave Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Staff Leave & Absence</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Apply for annual, sick, maternity, or compassionate leave, assign relief staff coverage, and manage headteacher approval workflows.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Leave Requests</span>
          <p className="text-2xl font-black text-white mt-1">{leaveRequests.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Pending Approval</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {leaveRequests.filter((l) => l.status === 'Pending').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Approved Leaves</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {leaveRequests.filter((l) => l.status === 'Approved').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Relief Staff Designated</span>
          <p className="text-2xl font-black text-teal-400 mt-1">100%</p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff name or leave type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((l) => (
          <div key={l.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                  {l.leaveType}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{l.staffName}</h3>
                <p className="text-xs text-slate-400">Duration: {l.daysCount} Days ({l.startDate} to {l.endDate})</p>
              </div>

              <select
                value={l.status}
                onChange={(e) => handleStatusChange(l.id, e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 p-1.5 rounded-lg focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Reason for Absence</span>
              <p className="text-slate-300">{l.reason}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Relief Coverage: <strong className="text-teal-300">{l.reliefStaffName}</strong></span>
              <span>Applied: {l.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-400" />
                <span>Submit Staff Leave Application</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Staff Member Name</label>
                <input
                  type="text"
                  value={formData.staffName}
                  onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Leave Category</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                    <option value="Study Leave">Study Leave</option>
                    <option value="Compassionate Leave">Compassionate Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Relief Staff Coverage</label>
                  <input
                    type="text"
                    value={formData.reliefStaffName}
                    onChange={(e) => setFormData({ ...formData, reliefStaffName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Total Days</label>
                  <input
                    type="number"
                    value={formData.daysCount}
                    onChange={(e) => setFormData({ ...formData, daysCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason for Leave Request</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide context for requested leave..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
