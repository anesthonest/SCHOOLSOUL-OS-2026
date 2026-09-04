import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  BookOpen,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  getStudentFeeAccounts,
  getPaymentRecords,
  getFinancialTransactions,
  getBudgets,
  formatUGX,
} from '../services/financeApi';
import type { StudentFeeAccount, PaymentRecord, FinancialTransaction, BudgetItem } from '../types';

export const FinancialReportingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<
    'COLLECTION' | 'DEFAULTERS' | 'INCOME_EXPENSE' | 'BUDGET_PERFORMANCE' | 'AUDIT_TRAIL'
  >('COLLECTION');

  const [accounts, setAccounts] = useState<StudentFeeAccount[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, pays, txs, bdgs] = await Promise.all([
        getStudentFeeAccounts(),
        getPaymentRecords(),
        getFinancialTransactions(),
        getBudgets(),
      ]);
      setAccounts(accs);
      setPayments(pays);
      setTransactions(txs);
      setBudgets(bdgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const defaulters = accounts.filter((a) => a.outstandingBalanceUGX > 0);

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
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" /> Financial Reporting & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exportable school financial statements, defaulter registers, budget variances & cashbook reports.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print PDF Statement
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveReport('COLLECTION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeReport === 'COLLECTION' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Fee Collection Summary
        </button>
        <button
          onClick={() => setActiveReport('DEFAULTERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeReport === 'DEFAULTERS' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Fee Defaulters List ({defaulters.length})
        </button>
        <button
          onClick={() => setActiveReport('INCOME_EXPENSE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeReport === 'INCOME_EXPENSE' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Income & Expense Statement
        </button>
        <button
          onClick={() => setActiveReport('BUDGET_PERFORMANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeReport === 'BUDGET_PERFORMANCE' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Budget Performance
        </button>
      </div>

      {/* Report Content Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        {/* REPORT 1: COLLECTION */}
        {activeReport === 'COLLECTION' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Termly Fee Collection Breakdown ({payments.length} Verified Receipts)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Receipt No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Class Grade</th>
                    <th className="pb-3">Payment Method</th>
                    <th className="pb-3 text-right">Amount Paid (UGX)</th>
                    <th className="pb-3 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 font-mono font-bold text-cyan-400">{p.receiptNumber}</td>
                      <td className="py-3 font-semibold text-white">{p.studentName}</td>
                      <td className="py-3 text-slate-400">{p.classGrade}</td>
                      <td className="py-3">{p.paymentMethod}</td>
                      <td className="py-3 text-right font-extrabold text-emerald-400">{formatUGX(p.amountPaidUGX)}</td>
                      <td className="py-3 text-right font-bold text-rose-400">{formatUGX(p.newBalanceUGX)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: DEFAULTERS */}
        {activeReport === 'DEFAULTERS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider">
                Outstanding Fee Defaulters Register ({defaulters.length} Students)
              </h2>
              <span className="text-xs text-slate-400 font-bold">
                Total Outstanding Deficit: {formatUGX(defaulters.reduce((s, d) => s + d.outstandingBalanceUGX, 0))}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Admission #</th>
                    <th className="pb-3">Class Grade</th>
                    <th className="pb-3 text-right">Net Billed</th>
                    <th className="pb-3 text-right">Total Paid</th>
                    <th className="pb-3 text-right">Deficit Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {defaulters.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 font-bold text-white">{d.studentName}</td>
                      <td className="py-3 font-mono text-slate-400">{d.admissionNumber}</td>
                      <td className="py-3 text-slate-300">{d.classGrade} ({d.residenceType})</td>
                      <td className="py-3 text-right font-medium text-slate-400">{formatUGX(d.netBilledUGX)}</td>
                      <td className="py-3 text-right font-semibold text-emerald-400">{formatUGX(d.totalPaidUGX)}</td>
                      <td className="py-3 text-right font-black text-rose-400">{formatUGX(d.outstandingBalanceUGX)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 3: INCOME & EXPENSE */}
        {activeReport === 'INCOME_EXPENSE' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Cashbook Income & Expenditure Statement
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Voucher #</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right">Amount (UGX)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 font-mono font-bold text-blue-400">{tx.voucherNumber}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.transactionType === 'Income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-white">{tx.category}</td>
                      <td className="py-3 text-slate-400">{tx.description}</td>
                      <td className={`py-3 text-right font-extrabold ${tx.transactionType === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatUGX(tx.amountUGX)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 4: BUDGET PERFORMANCE */}
        {activeReport === 'BUDGET_PERFORMANCE' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Budget Allocated vs Actual Variance Performance
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Budget Title</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Allocated (UGX)</th>
                    <th className="pb-3 text-right">Actual Spent (UGX)</th>
                    <th className="pb-3 text-right">Remaining Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {budgets.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 font-bold text-white">{b.title}</td>
                      <td className="py-3 text-purple-300">{b.category}</td>
                      <td className="py-3 text-right font-semibold text-white">{formatUGX(b.allocatedAmountUGX)}</td>
                      <td className="py-3 text-right font-extrabold text-purple-400">{formatUGX(b.actualSpentUGX)}</td>
                      <td className="py-3 text-right font-black text-emerald-400">{formatUGX(b.varianceUGX)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
