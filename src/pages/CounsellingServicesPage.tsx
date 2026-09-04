import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Calendar,
  Lock,
  Plus,
  Search,
  UserCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { CounsellingSession } from '../types';
import { useAuth } from '../context/AuthContext';

export const CounsellingServicesPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    studentId: 'STU-1002',
    studentName: 'Amina Kigozi',
    classGrade: 'Senior 3 Blue',
    counselorName: user?.fullName || 'Dr. Elizabeth Nabatanzi (School Counselor)',
    referralSource: 'Teacher' as CounsellingSession['referralSource'],
    sessionDate: new Date().toISOString().split('T')[0],
    summaryNotes: '',
    actionItems: '',
    nextAppointmentDate: '',
  });

  const isAuthorised = activeRole === 'Headteacher' || activeRole === 'Deputy Headteacher' || activeRole === 'School Nurse' || activeRole === 'Administrator';

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const data = await v7Api.getCounsellingSessions();
    setSessions(data);
    setLoading(false);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.summaryNotes) return;

    const created = await v7Api.saveCounsellingSession({
      ...formData,
      status: 'Scheduled',
      isConfidential: true,
    });

    setSessions([created, ...sessions]);
    setShowModal(false);
    setFormData({
      studentId: 'STU-1002',
      studentName: 'Amina Kigozi',
      classGrade: 'Senior 3 Blue',
      counselorName: user?.fullName || 'Dr. Elizabeth Nabatanzi (School Counselor)',
      referralSource: 'Teacher',
      sessionDate: new Date().toISOString().split('T')[0],
      summaryNotes: '',
      actionItems: '',
      nextAppointmentDate: '',
    });
  };

  const filtered = sessions.filter((s) => {
    return (
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sessionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.classGrade.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!isAuthorised) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 my-8 max-w-2xl mx-auto">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Restricted Counseling Records</h2>
        <p className="text-sm text-slate-400">
          Student psychological and counseling records are encrypted and restricted strictly to authorized Guidance Counselors, School Nurses, and Headteachers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-sky-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider mb-1">
            <MessageCircle className="w-4 h-4" />
            <span>SchoolSoul Guidance, Counseling & Support Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Counselling Services</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Schedule counseling sessions, log confidential case summaries, formulate student action plans, and coordinate external mental health referrals.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Counseling Appointment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Sessions Logged</span>
          <p className="text-2xl font-black text-white mt-1">{sessions.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Upcoming Appointments</span>
          <p className="text-2xl font-black text-sky-400 mt-1">
            {sessions.filter((s) => s.status === 'Scheduled').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Completed Follow-ups</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {sessions.filter((s) => s.status === 'Completed').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Encrypted Records</span>
          <p className="text-2xl font-black text-purple-400 mt-1">100%</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search code, student, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Sessions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400">{s.sessionCode}</span>
                <h3 className="text-base font-bold text-white mt-1">{s.studentName}</h3>
                <p className="text-xs text-slate-400">{s.classGrade} • Referred by: {s.referralSource}</p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-950 text-sky-300 font-bold text-[10px] border border-slate-800">
                {s.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Confidential Session Summary</span>
                <p className="text-slate-300 leading-relaxed">{s.summaryNotes}</p>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-sky-200">
                <span className="text-[10px] font-bold uppercase text-sky-400 block mb-1">Agreed Action Items</span>
                <p>{s.actionItems}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Counselor: {s.counselorName}</span>
              <span>Date: {s.sessionDate}</span>
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
                <MessageCircle className="w-5 h-5 text-sky-400" />
                <span>New Counseling Session Log</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Student Name & Grade</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Student Name"
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                  <input
                    type="text"
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    placeholder="Class Grade"
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Referral Source</label>
                  <select
                    value={formData.referralSource}
                    onChange={(e) => setFormData({ ...formData, referralSource: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Self Referral">Self Referral</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Parent">Parent</option>
                    <option value="Safeguarding Lead">Safeguarding Lead</option>
                    <option value="Welfare Officer">Welfare Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Session Date</label>
                  <input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Confidential Session Summary</label>
                <textarea
                  rows={3}
                  value={formData.summaryNotes}
                  onChange={(e) => setFormData({ ...formData, summaryNotes: e.target.value })}
                  placeholder="Record counseling themes, student disclosures, and emotional status..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Action Items & Support Plan</label>
                <input
                  type="text"
                  value={formData.actionItems}
                  onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                  placeholder="e.g., Weekly check-in, academic accommodation, relaxation techniques"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
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
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save Counseling Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
