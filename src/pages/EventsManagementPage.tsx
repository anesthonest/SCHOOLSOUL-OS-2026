import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  UserCheck,
  UserX,
  Users,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { getSchoolEvents, createSchoolEvent, submitEventRsvp } from '../services/communicationApi';
import type { SchoolEventItem } from '../types';

export const EventsManagementPage: React.FC = () => {
  const [events, setEvents] = useState<SchoolEventItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<SchoolEventItem['eventType']>('Sports');
  const [startDate, setStartDate] = useState('2026-08-15');
  const [startTime, setStartTime] = useState('09:00');
  const [location, setLocation] = useState('Main Sports Grounds');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getSchoolEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createSchoolEvent({
        title,
        eventType,
        startDate,
        startTime,
        location,
        description,
      });

      setShowModal(false);
      setTitle('');
      setDescription('');
      await loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRsvp = async (eventId: string, status: 'Attending' | 'Declined') => {
    try {
      await submitEventRsvp(eventId, 'usr-parent-1', 'Mugisha David', status);
      await loadEvents();
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
            <Calendar className="w-5 h-5 text-amber-400" /> School Events Management & Parent RSVP Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            School calendar events, sports meets, consultative meetings, field trips & real-time attendance check-in.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" /> Create School Event
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px]">
                {evt.eventType}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {evt.startDate} ({evt.startTime})
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{evt.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Location: <strong>{evt.location}</strong></span>
            </div>

            {/* RSVP Stats Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">RSVP Summary:</span>
                <span className="text-emerald-400">{evt.rsvpCounts.attending} Attending</span>
                <span className="text-rose-400">{evt.rsvpCounts.declined} Declined</span>
              </div>
            </div>

            {/* Parent Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleRsvp(evt.id, 'Attending')}
                className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Confirm Attending
              </button>
              <button
                onClick={() => handleRsvp(evt.id, 'Declined')}
                className="flex-1 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-white">Create School Calendar Event</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual Music Dance & Drama Gala"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    {['Academic', 'Sports', 'PTM', 'Trip', 'Cultural', 'Religious', 'Holiday', 'General'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Event Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none"
                />
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
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
