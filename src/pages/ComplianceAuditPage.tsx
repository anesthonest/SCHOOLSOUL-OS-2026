import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building,
  Award,
  Users,
  Lock,
} from 'lucide-react';

export const ComplianceAuditPage: React.FC = () => {
  const complianceChecklist = [
    {
      title: 'Ugandan Ministry of Education & Sports (MoES) Registration',
      status: 'Fully Compliant',
      ref: 'MoES/REG/2024/8812',
      details: 'All licensing, site plans, and syllabus approvals verified.',
      color: 'emerald',
    },
    {
      title: 'UNEB Examination Centre License (UCE & UACE)',
      status: 'Active & Verified',
      ref: 'UNEB-U-1082',
      details: 'Strict candidate verification, security vaults, and invigilator protocols active.',
      color: 'emerald',
    },
    {
      title: 'Child Safeguarding & Protection Framework',
      status: 'Audited & Active',
      ref: 'SG-2026-UG',
      details: 'Encrypted case logs, trained senior woman teacher, emergency escalation active.',
      color: 'purple',
    },
    {
      title: 'Staff NSSF & URA Tax Compliance',
      status: 'Fully Compliant',
      ref: 'NSSF-UG-882190',
      details: 'All teaching & support staff registered for statutory NSSF and PAYE deductions.',
      color: 'emerald',
    },
    {
      title: 'Sickbay & Health Centre Sanitation Standards',
      status: 'Inspected',
      ref: 'MOH-KCCA-2026',
      details: 'Full-time licensed nurse present, emergency medication stock inspected.',
      color: 'sky',
    },
    {
      title: 'Fire Safety & Emergency Evacuation Plan',
      status: 'Annual Renewal Due',
      ref: 'POL-FIRE-002',
      details: 'Fire extinguishers serviced; student dormitory evacuation drill scheduled.',
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-emerald-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>SchoolSoul Regulatory, Audit & Legal Compliance Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Compliance & Audit Centre</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Comprehensive audit readiness dashboard tracking Ministry of Education standards, UNEB centre licenses, tax compliance, fire safety, and child protection regulations.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-bold text-xs">
          Overall Readiness: 98.6%
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complianceChecklist.map((c) => (
          <div key={c.title} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400">{c.ref}</span>
                <h3 className="text-base font-bold text-white mt-1">{c.title}</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> {c.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {c.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
