import { Router } from 'express';
import { readServerDB, writeServerDB } from '../db/store';
import { requireAuth, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// GET all admissions (Protected)
router.get('/', requireAuth, (req, res) => {
  try {
    const db = readServerDB();
    const { status, grade, search } = req.query;
    let results = db.admissions || [];

    if (status && status !== 'All') {
      results = results.filter((a) => a.status === status);
    }

    if (grade && grade !== 'All') {
      results = results.filter((a) => a.appliedGrade === grade);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (a) =>
          a.applicationNumber.toLowerCase().includes(q) ||
          a.applicantFullName.toLowerCase().includes(q) ||
          a.guardianName.toLowerCase().includes(q) ||
          a.guardianPhone.includes(q)
      );
    }

    res.json({ admissions: results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single admission by ID (Protected)
router.get('/:id', requireAuth, (req, res) => {
  try {
    const db = readServerDB();
    const application = db.admissions.find((a) => a.id === req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Admission application not found' });
    }
    res.json({ application });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create admission application (Protected or Authorized portal)
router.post('/', requireAuth, (req, res) => {
  try {
    const data = req.body;
    const db = readServerDB();

    const count = db.admissions.length + 1;
    const year = new Date().getFullYear();
    const applicationNumber = `APP-${year}-${String(count).padStart(4, '0')}`;

    const newApplication = {
      id: 'app-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      applicationNumber,
      applicantFirstName: data.applicantFirstName,
      applicantMiddleName: data.applicantMiddleName || '',
      applicantLastName: data.applicantLastName,
      applicantFullName: `${data.applicantFirstName} ${data.applicantMiddleName ? data.applicantMiddleName + ' ' : ''}${data.applicantLastName}`.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender || 'Male',
      appliedGrade: data.appliedGrade,
      residenceType: data.residenceType || 'Day',
      academicYear: data.academicYear || String(year),
      status: data.status || 'Submitted',
      submissionDate: new Date().toISOString(),
      previousSchoolName: data.previousSchoolName || '',
      previousGrade: data.previousGrade || '',
      previousAggregate: data.previousAggregate || '',
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianRelationship: data.guardianRelationship || 'Parent',
      guardianEmail: data.guardianEmail || '',
      guardianAddress: data.guardianAddress || '',
      medicalNotes: data.medicalNotes || '',
      specialNeeds: data.specialNeeds || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.admissions.unshift(newApplication);

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: data.operatorUserId || (req as any).user?.id || 'registrar',
      username: data.operatorUsername || (req as any).user?.username || 'Registrar',
      userRole: (req as any).user?.role || 'Registrar',
      action: 'ADMISSION_CREATE',
      details: `Created admission application ${newApplication.applicationNumber} for ${newApplication.applicantFullName}`,
    });

    writeServerDB(db);
    res.json({ success: true, application: newApplication });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update admission application details or status (Protected - Admin, Headteacher, Registrar, DOS)
router.put('/:id', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Director of Studies (DOS)', 'Registrar'), (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readServerDB();

    const index = db.admissions.findIndex((a) => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Application not found' });

    const existing = db.admissions[index];
    const updated = {
      ...existing,
      ...updates,
      applicantFullName: updates.applicantFirstName || updates.applicantLastName
        ? `${updates.applicantFirstName || existing.applicantFirstName} ${updates.applicantMiddleName !== undefined ? updates.applicantMiddleName + ' ' : existing.applicantMiddleName ? existing.applicantMiddleName + ' ' : ''}${updates.applicantLastName || existing.applicantLastName}`.trim()
        : existing.applicantFullName,
      updatedAt: new Date().toISOString(),
    };

    db.admissions[index] = updated;

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: updates.operatorUserId || (req as any).user?.id || 'registrar',
      username: updates.operatorUsername || (req as any).user?.username || 'Registrar',
      userRole: (req as any).user?.role || 'Registrar',
      action: 'ADMISSION_UPDATE',
      details: `Updated admission application ${existing.applicationNumber} (${updated.status})`,
    });

    writeServerDB(db);
    res.json({ success: true, application: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST enroll applicant -> automatically converts approved application into full Student Passport (Protected - Admin, Headteacher, Registrar)
router.post('/:id/enroll', requireAuth, requireRoles('Administrator', 'School Owner', 'Head Teacher', 'Headteacher', 'Registrar'), (req, res) => {
  try {
    const { id } = req.params;
    const { classGrade, stream, houseOrDorm, operatorUserId, operatorUsername } = req.body;
    const db = readServerDB();

    const application = db.admissions.find((a) => a.id === id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const studentCount = db.students.length + 1;
    const year = new Date().getFullYear();
    const studentId = `LIN-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const admissionNumber = `ADM-${year}-${String(studentCount).padStart(4, '0')}`;
    const qrVerificationHash = `UGA-SCH-${year}-${studentId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const newStudent = {
      id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId,
      admissionNumber,
      firstName: application.applicantFirstName,
      middleName: application.applicantMiddleName || '',
      lastName: application.applicantLastName,
      fullName: application.applicantFullName,
      gender: application.gender,
      dateOfBirth: application.dateOfBirth,
      nationality: 'Ugandan',
      nationalIdOrBirthCert: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
      classGrade: classGrade || application.appliedGrade,
      stream: stream || 'A',
      houseOrDorm: houseOrDorm || '',
      residenceType: application.residenceType || 'Day',
      enrolmentDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      previousSchool: {
        name: application.previousSchoolName || 'N/A',
        lastGradePassed: application.previousGrade || 'N/A',
        aggregateScore: application.previousAggregate || '',
      },
      medicalInfo: {
        allergies: application.medicalNotes || 'None reported',
        chronicConditions: 'None',
        emergencyInstructions: 'Contact Guardian immediately',
      },
      specialNeeds: application.specialNeeds || '',
      qrVerificationHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create Guardian record
    const newGuardian = {
      id: 'gdn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: newStudent.id,
      fullName: application.guardianName,
      relationship: application.guardianRelationship || 'Parent',
      phoneNumber: application.guardianPhone,
      email: application.guardianEmail || '',
      nationalId: `CM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      residentialAddress: application.guardianAddress || 'Kampala, Uganda',
      isPrimaryContact: true,
      isEmergencyContact: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Initial Timeline Event
    const initialTimeline = {
      id: 'timeline-' + Date.now(),
      studentId: newStudent.id,
      eventType: 'ENROLMENT',
      title: 'Student Enrolled & Passport Created',
      description: `Enrolled into ${newStudent.classGrade} (${newStudent.stream}) from Admission Application ${application.applicationNumber}`,
      performedBy: operatorUsername || (req as any).user?.username || 'Registrar',
      timestamp: new Date().toISOString(),
    };

    // Digital ID Card Record
    const digitalId = {
      id: 'id-' + Date.now(),
      studentId: newStudent.id,
      cardSerialNumber: `ID-${year}-${Math.floor(100000 + Math.random() * 900000)}`,
      qrPayload: JSON.stringify({
        studentId: newStudent.studentId,
        admissionNo: newStudent.admissionNumber,
        name: newStudent.fullName,
        grade: newStudent.classGrade,
        hash: qrVerificationHash,
      }),
      issuedAt: new Date().toISOString(),
      expiresAt: `${year + 1}-12-31`,
      status: 'Active',
      issuedBy: operatorUsername || (req as any).user?.username || 'Registrar',
    };

    // Update application status
    application.status = 'Enrolled';
    application.createdStudentId = newStudent.id;
    application.updatedAt = new Date().toISOString();

    db.students.unshift(newStudent);
    db.guardians.push(newGuardian);
    db.studentTimeline.unshift(initialTimeline);
    db.digitalIdCards.unshift(digitalId);

    db.auditLogs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: operatorUserId || (req as any).user?.id || 'registrar',
      username: operatorUsername || (req as any).user?.username || 'Registrar',
      userRole: (req as any).user?.role || 'Registrar',
      action: 'ADMISSION_APPROVE',
      details: `Enrolled student ${newStudent.fullName} (${newStudent.studentId}) from admission ${application.applicationNumber}`,
    });

    writeServerDB(db);

    res.json({
      success: true,
      student: newStudent,
      guardian: newGuardian,
      digitalId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
