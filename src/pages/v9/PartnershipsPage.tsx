import React, { useState, useEffect } from 'react';
import {
  Handshake,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Mail,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { Partnership } from '../../types';

export const PartnershipsPage: React.FC = () => {
  const [partners, setPartners] = useState<Partnership[]>([]);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    const data = await v9PublicEngagementApi.getPartnerships();
    setPartners(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <Handshake className="w-3.5 h-3.5" /> Module 10: Institutional Partnership Desk
            </span>
            <span className="text-xs text-slate-400">NGOs, Universities & Sponsors</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Institutional Partnerships & MoU Management
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Track strategic relationships with universities, tech foundations, research councils, and government agencies.
          </p>
        </div>
      </div>

      {/* Partnerships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {p.partnerType}
                </span>

                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {p.status}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-white">{p.organizationName}</h2>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">{p.agreementSummary}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Contact Person:</span>
                  <strong className="text-white">{p.contactPerson}</strong>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>Email:</span>
                  <span className="text-blue-300">{p.contactEmail}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> MoU Renewal Date:
              </span>
              <span className="font-bold text-white">{p.renewalDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
