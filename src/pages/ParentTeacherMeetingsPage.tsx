import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  Plus,
  CheckCircle2,
  Phone,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { getPtmSlots, createPtmSlot, bookPtmSlot } from '../services/communicationApi';
import type { ParentTeacherMeetingSlot } from '../types';

export const ParentTeacherMeetingsPage: React.FC = () => {
  const [slots, setSlots] = useState<ParentTeacherMeetingSlot[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Slot creation
  const [teacherName, setTeacherName] = useState('Tr. Sarah Akello');
  const [subject, setSubject] = useState('Physics & Mathematics');
  const [date, setDate] = useState('2026-08-05');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:15');

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const data = await getPtmSlots();
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPtmSlot({
        teacherName,
        subject,
        date,
        startTime,
        endTime,
      });

      setShowModal(false);
      await loadSlots();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (slotId: string) => {
    try {
      await bookPtmSlot(
        slotId,
        'usr-parent-1',
        'Mr. Mugisha David',
        '+256772123456',
        'Mugisha Emmanuel'
      );
      alert('PTM Slot Booked! Auto-SMS confirmation dispatched to parent.');
      await loadSlots();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" /> Parent-Teacher Meeting (PTM) Scheduler
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Book 15-minute 1-on-1 consultative slots with class teachers & subject specialists.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" /> Add Teacher Time Slot
        </button>
      </div>

      {/* Slots Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`p-6 rounded-3xl border transition-all space-y-3 ${
              slot.isBooked
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-slate-900 border-sky-500/30 hover:border-sky-500/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" /> {slot.teacherName}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  slot.isBooked
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {slot.status}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>Subject: <strong className="text-slate-200">{slot.subject}</strong></p>
              <p className="font-mono">Date: {slot.date} ({slot.startTime} - {slot.endTime})</p>
              <p>Type: <strong className="text-slate-200">{slot.meetingType}</strong></p>
            </div>

            {slot.isBooked ? (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400">Booked By: <strong className="text-white">{slot.parentName}</strong></p>
                <p className="text-slate-400">Student: <strong className="text-white">{slot.studentName}</strong></p>
              </div>
            ) : (
              <button
                onClick={() => handleBook(slot.id)}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
              >
                Book Time Slot
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-white">Create Teacher Availability Slot</h3>
            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Teacher Name</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 text-white px-2 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Start</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 text-white px-2 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">End</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 text-white px-2 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold"
                >
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
