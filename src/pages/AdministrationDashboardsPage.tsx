import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  HeartHandshake,
  Award,
  Users,
  Building2,
  Boxes,
  Package,
  FileCheck,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface AdministrationDashboardsPageProps {
  onNavigate?: (view: string) => void;
}

export const AdministrationDashboardsPage: React.FC<AdministrationDashboardsPageProps> = ({ onNavigate }) => {
  const handleNavigate = (path: string) => {
    // strip leading slash if present for view id
    const viewId = path.startsWith('/') ? path.slice(1) : path;
    if (onNavigate) {
      onNavigate(viewId);
    }
  };

  const adminModules = [
    {
      title: 'Safeguarding Centre',
      description: 'Confidential child protection, abuse reports, risk assessments & encrypted logs.',
      icon: ShieldAlert,
      color: 'from-purple-900 to-indigo-950',
      border: 'border-purple-800/50',
      textColor: 'text-purple-400',
      path: '/safeguarding-centre',
    },
    {
      title: 'Student Welfare & Hardship',
      description: 'Track student wellbeing, financial hardship bursaries, meal subsidies & interventions.',
      icon: HeartHandshake,
      color: 'from-emerald-900 to-teal-950',
      border: 'border-emerald-800/50',
      textColor: 'text-emerald-400',
      path: '/student-welfare',
    },
    {
      title: 'Behaviour & Discipline',
      description: 'Log positive commendation points, merit awards, conduct warnings & parent SMS alerts.',
      icon: Award,
      color: 'from-amber-900 to-orange-950',
      border: 'border-amber-800/50',
      textColor: 'text-amber-400',
      path: '/behaviour-discipline',
    },
    {
      title: 'Counselling Services',
      description: 'Schedule student counseling appointments, store encrypted session notes & support plans.',
      icon: HeartPulse,
      color: 'from-sky-900 to-indigo-950',
      border: 'border-sky-800/50',
      textColor: 'text-sky-400',
      path: '/counselling-services',
    },
    {
      title: 'School Health Centre',
      description: 'Manage student sickbay records, allergies, chronic conditions & clinic visits.',
      icon: Activity,
      color: 'from-rose-900 to-red-950',
      border: 'border-rose-800/50',
      textColor: 'text-rose-400',
      path: '/school-health-centre',
    },
    {
      title: 'Incident Management',
      description: 'Log safety breaches, property damage, campus injuries & investigative actions.',
      icon: ShieldAlert,
      color: 'from-orange-900 to-amber-950',
      border: 'border-orange-800/50',
      textColor: 'text-orange-400',
      path: '/incident-management',
    },
    {
      title: 'Staff HR & Directory',
      description: 'Central employee master files, contract records, NSSF/TIN numbers & qualifications.',
      icon: Users,
      color: 'from-blue-900 to-indigo-950',
      border: 'border-blue-800/50',
      textColor: 'text-blue-400',
      path: '/staff-hr',
    },
    {
      title: 'Staff Leave & Absence',
      description: 'Apply for leave, assign relief staff coverage, and manage headteacher approvals.',
      icon: Building2,
      color: 'from-teal-900 to-emerald-950',
      border: 'border-teal-800/50',
      textColor: 'text-teal-400',
      path: '/staff-leave',
    },
    {
      title: 'Staff Appraisals',
      description: 'Conduct termly teacher evaluations, pedagogical quality scoring & target setting.',
      icon: Award,
      color: 'from-indigo-900 to-purple-950',
      border: 'border-indigo-800/50',
      textColor: 'text-indigo-400',
      path: '/staff-appraisals',
    },
    {
      title: 'Staff CPD & Training',
      description: 'Track teacher professional development hours, Ministry certificates & skills.',
      icon: FileCheck,
      color: 'from-violet-900 to-purple-950',
      border: 'border-violet-800/50',
      textColor: 'text-violet-400',
      path: '/staff-cpd',
    },
    {
      title: 'Asset Management',
      description: 'Track campus physical infrastructure, vehicles, computers & maintenance logs.',
      icon: Boxes,
      color: 'from-cyan-900 to-blue-950',
      border: 'border-cyan-800/50',
      textColor: 'text-cyan-400',
      path: '/asset-management',
    },
    {
      title: 'Inventory & Stores',
      description: 'Manage stationery, exam reams, lab chemicals, reorder levels & stock issuance.',
      icon: Package,
      color: 'from-emerald-900 to-teal-950',
      border: 'border-emerald-800/50',
      textColor: 'text-emerald-400',
      path: '/inventory-management',
    },
    {
      title: 'Policy & Document Centre',
      description: 'Board-approved policies, MoES guidelines, staff codes & read acknowledgments.',
      icon: FileCheck,
      color: 'from-purple-900 to-indigo-950',
      border: 'border-purple-800/50',
      textColor: 'text-purple-400',
      path: '/policy-centre',
    },
    {
      title: 'School Administration',
      description: 'Term preparation checklists, UNEB registration milestones & Board resolutions.',
      icon: Building2,
      color: 'from-indigo-900 to-blue-950',
      border: 'border-indigo-800/50',
      textColor: 'text-indigo-400',
      path: '/school-administration',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-purple-800/50 text-white shadow-xl">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
          <LayoutDashboard className="w-4 h-4" />
          <span>SchoolSoul Administration & Governance Hub</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Executive Administration Dashboard</h1>
        <p className="text-xs text-slate-300 max-w-2xl mt-1">
          Access all 16 modules of Vision 7: Safeguarding, Welfare, Behaviour, Counselling, Sickbay, Incidents, HR, Leave, Appraisals, CPD, Assets, Stores, Policies, and Administration.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminModules.map((m) => {
          const IconComponent = m.icon;
          return (
            <div
              key={m.title}
              onClick={() => handleNavigate(m.path)}
              className={`p-5 rounded-2xl bg-gradient-to-br ${m.color} border ${m.border} text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-all space-y-3`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 ${m.textColor}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
                  Open Engine
                </span>
              </div>

              <div>
                <h3 className="font-black text-base text-white">{m.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{m.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
