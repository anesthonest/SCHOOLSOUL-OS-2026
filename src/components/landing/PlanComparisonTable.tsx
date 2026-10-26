import React from 'react';
import { Check, Minus, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface PlanComparisonTableProps {
  onSelectPlan: (planId: string) => void;
}

export const PlanComparisonTable: React.FC<PlanComparisonTableProps> = ({ onSelectPlan }) => {
  const comparisonRows = [
    {
      category: 'Core Capacity & Operations',
      features: [
        { name: 'Student Enrollment Limit', starter: 'Up to 300 Students', standard: 'Up to 2,000 Students', enterprise: 'Unlimited / Multi-Campus' },
        { name: 'Staff & Teacher User Accounts', starter: 'Unlimited', standard: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Parent & Guardian Portal Access', starter: 'Included', standard: 'Included', enterprise: 'Included' },
        { name: 'School Logo & Letterhead Customization', starter: true, standard: true, enterprise: true },
        { name: 'Multi-Campus Central Management', starter: false, standard: false, enterprise: true },
      ],
    },
    {
      category: 'Academics & Curricula',
      features: [
        { name: 'CBC Competency-Based Gradebook', starter: true, standard: true, enterprise: true },
        { name: 'UNEB / KNEC / NECTA National Scales', starter: true, standard: true, enterprise: true },
        { name: 'Custom Curricula (Cambridge / IB)', starter: false, standard: true, enterprise: true },
        { name: 'Automated PDF Report Card Generation', starter: true, standard: true, enterprise: true },
        { name: 'Weekly Timetable Generation Engine', starter: true, standard: true, enterprise: true },
        { name: 'Opportunity & Skills Student Passport', starter: false, standard: true, enterprise: true },
      ],
    },
    {
      category: 'Finance & Payments',
      features: [
        { name: 'Student Fee Structure Management', starter: true, standard: true, enterprise: true },
        { name: 'Pesapal Online Payment Integration', starter: true, standard: true, enterprise: true },
        { name: 'MTN & Airtel MoMo Direct Reconciliation', starter: true, standard: true, enterprise: true },
        { name: 'Institutional Budgeting & Vouchers', starter: false, standard: true, enterprise: true },
        { name: 'Bank Slip Reconciliation & Multi-Currency', starter: false, standard: true, enterprise: true },
      ],
    },
    {
      category: 'Offline Resilience & Security',
      features: [
        { name: '100% Offline IndexedDB Data Storage', starter: true, standard: true, enterprise: true },
        { name: 'Local Wi-Fi LAN Sync (No Internet)', starter: true, standard: true, enterprise: true },
        { name: '30-Day Offline Commercial License', starter: true, standard: true, enterprise: true },
        { name: 'One-Click Full School Archive Export', starter: true, standard: true, enterprise: true },
        { name: 'Dedicated On-Premise School Server Setup', starter: false, standard: false, enterprise: true },
        { name: 'Priority 24/7 SLA & Dedicated Specialist', starter: false, standard: false, enterprise: true },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Detailed Plan Feature Comparison
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Compare specifications side-by-side to choose the ideal deployment tier for your school.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
              <th className="p-4 sm:p-5 font-bold text-slate-900 dark:text-slate-100 w-2/5">
                Feature / Capability
              </th>
              <th className="p-4 sm:p-5 text-center font-bold text-slate-900 dark:text-slate-100 w-1/5">
                <span className="block text-sm">Foundation</span>
                <span className="text-[10px] text-slate-500 font-normal">Growing Schools</span>
              </th>
              <th className="p-4 sm:p-5 text-center font-bold text-blue-600 dark:text-blue-400 w-1/5 bg-blue-50/50 dark:bg-blue-950/20">
                <span className="block text-sm">Professional</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">Most Popular</span>
              </th>
              <th className="p-4 sm:p-5 text-center font-bold text-slate-900 dark:text-slate-100 w-1/5">
                <span className="block text-sm">Enterprise</span>
                <span className="text-[10px] text-slate-500 font-normal">Multi-Campus & Groups</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((cat, idx) => (
              <React.Fragment key={idx}>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800">
                  <td colSpan={4} className="p-3 font-extrabold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {cat.category}
                  </td>
                </tr>
                {cat.features.map((feat, fIdx) => (
                  <tr
                    key={fIdx}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition"
                  >
                    <td className="p-3.5 sm:p-4 text-slate-800 dark:text-slate-200 font-medium">
                      {feat.name}
                    </td>

                    {/* Starter */}
                    <td className="p-3.5 sm:p-4 text-center">
                      {typeof feat.starter === 'boolean' ? (
                        feat.starter ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{feat.starter}</span>
                      )}
                    </td>

                    {/* Standard */}
                    <td className="p-3.5 sm:p-4 text-center bg-blue-50/30 dark:bg-blue-950/10">
                      {typeof feat.standard === 'boolean' ? (
                        feat.standard ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="font-bold text-blue-700 dark:text-blue-300">{feat.standard}</span>
                      )}
                    </td>

                    {/* Enterprise */}
                    <td className="p-3.5 sm:p-4 text-center">
                      {typeof feat.enterprise === 'boolean' ? (
                        feat.enterprise ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="font-bold text-slate-900 dark:text-slate-100">{feat.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
