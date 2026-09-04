import { db } from '../db/indexedDB';
import { isServerOnline, queueOfflineAction, API_BASE, getAuthHeaders } from './api';
import type {
  StudentAttendanceRecord,
  StaffAttendanceRecord,
  VisitorRecord,
  StaffLeaveRequest,
  CalendarEvent,
  AttendanceAlert,
  ParentAttendanceNotification,
} from '../types';

// Seed sample attendance & daily operations data if empty
let isSeedingAttendancePromise: Promise<void> | null = null;

export async function seedSampleAttendanceDataIfEmpty(): Promise<void> {
  if (isSeedingAttendancePromise) {
    return isSeedingAttendancePromise;
  }

  isSeedingAttendancePromise = (async () => {
    try {
      const attendanceCount = await db.studentAttendance.count();
      const today = new Date().toISOString().split('T')[0];

      if (attendanceCount === 0) {
    const students = await db.students.toArray();
    const sampleStudentAttendance: StudentAttendanceRecord[] = [];

    // Sample student attendance for today
    if (students.length > 0) {
      students.forEach((s, idx) => {
        const statuses = ['Present', 'Present', 'Present', 'Late', 'Absent', 'Present'];
        const status = (statuses[idx % statuses.length] || 'Present') as any;
        sampleStudentAttendance.push({
          id: `att-seed-${idx + 1}`,
          studentId: s.id,
          studentName: s.fullName,
          classGrade: s.classGrade,
          stream: s.stream || 'A',
          date: today,
          session: 'Morning',
          subject: 'General Register',
          status,
          arrivalNote: status === 'Late' ? 'Arrived at 8:20 AM due to rain' : '',
          absenceReason: status === 'Absent' ? 'Sick' : undefined,
          recordedBy: 'Tr. Sarah Nabatanzi',
          recordedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    if (sampleStudentAttendance.length > 0) {
      await db.studentAttendance.bulkPut(sampleStudentAttendance);
    }

    // Seed Staff Attendance
    const staffCount = await db.staffAttendance.count();
    if (staffCount === 0) {
      const sampleStaff: StaffAttendanceRecord[] = [
        {
          id: 'staff-att-1',
          staffId: 'usr-teacher-1',
          staffName: 'Tr. Sarah Nabatanzi',
          role: 'Teacher',
          date: today,
          checkInTime: '07:15 AM',
          status: 'Present',
          remarks: 'On duty teacher',
          recordedBy: 'Self Check-in',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'staff-att-2',
          staffId: 'usr-teacher-2',
          staffName: 'Mr. Okello David',
          role: 'Teacher',
          date: today,
          checkInTime: '07:42 AM',
          status: 'Present',
          remarks: 'Head of Science Department',
          recordedBy: 'Self Check-in',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'staff-att-3',
          staffId: 'usr-teacher-3',
          staffName: 'Ms. Grace Akello',
          role: 'Teacher',
          date: today,
          checkInTime: '08:10 AM',
          status: 'Late',
          remarks: 'Transport delay',
          recordedBy: 'Admin Check-in',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'staff-att-4',
          staffId: 'usr-deputy-1',
          staffName: 'Mr. Mukasa Paul',
          role: 'Deputy Headteacher',
          date: today,
          checkInTime: '06:55 AM',
          status: 'Present',
          remarks: 'Early arrival for assembly prep',
          recordedBy: 'Self Check-in',
          timestamp: new Date().toISOString(),
        },
      ];
      await db.staffAttendance.bulkPut(sampleStaff);
    }

    // Seed Visitors
    const visitorCount = await db.visitors.count();
    if (visitorCount === 0) {
      const sampleVisitors: VisitorRecord[] = [
        {
          id: 'vis-1',
          visitorName: 'Eng. Tumusiime Godfrey',
          phone: '+256 772 384 910',
          nationalId: 'CM840291038102',
          organisation: 'Ministry of Education & Sports',
          personToVisit: 'Headteacher',
          purpose: 'School Inspection & Infrastructure Audit',
          badgeNumber: 'VIS-101',
          checkInTime: '09:30 AM',
          status: 'Checked In',
          registeredBy: 'Gate Security - John',
          date: today,
        },
        {
          id: 'vis-2',
          visitorName: 'Mrs. Florence Katusiime',
          phone: '+256 701 554 321',
          nationalId: 'CF910283748291',
          organisation: 'Parent',
          personToVisit: 'Bursar',
          purpose: 'School fees payment clarification & receipt issuance',
          badgeNumber: 'VIS-102',
          checkInTime: '10:15 AM',
          checkOutTime: '11:05 AM',
          status: 'Checked Out',
          registeredBy: 'Gate Security - John',
          date: today,
        },
      ];
      await db.visitors.bulkPut(sampleVisitors);
    }

    // Seed Staff Leave Requests
    const leaveCount = await db.staffLeave.count();
    if (leaveCount === 0) {
      const sampleLeave: StaffLeaveRequest[] = [
        {
          id: 'leave-1',
          staffId: 'usr-teacher-3',
          staffName: 'Ms. Grace Akello',
          role: 'Teacher',
          leaveType: 'Sick',
          startDate: today,
          endDate: today,
          totalDays: 1,
          reason: 'Severe malaria - Doctor prescribed rest',
          status: 'Approved',
          appliedAt: new Date().toISOString(),
          reviewedBy: 'Headteacher',
          reviewedAt: new Date().toISOString(),
          reviewerComments: 'Granted. Get well soon.',
        },
        {
          id: 'leave-2',
          staffId: 'usr-teacher-2',
          staffName: 'Mr. Okello David',
          role: 'Teacher',
          leaveType: 'Study',
          startDate: '2026-08-10',
          endDate: '2026-08-14',
          totalDays: 5,
          reason: 'UNEB Senior National Marking Seminar in Kampala',
          status: 'Pending',
          appliedAt: new Date().toISOString(),
        },
      ];
      await db.staffLeave.bulkPut(sampleLeave);
    }

    // Seed Academic Calendar Events
    const calCount = await db.calendarEvents.count();
    if (calCount === 0) {
      const sampleCalendar: CalendarEvent[] = [
        {
          id: 'cal-1',
          title: 'Term I Commencement 2026',
          eventType: 'Term Period',
          startDate: '2026-02-02',
          endDate: '2026-05-01',
          term: 'Term I',
          description: 'Official opening date for Term 1 academic year 2026',
          isAttendanceDay: true,
          createdBy: 'Headteacher',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'cal-2',
          title: 'Mid-Term Examinations (P.5 - P.7 & S.1 - S.4)',
          eventType: 'Examination',
          startDate: '2026-03-16',
          endDate: '2026-03-20',
          term: 'Term I',
          description: 'Continuous assessment mid-term exams for upper primary and lower secondary',
          isAttendanceDay: true,
          createdBy: 'Deputy Headteacher',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'cal-3',
          title: 'National Women\'s Day Holiday',
          eventType: 'Public Holiday',
          startDate: '2026-03-08',
          endDate: '2026-03-08',
          term: 'Term I',
          description: 'Public Holiday - No classes scheduled',
          isAttendanceDay: false,
          createdBy: 'Administrator',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'cal-4',
          title: 'Annual General Parent-Teacher Association (PTA) Meeting',
          eventType: 'Parent Meeting',
          startDate: '2026-04-04',
          endDate: '2026-04-04',
          term: 'Term I',
          description: 'All parents and guardians invited to review school progress and development plans',
          isAttendanceDay: true,
          createdBy: 'Headteacher',
          createdAt: new Date().toISOString(),
        },
      ];
      await db.calendarEvents.bulkPut(sampleCalendar);
    }

    // Seed Attendance Alerts
    const alertCount = await db.attendanceAlerts.count();
    if (alertCount === 0) {
      const sampleAlerts: AttendanceAlert[] = [
        {
          id: 'alert-1',
          studentId: 'stu-sample-2',
          studentName: 'Nalubega Harriet K.',
          classGrade: 'Primary 7',
          alertType: 'Frequent Absenteeism',
          severity: 'High',
          message: 'Nalubega Harriet K. has missed 4 days of school this month without prior medical note.',
          date: today,
          status: 'Active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'alert-2',
          staffId: 'usr-teacher-3',
          staffName: 'Ms. Grace Akello',
          alertType: 'Staff Absence',
          severity: 'Medium',
          message: 'Ms. Grace Akello marked absent today without covering scheduled P.6 English lesson.',
          date: today,
          status: 'Active',
          createdAt: new Date().toISOString(),
        },
      ];
      await db.attendanceAlerts.bulkPut(sampleAlerts);
    }

    // Seed Parent Notifications
    const parentNotifCount = await db.parentNotifications.count();
    if (parentNotifCount === 0) {
      const sampleParentNotifs: ParentAttendanceNotification[] = [
        {
          id: 'pnotif-1',
          studentId: 'stu-sample-2',
          studentName: 'Nalubega Harriet K.',
          guardianPhone: '+256 701 982 341',
          eventTrigger: 'Student Absent',
          channel: 'SMS',
          message: `SchoolSoul Notice: Dear Parent, Nalubega Harriet K. was marked ABSENT today (${today}) for Morning Session. Please reply or contact the class teacher if sick.`,
          sentAt: new Date().toISOString(),
          status: 'Sent',
        },
      ];
      await db.parentNotifications.bulkPut(sampleParentNotifs);
    }
  }
} catch (err) {
  console.warn('seedSampleAttendanceDataIfEmpty warning (handled):', err);
} finally {
  isSeedingAttendancePromise = null;
}
})();

return isSeedingAttendancePromise;
}

// Student Attendance API Methods
export async function fetchStudentAttendance(date: string, classGrade?: string, stream?: string) {
  await seedSampleAttendanceDataIfEmpty();

  if (await isServerOnline()) {
    try {
      const queryParams = new URLSearchParams({ date });
      if (classGrade && classGrade !== 'All') queryParams.append('classGrade', classGrade);
      if (stream && stream !== 'All') queryParams.append('stream', stream);

      const res = await fetch(`${API_BASE}/attendance/students?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.records as StudentAttendanceRecord[];
      }
    } catch (e) {
      console.warn('Backend unavailable, falling back to local Dexie student attendance', e);
    }
  }

  // Fallback to IndexedDB
  let collection = db.studentAttendance.where('date').equals(date);
  let records = await collection.toArray();

  if (classGrade && classGrade !== 'All') {
    records = records.filter((r) => r.classGrade === classGrade);
  }
  if (stream && stream !== 'All') {
    records = records.filter((r) => r.stream === stream);
  }

  return records;
}

export async function saveStudentAttendanceBatch(
  records: Partial<StudentAttendanceRecord>[],
  operatorUserId?: string,
  operatorUsername?: string
) {
  const now = new Date().toISOString();
  const fullRecords: StudentAttendanceRecord[] = [];

  for (const item of records) {
    const recId = item.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullRec: StudentAttendanceRecord = {
      id: recId,
      studentId: item.studentId || '',
      studentName: item.studentName || 'Student',
      classGrade: item.classGrade || 'Primary 1',
      stream: item.stream || 'A',
      date: item.date || new Date().toISOString().split('T')[0],
      session: item.session || 'Morning',
      subject: item.subject || 'General Register',
      status: item.status || 'Present',
      arrivalNote: item.arrivalNote || '',
      absenceReason: item.absenceReason || (item.status === 'Absent' ? 'Unknown' : undefined),
      recordedBy: operatorUsername || 'Teacher',
      recordedAt: item.recordedAt || now,
      updatedAt: now,
    };

    // Replace existing record in Dexie for same student, date, session
    const existing = await db.studentAttendance
      .where('studentId')
      .equals(fullRec.studentId)
      .and((r) => r.date === fullRec.date && r.session === fullRec.session)
      .first();

    if (existing) {
      await db.studentAttendance.put({ ...fullRec, id: existing.id });
    } else {
      await db.studentAttendance.add(fullRec);
    }

    fullRecords.push(fullRec);
  }

  if (await isServerOnline()) {
    try {
      const res = await fetch(`${API_BASE}/attendance/students/batch`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ records: fullRecords, operatorUserId, operatorUsername }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend batch attendance update failed, queued offline', e);
    }
  }

  // Queue offline sync
  await queueOfflineAction('student_attendance', 'CREATE', { records: fullRecords, operatorUserId, operatorUsername });
  return { success: true, count: fullRecords.length, offline: true };
}

// Staff Attendance Methods
export async function fetchStaffAttendance(date: string) {
  await seedSampleAttendanceDataIfEmpty();

  if (await isServerOnline()) {
    try {
      const res = await fetch(`${API_BASE}/attendance/staff?date=${date}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.records as StaffAttendanceRecord[];
      }
    } catch (e) {
      console.warn('Failed to fetch staff attendance online', e);
    }
  }

  return await db.staffAttendance.where('date').equals(date).toArray();
}

export async function recordStaffAttendance(payload: Partial<StaffAttendanceRecord>, operatorUserId?: string, operatorUsername?: string) {
  const now = new Date().toISOString();
  const dateStr = payload.date || now.split('T')[0];

  const existing = await db.staffAttendance
    .where('staffId')
    .equals(payload.staffId || '')
    .and((r) => r.date === dateStr)
    .first();

  const rec: StaffAttendanceRecord = {
    id: existing ? existing.id : `staffatt-${Date.now()}`,
    staffId: payload.staffId || 'usr-staff',
    staffName: payload.staffName || 'Staff Member',
    role: payload.role || 'Teacher',
    date: dateStr,
    checkInTime: payload.checkInTime || (existing ? existing.checkInTime : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    checkOutTime: payload.checkOutTime || (existing ? existing.checkOutTime : undefined),
    status: payload.status || 'Present',
    remarks: payload.remarks || '',
    recordedBy: operatorUsername || 'Self Check-in',
    timestamp: now,
  };

  await db.staffAttendance.put(rec);

  if (await isServerOnline()) {
    try {
      await fetch(`${API_BASE}/attendance/staff`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...rec, operatorUserId, operatorUsername }),
      });
    } catch (e) {
      console.warn('Staff attendance saved locally', e);
    }
  } else {
    await queueOfflineAction('staff_attendance', 'CREATE', { ...rec, operatorUserId, operatorUsername });
  }

  return rec;
}

// Visitor Register Methods
export async function fetchVisitors() {
  await seedSampleAttendanceDataIfEmpty();

  if (await isServerOnline()) {
    try {
      const res = await fetch(`${API_BASE}/attendance/visitors`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.visitors as VisitorRecord[];
      }
    } catch (e) {
      console.warn('Visitor fetch online error', e);
    }
  }

  return await db.visitors.reverse().toArray();
}

export async function checkInVisitor(payload: Partial<VisitorRecord>, operatorUserId?: string, operatorUsername?: string) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const badge = `VIS-${Math.floor(100 + Math.random() * 900)}`;

  const newVis: VisitorRecord = {
    id: `vis-${Date.now()}`,
    visitorName: payload.visitorName || 'Guest Visitor',
    phone: payload.phone || '',
    nationalId: payload.nationalId || '',
    organisation: payload.organisation || 'Private',
    personToVisit: payload.personToVisit || 'Administration',
    purpose: payload.purpose || 'General Inquiry',
    badgeNumber: badge,
    checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Checked In',
    registeredBy: operatorUsername || 'Security',
    date: dateStr,
  };

  await db.visitors.add(newVis);

  if (await isServerOnline()) {
    try {
      await fetch(`${API_BASE}/attendance/visitors`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...newVis, operatorUserId, operatorUsername }),
      });
    } catch (e) {
      console.warn('Visitor added locally', e);
    }
  } else {
    await queueOfflineAction('visitor', 'CREATE', { ...newVis, operatorUserId, operatorUsername });
  }

  return newVis;
}

