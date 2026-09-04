import { db } from '../db/indexedDB';
import { logAuditEvent, queueOfflineAction } from './api';
import type { User, Student } from '../types';

export interface LessonMaterial {
  id: string;
  title: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'video' | 'audio' | 'link';
  fileSizeMb?: number;
  url: string;
  uploadedAt: string;
}

export interface OnlineLesson {
  id: string;
  teacherId: string;
  teacherName: string;
  classGrade: string;
  stream: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  description: string;
  learningObjectives: string[];
  materials: LessonMaterial[];
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  virtualRoomUrl?: string;
  virtualRoomCode?: string;
  status: 'Draft' | 'Scheduled' | 'Live Now' | 'Completed' | 'Archived';
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  submissionText: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'Submitted' | 'Late' | 'Graded' | 'Returned For Revision';
  marksAwarded?: number;
  maxMarks: number;
  teacherFeedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface OnlineAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  classGrade: string;
  stream: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  maxMarks: number;
  allowLateSubmissions: boolean;
  attachments: LessonMaterial[];
  status: 'Published' | 'Closed' | 'Archived';
  createdAt: string;
  submissions: AssignmentSubmission[];
}

const LESSONS_KEY = 'schoolsoul_online_lessons';
const ASSIGNMENTS_KEY = 'schoolsoul_online_assignments';

/**
 * Get all online lessons
 */
export function getOnlineLessons(): OnlineLesson[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get all online assignments
 */
export function getOnlineAssignments(): OnlineAssignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Create a new structured lesson with virtual meeting room generator
 */
export async function createOnlineLesson(
  lessonData: Omit<OnlineLesson, 'id' | 'createdAt' | 'virtualRoomCode' | 'virtualRoomUrl'>,
  currentUser: User
): Promise<OnlineLesson> {
  const lessons = getOnlineLessons();
  const id = 'les-' + Date.now();
  const roomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const virtualRoomCode = `ROOM-SCH-${roomHash}`;
  const virtualRoomUrl = `https://meet.schoolsoul.internal/room/${virtualRoomCode}`;

  const newLesson: OnlineLesson = {
    ...lessonData,
    id,
    virtualRoomCode,
    virtualRoomUrl,
    createdAt: new Date().toISOString(),
  };

  lessons.unshift(newLesson);
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));

  await logAuditEvent(
    currentUser.id,
    currentUser.username,
    currentUser.role,
    'SETTINGS_UPDATE',
    `Online Lesson Published: "${newLesson.title}" for ${newLesson.classGrade} (${newLesson.subjectName})`
  );

  return newLesson;
}

/**
 * Create a new academic assignment
 */
export async function createOnlineAssignment(
  assignmentData: Omit<OnlineAssignment, 'id' | 'createdAt' | 'submissions'>,
  currentUser: User
): Promise<OnlineAssignment> {
  const assignments = getOnlineAssignments();
  const id = 'asg-' + Date.now();

  const newAssignment: OnlineAssignment = {
    ...assignmentData,
    id,
    status: 'Published',
    createdAt: new Date().toISOString(),
    submissions: [],
  };

  assignments.unshift(newAssignment);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));

  await logAuditEvent(
    currentUser.id,
    currentUser.username,
    currentUser.role,
    'SETTINGS_UPDATE',
    `Assignment Created: "${newAssignment.title}" for ${newAssignment.classGrade} (${newAssignment.subjectName})`
  );

  return newAssignment;
}

/**
 * Student submits an assignment
 */
export async function submitStudentAssignment(
  assignmentId: string,
  student: Student,
  submissionText: string,
  attachmentName?: string,
  attachmentUrl?: string
): Promise<{ success: boolean; submission?: AssignmentSubmission; message: string }> {
  const assignments = getOnlineAssignments();
  const assignment = assignments.find((a) => a.id === assignmentId);

  if (!assignment) {
    return { success: false, message: 'Assignment not found' };
  }

  // Check if past deadline
  const now = new Date();
  const dueDateTime = new Date(`${assignment.dueDate}T${assignment.dueTime || '23:59'}`);
  const isLate = now > dueDateTime;

  if (isLate && !assignment.allowLateSubmissions) {
    return {
      success: false,
      message: 'Submission Rejected: The submission deadline has passed and late submissions are locked by the teacher.',
    };
  }

  const existingSubIdx = assignment.submissions.findIndex((s) => s.studentId === student.id);
  const subId = existingSubIdx >= 0 ? assignment.submissions[existingSubIdx].id : 'sub-' + Date.now();

  const submission: AssignmentSubmission = {
    id: subId,
    assignmentId,
    studentId: student.id,
    studentName: student.fullName,
    submittedAt: now.toISOString(),
    submissionText,
    attachmentName,
    attachmentUrl,
    status: isLate ? 'Late' : 'Submitted',
    maxMarks: assignment.maxMarks,
  };

  if (existingSubIdx >= 0) {
    assignment.submissions[existingSubIdx] = submission;
  } else {
    assignment.submissions.push(submission);
  }

  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));

  return {
    success: true,
    submission,
    message: isLate ? 'Assignment submitted successfully (Flagged as Late submission).' : 'Assignment submitted successfully.',
  };
}

/**
 * Teacher grades and adds feedback to a student submission
 */
export async function gradeStudentSubmission(
  assignmentId: string,
  submissionId: string,
  marksAwarded: number,
  feedback: string,
  teacher: User
): Promise<{ success: boolean; message: string }> {
  const assignments = getOnlineAssignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) return { success: false, message: 'Assignment not found' };

  const sub = assignment.submissions.find((s) => s.id === submissionId);
  if (!sub) return { success: false, message: 'Submission not found' };

  sub.marksAwarded = marksAwarded;
  sub.teacherFeedback = feedback;
  sub.status = 'Graded';
  sub.gradedAt = new Date().toISOString();
  sub.gradedBy = teacher.fullName;

  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));

  await logAuditEvent(
    teacher.id,
    teacher.username,
    teacher.role,
    'SETTINGS_UPDATE',
    `Assignment Graded: [${sub.studentName}] scored ${marksAwarded}/${sub.maxMarks} on "${assignment.title}"`
  );

  return { success: true, message: `Marks and feedback recorded for ${sub.studentName}` };
}
