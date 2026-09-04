import type {
  SafeguardingCase,
  WelfareObservation,
  BehaviourRecord,
  CounsellingSession,
  StudentMedicalProfile,
  SchoolIncident,
  StaffProfile,
  StaffLeaveRequest,
  StaffAppraisal,
  CPDTraining,
  SchoolAsset,
  InventoryItem,
  SchoolPolicyDocument,
  SchoolInsurancePolicy,
  AdminTaskNotice,
} from '../types';

// Storage Keys
const STORAGE_KEYS = {
  SAFEGUARDING: 'schoolsoul_v7_safeguarding',
  WELFARE: 'schoolsoul_v7_welfare',
  BEHAVIOUR: 'schoolsoul_v7_behaviour',
  COUNSELLING: 'schoolsoul_v7_counselling',
  MEDICAL: 'schoolsoul_v7_medical',
  INCIDENTS: 'schoolsoul_v7_incidents',
  STAFF_HR: 'schoolsoul_v7_staff_hr',
  STAFF_LEAVE: 'schoolsoul_v7_staff_leave',
  APPRAISALS: 'schoolsoul_v7_appraisals',
  CPD: 'schoolsoul_v7_cpd',
  ASSETS: 'schoolsoul_v7_assets',
  INVENTORY: 'schoolsoul_v7_inventory',
  POLICIES: 'schoolsoul_v7_policies',
  ADMIN_TASKS: 'schoolsoul_v7_admin_tasks',
  INSURANCE: 'schoolsoul_v7_insurance',
};

// Seed Data Generators
const SEED_SAFEGUARDING_CASES: SafeguardingCase[] = [
  {
    id: 'sg-001',
    caseNumber: 'SG-2026-001',
    studentId: 'STU-1002',
    studentName: 'Amina Kigozi',
    classGrade: 'Senior 3 Blue',
    category: 'Child Protection',
    severity: 'High',
    status: 'Under Investigation',
    reportedBy: 'Sr. Mary Grace (Senior Woman Teacher)',
    assignedTo: 'Mugisha Patrick (Safeguarding Officer)',
    description: 'Student presented with unexplainable physical bruises on wrists and reported prolonged absence due to home distress.',
    confidentialNotes: [
      {
        id: 'n-1',
        authorName: 'Mugisha Patrick',
        authorRole: 'Safeguarding Lead',
        note: 'Initial interview conducted in private counseling room. Guardian invited for a structured welfare review.',
        isConfidential: true,
        createdAt: '2026-07-20 10:30',
      },
    ],
    externalReferralOrg: 'Kampala Ministry of Gender & Child Protection',
    escalatedToAuthority: true,
    createdAt: '2026-07-19 14:00',
    updatedAt: '2026-07-20 10:30',
  },
  {
    id: 'sg-002',
    caseNumber: 'SG-2026-002',
    studentId: 'STU-1008',
    studentName: 'Brian Musoke',
    classGrade: 'Senior 5 Arts',
    category: 'Bullying',
    severity: 'Medium',
    status: 'Resolved',
    reportedBy: 'Okello David (Class Teacher)',
    assignedTo: 'Sr. Mary Grace',
    description: 'Reported cyberbullying and peer harassment in dormitory social group.',
    confidentialNotes: [
      {
        id: 'n-2',
        authorName: 'Sr. Mary Grace',
        authorRole: 'Senior Woman Teacher',
        note: 'Restorative session held with involved peers. Parents briefed and signed agreement.',
        isConfidential: false,
        createdAt: '2026-07-15 11:00',
      },
    ],
    resolutionSummary: 'Conflict mediated, written apologies exchanged, dormitory monitors assigned to monitor.',
    createdAt: '2026-07-12 09:15',
    updatedAt: '2026-07-15 11:00',
  },
];

const SEED_WELFARE_OBSERVATIONS: WelfareObservation[] = [
  {
    id: 'wel-001',
    studentId: 'STU-1015',
    studentName: 'Joshua Katende',
    classGrade: 'Senior 2 Yellow',
    category: 'Financial Hardship',
    concernLevel: 'Severe',
    description: 'Student missing school lunch regularly due to unpaid feeding fees; family affected by flood damage.',
    actionPlan: 'Placed on School Meals Subsidy Bursary & school counselor follow-up.',
    status: 'Intervention Active',
    assignedOfficer: 'Akello Susan (Welfare Coordinator)',
    outcomesTracked: 'Attendance restored to 98% this week. Lunches provided daily.',
    createdAt: '2026-07-05 08:00',
    updatedAt: '2026-07-22 16:00',
  },
  {
    id: 'wel-002',
    studentId: 'STU-1021',
    studentName: 'Grace Nantume',
    classGrade: 'Senior 4 Green',
    category: 'Boarding Welfare',
    concernLevel: 'Moderate',
    description: 'Exhibiting signs of homesickness and anxiety during prep sessions.',
    actionPlan: 'Assigned peer buddy in dormitory and bi-weekly counselor check-ins.',
    status: 'Active Monitoring',
    assignedOfficer: 'Nakamya Florence (Matron)',
    createdAt: '2026-07-18 19:30',
    updatedAt: '2026-07-25 10:00',
  },
];

const SEED_BEHAVIOUR_RECORDS: BehaviourRecord[] = [
  {
    id: 'beh-001',
    studentId: 'STU-1005',
    studentName: 'Daniel Tumusiime',
    classGrade: 'Senior 3 Red',
    type: 'Positive Commendation',
    category: 'Merit Points',
    points: 15,
    description: 'Organized school campus clean-up campaign and assisted peer in science lab prep.',
    sanctionOrReward: 'Awarded House Merit Certificate & Assembly Commendation',
    parentNotified: true,
    status: 'Award Issued',
    recordedBy: 'Mugisha Patrick (House Master)',
    date: '2026-07-24',
  },
  {
    id: 'beh-002',
    studentId: 'STU-1012',
    studentName: 'Joel Ssebaggala',
    classGrade: 'Senior 1 Blue',
    type: 'Incident Violation',
    category: 'Classroom Disruption',
    points: -5,
    description: 'Repeated disruption during Mathematics period and disrespect to teacher.',
    sanctionOrReward: 'After-school detention and reflective essay writing',
    parentNotified: true,
    status: 'Resolved',
    recordedBy: 'Kagimu Joseph (Math Teacher)',
    date: '2026-07-21',
  },
];

