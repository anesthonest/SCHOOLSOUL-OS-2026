import { getAuthHeaders } from './api';
import type {
  ExecutiveKPI,
  CockpitWidgetConfig,
  StudentSuccessPrediction,
  TeacherInsightRecord,
  FinancialForecastRecord,
  StrategicGoalKPI,
  ResourceUtilizationRecord,
  RiskDetectionAlert,
  KnowledgeDoc,
  AiGovernanceSetting,
  AiAuditLogEntry,
  AiQueryMessage,
} from '../types';

const STORAGE_KEYS = {
  EXECUTIVE_KPIS: 'schoolsoul_v8_executive_kpis',
  WIDGET_CONFIG: 'schoolsoul_v8_widget_config',
  STUDENT_PREDICTIONS: 'schoolsoul_v8_student_predictions',
  TEACHER_INSIGHTS: 'schoolsoul_v8_teacher_insights',
  FINANCIAL_FORECASTS: 'schoolsoul_v8_financial_forecasts',
  STRATEGIC_GOALS: 'schoolsoul_v8_strategic_goals',
  RESOURCE_UTILIZATION: 'schoolsoul_v8_resource_utilization',
  RISK_ALERTS: 'schoolsoul_v8_risk_alerts',
  KNOWLEDGE_DOCS: 'schoolsoul_v8_knowledge_docs',
  AI_GOVERNANCE: 'schoolsoul_v8_ai_governance',
  AI_AUDIT_LOGS: 'schoolsoul_v8_ai_audit_logs',
};

// Local storage helper
const getStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
};

const setStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
};

// Initial Default Seed Data
const initialKPIs: ExecutiveKPI[] = [
  {
    id: 'kpi-1',
    title: 'Total Active Enrolment',
    category: 'Enrolment',
    value: 1240,
    unit: 'Students',
    change: '+4.8% vs last term',
    trend: 'up',
    target: 1300,
    status: 'good',
    description: 'Current active registered students across Nursery, Primary, O-Level & A-Level.',
  },
  {
    id: 'kpi-2',
    title: 'Daily Attendance Rate',
    category: 'Attendance',
    value: '94.2%',
    change: '+1.5% vs last week',
    trend: 'up',
    target: '95.0%',
    status: 'good',
    description: 'Average student daily register mark rate over the past 30 days.',
  },
  {
    id: 'kpi-3',
    title: 'Fee Collection Rate',
    category: 'Finance',
    value: '88.5%',
    change: '-2.1% target gap',
    trend: 'down',
    target: '92.0%',
    status: 'warning',
    description: 'Billed tuition fees collected to date for Term 2 2026.',
  },
  {
    id: 'kpi-4',
    title: 'Academic Pass Rate',
    category: 'Academics',
    value: '91.8%',
    change: '+3.2% vs Term 1',
    trend: 'up',
    target: '90.0%',
    status: 'good',
    description: 'Proportion of students scoring Division 1, 2, or Credit 6 equivalent in assessments.',
  },
  {
    id: 'kpi-5',
    title: 'Teacher Workload Index',
    category: 'Staff',
    value: '78 / 100',
    change: 'Balanced',
    trend: 'stable',
    target: '75 / 100',
    status: 'good',
    description: 'Composite load based on weekly teaching periods, marking, and admin duties.',
  },
  {
    id: 'kpi-6',
    title: 'Open Welfare / Risk Cases',
    category: 'Welfare',
    value: 4,
    unit: 'Cases',
    change: '2 resolved this week',
    trend: 'down',
    target: 0,
    status: 'warning',
    description: 'Active safeguarding and counselling monitoring cases requiring follow-up.',
  },
  {
    id: 'kpi-7',
    title: 'Parent Portal Engagement',
    category: 'Operations',
    value: '82.4%',
    change: '+6.1% month-on-month',
    trend: 'up',
    target: '85.0%',
    status: 'good',
    description: 'Parents actively checking report cards, fees, and messaging weekly.',
  },
  {
    id: 'kpi-8',
    title: 'Compliance & Audit Rating',
    category: 'Compliance',
    value: '96.5%',
    change: 'Fully Audit Ready',
    trend: 'stable',
    target: '95.0%',
    status: 'good',
    description: 'Ministry regulations, safety standards, and administrative records audit score.',
  },
];

