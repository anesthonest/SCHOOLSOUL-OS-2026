import { db } from '../db/indexedDB';
import { dispatchSchoolEvent } from './eventBusService';
import type {
  DigitalConsentForm,
  ParentConsentSubmission,
  SchoolSurvey,
  SurveyResponseRecord,
} from '../types';

export interface SchoolPolicyDocument {
  id: string;
  title: string;
  category: 'Safeguarding' | 'Academic Rules' | 'Discipline' | 'Finance & Fees' | 'Health & Safety' | 'General';
  version: string;
  publishedDate: string;
  author: string;
  audience: 'All' | 'Parents' | 'Staff' | 'Students';
  fileSizeKb: number;
  summary: string;
  downloadUrl: string;
}

const DEFAULT_POLICIES: SchoolPolicyDocument[] = [
  {
    id: 'pol-001',
    title: 'School Safeguarding & Child Protection Policy 2026',
    category: 'Safeguarding',
    version: '4.2',
    publishedDate: '2026-01-10',
    author: 'Head Teacher & Board of Governors',
    audience: 'All',
    fileSizeKb: 340,
    summary: 'Comprehensive mandatory guidelines for staff, visitors, and volunteers protecting student welfare.',
    downloadUrl: '#',
  },
  {
    id: 'pol-002',
    title: 'NCDC Lower Secondary CBC Assessment Guidelines',
    category: 'Academic Rules',
    version: '2.0',
    publishedDate: '2026-01-15',
    author: 'Director of Studies (DOS)',
    audience: 'All',
    fileSizeKb: 512,
    summary: 'Official criteria for formative activity descriptors, project scores (20%), and summative UNEB reporting.',
    downloadUrl: '#',
  },
  {
    id: 'pol-003',
    title: 'School Tuition & Boarding Fees Payment Regulations',
    category: 'Finance & Fees',
    version: '1.8',
    publishedDate: '2026-01-08',
    author: 'Bursar & Finance Committee',
    audience: 'Parents',
    fileSizeKb: 180,
    summary: 'Bank deposit details, mobile money payment procedures, and instalment clearing schedule.',
    downloadUrl: '#',
  },
  {
    id: 'pol-004',
    title: 'Pupil Code of Conduct & Anti-Bullying Charter',
    category: 'Discipline',
    version: '3.1',
    publishedDate: '2026-01-12',
    author: 'Disciplinary Committee & Senior Woman Teacher',
    audience: 'All',
    fileSizeKb: 220,
    summary: 'Rules on campus conduct, uniform regulations, mobile phone policies, and counseling procedures.',
    downloadUrl: '#',
  },
];

const DEFAULT_CONSENT_FORMS: DigitalConsentForm[] = [
  {
    id: 'form-001',
    title: 'Senior Three Geography Field Trip to Jinja Source of the Nile',
    category: 'School Trip',
    classGrade: 'Senior 3',
    description: 'Mandatory field study for River Nile hydrology, Owen Falls Dam power station, and industrial geography.',
    dueDate: '2026-03-20',
    createdBy: 'Head of Geography',
    requiresFeeApproval: true,
    feeAmountUGX: 45000,
    totalRequested: 120,
    totalSigned: 94,
    totalDeclined: 3,
    status: 'Active',
    createdAt: '2026-02-01',
  },
  {
    id: 'form-002',
    title: 'Junior Swimming & Water Safety Program Term I',
    category: 'Event Participation',
    classGrade: 'Primary 4 - Primary 7',
    description: 'Weekly supervised swimming training at the campus aquatic center with certified lifesavers.',
    dueDate: '2026-02-14',
    createdBy: 'Sports Master',
    requiresFeeApproval: true,
    feeAmountUGX: 25000,
    totalRequested: 160,
    totalSigned: 142,
    totalDeclined: 6,
    status: 'Active',
    createdAt: '2026-01-20',
  },
];

