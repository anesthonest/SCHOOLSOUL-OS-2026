import { db } from '../db/indexedDB';
import type { LessonPlan, HomeworkAssignment } from '../types';

export interface TodayTeachingPeriod {
  id: string;
  periodNumber: number;
  timeSlot: string;
  className: string;
  subjectName: string;
  roomName: string;
  topicTitle: string;
  isAttendanceTaken: boolean;
  hasLessonPlan: boolean;
  pendingSubmissionsCount: number;
}

export interface ReusableLessonTemplate {
  id: string;
  title: string;
  subject: string;
  level: string;
  durationMinutes: number;
  competencyOutcome: string;
  learningMaterials: string[];
  steps: { phase: 'Introduction' | 'Guided Discovery' | 'Hands-on Activity' | 'Plenary & Assessment'; minutes: number; instructions: string }[];
}

export const REUSABLE_LESSON_TEMPLATES: ReusableLessonTemplate[] = [
  {
    id: 'tmpl-001',
    title: 'NCDC CBC Interactive Discovery Template',
    subject: 'General Sciences & Geography',
    level: 'Lower Secondary (S.1 - S.4)',
    durationMinutes: 80,
    competencyOutcome: 'Learners investigate real-world phenomena, formulate hypotheses, and present group findings.',
    learningMaterials: ['Worksheets', 'Specimens / Lab Apparatus', 'Flipcharts', 'SchoolSoul Digital Note'],
    steps: [
      { phase: 'Introduction', minutes: 15, instructions: 'Engage prior knowledge with thought-provoking inquiry question.' },
      { phase: 'Guided Discovery', minutes: 25, instructions: 'Teacher facilitates small groups experimenting and recording observations.' },
      { phase: 'Hands-on Activity', minutes: 25, instructions: 'Group work synthesis, data analysis, and peer critique.' },
      { phase: 'Plenary & Assessment', minutes: 15, instructions: 'Summative reflection questions and digital homework submission trigger.' },
    ],
  },
  {
    id: 'tmpl-002',
    title: 'Mathematics Problem Solving & Group Drill',
    subject: 'Mathematics',
    level: 'Upper Primary (P.5 - P.7)',
    durationMinutes: 60,
    competencyOutcome: 'Mastery of mathematical algorithms and application to daily community commerce.',
    learningMaterials: ['Chalkboard / Screen', 'Workbook Exercises', 'Calculators / Counters'],
    steps: [
      { phase: 'Introduction', minutes: 10, instructions: 'Review previous lesson concept and mental math drill.' },
      { phase: 'Guided Discovery', minutes: 20, instructions: 'Demonstrate worked examples step-by-step.' },
      { phase: 'Hands-on Activity', minutes: 20, instructions: 'Pair-share problem solving with roving teacher feedback.' },
      { phase: 'Plenary & Assessment', minutes: 10, instructions: 'Formative exit ticket score check.' },
    ],
  },
];

export async function getTodayTeacherSchedule(teacherName: string = 'Staff Member'): Promise<TodayTeachingPeriod[]> {
  const [classes, attendance, homeworks, submissions] = await Promise.all([
    db.schoolClasses.toArray().catch(() => []),
    db.studentAttendance.toArray().catch(() => []),
    db.homeworkAssignments.toArray().catch(() => []),
    db.homeworkSubmissions.toArray().catch(() => []),
  ]);

  const defaultClasses = classes.length > 0 ? classes : [{ className: 'Senior 2 East' }, { className: 'Senior 3 North' }, { className: 'Primary 6 Blue' }];

  return [
    {
      id: 'prd-01',
      periodNumber: 1,
      timeSlot: '08:30 - 09:50',
      className: defaultClasses[0]?.className || 'Senior 2 East',
      subjectName: 'Mathematics',
      roomName: 'Block B - Room 12',
      topicTitle: 'Linear Equations & Coordinate Geometry',
      isAttendanceTaken: attendance.length > 0,
      hasLessonPlan: true,
      pendingSubmissionsCount: 8,
    },
    {
      id: 'prd-02',
      periodNumber: 2,
      timeSlot: '10:15 - 11:35',
      className: defaultClasses[1]?.className || 'Senior 3 North',
      subjectName: 'Physics / Integrated Science',
      roomName: 'Physics Lab 1',
      topicTitle: 'Optics, Reflection & Refraction Experiments',
      isAttendanceTaken: false,
      hasLessonPlan: true,
      pendingSubmissionsCount: 14,
    },
    {
      id: 'prd-03',
      periodNumber: 4,
      timeSlot: '14:00 - 15:20',
      className: defaultClasses[2]?.className || 'Senior 1 Green',
      subjectName: 'ICT & Digital Literacy',
      roomName: 'Computer Lab 2',
      topicTitle: 'Spreadsheet Formulas & Data Visualization',
      isAttendanceTaken: false,
      hasLessonPlan: false,
      pendingSubmissionsCount: 0,
    },
  ];
}
