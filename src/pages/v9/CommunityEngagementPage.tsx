import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  Calendar,
  CheckCircle,
  MapPin,
  Sparkles,
  Award,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { CommunityActivity } from '../../types';

export const CommunityEngagementPage: React.FC = () => {
  const [activities, setActivities] = useState<CommunityActivity[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    const data = await v9PublicEngagementApi.getCommunityActivities();
    setActivities(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> Module 11: Community Engagement & Outreach
            </span>
            <span className="text-xs text-slate-400">Parent Volunteer & Eco Campaigns</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Community Engagement, Volunteering & Social Impact
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Coordinating parent volunteers, career talks, environmental tree planting drives, and local community charity projects.
          </p>
        </div>
      </div>

      {/* Community Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities.map((act) => (
          <div
            key={act.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {act.type}
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {act.status}
                </span>
              </div>

              <h2 className="text-base font-bold text-white">{act.title}</h2>

              <div className="space-y-1 text-xs text-slate-300">
                <p className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Location: {act.location}
                </p>
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Scheduled Date: {act.date}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <Users className="w-3.5 h-3.5" /> {act.participantsCount} Volunteer Participants
              </span>
              <span className="text-slate-500 text-[11px]">Coordinator: {act.coordinator}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
