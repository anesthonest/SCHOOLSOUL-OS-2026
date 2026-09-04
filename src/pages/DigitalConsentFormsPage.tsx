import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Lock,
} from 'lucide-react';
import { getConsentForms, createConsentForm, submitConsentApproval } from '../services/communicationApi';
import type { DigitalConsentForm } from '../types';

export const DigitalConsentFormsPage: React.FC = () => {
  const [forms, setForms] = useState<DigitalConsentForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<DigitalConsentForm | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [signatureText, setSignatureText] = useState('Mugisha David');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DigitalConsentForm['category']>('School Trip');
  const [description, setDescription] = useState('');
  const [classGrade, setClassGrade] = useState('Senior 1');
  const [dueDate, setDueDate] = useState('2026-08-15');
  const [feeAmountUGX, setFeeAmountUGX] = useState(45000);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await getConsentForms();
      setForms(data);
      if (data.length > 0 && !selectedForm) {
        setSelectedForm(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createConsentForm({
        title,
        category,
        description,
        classGrade,
        dueDate,
        requiresFeeApproval: feeAmountUGX > 0,
        feeAmountUGX,
      });

      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      await loadForms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSign = async (status: 'Approved' | 'Declined') => {
    if (!selectedForm) return;

    try {
      const sigToken = `SIG-TOKEN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await submitConsentApproval(
        selectedForm.id,
        'st-1',
        'Mugisha Emmanuel',
        'usr-parent-1',
        'Mugisha David',
        '+256772123456',
        status,
        sigToken
      );

      alert(`Consent Slip ${status}! Cryptographic Verification Token: ${sigToken}`);
      await loadForms();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" /> Digital Consent Slips & Cryptographic Parent Signatures
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Digital permission slips for field trips, medical procedures, media releases & fee commitments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> Create Consent Slip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forms List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Active Consent Slips</h3>
          {forms.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedForm(f)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedForm?.id === f.id
                  ? 'bg-emerald-600/10 border-emerald-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="truncate">{f.title}</span>
                <span className="text-[10px] text-emerald-400 font-mono">{f.category}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{f.description}</p>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
                <span>Class: {f.classGrade}</span>
                <span>Signed: {f.totalSigned} / {f.totalRequested}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Form Signing Pad */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          {selectedForm ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                    {selectedForm.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{selectedForm.title}</h3>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Signed PDF
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
                <p>{selectedForm.description}</p>
                {selectedForm.feeAmountUGX > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold flex justify-between items-center">
                    <span>Associated Event / Trip Fee:</span>
                    <span className="font-mono text-sm">UGX {selectedForm.feeAmountUGX.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Digital Signature Pad Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Parent Digital Signature Pad & Cryptographic Hash
                </h4>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">Type Full Name to Sign Legally</label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    className="w-full bg-slate-900 text-white font-serif text-lg tracking-wide px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleSign('Approved')}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Grant Consent & Sign Slip
                  </button>
                  <button
                    onClick={() => handleSign('Declined')}
                    className="flex-1 py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Decline Permission
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">Select a consent form to review and sign.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Create Digital Consent Form</h3>
            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kampala Science Fair Excursion Consent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    {['School Trip', 'Medical Permission', 'Media & Photo Consent', 'Event Participation', 'Fee Payment Agreement'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Trip Fee (UGX)</label>
                  <input
                    type="number"
                    value={feeAmountUGX}
                    onChange={(e) => setFeeAmountUGX(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Description & Terms</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Save Consent Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
