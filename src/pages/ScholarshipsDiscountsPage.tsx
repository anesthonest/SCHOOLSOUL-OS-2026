import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  Tag,
  Percent,
} from 'lucide-react';
import {
  getScholarships,
  grantScholarship,
  getStudentFeeAccounts,
  formatUGX,
} from '../services/financeApi';
import type { ScholarshipRecord, ScholarshipType, StudentFeeAccount } from '../types';

export const ScholarshipsDiscountsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scholarships, setScholarships] = useState<ScholarshipRecord[]>([]);
  const [accounts, setAccounts] = useState<StudentFeeAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const yearStr = new Date().getFullYear().toString();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [discountType, setDiscountType] = useState<ScholarshipType>('Merit');
  const [discountValueType, setDiscountValueType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
  const [value, setValue] = useState<number>(20);
  const [term, setTerm] = useState<'Term I' | 'Term II' | 'Term III' | 'Full Year'>('Term I');
  const [reason, setReason] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [approvedBy, setApprovedBy] = useState('Headteacher');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schs, accs] = await Promise.all([
        getScholarships(),
        getStudentFeeAccounts(),
      ]);
      setScholarships(schs);
      setAccounts(accs);
      if (accs.length > 0 && !selectedStudentId) {
        setSelectedStudentId(accs[0].studentId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = accounts.find((a) => a.studentId === selectedStudentId);
    if (!student || !reason.trim()) return;

    try {
      await grantScholarship({
        studentId: student.studentId,
        studentName: student.studentName,
        classGrade: student.classGrade,
        discountType,
        discountValueType,
        value,
        academicYear: yearStr,
        term,
        reason,
        sponsorName: sponsorName.trim() || undefined,
        approvedBy,
        status: 'Active',
        startDate: `${yearStr}-01-01`,
        expiryDate: `${yearStr}-12-31`,
      });

      setIsModalOpen(false);
      setReason('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalScholarshipValue = scholarships
    .filter((s) => s.status === 'Active')
    .reduce((sum, s) => sum + s.calculatedAmountUGX, 0);

  const typesList: ScholarshipType[] = [
    'Merit',
    'Sports',
    'Staff Child',
    'Sibling Discount',
    'Community Sponsorship',
    'Government Bursary',
    'Individual Waiver',
    'Temporary Discount',
  ];

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
            <Award className="w-5 h-5 text-amber-400" /> Scholarships & Bursaries Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage student bursaries, merit discounts, sibling waivers, staff benefits & sponsor funds with automatic fee recalculation.
          </p>
        </div>

        <button
          id="btn-grant-scholarship"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Grant Bursary / Scholarship
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Active Scholarships</div>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{scholarships.filter((s) => s.status === 'Active').length} Grants</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Financial Aid Value</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatUGX(totalScholarshipValue)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Coverage Percentage</div>
          <div className="text-xl font-extrabold text-white mt-1">
            {accounts.length > 0 ? Math.round((scholarships.length / accounts.length) * 100) : 0}% Students
          </div>
        </div>
      </div>

      {/* Scholarships Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
          Active Student Financial Aid Register ({scholarships.length})
        </h2>

        {scholarships.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active scholarships or discounts recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Scholarship Type</th>
                <th className="pb-3">Benefit Rate</th>
                <th className="pb-3">Applied Term</th>
                <th className="pb-3 text-right">Value (UGX)</th>
                <th className="pb-3">Approved By</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {scholarships.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-white">{sch.studentName}</div>
                    <div className="text-[10px] text-slate-400">{sch.classGrade}</div>
                  </td>
                  <td className="py-3 font-semibold text-amber-300">{sch.discountType}</td>
                  <td className="py-3 font-mono font-bold text-white">
                    {sch.value} {sch.discountValueType === 'Percentage' ? '%' : 'UGX'}
                  </td>
                  <td className="py-3 text-slate-400">{sch.term}</td>
                  <td className="py-3 text-right font-extrabold text-emerald-400">
                    {formatUGX(sch.calculatedAmountUGX)}
                  </td>
                  <td className="py-3 text-slate-400">{sch.approvedBy}</td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {sch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Grant Bursary */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Grant Student Scholarship / Waiver
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrant} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.studentId} value={a.studentId}>
                      {a.studentName} ({a.admissionNumber} - {a.classGrade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Scholarship Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {typesList.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Benefit Calculation</label>
                  <select
                    value={discountValueType}
                    onChange={(e) => setDiscountValueType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (UGX)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Value ({discountValueType === 'Percentage' ? '%' : 'UGX'})
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-extrabold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Duration</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Term I">Term I Only</option>
                    <option value="Term II">Term II Only</option>
                    <option value="Term III">Term III Only</option>
                    <option value="Full Year">Full Academic Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Justification / Award Notes</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Scored 4 aggregates in Term III mock exams"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-600/30"
                >
                  Grant Scholarship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