const SEED_COUNSELLING_SESSIONS: CounsellingSession[] = [
  {
    id: 'coun-001',
    sessionCode: 'CS-2026-089',
    studentId: 'STU-1002',
    studentName: 'Amina Kigozi',
    classGrade: 'Senior 3 Blue',
    counselorId: 'STAFF-104',
    counselorName: 'Dr. Elizabeth Nabatanzi (School Counselor)',
    referralSource: 'Safeguarding Lead',
    sessionDate: '2026-07-26',
    summaryNotes: 'Focused on stress management strategies, emotional regulation, and safety planning.',
    actionItems: 'Continue weekly counseling sessions; coordinate with class teacher for academic extension.',
    nextAppointmentDate: '2026-08-02',
    isConfidential: true,
    status: 'Completed',
  },
];

const SEED_MEDICAL_PROFILES: StudentMedicalProfile[] = [
  {
    studentId: 'STU-1001',
    studentName: 'Moses Ochieng',
    classGrade: 'Senior 4 Science',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Mild Asthma'],
    emergencyContactName: 'Peter Ochieng (Father)',
    emergencyContactPhone: '+256 772 123456',
    immunisationStatus: 'Up to Date',
    specialMedicalNotes: 'Inhaler stored in Nurse Office & school bag. Emergency contact must be alerted if attack occurs.',
    clinicVisits: [
      {
        id: 'cv-1',
        visitDate: '2026-07-14',
        visitTime: '10:15 AM',
        complaint: 'Mild wheezing during PE lesson',
        diagnosis: 'Exercise-induced bronchospasm',
        treatmentAdministered: 'Ventolin inhaler 2 puffs, 20 mins rest',
        administeredBy: 'Nurse Clara Atuhaire',
        parentNotified: true,
        restRequiredMinutes: 30,
        referredToHospital: false,
      },
    ],
    medications: [
      {
        id: 'med-1',
        medicationName: 'Ventolin Inhaler',
        dosage: '100mcg (2 puffs)',
        frequency: 'As needed for breathlessness',
        prescribedBy: 'Mulago Children Hospital',
        startDate: '2026-01-10',
        endDate: '2026-12-31',
        notes: 'Keep inhaler accessible at all times.',
      },
    ],
    updatedAt: '2026-07-14 11:00',
  },
];

const SEED_INCIDENTS: SchoolIncident[] = [
  {
    id: 'inc-001',
    incidentCode: 'INC-2026-014',
    title: 'Laboratory Chemistry Reagent Spill',
    category: 'Infrastructure Issue',
    severity: 'Moderate',
    location: 'Main Science Complex - Chemistry Lab 2',
    incidentDate: '2026-07-22',
    incidentTime: '11:45 AM',
    reportedBy: 'Kagimu Joseph (Lab Master)',
    investigatingOfficer: 'Mugisha Patrick (Safety Officer)',
    description: 'Dilute hydrochloric acid container tipped over during Senior 5 practical. No injuries sustained.',
    witnessStatements: ['Lab technician immediately applied neutralizing agent and evacuated room.'],
    correctiveActions: 'Replaced container storage racks with lockable safety guardrails.',
    status: 'Closed',
    createdAt: '2026-07-22 12:00',
  },
];

const SEED_STAFF_PROFILES: StaffProfile[] = [
  {
    id: 'STAFF-101',
    staffCode: 'EMP-001',
    fullName: 'Dr. Emmanuel Lule',
    email: 'e.lule@schoolos.ug',
    phone: '+256 772 900100',
    role: 'Headteacher',
    department: 'Administration',
    designation: 'Headmaster / Executive Director',
    qualifications: ['PhD Educational Leadership (Makerere)', 'M.Ed Management'],
    employmentType: 'Full-Time',
    contractStartDate: '2020-01-01',
    status: 'Active',
    jobDescription: 'Overall executive leadership, academic direction, policy implementation and stakeholder governance.',
    salaryGradeRef: 'SCALE-U1E',
    totalCPDPoints: 120,
    performanceRating: 'Outstanding',
    emergencyContact: 'Mrs. Janet Lule (+256 772 900101)',
    createdAt: '2020-01-01',
  },
  {
    id: 'STAFF-102',
    staffCode: 'EMP-002',
    fullName: 'Sr. Mary Grace Akello',
    email: 'm.akello@schoolos.ug',
    phone: '+256 782 112233',
    role: 'Deputy Headteacher',
    department: 'Human Resources & Safeguarding',
    designation: 'Senior Woman Teacher & HR Lead',
    qualifications: ['B.Ed (Hons) Kyambogo', 'Postgrad Diploma Safeguarding'],
    employmentType: 'Full-Time',
    contractStartDate: '2021-03-15',
    status: 'Active',
    jobDescription: 'Overseeing staff welfare, leave approvals, child protection cases, and academic discipline.',
    salaryGradeRef: 'SCALE-U2',
    totalCPDPoints: 95,
    performanceRating: 'Exceeds Expectations',
    emergencyContact: 'Francis Akello (+256 782 112234)',
    createdAt: '2021-03-15',
  },
  {
    id: 'STAFF-103',
    staffCode: 'EMP-003',
    fullName: 'Kagimu Joseph',
    email: 'j.kagimu@schoolos.ug',
    phone: '+256 701 554433',
    role: 'Teacher',
    department: 'Sciences',
    designation: 'Head of Physics & Chemistry',
    qualifications: ['B.Sc Education (Physics/Chem)', 'UNEB Assessor Cert'],
    employmentType: 'Full-Time',
    contractStartDate: '2022-02-01',
    status: 'Active',
    jobDescription: 'Curriculum delivery for Senior 1-6 Science classes and lab management.',
    salaryGradeRef: 'SCALE-U3',
    totalCPDPoints: 60,
    performanceRating: 'Exceeds Expectations',
    emergencyContact: 'Sarah Kagimu (+256 701 554434)',
    createdAt: '2022-02-01',
  },
];

const SEED_STAFF_LEAVE: StaffLeaveRequest[] = [
  {
    id: 'lve-001',
    staffId: 'STAFF-103',
    staffName: 'Kagimu Joseph',
    department: 'Sciences',
    leaveType: 'Study',
    startDate: '2026-08-10',
    endDate: '2026-08-20',
    totalDays: 10,
    reason: 'Attending UNEB Senior Examiner National Training Workshop.',
    handoverStaffName: 'Ouma Bernard (Assistant Science Teacher)',
    status: 'Pending',
    approvalSteps: [
      { stepName: 'HOD Science Approval', approverRole: 'Department Head', status: 'Approved', comments: 'Covering teacher assigned.', approvedAt: '2026-07-25 09:00' },
      { stepName: 'HR & Headteacher Final Approval', approverRole: 'HR / Headteacher', status: 'Pending' },
    ],
    appliedDate: '2026-07-24',
  },
];

