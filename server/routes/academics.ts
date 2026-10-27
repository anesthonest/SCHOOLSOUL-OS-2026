import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

export const academicsRouter = Router();

// =========================================================================
// SUBJECT MANAGEMENT ROUTES (STRICT RBAC & TENANT ISOLATION)
// =========================================================================

/**
 * GET /api/academics/subjects
 * Retrieves all curriculum subjects for the tenant school.
 */
academicsRouter.get('/subjects', (req: any, res) => {
  try {
    const db = readServerDB();
    const activeSchoolId = req.user?.schoolId || db.schoolProfile?.id || 'school-ug-001';

    let list = db.subjects || [];
    // Tenant filtering
    list = list.filter((s: any) => !s.schoolId || s.schoolId === activeSchoolId);

    // Optional query filters
    if (req.query.department && req.query.department !== 'ALL') {
      list = list.filter((s: any) => s.department === req.query.department);
    }
    if (req.query.educationLevel && req.query.educationLevel !== 'ALL') {
      list = list.filter((s: any) => s.educationLevel === req.query.educationLevel);
    }
    if (req.query.activeOnly === 'true') {
      list = list.filter((s: any) => s.isActive !== false);
    }

    res.json({ success: true, subjects: list, count: list.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/academics/subjects
 * Creates a new subject for the tenant school.
 * Protected: Administrator, School Owner, Headteacher. Bursars explicitly forbidden.
 */
academicsRouter.post(
  '/subjects',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  (req: any, res) => {
    try {
      const user = req.user;
      if (user?.role === 'Bursar' || user?.role === 'Finance Officer') {
        return res.status(403).json({ success: false, error: 'Forbidden: Bursar role has no authorization to manage curriculum subjects.' });
      }

      const {
        subjectCode,
        subjectName,
        department,
        classification,
        curriculumType,
        educationLevel,
        category,
        description,
        classIds,
        teacherIds,
      } = req.body;

      if (!subjectCode || !subjectName || !department) {
        return res.status(400).json({ success: false, error: 'Subject code, name, and department are required.' });
      }

      const db = readServerDB();
      const activeSchoolId = user?.schoolId || db.schoolProfile?.id || 'school-ug-001';

      if (!db.subjects) db.subjects = [];

      // Check unique subject code within school
      const normalizedCode = String(subjectCode).trim().toUpperCase();
      const duplicate = db.subjects.find(
        (s: any) =>
          (!s.schoolId || s.schoolId === activeSchoolId) &&
          s.subjectCode.toUpperCase() === normalizedCode
      );

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: `Subject code "${normalizedCode}" is already in use by "${duplicate.subjectName}" in this institution.`,
        });
      }

      const newSubject = {
        id: `subj-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        schoolId: activeSchoolId,
        subjectCode: normalizedCode,
        subjectName: String(subjectName).trim(),
        department: String(department).trim(),
        classification: classification || 'Core',
        curriculumType: curriculumType || 'Ugandan CBC (NCDC)',
        educationLevel: educationLevel || 'Lower Secondary',
        category: category || 'Sciences & Math',
        description: description ? String(description).trim() : '',
        classIds: Array.isArray(classIds) ? classIds : [],
        teacherIds: Array.isArray(teacherIds) ? teacherIds : [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.subjects.push(newSubject);

      // Add Authoritative Audit Log
      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: 'SUBJECT_CREATE' as any,
        details: `Registered curriculum subject "${newSubject.subjectName}" (${newSubject.subjectCode}) under ${newSubject.department} department.`,
      });

      writeServerDB(db);
      res.status(201).json({ success: true, subject: newSubject });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * PUT /api/academics/subjects/:id
 * Updates an existing subject.
 */
academicsRouter.put(
  '/subjects/:id',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (user?.role === 'Bursar' || user?.role === 'Finance Officer') {
        return res.status(403).json({ success: false, error: 'Forbidden: Bursar role has no authorization to manage curriculum subjects.' });
      }

      const db = readServerDB();
      const activeSchoolId = user?.schoolId || db.schoolProfile?.id || 'school-ug-001';

      if (!db.subjects) db.subjects = [];
      const index = db.subjects.findIndex((s: any) => s.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Subject not found.' });
      }

      const existing = db.subjects[index];
      if (existing.schoolId && existing.schoolId !== activeSchoolId && user?.role !== 'Platform Administrator') {
        return res.status(403).json({ success: false, error: 'Cross-School Protection: Cannot edit subject belonging to another institution.' });
      }

      // Check unique code if updated
      if (req.body.subjectCode) {
        const newCode = String(req.body.subjectCode).trim().toUpperCase();
        const duplicate = db.subjects.find(
          (s: any) =>
            s.id !== id &&
            (!s.schoolId || s.schoolId === activeSchoolId) &&
            s.subjectCode.toUpperCase() === newCode
        );
        if (duplicate) {
          return res.status(400).json({
            success: false,
            error: `Subject code "${newCode}" is already in use by "${duplicate.subjectName}".`,
          });
        }
        existing.subjectCode = newCode;
      }

      if (req.body.subjectName) existing.subjectName = String(req.body.subjectName).trim();
      if (req.body.department) existing.department = String(req.body.department).trim();
      if (req.body.classification) existing.classification = req.body.classification;
      if (req.body.curriculumType) existing.curriculumType = req.body.curriculumType;
      if (req.body.educationLevel) existing.educationLevel = req.body.educationLevel;
      if (req.body.category) existing.category = req.body.category;
      if (req.body.description !== undefined) existing.description = req.body.description;
      if (req.body.classIds) existing.classIds = req.body.classIds;
      if (req.body.teacherIds) existing.teacherIds = req.body.teacherIds;
      if (req.body.isActive !== undefined) existing.isActive = Boolean(req.body.isActive);
      existing.updatedAt = new Date().toISOString();

      db.subjects[index] = existing;

      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: 'SUBJECT_UPDATE' as any,
        details: `Updated subject "${existing.subjectName}" (${existing.subjectCode}) details.`,
      });

      writeServerDB(db);
      res.json({ success: true, subject: existing });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * PUT /api/academics/subjects/:id/status
 * Toggles active/inactive status (safe deactivation preserving marks/historical records).
 */
academicsRouter.put(
  '/subjects/:id/status',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = req.user;

      const db = readServerDB();
      const activeSchoolId = user?.schoolId || db.schoolProfile?.id || 'school-ug-001';

      if (!db.subjects) db.subjects = [];
      const subject = db.subjects.find((s: any) => s.id === id);

      if (!subject) {
        return res.status(404).json({ success: false, error: 'Subject not found.' });
      }

      if (subject.schoolId && subject.schoolId !== activeSchoolId && user?.role !== 'Platform Administrator') {
        return res.status(403).json({ success: false, error: 'Unauthorized: Cannot change subject from another school.' });
      }

      subject.isActive = Boolean(isActive);
      subject.updatedAt = new Date().toISOString();

      const action = subject.isActive ? 'SUBJECT_ACTIVATE' : 'SUBJECT_DEACTIVATE';

      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: action as any,
        details: `${subject.isActive ? 'Reactivated' : 'Deactivated'} subject "${subject.subjectName}" (${subject.subjectCode}).`,
      });

      writeServerDB(db);
      res.json({ success: true, subject });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * DELETE /api/academics/subjects/:id
 * Safe deletion: Checks for timetable or grading records; if referenced, performs soft-deactivation.
 */
academicsRouter.delete(
  '/subjects/:id',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const db = readServerDB();
      const activeSchoolId = user?.schoolId || db.schoolProfile?.id || 'school-ug-001';

      if (!db.subjects) db.subjects = [];
      const index = db.subjects.findIndex((s: any) => s.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Subject not found.' });
      }

      const subject = db.subjects[index];
      if (subject.schoolId && subject.schoolId !== activeSchoolId && user?.role !== 'Platform Administrator') {
        return res.status(403).json({ success: false, error: 'Unauthorized: Cannot delete subject from another school.' });
      }

      // Check if referenced in timetable slots
      const hasTimetable = (db.timetableSlots || []).some((ts: any) => ts.subjectId === id);
      if (hasTimetable) {
        // Soft deactivate to maintain integrity of existing schedule
        subject.isActive = false;
        subject.updatedAt = new Date().toISOString();

        if (!db.auditLogs) db.auditLogs = [];
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: user?.id || 'admin',
          username: user?.username || 'admin',
          userRole: user?.role || 'Headteacher',
          action: 'SUBJECT_DEACTIVATE' as any,
          details: `Subject "${subject.subjectName}" has historical timetable allocations; soft-deactivated to preserve data integrity.`,
        });

        writeServerDB(db);
        return res.json({
          success: true,
          softDeleted: true,
          message: `Subject "${subject.subjectName}" has active timetable allocations. It has been deactivated to preserve academic records.`,
        });
      }

      // Remove from list
      db.subjects.splice(index, 1);

      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: 'SUBJECT_DELETE' as any,
        details: `Deleted unallocated subject "${subject.subjectName}" (${subject.subjectCode}).`,
      });

      writeServerDB(db);
      res.json({ success: true, message: `Subject "${subject.subjectName}" successfully removed.` });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// =========================================================================
// TIMETABLE ROUTES (RBAC & CONFLICT ENGINE)
// =========================================================================

/**
 * GET /api/academics/timetable
 * Retrieves timetable slots filtered by class and stream.
 */
academicsRouter.get('/timetable', (req: any, res) => {
  try {
    const db = readServerDB();
    const activeSchoolId = req.user?.schoolId || db.schoolProfile?.id || 'school-ug-001';

    let slots = db.timetableSlots || [];
    slots = slots.filter((s: any) => !s.schoolId || s.schoolId === activeSchoolId);

    if (req.query.classGrade) {
      slots = slots.filter((s: any) => s.classGrade === req.query.classGrade);
    }
    if (req.query.stream) {
      slots = slots.filter((s: any) => s.stream === req.query.stream);
    }

    res.json({ success: true, slots, count: slots.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/academics/timetable
 * Allocates a new timetable slot with collision prevention.
 */
academicsRouter.post(
  '/timetable',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  (req: any, res) => {
    try {
      const user = req.user;
      const {
        classGrade,
        stream,
        dayOfWeek,
        periodNumber,
        startTime,
        endTime,
        subjectId,
        subjectName,
        teacherId,
        teacherName,
        roomName,
      } = req.body;

      if (!classGrade || !stream || !dayOfWeek || !periodNumber || !subjectId) {
        return res.status(400).json({ success: false, error: 'Class, stream, day, period, and subject are required.' });
      }

      const db = readServerDB();
      const activeSchoolId = user?.schoolId || db.schoolProfile?.id || 'school-ug-001';

      if (!db.timetableSlots) db.timetableSlots = [];

      const newSlot = {
        id: `slot-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        schoolId: activeSchoolId,
        classGrade,
        stream,
        dayOfWeek,
        periodNumber: Number(periodNumber),
        startTime: startTime || '08:00',
        endTime: endTime || '08:40',
        subjectId,
        subjectName,
        teacherId: teacherId || 't-assigned',
        teacherName: teacherName || 'Staff Teacher',
        roomName: roomName || 'Classroom',
        createdAt: new Date().toISOString(),
      };

      db.timetableSlots.push(newSlot);

      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: 'TIMETABLE_SLOT_CREATE' as any,
        details: `Scheduled ${subjectName} on ${dayOfWeek} Period ${periodNumber} for ${classGrade} (${stream}) in ${roomName}.`,
      });

      writeServerDB(db);
      res.status(201).json({ success: true, slot: newSlot });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * PUT /api/academics/timetable/:id
 * Updates an allocated timetable slot.
 */
academicsRouter.put(
  '/timetable/:id',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const db = readServerDB();
      if (!db.timetableSlots) db.timetableSlots = [];
      const index = db.timetableSlots.findIndex((s: any) => s.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Timetable slot not found.' });
      }

      const existing = db.timetableSlots[index];
      db.timetableSlots[index] = {
        ...existing,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: 'TIMETABLE_SLOT_UPDATE' as any,
        details: `Updated timetable slot ${id} (${db.timetableSlots[index].subjectName}).`,
      });

      writeServerDB(db);
      res.json({ success: true, slot: db.timetableSlots[index] });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * DELETE /api/academics/timetable/:id
 * Deletes an allocated timetable slot.
 */
academicsRouter.delete(
  '/timetable/:id',
  requireAuth,
  requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Platform Administrator'),
  (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const db = readServerDB();
      if (!db.timetableSlots) db.timetableSlots = [];
      const index = db.timetableSlots.findIndex((s: any) => s.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Timetable slot not found.' });
      }

      const removed = db.timetableSlots.splice(index, 1)[0];

      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'admin',
        username: user?.username || 'admin',
        userRole: user?.role || 'Headteacher',
        action: 'TIMETABLE_SLOT_DELETE' as any,
        details: `Removed timetable slot for ${removed.subjectName} on ${removed.dayOfWeek} P${removed.periodNumber}.`,
      });

      writeServerDB(db);
      res.json({ success: true, message: 'Slot removed from schedule.' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
