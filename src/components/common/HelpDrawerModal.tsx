import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Keyboard,
  Wifi,
  Search,
  ExternalLink,
  Shield,
  LifeBuoy,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';

interface HelpDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayOnboarding: () => void;
  onNavigate: (view: string) => void;
}

export const HelpDrawerModal: React.FC<HelpDrawerModalProps> = ({
  isOpen,
  onClose,
  onReplayOnboarding,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const topics = [
    {
      title: 'Grading & CBC Continuous Assessments',
      desc: 'How to score learner activities of integration and export UNEB-ready marksheets.',
      view: 'teacher-gradebook',
    },
    {
      title: 'Fee Collection & Mobile Money',
      desc: 'Reconciling MTN/Airtel MoMo and Pesapal transactions with student accounts.',
      view: 'payment-processing',
    },
    {
      title: 'Daily Attendance Registers',
      desc: 'Taking classroom or gate biometric attendance and triggering parent SMS alerts.',
      view: 'student-attendance',
    },
    {
      title: 'Offline LAN Mode & Synchronization',
      desc: 'How local changes are safely queued and synchronized with the central database.',
      view: 'backup',
    },
    {
      title: 'Official School User Guide Book',
      desc: 'Read the comprehensive 2026.1.0 institutional operations handbook.',
      view: 'user-guide',
    },
  ];

  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SchoolSoul OS Help & Quick Reference"
      maxWidth="lg"
      id="help-drawer-modal"
    >
      <div className="space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search operational guides and procedures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl px-3.5 py-2.5 pl-9 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        {/* Keyboard Shortcuts Strip */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Keyboard className="w-4 h-4 text-blue-600" />
            <span>Power Keyboard Shortcuts</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">
                Ctrl + K
              </kbd>
              <span>Command Palette</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">
                Esc
              </kbd>
              <span>Close Active Modal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">
                Tab
              </kbd>
              <span>Accessible Focus</span>
            </div>
          </div>
        </div>

        {/* Topic Links */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Common Operations
          </h4>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredTopics.map((topic, index) => (
              <div
                key={index}
                onClick={() => {
                  onClose();
                  onNavigate(topic.view);
                }}
                className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-xs"
              >
                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{topic.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {topic.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Replay Onboarding Tour */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onReplayOnboarding();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Role Onboarding Checklist</span>
          </button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
