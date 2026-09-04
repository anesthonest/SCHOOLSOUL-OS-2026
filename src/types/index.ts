export type RoleType =
  | 'Headteacher'
  | 'Deputy Headteacher'
  | 'Administrator'
  | 'Teacher'
  | 'Bursar'
  | 'Registrar'
  | 'Librarian'
  | 'ICT Administrator'
  | 'School Nurse'
  | 'Parent'
  | 'Student'
  | string;

export type UserStatus =
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'PENDING_APPROVAL'
  | 'PENDING_VERIFICATION'
  | 'REJECTED'
  | 'REVOKED';

export type PermissionAction =
  | 'View'
  | 'Create'
  | 'Edit'
  | 'Delete'
  | 'Approve'
  | 'Export'
  | 'Manage Users'
  | 'Manage Settings'
  | 'Manage School'
  | 'View Reports'
  | 'Manage Backup'
  | 'Manage Audit';

export type ModuleName =
  | 'School Profile'
  | 'School Settings'
  | 'User Management'
  | 'Roles & Permissions'
  | 'Dashboard'
  | 'Audit System'
  | 'Backup & Restore'
  | 'System Health'
  | 'Academic Calendar'
  | 'Notifications'
  | 'Student Passport'
  | 'Admissions Engine'
  | 'Daily Operations'
  | 'Attendance Engine'
  | 'Visitor Register'
  | 'Staff Leave Engine'
  | 'Fee Structure'
  | 'Fee Accounts'
  | 'Payment Engine'
  | 'Mobile Money'
  | 'Receipt Engine'
  | 'Scholarships & Discounts'
  | 'Budget Management'
  | 'Income & Expenditure'
  | 'Cashbook & Ledger'
  | 'Financial Reporting'
  | 'Financial Security'
  | 'Academics'
  | 'Academics Hub'
  | 'Academic Structure'
  | 'Curriculum Engine'
  | 'Subject Management'
  | 'Timetable Engine'
  | 'Lesson Planner'
  | 'Homework & Assignments'
  | 'Assessment Engine'
  | 'Examination Management'
  | 'Teacher Gradebook'
  | 'Report Card Engine'
  | 'Academic Analytics'
  | 'Certificates & Transcripts'
  | 'Parent Portal'
  | 'Direct Messaging'
  | 'SMS Engine'
  | 'WhatsApp Integration'
  | 'Announcement Center'
  | 'School News'
  | 'Events & Calendar'
  | 'Parent-Teacher Meetings'
  | 'Digital Consent Forms'
  | 'Feedback & Surveys'
  | 'School Help Centre'
  | 'Community Groups'
  | 'Emergency Alerts'
  | 'Communication Analytics'
  | 'Safeguarding Centre'
  | 'Student Welfare'
  | 'Behaviour & Discipline'
  | 'Counselling Services'
  | 'School Health Centre'
  | 'Incident Management'
  | 'Staff HR Management'
  | 'Staff Leave & Absence'
  | 'Staff Performance'
  | 'Staff CPD'
  | 'Asset Management'
  | 'Inventory Management'
  | 'Policy Document Centre'
  | 'School Administration'
  | 'Compliance & Audit'
  | 'Administration Dashboards'
  | 'Documents'
  | 'Digital Community'
  | 'Live Learning'
  | 'Media Quality Engine'
  | 'Universal Access'
  | 'School Market'
  | 'Canteen Operations'
  | 'Opportunity & Achievement Engine'
  | 'Skills Passport'
  | 'Student Skills Passport'
  | 'School Missions'
  | 'Innovation Challenges'
  | 'Opportunity Board'
  | 'Verified Digital Portfolio'
  | 'Achievement System'
  | 'School Showcase'
  | 'Clubs & Activities'
  | 'Mentorship Suite'
  | 'School Impact'
  | 'School Impact Dashboard'
  | 'Sponsorship & Opportunity Bridge'
  | 'Sponsor Dashboard'
  | 'School Sponsorship Center'
  | 'Sponsorship Management'
  | 'Scholarships & Grants';

export interface PermissionRule {
  module: ModuleName;
  actions: PermissionAction[];
}

