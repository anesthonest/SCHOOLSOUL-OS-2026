import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  UserPlus,
  Mail,
  Phone,
  DollarSign,
  Award,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { AlumniProfile } from '../../types';

export const AlumniNetworkPage: React.FC = () => {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [search, setSearch] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [gradYear, setGradYear] = useState(2020);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadAlumni();
  }, []);

  const loadAlumni = async () => {
    const data = await v9PublicEngagementApi.getAlumniList();
    setAlumni(data);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    await v9PublicEngagementApi.registerAlumni({
      name,
      graduationYear: Number(gradYear),
      currentRole: role || 'Alumni Member',
      companyOrUniversity: company || 'Industry Leader',
      email,
      phone: '+254 700 000 000',
      location: 'Nairobi, Kenya',
      isAvailableForMentorship: true,
      mentorshipTopic: 'Career Advice & Mentorship',
    });

    setName('');
    setEmail('');
    setRole('');
    setCompany('');
    setShowRegisterModal(false);
    loadAlumni();
  };

  const filteredAlumni = alumni.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.currentRole.toLowerCase().includes(search.toLowerCase()) ||
      a.companyOrUniversity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Module 9: Alumni Network Platform
            </span>
            <span className="text-xs text-slate-400">Directory & Mentorship Desk</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Alumni Association, Networking & Mentorship Hub
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Connecting former students for career mentorship, guest lectures, university guidance, and school development contributions.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Register Alumni Profile
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alumni name, profession, or company/university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Alumni Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlumni.map((alm) => (
          <div
            key={alm.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Class of {alm.graduationYear}
                </span>

                {alm.isAvailableForMentorship && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Mentorship Available
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-base font-bold text-white">{alm.name}</h2>
                <p className="text-xs text-indigo-300 font-medium">{alm.currentRole} @ {alm.companyOrUniversity}</p>
              </div>

              {alm.mentorshipTopic && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 block">Mentorship Expertise:</span>
                  <span className="text-slate-300">{alm.mentorshipTopic}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> {alm.email}
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                ${alm.totalDonated} Donated
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> Register Alumni
              </h2>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eng. Brian Kamau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Current Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Company / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Google / UoN"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
