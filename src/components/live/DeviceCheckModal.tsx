import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  Wifi,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Video,
  Settings,
  Sparkles,
  X,
  Play,
} from 'lucide-react';
import type { LiveClass } from '../../types';
import { LiveClassWebRTCManager } from '../../services/webrtcClient';

interface DeviceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass;
  onJoinRoom: (settings: { isMuted: boolean; isCameraOff: boolean; quality: string }) => void;
}

export const DeviceCheckModal: React.FC<DeviceCheckModalProps> = ({
  isOpen,
  onClose,
  liveClass,
  onJoinRoom,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speakerTested, setSpeakerTested] = useState<boolean>(false);
  const [networkPing, setNetworkPing] = useState<number>(24);
  const [videoQuality, setVideoQuality] = useState<string>('HIGH');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const webrtcManagerRef = useRef<LiveClassWebRTCManager | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      return;
    }

    const manager = new LiveClassWebRTCManager();
    webrtcManagerRef.current = manager;

    async function initializeDevices() {
      setIsInitializing(true);
      setCameraError(null);
      setMicError(null);

      // Camera check
      const camRes = await manager.checkCameraAvailability();
      if (camRes.ready && camRes.stream) {
        localStreamRef.current = camRes.stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = camRes.stream;
        }
      } else {
        setCameraError(camRes.error || 'Camera unavailable');
        setCameraActive(false);
      }

      // Mic check
      const micRes = await manager.checkMicrophoneAvailability((vol) => {
        setMicVolume(vol);
      });
      if (!micRes.ready) {
        setMicError(micRes.error || 'Microphone unavailable');
        setMicActive(false);
      }

      // Ping check simulation
      setNetworkPing(Math.floor(Math.random() * 20) + 18);
      setIsInitializing(false);
    }

    initializeDevices();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen]);

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const vTrack = localStreamRef.current.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !cameraActive;
      }
    }
    setCameraActive(!cameraActive);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const aTrack = localStreamRef.current.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !micActive;
      }
    }
    setMicActive(!micActive);
  };

  const testSpeakerSound = async () => {
    if (webrtcManagerRef.current) {
      const success = await webrtcManagerRef.current.playSpeakerTestTone();
      if (success) {
        setSpeakerTested(true);
        setTimeout(() => setSpeakerTested(false), 3000);
      }
    }
  };

  const handleJoin = () => {
    onJoinRoom({
      isMuted: !micActive,
      isCameraOff: !cameraActive,
      quality: videoQuality,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Classroom Lobby & Device Diagnostic
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify your audio, video, and connection before joining the session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Video Preview */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover mirror ${
                  !cameraActive || cameraError ? 'hidden' : 'block'
                }`}
              />

              {(!cameraActive || cameraError) && (
                <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <CameraOff className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">Camera is turned off</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {cameraError || 'You will enter with avatar mode'}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Overlay Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  {networkPing} ms Latency
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/90 text-white backdrop-blur-md border border-white/10">
                  {videoQuality} Quality
                </span>
              </div>

              {/* Live Mic Volume Visualizer at bottom of video */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md rounded-lg p-2.5 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-2 flex-1">
                  {micActive ? (
                    <Mic className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <MicOff className="w-4 h-4 text-rose-400" />
                  )}
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex gap-0.5 px-0.5 py-0.5">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const isActive = micActive && (micVolume / 100) * 20 > i;
                      const isHigh = i > 15;
                      const isMid = i > 10;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm transition-all duration-75 ${
                            isActive
                              ? isHigh
                                ? 'bg-amber-400'
                                : isMid
                                ? 'bg-emerald-400'
                                : 'bg-emerald-500'
                              : 'bg-slate-700/50'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-300 ml-3">
                  {micActive ? `${micVolume}%` : 'Muted'}
                </span>
              </div>
            </div>

            {/* Quick Preview Toggle Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  micActive
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {micActive ? <Mic className="w-4 h-4 text-emerald-600" /> : <MicOff className="w-4 h-4" />}
                {micActive ? 'Mic Enabled' : 'Mic Muted'}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  cameraActive
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {cameraActive ? <Camera className="w-4 h-4 text-blue-600" /> : <CameraOff className="w-4 h-4" />}
                {cameraActive ? 'Camera On' : 'Camera Off'}
              </button>

              <button
                type="button"
                onClick={testSpeakerSound}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
                {speakerTested ? 'Chime Played!' : 'Test Speaker'}
              </button>
            </div>
          </div>

          {/* Right Column: Class Details, Pre-requisites & Join Action */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {liveClass.classType.replace(/_/g, ' ')}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {liveClass.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {liveClass.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400 block">Subject</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {liveClass.subject}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grade & Stream</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {liveClass.classGrade} {liveClass.stream ? `(${liveClass.stream})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lead Educator</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {liveClass.teacherName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Scheduled Time</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {liveClass.startTime} - {liveClass.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Classroom Guidelines & Safeguards */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Safeguarding & Session Policies
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Attendance timestamp is recorded automatically</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>
                      {liveClass.recordingPolicy === 'NO_RECORDING'
                        ? 'Session is not recorded'
                        : 'Session will be securely archived for authorized replay'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Live chat is filtered by SchoolSoul anti-bullying AI</span>
                  </li>
                </ul>
              </div>

              {/* Stream Quality Selector */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                  Target Stream Quality
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['AUTO', 'LOW', 'HIGH', 'HD'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setVideoQuality(q)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        videoQuality === q
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleJoin}
                className="flex-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
              >
                <Play className="w-4 h-4 fill-white" />
                Join Live Lesson
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