const SEED_APPRAISALS: StaffAppraisal[] = [
  {
    id: 'app-001',
    staffId: 'STAFF-103',
    staffName: 'Kagimu Joseph',
    department: 'Sciences',
    reviewPeriod: 'Term 1 & Term 2 (2026)',
    overallRating: 'Exceeds Expectations',
    classroomObservationScore: 92,
    strengths: 'Excellent mastery of CBC methodology, high student engagement, impeccable lab safety standards.',
    areasForGrowth: 'Integration of digital simulations into lesson prep.',
    goals: [
      { id: 'g1', title: 'Publish ICT-Integrated Physics Study Notes', category: 'Pedagogy', targetDate: '2026-10-30', progressPercent: 70, status: 'In Progress' },
      { id: 'g2', title: 'Mentor 2 Junior Science Tutors', category: 'Student Mentorship', targetDate: '2026-11-15', progressPercent: 100, status: 'Achieved' },
    ],
    pdpPlan: 'Enroll in SchoolSoul Advanced Digital Pedagogy Workshop.',
    appraiserName: 'Sr. Mary Grace Akello (Deputy Headteacher)',
    status: 'Finalized',
    completedDate: '2026-07-10',
  },
];

const SEED_CPD_TRAININGS: CPDTraining[] = [
  {
    id: 'cpd-001',
    title: 'Uganda Lower Secondary Curriculum (NCDC) Competency-Based Assessment Mastery',
    category: 'Pedagogical Skills',
    trainerName: 'Prof. Wandera Gerald (NCDC)',
    trainingDate: '2026-08-15',
    durationHours: 8,
    cpdPoints: 15,
    venueOrPlatform: 'School Main Auditorium & Zoom Stream',
    maxParticipants: 60,
    registeredStaffCount: 42,
    registeredStaffIds: ['STAFF-101', 'STAFF-102', 'STAFF-103'],
    status: 'Upcoming',
    summary: 'Comprehensive training on continuous assessment scoring, rubric formulation, and e-report card integrations.',
  },
  {
    id: 'cpd-002',
    title: 'Child Protection, Safeguarding & Mandatory Reporting Protocols in Schools',
    category: 'Safeguarding & Welfare',
    trainerName: 'Ministry of Gender Child Safeguarding Specialist',
    trainingDate: '2026-06-20',
    durationHours: 6,
    cpdPoints: 20,
    venueOrPlatform: 'Staff Conference Hall',
    maxParticipants: 100,
    registeredStaffCount: 88,
    registeredStaffIds: ['STAFF-101', 'STAFF-102', 'STAFF-103'],
    status: 'Completed',
    summary: 'Essential guidelines on recognizing signs of abuse, handling disclosures, and case escalation.',
  },
];

const SEED_ASSETS: SchoolAsset[] = [
  {
    id: 'ast-001',
    assetTag: 'AST-ICT-2026-001',
    name: 'Dell OptiPlex 7090 Desktop Computer',
    category: 'Computers & ICT',
    location: 'Computer Lab 1',
    department: 'ICT Department',
    serialNumber: 'SN-DELL-99881122',
    purchaseDate: '2025-02-15',
    purchaseCostUGX: 2800000,
    currentCondition: 'Excellent',
    qrBarcodeCode: 'QR-AST-001-COMP1',
    warrantyExpiry: '2028-02-15',
    maintenanceLogs: [
      { id: 'm1', serviceDate: '2026-05-10', issueDescription: 'Routine RAM upgrade to 16GB', actionTaken: 'Installed 8GB extra DDR4 RAM stick', servicedBy: 'Kampala Tech Solutions', costUGX: 150000 },
    ],
    createdAt: '2025-02-15',
  },
  {
    id: 'ast-002',
    assetTag: 'AST-LAB-2026-044',
    name: 'Binocular Biological Microscope (40x-1000x)',
    category: 'Laboratory Equipment',
    location: 'Biology Lab',
    department: 'Sciences',
    serialNumber: 'MIC-OLYMPUS-4421',
    purchaseDate: '2024-08-20',
    purchaseCostUGX: 1800000,
    currentCondition: 'Good',
    qrBarcodeCode: 'QR-AST-044-MIC1',
    warrantyExpiry: '2027-08-20',
    maintenanceLogs: [],
    createdAt: '2024-08-20',
  },
];

const SEED_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'inv-001',
    itemCode: 'INV-PAP-01',
    name: 'A4 White Printing Paper (80gsm)',
    category: 'Office Supplies',
    quantityInStock: 85,
    unitOfMeasure: 'Reams',
    reorderThreshold: 30,
    unitPriceUGX: 22000,
    supplierName: 'Picfare Printing Industry Ltd',
    locationStore: 'Central Main Store',
    lastRestockedDate: '2026-07-01',
  },
  {
    id: 'inv-002',
    itemCode: 'INV-MED-05',
    name: 'Paracetamol Tablets 500mg',
    category: 'Medical Supplies',
    quantityInStock: 8,
    unitOfMeasure: 'Packs',
    reorderThreshold: 15,
    unitPriceUGX: 12000,
    supplierName: 'Abacus Pharma Uganda',
    locationStore: 'Sickbay Medicine Cabinet',
    lastRestockedDate: '2026-06-10',
  },
];

