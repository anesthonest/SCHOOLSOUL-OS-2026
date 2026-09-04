import Dexie, { type Table } from 'dexie';
import type {
  SchoolProfile,
  User,
  RoleDefinition,
  SystemSettings,
  AuditLog,
  SyncQueueItem,
  SystemNotification,
  RegisteredDevice,
  Student,
  Guardian,
  AdmissionApplication,
  StudentDocument,
  StudentTimelineEvent,
  StudentNote,
  ClassAssignmentLog,
  DigitalIDCard,
  StudentAttendanceRecord,
  StaffAttendanceRecord,
  VisitorRecord,
  StaffLeaveRequest,
  CalendarEvent,
  AttendanceAlert,
  ParentAttendanceNotification,
  FeeStructure,
  StudentFeeAccount,
  PaymentRecord,
  ScholarshipRecord,
  BudgetItem,
  FinancialTransaction,
  JournalEntry,
  MobileMoneyRequest,
  PaymentReminder,
  AcademicYearConfig,
  AcademicTermConfig,
  SchoolClass,
  AcademicStream,
  AcademicDepartment,
  SchoolHouse,
  AcademicClub,
  Subject,
  TimetableSlot,
  LessonPlan,
  HomeworkAssignment,
  HomeworkSubmission,
  Assessment,
  StudentMark,
  ExamSchedule,
  ExamSlot,
  ReportCard,
  AcademicCertificate,
  DirectMessage,
  MessageConversation,
  SmsLog,
  WhatsAppLog,
  Announcement,
  SchoolNewsArticle,
  SchoolEventItem,
  EventRsvpRecord,
  ParentTeacherMeetingSlot,
  DigitalConsentForm,
  ParentConsentSubmission,
  SchoolSurvey,
  SurveyResponseRecord,
  HelpDeskTicket,
  CommunityGroupItem,
  GroupPostItem,
  EmergencyAlertRecord,
  DigitalGroup,
  GroupMembership,
  GroupMembershipRequest,
  GroupInvitation,
  GroupNotification,
  CommunityMessage,
  CommunityAnnouncement,
  CommunityProject,
  CommunityReport,
  CommunityModerationAction,
  LiveClass,
  LiveClassAttendanceRecord,
  LiveClassMessage,
  LiveQuestion,
  LivePoll,
  LiveQuiz,
  MediaItem,
  MediaProcessingJob,
} from '../types';

