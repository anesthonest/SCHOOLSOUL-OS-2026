import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Award,
  Cpu,
  Users,
  ShoppingBag,
  Globe,
  Newspaper,
  Image,
  GraduationCap,
  Handshake,
  Heart,
  DollarSign,
  Palette,
  BarChart3,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  WifiOff,
  Database,
} from 'lucide-react';

interface V9PublicEngagementHubPageProps {
  onNavigate: (view: string) => void;
}

export const V9PublicEngagementHubPage: React.FC<V9PublicEngagementHubPageProps> = ({
  onNavigate,
}) => {
  const [offlineSyncing, setOfflineSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const modules = [
    {
      id: 'v9-student-voice',
      title: '1. Student Voice & Proposals',
      description: 'Ideas, articles, science projects, and school improvement proposals with teacher review workflows.',
      icon: MessageSquare,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Student Agency',
    },
    {
      id: 'v9-student-portfolio',
      title: '2. Student Digital Portfolio',
      description: 'Lifetime digital portfolio auto-compiling achievements, badges, certificates, skills, and recommendations.',
      icon: Award,
      color: 'from-blue-600 to-cyan-600',
      badge: 'Digital CV',
    },
    {
      id: 'v9-innovation-hub',
      title: '3. Innovation Hub & STEM Incubator',
      description: 'STEM, Robotics, Agriculture, and ICT project team management, milestone tracking, and Demo Days.',
      icon: Cpu,
      color: 'from-indigo-600 to-purple-600',
      badge: 'FabLab & STEM',
    },
    {
      id: 'v9-school-clubs',
      title: '4. School Clubs & Societies',
      description: 'Extracurricular club rosters, patron oversight, meeting schedules, and inter-school achievements.',
      icon: Users,
      color: 'from-teal-600 to-emerald-600',
      badge: 'Societies',
    },
    {
      id: 'v9-student-marketplace',
      title: '5. Moderated Student Marketplace',
      description: 'Showcasing student-made crafts, organic honey, and technology prototypes under school bursar supervision.',
      icon: ShoppingBag,
      color: 'from-amber-600 to-orange-600',
      badge: 'Enterprise',
    },
    {
      id: 'v9-public-website',
      title: '6. Public Website CMS Manager',
      description: 'No-code website content management, hero banners, admissions notice, and live website preview.',
      icon: Globe,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Public Portal',
    },
    {
      id: 'v9-news-media',
      title: '7. News & Media Centre',
      description: 'Publishing official press releases, success stories, academic announcements, and student spotlights.',
      icon: Newspaper,
      color: 'from-pink-600 to-rose-600',
      badge: 'Press Desk',
    },
    {
      id: 'v9-school-gallery',
      title: '8. School Gallery & Photo Archives',
      description: 'Media photo albums with child safeguarding privacy checks and configurable consent rules.',
      icon: Image,
      color: 'from-cyan-600 to-blue-600',
      badge: 'Privacy Guard',
    },
    {
      id: 'v9-alumni-network',
      title: '9. Alumni Network & Directory',
      description: 'Directory of former students, graduation archives, career updates, and mentorship registration.',
      icon: GraduationCap,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Alumni Network',
    },
    {
      id: 'v9-partnerships',
      title: '10. Institutional Partnership Desk',
      description: 'Managing relationships with NGOs, universities, corporates, and sponsors with MoU renewal alerts.',
      icon: Handshake,
      color: 'from-blue-600 to-teal-600',
      badge: 'MoU & Grants',
    },
    {
      id: 'v9-community-engagement',
      title: '11. Community Outreach & Volunteers',
      description: 'Parent volunteering programs, career talks, environmental tree planting, and local charity drives.',
      icon: Heart,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Social Impact',
    },
    {
      id: 'v9-donations-fundraising',
      title: '12. Donations & Sponsorship Portal',
      description: 'Fundraising drives for digital library tablets, science labs, and need-based student scholarships.',
      icon: DollarSign,
      color: 'from-emerald-600 to-blue-600',
      badge: 'Fundraising',
    },
    {
      id: 'v9-brand-management',
      title: '13. School Brand Identity',
      description: 'Official logos, color palettes, report headers, and certificate styling across SchoolSoul.',
      icon: Palette,
      color: 'from-purple-600 to-pink-600',
      badge: 'Brand Identity',
    },
    {
      id: 'v9-recognition-awards',
      title: '14. Recognition & Honor Engine',
      description: 'Merit badges, Star Innovator shields, and community honors displayed in portfolios.',
      icon: Award,
      color: 'from-amber-600 to-yellow-600',
      badge: 'Honors',
    },
    {
      id: 'v9-public-analytics',
      title: '15. Public Engagement Analytics',
      description: 'Website visitor stats, admission lead tracking, alumni engagement, and fundraising performance.',
      icon: BarChart3,
      color: 'from-blue-600 to-purple-600',
      badge: 'Executive Stats',
    },
  ];

  const handleOfflineSync = () => {
    setOfflineSyncing(true);
    setSyncStatus('Synchronizing offline drafts and media queue with central database...');
    setTimeout(() => {
      setOfflineSyncing(false);
      setSyncStatus('All offline drafts, student portfolios, and marketplace orders synced seamlessly! Zero data loss.');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 border border-purple-800/60 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /> Vision 9 Master Module
          </span>
          <span className="text-xs font-mono text-slate-400">VINEXSAH TECHNOLOGIES • SchoolSoul V9</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Student Voice, Innovation Hub, Marketplace & Public Engagement
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Connecting SchoolSoul with the world! Showcasing authentic student innovation, empowering student voice, providing student digital portfolios, managing an enterprise marketplace, and driving alumni and community engagement under strict safeguarding.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('v9-student-voice')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg"
          >
            Launch Student Voice <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('v9-public-website')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg"
          >
            Manage Public Website <Globe className="w-4 h-4" />
          </button>

          <button
            onClick={handleOfflineSync}
            disabled={offlineSyncing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <WifiOff className="w-4 h-4 text-amber-400" /> {offlineSyncing ? 'Syncing Offline Queue...' : 'Trigger Offline Background Sync (Module 16)'}
          </button>
        </div>

        {syncStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {syncStatus}
          </div>
        )}
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" /> Vision 9 Core Functional Sub-Systems
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-3 shadow-lg group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                    {mod.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end text-xs font-bold text-purple-400 group-hover:underline">
                  Open Sub-System <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Safeguarding Panel (Modules 16 - 18) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" /> Child Safeguarding, Moderation & Offline Engine (Modules 16–18)
          </h3>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active Safeguards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white block font-bold">Module 16 — Offline Sync Engine</strong>
            <p className="text-slate-400 text-[11px]">Supports offline drafting of articles, portfolios, and marketplace orders with automatic conflict resolution upon reconnection.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white block font-bold">Module 17 — Teacher Moderation Guard</strong>
            <p className="text-slate-400 text-[11px]">100% of student voice proposals, media uploads, and marketplace products require faculty approval before going public.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white block font-bold">Module 18 — Production Performance</strong>
            <p className="text-slate-400 text-[11px]">Optimized for low-bandwidth rural networks with automated media compression and mobile-first design.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
