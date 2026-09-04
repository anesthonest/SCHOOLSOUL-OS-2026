import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  DollarSign,
} from 'lucide-react';
import {
  getFinancialTransactions,
  recordTransaction,
  formatUGX,
} from '../services/financeApi';
import type { FinancialTransaction, TransactionType, ExpenseCategory, IncomeCategory } from '../types';

export const IncomeExpenditurePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'Income' | 'Expense'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [transactionType, setTransactionType] = useState<TransactionType>('Expense');
  const [expenseCat, setExpenseCat] = useState<ExpenseCategory>('Salaries');
  const [incomeCat, setIncomeCat] = useState<IncomeCategory>('Grants');
  const [description, setDescription] = useState('');
  const [amountUGX, setAmountUGX] = useState<number | ''>(250000);
  const [payeeOrPayer, setPayeeOrPayer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Deposit' | 'Bank Transfer' | 'MTN Mobile Money' | 'Airtel Money'>('Cash');
  const [voucherNumber, setVoucherNumber] = useState(`VOUCH-${Math.floor(1000 + Math.random() * 9000)}`);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getFinancialTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amountUGX || Number(amountUGX) <= 0) return;

    try {
      await recordTransaction({
        transactionType,
        category: transactionType === 'Expense' ? expenseCat : incomeCat,
        description,
        amountUGX: Number(amountUGX),
        payeeOrPayer: payeeOrPayer.trim() || 'General Vendor',
        paymentMethod,
        voucherNumber,
        recordedBy: 'Akwero Sarah (Bursar)',
      });

      setIsModalOpen(false);
      setDescription('');
      setPayeeOrPayer('');
      await loadTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTx = transactions.filter(
    (t) => filterType === 'ALL' || t.transactionType === filterType
  );

  const totalIncome = transactions
    .filter((t) => t.transactionType === 'Income' && t.approvalStatus === 'Approved')
    .reduce((sum, t) => sum + t.amountUGX, 0);

  const totalExpenses = transactions
    .filter((t) => t.transactionType === 'Expense' && t.approvalStatus === 'Approved')
    .reduce((sum, t) => sum + t.amountUGX, 0);

  const netCashflow = totalIncome - totalExpenses;

  const expenseCategories: ExpenseCategory[] = [
    'Salaries',
    'Utilities',
    'Repairs',
    'Supplies',
    'Fuel',
    'Food',
    'Maintenance',
    'Transport',
    'ICT',
    'Boarding Food',
    'Exam Materials',
    'Other Expense',
  ];

  const incomeCategories: IncomeCategory[] = [
    'Fees',
    'Donations',
    'Grants',
    'Fundraising',
    'Rentals',
    'Sales',
    'Other Income',
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
            <BookOpen className="w-5 h-5 text-rose-400" /> Cashbook & Income/Expenditure Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            General ledger cashbook recording daily revenue, expense vouchers, & high-value authorization workflows.
          </p>
        </div>

        <button
          id="btn-record-transaction"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Record Cashbook Voucher
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Cashbook Income</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatUGX(totalIncome)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Expenditure Spent</div>
          <div className="text-xl font-extrabold text-rose-400 mt-1">{formatUGX(totalExpenses)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Net Operating Surplus</div>
          <div className={`text-xl font-extrabold mt-1 ${netCashflow >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatUGX(netCashflow)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All Entries ({transactions.length})
        </button>
        <button
          onClick={() => setFilterType('Income')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'Income' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Income Registers
        </button>
        <button
          onClick={() => setFilterType('Expense')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'Expense' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Expense Vouchers
        </button>
      </div>

      {/* Transactions Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="pb-3">Voucher # & Date</th>
              <th className="pb-3">Type & Category</th>
              <th className="pb-3">Description</th>
              <th className="pb-3">Payee / Payer</th>
              <th className="pb-3 text-right">Amount (UGX)</th>
              <th className="pb-3 text-center">Approval Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredTx.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3">
                  <div className="font-mono font-bold text-blue-400">{tx.voucherNumber}</div>
                  <div className="text-[10px] text-slate-400">{tx.date}</div>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tx.transactionType === 'Income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {tx.category}
                  </span>
                </td>
                <td className="py-3 font-semibold text-white max-w-xs truncate">{tx.description}</td>
                <td className="py-3 text-slate-400">{tx.payeeOrPayer}</td>
                <td className={`py-3 text-right font-extrabold ${
                  tx.transactionType === 'Income' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {tx.transactionType === 'Income' ? '+' : '-'}{formatUGX(tx.amountUGX)}
                </td>
                <td className="py-3 text-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {tx.approvalStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Record Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-400" /> Record Financial Voucher
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Voucher Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType('Expense')}
                    className={`py-2 rounded-xl font-bold ${
                      transactionType === 'Expense' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Expenditure Voucher
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('Income')}
                    className={`py-2 rounded-xl font-bold ${
                      transactionType === 'Income' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Income Receipt
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                {transactionType === 'Expense' ? (
                  <select
                    value={expenseCat}
                    onChange={(e) => setExpenseCat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={incomeCat}
                    onChange={(e) => setIncomeCat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {incomeCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Purchase of 10 bags of rice for boarding school"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount (UGX)</label>
                  <input
                    type="number"
                    required
                    value={amountUGX}
                    onChange={(e) => setAmountUGX(Number(e.target.value) || '')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 font-extrabold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Airtel Money">Airtel Money</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payee / Payer Name</label>
                <input
                  type="text"
                  value={payeeOrPayer}
                  onChange={(e) => setPayeeOrPayer(e.target.value)}
                  placeholder="e.g. Mukwano Traders Uganda"
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/30"
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