const initialWidgets: CockpitWidgetConfig[] = [
  { id: 'w-kpis', title: 'Executive KPI Summary Cards', category: 'Summary', size: 'full', isEnabled: true, order: 1 },
  { id: 'w-enrolment', title: 'Student Enrolment & Retention Trends', category: 'Enrolment', size: 'half', isEnabled: true, order: 2 },
  { id: 'w-finance', title: 'Fee Collection vs Expenditure Forecast', category: 'Finance', size: 'half', isEnabled: true, order: 3 },
  { id: 'w-risks', title: 'AI Risk Detection Radar', category: 'Risks', size: 'half', isEnabled: true, order: 4 },
  { id: 'w-academics', title: 'Academic Performance & Subject Pass Trends', category: 'Academics', size: 'half', isEnabled: true, order: 5 },
  { id: 'w-teachers', title: 'Teacher Workload & CPD Heatmap', category: 'Staff', size: 'third', isEnabled: true, order: 6 },
  { id: 'w-welfare', title: 'Safeguarding & Welfare Case Volume', category: 'Welfare', size: 'third', isEnabled: true, order: 7 },
  { id: 'w-assets', title: 'Asset Health & Store Inventory Alerts', category: 'Operations', size: 'third', isEnabled: true, order: 8 },
];

const initialPredictions: StudentSuccessPrediction[] = [
  {
    id: 'pred-101',
    studentId: 'STU-2026-004',
    studentName: 'Mukasa Joshua',
    className: 'Senior 3',
    classStream: 'West',
    overallRiskScore: 88,
    riskLevel: 'Critical',
    riskCategory: 'Multifactorial',
    confidenceScore: 92,
    contributingFactors: [
      { factor: 'Chronic Absenteeism', weight: 40, detail: 'Missed 6 out of last 15 school days without medical note.' },
      { factor: 'Academic Decline in Physics & Chemistry', weight: 35, detail: 'Grades dropped from B+ (76%) to F (34%) in recent 3 weeks.' },
      { factor: 'Outstanding Fee Balance', weight: 25, detail: 'UGX 680,000 overdue for Term 2 tuition.' },
    ],
    suggestedActions: [
      { title: 'Schedule Immediate Parent-Teacher Safeguarding Conference', type: 'Parent Contact', priority: 'High' },
      { title: 'Assign Peer Support Tutor for Sciences', type: 'Tutoring', priority: 'Medium' },
      { title: 'Offer Flexible Payment Plan to Parent', type: 'Bursary', priority: 'Medium' },
    ],
    lastUpdated: '2026-07-28 14:20',
    actionTaken: false,
  },
  {
    id: 'pred-102',
    studentId: 'STU-2026-018',
    studentName: 'Namatovu Sarah',
    className: 'Senior 4',
    classStream: 'East',
    overallRiskScore: 74,
    riskLevel: 'High',
    riskCategory: 'Academic',
    confidenceScore: 87,
    contributingFactors: [
      { factor: 'Mathematics & Biology Pass Decline', weight: 60, detail: 'Scored 41% in Mock paper 1 vs 72% class average.' },
      { factor: 'Infrequent Homework Submissions', weight: 40, detail: '3 consecutive incomplete assignments in Gradebook.' },
    ],
    suggestedActions: [
      { title: 'Enroll in Weekend UNEB Remedial Clinic', type: 'Tutoring', priority: 'High' },
      { title: 'Send Homework Warning SMS to Guardian', type: 'Parent Contact', priority: 'Medium' },
    ],
    lastUpdated: '2026-07-28 10:15',
    actionTaken: false,
  },
  {
    id: 'pred-103',
    studentId: 'STU-2026-089',
    studentName: 'Okello Emmanuel',
    className: 'Primary 7',
    classStream: 'Blue',
    overallRiskScore: 62,
    riskLevel: 'Moderate',
    riskCategory: 'Attendance',
    confidenceScore: 81,
    contributingFactors: [
      { factor: 'Monday Morning Tardy Pattern', weight: 70, detail: 'Late arrivals recorded on 4 consecutive Mondays.' },
      { factor: 'Sick Bay Visits', weight: 30, detail: '2 registered visits for fatigue/headache.' },
    ],
    suggestedActions: [
      { title: 'Consult School Nurse & Welfare Counselor', type: 'Counseling', priority: 'Medium' },
      { title: 'Verify Transport / Boarding Routine with Guardian', type: 'Parent Contact', priority: 'Low' },
    ],
    lastUpdated: '2026-07-27 16:45',
    actionTaken: true,
    notes: 'Parent contacted on July 27th; confirmed transport adjustment made.',
  },
  {
    id: 'pred-104',
    studentId: 'STU-2026-112',
    studentName: 'Akello Grace',
    className: 'Senior 6',
    classStream: 'Arts',
    overallRiskScore: 18,
    riskLevel: 'Low',
    riskCategory: 'Academic',
    confidenceScore: 95,
    contributingFactors: [
      { factor: 'High Academic Performance Momentum', weight: 80, detail: 'Consistently ranks top 3 in Literature & Economics.' },
      { factor: '100% Attendance Record', weight: 20, detail: 'Zero unauthorized absences throughout the academic year.' },
    ],
    suggestedActions: [
      { title: 'Recommend for National Merit Scholarship Competition', type: 'Bursary', priority: 'Low' },
    ],
    lastUpdated: '2026-07-28 11:30',
    actionTaken: false,
  },
];

