import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// Apply requireAuth to all attendance routes
router.use(requireAuth);

// GET /api/attendance/students
router.get('/students', (req, res) => {
  try {
    const db = readServerDB();
    const { date, classGrade, stream, session } = req.query;

    let records = db.studentAttendance || [];

    if (date) {
      records = records.filter((r: any) => r.date === date);
    }
    if (classGrade && classGrade !== 'All') {
      records = records.filter((r: any) => r.classGrade === classGrade);
    }
    if (stream && stream !== 'All') {
      records = records.filter((r: any) => r.stream === stream);
    }
    if (session) {
      records = records.filter((r: any) => r.session === session);
    }

    res.json({ success: true, records });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch student attendance' });
  }
});

// POST /api/attendance/students/batch
router.post('/students/batch', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)', 'Teacher', 'Registrar'), (req, res) => {
  try {
    const { records, operatorUserId, operatorUsername } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Records must be an array' });
    }

    const db = readServerDB();
    const now = new Date().toISOString();

    const savedRecords: any[] = [];
    const newAlerts: any[] = [];
    const newParentNotifications: any[] = [];

    for (const item of records) {
      const recordId = item.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newRec = {
        id: recordId,
        studentId: item.studentId,
        studentName: item.studentName,
        classGrade: item.classGrade,
        stream: item.stream || 'A',
        date: item.date,
        session: item.session || 'Morning',
        subject: item.subject || 'General Register',
        status: item.status || 'Present',
        arrivalNote: item.arrivalNote || '',
        absenceReason: item.absenceReason || (item.status === 'Absent' ? 'Unknown' : undefined),
        recordedBy: operatorUsername || (req as any).user?.username || item.recordedBy || 'Teacher',
        recordedAt: item.recordedAt || now,
        updatedAt: now,
      };

      // Remove previous duplicate for same student/date/session if exists
      db.studentAttendance = (db.studentAttendance || []).filter(
        (r: any) => !(r.studentId === item.studentId && r.date === item.date && r.session === (item.session || 'Morning'))
      );

      db.studentAttendance.push(newRec);
      savedRecords.push(newRec);

      // Trigger Parent Notifications & Alerts if Absent or Late
      if (item.status === 'Absent' || item.status === 'Late') {
        const studentObj = (db.students || []).find((s: any) => s.id === item.studentId);
        const guardianObj = (db.guardians || []).find((g: any) => g.studentId === item.studentId && g.isPrimaryContact);

        if (studentObj) {
          const triggerType = item.status === 'Absent' ? 'Student Absent' : 'Student Late';
          const notification: any = {
            id: `pnotif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            studentId: item.studentId,
            studentName: item.studentName,
            guardianPhone: guardianObj?.phoneNumber || '+256 700 000 000',
            eventTrigger: triggerType,
            channel: 'SMS',
            message: `SchoolSoul Notice: Dear Parent, ${item.studentName} has been marked ${item.status.toUpperCase()} today (${item.date}) for ${item.session || 'Morning'} session.`,
            sentAt: now,
            status: 'Simulated',
          };
          db.parentNotifications = db.parentNotifications || [];
          db.parentNotifications.unshift(notification);
          newParentNotifications.push(notification);

          // Check for consecutive absences
          const prevAbsences = db.studentAttendance.filter(
            (r: any) => r.studentId === item.studentId && r.status === 'Absent'
          );
          if (prevAbsences.length >= 3) {
            const alertItem = {
              id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              studentId: item.studentId,
              studentName: item.studentName,
              classGrade: item.classGrade,
              alertType: 'Consecutive Absences',
              severity: 'High',
              message: `${item.studentName} (${item.classGrade}) has been absent for ${prevAbsences.length} consecutive days. Urgent follow-up required.`,
              date: item.date,
              status: 'Active',
              createdAt: now,
            };
            db.attendanceAlerts = db.attendanceAlerts || [];
            db.attendanceAlerts.unshift(alertItem);
            newAlerts.push(alertItem);
          }
        }
      }
    }

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      userId: operatorUserId || (req as any).user?.id || 'usr-1',
      username: operatorUsername || (req as any).user?.username || 'Teacher',
      userRole: (req as any).user?.role || 'Teacher',
      action: 'ATTENDANCE_RECORD',
      details: `Saved attendance batch for ${savedRecords.length} students on ${records[0]?.date || 'today'}.`,
    });

    writeServerDB(db);
    res.json({ success: true, count: savedRecords.length, alerts: newAlerts, parentNotifications: newParentNotifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save attendance batch' });
  }
});

// GET /api/attendance/staff
router.get('/staff', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)', 'Bursar'), (req, res) => {
  try {
    const db = readServerDB();
    const { date } = req.query;
    let records = db.staffAttendance || [];
    if (date) {
      records = records.filter((r: any) => r.date === date);
    }
    res.json({ success: true, records });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch staff attendance' });
  }
});

// POST /api/attendance/staff
router.post('/staff', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Security'), (req, res) => {
  try {
    const { staffId, staffName, role, date, checkInTime, checkOutTime, status, remarks, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();
    const now = new Date().toISOString();

    const existingIndex = (db.staffAttendance || []).findIndex((r: any) => r.staffId === staffId && r.date === date);

    let rec: any;
    if (existingIndex >= 0) {
      rec = db.staffAttendance[existingIndex];
      rec.checkInTime = checkInTime || rec.checkInTime;
      rec.checkOutTime = checkOutTime || rec.checkOutTime;
      rec.status = status || rec.status;
      rec.remarks = remarks !== undefined ? remarks : rec.remarks;
      rec.timestamp = now;
      db.staffAttendance[existingIndex] = rec;
    } else {
      rec = {
        id: `staffatt-${Date.now()}`,
        staffId,
        staffName,
        role: role || 'Teacher',
        date: date || new Date().toISOString().split('T')[0],
        checkInTime: checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOutTime,
        status: status || 'Present',
        remarks: remarks || '',
        recordedBy: operatorUsername || (req as any).user?.username || 'Administrator',
        timestamp: now,
      };
      db.staffAttendance = db.staffAttendance || [];
      db.staffAttendance.push(rec);
    }

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      userId: operatorUserId || (req as any).user?.id || 'usr-1',
      username: operatorUsername || (req as any).user?.username || 'Administrator',
      userRole: (req as any).user?.role || 'Administrator',
      action: 'STAFF_CHECKIN',
      details: `Recorded staff attendance for ${staffName} (${status}).`,
    });

    writeServerDB(db);
    res.json({ success: true, record: rec });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to record staff attendance' });
  }
});

// GET & POST /api/attendance/visitors
router.get('/visitors', (req, res) => {
  try {
    const db = readServerDB();
    res.json({ success: true, visitors: db.visitors || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch visitors' });
  }
});

router.post('/visitors', (req, res) => {
  try {
    const { visitorName, phone, nationalId, organisation, personToVisit, purpose, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const badgeNumber = `VIS-${Math.floor(100 + Math.random() * 900)}`;

    const newVisitor = {
      id: `vis-${Date.now()}`,
      visitorName,
      phone,
      nationalId: nationalId || '',
      organisation: organisation || 'Private Guest',
      personToVisit,
      purpose,
      badgeNumber,
      checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Checked In',
      registeredBy: operatorUsername || (req as any).user?.username || 'Gate Security',
      date: dateStr,
    };

    db.visitors = db.visitors || [];
    db.visitors.unshift(newVisitor);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now.toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'usr-1',
      username: operatorUsername || (req as any).user?.username || 'Gate Security',
      userRole: (req as any).user?.role || 'Security',
      action: 'VISITOR_CHECKIN',
      details: `Checked in visitor ${visitorName} (Badge #${badgeNumber}) visiting ${personToVisit}.`,
    });

    writeServerDB(db);
    res.json({ success: true, visitor: newVisitor });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to check in visitor' });
  }
});

