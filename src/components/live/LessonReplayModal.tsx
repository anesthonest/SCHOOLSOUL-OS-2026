import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  RotateCw,
  FileText,
  Download,
  X,
  Clock,
  User,
  BookOpen,
  Subtitles,
  ShieldCheck,
} from 'lucide-react';
import type { LiveClass } from '../../types';

interface LessonReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass;
}

export const LessonReplayModal: React.FC<LessonReplayModalProps> = ({
  isOpen,
  onClose,
  liveClass,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(liveClass.recordingDurationSeconds || 3600);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Recorded Classroom Archive
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {liveClass.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player + Controls */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1">
          {/* Main Video Screen */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group">
              <video
                ref={videoRef}
                src={
                  liveClass.recordingUrl ||
                  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                }
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
              />

              {/* Subtitles Overlay */}
              {captionsEnabled && isPlaying && (
                <div className="absolute bottom-16 left-6 right-6 text-center pointer-events-none">
                  <span className="inline-block bg-black/80 text-white px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-md">
                    [Live Transcription]: Understanding electromagnetic flux and core transformer equations...
                  </span>
                </div>
              )}

              {/* Center Play/Pause Overlay Button */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                >
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </button>
              )}
            </div>

            {/* Custom Media Bar */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              {/* Seekbar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-mono text-slate-500">{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      captionsEnabled
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="Toggle AI Subtitles"
                  >
                    <Subtitles className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        playbackRate === speed
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lesson Metadata & Attached Resources */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lesson Details
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subject</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {liveClass.subject}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Class Grade</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {liveClass.classGrade} {liveClass.stream ? `(${liveClass.stream})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Host Teacher</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {liveClass.teacherName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date Delivered</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {liveClass.scheduledDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Attached Lesson Materials */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Downloadable Materials ({liveClass.materials?.length || 0})
              </h4>
              {(!liveClass.materials || liveClass.materials.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No files attached to this session.</p>
              ) : (
                <div className="space-y-2">
                  {liveClass.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {mat.title}
                        </span>
                      </div>
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