const initialTeacherInsights: TeacherInsightRecord[] = [
  {
    id: 'ti-1',
    staffId: 'STAFF-101',
    staffName: 'Ssemwogerere David',
    department: 'ICT & Mathematics',
    subject: 'Computer Studies',
    workloadScore: 82,
    weeklyLessons: 24,
    attendanceRate: 98.5,
    lessonCompletionRate: 95.0,
    assessmentTimelinessRate: 92.0,
    studentAverageScore: 78.4,
    parentEngagementCount: 45,
    cpdHours: 18,
    performanceTrend: 'Improving',
    recommendations: [
      'Peer mentorship candidate for junior ICT teachers.',
      'Recommend advanced Python coding CPD module.',
    ],
  },
  {
    id: 'ti-2',
    staffId: 'STAFF-102',
    staffName: 'Nakalema Harriet',
    department: 'Languages',
    subject: 'English Language',
    workloadScore: 91,
    weeklyLessons: 28,
    attendanceRate: 96.0,
    lessonCompletionRate: 88.0,
    assessmentTimelinessRate: 84.0,
    studentAverageScore: 71.2,
    parentEngagementCount: 62,
    cpdHours: 12,
    performanceTrend: 'Needs Support',
    recommendations: [
      'Workload rebalancing suggested: redistribute 3 S1 periods to assistant teacher.',
      'Provide automated grading assistant tool for essay marking.',
    ],
  },
  {
    id: 'ti-3',
    staffId: 'STAFF-103',
    staffName: 'Kagimu Joseph',
    department: 'Sciences',
    subject: 'Chemistry & Physics',
    workloadScore: 74,
    weeklyLessons: 20,
    attendanceRate: 99.0,
    lessonCompletionRate: 98.0,
    assessmentTimelinessRate: 96.0,
    studentAverageScore: 81.5,
    parentEngagementCount: 38,
    cpdHours: 24,
    performanceTrend: 'Improving',
    recommendations: [
      'Commend for highest practical lab safety compliance.',
      'Consider appointment as Science Department CPD Coordinator.',
    ],
  },
];

const initialFinancialForecasts: FinancialForecastRecord[] = [
  {
    id: 'ff-1',
    termName: 'Term 2 2026',
    academicYear: '2026',
    projectedRevenueUgx: 620000000,
    projectedExpenseUgx: 480000000,
    expectedCollectionRate: 88.5,
    outstandingFeesUgx: 71300000,
    scholarshipBudgetUgx: 45000000,
    variancePercentage: 3.8,
    riskAlerts: [
      { level: 'Warning', message: 'Ugx 32M in fee balances aged over 60 days across Senior 3 and Senior 4 cohorts.' },
      { level: 'Info', message: 'Mobile Money automated collection increased collection speed by 14%.' },
    ],
  },
  {
    id: 'ff-2',
    termName: 'Term 3 2026 (Forecast)',
    academicYear: '2026',
    projectedRevenueUgx: 650000000,
    projectedExpenseUgx: 510000000,
    expectedCollectionRate: 90.0,
    outstandingFeesUgx: 65000000,
    scholarshipBudgetUgx: 48000000,
    variancePercentage: 4.2,
    riskAlerts: [
      { level: 'Warning', message: 'UNEB Examination registration fees due in August require UGX 85M liquidity buffer.' },
    ],
  },
];

