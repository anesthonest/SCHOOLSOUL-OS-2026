import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { InventoryItem } from '../types';

export const InventoryManagementPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Stationery' as InventoryItem['category'],
    quantityInStock: 100,
    unitOfMeasure: 'Reams',
    reorderLevel: 20,
    unitCostUgx: 25000,
    storeLocation: 'Main General Store',
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    const data = await v7Api.getInventoryItems();
    setItems(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName) return;

    const created = await v7Api.saveInventoryItem({
      ...formData,
      itemCode: `INV-${Date.now().toString().slice(-4)}`,
      lastRestockDate: new Date().toISOString().split('T')[0],
    });

    setItems([created, ...items]);
    setShowModal(false);
    setFormData({
      itemName: '',
      category: 'Stationery',
      quantityInStock: 100,
      unitOfMeasure: 'Reams',
      reorderLevel: 20,
      unitCostUgx: 25000,
      storeLocation: 'Main General Store',
    });
  };

  const filtered = items.filter(
    (i) =>
      i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.storeLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = items.filter((i) => i.quantityInStock <= i.reorderLevel).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 rounded-2xl border border-emerald-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>SchoolSoul Store Supplies & Inventory Tracking</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Inventory & Stores</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Manage school supplies, exam paper reams, science lab chemicals, cleaning detergents, uniform stock, reorder levels, and stock issuance logs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Stock SKUs</span>
          <p className="text-2xl font-black text-white mt-1">{items.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Low Stock Alert</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{lowStockCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Inventory Valuation</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            UGX {(items.reduce((sum, i) => sum + i.quantityInStock * i.unitCostUgx, 0) / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Stock Turnover Status</span>
          <p className="text-2xl font-black text-teal-400 mt-1">Healthy</p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search stock code, item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">SKU Code</th>
              <th className="p-3">Item Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">In Stock</th>
              <th className="p-3">Reorder Level</th>
              <th className="p-3">Unit Cost</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((i) => {
              const isLow = i.quantityInStock <= i.reorderLevel;
              return (
                <tr key={i.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-emerald-400">{i.itemCode}</td>
                  <td className="p-3 font-bold text-white">{i.itemName}</td>
                  <td className="p-3 text-slate-400">{i.category}</td>
                  <td className="p-3 font-black text-sm text-white">
                    {i.quantityInStock} <span className="text-[10px] text-slate-400 font-normal">{i.unitOfMeasure}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">{i.reorderLevel} {i.unitOfMeasure}</td>
                  <td className="p-3 font-mono text-slate-200">UGX {i.unitCostUgx.toLocaleString()}</td>
                  <td className="p-3 text-slate-400">{i.storeLocation}</td>
                  <td className="p-3">
                    {isLow ? (
                      <span className="text-amber-400 font-bold text-[10px] bg-amber-950 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Reorder Now
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                        Adequate
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>Add Inventory Stock Item</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Item Description</label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g., A4 Duplicate Paper Reams"
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
                    <option value="Stationery">Stationery</option>
                    <option value="Cleaning & Sanitation">Cleaning & Sanitation</option>
                    <option value="Textbooks & Library">Textbooks & Library</option>
                    <option value="Lab Supplies">Lab Supplies</option>
                    <option value="Uniforms & Textiles">Uniforms & Textiles</option>
                    <option value="Food & Boarding Supplies">Food & Boarding Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={formData.unitOfMeasure}
                    onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                    placeholder="e.g., Reams, Boxes, Litres"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.quantityInStock}
                    onChange={(e) => setFormData({ ...formData, quantityInStock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit Cost (UGX)</label>
                  <input
                    type="number"
                    value={formData.unitCostUgx}
                    onChange={(e) => setFormData({ ...formData, unitCostUgx: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    required
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
