import { db } from '../db/indexedDB';
import { logAuditEvent, queueOfflineAction } from './api';
import { formatPersonName } from '../utils/nameUtils';
import type { Student, Guardian, User, SchoolClass, Subject, FeeStructure } from '../types';

export type ImportCategory = 'students' | 'guardians' | 'staff' | 'classes' | 'subjects' | 'fees';

export interface ValidationError {
  rowNumber: number;
  field: string;
  value: string;
  reason: string;
  severity: 'error' | 'warning';
}

export interface ValidationSummary {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  duplicateCount: number;
  errors: ValidationError[];
  previewRows: Array<Record<string, any> & { _validationStatus: 'valid' | 'warning' | 'error'; _errors: string[] }>;
}

export interface ImportResult {
  category: ImportCategory;
  totalProcessed: number;
  successfullyImported: number;
  skipped: number;
  timestamp: string;
  auditId: string;
}

// Predefined CSV Template Schemas
export const CSV_TEMPLATES: Record<ImportCategory, { headers: string[]; sampleRow: string[] }> = {
  students: {
    headers: ['FirstName', 'MiddleName', 'LastName', 'Gender', 'DateOfBirth', 'ClassGrade', 'Stream', 'ResidenceType', 'ParentFullName', 'ParentPhone', 'ParentRelationship'],
    sampleRow: ['Joshua', 'Samuel', 'Mukasa', 'Male', '2013-05-14', 'Primary 6', 'East', 'Day', 'Grace Mukasa', '+256772123456', 'Mother'],
  },
  guardians: {
    headers: ['FullName', 'PhoneNumber', 'Email', 'NationalId', 'Relationship', 'StudentAdmissionNumber'],
    sampleRow: ['Grace Mukasa', '+256772123456', 'grace.mukasa@gmail.com', 'CM84029104', 'Mother', 'ADM-2026-0001'],
  },
  staff: {
    headers: ['FullName', 'Username', 'Email', 'Phone', 'Role', 'EmployeeNumber', 'Department', 'PrimarySubject'],
    sampleRow: ['Dr. Samuel Njoroge', 'snjoroge', 's.njoroge@school.ac.ug', '+256701987654', 'Teacher', 'EMP-042', 'Science', 'Physics'],
  },
  classes: {
    headers: ['ClassName', 'ClassCode', 'Level', 'Capacity', 'Streams'],
    sampleRow: ['Primary 6', 'P6', 'Primary', '80', 'Red, Blue, East'],
  },
  subjects: {
    headers: ['SubjectCode', 'SubjectName', 'Department', 'Classification', 'CreditUnits'],
    sampleRow: ['ENG101', 'English Language & Literature', 'Languages', 'Core', '4'],
  },
  fees: {
    headers: ['AcademicYear', 'Term', 'ClassGrade', 'TuitionFee', 'BoardingFee', 'DevelopmentFee', 'UniformFee'],
    sampleRow: ['2026', 'Term I', 'Primary 6', '650000', '400000', '150000', '120000'],
  },
};

/**
 * Generate CSV template download string
 */
export function getCsvTemplateString(category: ImportCategory): string {
  const schema = CSV_TEMPLATES[category];
  const headerLine = schema.headers.join(',');
  const sampleLine = schema.sampleRow.map((val) => `"${val.replace(/"/g, '""')}"`).join(',');
  return `${headerLine}\n${sampleLine}`;
}

/**
 * Parse CSV string into array of object rows
 */
export function parseCsvText(csvText: string): Array<Record<string, string>> {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // CSV regex supporting quotes
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = '';

    for (let j = 0; j < rawLine.length; j++) {
      const char = rawLine[j];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(rowObj);
  }

  return rows;
}

/**
 * Step 2: VALIDATE rows against category constraints
 */
