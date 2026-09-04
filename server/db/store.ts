import fs from 'fs';
import path from 'path';
import { 
  getPostgresPool, 
  initializePostgresSchema, 
  loadStateFromPostgres, 
  saveStateToPostgres 
} from './postgresStore';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'schoolsoul_db.json');

export interface ServerDBData {
  schoolProfile: any | null;
  users: any[];
  roles: any[];
  settings: any | null;
  auditLogs: any[];
  syncQueue: any[];
  notifications: any[];
  devices: any[];
  students: any[];
  guardians: any[];
  admissions: any[];
  studentDocuments: any[];
  studentTimeline: any[];
  studentNotes: any[];
  classAssignmentLogs: any[];
  digitalIdCards: any[];
  studentAttendance: any[];
  staffAttendance: any[];
  visitors: any[];
  staffLeave: any[];
  calendarEvents: any[];
  attendanceAlerts: any[];
  parentNotifications: any[];
  feeStructures: any[];
  studentFeeAccounts: any[];
  paymentRecords: any[];
  scholarships: any[];
  budgets: any[];
  financialTransactions: any[];
  academicYears: any[];
  academicTerms: any[];
  schoolClasses: any[];
  subjects: any[];
  // Digital Community & Safeguarding collections
  communityGroups: any[];
  groupMemberships: any[];
  groupMembershipRequests: any[];
  groupInvitations: any[];
  groupNotifications: any[];
  communityMessages: any[];
  communityAnnouncements: any[];
  communityProjects: any[];
  communityReports: any[];
  communityModerationActions: any[];
  communityAttachments: any[];
  // Live Learning & Virtual Classroom collections
  liveClasses: any[];
  liveClassAttendance: any[];
  liveClassMessages: any[];
  liveQuestions: any[];
  livePolls: any[];
  liveQuizzes: any[];
  mediaItems: any[];
  mediaProcessingJobs: any[];
  // Universal School Access & QR Discovery
  schoolQRCodes: any[];
  trustedDevices: any[];
  // Universal School Market & Canteen
  marketListings: any[];
  marketOrders: any[];
  marketDisputes: any[];
  marketReviews: any[];
  marketWishlists: any[];
  marketBanners: any[];
  marketDiscounts: any[];
  marketRefunds: any[];
  marketPayouts: any[];
  // Opportunity, Achievement, Skills & Innovation Engine Collections
  skillDefinitions: any[];
  studentSkills: any[];
  skillEvidence: any[];
  studentPortfolios: any[];
  schoolMissions: any[];
  missionTeams: any[];
  missionSubmissions: any[];
  innovationChallenges: any[];
  opportunityItems: any[];
  talentDiscoveryInsights: any[];
  achievementItems: any[];
  digitalCertificates: any[];
  schoolShowcaseItems: any[];
  schoolClubs: any[];
  clubMemberships: any[];
  mentorshipEngagements: any[];
  schoolImpactMetrics: any[];
  // System Health & Performance
  systemHealthLogs: any[];
  // Multi-Gateway Payment Settings
  schoolGatewaySettings: any[];
  // Account Approval Requests
  accountRequests: any[];
  // Account Recovery & Security Escalations
  accountRecoveryRequests: any[];
  // Headteacher Leadership Succession & Handover
  headteacherSuccessionRequests: any[];
  headteacherHistory: any[];
  // Feedback & Error Diagnostic Reports
  systemFeedback: any[];
  systemErrors: any[];
  // V5 Dual-Storage, Sync & Resilience Collections
  conflictRecords: any[];
  quarantinedOperations: any[];
  resilienceEvents: any[];
  backupHistory: any[];
  cloudStorageMetadata: any[];
}