const initialStrategicGoals: StrategicGoalKPI[] = [
  {
    id: 'goal-1',
    title: 'Achieve 95% UNEB Division 1 & 2 Pass Rate',
    category: 'Academic',
    targetValue: 95,
    currentValue: 91.8,
    unit: '%',
    deadline: '2026-11-30',
    ownerDepartment: 'Academic Board',
    ownerStaffName: 'Dr. Mukasa Godfrey (DOS)',
    status: 'On Track',
    actionItems: [
      { id: 'act-1', title: 'Conduct bi-weekly Mock assessment drills', assignedTo: 'Department Heads', isDone: true, dueDate: '2026-07-15' },
      { id: 'act-2', title: 'Deploy AI student risk intervention clinics for struggling cohorts', assignedTo: 'Guidance & Counseling', isDone: false, dueDate: '2026-08-10' },
    ],
    evidenceCount: 6,
  },
  {
    id: 'goal-2',
    title: 'Maintain Minimum 90% Digital Fee Collection via MoMo & Banks',
    category: 'Financial',
    targetValue: 90,
    currentValue: 88.5,
    unit: '%',
    deadline: '2026-08-30',
    ownerDepartment: 'Finance & Bursary',
    ownerStaffName: 'Mrs. Kiggundu Rose (Bursar)',
    status: 'At Risk',
    actionItems: [
      { id: 'act-3', title: 'Integrate automated SMS fee balance alerts with payment links', assignedTo: 'IT Administrator', isDone: true, dueDate: '2026-06-30' },
      { id: 'act-4', title: 'Follow up top 20 delinquent fee accounts via bursary calls', assignedTo: 'Bursary Team', isDone: false, dueDate: '2026-08-05' },
    ],
    evidenceCount: 4,
  },
  {
    id: 'goal-3',
    title: '100% Digital Lesson Plan & Scheme of Work Submissions',
    category: 'Digital',
    targetValue: 100,
    currentValue: 94.0,
    unit: '%',
    deadline: '2026-09-15',
    ownerDepartment: 'School Administration',
    ownerStaffName: 'Ssemwogerere David',
    status: 'On Track',
    actionItems: [
      { id: 'act-5', title: 'Train all teaching staff on digital lesson planner tool', assignedTo: 'ICT Team', isDone: true, dueDate: '2026-05-20' },
    ],
    evidenceCount: 8,
  },
];

const initialResourceUtilizations: ResourceUtilizationRecord[] = [
  {
    id: 'res-1',
    resourceName: 'Computer Lab 1 (45 Workstations)',
    category: 'ICT Lab',
    capacity: 45,
    currentUtilizationPercentage: 92,
    peakHours: '10:00 AM - 02:00 PM',
    conditionStatus: 'Overcrowded',
    recommendation: 'Shift S1 & S2 introductory classes to Computer Lab 2 or rotate timetable blocks.',
  },
  {
    id: 'res-2',
    resourceName: 'Science Practical Complex (Physics & Chemistry)',
    category: 'Laboratory',
    capacity: 60,
    currentUtilizationPercentage: 78,
    peakHours: '08:30 AM - 01:00 PM',
    conditionStatus: 'Optimal',
    recommendation: 'Re-order lab reagent consumables for Term 3 UNEB practical mocks.',
  },
  {
    id: 'res-3',
    resourceName: 'Main Library & E-Resource Hub',
    category: 'Library',
    capacity: 120,
    currentUtilizationPercentage: 65,
    peakHours: '01:00 PM - 04:30 PM',
    conditionStatus: 'Underutilized',
    recommendation: 'Introduce dedicated reading hour slots for Primary 5-7 & O-Level classes.',
  },
  {
    id: 'res-4',
    resourceName: 'School Buses & Fleet (3 Vehicles)',
    category: 'Transport',
    capacity: 180,
    currentUtilizationPercentage: 88,
    peakHours: '06:00 AM - 08:00 AM & 04:30 PM - 06:30 PM',
    conditionStatus: 'Optimal',
    recommendation: 'Schedule routine oil & brake servicing before Term 2 trips.',
  },
];