export interface RoleDefinition {
  id: string;
  name: RoleType;
  description: string;
  isBuiltIn: boolean;
  permissions: PermissionRule[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountRequest {
  id: string;
  userId?: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  requestedRole: RoleType;
  effectiveRole?: RoleType;
  schoolId: string;
  schoolName?: string;
  status: 'PENDING_APPROVAL' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REVOKED';
  verificationStatus?: 'UNVERIFIED' | 'VERIFIED' | 'FAILED';
  nationalIdOrNin?: string;
  studentIdOrLin?: string;
  matchedStudentId?: string;
  matchedStudentName?: string;
  childLinOrNin?: string;
  tinNumber?: string;
  nssfNumber?: string;
  department?: string;
  requestedAt: string;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerUsername?: string;
  reviewerComment?: string;
  rejectionReason?: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  employeeNumber: string;
  schoolId?: string;
  profilePhoto?: string;
  role: RoleType;
  status: UserStatus;
  approvalStatus?: 'PENDING_APPROVAL' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REVOKED';
  verificationStatus?: 'UNVERIFIED' | 'VERIFIED';
  requestedRole?: RoleType;
  approvalComment?: string;
  rejectionReason?: string;
  matchedStudentId?: string;
  linkedChildrenIds?: string[];
  tinNumber?: string;
  nssfNumber?: string;
  failedLoginAttempts: number;
  lockoutUntil?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeadteacherHistoryRecord {
  id: string;
  schoolId: string;
  headteacherUserId: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  successionReason?: string;
  transitionType: 'INITIAL_FOUNDING' | 'FORMAL_SUCCESSION' | 'EMERGENCY_RECOVERY' | 'INTERIM';
  approvedByUserId?: string;
  approvedByUsername?: string;
  handoverNotes?: string;
  createdAt: string;
}

export interface HeadteacherSuccessionRequest {
  id: string;
  schoolId: string;
  schoolName: string;
  currentHeadteacherUserId?: string;
  currentHeadteacherName?: string;
  incomingFullName: string;
  incomingUsername: string;
  incomingEmail: string;
  incomingPhone: string;
  incomingNationalIdOrNin?: string;
  incomingTeacherRegNumber?: string;
  incomingPasswordHash?: string;
  reasonForSuccession: string;
  handoverDocumentRef?: string;
  status: 'SUCCESSION_REQUESTED' | 'NEW_HEADTEACHER_VERIFICATION' | 'SUCCESSION_APPROVED' | 'SUCCESSION_REJECTED' | 'SUCCESSION_COMPLETED';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByUsername?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  effectiveDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountRecoveryRequest {
  id: string;
  recoveryType: 'FORGOT_PASSWORD' | 'FORGOT_EMAIL' | 'FORGOT_PHONE' | 'LOST_BOTH_CONTACTS' | 'HEADTEACHER_RECOVERY';
  targetUserId?: string;
  identifier: string;
  fullName?: string;
  schoolId: string;
  schoolName?: string;
  userRole?: string;
  contactProvided?: string;
  newEmail?: string;
  newPhone?: string;
  nationalIdOrNin?: string;
  studentIdOrLin?: string;
  recoveryNotes?: string;
  resetTokenHash?: string;
  resetTokenExpiry?: string;
  otpCodeHash?: string;
  otpExpiry?: string;
  otpAttempts?: number;
  status:
    | 'PENDING_VERIFICATION'
    | 'HEADTEACHER_RECOVERY_PENDING'
    | 'PENDING_HEADTEACHER_REVIEW'
    | 'PENDING_OTP_VERIFICATION'
    | 'VERIFIED'
    | 'COMPLETED'
    | 'RESOLVED_APPROVED'
    | 'RESOLVED_PASSWORD_RESET'
    | 'RESOLVED_CONTACTS_UPDATED'
    | 'REJECTED'
    | 'EXPIRED';
  resolutionAction?: 'PASSWORD_RESET' | 'CONTACT_UPDATED' | 'MANUAL_OVERRIDE';
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewerUsername?: string;
  reviewedAt?: string;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolProfile {
  id: string;
  schoolName: string;
  schoolMotto: string;
  schoolType: 'Primary' | 'Secondary' | 'Comprehensive' | 'TVET' | 'Tertiary' | 'International' | 'Vocational' | 'College' | 'University' | 'Specialized';
  schoolLevel: 'National' | 'Regional' | 'District' | 'International';
  registrationNumber: string;
  schoolLogo?: string;
  physicalAddress: string;
  district: string;
  region: string;
  country: string;
  countryId?: string;
  countryCode: string;
  educationFrameworkId?: string;
  curriculumId?: string;
  currency?: string;
  dateFormat?: string;
  telephone: string;
  email: string;
  website?: string;
  academicYear: string;
  academicTerm: 'Term I' | 'Term II' | 'Term III' | string;
  timeZone: string;
  preferredLanguage: string;
  supportedLanguages?: string[];
  paymentProviders?: string[];
  isConfigured: boolean;
  isCountryLocked?: boolean;
  dataRecordCount?: number;
  currentHeadteacherId?: string;
  currentHeadteacherName?: string;
  headteacherHistory?: HeadteacherHistoryRecord[];
  configuration?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserSchoolMembership {
  schoolId: string;
  schoolName: string;
  schoolLogo?: string;
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  role: RoleType;
  currency: string;
  isDefault: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userRole: string;
  action:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'LOGOUT'
    | 'PASSWORD_CHANGE'
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'USER_DELETE'
    | 'USER_STATUS_CHANGE'
    | 'ROLE_CREATE'
    | 'ROLE_UPDATE'
    | 'SETTINGS_UPDATE'
    | 'SCHOOL_SETUP'
    | 'BACKUP_CREATED'
    | 'BACKUP_RESTORED'
    | 'SYNC_OPERATION'
    | 'ADMISSION_CREATE'
    | 'ADMISSION_UPDATE'
    | 'ADMISSION_APPROVE'
    | 'ADMISSION_REJECT'
    | 'STUDENT_CREATE'
    | 'STUDENT_UPDATE'
    | 'STUDENT_STATUS_CHANGE'
    | 'CLASS_TRANSFER'
    | 'DOCUMENT_UPLOAD'
    | 'DOCUMENT_VERIFY'
    | 'NOTE_ADD'
    | 'DIGITAL_ID_GENERATE'
    | 'ATTENDANCE_RECORD'
    | 'ATTENDANCE_CORRECTION'
    | 'STAFF_CHECKIN'
    | 'VISITOR_CHECKIN'
    | 'VISITOR_CHECKOUT'
    | 'LEAVE_REQUEST'
    | 'LEAVE_APPROVE'
    | 'LEAVE_REJECT'
    | 'CALENDAR_EVENT_CREATE'
    | 'NOTIFICATION_DISPATCH'
    | 'FEE_STRUCTURE_CREATE'
    | 'FEE_STRUCTURE_UPDATE'
    | 'PAYMENT_RECORD'
    | 'PAYMENT_REVERSAL'
    | 'REFUND_PROCESS'
    | 'SCHOLARSHIP_GRANT'
    | 'BUDGET_CREATE'
    | 'BUDGET_UPDATE'
    | 'TRANSACTION_RECORD'
    | 'RECONCILIATION_RUN'
    | 'REMINDER_SEND'
    | 'COMMUNITY_GROUP_CREATE'
    | 'COMMUNITY_GROUP_UPDATE'
    | 'COMMUNITY_REQUEST_CREATE'
    | 'COMMUNITY_REQUEST_APPROVE'
    | 'COMMUNITY_REQUEST_REJECT'
    | 'COMMUNITY_REQUEST_CANCEL'
    | 'COMMUNITY_INVITE_CREATE'
    | 'COMMUNITY_INVITE_ACCEPT'
    | 'COMMUNITY_INVITE_DECLINE'
    | 'COMMUNITY_GROUP_LEAVE'
    | 'COMMUNITY_GROUP_JOIN'
    | 'COMMUNITY_AUTO_ENROLL'
    | 'COMMUNITY_MODERATION';
  details: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface SyncQueueItem {
  id: string;
  entity?:
    | 'user'
    | 'school'
    | 'role'
    | 'setting'
    | 'audit'
    | 'student'
    | 'guardian'
    | 'admission'
    | 'document'
    | 'note'
    | 'class_log'
    | 'digital_id'
    | 'student_attendance'
    | 'staff_attendance'
    | 'visitor'
    | 'staff_leave'
    | 'calendar_event'
    | 'attendance_alert'
    | 'parent_notification'
    | 'fee_structure'
    | 'student_fee_account'
    | 'payment_record'
    | 'scholarship'
    | 'budget'
    | 'financial_transaction'
    | 'journal_entry'
    | 'payment_reminder';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'INSERT';
  payload: any;
  timestamp?: string;
  status: 'pending' | 'syncing' | 'failed' | 'synced' | 'Pending' | 'Syncing' | 'Synced' | 'Conflict' | 'Failed';
  retryCount: number;
  errorMessage?: string;
  recordType?: string;
  entityId?: string;
  createdAt?: string;
  hash?: string;
  conflictResolution?: 'Last-Write-Wins' | 'Server-Authoritative' | 'Manual';
}

export interface SecurityPolicy {
  inactivityTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  requireStrongPassword: boolean;
  passwordMinLength: number;
}

export interface NotificationChannelConfig {
  inApp: boolean;
  smsEnabled: boolean;
  smsProviderName?: string;
  smsApiKey?: string;
  emailEnabled: boolean;
  smtpHost?: string;
  whatsAppEnabled: boolean;
  whatsAppApiKey?: string;
  pushEnabled: boolean;
}

export interface SystemSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  security: SecurityPolicy;
  notifications: NotificationChannelConfig;
  backupAutoScheduleDays: number;
  lastBackupAt?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'security' | 'user' | 'academic';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface RegisteredDevice {
  id: string;
  userId?: string;
  deviceName: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  lastActive?: string;
  isCurrentDevice?: boolean;
  deviceType?: 'Headteacher Office' | 'Bursar Office' | 'Deputy Office' | 'Reception' | 'ICT Lab' | 'Library' | 'Staff Room' | 'Classroom PC' | 'Tablet';
  ownerName?: string;
  fingerprint?: string;
  macAddress?: string;
  registeredAt?: string;
  lastActiveAt?: string;
  status?: 'Pending Approval' | 'Approved' | 'Rejected' | 'Blocked';
  sessionDurationMinutes?: number;
  currentLoggedInUser?: string;
  networkQuality?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  pingMs?: number;
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  schoolProfile: SchoolProfile | null;
  users: User[];
  roles: RoleDefinition[];
  settings: SystemSettings | null;
  auditLogs: AuditLog[];
  checksum: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLockedDueToInactivity: boolean;
}

// --- Vision 2: Student Passport & Admissions Engine Domain Models ---

export type StudentStatus = 'Active' | 'Suspended' | 'Transferred' | 'Graduated' | 'Withdrawn' | 'Expelled';

export type ResidenceType = 'Day' | 'Boarding';

export type GenderType = 'Male' | 'Female' | 'Other';

export interface Student {
  id: string;
  studentId: string; // LIN / UPI / National Learner ID (e.g. LIN-2026-8941)
  admissionNumber: string; // e.g. ADM-2026-0001
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  gender: GenderType;
  dateOfBirth: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  nationality: string;
  nationalIdOrBirthCert: string;
  religion?: string;
  primaryLanguage?: string;
  photoUrl?: string;
  classGrade: string; // e.g. "Primary 1", "Senior 4", "Form 2"
  stream?: string; // e.g. "A", "East", "Blue"
  houseOrDorm?: string; // e.g. "Kabalega House"
  residenceType: ResidenceType;
  enrolmentDate: string;
  status: StudentStatus;
  previousSchool?: {
    name: string;
    lastGradePassed: string;
    leavingReason?: string;
    aggregateScore?: string;
  };
  medicalInfo?: {
    allergies?: string;
    chronicConditions?: string;
    emergencyInstructions?: string;
    bloodGroup?: string;
  };
  specialNeeds?: string;
  qrVerificationHash: string; // Verifiable checksum/hash string for QR Scanner
  createdAt: string;
  updatedAt: string;
}

export interface Guardian {
  id: string;
  studentId: string;
  fullName: string;
  relationship: 'Father' | 'Mother' | 'Guardian' | 'Sponsor' | 'Relative' | string;
  phoneNumber: string;
  alternatePhone?: string;
  email?: string;
  nationalId: string;
  occupation?: string;
  residentialAddress: string;
  isPrimaryContact: boolean;
  isEmergencyContact: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdmissionStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Waitlisted'
  | 'Rejected'
  | 'Enrolled';

export interface AdmissionApplication {
  id: string;
  applicationNumber: string; // e.g. APP-2026-0042
  applicantFirstName: string;
  applicantMiddleName?: string;
  applicantLastName: string;
  applicantFullName: string;
  dateOfBirth: string;
  gender: GenderType;
  appliedGrade: string;
  residenceType: ResidenceType;
  academicYear: string;
  status: AdmissionStatus;
  submissionDate: string;
  reviewedBy?: string;
  reviewerNotes?: string;
  previousSchoolName?: string;
  previousGrade?: string;
  previousAggregate?: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  guardianEmail?: string;
  guardianAddress: string;
  medicalNotes?: string;
  specialNeeds?: string;
  createdStudentId?: string; // linked student ID once enrolled
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory =
  | 'Birth Certificate'
  | 'Passport Photo'
  | 'Academic Report'
  | 'Medical Certificate'
  | 'Guardian ID'
  | 'Conduct Certificate'
  | 'Other';

export interface StudentDocument {
  id: string;
  studentId: string;
  title: string;
  category: DocumentCategory;
  fileType: string;
  fileData?: string; // Base64 or Blob storage for local offline repository
  fileName: string;
  fileSize: number;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export type TimelineEventType =
  | 'ADMISSION'
  | 'ENROLMENT'
  | 'CLASS_ASSIGNMENT'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_VERIFIED'
  | 'STATUS_CHANGE'
  | 'NOTE_ADDED'
  | 'ID_ISSUED'
  | 'DISCIPLINARY'
  | 'ACADEMIC_LOG';

export interface StudentTimelineEvent {
  id: string;
  studentId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type NoteCategory = 'Academic' | 'Behavioral' | 'Medical' | 'Administrative' | 'General';

export interface StudentNote {
  id: string;
  studentId: string;
  category: NoteCategory;
  note: string;
  authorId: string;
  authorName: string;
  isConfidential: boolean;
  createdAt: string;
}

export interface ClassAssignmentLog {
  id: string;
  studentId: string;
  previousClass?: string;
  newClass: string;
  previousStream?: string;
  newStream?: string;
  academicYear: string;
  reason: string;
  assignedBy: string;
  timestamp: string;
}

export interface DigitalIDCard {
  id: string;
  studentId: string;
  cardSerialNumber: string;
  qrPayload: string;
  issuedAt: string;
  expiresAt: string;
  status: 'Active' | 'Revoked' | 'Expired';
  issuedBy: string;
}

// --- Vision 3: Attendance & Daily Operations Engine Domain Models ---

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Sick'
  | 'Excused'
  | 'Suspended'
  | 'School Activity';

export type AttendanceSession = 'Morning' | 'Afternoon' | 'Full Day';

export type AbsenceReasonCategory =
  | 'Sick'
  | 'Family emergency'
  | 'Official permission'
  | 'Transport issue'
  | 'Financial reasons'
  | 'Unknown'
  | 'Other';

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  stream: string;
  date: string; // YYYY-MM-DD
  session: AttendanceSession;
  subject?: string;
  status: AttendanceStatus;
  arrivalNote?: string;
  absenceReason?: AbsenceReasonCategory;
  recordedBy: string;
  recordedAt: string;
  updatedAt: string;
}

export type StaffAttendanceStatus =
  | 'Present'
  | 'Late'
  | 'Early Departure'
  | 'On Leave'
  | 'Official Duty'
  | 'Sick Leave'
  | 'Absent';

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  status: StaffAttendanceStatus;
  remarks?: string;
  recordedBy: string;
  timestamp: string;
}

export interface VisitorRecord {
  id: string;
  visitorName: string;
  phone: string;
  nationalId?: string;
  organisation?: string;
  personToVisit: string;
  purpose: string;
  badgeNumber: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Checked In' | 'Checked Out';
  registeredBy: string;
  date: string; // YYYY-MM-DD
}

export type StaffLeaveType = 'Annual' | 'Sick' | 'Compassionate' | 'Study' | 'Official Duty';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface StaffLeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  role?: string;
  department?: string;
  leaveType: StaffLeaveType | string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  daysCount?: number;
  reliefStaffName?: string;
  reason: string;
  status: LeaveStatus | string;
  appliedAt?: string;
  appliedDate?: string;
  handoverStaffName?: string;
  approvalSteps?: LeaveApprovalStep[];
  attachmentUrl?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerComments?: string;
  createdAt?: string;
}

export type CalendarEventType =
  | 'Term Period'
  | 'Holiday'
  | 'Public Holiday'
  | 'Staff Meeting'
  | 'Examination'
  | 'School Event'
  | 'Parent Meeting';

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  term?: 'Term I' | 'Term II' | 'Term III';
  description?: string;
  isAttendanceDay: boolean;
  createdBy: string;
  createdAt: string;
}

export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AttendanceAlert {
  id: string;
  studentId?: string;
  studentName?: string;
  staffId?: string;
  staffName?: string;
  classGrade?: string;
  alertType:
    | 'Frequent Absenteeism'
    | 'Chronic Lateness'
    | 'Consecutive Absences'
    | 'Low Class Threshold'
    | 'Staff Absence';
  severity: AlertSeverity;
  message: string;
  date: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  acknowledgedBy?: string;
  createdAt: string;
}

export type ParentNotificationTrigger =
  | 'Student Absent'
  | 'Student Late'
  | 'Consecutive Absences'
  | 'Attendance Improvement';

export type ParentNotificationChannel = 'SMS' | 'WhatsApp' | 'Email' | 'In-App';

export interface ParentAttendanceNotification {
  id: string;
  studentId: string;
  studentName: string;
  guardianPhone: string;
  eventTrigger: ParentNotificationTrigger;
  channel: ParentNotificationChannel;
  message: string;
  sentAt: string;
  status: 'Queued' | 'Sent' | 'Failed' | 'Simulated';
}

// --- Vision 4: Finance, Fees & Mobile Money Engine Domain Models ---

export type FeeCategory =
  | 'Tuition'
  | 'Admission'
  | 'Development'
  | 'Examination'
  | 'Boarding'
  | 'Meals'
  | 'Uniform'
  | 'Transport'
  | 'Library'
  | 'Laboratory'
  | 'Activities'
  | 'ICT'
  | 'Medical'
  | 'Other';

export interface FeeCategoryItem {
  id: string;
  category: FeeCategory;
  name: string;
  amountUGX: number;
  isMandatory: boolean;
  appliesTo: 'All' | 'Day' | 'Boarding' | 'New Students' | 'Continuing';
}

export interface FeeInstallmentPlan {
  installmentNumber: number;
  percentageOrAmount: number; // e.g. 50 (%) or specific amount
  dueDate: string;
  latePenaltyPercentage: number;
}

export interface FeeStructure {
  id: string;
  title: string;
  academicYear: string;
  term: 'Term I' | 'Term II' | 'Term III';
  classGrade: string; // e.g. "Primary 7", "Senior 4", "All Primary"
  residenceType: ResidenceType | 'All';
  studentCategory: 'All' | 'New' | 'Continuing';
  items: FeeCategoryItem[];
  totalMandatoryAmountUGX: number;
  installmentPlans: FeeInstallmentPlan[];
  latePenaltyPolicy?: {
    enabled: boolean;
    percentageAfterDueDate: number;
    gracePeriodDays: number;
  };
  status: 'Draft' | 'Active' | 'Archived';
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFeeAccount {
  id: string;
  studentId: string; // Linked to Student Passport
  studentName: string;
  admissionNumber: string;
  classGrade: string;
  stream?: string;
  residenceType: ResidenceType;
  academicYear: string;
  term: 'Term I' | 'Term II' | 'Term III';
  feeStructureId?: string;
  totalBilledUGX: number;
  totalDiscountUGX: number;
  totalScholarshipUGX: number;
  netBilledUGX: number;
  totalPaidUGX: number;
  outstandingBalanceUGX: number;
  overpaymentUGX: number;
  status: 'Paid' | 'Partial' | 'Overdue' | 'Unpaid' | 'Overpaid';
  lastPaymentDate?: string;
  updatedAt: string;
}

export type PaymentType =
  | 'Partial'
  | 'Full'
  | 'Advance'
  | 'Overpayment'
  | 'Reversal'
  | 'Refund';

export type PaymentMethod =
  | 'Cash'
  | 'Bank Deposit'
  | 'Bank Transfer'
  | 'MTN Mobile Money'
  | 'Airtel Money'
  | 'Cheque'
  | 'Online Payment'
  | 'Other';

export interface PaymentRecord {
  id: string;
  receiptNumber: string; // REC-2026-XXXX
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classGrade: string;
  guardianName?: string;
  guardianPhone?: string;
  academicYear: string;
  term: 'Term I' | 'Term II' | 'Term III';
  amountPaidUGX: number;
  previousBalanceUGX: number;
  newBalanceUGX: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  transactionReference: string; // e.g. "MTN-94281920" or "BANK-DEP-0042"
  bankName?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: 'MTN' | 'Airtel';
  status: 'Completed' | 'Pending Verification' | 'Reversed' | 'Refunded' | 'Failed';
  cashierId: string;
  cashierName: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  verificationCode: string; // Checksum code e.g. "SS-VER-8912-3391"
  qrPayload: string;
  notes?: string;
  isOfflineCaptured: boolean;
}

export type ScholarshipType =
  | 'Merit'
  | 'Sports'
  | 'Staff Child'
  | 'Sibling Discount'
  | 'Community Sponsorship'
  | 'Government Bursary'
  | 'Individual Waiver'
  | 'Temporary Discount';

export interface ScholarshipRecord {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  discountType: ScholarshipType;
  discountValueType: 'Percentage' | 'Fixed Amount';
  value: number; // e.g. 50 (%) or 500000 (UGX)
  calculatedAmountUGX: number;
  academicYear: string;
  term: 'Term I' | 'Term II' | 'Term III' | 'Full Year';
  reason: string;
  sponsorName?: string;
  approvedBy: string;
  status: 'Active' | 'Expired' | 'Revoked' | 'Pending Approval';
  startDate: string;
  expiryDate: string;
  createdAt: string;
}

export type BudgetCategory =
  | 'Academics'
  | 'Administration'
  | 'Infrastructure'
  | 'Utilities'
  | 'ICT'
  | 'Library'
  | 'Laboratory'
  | 'Sports'
  | 'Maintenance'
  | 'Welfare'
  | 'Transport'
  | 'Boarding'
  | 'Custom';

export interface BudgetItem {
  id: string;
  title: string;
  category: BudgetCategory;
  academicYear: string;
  term: 'Term I' | 'Term II' | 'Term III';
  allocatedAmountUGX: number;
  actualSpentUGX: number;
  remainingAmountUGX: number;
  varianceUGX: number;
  status: 'Draft' | 'Approved' | 'Exceeded' | 'On Track';
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'Income' | 'Expense';

export type IncomeCategory =
  | 'Fees'
  | 'Donations'
  | 'Grants'
  | 'Fundraising'
  | 'Rentals'
  | 'Sales'
  | 'Other Income';

export type ExpenseCategory =
  | 'Salaries'
  | 'Utilities'
  | 'Repairs'
  | 'Supplies'
  | 'Fuel'
  | 'Food'
  | 'Maintenance'
  | 'Transport'
  | 'ICT'
  | 'Boarding Food'
  | 'Exam Materials'
  | 'Other Expense';

export interface FinancialTransaction {
  id: string;
  transactionType: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amountUGX: number;
  description: string;
  voucherNumber?: string;
  receiptOrRefNumber?: string;
  paymentMethod: PaymentMethod;
  payerOrPayeeName: string;
  payeeOrPayer?: string;
  approvalStatus: 'Approved' | 'Pending Approval' | 'Rejected';
  approvedBy?: string;
  recordedBy: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  attachmentUrl?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  referenceNumber: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amountUGX: number;
  recordedBy: string;
  timestamp: string;
}

export type MobileMoneyProvider = 'MTN Mobile Money' | 'Airtel Money';

export interface MobileMoneyRequest {
  id: string;
  provider: MobileMoneyProvider;
  phoneNumber: string;
  studentId: string;
  studentName: string;
  amountUGX: number;
  referenceNumber: string;
  externalTransactionId?: string;
  status: 'Initiated' | 'Pending Authorization' | 'Successful' | 'Failed' | 'Timed Out' | 'Reconciled';
  failureReason?: string;
  initiatedBy: string;
  timestamp: string;
}

export interface PaymentReminder {
  id: string;
  studentId: string;
  studentName: string;
  guardianPhone: string;
  parentPhone?: string;
  guardianName: string;
  outstandingBalanceUGX: number;
  dueDate: string;
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'In-App';
  message: string;
  reminderType: 'Upcoming Due Date' | 'Overdue Fee Warning' | 'Installment Notice' | 'Scholarship Expiry';
  status: 'Queued' | 'Sent' | 'Failed';
  sentAt?: string;
  scheduledDate: string;
}

// Vision 5: Academics, Assessment & Reporting Types

export type CurriculumType =
  | 'Ugandan CBC (NCDC)'
  | 'Ugandan UNEB Traditional'
  | 'Primary Thematic'
  | 'Cambridge International'
  | 'IB World School'
  | 'Custom Curriculum';

export interface AcademicYearConfig {
  id: string;
  yearName: string; // e.g. "2026"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface AcademicTermConfig {
  id: string;
  yearId: string;
  termName: 'Term 1' | 'Term 2' | 'Term 3' | 'Semester 1' | 'Semester 2';
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  reportReleaseFeePolicy: 'Allow All' | 'Require 50% Clear' | 'Require 100% Clear' | 'Bursar Approval Only';
}

export interface SchoolClass {
  id: string;
  className: string; // e.g. "Senior 1", "Senior 4", "Primary 5"
  classCode: string; // e.g. "S.1", "S.4", "P.5"
  level: 'Primary' | 'Lower Secondary' | 'Upper Secondary' | 'TVET' | 'Tertiary';
  curriculumType: CurriculumType;
  streams: string[]; // e.g. ["North", "South", "East", "West"]
}

export interface AcademicStream {
  id: string;
  classId: string;
  className: string;
  streamName: string;
  classTeacherId?: string;
  classTeacherName?: string;
  roomNumber?: string;
}

export interface AcademicDepartment {
  id: string;
  name: string; // e.g. "Mathematics", "Sciences", "Humanities", "Languages", "Vocational"
  code: string;
  headOfDepartmentId?: string;
  headOfDepartmentName?: string;
}

export interface SchoolHouse {
  id: string;
  houseName: string; // e.g. "Kabalega", "Lumumba", "Mutesa", "Nile"
  colorHex: string;
  patronTeacherName?: string;
}

export interface AcademicClub {
  id: string;
  clubName: string; // e.g. "Debating Club", "ICT & Robotics", "Scouts & Guides", "Wildlife & Eco"
  patronTeacherName?: string;
  category: 'Academic' | 'Sports' | 'Social & Leadership' | 'Arts & Culture';
}

export interface Subject {
  id: string;
  subjectCode: string; // e.g. "MTH 101", "ENG 101", "BIO 201"
  subjectName: string; // e.g. "Mathematics", "English Language", "Biology"
  department: string;
  classification: 'Core' | 'Elective' | 'Vocational' | 'Practical / Lab';
  curriculumType: CurriculumType;
  classIds: string[]; // Classes taking this subject
  teacherIds: string[]; // Assigned teachers
  isActive: boolean;
}

export interface TimetableSlot {
  id: string;
  classGrade: string;
  stream: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periodNumber: number; // 1 to 8
  startTime: string; // "08:00"
  endTime: string; // "08:40"
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomName: string;
  isBreak?: boolean;
  isLunch?: boolean;
}

export interface LessonPlan {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classGrade: string;
  stream: string;
  teacherId: string;
  teacherName: string;
  lessonDate: string;
  learningOutcomes: string;
  competenciesTargeted: string;
  resourcesNeeded: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Completed';
  reflections?: string;
  createdAt: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classGrade: string;
  stream: string;
  teacherId: string;
  teacherName: string;
  dueDate: string;
  totalPoints: number;
  attachmentName?: string;
  createdAt: string;
  submissionsCount: number;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  submissionText: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'Pending' | 'Graded' | 'Late';
}

export type AssessmentType =
  | 'Class Test'
  | 'Coursework'
  | 'Activity of Integration (AOI)'
  | 'Project'
  | 'Oral'
  | 'End of Term Exam'
  | 'Mock Exam';

export interface Assessment {
  id: string;
  title: string;
  assessmentType: AssessmentType;
  subjectId: string;
  subjectName: string;
  classGrade: string;
  stream: string;
  academicYear: string;
  term: string;
  maxScore: number;
  weightPercent: number; // e.g. 20 for CBC AOI, 80 for End of Term
  status: 'Draft' | 'Submitted for Moderation' | 'Approved' | 'Published';
  createdBy: string;
  createdAt: string;
}

export interface StudentMark {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  subjectId: string;
  subjectName?: string;
  classGrade: string;
  stream: string;
  rawScore: number;
  maxScore: number;
  weightedScore: number;
  grade: string; // e.g. "D1", "C3", "A", "3"
  competencyLevel?: '1 - Basic' | '2 - Moderate' | '3 - Outstanding' | string;
  teacherComments?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface ExamSchedule {
  id: string;
  examName: string; // e.g. "Term 1 Mid-Term Exams 2026", "UNEB Mock Examinations"
  academicYear: string;
  term: string;
  startDate: string;
  endDate: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Published';
}

export interface ExamSlot {
  id: string;
  examScheduleId: string;
  subjectId: string;
  subjectName: string;
  classGrade: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomName: string;
  invigilatorName: string;
  candidatesCount: number;
}

export interface SubjectReportGrade {
  subjectId: string;
  subjectName: string;
  caScore: number; // Out of 20 (or custom)
  examScore: number; // Out of 80 (or custom)
  totalScore: number; // Out of 100
  grade: string; // "D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9" or A-F
  competencyLevel?: string; // For CBC
  teacherComment: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classGrade: string;
  stream: string;
  academicYear: string;
  term: string;
  attendanceTotalDays: number;
  attendancePresentDays: number;
  attendanceAbsentDays: number;
  subjectGrades: SubjectReportGrade[];
  totalAggregate?: number;
  averageScore: number;
  overallGrade: string;
  conductRating: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  classTeacherComment: string;
  headTeacherComment: string;
  promotionStatus: 'Promoted' | 'Retained' | 'Probation' | 'Pending Final Term';
  verificationHash: string;
  qrCodeUrl: string;
  status: 'Draft' | 'Approved' | 'Published';
  isFeeBlocked: boolean; // Flagged if fees unpaid and policy restricts release
  outstandingBalanceUGX: number;
  generatedAt: string;
}

export interface AcademicCertificate {
  id: string;
  certificateType: 'Academic Transcript' | 'School Leaving Certificate' | 'Certificate of Excellence' | 'Competency Certificate';
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classGrade: string;
  academicYear: string;
  issueDate: string;
  summaryTitle: string;
  verificationHash: string;
  qrCodeUrl: string;
  issuedBy: string;
  detailsText: string;
}

// ==========================================
// VISION 6: PARENT COMMUNICATION & COMMUNITY
// ==========================================

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'audio' | 'document';
  fileUrl: string;
  fileSizeFormatted: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  recipientId?: string;
  recipientName?: string;
  messageText: string;
  attachments?: MessageAttachment[];
  isVoiceNote?: boolean;
  voiceDurationSec?: number;
  readByUsers?: string[]; // user IDs who read it
  isFlaggedForModeration?: boolean;
  createdAt: string;
}

export interface MessageConversation {
  id: string;
  title: string;
  conversationType: 'Direct' | 'ClassBroadcast' | 'StaffBroadcast' | 'SchoolBroadcast';
  participantIds: string[];
  participantNames: string[];
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  classGrade?: string;
  stream?: string;
  isGroup: boolean;
  createdBy: string;
}

export interface SmsLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  recipientType: 'Parent' | 'Staff' | 'Student' | 'Custom';
  messageText: string;
  provider: 'AfricasTalking' | 'Twilio' | 'AirtelUganda' | 'MtnUganda';
  status: 'Sent' | 'Delivered' | 'Failed' | 'Queued';
  triggerType: 'Manual' | 'Attendance Alert' | 'Fee Reminder' | 'Exam Notice' | 'Emergency' | 'Homework' | 'Report Release';
  costUGX: number;
  sentAt: string;
}

export interface WhatsAppLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  templateName: string;
  messageContent: string;
  providerStatus: 'Sent' | 'Delivered' | 'Read' | 'Failed';
  interactiveButtons?: string[];
  sentAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Academics' | 'Sports' | 'Administration' | 'Events' | 'Holidays' | 'Exams' | 'Emergencies' | 'General';
  audienceScope: 'All' | 'Parents' | 'Staff' | 'Students' | 'SpecificClass';
  classGrade?: string;
  content: string;
  authorName: string;
  authorRole: string;
  isPinned: boolean;
  expiryDate: string;
  attachments?: MessageAttachment[];
  pushTriggered: boolean;
  smsTriggered: boolean;
  createdAt: string;
}

export interface SchoolNewsArticle {
  id: string;
  title: string;
  category: 'Sports' | 'Academic Achievements' | 'Campus Life' | 'Community Project' | 'Leadership Speech';
  summary: string;
  content: string;
  featuredImageUrl: string;
  authorName: string;
  authorRole: string;
  status: 'Draft' | 'Pending Approval' | 'Published';
  approvedBy?: string;
  viewsCount: number;
  publishDate: string;
}

export interface SchoolEventItem {
  id: string;
  title: string;
  eventType: 'Academic' | 'Sports' | 'PTM' | 'Trip' | 'Cultural' | 'Religious' | 'Holiday' | 'General';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  organizer: string;
  targetAudience: string;
  rsvpCounts: {
    attending: number;
    declined: number;
    pending: number;
  };
  isPublic: boolean;
}

export interface EventRsvpRecord {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userRole: string;
  childName?: string;
  status: 'Attending' | 'Declined' | 'Pending';
  notes?: string;
  updatedAt: string;
}

export interface ParentTeacherMeetingSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedByParentId?: string;
  parentName?: string;
  parentPhone?: string;
  studentId?: string;
  studentName?: string;
  classGrade?: string;
  meetingType: 'In-Person' | 'Virtual Call';
  meetingNotes?: string;
  status: 'Available' | 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface DigitalConsentForm {
  id: string;
  title: string;
  category: 'School Trip' | 'Medical Permission' | 'Media & Photo Consent' | 'Event Participation' | 'Fee Payment Agreement';
  description: string;
  classGrade: string;
  dueDate: string;
  createdBy: string;
  totalRequested: number;
  totalSigned: number;
  totalDeclined: number;
  requiresFeeApproval?: boolean;
  feeAmountUGX?: number;
  status: 'Active' | 'Closed';
  createdAt: string;
}

export interface ParentConsentSubmission {
  id: string;
  consentFormId: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  status: 'Approved' | 'Declined';
  digitalSignatureToken: string;
  signatureDate: string;
  parentIpAddress: string;
  notes?: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'choice' | 'text';
  options?: string[];
}

export interface SchoolSurvey {
  id: string;
  title: string;
  targetAudience: 'Parents' | 'Teachers' | 'Students' | 'All';
  description: string;
  expiryDate: string;
  isAnonymous: boolean;
  questions: SurveyQuestion[];
  responsesCount: number;
  status: 'Active' | 'Closed';
  createdAt: string;
}

export interface SurveyResponseRecord {
  id: string;
  surveyId: string;
  respondentId: string;
  respondentRole: string;
  answers: { questionId: string; answerValue: string | number }[];
  submittedAt: string;
}

export interface HelpDeskTicketReply {
  id: string;
  senderName: string;
  role: string;
  message: string;
  timestamp: string;
}

export interface HelpDeskTicket {
  id: string;
  ticketNumber: string;
  requesterName: string;
  requesterRole: string;
  requesterPhone: string;
  category: 'Fee Inquiry' | 'Academic Concern' | 'Transport & Busing' | 'IT & Portal Access' | 'General Request';
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedStaffId?: string;
  assignedStaffName?: string;
  replies: HelpDeskTicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityGroupItem {
  id: string;
  groupName: string;
  category: 'PTA Committee' | 'Class Parents' | 'Sports Clubs' | 'Old Students' | 'School Board' | 'Staff Room';
  description: string;
  moderatorId: string;
  moderatorName: string;
  memberCount: number;
  isPrivate: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface GroupPostItem {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  attachmentUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface EmergencyAlertRecord {
  id: string;
  alertTitle: string;
  emergencyType: 'Security Incident' | 'Severe Weather' | 'Unscheduled School Closure' | 'Health & Epidemic' | 'Transport Emergency';
  severity: 'High' | 'Critical';
  messageContent: string;
  targetAudience: 'All Parents & Staff' | 'Boarding Parents' | 'Day Parents' | 'All Staff Only';
  broadcastChannels: ('SMS' | 'WhatsApp' | 'Push Notification' | 'In-App Alert')[];
  sentBy: string;
  totalRecipients: number;
  deliveredCount: number;
  timestamp: string;
}

// ==========================================
// VISION 7: SAFEGUARDING, WELFARE, HR & ADMIN
// ==========================================

export interface SafeguardingCaseNote {
  id: string;
  authorName: string;
  authorRole: string;
  note: string;
  isConfidential: boolean;
  createdAt: string;
}

export interface SafeguardingCase {
  id: string;
  caseNumber: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  category: 'Child Protection' | 'Neglect' | 'Physical Abuse' | 'Emotional Abuse' | 'Bullying' | 'Online Safety' | 'Mental Health' | 'Confidential Referral';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Under Investigation' | 'Escalated' | 'Referred' | 'Resolved' | 'Closed';
  reportedBy: string;
  assignedTo: string;
  description: string;
  confidentialNotes: SafeguardingCaseNote[];
  evidenceFiles?: string[];
  externalReferralOrg?: string;
  escalatedToAuthority?: boolean;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WelfareObservation {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  category: 'Financial Hardship' | 'Attendance Concern' | 'Family Distress' | 'Emotional Wellbeing' | 'Academic Support' | 'Nutrition Support' | 'Boarding Welfare';
  concernLevel: 'Low' | 'Moderate' | 'Severe';
  description: string;
  actionPlan: string;
  status: 'Active Monitoring' | 'Intervention Active' | 'Resolved' | 'Escalated';
  assignedOfficer: string;
  outcomesTracked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BehaviourRecord {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  type: 'Positive Commendation' | 'Incident Violation';
  category: 'Merit Points' | 'Classroom Disruption' | 'Late Arrival' | 'Dress Code' | 'Bullying' | 'Property Damage' | 'Honor Student' | 'Restorative Meeting';
  points: number;
  description: string;
  sanctionOrReward: string;
  parentNotified: boolean;
  status: 'Pending Review' | 'Resolved' | 'Parent Called' | 'Suspension Issued' | 'Award Issued';
  recordedBy: string;
  date: string;
}

export interface CounsellingSession {
  id: string;
  sessionCode: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  counselorId: string;
  counselorName: string;
  referralSource: 'Self Referral' | 'Teacher' | 'Parent' | 'Safeguarding Lead' | 'Welfare Officer';
  sessionDate: string;
  summaryNotes: string;
  actionItems: string;
  nextAppointmentDate?: string;
  isConfidential: boolean;
  status: 'Scheduled' | 'Completed' | 'Follow-up Required' | 'Referred Externally';
}

export interface ClinicVisit {
  id: string;
  visitDate: string;
  visitTime: string;
  complaint: string;
  diagnosis: string;
  treatmentAdministered: string;
  administeredBy: string;
  parentNotified: boolean;
  restRequiredMinutes?: number;
  referredToHospital: boolean;
}

export interface MedicationRecord {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface StudentMedicalProfile {
  studentId: string;
  studentName: string;
  classGrade: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  immunisationStatus: 'Up to Date' | 'Pending Verification' | 'Incomplete';
  specialMedicalNotes: string;
  clinicVisits: ClinicVisit[];
  medications: MedicationRecord[];
  updatedAt: string;
}

export interface SchoolIncident {
  id: string;
  incidentCode: string;
  incidentNumber?: string;
  title: string;
  category: 'Injury / Accident' | 'Theft' | 'Fire Safety' | 'Property Damage' | 'Violence' | 'Bullying Incident' | 'Health Emergency' | 'Infrastructure Issue' | 'Security Breach' | 'Safety & Security' | string;
  severity: 'Minor' | 'Moderate' | 'Major' | 'Critical' | 'Medium' | 'High' | string;
  location: string;
  incidentDate: string;
  incidentTime: string;
  reportedBy: string;
  investigatingOfficer: string;
  investigator?: string;
  description: string;
  immediateActionTaken?: string;
  witnessStatements: string[];
  correctiveActions: string;
  status: 'Reported' | 'Under Investigation' | 'Corrective Action Pending' | 'Closed' | 'Investigating' | 'Open' | string;
  createdAt: string;
}

export interface StaffProfile {
  id: string;
  staffCode: string;
  fullName: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  joiningDate?: string;
  qualification?: string;
  nssfNumber?: string;
  tinNumber?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  role: string;
  department: string;
  designation: string;
  qualifications: string[];
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Probation' | 'Full Time Teaching' | string;
  contractStartDate: string;
  contractEndDate?: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
  jobDescription: string;
  salaryGradeRef: string;
  totalCPDPoints: number;
  performanceRating: 'Outstanding' | 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Improvement';
  emergencyContact: string;
  createdAt: string;
}

export interface LeaveApprovalStep {
  stepName: string;
  approverRole: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  comments?: string;
  approvedAt?: string;
}

export interface AppraisalGoal {
  id: string;
  title: string;
  category: 'Pedagogy' | 'Administration' | 'Student Mentorship' | 'Professional Growth';
  targetDate: string;
  progressPercent: number;
  status: 'In Progress' | 'Achieved' | 'Deferred';
}

export interface StaffAppraisal {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  academicTerm?: string;
  reviewPeriod: string;
  overallRating: 'Outstanding' | 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Improvement';
  classroomObservationScore: number; // e.g., 88%
  teachingExcellenceScore?: number;
  studentResultsScore?: number;
  punctualityScore?: number;
  professionalismScore?: number;
  strengths: string;
  keyStrengths?: string;
  areasForGrowth: string;
  goals: AppraisalGoal[];
  pdpPlan: string;
  appraiserName: string;
  status: 'Draft' | 'Submitted' | 'Acknowledged' | 'Finalized';
  completedDate: string;
  appraisalDate?: string;
}

export interface CPDTraining {
  id: string;
  title: string;
  staffName?: string;
  courseTitle?: string;
  cpdHours?: number;
  providerOrg?: string;
  certificateRef?: string;
  completionDate?: string;
  category: 'Pedagogical Skills' | 'Safeguarding & Welfare' | 'ICT Integration' | 'Leadership' | 'Special Needs Education' | string;
  trainerName: string;
  trainingDate: string;
  durationHours: number;
  cpdPoints: number;
  venueOrPlatform: string;
  maxParticipants: number;
  registeredStaffCount: number;
  registeredStaffIds: string[];
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Verified' | string;
  summary: string;
}

export interface AssetMaintenanceLog {
  id: string;
  serviceDate: string;
  issueDescription: string;
  actionTaken: string;
  servicedBy: string;
  costUGX: number;
}

export interface SchoolAsset {
  id: string;
  assetTag: string;
  name: string;
  assetName?: string;
  category: 'Furniture' | 'Computers & ICT' | 'Tablets' | 'Laboratory Equipment' | 'Library Assets' | 'Sports Equipment' | 'Vehicles' | 'Buildings & Land' | 'IT Equipment' | string;
  location: string;
  department: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCostUGX: number;
  purchaseCostUgx?: number;
  currentCondition: 'Excellent' | 'Good' | 'Maintenance Required' | 'Disposed' | string;
  status?: string;
  qrBarcodeCode: string;
  warrantyExpiry?: string;
  maintenanceLogs: AssetMaintenanceLog[];
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  itemName?: string;
  category: 'Office Supplies' | 'Laboratory Materials' | 'Library Stock' | 'Cleaning Supplies' | 'Food Stores' | 'ICT Consumables' | 'Sports Materials' | 'Medical Supplies' | string;
  quantityInStock: number;
  unitOfMeasure: 'Pieces' | 'Boxes' | 'Cartons' | 'Kilograms' | 'Liters' | 'Packs' | 'Reams' | string;
  reorderThreshold: number;
  reorderLevel?: number;
  unitPriceUGX: number;
  unitCostUgx?: number;
  supplierName: string;
  locationStore: string;
  storeLocation?: string;
  lastRestockedDate: string;
  lastRestockDate?: string;
}

export interface SchoolPolicyDocument {
  id: string;
  title: string;
  code?: string;
  summary?: string;
  mandatoryReadForRoles?: string[];
  approvedBy?: string;
  category: 'Safeguarding' | 'HR & Staff Code' | 'Student Handbook' | 'Board Resolutions' | 'Academic Policies' | 'Health & Safety' | 'ICT Policy' | 'Academic' | string;
  version: string;
  status: 'Draft' | 'Under Review' | 'Approved & Published' | 'Archived' | 'Active' | string;
  effectiveDate: string;
  author: string;
  fileSizeKb: number;
  targetRoles: string[];
  acknowledgementCount: number;
  description: string;
}

export interface SchoolInsurancePolicy {
  id: string;
  policyNumber: string;
  policyName: string;
  providerName: string;
  coverageType: 'Student Medical & Accident' | 'Staff Health & Life' | 'School Property & Fire' | 'School Bus & Fleet' | 'Third Party Liability' | 'Cyber & Data Risk' | string;
  startDate: string;
  expiryDate: string;
  premiumAmountUGX: number;
  coverageLimitUGX: number;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Renewed' | string;
  contactPerson: string;
  contactPhone: string;
  emergencyClaimHotline?: string;
  coveredCount?: number;
  documentsUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type InsurancePolicy = SchoolInsurancePolicy;

export interface AdminTaskNotice {
  id: string;
  title: string;
  type: 'Office Task' | 'Internal Memo' | 'Circular' | 'Meeting Minutes' | 'Approval Workflow' | string;
  category?: string;
  priority: 'Routine' | 'Important' | 'Urgent' | 'Low' | 'Medium' | 'High' | 'Critical' | string;
  assignedTo: string;
  dueDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  description: string;
  createdAt: string;
}

// Type Aliases for V7 Module Compatibility
export type IncidentReport = SchoolIncident;
export type SchoolPolicy = SchoolPolicyDocument;
export type AdministrativeTask = AdminTaskNotice;
export type StaffCpdRecord = CPDTraining;
export type StaffHrProfile = StaffProfile;

// ==========================================
// VISION 8: SCHOOL INTELLIGENCE & AI TYPES
// ==========================================

export interface ExecutiveKPI {
  id: string;
  title: string;
  category: 'Enrolment' | 'Attendance' | 'Academics' | 'Finance' | 'Staff' | 'Welfare' | 'Operations' | 'Compliance';
  value: string | number;
  unit?: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  target?: string | number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export interface CockpitWidgetConfig {
  id: string;
  title: string;
  category: string;
  size: 'full' | 'half' | 'third';
  isEnabled: boolean;
  order: number;
}

export interface AiQueryMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataSourcesCited?: { title: string; category: string; count?: number }[];
  generatedReport?: string;
  promptType?: 'query' | 'report' | 'draft' | 'summary' | 'lesson' | 'policy';
}

export interface StudentSuccessPrediction {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  classStream?: string;
  avatarUrl?: string;
  overallRiskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskCategory: 'Attendance' | 'Academic' | 'Behaviour' | 'Welfare' | 'Financial' | 'Multifactorial';
  confidenceScore: number; // e.g. 88%
  contributingFactors: { factor: string; weight: number; detail: string }[];
  suggestedActions: { title: string; type: 'Parent Contact' | 'Counseling' | 'Tutoring' | 'Bursary' | 'Disciplinary'; priority: 'High' | 'Medium' | 'Low' }[];
  lastUpdated: string;
  actionTaken?: boolean;
  notes?: string;
}

export interface TeacherInsightRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  subject: string;
  workloadScore: number; // 1-100
  weeklyLessons: number;
  attendanceRate: number; // %
  lessonCompletionRate: number; // %
  assessmentTimelinessRate: number; // %
  studentAverageScore: number; // %
  parentEngagementCount: number;
  cpdHours: number;
  performanceTrend: 'Improving' | 'Stable' | 'Needs Support';
  recommendations: string[];
}

export interface FinancialForecastRecord {
  id: string;
  termName: string;
  academicYear: string;
  projectedRevenueUgx: number;
  projectedExpenseUgx: number;
  expectedCollectionRate: number; // %
  outstandingFeesUgx: number;
  scholarshipBudgetUgx: number;
  variancePercentage: number;
  riskAlerts: { level: 'Warning' | 'Critical' | 'Info'; message: string }[];
}

export interface StrategicGoalKPI {
  id: string;
  title: string;
  category: 'Academic' | 'Financial' | 'Infrastructure' | 'Staffing' | 'Welfare' | 'Digital';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  ownerDepartment: string;
  ownerStaffName: string;
  status: 'On Track' | 'At Risk' | 'Behind' | 'Achieved';
  actionItems: { id: string; title: string; assignedTo: string; isDone: boolean; dueDate: string }[];
  evidenceCount: number;
}

export interface ResourceUtilizationRecord {
  id: string;
  resourceName: string;
  category: 'Classroom' | 'Laboratory' | 'ICT Lab' | 'Library' | 'Transport' | 'Sports Facility' | 'Store Inventory';
  capacity: number;
  currentUtilizationPercentage: number;
  peakHours: string;
  conditionStatus: 'Optimal' | 'Overcrowded' | 'Underutilized' | 'Maintenance Needed';
  recommendation: string;
}

export interface RiskDetectionAlert {
  id: string;
  title: string;
  category: 'Absenteeism' | 'Fee Default' | 'Academic Failure' | 'Staff Shortage' | 'Asset Risk' | 'Safeguarding' | 'Governance';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore: number;
  summary: string;
  affectedCount: number;
  affectedEntity: string;
  suggestedAction: string;
  detectedAt: string;
  status: 'Active' | 'Investigating' | 'Resolved';
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'Policy' | 'Standard Operating Procedure' | 'Circular' | 'Meeting Minutes' | 'Inspection Report' | 'Curriculum Guide';
  audience: 'All Staff' | 'Leadership' | 'Teachers' | 'Parents' | 'Board';
  accessLevel: 'Public' | 'Restricted' | 'Confidential';
  tags: string[];
  lastUpdated: string;
  summary: string;
  contentUrl?: string;
  fileSizeBytes?: number;
}

export interface AiGovernanceSetting {
  id: string;
  featureKey: string;
  featureName: string;
  description: string;
  category: 'Predictions' | 'Assistants' | 'Auto-Drafting' | 'Analytics' | 'Export';
  isEnabled: boolean;
  minConfidenceThreshold: number; // e.g. 75
  requiresHumanApproval: boolean;
  promptLoggingEnabled: boolean;
}

export interface AiAuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  actionType: string;
  promptUsed: string;
  responseSummary: string;
  dataScopeAccessed: string;
  modelUsed: string;
}

// ==================== VISION 9: STUDENT VOICE & PUBLIC ENGAGEMENT ====================

export interface StudentVoiceItem {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  title: string;
  category: 'Idea' | 'Proposal' | 'Article' | 'Creative Writing' | 'Photography' | 'Artwork' | 'Science Project' | 'Innovation';
  content: string;
  mediaUrl?: string;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Published' | 'Rejected';
  teacherFeedback?: string;
  badgeEarned?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface StudentPortfolio {
  id?: string;
  schoolId?: string;
  studentId: string;
  studentName: string;
  grade?: string;
  headline?: string;
  bio?: string;
  interests?: string[];
  achievements?: { title: string; category: string; date: string }[];
  certificates?: { title: string; issuer: string; date: string; url: string }[];
  skills?: string[];
  recommendations?: { teacherName: string; comment: string; date: string }[];
  projects?: { id: string; title: string; category: string }[];
  badges?: string[];
  visibility?: PortfolioVisibility;
  isSafeguardApproved?: boolean;
  safeguardApprovedBy?: string;
  safeguardApprovedAt?: string;
  sections?: PortfolioItem[];
  updatedAt?: string;
}

export interface InnovationProject {
  id: string;
  title: string;
  category: 'STEM' | 'Robotics' | 'Agriculture' | 'ICT' | 'Research' | 'Business' | 'Community';
  teamLead: string;
  teamMembers: string[];
  mentorName: string;
  progressPercent: number;
  description: string;
  milestones: { id: string; title: string; completed: boolean; dueDate: string }[];
  demoDayDate: string;
  status: 'Planning' | 'Active Development' | 'Testing' | 'Showcased';
}

export interface SchoolClub {
  id: string;
  schoolId?: string;
  name: string;
  description?: string;
  category: string;
  patronName?: string;
  teacherSupervisorId?: string;
  teacherSupervisorName?: string;
  studentLeader?: string;
  presidentStudentId?: string;
  presidentStudentName?: string;
  memberCount: number;
  meetingSchedule: string;
  meetingLocation?: string;
  achievementsCount?: number;
  activeProjectsCount?: number;
  upcomingEvent?: string;
  isAcceptingMembers?: boolean;
  status?: 'Active' | 'Recruiting' | 'On Break' | string;
  bannerUrl?: string;
  createdAt?: string;
}

export interface MarketplaceOrderItem {
  itemId: string;
  title: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  imageUrl?: string;
}

export interface MarketplaceOrder {
  id: string;
  orderNumber?: string;
  schoolId?: string;
  buyerId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  items?: MarketplaceOrderItem[];
  itemId?: string; // For backwards-compatibility with single-item orders
  itemTitle?: string;
  quantity: number;
  subtotalPrice?: number;
  deliveryFee?: number;
  schoolMarketFee?: number;
  sellerAmount?: number;
  platformFeeAmount?: number;
  discountAmount?: number;
  discountCode?: string;
  totalPrice: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: 'PAID_VERIFIED' | 'PENDING_BURSAR_VERIFICATION' | 'FAILED' | 'PENDING' | 'REFUNDED' | string;
  paymentReference?: string;
  pesapalOrderTrackingId?: string;
  pesapalMerchantReference?: string;
  pesapalPaymentUrl?: string;
  status:
    | 'Pending School Approval'
    | 'Approved & Scheduled'
    | 'Processing'
    | 'Preparing'
    | 'Ready for Pickup'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Collected'
    | 'Completed'
    | 'Cancelled'
    | 'Refund Requested'
    | 'Refunded'
    | 'Failed Delivery'
    | string;
  fulfillmentType?: 'SCHOOL_PICKUP' | 'SCHOOL_DELIVERY' | 'LOCAL_DELIVERY' | string;
  collectionDate?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  deliveryInstructions?: string;
  recipientName?: string;
  recipientPhone?: string;
  qrCollectionToken?: string;
  deliveryPin?: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  deliveryAssignedAt?: string;
  deliveredAt?: string;
  deliveryConfirmedBy?: string;
  deliveryConfirmationMethod?: 'PIN' | 'QR' | 'MANUAL_STAFF' | 'BUYER_APP' | string;
  cancellationReason?: string;
  isRefunded?: boolean;
  refundReason?: string;
  refundApprovedBy?: string;
  refundedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketplaceItemVariant {
  id: string;
  name: string; // e.g., 'Size: Large', 'Color: Blue', 'Condition: Brand New'
  sku?: string;
  priceModifier?: number; // e.g. +5000 UGX
  inventoryCount: number;
}

export interface MarketplaceProductImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  caption?: string;
  width?: number;
  height?: number;
  uploadedAt?: string;
}

export interface MarketplaceProductVideo {
  id: string;
  url: string;
  posterUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  durationSeconds?: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  title?: string;
  uploadedAt?: string;
}

export interface MarketplaceReview {
  id: string;
  itemId: string;
  schoolId: string;
  userId: string;
  userName: string;
  userRole?: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedPurchase: boolean;
  sellerReply?: string;
  sellerRepliedAt?: string;
  createdAt: string;
}

export interface MarketplaceWishlistItem {
  id: string;
  schoolId: string;
  userId: string;
  itemId: string;
  itemTitle: string;
  itemPrice: number;
  itemCategory: string;
  itemImage?: string;
  addedAt: string;
}

export interface MarketplaceBanner {
  id: string;
  schoolId: string;
  title: string;
  subtitle?: string;
  badge?: string;
  actionText?: string;
  actionCategory?: string;
  bgColor?: string;
  imageUrl?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface MarketplaceDiscount {
  id: string;
  schoolId: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // percentage (e.g. 10%) or fixed UGX (e.g. 5000)
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface MarketplaceDispute {
  id: string;
  schoolId: string;
  orderId: string;
  itemId?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  reason: 'Item not received' | 'Damaged item' | 'Wrong product' | 'Defective craft' | 'Payment issue' | string;
  details: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface MarketplaceRefund {
  id: string;
  schoolId: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  approvedBy?: string;
  disbursedAt?: string;
  createdAt: string;
}

export interface MarketplaceSellerPayout {
  id: string;
  schoolId: string;
  sellerId: string;
  sellerName: string;
  sellerRole: string;
  amount: number;
  platformCommission: number;
  netPayout: number;
  payoutMethod: 'Cash Collection at Bursar' | 'Pesapal MoMo' | 'Bank Transfer';
  accountDetails?: string;
  status: 'PENDING_APPROVAL' | 'PROCESSED' | 'REJECTED';
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export interface MarketplaceCartItem {
  item: MarketplaceItem;
  quantity: number;
  selectedVariant?: MarketplaceItemVariant;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: 'Art & Crafts' | 'Agricultural Produce' | 'Books & Stationery' | 'Tech Projects' | 'School Merchandise' | 'Innovation Product' | 'School Canteen & Snacks' | 'Uniforms & Apparel' | string;
  price: number;
  currency: string;
  inventoryCount: number;
  studentCreator: string;
  grade: string;
  description: string;
  status: 'Pending Moderation' | 'Active' | 'Sold Out' | 'Unlisted';
  qrCode: string;
  orders: MarketplaceOrder[];
  // Enhanced Media & Multi-Tenant Fields
  schoolId?: string;
  sellerId?: string;
  sellerName?: string;
  sellerRole?: 'Student' | 'Teacher' | 'Staff' | 'Bursar' | 'Admin' | 'Canteen' | string;
  images?: string[];
  mediaImages?: MarketplaceProductImage[];
  primaryImage?: string;
  video?: MarketplaceProductVideo;
  variants?: MarketplaceItemVariant[];
  averageRating?: number;
  reviewCount?: number;
  isPublished?: boolean;
  isCanteenItem?: boolean;
  isFeatured?: boolean;
  discountPercent?: number;
  moderationStatus?: 'Approved' | 'Pending' | 'Rejected';
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicWebsiteConfig {
  schoolName: string;
  motto: string;
  heroHeadline: string;
  heroSubtext: string;
  visionStatement: string;
  missionStatement: string;
  principalMessage: string;
  stats: { label: string; value: string }[];
  admissionNotice: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isPublicWebsiteLive: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'School News' | 'Press Release' | 'Success Story' | 'Student Spotlight';
  author: string;
  summary: string;
  content: string;
  publishedAt: string;
  status: 'Draft' | 'Published' | 'Archived';
  isFeatured: boolean;
  views: number;
}

export interface GalleryPhoto {
  id: string;
  caption: string;
  imageUrl: string;
  consentVerified: boolean;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  category: 'Sports & Games' | 'Academic Competitions' | 'Arts & Culture' | 'Science Fair' | 'Community Outreach';
  eventDate: string;
  photoCount: number;
  coverImage: string;
  privacyLevel: 'Public' | 'Parent Portal' | 'Internal Staff Only';
  photos: GalleryPhoto[];
}

export interface AlumniProfile {
  id: string;
  name: string;
  graduationYear: number;
  currentRole: string;
  companyOrUniversity: string;
  email: string;
  phone: string;
  location: string;
  isAvailableForMentorship: boolean;
  mentorshipTopic?: string;
  totalDonated: number;
  featuredStory?: string;
}

export interface Partnership {
  id: string;
  organizationName: string;
  partnerType: 'NGO' | 'University' | 'Corporate' | 'Government Agency' | 'Sponsor';
  contactPerson: string;
  contactEmail: string;
  agreementSummary: string;
  status: 'Active' | 'Under Renewal' | 'Proposed';
  renewalDate: string;
}

export interface CommunityActivity {
  id: string;
  title: string;
  type: 'Parent Volunteer' | 'Community Outreach' | 'Career Talk' | 'Eco Campaign' | 'Charity Drive' | 'Open Day';
  date: string;
  participantsCount: number;
  coordinator: string;
  location: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
}

export interface DonationCampaign {
  id: string;
  title: string;
  targetAmount: number;
  raisedAmount: number;
  currency: string;
  category: 'Infrastructure' | 'Student Scholarship' | 'Library Books' | 'Laboratory Gear' | 'Sports Facility';
  donorCount: number;
  status: 'Active' | 'Fully Funded' | 'Closed';
  description: string;
}

export interface BrandSettings {
  logoText: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  fontFamily: string;
  tagline: string;
  reportHeaderTitle: string;
  certificateHeader: string;
}

export interface RecognitionAward {
  id: string;
  recipientName: string;
  recipientRole: 'Student' | 'Teacher' | 'Club' | 'Department';
  awardTitle: string;
  category: string;
  issuedDate: string;
  badgeType: 'Gold Medal' | 'Star Innovator' | 'Leadership Shield' | 'Community Hero';
  description: string;
}

export interface PublicAnalyticsData {
  monthlyVisitors: number;
  admissionEnquiriesThisMonth: number;
  galleryViewsCount: number;
  marketplaceTotalRevenue: number;
  totalDonationsRaised: number;
  activeAlumniRegistered: number;
  studentVoiceSubmissions: number;
}

// ==========================================
// VISION 12: ENTERPRISE BACKUP & RECOVERY TYPES
// ==========================================

export type BackupType = 'Full' | 'Incremental' | 'Differential' | 'Snapshot' | 'Manual' | 'Scheduled';

export type BackupFrequency = 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Academic Term' | 'Academic Year' | 'Custom' | 'Manual';

export interface BackupScheduleConfig {
  id: string;
  name: string;
  frequency: BackupFrequency;
  type: BackupType;
  timeOfDay: string;
  dayOfWeek?: number;
  enabled: boolean;
  onlyWhenIdle: boolean;
  batteryAware: boolean;
  lowBandwidthMode: boolean;
  nightTimeExecution: boolean;
  calendarTermAware: boolean;
  lastExecutedAt?: string;
  nextScheduledAt?: string;
}

export interface RecoverySnapshot {
  id: string;
  snapshotName: string;
  backupType: BackupType;
  frequency: BackupFrequency;
  createdAt: string;
  createdBy: string;
  academicTerm: string;
  sizeBytes: number;
  itemCount: number;
  tablesCount: number;
  checksumSha256: string;
  isEncrypted: boolean;
  encryptionAlgorithm: string;
  integrityVerified: boolean;
  cloudSynced: boolean;
  storageLocation: 'Local IndexedDB' | 'Encrypted Vault' | 'Cloud Storage';
  payloadData?: any;
}

export interface RecycleBinItem {
  id: string;
  entityType: 'Student' | 'Staff' | 'Parent' | 'Class' | 'Assessment' | 'Financial Record' | 'Marketplace Item' | 'Report' | 'Document' | 'File' | 'Timetable' | 'Other';
  entityId: string;
  entityName: string;
  deletedBy: string;
  deletedAt: string;
  retentionExpiresAt: string;
  originalData: any;
  deletionReason?: string;
  restoredAt?: string;
  status: 'Soft Deleted' | 'Restored' | 'Purged';
}

export interface RecordVersionHistory {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  versionNumber: number;
  changedBy: string;
  changedAt: string;
  changeReason?: string;
  previousValue: any;
  newValue: any;
}

export interface DisasterSimulationResult {
  id: string;
  scenarioName: string;
  scenarioType: 'Mass Student Deletion' | 'Attendance Corruption' | 'Financial Record Loss' | 'Power Failure Cut' | 'Database Crash' | 'Interrupted Sync';
  executedAt: string;
  executedBy: string;
  impactSummary: string;
  recordsAffected: number;
  recoveryTimeMs: number;
  success: boolean;
  verificationDetails: string;
}

export interface BusinessContinuityStatus {
  mode: 'Normal Online' | 'Offline Cache' | 'Secondary Recovery Failover';
  lastFailoverCheck: string;
  dbHealthScore: number;
  activeAlertsCount: number;
  cloudSyncStatus: 'Synchronized' | 'Sync In Progress' | 'Pending Cloud Sync' | 'Offline Snapshot Saved';
}

export interface DisasterReadinessReport {
  generatedAt: string;
  generatedBy: string;
  schoolName: string;
  overallScore: number;
  verdict: '✅ CERTIFIED – Enterprise Recovery Ready' | '⚠️ CERTIFIED WITH MINOR OBSERVATIONS' | '❌ NOT CERTIFIED – Recovery System Incomplete';
  backupEngineScore: number;
  recoveryCapabilitiesScore: number;
  integrityScore: number;
  securityScore: number;
  disasterSimulationsPassed: number;
  totalDisasterSimulations: number;
  totalSnapshotsAvailable: number;
  recycleBinItemsCount: number;
  remainingRisks: string[];
  recommendations: string[];
}

// ==========================================
// VISION 13: ENTERPRISE CONNECT (LAN & MULTI-USER) TYPES
// ==========================================

export interface DiscoveredServer {
  id: string;
  serverName: string;
  ipAddress: string;
  port: number;
  hostname: string;
  connectionCode: string;
  status: 'Online' | 'Connecting' | 'Offline';
  latencyMs: number;
  protocolVersion: string;
  isEncrypted: boolean;
  activeUsersCount: number;
  isPrimary: boolean;
}

export interface ConnectedSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  connectedAt: string;
  lastPingAt: string;
  currentActiveModule: string;
  isOnline: boolean;
}

export interface LanMessage {
  id: string;
  channelId: string;
  channelName: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isEmergencyAlert: boolean;
  isRead: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface SharedLanFile {
  id: string;
  fileName: string;
  fileCategory: 'Document' | 'Report' | 'Circular' | 'Timetable' | 'Policy' | 'Media';
  uploadedBy: string;
  uploadedAt: string;
  sizeBytes: number;
  version: number;
  accessPermission: 'All Staff' | 'Admins Only' | 'Teachers Only' | 'Bursar & Finance';
  downloadCount: number;
  checksum: string;
}

export interface ServerManagerHealth {
  isRunning: boolean;
  serverIp: string;
  port: number;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  memoryUsageMB: number;
  dbSizeBytes: number;
  activeConnectionsCount: number;
  syncQueueLength: number;
  networkRxKbps: number;
  networkTxKbps: number;
  lastBackupSnapshotAt: string;
}

export interface ServerMigrationPackage {
  id: string;
  sourceServerIp: string;
  targetServerIp: string;
  migratedAt: string;
  dbRecordsCount: number;
  mediaFilesCount: number;
  usersCount: number;
  checksumSha256: string;
  status: 'Completed' | 'In Progress' | 'Failed';
  verificationPassed: boolean;
}

export interface ConnectProductionCertificationReport {
  generatedAt: string;
  generatedBy: string;
  schoolName: string;
  overallScore: number;
  verdict: '✅ CERTIFIED – SchoolSoul Connect Production Ready' | '⚠️ CERTIFIED WITH MINOR OBSERVATIONS' | '❌ NOT CERTIFIED – Critical Issues Must Be Resolved Before Deployment';
  networkTopologySummary: string;
  deviceRegistrationScore: number;
  syncEngineScore: number;
  securityScore: number;
  performanceScore: number;
  offlineResilienceScore: number;
  serverMigrationScore: number;
  testsExecuted: number;
  testsPassed: number;
  remainingRisks: string[];
  recommendations: string[];
}

// ==========================================
// COMMERCIAL & RECURRING SUBSCRIPTION ENGINE TYPES
// ==========================================

export type CommercialPlanTier = 'Starter' | 'Standard' | 'Professional' | 'Enterprise' | 'Custom';

export type CommercialBillingCycle = 'Monthly' | 'Termly' | 'Annual';

export type CommercialSubscriptionStatus =
  | 'Trial'
  | 'Active'
  | 'Payment Pending'
  | 'Payment Processing'
  | 'Paid'
  | 'Grace Period'
  | 'Past Due'
  | 'Suspended'
  | 'Cancelled'
  | 'Expired'
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'GRACE_PERIOD'
  | 'PAST_DUE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export type SupportedCurrency =
  | 'USD'
  | 'UGX'
  | 'KES'
  | 'TZS'
  | 'RWF'
  | 'GHS'
  | 'NGN'
  | 'ZMW'
  | 'ZAR'
  | 'GBP'
  | 'EUR';

export type PaymentProviderId =
  | 'FLUTTERWAVE'
  | 'PESAPAL'
  | 'STRIPE'
  | 'MTN_MOMO'
  | 'AIRTEL_MONEY'
  | 'BANK_TRANSFER'
  | 'SANDBOX';

export type PaymentProviderStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'DISABLED'
  | 'NOT_CONFIGURED'
  | 'SANDBOX'
  | 'PRODUCTION';

export type PaymentIntentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethodCategory = 'MOBILE_MONEY' | 'CARD' | 'BANK_TRANSFER' | 'SANDBOX_SIMULATION';

export interface PaymentMethodOption {
  id: string;
  name: string;
  category: PaymentMethodCategory;
  provider: PaymentProviderId;
  instructions: string;
  supportedNetworks?: string[];
  isAvailable: boolean;
}

export interface CountryPaymentConfig {
  countryCode: string;
  countryName: string;
  currency: SupportedCurrency;
  currencySymbol: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavingsFormatted: string;
  taxRatePercent: number;
  taxLabel: string;
  primaryProvider: PaymentProviderId;
  availableProviders: PaymentProviderId[];
  availablePaymentMethods: PaymentMethodOption[];
  isEnabled: boolean;
  paymentInstructions: string;
}

export interface PaymentIntent {
  id: string;
  idempotencyKey: string;
  schoolId: string;
  subscriptionId: string;
  invoiceId: string;
  planId: string;
  billingCycle: 'Monthly' | 'Annual' | 'MONTHLY' | 'ANNUAL';
  amount: number;
  currency: SupportedCurrency;
  provider: PaymentProviderId;
  paymentMethod: string;
  customerPhoneOrEmail: string;
  customerName: string;
  status: PaymentIntentStatus;
  providerReference: string;
  signatureSha256: string;
  paymentUrlOrCode?: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  receiptNumber?: string;
  metadata?: Record<string, any>;
}

export interface PaymentReconciliationItem {
  reconciliationId: string;
  schoolId: string;
  transactionId: string;
  providerReference: string;
  internalAmount: number;
  providerAmount: number;
  currency: SupportedCurrency;
  matchStatus: 'MATCHED' | 'AMOUNT_MISMATCH' | 'CURRENCY_MISMATCH' | 'MISSING_IN_PROVIDER' | 'UNMATCHED_EXTERNAL';
  notes: string;
  checkedAt: string;
  resolved: boolean;
}

export interface PaymentRefundRecord {
  refundId: string;
  paymentId: string;
  invoiceId: string;
  schoolId: string;
  amount: number;
  currency: SupportedCurrency;
  reason: string;
  initiatedBy: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED';
  providerReference: string;
  createdAt: string;
  processedAt?: string;
}

export interface PlanCapacities {
  maximum_active_students: number;
  maximum_staff: number;
  storage_limit_mb: number;
  communication_limit_sms: number;
  media_limit_mb: number;
  online_learning_capacity_rooms: number;
  marketplace_enabled: boolean;
  advanced_analytics_enabled: boolean;
  website_enabled: boolean;
  support_level: string;
}

export interface PricingConfiguration {
  versionId: string;
  planId: string;
  planName: string;
  tier: CommercialPlanTier;
  currency: SupportedCurrency;
  currencySymbol: string;
  monthlyPrice: number; // e.g. 79 USD
  annualPrice: number;  // e.g. 790 USD (approx. 2 months free)
  trialDays: number;    // e.g. 30 days
  active: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
  capacities: PlanCapacities;
  taxRatePercent: number;
  taxJurisdiction?: string;
  countryCode: string;
  paymentProviderDefault: 'Card' | 'MobileMoney' | 'BankWire';
  paymentInstructions?: string;
  notes?: string;
}

export interface CountryPricingRule {
  countryCode: string;
  countryName: string;
  currency: SupportedCurrency;
  currencySymbol: string;
  monthlyPrice: number;
  annualPrice: number;
  taxRatePercent: number;
  taxLabel: string;
  primaryProvider: 'Card' | 'MobileMoney' | 'BankWire';
  paymentInstructions: string;
  isActive: boolean;
}

export interface SchoolTrialLifecycle {
  trialStart: string;
  trialEnd: string;
  trialDaysRemaining: number;
  trialStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CONVERTED';
  conversionStatus: 'NOT_CONVERTED' | 'CONVERTED_MONTHLY' | 'CONVERTED_ANNUAL';
  verificationSignals: {
    schoolIdentityVerified: boolean;
    adminPhoneVerified: boolean;
    registrationToken: string;
    domainVerified: boolean;
    abuseScore: number;
  };
  sentReminders: ('DAY_7' | 'DAY_14' | 'DAY_21' | 'DAY_27' | 'DAY_30')[];
}

export interface MarketplaceRevenueSplit {
  platformFeePercent: number;
  schoolAllocationPercent: number;
  creatorAllocationPercent: number;
  transactionFeeFixedUSD: number;
  safeguardingConsentRequired: boolean;
}

export interface PaymentTransactionRecord {
  id: string;
  idempotencyKey: string;
  invoiceId: string;
  schoolId: string;
  amount: number;
  currency: SupportedCurrency;
  provider: 'Card' | 'MobileMoney' | 'BankWire' | 'SandboxTest';
  status: 'INITIATED' | 'PROCESSING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  providerReference: string;
  receiptNumber?: string;
  signatureSha256: string;
  initiatedAt: string;
  confirmedAt?: string;
  payloadSnapshot?: any;
}

export interface PlatformCommercialMetrics {
  mrrUSD: number;
  arrUSD: number;
  totalActiveSchools: number;
  totalTrialSchools: number;
  expiringTrialsCount: number;
  pastDueCount: number;
  suspendedCount: number;
  churnRatePercent: number;
  renewalRatePercent: number;
  revenueByPlan: { planTier: string; amountUSD: number; schoolCount: number }[];
  revenueByCountry: { country: string; amountUSD: number; count: number }[];
  revenueByCurrency: { currency: string; totalRaw: number; convertedUSD: number }[];
}

export interface PlanEntitlements {
  maxStudents: number;
  maxStaff: number;
  storageLimitMB: number;
  smsQuotaMonthly: number;
  whatsAppEnabled: boolean;
  onlineLearningMaxRooms: number;
  advancedAnalytics: boolean;
  customWebsiteCMS: boolean;
  marketplaceEnabled: boolean;
  prioritySupport: 'Standard SLA' | 'Priority 4hr SLA' | 'Dedicated 24/7 Account Manager';
  offlineMultiDeviceLAN: boolean;
  automatedBackups: boolean;
  aiAssistantsEnabled: boolean;
}

export interface SchoolCommercialPlan {
  id: string;
  name: string;
  tier: CommercialPlanTier;
  tagline: string;
  description: string;
  monthlyBaseUGX: number;
  annualBaseUGX: number;
  perStudentMonthlyUGX: number;
  minimumMonthlyUGX: number;
  entitlements: PlanEntitlements;
  isPopular?: boolean;
  isCustom?: boolean;
}

export interface SchoolCommercialSubscription {
  schoolId: string;
  schoolName: string;
  planId: string;
  planTier: CommercialPlanTier;
  billingCycle: CommercialBillingCycle;
  status: CommercialSubscriptionStatus;
  trialStartDate?: string;
  trialEndDate?: string;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextRenewalDate: string;
  activeStudentCount: number;
  calculatedMonthlyUGX: number;
  currency: 'UGX' | 'USD';
  gracePeriodDays: number;
  gracePeriodExpiresAt?: string;
  paymentMethod: 'MTN Mobile Money' | 'Airtel Money' | 'Bank Deposit' | 'Card Gateway' | 'Offline Cash/Cheque';
  autoRenew: boolean;
  licenseKey: string;
  licenseSignatureSha256: string;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialInvoice {
  id: string;
  invoiceNumber: string;
  schoolId: string;
  schoolName: string;
  planTier: CommercialPlanTier;
  billingCycle: CommercialBillingCycle;
  periodStart: string;
  periodEnd: string;
  studentCount: number;
  baseAmountUGX: number;
  studentUsageAmountUGX: number;
  discountUGX: number;
  totalAmountUGX: number;
  currency: 'UGX' | 'USD';
  status: 'Pending' | 'Paid' | 'Processing' | 'Failed' | 'Waived';
  paymentReference?: string;
  paidAt?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  signatureSha256: string;
  createdAt: string;
}

export interface SchoolDigitalHealthMetric {
  category: 'Student Data' | 'Parent Connection' | 'Teacher Adoption' | 'Attendance Usage' | 'Learning Activity' | 'Financial & Fee' | 'Backup & Continuity' | 'System Security';
  score: number; // 0 - 100
  weight: number;
  status: 'Optimal' | 'Good' | 'Needs Attention' | 'Critical';
  factualObservation: string;
  recommendedAction: string;
  metrics: { label: string; current: number | string; target: number | string }[];
}

export interface SchoolDigitalHealthScore {
  overallScore: number;
  grade: 'A+ Outstanding' | 'A Strong' | 'B Proficient' | 'C Developing' | 'D Attention Required';
  evaluatedAt: string;
  metrics: SchoolDigitalHealthMetric[];
  earlyWarnings: {
    id: string;
    title: string;
    severity: 'Low' | 'Medium' | 'High';
    description: string;
    actionableLink: string;
  }[];
  valueSummary: {
    activeStudents: number;
    activeTeachers: number;
    connectedParents: number;
    attendanceRecordsTotal: number;
    lessonsDelivered: number;
    assignmentsCompleted: number;
    parentNotificationsSent: number;
    feeReceiptsGenerated: number;
    publishedProjects: number;
    backupSuccessRate: number;
    storageUsedMB: number;
    storageQuotaMB: number;
  };
}

export interface OnboardingMilestoneStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  completedAt?: string;
  actionLink: string;
}

export interface AdministratorMonthlyValueReport {
  reportId: string;
  monthYear: string;
  schoolName: string;
  generatedAt: string;
  operationalSummary: {
    studentEnrollment: number;
    staffCount: number;
    attendanceRatePercent: number;
    feesCollectedUGX: number;
    feesOutstandingUGX: number;
  };
  learningSummary: {
    lessonsCreated: number;
    assignmentsIssued: number;
    submissionsGraded: number;
    onlineSessionsConducted: number;
  };
  communitySummary: {
    messagesDelivered: number;
    smsDelivered: number;
    mediaItemsPublished: number;
    parentEngagementRatePercent: number;
  };
  systemContinuitySummary: {
    backupsCreated: number;
    storageUsedMB: number;
    storageQuotaMB: number;
    securityIncidents: number;
    uptimePercent: number;
  };
  executiveRecommendations: string[];
}

// ============================================================
// DIGITAL COMMUNITY & SAFE SCHOOL COMMUNICATION TYPINGS
// ============================================================

export type DigitalGroupType =
  | 'CLASS'
  | 'SUBJECT'
  | 'CLUB'
  | 'PROJECT'
  | 'STUDY'
  | 'SPORT'
  | 'ACADEMIC'
  | 'SCHOOL'
  | 'TEACHER'
  | 'STAFF'
  | 'HOUSE'
  | 'OTHER';

export type GroupVisibility = 'PRIVATE' | 'SCHOOL_VISIBLE' | 'SCHOOL_DISCOVERABLE' | 'MEMBERS_ONLY' | 'AUTO_ASSIGNED' | 'INVITE_ONLY' | 'SECRET';

export type GroupStatus = 'ACTIVE' | 'ARCHIVED' | 'SUSPENDED';

export type GroupRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'TEACHER' | 'STUDENT' | 'MEMBER';

export type MembershipStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'INVITED' | 'REJECTED' | 'BANNED';

export type MembershipRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export type CommunityMessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'FILE'
  | 'VOICE_NOTE'
  | 'SYSTEM_MESSAGE'
  | 'ANNOUNCEMENT'
  | 'PROJECT_UPDATE';

export type CommunityMessageStatus = 'ACTIVE' | 'EDITED' | 'FLAGGED' | 'UNDER_REVIEW' | 'HIDDEN' | 'DELETED';

export type ReportReasonCategory =
  | 'BULLYING'
  | 'HARASSMENT'
  | 'THREAT'
  | 'SEXUAL_CONTENT'
  | 'HATE'
  | 'HATE_SPEECH'
  | 'SPAM'
  | 'SCAM'
  | 'INAPPROPRIATE_MEDIA'
  | 'OTHER';

export type ModerationActionType =
  | 'WARN_USER'
  | 'HIDE_MESSAGE'
  | 'RESTORE_MESSAGE'
  | 'REMOVE_MESSAGE'
  | 'MUTE_USER'
  | 'BAN_FROM_GROUP'
  | 'ESCALATE_TO_ADMIN'
  | 'DISMISS_REPORT';

export interface DigitalGroup {
  id: string;
  schoolId: string;
  name: string;
  description: string;
  type: DigitalGroupType;
  visibility: GroupVisibility;
  status: GroupStatus;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  classGrade?: string;
  stream?: string;
  subjectCode?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  memberCount: number;
  messageCount: number;
  allowStudentPosts: boolean;
  requirePostModeration: boolean;
  allowMediaUploads: boolean;
  requireApproval?: boolean;
  autoJoinEligible?: boolean;
  canStudentLeave?: boolean;
  allowStudentInvite?: boolean;
  maxMembers?: number;
  allowedGradeLevels?: string[];
  rules?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMembership {
  id: string;
  schoolId: string;
  groupId: string;
  userId: string;
  userName: string;
  userRole: string;
  groupRole: GroupRole;
  status: MembershipStatus;
  joinedAt: string;
  lastReadMessageId?: string;
  unreadCount: number;
  isMuted?: boolean;
}

export interface GroupMembershipRequest {
  id: string;
  requestId?: string;
  schoolId: string;
  groupId: string;
  groupName?: string;
  groupType?: DigitalGroupType;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentGrade?: string;
  studentStream?: string;
  requestedAt: string;
  status: MembershipRequestStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reason?: string;
}

export interface GroupInvitation {
  id: string;
  schoolId: string;
  groupId: string;
  groupName: string;
  groupType: DigitalGroupType;
  groupDescription?: string;
  invitedUserId: string;
  invitedUserName: string;
  invitedUserRole: string;
  invitedByUserId: string;
  invitedByUserName: string;
  invitedByUserRole: string;
  status: InvitationStatus;
  invitedAt: string;
  expiresAt?: string;
  respondedAt?: string;
}

export interface GroupNotification {
  id: string;
  schoolId: string;
  userId: string;
  groupId?: string;
  groupName?: string;
  type:
    | 'JOIN_REQUEST_APPROVED'
    | 'JOIN_REQUEST_REJECTED'
    | 'INVITED_TO_GROUP'
    | 'REMOVED_FROM_GROUP'
    | 'NEW_ANNOUNCEMENT'
    | 'NEW_MESSAGE'
    | 'PROJECT_ASSIGNED';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CommunityMessageAttachment {
  id: string;
  fileType: 'image' | 'video' | 'document' | 'audio';
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  isSafeChecked?: boolean;
}

export type CommunityAttachment = CommunityMessageAttachment;

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface CommunityMessage {
  id: string;
  clientMessageId?: string;
  schoolId: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  messageType: CommunityMessageType;
  status: CommunityMessageStatus;
  attachments: CommunityMessageAttachment[];
  replyToMessageId?: string;
  replyToPreview?: {
    id: string;
    senderName: string;
    content: string;
  };
  reactions: MessageReaction[];
  mentions: string[];
  isPinned: boolean;
  pinnedBy?: string;
  isEdited: boolean;
  editedAt?: string;
  flaggedCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CommunityAnnouncement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY' | 'CRITICAL';
  targetScope: 'SCHOOL_WIDE' | 'CLASS' | 'SUBJECT' | 'CLUB' | 'PROJECT' | 'STAFF_ONLY';
  targetId?: string;
  targetName?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  isPinned: boolean;
  attachments?: CommunityMessageAttachment[];
  acknowledgements?: string[];
  createdAt: string;
  expiresAt?: string;
}

export interface ProjectTaskItem {
  id: string;
  title: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface ProjectDeliverableItem {
  id: string;
  title: string;
  fileUrl?: string;
  submittedByUserId?: string;
  submittedByUserName?: string;
  submittedAt?: string;
}

export interface ProjectTeacherFeedback {
  teacherId: string;
  teacherName: string;
  comments: string;
  gradeScore?: number;
  timestamp: string;
}

export interface CommunityProject {
  id: string;
  schoolId: string;
  groupId: string;
  title: string;
  description: string;
  subject?: string;
  leadTeacherId: string;
  leadTeacherName: string;
  studentMemberIds: string[];
  studentMemberNames: string[];
  status: 'PLANNING' | 'IN_PROGRESS' | 'SUBMITTED' | 'ASSESSED' | 'PUBLISHED_MARKETPLACE';
  tasks: ProjectTaskItem[];
  deliverables: ProjectDeliverableItem[];
  teacherFeedback?: ProjectTeacherFeedback[];
  isMarketplacePublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityReport {
  id: string;
  schoolId: string;
  targetType: 'MESSAGE' | 'USER' | 'GROUP' | 'MEDIA';
  targetId: string;
  groupId?: string;
  groupName?: string;
  reportedUserId?: string;
  reportedUserName?: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reportedByUserRole: string;
  reasonCategory: ReportReasonCategory;
  reasonDetails: string;
  evidenceContent?: string;
  evidenceAttachmentUrl?: string;
  status: 'PENDING' | 'INVESTIGATING' | 'ACTION_TAKEN' | 'RESOLVED_NO_ACTION' | 'DISMISSED';
  assignedModeratorId?: string;
  assignedModeratorName?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface CommunityModerationAction {
  id: string;
  schoolId: string;
  reportId?: string;
  targetType: 'MESSAGE' | 'USER' | 'GROUP' | 'MEDIA';
  targetId: string;
  actionType: ModerationActionType;
  actionDetails: string;
  moderatorId: string;
  moderatorName: string;
  moderatorRole: string;
  timestamp: string;
}

// ============================================================================
// LIVE LEARNING & VIRTUAL CLASSROOM ECOSYSTEM TYPES (PHASES 2-53)
// ============================================================================

export type LiveClassType =
  | 'LIVE_LESSON'
  | 'TUTORIAL'
  | 'REVISION'
  | 'EXAM_PREPARATION'
  | 'STUDY_SESSION'
  | 'PROJECT_PRESENTATION'
  | 'CLUB_SESSION'
  | 'SCHOOL_LECTURE'
  | 'GUEST_SESSION';

export type LiveClassStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export type LiveClassVisibility =
  | 'ENROLLED_CLASS_ONLY'
  | 'GROUP_MEMBERS'
  | 'WHOLE_SCHOOL'
  | 'INVITE_ONLY';

export type ClassVisibility = LiveClassVisibility;

export type RecordingPolicy = 'RECORD_AND_PUBLISH' | 'RECORD_PRIVATE' | 'NO_RECORDING';

export type VideoQualityPreset = 'LOW' | 'MEDIUM' | 'HIGH' | 'HD' | 'AUTO';

export interface LiveParticipationPolicy {
  studentsCanSpeak: boolean;
  studentsCameraAllowed: boolean;
  studentsChatAllowed: boolean;
  studentsScreenSharingAllowed: boolean;
  studentsReactionsAllowed: boolean;
  allowQuestions: boolean;
  allowWhiteboardDraw: boolean;
}

export interface LiveClassMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'DOC' | 'IMAGE' | 'SLIDES' | 'LINK' | 'ASSIGNMENT';
  url: string;
  size?: string;
  uploadedAt: string;
}

export type LiveMaterial = LiveClassMaterial;

export interface LiveClass {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  classType: LiveClassType;
  subject: string;
  classGrade: string;
  stream?: string;
  groupId?: string;
  groupName?: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  estimatedDurationMinutes: number;
  status: LiveClassStatus;
  visibility: LiveClassVisibility;
  recordingPolicy: RecordingPolicy;
  participationPolicy: LiveParticipationPolicy;
  meetingRoomId: string;
  isLocked?: boolean;
  materials?: LiveClassMaterial[];
  actualStartedAt?: string;
  actualEndedAt?: string;
  recordingUrl?: string;
  recordingThumbnail?: string;
  recordingDurationSeconds?: number;
  recordingStatus?: 'NOT_RECORDED' | 'RECORDING' | 'PROCESSING' | 'READY' | 'FAILED';
  recordingAccessList?: string[]; // userIds with permitted access
  createdAt: string;
  updatedAt: string;
}

export interface LiveParticipant {
  userId: string;
  userName: string;
  userRole: RoleType;
  avatar?: string;
  isHost?: boolean;
  joinedAt: string;
  leftAt?: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised: boolean;
  handRaisedAt?: string;
  canSpeak: boolean;
  canDraw: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  deviceInfo?: {
    cameraReady: boolean;
    micReady: boolean;
    speakerReady: boolean;
  };
}

export interface LiveClassAttendanceRecord {
  id: string;
  schoolId: string;
  liveClassId: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  classGrade: string;
  stream?: string;
  firstJoinedAt: string;
  lastLeftAt: string;
  totalDurationMinutes: number;
  participationScore: number;
  status: 'PRESENT' | 'LATE' | 'LEFT_EARLY' | 'ABSENT';
  verifiedViaSessionEvents: boolean;
  createdAt: string;
}

export interface LiveClassMessage {
  id: string;
  schoolId: string;
  liveClassId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  messageType: 'CHAT' | 'ANNOUNCEMENT' | 'SYSTEM' | 'HAND_RAISE' | 'REACTION';
  isPinned?: boolean;
  reactions?: Record<string, string[]>;
  timestamp: string;
}

export interface LiveQuestion {
  id: string;
  schoolId: string;
  liveClassId: string;
  studentId: string;
  studentName: string;
  questionText: string;
  status: 'PENDING' | 'ANSWERED' | 'PINNED' | 'DISMISSED';
  upvotes: string[];
  answerText?: string;
  answeredAt?: string;
  timestamp: string;
}

export interface LivePollOption {
  id: string;
  text: string;
}

export interface LivePollResponse {
  userId: string;
  userName: string;
  optionId: string;
  timestamp: string;
}

export interface LivePoll {
  id: string;
  schoolId: string;
  liveClassId: string;
  creatorId: string;
  creatorName: string;
  question: string;
  options: LivePollOption[];
  responses: LivePollResponse[];
  isActive: boolean;
  allowMultiple: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface LiveQuizQuestion {
  id: string;
  prompt: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctOptionIndex?: number;
  points: number;
}

export interface LiveQuizSubmission {
  userId: string;
  userName: string;
  answers: Record<string, any>;
  score: number;
  totalPoints: number;
  submittedAt: string;
}

export interface LiveQuiz {
  id: string;
  schoolId: string;
  liveClassId: string;
  title: string;
  questions: LiveQuizQuestion[];
  submissions: LiveQuizSubmission[];
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  createdAt: string;
}

export interface WhiteboardStroke {
  id: string;
  type?: 'pen' | 'eraser' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'highlighter' | 'PEN' | 'HIGHLIGHTER' | 'ERASER' | 'RECTANGLE' | 'CIRCLE' | 'ARROW' | 'TEXT';
  tool?: 'PEN' | 'HIGHLIGHTER' | 'ERASER' | 'RECTANGLE' | 'CIRCLE' | 'ARROW' | 'TEXT' | 'pen' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | string;
  color: string;
  size?: number;
  width: number;
  points: { x: number; y: number }[];
  text?: string;
  authorId?: string;
  authorName?: string;
  timestamp: number;
}

export interface LiveRoomTokenPayload {
  roomId: string;
  liveClassId: string;
  userId: string;
  userName: string;
  role: RoleType;
  schoolId: string;
  isHost: boolean;
  issuedAt: number;
  expiresAt: number;
  tokenSignature: string;
}

// ============================================================================
// MEDIA QUALITY ENGINE & PROCESSING TYPES (PHASES 12-16, 47-50)
// ============================================================================

export type MediaProcessingProfile =
  | 'NATURAL'
  | 'VIVID'
  | 'SOFT'
  | 'PROFESSIONAL'
  | 'LOW_LIGHT_ENHANCED';

export interface MediaQualitySettings {
  autoExposure: boolean;
  whiteBalance: boolean;
  contrastOptimization: number; // 0 to 100
  sharpnessOptimization: number; // 0 to 100
  noiseReduction: number | boolean; // 0 to 100 or boolean
  contrastEnhance?: boolean | number;
  sharpness?: number;
  colorNormalization: boolean;
  lowLightGain: number; // 0 to 100
  aspectRatio: 'ORIGINAL' | '16:9' | '4:3' | '1:1' | '9:16';
  resolutionPreset: 'THUMBNAIL' | 'SD' | 'HD' | 'FHD_1080P' | 'ORIGINAL';
}

export interface MediaCaptionTrack {
  id: string;
  language: string;
  label: string;
  vttContent: string;
  isDefault?: boolean;
}

export interface MediaItem {
  id: string;
  schoolId: string;
  title: string;
  description?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'RECORDING' | 'DOCUMENT';
  originalUrl: string;
  thumbnailUrl: string;
  optimizedUrl?: string;
  sdUrl?: string;
  hdUrl?: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  dimensions: { width: number; height: number };
  fileSizeBytes: number;
  mimeType: string;
  processingProfile: MediaProcessingProfile;
  processingStatus: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  safetyStatus: 'PENDING_SCAN' | 'PASSED' | 'FLAGGED' | 'REJECTED';
  safetyLabels?: string[];
  captions?: MediaCaptionTrack[];
  uploadedByUserId: string;
  uploadedByUserName: string;
  uploadedByUserRole: string;
  linkedLiveClassId?: string;
  linkedProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaProcessingJob {
  id: string;
  schoolId: string;
  mediaId: string;
  operation: 'OPTIMIZE_IMAGE' | 'TRANSCODE_VIDEO' | 'GENERATE_THUMBNAILS' | 'AI_CAPTIONS' | 'SAFETY_SCAN';
  profile: MediaProcessingProfile;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  progressPercentage: number;
  outputUrls?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    hlsMaster?: string;
  };
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

// ============================================================================
// UNIVERSAL SCHOOL ACCESS & QR DISCOVERY TYPES (MASTER PROMPT SECTIONS 1-9, 33-37)
// ============================================================================

export interface SchoolQRCode {
  id: string;
  schoolId: string;
  schoolName: string;
  code: string; // e.g. "SCH-ACC-UG-8829"
  accessIdentifier: string;
  endpointUrl: string;
  localLanUrl?: string;
  version: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'DISABLED';
  scope: 'UNIVERSAL_DISCOVERY' | 'STAFF_ONLY' | 'STUDENT_ONLY' | 'VISITOR_CONTROLLED';
  description?: string;
  scansCount: number;
  lastScannedAt?: string;
  createdAt: string;
  rotatedAt?: string;
  createdBy: string;
}

export interface TrustedDevice {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  userRole: RoleType;
  deviceId: string;
  deviceName: string;
  deviceType: 'PHONE' | 'TABLET' | 'LAPTOP' | 'DESKTOP' | 'LOW_END_PC';
  browser: string;
  os: string;
  ipAddress: string;
  isLocalLan: boolean;
  lastSeenAt: string;
  status: 'TRUSTED' | 'PENDING_APPROVAL' | 'REVOKED' | 'BLOCKED';
  isLowEndModeEnabled: boolean;
  registeredAt: string;
}

export interface SchoolAccessActivationRequest {
  activationCode: string;
  identifier: string; // student admission #, staff employee #, or parent phone
  fullName: string;
  schoolId: string;
  desiredUsername: string;
  passwordHash: string;
  deviceInfo?: {
    deviceName: string;
    deviceType: string;
    browser: string;
  };
}

// ============================================================================
// UNIVERSAL SCHOOL MARKET & CANTEEN TYPES (MASTER PROMPT SECTIONS 12-17, 65-70)
// ============================================================================

export type MarketCategory =
  | 'SCHOOL_SUPPLIES'
  | 'BOOKS'
  | 'UNIFORMS'
  | 'STUDENT_PROJECTS'
  | 'ART_CRAFTS'
  | 'DIGITAL_PROJECTS'
  | 'EDUCATIONAL_MATERIALS'
  | 'CANTEEN_MEALS'
  | 'CANTEEN_SNACKS'
  | 'CANTEEN_BEVERAGES'
  | 'SCHOOL_EVENTS'
  | 'APPROVED_SERVICES'
  | 'OTHER_APPROVED';

export type MarketListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'SOLD_OUT'
  | 'ARCHIVED';

export interface MarketListing {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  category: MarketCategory;
  price: number;
  currency: string;
  sellerId: string;
  sellerName: string;
  sellerRole: RoleType;
  images: string[];
  thumbnailUrl?: string;
  stockQuantity: number;
  status: MarketListingStatus;
  isApprovedBySchool: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNotes?: string;
  linkedProjectId?: string;
  isCanteenItem?: boolean;
  canteenMealType?: 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'BEVERAGE' | 'SPECIAL';
  prepTimeMinutes?: number;
  dietaryTags?: string[];
  safetyPassed: boolean;
  viewsCount: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

export type MarketPaymentMethod = 'PESAPAL' | 'MOBILE_MONEY' | 'BURSAR_ACCOUNT' | 'CASH_ON_COLLECTION';

export type MarketPaymentStatus = 'PENDING_PAYMENT' | 'PAID' | 'VERIFIED' | 'FAILED' | 'REFUNDED';

export type MarketFulfillmentStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_COLLECTION'
  | 'COLLECTED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface MarketOrder {
  id: string;
  schoolId: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerRole: RoleType;
  sellerId: string;
  sellerName: string;
  sellerRole: RoleType;
  listingId: string;
  listingTitle: string;
  category: MarketCategory;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  paymentStatus: MarketPaymentStatus;
  paymentMethod: MarketPaymentMethod;
  paymentReference?: string;
  pesapalTrackingId?: string;
  fulfillmentStatus: MarketFulfillmentStatus;
  assignedStaffId?: string; // e.g. Cook / Canteen server assigned
  assignedStaffName?: string;
  collectionPin: string;
  pickupLocation?: string;
  notes?: string;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketDispute {
  id: string;
  schoolId: string;
  orderId: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reportedRole: RoleType;
  reason: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  resolutionNotes?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ============================================================================
// SYSTEM HEALTH & LOW-END HARDWARE PERFORMANCE (MASTER PROMPT SECTIONS 19-30)
// ============================================================================

export interface SystemHealthMetrics {
  cpuLoadPercent: number;
  memoryUsagePercent: number;
  diskSpacePercent: number;
  activeConnectionsCount: number;
  databaseResponseTimeMs: number;
  backgroundWorkerStatus: 'HEALTHY' | 'BUSY' | 'THROTTLED' | 'IDLE';
  overallStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  isLowEndModeRecommended: boolean;
  lastBackupVerifiedAt: string;
  isOnline: boolean;
  networkLatencyMs: number;
  schoolLanActive: boolean;
  timestamp: string;
}

// ============================================================================
// SCHOOLSOUL OPPORTUNITY & ACHIEVEMENT ENGINE (MASTER PROMPT SECTIONS 1-84)
// ============================================================================

export type SkillCategory =
  | 'Academic'
  | 'Technical'
  | 'Digital'
  | 'Communication'
  | 'Leadership'
  | 'Creativity'
  | 'Entrepreneurship'
  | 'Problem Solving'
  | 'Teamwork'
  | 'Research'
  | 'Practical Skills'
  | 'Community Engagement'
  | 'Innovation'
  | 'Other';

export type SkillLevel =
  | 'DISCOVERING'
  | 'DEVELOPING'
  | 'CAPABLE'
  | 'PROFICIENT'
  | 'ADVANCED'
  | 'MASTERY'
  | 'EXPERT_MASTERED';

export type AchievementLevel = 'PARTICIPATION' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DISTINCTION';
export type MissionDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERY';

export interface SkillDefinition {
  id: string;
  schoolId: string;
  name: string;
  category: SkillCategory;
  description: string;
  criteria?: string;
  createdAt: string;
}

export interface StudentSkill {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  skillId: string;
  skillName: string;
  category: SkillCategory;
  level: SkillLevel;
  evidenceCount: number;
  verifiedCount: number;
  lastEvaluatedAt?: string;
  teacherEvaluatorId?: string;
  teacherEvaluatorName?: string;
  relatedProjectIds?: string[];
  relatedMissionIds?: string[];
}

export type SkillEvidenceSource =
  | 'ASSIGNMENT'
  | 'PROJECT'
  | 'MISSION'
  | 'COMPETITION'
  | 'CLUB'
  | 'PRESENTATION'
  | 'TEACHER_ASSESSMENT'
  | 'PEER_COLLABORATION'
  | 'PRACTICAL_WORK'
  | 'SCHOOL_ACTIVITY'
  | 'COMMUNITY'
  | 'EXPERIMENT'
  | 'MARKET_ENTERPRISE';

export type VerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED';

export interface SkillEvidence {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  skillId: string;
  skillName: string;
  levelDemonstrated: SkillLevel;
  source: SkillEvidenceSource;
  sourceId?: string;
  sourceTitle?: string;
  description: string;
  mediaUrls?: string[];
  verificationStatus: VerificationStatus;
  teacherVerifierId?: string;
  teacherVerifierName?: string;
  teacherComments?: string;
  verifiedAt?: string;
  createdAt: string;
}

export type PortfolioVisibility =
  | 'PRIVATE'
  | 'SCHOOL_ONLY'
  | 'APPROVED_EXTERNAL_SHOWCASE'
  | 'PUBLIC_APPROVED';

export type PortfolioSectionType =
  | 'ABOUT_ME'
  | 'PROJECTS'
  | 'ACHIEVEMENTS'
  | 'SKILLS'
  | 'COMPETITIONS'
  | 'CERTIFICATES'
  | 'CLUBS'
  | 'LEADERSHIP'
  | 'COMMUNITY_WORK'
  | 'INNOVATION'
  | 'MARKET_PROJECTS'
  | 'PRESENTATIONS';

export interface PortfolioItem {
  id: string;
  sectionType: PortfolioSectionType;
  title: string;
  description: string;
  mediaUrls?: string[];
  linkedEntityId?: string;
  date: string;
  isShowcased: boolean;
  verificationId?: string;
  approvalStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export type MissionCategory =
  | 'ACADEMIC'
  | 'INNOVATION'
  | 'ENVIRONMENTAL'
  | 'TECHNOLOGY'
  | 'ENTREPRENEURSHIP'
  | 'LEADERSHIP'
  | 'COMMUNITY'
  | 'CREATIVE'
  | 'RESEARCH'
  | 'PROBLEM_SOLVING';

export type MissionStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'SUBMISSION'
  | 'REVIEW'
  | 'COMPLETED'
  | 'ARCHIVED';

export type MissionTaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVIEWED';

export interface MissionTask {
  id: string;
  missionId: string;
  title: string;
  description: string;
  stageOrder: number;
  status: MissionTaskStatus;
  assignedMemberIds?: string[];
  dueDate?: string;
}

export interface SchoolMission {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  objective: string;
  instructions: string[];
  category: MissionCategory;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERY';
  isTeamMission: boolean;
  maxTeamSize: number;
  teacherSupervisorId: string;
  teacherSupervisorName: string;
  requiredSkills: string[];
  submissionRequirements: string[];
  evaluationCriteria: string[];
  rewardTitle: string;
  status: MissionStatus;
  startDate: string;
  endDate: string;
  tasks: MissionTask[];
  submissionsCount: number;
  participantsCount: number;
  createdAt: string;
}

export interface MissionTeam {
  id: string;
  schoolId: string;
  missionId: string;
  teamName: string;
  leaderStudentId: string;
  leaderStudentName: string;
  memberStudentIds: string[];
  memberStudentNames: string[];
  teacherMentorId?: string;
  teacherMentorName?: string;
  status: 'ACTIVE' | 'SUBMITTED' | 'EVALUATED' | 'DISBANDED';
  createdAt: string;
}

export interface MissionSubmission {
  id: string;
  schoolId: string;
  missionId: string;
  missionTitle: string;
  studentId?: string;
  studentName?: string;
  teamId?: string;
  teamName?: string;
  isTeamSubmission: boolean;
  submissionText: string;
  mediaUrls: string[];
  externalLinks?: string[];
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED';
  score?: number;
  maxScore?: number;
  teacherFeedback?: string;
  teacherEvaluatorId?: string;
  teacherEvaluatorName?: string;
  evaluatedAt?: string;
  awardedAchievementId?: string;
  submittedAt: string;
}

export type InnovationStage =
  | 'PROBLEM'
  | 'RESEARCH'
  | 'IDEA'
  | 'PROTOTYPE'
  | 'TESTING'
  | 'IMPROVEMENT'
  | 'FINAL_SOLUTION'
  | 'PRESENTATION'
  | 'EVALUATION';

export interface InnovationChallenge {
  id: string;
  schoolId: string;
  title: string;
  theme: string;
  problemStatement: string;
  challengeType:
    | 'SCIENCE_FAIR'
    | 'TECH_COMPETITION'
    | 'ENTREPRENEURSHIP'
    | 'COMMUNITY_PROBLEM_SOLVING'
    | 'CREATIVE_INNOVATION';
  currentStage: InnovationStage;
  startDate: string;
  endDate: string;
  supervisorId: string;
  supervisorName: string;
  prizeDescription?: string;
  entriesCount: number;
  status: 'UPCOMING' | 'ACTIVE' | 'JUDGING' | 'COMPLETED';
  createdAt: string;
}

export type OpportunityCategory =
  | 'SCHOLARSHIP'
  | 'COMPETITION'
  | 'ACADEMIC'
  | 'INNOVATION'
  | 'TECHNOLOGY'
  | 'ENTREPRENEURSHIP'
  | 'INTERNSHIP'
  | 'MENTORSHIP'
  | 'CLUB'
  | 'EVENT'
  | 'COMMUNITY_PROJECT'
  | 'SCHOOL_PROGRAM'
  | 'EXTERNAL_APPROVED';

export interface OpportunityItem {
  id: string;
  schoolId: string;
  title: string;
  category: OpportunityCategory;
  scope: 'SCHOOL_OPPORTUNITY' | 'EXTERNAL_OPPORTUNITY';
  providerName: string;
  description: string;
  eligibilityCriteria: string[];
  targetSkillCategories?: string[];
  targetGradeLevels?: string[];
  applicationInstructions: string;
  applicationUrl?: string;
  contactEmail?: string;
  startDate: string;
  deadline: string;
  expiryDate: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';
  isApprovedBySchool: boolean;
  approvedByAdminId?: string;
  savedByStudentIds?: string[];
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
}

export interface TalentDiscoveryInsight {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  patternType:
    | 'STRONG_PROJECT_PERFORMANCE'
    | 'CONSISTENT_LEADERSHIP'
    | 'INNOVATION_PARTICIPATION'
    | 'TECHNICAL_EXCELLENCE'
    | 'CREATIVE_ACTIVITY'
    | 'COLLABORATIVE_TEAMWORK'
    | 'COMMUNICATION_STRENGTH'
    | 'ACADEMIC_ACCELERATION';
  title: string;
  observationText: string;
  confidenceLabel: 'Potential strength' | 'Emerging skill' | 'Evidence suggests';
  supportingEvidenceCount: number;
  suggestedOpportunities: string[];
  suggestedMissions: string[];
  reviewedByTeacherId?: string;
  isAcknowledgedByTeacher: boolean;
  generatedAt: string;
}

export type AchievementCategory =
  | 'ACADEMIC'
  | 'LEADERSHIP'
  | 'INNOVATION'
  | 'COMMUNITY'
  | 'SPORTS'
  | 'ARTS'
  | 'TECHNOLOGY'
  | 'ENTREPRENEURSHIP'
  | 'PROJECT'
  | 'MISSION'
  | 'COMPETITION'
  | 'CLUB'
  | 'SCHOOL_SERVICE';

export interface AchievementItem {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  category: AchievementCategory;
  badgeIconName?: string;
  level: AchievementLevel;
  issuerName: string;
  issuerRole: RoleType;
  dateAwarded: string;
  verificationId: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REVOKED';
  isPublicShowcaseApproved: boolean;
  relatedProjectId?: string;
  relatedMissionId?: string;
  relatedClubId?: string;
  certificateGenerated: boolean;
  certificateId?: string;
  createdAt: string;
}

export interface DigitalCertificate {
  id: string;
  schoolId: string;
  verificationId: string;
  studentId: string;
  studentName: string;
  schoolName: string;
  achievementTitle: string;
  description: string;
  category: string;
  dateIssued: string;
  issuerName: string;
  issuerTitle: string;
  qrVerificationCode: string;
  signatureHash: string;
  isRevoked: boolean;
  createdAt: string;
}

export type ShowcaseApprovalStage =
  | 'DRAFT'
  | 'SCHOOL_APPROVED'
  | 'PUBLIC_APPROVED';

export interface SchoolShowcaseItem {
  id: string;
  schoolId: string;
  title: string;
  summary: string;
  detailedStory?: string;
  showcaseType:
    | 'STUDENT_PROJECT'
    | 'INNOVATION'
    | 'ACHIEVEMENT'
    | 'CLUB'
    | 'COMPETITION'
    | 'COMMUNITY_IMPACT'
    | 'STUDENT_ENTERPRISE'
    | 'SCHOOL_INITIATIVE';
  authorStudentIds: string[];
  authorNames: string[];
  teacherSupervisorId?: string;
  teacherSupervisorName?: string;
  mediaUrls: string[];
  coverImageUrl?: string;
  approvalStage: ShowcaseApprovalStage;
  isPublic: boolean;
  likesCount: number;
  viewsCount: number;
  publishedAt?: string;
  linkedMarketListingId?: string;
  createdAt: string;
}

export interface ClubMembership {
  id: string;
  schoolId: string;
  clubId: string;
  clubName: string;
  studentId: string;
  studentName: string;
  role: 'MEMBER' | 'LEADER' | 'OFFICER' | 'TREASURER' | 'SECRETARY';
  joinedAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface MentorshipEngagement {
  id: string;
  schoolId: string;
  mentorTeacherId: string;
  mentorTeacherName: string;
  menteeType: 'INDIVIDUAL_STUDENT' | 'TEAM';
  menteeStudentId?: string;
  menteeStudentName?: string;
  menteeTeamId?: string;
  menteeTeamName?: string;
  focusArea: string;
  goals: { id: string; title: string; isCompleted: boolean; targetDate?: string }[];
  meetingNotes: {
    id: string;
    date: string;
    notes: string;
    actionItems: string[];
    privateTeacherNotes?: string;
  }[];
  progressScore: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  startedAt: string;
  updatedAt: string;
}

export interface SchoolImpactMetric {
  id: string;
  schoolId: string;
  academicYear: string;
  projectsCompletedCount: number;
  missionsCompletedCount: number;
  activeStudentParticipantsCount: number;
  activeTeacherMentorsCount: number;
  verifiedSkillsCount: number;
  competitionsEnteredCount: number;
  achievementsAwardedCount: number;
  innovationProjectsCount: number;
  studentEnterpriseListingsCount: number;
  communityProjectsCount: number;
  calculatedAt: string;
}

// ============================================================================
// SCHOOLSOUL SPONSORSHIP & STUDENT OPPORTUNITY BRIDGE (MASTER ARCHITECTURE)
// ============================================================================

export type SponsorType =
  | 'INDIVIDUAL_SPONSOR'
  | 'COMPANY'
  | 'NGO'
  | 'FOUNDATION'
  | 'UNIVERSITY'
  | 'EDUCATIONAL_INSTITUTION'
  | 'TECH_ORGANIZATION'
  | 'COMMUNITY_ORGANIZATION'
  | 'CORPORATE_CSR'
  | 'SCHOLARSHIP_PROVIDER'
  | 'COMPETITION_ORGANIZER'
  | 'MENTORSHIP_ORGANIZATION';

export type SponsorVerificationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'EXPIRED';

export type SponsorSupportType =
  | 'SCHOLARSHIP'
  | 'FEES_SUPPORT'
  | 'EQUIPMENT'
  | 'PROJECT_FUNDING'
  | 'COMPETITION_FUNDING'
  | 'CLUB_SUPPORT'
  | 'SCHOOL_PROGRAM'
  | 'MENTORSHIP'
  | 'TRAINING'
  | 'INTERNSHIP'
  | 'ENTREPRENEURSHIP_SUPPORT'
  | 'INNOVATION_GRANT'
  | 'TEAM_SUPPORT'
  | 'SCHOOL_WIDE_SUPPORT';

export interface SponsorProfile {
  id: string;
  userId?: string;
  name: string;
  organizationType: SponsorType;
  country: string;
  website?: string;
  officialContactEmail: string;
  officialContactPhone?: string;
  purpose: string;
  supportCategories: SponsorSupportType[];
  verificationStatus: SponsorVerificationStatus;
  verifiedByAdminId?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  riskScore: number; // 0-100 (0 is lowest risk)
  isSafeguardTermsAccepted: boolean;
  termsAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type StudentOpportunityVisibility =
  | 'PRIVATE'
  | 'SCHOOL_ONLY'
  | 'ELIGIBLE_FOR_OPPORTUNITIES'
  | 'APPROVED_SPONSOR_DISCOVERY';

export interface OpportunityScorecard {
  innovation: number; // 0-10
  technicalSkills: number;
  leadership: number;
  communication: number;
  projectExperience: number;
}

export interface StudentOpportunityProfile {
  id: string;
  schoolId: string;
  studentId: string;
  candidateId: string; // e.g. "SS-CANDIDATE-2048"
  ageGradeBand: string; // e.g. "Senior Secondary (16-18)"
  visibility: StudentOpportunityVisibility;
  approvedInterests: string[];
  verifiedSkills: {
    skillName: string;
    category: string;
    level: SkillLevel;
    verifiedCount: number;
  }[];
  verifiedProjectsCount: number;
  verifiedAchievementsCount: number;
  missionsCompletedCount: number;
  scorecard: OpportunityScorecard;
  seekingSupportTypes: SponsorSupportType[];
  goals: string[];
  schoolApprovalStatus: 'PENDING' | 'APPROVED' | 'REQUIRES_REVIEW' | 'REVOKED';
  schoolApprovedBy?: string;
  schoolApprovedAt?: string;
  parentConsentRequired: boolean;
  parentConsentStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'DECLINED';
  parentConsentGivenAt?: string;
  parentNotes?: string;
  updatedAt: string;
}

export interface ProjectSupportRequest {
  id: string;
  schoolId: string;
  projectId?: string;
  projectTitle: string;
  projectCategory: string;
  teamLeadCandidateId?: string;
  teamName?: string;
  memberCount: number;
  summary: string;
  materialsNeeded: string[];
  supportTypesNeeded: SponsorSupportType[];
  estimatedBudget: number;
  currency: string;
  schoolApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedByAdminId?: string;
  activeSponsorInterestCount: number;
  status: 'OPEN' | 'FUNDED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface SchoolProgramSponsorship {
  id: string;
  schoolId: string;
  programName: string;
  category: 'STEM' | 'ROBOTICS' | 'LIBRARY' | 'ARTS' | 'AGRICULTURE' | 'SPORTS' | 'DIGITAL_LEARNING' | 'TEACHER_CPD';
  description: string;
  targetStudentsCount: number;
  equipmentNeeded: string[];
  targetBudget: number;
  currentFunding: number;
  currency: string;
  status: 'PROPOSED' | 'APPROVED_SEEKING_SPONSORS' | 'ACTIVE_SUPPORTED' | 'FULLY_EQUIPPED';
  sponsorIds: string[];
  createdAt: string;
}

export interface ScholarshipOpportunity {
  id: string;
  schoolId?: string;
  sponsorId: string;
  sponsorName: string;
  sponsorType: SponsorType;
  title: string;
  description: string;
  supportType: 'FULL_TUITION' | 'PARTIAL_TUITION' | 'LIVING_STIPEND' | 'RESEARCH_GRANT' | 'EQUIPMENT_GRANT';
  amountValue: number;
  currency: string;
  eligibilityCriteria: string[];
  eligibleGradeBands: string[];
  targetSkillCategories: string[];
  deadline: string;
  startDate: string;
  expiryDate: string;
  applicationMethod: 'INTERNAL_SCHOOLSOUL_BRIDGE' | 'DIRECT_SCHOOL_NOMINATION';
  verificationStatus: 'VERIFIED_LEGITIMATE' | 'PENDING_VERIFICATION';
  isSchoolApproved: boolean;
  approvedByAdminId?: string;
  status: 'OPEN' | 'IN_REVIEW' | 'AWARDED' | 'EXPIRED';
  applicationsCount: number;
  createdAt: string;
}

export interface SponsorInterestRequest {
  id: string;
  schoolId: string;
  sponsorId: string;
  sponsorName: string;
  sponsorType: SponsorType;
  targetType: 'CANDIDATE_PROFILE' | 'PROJECT_REQUEST' | 'TEAM_REQUEST' | 'SCHOOL_PROGRAM';
  targetId: string;
  targetTitle: string;
  offeredSupportType: SponsorSupportType;
  offeredDetails: string;
  offeredValue?: number;
  currency?: string;
  status: 'PENDING' | 'SCHOOL_REVIEW' | 'PARENT_REVIEW' | 'STUDENT_REVIEW' | 'APPROVED' | 'DECLINED' | 'COMPLETED';
  schoolReviewNotes?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  parentConsentStatus?: 'PENDING' | 'APPROVED' | 'DECLINED';
  parentConsentGivenAt?: string;
  studentAcceptanceStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  completedAt?: string;
  outcomeNotes?: string;
  createdAt: string;
}

export interface OpportunityApplication {
  id: string;
  schoolId: string;
  opportunityId: string;
  opportunityTitle: string;
  candidateId: string;
  studentId: string;
  studentName?: string;
  gradeBand: string;
  statementOfPurpose: string;
  supportingEvidenceSummary: string[];
  teacherRecommendationId?: string;
  teacherRecommendationNote?: string;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'SCHOOL_REVIEW'
    | 'PARENT_REVIEW'
    | 'SPONSOR_REVIEW'
    | 'INTERVIEW_ASSESSMENT'
    | 'APPROVED'
    | 'DECLINED'
    | 'WITHDRAWN'
    | 'COMPLETED';
  schoolReviewDecision?: 'APPROVED_FOR_SPONSOR' | 'CHANGES_REQUESTED' | 'REJECTED';
  schoolReviewedBy?: string;
  schoolReviewedAt?: string;
  parentApprovedAt?: string;
  sponsorDecision?: 'AWARDED' | 'SHORTLISTED' | 'NOT_SELECTED';
  sponsorFeedback?: string;
  awardedSupport?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentSupportRecord {
  id: string;
  schoolId: string;
  sponsorId: string;
  sponsorName: string;
  itemCategory:
    | 'LAPTOP'
    | 'TABLET'
    | 'SCIENCE_KIT'
    | 'ROBOTICS_KIT'
    | 'BOOKS'
    | 'INTERNET_ROUTER'
    | 'SOFTWARE_LICENSE'
    | 'LAB_EQUIPMENT'
    | 'PROJECT_MATERIALS';
  itemName: string;
  serialNumberOrBatch?: string;
  quantity: number;
  recipientType: 'INDIVIDUAL_STUDENT' | 'STUDENT_TEAM' | 'SCHOOL_LAB' | 'CLASSROOM';
  recipientCandidateId?: string;
  recipientTeamOrLabName?: string;
  status:
    | 'REQUESTED'
    | 'APPROVED'
    | 'DISPATCHED'
    | 'DELIVERED_TO_SCHOOL'
    | 'INSPECTED_VERIFIED'
    | 'ASSIGNED_TO_STUDENT'
    | 'RETURNED_TO_INVENTORY';
  estimatedValue: number;
  currency: string;
  deliveredAt?: string;
  inspectedByStaffId?: string;
  assignedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface ControlledOpportunityMessage {
  id: string;
  schoolId: string;
  threadId: string;
  sponsorId: string;
  sponsorName: string;
  senderType: 'SPONSOR' | 'SCHOOL_ADMIN' | 'AUTHORIZED_TEACHER';
  senderName: string;
  recipientDescription: string;
  subject: string;
  content: string;
  moderationStatus: 'APPROVED' | 'HELD_FOR_REVIEW' | 'FLAGGED';
  moderatedByAdminId?: string;
  attachments?: { fileName: string; fileUrl: string }[];
  createdAt: string;
}

export interface SponsorshipAuditLog {
  id: string;
  schoolId: string;
  action: string;
  performedByUserId: string;
  performedByName: string;
  performedByRole: RoleType | 'SPONSOR';
  targetEntityType: 'SPONSOR' | 'OPPORTUNITY_PROFILE' | 'INTEREST_REQUEST' | 'APPLICATION' | 'EQUIPMENT' | 'PARENT_CONSENT';
  targetEntityId: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SafeguardingReport {
  id: string;
  schoolId: string;
  reportedByUserId: string;
  reportedByName: string;
  reportedByRole: RoleType;
  sponsorId?: string;
  sponsorName?: string;
  reasonCategory:
    | 'INAPPROPRIATE_CONTACT_ATTEMPT'
    | 'REQUEST_FOR_PRIVATE_DATA'
    | 'EXPLOITATION_RISK'
    | 'UNAUTHORIZED_PAYMENT_PROPOSAL'
    | 'POLICY_VIOLATION'
    | 'OTHER';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'INVESTIGATING' | 'ACTION_TAKEN' | 'DISMISSED';
  actionTakenNotes?: string;
  resolvedByAdminId?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface OpportunityMatchResult {
  opportunityId: string;
  opportunityTitle: string;
  providerName: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  matchedSkills: string[];
  matchedInterests: string[];
  eligibilityStatus: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'MISSING_CRITERIA';
}

export interface SponsorImpactReport {
  id: string;
  sponsorId: string;
  sponsorName: string;
  academicYear: string;
  totalFinancialSupportUSD: number;
  totalStudentsBenefited: number;
  totalProjectsFunded: number;
  totalEquipmentKitsDelivered: number;
  totalMissionsSupported: number;
  totalClubsSupported: number;
  programsSummary: {
    programName: string;
    studentsCount: number;
    completionRatePercent: number;
    keyAchievements: string[];
  }[];
  generatedAt: string;
}

export interface SchoolQRCode {
  id: string;
  schoolId: string;
  schoolName: string;
  countryCode: string;
  country: string;
  code: string;
  signature?: string;
  version: string;
  status: 'DISABLED' | 'EXPIRED' | 'ACTIVE' | 'REVOKED';
  issuedAt: string;
  lastRotatedAt?: string;
  verificationEndpoint: string;
  metadata?: Record<string, any>;
}

export interface QRScanAuditLog {
  id: string;
  schoolId: string;
  timestamp: string;
  scannedType: string;
  entityId?: string;
  scannedByUserId?: string;
  scannedByRole?: string;
  deviceContext?: string;
  workflow?: string;
  status: 'VERIFIED' | 'FAILED' | 'CROSS_SCHOOL_BLOCKED' | 'EXPIRED' | 'TAMPERED';
  details?: string;
}
