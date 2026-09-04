import { db } from '../db/indexedDB';
import { isServerOnline, queueOfflineAction, API_BASE, getAuthHeaders } from './api';
import { formatPersonName } from '../utils/nameUtils';
import type {
  Student,
  Guardian,
  AdmissionApplication,
  StudentDocument,
  StudentTimelineEvent,
  StudentNote,
  ClassAssignmentLog,
  DigitalIDCard,
} from '../types';

// Seed Initial Sample Students & Admissions if empty (for offline demo readiness)
let isSeedingStudentPromise: Promise<void> | null = null;

export async function seedSampleStudentDataIfEmpty(): Promise<void> {
  if (isSeedingStudentPromise) {
    return isSeedingStudentPromise;
  }

  isSeedingStudentPromise = (async () => {
    try {
      const studentCount = await db.students.count();
      if (studentCount === 0) {
        const year = new Date().getFullYear();
        const sampleStudents: Student[] = [
      {
        id: 'stu-sample-1',
        studentId: `LIN-${year}-1042`,
        admissionNumber: `ADM-${year}-0001`,
        firstName: 'Kato',
        middleName: 'Joseph',
        lastName: 'Mugisha',
        fullName: 'Kato Joseph Mugisha',
        gender: 'Male',
        dateOfBirth: '2012-04-12',
        bloodGroup: 'O+',
        nationality: 'Ugandan',
        nationalIdOrBirthCert: 'BC-849201',
        religion: 'Christian',
        primaryLanguage: 'English & Luganda',
        classGrade: 'Primary 7',
        stream: 'East',
        houseOrDorm: 'Kabalega House',
        residenceType: 'Boarding',
        enrolmentDate: '2024-02-05',
        status: 'Active',
        previousSchool: {
          name: 'St. Mary Primary School Kampala',
          lastGradePassed: 'Primary 6',
          aggregateScore: '4 Aggregates (PLE Prep)',
        },
        medicalInfo: {
          allergies: 'Penicillin allergy',
          chronicConditions: 'Asthma (Uses Inhaler)',
          emergencyInstructions: 'Contact Mother & Administer Ventolin',
        },
        specialNeeds: 'Sits near chalkboard for vision clarity',
        qrVerificationHash: `UGA-SCH-${year}-LIN-${year}-1042-VERIFIED-9831`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'stu-sample-2',
        studentId: `LIN-${year}-2109`,
        admissionNumber: `ADM-${year}-0002`,
        firstName: 'Nalubega',
        middleName: 'Grace',
        lastName: 'Akello',
        fullName: 'Nalubega Grace Akello',
        gender: 'Female',
        dateOfBirth: '2013-09-24',
        bloodGroup: 'A+',
        nationality: 'Ugandan',
        nationalIdOrBirthCert: 'BC-920182',
        religion: 'Christian',
        primaryLanguage: 'English',
        classGrade: 'Primary 6',
        stream: 'Blue',
        houseOrDorm: 'Speke House',
        residenceType: 'Day',
        enrolmentDate: '2025-01-15',
        status: 'Active',
        previousSchool: {
          name: 'Hillside Primary School Naalya',
          lastGradePassed: 'Primary 5',
        },
        medicalInfo: {
          allergies: 'None',
          chronicConditions: 'None',
        },
        qrVerificationHash: `UGA-SCH-${year}-LIN-${year}-2109-VERIFIED-4412`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'stu-sample-3',
        studentId: `LIN-${year}-3341`,
        admissionNumber: `ADM-${year}-0003`,
        firstName: 'Ochola',
        middleName: 'David',
        lastName: 'Okello',
        fullName: 'Ochola David Okello',
        gender: 'Male',
        dateOfBirth: '2011-11-03',
        bloodGroup: 'B+',
        nationality: 'Ugandan',
        nationalIdOrBirthCert: 'BC-339210',
        religion: 'Anglican',
        primaryLanguage: 'English & Acholi',
        classGrade: 'Senior 1',
        stream: 'Stream A',
        houseOrDorm: 'Lumumba Hall',
        residenceType: 'Boarding',
        enrolmentDate: '2026-02-01',
        status: 'Active',
        previousSchool: {
          name: 'Gulu Public Primary School',
          lastGradePassed: 'Primary 7',
          aggregateScore: '6 Aggregates',
        },
        medicalInfo: {
          allergies: 'Peanut allergy',
        },
        qrVerificationHash: `UGA-SCH-${year}-LIN-${year}-3341-VERIFIED-7718`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await db.students.bulkPut(sampleStudents);

    const sampleGuardians: Guardian[] = [
      {
        id: 'gdn-sample-1',
        studentId: 'stu-sample-1',
        fullName: 'Dr. Mugisha Charles',
        relationship: 'Father',
        phoneNumber: '+256 772 123 456',
        alternatePhone: '+256 701 987 654',
        email: 'charles.mugisha@health.go.ug',
        nationalId: 'CM84029102911A',
        occupation: 'Medical Doctor',
        residentialAddress: 'Plot 14 Kololo Terrace, Kampala',
        isPrimaryContact: true,
        isEmergencyContact: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'gdn-sample-2',
        studentId: 'stu-sample-2',
        fullName: 'Mrs. Akello Harriet',
        relationship: 'Mother',
        phoneNumber: '+256 752 889 900',
        email: 'harriet.akello@gmail.com',
        nationalId: 'CF91028301920B',
        occupation: 'Senior Accountant',
        residentialAddress: 'Naalya Housing Estate, Ntinda',
        isPrimaryContact: true,
        isEmergencyContact: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await db.guardians.bulkPut(sampleGuardians);

    const sampleAdmissions: AdmissionApplication[] = [
      {
        id: 'app-sample-1',
        applicationNumber: `APP-${year}-0001`,
        applicantFirstName: 'Mirembe',
        applicantMiddleName: 'Sarah',
        applicantLastName: 'Tumusiime',
        applicantFullName: 'Mirembe Sarah Tumusiime',
        dateOfBirth: '2014-06-18',
        gender: 'Female',
        appliedGrade: 'Primary 5',
        residenceType: 'Day',
        academicYear: String(year),
        status: 'Under Review',
        submissionDate: new Date().toISOString(),
        previousSchoolName: 'Budo Junior School',
        previousGrade: 'Primary 4',
        previousAggregate: '8 Division 1',
        guardianName: 'Eng. Tumusiime Paul',
        guardianPhone: '+256 782 554 433',
        guardianRelationship: 'Father',
        guardianEmail: 'paul.tumusiime@engineering.co.ug',
        guardianAddress: 'Bugolobi Phase II, Kampala',
        medicalNotes: 'No known medical issues',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'app-sample-2',
        applicationNumber: `APP-${year}-0002`,
        applicantFirstName: 'Sserwadda',
        applicantLastName: 'Brian',
        applicantFullName: 'Sserwadda Brian',
        dateOfBirth: '2012-01-10',
        gender: 'Male',
        appliedGrade: 'Primary 7',
        residenceType: 'Boarding',
        academicYear: String(year),
        status: 'Approved',
        submissionDate: new Date().toISOString(),
        previousSchoolName: 'City Parents School Kampala',
        previousGrade: 'Primary 6',
        guardianName: 'Namatovu Florence',
        guardianPhone: '+256 703 112 233',
        guardianRelationship: 'Mother',
        guardianAddress: 'Kisaasi Central, Kampala',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await db.admissions.bulkPut(sampleAdmissions);

    const sampleDigitalIds: DigitalIDCard[] = [
      {
        id: 'id-sample-1',
        studentId: 'stu-sample-1',
        cardSerialNumber: `ID-${year}-884102`,
        qrPayload: JSON.stringify({
          studentId: `LIN-${year}-1042`,
          admissionNo: `ADM-${year}-0001`,
          name: 'Kato Joseph Mugisha',
          grade: 'Primary 7',
          hash: `UGA-SCH-${year}-LIN-${year}-1042-VERIFIED-9831`,
        }),
        issuedAt: new Date().toISOString(),
        expiresAt: `${year + 1}-12-31`,
        status: 'Active',
        issuedBy: 'Registrar',
      },
    ];

    await db.digitalIdCards.bulkPut(sampleDigitalIds);

    const sampleTimeline: StudentTimelineEvent[] = [
      {
        id: 'timeline-sample-1',
        studentId: 'stu-sample-1',
        eventType: 'ENROLMENT',
        title: 'Enrolled into Primary 7 (Boarding)',
        description: 'Successfully admitted and completed passport registration',
        performedBy: 'Registrar',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'timeline-sample-2',
        studentId: 'stu-sample-1',
        eventType: 'ID_ISSUED',
        title: 'Official Digital Student ID Card Issued',
        description: 'Card Serial #ID-2026-884102 activated',
        performedBy: 'Registrar',
        timestamp: new Date().toISOString(),
      },
    ];

    await db.studentTimeline.bulkPut(sampleTimeline);
  }
} catch (err) {
  console.warn('seedSampleStudentDataIfEmpty warning (handled):', err);
} finally {
  isSeedingStudentPromise = null;
}
})();

return isSeedingStudentPromise;
}

// ADMISSIONS API
export async function fetchAllAdmissions(statusFilter?: string, gradeFilter?: string): Promise<AdmissionApplication[]> {
  await seedSampleStudentDataIfEmpty();
  try {
    if (await isServerOnline()) {
      let url = `${API_BASE}/admissions`;
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (gradeFilter && gradeFilter !== 'All') params.append('grade', gradeFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.admissions)) {
          await db.admissions.bulkPut(data.admissions);
          return data.admissions;
        }
      }
    }
  } catch (err) {
    console.warn('Fetch admissions server error, using local IndexedDB', err);
  }

  let list = await db.admissions.toArray();
  if (statusFilter && statusFilter !== 'All') {
    list = list.filter((a) => a.status === statusFilter);
  }
  if (gradeFilter && gradeFilter !== 'All') {
    list = list.filter((a) => a.appliedGrade === gradeFilter);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createAdmissionApplication(data: Partial<AdmissionApplication>, operatorUserId?: string, operatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/admissions`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit admission application');
    if (result.application) await db.admissions.put(result.application);
    return result.application;
  } else {
    // Offline local creation
    const count = (await db.admissions.count()) + 1;
    const year = new Date().getFullYear();
    const applicationNumber = `APP-${year}-${String(count).padStart(4, '0')}`;
    const newApp: AdmissionApplication = {
      id: 'app-' + Date.now(),
      applicationNumber,
      applicantFirstName: data.applicantFirstName || 'Applicant',
      applicantMiddleName: data.applicantMiddleName || '',
      applicantLastName: data.applicantLastName || 'Student',
      applicantFullName: formatPersonName(data.applicantFirstName, data.applicantMiddleName, data.applicantLastName, 'Applicant Student'),
      dateOfBirth: data.dateOfBirth || '2014-01-01',
      gender: data.gender || 'Male',
      appliedGrade: data.appliedGrade || 'Primary 1',
      residenceType: data.residenceType || 'Day',
      academicYear: data.academicYear || String(year),
      status: data.status || 'Submitted',
      submissionDate: new Date().toISOString(),
      previousSchoolName: data.previousSchoolName || '',
      previousGrade: data.previousGrade || '',
      previousAggregate: data.previousAggregate || '',
      guardianName: data.guardianName || 'Guardian',
      guardianPhone: data.guardianPhone || '+256 700 000 000',
      guardianRelationship: data.guardianRelationship || 'Parent',
      guardianEmail: data.guardianEmail || '',
      guardianAddress: data.guardianAddress || 'Uganda',
      medicalNotes: data.medicalNotes || '',
      specialNeeds: data.specialNeeds || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.admissions.put(newApp);
    await queueOfflineAction('admission', 'CREATE', newApp);
    return newApp;
  }
}

export async function updateAdmissionStatus(id: string, status: AdmissionApplication['status'], reviewerNotes?: string, operatorUserId?: string, operatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/admissions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, reviewerNotes, operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update admission status');
    if (result.application) await db.admissions.put(result.application);
    return result.application;
  } else {
    const existing = await db.admissions.get(id);
    if (!existing) throw new Error('Application not found');
    const updated = {
      ...existing,
      status,
      reviewerNotes: reviewerNotes !== undefined ? reviewerNotes : existing.reviewerNotes,
      updatedAt: new Date().toISOString(),
    };
    await db.admissions.put(updated);
    await queueOfflineAction('admission', 'UPDATE', updated);
    return updated;
  }
}

export async function enrollAdmissionApplicant(id: string, classGrade: string, stream: string, houseOrDorm?: string, operatorUserId?: string, operatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/admissions/${id}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ classGrade, stream, houseOrDorm, operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to enroll applicant');
    if (result.student) await db.students.put(result.student);
    if (result.guardian) await db.guardians.put(result.guardian);
    if (result.digitalId) await db.digitalIdCards.put(result.digitalId);
    return result;
  } else {
    // Local offline enrollment
    const app = await db.admissions.get(id);
    if (!app) throw new Error('Application not found');

    const count = (await db.students.count()) + 1;
    const year = new Date().getFullYear();
    const studentId = `LIN-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const admissionNumber = `ADM-${year}-${String(count).padStart(4, '0')}`;
    const qrVerificationHash = `UGA-SCH-${year}-${studentId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const newStudent: Student = {
      id: 'stu-' + Date.now(),
      studentId,
      admissionNumber,
      firstName: app.applicantFirstName,
      middleName: app.applicantMiddleName,
      lastName: app.applicantLastName,
      fullName: app.applicantFullName,
      gender: app.gender,
      dateOfBirth: app.dateOfBirth,
      nationality: 'Ugandan',
      nationalIdOrBirthCert: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
      classGrade: classGrade || app.appliedGrade,
      stream: stream || 'A',
      houseOrDorm: houseOrDorm || '',
      residenceType: app.residenceType || 'Day',
      enrolmentDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      previousSchool: {
        name: app.previousSchoolName || 'N/A',
        lastGradePassed: app.previousGrade || 'N/A',
      },
      medicalInfo: {
        allergies: app.medicalNotes || 'None',
      },
      specialNeeds: app.specialNeeds || '',
      qrVerificationHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newGuardian: Guardian = {
      id: 'gdn-' + Date.now(),
      studentId: newStudent.id,
      fullName: app.guardianName,
      relationship: app.guardianRelationship || 'Parent',
      phoneNumber: app.guardianPhone,
      email: app.guardianEmail,
      nationalId: `CM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      residentialAddress: app.guardianAddress || 'Uganda',
      isPrimaryContact: true,
      isEmergencyContact: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const timelineEvent: StudentTimelineEvent = {
      id: 'timeline-' + Date.now(),
      studentId: newStudent.id,
      eventType: 'ENROLMENT',
      title: 'Enrolled & Passport Created',
      description: `Enrolled into ${newStudent.classGrade} (${newStudent.stream})`,
      performedBy: operatorUsername || 'Registrar',
      timestamp: new Date().toISOString(),
    };

    const digitalId: DigitalIDCard = {
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
      issuedBy: operatorUsername || 'Registrar',
    };

    app.status = 'Enrolled';
    app.createdStudentId = newStudent.id;
    app.updatedAt = new Date().toISOString();

    await db.students.put(newStudent);
    await db.guardians.put(newGuardian);
    await db.admissions.put(app);
    await db.studentTimeline.put(timelineEvent);
    await db.digitalIdCards.put(digitalId);

    await queueOfflineAction('student', 'CREATE', newStudent);
    await queueOfflineAction('guardian', 'CREATE', newGuardian);
    await queueOfflineAction('admission', 'UPDATE', app);

    return { success: true, student: newStudent, guardian: newGuardian, digitalId };
  }
}

// STUDENTS API
export async function fetchAllStudents(searchQuery?: string, classFilter?: string, statusFilter?: string): Promise<Student[]> {
  await seedSampleStudentDataIfEmpty();
  try {
    if (await isServerOnline()) {
      let url = `${API_BASE}/students`;
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (classFilter && classFilter !== 'All') params.append('grade', classFilter);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.students)) {
          await db.students.bulkPut(data.students);
          return data.students;
        }
      }
    }
  } catch (err) {
    console.warn('Fetch students server error, fallback to IndexedDB', err);
  }

  let list = await db.students.toArray();

  if (statusFilter && statusFilter !== 'All') {
    list = list.filter((s) => s.status === statusFilter);
  }
  if (classFilter && classFilter !== 'All') {
    list = list.filter((s) => s.classGrade === classFilter);
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function fetchStudent360Passport(id: string): Promise<{
  student: Student;
  guardians: Guardian[];
  documents: StudentDocument[];
  notes: StudentNote[];
  timeline: StudentTimelineEvent[];
  classLogs: ClassAssignmentLog[];
  digitalId: DigitalIDCard | null;
}> {
  await seedSampleStudentDataIfEmpty();
  try {
    if (await isServerOnline()) {
      const res = await fetch(`${API_BASE}/students/${id}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          await db.students.put(data.student);
          if (data.guardians) await db.guardians.bulkPut(data.guardians);
          if (data.documents) await db.studentDocuments.bulkPut(data.documents);
          if (data.notes) await db.studentNotes.bulkPut(data.notes);
          if (data.timeline) await db.studentTimeline.bulkPut(data.timeline);
          if (data.digitalId) await db.digitalIdCards.put(data.digitalId);
          return data;
        }
      }
    }
  } catch (err) {
    console.warn('Fetch student 360 failed, using local IndexedDB', err);
  }

  const student = await db.students.get(id) || (await db.students.where('studentId').equals(id).first());
  if (!student) throw new Error('Student Passport not found in local store');

  const guardians = await db.guardians.where('studentId').equals(student.id).toArray();
  const documents = await db.studentDocuments.where('studentId').equals(student.id).toArray();
  const notes = await db.studentNotes.where('studentId').equals(student.id).toArray();
  const timeline = (await db.studentTimeline.where('studentId').equals(student.id).toArray()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const classLogs = await db.classAssignmentLogs.where('studentId').equals(student.id).toArray();
  const digitalId = (await db.digitalIdCards.where('studentId').equals(student.id).first()) || null;

  return { student, guardians, documents, notes, timeline, classLogs, digitalId };
}

export async function createStudentPassport(data: Partial<Student> & { guardianName?: string; guardianPhone?: string; guardianRelationship?: string }, operatorUserId?: string, operatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create student passport');
    if (result.student) await db.students.put(result.student);
    return result.student;
  } else {
    const count = (await db.students.count()) + 1;
    const year = new Date().getFullYear();
    const studentId = data.studentId || `LIN-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const admissionNumber = data.admissionNumber || `ADM-${year}-${String(count).padStart(4, '0')}`;
    const qrVerificationHash = `UGA-SCH-${year}-${studentId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const fullName = formatPersonName(data.firstName, data.middleName, data.lastName, 'New Student');

    const newStudent: Student = {
      id: 'stu-' + Date.now(),
      studentId,
      admissionNumber,
      firstName: data.firstName || 'New',
      middleName: data.middleName || '',
      lastName: data.lastName || 'Student',
      fullName,
      gender: data.gender || 'Male',
      dateOfBirth: data.dateOfBirth || '2013-01-01',
      nationality: data.nationality || 'Ugandan',
      nationalIdOrBirthCert: data.nationalIdOrBirthCert || `BC-${Math.floor(100000 + Math.random() * 900000)}`,
      classGrade: data.classGrade || 'Primary 1',
      stream: data.stream || 'A',
      houseOrDorm: data.houseOrDorm || '',
      residenceType: data.residenceType || 'Day',
      enrolmentDate: data.enrolmentDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      previousSchool: data.previousSchool || { name: 'N/A', lastGradePassed: 'N/A' },
      medicalInfo: data.medicalInfo || { allergies: 'None' },
      specialNeeds: data.specialNeeds || '',
      qrVerificationHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.students.put(newStudent);

    if (data.guardianName && data.guardianPhone) {
      const gdn: Guardian = {
        id: 'gdn-' + Date.now(),
        studentId: newStudent.id,
        fullName: data.guardianName,
        relationship: data.guardianRelationship || 'Parent',
        phoneNumber: data.guardianPhone,
        nationalId: `CM-${Math.floor(10000000 + Math.random() * 90000000)}`,
        residentialAddress: 'Uganda',
        isPrimaryContact: true,
        isEmergencyContact: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.guardians.put(gdn);
      await queueOfflineAction('guardian', 'CREATE', gdn);
    }

    const event: StudentTimelineEvent = {
      id: 'timeline-' + Date.now(),
      studentId: newStudent.id,
      eventType: 'ENROLMENT',
      title: 'Student Passport Created',
      description: `Direct registration in ${newStudent.classGrade}`,
      performedBy: operatorUsername || 'Registrar',
      timestamp: new Date().toISOString(),
    };
    await db.studentTimeline.put(event);

    await queueOfflineAction('student', 'CREATE', newStudent);
    return newStudent;
  }
}

export async function updateStudentStatus(id: string, status: Student['status'], reason?: string, operatorUserId?: string, operatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/students/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, reason, operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update student status');
    if (result.student) await db.students.put(result.student);
    return result.student;
  } else {
    const student = await db.students.get(id);
    if (!student) throw new Error('Student not found');
    student.status = status;
    student.updatedAt = new Date().toISOString();
    await db.students.put(student);

    const timeline: StudentTimelineEvent = {
      id: 'timeline-' + Date.now(),
      studentId: student.id,
      eventType: 'STATUS_CHANGE',
      title: `Status Changed to ${status}`,
      description: reason ? `Reason: ${reason}` : 'Status updated by administrator',
      performedBy: operatorUsername || 'Registrar',
      timestamp: new Date().toISOString(),
    };
    await db.studentTimeline.put(timeline);
    await queueOfflineAction('student', 'UPDATE', student);
    return student;
  }
}

export async function transferStudentClass(id: string, newClass: string, newStream: string, reason?: string, operatorUserId?: string, operatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/students/${id}/class-transfer`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ newClass, newStream, reason, operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to reassign class');
    if (result.student) await db.students.put(result.student);
    return result.student;
  } else {
    const student = await db.students.get(id);
    if (!student) throw new Error('Student not found');
    const prevClass = student.classGrade;
    student.classGrade = newClass;
    student.stream = newStream;
    student.updatedAt = new Date().toISOString();
    await db.students.put(student);

    const log: ClassAssignmentLog = {
      id: 'classlog-' + Date.now(),
      studentId: student.id,
      previousClass: prevClass,
      newClass,
      newStream,
      academicYear: '2026',
      reason: reason || 'Transfer',
      assignedBy: operatorUsername || 'Registrar',
      timestamp: new Date().toISOString(),
    };
    await db.classAssignmentLogs.put(log);

    const timeline: StudentTimelineEvent = {
      id: 'timeline-' + Date.now(),
      studentId: student.id,
      eventType: 'CLASS_ASSIGNMENT',
      title: 'Class Reassigned',
      description: `Transferred to ${newClass} (${newStream}). ${reason ? 'Reason: ' + reason : ''}`,
      performedBy: operatorUsername || 'Registrar',
      timestamp: new Date().toISOString(),
    };
    await db.studentTimeline.put(timeline);
    await queueOfflineAction('student', 'UPDATE', student);
    return student;
  }
}

export async function uploadStudentDocument(studentId: string, title: string, category: StudentDocument['category'], fileName: string, fileData: string, fileSize: number, operatorUserId?: string, operatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/students/${studentId}/documents`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title, category, fileName, fileData, fileSize, operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to upload document');
    if (result.document) await db.studentDocuments.put(result.document);
    return result.document;
  } else {
    const doc: StudentDocument = {
      id: 'doc-' + Date.now(),
      studentId,
      title: title || fileName,
      category: category || 'Other',
      fileType: 'application/octet-stream',
      fileData,
      fileName,
      fileSize: fileSize || 0,
      verificationStatus: 'Pending',
      uploadedBy: operatorUsername || 'Registrar',
      uploadedAt: new Date().toISOString(),
    };
    await db.studentDocuments.put(doc);
    await queueOfflineAction('document', 'CREATE', doc);
    return doc;
  }
}

export async function verifyStudentDocument(studentId: string, docId: string, status: 'Verified' | 'Rejected', operatorUserId?: string, operatorUsername?: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/students/${studentId}/documents/${docId}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ verificationStatus: status, operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to verify document');
    if (result.document) await db.studentDocuments.put(result.document);
    return result.document;
  } else {
    const doc = await db.studentDocuments.get(docId);
    if (!doc) throw new Error('Document not found');
    doc.verificationStatus = status;
    doc.verifiedBy = operatorUsername || 'Registrar';
    doc.verifiedAt = new Date().toISOString();
    await db.studentDocuments.put(doc);
    await queueOfflineAction('document', 'UPDATE', doc);
    return doc;
  }
}

export async function updateStudentBiodata(
  studentId: string,
  updates: Partial<Student>,
  operatorUserId?: string,
  operatorUsername?: string
): Promise<Student> {
  const student = await db.students.get(studentId) || (await db.students.where('studentId').equals(studentId).first());
  if (!student) throw new Error('Student not found');

  const fullName = updates.firstName || updates.lastName || updates.middleName !== undefined
    ? formatPersonName(
        updates.firstName || student.firstName,
        updates.middleName !== undefined ? updates.middleName : student.middleName,
        updates.lastName || student.lastName,
        student.fullName
      )
    : student.fullName;

  const updatedStudent: Student = {
    ...student,
    ...updates,
    fullName,
    updatedAt: new Date().toISOString(),
  };

  await db.students.put(updatedStudent);

  const timelineEvent: StudentTimelineEvent = {
    id: 'timeline-' + Date.now(),
    studentId: updatedStudent.id,
    eventType: 'STATUS_CHANGE',
    title: 'Biodata & Record Updated',
    description: `Profile information updated by ${operatorUsername || 'Administrator'}`,
    performedBy: operatorUsername || 'Registrar',
    timestamp: new Date().toISOString(),
  };
  await db.studentTimeline.put(timelineEvent);
  await queueOfflineAction('student', 'UPDATE', updatedStudent);

  return updatedStudent;
}

export async function addStudentNote(studentId: string, category: StudentNote['category'], note: string, isConfidential: boolean, authorId: string, authorName: string) {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/students/${studentId}/notes`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ category, note, isConfidential, authorId, authorName }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add note');
    if (result.note) await db.studentNotes.put(result.note);
    return result.note;
  } else {
    const newNote: StudentNote = {
      id: 'note-' + Date.now(),
      studentId,
      category,
      note,
      authorId,
      authorName,
      isConfidential,
      createdAt: new Date().toISOString(),
    };
    await db.studentNotes.put(newNote);
    await queueOfflineAction('note', 'CREATE', newNote);
    return newNote;
  }
}

export async function generateDigitalIdCard(studentId: string, operatorUserId?: string, operatorUsername?: string): Promise<DigitalIDCard> {
  const online = await isServerOnline();
  if (online) {
    const res = await fetch(`${API_BASE}/students/${studentId}/digital-id`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ operatorUserId, operatorUsername }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to issue digital ID');
    if (result.digitalId) await db.digitalIdCards.put(result.digitalId);
    return result.digitalId;
  } else {
    const student = await db.students.get(studentId);
    if (!student) throw new Error('Student not found');

    const year = new Date().getFullYear();
    const cardSerialNumber = `ID-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
    const card: DigitalIDCard = {
      id: 'id-' + Date.now(),
      studentId: student.id,
      cardSerialNumber,
      qrPayload: JSON.stringify({
        studentId: student.studentId,
        admissionNo: student.admissionNumber,
        name: student.fullName,
        grade: student.classGrade,
        hash: student.qrVerificationHash,
      }),
      issuedAt: new Date().toISOString(),
      expiresAt: `${year + 1}-12-31`,
      status: 'Active',
      issuedBy: operatorUsername || 'Registrar',
    };

    await db.digitalIdCards.put(card);
    await queueOfflineAction('digital_id', 'CREATE', card);
    return card;
  }
}

export async function verifyQRScanPayload(qrString: string) {
  try {
    if (await isServerOnline()) {
      const res = await fetch(`${API_BASE}/students/verify-qr`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ qrString }),
      });
      if (res.ok) return await res.json();
    }
  } catch (err) {
    console.warn('QR verification offline fallback', err);
  }

  // Offline QR search
  let student: Student | undefined;
  try {
    const parsed = JSON.parse(qrString);
    if (parsed.studentId) {
      student = await db.students.where('studentId').equals(parsed.studentId).first();
    }
  } catch {
    student = await db.students
      .where('qrVerificationHash')
      .equals(qrString)
      .or('studentId')
      .equals(qrString)
      .or('admissionNumber')
      .equals(qrString)
      .first();
  }

  if (!student) {
    return { verified: false, message: 'No matching student record found for scanned code.' };
  }

  const primaryGdn = await db.guardians.where('studentId').equals(student.id).first();
  const card = await db.digitalIdCards.where('studentId').equals(student.id).first();

  return {
    verified: student.status === 'Active',
    status: student.status,
    student: {
      id: student.id,
      studentId: student.studentId,
      admissionNumber: student.admissionNumber,
      fullName: student.fullName,
      gender: student.gender,
      classGrade: student.classGrade,
      stream: student.stream,
      residenceType: student.residenceType,
      photoUrl: student.photoUrl,
      guardianName: primaryGdn?.fullName || 'N/A',
      guardianPhone: primaryGdn?.phoneNumber || 'N/A',
    },
    digitalId: card || null,
    message: student.status === 'Active' ? 'Student Identity Verified Successfully' : `Warning: Student status is ${student.status}`,
  };
}
