// ============================================================================
// SCHOOLSOUL GLOBAL EDUCATION FRAMEWORK — CORE DATA MODELS & TYPES
// Multi-Country, Multi-Curriculum, Universal Education Architecture
// ============================================================================

export type SupportedCountryCode = 'UG' | 'KE' | 'TZ' | 'RW' | 'GH' | 'NG' | 'ZA' | 'INTL';

export type CurriculumType =
  | 'COMPETENCY_BASED'
  | 'STANDARDS_BASED'
  | 'TRADITIONAL_SUBJECT_BASED'
  | 'CAMBRIDGE_INTERNATIONAL'
  | 'INTERNATIONAL_BACCALAUREATE'
  | 'AMERICAN_K12'
  | 'TECHNICAL_VOCATIONAL'
  | 'CUSTOM_INSTITUTIONAL';

export type AcademicPeriodType = 'TERMS_3' | 'SEMESTERS_2' | 'TRIMESTERS_3' | 'QUARTERS_4' | 'CUSTOM';

export type GradingScaleType =
  | 'COMPETENCY_LEVELS_4'      // EE, ME, AE, BE (e.g. Kenya CBC)
  | 'COMPETENCY_DESCRIPTORS_3'  // Outstanding, Moderate, Basic (e.g. Uganda NCDC)
  | 'NUMERIC_AGGREGATES_9'      // D1, D2, C3, C4, C5, C6, P7, P8, F9 (e.g. Uganda UNEB)
  | 'LETTER_GRADES_12'          // A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E (e.g. Kenya KCSE)
  | 'LETTER_GRADES_5'           // A, B, C, D, F (e.g. Tanzania NECTA)
  | 'STANINE_GRADES_9'          // Grade 1-9 (e.g. WAEC Ghana)
  | 'PERCENTAGE_LETTER_9'       // A1, B2, B3, C4, C5, C6, D7, E8, F9 (e.g. Nigeria WAEC/NECO)
  | 'RATING_SCALE_7'            // Level 7-1 (e.g. South Africa DBE CAPS)
  | 'CAMBRIDGE_IGCSE'           // A*, A, B, C, D, E, F, G, U
  | 'IB_POINTS_7'               // 7, 6, 5, 4, 3, 2, 1
  | 'GPA_4_POINT'               // 4.0, 3.7, 3.3, 3.0, etc.
  | 'CUSTOM_PERCENTAGE';

export interface GradingScaleEntry {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  points?: number;
  descriptor: string;
  classification?: string; // e.g. 'Distinction', 'Credit', 'Pass', 'Fail'
  colorHex?: string;
  isPassingGrade: boolean;
}

export interface GradingSystemConfig {
  id: string;
  name: string;
  scaleType: GradingScaleType;
  description: string;
  scales: GradingScaleEntry[];
  continuousAssessmentWeightPercent: number; // e.g., 30% or 40%
  examinationWeightPercent: number;          // e.g., 70% or 60%
  supportsRubrics: boolean;
  divisionSystem?: {
    enabled: boolean;
    name: string;
    rules: { division: string; minPoints: number; maxPoints: number; description: string }[];
  };
}

export interface EducationLevelConfig {
  id: string;
  levelKey: string; // e.g. 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'
  displayName: string;
  localName?: string;
  typicalAgeRange: string;
  sortOrder: number;
  grades: {
    gradeKey: string;
    displayName: string; // e.g. 'Primary 1', 'Grade 7', 'Form 1', 'Basic 1'
    code: string;        // e.g. 'P1', 'G7', 'F1', 'B1'
    standardAge: number;
  }[];
}

export interface CurriculumDefinition {
  id: string;
  code: string;
  name: string;
  countryCode: SupportedCountryCode;
  type: CurriculumType;
  authority: string;
  description: string;
  isNationalStandard: boolean;
  version: string;
  effectiveYear: number;
  applicableLevels: string[]; // references EducationLevelConfig.id
  subjects: {
    code: string;
    name: string;
    category: 'Core' | 'Elective' | 'Vocational' | 'Co-Curricular';
    strandsOrTopics?: string[];
    isCompulsory: boolean;
  }[];
}

export interface TermDefinition {
  termNumber: number;
  name: string; // e.g. 'Term I', 'Semester 1', 'Muhula wa Kwanza'
  defaultStartMonth: string;
  defaultEndMonth: string;
  weeksDuration: number;
}

export interface AcademicCalendarConfig {
  periodType: AcademicPeriodType;
  termsCount: number;
  terms: TermDefinition[];
  academicYearStartMonth: 'January' | 'September' | 'Custom';
  academicYearFormat: 'SINGLE_YEAR' | 'SPLIT_YEAR'; // '2026' vs '2026/2027'
  defaultHolidaysWeeks: number;
}

export interface TerminologyConfig {
  subjectLabel: string;          // 'Subject' | 'Learning Area' | 'Course' | 'Somo'
  subjectsLabelPlural: string;    // 'Subjects' | 'Learning Areas' | 'Courses' | 'Masomo'
  gradeLabel: string;            // 'Class' | 'Grade' | 'Standard' | 'Form' | 'Darasa'
  termLabel: string;             // 'Term' | 'Semester' | 'Quarter' | 'Muhula'
  headOfSchoolLabel: string;     // 'Headteacher' | 'Principal' | 'Headmaster' | 'Mkuu wa Shule'
  deputyHeadLabel: string;       // 'Deputy Headteacher' | 'Vice Principal' | 'Makamu Mkuu wa Shule'
  directorOfStudiesLabel: string;// 'Director of Studies (DOS)' | 'Dean of Studies' | 'HOD Academics'
  reportCardLabel: string;       // 'End of Term Report Card' | 'Progress Report' | 'Taarifa ya Maendeleo'
  nationalExamLabel: string;     // 'National Exam' | 'KNEC Assessment' | 'WAEC Examination' | 'NECTA Exam'
  bursarLabel: string;           // 'Bursar' | 'Finance Officer' | 'Accountant' | 'Mhasibu'
}

