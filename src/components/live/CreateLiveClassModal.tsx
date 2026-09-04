import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Video,
  Shield,
  FilePlus,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import type { LiveClass, LiveClassType, RecordingPolicy, ClassVisibility } from '../../types';
import { liveLearningApi } from '../../services/liveLearningApi';

interface CreateLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (newClass: LiveClass) => void;
}

export const CreateLiveClassModal: React.FC<CreateLiveClassModalProps> = ({
  isOpen,
  onClose,
  onClassCreated,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [subject, setSubject] = useState<string>('Physics');
  const [classGrade, setClassGrade] = useState<string>('Senior 4');
  const [stream, setStream] = useState<string>('Stream A');
  const [classType, setClassType] = useState<LiveClassType>('LIVE_LESSON');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('11:00');
  const [recordingPolicy, setRecordingPolicy] = useState<RecordingPolicy>('RECORD_AND_PUBLISH');
  const [visibility, setVisibility] = useState<ClassVisibility>('ENROLLED_CLASS_ONLY');

  // Policy toggles
  const [allowMic, setAllowMic] = useState<boolean>(true);
  const [allowCam, setAllowCam] = useState<boolean>(true);
  const [allowChat, setAllowChat] = useState<boolean>(true);
  const [allowWhiteboard, setAllowWhiteboard] = useState<boolean>(true);
  const [allowScreenShare, setAllowScreenShare] = useState<boolean>(false);

  // Materials
  const [materials, setMaterials] = useState<{ id: string; title: string; type: string; url: string }[]>([]);
  const [newMatTitle, setNewMatTitle] = useState<string>('');
  const [newMatUrl, setNewMatUrl] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddMaterial = () => {
    if (!newMatTitle.trim()) return;
    setMaterials([
      ...materials,
      {
        id: `mat-${Date.now()}`,
        title: newMatTitle.trim(),
        type: 'PDF',
        url: newMatUrl.trim() || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600',
      },
    ]);
    setNewMatTitle('');
    setNewMatUrl('');
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledDate || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      const created = await liveLearningApi.createLiveClass({
        title: title.trim(),
        description: description.trim(),
        subject,
        classGrade,
        stream,
        classType,
        scheduledDate,
        startTime,
        endTime,
        recordingPolicy,
        visibility,
        participationPolicy: {
          studentsCanSpeak: allowMic,
          studentsCameraAllowed: allowCam,
          studentsChatAllowed: allowChat,
          studentsScreenSharingAllowed: allowScreenShare,
          studentsReactionsAllowed: true,
          allowQuestions: true,
          allowWhiteboardDraw: allowWhiteboard,
        },
        materials: materials as any,
      });

      onClassCreated(created);
      onClose();
    } catch (err: any) {
      alert(`Error scheduling class: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Schedule New Live Classroom Lesson
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setup real-time audio/video, whiteboard parameters and lesson resources
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Lesson Title */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Lesson Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Electromagnetic Induction & Faraday's Laws"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject, Grade, Stream Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
              >
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English Language">English Language</option>
                <option value="Literature in English">Literature in English</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Computer Studies / ICT">Computer Studies / ICT</option>
                <option value="Commerce & Accounting">Commerce & Accounting</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Class Grade
              </label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
              >
                <option value="Senior 1">Senior 1</option>
                <option value="Senior 2">Senior 2</option>
                <option value="Senior 3">Senior 3</option>
                <option value="Senior 4">Senior 4</option>
                <option value="Senior 5">Senior 5</option>
                <option value="Senior 6">Senior 6</option>
                <option value="Primary 7">Primary 7</option>
                <option value="Primary 6">Primary 6</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Stream
              </label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
              >
                <option value="Stream A">Stream A</option>
                <option value="Stream B">Stream B</option>
                <option value="Stream C">Stream C</option>
                <option value="All Streams">All Streams Combined</option>
              </select>
            </div>
          </div>

          {/* Schedule Date & Times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description & Learning Objectives
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what topics will be covered during this interactive live session..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
            />
          </div>

          {/* Student Participation Controls */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Student Participation Safeguards
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allowMic}
                  onChange={(e) => setAllowMic(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Allow Microphone</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allowCam}
                  onChange={(e) => setAllowCam(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Allow Camera</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allowWhiteboard}
                  onChange={(e) => setAllowWhiteboard(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Whiteboard Draw</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allowScreenShare}
                  onChange={(e) => setAllowScreenShare(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Screen Share</span>
              </label>
            </div>
          </div>

          {/* Add Study Materials */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">
              Attach Lesson Materials / Slides
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMatTitle}
                onChange={(e) => setNewMatTitle(e.target.value)}
                placeholder="Resource title (e.g. Formula_Sheet.pdf)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddMaterial}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-300"
              >
                + Add
              </button>
            </div>

            {materials.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{m.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(m.id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling Lesson...' : 'Schedule Live Lesson'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
