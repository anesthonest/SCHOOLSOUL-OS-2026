import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  Plus,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  XCircle,
  Building,
  User,
  BookOpen,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  getTimetableSlots,
  getSchoolClasses,
  getSubjects,
  addTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
} from '../services/academicsApi';
import type { TimetableSlot, SchoolClass, Subject } from '../types';

export const TimetableEnginePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedClass, setSelectedClass] = useState('Senior 1');
  const [selectedStream, setSelectedStream] = useState('North');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [teacherName, setTeacherName] = useState('Mr. Okello Patrick');
  const [roomName, setRoomName] = useState('Room 101');

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = useMemo(
    () => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    []
  );

  const periods = useMemo(
    () => [
      { num: 1, time: '08:00 - 08:40' },
      { num: 2, time: '08:40 - 09:20' },
      { num: 3, time: '09:20 - 10:00' },
      { num: 4, time: '10:30 - 11:10' },
      { num: 5, time: '11:10 - 11:50' },
      { num: 6, time: '11:50 - 12:30' },
      { num: 7, time: '14:00 - 14:40' },
      { num: 8, time: '14:40 - 15:20' },
    ],
    []
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sList, cList, subjList] = await Promise.all([
        getTimetableSlots(selectedClass, selectedStream),
        getSchoolClasses(),
        getSubjects(),
      ]);
      setSlots(sList);
      setClasses(cList);
      setSubjects(subjList);
      if (subjList.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjList[0].id);
      }
    } catch (err) {
      console.error('Failed to load timetable data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedStream, selectedSubjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Conflict Detection Logic (Memoized)
  const conflicts = useMemo(() => {
    const teacherMap = new Map<string, string>();
    const roomMap = new Map<string, string>();
    const conflictList: string[] = [];

    slots.forEach((s) => {
      const keyTeacher = `${s.dayOfWeek}-P${s.periodNumber}-${s.teacherName}`;
      if (teacherMap.has(keyTeacher)) {
        conflictList.push(`Teacher Collision: ${s.teacherName} double booked on ${s.dayOfWeek} Period ${s.periodNumber}`);
      } else {
        teacherMap.set(keyTeacher, s.id);
      }

      const keyRoom = `${s.dayOfWeek}-P${s.periodNumber}-${s.roomName}`;
      if (roomMap.has(keyRoom)) {
        conflictList.push(`Room Collision: ${s.roomName} occupied on ${s.dayOfWeek} Period ${s.periodNumber}`);
      } else {
        roomMap.set(keyRoom, s.id);
      }
    });

    return conflictList;
  }, [slots]);

  const handleOpenAddModal = (presetDay?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday', presetPeriod?: number) => {
    setEditingSlotId(null);
    if (presetDay) setDayOfWeek(presetDay);
    if (presetPeriod) setPeriodNumber(presetPeriod);
    if (subjects.length > 0) setSelectedSubjectId(subjects[0].id);
    setTeacherName('Mr. Okello Patrick');
    setRoomName('Room 101');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setDayOfWeek(slot.dayOfWeek as any);
    setPeriodNumber(slot.periodNumber);
    setSelectedSubjectId(slot.subjectId);
    setTeacherName(slot.teacherName);
    setRoomName(slot.roomName);
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === selectedSubjectId);
    if (!subj) return;

    const periodTimes: Record<number, { start: string; end: string }> = {
      1: { start: '08:00', end: '08:40' },
      2: { start: '08:40', end: '09:20' },
      3: { start: '09:20', end: '10:00' },
      4: { start: '10:30', end: '11:10' },
      5: { start: '11:10', end: '11:50' },
      6: { start: '11:50', end: '12:30' },
      7: { start: '14:00', end: '14:40' },
      8: { start: '14:40', end: '15:20' },
    };

    try {
      if (editingSlotId) {
        await updateTimetableSlot(editingSlotId, {
          classGrade: selectedClass,
          stream: selectedStream,
          dayOfWeek,
          periodNumber,
          startTime: periodTimes[periodNumber]?.start || '08:00',
          endTime: periodTimes[periodNumber]?.end || '08:40',
          subjectId: subj.id,
          subjectName: subj.subjectName,
          teacherName,
          roomName,
        });
      } else {
        await addTimetableSlot({
          classGrade: selectedClass,
          stream: selectedStream,
          dayOfWeek,
          periodNumber,
          startTime: periodTimes[periodNumber]?.start || '08:00',
          endTime: periodTimes[periodNumber]?.end || '08:40',
          subjectId: subj.id,
          subjectName: subj.subjectName,
          teacherId: 't-assigned',
          teacherName,
          roomName,
        });
      }

      setIsModalOpen(false);
      setEditingSlotId(null);
      await loadData();
    } catch (err) {
      console.error('Error saving timetable slot:', err);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Remove this timetable slot?')) return;
    try {
      await deleteTimetableSlot(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting timetable slot:', err);
    }
  };

  if (loading && slots.length === 0 && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" /> Timetable Engine & Schedule Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live interactive timetable builder, class allocations, teacher schedule matrix, and conflict detector.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Timetable
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>
      </div>

      {/* Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className} ({c.classCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Stream</label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
            >
              <option value="North">North Stream</option>
              <option value="South">South Stream</option>
              <option value="East">East Stream</option>
              <option value="West">West Stream</option>
              <option value="A">Stream A</option>
              <option value="B">Stream B</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
        </div>

        {conflicts.length > 0 ? (
          <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{conflicts.length} Conflict(s) Detected in Schedule</span>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Schedule Conflict Free</span>
          </div>
        )}
      </div>

      {/* Timetable Grid Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Weekly Schedule Matrix for {selectedClass} - {selectedStream} Stream
          </h2>
          <span className="text-[11px] text-slate-400">Click any free cell to add a lesson, or click a lesson to edit</span>
        </div>

        <table className="w-full text-center border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
              <th className="p-3 text-left w-28 border-r border-slate-800">Period / Time</th>
              {days.map((day) => (
                <th key={day} className="p-3 border-r border-slate-800/60 last:border-r-0">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {periods.map((p) => (
              <tr key={p.num} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 text-left bg-slate-950/60 font-mono text-[11px] text-slate-300 font-bold border-r border-slate-800">
                  <div>P{p.num}</div>
                  <div className="text-[9px] text-slate-500 font-normal">{p.time}</div>
                </td>

                {days.map((day) => {
                  const slot = slots.find((s) => s.dayOfWeek === day && s.periodNumber === p.num);
                  return (
                    <td key={day} className="p-2 border-r border-slate-800/40 last:border-r-0 align-top h-20">
                      {slot ? (
                        <div
                          onClick={() => handleOpenEditModal(slot)}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all text-left relative group cursor-pointer shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-purple-300 text-xs">{slot.subjectName}</div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(slot);
                                }}
                                className="text-slate-400 hover:text-white p-0.5"
                                title="Edit Slot"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(slot.id, e)}
                                className="text-rose-400 hover:text-rose-300 p-0.5"
                                title="Remove Slot"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <User className="w-2.5 h-2.5 text-slate-500" /> {slot.teacherName}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <Building className="w-2.5 h-2.5 text-slate-600" /> {slot.roomName}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenAddModal(day, p.num)}
                          className="w-full h-full min-h-[60px] rounded-xl border border-dashed border-slate-800/60 hover:border-purple-500/50 hover:bg-purple-950/20 flex flex-col items-center justify-center text-[10px] text-slate-600 hover:text-purple-400 transition-all group"
                        >
                          <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span>Free</span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add or Edit Slot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                {editingSlotId ? 'Edit Timetable Slot' : 'Allocate Timetable Slot'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSlotId(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Period Number</label>
                  <select
                    value={periodNumber}
                    onChange={(e) => setPeriodNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {periods.map((p) => (
                      <option key={p.num} value={p.num}>
                        Period {p.num} ({p.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subjectName} ({s.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Teacher</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  placeholder="e.g. Mr. Okello Patrick"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Classroom / Lab Room</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  placeholder="e.g. Room 101, Science Lab 2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSlotId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30 flex items-center gap-2"
                >
                  {editingSlotId ? 'Update Slot' : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