export async function validateImportData(
  category: ImportCategory,
  parsedRows: Array<Record<string, string>>
): Promise<ValidationSummary> {
  const errors: ValidationError[] = [];
  const previewRows: ValidationSummary['previewRows'] = [];
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  // Existing records for duplicate detection
  const existingStudents = await db.students.toArray();
  const existingUsers = await db.users.toArray();
  const existingClasses = await db.schoolClasses.toArray();
  const existingSubjects = await db.subjects.toArray();

  const seenIds = new Set<string>();

  parsedRows.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 1-indexing, +1 for header line
    const rowErrors: string[] = [];
    let rowHasError = false;
    let rowHasWarning = false;

    if (category === 'students') {
      const firstName = row['FirstName'] || row['firstName'];
      const lastName = row['LastName'] || row['lastName'];
      const grade = row['ClassGrade'] || row['classGrade'] || row['Grade'];
      const gender = row['Gender'] || row['gender'];
      const dob = row['DateOfBirth'] || row['dateOfBirth'];

      if (!firstName || firstName.length < 2) {
        errors.push({ rowNumber: rowNum, field: 'FirstName', value: firstName || '', reason: 'First Name is required (min 2 chars)', severity: 'error' });
        rowErrors.push('Missing First Name');
        rowHasError = true;
      }
      if (!lastName || lastName.length < 2) {
        errors.push({ rowNumber: rowNum, field: 'LastName', value: lastName || '', reason: 'Last Name is required (min 2 chars)', severity: 'error' });
        rowErrors.push('Missing Last Name');
        rowHasError = true;
      }
      if (!grade) {
        errors.push({ rowNumber: rowNum, field: 'ClassGrade', value: '', reason: 'Class / Grade is required', severity: 'error' });
        rowErrors.push('Missing Class/Grade');
        rowHasError = true;
      }

      if (dob && isNaN(Date.parse(dob))) {
        errors.push({ rowNumber: rowNum, field: 'DateOfBirth', value: dob, reason: 'Invalid Date of Birth format (expected YYYY-MM-DD)', severity: 'warning' });
        rowErrors.push('Invalid DOB format');
        rowHasWarning = true;
      }

      // Check duplicates in existing database
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
      const isDuplicate = existingStudents.some((s) => s.fullName.toLowerCase() === fullName);
      if (isDuplicate || seenIds.has(fullName)) {
        errors.push({ rowNumber: rowNum, field: 'FullName', value: `${firstName} ${lastName}`, reason: 'Possible duplicate student already in database or file', severity: 'warning' });
        rowErrors.push('Possible duplicate');
        duplicateCount++;
        rowHasWarning = true;
      }
      seenIds.add(fullName);
    } else if (category === 'staff') {
      const fullName = row['FullName'] || row['fullName'];
      const username = row['Username'] || row['username'];
      const email = row['Email'] || row['email'];

      if (!fullName) {
        errors.push({ rowNumber: rowNum, field: 'FullName', value: '', reason: 'Staff Full Name is required', severity: 'error' });
        rowErrors.push('Missing Full Name');
        rowHasError = true;
      }
      if (!username) {
        errors.push({ rowNumber: rowNum, field: 'Username', value: '', reason: 'Username is required', severity: 'error' });
        rowErrors.push('Missing Username');
        rowHasError = true;
      }
      if (email && !email.includes('@')) {
        errors.push({ rowNumber: rowNum, field: 'Email', value: email, reason: 'Invalid Email format', severity: 'warning' });
        rowErrors.push('Invalid Email');
        rowHasWarning = true;
      }
      if (existingUsers.some((u) => u.username.toLowerCase() === (username || '').toLowerCase())) {
        errors.push({ rowNumber: rowNum, field: 'Username', value: username || '', reason: 'Username already exists', severity: 'error' });
        rowErrors.push('Username already taken');
        rowHasError = true;
      }
    } else if (category === 'classes') {
      const className = row['ClassName'] || row['className'];
      if (!className) {
        errors.push({ rowNumber: rowNum, field: 'ClassName', value: '', reason: 'Class Name is required', severity: 'error' });
        rowErrors.push('Missing Class Name');
        rowHasError = true;
      }
    } else if (category === 'subjects') {
      const code = row['SubjectCode'] || row['subjectCode'];
      const name = row['SubjectName'] || row['subjectName'];
      if (!code || !name) {
        errors.push({ rowNumber: rowNum, field: 'SubjectCode/Name', value: '', reason: 'Code and Name are required', severity: 'error' });
        rowErrors.push('Missing Code or Name');
        rowHasError = true;
      }
    }

    if (rowHasError) {
      errorCount++;
      previewRows.push({ ...row, _validationStatus: 'error', _errors: rowErrors });
    } else if (rowHasWarning) {
      warningCount++;
      previewRows.push({ ...row, _validationStatus: 'warning', _errors: rowErrors });
    } else {
      validCount++;
      previewRows.push({ ...row, _validationStatus: 'valid', _errors: [] });
    }
  });

  return {
    totalRows: parsedRows.length,
    validCount,
    warningCount,
    errorCount,
    duplicateCount,
    errors,
    previewRows,
  };
}

/**
 * Step 5: CONFIRM & IMPORT validated records into Authoritative Database
 */
