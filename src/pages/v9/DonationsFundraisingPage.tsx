import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Heart,
  TrendingUp,
  Award,
  CheckCircle,
  Plus,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { DonationCampaign } from '../../types';

export const DonationsFundraisingPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [donateModal, setDonateModal] = useState<DonationCampaign | null>(null);
  const [amount, setAmount] = useState(100);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const data = await v9PublicEngagementApi.getDonationCampaigns();
    setCampaigns(data);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateModal) return;

    await v9PublicEngagementApi.donateToCampaign(donateModal.id, amount);
    setDonateModal(null);
    setAmount(100);
    loadCampaigns();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Module 12: Fundraising & Sponsorship Portal
            </span>
            <span className="text-xs text-slate-400">Transparent Campaign Audits</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Infrastructure, Library & Need-Based Scholarship Campaigns
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Crowdfunding and alumni sponsorship desk supporting digital tablets, chemistry lab equipment, and tuition scholarships for vulnerable children.
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((camp) => {
          const percent = Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100));

          return (
            <div
              key={camp.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {camp.category}
                  </span>

                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {percent}% Funded
                  </span>
                </div>

                <h2 className="text-base font-bold text-white">{camp.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{camp.description}</p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-emerald-400 font-bold">
                      ${camp.raisedAmount.toLocaleString()} Raised
                    </span>
                    <span className="text-slate-400">
                      Target: ${camp.targetAmount.toLocaleString()} {camp.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> {camp.donorCount} Generous Donors
                </span>

                <button
                  onClick={() => setDonateModal(camp)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer transition shadow-lg"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Support Campaign
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Donate Modal */}
      {donateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Donate to: {donateModal.title}
              </h2>
              <button onClick={() => setDonateModal(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleDonate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select / Enter Donation Amount ($ USD)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[50, 100, 250, 500].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono ${
                        amount === amt
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={10}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Audit Receipt Guarantee:
                </span>
                <span>An automated tax-deductible receipt & acknowledgement certificate is issued to your registered email immediately.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDonateModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Confirm Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
