import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Printer,
  Eye,
  Plus,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Receipt,
  GraduationCap,
} from 'lucide-react';
import {
  getStudentFeeAccounts,
  getPaymentRecords,
  getScholarships,
  formatUGX,
  recalculateStudentAccount,
} from '../services/financeApi';
import type { StudentFeeAccount, PaymentRecord, ScholarshipRecord } from '../types';

export const StudentFeeAccountsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<StudentFeeAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  // Selected student account detail modal
  const [selectedAccount, setSelectedAccount] = useState<StudentFeeAccount | null>(null);
  const [accountPayments, setAccountPayments] = useState<PaymentRecord[]>([]);
  const [accountScholarships, setAccountScholarships] = useState<ScholarshipRecord[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await getStudentFeeAccounts();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (acc: StudentFeeAccount) => {
    // Recalculate to ensure absolute fresh state
    const freshAcc = await recalculateStudentAccount(acc.studentId);
    const allPays = await getPaymentRecords();
    const allSchs = await getScholarships();

    const pays = allPays.filter((p) => p.studentId === acc.studentId);
    const schs = allSchs.filter((s) => s.studentId === acc.studentId);

    setSelectedAccount(freshAcc);
    setAccountPayments(pays);
    setAccountScholarships(schs);
    setIsDetailOpen(true);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;
    const matchesClass = classFilter === 'ALL' || acc.classGrade === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  const totalBilled = accounts.reduce((sum, a) => sum + a.netBilledUGX, 0);
  const totalPaid = accounts.reduce((sum, a) => sum + a.totalPaidUGX, 0);
  const totalBalance = accounts.reduce((sum, a) => sum + a.outstandingBalanceUGX, 0);

  const getStatusBadge = (status: StudentFeeAccount['status']) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold">Paid</span>;
      case 'Overpaid':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-extrabold">Overpaid</span>;
      case 'Partial':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold">Partial</span>;
      case 'Overdue':
      case 'Unpaid':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-extrabold">{status}</span>;
      default:
        return null;
    }
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
            <CreditCard className="w-5 h-5 text-blue-400" /> Student Fee Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time student fee ledger linked to Student Passports with automated billing, discounts & receipt reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Total Billed: <span className="text-white font-extrabold">{formatUGX(totalBilled)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300">
            Paid: <span className="text-emerald-400 font-extrabold">{formatUGX(totalPaid)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300">
            Deficit: <span className="text-rose-400 font-extrabold">{formatUGX(totalBalance)}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, LIN, admission #..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overpaid">Overpaid</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden"
          >
            <option value="ALL">All Classes</option>
            <option value="Primary 7">Primary 7</option>
            <option value="Primary 6">Primary 6</option>
          </select>
        </div>
      </div>

      {/* Fee Accounts Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="pb-3">Student Name & ID</th>
              <th className="pb-3">Class & Residence</th>
              <th className="pb-3 text-right">Gross Billed</th>
              <th className="pb-3 text-right">Scholarships</th>
              <th className="pb-3 text-right">Net Billed</th>
              <th className="pb-3 text-right">Total Paid</th>
              <th className="pb-3 text-right">Balance Due</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredAccounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3">
                  <div className="font-bold text-white text-xs">{acc.studentName}</div>
                  <div className="text-[10px] font-mono text-slate-400">{acc.admissionNumber}</div>
                </td>
                <td className="py-3">
                  <div className="font-semibold text-slate-200">{acc.classGrade}</div>
                  <span className="text-[10px] text-slate-400">{acc.residenceType} Scholar</span>
                </td>
                <td className="py-3 text-right font-medium text-slate-400">
                  {formatUGX(acc.totalBilledUGX)}
                </td>
                <td className="py-3 text-right font-semibold text-amber-400">
                  {acc.totalScholarshipUGX > 0 ? `-${formatUGX(acc.totalScholarshipUGX)}` : '-'}
                </td>
                <td className="py-3 text-right font-bold text-white">
                  {formatUGX(acc.netBilledUGX)}
                </td>
                <td className="py-3 text-right font-extrabold text-emerald-400">
                  {formatUGX(acc.totalPaidUGX)}
                </td>
                <td className={`py-3 text-right font-extrabold ${acc.outstandingBalanceUGX > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {formatUGX(acc.outstandingBalanceUGX)}
                </td>
                <td className="py-3 text-center">
                  {getStatusBadge(acc.status)}
                </td>
                <td className="py-3 text-center">
                  <button
                    id={`btn-view-fee-passport-${acc.id}`}
                    onClick={() => handleOpenDetail(acc)}
                    className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 mx-auto"
                  >
                    <Eye className="w-3.5 h-3.5" /> Passport
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Student Fee Passport & Statement */}
      {isDetailOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">{selectedAccount.studentName}</h2>
                  <p className="text-xs text-slate-400">
                    {selectedAccount.admissionNumber} &bull; {selectedAccount.classGrade} ({selectedAccount.residenceType})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mt-4">
              {/* Account Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Billed</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">{formatUGX(selectedAccount.netBilledUGX)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Scholarships</div>
                  <div className="text-sm font-extrabold text-amber-400 mt-0.5">{formatUGX(selectedAccount.totalScholarshipUGX)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid</div>
                  <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{formatUGX(selectedAccount.totalPaidUGX)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Balance Due</div>
                  <div className="text-sm font-extrabold text-rose-400 mt-0.5">{formatUGX(selectedAccount.outstandingBalanceUGX)}</div>
                </div>
              </div>

              {/* Active Scholarships */}
              {accountScholarships.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Active Bursaries & Scholarships
                  </h3>
                  <div className="space-y-2">
                    {accountScholarships.map((sch) => (
                      <div key={sch.id} className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-amber-200">{sch.discountType} ({sch.value}{sch.discountValueType === 'Percentage' ? '%' : ' UGX'})</div>
                          <div className="text-[11px] text-amber-400/80">{sch.reason}</div>
                        </div>
                        <div className="text-right font-extrabold text-amber-300">
                          -{formatUGX(sch.calculatedAmountUGX)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Receipts History */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-400" /> Payment History & Issued Receipts
                </h3>

                {accountPayments.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs rounded-xl bg-slate-950 border border-slate-800">
                    No payment receipts issued yet for this account.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {accountPayments.map((pay) => (
                      <div key={pay.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-blue-400">{pay.receiptNumber}</div>
                          <div className="text-slate-400 text-[11px]">
                            {pay.date} &bull; {pay.paymentMethod} ({pay.transactionReference})
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-extrabold text-emerald-400">{formatUGX(pay.amountPaidUGX)}</div>
                          <span className="text-[10px] text-slate-400">Ver: {pay.verificationCode}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Print Statement Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Fee Statement
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