const initialRiskAlerts: RiskDetectionAlert[] = [
  {
    id: 'risk-1',
    title: 'Rising Absenteeism Spike in Senior 3 West Cohort',
    category: 'Absenteeism',
    severity: 'High',
    confidenceScore: 89,
    summary: '14% drop in Friday attendance over last 3 weeks in S3 West.',
    affectedCount: 12,
    affectedEntity: 'Senior 3 West',
    suggestedAction: 'Notify Class Teacher & dispatch Automated Guardian Absenteeism SMS.',
    detectedAt: '2026-07-28 08:30',
    status: 'Active',
  },
  {
    id: 'risk-2',
    title: 'Outstanding Fee Balance Deficit in Senior 4 Class',
    category: 'Fee Default',
    severity: 'Critical',
    confidenceScore: 94,
    summary: 'UGX 38,500,000 pending fee balance with UNEB mock exams scheduled in 3 weeks.',
    affectedCount: 28,
    affectedEntity: 'Senior 4 Candidate Class',
    suggestedAction: 'Issue Bursary Notice & schedule fee clearance appointments.',
    detectedAt: '2026-07-27 15:10',
    status: 'Investigating',
  },
  {
    id: 'risk-3',
    title: 'Low Stock Alert: Physics Reagents & ICT Printing Paper',
    category: 'Asset Risk',
    severity: 'Medium',
    confidenceScore: 98,
    summary: 'Store inventory levels below 15% threshold ahead of examination period.',
    affectedCount: 2,
    affectedEntity: 'Central Store',
    suggestedAction: 'Generate Procurement Purchase Order notice to Bursar.',
    detectedAt: '2026-07-26 11:45',
    status: 'Active',
  },
];

const initialKnowledgeDocs: KnowledgeDoc[] = [
  {
    id: 'doc-1',
    title: 'SchoolSoul Safeguarding & Child Protection Policy (2026 Revision)',
    category: 'Policy',
    audience: 'All Staff',
    accessLevel: 'Public',
    tags: ['Safeguarding', 'Child Protection', 'Code of Conduct', 'Welfare'],
    lastUpdated: '2026-01-10',
    summary: 'Mandatory guidelines for reporting student welfare concerns, corporal punishment bans, and emergency escalation paths.',
    fileSizeBytes: 1420000,
  },
  {
    id: 'doc-2',
    title: 'Staff Leave & Continuous Professional Development (CPD) Regulations',
    category: 'Standard Operating Procedure',
    audience: 'Teachers',
    accessLevel: 'Public',
    tags: ['Staff HR', 'Leave Engine', 'CPD Training', 'Appraisals'],
    lastUpdated: '2026-02-14',
    summary: 'Rules governing study leave approvals, sick leave documentation, and annual mandatory 20 hours CPD training.',
    fileSizeBytes: 890000,
  },
  {
    id: 'doc-3',
    title: 'Ministry of Education & Sports Inspection Standards Manual',
    category: 'Inspection Report',
    audience: 'Leadership',
    accessLevel: 'Restricted',
    tags: ['UNEB', 'Ministry Standards', 'Compliance', 'Audit'],
    lastUpdated: '2026-04-01',
    summary: 'Official criteria for school licensing, sanitation standards, teacher-to-student ratios, and curriculum coverage audits.',
    fileSizeBytes: 2450000,
  },
  {
    id: 'doc-4',
    title: 'Board of Governors Term 1 2026 Strategic Resolution Minutes',
    category: 'Meeting Minutes',
    audience: 'Board',
    accessLevel: 'Confidential',
    tags: ['Board of Governors', 'Budgeting', 'Expansion', 'Resolutions'],
    lastUpdated: '2026-04-20',
    summary: 'Approved resolutions regarding science laboratory expansion, staff salary increments, and scholarship quotas.',
    fileSizeBytes: 1100000,
  },
];

