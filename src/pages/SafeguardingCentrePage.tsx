import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Plus,
  Filter,
  Lock,
  UserCheck,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  Eye,
  Send,
  Shield,
  Upload,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { SafeguardingCase, SafeguardingCaseNote } from '../types';
import { useAuth } from '../context/AuthContext';

export const SafeguardingCentrePage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [cases, setCases] = useState<SafeguardingCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCase, setSelectedCase] = useState<SafeguardingCase | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isNoteConfidential, setIsNoteConfidential] = useState<boolean>(true);

  // New Case Form state
  const [formData, setFormData] = useState({
    studentId: 'STU-1002',
    studentName: 'Amina Kigozi',
    classGrade: 'Senior 3 Blue',
    category: 'Child Protection' as SafeguardingCase['category'],
    severity: 'High' as SafeguardingCase['severity'],
    reportedBy: user?.fullName || 'Senior Woman Teacher',
    assignedTo: 'Mugisha Patrick (Safeguarding Lead)',
    description: '',
    externalReferralOrg: '',
  });

  const isAuthorised = activeRole === 'Headteacher' || activeRole === 'Deputy Headteacher' || activeRole === 'School Nurse' || activeRole === 'Administrator';

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    const data = await v7Api.getSafeguardingCases();
    setCases(data);
    if (data.length > 0 && !selectedCase) {
      setSelectedCase(data[0]);
    }
    setLoading(false);
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    const created = await v7Api.saveSafeguardingCase({
      ...formData,
      status: 'Open',
      confidentialNotes: [
        {
          id: `n-${Date.now()}`,
          authorName: user?.fullName || 'Safeguarding Officer',
          authorRole: activeRole || 'Safeguarding Lead',
          note: `Case initialized: ${formData.description}`,
          isConfidential: true,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
    });

    setCases([created, ...cases]);
    setSelectedCase(created);
    setShowNewModal(false);
    setFormData({
      studentId: 'STU-1002',
      studentName: 'Amina Kigozi',
      classGrade: 'Senior 3 Blue',
      category: 'Child Protection',
      severity: 'High',
      reportedBy: user?.fullName || 'Senior Woman Teacher',
      assignedTo: 'Mugisha Patrick (Safeguarding Lead)',
      description: '',
      externalReferralOrg: '',
    });
  };

  const handleAddCaseNote = async () => {
    if (!selectedCase || !newNoteText.trim()) return;

    const newNote: SafeguardingCaseNote = {
      id: `note-${Date.now()}`,
      authorName: user?.fullName || 'Authorized Staff',
      authorRole: activeRole || 'Staff Member',
      note: newNoteText.trim(),
      isConfidential: isNoteConfidential,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const updatedNotes = [...selectedCase.confidentialNotes, newNote];
    const updatedCase = await v7Api.saveSafeguardingCase({
      ...selectedCase,
      confidentialNotes: updatedNotes,
    });

    setCases(cases.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    setSelectedCase(updatedCase);
    setNewNoteText('');
  };

  const handleUpdateStatus = async (newStatus: SafeguardingCase['status']) => {
    if (!selectedCase) return;
    const updated = await v7Api.saveSafeguardingCase({
      ...selectedCase,
      status: newStatus,
    });
    setCases(cases.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCase(updated);
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.classGrade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!isAuthorised) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 my-8 max-w-2xl mx-auto">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Strict Safeguarding Access Restrictions</h2>
        <p className="text-sm text-slate-400">
          Safeguarding and child protection records are encrypted and restricted exclusively to designated Safeguarding Officers, Headteachers, and Counselors under the SchoolSoul Child Safeguarding Framework.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-purple-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>SchoolSoul Safeguarding & Child Protection Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Safeguarding Centre</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Confidential case management, child protection referrals, risk assessment escalations, and strict audit trails compliant with Ugandan Ministry guidelines.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Safeguarding Concern</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Active Cases</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{cases.filter((c) => c.status !== 'Closed').length}</p>
          <p className="text-[10px] text-purple-400 font-medium mt-1">Requires active oversight</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Under Investigation</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            {cases.filter((c) => c.status === 'Under Investigation').length}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Active evidence gathering</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Escalated / Referred</span>
            <ExternalLink className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">
            {cases.filter((c) => c.status === 'Escalated' || c.status === 'Referred').length}
          </p>
          <p className="text-[10px] text-rose-400 font-medium mt-1">Ministry or Police notified</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Resolved / Closed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {cases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length}
          </p>
          <p className="text-[10px] text-emerald-400 font-medium mt-1">Safety plan implemented</p>
        </div>
      </div>

      {/* Main Grid: Case List vs Detailed Case View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Search & Filter Case List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search case #, student name, class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 p-2 rounded-lg focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Child Protection">Child Protection</option>
                <option value="Neglect">Neglect</option>
                <option value="Physical Abuse">Physical Abuse</option>
                <option value="Bullying">Bullying</option>
                <option value="Online Safety">Online Safety</option>
                <option value="Mental Health">Mental Health</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 p-2 rounded-lg focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* List Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-purple-400">{c.caseNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.severity === 'Critical'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : c.severity === 'High'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.severity} Priority
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{c.studentName}</h3>
                  <p className="text-xs text-slate-400">{c.classGrade}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded text-[10px] border border-slate-800">
                      {c.category}
                    </span>
                    <span
                      className={`font-semibold ${
                        c.status === 'Resolved' || c.status === 'Closed'
                          ? 'text-emerald-400'
                          : c.status === 'Under Investigation'
                          ? 'text-amber-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Case Workspace & Confidential Log */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-400">{selectedCase.caseNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-800">
                      {selectedCase.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedCase.studentName}</h2>
                  <p className="text-xs text-slate-400">{selectedCase.classGrade} • ID: {selectedCase.studentId}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCase.status}
                    onChange={(e) => handleUpdateStatus(e.target.value as any)}
                    className="bg-slate-950 border border-purple-600/50 text-xs text-purple-300 font-semibold p-2 rounded-xl focus:outline-none"
                  >
                    <option value="Open">Status: Open</option>
                    <option value="Under Investigation">Status: Under Investigation</option>
                    <option value="Escalated">Status: Escalated</option>
                    <option value="Referred">Status: Referred</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="Closed">Status: Closed</option>
                  </select>
                </div>
              </div>

              {/* Case Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Reported By</span>
                  <span className="font-semibold text-slate-200">{selectedCase.reportedBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Assigned Officer</span>
                  <span className="font-semibold text-purple-400">{selectedCase.assignedTo}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Date Reported</span>
                  <span className="font-semibold text-slate-200">{selectedCase.createdAt}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Initial Incident Statement</h4>
                <p className="text-xs text-slate-200 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  {selectedCase.description}
                </p>
              </div>

              {/* External Referral Info */}
              {selectedCase.externalReferralOrg && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-3 text-xs text-rose-300">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold block">External Authority Referral:</span>
                    <span>{selectedCase.externalReferralOrg}</span>
                  </div>
                </div>
              )}

              {/* Confidential Notes & Case Timeline */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Confidential Case Notes ({selectedCase.confidentialNotes.length})</span>
                  </h4>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedCase.confidentialNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-purple-400">{note.authorName} ({note.authorRole})</span>
                        <span className="text-slate-500">{note.createdAt}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{note.note}</p>
                    </div>
                  ))}
                </div>

                {/* Add Confidential Note Box */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <textarea
                    rows={2}
                    placeholder="Enter confidential observation, interview notes, or action taken..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={isNoteConfidential}
                        onChange={(e) => setIsNoteConfidential(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-0"
                      />
                      <span>Encrypt & Mark Confidential</span>
                    </label>

                    <button
                      onClick={handleAddCaseNote}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Add Note</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
              <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Select a safeguarding case from the list to review details and notes.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Safeguarding Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
                <span>New Safeguarding Report</span>
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Student Name & Grade</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    placeholder="Student Name"
                    required
                  />
                  <input
                    type="text"
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                    placeholder="Class / Grade"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="Child Protection">Child Protection</option>
                    <option value="Neglect">Neglect</option>
                    <option value="Physical Abuse">Physical Abuse</option>
                    <option value="Emotional Abuse">Emotional Abuse</option>
                    <option value="Bullying">Bullying</option>
                    <option value="Online Safety">Online Safety</option>
                    <option value="Mental Health">Mental Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Severity / Urgency</label>
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
                <label className="block text-slate-400 font-semibold mb-1">Description of Concern / Disclosure</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide objective facts regarding observed behavior, statements, or signs..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">External Authority Referral (Optional)</label>
                <input
                  type="text"
                  value={formData.externalReferralOrg}
                  onChange={(e) => setFormData({ ...formData, externalReferralOrg: e.target.value })}
                  placeholder="e.g., Kampala Ministry of Gender or Police Child Protection Unit"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Submit Safeguarding Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