const SEED_POLICIES: SchoolPolicyDocument[] = [
  {
    id: 'pol-001',
    code: 'POL-001',
    title: 'SchoolSoul Child Protection & Safeguarding Policy (2026 Edition)',
    category: 'Safeguarding',
    version: 'v3.2',
    status: 'Approved & Published',
    effectiveDate: '2026-01-01',
    author: 'School Board & Safeguarding Committee',
    approvedBy: 'School Board & Safeguarding Committee',
    fileSizeKb: 1450,
    targetRoles: ['Headteacher', 'Teacher', 'Administrator', 'School Nurse', 'Parent'],
    mandatoryReadForRoles: ['Headteacher', 'Teacher', 'Administrator', 'School Nurse', 'Parent'],
    acknowledgementCount: 142,
    description: 'Mandatory code of conduct, disclosure procedures, and zero-tolerance guidelines regarding child safety.',
    summary: 'Mandatory code of conduct, disclosure procedures, and zero-tolerance guidelines regarding child safety.',
  },
  {
    id: 'pol-002',
    code: 'POL-002',
    title: 'Staff Code of Conduct & HR Disciplinary Policy',
    category: 'HR & Staff Code',
    version: 'v2.1',
    status: 'Approved & Published',
    effectiveDate: '2025-09-01',
    author: 'Human Resource Office',
    approvedBy: 'Human Resource Office & Board of Governors',
    fileSizeKb: 980,
    targetRoles: ['Teacher', 'Administrator', 'Headteacher', 'Bursar'],
    mandatoryReadForRoles: ['Teacher', 'Administrator', 'Headteacher', 'Bursar'],
    acknowledgementCount: 88,
    description: 'Guidelines on professional attendance, ethics, classroom decorum, and grievance handling.',
    summary: 'Guidelines on professional attendance, ethics, classroom decorum, and grievance handling.',
  },
  {
    id: 'pol-003',
    code: 'POL-003',
    title: 'National Curriculum Assessment & Grading Guidelines (NCDC & UNEB)',
    category: 'Academic',
    version: 'v4.0',
    status: 'Approved & Published',
    effectiveDate: '2026-02-01',
    author: 'Academic Board of Studies',
    approvedBy: 'Academic Board of Studies',
    fileSizeKb: 1200,
    targetRoles: ['Teacher', 'Headteacher', 'Deputy Headteacher', 'Director of Studies'],
    mandatoryReadForRoles: ['Teacher', 'Headteacher', 'Deputy Headteacher', 'Director of Studies'],
    acknowledgementCount: 64,
    description: 'Continuous assessment score recording, Activity of Integration rubric formulation, and UNEB registration policy.',
    summary: 'Continuous assessment score recording, Activity of Integration rubric formulation, and UNEB registration policy.',
  },
];

const SEED_INSURANCE: SchoolInsurancePolicy[] = [
  {
    id: 'ins-001',
    policyNumber: 'JUB-MED-2026-9921',
    policyName: 'Comprehensive Student Group Personal Accident & Medical Shield',
    providerName: 'Jubilee Insurance Uganda Ltd',
    coverageType: 'Student Medical & Accident',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    premiumAmountUGX: 18500000,
    coverageLimitUGX: 250000000,
    status: 'Active',
    contactPerson: 'Dennis Mugalu (Corporate Accounts Lead)',
    contactPhone: '+256 414 311 000',
    emergencyClaimHotline: '+256 800 100 110',
    coveredCount: 850,
    notes: 'Covers all enrolled students for school-hours trauma, sickbay evacuation, sports injuries, and hospital emergency care.',
    createdAt: '2026-01-01',
  },
  {
    id: 'ins-002',
    policyNumber: 'UAP-FLT-2026-4410',
    policyName: 'School Transport Vehicles Comprehensive & Passenger Liability',
    providerName: 'UAP Old Mutual Life & General Insurance Uganda',
    coverageType: 'School Bus & Fleet',
    startDate: '2026-02-15',
    expiryDate: '2027-02-14',
    premiumAmountUGX: 12400000,
    coverageLimitUGX: 500000000,
    status: 'Active',
    contactPerson: 'Grace Akankwasa',
    contactPhone: '+256 702 334455',
    emergencyClaimHotline: '+256 800 200 300',
    coveredCount: 3,
    notes: 'Covers 3 School Coaster Buses (UBA 123X, UBB 456Y, UBC 789Z) for third-party, passenger injury, and roadside rescue.',
    createdAt: '2026-02-15',
  },
  {
    id: 'ins-003',
    policyNumber: 'SAN-PROP-2025-108',
    policyName: 'Institutional Property, Science Labs & Fire Disaster Cover',
    providerName: 'Sanlam General Insurance Uganda',
    coverageType: 'School Property & Fire',
    startDate: '2025-09-01',
    expiryDate: '2026-09-01',
    premiumAmountUGX: 24000000,
    coverageLimitUGX: 2000000000,
    status: 'Active',
    contactPerson: 'David Kintu',
    contactPhone: '+256 772 998877',
    emergencyClaimHotline: '+256 800 555 444',
    notes: 'Covers science laboratories, computer ICT centres, dormitory blocks, and library structures.',
    createdAt: '2025-09-01',
  },
];

const SEED_ADMIN_TASKS: AdminTaskNotice[] = [
  {
    id: 'tsk-001',
    title: 'UNEB Center Inspection File Preparation',
    type: 'Approval Workflow',
    priority: 'Urgent',
    assignedTo: 'Sr. Mary Grace Akello',
    dueDate: '2026-08-05',
    status: 'In Progress',
    description: 'Audit biology and chemistry lab inventories, update candidate registration logs, and verify fire safety certificates.',
    createdAt: '2026-07-25',
  },
  {
    id: 'tsk-002',
    title: 'Board of Governors Executive Meeting Minutes',
    type: 'Meeting Minutes',
    priority: 'Important',
    assignedTo: 'Dr. Emmanuel Lule',
    dueDate: '2026-07-30',
    status: 'Completed',
    description: 'Finalized minutes for Q2 financial review and approved bursary allocation expansion.',
    createdAt: '2026-07-20',
  },
];

// Helper for local storage read/write
function getStorage<T>(key: string, seed: T[]): T[] {
  const existing = localStorage.getItem(key);
  if (!existing) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(existing);
  } catch {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
}