export interface CurrencyConfig {
  code: string;          // 'UGX', 'KES', 'TZS', 'RWF', 'GHS', 'NGN', 'ZAR', 'USD'
  symbol: string;        // 'USh', 'KSh', 'TSh', 'FRw', 'GH₵', '₦', 'R', '$'
  name: string;          // 'Ugandan Shilling', 'Kenyan Shilling', etc.
  decimals: number;      // 0 or 2
  formatPattern: string; // '#,##0' or '#,##0.00'
  symbolPosition: 'PREFIX' | 'SUFFIX';
}

export interface PaymentGatewayConfig {
  providerId: string;
  displayName: string;
  type: 'MOBILE_MONEY' | 'CARD_BANK' | 'INSTANT_EFT' | 'HYBRID_GATEWAY' | 'PESAPAL';
  isPopularInCountry: boolean;
  supportedMethods: string[];
  integrationStatus: 'ACTIVE' | 'SANDBOX' | 'AVAILABLE';
  currencyCode: string;
}

export interface GovernmentReportingConfig {
  adapterId: string;
  systemName: string; // e.g. 'Uganda MoES EMIS', 'Kenya NEMIS', 'Tanzania BEMIS', 'SA-SAMS'
  authorityName: string;
  supportedFormats: ('JSON' | 'CSV' | 'XML' | 'PDF')[];
  samplePayloadSummary: string;
  complianceVersion: string;
}

export interface DataPrivacyPolicyConfig {
  legislationName: string; // e.g. 'Data Protection and Privacy Act (Uganda)', 'Kenya Data Protection Act 2019', 'POPIA (South Africa)', 'NDPR (Nigeria)'
  dataResidencyDefaultRegion: string;
  parentalConsentAgeThreshold: number;
  dataRetentionYears: number;
  allowCrossBorderAnonymizedData: boolean;
  studentPIIRestrictionLevel: 'STRICT' | 'STANDARD' | 'REGIONAL';
}

export interface CountryEducationFramework {
  countryCode: SupportedCountryCode;
  countryName: string;
  officialFlagEmoji: string;
  nationalEducationAuthority: string;
  defaultLanguage: string;
  supportedLanguages: { code: string; name: string; isOfficial: boolean }[];
  timeZone: string;
  currency: CurrencyConfig;
  calendar: AcademicCalendarConfig;
  educationLevels: EducationLevelConfig[];
  availableCurricula: CurriculumDefinition[];
  gradingSystems: GradingSystemConfig[];
  terminology: TerminologyConfig;
  paymentGateways: PaymentGatewayConfig[];
  governmentReporting: GovernmentReportingConfig[];
  dataPrivacyPolicy: DataPrivacyPolicyConfig;
  packageVersion: string;
  lastUpdated: string;
}

// School-Level Activated Configuration
export interface SchoolEducationConfig {
  schoolId: string;
  countryCode: SupportedCountryCode;
  educationFrameworkVersion: string;
  primaryCurriculumId: string;
  secondaryCurriculaIds: string[]; // For multi-curriculum schools (e.g. National + Cambridge)
  activeGradingSystemId: string;
  activeLevels: string[]; // Active level IDs
  customClassLabels: Record<string, string>; // e.g. { 'G7': 'Year 7 Oak' }
  academicYear: string;
  currentTermNumber: number;
  currencyCode: string;
  activePaymentGatewayIds: string[];
  customTerminology?: Partial<TerminologyConfig>;
  allowCrossBorderTransfer: boolean;
  organizationId?: string; // Optional multi-school organization
  updatedAt: string;
  updatedBy: string;
}

// Multi-School Organization / Educational Network
export interface MultiSchoolOrganization {
  id: string;
  name: string;
  code: string;
  headquartersCountry: SupportedCountryCode;
  memberSchools: {
    schoolId: string;
    schoolName: string;
    countryCode: SupportedCountryCode;
    studentCount: number;
    joinedDate: string;
  }[];
  centralAdminUsers: string[];
  aggregateAnalyticsEnabled: boolean;
  createdAt: string;
}

// Cross-Border Student Transfer Record
export interface CrossCountryTransferRecord {
  id: string;
  studentId: string;
  studentCandidateCode: string;
  studentFullName: string;
  sourceCountry: SupportedCountryCode;
  sourceSchoolId: string;
  sourceSchoolName: string;
  sourceCurriculum: string;
  sourceGradeLevel: string;
  destinationCountry: SupportedCountryCode;
  destinationSchoolId: string;
  destinationSchoolName: string;
  destinationCurriculum: string;
  recommendedGradeLevel: string;
  verifiedCompetenciesCount: number;
  verifiedProjectsCount: number;
  academicHistoryRecordsCount: number;
  gradeEquivalencyNotes: string;
  transferStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  sourceSchoolReleaseVerified: boolean;
  destinationSchoolAccepted: boolean;
  parentConsentVerified: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// Country Simulation Test Result
export interface CountrySimulationTestResult {
  countryCode: SupportedCountryCode;
  countryName: string;
  passed: boolean;
  checks: {
    checkName: string;
    passed: boolean;
    details: string;
  }[];
  timestamp: string;
}
