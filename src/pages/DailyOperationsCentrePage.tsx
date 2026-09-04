import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  UserPlus,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Bell,
  CheckSquare,
} from 'lucide-react';
import {
  fetchStudentAttendance,
  fetchStaffAttendance,
  fetchVisitors,
  fetchStaffLeaveRequests,
  fetchAttendanceAlerts,
  seedSampleAttendanceDataIfEmpty,
} from '../services/attendanceApi';
import { seedSampleStudentDataIfEmpty } from '../services/studentApi';
import { db } from '../db/indexedDB';
import type { Student, StudentAttendanceRecord, StaffAttendanceRecord, VisitorRecord, StaffLeaveRequest, AttendanceAlert } from '../types';

interface DailyOperationsCentrePageProps {
  onNavigate: (view: string) => void;
}

export const DailyOperationsCentrePage: React.FC<DailyOperationsCentrePageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<StaffLeaveRequest[]>([]);
  const [alerts, setAlerts] = useState<AttendanceAlert[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = async () => {
    setLoading(true);
    try {
      await seedSampleStudentDataIfEmpty();
      await seedSampleAttendanceDataIfEmpty();

      const allStudents = await db.students.filter((s) => s.status === 'Active').toArray();
      setStudents(allStudents);

      const stuAtt = await fetchStudentAttendance(todayStr);
      setTodayAttendance(stuAtt);

      const staffAtt = await fetchStaffAttendance(todayStr);
      setStaffAttendance(staffAtt);

      const visList = await fetchVisitors();
      setVisitors(visList);

      const leaveList = await fetchStaffLeaveRequests();
      setLeaveRequests(leaveList);

      const alertList = await fetchAttendanceAlerts();
      setAlerts(alertList);
    } catch (err) {
      console.error('Failed to load operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const totalStudents = students.length || 1;
  const markedStudentsCount = todayAttendance.length;
  const presentStudents = todayAttendance.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const absentStudents = todayAttendance.filter((r) => r.status === 'Absent' || r.status === 'Sick').length;
  const studentAttendanceRate = markedStudentsCount > 0 ? Math.round((presentStudents / markedStudentsCount) * 100) : 0;

  const totalStaffCount = 12; // Standard staff count
  const presentStaff = staffAttendance.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const staffAttendanceRate = Math.round((presentStaff / totalStaffCount) * 100);

  const activeVisitorsCount = visitors.filter((v) => v.status === 'Checked In').length;
  const pendingLeaveCount = leaveRequests.filter((l) => l.status === 'Pending').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sm text-blue-700 font-semibold mb-1">
            <Activity className="w-4 h-4" />
            <span>SchoolSoul OS – Vision 3</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Operations Command Centre</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time daily attendance, staff registers, visitor logs, and operational alerts for {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
          <button
            onClick={() => onNavigate('student-attendance')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            Take Student Register
          </button>
        </div>
      </div>

      {/* Primary Operations Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Student Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Student Attendance</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{studentAttendanceRate}%</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Today
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {presentStudents} Present · {absentStudents} Absent / Sick ({markedStudentsCount} marked)
            </p>
          </div>
        </div>

        {/* Staff Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Staff Attendance</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{staffAttendanceRate}%</span>
              <span className="text-xs text-gray-500">({presentStaff}/{totalStaffCount} Checked In)</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Teachers & Administrative staff on duty today</p>
          </div>
        </div>

        {/* Active Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Active Visitors</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{activeVisitorsCount}</span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Gate Security
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Guests currently checked in on premises</p>
          </div>
        </div>

        {/* Active Operations Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Pending Alerts & Leave</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{activeAlertsCount + pendingLeaveCount}</span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                Attention Required
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {activeAlertsCount} Attendance Alerts · {pendingLeaveCount} Pending Leave
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launchers Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-bold mb-1">Operational Launchpad</h2>
        <p className="text-xs text-blue-200 mb-4">Direct access to daily school administrative tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('student-attendance')}
            className="flex flex-col items-center justify-center p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-center"
          >
            <CheckSquare className="w-6 h-6 mb-2 text-blue-300" />
            <span className="text-xs font-semibold">Student Register</span>
          </button>

          <button
            onClick={() => onNavigate('staff-attendance-leave')}
            className="flex flex-col items-center justify-center p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-center"
          >
            <UserCheck className="w-6 h-6 mb-2 text-emerald-300" />
            <span className="text-xs font-semibold">Staff Terminal</span>
          </button>

          <button
            onClick={() => onNavigate('daily-register')}
            className="flex flex-col items-center justify-center p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-center"
          >
            <FileSpreadsheet className="w-6 h-6 mb-2 text-indigo-300" />
            <span className="text-xs font-semibold">Daily Register</span>
          </button>

          <button
            onClick={() => onNavigate('visitor-management')}
            className="flex flex-col items-center justify-center p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-center"
          >
            <UserPlus className="w-6 h-6 mb-2 text-amber-300" />
            <span className="text-xs font-semibold">Visitor Register</span>
          </button>

          <button
            onClick={() => onNavigate('attendance-analytics')}
            className="flex flex-col items-center justify-center p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-center"
          >
            <BarChart3 className="w-6 h-6 mb-2 text-teal-300" />
            <span className="text-xs font-semibold">Analytics & Alerts</span>
          </button>

          <button
            onClick={() => onNavigate('academic-calendar')}
            className="flex flex-col items-center justify-center p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-center"
          >
            <Calendar className="w-6 h-6 mb-2 text-purple-300" />
            <span className="text-xs font-semibold">Academic Calendar</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Visitors & Live Operations Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Visitor Gate Log & Leave Alerts */}
        <div className="space-y-6 lg:col-span-1">
          {/* Active Visitor Gate Box */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-600" />
                Active Visitors ({activeVisitorsCount})
              </h3>
              <button
                onClick={() => onNavigate('visitor-management')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {visitors.filter((v) => v.status === 'Checked In').length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No active visitors currently checked in at security gate.</p>
            ) : (
              <div className="space-y-3">
                {visitors
                  .filter((v) => v.status === 'Checked In')
                  .map((vis) => (
                    <div key={vis.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-900">{vis.visitorName}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded">
                            {vis.badgeNumber}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">Visiting: {vis.personToVisit}</p>
                        <p className="text-[11px] text-gray-500">{vis.purpose}</p>
                      </div>
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {vis.checkInTime}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Pending Staff Leave ({pendingLeaveCount})
              </h3>
              <button
                onClick={() => onNavigate('staff-attendance-leave')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                Review <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {leaveRequests.filter((l) => l.status === 'Pending').length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No pending staff leave applications requiring review.</p>
            ) : (
              <div className="space-y-3">
                {leaveRequests
                  .filter((l) => l.status === 'Pending')
                  .map((l) => (
                    <div key={l.id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">{l.staffName}</span>
                        <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                          {l.leaveType} ({l.totalDays}d)
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1">{l.reason}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {l.startDate} to {l.endDate}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Attendance Alerts & Daily Register Status */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Attendance Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Active Attendance Alerts ({activeAlertsCount})
              </h3>
              <button
                onClick={() => onNavigate('attendance-analytics')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                All Alerts <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {alerts.filter((a) => a.status === 'Active').length === 0 ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-900">Zero Critical Attendance Alerts</p>
                <p className="text-xs text-emerald-700 mt-0.5">All class registers are within expected thresholds.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts
                  .filter((a) => a.status === 'Active')
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 bg-rose-50/60 rounded-xl border border-rose-100 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-900">{alert.alertType}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-200 text-rose-800 rounded-full">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 font-medium mt-1">{alert.message}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Logged on {alert.date}</p>
                      </div>
                      <button
                        onClick={() => onNavigate('attendance-analytics')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg whitespace-nowrap transition-colors"
                      >
                        Action
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Classroom Attendance Progress Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Classroom Register Completion Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'Primary 7', 'Senior 1', 'Senior 4'].map((cls) => {
                const classRecords = todayAttendance.filter((r) => r.classGrade === cls);
                const isTaken = classRecords.length > 0;
                const classPresent = classRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;

                return (
                  <div
                    key={cls}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                      isTaken ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{cls}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isTaken ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isTaken ? 'Complete' : 'Pending'}
                      </span>
                    </div>

                    <div className="mt-3">
                      {isTaken ? (
                        <p className="text-xs text-emerald-800 font-semibold">
                          {classPresent} / {classRecords.length} Present ({Math.round((classPresent / classRecords.length) * 100)}%)
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">Register not yet submitted today</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
