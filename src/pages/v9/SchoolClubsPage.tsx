import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Calendar,
  Sparkles,
  CheckCircle,
  Clock,
  Shield,
  Layers,
  Search,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { SchoolClub } from '../../types';

export const SchoolClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<SchoolClub[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    const data = await v9PublicEngagementApi.getClubs();
    setClubs(data);
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patronName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Module 4: School Clubs & Extracurricular Hub
            </span>
            <span className="text-xs text-slate-400">Membership & Activity Roster</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            School Clubs, Societies & Extracurricular Activities
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Managing club registrations, patron oversight, student leadership, meeting schedules, inter-school competitions, and achievements.
          </p>
        </div>
      </div>

      {/* Search Control */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clubs, patrons, or categories (e.g. Debate, Science, Agri)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClubs.map((club) => (
          <div
            key={club.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {club.category}
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {club.status}
                </span>
              </div>

              <h2 className="text-base font-bold text-white">{club.name}</h2>

              <div className="space-y-1 text-xs text-slate-300 pt-1">
                <p><strong>Faculty Patron:</strong> {club.patronName}</p>
                <p><strong>Student Leader:</strong> {club.studentLeader}</p>
                <p className="flex items-center gap-1 text-slate-400 text-[11px] pt-1">
                  <Clock className="w-3 h-3 text-teal-400" /> Meetings: {club.meetingSchedule}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-teal-400" /> {club.memberCount} Members
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Award className="w-3.5 h-3.5" /> {club.achievementsCount} Honors
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-purple-300">
                <strong className="text-slate-300 block">Upcoming Event:</strong>
                {club.upcomingEvent}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
