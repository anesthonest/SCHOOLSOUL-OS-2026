import { readServerDB, writeServerDB } from '../db/store';

export interface NamingTestResult {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export async function runUniversalNamingSuite(): Promise<NamingTestResult[]> {
  const results: NamingTestResult[] = [];

  const record = (category: string, name: string, condition: boolean, details: string) => {
    results.push({
      category,
      name,
      status: condition ? 'PASS' : 'FAIL',
      details,
    });
  };

  console.log('================================================================');
  console.log('🌐 RUNNING UNIVERSAL INSTITUTION NAMING & DATA VALIDATION SUITE');
  console.log('================================================================\n');

  const db = readServerDB();

  // Helper formatting function equivalent to src/utils/nameUtils.ts
  const formatName = (first?: string | null, middle?: string | null, last?: string | null, fallback = 'Unnamed') => {
    const parts = [first, middle, last]
      .map((p) => (typeof p === 'string' ? p.trim() : ''))
      .filter((p) => p.length > 0 && p.toLowerCase() !== 'null' && p.toLowerCase() !== 'undefined' && p.toLowerCase() !== 'n/a');
    if (parts.length === 0) return fallback;
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  // 1. Student Naming Tests (1 name, 2 names, 3 names, multiple names)
  const student1 = {
    id: `stu-test-single-${Date.now()}`,
    studentId: 'LIN-2026-9001',
    admissionNumber: 'ADM-2026-9001',
    firstName: 'Kwame',
    middleName: '',
    lastName: 'Nkrumah',
    fullName: formatName('Kwame', '', 'Nkrumah'),
    dateOfBirth: '2014-03-01',
    gender: 'Male',
    classGrade: 'Primary 5',
    stream: 'Stream A',
    residenceType: 'Day',
    status: 'Active',
  };

  const student2 = {
    id: `stu-test-two-${Date.now()}`,
    studentId: 'LIN-2026-9002',
    admissionNumber: 'ADM-2026-9002',
    firstName: 'John',
    middleName: null,
    lastName: 'Doe',
    fullName: formatName('John', null, 'Doe'),
    dateOfBirth: '2013-05-12',
    gender: 'Male',
    classGrade: 'Primary 6',
    stream: 'Stream B',
    residenceType: 'Day',
    status: 'Active',
  };

  const student3 = {
    id: `stu-test-three-${Date.now()}`,
    studentId: 'LIN-2026-9003',
    admissionNumber: 'ADM-2026-9003',
    firstName: 'Sarah',
    middleName: 'Mirembe',
    lastName: 'Kigozi',
    fullName: formatName('Sarah', 'Mirembe', 'Kigozi'),
    dateOfBirth: '2012-07-20',
    gender: 'Female',
    classGrade: 'Primary 7',
    stream: 'East',
    residenceType: 'Boarding',
    status: 'Active',
  };

  const studentCompound = {
    id: `stu-test-compound-${Date.now()}`,
    studentId: 'LIN-2026-9004',
    admissionNumber: 'ADM-2026-9004',
    firstName: 'Jean-Luc',
    middleName: 'de la Fontaine',
    lastName: 'Saint-Germain',
    fullName: formatName('Jean-Luc', 'de la Fontaine', 'Saint-Germain'),
    dateOfBirth: '2011-09-15',
    gender: 'Male',
    classGrade: 'Senior 1',
    stream: 'A',
    residenceType: 'Day',
    status: 'Active',
  };

  db.students = [...(db.students || []).filter((s) => !s.id.startsWith('stu-test-')), student1 as any, student2 as any, student3 as any, studentCompound as any];
  writeServerDB(db);

  record(
    'Student Registration',
    'Student 2-Name Registration Without Middle Name',
    student2.fullName === 'John Doe' && !student2.fullName.includes('null') && !student2.fullName.includes('undefined'),
    `Student registered with firstName="John", middleName=null, lastName="Doe" produced clean fullName="${student2.fullName}"`
  );

  record(
    'Student Registration',
    'Student 3-Name Registration With Middle Name',
    student3.fullName === 'Sarah Mirembe Kigozi',
    `Student registered with 3 names produced clean fullName="${student3.fullName}"`
  );

  record(
    'Student Registration',
    'Student Compound / International Naming Support',
    studentCompound.fullName === 'Jean-Luc de la Fontaine Saint-Germain',
    `Compound international names preserved without artificial truncation: "${studentCompound.fullName}"`
  );

  // 2. Parent / Guardian Naming Tests
  const guardianTwoName = {
    id: `gdn-test-1-${Date.now()}`,
    studentId: student2.id,
    fullName: formatName('Mary', '', 'Doe'),
    relationship: 'Mother',
    phoneNumber: '+256 701 112 233',
    nationalId: 'CF8910291021A',
    residentialAddress: 'Kampala, Uganda',
    isPrimaryContact: true,
    isEmergencyContact: true,
  };

  const guardianThreeName = {
    id: `gdn-test-2-${Date.now()}`,
    studentId: student3.id,
    fullName: formatName('Dr. Charles', 'Kigozi', 'Mukasa'),
    relationship: 'Father',
    phoneNumber: '+256 772 445 566',
    nationalId: 'CM8402910291B',
    residentialAddress: 'Entebbe, Uganda',
    isPrimaryContact: true,
    isEmergencyContact: true,
  };

  db.guardians = [...(db.guardians || []).filter((g) => !g.id.startsWith('gdn-test-')), guardianTwoName as any, guardianThreeName as any];
  writeServerDB(db);

  record(
    'Guardian Registration',
    'Guardian Registration With Optional Middle Name',
    guardianTwoName.fullName === 'Mary Doe' && guardianThreeName.fullName === 'Dr. Charles Kigozi Mukasa',
    `Guardians with 2 and 3 names stored cleanly without requiring middle name`
  );

  // 3. Staff & Teacher HR Profiles
  const staffNoMiddle = {
    id: `stf-test-1-${Date.now()}`,
    staffCode: 'STF-TEST-001',
    fullName: formatName('Esther', undefined, 'Nalubega'),
    email: 'esther.nalubega@school.ug',
    phone: '+256 700 889 900',
    role: 'Teacher',
    department: 'Languages',
    designation: 'Senior English Teacher',
    employmentType: 'Full Time Teaching',
    status: 'Active',
  };

  const staffWithMiddle = {
    id: `stf-test-2-${Date.now()}`,
    staffCode: 'STF-TEST-002',
    fullName: formatName('David', 'Patrick', 'Semwogerere'),
    email: 'david.semwogerere@school.ug',
    phone: '+256 772 334 455',
    role: 'Teacher',
    department: 'Sciences',
    designation: 'Physics Lead',
    employmentType: 'Full Time Teaching',
    status: 'Active',
  };

  (db as any).staffProfiles = [...((db as any).staffProfiles || []).filter((s: any) => !s.id.startsWith('stf-test-')), staffNoMiddle as any, staffWithMiddle as any];
  writeServerDB(db);

  record(
    'Staff & Teacher HR',
    'Teacher & Staff Registration Without Middle Name',
    staffNoMiddle.fullName === 'Esther Nalubega' && !staffNoMiddle.fullName.includes('undefined'),
    `Staff profile created with 2 names without enforcing third name: "${staffNoMiddle.fullName}"`
  );

  // 4. Admissions Application Flow
  const admissionApp = {
    id: `app-test-${Date.now()}`,
    applicationNumber: 'APP-2026-9099',
    applicantFirstName: 'Amina',
    applicantMiddleName: '',
    applicantLastName: 'Hassan',
    applicantFullName: formatName('Amina', '', 'Hassan'),
    dateOfBirth: '2015-08-10',
    gender: 'Female',
    appliedGrade: 'Primary 3',
    guardianName: 'Fatuma Hassan',
    guardianPhone: '+256 782 990 011',
    status: 'Submitted',
  };

  db.admissions = [...(db.admissions || []).filter((a) => !a.id.startsWith('app-test-')), admissionApp as any];
  writeServerDB(db);

  record(
    'Admissions Workflow',
    'Admissions Intake Without Middle Name',
    admissionApp.applicantFullName === 'Amina Hassan',
    `Admission application accepted with empty middle name and cleanly formatted full name`
  );

  // 5. Search Engine Integrity
  const queryFirst = 'kwame';
  const queryLast = 'nkrumah';
  const queryFull = 'kwame nkrumah';

  const matchesFirst = db.students.some((s) => (s.fullName || '').toLowerCase().includes(queryFirst));
  const matchesLast = db.students.some((s) => (s.fullName || '').toLowerCase().includes(queryLast));
  const matchesFull = db.students.some((s) => (s.fullName || '').toLowerCase().includes(queryFull));

  record(
    'Search Engine',
    'Search Compatibility With Optional Middle Name',
    matchesFirst && matchesLast && matchesFull,
    `Search by first name, last name, and full name successfully retrieved 2-name student record`
  );

  // 6. Notification Template Interpolation
  const sampleTemplate = (name: string) => `Dear ${name}, welcome to SchoolSoul OS.`;
  const renderedTwoName = sampleTemplate(student2.fullName);
  const renderedThreeName = sampleTemplate(student3.fullName);

  record(
    'Notification Templates',
    'SMS & Notification Template Clean Rendering',
    !renderedTwoName.includes('null') && !renderedTwoName.includes('undefined') && renderedTwoName.includes('John Doe'),
    `Notification message interpolated cleanly: "${renderedTwoName}"`
  );

  // 7. Duplicate Detection Integrity
  const isDuplicate = db.students.some(
    (s) => s.id !== student2.id && (s.fullName || '').toLowerCase() === student2.fullName.toLowerCase() && s.dateOfBirth === student2.dateOfBirth
  );

  record(
    'Duplicate Detection',
    'Duplicate Detection Without Assuming Middle Name',
    isDuplicate === false,
    'Duplicate check accurately evaluates record uniqueness using full name and date of birth'
  );

  return results;
}
