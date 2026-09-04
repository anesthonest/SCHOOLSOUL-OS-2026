import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  UserX,
  Save,
  Filter,
  Users,
  Check,
  RotateCcw,
  Wifi,
  WifiOff,
  Bell,
  MessageSquare,
  Info,
} from 'lucide-react';
import { fetchStudentAttendance, saveStudentAttendanceBatch } from '../services/attendanceApi';
import { seedSampleStudentDataIfEmpty } from '../services/studentApi';
import { db } from '../db/indexedDB';
import type { Student, StudentAttendanceRecord, AttendanceStatus, AttendanceSession, AbsenceReasonCategory } from '../types';

export const StudentAttendancePage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('Primary 7');
  const [selectedStream, setSelectedStream] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>('Morning');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Partial<StudentAttendanceRecord>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Active student for Absence Reason drawer
  const [activeReasonStudentId, setActiveReasonStudentId] = useState<string | null>(null);

  const classes = [
    'Primary 1',
    'Primary 2',
    'Primary 3',
    'Primary 4',
    'Primary 5',
    'Primary 6',
    'Primary 7',
    'Senior 1',
    'Senior 2',
    'Senior 3',
    'Senior 4',
    'Senior 5',
    'Senior 6',
  ];

  const streams = ['All', 'East', 'West', 'North', 'A', 'B', 'Blue', 'Green'];

  const loadStudentsAndAttendance = async () => {
    setLoading(true);
    setSaveSuccess(null);
    try {
      await seedSampleStudentDataIfEmpty();

      // Fetch active students for selected class and stream
      let classStudents = await db.students.where('classGrade').equals(selectedClass).toArray();
      classStudents = classStudents.filter((s) => s.status === 'Active');

      if (selectedStream !== 'All') {
        classStudents = classStudents.filter((s) => s.stream === selectedStream);
      }

      setStudents(classStudents);

      // Fetch existing saved attendance records for this date
      const savedRecords = await fetchStudentAttendance(attendanceDate, selectedClass, selectedStream);

      // Build initial map
      const map: Record<string, Partial<StudentAttendanceRecord>> = {};
      classStudents.forEach((st) => {
        const existing = savedRecords.find((r) => r.studentId === st.id && r.session === selectedSession);
        if (existing) {
          map[st.id] = { ...existing };
        } else {
          // Default status is Present for fast workflow
          map[st.id] = {
            studentId: st.id,
            studentName: st.fullName,
            classGrade: st.classGrade,
            stream: st.stream || 'A',
            date: attendanceDate,
            session: selectedSession,
            status: 'Present',
            recordedBy: 'Teacher',
          };
        }
      });

      setAttendanceMap(map);
    } catch (err) {
      console.error('Error loading register data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsAndAttendance();
  }, [selectedClass, selectedStream, selectedSession, attendanceDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => {
      const current = prev[studentId] || {};
      return {
        ...prev,
        [studentId]: {
          ...current,
          status,
          // Clear arrival note if not late
          arrivalNote: status === 'Late' ? current.arrivalNote || 'Arrived late' : '',
        },
      };
    });
  };

  const handleAbsenceReasonChange = (studentId: string, reason: AbsenceReasonCategory) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        absenceReason: reason,
      },
    }));
    setActiveReasonStudentId(null);
  };

  const handleArrivalNoteChange = (studentId: string, note: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        arrivalNote: note,
      },
    }));
  };

  // Bulk Quick Mark Actions
  const markAllPresent = () => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], status: 'Present' };
      });
      return updated;
    });
  };

  const markUnmarkedAbsent = () => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (!updated[id].status) {
          updated[id] = { ...updated[id], status: 'Absent' };
        }
      });
      return updated;
    });
  };

  // Save batch attendance
  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const recordsToSave = Object.values(attendanceMap);
      await saveStudentAttendanceBatch(recordsToSave, 'usr-teacher-1', 'Tr. Sarah Nabatanzi');
      setSaveSuccess(`Successfully marked register for ${recordsToSave.length} students in ${selectedClass} (${selectedSession} Session)`);
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (e: any) {
      alert('Failed to save register: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtered student list by search query
  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalInList = students.length;
  const attendanceValues = Object.values(attendanceMap) as Array<Partial<StudentAttendanceRecord>>;
  const presentCount = attendanceValues.filter((r) => r.status === 'Present').length;
  const lateCount = attendanceValues.filter((r) => r.status === 'Late').length;
  const absentCount = attendanceValues.filter((r) => r.status === 'Absent').length;
  const sickCount = attendanceValues.filter((r) => r.status === 'Sick').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-blue-700 font-semibold mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Attendance Engine – Module 1</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Daily Register</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            One-tap classroom attendance marking with automated absence tracking and parent notification triggers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving Register...' : 'Save & Dispatch Register'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-sm font-semibold flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Class, Stream, Session, Date Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Class Grade */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Class / Grade</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Stream */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Stream</label>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {streams.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Streams' : `Stream ${s}`}
              </option>
            ))}
          </select>
        </div>

        {/* Session */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Register Session</label>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['Morning', 'Afternoon'] as AttendanceSession[]).map((sess) => (
              <button
                key={sess}
                type="button"
                onClick={() => setSelectedSession(sess)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedSession === sess ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {sess}
              </button>
            ))}
          </div>
        </div>

        {/* Attendance Date */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Class Attendance Summary & Bulk Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Counter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
            Total: {totalInList}
          </span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Present: {presentCount}
          </span>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Late: {lateCount}
          </span>
          <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Absent: {absentCount}
          </span>
          <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
            Sick: {sickCount}
          </span>
        </div>

        {/* Quick Bulk Buttons & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={markAllPresent}
            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={markUnmarkedAbsent}
            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
          >
            Mark All Absent
          </button>

          {/* Search box */}
          <div className="relative w-48">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Student Register Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-semibold">Loading class register...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-700">No active students found in {selectedClass}</p>
            <p className="text-xs text-gray-400 mt-1">
              Select another class or enrol students via the Admissions Engine.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student Name & ID</th>
                  <th className="py-3 px-4">Stream & Residence</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Notes / Absence Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredStudents.map((student, index) => {
                  const rec = attendanceMap[student.id] || { status: 'Present' };
                  const currentStatus = rec.status || 'Present';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-400">{index + 1}</td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {(student.firstName?.[0] || student.fullName?.[0] || 'S')}
                            {(student.lastName?.[0] || '')}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 leading-snug">{student.fullName}</div>
                            <div className="text-[11px] font-mono text-gray-500">
                              {student.studentId} · {student.admissionNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stream & Residence */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                          Stream {student.stream || 'A'}
                        </span>
                        <div className="text-[11px] text-gray-500 mt-1">{student.residenceType} Learner</div>
                      </td>

                      {/* Attendance Status Selection */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'Present')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'Late')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> Late
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'Absent')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </button>

                          {/* Sick */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'Sick')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Sick'
                                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Sick
                          </button>
                        </div>
                      </td>

                      {/* Notes / Reason Column */}
                      <td className="py-3.5 px-4">
                        {currentStatus === 'Late' ? (
                          <input
                            type="text"
                            placeholder="Arrival time e.g. 08:20 AM"
                            value={rec.arrivalNote || ''}
                            onChange={(e) => handleArrivalNoteChange(student.id, e.target.value)}
                            className="w-full px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-900 focus:outline-none focus:bg-white"
                          />
                        ) : currentStatus === 'Absent' || currentStatus === 'Sick' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                              {rec.absenceReason || 'Unexplained'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveReasonStudentId(student.id)}
                              className="text-xs text-blue-600 font-semibold hover:underline"
                            >
                              Set Reason
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No notes</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Absence Reason Drawer / Modal */}
      {activeReasonStudentId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Categorize Absence Reason</h3>
              <button
                onClick={() => setActiveReasonStudentId(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Select reason category for Ministry & Guardian record tracking:
            </p>

            <div className="space-y-2">
              {[
                'Sick',
                'Family emergency',
                'Official permission',
                'Transport issue',
                'Financial reasons',
                'Unknown',
                'Other',
              ].map((reasonCat) => (
                <button
                  key={reasonCat}
                  type="button"
                  onClick={() => handleAbsenceReasonChange(activeReasonStudentId, reasonCat as AbsenceReasonCategory)}
                  className="w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 font-semibold text-xs text-gray-800 transition-all"
                >
                  {reasonCat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