const initialData: ServerDBData = {
  schoolProfile: null,
  users: [],
  roles: [],
  settings: null,
  auditLogs: [],
  syncQueue: [],
  notifications: [],
  accountRequests: [],
  accountRecoveryRequests: [],
  headteacherSuccessionRequests: [],
  headteacherHistory: [],
  systemFeedback: [],
  systemErrors: [],
  conflictRecords: [],
  quarantinedOperations: [],
  resilienceEvents: [],
  backupHistory: [],
  cloudStorageMetadata: [],
  devices: [],
  students: [],
  guardians: [],
  admissions: [],
  studentDocuments: [],
  studentTimeline: [],
  studentNotes: [],
  classAssignmentLogs: [],
  digitalIdCards: [],
  studentAttendance: [],
  staffAttendance: [],
  visitors: [],
  staffLeave: [],
  calendarEvents: [],
  attendanceAlerts: [],
  parentNotifications: [],
  feeStructures: [],
  studentFeeAccounts: [],
  paymentRecords: [],
  scholarships: [],
  budgets: [],
  financialTransactions: [],
  academicYears: [],
  academicTerms: [],
  schoolClasses: [],
  subjects: [],
  communityGroups: [],
  groupMemberships: [],
  groupMembershipRequests: [],
  groupInvitations: [],
  groupNotifications: [],
  communityMessages: [],
  communityAnnouncements: [],
  communityProjects: [],
  communityReports: [],
  communityModerationActions: [],
  communityAttachments: [],
  // Live Learning & Media collections
  liveClasses: [],
  liveClassAttendance: [],
  liveClassMessages: [],
  liveQuestions: [],
  livePolls: [],
  liveQuizzes: [],
  mediaItems: [],
  mediaProcessingJobs: [],
  // Universal School Access & QR Discovery
  schoolQRCodes: [],
  trustedDevices: [],
  // Universal School Market & Canteen
  marketListings: [],
  marketOrders: [],
  marketDisputes: [],
  marketReviews: [],
  marketWishlists: [],
  marketBanners: [],
  marketDiscounts: [],
  marketRefunds: [],
  marketPayouts: [],
  // Opportunity, Achievement, Skills & Innovation Collections
  skillDefinitions: [],
  studentSkills: [],
  skillEvidence: [],
  studentPortfolios: [],
  schoolMissions: [],
  missionTeams: [],
  missionSubmissions: [],
  innovationChallenges: [],
  opportunityItems: [],
  talentDiscoveryInsights: [],
  achievementItems: [],
  digitalCertificates: [],
  schoolShowcaseItems: [],
  schoolClubs: [],
  clubMemberships: [],
  mentorshipEngagements: [],
  schoolImpactMetrics: [],
  // System Health & Performance
  systemHealthLogs: [],
  // Multi-Gateway Payment Settings
  schoolGatewaySettings: [],
};

// In-Memory Fast Cache for high-performance route resolution
let inMemoryCache: ServerDBData | null = null;
let isPostgresSynced = false;

export async function initServerDatabase(): Promise<void> {
  const hasPg = Boolean(getPostgresPool());
  if (hasPg) {
    try {
      await initializePostgresSchema();
      const pgData = await loadStateFromPostgres('schoolsoul_main_state');
      if (pgData) {
        inMemoryCache = {
          ...initialData,
          ...pgData,
        };
        isPostgresSynced = true;
        console.log('✅ Synchronized state from Render PostgreSQL production database.');
        return;
      }
    } catch (err) {
      console.warn('Could not load initial state from PostgreSQL, fallback to local store:', err);
    }
  }

  // Fallback to local storage if PostgreSQL has no state yet or is not configured
  readServerDB();
}