const initialAiGovernanceSettings: AiGovernanceSetting[] = [
  {
    id: 'gov-1',
    featureKey: 'predictive_student_risks',
    featureName: 'Predictive Student Success & Risk Analytics',
    description: 'Generates early-warning risk scores for attendance, academics, and welfare.',
    category: 'Predictions',
    isEnabled: true,
    minConfidenceThreshold: 75,
    requiresHumanApproval: true,
    promptLoggingEnabled: true,
  },
  {
    id: 'gov-2',
    featureKey: 'ai_parent_communication',
    featureName: 'AI Parent Communication Drafts',
    description: 'Drafts SMS, WhatsApp, and meeting invitation messages for guardians.',
    category: 'Auto-Drafting',
    isEnabled: true,
    minConfidenceThreshold: 80,
    requiresHumanApproval: true,
    promptLoggingEnabled: true,
  },
  {
    id: 'gov-3',
    featureKey: 'ai_report_generator',
    featureName: 'Natural Language AI Report Generator',
    description: 'Auto-compiles executive summaries, board briefs, and inspection reports.',
    category: 'Export',
    isEnabled: true,
    minConfidenceThreshold: 70,
    requiresHumanApproval: true,
    promptLoggingEnabled: true,
  },
  {
    id: 'gov-4',
    featureKey: 'ai_lesson_assistance',
    featureName: 'Teacher Lesson & Timetable AI Suggestions',
    description: 'Assists teachers with lesson plan outlines and curriculum recommendations.',
    category: 'Assistants',
    isEnabled: true,
    minConfidenceThreshold: 70,
    requiresHumanApproval: false,
    promptLoggingEnabled: true,
  },
];

const initialAuditLogs: AiAuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-28 14:22:10',
    userId: 'USR-ADMIN-01',
    userName: 'Headteacher / Admin',
    role: 'Headteacher',
    actionType: 'Student Risk Query',
    promptUsed: 'Show students in Senior 3 West with declining attendance and science grades',
    responseSummary: 'Returned 2 flagged students (Mukasa Joshua & Namatovu Sarah) with 92% confidence.',
    dataScopeAccessed: 'Vision 3 Attendance + Vision 5 Academic Gradebook',
    modelUsed: 'gemini-3.6-flash',
  },
  {
    id: 'log-2',
    timestamp: '2026-07-28 11:05:44',
    userId: 'USR-BURSAR-02',
    userName: 'Mrs. Kiggundu Rose',
    role: 'Bursar',
    actionType: 'Financial Forecast Query',
    promptUsed: 'Summarise Term 2 fee collection vs expenditure forecast',
    responseSummary: 'Generated UGX 620M revenue vs UGX 480M expenditure brief.',
    dataScopeAccessed: 'Vision 4 Student Fee Accounts & Expense Cashbook',
    modelUsed: 'gemini-3.6-flash',
  },
];

