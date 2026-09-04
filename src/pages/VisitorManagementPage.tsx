import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  UserCheck,
  Clock,
  ShieldCheck,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  Building2,
  Phone,
  Trash2,
} from 'lucide-react';
import {
  fetchVisitors,
  checkInVisitor,
  checkOutVisitor,
  deleteVisitorRecord,
  seedSampleAttendanceDataIfEmpty,
} from '../services/attendanceApi';
import type { VisitorRecord } from '../types';

export const VisitorManagementPage: React.FC = () => {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Checked In' | 'Checked Out'>('All');

  // Check-in modal
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [form, setForm] = useState({
    visitorName: '',
    phone: '',
    nationalId: '',
    organisation: '',
    personToVisit: '',
    purpose: '',
  });

  // Selected visitor for pass preview
  const [selectedVisitorForPass, setSelectedVisitorForPass] = useState<VisitorRecord | null>(null);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      await seedSampleAttendanceDataIfEmpty();
      const list = await fetchVisitors();
      setVisitors(list);
    } catch (e) {
      console.error('Failed to load visitors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visitorName || !form.personToVisit) {
      alert('Visitor name and person to visit are required');
      return;
    }

    const newVis = await checkInVisitor(form, 'usr-gate-1', 'Gate Security - John');
    setShowCheckInModal(false);
    setForm({
      visitorName: '',
      phone: '',
      nationalId: '',
      organisation: '',
      personToVisit: '',
      purpose: '',
    });
    setSelectedVisitorForPass(newVis);
    await loadVisitors();
  };

  const handleCheckOut = async (id: string) => {
    await checkOutVisitor(id, 'usr-gate-1', 'Gate Security - John');
    await loadVisitors();
  };

  const handleDeleteVisitor = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the visitor log for "${name}"?`)) {
      await deleteVisitorRecord(id, 'usr-gate-1', 'Gate Security - John');
      await loadVisitors();
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.personToVisit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-amber-700 font-semibold mb-1">
            <UserPlus className="w-4 h-4" />
            <span>Daily Operations – Module 4</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Visitor Management & Gate Security</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Log school guests, issue visitor badges, track duration on premises, and enforce security entry protocols
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Visitor Check-In
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          {(['All', 'Checked In', 'Checked Out'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === st ? 'bg-white text-amber-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search visitor, badge, or host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Visitors List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading visitors log...</div>
        ) : filteredVisitors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-700">No visitor records matching query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Badge #</th>
                  <th className="py-3 px-4">Visitor & Contact</th>
                  <th className="py-3 px-4">Host / Person to Visit</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Check-In / Out</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredVisitors.map((vis) => (
                  <tr key={vis.id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-900">{vis.badgeNumber}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{vis.visitorName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {vis.phone || 'No phone'} · {vis.organisation || 'Private Guest'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-800">{vis.personToVisit}</td>

                    <td className="py-3.5 px-4 text-xs text-gray-600 max-w-xs">{vis.purpose}</td>

                    <td className="py-3.5 px-4 text-xs font-mono">
                      <div>In: <span className="font-bold text-gray-900">{vis.checkInTime}</span></div>
                      {vis.checkOutTime && <div>Out: <span className="font-bold text-gray-500">{vis.checkOutTime}</span></div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          vis.status === 'Checked In'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {vis.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedVisitorForPass(vis)}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        Print Pass
                      </button>

                      {vis.status === 'Checked In' && (
                        <button
                          onClick={() => handleCheckOut(vis.id)}
                          className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
                        >
                          Check Out
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteVisitor(vis.id, vis.visitorName)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 inline-flex items-center"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visitor Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Gate Security Visitor Check-In</h3>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.visitorName}
                  onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                  placeholder="e.g. Eng. Tumusiime Godfrey"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+256 700 000000"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">National ID (NIN)</label>
                  <input
                    type="text"
                    value={form.nationalId}
                    onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                    placeholder="CM840..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Organisation</label>
                  <input
                    type="text"
                    value={form.organisation}
                    onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                    placeholder="e.g. MoES / Parent"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Host / Person to Visit *</label>
                  <input
                    type="text"
                    required
                    value={form.personToVisit}
                    onChange={(e) => setForm({ ...form, personToVisit: e.target.value })}
                    placeholder="e.g. Headteacher"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Purpose of Visit</label>
                <textarea
                  rows={2}
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="e.g. Infrastructure Inspection / Fee Clarification"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  Check In & Issue Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Pass Badge Preview Modal */}
      {selectedVisitorForPass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center">
            <div className="border-b pb-4 mb-4">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">SCHOOLSOUL GATE PASS</span>
              <h3 className="font-extrabold text-gray-900 text-lg">VISITOR BADGE</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">BADGE NO: {selectedVisitorForPass.badgeNumber}</p>
            </div>

            <div className="py-2 space-y-1 text-left bg-amber-50 p-3 rounded-xl border border-amber-100 mb-4">
              <p className="text-xs"><span className="font-bold text-gray-700">Visitor:</span> {selectedVisitorForPass.visitorName}</p>
              <p className="text-xs"><span className="font-bold text-gray-700">Host:</span> {selectedVisitorForPass.personToVisit}</p>
              <p className="text-xs"><span className="font-bold text-gray-700">Check-In:</span> {selectedVisitorForPass.checkInTime} ({selectedVisitorForPass.date})</p>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setSelectedVisitorForPass(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