export async function commitBulkImport(
  category: ImportCategory,
  validRows: Array<Record<string, any>>,
  currentUser: User
): Promise<ImportResult> {
  const year = new Date().getFullYear();
  let countImported = 0;
  let countSkipped = 0;

  if (category === 'students') {
    const existingCount = await db.students.count();
    const studentsToAdd: Student[] = [];
    const guardiansToAdd: Guardian[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      if (r._validationStatus === 'error') {
        countSkipped++;
        continue;
      }

      const seq = existingCount + i + 1;
      const studentId = `LIN-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      const admissionNumber = `ADM-${year}-${String(seq).padStart(4, '0')}`;
      const firstName = r['FirstName'] || r['firstName'];
      const middleName = r['MiddleName'] || r['middleName'] || '';
      const lastName = r['LastName'] || r['lastName'];
      const fullName = formatPersonName(firstName, middleName, lastName, 'Student');
      const stuUniqueId = 'stu-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

      const newStudent: Student = {
        id: stuUniqueId,
        studentId,
        admissionNumber,
        firstName,
        middleName,
        lastName,
        fullName,
        gender: (r['Gender'] || r['gender'] || 'Male') as any,
        dateOfBirth: r['DateOfBirth'] || r['dateOfBirth'] || '2013-01-01',
        bloodGroup: r['BloodGroup'] || '',
        nationality: r['Nationality'] || 'Ugandan',
        nationalIdOrBirthCert: r['NationalIdOrBirthCert'] || `BC-${Math.floor(100000 + Math.random() * 900000)}`,
        religion: r['Religion'] || 'Christian',
        primaryLanguage: r['PrimaryLanguage'] || 'English',
        classGrade: r['ClassGrade'] || r['classGrade'] || 'Primary 1',
        stream: r['Stream'] || r['stream'] || 'Red',
        houseOrDorm: r['House'] || 'Main House',
        residenceType: (r['ResidenceType'] || 'Day') as any,
        enrolmentDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        qrVerificationHash: `UGA-SCH-${year}-${studentId}-VERIFIED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      studentsToAdd.push(newStudent);

      // If parent info provided, create guardian relationship
      const parentName = r['ParentFullName'] || r['ParentName'];
      const parentPhone = r['ParentPhone'] || r['PhoneNumber'];
      if (parentName && parentPhone) {
        guardiansToAdd.push({
          id: 'grd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          studentId: stuUniqueId,
          fullName: parentName,
          relationship: (r['ParentRelationship'] || 'Parent') as any,
          nationalId: r['ParentNationalId'] || r['ParentNIN'] || `NIN-PRNT-${Date.now().toString().slice(-4)}`,
          phoneNumber: parentPhone,
          email: r['ParentEmail'] || '',
          occupation: r['ParentOccupation'] || '',
          residentialAddress: r['Address'] || 'School Environs',
          isPrimaryContact: true,
          isEmergencyContact: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      countImported++;
    }

    if (studentsToAdd.length > 0) {
      await db.students.bulkPut(studentsToAdd);
      if (guardiansToAdd.length > 0) {
        await db.guardians.bulkPut(guardiansToAdd);
      }
    }
  } else if (category === 'staff') {
    const usersToAdd: User[] = [];
    for (const r of validRows) {
      if (r._validationStatus === 'error') {
        countSkipped++;
        continue;
      }
      usersToAdd.push({
        id: 'usr-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        fullName: r['FullName'] || r['fullName'] || 'Staff Member',
        username: r['Username'] || r['username'] || `staff_${Date.now().toString().slice(-4)}`,
        email: r['Email'] || r['email'] || '',
        phone: r['Phone'] || r['phone'] || '',
        employeeNumber: r['EmployeeNumber'] || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        role: r['Role'] || 'Teacher',
        status: 'Active',
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      countImported++;
    }
    if (usersToAdd.length > 0) {
      await db.users.bulkPut(usersToAdd);
    }
  } else if (category === 'classes') {
    const classesToAdd: SchoolClass[] = [];
    for (const r of validRows) {
      if (r._validationStatus === 'error') continue;
      const cName = r['ClassName'] || r['className'];
      const streams = (r['Streams'] || 'Red, Blue').split(',').map((s: string) => s.trim());
      classesToAdd.push({
        id: 'cls-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        className: cName,
        classCode: r['ClassCode'] || cName.replace(/\s+/g, '').toUpperCase(),
        level: (r['Level'] || 'Primary') as any,
        curriculumType: 'Ugandan CBC (NCDC)',
        streams,
      });
      countImported++;
    }
    if (classesToAdd.length > 0) {
      await db.schoolClasses.bulkPut(classesToAdd);
    }
  }

  const auditLogId = 'audit-imp-' + Date.now();
  await logAuditEvent(
    currentUser.id,
    currentUser.username,
    currentUser.role,
    'STUDENT_CREATE',
    `Bulk Import Completed for [${category.toUpperCase()}]: Successfully created ${countImported} records (Skipped: ${countSkipped})`
  );

  return {
    category,
    totalProcessed: validRows.length,
    successfullyImported: countImported,
    skipped: countSkipped,
    timestamp: new Date().toISOString(),
    auditId: auditLogId,
  };
}
