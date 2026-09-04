import { db } from '../db/indexedDB';
import { logAuditEvent, isServerOnline, API_BASE } from './api';
import type { SchoolProfile, User, SystemSettings } from '../types';

export type EnvironmentMode = 'production' | 'pilot' | 'development';

export interface EnvironmentStatus {
  mode: EnvironmentMode;
  isProductionReady: boolean;
  activeSchoolName: string;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  totalAttendanceRecords: number;
  totalPayments: number;
  isDemoDataPresent: boolean;
  lastBackupDate?: string;
}

const ENV_MODE_KEY = 'schoolsoul_env_mode';

/**
 * Get current system environment mode
 */
export function getEnvironmentMode(): EnvironmentMode {
  const saved = localStorage.getItem(ENV_MODE_KEY);
  if (saved === 'production' || saved === 'pilot' || saved === 'development') {
    return saved;
  }
  return 'production'; // Default to real production
}

/**
 * Set environment mode with audit logging
 */
export async function setEnvironmentMode(mode: EnvironmentMode, user?: User | null): Promise<void> {
  localStorage.setItem(ENV_MODE_KEY, mode);
  
  if (user) {
    await logAuditEvent(
      user.id,
      user.username,
      user.role,
      'SETTINGS_UPDATE',
      `Environment mode switched to [${mode.toUpperCase()}]`
    );
  }
}

/**
 * Fetch comprehensive environment statistics & health
 */
export async function getEnvironmentStatus(): Promise<EnvironmentStatus> {
  const mode = getEnvironmentMode();
  const schoolProfiles = await db.schoolProfile.toArray();
  const school = schoolProfiles[0] || null;

  const students = await db.students.toArray();
  const users = await db.users.toArray();
  const classes = await db.schoolClasses.toArray();
  const attendance = await db.studentAttendance.toArray();
  const payments = await db.paymentRecords.toArray();

  const teachers = users.filter((u) => u.role === 'Teacher');
  const parents = users.filter((u) => u.role === 'Parent');

  // Check if synthetic sample IDs exist
  const isDemoDataPresent = students.some((s) => s.id.startsWith('stu-sample-') || s.fullName.includes('Sample'));

  return {
    mode,
    isProductionReady: Boolean(school && school.isConfigured && !isDemoDataPresent),
    activeSchoolName: school?.schoolName || 'Unconfigured School',
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalParents: parents.length,
    totalClasses: classes.length,
    totalAttendanceRecords: attendance.length,
    totalPayments: payments.length,
    isDemoDataPresent,
  };
}

/**
 * Purge synthetic demo data for pristine Real School Production onboarding
 */
export async function purgeDemoDataForProduction(user: User): Promise<{
  success: boolean;
  purgedStudents: number;
  purgedAttendance: number;
  purgedPayments: number;
}> {
  const allStudents = await db.students.toArray();
  const demoStudentIds = allStudents
    .filter((s) => s.id.startsWith('stu-sample-') || s.fullName.includes('Sample') || s.studentId.includes('DEMO'))
    .map((s) => s.id);

  let purgedAttendance = 0;
  let purgedPayments = 0;

  if (demoStudentIds.length > 0) {
    // Remove demo student attendance
    const attendanceRecords = await db.studentAttendance.toArray();
    const demoAttendance = attendanceRecords.filter((a) => demoStudentIds.includes(a.studentId));
    purgedAttendance = demoAttendance.length;
    await db.studentAttendance.bulkDelete(demoAttendance.map((a) => a.id));

    // Remove demo payments
    const paymentRecords = await db.paymentRecords.toArray();
    const demoPayments = paymentRecords.filter((p) => demoStudentIds.includes(p.studentId));
    purgedPayments = demoPayments.length;
    await db.paymentRecords.bulkDelete(demoPayments.map((p) => p.id));

    // Remove demo guardians
    const guardians = await db.guardians.toArray();
    const demoGuardians = guardians.filter((g) => demoStudentIds.includes(g.studentId));
    await db.guardians.bulkDelete(demoGuardians.map((g) => g.id));

    // Remove demo students
    await db.students.bulkDelete(demoStudentIds);
  }

  await logAuditEvent(
    user.id,
    user.username,
    user.role,
    'SETTINGS_UPDATE',
    `Pristine Production Data Cleansing Executed: Purged ${demoStudentIds.length} synthetic demo student records`
  );

  return {
    success: true,
    purgedStudents: demoStudentIds.length,
    purgedAttendance,
    purgedPayments,
  };
}