router.put('/visitors/:id/checkout', (req, res) => {
  try {
    const { id } = req.params;
    const { operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();
    const visitor = (db.visitors || []).find((v: any) => v.id === id);

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor record not found' });
    }

    visitor.status = 'Checked Out';
    visitor.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'usr-1',
      username: operatorUsername || (req as any).user?.username || 'Gate Security',
      userRole: (req as any).user?.role || 'Security',
      action: 'VISITOR_CHECKOUT',
      details: `Checked out visitor ${visitor.visitorName} (Badge #${visitor.badgeNumber}).`,
    });

    writeServerDB(db);
    res.json({ success: true, visitor });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to checkout visitor' });
  }
});

// GET & POST /api/attendance/leave
router.get('/leave', (req, res) => {
  try {
    const db = readServerDB();
    res.json({ success: true, leaveRequests: db.staffLeave || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch staff leave requests' });
  }
});

router.post('/leave', (req, res) => {
  try {
    const { staffId, staffName, role, leaveType, startDate, endDate, totalDays, reason, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();
    const now = new Date().toISOString();

    const newRequest = {
      id: `leave-${Date.now()}`,
      staffId: staffId || operatorUserId || (req as any).user?.id || 'usr-teacher-1',
      staffName: staffName || operatorUsername || (req as any).user?.username || 'Staff Member',
      role: role || (req as any).user?.role || 'Teacher',
      leaveType: leaveType || 'Annual',
      startDate,
      endDate,
      totalDays: totalDays || 1,
      reason,
      status: 'Pending',
      appliedAt: now,
    };

    db.staffLeave = db.staffLeave || [];
    db.staffLeave.unshift(newRequest);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      userId: operatorUserId || (req as any).user?.id || 'usr-1',
      username: operatorUsername || (req as any).user?.username || 'Staff Member',
      userRole: role || (req as any).user?.role || 'Teacher',
      action: 'LEAVE_REQUEST',
      details: `Submitted ${leaveType} leave request for ${totalDays} days (${startDate} to ${endDate}).`,
    });

    writeServerDB(db);
    res.json({ success: true, leaveRequest: newRequest });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit leave request' });
  }
});

router.put('/leave/:id/review', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerComments, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();
    const leaveReq = (db.staffLeave || []).find((l: any) => l.id === id);

    if (!leaveReq) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    leaveReq.status = status;
    leaveReq.reviewedBy = operatorUsername || (req as any).user?.username || 'Headteacher';
    leaveReq.reviewedAt = new Date().toISOString();
    leaveReq.reviewerComments = reviewerComments || '';

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'usr-1',
      username: operatorUsername || (req as any).user?.username || 'Headteacher',
      userRole: (req as any).user?.role || 'Headteacher',
      action: status === 'Approved' ? 'LEAVE_APPROVE' : 'LEAVE_REJECT',
      details: `${status} leave request for ${leaveReq.staffName} (${leaveReq.leaveType}).`,
    });

    writeServerDB(db);
    res.json({ success: true, leaveRequest: leaveReq });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to review leave request' });
  }
});

