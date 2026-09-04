import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Radio,
  Calendar,
  Clock,
  Users,
  Play,
  Plus,
  Sparkles,
  BookOpen,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Layers,
  Settings,
  Download,
  Award,
  Shield,
  Eye,
} from 'lucide-react';
import type { LiveClass, MediaItem, LiveClassAttendanceRecord } from '../types';
import { liveLearningApi } from '../services/liveLearningApi';
import { DeviceCheckModal } from '../components/live/DeviceCheckModal';
import { VirtualClassroomView } from '../components/live/VirtualClassroomView';
import { CreateLiveClassModal } from '../components/live/CreateLiveClassModal';
import { MediaQualityEngineModal } from '../components/live/MediaQualityEngineModal';
import { LessonReplayModal } from '../components/live/LessonReplayModal';

export const LiveLearningPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'MY_CLASSES' | 'RECORDINGS' | 'MEDIA_STUDIO' | 'ANALYTICS'>('UPCOMING');
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<LiveClassAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Modals state
  const [selectedClassForJoin, setSelectedClassForJoin] = useState<LiveClass | null>(null);
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(false);
  const [activeLiveSession, setActiveLiveSession] = useState<{
    liveClass: LiveClass;
    roomToken: string;
    settings: { isMuted: boolean; isCameraOff: boolean; quality: string };
  } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isMediaStudioOpen, setIsMediaStudioOpen] = useState<boolean>(false);
  const [selectedRecordingForReplay, setSelectedRecordingForReplay] = useState<LiveClass | null>(null);

  const currentUserRole = localStorage.getItem('schoolsoul_user_role') || 'Teacher';
  const currentUserId = localStorage.getItem('schoolsoul_user_id') || 'usr-teacher-1';
  const isTeacherOrAdmin = ['Super Administrator', 'Teacher', 'Headteacher', 'Administrator'].includes(currentUserRole);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedClasses, fetchedMedia] = await Promise.all([
        liveLearningApi.getLiveClasses(),
        liveLearningApi.getMediaGallery(),
      ]);
      setClasses(fetchedClasses);
      setMediaItems(fetchedMedia);
    } catch (err) {
      console.error('Error loading live learning data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartOrJoinLobby = (cls: LiveClass) => {
    setSelectedClassForJoin(cls);
    setIsLobbyOpen(true);
  };

  const handleConfirmJoinFromLobby = async (settings: { isMuted: boolean; isCameraOff: boolean; quality: string }) => {
    if (!selectedClassForJoin) return;
    try {
      // If host and status is SCHEDULED, set to LIVE
      if (isTeacherOrAdmin && selectedClassForJoin.status === 'SCHEDULED') {
        await liveLearningApi.startLiveClass(selectedClassForJoin.id);
      }

      const joinData = await liveLearningApi.joinLiveClass(selectedClassForJoin.id);
      setIsLobbyOpen(false);
      setActiveLiveSession({
        liveClass: joinData.liveClass,
        roomToken: joinData.token,
        settings,
      });
    } catch (err: any) {
      alert(`Could not enter classroom: ${err.message}`);
    }
  };

  const handleLeaveClassroom = () => {
    if (activeLiveSession) {
      liveLearningApi.leaveLiveClass(activeLiveSession.liveClass.id);
    }
    setActiveLiveSession(null);
    loadData();
  };

  // Filter classes
  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.classGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'ALL' || c.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const ongoingClasses = filteredClasses.filter((c) => c.status === 'LIVE');
  const upcomingClasses = filteredClasses.filter((c) => c.status === 'SCHEDULED');
  const recordedClasses = filteredClasses.filter((c) => c.status === 'COMPLETED' && c.recordingStatus === 'READY');

  // If in an active live session, render the full virtual classroom
  if (activeLiveSession) {
    return (
      <VirtualClassroomView
        liveClass={activeLiveSession.liveClass}
        roomToken={activeLiveSession.roomToken}
        initialSettings={activeLiveSession.settings}
        onLeaveClass={handleLeaveClassroom}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background subtle geometric elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>High-Definition WebRTC Virtual Classroom Ecosystem</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Live Learning & Virtual Classroom
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Conduct interactive real-time video lessons, collaborative digital whiteboards, live polls, Q&A, and professional media calibration directly inside SchoolSoul.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMediaStudioOpen(true)}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Media Studio
          </button>

          {isTeacherOrAdmin && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:translate-y-[-1px]"
            >
              <Plus className="w-4 h-4" />
              Schedule Live Lesson
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {classes.filter((c) => c.status === 'LIVE').length}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live Now</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {classes.filter((c) => c.status === 'SCHEDULED').length}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Upcoming Today</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {classes.filter((c) => c.recordingStatus === 'READY').length}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recorded Library</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {mediaItems.length}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Calibrated Media</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('UPCOMING')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'UPCOMING'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Live & Upcoming Lessons ({ongoingClasses.length + upcomingClasses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RECORDINGS')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'RECORDINGS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Recorded Lesson Archives ({recordedClasses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MEDIA_STUDIO')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'MEDIA_STUDIO'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Media Quality Studio ({mediaItems.length})</span>
        </button>
      </div>

      {/* 4. Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons, subject, teacher..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
          {['ALL', 'Physics', 'Mathematics', 'Biology', 'Chemistry', 'English Language'].map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedSubject === subj
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* 5. TAB 1: LIVE & UPCOMING LESSONS */}
      {activeTab === 'UPCOMING' && (
        <div className="space-y-6">
          {/* Ongoing Live Lessons Section */}
          {ongoingClasses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Broadcasting Live Right Now
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ongoingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/5 via-white to-slate-50 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 border-2 border-rose-500/40 dark:border-rose-500/30 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500 text-white animate-pulse">
                          LIVE SESSION
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {cls.classGrade} ({cls.stream || 'All'})
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {cls.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {cls.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {cls.teacherName.charAt(0)}
                          </div>
                          <span>{cls.teacherName}</span>
                        </div>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {cls.subject}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartOrJoinLobby(cls)}
                        className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02]"
                      >
                        <Video className="w-4 h-4" />
                        Enter Live Classroom
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Upcoming Lessons Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scheduled Lessons
            </h2>

            {upcomingClasses.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  No upcoming lessons scheduled
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Teachers can schedule interactive live lessons anytime.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                          {cls.classType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {cls.classGrade} {cls.stream ? `(${cls.stream})` : ''}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {cls.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {cls.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {cls.startTime} - {cls.endTime}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cls.subject}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartOrJoinLobby(cls)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        {isTeacherOrAdmin ? 'Start / Host Lesson' : 'Enter Lobby'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 2: RECORDED LESSON ARCHIVES */}
      {activeTab === 'RECORDINGS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordedClasses.map((cls) => (
              <div
                key={cls.id}
                className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center group">
                  <img
                    src={
                      cls.recordingThumbnail ||
                      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600'
                    }
                    alt={cls.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedRecordingForReplay(cls)}
                      className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                    >
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white backdrop-blur-md">
                    {Math.floor((cls.recordingDurationSeconds || 3600) / 60)} min
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {cls.subject} • {cls.classGrade}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {cls.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Delivered by {cls.teacherName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRecordingForReplay(cls)}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Watch Replay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 3: MEDIA QUALITY STUDIO & GALLERY */}
      {activeTab === 'MEDIA_STUDIO' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                School Calibrated Media Gallery
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Media processed via SchoolSoul Quality Engine with lighting normalization and aspect ratio calibration
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMediaStudioOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4" />
              Calibrate New Photo / Video
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mediaItems.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-950">
                  <img
                    src={m.optimizedUrl || m.originalUrl}
                    alt={m.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[10px] font-bold backdrop-blur-md">
                    Profile: {m.processingProfile}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                    {m.aspectRatio}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {m.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Uploaded by {m.uploadedByUserName}</span>
                    <a
                      href={m.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Download Master
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. MODALS INTEGRATION */}
      {selectedClassForJoin && (
        <DeviceCheckModal
          isOpen={isLobbyOpen}
          onClose={() => setIsLobbyOpen(false)}
          liveClass={selectedClassForJoin}
          onJoinRoom={handleConfirmJoinFromLobby}
        />
      )}

      <CreateLiveClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onClassCreated={(newClass) => {
          setClasses((prev) => [newClass, ...prev]);
        }}
      />

      <MediaQualityEngineModal
        isOpen={isMediaStudioOpen}
        onClose={() => setIsMediaStudioOpen(false)}
        onMediaSaved={(newMedia) => {
          setMediaItems((prev) => [newMedia, ...prev]);
        }}
      />

      {selectedRecordingForReplay && (
        <LessonReplayModal
          isOpen={Boolean(selectedRecordingForReplay)}
          onClose={() => setSelectedRecordingForReplay(null)}
          liveClass={selectedRecordingForReplay}
        />
      )}
    </div>
  );
};
