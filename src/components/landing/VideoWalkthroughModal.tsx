import React, { useState } from 'react';
import { Play, Clock, Sparkles, AlertCircle, Video, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';

interface VideoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToRegisterSchool?: () => void;
}

export const VideoWalkthroughModal: React.FC<VideoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onGoToRegisterSchool,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const storylineFlow = [
    {
      time: '0:00 – 0:15',
      title: '1. The Problem',
      summary: 'Paper registers, recurring power cuts, and manual fee leakage across East African schools.',
    },
    {
      time: '0:15 – 0:35',
      title: '2. SchoolSoul OS Overview',
      summary: 'Unified School Operating System engineered by VINEXSAH TECHNOLOGIES.',
    },
    {
      time: '0:35 – 0:55',
      title: '3. Core Workflows & CBC Gradebook',
      summary: 'Formative scoring, UNEB/KNEC/NECTA alignment, and automated student report cards.',
    },
    {
      time: '0:55 – 1:15',
      title: '4. Offline-First & Local LAN Mesh',
      summary: 'Sub-second operations with zero internet and client-side cryptographic persistence.',
    },
    {
      time: '1:15 – 1:35',
      title: '5. Mobile Money & Pesapal Settlement',
      summary: 'MTN & Airtel MoMo automated reconciliation with instantaneous digital receipts.',
    },
    {
      time: '1:35 – 1:50',
      title: '6. Security & Tenant Privacy',
      summary: 'Row-level cryptographic school partitioning and local encrypted backup archives.',
    },
    {
      time: '1:50 – 2:00',
      title: '7. Call to Action',
      summary: 'Immediate onboarding with 30-day unrestricted trial and PWA standalone install.',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SchoolSoul OS Product Walkthrough (90s Overview)"
      maxWidth="2xl"
      id="video-walkthrough-modal"
    >
      <div className="space-y-4 text-slate-900 dark:text-slate-100">
        {/* Video Player Canvas with Genuine 'Coming Soon' State */}
        <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-5 shadow-xl text-white">
          <div className="flex items-center justify-between z-10">
            <span className="px-2.5 py-1 rounded-md bg-blue-600/80 backdrop-blur-xs font-mono text-[10px] font-bold uppercase tracking-wider">
              Walkthrough Architecture · 60–120s
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Product demo coming soon
            </span>
          </div>

          <div className="text-center my-auto z-10 space-y-3 px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <Video className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-white">
                Official Video Production in Progress
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                The high-definition video walkthrough is being produced for release. In the meantime, explore the interactive storyboard and sandbox below.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Full Run Duration: 2 Minutes (120s)</span>
            </div>
          </div>

          {/* Controls Bar Placeholder */}
          <div className="z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono text-slate-300">VINEXSAH TECHNOLOGIES</span>
            <span>Target Audio: English / Swahili Track Options</span>
          </div>
        </div>

        {/* Storyboard Flow */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Walkthrough Storyboard Flow (60–120s)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              7 Chapters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {storylineFlow.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer ${
                  activeStep === idx
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{step.title}</span>
                  <span className="font-mono text-[10px] text-slate-400">{step.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {step.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {onGoToRegisterSchool && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onGoToRegisterSchool();
              }}
            >
              Start 30-Day Free Trial
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
