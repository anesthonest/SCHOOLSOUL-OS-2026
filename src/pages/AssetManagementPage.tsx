import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Wrench,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  QrCode,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { SchoolAsset } from '../types';

export const AssetManagementPage: React.FC = () => {
  const [assets, setAssets] = useState<SchoolAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    assetName: '',
    category: 'IT Equipment' as SchoolAsset['category'],
    location: 'Computer Lab 1',
    condition: 'Good' as any,
    purchaseCostUgx: 2500000,
    serialNumber: `SN-${Date.now().toString().slice(-6)}`,
    custodianStaff: 'Ssemwogerere David',
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    const data = await v7Api.getSchoolAssets();
    setAssets(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetName) return;

    const created = await v7Api.saveSchoolAsset({
      ...formData,
      status: 'In Use',
      purchaseDate: new Date().toISOString().split('T')[0],
      maintenanceLogs: [],
    });

    setAssets([created, ...assets]);
    setShowModal(false);
    setFormData({
      assetName: '',
      category: 'IT Equipment',
      location: 'Computer Lab 1',
      condition: 'Good',
      purchaseCostUgx: 2500000,
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      custodianStaff: 'Ssemwogerere David',
    });
  };

  const filtered = assets.filter((a) => {
    const matchesSearch =
      a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalValue = assets.reduce((sum, a) => sum + a.purchaseCostUgx, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-blue-950 p-6 rounded-2xl border border-cyan-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>SchoolSoul Fixed Assets & Facilities Register</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Asset & Facilities Management</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Track physical infrastructure, school vehicles, laboratory equipment, computers, asset depreciation, maintenance schedules, and custodian assignments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Registered Assets</span>
          <p className="text-2xl font-black text-white mt-1">{assets.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Valuation (UGX)</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            UGX {(totalValue / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Under Maintenance</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {assets.filter((a) => a.status === 'Under Maintenance').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Condition: Excellent / Good</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {assets.filter((a) => (a.currentCondition || (a as any).condition) === 'Excellent' || (a.currentCondition || (a as any).condition) === 'Good').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search asset tag, name, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl focus:outline-none w-full md:w-auto"
        >
          <option value="All">All Categories</option>
          <option value="IT Equipment">IT Equipment</option>
          <option value="Furniture">Furniture</option>
          <option value="Laboratory">Laboratory</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Buildings">Buildings</option>
          <option value="Sports Equipment">Sports Equipment</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Asset Tag</th>
              <th className="p-3">Asset Name & Category</th>
              <th className="p-3">Location</th>
              <th className="p-3">Condition</th>
              <th className="p-3">Cost (UGX)</th>
              <th className="p-3">Custodian</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((a: any) => (
              <tr key={a.id} className="hover:bg-slate-800/50">
                <td className="p-3 font-mono font-bold text-cyan-400">{a.assetTag}</td>
                <td className="p-3">
                  <div className="font-bold text-white">{a.assetName || a.name}</div>
                  <div className="text-[10px] text-slate-400">{a.category}</div>
                </td>
                <td className="p-3 text-slate-300">{a.location}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      (a.currentCondition || a.condition) === 'Excellent' || (a.currentCondition || a.condition) === 'Good'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {a.currentCondition || a.condition || 'Good'}
                  </span>
                </td>
                <td className="p-3 font-mono font-bold text-slate-200">
                  {(a.purchaseCostUGX || a.purchaseCostUgx || 0).toLocaleString()}
                </td>
                <td className="p-3 text-slate-300">{a.custodianStaff || 'Administration'}</td>
                <td className="p-3">
                  <span className="text-cyan-300 font-semibold">{a.status || 'Active'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-400" />
                <span>Register New Asset / Equipment</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Asset Name</label>
                <input
                  type="text"
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  placeholder="e.g., Epson Interactive Projector, Bus Toyota Coaster"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Buildings">Buildings</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Campus Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Purchase Cost (UGX)</label>
                  <input
                    type="number"
                    value={formData.purchaseCostUgx}
                    onChange={(e) => setFormData({ ...formData, purchaseCostUgx: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Custodian / Person Responsible</label>
                <input
                  type="text"
                  value={formData.custodianStaff}
                  onChange={(e) => setFormData({ ...formData, custodianStaff: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
