import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Search,
  Filter,
  AlertTriangle,
  Lightbulb,
  Bug,
  HelpCircle,
  Clock,
  CheckCircle,
  RefreshCw,
  Eye,
  Shield,
  Activity,
  ChevronRight,
  Send,
} from 'lucide-react';
import {
  fetchSystemFeedback,
  updateFeedbackStatus,
  submitSystemFeedback,
  resolveAllFeedbackIncidents,
  FeedbackItem,
} from '../services/feedbackApi';

export const AdminFeedbackCentrePage: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkResolving, setBulkResolving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  // New Feedback Modal Form
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<FeedbackItem['category']>('BUG_REPORT');
  const [newPriority, setNewPriority] = useState<FeedbackItem['priority']>('MEDIUM');
  const [newModule, setNewModule] = useState('Academic Passport');
  const [submitting, setSubmitting] = useState(false);

  // Status transition state
  const [targetStatus, setTargetStatus] = useState<FeedbackItem['status']>('IN_REVIEW');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemFeedback({
        status: statusFilter,
        category: categoryFilter,
      });
      setFeedbackList(data);
      if (selectedItem) {
        const refreshed = data.find((i) => i.id === selectedItem.id);
        if (refreshed) setSelectedItem(refreshed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setUpdatingStatus(true);
    try {
      const res = await updateFeedbackStatus(selectedItem.id, targetStatus, resolutionNotes);
      if (res.success) {
        setResolutionNotes('');
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await submitSystemFeedback({
        title: newTitle,
        message: newMessage,
        category: newCategory as any,
        priority: newPriority as any,
        affectedModule: newModule,
      });
      if (res.success) {
        setShowSubmitModal(false);
        setNewTitle('');
        setNewMessage('');
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveAllFeedback = async () => {
    setBulkResolving(true);
    try {
      await resolveAllFeedbackIncidents('Resolved by administrator during system health audit');
      await loadData();
    } catch (err) {
      console.error('Resolve all feedback failed:', err);
    } finally {
      setBulkResolving(false);
    }
  };

  const filtered = feedbackList.filter((f) => {
    const q = searchQuery.toLowerCase();
    const title = f.title || '';
    const msg = f.message || '';
    const user = f.username || '';
    const mod = f.affectedModule || '';
    return (
      title.toLowerCase().includes(q) ||
      msg.toLowerCase().includes(q) ||
      user.toLowerCase().includes(q) ||
      mod.toLowerCase().includes(q)
    );
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'BUG_REPORT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
            <Bug className="w-3 h-3" /> Bug Report
          </span>
        );
      case 'FEATURE_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
            <Lightbulb className="w-3 h-3" /> Feature
          </span>
        );
      case 'PERFORMANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            <Activity className="w-3 h-3" /> Performance
          </span>
        );
      case 'USABILITY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
            <HelpCircle className="w-3 h-3" /> Usability
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {cat}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">New</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">In Review</span>;
      case 'INVESTIGATING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">Investigating</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">Resolved</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquarePlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            System Feedback & Incident Resolution Centre
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Centrally triage bug reports, user suggestions, performance complaints, and module improvement tickets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="refresh-feedback-btn"
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {feedbackList.some((f) => f.status !== 'RESOLVED' && f.status !== 'CLOSED') && (
            <button
              id="resolve-all-feedback-btn"
              onClick={handleResolveAllFeedback}
              disabled={bulkResolving}
              className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {bulkResolving ? 'Resolving...' : 'Resolve All Active'}
            </button>
          )}

          <button
            id="open-feedback-modal-btn"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Submit Feedback / Bug
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="feedback-search-input"
            type="text"
            placeholder="Search tickets by title, user, module or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            id="category-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="BUG_REPORT">Bug Reports</option>
            <option value="FEATURE_REQUEST">Feature Requests</option>
            <option value="SUGGESTION">Suggestions</option>
            <option value="COMPLAINT">Complaints</option>
            <option value="USABILITY">Usability</option>
            <option value="PERFORMANCE">Performance</option>
          </select>
        </div>
      </div>

      {/* Master Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Feedback Tickets ({filtered.length})
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              Loading feedback items...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              No feedback items found matching filter criteria.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setTargetStatus(item.status);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedItem?.id === item.id
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500/50 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{item.id}</span>
                  {getStatusBadge(item.status)}
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                  {item.title}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.message}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {item.username} ({item.submittingRole})
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedItem.id}
                    </span>
                    {getCategoryBadge(selectedItem.category)}
                    {getStatusBadge(selectedItem.status)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedItem.title}
                  </h3>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div>Module: <strong className="text-slate-700 dark:text-slate-200">{selectedItem.affectedModule}</strong></div>
                  <div>Priority: <strong className="text-slate-700 dark:text-slate-200">{selectedItem.priority}</strong></div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  User Description & Findings
                </label>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.message}
                </div>
              </div>

              {/* Technical Context if present */}
              {selectedItem.technicalContext && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Diagnostic & Client Context
                  </label>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
                    <div>User Agent: {selectedItem.technicalContext.userAgent || 'N/A'}</div>
                    <div>Screen Resolution: {selectedItem.technicalContext.screenResolution || 'N/A'}</div>
                    <div>URL Path: {selectedItem.technicalContext.urlPath || 'N/A'}</div>
                    <div>Network: {selectedItem.technicalContext.networkStatus || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* Status Update & Resolution Form */}
              <form onSubmit={handleStatusUpdate} className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-3">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" /> Administrative Triage & Status Update
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      New Status
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as any)}
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:outline-none"
                    >
                      <option value="NEW">New</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="INVESTIGATING">Investigating</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      Resolution / Audit Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patch deployed in v7.4.0, verified fixed."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {updatingStatus ? 'Updating...' : 'Save Triage & Transition'}
                  </button>
                </div>
              </form>

              {/* Audit History */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Timeline & Audit History
                </label>
                <div className="space-y-2">
                  {selectedItem.auditHistory?.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{h.action}</span>
                        <span className="text-slate-400 text-[11px]"> by {h.performedBy} on {new Date(h.timestamp).toLocaleString()}</span>
                        {h.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">{h.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Select a feedback ticket from the left panel to review diagnostics, inspect audit history, and transition triage status.
            </div>
          )}
        </div>
      </div>

      {/* Modal for Submitting New Feedback */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
                Submit Technical Feedback / Bug Report
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="BUG_REPORT">Bug Report</option>
                    <option value="FEATURE_REQUEST">Feature Request</option>
                    <option value="SUGGESTION">General Suggestion</option>
                    <option value="COMPLAINT">Complaint</option>
                    <option value="USABILITY">Usability Problem</option>
                    <option value="PERFORMANCE">Performance Issue</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical (System Blocker)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Affected Module</label>
                <select
                  value={newModule}
                  onChange={(e) => setNewModule(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="Academic Passport">Academic Passport</option>
                  <option value="Fee Management & Billing">Fee Management & Billing</option>
                  <option value="Attendance & Operations">Attendance & Operations</option>
                  <option value="CBC Continuous Assessment">CBC Continuous Assessment</option>
                  <option value="Digital ID & Gate Security">Digital ID & Gate Security</option>
                  <option value="Marketplace & Canteen">Marketplace & Canteen</option>
                  <option value="Policy & Compliance Centre">Policy & Compliance Centre</option>
                  <option value="Staff Management & HR">Staff Management & HR</option>
                  <option value="Offline Sync & Storage">Offline Sync & Storage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Summary Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Receipt export fails on iOS Safari"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Detailed Findings & Reproduction Steps</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what occurred, steps to reproduce, and expected outcome..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