export function readServerDB(): ServerDBData {
  if (inMemoryCache) {
    return inMemoryCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      writeAtomicFile(DB_FILE, initialData);
      inMemoryCache = { ...initialData };
      return inMemoryCache;
    }

    const stat = fs.statSync(DB_FILE);
    if (stat.size === 0) {
      console.warn('Zero-byte schoolsoul_db.json detected, safely recovering to clean initialData');
      try {
        fs.renameSync(DB_FILE, `${DB_FILE}.corrupt-zero-${Date.now()}`);
      } catch {}
      writeAtomicFile(DB_FILE, initialData);
      inMemoryCache = { ...initialData };
      return inMemoryCache;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    if (!raw || !raw.trim()) {
      writeAtomicFile(DB_FILE, initialData);
      inMemoryCache = { ...initialData };
      return inMemoryCache;
    }
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.warn('Malformed schoolsoul_db.json detected, preserving corrupt backup and recovering:', parseErr);
      try {
        fs.writeFileSync(`${DB_FILE}.corrupt-bak-${Date.now()}`, raw);
      } catch {}
      writeAtomicFile(DB_FILE, initialData);
      inMemoryCache = { ...initialData };
      return inMemoryCache;
    }
    if (!parsed || typeof parsed !== 'object') {
      parsed = {};
    }
    inMemoryCache = {
      ...initialData,
      ...parsed,
      students: parsed.students || [],
      guardians: parsed.guardians || [],
      admissions: parsed.admissions || [],
      studentDocuments: parsed.studentDocuments || [],
      studentTimeline: parsed.studentTimeline || [],
      studentNotes: parsed.studentNotes || [],
      classAssignmentLogs: parsed.classAssignmentLogs || [],
      digitalIdCards: parsed.digitalIdCards || [],
      studentAttendance: parsed.studentAttendance || [],
      staffAttendance: parsed.staffAttendance || [],
      visitors: parsed.visitors || [],
      staffLeave: parsed.staffLeave || [],
      calendarEvents: parsed.calendarEvents || [],
      attendanceAlerts: parsed.attendanceAlerts || [],
      parentNotifications: parsed.parentNotifications || [],
      feeStructures: parsed.feeStructures || [],
      studentFeeAccounts: parsed.studentFeeAccounts || [],
      paymentRecords: parsed.paymentRecords || [],
      scholarships: parsed.scholarships || [],
      budgets: parsed.budgets || [],
      financialTransactions: parsed.financialTransactions || [],
      academicYears: parsed.academicYears || [],
      academicTerms: parsed.academicTerms || [],
      schoolClasses: parsed.schoolClasses || [],
      subjects: parsed.subjects || [],
      communityGroups: parsed.communityGroups || [],
      groupMemberships: parsed.groupMemberships || [],
      groupMembershipRequests: parsed.groupMembershipRequests || [],
      groupInvitations: parsed.groupInvitations || [],
      groupNotifications: parsed.groupNotifications || [],
      communityMessages: parsed.communityMessages || [],
      communityAnnouncements: parsed.communityAnnouncements || [],
      communityProjects: parsed.communityProjects || [],
      communityReports: parsed.communityReports || [],
      communityModerationActions: parsed.communityModerationActions || [],
      communityAttachments: parsed.communityAttachments || [],
      liveClasses: parsed.liveClasses || [],
      liveClassAttendance: parsed.liveClassAttendance || [],
      liveClassMessages: parsed.liveClassMessages || [],
      liveQuestions: parsed.liveQuestions || [],
      livePolls: parsed.livePolls || [],
      liveQuizzes: parsed.liveQuizzes || [],
      mediaItems: parsed.mediaItems || [],
      mediaProcessingJobs: parsed.mediaProcessingJobs || [],
      schoolQRCodes: parsed.schoolQRCodes || [],
      trustedDevices: parsed.trustedDevices || [],
      marketListings: parsed.marketListings || [],
      marketOrders: parsed.marketOrders || [],
      marketDisputes: parsed.marketDisputes || [],
      skillDefinitions: parsed.skillDefinitions || [],
      studentSkills: parsed.studentSkills || [],
      skillEvidence: parsed.skillEvidence || [],
      studentPortfolios: parsed.studentPortfolios || [],
      schoolMissions: parsed.schoolMissions || [],
      missionTeams: parsed.missionTeams || [],
      missionSubmissions: parsed.missionSubmissions || [],
      innovationChallenges: parsed.innovationChallenges || [],
      opportunityItems: parsed.opportunityItems || [],
      talentDiscoveryInsights: parsed.talentDiscoveryInsights || [],
      achievementItems: parsed.achievementItems || [],
      digitalCertificates: parsed.digitalCertificates || [],
      schoolShowcaseItems: parsed.schoolShowcaseItems || [],
      schoolClubs: parsed.schoolClubs || [],
      clubMemberships: parsed.clubMemberships || [],
      mentorshipEngagements: parsed.mentorshipEngagements || [],
      schoolImpactMetrics: parsed.schoolImpactMetrics || [],
      systemHealthLogs: parsed.systemHealthLogs || [],
      accountRequests: parsed.accountRequests || [],
      accountRecoveryRequests: parsed.accountRecoveryRequests || [],
      headteacherSuccessionRequests: parsed.headteacherSuccessionRequests || [],
      headteacherHistory: parsed.headteacherHistory || [],
      marketReviews: parsed.marketReviews || [],
      marketWishlists: parsed.marketWishlists || [],
      marketBanners: parsed.marketBanners || [],
      marketDiscounts: parsed.marketDiscounts || [],
      marketRefunds: parsed.marketRefunds || [],
      marketPayouts: parsed.marketPayouts || [],
      schoolGatewaySettings: parsed.schoolGatewaySettings || [],
      conflictRecords: parsed.conflictRecords || [],
      quarantinedOperations: parsed.quarantinedOperations || [],
      resilienceEvents: parsed.resilienceEvents || [],
      backupHistory: parsed.backupHistory || [],
      cloudStorageMetadata: parsed.cloudStorageMetadata || [],
    };
    return inMemoryCache;
  } catch (error) {
    console.error('Failed to read server DB:', error);
    inMemoryCache = { ...initialData };
    return inMemoryCache;
  }
}

export function writeAtomicFile(filePath: string, data: any): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

export function getServerDB(): ServerDBData {
  return readServerDB();
}

export function mutateServerDB<T>(mutator: (db: ServerDBData) => T): T {
  const db = readServerDB();
  const res = mutator(db);
  writeServerDB(db);
  return res;
}

export function writeServerDB(data: ServerDBData): void {
  // Memory bounded queues & audit logs to prevent RAM exhaustion
  if (data.auditLogs && data.auditLogs.length > 5000) {
    data.auditLogs = data.auditLogs.slice(0, 5000);
  }
  if (data.syncQueue && data.syncQueue.length > 5000) {
    data.syncQueue = data.syncQueue.slice(0, 5000);
  }
  if (data.resilienceEvents && data.resilienceEvents.length > 500) {
    data.resilienceEvents = data.resilienceEvents.slice(0, 500);
  }

  inMemoryCache = { ...data };

  // Write atomically to local file system
  try {
    writeAtomicFile(DB_FILE, data);
  } catch (error) {
    console.error('Failed to write server DB locally atomically:', error);
  }

  // Asynchronously flush to PostgreSQL if configured
  if (getPostgresPool()) {
    saveStateToPostgres('schoolsoul_main_state', data).catch((err) => {
      console.error('Asynchronous PostgreSQL save failed:', err);
    });
  }
}