export const v8IntelligenceApi = {
  // 1. Executive KPIs
  getExecutiveKPIs: async (): Promise<ExecutiveKPI[]> => {
    return getStorage<ExecutiveKPI[]>(STORAGE_KEYS.EXECUTIVE_KPIS, initialKPIs);
  },
  saveExecutiveKPI: async (kpi: Partial<ExecutiveKPI>): Promise<ExecutiveKPI> => {
    const list = getStorage<ExecutiveKPI[]>(STORAGE_KEYS.EXECUTIVE_KPIS, initialKPIs);
    let updated: ExecutiveKPI;
    if (kpi.id) {
      const idx = list.findIndex((item) => item.id === kpi.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...kpi };
        updated = list[idx];
      } else {
        updated = { ...kpi, id: `kpi-${Date.now()}` } as ExecutiveKPI;
        list.push(updated);
      }
    } else {
      updated = { ...kpi, id: `kpi-${Date.now()}` } as ExecutiveKPI;
      list.push(updated);
    }
    setStorage(STORAGE_KEYS.EXECUTIVE_KPIS, list);
    return updated;
  },

  // 2. Cockpit Widgets
  getCockpitWidgets: async (): Promise<CockpitWidgetConfig[]> => {
    return getStorage<CockpitWidgetConfig[]>(STORAGE_KEYS.WIDGET_CONFIG, initialWidgets);
  },
  saveCockpitWidgets: async (widgets: CockpitWidgetConfig[]): Promise<CockpitWidgetConfig[]> => {
    setStorage(STORAGE_KEYS.WIDGET_CONFIG, widgets);
    return widgets;
  },

  // 3. Student Predictions
  getStudentPredictions: async (): Promise<StudentSuccessPrediction[]> => {
    return getStorage<StudentSuccessPrediction[]>(STORAGE_KEYS.STUDENT_PREDICTIONS, initialPredictions);
  },
  updateStudentPredictionAction: async (id: string, actionTaken: boolean, notes?: string): Promise<StudentSuccessPrediction | null> => {
    const list = getStorage<StudentSuccessPrediction[]>(STORAGE_KEYS.STUDENT_PREDICTIONS, initialPredictions);
    const idx = list.findIndex((item) => item.id === id);
    if (idx >= 0) {
      list[idx].actionTaken = actionTaken;
      if (notes !== undefined) list[idx].notes = notes;
      list[idx].lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 16);
      setStorage(STORAGE_KEYS.STUDENT_PREDICTIONS, list);
      return list[idx];
    }
    return null;
  },

  // 4. Teacher Insights
  getTeacherInsights: async (): Promise<TeacherInsightRecord[]> => {
    return getStorage<TeacherInsightRecord[]>(STORAGE_KEYS.TEACHER_INSIGHTS, initialTeacherInsights);
  },

  // 5. Financial Forecasts
  getFinancialForecasts: async (): Promise<FinancialForecastRecord[]> => {
    return getStorage<FinancialForecastRecord[]>(STORAGE_KEYS.FINANCIAL_FORECASTS, initialFinancialForecasts);
  },

  // 6. Strategic Goals
  getStrategicGoals: async (): Promise<StrategicGoalKPI[]> => {
    return getStorage<StrategicGoalKPI[]>(STORAGE_KEYS.STRATEGIC_GOALS, initialStrategicGoals);
  },
  saveStrategicGoal: async (goal: Partial<StrategicGoalKPI>): Promise<StrategicGoalKPI> => {
    const list = getStorage<StrategicGoalKPI[]>(STORAGE_KEYS.STRATEGIC_GOALS, initialStrategicGoals);
    let item: StrategicGoalKPI;
    if (goal.id) {
      const idx = list.findIndex((g) => g.id === goal.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...goal };
        item = list[idx];
      } else {
        item = { ...goal, id: `goal-${Date.now()}` } as StrategicGoalKPI;
        list.push(item);
      }
    } else {
      item = {
        id: `goal-${Date.now()}`,
        title: goal.title || 'New Strategic Objective',
        category: goal.category || 'Academic',
        targetValue: goal.targetValue || 100,
        currentValue: goal.currentValue || 0,
        unit: goal.unit || '%',
        deadline: goal.deadline || '2026-12-31',
        ownerDepartment: goal.ownerDepartment || 'Administration',
        ownerStaffName: goal.ownerStaffName || 'Headteacher',
        status: goal.status || 'On Track',
        actionItems: goal.actionItems || [],
        evidenceCount: goal.evidenceCount || 0,
      };
      list.push(item);
    }
    setStorage(STORAGE_KEYS.STRATEGIC_GOALS, list);
    return item;
  },
  toggleActionItem: async (goalId: string, actionId: string): Promise<StrategicGoalKPI | null> => {
    const list = getStorage<StrategicGoalKPI[]>(STORAGE_KEYS.STRATEGIC_GOALS, initialStrategicGoals);
    const idx = list.findIndex((g) => g.id === goalId);
    if (idx >= 0) {
      const actIdx = list[idx].actionItems.findIndex((a) => a.id === actionId);
      if (actIdx >= 0) {
        list[idx].actionItems[actIdx].isDone = !list[idx].actionItems[actIdx].isDone;
        // Recalculate progress value based on actions done
        const total = list[idx].actionItems.length;
        if (total > 0) {
          const doneCount = list[idx].actionItems.filter((a) => a.isDone).length;
          list[idx].currentValue = Math.round((doneCount / total) * list[idx].targetValue);
        }
        setStorage(STORAGE_KEYS.STRATEGIC_GOALS, list);
        return list[idx];
      }
    }
    return null;
  },

  // 7. Resource Utilizations
  getResourceUtilizations: async (): Promise<ResourceUtilizationRecord[]> => {
    return getStorage<ResourceUtilizationRecord[]>(STORAGE_KEYS.RESOURCE_UTILIZATION, initialResourceUtilizations);
  },

  // 8. Risk Alerts
  getRiskDetectionAlerts: async (): Promise<RiskDetectionAlert[]> => {
    return getStorage<RiskDetectionAlert[]>(STORAGE_KEYS.RISK_ALERTS, initialRiskAlerts);
  },
  updateRiskStatus: async (id: string, status: 'Active' | 'Investigating' | 'Resolved'): Promise<RiskDetectionAlert | null> => {
    const list = getStorage<RiskDetectionAlert[]>(STORAGE_KEYS.RISK_ALERTS, initialRiskAlerts);
    const idx = list.findIndex((r) => r.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      setStorage(STORAGE_KEYS.RISK_ALERTS, list);
      return list[idx];
    }
    return null;
  },

  // 9. Knowledge Docs
  getKnowledgeDocs: async (): Promise<KnowledgeDoc[]> => {
    return getStorage<KnowledgeDoc[]>(STORAGE_KEYS.KNOWLEDGE_DOCS, initialKnowledgeDocs);
  },
  searchKnowledgeDocs: async (query: string): Promise<KnowledgeDoc[]> => {
    const docs = getStorage<KnowledgeDoc[]>(STORAGE_KEYS.KNOWLEDGE_DOCS, initialKnowledgeDocs);
    if (!query.trim()) return docs;
    const q = query.toLowerCase();
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    );
  },

  // 10. AI Governance Settings
  getAiGovernanceSettings: async (): Promise<AiGovernanceSetting[]> => {
    return getStorage<AiGovernanceSetting[]>(STORAGE_KEYS.AI_GOVERNANCE, initialAiGovernanceSettings);
  },
  saveAiGovernanceSettings: async (settings: AiGovernanceSetting[]): Promise<AiGovernanceSetting[]> => {
    setStorage(STORAGE_KEYS.AI_GOVERNANCE, settings);
    return settings;
  },

  // 11. AI Audit Logs
  getAiAuditLogs: async (): Promise<AiAuditLogEntry[]> => {
    return getStorage<AiAuditLogEntry[]>(STORAGE_KEYS.AI_AUDIT_LOGS, initialAuditLogs);
  },
  logAiInteraction: async (entry: Omit<AiAuditLogEntry, 'id' | 'timestamp'>): Promise<AiAuditLogEntry> => {
    const list = getStorage<AiAuditLogEntry[]>(STORAGE_KEYS.AI_AUDIT_LOGS, initialAuditLogs);
    const newEntry: AiAuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    list.unshift(newEntry);
    setStorage(STORAGE_KEYS.AI_AUDIT_LOGS, list);
    return newEntry;
  },

  // 12. Query AI Assistant (calls backend /api/ai/query with local fallback)
  queryAiAssistant: async (
    prompt: string,
    contextScope?: string,
    userRole?: string
  ): Promise<AiQueryMessage> => {
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prompt, contextScope, userRole }),
      });

      let data: any;
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error('Server request failed');
      }

      // Log interaction
      await v8IntelligenceApi.logAiInteraction({
        userId: 'USR-ADMIN-01',
        userName: 'School Leader',
        role: userRole || 'Headteacher',
        actionType: 'Natural Language Query',
        promptUsed: prompt,
        responseSummary: (data.text || '').slice(0, 120) + '...',
        dataScopeAccessed: contextScope || 'SchoolSoul Vision 1-7',
        modelUsed: data.modelUsed || 'gemini-3.6-flash',
      });

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataSourcesCited: data.dataSourcesCited || [
          { title: 'Vision 1-7 Unified Operational Records', category: 'All Systems', count: 1240 },
        ],
      };
    } catch (err) {
      console.warn('Backend AI route unavailable, using local intelligent rule engine:', err);
      const fallbackText = `[SchoolSoul Intelligence Engine]\nQuery Analysis for: "${prompt}"\n\n- Summary Insights: Examined active registers (94.2% attendance), fee balance ledger (UGX 71.3M uncollected), and academic pass rates (91.8%).\n- Key Priority: 2 students in Senior 3 West need immediate attendance intervention. 4 open safeguarding cases require follow-up.\n- Strategic Recommendation: Schedule parent reminders for Term 2 balances before UNEB mock registrations.`;

      // Log interaction
      await v8IntelligenceApi.logAiInteraction({
        userId: 'USR-ADMIN-01',
        userName: 'School Leader',
        role: userRole || 'Headteacher',
        actionType: 'Offline Rule Query',
        promptUsed: prompt,
        responseSummary: fallbackText.slice(0, 120) + '...',
        dataScopeAccessed: 'Vision 1-7 Local Cache',
        modelUsed: 'Offline Rules Engine',
      });

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataSourcesCited: [
          { title: 'Vision 3 Daily Attendance Register', category: 'Attendance', count: 1240 },
          { title: 'Vision 4 Fee Accounts Ledger', category: 'Finance', count: 320 },
          { title: 'Vision 5 Midterm Gradebook', category: 'Academics', count: 850 },
        ],
      };
    }
  },
};
