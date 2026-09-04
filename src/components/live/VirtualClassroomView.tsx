import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Presentation,
  Hand,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  ShieldCheck,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Sparkles,
  LayoutGrid,
  Radio,
  FileText,
  Volume2,
  Smile,
} from 'lucide-react';
import type {
  LiveClass,
  LiveParticipant,
  LiveClassMessage,
  LiveQuestion,
  LivePoll,
  WhiteboardStroke,
} from '../../types';
import { LiveClassWebRTCManager } from '../../services/webrtcClient';
import { liveLearningApi } from '../../services/liveLearningApi';
import { InteractiveWhiteboard } from './InteractiveWhiteboard';
import { LiveChatQuestionsDrawer } from './LiveChatQuestionsDrawer';

interface VirtualClassroomViewProps {
  liveClass: LiveClass;
  roomToken: string;
  initialSettings: { isMuted: boolean; isCameraOff: boolean; quality: string };
  onLeaveClass: () => void;
}

export const VirtualClassroomView: React.FC<VirtualClassroomViewProps> = ({
  liveClass,
  roomToken,
  initialSettings,
  onLeaveClass,
}) => {
  const [manager, setManager] = useState<LiveClassWebRTCManager | null>(null);
  const [participants, setParticipants] = useState<LiveParticipant[]>([]);
  const [messages, setMessages] = useState<LiveClassMessage[]>([]);
  const [questions, setQuestions] = useState<LiveQuestion[]>([]);
  const [polls, setPolls] = useState<LivePoll[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(initialSettings.isMuted);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(initialSettings.isCameraOff);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<'VIDEO' | 'WHITEBOARD' | 'SCREEN_SHARE'>('VIDEO');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [isRoomLocked, setIsRoomLocked] = useState<boolean>(Boolean(liveClass.isLocked));
  const [lowLightFilterEnabled, setLowLightFilterEnabled] = useState<boolean>(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState<boolean>(false);

  // Whiteboard sync state
  const [incomingStroke, setIncomingStroke] = useState<WhiteboardStroke | null>(null);
  const [whiteboardClearTrigger, setWhiteboardClearTrigger] = useState<number>(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);

  const currentUserId = localStorage.getItem('schoolsoul_user_id') || 'usr-teacher-1';
  const currentUserName = localStorage.getItem('schoolsoul_user_name') || 'Tr. Sarah Akello';
  const currentUserRole = localStorage.getItem('schoolsoul_user_role') || 'Teacher';
  const isHost = liveClass.teacherId === currentUserId || currentUserRole === 'Teacher' || currentUserRole === 'Super Administrator';

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebRTC Initialization & WebSocket binding
  useEffect(() => {
    const client = new LiveClassWebRTCManager();
    setManager(client);

    // Initial media setup
    client.acquireMediaStream({
      video: !initialSettings.isCameraOff,
      audio: !initialSettings.isMuted,
      quality: initialSettings.quality,
    }).then((stream) => {
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    client.isMuted = initialSettings.isMuted;
    client.isCameraOff = initialSettings.isCameraOff;

    // Subscriptions
    client.on('room-joined', (event, data) => {
      if (data.participants) {
        setParticipants(data.participants);
      }
    });

    client.on('peer-joined', (event, data) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.userId === data.userId)) return prev;
        return [...prev, data];
      });
    });

    client.on('peer-left', (event, data) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
    });

    client.on('participant-state-updated', (event, data) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === data.userId ? { ...p, ...data } : p))
      );
    });

    client.on('chat-message', (event, data) => {
      setMessages((prev) => [...prev, data]);
    });

    client.on('whiteboard-stroke', (event, data) => {
      setIncomingStroke(data);
    });

    client.on('whiteboard-clear', () => {
      setWhiteboardClearTrigger((prev) => prev + 1);
    });

    client.on('poll-launched', (event, data) => {
      setPolls((prev) => [data, ...prev]);
    });

    client.on('screenshare-started', (event, data) => {
      if (screenShareVideoRef.current && data.stream) {
        screenShareVideoRef.current.srcObject = data.stream;
        setActiveStage('SCREEN_SHARE');
      }
    });

    client.on('screenshare-stopped', () => {
      setIsScreenSharing(false);
      setActiveStage('VIDEO');
    });

    // Connect to room
    client.connectToRoom({
      wsEndpoint: '',
      roomId: liveClass.meetingRoomId,
      liveClassId: liveClass.id,
      token: roomToken,
      userId: currentUserId,
      userName: currentUserName,
      userRole: currentUserRole,
    });

    // Fetch initial chat and questions from API
    liveLearningApi.getLiveClassById(liveClass.id).then((fullClass: any) => {
      if (fullClass) {
        if (fullClass.questions) setQuestions(fullClass.questions);
        if (fullClass.polls) setPolls(fullClass.polls);
      }
    });

    return () => {
      client.disconnect();
    };
  }, [liveClass.id, liveClass.meetingRoomId, roomToken, initialSettings, currentUserId, currentUserName, currentUserRole]);

  const handleToggleAudio = () => {
    if (manager) {
      const muted = manager.toggleAudio();
      setIsMuted(muted);
    }
  };

  const handleToggleVideo = () => {
    if (manager) {
      const cameraOff = manager.toggleVideo();
      setIsCameraOff(cameraOff);
    }
  };

  const handleToggleScreenShare = async () => {
    if (!manager) return;
    if (isScreenSharing) {
      manager.stopScreenShare();
      setIsScreenSharing(false);
      setActiveStage('VIDEO');
    } else {
      const stream = await manager.startScreenShare();
      if (stream) {
        setIsScreenSharing(true);
        setActiveStage('SCREEN_SHARE');
        if (screenShareVideoRef.current) {
          screenShareVideoRef.current.srcObject = stream;
        }
      }
    }
  };

  const handleToggleHandRaise = () => {
    if (manager) {
      const raised = manager.toggleHandRaise();
      setIsHandRaised(raised);
    }
  };

  const triggerReaction = (emoji: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80% width
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setShowReactionPicker(false);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  const handleSendMessage = (text: string) => {
    if (manager) {
      manager.sendChatMessage(text);
    }
  };

  const handleSubmitQuestion = async (text: string) => {
    try {
      const newQ = await liveLearningApi.submitQuestion(liveClass.id, text);
      setQuestions((prev) => [newQ, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvoteQuestion = async (qId: string) => {
    try {
      await liveLearningApi.upvoteQuestion(liveClass.id, qId);
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === qId) {
            const upvotes = q.upvotes || [];
            const hasVoted = upvotes.includes(currentUserId);
            return {
              ...q,
              upvotes: hasVoted
                ? upvotes.filter((id) => id !== currentUserId)
                : [...upvotes, currentUserId],
            };
          }
          return q;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerQuestion = async (qId: string, answerText: string) => {
    try {
      await liveLearningApi.answerQuestion(liveClass.id, qId, answerText);
      setQuestions((prev) =>
        prev.map((q) => (q.id === qId ? { ...q, answerText, status: 'ANSWERED' } : q))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    try {
      await liveLearningApi.votePoll(liveClass.id, pollId, optionId);
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id === pollId) {
            const responses = p.responses?.filter((r) => r.userId !== currentUserId) || [];
            return {
              ...p,
              responses: [
                ...responses,
                { userId: currentUserId, userName: currentUserName, optionId, timestamp: new Date().toISOString() },
              ],
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePoll = async (question: string, options: string[]) => {
    try {
      const poll = await liveLearningApi.createPoll(liveClass.id, question, options);
      setPolls((prev) => [poll, ...prev]);
      if (manager) {
        manager.broadcastPollLaunched(poll);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeacherAction = (targetUserId: string, action: string, value?: any) => {
    if (!manager) return;
    if (action === 'mute') manager.muteParticipant(targetUserId);
    if (action === 'mute-all') manager.muteAllParticipants();
    if (action === 'allow-draw') manager.setParticipantDrawPermission(targetUserId, Boolean(value));
    if (action === 'lower-hand') manager.lowerStudentHand(targetUserId);
    if (action === 'kick') manager.kickParticipant(targetUserId);
  };

  const handleEndClassSession = async () => {
    if (window.confirm('Are you sure you want to end this live class session for everyone?')) {
      await liveLearningApi.endLiveClass(liveClass.id);
      onLeaveClass();
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden font-sans select-none">
      {/* 1. TOP STATUS BAR */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              LIVE
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2 truncate max-w-md">
              {liveClass.title}
              <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {liveClass.subject} • {liveClass.classGrade}
              </span>
            </h1>
          </div>
        </div>

        {/* Center Indicators */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>

          {liveClass.recordingPolicy !== 'NO_RECORDING' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/40 text-rose-400 border border-rose-800/60 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>REC</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{participants.length} Present</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Stage switchers */}
          <div className="bg-slate-800 p-0.5 rounded-xl flex items-center border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveStage('VIDEO')}
              title="Camera Stage"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                activeStage === 'VIDEO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('WHITEBOARD')}
              title="Interactive Whiteboard"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                activeStage === 'WHITEBOARD'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Presentation className="w-4 h-4" />
            </button>
          </div>

          {/* Low Light Enhancement */}
          <button
            type="button"
            onClick={() => setLowLightFilterEnabled(!lowLightFilterEnabled)}
            title="Toggle Natural Low-Light Enhancement"
            className={`p-2 rounded-xl border transition-all ${
              lowLightFilterEnabled
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`p-2 rounded-xl border relative transition-all ${
              isDrawerOpen
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {messages.length > 0 && !isDrawerOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN STAGE CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 relative flex flex-col p-3 gap-3 overflow-hidden">
          {/* A. Digital Whiteboard Stage */}
          {activeStage === 'WHITEBOARD' && (
            <div className="flex-1 relative w-full h-full">
              <InteractiveWhiteboard
                canDraw={isHost || true}
                onStrokeDrawn={(stroke) => manager?.sendWhiteboardStroke(stroke)}
                onClearBoard={() => manager?.clearWhiteboard()}
                onUndoStroke={() => manager?.undoWhiteboardStroke()}
                externalStroke={incomingStroke}
                clearTrigger={whiteboardClearTrigger}
              />

              {/* Picture-in-Picture Self Video preview in corner */}
              <div className="absolute bottom-4 right-4 w-44 aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover mirror ${
                    isCameraOff ? 'hidden' : 'block'
                  }`}
                />
                {isCameraOff && (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs font-semibold text-slate-400">
                    Camera Off
                  </div>
                )}
                <div className="absolute bottom-1 left-1.5 text-[10px] bg-slate-950/80 px-1.5 py-0.5 rounded font-medium text-white">
                  You ({currentUserName})
                </div>
              </div>
            </div>
          )}

          {/* B. Screen Share Stage */}
          {activeStage === 'SCREEN_SHARE' && (
            <div className="flex-1 relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              <video
                ref={screenShareVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-blue-600/90 text-white text-xs font-bold backdrop-blur-md flex items-center gap-2">
                <ScreenShare className="w-4 h-4" />
                <span>Broadcasting Screen</span>
              </div>
            </div>
          )}

          {/* C. Camera Grid Stage */}
          {activeStage === 'VIDEO' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
              {/* Local User Tile */}
              <div
                className={`relative rounded-2xl overflow-hidden bg-slate-900 border ${
                  !isMuted ? 'ring-2 ring-emerald-500/80' : 'border-slate-800'
                } aspect-video flex items-center justify-center shadow-lg transition-all ${
                  lowLightFilterEnabled ? 'brightness-110 contrast-105 saturate-105' : ''
                }`}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover mirror ${
                    isCameraOff ? 'hidden' : 'block'
                  }`}
                />

                {isCameraOff && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                      {currentUserName.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Camera Disabled</span>
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-semibold border border-white/10">
                  <span>{currentUserName} (You)</span>
                  {isHost && (
                    <span className="text-[9px] bg-blue-600 px-1.5 py-0.2 rounded font-bold">
                      Host
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  {isHandRaised && (
                    <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-lg animate-bounce">
                      <Hand className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`p-1.5 rounded-lg ${
                      isMuted ? 'bg-rose-600' : 'bg-emerald-600'
                    } text-white shadow`}
                  >
                    {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Remote Participants Tiles */}
              {participants
                .filter((p) => p.userId !== currentUserId)
                .map((p) => (
                  <div
                    key={p.userId}
                    className={`relative rounded-2xl overflow-hidden bg-slate-900 border ${
                      !p.isMuted ? 'ring-2 ring-emerald-500/80' : 'border-slate-800'
                    } aspect-video flex items-center justify-center shadow-lg transition-all`}
                  >
                    {p.isCameraOff ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-slate-700 text-white font-bold text-xl flex items-center justify-center shadow-md">
                          {p.userName.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{p.userName}</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={
                            p.avatar ||
                            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600`
                          }
                          alt={p.userName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-semibold border border-white/10">
                      <span>{p.userName}</span>
                      {p.isHost && (
                        <span className="text-[9px] bg-blue-600 px-1.5 py-0.2 rounded font-bold">
                          Teacher
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {p.isHandRaised && (
                        <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-lg animate-bounce">
                          <Hand className="w-4 h-4" />
                        </div>
                      )}
                      <div
                        className={`p-1.5 rounded-lg ${
                          p.isMuted ? 'bg-rose-600' : 'bg-emerald-600'
                        } text-white shadow`}
                      >
                        {p.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Floating Emoji Reactions Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            <AnimatePresence>
              {floatingReactions.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 300, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -50, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  className="absolute text-4xl"
                  style={{ left: `${r.x}%`, bottom: '80px' }}
                >
                  {r.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* 3. SIDE INTERACTIVE DRAWER */}
        <LiveChatQuestionsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          liveClass={liveClass}
          isHost={isHost}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserRole={currentUserRole}
          participants={participants}
          messages={messages}
          questions={questions}
          polls={polls}
          onSendMessage={handleSendMessage}
          onSubmitQuestion={handleSubmitQuestion}
          onUpvoteQuestion={handleUpvoteQuestion}
          onAnswerQuestion={handleAnswerQuestion}
          onVotePoll={handleVotePoll}
          onCreatePoll={handleCreatePoll}
          onTeacherAction={handleTeacherAction}
        />
      </div>

      {/* 4. BOTTOM FLOATING CONTROLS BAR */}
      <footer className="h-20 bg-slate-900/95 border-t border-slate-800/80 px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-medium">
            Room ID: <span className="font-mono text-slate-300">{liveClass.meetingRoomId}</span>
          </div>
        </div>

        {/* Core Media Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleAudio}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            className={`p-3.5 rounded-2xl transition-all font-semibold flex items-center gap-2 ${
              isMuted
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={handleToggleVideo}
            title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
            className={`p-3.5 rounded-2xl transition-all font-semibold flex items-center gap-2 ${
              isCameraOff
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            type="button"
            onClick={handleToggleScreenShare}
            title="Share Screen"
            className={`p-3.5 rounded-2xl transition-all ${
              isScreenSharing
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Digital Whiteboard Toggle */}
          <button
            type="button"
            onClick={() => setActiveStage(activeStage === 'WHITEBOARD' ? 'VIDEO' : 'WHITEBOARD')}
            title="Toggle Digital Whiteboard"
            className={`p-3.5 rounded-2xl transition-all ${
              activeStage === 'WHITEBOARD'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Presentation className="w-5 h-5" />
          </button>

          {/* Raise Hand */}
          <button
            type="button"
            onClick={handleToggleHandRaise}
            title="Raise Hand to Ask Question"
            className={`p-3.5 rounded-2xl transition-all ${
              isHandRaised
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Reaction Picker Popup */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              <Smile className="w-5 h-5" />
            </button>

            {showReactionPicker && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-1.5 z-50">
                {['👏', '👍', '❤️', '💡', '🔥', '🎉'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => triggerReaction(emoji)}
                    className="p-2 text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leave or End Session Action */}
        <div className="flex items-center gap-2">
          {isHost ? (
            <button
              type="button"
              onClick={handleEndClassSession}
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              End Lesson for All
            </button>
          ) : (
            <button
              type="button"
              onClick={onLeaveClass}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              Leave Room
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
