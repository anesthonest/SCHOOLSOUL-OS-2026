import React, { useState, useEffect } from 'react';
import {
  Award,
  Star,
  Shield,
  Medal,
  CheckCircle,
  Plus,
  Sparkles,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { RecognitionAward } from '../../types';

export const RecognitionAwardsPage: React.FC = () => {
  const [awards, setAwards] = useState<RecognitionAward[]>([]);

  useEffect(() => {
    loadAwards();
  }, []);

  const loadAwards = async () => {
    const data = await v9PublicEngagementApi.getRecognitionAwards();
    setAwards(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Module 14: Recognition & Honor Engine
            </span>
            <span className="text-xs text-slate-400">Merit Badges & Annual Honors</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Student & Faculty Recognition Engine
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Issuing digital merit badges, Star Innovator shields, and community service honors displayed across student digital portfolios and public spotlights.
          </p>
        </div>
      </div>

      {/* Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {awards.map((awd) => (
          <div
            key={awd.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl flex items-start gap-4 hover:border-slate-700 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Star className="w-6 h-6" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {awd.badgeType}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{awd.issuedDate}</span>
              </div>

              <h2 className="text-base font-bold text-white">{awd.awardTitle}</h2>
              <p className="text-xs text-amber-300 font-medium">Recipient: {awd.recipientName} ({awd.recipientRole})</p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">{awd.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
