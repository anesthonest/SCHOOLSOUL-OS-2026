import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles, rateLimiter } from '../middleware/authMiddleware';

const router = Router();

// GET list all students with filters (Protected)
router.get('/', requireAuth, (req: any, res) => {
  try {
    const db = readServerDB();
    const { search, grade, stream, status, residence } = req.query;
    let results = db.students || [];

    // Tenant Isolation: Users can only query their school's students (unless Super Admin)
    const userSchoolId = req.user?.schoolId;
    const userRole = req.user?.role;
    if (userSchoolId && userRole !== 'Super Admin') {
      results = results.filter((s: any) => !s.schoolId || s.schoolId === userSchoolId);
    }

    if (status && status !== 'All') {
      results = results.filter((s) => s.status === status);
    }

    if (grade && grade !== 'All') {
      results = results.filter((s) => s.classGrade === grade);
    }

    if (stream && stream !== 'All') {
      results = results.filter((s) => s.stream === stream);
    }

    if (residence && residence !== 'All') {
      results = results.filter((s) => s.residenceType === residence);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.admissionNumber.toLowerCase().includes(q) ||
          (s.nationalIdOrBirthCert && s.nationalIdOrBirthCert.toLowerCase().includes(q))
      );
    }

    res.json({ students: results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single student 360-degree passport payload (Protected)
router.get('/:id', requireAuth, (req: any, res) => {
  try {
    const { id } = req.params;
    const db = readServerDB();

    const student = db.students.find((s) => s.id === id || s.studentId === id || s.admissionNumber === id);
    if (!student) return res.status(404).json({ error: 'Student Passport record not found' });

    // Tenant Isolation Check
    const userSchoolId = req.user?.schoolId;
    const userRole = req.user?.role;
    if (userSchoolId && userRole !== 'Super Admin' && student.schoolId && student.schoolId !== userSchoolId) {
      return res.status(403).json({ error: 'Access denied: student belongs to another school' });
    }

    const guardians = db.guardians.filter((g) => g.studentId === student.id);
    const documents = db.studentDocuments.filter((d) => d.studentId === student.id);
    const notes = db.studentNotes.filter((n) => n.studentId === student.id);
    const timeline = db.studentTimeline.filter((t) => t.studentId === student.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const classLogs = db.classAssignmentLogs.filter((c) => c.studentId === student.id);
    const digitalId = db.digitalIdCards.find((d) => d.studentId === student.id);

    res.json({
      student,
      guardians,
      documents,
      notes,
      timeline,
      classLogs,
      digitalId: digitalId || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create student directly (Protected - Admin, Headteacher, Registrar, DOS)
router.post('/', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)', 'Teacher', 'Registrar'), (req: any, res) => {
  try {
    const data = req.body;
    const db = readServerDB();

    const count = db.students.length + 1;
    const year = new Date().getFullYear();
    const studentId = data.studentId || `LIN-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const admissionNumber = data.admissionNumber || `ADM-${year}-${String(count).padStart(4, '0')}`;
    const qrVerificationHash = `UGA-SCH-${year}-${studentId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const fullName = `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`.trim();
    const userSchoolId = req.user?.schoolId;

    const newStudent = {
      id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      schoolId: userSchoolId || data.schoolId || db.schoolProfile?.id || 'default',
      studentId,
      admissionNumber,
      firstName: data.firstName,
      middleName: data.middleName || '',
      lastName: data.lastName,
      fullName,
      gender: data.gender || 'Male',
      dateOfBirth: data.dateOfBirth,
      bloodGroup: data.bloodGroup || '',
      nationality: data.nationality || 'Ugandan',
      nationalIdOrBirthCert: data.nationalIdOrBirthCert || '',
      religion: data.religion || '',
      primaryLanguage: data.primaryLanguage || 'English',
      photoUrl: data.photoUrl || '',
      classGrade: data.classGrade,
      stream: data.stream || 'A',
      houseOrDorm: data.houseOrDorm || '',
      residenceType: data.residenceType || 'Day',
      enrolmentDate: data.enrolmentDate || new Date().toISOString().split('T')[0],
      status: data.status || 'Active',
      previousSchool: data.previousSchool || { name: 'N/A', lastGradePassed: 'N/A' },
      medicalInfo: data.medicalInfo || { allergies: 'None' },
      specialNeeds: data.specialNeeds || '',
      qrVerificationHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.students.unshift(newStudent);

    // Initial Timeline Event
    db.studentTimeline.unshift({
      id: 'timeline-' + Date.now(),
      studentId: newStudent.id,
      eventType: 'ENROLMENT',
      title: 'Student Passport Created',
      description: `Registered student ${newStudent.fullName} in ${newStudent.classGrade}`,
      performedBy: data.operatorUsername || req.user?.username || 'Registrar',
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: data.operatorUserId || req.user?.id || 'registrar',
      username: data.operatorUsername || req.user?.username || 'Registrar',
      userRole: req.user?.role || 'Registrar',
      action: 'STUDENT_CREATE',
      details: `Created student passport for ${newStudent.fullName} (${newStudent.studentId})`,
    });

    writeServerDB(db);
    res.json({ success: true, student: newStudent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update student profile (Protected)
router.put('/:id', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)', 'Teacher', 'Registrar'), (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readServerDB();

    const index = db.students.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Student not found' });

    const existing = db.students[index];

    // Tenant Isolation Check
    const userSchoolId = req.user?.schoolId;
    const userRole = req.user?.role;
    if (userSchoolId && userRole !== 'Super Admin' && existing.schoolId && existing.schoolId !== userSchoolId) {
      return res.status(403).json({ error: 'Access denied: cannot modify student from another school.' });
    }

    const fullName = `${updates.firstName || existing.firstName} ${updates.middleName !== undefined ? updates.middleName + ' ' : existing.middleName ? existing.middleName + ' ' : ''}${updates.lastName || existing.lastName}`.trim();

    const updated = {
      ...existing,
      ...updates,
      fullName,
      updatedAt: new Date().toISOString(),
    };

    db.students[index] = updated;

    db.studentTimeline.unshift({
      id: 'timeline-' + Date.now(),
      studentId: updated.id,
      eventType: 'STATUS_CHANGE',
      title: 'Passport Record Updated',
      description: `Updated profile details for ${updated.fullName}`,
      performedBy: updates.operatorUsername || req.user?.username || 'Registrar',
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: updates.operatorUserId || req.user?.id || 'registrar',
      username: updates.operatorUsername || req.user?.username || 'Registrar',
      userRole: req.user?.role || 'Registrar',
      action: 'STUDENT_UPDATE',
      details: `Updated student passport for ${updated.fullName}`,
    });

    writeServerDB(db);
    res.json({ success: true, student: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update student status (Protected)
router.put('/:id/status', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)'), (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, reason, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();

    const student = db.students.find((s) => s.id === id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Tenant Isolation Check
    const userSchoolId = req.user?.schoolId;
    const userRole = req.user?.role;
    if (userSchoolId && userRole !== 'Super Admin' && student.schoolId && student.schoolId !== userSchoolId) {
      return res.status(403).json({ error: 'Access denied: cannot modify student from another school.' });
    }

    const prevStatus = student.status;
    student.status = status;
    student.updatedAt = new Date().toISOString();

    db.studentTimeline.unshift({
      id: 'timeline-' + Date.now(),
      studentId: student.id,
      eventType: 'STATUS_CHANGE',
      title: `Status Changed to ${status}`,
      description: `Status changed from ${prevStatus} to ${status}. ${reason ? 'Reason: ' + reason : ''}`,
      performedBy: operatorUsername || (req as any).user?.username || 'Headteacher',
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'headteacher',
      username: operatorUsername || (req as any).user?.username || 'Headteacher',
      userRole: (req as any).user?.role || 'Headteacher',
      action: 'STUDENT_STATUS_CHANGE',
      details: `Changed student status for ${student.fullName} to ${status}`,
    });

    writeServerDB(db);
    res.json({ success: true, student });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST class assignment / stream transfer (Protected)
router.post('/:id/class-transfer', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)', 'Registrar'), (req, res) => {
  try {
    const { id } = req.params;
    const { newClass, newStream, academicYear, reason, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();

    const student = db.students.find((s) => s.id === id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const previousClass = student.classGrade;
    const previousStream = student.stream;

    student.classGrade = newClass;
    if (newStream) student.stream = newStream;
    student.updatedAt = new Date().toISOString();

    const logItem = {
      id: 'classlog-' + Date.now(),
      studentId: student.id,
      previousClass,
      newClass,
      previousStream,
      newStream: newStream || previousStream,
      academicYear: academicYear || '2026',
      reason: reason || 'Academic Promotion/Transfer',
      assignedBy: operatorUsername || (req as any).user?.username || 'Registrar',
      timestamp: new Date().toISOString(),
    };

    db.classAssignmentLogs.unshift(logItem);

    db.studentTimeline.unshift({
      id: 'timeline-' + Date.now(),
      studentId: student.id,
      eventType: 'CLASS_ASSIGNMENT',
      title: 'Class/Stream Reassigned',
      description: `Transferred from ${previousClass} (${previousStream}) to ${newClass} (${newStream || previousStream}). Reason: ${reason || 'Regular Promotion'}`,
      performedBy: operatorUsername || (req as any).user?.username || 'Registrar',
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'registrar',
      username: operatorUsername || (req as any).user?.username || 'Registrar',
      userRole: (req as any).user?.role || 'Registrar',
      action: 'CLASS_TRANSFER',
      details: `Reassigned class for ${student.fullName} to ${newClass} ${newStream || ''}`,
    });

    writeServerDB(db);
    res.json({ success: true, student, classLog: logItem });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST upload document attachment (Protected)
router.post('/:id/documents', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, fileType, fileData, fileName, fileSize, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();

    const student = db.students.find((s) => s.id === id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const newDoc = {
      id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: student.id,
      title: title || fileName || 'Student Document',
      category: category || 'Other',
      fileType: fileType || 'application/pdf',
      fileData: fileData || '',
      fileName: fileName || 'document.pdf',
      fileSize: fileSize || 0,
      verificationStatus: 'Pending',
      uploadedBy: operatorUsername || (req as any).user?.username || 'Registrar',
      uploadedAt: new Date().toISOString(),
    };

    db.studentDocuments.unshift(newDoc);

    db.studentTimeline.unshift({
      id: 'timeline-' + Date.now(),
      studentId: student.id,
      eventType: 'DOCUMENT_UPLOAD',
      title: `Document Uploaded: ${newDoc.category}`,
      description: `Uploaded file ${newDoc.fileName} (${newDoc.title})`,
      performedBy: operatorUsername || (req as any).user?.username || 'Registrar',
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'registrar',
      username: operatorUsername || (req as any).user?.username || 'Registrar',
      userRole: (req as any).user?.role || 'Registrar',
      action: 'DOCUMENT_UPLOAD',
      details: `Uploaded ${newDoc.category} for student ${student.fullName}`,
    });

    writeServerDB(db);
    res.json({ success: true, document: newDoc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT verify or reject document (Protected - Admin, Headteacher, DOS, Registrar)
router.put('/:id/documents/:docId/verify', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)', 'Registrar'), (req, res) => {
  try {
    const { id, docId } = req.params;
    const { verificationStatus, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();

    const doc = db.studentDocuments.find((d) => d.id === docId && d.studentId === id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    doc.verificationStatus = verificationStatus;
    doc.verifiedBy = operatorUsername || (req as any).user?.username || 'Registrar';
    doc.verifiedAt = new Date().toISOString();

    db.studentTimeline.unshift({
      id: 'timeline-' + Date.now(),
      studentId: id,
      eventType: 'DOCUMENT_VERIFIED',
      title: `Document ${verificationStatus}: ${doc.title}`,
      description: `Document ${doc.title} (${doc.category}) was ${verificationStatus.toLowerCase()} by ${operatorUsername || (req as any).user?.username || 'Registrar'}`,
      performedBy: operatorUsername || (req as any).user?.username || 'Registrar',
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'registrar',
      username: operatorUsername || (req as any).user?.username || 'Registrar',
      userRole: (req as any).user?.role || 'Registrar',
      action: 'DOCUMENT_VERIFY',
      details: `Set verification status of ${doc.title} to ${verificationStatus}`,
    });

    writeServerDB(db);
    res.json({ success: true, document: doc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST add confidential/general student note (Protected)
router.post('/:id/notes', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { category, note, isConfidential, authorId, authorName } = req.body;
    const db = readServerDB();

    const student = db.students.find((s) => s.id === id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const newNote = {
      id: 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: student.id,
      category: category || 'General',
      note,
      authorId: authorId || (req as any).user?.id || 'usr-1',
      authorName: authorName || (req as any).user?.username || 'Staff Member',
      isConfidential: Boolean(isConfidential),
      createdAt: new Date().toISOString(),
    };

    db.studentNotes.unshift(newNote);

    db.studentTimeline.unshift({
      id: 'timeline-' + Date.now(),
      studentId: student.id,
      eventType: 'NOTE_ADDED',
      title: `Staff Note Added (${category})`,
      description: `${isConfidential ? '[Confidential] ' : ''}${note.substring(0, 80)}${note.length > 80 ? '...' : ''}`,
      performedBy: authorName || (req as any).user?.username || 'Staff Member',
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: authorId || (req as any).user?.id || 'staff',
      username: authorName || (req as any).user?.username || 'Staff',
      userRole: (req as any).user?.role || 'Teacher',
      action: 'NOTE_ADD',
      details: `Added ${category} note for student ${student.fullName}`,
    });

    writeServerDB(db);
    res.json({ success: true, note: newNote });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST generate / reissue Digital ID Card (Protected)
router.post('/:id/digital-id', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Registrar'), (req, res) => {
  try {
    const { id } = req.params;
    const { operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();

    const student = db.students.find((s) => s.id === id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const year = new Date().getFullYear();
    const cardSerialNumber = `ID-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrPayload = JSON.stringify({
      studentId: student.studentId,
      admissionNo: student.admissionNumber,
      name: student.fullName,
      grade: student.classGrade,
      stream: student.stream,
      status: student.status,
      hash: student.qrVerificationHash,
    });

    const newIdCard = {
      id: 'id-' + Date.now(),
      studentId: student.id,
      cardSerialNumber,
      qrPayload,
      issuedAt: new Date().toISOString(),
      expiresAt: `${year + 1}-12-31`,
      status: 'Active',
      issuedBy: operatorUsername || (req as any).user?.username || 'Registrar',
    };

    // Remove existing active card if any
    db.digitalIdCards = db.digitalIdCards.filter((c) => c.studentId !== student.id);
    db.digitalIdCards.unshift(newIdCard);

    db.studentTimeline.unshift({
      id: 'timeline-' + Date.now(),
      studentId: student.id,
      eventType: 'ID_ISSUED',
      title: 'Digital ID Card Issued',
      description: `Issued ID serial #${cardSerialNumber} valid through ${newIdCard.expiresAt}`,
      performedBy: operatorUsername || (req as any).user?.username || 'Registrar',
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'registrar',
      username: operatorUsername || (req as any).user?.username || 'Registrar',
      userRole: (req as any).user?.role || 'Registrar',
      action: 'DIGITAL_ID_GENERATE',
      details: `Issued Digital ID Card #${cardSerialNumber} for ${student.fullName}`,
    });

    writeServerDB(db);
    res.json({ success: true, digitalId: newIdCard });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST bulk CSV import (Protected - Admin, Headteacher, Registrar)
router.post('/bulk-import', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Registrar'), (req, res) => {
  try {
    const { records, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'No student records provided for import' });
    }

    const importedStudents = [];
    const year = new Date().getFullYear();

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const count = db.students.length + 1;
      const studentId = rec.studentId || `LIN-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      const admissionNumber = rec.admissionNumber || `ADM-${year}-${String(count).padStart(4, '0')}`;
      const qrVerificationHash = `UGA-SCH-${year}-${studentId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const fullName = `${rec.firstName} ${rec.middleName ? rec.middleName + ' ' : ''}${rec.lastName}`.trim();

      const newStudent = {
        id: 'stu-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substring(2, 5),
        studentId,
        admissionNumber,
        firstName: rec.firstName,
        middleName: rec.middleName || '',
        lastName: rec.lastName,
        fullName,
        gender: rec.gender || 'Male',
        dateOfBirth: rec.dateOfBirth || '2012-01-01',
        nationality: rec.nationality || 'Ugandan',
        nationalIdOrBirthCert: rec.nationalIdOrBirthCert || `BC-${Math.floor(100000 + Math.random() * 900000)}`,
        classGrade: rec.classGrade || 'Primary 1',
        stream: rec.stream || 'A',
        residenceType: rec.residenceType || 'Day',
        enrolmentDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        qrVerificationHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.students.unshift(newStudent);
      importedStudents.push(newStudent);

      if (rec.guardianName && rec.guardianPhone) {
        db.guardians.push({
          id: 'gdn-' + Date.now() + '-' + i,
          studentId: newStudent.id,
          fullName: rec.guardianName,
          relationship: rec.guardianRelationship || 'Parent',
          phoneNumber: rec.guardianPhone,
          nationalId: `CM-${Math.floor(10000000 + Math.random() * 90000000)}`,
          residentialAddress: rec.guardianAddress || 'Uganda',
          isPrimaryContact: true,
          isEmergencyContact: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'registrar',
      username: operatorUsername || (req as any).user?.username || 'Registrar',
      userRole: (req as any).user?.role || 'Registrar',
      action: 'STUDENT_CREATE',
      details: `Bulk imported ${importedStudents.length} student records into database`,
    });

    writeServerDB(db);
    res.json({ success: true, count: importedStudents.length, students: importedStudents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST verify QR payload or Student ID (Rate Limited terminal scan)
router.post('/verify-qr', rateLimiter(60, 60000), (req, res) => {
  try {
    const { qrString, studentId } = req.body;
    const db = readServerDB();

    let foundStudent = null;

    if (studentId) {
      foundStudent = db.students.find(
        (s) => s.studentId.toLowerCase() === studentId.toLowerCase() || s.admissionNumber.toLowerCase() === studentId.toLowerCase()
      );
    } else if (qrString) {
      try {
        const parsed = JSON.parse(qrString);
        if (parsed.studentId) {
          foundStudent = db.students.find((s) => s.studentId === parsed.studentId);
        }
      } catch {
        // Plain text string search
        foundStudent = db.students.find(
          (s) =>
            s.qrVerificationHash === qrString ||
            s.studentId.toLowerCase() === qrString.toLowerCase() ||
            s.admissionNumber.toLowerCase() === qrString.toLowerCase()
        );
      }
    }

    if (!foundStudent) {
      return res.status(404).json({
        verified: false,
        message: 'No active student record matches the scanned QR code or ID.',
      });
    }

    const digitalId = db.digitalIdCards.find((c) => c.studentId === foundStudent.id);
    const primaryGuardian = db.guardians.find((g) => g.studentId === foundStudent.id && g.isPrimaryContact);

    res.json({
      verified: foundStudent.status === 'Active',
      status: foundStudent.status,
      student: {
        id: foundStudent.id,
        studentId: foundStudent.studentId,
        admissionNumber: foundStudent.admissionNumber,
        fullName: foundStudent.fullName,
        gender: foundStudent.gender,
        classGrade: foundStudent.classGrade,
        stream: foundStudent.stream,
        residenceType: foundStudent.residenceType,
        photoUrl: foundStudent.photoUrl,
        guardianName: primaryGuardian?.fullName || 'N/A',
        guardianPhone: primaryGuardian?.phoneNumber || 'N/A',
      },
      digitalId: digitalId || null,
      message: foundStudent.status === 'Active' ? 'Student Identity Verified Successfully' : `Warning: Student status is ${foundStudent.status}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