export class SchoolSoulDatabase extends Dexie {
  schoolProfile!: Table<SchoolProfile, string>;
  users!: Table<User, string>;
  roles!: Table<RoleDefinition, string>;
  settings!: Table<SystemSettings, string>;
  auditLogs!: Table<AuditLog, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  notifications!: Table<SystemNotification, string>;
  devices!: Table<RegisteredDevice, string>;
  students!: Table<Student, string>;
  guardians!: Table<Guardian, string>;
  admissions!: Table<AdmissionApplication, string>;
  studentDocuments!: Table<StudentDocument, string>;
  studentTimeline!: Table<StudentTimelineEvent, string>;
  studentNotes!: Table<StudentNote, string>;
  classAssignmentLogs!: Table<ClassAssignmentLog, string>;
  digitalIdCards!: Table<DigitalIDCard, string>;
  studentAttendance!: Table<StudentAttendanceRecord, string>;
  staffAttendance!: Table<StaffAttendanceRecord, string>;
  visitors!: Table<VisitorRecord, string>;
  staffLeave!: Table<StaffLeaveRequest, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  attendanceAlerts!: Table<AttendanceAlert, string>;
  parentNotifications!: Table<ParentAttendanceNotification, string>;
  feeStructures!: Table<FeeStructure, string>;
  studentFeeAccounts!: Table<StudentFeeAccount, string>;
  paymentRecords!: Table<PaymentRecord, string>;
  scholarships!: Table<ScholarshipRecord, string>;
  budgets!: Table<BudgetItem, string>;
  financialTransactions!: Table<FinancialTransaction, string>;
  journalEntries!: Table<JournalEntry, string>;
  mobileMoneyRequests!: Table<MobileMoneyRequest, string>;
  paymentReminders!: Table<PaymentReminder, string>;
  // Vision 5 Academic Tables
  academicYears!: Table<AcademicYearConfig, string>;
  academicTerms!: Table<AcademicTermConfig, string>;
  schoolClasses!: Table<SchoolClass, string>;
  academicStreams!: Table<AcademicStream, string>;
  academicDepartments!: Table<AcademicDepartment, string>;
  schoolHouses!: Table<SchoolHouse, string>;
  academicClubs!: Table<AcademicClub, string>;
  subjects!: Table<Subject, string>;
  timetableSlots!: Table<TimetableSlot, string>;
  lessonPlans!: Table<LessonPlan, string>;
  homeworkAssignments!: Table<HomeworkAssignment, string>;
  homeworkSubmissions!: Table<HomeworkSubmission, string>;
  assessments!: Table<Assessment, string>;
  studentMarks!: Table<StudentMark, string>;
  examSchedules!: Table<ExamSchedule, string>;
  examSlots!: Table<ExamSlot, string>;
  reportCards!: Table<ReportCard, string>;
  academicCertificates!: Table<AcademicCertificate, string>;
  // Vision 6 Communication & Community Tables
  directMessages!: Table<DirectMessage, string>;
  messageConversations!: Table<MessageConversation, string>;
  smsLogs!: Table<SmsLog, string>;
  whatsAppLogs!: Table<WhatsAppLog, string>;
  announcements!: Table<Announcement, string>;
  newsArticles!: Table<SchoolNewsArticle, string>;
  schoolEvents!: Table<SchoolEventItem, string>;
  eventRsvps!: Table<EventRsvpRecord, string>;
  parentTeacherMeetings!: Table<ParentTeacherMeetingSlot, string>;
  consentForms!: Table<DigitalConsentForm, string>;
  consentSubmissions!: Table<ParentConsentSubmission, string>;
  surveys!: Table<SchoolSurvey, string>;
  surveyResponses!: Table<SurveyResponseRecord, string>;
  helpDeskTickets!: Table<HelpDeskTicket, string>;
  communityGroups!: Table<CommunityGroupItem, string>;
  groupPosts!: Table<GroupPostItem, string>;
  emergencyAlerts!: Table<EmergencyAlertRecord, string>;
  // Digital Community & Learning Ecosystem Tables
  digitalGroups!: Table<DigitalGroup, string>;
  groupMemberships!: Table<GroupMembership, string>;
  groupMembershipRequests!: Table<GroupMembershipRequest, string>;
  groupInvitations!: Table<GroupInvitation, string>;
  groupNotifications!: Table<GroupNotification, string>;
  communityMessages!: Table<CommunityMessage, string>;
  communityAnnouncements!: Table<CommunityAnnouncement, string>;
  communityProjects!: Table<CommunityProject, string>;
  communityReports!: Table<CommunityReport, string>;
  communityModerationActions!: Table<CommunityModerationAction, string>;
  // Live Learning & Virtual Classroom Tables
  liveClasses!: Table<LiveClass, string>;
  liveClassAttendance!: Table<LiveClassAttendanceRecord, string>;
  liveClassMessages!: Table<LiveClassMessage, string>;
  liveQuestions!: Table<LiveQuestion, string>;
  livePolls!: Table<LivePoll, string>;
  liveQuizzes!: Table<LiveQuiz, string>;
  mediaItems!: Table<MediaItem, string>;
  mediaProcessingJobs!: Table<MediaProcessingJob, string>;

