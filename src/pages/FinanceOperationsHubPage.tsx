import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Smartphone,
  Receipt,
  Award,
  PieChart,
  BookOpen,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  CreditCard,
  ShieldCheck,
  Search,
  Printer,
  Download,
  Bell,
  Sparkles,
} from 'lucide-react';
import {
  getStudentFeeAccounts,
  getPaymentRecords,
  getFinancialTransactions,
  getBudgets,
  getScholarships,
  formatUGX,
} from '../services/financeApi';
import type { StudentFeeAccount, PaymentRecord, FinancialTransaction, BudgetItem } from '../types';

interface FinanceOperationsHubPageProps {
  onNavigate: (view: string) => void;
}

export const FinanceOperationsHubPage: React.FC<FinanceOperationsHubPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
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
      console.error('Failed to load finance hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const totalBilled = accounts.reduce((sum, a) => sum + a.netBilledUGX, 0);
  const totalPaid = accounts.reduce((sum, a) => sum + a.totalPaidUGX, 0);
  const totalOutstanding = accounts.reduce((sum, a) => sum + a.outstandingBalanceUGX, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPayments = payments.filter((p) => p.date === todayStr && p.status === 'Completed');
  const todayCollection = todayPayments.reduce((sum, p) => sum + p.amountPaidUGX, 0);

  const totalScholarshipsUGX = accounts.reduce((sum, a) => sum + a.totalScholarshipUGX, 0);

  // Expense Total
  const totalExpenses = transactions
    .filter((t) => t.transactionType === 'Expense' && t.approvalStatus === 'Approved')
    .reduce((sum, t) => sum + t.amountUGX, 0);

  const totalNetRevenue = totalPaid - totalExpenses;

  const moduleTiles = [
    {
      id: 'fee-structures',
      title: 'Fee Structures',
      desc: 'Class, term, & category fee setups',
      icon: Layers,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
      badge: 'Module 1',
    },
    {
      id: 'student-fee-accounts',
      title: 'Student Fee Accounts',
      desc: 'Student balances, statements & passports',
      icon: CreditCard,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
      badge: `${accounts.length} Accounts`,
    },
    {
      id: 'payment-processing',
      title: 'Payment & MoMo Engine',
      desc: 'Cash, Bank & MTN/Airtel MoMo collection',
      icon: Smartphone,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
      badge: 'Fast Capture',
    },
    {
      id: 'scholarships-discounts',
      title: 'Scholarships & Bursaries',
      desc: 'Merit, sports, sibling & staff waivers',
      icon: Award,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
      badge: formatUGX(totalScholarshipsUGX),
    },
    {
      id: 'budget-management',
      title: 'Budget Management',
      desc: 'Termly allocation vs actual spending',
      icon: PieChart,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
      badge: `${budgets.length} Active Budgets`,
    },
    {
      id: 'income-expenditure',
      title: 'Cashbook & Expenses',
      desc: 'Expenditure vouchers & ledger entries',
      icon: BookOpen,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
      badge: 'Approval Workflow',
    },
    {
      id: 'financial-reports',
      title: 'Financial Reports',
      desc: 'Collection, defaulters & cashbook audit',
      icon: FileSpreadsheet,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
      badge: 'PDF / Excel',
    },
    {
      id: 'financial-dashboards',
      title: 'Role Dashboards',
      desc: 'Headteacher, Bursar & Parent views',
      icon: ShieldCheck,
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20',
      badge: 'Executive Mode',
    },
    {
      id: 'payment-reminders',
      title: 'Fee Reminders',
      desc: 'Automated SMS, WhatsApp & Email warnings',
      icon: Bell,
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
      badge: 'Multi-Channel',
    },
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
      {/* Top Banner Branding */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> SchoolSoul V4 Active
              </span>
              <span className="text-slate-400 text-xs">| VINEXSAH TECHNOLOGIES</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Finance, Fees & Mobile Money Engine
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Complete, production-ready school financial operating system supporting automated fee structures, Mobile Money (MTN/Airtel), banking, scholarships, cashbook, budget tracking & instant verified receipts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-fast-payment"
              onClick={() => onNavigate('payment-processing')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Collect Payment / MoMo
            </button>
            <button
              id="btn-view-reports"
              onClick={() => onNavigate('financial-reports')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Financial Reports
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue Billed vs Paid */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Billed Net Revenue</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {formatUGX(totalBilled)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Paid: {formatUGX(totalPaid)}
            </span>
            <span className="text-slate-400">{collectionRate}% Paid</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, collectionRate)}%` }} />
          </div>
        </div>

        {/* Card 2: Outstanding Fee Balance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Outstanding Fee Deficit</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-400 tracking-tight">
            {formatUGX(totalOutstanding)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Defaulters: {accounts.filter((a) => a.outstandingBalanceUGX > 0).length} students</span>
            <button
              onClick={() => onNavigate('student-fee-accounts')}
              className="text-blue-400 hover:underline font-medium"
            >
              View All
            </button>
          </div>
        </div>

        {/* Card 3: Today's Collection */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Today's Collections</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 tracking-tight">
            {formatUGX(todayCollection)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {todayPayments.length} verified payment receipt(s) issued today
          </div>
        </div>

        {/* Card 4: Net Operating Cashflow */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Net Operating Balance</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-xl font-extrabold tracking-tight ${totalNetRevenue >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatUGX(totalNetRevenue)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Expenses: {formatUGX(totalExpenses)}</span>
            <span className="text-amber-400 font-semibold">Verified</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" /> Financial Engine Modules
          </h2>
          <span className="text-xs text-slate-400">9 Sub-Modules Integrated</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                id={`btn-module-${tile.id}`}
                onClick={() => onNavigate(tile.id)}
                className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left transition-all hover:border-slate-700 hover:shadow-lg group relative overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl border ${tile.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                    {tile.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {tile.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tile.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Payment Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Payment Receipts */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" /> Recent Fee Payment Receipts
            </h3>
            <button
              onClick={() => onNavigate('payment-processing')}
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              View All Payments
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No payments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Receipt No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Class</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {payments.slice(0, 6).map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-blue-400">{pay.receiptNumber}</td>
                      <td className="py-3 font-semibold text-white">{pay.studentName}</td>
                      <td className="py-3 text-slate-400">{pay.classGrade}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
                          {pay.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-right font-extrabold text-emerald-400">
                        {formatUGX(pay.amountPaidUGX)}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Expense & Budget Summary */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" /> Budget Spending Status
            </h3>

            {budgets.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No active budget items defined.
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 3).map((bdg) => {
                  const pct = Math.min(100, Math.round((bdg.actualSpentUGX / bdg.allocatedAmountUGX) * 100));
                  return (
                    <div key={bdg.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <span className="truncate">{bdg.title}</span>
                        <span className="font-mono text-purple-300">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Spent: {formatUGX(bdg.actualSpentUGX)}</span>
                        <span>Budget: {formatUGX(bdg.allocatedAmountUGX)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('budget-management')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all text-center"
          >
            Manage School Budgets &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
