import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  DollarSign,
  Calculator,
} from 'lucide-react';
import { getBudgets, createBudget, formatUGX } from '../services/financeApi';
import type { BudgetItem, BudgetCategory } from '../types';

export const BudgetManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const yearStr = new Date().getFullYear().toString();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('Academics');
  const [term, setTerm] = useState<'Term I' | 'Term II' | 'Term III'>('Term I');
  const [allocatedAmountUGX, setAllocatedAmountUGX] = useState<number | ''>(10000000);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !allocatedAmountUGX || Number(allocatedAmountUGX) <= 0) return;

    try {
      await createBudget({
        title,
        category,
        academicYear: yearStr,
        term,
        allocatedAmountUGX: Number(allocatedAmountUGX),
        status: 'Approved',
        approvedBy: 'Headteacher',
      });

      setIsModalOpen(false);
      setTitle('');
      await loadBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmountUGX, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.actualSpentUGX, 0);
  const totalRemaining = totalAllocated - totalSpent;

  const categoriesList: BudgetCategory[] = [
    'Academics',
    'Administration',
    'Infrastructure',
    'Utilities',
    'ICT',
    'Library',
    'Laboratory',
    'Sports',
    'Maintenance',
    'Welfare',
    'Transport',
    'Boarding',
    'Custom',
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
            <PieChart className="w-5 h-5 text-purple-400" /> Budget Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create school category budgets, monitor live expenditure variance & prevent cost overruns.
          </p>
        </div>

        <button
          id="btn-create-budget"
          onClick={() => {
            setTitle('Term I ICT Equipment & Internet Budget');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Create Category Budget
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Budget Allocated</div>
          <div className="text-xl font-extrabold text-white mt-1">{formatUGX(totalAllocated)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Actual Expenditure Spent</div>
          <div className="text-xl font-extrabold text-purple-400 mt-1">{formatUGX(totalSpent)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Remaining Unspent Funds</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatUGX(totalRemaining)}</div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((bdg) => {
          const pct = Math.min(100, Math.round((bdg.actualSpentUGX / bdg.allocatedAmountUGX) * 100));
          return (
            <div key={bdg.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                    {bdg.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2">{bdg.title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                  {bdg.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Spent: {formatUGX(bdg.actualSpentUGX)}</span>
                  <span className="font-mono text-purple-300">{pct}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">Allocated: <strong className="text-white">{formatUGX(bdg.allocatedAmountUGX)}</strong></span>
                <span className="text-slate-400">Variance: <strong className="text-emerald-400">{formatUGX(bdg.varianceUGX)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" /> Create School Budget Item
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
                <label className="block font-semibold text-slate-300 mb-1">Budget Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Science Laboratory Reagents & Apparatus"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Term</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Term I">Term I</option>
                    <option value="Term II">Term II</option>
                    <option value="Term III">Term III</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Allocated Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={allocatedAmountUGX}
                  onChange={(e) => setAllocatedAmountUGX(Number(e.target.value) || '')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-purple-400 font-extrabold"
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                >
                  Save Budget Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