const DEFAULT_SURVEYS: SchoolSurvey[] = [
  {
    id: 'surv-001',
    title: 'Term I Parent Experience & Communication Feedback',
    targetAudience: 'Parents',
    description: 'Help us improve SchoolSoul digital report delivery, SMS notices, and academic support.',
    status: 'Active',
    expiryDate: '2026-03-31',
    isAnonymous: false,
    questions: [
      { id: 'q1', text: 'How satisfied are you with digital report card access?', type: 'rating' },
      { id: 'q2', text: 'Any suggestions to enhance campus-parent communication?', type: 'text' },
    ],
    responsesCount: 184,
    createdAt: '2026-02-01',
  },
];

export async function getSchoolPolicies(): Promise<SchoolPolicyDocument[]> {
  return DEFAULT_POLICIES;
}

export async function getDigitalConsentForms(): Promise<DigitalConsentForm[]> {
  try {
    const forms = await db.consentForms.toArray();
    if (forms && forms.length > 0) return forms;
  } catch (e) {
    console.warn('Error reading consent forms:', e);
  }

  for (const f of DEFAULT_CONSENT_FORMS) {
    await db.consentForms.put(f).catch(() => {});
  }
  return DEFAULT_CONSENT_FORMS;
}

export async function submitParentConsent(
  formId: string,
  submission: {
    studentId: string;
    studentName: string;
    parentName: string;
    parentPhone: string;
    decision: 'Approved' | 'Declined';
    medicalNotes?: string;
  }
): Promise<void> {
  const form = await db.consentForms.get(formId);
  if (!form) return;

  const record: ParentConsentSubmission = {
    id: `sub-${formId}-${submission.studentId}`,
    consentFormId: formId,
    studentId: submission.studentId,
    studentName: submission.studentName,
    parentId: 'p-' + submission.parentPhone,
    parentName: submission.parentName,
    parentPhone: submission.parentPhone,
    status: submission.decision,
    digitalSignatureToken: `sig-${Date.now().toString(16)}`,
    signatureDate: new Date().toISOString(),
    parentIpAddress: '127.0.0.1 (Local Verified)',
    notes: submission.medicalNotes,
  };

  await db.consentSubmissions.put(record);

  if (submission.decision === 'Approved') {
    form.totalSigned += 1;
  } else {
    form.totalDeclined += 1;
  }
  await db.consentForms.put(form);

  await dispatchSchoolEvent({
    type: 'ANNOUNCEMENT_PUBLISHED',
    entityId: formId,
    entityName: form.title,
    title: `Parent Consent: ${submission.studentName}`,
    summary: `${submission.parentName} ${submission.decision.toLowerCase()} consent for ${form.title}`,
    targetRole: 'Teacher',
  });
}

export async function getSchoolSurveys(): Promise<SchoolSurvey[]> {
  try {
    const surveys = await db.surveys.toArray();
    if (surveys && surveys.length > 0) return surveys;
  } catch (e) {
    console.warn('Error reading school surveys:', e);
  }

  for (const s of DEFAULT_SURVEYS) {
    await db.surveys.put(s).catch(() => {});
  }
  return DEFAULT_SURVEYS;
}

export async function submitSurveyFeedback(
  surveyId: string,
  feedback: {
    userName: string;
    userRole: string;
    rating: number;
    feedbackText: string;
  }
): Promise<void> {
  const survey = await db.surveys.get(surveyId);
  if (!survey) return;

  const record: SurveyResponseRecord = {
    id: `surv-resp-${surveyId}-${Date.now()}`,
    surveyId,
    respondentId: 'usr-' + Date.now(),
    respondentRole: feedback.userRole as any,
    answers: [
      { questionId: 'q1', answerValue: feedback.rating },
      { questionId: 'q2', answerValue: feedback.feedbackText },
    ],
    submittedAt: new Date().toISOString(),
  };

  await db.surveyResponses.put(record);
  survey.responsesCount += 1;
  await db.surveys.put(survey);
}
