import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Building2,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  seedSampleAttendanceDataIfEmpty,
} from '../services/attendanceApi';
import type { CalendarEvent, CalendarEventType } from '../types';

export const AcademicCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<'All' | 'Term I' | 'Term II' | 'Term III'>('Term I');

  // Event Modal (Create / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    eventType: 'School Event' as CalendarEventType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    term: 'Term I' as any,
    description: '',
    isAttendanceDay: true,
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      await seedSampleAttendanceDataIfEmpty();
      const list = await fetchCalendarEvents();
      setEvents(list);
    } catch (e) {
      console.error('Failed to load calendar events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setForm({
      title: '',
      eventType: 'School Event',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      term: 'Term I',
      description: '',
      isAttendanceDay: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setForm({
      title: ev.title,
      eventType: ev.eventType,
      startDate: ev.startDate,
      endDate: ev.endDate,
      term: ev.term as any,
      description: ev.description || '',
      isAttendanceDay: ev.isAttendanceDay,
    });
    setShowModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Event title is required');
      return;
    }

    if (editingEventId) {
      await updateCalendarEvent(editingEventId, form, 'usr-admin-1', 'Administrator');
    } else {
      await createCalendarEvent(form, 'usr-admin-1', 'Administrator');
    }

    setShowModal(false);
    setEditingEventId(null);
    await loadEvents();
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from the calendar?`)) {
      await deleteCalendarEvent(id);
      await loadEvents();
    }
  };

  const filteredEvents = events.filter((ev) => selectedTerm === 'All' || ev.term === selectedTerm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-purple-700 font-semibold mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Daily Operations – Module 11</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Calendar & Operations Engine</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage academic term schedules, examination periods, public holidays, and attendance operational days
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Calendar Event
          </button>
        </div>
      </div>

      {/* Term Selector */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-md">
        {(['Term I', 'Term II', 'Term III', 'All'] as const).map((term) => (
          <button
            key={term}
            onClick={() => setSelectedTerm(term)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              selectedTerm === term ? 'bg-white text-purple-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {term}
          </button>
        ))}
      </div>

      {/* Calendar Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-500">Loading academic calendar...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
            No events scheduled for {selectedTerm}.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div key={ev.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      ev.eventType === 'Term Period'
                        ? 'bg-blue-100 text-blue-800'
                        : ev.eventType === 'Examination'
                        ? 'bg-amber-100 text-amber-800'
                        : ev.eventType === 'Public Holiday'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {ev.eventType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-gray-400">{ev.term}</span>
                    <button
                      onClick={() => handleOpenEditModal(ev)}
                      className="p-1 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-gray-50"
                      title="Edit Event"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-base leading-snug">{ev.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{ev.description || 'No detailed description.'}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-gray-700 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {ev.startDate} {ev.endDate !== ev.startDate && `to ${ev.endDate}`}
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    ev.isAttendanceDay ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {ev.isAttendanceDay ? 'Classes Scheduled' : 'No Classes'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Calendar Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-4">
              {editingEventId ? 'Edit Academic Calendar Event' : 'Add Academic Calendar Event'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. End of Term II Mock Examinations"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Event Category</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value as CalendarEventType })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="Term Period">Term Period</option>
                    <option value="Examination">Examination</option>
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="School Event">School Event</option>
                    <option value="Parent Meeting">Parent Meeting</option>
                    <option value="Staff Meeting">Staff Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Term</label>
                  <select
                    value={form.term}
                    onChange={(e) => setForm({ ...form, term: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="Term I">Term I</option>
                    <option value="Term II">Term II</option>
                    <option value="Term III">Term III</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Additional context or guidelines..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAttendance"
                  checked={form.isAttendanceDay}
                  onChange={(e) => setForm({ ...form, isAttendanceDay: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isAttendance" className="text-xs font-semibold text-gray-700">
                  Attendance Required (Normal School Day)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
                >
                  {editingEventId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
