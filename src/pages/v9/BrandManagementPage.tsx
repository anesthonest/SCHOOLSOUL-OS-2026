import React, { useState, useEffect } from 'react';
import {
  Palette,
  CheckCircle,
  Save,
  Building2,
  FileText,
  Award,
  Sparkles,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { BrandSettings } from '../../types';

export const BrandManagementPage: React.FC = () => {
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadBrand();
  }, []);

  const loadBrand = async () => {
    const data = await v9PublicEngagementApi.getBrandSettings();
    setBrand(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) return;
    await v9PublicEngagementApi.updateBrandSettings(brand);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!brand) return <div className="p-6 text-slate-400">Loading Brand Settings...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Module 13: School Brand & Identity Management
            </span>
            <span className="text-xs text-slate-400">Report & Certificate Styling</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Official Branding, Document Headers & Certificate Styling
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Maintain consistent institutional identity, color themes, logo headers, and typography across all student reports and certificates.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Brand settings updated across all SchoolSoul modules!
        </div>
      )}

      {/* Brand Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Palette className="w-4 h-4 text-purple-400" /> Color Palette & Typography
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Logo Text Brand</label>
              <input
                type="text"
                value={brand.logoText}
                onChange={(e) => setBrand({ ...brand, logoText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">School Tagline</label>
              <input
                type="text"
                value={brand.tagline}
                onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Primary Color Hex Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brand.primaryColorHex}
                  onChange={(e) => setBrand({ ...brand, primaryColorHex: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={brand.primaryColorHex}
                  onChange={(e) => setBrand({ ...brand, primaryColorHex: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Secondary Color Hex Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brand.secondaryColorHex}
                  onChange={(e) => setBrand({ ...brand, secondaryColorHex: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={brand.secondaryColorHex}
                  onChange={(e) => setBrand({ ...brand, secondaryColorHex: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Official Report Header Title</label>
              <input
                type="text"
                value={brand.reportHeaderTitle}
                onChange={(e) => setBrand({ ...brand, reportHeaderTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Certificate Award Title Line</label>
              <input
                type="text"
                value={brand.certificateHeader}
                onChange={(e) => setBrand({ ...brand, certificateHeader: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Brand Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
