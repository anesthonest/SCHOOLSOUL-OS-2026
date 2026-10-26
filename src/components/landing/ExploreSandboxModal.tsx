import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Lock,
  UserPlus,
  BookOpen,
  CreditCard,
  WifiOff,
  Layers,
  Sparkles,
  School,
  X,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';

interface ExploreSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToAuth: (initialTab?: 'LOGIN' | 'REGISTER' | 'STATUS') => void;
  onGoToRegisterSchool?: () => void;
}

export const ExploreSandboxModal: React.FC<ExploreSandboxModalProps> = ({
  isOpen,
  onClose,
  onGoToAuth,
  onGoToRegisterSchool,
}) => {
  const [selectedStation, setSelectedStation] = useState<number>(0);

  const stations = [
    {
      title: '1. Executive Leadership Cockpit',
      icon: <School className="w-5 h-5 text-blue-600" />,
      tagline: 'Complete visibility into daily school attendance, enrollment, and safeguarding',
      description:
        'Headteachers and principals get an instant overview of school health every morning. Real-time metrics show student attendance rates, pending staff join requests, safeguarding incidents, and daily fee collections.',
      highlights: [
        'Live student and teacher attendance gauges',
        'Confidential incident logging with audit trails',
        'Ministry of Education & Board-ready reporting export',
      ],
    },
    {
      title: '2. CBC Marksheets & Formative Rubrics',
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      tagline: 'Continuous assessment grading made fast, intuitive, and error-free',
      description:
        'Teachers enter formative marks, competency observations, and summative exam scores with zero spreadsheet headache. Native support for Kenya CBC, Uganda CBC/UNEB, and international scales.',
      highlights: [
        'Automated 4-level competency calculation (Exceeding, Meeting, Approaching, Below)',
        'One-click report card PDF generator with custom school crest',
        'Learner Skills & Opportunity Passport tracking',
      ],
    },
    {
      title: '3. Automated Fees & Pesapal Settlements',
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      tagline: 'Instant mobile money reconciliation with zero cash leakages',
      description:
        'Parents pay fees directly through MTN Mobile Money, Airtel Money, or credit cards via Pesapal. Receipts generate automatically via SMS and WhatsApp, and student fee ledgers reconcile immediately.',
      highlights: [
        'Pesapal production payment gateway integrated',
        'Automated student statement generation and fee clearance certificates',
        'Departmental budgeting and petty cash requisition controls',
      ],
    },
    {
      title: '4. 100% Offline-First Local LAN Engine',
      icon: <WifiOff className="w-5 h-5 text-cyan-600" />,
      tagline: 'Work without internet bundles, fiber cables, or cloud servers',
      description:
        'SchoolSoul OS stores all records in browser IndexedDB. Teachers take attendance and grade offline. If running on a local Wi-Fi router, multiple devices synchronize over the local network without consuming internet bundles.',
      highlights: [
        '30-day offline commercial licensing grace window',
        'Automatic delta sync upon reconnection',
        'Zero data hostage guarantee: full CSV and JSON archive export anytime',
      ],
    },
  ];

  const current = stations[selectedStation];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Explore SchoolSoul OS Architecture"
      maxWidth="2xl"
      id="explore-sandbox-modal"
    >
      <div className="space-y-5 text-slate-900 dark:text-slate-100">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Take a quick guided tour through the core stations of the School Operating System:
        </p>

        {/* Station Navigation Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stations.map((st, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedStation(idx)}
              className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                selectedStation === idx
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="block truncate">{st.title}</span>
            </button>
          ))}
        </div>

        {/* Active Station Detail Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              {current.icon}
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {current.title}
              </h4>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                {current.tagline}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Key Capabilities:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {current.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Back to Overview
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onGoToAuth('LOGIN');
              }}
              iconLeading={<Lock className="w-3.5 h-3.5" />}
            >
              Sign In
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                if (onGoToRegisterSchool) onGoToRegisterSchool();
                else onGoToAuth('REGISTER');
              }}
              iconTrailing={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Register School
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
