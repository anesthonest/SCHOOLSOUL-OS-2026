import React, { useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Volume2, Shield, Sparkles } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    { title: '1. School Setup & Profile', duration: '02:14', summary: 'Configuring school legal details, crest, and term dates.' },
    { title: '2. Offline QR Attendance', duration: '03:40', summary: 'Scanning student ID badges locally with sub-second response.' },
    { title: '3. CBC Continuous Marksheets', duration: '04:12', summary: 'Entering formative marks, rubrics, and automated report cards.' },
    { title: '4. Fees & Pesapal Payments', duration: '03:15', summary: 'Mobile money fee collection, receipts, and ledger reconciliation.' },
    { title: '5. Local LAN & Offline Recovery', duration: '02:50', summary: 'Operating with zero internet and recovering through power cuts.' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SchoolSoul OS 2026.1.0 Institutional Walkthrough"
      maxWidth="2xl"
      id="video-walkthrough-modal"
    >
      <div className="space-y-4 text-slate-900 dark:text-slate-100">
        {/* Interactive Video Player Canvas Mock */}
        <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-xl text-white">
          <div className="flex items-center justify-between z-10">
            <span className="px-2.5 py-1 rounded-md bg-blue-600/80 backdrop-blur-xs font-mono text-[10px] font-bold uppercase tracking-wider">
              Official Product Demonstration
            </span>
            <span className="text-xs text-slate-400 font-mono">
              HD · 1080p
            </span>
          </div>

          <div className="text-center my-auto z-10 space-y-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/50 cursor-pointer transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <p className="text-sm font-extrabold tracking-tight">
              {chapters[activeChapter].title}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {chapters[activeChapter].summary}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="z-10 space-y-2">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((activeChapter + 1) / chapters.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Chapter {activeChapter + 1} of {chapters.length} ({chapters[activeChapter].duration})
              </span>
              <span className="text-slate-300 font-medium">VINEXSAH TECHNOLOGIES</span>
            </div>
          </div>
        </div>

        {/* Chapter Index */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Walkthrough Index
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveChapter(idx);
                  setIsPlaying(true);
                }}
                className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer flex items-center justify-between ${
                  activeChapter === idx
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{ch.title}</span>
                <span className="font-mono text-[10px] text-slate-400">{ch.duration}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {onGoToRegisterSchool && (
            <Button variant="primary" size="sm" onClick={() => { onClose(); onGoToRegisterSchool(); }}>
              Start 30-Day Free Trial
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