function setStorage<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export const v7Api = {
  // Safeguarding
  getSafeguardingCases: async (): Promise<SafeguardingCase[]> => {
    return getStorage<SafeguardingCase>(STORAGE_KEYS.SAFEGUARDING, SEED_SAFEGUARDING_CASES);
  },
  saveSafeguardingCase: async (item: Partial<SafeguardingCase>): Promise<SafeguardingCase> => {
    const list = getStorage<SafeguardingCase>(STORAGE_KEYS.SAFEGUARDING, SEED_SAFEGUARDING_CASES);
    const existingIndex = list.findIndex((c) => c.id === item.id);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let updatedItem: SafeguardingCase;
    if (existingIndex >= 0) {
      updatedItem = { ...list[existingIndex], ...item, updatedAt: now };
      list[existingIndex] = updatedItem;
    } else {
      updatedItem = {
        id: item.id || `sg-${Date.now()}`,
        caseNumber: item.caseNumber || `SG-2026-${Math.floor(100 + Math.random() * 900)}`,
        studentId: item.studentId || 'STU-1001',
        studentName: item.studentName || 'Student Name',
        classGrade: item.classGrade || 'Senior 1',
        category: item.category || 'Child Protection',
        severity: item.severity || 'Medium',
        status: item.status || 'Open',
        reportedBy: item.reportedBy || 'Staff Member',
        assignedTo: item.assignedTo || 'Safeguarding Officer',
        description: item.description || '',
        confidentialNotes: item.confidentialNotes || [],
        createdAt: now,
        updatedAt: now,
      };
      list.unshift(updatedItem);
    }
    setStorage(STORAGE_KEYS.SAFEGUARDING, list);
    return updatedItem;
  },

  // Student Welfare
  getWelfareObservations: async (): Promise<WelfareObservation[]> => {
    return getStorage<WelfareObservation>(STORAGE_KEYS.WELFARE, SEED_WELFARE_OBSERVATIONS);
  },
  saveWelfareObservation: async (item: Partial<WelfareObservation>): Promise<WelfareObservation> => {
    const list = getStorage<WelfareObservation>(STORAGE_KEYS.WELFARE, SEED_WELFARE_OBSERVATIONS);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newItem: WelfareObservation = {
      id: item.id || `wel-${Date.now()}`,
      studentId: item.studentId || 'STU-1001',
      studentName: item.studentName || 'Student',
      classGrade: item.classGrade || 'Senior 1',
      category: item.category || 'Financial Hardship',
      concernLevel: item.concernLevel || 'Moderate',
      description: item.description || '',
      actionPlan: item.actionPlan || '',
      status: item.status || 'Active Monitoring',
      assignedOfficer: item.assignedOfficer || 'Welfare Officer',
      outcomesTracked: item.outcomesTracked,
      createdAt: now,
      updatedAt: now,
    };
    const idx = list.findIndex((w) => w.id === newItem.id);
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.WELFARE, list);
    return newItem;
  },

  // Behaviour
  getBehaviourRecords: async (): Promise<BehaviourRecord[]> => {
    return getStorage<BehaviourRecord>(STORAGE_KEYS.BEHAVIOUR, SEED_BEHAVIOUR_RECORDS);
  },
  saveBehaviourRecord: async (item: Partial<BehaviourRecord>): Promise<BehaviourRecord> => {
    const list = getStorage<BehaviourRecord>(STORAGE_KEYS.BEHAVIOUR, SEED_BEHAVIOUR_RECORDS);
    const today = new Date().toISOString().split('T')[0];
    const newItem: BehaviourRecord = {
      id: item.id || `beh-${Date.now()}`,
      studentId: item.studentId || 'STU-1001',
      studentName: item.studentName || 'Student Name',
      classGrade: item.classGrade || 'Senior 1',
      type: item.type || 'Positive Commendation',
      category: item.category || 'Merit Points',
      points: item.points ?? 5,
      description: item.description || '',
      sanctionOrReward: item.sanctionOrReward || 'Acknowledged',
      parentNotified: Boolean(item.parentNotified),
      status: item.status || 'Pending Review',
      recordedBy: item.recordedBy || 'Teacher',
      date: item.date || today,
    };
    list.unshift(newItem);
    setStorage(STORAGE_KEYS.BEHAVIOUR, list);
    return newItem;
  },

  // Counselling
  getCounsellingSessions: async (): Promise<CounsellingSession[]> => {
    return getStorage<CounsellingSession>(STORAGE_KEYS.COUNSELLING, SEED_COUNSELLING_SESSIONS);
  },
  saveCounsellingSession: async (item: Partial<CounsellingSession>): Promise<CounsellingSession> => {
    const list = getStorage<CounsellingSession>(STORAGE_KEYS.COUNSELLING, SEED_COUNSELLING_SESSIONS);
    const newItem: CounsellingSession = {
      id: item.id || `coun-${Date.now()}`,
      sessionCode: item.sessionCode || `CS-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentId: item.studentId || 'STU-1001',
      studentName: item.studentName || 'Student Name',
      classGrade: item.classGrade || 'Senior 1',
      counselorId: item.counselorId || 'STAFF-104',
      counselorName: item.counselorName || 'School Counselor',
      referralSource: item.referralSource || 'Teacher',
      sessionDate: item.sessionDate || new Date().toISOString().split('T')[0],
      summaryNotes: item.summaryNotes || '',
      actionItems: item.actionItems || '',
      nextAppointmentDate: item.nextAppointmentDate,
      isConfidential: true,
      status: item.status || 'Scheduled',
    };
    list.unshift(newItem);
    setStorage(STORAGE_KEYS.COUNSELLING, list);
    return newItem;
  },

  // Medical
  getMedicalProfiles: async (): Promise<StudentMedicalProfile[]> => {
    return getStorage<StudentMedicalProfile>(STORAGE_KEYS.MEDICAL, SEED_MEDICAL_PROFILES);
  },
  saveMedicalProfile: async (profile: StudentMedicalProfile): Promise<StudentMedicalProfile> => {
    const list = getStorage<StudentMedicalProfile>(STORAGE_KEYS.MEDICAL, SEED_MEDICAL_PROFILES);
    const idx = list.findIndex((m) => m.studentId === profile.studentId);
    profile.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    if (idx >= 0) list[idx] = profile;
    else list.unshift(profile);
    setStorage(STORAGE_KEYS.MEDICAL, list);
    return profile;
  },

  // Incidents
  getSchoolIncidents: async (): Promise<SchoolIncident[]> => {
    return getStorage<SchoolIncident>(STORAGE_KEYS.INCIDENTS, SEED_INCIDENTS);
  },
  saveSchoolIncident: async (item: Partial<SchoolIncident>): Promise<SchoolIncident> => {
    const list = getStorage<SchoolIncident>(STORAGE_KEYS.INCIDENTS, SEED_INCIDENTS);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newItem: SchoolIncident = {
      id: item.id || `inc-${Date.now()}`,
      incidentCode: item.incidentCode || `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: item.title || 'Incident Title',
      category: item.category || 'Injury / Accident',
      severity: item.severity || 'Minor',
      location: item.location || 'School Premises',
      incidentDate: item.incidentDate || new Date().toISOString().split('T')[0],
      incidentTime: item.incidentTime || '10:00 AM',
      reportedBy: item.reportedBy || 'Staff Member',
      investigatingOfficer: item.investigatingOfficer || 'Safety Lead',
      description: item.description || '',
      witnessStatements: item.witnessStatements || [],
      correctiveActions: item.correctiveActions || 'Under Review',
      status: item.status || 'Reported',
      createdAt: now,
    };
    list.unshift(newItem);
    setStorage(STORAGE_KEYS.INCIDENTS, list);
    return newItem;
  },

  // Staff HR
  getStaffProfiles: async (): Promise<StaffProfile[]> => {
    return getStorage<StaffProfile>(STORAGE_KEYS.STAFF_HR, SEED_STAFF_PROFILES);
  },
  saveStaffProfile: async (item: Partial<StaffProfile>): Promise<StaffProfile> => {
    const list = getStorage<StaffProfile>(STORAGE_KEYS.STAFF_HR, SEED_STAFF_PROFILES);
    const idx = list.findIndex((s) => s.id === item.id);
    const existingStaff = idx >= 0 ? list[idx] : null;
    const newItem: StaffProfile = {
      ...(existingStaff || {}),
      ...item,
      id: item.id || (existingStaff ? existingStaff.id : `STAFF-${Date.now()}`),
      staffCode: item.staffCode || (existingStaff ? existingStaff.staffCode : `EMP-${Math.floor(100 + Math.random() * 900)}`),
      fullName: item.fullName || (existingStaff ? existingStaff.fullName : 'Staff Member'),
      email: item.email || (existingStaff ? existingStaff.email : 'staff@schoolos.ug'),
      phone: item.phone || (existingStaff ? existingStaff.phone : '+256 700 000000'),
      role: item.role || (existingStaff ? existingStaff.role : 'Teacher'),
      department: item.department || (existingStaff ? existingStaff.department : 'Academics'),
      designation: item.designation || (existingStaff ? existingStaff.designation : 'Class Teacher'),
      qualifications: item.qualifications || (existingStaff ? existingStaff.qualifications : ['B.Ed']),
      employmentType: item.employmentType || (existingStaff ? existingStaff.employmentType : 'Full-Time'),
      contractStartDate: item.contractStartDate || (existingStaff ? existingStaff.contractStartDate : '2026-01-01'),
      status: item.status || (existingStaff ? existingStaff.status : 'Active'),
      jobDescription: item.jobDescription || (existingStaff ? existingStaff.jobDescription : 'Teaching and curriculum duties.'),
      salaryGradeRef: item.salaryGradeRef || (existingStaff ? existingStaff.salaryGradeRef : 'SCALE-U3'),
      totalCPDPoints: item.totalCPDPoints ?? (existingStaff ? existingStaff.totalCPDPoints : 10),
      performanceRating: item.performanceRating || (existingStaff ? existingStaff.performanceRating : 'Meets Expectations'),
      emergencyContact: item.emergencyContact || (existingStaff ? existingStaff.emergencyContact : 'Emergency Contact (+256)'),
      nssfNumber: item.nssfNumber !== undefined ? item.nssfNumber : (existingStaff?.nssfNumber || ''),
      tinNumber: item.tinNumber !== undefined ? item.tinNumber : (existingStaff?.tinNumber || ''),
      createdAt: item.createdAt || (existingStaff ? existingStaff.createdAt : new Date().toISOString().split('T')[0]),
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.STAFF_HR, list);
    return newItem;
  },

  // Leave
  getStaffLeaveRequests: async (): Promise<StaffLeaveRequest[]> => {
    return getStorage<StaffLeaveRequest>(STORAGE_KEYS.STAFF_LEAVE, SEED_STAFF_LEAVE);
  },
  saveStaffLeaveRequest: async (item: Partial<StaffLeaveRequest>): Promise<StaffLeaveRequest> => {
    const list = getStorage<StaffLeaveRequest>(STORAGE_KEYS.STAFF_LEAVE, SEED_STAFF_LEAVE);
    const idx = list.findIndex((l) => l.id === item.id);
    const newItem: StaffLeaveRequest = {
      id: item.id || `lve-${Date.now()}`,
      staffId: item.staffId || 'STAFF-103',
      staffName: item.staffName || 'Staff Member',
      department: item.department || 'Sciences',
      leaveType: (item.leaveType as any) || 'Annual',
      startDate: item.startDate || new Date().toISOString().split('T')[0],
      endDate: item.endDate || new Date().toISOString().split('T')[0],
      totalDays: item.totalDays || 1,
      reason: item.reason || '',
      handoverStaffName: item.handoverStaffName || 'Relieving Staff',
      status: (item.status as any) || 'Pending',
      approvalSteps: item.approvalSteps || [
        { stepName: 'HOD Approval', approverRole: 'HOD', status: 'Pending' },
        { stepName: 'HR / Headteacher Approval', approverRole: 'HR Head', status: 'Pending' },
      ],
      appliedDate: item.appliedDate || new Date().toISOString().split('T')[0],
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.STAFF_LEAVE, list);
    return newItem;
  },

  // Appraisals
  getStaffAppraisals: async (): Promise<StaffAppraisal[]> => {
    return getStorage<StaffAppraisal>(STORAGE_KEYS.APPRAISALS, SEED_APPRAISALS);
  },
  saveStaffAppraisal: async (item: Partial<StaffAppraisal>): Promise<StaffAppraisal> => {
    const list = getStorage<StaffAppraisal>(STORAGE_KEYS.APPRAISALS, SEED_APPRAISALS);
    const idx = list.findIndex((a) => a.id === item.id);
    const newItem: StaffAppraisal = {
      id: item.id || `app-${Date.now()}`,
      staffId: item.staffId || 'STAFF-103',
      staffName: item.staffName || 'Staff Name',
      department: item.department || 'Academics',
      reviewPeriod: item.reviewPeriod || 'Annual 2026',
      overallRating: item.overallRating || 'Exceeds Expectations',
      classroomObservationScore: item.classroomObservationScore ?? 85,
      strengths: item.strengths || '',
      areasForGrowth: item.areasForGrowth || '',
      goals: item.goals || [],
      pdpPlan: item.pdpPlan || '',
      appraiserName: item.appraiserName || 'Headteacher',
      status: item.status || 'Draft',
      completedDate: item.completedDate || new Date().toISOString().split('T')[0],
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.APPRAISALS, list);
    return newItem;
  },

  // CPD
  getCPDTrainings: async (): Promise<CPDTraining[]> => {
    return getStorage<CPDTraining>(STORAGE_KEYS.CPD, SEED_CPD_TRAININGS);
  },
  saveCPDTraining: async (item: Partial<CPDTraining>): Promise<CPDTraining> => {
    const list = getStorage<CPDTraining>(STORAGE_KEYS.CPD, SEED_CPD_TRAININGS);
    const idx = list.findIndex((c) => c.id === item.id);
    const newItem: CPDTraining = {
      id: item.id || `cpd-${Date.now()}`,
      title: item.title || 'CPD Training Title',
      category: item.category || 'Pedagogical Skills',
      trainerName: item.trainerName || 'External Specialist',
      trainingDate: item.trainingDate || new Date().toISOString().split('T')[0],
      durationHours: item.durationHours || 4,
      cpdPoints: item.cpdPoints || 10,
      venueOrPlatform: item.venueOrPlatform || 'Main Auditorium',
      maxParticipants: item.maxParticipants || 50,
      registeredStaffCount: item.registeredStaffCount || 1,
      registeredStaffIds: item.registeredStaffIds || ['STAFF-101'],
      status: item.status || 'Upcoming',
      summary: item.summary || '',
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.CPD, list);
    return newItem;
  },

  // Assets
  getSchoolAssets: async (): Promise<SchoolAsset[]> => {
    return getStorage<SchoolAsset>(STORAGE_KEYS.ASSETS, SEED_ASSETS);
  },
  saveSchoolAsset: async (item: Partial<SchoolAsset>): Promise<SchoolAsset> => {
    const list = getStorage<SchoolAsset>(STORAGE_KEYS.ASSETS, SEED_ASSETS);
    const idx = list.findIndex((a) => a.id === item.id);
    const newItem: SchoolAsset = {
      id: item.id || `ast-${Date.now()}`,
      assetTag: item.assetTag || `AST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: item.name || 'Asset Item',
      category: item.category || 'Furniture',
      location: item.location || 'Main Office',
      department: item.department || 'General Admin',
      serialNumber: item.serialNumber || 'SN-UNKNOWN',
      purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0],
      purchaseCostUGX: item.purchaseCostUGX || 500000,
      currentCondition: item.currentCondition || 'Good',
      qrBarcodeCode: item.qrBarcodeCode || `QR-${Date.now()}`,
      warrantyExpiry: item.warrantyExpiry,
      maintenanceLogs: item.maintenanceLogs || [],
      createdAt: item.createdAt || new Date().toISOString().split('T')[0],
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.ASSETS, list);
    return newItem;
  },

  // Inventory
  getInventoryItems: async (): Promise<InventoryItem[]> => {
    return getStorage<InventoryItem>(STORAGE_KEYS.INVENTORY, SEED_INVENTORY_ITEMS);
  },
  saveInventoryItem: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const list = getStorage<InventoryItem>(STORAGE_KEYS.INVENTORY, SEED_INVENTORY_ITEMS);
    const idx = list.findIndex((i) => i.id === item.id);
    const newItem: InventoryItem = {
      id: item.id || `inv-${Date.now()}`,
      itemCode: item.itemCode || `INV-${Math.floor(100 + Math.random() * 900)}`,
      name: item.name || 'Store Item',
      category: item.category || 'Office Supplies',
      quantityInStock: item.quantityInStock ?? 50,
      unitOfMeasure: item.unitOfMeasure || 'Pieces',
      reorderThreshold: item.reorderThreshold ?? 10,
      unitPriceUGX: item.unitPriceUGX || 15000,
      supplierName: item.supplierName || 'Local Supplier Ltd',
      locationStore: item.locationStore || 'Main Store',
      lastRestockedDate: item.lastRestockedDate || new Date().toISOString().split('T')[0],
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.INVENTORY, list);
    return newItem;
  },

  // Policies
  getSchoolPolicies: async (): Promise<SchoolPolicyDocument[]> => {
    const list = getStorage<SchoolPolicyDocument>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    return list.map((p) => ({
      ...p,
      code: p.code || `POL-${p.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`,
      summary: p.summary || p.description || '',
      description: p.description || p.summary || '',
      mandatoryReadForRoles: p.mandatoryReadForRoles || p.targetRoles || ['All Teachers', 'Staff'],
      targetRoles: p.targetRoles || p.mandatoryReadForRoles || ['All Teachers', 'Staff'],
      approvedBy: p.approvedBy || p.author || 'Board of Governors',
      author: p.author || p.approvedBy || 'School Administration',
    }));
  },
  saveSchoolPolicy: async (item: Partial<SchoolPolicyDocument>): Promise<SchoolPolicyDocument> => {
    const list = getStorage<SchoolPolicyDocument>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const idx = list.findIndex((p) => p.id === item.id);
    const id = item.id || `pol-${Date.now()}`;
    const code = item.code || `POL-${Date.now().toString().slice(-4)}`;
    const summary = item.summary || item.description || '';
    const description = item.description || item.summary || '';
    const roles = item.mandatoryReadForRoles || item.targetRoles || ['All Teachers', 'Staff'];
    const approved = item.approvedBy || item.author || 'Board of Governors';
    const newItem: SchoolPolicyDocument = {
      id,
      code,
      title: item.title || 'School Policy Title',
      category: item.category || 'Safeguarding',
      version: item.version || 'v1.0',
      status: item.status || 'Approved & Published',
      effectiveDate: item.effectiveDate || new Date().toISOString().split('T')[0],
      author: approved,
      approvedBy: approved,
      fileSizeKb: item.fileSizeKb || 500,
      targetRoles: roles,
      mandatoryReadForRoles: roles,
      acknowledgementCount: item.acknowledgementCount ?? 0,
      description,
      summary,
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.POLICIES, list);
    return newItem;
  },

  // Insurance
  getInsurancePolicies: async (): Promise<SchoolInsurancePolicy[]> => {
    return getStorage<SchoolInsurancePolicy>(STORAGE_KEYS.INSURANCE, SEED_INSURANCE);
  },
  saveInsurancePolicy: async (item: Partial<SchoolInsurancePolicy>): Promise<SchoolInsurancePolicy> => {
    const list = getStorage<SchoolInsurancePolicy>(STORAGE_KEYS.INSURANCE, SEED_INSURANCE);
    const idx = list.findIndex((i) => i.id === item.id);
    const newItem: SchoolInsurancePolicy = {
      id: item.id || `ins-${Date.now()}`,
      policyNumber: item.policyNumber || `INS-${Math.floor(1000 + Math.random() * 9000)}`,
      policyName: item.policyName || 'School Policy Cover',
      providerName: item.providerName || 'Insurance Provider',
      coverageType: item.coverageType || 'Student Medical & Accident',
      startDate: item.startDate || new Date().toISOString().split('T')[0],
      expiryDate: item.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      premiumAmountUGX: item.premiumAmountUGX || 0,
      coverageLimitUGX: item.coverageLimitUGX || 0,
      status: item.status || 'Active',
      contactPerson: item.contactPerson || '',
      contactPhone: item.contactPhone || '',
      emergencyClaimHotline: item.emergencyClaimHotline,
      coveredCount: item.coveredCount,
      documentsUrl: item.documentsUrl,
      notes: item.notes,
      createdAt: item.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.INSURANCE, list);
    return newItem;
  },
  deleteInsurancePolicy: async (id: string): Promise<boolean> => {
    const list = getStorage<SchoolInsurancePolicy>(STORAGE_KEYS.INSURANCE, SEED_INSURANCE).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.INSURANCE, list);
    return true;
  },

  // Admin Tasks
  getAdminTasks: async (): Promise<AdminTaskNotice[]> => {
    return getStorage<AdminTaskNotice>(STORAGE_KEYS.ADMIN_TASKS, SEED_ADMIN_TASKS);
  },
  saveAdminTask: async (item: Partial<AdminTaskNotice>): Promise<AdminTaskNotice> => {
    const list = getStorage<AdminTaskNotice>(STORAGE_KEYS.ADMIN_TASKS, SEED_ADMIN_TASKS);
    const idx = list.findIndex((t) => t.id === item.id);
    const newItem: AdminTaskNotice = {
      id: item.id || `tsk-${Date.now()}`,
      title: item.title || 'Admin Task',
      type: item.type || 'Office Task',
      priority: item.priority || 'Routine',
      assignedTo: item.assignedTo || 'Unassigned',
      dueDate: item.dueDate,
      status: item.status || 'Pending',
      description: item.description || '',
      createdAt: item.createdAt || new Date().toISOString().split('T')[0],
    };
    if (idx >= 0) list[idx] = newItem;
    else list.unshift(newItem);
    setStorage(STORAGE_KEYS.ADMIN_TASKS, list);
    return newItem;
  },

  // Aliases for V7 UI Page compatibility
  getIncidentReports: async (): Promise<any[]> => {
    return v7Api.getSchoolIncidents();
  },
  saveIncidentReport: async (item: any): Promise<any> => {
    return v7Api.saveSchoolIncident(item);
  },
  deleteIncidentReport: async (id: string): Promise<boolean> => {
    const list = getStorage<SchoolIncident>(STORAGE_KEYS.INCIDENTS, SEED_INCIDENTS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.INCIDENTS, list);
    return true;
  },
  getCpdRecords: async (): Promise<any[]> => {
    return v7Api.getCPDTrainings();
  },
  saveCpdRecord: async (item: any): Promise<any> => {
    return v7Api.saveCPDTraining(item);
  },
  deleteCpdRecord: async (id: string): Promise<boolean> => {
    const list = getStorage<CPDTraining>(STORAGE_KEYS.CPD, SEED_CPD_TRAININGS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.CPD, list);
    return true;
  },
  getLeaveRequests: async (): Promise<any[]> => {
    return v7Api.getStaffLeaveRequests();
  },
  saveLeaveRequest: async (item: any): Promise<any> => {
    return v7Api.saveStaffLeaveRequest(item);
  },
  deleteLeaveRequest: async (id: string): Promise<boolean> => {
    const list = getStorage<StaffLeaveRequest>(STORAGE_KEYS.STAFF_LEAVE, SEED_STAFF_LEAVE).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.STAFF_LEAVE, list);
    return true;
  },
  getAppraisals: async (): Promise<any[]> => {
    return v7Api.getStaffAppraisals();
  },
  saveAppraisal: async (item: any): Promise<any> => {
    return v7Api.saveStaffAppraisal(item);
  },
  deleteAppraisal: async (id: string): Promise<boolean> => {
    const list = getStorage<StaffAppraisal>(STORAGE_KEYS.APPRAISALS, SEED_APPRAISALS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.APPRAISALS, list);
    return true;
  },
  deleteSchoolAsset: async (id: string): Promise<boolean> => {
    const list = getStorage<SchoolAsset>(STORAGE_KEYS.ASSETS, SEED_ASSETS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.ASSETS, list);
    return true;
  },
  deleteInventoryItem: async (id: string): Promise<boolean> => {
    const list = getStorage<InventoryItem>(STORAGE_KEYS.INVENTORY, SEED_INVENTORY_ITEMS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.INVENTORY, list);
    return true;
  },
  deleteSchoolPolicy: async (id: string): Promise<boolean> => {
    const list = getStorage<SchoolPolicyDocument>(STORAGE_KEYS.POLICIES, SEED_POLICIES).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.POLICIES, list);
    return true;
  },
  deleteAdminTask: async (id: string): Promise<boolean> => {
    const list = getStorage<AdminTaskNotice>(STORAGE_KEYS.ADMIN_TASKS, SEED_ADMIN_TASKS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.ADMIN_TASKS, list);
    return true;
  },
  deleteStaffProfile: async (id: string): Promise<boolean> => {
    const list = getStorage<StaffProfile>(STORAGE_KEYS.STAFF_HR, SEED_STAFF_PROFILES).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.STAFF_HR, list);
    return true;
  },
  deleteStudentMedicalProfile: async (id: string): Promise<boolean> => {
    const list = getStorage<StudentMedicalProfile>(STORAGE_KEYS.MEDICAL, SEED_MEDICAL_PROFILES).filter((x) => x.studentId !== id);
    setStorage(STORAGE_KEYS.MEDICAL, list);
    return true;
  },
  deleteSafeguardingCase: async (id: string): Promise<boolean> => {
    const list = getStorage<SafeguardingCase>(STORAGE_KEYS.SAFEGUARDING, SEED_SAFEGUARDING_CASES).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.SAFEGUARDING, list);
    return true;
  },
  deleteWelfareObservation: async (id: string): Promise<boolean> => {
    const list = getStorage<WelfareObservation>(STORAGE_KEYS.WELFARE, SEED_WELFARE_OBSERVATIONS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.WELFARE, list);
    return true;
  },
  deleteBehaviourRecord: async (id: string): Promise<boolean> => {
    const list = getStorage<BehaviourRecord>(STORAGE_KEYS.BEHAVIOUR, SEED_BEHAVIOUR_RECORDS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.BEHAVIOUR, list);
    return true;
  },
  deleteCounsellingSession: async (id: string): Promise<boolean> => {
    const list = getStorage<CounsellingSession>(STORAGE_KEYS.COUNSELLING, SEED_COUNSELLING_SESSIONS).filter((x) => x.id !== id);
    setStorage(STORAGE_KEYS.COUNSELLING, list);
    return true;
  },
};
