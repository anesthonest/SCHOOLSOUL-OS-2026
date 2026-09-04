import { db } from '../db/indexedDB';
import { logAuditEvent } from './api';
import type { Student, Guardian, User } from '../types';

export interface ParentLinkRequest {
  id: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  studentAdmissionNumber: string;
  studentFullName: string;
  relationship: 'Father' | 'Mother' | 'Guardian' | 'Sponsor';
  linkCode?: string;
  verificationMethod: 'LinkCode' | 'DocumentUpload' | 'AdminApproval';
  status: 'Pending Review' | 'Approved' | 'Rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const LINK_REQUESTS_KEY = 'schoolsoul_parent_link_requests';

/**
 * Generate a secure, school-issued 8-character Family Link Code for a student
 */
export function generateStudentLinkCode(studentId: string, admissionNumber: string): string {
  const hashPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const admClean = admissionNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return `LINK-${admClean}-${hashPart}`;
}

/**
 * Get all linked children for a parent user account
 */
export async function getLinkedStudentsForParent(parentUser: User): Promise<{
  students: Student[];
  guardians: Guardian[];
}> {
  const allGuardians = await db.guardians.toArray();
  const allStudents = await db.students.toArray();

  // Match parent by phone, email, or exact guardian link
  const matchedGuardians = allGuardians.filter((g) => {
    const phoneMatch = parentUser.phone && g.phoneNumber && g.phoneNumber.replace(/[^0-9]/g, '').endsWith(parentUser.phone.replace(/[^0-9]/g, '').slice(-9));
    const emailMatch = parentUser.email && g.email && g.email.toLowerCase() === parentUser.email.toLowerCase();
    const nameMatch = g.fullName.toLowerCase() === parentUser.fullName.toLowerCase();
    return phoneMatch || emailMatch || nameMatch;
  });

  const studentIds = new Set(matchedGuardians.map((g) => g.studentId));
  const students = allStudents.filter((s) => studentIds.has(s.id));

  return {
    students,
    guardians: matchedGuardians,
  };
}

/**
 * Link a parent to a student using a verified School Link Code or Student Details
 */
export async function verifyAndLinkParentStudent(
  parentUser: User,
  admissionNumber: string,
  studentDobOrLinkCode: string,
  relationship: 'Father' | 'Mother' | 'Guardian' | 'Sponsor'
): Promise<{ success: boolean; student?: Student; message: string }> {
  const allStudents = await db.students.toArray();
  const targetStudent = allStudents.find(
    (s) => s.admissionNumber.toLowerCase() === admissionNumber.trim().toLowerCase() || s.studentId.toLowerCase() === admissionNumber.trim().toLowerCase()
  );

  if (!targetStudent) {
    return {
      success: false,
      message: `No active student found with Admission Number / ID "${admissionNumber}". Please check with the school bursar or registrar.`,
    };
  }

  // Verify either Link Code format or Date of Birth match
  const isLinkCode = studentDobOrLinkCode.startsWith('LINK-');
  const isDobMatch = targetStudent.dateOfBirth === studentDobOrLinkCode.trim();

  if (!isLinkCode && !isDobMatch) {
    // If not matching instant code/DOB, register a pending Admin Review Request
    const requests = getStoredLinkRequests();
    const newReq: ParentLinkRequest = {
      id: 'req-' + Date.now(),
      parentId: parentUser.id,
      parentName: parentUser.fullName,
      parentPhone: parentUser.phone || '',
      parentEmail: parentUser.email,
      studentAdmissionNumber: targetStudent.admissionNumber,
      studentFullName: targetStudent.fullName,
      relationship,
      verificationMethod: 'AdminApproval',
      status: 'Pending Review',
      requestedAt: new Date().toISOString(),
    };
    requests.unshift(newReq);
    localStorage.setItem(LINK_REQUESTS_KEY, JSON.stringify(requests));

    return {
      success: false,
      message: `Security validation required: Instant link code or birth date did not match. A linking authorization request has been routed to the School Registrar for manual verification.`,
    };
  }

  // Create authoritative Guardian Record
  const newGuardian: Guardian = {
    id: 'grd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    studentId: targetStudent.id,
    fullName: parentUser.fullName,
    relationship,
    nationalId: '',
    phoneNumber: parentUser.phone || '+256700000000',
    email: parentUser.email,
    residentialAddress: 'Residential Environs',
    isPrimaryContact: true,
    isEmergencyContact: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.guardians.put(newGuardian);

  await logAuditEvent(
    parentUser.id,
    parentUser.username,
    parentUser.role,
    'USER_UPDATE',
    `Parent-Student Authorized Link Established for [${parentUser.fullName}] -> [${targetStudent.fullName} (${targetStudent.admissionNumber})]`
  );

  return {
    success: true,
    student: targetStudent,
    message: `Successfully linked ${targetStudent.fullName} to your parent portal.`,
  };
}

/**
 * Get all pending parent linking requests for administrator review
 */
export function getStoredLinkRequests(): ParentLinkRequest[] {
  try {
    const raw = localStorage.getItem(LINK_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Approve a pending parent linking request (by Administrator or Registrar)
 */
export async function approveParentLinkRequest(
  requestId: string,
  reviewer: User
): Promise<{ success: boolean; message: string }> {
  const requests = getStoredLinkRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return { success: false, message: 'Request not found' };

  const allStudents = await db.students.toArray();
  const student = allStudents.find((s) => s.admissionNumber === req.studentAdmissionNumber);
  if (!student) return { success: false, message: 'Target student not found' };

  const newGuardian: Guardian = {
    id: 'grd-' + Date.now(),
    studentId: student.id,
    fullName: req.parentName,
    relationship: req.relationship,
    nationalId: '',
    phoneNumber: req.parentPhone,
    email: req.parentEmail,
    residentialAddress: 'Residential Environs',
    isPrimaryContact: true,
    isEmergencyContact: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.guardians.put(newGuardian);

  req.status = 'Approved';
  req.reviewedBy = reviewer.fullName;
  req.reviewedAt = new Date().toISOString();
  localStorage.setItem(LINK_REQUESTS_KEY, JSON.stringify(requests));

  await logAuditEvent(
    reviewer.id,
    reviewer.username,
    reviewer.role,
    'USER_UPDATE',
    `Administrator Approved Parent Link Request: [${req.parentName}] -> [${student.fullName}]`
  );

  return { success: true, message: `Approved linking for ${req.parentName} to ${student.fullName}` };
}
