import React, { useState, useEffect } from 'react';
import {
  Globe,
  Settings,
  Eye,
  CheckCircle,
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { PublicWebsiteConfig } from '../../types';

export const PublicWebsiteManagerPage: React.FC = () => {
  const [config, setConfig] = useState<PublicWebsiteConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'cms' | 'preview'>('cms');
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const data = await v9PublicEngagementApi.getWebsiteConfig();
    setConfig(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    await v9PublicEngagementApi.updateWebsiteConfig(config);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  if (!config) return <div className="p-6 text-slate-400">Loading Website Manager...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Module 6: Auto-Generated School Website
            </span>
            <span className="text-xs text-slate-400">No-Code Website CMS & Live Preview</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            School Public Website CMS & Portal Manager
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure school hero banners, admissions notice, leadership messages, mission statements, and live website preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('cms')}
            className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition ${
              activeTab === 'cms' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5 inline mr-1" /> CMS Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition ${
              activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Website Preview
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> School public website settings saved successfully!
        </div>
      )}

      {/* CMS Mode */}
      {activeTab === 'cms' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Building2 className="w-4 h-4 text-blue-400" /> General Information & Branding
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">School Official Name</label>
                <input
                  type="text"
                  value={config.schoolName}
                  onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">School Motto</label>
                <input
                  type="text"
                  value={config.motto}
                  onChange={(e) => setConfig({ ...config, motto: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hero Title Banner</label>
                <input
                  type="text"
                  value={config.heroHeadline}
                  onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Admissions Notice / Banner</label>
                <input
                  type="text"
                  value={config.admissionNotice}
                  onChange={(e) => setConfig({ ...config, admissionNotice: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vision Statement</label>
                <textarea
                  rows={2}
                  value={config.visionStatement}
                  onChange={(e) => setConfig({ ...config, visionStatement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mission Statement</label>
                <textarea
                  rows={2}
                  value={config.missionStatement}
                  onChange={(e) => setConfig({ ...config, missionStatement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save & Publish Website Updates
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Live Website Preview Mode */}
      {activeTab === 'preview' && (
        <div className="border border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-slate-950">
          {/* Simulated Browser Bar */}
          <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 text-slate-300 font-bold">https://www.schoolsoul-academy.org</span>
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> LIVE PUBLIC SITE
            </span>
          </div>

          {/* Website Canvas */}
          <div className="p-8 space-y-12 bg-slate-950 text-slate-100">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {config.motto}
              </span>
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                {config.heroHeadline}
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                {config.heroSubtext}
              </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              {config.stats.map((st, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-2xl font-black text-blue-400 font-mono">{st.value}</span>
                  <span className="text-xs text-slate-400 block">{st.label}</span>
                </div>
              ))}
            </div>

            {/* Principal Message */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-800/60 space-y-2">
              <h3 className="text-sm font-bold text-blue-300">Welcome Message from the Principal</h3>
              <p className="text-xs text-slate-300 leading-relaxed italic">"{config.principalMessage}"</p>
            </div>

            {/* Vision & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-purple-400">Our Vision</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{config.visionStatement}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-emerald-400">Our Mission</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{config.missionStatement}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
