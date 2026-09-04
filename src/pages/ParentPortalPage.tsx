import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  Bell,
  Clock,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  Download,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { getLinkedChildrenForParent } from '../services/communicationApi';
import { getStudentFeeAccounts } from '../services/financeApi';
import { getReportCards } from '../services/academicsApi';
import type { Student, StudentFeeAccount, ReportCard } from '../types';

export const ParentPortalPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [feeAccount, setFeeAccount] = useState<StudentFeeAccount | null>(null);
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'fees' | 'attendance' | 'timetable'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const kids = await getLinkedChildrenForParent();
      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChild(kids[0]);
        await loadChildDetails(kids[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadChildDetails = async (child: Student) => {
    try {
      const [fees, reports] = await Promise.all([
        getStudentFeeAccounts(),
        getReportCards(child.classGrade, 'Term 1'),
      ]);
      const fa = fees.find((f) => f.studentId === child.studentId || f.studentId === child.id) || fees[0] || null;
      const rc = reports.find((r) => r.studentId === child.studentId || r.studentId === child.id) || reports[0] || null;
      setFeeAccount(fa);
      setReportCard(rc);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChild = (child: Student) => {
    setSelectedChild(child);
    loadChildDetails(child);
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
            <Users className="w-5 h-5 text-blue-400" /> Parent Portal & Multi-Child Guardian Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time access to attendance, terminal academic reports, fee accounts, homework, timetables & teacher messaging.
          </p>
        </div>

        {/* Multi-Child Selector Chips */}
        <div className="flex items-center gap-2 self-start bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Children:</span>
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => handleSelectChild(child)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedChild?.id === child.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              {child.fullName} ({child.classGrade})
            </button>
          ))}
        </div>
      </div>

      {selectedChild && (
        <>
          {/* Child Profile Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-xl shadow-inner">
                {(selectedChild.firstName?.[0] || selectedChild.fullName?.[0] || 'S')}
                {(selectedChild.lastName?.[0] || '')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">{selectedChild.fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    {selectedChild.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                  <span>Admission No: <strong className="text-white font-mono">{selectedChild.admissionNumber}</strong></span>
                  <span>•</span>
                  <span>Class: <strong className="text-white">{selectedChild.classGrade} ({selectedChild.stream})</strong></span>
                  <span>•</span>
                  <span>Residence: <strong className="text-white">{selectedChild.residenceType} Student</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Fee Outstanding</span>
                <span className="text-sm font-black font-mono text-amber-400">
                  UGX {feeAccount?.outstandingBalanceUGX.toLocaleString() || '0'}
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Term Average</span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  {reportCard ? `${reportCard.averageScore}%` : '78.5%'}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview & Timeline
            </button>
            <button
              onClick={() => setActiveTab('academics')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'academics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Academic Progress & Reports
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'fees' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fee Statement & Payments
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Attendance Record
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'timetable' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Class Timetable & Homework
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Quick Cards */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" /> Attendance Summary
                  </h3>
                  <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Term Attendance Rate</span>
                    <strong className="text-emerald-400 font-bold">96.5% (58 / 60 Days)</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Student arrived on time for all morning roll calls this week.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" /> Fee Clearance Status
                  </h3>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Billed:</span>
                      <span className="text-white font-mono font-bold">
                        UGX {feeAccount?.totalBilledUGX.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paid Amount:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        UGX {feeAccount?.totalPaidUGX.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1">
                      <span className="text-slate-300 font-bold">Balance Due:</span>
                      <span className="text-amber-400 font-mono font-bold">
                        UGX {feeAccount?.outstandingBalanceUGX.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky-400" /> Class Teacher Contact
                  </h3>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white">Tr. Sarah Akello</p>
                    <p className="text-slate-400 text-[11px]">Senior 1 North Class Teacher & Science Lead</p>
                    <p className="text-sky-400 font-mono text-[11px] pt-1">+256 772 987 654</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Notices & Timeline */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" /> Recent School Notices & Activity Timeline
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <h4 className="font-bold text-white">Term 1 Parent-Teacher Consultative Meeting</h4>
                        <p className="text-slate-400 mt-0.5">
                          Scheduled for Friday, August 5th, 2026. Please book your teacher time slot in the PTM tab.
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">2 hours ago</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <h4 className="font-bold text-white">Biology Homework Assigned</h4>
                        <p className="text-slate-400 mt-0.5">
                          Draw and label the cell structure of a plant leaf. Due Monday morning.
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">Yesterday at 15:30</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMICS */}
          {activeTab === 'academics' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Terminal Report Cards & Continuous Assessment
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Viewing Term 1 Performance for {selectedChild.fullName}
                  </p>
                </div>

                {reportCard && !reportCard.isFeeBlocked && (
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Report Card PDF
                  </button>
                )}
              </div>

              {reportCard ? (
                reportCard.isFeeBlocked ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-rose-800/60 text-center space-y-3">
                    <Lock className="w-8 h-8 text-rose-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Report Card Release Policy Block</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Report card is locked pending fee clearance. Outstanding balance: UGX{' '}
                      <strong className="text-rose-400 font-mono">{reportCard.outstandingBalanceUGX?.toLocaleString()}</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                      <div>
                        <h4 className="font-black text-slate-900 uppercase">Vinexsah High School</h4>
                        <p className="text-xs text-slate-600">Official Student Terminal Progress Report</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full font-bold text-xs">
                        Average: {reportCard.averageScore}% ({reportCard.overallGrade})
                      </span>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 font-bold uppercase text-[10px]">
                          <th className="p-2 border">Subject</th>
                          <th className="p-2 border text-center">CA (20)</th>
                          <th className="p-2 border text-center">Exam (80)</th>
                          <th className="p-2 border text-center">Total (100)</th>
                          <th className="p-2 border text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportCard.subjectGrades.map((sub, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2 border font-bold text-slate-900">{sub.subjectName}</td>
                            <td className="p-2 border text-center">{sub.caScore}</td>
                            <td className="p-2 border text-center">{sub.examScore}</td>
                            <td className="p-2 border text-center font-bold">{sub.totalScore}%</td>
                            <td className="p-2 border text-center font-bold text-blue-900">{sub.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">No report card generated yet.</div>
              )}
            </div>
          )}

          {/* TAB 3: FEES */}
          {activeTab === 'fees' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Financial Statement & Payment History
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Fees Invoiced</span>
                  <p className="text-lg font-black font-mono text-white mt-1">
                    UGX {feeAccount?.totalBilledUGX.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cleared Payments</span>
                  <p className="text-lg font-black font-mono text-emerald-400 mt-1">
                    UGX {feeAccount?.totalPaidUGX.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Balance</span>
                  <p className="text-lg font-black font-mono text-amber-400 mt-1">
                    UGX {feeAccount?.outstandingBalanceUGX.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Daily Roll Call Log
              </h3>
              <p className="text-slate-300">
                Attendance rate for {selectedChild.fullName}: <strong className="text-emerald-400">96.5% Present</strong>
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Today (2026-07-28): <strong className="text-emerald-400">PRESENT (07:15 AM)</strong></span>
                <span className="text-slate-400 text-[11px]">Recorded by Tr. Sarah Akello</span>
              </div>
            </div>
          )}

          {/* TAB 5: TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Weekly Class Timetable & Homework Tasks
              </h3>
              <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <div key={day} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-sky-400 block">{day}</span>
                    <span className="text-slate-400 block text-[9px] mt-1">4 Lessons Scheduled</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
