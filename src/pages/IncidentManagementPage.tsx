import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Plus,
  Shield,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { IncidentReport } from '../types';

export const IncidentManagementPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Safety & Security' as IncidentReport['category'],
    severity: 'Medium' as IncidentReport['severity'],
    location: 'Main Gate / Yard',
    description: '',
    immediateActionTaken: '',
    investigator: 'Mugisha Patrick (Safety Officer)',
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    const data = await v7Api.getIncidentReports();
    setIncidents(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const created = await v7Api.saveIncidentReport({
      ...formData,
      status: 'Open',
      incidentDate: new Date().toISOString().split('T')[0],
      reportedBy: 'Staff Member',
    });

    setIncidents([created, ...incidents]);
    setShowModal(false);
    setFormData({
      title: '',
      category: 'Safety & Security',
      severity: 'Medium',
      location: 'Main Gate / Yard',
      description: '',
      immediateActionTaken: '',
      investigator: 'Mugisha Patrick (Safety Officer)',
    });
  };

  const handleStatusChange = async (id: string, newStatus: IncidentReport['status']) => {
    const target = incidents.find((i) => i.id === id);
    if (!target) return;

    const updated = await v7Api.saveIncidentReport({
      ...target,
      status: newStatus,
    });

    setIncidents(incidents.map((i) => (i.id === updated.id ? updated : i)));
  };

  const filtered = incidents.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900 via-slate-900 to-amber-950 p-6 rounded-2xl border border-orange-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>SchoolSoul Risk, Safety & Critical Incident Centre</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Incident Management & Safety</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Log school safety breaches, injury reports, property damage, emergency events, and post-incident investigative reviews.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Safety Incident</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Incidents</span>
          <p className="text-2xl font-black text-white mt-1">{incidents.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Active Investigations</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {incidents.filter((i) => i.status === 'Investigating' || i.status === 'Open').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">High / Critical Severity</span>
          <p className="text-2xl font-black text-rose-400 mt-1">
            {incidents.filter((i) => i.severity === 'High' || i.severity === 'Critical').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Closed & Audited</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {incidents.filter((i) => i.status === 'Closed').length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search incident #, title, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((i) => (
          <div key={i.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-400">{i.incidentNumber}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{i.title}</h3>
                <p className="text-xs text-slate-400">{i.location} • Category: {i.category}</p>
              </div>

              <select
                value={i.status}
                onChange={(e) => handleStatusChange(i.id, e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 p-1.5 rounded-lg focus:outline-none"
              >
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Action Taken">Action Taken</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              {i.description}
            </p>

            <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/40 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-orange-400 block">Immediate Action Taken</span>
              <p className="text-orange-200">{i.immediateActionTaken}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Investigator: {i.investigator}</span>
              <span>Date: {i.incidentDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span>Log Safety / Health Incident</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Incident Headline</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Science Lab Chemical Splash, Playground Injury"
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
                    <option value="Safety & Security">Safety & Security</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Property Damage">Property Damage</option>
                    <option value="Fire Hazard">Fire Hazard</option>
                    <option value="IT Breach">IT Breach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Location On Campus</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Chemistry Lab 2, Sports Field"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Detailed Incident Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="State exact timeline, persons involved, and sequence of events..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Immediate Action Taken</label>
                <input
                  type="text"
                  value={formData.immediateActionTaken}
                  onChange={(e) => setFormData({ ...formData, immediateActionTaken: e.target.value })}
                  placeholder="e.g., First aid applied, area cordoned off, nurse notified"
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
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