export async function checkOutVisitor(visitorId: string, operatorUserId?: string, operatorUsername?: string) {
  const visitor = await db.visitors.get(visitorId);
  if (visitor) {
    visitor.status = 'Checked Out';
    visitor.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await db.visitors.put(visitor);

    if (await isServerOnline()) {
      try {
        await fetch(`${API_BASE}/attendance/visitors/${visitorId}/checkout`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ operatorUserId, operatorUsername }),
        });
      } catch (e) {
        console.warn('Visitor checkout saved locally', e);
      }
    } else {
      await queueOfflineAction('visitor', 'UPDATE', { id: visitorId, status: 'Checked Out', operatorUserId, operatorUsername });
    }
  }
}

export async function deleteVisitorRecord(visitorId: string, operatorUserId?: string, operatorUsername?: string) {
  await db.visitors.delete(visitorId);
  if (await isServerOnline()) {
    try {
      await fetch(`${API_BASE}/attendance/visitors/${visitorId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.warn('Visitor delete offline fallback', e);
    }
  } else {
    await queueOfflineAction('visitor', 'DELETE', { id: visitorId, operatorUserId, operatorUsername });
  }
}

// Staff Leave Methods
export async function fetchStaffLeaveRequests() {
  await seedSampleAttendanceDataIfEmpty();

  if (await isServerOnline()) {
    try {
      const res = await fetch(`${API_BASE}/attendance/leave`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.leaveRequests as StaffLeaveRequest[];
      }
    } catch (e) {
      console.warn('Leave fetch online error', e);
    }
  }

  return await db.staffLeave.reverse().toArray();
}

export async function submitStaffLeaveRequest(payload: Partial<StaffLeaveRequest>, operatorUserId?: string, operatorUsername?: string) {
  const now = new Date().toISOString();
  const req: StaffLeaveRequest = {
    id: `leave-${Date.now()}`,
    staffId: payload.staffId || operatorUserId || 'usr-staff',
    staffName: payload.staffName || operatorUsername || 'Staff Member',
    role: payload.role || 'Teacher',
    leaveType: payload.leaveType || 'Annual',
    startDate: payload.startDate || now.split('T')[0],
    endDate: payload.endDate || now.split('T')[0],
    totalDays: payload.totalDays || 1,
    reason: payload.reason || 'Personal Leave',
    status: 'Pending',
    appliedAt: now,
  };

  await db.staffLeave.add(req);

  if (await isServerOnline()) {
    try {
      await fetch(`${API_BASE}/attendance/leave`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...req, operatorUserId, operatorUsername }),
      });
    } catch (e) {
      console.warn('Leave request submitted locally', e);
    }
  } else {
    await queueOfflineAction('staff_leave', 'CREATE', { ...req, operatorUserId, operatorUsername });
  }

  return req;
}

export async function reviewStaffLeaveRequest(id: string, status: 'Approved' | 'Rejected', reviewerComments?: string, operatorUserId?: string, operatorUsername?: string) {
  const req = await db.staffLeave.get(id);
  if (req) {
    req.status = status;
    req.reviewedBy = operatorUsername || 'Headteacher';
    req.reviewedAt = new Date().toISOString();
    req.reviewerComments = reviewerComments || '';
    await db.staffLeave.put(req);

    if (await isServerOnline()) {
      try {
        await fetch(`${API_BASE}/attendance/leave/${id}/review`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ status, reviewerComments, operatorUserId, operatorUsername }),
        });
      } catch (e) {
        console.warn('Leave review updated locally', e);
      }
    } else {
      await queueOfflineAction('staff_leave', 'UPDATE', { id, status, reviewerComments, operatorUserId, operatorUsername });
    }
  }
}

export async function deleteStaffLeaveRequest(id: string, operatorUserId?: string, operatorUsername?: string) {
  await db.staffLeave.delete(id);
  if (await isServerOnline()) {
    try {
      await fetch(`${API_BASE}/attendance/leave/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.warn('Staff leave deleted locally', e);
    }
  } else {
    await queueOfflineAction('staff_leave', 'DELETE', { id, operatorUserId, operatorUsername });
  }
}

// Calendar Events Methods
export async function fetchCalendarEvents() {
  await seedSampleAttendanceDataIfEmpty();

  if (await isServerOnline()) {
    try {
      const res = await fetch(`${API_BASE}/attendance/calendar`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.events as CalendarEvent[];
      }
    } catch (e) {
      console.warn('Calendar fetch error online', e);
    }
  }

  return await db.calendarEvents.toArray();
}

export async function createCalendarEvent(payload: Partial<CalendarEvent>, operatorUserId?: string, operatorUsername?: string) {
  const now = new Date().toISOString();
  const event: CalendarEvent = {
    id: `cal-${Date.now()}`,
    title: payload.title || 'School Event',
    eventType: payload.eventType || 'School Event',
    startDate: payload.startDate || now.split('T')[0],
    endDate: payload.endDate || payload.startDate || now.split('T')[0],
    term: payload.term || 'Term I',
    description: payload.description || '',
    isAttendanceDay: payload.isAttendanceDay !== undefined ? payload.isAttendanceDay : true,
    createdBy: operatorUsername || 'Administrator',
    createdAt: now,
  };

  await db.calendarEvents.add(event);

  if (await isServerOnline()) {
    try {
      await fetch(`${API_BASE}/attendance/calendar`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...event, operatorUserId, operatorUsername }),
      });
    } catch (e) {
      console.warn('Calendar event saved locally', e);
    }
  } else {
    await queueOfflineAction('calendar_event', 'CREATE', { ...event, operatorUserId, operatorUsername });
  }

  return event;
}