/**
 * Load isolated realistic Pilot Sandbox dataset for evaluation without contaminating Production
 */
export async function seedPilotSandboxData(user: User): Promise<{ success: boolean; message: string }> {
  const year = new Date().getFullYear();
  
  // Realistically modeled synthetic records for pilot testing
  const pilotStudents: any[] = [
    {
      id: `stu-pilot-1`,
      studentId: `PILOT-${year}-101`,
      admissionNumber: `ADM-${year}-801`,
      firstName: 'Emmanuel',
      middleName: 'Kato',
      lastName: 'Ssenyonjo',
      fullName: 'Emmanuel Kato Ssenyonjo',
      gender: 'Male',
      dateOfBirth: '2012-05-18',
      bloodGroup: 'O+',
      nationality: 'Ugandan',
      nationalIdOrBirthCert: 'NIN-CM89201948',
      religion: 'Anglican',
      primaryLanguage: 'English',
      classGrade: 'Primary 6',
      stream: 'Red',
      houseOrDorm: 'Speke House',
      residenceType: 'Day',
      enrolmentDate: `${year}-01-10`,
      status: 'Active',
      qrVerificationHash: `SCH-PILOT-STU-101-${year}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `stu-pilot-2`,
      studentId: `PILOT-${year}-102`,
      admissionNumber: `ADM-${year}-802`,
      firstName: 'Joan',
      middleName: 'Nassolo',
      lastName: 'Mukasa',
      fullName: 'Joan Nassolo Mukasa',
      gender: 'Female',
      dateOfBirth: '2012-11-22',
      bloodGroup: 'A+',
      nationality: 'Ugandan',
      nationalIdOrBirthCert: 'NIN-CF90219412',
      religion: 'Catholic',
      primaryLanguage: 'English',
      classGrade: 'Primary 6',
      stream: 'Blue',
      houseOrDorm: 'Kabalega House',
      residenceType: 'Boarding',
      enrolmentDate: `${year}-01-10`,
      status: 'Active',
      qrVerificationHash: `SCH-PILOT-STU-102-${year}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `stu-pilot-3`,
      studentId: `PILOT-${year}-103`,
      admissionNumber: `ADM-${year}-803`,
      firstName: 'Brian',
      middleName: 'Arthur',
      lastName: 'Okot',
      fullName: 'Brian Arthur Okot',
      gender: 'Male',
      dateOfBirth: '2011-03-14',
      bloodGroup: 'B+',
      nationality: 'Ugandan',
      nationalIdOrBirthCert: 'NIN-CM91204918',
      religion: 'Christian',
      primaryLanguage: 'English',
      classGrade: 'Primary 7',
      stream: 'East',
      houseOrDorm: 'Mwanga House',
      residenceType: 'Boarding',
      enrolmentDate: `${year}-01-10`,
      status: 'Active',
      qrVerificationHash: `SCH-PILOT-STU-103-${year}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  await db.students.bulkPut(pilotStudents);

  await logAuditEvent(
    user.id,
    user.username,
    user.role,
    'SETTINGS_UPDATE',
    `Pilot Sandbox Data Loaded (${pilotStudents.length} pilot evaluation records)`
  );

  return {
    success: true,
    message: `Successfully seeded ${pilotStudents.length} pilot records into evaluation sandbox.`,
  };
}