// GET & POST /api/attendance/calendar
router.get('/calendar', (req, res) => {
  try {
    const db = readServerDB();
    res.json({ success: true, events: db.calendarEvents || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch calendar events' });
  }
});

router.post('/calendar', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)'), (req, res) => {
  try {
    const { title, eventType, startDate, endDate, term, description, isAttendanceDay, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();
    const now = new Date().toISOString();

    const newEvent = {
      id: `cal-${Date.now()}`,
      title,
      eventType: eventType || 'School Event',
      startDate,
      endDate: endDate || startDate,
      term: term || 'Term I',
      description: description || '',
      isAttendanceDay: isAttendanceDay !== undefined ? isAttendanceDay : true,
      createdBy: operatorUsername || (req as any).user?.username || 'Administrator',
      createdAt: now,
    };

    db.calendarEvents = db.calendarEvents || [];
    db.calendarEvents.push(newEvent);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      userId: operatorUserId || (req as any).user?.id || 'usr-1',
      username: operatorUsername || (req as any).user?.username || 'Administrator',
      userRole: (req as any).user?.role || 'Administrator',
      action: 'CALENDAR_EVENT_CREATE',
      details: `Added academic calendar event: ${title} (${startDate}).`,
    });

    writeServerDB(db);
    res.json({ success: true, event: newEvent });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create calendar event' });
  }
});

router.put('/calendar/:id', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)'), (req, res) => {
  try {
    const { id } = req.params;
    const db = readServerDB();
    const event = (db.calendarEvents || []).find((e: any) => e.id === id);
    if (!event) return res.status(404).json({ error: 'Calendar event not found' });

    Object.assign(event, req.body, { id, updatedAt: new Date().toISOString() });
    writeServerDB(db);
    res.json({ success: true, event });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update calendar event' });
  }
});

router.delete('/calendar/:id', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)'), (req, res) => {
  try {
    const { id } = req.params;
    const db = readServerDB();
    db.calendarEvents = (db.calendarEvents || []).filter((e: any) => e.id !== id);
    writeServerDB(db);
    res.json({ success: true, message: 'Calendar event deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete calendar event' });
  }
});

router.delete('/visitors/:id', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Security'), (req, res) => {
  try {
    const { id } = req.params;
    const db = readServerDB();
    db.visitors = (db.visitors || []).filter((v: any) => v.id !== id);
    writeServerDB(db);
    res.json({ success: true, message: 'Visitor record deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete visitor record' });
  }
});

router.delete('/leave/:id', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)'), (req, res) => {
  try {
    const { id } = req.params;
    const db = readServerDB();
    db.staffLeave = (db.staffLeave || []).filter((l: any) => l.id !== id);
    writeServerDB(db);
    res.json({ success: true, message: 'Leave request deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete leave request' });
  }
});

// GET /api/attendance/alerts & PUT acknowledge
router.get('/alerts', (req, res) => {
  try {
    const db = readServerDB();
    res.json({ success: true, alerts: db.attendanceAlerts || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch attendance alerts' });
  }
});

router.put('/alerts/:id/acknowledge', requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)'), (req, res) => {
  try {
    const { id } = req.params;
    const { operatorUsername } = req.body;
    const db = readServerDB();
    const alert = (db.attendanceAlerts || []).find((a: any) => a.id === id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    alert.status = 'Acknowledged';
    alert.acknowledgedBy = operatorUsername || (req as any).user?.username || 'Headteacher';

    writeServerDB(db);
    res.json({ success: true, alert });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to acknowledge alert' });
  }
});

// GET /api/attendance/notifications
router.get('/notifications', (req, res) => {
  try {
    const db = readServerDB();
    res.json({ success: true, notifications: db.parentNotifications || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch parent notifications' });
  }
});

export default router;
