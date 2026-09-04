import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  ShieldAlert,
  ChevronRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import { getFeeStructures, createFeeStructure, formatUGX } from '../services/financeApi';
import type { FeeStructure, FeeCategoryItem, FeeCategory, ResidenceType } from '../types';

export const FeeStructureManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const yearStr = new Date().getFullYear().toString();
  const [title, setTitle] = useState('');
  const [academicYear, setAcademicYear] = useState(yearStr);
  const [term, setTerm] = useState<'Term I' | 'Term II' | 'Term III'>('Term I');
  const [classGrade, setClassGrade] = useState('Primary 7');
  const [residenceType, setResidenceType] = useState<ResidenceType | 'All'>('Boarding');
  const [studentCategory, setStudentCategory] = useState<'All' | 'New' | 'Continuing'>('All');

  // Fee items
  const [items, setItems] = useState<FeeCategoryItem[]>([
    { id: 'item-1', category: 'Tuition', name: 'Academic Tuition & Instruction', amountUGX: 600000, isMandatory: true, appliesTo: 'All' },
    { id: 'item-2', category: 'Boarding', name: 'Boarding Accommodation & Bedding', amountUGX: 300000, isMandatory: true, appliesTo: 'Boarding' },
    { id: 'item-3', category: 'Meals', name: 'Dining Hall Meals', amountUGX: 200000, isMandatory: true, appliesTo: 'All' },
  ]);

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    setLoading(true);
    try {
      const data = await getFeeStructures();
      setStructures(data);
      if (data.length > 0 && !selectedStructure) {
        setSelectedStructure(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const newItem: FeeCategoryItem = {
      id: `item-${Date.now()}`,
      category: 'Other',
      name: 'Custom Fee Item',
      amountUGX: 50000,
      isMandatory: true,
      appliesTo: 'All',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof FeeCategoryItem, val: any) => {
    setItems(
      items.map((i) => {
        if (i.id === id) {
          return { ...i, [field]: val };
        }
        return i;
      })
    );
  };

  const totalMandatoryUGX = items
    .filter((i) => i.isMandatory)
    .reduce((sum, item) => sum + (Number(item.amountUGX) || 0), 0);

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newStruct = await createFeeStructure({
        title,
        academicYear,
        term,
        classGrade,
        residenceType,
        studentCategory,
        items,
        totalMandatoryAmountUGX: totalMandatoryUGX,
        installmentPlans: [
          { installmentNumber: 1, percentageOrAmount: 50, dueDate: `${academicYear}-02-15`, latePenaltyPercentage: 5 },
          { installmentNumber: 2, percentageOrAmount: 30, dueDate: `${academicYear}-03-20`, latePenaltyPercentage: 5 },
          { installmentNumber: 3, percentageOrAmount: 20, dueDate: `${academicYear}-04-15`, latePenaltyPercentage: 10 },
        ],
        latePenaltyPolicy: {
          enabled: true,
          percentageAfterDueDate: 5,
          gracePeriodDays: 7,
        },
        status: 'Active',
        createdBy: 'Bursar',
      });

      setIsModalOpen(false);
      await loadStructures();
      setSelectedStructure(newStruct);
    } catch (err) {
      console.error(err);
    }
  };

  const categoriesList: FeeCategory[] = [
    'Tuition',
    'Admission',
    'Development',
    'Examination',
    'Boarding',
    'Meals',
    'Uniform',
    'Transport',
    'Library',
    'Laboratory',
    'Activities',
    'ICT',
    'Medical',
    'Other',
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
            <Layers className="w-5 h-5 text-indigo-400" /> Fee Structure Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure termly school fees by class, residence, mandatory vs optional categories, & installment plans.
          </p>
        </div>

        <button
          id="btn-create-fee-structure"
          onClick={() => {
            setTitle(`P.7 Term I ${yearStr} Fee Structure`);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Create New Fee Structure
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: List of Fee Structures */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Defined Fee Structures ({structures.length})</span>
            <span className="text-slate-500">Academic Year {yearStr}</span>
          </div>

          <div className="space-y-3">
            {structures.map((struct) => {
              const isSel = selectedStructure?.id === struct.id;
              return (
                <div
                  key={struct.id}
                  id={`struct-card-${struct.id}`}
                  onClick={() => setSelectedStructure(struct)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-blue-950/40 border-blue-500/60 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                      {struct.classGrade} | {struct.residenceType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {struct.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white truncate">{struct.title}</h3>
                  
                  <div className="mt-3 flex items-center justify-between text-xs font-extrabold text-emerald-400">
                    <span>Mandatory Total:</span>
                    <span>{formatUGX(struct.totalMandatoryAmountUGX)}</span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{struct.items.length} Category Items</span>
                    <span>Version {struct.version}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Detailed Breakdown of Selected Fee Structure */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStructure ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              {/* Structure Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                      {selectedStructure.academicYear} - {selectedStructure.term}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                      {selectedStructure.classGrade}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white">{selectedStructure.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Created by {selectedStructure.createdBy} &bull; Applicable to {selectedStructure.residenceType} students ({selectedStructure.studentCategory})
                  </p>
                </div>

                <div className="text-right bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Mandatory Fee</div>
                  <div className="text-xl font-black text-emerald-400">
                    {formatUGX(selectedStructure.totalMandatoryAmountUGX)}
                  </div>
                </div>
              </div>

              {/* Fee Categories Table */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Fee Breakdown Items ({selectedStructure.items.length})
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Item Description</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Applies To</th>
                        <th className="p-3 text-right">Amount (UGX)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {selectedStructure.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">{item.category}</td>
                          <td className="p-3 font-medium text-slate-200">{item.name}</td>
                          <td className="p-3">
                            {item.isMandatory ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                Mandatory
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400">{item.appliesTo}</td>
                          <td className="p-3 text-right font-extrabold text-white">
                            {formatUGX(item.amountUGX)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Installments & Penalty Policy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-400" /> Installment Schedule
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedStructure.installmentPlans.map((plan) => (
                      <div key={plan.installmentNumber} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-semibold text-slate-300">Installment #{plan.installmentNumber} ({plan.percentageOrAmount}%)</span>
                        <span className="font-mono text-blue-400 font-bold">Due: {plan.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Late Payment Penalty Policy
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedStructure.latePenaltyPolicy?.enabled
                      ? `Automatic ${selectedStructure.latePenaltyPolicy.percentageAfterDueDate}% late penalty surcharge applies after a grace period of ${selectedStructure.latePenaltyPolicy.gracePeriodDays} days post installment due date.`
                      : 'No late payment penalties configured for this structure.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              Select a fee structure on the left to view details.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Fee Structure */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Create Termly Fee Structure
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStructure} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Structure Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Primary 7 Term I Fee Structure"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class Grade</label>
                  <input
                    type="text"
                    required
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    placeholder="e.g. Primary 7, Senior 4"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year & Term</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                    <select
                      value={term}
                      onChange={(e) => setTerm(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    >
                      <option value="Term I">Term I</option>
                      <option value="Term II">Term II</option>
                      <option value="Term III">Term III</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Residence Type</label>
                  <select
                    value={residenceType}
                    onChange={(e) => setResidenceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="Boarding">Boarding</option>
                    <option value="Day">Day</option>
                    <option value="All">All Students</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Items Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Fee Items ({items.length})</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Fee Category
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <select
                          value={it.category}
                          onChange={(e) => handleItemChange(it.id, 'category', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                        >
                          {categoriesList.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4">
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) => handleItemChange(it.id, 'name', e.target.value)}
                          placeholder="Description"
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          value={it.amountUGX}
                          onChange={(e) => handleItemChange(it.id, 'amountUGX', Number(e.target.value))}
                          placeholder="Amount UGX"
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleItemChange(it.id, 'isMandatory', !it.isMandatory)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            it.isMandatory ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {it.isMandatory ? 'Mandatory' : 'Optional'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Mandatory Total (UGX):</span>
                <span className="text-lg font-black text-emerald-400">{formatUGX(totalMandatoryUGX)}</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