  constructor() {
    super('SchoolSoulLocalDB');
    this.version(2).stores({
      schoolProfile: 'id',
      users: 'id, username, email, role, status, employeeNumber',
      roles: 'id, name, isBuiltIn',
      settings: 'id',
      auditLogs: 'id, timestamp, userId, action',
      syncQueue: 'id, entity, status, timestamp',
      notifications: 'id, read, timestamp, category',
      devices: 'id, userId, lastActive',
      students: 'id, studentId, admissionNumber, fullName, classGrade, stream, status, residenceType, nationalIdOrBirthCert',
      guardians: 'id, studentId, fullName, nationalId, phoneNumber',
      admissions: 'id, applicationNumber, applicantLastName, appliedGrade, status, submissionDate',
      studentDocuments: 'id, studentId, category, verificationStatus, uploadedAt',
      studentTimeline: 'id, studentId, eventType, timestamp',
      studentNotes: 'id, studentId, category, authorId, createdAt',
      classAssignmentLogs: 'id, studentId, newClass, timestamp',
      digitalIdCards: 'id, studentId, cardSerialNumber, status',
      studentAttendance: 'id, studentId, classGrade, stream, date, session, status, recordedBy',
      staffAttendance: 'id, staffId, date, status, recordedBy',
      visitors: 'id, visitorName, phone, date, status, badgeNumber',
      staffLeave: 'id, staffId, leaveType, status, startDate, endDate',
      calendarEvents: 'id, eventType, startDate, endDate, term',
      attendanceAlerts: 'id, studentId, staffId, alertType, severity, status, date',
      parentNotifications: 'id, studentId, guardianPhone, eventTrigger, channel, status, sentAt',
    });

    this.version(3).stores({
      schoolProfile: 'id',
      users: 'id, username, email, role, status, employeeNumber',
      roles: 'id, name, isBuiltIn',
      settings: 'id',
      auditLogs: 'id, timestamp, userId, action',
      syncQueue: 'id, entity, status, timestamp',
      notifications: 'id, read, timestamp, category',
      devices: 'id, userId, lastActive',
      students: 'id, studentId, admissionNumber, fullName, classGrade, stream, status, residenceType, nationalIdOrBirthCert',
      guardians: 'id, studentId, fullName, nationalId, phoneNumber',
      admissions: 'id, applicationNumber, applicantLastName, appliedGrade, status, submissionDate',
      studentDocuments: 'id, studentId, category, verificationStatus, uploadedAt',
      studentTimeline: 'id, studentId, eventType, timestamp',
      studentNotes: 'id, studentId, category, authorId, createdAt',
      classAssignmentLogs: 'id, studentId, newClass, timestamp',
      digitalIdCards: 'id, studentId, cardSerialNumber, status',
      studentAttendance: 'id, studentId, classGrade, stream, date, session, status, recordedBy',
      staffAttendance: 'id, staffId, date, status, recordedBy',
      visitors: 'id, visitorName, phone, date, status, badgeNumber',
      staffLeave: 'id, staffId, leaveType, status, startDate, endDate',
      calendarEvents: 'id, eventType, startDate, endDate, term',
      attendanceAlerts: 'id, studentId, staffId, alertType, severity, status, date',
      parentNotifications: 'id, studentId, guardianPhone, eventTrigger, channel, status, sentAt',
      feeStructures: 'id, academicYear, term, classGrade, status',
      studentFeeAccounts: 'id, studentId, admissionNumber, classGrade, academicYear, term, status',
      paymentRecords: 'id, receiptNumber, studentId, academicYear, term, paymentMethod, status, date, cashierId',
      scholarships: 'id, studentId, discountType, status, academicYear, term',
      budgets: 'id, category, academicYear, term, status',
      financialTransactions: 'id, transactionType, category, paymentMethod, approvalStatus, date',
      journalEntries: 'id, date, referenceNumber',
      mobileMoneyRequests: 'id, provider, phoneNumber, studentId, referenceNumber, status',
      paymentReminders: 'id, studentId, guardianPhone, channel, reminderType, status, scheduledDate',
    });

    this.version(4).stores({
      schoolProfile: 'id',
      users: 'id, username, email, role, status, employeeNumber',
      roles: 'id, name, isBuiltIn',
      settings: 'id',
      auditLogs: 'id, timestamp, userId, action',
      syncQueue: 'id, entity, status, timestamp',
      notifications: 'id, read, timestamp, category',
      devices: 'id, userId, lastActive',
      students: 'id, studentId, admissionNumber, fullName, classGrade, stream, status, residenceType, nationalIdOrBirthCert',
      guardians: 'id, studentId, fullName, nationalId, phoneNumber',
      admissions: 'id, applicationNumber, applicantLastName, appliedGrade, status, submissionDate',
      studentDocuments: 'id, studentId, category, verificationStatus, uploadedAt',
      studentTimeline: 'id, studentId, eventType, timestamp',
      studentNotes: 'id, studentId, category, authorId, createdAt',
      classAssignmentLogs: 'id, studentId, newClass, timestamp',
      digitalIdCards: 'id, studentId, cardSerialNumber, status',
      studentAttendance: 'id, studentId, classGrade, stream, date, session, status, recordedBy',
      staffAttendance: 'id, staffId, date, status, recordedBy',
      visitors: 'id, visitorName, phone, date, status, badgeNumber',
      staffLeave: 'id, staffId, leaveType, status, startDate, endDate',
      calendarEvents: 'id, eventType, startDate, endDate, term',
      attendanceAlerts: 'id, studentId, staffId, alertType, severity, status, date',
      parentNotifications: 'id, studentId, guardianPhone, eventTrigger, channel, status, sentAt',
      feeStructures: 'id, academicYear, term, classGrade, status',
      studentFeeAccounts: 'id, studentId, admissionNumber, classGrade, academicYear, term, status',
      paymentRecords: 'id, receiptNumber, studentId, academicYear, term, paymentMethod, status, date, cashierId',
      scholarships: 'id, studentId, discountType, status, academicYear, term',
      budgets: 'id, category, academicYear, term, status',
      financialTransactions: 'id, transactionType, category, paymentMethod, approvalStatus, date',
      journalEntries: 'id, date, referenceNumber',
      mobileMoneyRequests: 'id, provider, phoneNumber, studentId, referenceNumber, status',
      paymentReminders: 'id, studentId, guardianPhone, channel, reminderType, status, scheduledDate',
      // Vision 5 Academic Indexes
      academicYears: 'id, yearName, isCurrent',
      academicTerms: 'id, yearId, termName, isCurrent',
      schoolClasses: 'id, className, classCode, level',
      academicStreams: 'id, classId, className, streamName',
      academicDepartments: 'id, name, code',
      schoolHouses: 'id, houseName',
      academicClubs: 'id, clubName, category',
      subjects: 'id, subjectCode, subjectName, department, classification, isActive',
      timetableSlots: 'id, classGrade, stream, dayOfWeek, periodNumber, subjectId, teacherId',
      lessonPlans: 'id, subjectId, classGrade, stream, teacherId, lessonDate, status',
      homeworkAssignments: 'id, subjectId, classGrade, stream, teacherId, dueDate',
      homeworkSubmissions: 'id, homeworkId, studentId, classGrade, status',
      assessments: 'id, subjectId, classGrade, stream, academicYear, term, assessmentType, status',
      studentMarks: 'id, assessmentId, studentId, subjectId, classGrade, stream, recordedBy',
      examSchedules: 'id, academicYear, term, status',
      examSlots: 'id, examScheduleId, subjectId, classGrade, examDate',
      reportCards: 'id, studentId, classGrade, stream, academicYear, term, status, verificationHash',
      academicCertificates: 'id, certificateType, studentId, classGrade, verificationHash',
    });

    this.version(5).stores({
      schoolProfile: 'id',
      users: 'id, username, email, role, status, employeeNumber',
      roles: 'id, name, isBuiltIn',
      settings: 'id',
      auditLogs: 'id, timestamp, userId, action',
      syncQueue: 'id, entity, status, timestamp',
      notifications: 'id, read, timestamp, category',
      devices: 'id, userId, lastActive',
      students: 'id, studentId, admissionNumber, fullName, classGrade, stream, status, residenceType, nationalIdOrBirthCert',
      guardians: 'id, studentId, fullName, nationalId, phoneNumber',
      admissions: 'id, applicationNumber, applicantLastName, appliedGrade, status, submissionDate',
      studentDocuments: 'id, studentId, category, verificationStatus, uploadedAt',
      studentTimeline: 'id, studentId, eventType, timestamp',
      studentNotes: 'id, studentId, category, authorId, createdAt',
      classAssignmentLogs: 'id, studentId, newClass, timestamp',
      digitalIdCards: 'id, studentId, cardSerialNumber, status',
      studentAttendance: 'id, studentId, classGrade, stream, date, session, status, recordedBy',
      staffAttendance: 'id, staffId, date, status, recordedBy',
      visitors: 'id, visitorName, phone, date, status, badgeNumber',
      staffLeave: 'id, staffId, leaveType, status, startDate, endDate',
      calendarEvents: 'id, eventType, startDate, endDate, term',
      attendanceAlerts: 'id, studentId, staffId, alertType, severity, status, date',
      parentNotifications: 'id, studentId, guardianPhone, eventTrigger, channel, status, sentAt',
      feeStructures: 'id, academicYear, term, classGrade, status',
      studentFeeAccounts: 'id, studentId, admissionNumber, classGrade, academicYear, term, status',
      paymentRecords: 'id, receiptNumber, studentId, academicYear, term, paymentMethod, status, date, cashierId',
      scholarships: 'id, studentId, discountType, status, academicYear, term',
      budgets: 'id, category, academicYear, term, status',
      financialTransactions: 'id, transactionType, category, paymentMethod, approvalStatus, date',
      journalEntries: 'id, date, referenceNumber',
      mobileMoneyRequests: 'id, provider, phoneNumber, studentId, referenceNumber, status',
      paymentReminders: 'id, studentId, guardianPhone, channel, reminderType, status, scheduledDate',
      academicYears: 'id, yearName, isCurrent',
      academicTerms: 'id, yearId, termName, isCurrent',
      schoolClasses: 'id, className, classCode, level',
      academicStreams: 'id, classId, className, streamName',
      academicDepartments: 'id, name, code',
      schoolHouses: 'id, houseName',
      academicClubs: 'id, clubName, category',
      subjects: 'id, subjectCode, subjectName, department, classification, isActive',
      timetableSlots: 'id, classGrade, stream, dayOfWeek, periodNumber, subjectId, teacherId',
      lessonPlans: 'id, subjectId, classGrade, stream, teacherId, lessonDate, status',
      homeworkAssignments: 'id, subjectId, classGrade, stream, teacherId, dueDate',
      homeworkSubmissions: 'id, homeworkId, studentId, classGrade, status',
      assessments: 'id, subjectId, classGrade, stream, academicYear, term, assessmentType, status',
      studentMarks: 'id, assessmentId, studentId, subjectId, classGrade, stream, recordedBy',
      examSchedules: 'id, academicYear, term, status',
      examSlots: 'id, examScheduleId, subjectId, classGrade, examDate',
      reportCards: 'id, studentId, classGrade, stream, academicYear, term, status, verificationHash',
      academicCertificates: 'id, certificateType, studentId, classGrade, verificationHash',
      // Vision 6 Indexes
      directMessages: 'id, conversationId, senderId, createdAt',
      messageConversations: 'id, conversationType, isGroup, createdBy',
      smsLogs: 'id, recipientPhone, status, triggerType, sentAt',
      whatsAppLogs: 'id, recipientPhone, providerStatus, sentAt',
      announcements: 'id, category, audienceScope, classGrade, isPinned, createdAt',
      newsArticles: 'id, category, status, publishDate',
      schoolEvents: 'id, eventType, startDate, isPublic',
      eventRsvps: 'id, eventId, userId, status',
      parentTeacherMeetings: 'id, teacherId, date, isBooked, bookedByParentId, status',
      consentForms: 'id, category, classGrade, status',
      consentSubmissions: 'id, consentFormId, studentId, parentId, status',
      surveys: 'id, targetAudience, status',
      surveyResponses: 'id, surveyId, respondentId',
      helpDeskTickets: 'id, ticketNumber, requesterName, category, status, priority',
      communityGroups: 'id, category, isPrivate',
      groupPosts: 'id, groupId, authorId, createdAt',
      emergencyAlerts: 'id, emergencyType, severity, timestamp',
    });

    this.version(6).stores({
      schoolProfile: 'id',
      users: 'id, username, email, role, status, employeeNumber',
      roles: 'id, name, isBuiltIn',
      settings: 'id',
      auditLogs: 'id, timestamp, userId, action',
      syncQueue: 'id, entity, status, timestamp',
      notifications: 'id, read, timestamp, category',
      devices: 'id, userId, lastActive',
      students: 'id, studentId, admissionNumber, fullName, classGrade, stream, status, residenceType, nationalIdOrBirthCert',
      guardians: 'id, studentId, fullName, nationalId, phoneNumber',
      admissions: 'id, applicationNumber, applicantLastName, appliedGrade, status, submissionDate',
      studentDocuments: 'id, studentId, category, verificationStatus, uploadedAt',
      studentTimeline: 'id, studentId, eventType, timestamp',
      studentNotes: 'id, studentId, category, authorId, createdAt',
      classAssignmentLogs: 'id, studentId, newClass, timestamp',
      digitalIdCards: 'id, studentId, cardSerialNumber, status',
      studentAttendance: 'id, studentId, classGrade, stream, date, session, status, recordedBy',
      staffAttendance: 'id, staffId, date, status, recordedBy',
      visitors: 'id, visitorName, phone, date, status, badgeNumber',
      staffLeave: 'id, staffId, leaveType, status, startDate, endDate',
      calendarEvents: 'id, eventType, startDate, endDate, term',
      attendanceAlerts: 'id, studentId, staffId, alertType, severity, status, date',
      parentNotifications: 'id, studentId, guardianPhone, eventTrigger, channel, status, sentAt',
      feeStructures: 'id, academicYear, term, classGrade, status',
      studentFeeAccounts: 'id, studentId, admissionNumber, classGrade, academicYear, term, status',
      paymentRecords: 'id, receiptNumber, studentId, academicYear, term, paymentMethod, status, date, cashierId',
      scholarships: 'id, studentId, discountType, status, academicYear, term',
      budgets: 'id, category, academicYear, term, status',
      financialTransactions: 'id, transactionType, category, paymentMethod, approvalStatus, date',
      journalEntries: 'id, date, referenceNumber',
      mobileMoneyRequests: 'id, provider, phoneNumber, studentId, referenceNumber, status',
      paymentReminders: 'id, studentId, guardianPhone, channel, reminderType, status, scheduledDate',
      academicYears: 'id, yearName, isCurrent',
      academicTerms: 'id, yearId, termName, isCurrent',
      schoolClasses: 'id, className, classCode, level',
      academicStreams: 'id, classId, className, streamName',
      academicDepartments: 'id, name, code',
      schoolHouses: 'id, houseName',
      academicClubs: 'id, clubName, category',
      subjects: 'id, subjectCode, subjectName, department, classification, isActive',
      timetableSlots: 'id, classGrade, stream, dayOfWeek, periodNumber, subjectId, teacherId',
      lessonPlans: 'id, subjectId, classGrade, stream, teacherId, lessonDate, status',
      homeworkAssignments: 'id, subjectId, classGrade, stream, teacherId, dueDate',
      homeworkSubmissions: 'id, homeworkId, studentId, classGrade, status',
      assessments: 'id, subjectId, classGrade, stream, academicYear, term, assessmentType, status',
      studentMarks: 'id, assessmentId, studentId, subjectId, classGrade, stream, recordedBy',
      examSchedules: 'id, academicYear, term, status',
      examSlots: 'id, examScheduleId, subjectId, classGrade, examDate',
      reportCards: 'id, studentId, classGrade, stream, academicYear, term, status, verificationHash',
      academicCertificates: 'id, certificateType, studentId, classGrade, verificationHash',
      directMessages: 'id, conversationId, senderId, createdAt',
      messageConversations: 'id, conversationType, isGroup, createdBy',
      smsLogs: 'id, recipientPhone, status, triggerType, sentAt',
      whatsAppLogs: 'id, recipientPhone, providerStatus, sentAt',
      announcements: 'id, category, audienceScope, classGrade, isPinned, createdAt',
      newsArticles: 'id, category, status, publishDate',
      schoolEvents: 'id, eventType, startDate, isPublic',
      eventRsvps: 'id, eventId, userId, status',
      parentTeacherMeetings: 'id, teacherId, date, isBooked, bookedByParentId, status',
      consentForms: 'id, category, classGrade, status',
      consentSubmissions: 'id, consentFormId, studentId, parentId, status',
      surveys: 'id, targetAudience, status',
      surveyResponses: 'id, surveyId, respondentId',
      helpDeskTickets: 'id, ticketNumber, requesterName, category, status, priority',
      communityGroups: 'id, category, isPrivate',
      groupPosts: 'id, groupId, authorId, createdAt',
      emergencyAlerts: 'id, emergencyType, severity, timestamp',
      // Vision Digital Community Ecosystem Tables
      digitalGroups: 'id, schoolId, type, visibility, status, ownerId, classGrade, stream, subjectCode, createdAt',
      groupMemberships: 'id, schoolId, groupId, userId, groupRole, status, joinedAt',
      communityMessages: 'id, clientMessageId, schoolId, groupId, senderId, messageType, status, isPinned, createdAt',
      communityAnnouncements: 'id, schoolId, priority, targetScope, targetId, authorId, isPinned, createdAt',
      communityProjects: 'id, schoolId, groupId, leadTeacherId, status, createdAt',
      communityReports: 'id, schoolId, targetType, targetId, groupId, reportedByUserId, reasonCategory, status, createdAt',
      communityModerationActions: 'id, schoolId, reportId, targetType, targetId, actionType, moderatorId, timestamp',
    });

    this.version(7).stores({
      digitalGroups: 'id, schoolId, type, visibility, status, ownerId, classGrade, stream, subjectCode, createdAt',
      groupMemberships: 'id, schoolId, groupId, userId, groupRole, status, joinedAt',
      groupMembershipRequests: 'id, schoolId, groupId, studentId, status, requestedAt',
      groupInvitations: 'id, schoolId, groupId, invitedUserId, invitedByUserId, status, invitedAt',
      groupNotifications: 'id, schoolId, userId, groupId, type, read, createdAt',
      communityMessages: 'id, clientMessageId, schoolId, groupId, senderId, messageType, status, isPinned, createdAt',
      communityAnnouncements: 'id, schoolId, priority, targetScope, targetId, authorId, isPinned, createdAt',
      communityProjects: 'id, schoolId, groupId, leadTeacherId, status, createdAt',
      communityReports: 'id, schoolId, targetType, targetId, groupId, reportedByUserId, reasonCategory, status, createdAt',
      communityModerationActions: 'id, schoolId, reportId, targetType, targetId, actionType, moderatorId, timestamp',
    });

    this.version(8).stores({
      liveClasses: 'id, schoolId, classGrade, stream, subject, teacherId, scheduledDate, status, classType, meetingRoomId, createdAt',
      liveClassAttendance: 'id, schoolId, liveClassId, studentId, classGrade, stream, status, createdAt',
      liveClassMessages: 'id, schoolId, liveClassId, senderId, messageType, timestamp',
      liveQuestions: 'id, schoolId, liveClassId, studentId, status, timestamp',
      livePolls: 'id, schoolId, liveClassId, creatorId, isActive, createdAt',
      liveQuizzes: 'id, schoolId, liveClassId, status, createdAt',
      mediaItems: 'id, schoolId, mediaType, processingProfile, processingStatus, safetyStatus, uploadedByUserId, createdAt',
      mediaProcessingJobs: 'id, schoolId, mediaId, operation, status, createdAt',
    });
  }
}

