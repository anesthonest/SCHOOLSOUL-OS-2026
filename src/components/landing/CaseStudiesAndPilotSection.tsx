import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  WifiOff,
  BookOpen,
  Award,
  ChevronRight,
  School,
  FileCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface CaseStudyItem {
  id: string;
  schoolName: string;
  country: string;
  schoolType: 'Primary' | 'Secondary' | 'Mixed Day & Boarding' | 'International' | 'Multi-Campus';
  challenge: string;
  implementation: string;
  modules: string[];
  results: string[];
  quote?: {
    text: string;
    author: string;
    role: string;
  };
  images?: string[];
  isVerified: boolean;
}

// Strictly verified case studies repository — empty until authenticated customer reviews are completed
export const VERIFIED_CASE_STUDIES: CaseStudyItem[] = [
  // Future verified pilot cohort studies will be added here once audited
];

interface CaseStudiesAndPilotSectionProps {
  onRequestPilot: () => void;
  onExploreFeatures: () => void;
}

export const CaseStudiesAndPilotSection: React.FC<CaseStudiesAndPilotSectionProps> = ({
  onRequestPilot,
  onExploreFeatures,
}) => {
  const [activePilotTab, setActivePilotTab] = useState<'pilot' | 'framework'>('pilot');

  return (
    <section id="pilot-program" className="py-10 sm:py-14 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for East African Schools · Pilot Program 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Engineered for African Classrooms, Power Outages &amp; Complex Fee Rails
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            SchoolSoul OS partners with primary, secondary, and multi-campus institutions across Uganda, Kenya, Tanzania, and Rwanda for our 2026 Deployment Cohort.
          </p>
        </div>

        {/* Pilot Program Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Zero-Risk Institutional Deployment
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Selected pilot schools receive full enterprise capacity setup, staff onboarding workshops, and local LAN server installation without upfront subscription commitments.
            </p>
            <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>30-day full unrestricted trial</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Direct engineering support channel</span>
              </li>
            </ul>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Complete National Curriculum Alignment
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Custom marksheets for Kenya CBC (KICD competency rubrics), Uganda UNEB / NCDC (Lower Secondary &amp; Primary), and Tanzania NECTA divisions.
            </p>
            <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Automated student report card generation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Term-by-term learner progression graphs</span>
              </li>
            </ul>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Resilient Local LAN Mesh
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Keep attendance, marks, and fee payments running when internet drops. Peer-to-peer sync when connection resumes.
            </p>
            <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Works on low-cost Wi-Fi routers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero data hostage encrypted export</span>
              </li>
            </ul>
          </div>
        </div>

        {/* If no verified studies exist yet, display the transparent Pilot Cohort Application callout */}
        {VERIFIED_CASE_STUDIES.length === 0 ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authentic Operational Governance</span>
              </div>
              <h3 className="text-base sm:text-lg font-black">
                Join the 2026 East African Pilot Cohort
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Be among the pioneering schools leading the digital modernization of African education.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={onRequestPilot}
                className="w-full sm:w-auto justify-center min-h-[44px] text-xs font-bold"
                iconTrailing={<ArrowRight className="w-4 h-4" />}
              >
                Apply for Pilot Program
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExploreFeatures}
                className="w-full sm:w-auto justify-center min-h-[44px] text-xs font-bold text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                Explore Modules
              </Button>
            </div>
          </div>
        ) : (
          /* Reusable Case Studies Grid (Active once verified studies are published) */
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Verified Implementation Case Studies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VERIFIED_CASE_STUDIES.map((cs) => (
                <div
                  key={cs.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {cs.schoolName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {cs.country} · {cs.schoolType}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Verified Case Study
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Challenge: </span>
                      <span className="text-slate-600 dark:text-slate-400">{cs.challenge}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Implementation: </span>
                      <span className="text-slate-600 dark:text-slate-400">{cs.implementation}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Measurable Results:
                    </span>
                    <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      {cs.results.map((res, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {cs.quote && (
                    <blockquote className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-l-4 border-blue-500 text-xs italic text-slate-600 dark:text-slate-300">
                      "{cs.quote.text}"
                      <footer className="text-[10px] not-italic font-bold text-slate-800 dark:text-slate-200 mt-1">
                        — {cs.quote.author}, {cs.quote.role}
                      </footer>
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
