import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  Users,
  Building2,
  Award,
  RefreshCw,
  Search,
} from 'lucide-react';
import { fetchStudentAttendance, seedSampleAttendanceDataIfEmpty } from '../services/attendanceApi';
import { seedSampleStudentDataIfEmpty } from '../services/studentApi';
import { db } from '../db/indexedDB';
import type { Student, StudentAttendanceRecord, SchoolProfile } from '../types';

export const DailySchoolRegisterPage: React.FC = () => {
  const [registerDate, setRegisterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);

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

  const loadRegister = async () => {
    setLoading(true);
    try {
      await seedSampleStudentDataIfEmpty();
      await seedSampleAttendanceDataIfEmpty();

      const allStudents = await db.students.filter((s) => s.status === 'Active').toArray();
      setStudents(allStudents);

      const records = await fetchStudentAttendance(registerDate);
      setAttendanceRecords(records);

      const profile = await db.schoolProfile.toCollection().first();
      setSchoolProfile(profile || null);
    } catch (err) {
      console.error('Failed to load master register:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegister();
  }, [registerDate]);

  const handlePrint = () => {
    window.print();
  };

  // Grand totals
  const totalEnrolled = students.length;
  const totalPresent = attendanceRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const totalAbsent = attendanceRecords.filter((r) => r.status === 'Absent' || r.status === 'Sick').length;
  const overallPercentage = totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Printable Header Controls */}
      <div className="print:hidden bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-indigo-700 font-semibold mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Daily Operations – Module 3 & 10</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Master Daily School Register</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Official whole-school daily register for Ministry compliance and Headteacher sign-off
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={registerDate}
            onChange={(e) => setRegisterDate(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900"
          />

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Official Register
          </button>
        </div>
      </div>

      {/* Official Master Register Document Canvas */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg font-sans max-w-5xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Official Header Header Stamp */}
        <div className="border-b-2 border-gray-900 pb-6 mb-6 text-center">
          <div className="flex justify-between items-start mb-4">
            <div className="text-left">
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                REPUBLIC OF UGANDA · MINISTRY OF EDUCATION & SPORTS
              </span>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mt-0.5">
                {schoolProfile?.schoolName || 'ST. MARY\'S COMPREHENSIVE HIGH SCHOOL'}
              </h2>
              <p className="text-xs text-gray-600 font-medium">
                {schoolProfile?.physicalAddress || 'P.O. Box 402, Kampala'} · {schoolProfile?.district || 'Kampala District'}
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 bg-gray-900 text-white font-mono text-xs font-bold rounded">
                REGISTER NO: REG-{registerDate.replace(/-/g, '')}
              </span>
              <p className="text-xs text-gray-500 font-mono mt-1">Date: {registerDate}</p>
            </div>
          </div>

          <div className="bg-gray-100 py-2 px-4 rounded-lg inline-block border border-gray-300">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
              OFFICIAL MASTER DAILY SCHOOL ATTENDANCE REGISTER
            </h3>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-center bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Total Learners</span>
            <div className="text-2xl font-black text-gray-900">{totalEnrolled}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Present Today</span>
            <div className="text-2xl font-black text-emerald-700">{totalPresent}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-700 uppercase">Absent Today</span>
            <div className="text-2xl font-black text-rose-700">{totalAbsent}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase">Attendance Rate</span>
            <div className="text-2xl font-black text-blue-700">{overallPercentage}%</div>
          </div>
        </div>

        {/* Master Class Breakdown Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-200 text-gray-900 font-bold border-b border-gray-300">
                <th className="p-2.5 border border-gray-300">Class Grade</th>
                <th className="p-2.5 border border-gray-300 text-center">Enrolled Boys</th>
                <th className="p-2.5 border border-gray-300 text-center">Enrolled Girls</th>
                <th className="p-2.5 border border-gray-300 text-center">Total Enrolled</th>
                <th className="p-2.5 border border-gray-300 text-center">Present</th>
                <th className="p-2.5 border border-gray-300 text-center">Absent</th>
                <th className="p-2.5 border border-gray-300 text-center">% Rate</th>
                <th className="p-2.5 border border-gray-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {classes.map((cls) => {
                const classStudents = students.filter((s) => s.classGrade === cls);
                const boys = classStudents.filter((s) => s.gender === 'Male').length;
                const girls = classStudents.filter((s) => s.gender === 'Female').length;
                const totalCls = classStudents.length;

                const classRecords = attendanceRecords.filter((r) => r.classGrade === cls);
                const presentCls = classRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
                const absentCls = classRecords.filter((r) => r.status === 'Absent' || r.status === 'Sick').length;
                const rate = totalCls > 0 && classRecords.length > 0 ? Math.round((presentCls / totalCls) * 100) : 0;

                return (
                  <tr key={cls} className="hover:bg-gray-50 font-medium">
                    <td className="p-2.5 border border-gray-300 font-bold text-gray-900">{cls}</td>
                    <td className="p-2.5 border border-gray-300 text-center font-mono">{boys}</td>
                    <td className="p-2.5 border border-gray-300 text-center font-mono">{girls}</td>
                    <td className="p-2.5 border border-gray-300 text-center font-bold font-mono">{totalCls}</td>
                    <td className="p-2.5 border border-gray-300 text-center font-mono text-emerald-800 font-bold">{presentCls}</td>
                    <td className="p-2.5 border border-gray-300 text-center font-mono text-rose-800 font-bold">{absentCls}</td>
                    <td className="p-2.5 border border-gray-300 text-center font-mono font-bold">{rate}%</td>
                    <td className="p-2.5 border border-gray-300 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${classRecords.length > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-600'}`}>
                        {classRecords.length > 0 ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Sign-off & Stamp Section */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-gray-300 text-xs text-gray-800">
          <div>
            <p className="font-bold uppercase mb-1 text-gray-900">VERIFIED BY DEPUTY HEADTEACHER (ACADEMICS):</p>
            <p className="text-gray-600 mb-6">Signature & Date: _______________________</p>
            <p className="font-mono text-gray-500">Name: Mr. Mukasa Paul</p>
          </div>

          <div className="text-right">
            <p className="font-bold uppercase mb-1 text-gray-900">APPROVED BY HEADTEACHER / SUPERINTENDENT:</p>
            <p className="text-gray-600 mb-6">Signature & Official Stamp: _______________________</p>
            <p className="font-mono text-gray-500">Name: Dr. Sarah Kisakye (PhD)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