export const db = new SchoolSoulDatabase();

// Default Built-in Roles Generator
export const DEFAULT_BUILTIN_ROLES: RoleDefinition[] = [
  {
    id: 'role-headteacher',
    name: 'Headteacher',
    description: 'Executive Lead & Super Administrator with full system control',
    isBuiltIn: true,
    permissions: [
      {
        module: 'School Profile',
        actions: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export', 'Manage Users', 'Manage Settings', 'Manage School', 'View Reports', 'Manage Backup', 'Manage Audit'],
      },
      {
        module: 'User Management',
        actions: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export', 'Manage Users'],
      },
      {
        module: 'Roles & Permissions',
        actions: ['View', 'Create', 'Edit', 'Delete', 'Manage Settings'],
      },
      {
        module: 'Dashboard',
        actions: ['View', 'View Reports', 'Export'],
      },
      {
        module: 'Audit System',
        actions: ['View', 'Export', 'Manage Audit'],
      },
      {
        module: 'Backup & Restore',
        actions: ['View', 'Export', 'Manage Backup'],
      },
      {
        module: 'System Health',
        actions: ['View', 'Manage Settings'],
      },
      {
        module: 'School Settings',
        actions: ['View', 'Edit', 'Manage Settings'],
      },
      {
        module: 'Notifications',
        actions: ['View', 'Create'],
      },
      {
        module: 'Student Passport',
        actions: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export', 'View Reports'],
      },
      {
        module: 'Admissions Engine',
        actions: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export', 'View Reports'],
      },
      {
        module: 'Digital Community',
        actions: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export', 'Manage Users', 'Manage Settings', 'Manage School', 'View Reports', 'Manage Audit'],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-deputy-headteacher',
    name: 'Deputy Headteacher',
    description: 'Academic & Operations Lead',
    isBuiltIn: true,
    permissions: [
      { module: 'School Profile', actions: ['View', 'View Reports'] },
      { module: 'User Management', actions: ['View', 'Create', 'Edit', 'View Reports'] },
      { module: 'Dashboard', actions: ['View', 'View Reports', 'Export'] },
      { module: 'Audit System', actions: ['View'] },
      { module: 'Notifications', actions: ['View', 'Create'] },
      { module: 'Student Passport', actions: ['View', 'Create', 'Edit', 'Approve', 'Export', 'View Reports'] },
      { module: 'Admissions Engine', actions: ['View', 'Create', 'Edit', 'Approve', 'Export', 'View Reports'] },
      { module: 'Digital Community', actions: ['View', 'Create', 'Edit', 'Approve', 'View Reports'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-administrator',
    name: 'Administrator',
    description: 'System Operations & User Administrator',
    isBuiltIn: true,
    permissions: [
      { module: 'School Profile', actions: ['View', 'Edit', 'Manage School'] },
      { module: 'User Management', actions: ['View', 'Create', 'Edit', 'Delete', 'Manage Users', 'Export'] },
      { module: 'Roles & Permissions', actions: ['View', 'Edit'] },
      { module: 'Dashboard', actions: ['View', 'View Reports'] },
      { module: 'Audit System', actions: ['View', 'Export'] },
      { module: 'Backup & Restore', actions: ['View', 'Export', 'Manage Backup'] },
      { module: 'System Health', actions: ['View'] },
      { module: 'School Settings', actions: ['View', 'Edit', 'Manage Settings'] },
      { module: 'Notifications', actions: ['View', 'Create'] },
      { module: 'Student Passport', actions: ['View', 'Create', 'Edit', 'Delete', 'Export'] },
      { module: 'Admissions Engine', actions: ['View', 'Create', 'Edit', 'Delete', 'Export'] },
      { module: 'Digital Community', actions: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export', 'Manage Users', 'Manage Settings'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-teacher',
    name: 'Teacher',
    description: 'Classroom Educator & Student Academic Evaluator',
    isBuiltIn: true,
    permissions: [
      { module: 'Dashboard', actions: ['View'] },
      { module: 'User Management', actions: ['View'] },
      { module: 'Notifications', actions: ['View'] },
      { module: 'Student Passport', actions: ['View', 'Edit'] },
      { module: 'Digital Community', actions: ['View', 'Create', 'Edit', 'Approve'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-bursar',
    name: 'Bursar',
    description: 'Financial & School Accounts Officer',
    isBuiltIn: true,
    permissions: [
      { module: 'Dashboard', actions: ['View', 'View Reports'] },
      { module: 'User Management', actions: ['View'] },
      { module: 'Notifications', actions: ['View', 'Create'] },
      { module: 'Student Passport', actions: ['View', 'Export'] },
      { module: 'Admissions Engine', actions: ['View'] },
      { module: 'Fee Structure', actions: ['View', 'Create', 'Edit', 'Export'] },
      { module: 'Fee Accounts', actions: ['View', 'Create', 'Edit', 'Export', 'View Reports'] },
      { module: 'Payment Engine', actions: ['View', 'Create', 'Edit', 'Approve', 'Export'] },
      { module: 'Mobile Money', actions: ['View', 'Create', 'Approve'] },
      { module: 'Receipt Engine', actions: ['View', 'Create', 'Export'] },
      { module: 'Scholarships & Discounts', actions: ['View', 'Create', 'Edit', 'Approve'] },
      { module: 'Budget Management', actions: ['View', 'Create', 'Edit', 'Export'] },
      { module: 'Income & Expenditure', actions: ['View', 'Create', 'Edit', 'Approve', 'Export'] },
      { module: 'Cashbook & Ledger', actions: ['View', 'Export', 'View Reports'] },
      { module: 'Financial Reporting', actions: ['View', 'Export', 'View Reports'] },
      { module: 'Financial Security', actions: ['View', 'Approve'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-registrar',
    name: 'Registrar',
    description: 'Admissions & Academic Records Officer',
    isBuiltIn: true,
    permissions: [
      { module: 'Dashboard', actions: ['View'] },
      { module: 'User Management', actions: ['View', 'Create', 'Edit'] },
      { module: 'Notifications', actions: ['View'] },
      { module: 'Student Passport', actions: ['View', 'Create', 'Edit', 'Approve', 'Export'] },
      { module: 'Admissions Engine', actions: ['View', 'Create', 'Edit', 'Approve', 'Export'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-librarian',
    name: 'Librarian',
    description: 'Library Resources Manager',
    isBuiltIn: true,
    permissions: [
      { module: 'Dashboard', actions: ['View'] },
      { module: 'Notifications', actions: ['View'] },
      { module: 'Student Passport', actions: ['View'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-ict-admin',
    name: 'ICT Administrator',
    description: 'Technical Infrastructure, Security & Database Operations',
    isBuiltIn: true,
    permissions: [
      { module: 'School Profile', actions: ['View', 'Edit'] },
      { module: 'User Management', actions: ['View', 'Create', 'Edit', 'Delete', 'Manage Users'] },
      { module: 'Roles & Permissions', actions: ['View', 'Create', 'Edit', 'Delete'] },
      { module: 'Dashboard', actions: ['View', 'View Reports'] },
      { module: 'Audit System', actions: ['View', 'Export', 'Manage Audit'] },
      { module: 'Backup & Restore', actions: ['View', 'Export', 'Manage Backup'] },
      { module: 'System Health', actions: ['View', 'Manage Settings'] },
      { module: 'School Settings', actions: ['View', 'Edit', 'Manage Settings'] },
      { module: 'Notifications', actions: ['View', 'Create'] },
      { module: 'Student Passport', actions: ['View', 'Create', 'Edit', 'Delete', 'Export'] },
      { module: 'Admissions Engine', actions: ['View', 'Create', 'Edit', 'Delete', 'Export'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-nurse',
    name: 'School Nurse',
    description: 'Student & Staff Health Officer',
    isBuiltIn: true,
    permissions: [
      { module: 'Dashboard', actions: ['View'] },
      { module: 'Notifications', actions: ['View'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-parent',
    name: 'Parent',
    description: 'Parent / Guardian View',
    isBuiltIn: true,
    permissions: [
      { module: 'Dashboard', actions: ['View'] },
      { module: 'Notifications', actions: ['View'] },
      { module: 'Digital Community', actions: ['View'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-student',
    name: 'Student',
    description: 'Student View',
    isBuiltIn: true,
    permissions: [
      { module: 'Dashboard', actions: ['View'] },
      { module: 'Notifications', actions: ['View'] },
      { module: 'Digital Community', actions: ['View', 'Create'] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  id: 'system-settings-default',
  theme: 'light',
  primaryColor: '#0052cc',
  security: {
    inactivityTimeoutMinutes: 15,
    maxFailedLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    requireStrongPassword: true,
    passwordMinLength: 8,
  },
  notifications: {
    inApp: true,
    smsEnabled: false,
    emailEnabled: false,
    whatsAppEnabled: false,
    pushEnabled: true,
  },
  backupAutoScheduleDays: 7,
};