export async function updateCalendarEvent(id: string, payload: Partial<CalendarEvent>, operatorUserId?: string, operatorUsername?: string) {
  const event = await db.calendarEvents.get(id);
  if (event) {
    const updated = { ...event, ...payload };
    await db.calendarEvents.put(updated);

    if (await isServerOnline()) {
      try {
        await fetch(`${API_BASE}/attendance/calendar/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...updated, operatorUserId, operatorUsername }),
        });
      } catch (e) {
        console.warn('Calendar event updated locally', e);
      }
    } else {
      await queueOfflineAction('calendar_event', 'UPDATE', { id, ...updated, operatorUserId, operatorUsername });
    }
    return updated;
  }
}

export async function deleteCalendarEvent(id: string, operatorUserId?: string, operatorUsername?: string) {
  await db.calendarEvents.delete(id);
  if (await isServerOnline()) {
    try {
      await fetch(`${API_BASE}/attendance/calendar/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.warn('Calendar event delete offline', e);
    }
  } else {
    await queueOfflineAction('calendar_event', 'DELETE', { id, operatorUserId, operatorUsername });
  }
}

// Attendance Alerts & Notifications Methods
export async function fetchAttendanceAlerts() {
  await seedSampleAttendanceDataIfEmpty();

  if (await isServerOnline()) {
    try {
      const res = await fetch(`${API_BASE}/attendance/alerts`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.alerts as AttendanceAlert[];
      }
    } catch (e) {
      console.warn('Alerts fetch online error', e);
    }
  }

  return await db.attendanceAlerts.reverse().toArray();
}

export async function fetchParentNotifications() {
  await seedSampleAttendanceDataIfEmpty();

  if (await isServerOnline()) {
    try {
      const res = await fetch(`${API_BASE}/attendance/notifications`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.notifications as ParentAttendanceNotification[];
      }
    } catch (e) {
      console.warn('Parent notifications fetch online error', e);
    }
  }

  return await db.parentNotifications.reverse().toArray();
}
