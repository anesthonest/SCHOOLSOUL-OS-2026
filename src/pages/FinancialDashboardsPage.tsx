import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Wallet,
  CheckCircle2,
  Users,
  Smartphone,
  Receipt,
  GraduationCap,
  Download,
  CreditCard,
  Plus,
} from 'lucide-react';
import {
  getStudentFeeAccounts,
  getPaymentRecords,
  getFinancialTransactions,
  getBudgets,
  formatUGX,
} from '../services/financeApi';
import type { StudentFeeAccount, PaymentRecord, FinancialTransaction, BudgetItem } from '../types';

interface FinancialDashboardsPageProps {
  onNavigate: (view: string) => void;
}

export const FinancialDashboardsPage: React.FC<FinancialDashboardsPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [activeRoleView, setActiveRoleView] = useState<'HEADTEACHER' | 'BURSAR' | 'PARENT'>('HEADTEACHER');

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

  const totalBilled = accounts.reduce((sum, a) => sum + a.netBilledUGX, 0);
  const totalPaid = accounts.reduce((sum, a) => sum + a.totalPaidUGX, 0);
  const totalOutstanding = accounts.reduce((sum, a) => sum + a.outstandingBalanceUGX, 0);

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
            <ShieldCheck className="w-5 h-5 text-teal-400" /> Role-Based Financial Dashboards
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tailored financial command centers for Executive Headteachers, Operational Bursars, & Parent Self-Service.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1 self-start">
          <button
            onClick={() => setActiveRoleView('HEADTEACHER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRoleView === 'HEADTEACHER' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Headteacher (Executive)
          </button>
          <button
            onClick={() => setActiveRoleView('BURSAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRoleView === 'BURSAR' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bursar (Operational)
          </button>
          <button
            onClick={() => setActiveRoleView('PARENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRoleView === 'PARENT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Parent Portal View
          </button>
        </div>
      </div>

      {/* VIEW 1: HEADTEACHER EXECUTIVE DASHBOARD */}
      {activeRoleView === 'HEADTEACHER' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-800/50 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                Executive Mode
              </span>
              <h2 className="text-base font-bold text-white mt-1">Headteacher High-Level Revenue Overview</h2>
              <p className="text-xs text-slate-300">
                School-wide revenue solvency, termly collection rates, & high-value expenditure alerts.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Term Collection Progress</div>
              <div className="text-2xl font-black text-teal-400">
                {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Total Revenue Solvency</div>
              <div className="text-xl font-extrabold text-white mt-1">{formatUGX(totalBilled)}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Total Funds Received</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatUGX(totalPaid)}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Outstanding Fee Deficit</div>
              <div className="text-xl font-extrabold text-rose-400 mt-1">{formatUGX(totalOutstanding)}</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BURSAR OPERATIONAL DASHBOARD */}
      {activeRoleView === 'BURSAR' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-800/50 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                Operational Cashier Mode
              </span>
              <h2 className="text-base font-bold text-white mt-1">Bursar Daily Operations Centre</h2>
              <p className="text-xs text-slate-300">
                Rapid payment processing, Mobile Money status monitoring, & cashier receipt history.
              </p>
            </div>

            <button
              onClick={() => onNavigate('payment-processing')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4" /> Fast Payment Entry
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Today's Issued Payment Receipts
            </h3>

            <div className="space-y-2">
              {payments.slice(0, 5).map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-blue-400">{p.receiptNumber}</div>
                    <div className="text-slate-400">{p.studentName} ({p.classGrade})</div>
                  </div>
                  <div className="text-right font-extrabold text-emerald-400">
                    {formatUGX(p.amountPaidUGX)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PARENT PORTAL VIEW */}
      {activeRoleView === 'PARENT' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                Parent Self-Service Portal
              </span>
              <h2 className="text-base font-bold text-white mt-1">Student Fee Ledger & Online MoMo Pay</h2>
              <p className="text-xs text-slate-300">
                View child's fee breakdown, download receipts & pay instantly via MTN/Airtel Mobile Money.
              </p>
            </div>
          </div>

          {accounts.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">{accounts[0].studentName}</h3>
                  <p className="text-xs text-slate-400">{accounts[0].admissionNumber} &bull; {accounts[0].classGrade}</p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Outstanding Balance</div>
                  <div className="text-xl font-black text-rose-400">{formatUGX(accounts[0].outstandingBalanceUGX)}</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => onNavigate('payment-processing')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" /> Pay Now via Mobile Money
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
