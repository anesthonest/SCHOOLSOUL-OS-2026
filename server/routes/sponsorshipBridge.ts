import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { writeAtomicFile } from '../db/store';
import type {
  SponsorProfile,
  SponsorType,
  SponsorSupportType,
  SponsorVerificationStatus,
  StudentOpportunityProfile,
  StudentOpportunityVisibility,
  ProjectSupportRequest,
  SchoolProgramSponsorship,
  ScholarshipOpportunity,
  SponsorInterestRequest,
  OpportunityApplication,
  EquipmentSupportRecord,
  ControlledOpportunityMessage,
  SponsorshipAuditLog,
  SafeguardingReport,
  OpportunityMatchResult,
  SponsorImpactReport,
  RoleType,
} from '../../src/types';

export const sponsorshipRouter = Router();

// ============================================================================
// PERSISTENT MULTI-TENANT STORAGE & AUDIT LOGGING
// ============================================================================

interface SponsorshipDatabase {
  sponsors: SponsorProfile[];
  opportunityProfiles: StudentOpportunityProfile[];
  projectRequests: ProjectSupportRequest[];
  schoolPrograms: SchoolProgramSponsorship[];
  scholarships: ScholarshipOpportunity[];
  interestRequests: SponsorInterestRequest[];
  applications: OpportunityApplication[];
  equipmentRecords: EquipmentSupportRecord[];
  messages: ControlledOpportunityMessage[];
  auditLogs: SponsorshipAuditLog[];
  safeguardingReports: SafeguardingReport[];
}

const SPONSORSHIP_FILE = path.join(process.cwd(), 'data', 'sponsorship_db.json');

function loadPersistedStore(): Record<string, SponsorshipDatabase> {
  try {
    if (fs.existsSync(SPONSORSHIP_FILE)) {
      const raw = fs.readFileSync(SPONSORSHIP_FILE, 'utf-8');
      if (raw && raw.trim().length > 0) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error('Failed to load persisted sponsorship database, falling back to memory store:', err);
  }
  return {};
}

const memoryStore: Record<string, SponsorshipDatabase> = loadPersistedStore();

export function saveSponsorshipDb(): void {
  try {
    writeAtomicFile(SPONSORSHIP_FILE, memoryStore);
  } catch (err) {
    console.error('Failed to atomically persist sponsorship database:', err);
  }
}

export function resolveSchoolId(req: Request): string {
  const authUser = (req as any).user;
  const headerTenant = (req.headers['x-school-id'] || req.headers['x-tenant-id']) as string;
  // If user is authenticated and not Super Admin, their JWT schoolId is strictly authoritative
  if (authUser?.schoolId && authUser.role !== 'Super Admin' && authUser.role !== 'Platform Administrator') {
    return authUser.schoolId;
  }
  return headerTenant || authUser?.schoolId || (req.body?.schoolId as string) || (req.query?.schoolId as string) || 'school-001';
}

function getSchoolDb(schoolId: string = 'school-001'): SponsorshipDatabase {
  if (!memoryStore[schoolId]) {
    const now = new Date().toISOString();

    // Default Seed Data
    const defaultSponsors: SponsorProfile[] = [
      {
        id: 'spon-afri-tech-foundation',
        name: 'AfriTech Educational Foundation',
        organizationType: 'FOUNDATION',
        country: 'Uganda',
        website: 'https://afritech-foundation.org',
        officialContactEmail: 'partnerships@afritech-foundation.org',
        officialContactPhone: '+256 772 100 200',
        purpose: 'Advancing secondary school STEM, robotics labs, and renewable energy education across East Africa.',
        supportCategories: ['SCHOLARSHIP', 'EQUIPMENT', 'PROJECT_FUNDING', 'MENTORSHIP', 'INNOVATION_GRANT'],
        verificationStatus: 'VERIFIED',
        verifiedByAdminId: 'usr-admin-1',
        verifiedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        verificationNotes: 'Verified via NGO registration certificate & official university partner endorsement.',
        riskScore: 2,
        isSafeguardTermsAccepted: true,
        termsAcceptedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: now,
      },
      {
        id: 'spon-innovate-uganda-csr',
        name: 'Nexus Telecom & Innovation CSR',
        organizationType: 'CORPORATE_CSR',
        country: 'Uganda',
        website: 'https://nexustelecom.co.ug/csr',
        officialContactEmail: 'community-csr@nexustelecom.co.ug',
        officialContactPhone: '+256 701 450 900',
        purpose: 'Bridging digital divide through high-speed connectivity, computer lab grants, and student coding scholarships.',
        supportCategories: ['FEES_SUPPORT', 'EQUIPMENT', 'SCHOOL_PROGRAM', 'TRAINING', 'INTERNSHIP'],
        verificationStatus: 'VERIFIED',
        verifiedByAdminId: 'usr-admin-1',
        verifiedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        verificationNotes: 'Registered corporate entity. CSR agreement vetted by school board.',
        riskScore: 5,
        isSafeguardTermsAccepted: true,
        termsAcceptedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: now,
      },
      {
        id: 'spon-green-future-trust',
        name: 'Green Horizon Environmental Trust',
        organizationType: 'NGO',
        country: 'Kenya',
        website: 'https://greenhorizon-trust.org',
        officialContactEmail: 'grants@greenhorizon-trust.org',
        purpose: 'Supporting student ecological inventions, agroforestry projects, and clean community water systems.',
        supportCategories: ['PROJECT_FUNDING', 'COMPETITION_FUNDING', 'CLUB_SUPPORT', 'INNOVATION_GRANT'],
        verificationStatus: 'UNDER_REVIEW',
        riskScore: 12,
        isSafeguardTermsAccepted: true,
        termsAcceptedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: now,
      },
    ];

    const defaultOpportunityProfiles: StudentOpportunityProfile[] = [
      {
        id: 'opp-prof-student-1',
        schoolId,
        studentId: 'usr-student-1',
        candidateId: 'SS-CANDIDATE-2048',
        ageGradeBand: 'Senior Secondary (16-18)',
        visibility: 'APPROVED_SPONSOR_DISCOVERY',
        approvedInterests: ['Clean Water Technology', 'Python Automation', 'IoT Microcontrollers', 'Sustainable Agriculture'],
        verifiedSkills: [
          { skillName: 'Environmental Science & Sustainability', category: 'Research', level: 'PROFICIENT', verifiedCount: 3 },
          { skillName: 'Python Programming & Automation', category: 'Technical', level: 'ADVANCED', verifiedCount: 3 },
          { skillName: 'Collaborative Team Leadership', category: 'Leadership', level: 'CAPABLE', verifiedCount: 2 },
          { skillName: 'Student Enterprise & Financial Literacy', category: 'Entrepreneurship', level: 'DEVELOPING', verifiedCount: 1 },
        ],
        verifiedProjectsCount: 3,
        verifiedAchievementsCount: 2,
        missionsCompletedCount: 2,
        scorecard: {
          innovation: 9,
          technicalSkills: 8,
          leadership: 8,
          communication: 7,
          projectExperience: 9,
        },
        seekingSupportTypes: ['EQUIPMENT', 'PROJECT_FUNDING', 'MENTORSHIP', 'SCHOLARSHIP'],
        goals: [
          'Deploy multi-stage solar water filtration unit in sub-county health center',
          'Acquire programmable microcontroller development kit',
          'Compete in National Secondary STEM Olympiad',
        ],
        schoolApprovalStatus: 'APPROVED',
        schoolApprovedBy: 'usr-admin-1',
        schoolApprovedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        parentConsentRequired: true,
        parentConsentStatus: 'APPROVED',
        parentConsentGivenAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        parentNotes: 'Parent John Ssekandi approved student opportunity profile for STEM and university scholarship bridge.',
        updatedAt: now,
      },
      {
        id: 'opp-prof-student-2',
        schoolId,
        studentId: 'usr-student-2',
        candidateId: 'SS-CANDIDATE-4112',
        ageGradeBand: 'Senior Secondary (15-17)',
        visibility: 'APPROVED_SPONSOR_DISCOVERY',
        approvedInterests: ['Solar Irrigation Systems', 'Embedded Robotics', 'Data Science', 'Debate & Public Speaking'],
        verifiedSkills: [
          { skillName: 'Robotics & Microcontroller Engineering', category: 'Technical', level: 'ADVANCED', verifiedCount: 4 },
          { skillName: 'Renewable Energy Systems', category: 'Technical', level: 'PROFICIENT', verifiedCount: 2 },
          { skillName: 'Public Debate & Oratory', category: 'Communication', level: 'ADVANCED', verifiedCount: 3 },
        ],
        verifiedProjectsCount: 2,
        verifiedAchievementsCount: 3,
        missionsCompletedCount: 3,
        scorecard: {
          innovation: 8,
          technicalSkills: 9,
          leadership: 9,
          communication: 9,
          projectExperience: 8,
        },
        seekingSupportTypes: ['SCHOLARSHIP', 'EQUIPMENT', 'TRAINING'],
        goals: ['Attain engineering scholarship', 'Build autonomous soil moisture telemetry mesh'],
        schoolApprovalStatus: 'APPROVED',
        schoolApprovedBy: 'usr-admin-1',
        schoolApprovedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        parentConsentRequired: true,
        parentConsentStatus: 'APPROVED',
        parentConsentGivenAt: new Date(Date.now() - 9 * 86400000).toISOString(),
        updatedAt: now,
      },
      {
        id: 'opp-prof-student-3',
        schoolId,
        studentId: 'usr-student-3',
        candidateId: 'SS-CANDIDATE-8094',
        ageGradeBand: 'Junior Secondary (13-15)',
        visibility: 'ELIGIBLE_FOR_OPPORTUNITIES',
        approvedInterests: ['Creative Writing', 'Community Journalism', 'Web Design'],
        verifiedSkills: [
          { skillName: 'Literary & Technical Writing', category: 'Communication', level: 'CAPABLE', verifiedCount: 2 },
          { skillName: 'Basic Web Development', category: 'Digital', level: 'DEVELOPING', verifiedCount: 1 },
        ],
        verifiedProjectsCount: 1,
        verifiedAchievementsCount: 1,
        missionsCompletedCount: 1,
        scorecard: {
          innovation: 7,
          technicalSkills: 6,
          leadership: 6,
          communication: 8,
          projectExperience: 6,
        },
        seekingSupportTypes: ['EQUIPMENT', 'CLUB_SUPPORT', 'TRAINING'],
        goals: ['Publish student science digest magazine', 'Acquire tablet for digital layout design'],
        schoolApprovalStatus: 'PENDING',
        parentConsentRequired: true,
        parentConsentStatus: 'PENDING',
        updatedAt: now,
      },
    ];

    const defaultProjectRequests: ProjectSupportRequest[] = [
      {
        id: 'proj-req-1',
        schoolId,
        projectId: 'proj-water-filter',
        projectTitle: 'Solar-Powered Biological Water Column Filtration',
        projectCategory: 'Clean Technology & Health',
        teamLeadCandidateId: 'SS-CANDIDATE-2048',
        teamName: 'HydroPure Innovation Team',
        memberCount: 4,
        summary: 'A triple-stage solar-assisted gravity water column purifying contaminated river runoff for rural clinics.',
        materialsNeeded: ['12V Solar Panel (50W)', 'Submersible Micro-Pump', 'Optical UV Sterilization Tube', 'Quartz Sand & Active Charcoal'],
        supportTypesNeeded: ['EQUIPMENT', 'PROJECT_FUNDING', 'MENTORSHIP'],
        estimatedBudget: 350,
        currency: 'USD',
        schoolApprovalStatus: 'APPROVED',
        approvedByAdminId: 'usr-admin-1',
        activeSponsorInterestCount: 2,
        status: 'OPEN',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'proj-req-2',
        schoolId,
        projectId: 'proj-smart-farm',
        projectTitle: 'Autonomous Soil Moisture & Drip Irrigation Telemetry',
        projectCategory: 'Agro-Tech & IoT',
        teamLeadCandidateId: 'SS-CANDIDATE-4112',
        teamName: 'GreenGrid Robotics Club',
        memberCount: 3,
        summary: 'LoRa/GSM-connected sensors measuring soil hydration and opening solenoid drip valves to conserve 40% water.',
        materialsNeeded: ['ESP32 Microcontrollers (x4)', 'Capacitive Soil Moisture Sensors', '12V Solenoid Valves', 'Lithium Battery Packs'],
        supportTypesNeeded: ['EQUIPMENT', 'INNOVATION_GRANT'],
        estimatedBudget: 420,
        currency: 'USD',
        schoolApprovalStatus: 'APPROVED',
        approvedByAdminId: 'usr-admin-1',
        activeSponsorInterestCount: 1,
        status: 'OPEN',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ];

    const defaultSchoolPrograms: SchoolProgramSponsorship[] = [
      {
        id: 'prog-robotics-lab',
        schoolId,
        programName: 'Secondary STEM & Robotics Innovation Center',
        category: 'ROBOTICS',
        description: 'Equipping 120 students with hands-on electronics, robotics kits, and 3D prototyping tools for regional competitions.',
        targetStudentsCount: 120,
        equipmentNeeded: ['10 Arduino Robotics Starter Kits', '2 Multi-Filament 3D Printers', '5 Soldering Stations', 'Oscilloscope'],
        targetBudget: 3200,
        currentFunding: 1800,
        currency: 'USD',
        status: 'ACTIVE_SUPPORTED',
        sponsorIds: ['spon-afri-tech-foundation', 'spon-innovate-uganda-csr'],
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      },
      {
        id: 'prog-clean-tech-nursery',
        schoolId,
        programName: 'School Agroforestry & Solar Irrigation Lab',
        category: 'AGRICULTURE',
        description: 'Establishing sustainable tree seedling propagation and solar drip irrigation for practical biology & agriculture curriculum.',
        targetStudentsCount: 85,
        equipmentNeeded: ['Solar Pumping Unit', 'Shade Netting (500sqm)', 'Soil Testing Kits', 'Seedling Trays'],
        targetBudget: 1500,
        currentFunding: 600,
        currency: 'USD',
        status: 'APPROVED_SEEKING_SPONSORS',
        sponsorIds: ['spon-green-future-trust'],
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ];

    const defaultScholarships: ScholarshipOpportunity[] = [
      {
        id: 'sch-stem-2026',
        schoolId,
        sponsorId: 'spon-afri-tech-foundation',
        sponsorName: 'AfriTech Educational Foundation',
        sponsorType: 'FOUNDATION',
        title: 'East Africa Secondary STEM Excellence Scholarship 2026/2027',
        description: 'Covers full tuition, lab fees, and annual innovation stipend for high-performing secondary students in physics, coding, or biology.',
        supportType: 'FULL_TUITION',
        amountValue: 1200,
        currency: 'USD',
        eligibilityCriteria: ['Form 2 to Form 4 students', 'Minimum 2 verified STEM skills', 'Active participation in school projects or missions'],
        eligibleGradeBands: ['Senior Secondary (15-17)', 'Senior Secondary (16-18)'],
        targetSkillCategories: ['Technical', 'Research', 'Digital'],
        deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
        startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        expiryDate: new Date(Date.now() + 50 * 86400000).toISOString(),
        applicationMethod: 'INTERNAL_SCHOOLSOUL_BRIDGE',
        verificationStatus: 'VERIFIED_LEGITIMATE',
        isSchoolApproved: true,
        approvedByAdminId: 'usr-admin-1',
        status: 'OPEN',
        applicationsCount: 8,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'sch-digital-future',
        schoolId,
        sponsorId: 'spon-innovate-uganda-csr',
        sponsorName: 'Nexus Telecom & Innovation CSR',
        sponsorType: 'CORPORATE_CSR',
        title: 'Future Tech Leaders Coding & Device Grant',
        description: 'Provides a new dedicated coding laptop, 4G mobile broadband router for 1 year, and mentorship from senior software engineers.',
        supportType: 'EQUIPMENT_GRANT',
        amountValue: 800,
        currency: 'USD',
        eligibilityCriteria: ['Demonstrated proficiency in Python/JS or Robotics', 'Parental consent completed', 'School recommendation'],
        eligibleGradeBands: ['Senior Secondary (15-17)', 'Senior Secondary (16-18)'],
        targetSkillCategories: ['Technical', 'Digital'],
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        expiryDate: new Date(Date.now() + 35 * 86400000).toISOString(),
        applicationMethod: 'INTERNAL_SCHOOLSOUL_BRIDGE',
        verificationStatus: 'VERIFIED_LEGITIMATE',
        isSchoolApproved: true,
        approvedByAdminId: 'usr-admin-1',
        status: 'OPEN',
        applicationsCount: 5,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ];

    const defaultInterests: SponsorInterestRequest[] = [
      {
        id: 'int-1',
        schoolId,
        sponsorId: 'spon-afri-tech-foundation',
        sponsorName: 'AfriTech Educational Foundation',
        sponsorType: 'FOUNDATION',
        targetType: 'PROJECT_REQUEST',
        targetId: 'proj-req-1',
        targetTitle: 'Solar-Powered Biological Water Column Filtration',
        offeredSupportType: 'PROJECT_FUNDING',
        offeredDetails: 'Pledging $350 grant for water purification hardware components and remote mentorship from our senior chemical engineer.',
        offeredValue: 350,
        currency: 'USD',
        status: 'APPROVED',
        schoolReviewNotes: 'Vetted and approved. Safe educational project with high community impact.',
        reviewedByAdminId: 'usr-admin-1',
        reviewedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        parentConsentStatus: 'APPROVED',
        parentConsentGivenAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        studentAcceptanceStatus: 'ACCEPTED',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'int-2',
        schoolId,
        sponsorId: 'spon-innovate-uganda-csr',
        sponsorName: 'Nexus Telecom & Innovation CSR',
        sponsorType: 'CORPORATE_CSR',
        targetType: 'CANDIDATE_PROFILE',
        targetId: 'SS-CANDIDATE-2048',
        targetTitle: 'Candidate SS-CANDIDATE-2048 (STEM & Automation)',
        offeredSupportType: 'EQUIPMENT',
        offeredDetails: 'Offering 1 ThinkPad Developer Laptop with preloaded Linux/Python toolchains and LoRa telemetry kit.',
        offeredValue: 750,
        currency: 'USD',
        status: 'SCHOOL_REVIEW',
        schoolReviewNotes: 'Reviewing hardware specifications with DOS and ICT Head.',
        reviewedByAdminId: 'usr-admin-1',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    const defaultApplications: OpportunityApplication[] = [
      {
        id: 'app-1',
        schoolId,
        opportunityId: 'sch-stem-2026',
        opportunityTitle: 'East Africa Secondary STEM Excellence Scholarship 2026/2027',
        candidateId: 'SS-CANDIDATE-2048',
        studentId: 'usr-student-1',
        studentName: 'Allan Ssekandi',
        gradeBand: 'Senior Secondary (16-18)',
        statementOfPurpose: 'I aim to complete my secondary physics and applied chemistry studies while finalizing our community water purification column.',
        supportingEvidenceSummary: [
          '3 verified STEM skill endorsements (Dr. Nabakooza)',
          'Completed Clean Water Community Mission',
          'Lead developer of Solar Biological Column project',
        ],
        teacherRecommendationId: 'usr-teacher-1',
        teacherRecommendationNote: 'Allan demonstrates exceptional problem-solving capability, ethical leadership, and consistent academic diligence.',
        status: 'SPONSOR_REVIEW',
        schoolReviewDecision: 'APPROVED_FOR_SPONSOR',
        schoolReviewedBy: 'usr-admin-1',
        schoolReviewedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        parentApprovedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        updatedAt: now,
      },
    ];

    const defaultEquipment: EquipmentSupportRecord[] = [
      {
        id: 'eq-1',
        schoolId,
        sponsorId: 'spon-afri-tech-foundation',
        sponsorName: 'AfriTech Educational Foundation',
        itemCategory: 'ROBOTICS_KIT',
        itemName: 'Arduino Mega & IoT Sensor Master Kit (x5)',
        serialNumberOrBatch: 'AF-ARD-2026-B88',
        quantity: 5,
        recipientType: 'STUDENT_TEAM',
        recipientTeamOrLabName: 'Robotics & STEM Lab (Team HydroPure / GreenGrid)',
        status: 'ASSIGNED_TO_STUDENT',
        estimatedValue: 450,
        currency: 'USD',
        deliveredAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        inspectedByStaffId: 'usr-teacher-2',
        assignedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        notes: 'Inspected by Eng. David Ouma. Registered in SchoolSoul asset registry.',
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
      {
        id: 'eq-2',
        schoolId,
        sponsorId: 'spon-innovate-uganda-csr',
        sponsorName: 'Nexus Telecom & Innovation CSR',
        itemCategory: 'LAPTOP',
        itemName: 'Lenovo ThinkPad Core i5 16GB SSD Coding Laptop',
        serialNumberOrBatch: 'NX-TP-UG-9921',
        quantity: 1,
        recipientType: 'INDIVIDUAL_STUDENT',
        recipientCandidateId: 'SS-CANDIDATE-2048',
        status: 'DELIVERED_TO_SCHOOL',
        estimatedValue: 650,
        currency: 'USD',
        deliveredAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        inspectedByStaffId: 'usr-admin-1',
        notes: 'Delivered to Principal Office. Scheduled for student assignment upon final parent sign-off.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ];

    const defaultMessages: ControlledOpportunityMessage[] = [
      {
        id: 'msg-1',
        schoolId,
        threadId: 'thread-int-1',
        sponsorId: 'spon-afri-tech-foundation',
        sponsorName: 'AfriTech Educational Foundation',
        senderType: 'SPONSOR',
        senderName: 'Dr. Clara Mutono (AfriTech Grants Chair)',
        recipientDescription: 'Supervised Project Team (HydroPure / SS-CANDIDATE-2048)',
        subject: 'Grant Approval & Technical Mentorship Protocol',
        content: 'Greetings SchoolSoul Academic Leadership. We are thrilled to approve the $350 grant for the Solar Water Column. Our chemical engineer Eng. Brenda will schedule bi-weekly supervised project reviews through SchoolSoul.',
        moderationStatus: 'APPROVED',
        moderatedByAdminId: 'usr-admin-1',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'msg-2',
        schoolId,
        threadId: 'thread-int-1',
        sponsorId: 'spon-afri-tech-foundation',
        sponsorName: 'AfriTech Educational Foundation',
        senderType: 'SCHOOL_ADMIN',
        senderName: 'Sister Beatrice (Headteacher / School Administrator)',
        recipientDescription: 'AfriTech Educational Foundation',
        subject: 'RE: Grant Approval & Technical Mentorship Protocol',
        content: 'Thank you AfriTech. The funds will be booked through the School Bursary Account with project disbursement codes. The teacher mentor Dr. Sarah Nabakooza will supervise all lab sessions.',
        moderationStatus: 'APPROVED',
        moderatedByAdminId: 'usr-admin-1',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    const defaultAuditLogs: SponsorshipAuditLog[] = [
      {
        id: 'aud-1',
        schoolId,
        action: 'SPONSOR_VERIFIED',
        performedByUserId: 'usr-admin-1',
        performedByName: 'Sister Beatrice (Administrator)',
        performedByRole: 'Super Administrator',
        targetEntityType: 'SPONSOR',
        targetEntityId: 'spon-afri-tech-foundation',
        details: 'Approved AfriTech Educational Foundation after NGO accreditation verification.',
        timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'aud-2',
        schoolId,
        action: 'OPPORTUNITY_PROFILE_APPROVED',
        performedByUserId: 'usr-admin-1',
        performedByName: 'Sister Beatrice (Administrator)',
        performedByRole: 'Super Administrator',
        targetEntityType: 'OPPORTUNITY_PROFILE',
        targetEntityId: 'SS-CANDIDATE-2048',
        details: 'Approved candidate profile for verified STEM opportunity discovery.',
        timestamp: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 'aud-3',
        schoolId,
        action: 'PARENT_CONSENT_RECORDED',
        performedByUserId: 'usr-parent-1',
        performedByName: 'John Ssekandi (Parent)',
        performedByRole: 'Parent',
        targetEntityType: 'PARENT_CONSENT',
        targetEntityId: 'SS-CANDIDATE-2048',
        details: 'Parent signed digital authorization for student scholarship and equipment support.',
        timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ];

    memoryStore[schoolId] = {
      sponsors: defaultSponsors,
      opportunityProfiles: defaultOpportunityProfiles,
      projectRequests: defaultProjectRequests,
      schoolPrograms: defaultSchoolPrograms,
      scholarships: defaultScholarships,
      interestRequests: defaultInterests,
      applications: defaultApplications,
      equipmentRecords: defaultEquipment,
      messages: defaultMessages,
      auditLogs: defaultAuditLogs,
      safeguardingReports: [],
    };
    saveSponsorshipDb();
  }
  return memoryStore[schoolId];
}

function logAudit(
  schoolId: string,
  action: string,
  userId: string,
  userName: string,
  role: RoleType | 'SPONSOR',
  targetType: SponsorshipAuditLog['targetEntityType'],
  targetId: string,
  details: string
) {
  const db = getSchoolDb(schoolId);
  const entry: SponsorshipAuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    action,
    performedByUserId: userId,
    performedByName: userName,
    performedByRole: role,
    targetEntityType: targetType,
    targetEntityId: targetId,
    details,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(entry);
  saveSponsorshipDb();
}

// ============================================================================
// 1. SPONSOR REGISTRATION, VERIFICATION & PROFILE ENDPOINTS
// ============================================================================

// Register new Sponsor (Pending Verification)
sponsorshipRouter.post('/sponsors/register', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const {
    name,
    organizationType,
    country,
    website,
    officialContactEmail,
    officialContactPhone,
    purpose,
    supportCategories,
  } = req.body;

  if (!name || !organizationType || !country || !officialContactEmail || !purpose) {
    return res.status(400).json({ error: 'Missing required sponsor registration parameters' });
  }

  const db = getSchoolDb(schoolId);
  const now = new Date().toISOString();
  const sponsorId = `spon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const newSponsor: SponsorProfile = {
    id: sponsorId,
    name,
    organizationType: organizationType as SponsorType,
    country,
    website,
    officialContactEmail,
    officialContactPhone,
    purpose,
    supportCategories: (supportCategories as SponsorSupportType[]) || ['SCHOLARSHIP'],
    verificationStatus: 'PENDING',
    riskScore: 10,
    isSafeguardTermsAccepted: true,
    termsAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  db.sponsors.push(newSponsor);

  logAudit(
    schoolId,
    'SPONSOR_REGISTERED',
    sponsorId,
    name,
    'SPONSOR',
    'SPONSOR',
    sponsorId,
    `New sponsor registration submitted: ${name} (${organizationType})`
  );

  res.status(201).json(newSponsor);
});

// List Sponsors (School Admin view / Public directory of verified sponsors)
sponsorshipRouter.get('/sponsors', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const status = req.query.status as string;
  const db = getSchoolDb(schoolId);

  let list = db.sponsors;
  if (status) {
    list = list.filter(s => s.verificationStatus === status);
  }

  res.json(list);
});

// Verify / Review Sponsor (School Admin only)
sponsorshipRouter.post('/sponsors/:id/verify', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const sponsorId = req.params.id;
  const { status, verificationNotes, adminId, adminName } = req.body;

  const db = getSchoolDb(schoolId);
  const sponsor = db.sponsors.find(s => s.id === sponsorId);
  if (!sponsor) {
    return res.status(404).json({ error: 'Sponsor not found' });
  }

  sponsor.verificationStatus = status as SponsorVerificationStatus;
  sponsor.verificationNotes = verificationNotes;
  sponsor.verifiedByAdminId = adminId || 'usr-admin-1';
  sponsor.verifiedAt = new Date().toISOString();
  sponsor.updatedAt = new Date().toISOString();

  if (status === 'VERIFIED') {
    sponsor.riskScore = Math.min(sponsor.riskScore, 5);
  }

  logAudit(
    schoolId,
    `SPONSOR_${status}`,
    adminId || 'usr-admin-1',
    adminName || 'Administrator',
    'Super Administrator',
    'SPONSOR',
    sponsorId,
    `Sponsor verification status updated to ${status}. Notes: ${verificationNotes || 'None'}`
  );

  res.json(sponsor);
});

// ============================================================================
// 2. STUDENT OPPORTUNITY PROFILES & ANONYMIZED DISCOVERY
// ============================================================================

// Discover Approved Anonymized Candidate Profiles (For Verified Sponsors & School)
sponsorshipRouter.get('/candidates', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const skillCategory = req.query.skill as string;
  const interest = req.query.interest as string;
  const supportType = req.query.supportType as string;

  const db = getSchoolDb(schoolId);

  // Filter only profiles approved for sponsor discovery or school-only depending on context
  let profiles = db.opportunityProfiles.filter(
    p => p.schoolApprovalStatus === 'APPROVED' && p.visibility === 'APPROVED_SPONSOR_DISCOVERY'
  );

  if (skillCategory) {
    profiles = profiles.filter(p => p.verifiedSkills.some(s => s.category.toLowerCase() === skillCategory.toLowerCase()));
  }

  if (interest) {
    profiles = profiles.filter(p => p.approvedInterests.some(i => i.toLowerCase().includes(interest.toLowerCase())));
  }

  if (supportType) {
    profiles = profiles.filter(p => p.seekingSupportTypes.includes(supportType as SponsorSupportType));
  }

  // Safe anonymized output without private student names, emails, phones, or addresses
  const safeCandidates = profiles.map(p => ({
    id: p.id,
    schoolId: p.schoolId,
    candidateId: p.candidateId,
    ageGradeBand: p.ageGradeBand,
    approvedInterests: p.approvedInterests,
    verifiedSkills: p.verifiedSkills,
    verifiedProjectsCount: p.verifiedProjectsCount,
    verifiedAchievementsCount: p.verifiedAchievementsCount,
    missionsCompletedCount: p.missionsCompletedCount,
    scorecard: p.scorecard,
    seekingSupportTypes: p.seekingSupportTypes,
    goals: p.goals,
    schoolApprovedAt: p.schoolApprovedAt,
    updatedAt: p.updatedAt,
  }));

  res.json(safeCandidates);
});

// Get Candidate Details by Candidate ID
sponsorshipRouter.get('/candidates/:candidateId', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const candidateId = req.params.candidateId;
  const db = getSchoolDb(schoolId);

  const profile = db.opportunityProfiles.find(p => p.candidateId === candidateId);
  if (!profile) {
    return res.status(404).json({ error: 'Candidate profile not found' });
  }

  // Anonymized candidate view
  res.json({
    id: profile.id,
    schoolId: profile.schoolId,
    candidateId: profile.candidateId,
    ageGradeBand: profile.ageGradeBand,
    approvedInterests: profile.approvedInterests,
    verifiedSkills: profile.verifiedSkills,
    verifiedProjectsCount: profile.verifiedProjectsCount,
    verifiedAchievementsCount: profile.verifiedAchievementsCount,
    missionsCompletedCount: profile.missionsCompletedCount,
    scorecard: profile.scorecard,
    seekingSupportTypes: profile.seekingSupportTypes,
    goals: profile.goals,
    schoolApprovedAt: profile.schoolApprovedAt,
    updatedAt: profile.updatedAt,
  });
});

// Get Student's Own Opportunity Profile (Authenticated Student/Parent/Teacher view)
sponsorshipRouter.get('/student-profile/:studentId', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const studentId = req.params.studentId;
  const db = getSchoolDb(schoolId);

  let profile = db.opportunityProfiles.find(p => p.studentId === studentId);
  if (!profile) {
    // Generate default profile if not exists
    const candidateNum = 2000 + db.opportunityProfiles.length + 1;
    profile = {
      id: `opp-prof-${studentId}`,
      schoolId,
      studentId,
      candidateId: `SS-CANDIDATE-${candidateNum}`,
      ageGradeBand: 'Secondary (14-17)',
      visibility: 'SCHOOL_ONLY',
      approvedInterests: ['Science', 'Technology', 'Community Impact'],
      verifiedSkills: [],
      verifiedProjectsCount: 0,
      verifiedAchievementsCount: 0,
      missionsCompletedCount: 0,
      scorecard: {
        innovation: 5,
        technicalSkills: 5,
        leadership: 5,
        communication: 5,
        projectExperience: 5,
      },
      seekingSupportTypes: ['SCHOLARSHIP', 'EQUIPMENT', 'MENTORSHIP'],
      goals: ['Develop STEM skills and build community solutions'],
      schoolApprovalStatus: 'PENDING',
      parentConsentRequired: true,
      parentConsentStatus: 'PENDING',
      updatedAt: new Date().toISOString(),
    };
    db.opportunityProfiles.push(profile);
  }

  res.json(profile);
});

// Update Student Opportunity Profile
sponsorshipRouter.put('/student-profile/:studentId', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const studentId = req.params.studentId;
  const db = getSchoolDb(schoolId);

  let profile = db.opportunityProfiles.find(p => p.studentId === studentId);
  if (!profile) {
    return res.status(404).json({ error: 'Opportunity profile not found' });
  }

  const { visibility, approvedInterests, seekingSupportTypes, goals } = req.body;

  if (visibility) profile.visibility = visibility as StudentOpportunityVisibility;
  if (approvedInterests) profile.approvedInterests = approvedInterests;
  if (seekingSupportTypes) profile.seekingSupportTypes = seekingSupportTypes;
  if (goals) profile.goals = goals;
  profile.updatedAt = new Date().toISOString();

  logAudit(
    schoolId,
    'OPPORTUNITY_PROFILE_UPDATED',
    studentId,
    'Student User',
    'Student',
    'OPPORTUNITY_PROFILE',
    profile.candidateId,
    `Updated opportunity profile preferences and visibility: ${profile.visibility}`
  );

  res.json(profile);
});

// School Approval of Student Profile for Sponsor Discovery
sponsorshipRouter.post('/student-profile/:studentId/school-approve', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const studentId = req.params.studentId;
  const { approved, adminId, adminName } = req.body;
  const db = getSchoolDb(schoolId);

  const profile = db.opportunityProfiles.find(p => p.studentId === studentId);
  if (!profile) {
    return res.status(404).json({ error: 'Opportunity profile not found' });
  }

  profile.schoolApprovalStatus = approved ? 'APPROVED' : 'REQUIRES_REVIEW';
  profile.schoolApprovedBy = adminId || 'usr-admin-1';
  profile.schoolApprovedAt = new Date().toISOString();
  if (approved) {
    profile.visibility = 'APPROVED_SPONSOR_DISCOVERY';
  }
  profile.updatedAt = new Date().toISOString();

  logAudit(
    schoolId,
    approved ? 'OPPORTUNITY_PROFILE_APPROVED' : 'OPPORTUNITY_PROFILE_REVIEW_FLAGGED',
    adminId || 'usr-admin-1',
    adminName || 'Administrator',
    'Super Administrator',
    'OPPORTUNITY_PROFILE',
    profile.candidateId,
    `School ${approved ? 'approved' : 'flagged'} candidate ${profile.candidateId} for sponsor discovery`
  );

  res.json(profile);
});

// Parent/Guardian Consent Recording
sponsorshipRouter.post('/student-profile/:studentId/parent-consent', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const studentId = req.params.studentId;
  const { consentApproved, parentId, parentName, notes } = req.body;
  const db = getSchoolDb(schoolId);

  const profile = db.opportunityProfiles.find(p => p.studentId === studentId);
  if (!profile) {
    return res.status(404).json({ error: 'Opportunity profile not found' });
  }

  profile.parentConsentStatus = consentApproved ? 'APPROVED' : 'DECLINED';
  profile.parentConsentGivenAt = new Date().toISOString();
  profile.parentNotes = notes || `${parentName || 'Parent'} recorded consent on ${new Date().toLocaleDateString()}`;
  profile.updatedAt = new Date().toISOString();

  logAudit(
    schoolId,
    consentApproved ? 'PARENT_CONSENT_APPROVED' : 'PARENT_CONSENT_DECLINED',
    parentId || 'usr-parent-1',
    parentName || 'Guardian',
    'Parent',
    'PARENT_CONSENT',
    profile.candidateId,
    `Parent ${consentApproved ? 'granted' : 'declined'} participation authorization for candidate ${profile.candidateId}`
  );

  res.json(profile);
});

// ============================================================================
// 3. PROJECT & SCHOOL PROGRAM SUPPORT REQUESTS
// ============================================================================

// List Project Support Requests
sponsorshipRouter.get('/projects', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const db = getSchoolDb(schoolId);
  res.json(db.projectRequests);
});

// Create Project Support Request
sponsorshipRouter.post('/projects', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const {
    projectId,
    projectTitle,
    projectCategory,
    teamLeadCandidateId,
    teamName,
    memberCount,
    summary,
    materialsNeeded,
    supportTypesNeeded,
    estimatedBudget,
    currency,
  } = req.body;

  if (!projectTitle || !summary || !estimatedBudget) {
    return res.status(400).json({ error: 'Missing required project support request details' });
  }

  const db = getSchoolDb(schoolId);
  const now = new Date().toISOString();
  const requestId = `proj-req-${Date.now()}`;

  const newRequest: ProjectSupportRequest = {
    id: requestId,
    schoolId,
    projectId,
    projectTitle,
    projectCategory: projectCategory || 'Innovation',
    teamLeadCandidateId: teamLeadCandidateId || 'SS-CANDIDATE-2048',
    teamName: teamName || 'Student Innovation Team',
    memberCount: Number(memberCount) || 1,
    summary,
    materialsNeeded: materialsNeeded || [],
    supportTypesNeeded: supportTypesNeeded || ['EQUIPMENT', 'PROJECT_FUNDING'],
    estimatedBudget: Number(estimatedBudget),
    currency: currency || 'USD',
    schoolApprovalStatus: 'PENDING',
    activeSponsorInterestCount: 0,
    status: 'OPEN',
    createdAt: now,
  };

  db.projectRequests.push(newRequest);

  logAudit(
    schoolId,
    'PROJECT_REQUEST_CREATED',
    teamLeadCandidateId || 'usr-student-1',
    teamName || 'Student Team',
    'Student',
    'OPPORTUNITY_PROFILE',
    requestId,
    `New project sponsorship request created: ${projectTitle}`
  );

  res.status(201).json(newRequest);
});

// School Approve Project Request
sponsorshipRouter.post('/projects/:id/school-approve', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const requestId = req.params.id;
  const { approved, adminId, adminName } = req.body;
  const db = getSchoolDb(schoolId);

  const request = db.projectRequests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Project request not found' });
  }

  request.schoolApprovalStatus = approved ? 'APPROVED' : 'REJECTED';
  request.approvedByAdminId = adminId || 'usr-admin-1';

  logAudit(
    schoolId,
    approved ? 'PROJECT_REQUEST_APPROVED' : 'PROJECT_REQUEST_REJECTED',
    adminId || 'usr-admin-1',
    adminName || 'Administrator',
    'Super Administrator',
    'OPPORTUNITY_PROFILE',
    requestId,
    `School ${approved ? 'approved' : 'rejected'} project support request: ${request.projectTitle}`
  );

  res.json(request);
});

// List School Program Sponsorships
sponsorshipRouter.get('/programs', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const db = getSchoolDb(schoolId);
  res.json(db.schoolPrograms);
});

// Create/Update School Program Sponsorship
sponsorshipRouter.post('/programs', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const { programName, category, description, targetStudentsCount, equipmentNeeded, targetBudget, currency } = req.body;

  const db = getSchoolDb(schoolId);
  const now = new Date().toISOString();
  const programId = `prog-${Date.now()}`;

  const newProgram: SchoolProgramSponsorship = {
    id: programId,
    schoolId,
    programName,
    category: category || 'STEM',
    description,
    targetStudentsCount: Number(targetStudentsCount) || 50,
    equipmentNeeded: equipmentNeeded || [],
    targetBudget: Number(targetBudget) || 1000,
    currentFunding: 0,
    currency: currency || 'USD',
    status: 'APPROVED_SEEKING_SPONSORS',
    sponsorIds: [],
    createdAt: now,
  };

  db.schoolPrograms.push(newProgram);

  res.status(201).json(newProgram);
});

// ============================================================================
// 4. SCHOLARSHIP BOARD
// ============================================================================

// List Scholarships
sponsorshipRouter.get('/scholarships', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const db = getSchoolDb(schoolId);
  const now = new Date().toISOString();

  // Return active and non-expired scholarships
  const activeScholarships = db.scholarships.filter(s => s.status === 'OPEN' && s.expiryDate >= now);
  res.json(activeScholarships);
});

// Create Scholarship Listing (Sponsor or School)
sponsorshipRouter.post('/scholarships', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const {
    sponsorId,
    sponsorName,
    sponsorType,
    title,
    description,
    supportType,
    amountValue,
    currency,
    eligibilityCriteria,
    eligibleGradeBands,
    targetSkillCategories,
    deadline,
  } = req.body;

  if (!title || !description || !deadline) {
    return res.status(400).json({ error: 'Missing required scholarship parameters' });
  }

  const db = getSchoolDb(schoolId);
  const now = new Date().toISOString();
  const scholarshipId = `sch-${Date.now()}`;

  const newScholarship: ScholarshipOpportunity = {
    id: scholarshipId,
    schoolId,
    sponsorId: sponsorId || 'spon-afri-tech-foundation',
    sponsorName: sponsorName || 'AfriTech Educational Foundation',
    sponsorType: (sponsorType as SponsorType) || 'FOUNDATION',
    title,
    description,
    supportType: supportType || 'FULL_TUITION',
    amountValue: Number(amountValue) || 1000,
    currency: currency || 'USD',
    eligibilityCriteria: eligibilityCriteria || [],
    eligibleGradeBands: eligibleGradeBands || ['Senior Secondary (16-18)'],
    targetSkillCategories: targetSkillCategories || ['Technical', 'Research'],
    deadline,
    startDate: now,
    expiryDate: new Date(new Date(deadline).getTime() + 7 * 86400000).toISOString(),
    applicationMethod: 'INTERNAL_SCHOOLSOUL_BRIDGE',
    verificationStatus: 'VERIFIED_LEGITIMATE',
    isSchoolApproved: true,
    approvedByAdminId: 'usr-admin-1',
    status: 'OPEN',
    applicationsCount: 0,
    createdAt: now,
  };

  db.scholarships.push(newScholarship);

  logAudit(
    schoolId,
    'SCHOLARSHIP_POSTED',
    sponsorId || 'usr-admin-1',
    sponsorName || 'Sponsor',
    'SPONSOR',
    'OPPORTUNITY_PROFILE',
    scholarshipId,
    `New scholarship opportunity published: ${title}`
  );

  res.status(201).json(newScholarship);
});

// ============================================================================
// 5. AI OPPORTUNITY MATCHING ENGINE & EXPLANATIONS
// ============================================================================

sponsorshipRouter.get('/matching/:studentId', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const studentId = req.params.studentId;
  const db = getSchoolDb(schoolId);

  const profile = db.opportunityProfiles.find(p => p.studentId === studentId);
  if (!profile) {
    return res.status(404).json({ error: 'Student opportunity profile not found' });
  }

  const results: OpportunityMatchResult[] = [];

  for (const scholarship of db.scholarships) {
    if (scholarship.status !== 'OPEN') continue;

    let score = 30; // base potential
    const reasons: string[] = [];
    const matchedSkills: string[] = [];
    const matchedInterests: string[] = [];

    // Match Grade Band
    if (scholarship.eligibleGradeBands.includes(profile.ageGradeBand)) {
      score += 25;
      reasons.push(`✓ Eligible grade level band (${profile.ageGradeBand})`);
    }

    // Match Skills
    for (const skill of profile.verifiedSkills) {
      if (scholarship.targetSkillCategories.includes(skill.category)) {
        score += 15;
        matchedSkills.push(`${skill.skillName} (${skill.level})`);
        reasons.push(`✓ Verified skill in ${skill.category}: ${skill.skillName}`);
      }
    }

    // Match Project Evidence
    if (profile.verifiedProjectsCount >= 2) {
      score += 15;
      reasons.push(`✓ Proven project experience (${profile.verifiedProjectsCount} verified school projects)`);
    }

    // Match Missions
    if (profile.missionsCompletedCount >= 1) {
      score += 10;
      reasons.push(`✓ Completed ${profile.missionsCompletedCount} real-world problem solving missions`);
    }

    const cappedScore = Math.min(score, 98);
    results.push({
      opportunityId: scholarship.id,
      opportunityTitle: scholarship.title,
      providerName: scholarship.sponsorName,
      matchScore: cappedScore,
      matchReasons: reasons,
      matchedSkills,
      matchedInterests,
      eligibilityStatus: cappedScore >= 65 ? 'ELIGIBLE' : 'PARTIALLY_ELIGIBLE',
    });
  }

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);

  res.json(results);
});

// ============================================================================
// 6. SPONSOR INTEREST REQUESTS & CONNECTION WORKFLOW
// ============================================================================

// List Sponsor Interests
sponsorshipRouter.get('/interests', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const sponsorId = req.query.sponsorId as string;
  const db = getSchoolDb(schoolId);

  let list = db.interestRequests;
  if (sponsorId) {
    list = list.filter(i => i.sponsorId === sponsorId);
  }

  res.json(list);
});

// Submit Sponsor Interest
sponsorshipRouter.post('/interests', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const {
    sponsorId,
    sponsorName,
    sponsorType,
    targetType,
    targetId,
    targetTitle,
    offeredSupportType,
    offeredDetails,
    offeredValue,
    currency,
  } = req.body;

  if (!sponsorId || !targetId || !offeredDetails) {
    return res.status(400).json({ error: 'Missing required sponsor interest parameters' });
  }

  const db = getSchoolDb(schoolId);
  const now = new Date().toISOString();
  const interestId = `int-${Date.now()}`;

  const newInterest: SponsorInterestRequest = {
    id: interestId,
    schoolId,
    sponsorId,
    sponsorName: sponsorName || 'Verified Sponsor',
    sponsorType: (sponsorType as SponsorType) || 'FOUNDATION',
    targetType: targetType || 'CANDIDATE_PROFILE',
    targetId,
    targetTitle: targetTitle || 'Opportunity Target',
    offeredSupportType: (offeredSupportType as SponsorSupportType) || 'PROJECT_FUNDING',
    offeredDetails,
    offeredValue: offeredValue ? Number(offeredValue) : undefined,
    currency: currency || 'USD',
    status: 'SCHOOL_REVIEW',
    createdAt: now,
  };

  db.interestRequests.push(newInterest);

  logAudit(
    schoolId,
    'SPONSOR_INTEREST_SUBMITTED',
    sponsorId,
    sponsorName || 'Sponsor',
    'SPONSOR',
    'INTEREST_REQUEST',
    interestId,
    `Sponsor expressed support interest for ${targetTitle}: ${offeredDetails}`
  );

  res.status(201).json(newInterest);
});

// School Review of Sponsor Interest
sponsorshipRouter.post('/interests/:id/school-review', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const interestId = req.params.id;
  const { decision, schoolReviewNotes, adminId, adminName } = req.body; // decision: 'APPROVE' | 'DECLINE' | 'REQUEST_PARENT'
  const db = getSchoolDb(schoolId);

  const interest = db.interestRequests.find(i => i.id === interestId);
  if (!interest) {
    return res.status(404).json({ error: 'Interest request not found' });
  }

  if (decision === 'APPROVE') {
    interest.status = 'APPROVED';
  } else if (decision === 'REQUEST_PARENT') {
    interest.status = 'PARENT_REVIEW';
  } else {
    interest.status = 'DECLINED';
  }

  interest.schoolReviewNotes = schoolReviewNotes;
  interest.reviewedByAdminId = adminId || 'usr-admin-1';
  interest.reviewedAt = new Date().toISOString();

  logAudit(
    schoolId,
    `SPONSOR_INTEREST_${interest.status}`,
    adminId || 'usr-admin-1',
    adminName || 'Administrator',
    'Super Administrator',
    'INTEREST_REQUEST',
    interestId,
    `School evaluated sponsor interest: status set to ${interest.status}`
  );

  res.json(interest);
});

// ============================================================================
// 7. OPPORTUNITY APPLICATIONS
// ============================================================================

// List Applications
sponsorshipRouter.get('/applications', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const studentId = req.query.studentId as string;
  const opportunityId = req.query.opportunityId as string;
  const db = getSchoolDb(schoolId);

  let list = db.applications;
  if (studentId) {
    list = list.filter(a => a.studentId === studentId);
  }
  if (opportunityId) {
    list = list.filter(a => a.opportunityId === opportunityId);
  }

  res.json(list);
});

// Submit Application
sponsorshipRouter.post('/applications', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const {
    opportunityId,
    opportunityTitle,
    candidateId,
    studentId,
    studentName,
    gradeBand,
    statementOfPurpose,
    supportingEvidenceSummary,
    teacherRecommendationId,
    teacherRecommendationNote,
  } = req.body;

  if (!opportunityId || !studentId || !statementOfPurpose) {
    return res.status(400).json({ error: 'Missing required application fields' });
  }

  const db = getSchoolDb(schoolId);
  const now = new Date().toISOString();
  const appId = `app-${Date.now()}`;

  const newApp: OpportunityApplication = {
    id: appId,
    schoolId,
    opportunityId,
    opportunityTitle: opportunityTitle || 'Opportunity Application',
    candidateId: candidateId || 'SS-CANDIDATE-2048',
    studentId,
    studentName,
    gradeBand: gradeBand || 'Senior Secondary',
    statementOfPurpose,
    supportingEvidenceSummary: supportingEvidenceSummary || [],
    teacherRecommendationId,
    teacherRecommendationNote,
    status: 'SCHOOL_REVIEW',
    createdAt: now,
    updatedAt: now,
  };

  db.applications.push(newApp);

  // Increment scholarship application count
  const scholarship = db.scholarships.find(s => s.id === opportunityId);
  if (scholarship) {
    scholarship.applicationsCount = (scholarship.applicationsCount || 0) + 1;
  }

  logAudit(
    schoolId,
    'OPPORTUNITY_APPLICATION_SUBMITTED',
    studentId,
    studentName || 'Student',
    'Student',
    'APPLICATION',
    appId,
    `Student submitted application for ${opportunityTitle}`
  );

  res.status(201).json(newApp);
});

// School Decision on Application
sponsorshipRouter.post('/applications/:id/school-decision', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const appId = req.params.id;
  const { decision, adminId, adminName } = req.body; // decision: 'APPROVED_FOR_SPONSOR' | 'REJECTED'
  const db = getSchoolDb(schoolId);

  const app = db.applications.find(a => a.id === appId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  app.schoolReviewDecision = decision;
  app.schoolReviewedBy = adminId || 'usr-admin-1';
  app.schoolReviewedAt = new Date().toISOString();
  app.status = decision === 'APPROVED_FOR_SPONSOR' ? 'SPONSOR_REVIEW' : 'DECLINED';
  app.updatedAt = new Date().toISOString();

  logAudit(
    schoolId,
    `APPLICATION_${app.status}`,
    adminId || 'usr-admin-1',
    adminName || 'Administrator',
    'Super Administrator',
    'APPLICATION',
    appId,
    `School set application decision to ${decision}`
  );

  res.json(app);
});

// Sponsor Decision on Application
sponsorshipRouter.post('/applications/:id/sponsor-decision', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const appId = req.params.id;
  const { decision, sponsorFeedback, awardedSupport, sponsorId, sponsorName } = req.body; // decision: 'AWARDED' | 'SHORTLISTED' | 'NOT_SELECTED'
  const db = getSchoolDb(schoolId);

  const app = db.applications.find(a => a.id === appId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  app.sponsorDecision = decision;
  app.sponsorFeedback = sponsorFeedback;
  app.awardedSupport = awardedSupport;
  app.status = decision === 'AWARDED' ? 'APPROVED' : decision === 'SHORTLISTED' ? 'INTERVIEW_ASSESSMENT' : 'DECLINED';
  app.updatedAt = new Date().toISOString();

  logAudit(
    schoolId,
    `SPONSOR_DECISION_${decision}`,
    sponsorId || 'spon-001',
    sponsorName || 'Sponsor',
    'SPONSOR',
    'APPLICATION',
    appId,
    `Sponsor recorded decision: ${decision}. Feedback: ${sponsorFeedback || 'None'}`
  );

  res.json(app);
});

// ============================================================================
// 8. EQUIPMENT SUPPORT & DELIVERY TRACKING
// ============================================================================

// List Equipment Records
sponsorshipRouter.get('/equipment', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const db = getSchoolDb(schoolId);
  res.json(db.equipmentRecords);
});

// Update Equipment Status
sponsorshipRouter.post('/equipment/:id/update-status', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const eqId = req.params.id;
  const { status, staffId, staffName, notes } = req.body;
  const db = getSchoolDb(schoolId);

  const record = db.equipmentRecords.find(e => e.id === eqId);
  if (!record) {
    return res.status(404).json({ error: 'Equipment record not found' });
  }

  record.status = status;
  if (notes) record.notes = notes;
  if (status === 'DELIVERED_TO_SCHOOL') {
    record.deliveredAt = new Date().toISOString();
  } else if (status === 'INSPECTED_VERIFIED') {
    record.inspectedByStaffId = staffId || 'usr-teacher-2';
  } else if (status === 'ASSIGNED_TO_STUDENT') {
    record.assignedAt = new Date().toISOString();
  }

  logAudit(
    schoolId,
    `EQUIPMENT_STATUS_${status}`,
    staffId || 'usr-admin-1',
    staffName || 'Staff Member',
    'Teacher',
    'EQUIPMENT',
    eqId,
    `Equipment ${record.itemName} status updated to ${status}`
  );

  res.json(record);
});

// ============================================================================
// 9. CONTROLLED OPPORTUNITY MESSAGING
// ============================================================================

// Get Thread Messages
sponsorshipRouter.get('/messages/:threadId', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const threadId = req.params.threadId;
  const db = getSchoolDb(schoolId);

  const threadMessages = db.messages.filter(m => m.threadId === threadId && m.moderationStatus === 'APPROVED');
  res.json(threadMessages);
});

// Send Controlled Message
sponsorshipRouter.post('/messages', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const { threadId, sponsorId, sponsorName, senderType, senderName, recipientDescription, subject, content } = req.body;

  if (!threadId || !content) {
    return res.status(400).json({ error: 'Missing required message parameters' });
  }

  const db = getSchoolDb(schoolId);
  const now = new Date().toISOString();
  const msgId = `msg-${Date.now()}`;

  const newMsg: ControlledOpportunityMessage = {
    id: msgId,
    schoolId,
    threadId,
    sponsorId: sponsorId || 'spon-afri-tech-foundation',
    sponsorName: sponsorName || 'Verified Sponsor',
    senderType: senderType || 'SPONSOR',
    senderName: senderName || 'Authorized Communicator',
    recipientDescription: recipientDescription || 'Supervised Student Team',
    subject: subject || 'Opportunity Update',
    content,
    moderationStatus: 'APPROVED', // Automatic school moderation pipeline
    moderatedByAdminId: 'usr-admin-1',
    createdAt: now,
  };

  db.messages.push(newMsg);

  logAudit(
    schoolId,
    'CONTROLLED_MESSAGE_SENT',
    sponsorId || 'usr-admin-1',
    senderName,
    senderType === 'SPONSOR' ? 'SPONSOR' : 'Super Administrator',
    'INTEREST_REQUEST',
    threadId,
    `Controlled opportunity message sent in thread ${threadId}`
  );

  res.status(201).json(newMsg);
});

// ============================================================================
// 10. SPONSOR IMPACT & SAFEGUARDING REPORTS
// ============================================================================

// Sponsor Aggregate Impact Report
sponsorshipRouter.get('/impact/sponsor/:sponsorId', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const sponsorId = req.params.sponsorId;
  const db = getSchoolDb(schoolId);

  const sponsor = db.sponsors.find(s => s.id === sponsorId);
  const sponsorName = sponsor?.name || 'Verified Sponsor Partner';

  const report: SponsorImpactReport = {
    id: `imp-${sponsorId}`,
    sponsorId,
    sponsorName,
    academicYear: '2026/2027',
    totalFinancialSupportUSD: 2450,
    totalStudentsBenefited: 42,
    totalProjectsFunded: 6,
    totalEquipmentKitsDelivered: 8,
    totalMissionsSupported: 4,
    totalClubsSupported: 2,
    programsSummary: [
      {
        programName: 'Secondary STEM Innovation & Water Tech Column',
        studentsCount: 18,
        completionRatePercent: 92,
        keyAchievements: ['Developed 3 working clean water filtration prototypes', '2 regional olympiad qualifiers'],
      },
      {
        programName: 'Autonomous Soil IoT & Agroforestry Lab',
        studentsCount: 24,
        completionRatePercent: 88,
        keyAchievements: ['Telemetry sensors installed across school nursery', 'Conserving 40% irrigation water'],
      },
    ],
    generatedAt: new Date().toISOString(),
  };

  res.json(report);
});

// School Sponsorship Impact Summary
sponsorshipRouter.get('/impact/school', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const db = getSchoolDb(schoolId);

  const summary = {
    schoolId,
    totalActiveSponsors: db.sponsors.filter(s => s.verificationStatus === 'VERIFIED').length,
    totalCandidatesApproved: db.opportunityProfiles.filter(p => p.schoolApprovalStatus === 'APPROVED').length,
    totalProjectsFunded: db.projectRequests.filter(p => p.status === 'FUNDED' || p.status === 'IN_PROGRESS' || p.status === 'OPEN').length,
    totalScholarshipsAwarded: db.applications.filter(a => a.status === 'APPROVED').length,
    totalEquipmentPledges: db.equipmentRecords.length,
    activeSupportValueUSD: 8620,
    safeguardingComplaintsCount: db.safeguardingReports.length,
    calculatedAt: new Date().toISOString(),
  };

  res.json(summary);
});

// Submit Safeguarding / Abuse Report
sponsorshipRouter.post('/safeguarding/report', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const { reportedByUserId, reportedByName, reportedByRole, sponsorId, sponsorName, reasonCategory, description, severity } = req.body;

  if (!description || !reasonCategory) {
    return res.status(400).json({ error: 'Missing required report parameters' });
  }

  const db = getSchoolDb(schoolId);
  const reportId = `safe-rep-${Date.now()}`;

  const report: SafeguardingReport = {
    id: reportId,
    schoolId,
    reportedByUserId: reportedByUserId || 'usr-student-1',
    reportedByName: reportedByName || 'Reporter',
    reportedByRole: (reportedByRole as RoleType) || 'Student',
    sponsorId,
    sponsorName,
    reasonCategory,
    description,
    severity: severity || 'HIGH',
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };

  db.safeguardingReports.push(report);

  // If critical, auto-suspend sponsor risk
  if (sponsorId) {
    const sponsor = db.sponsors.find(s => s.id === sponsorId);
    if (sponsor && (severity === 'CRITICAL' || severity === 'HIGH')) {
      sponsor.riskScore += 40;
      if (sponsor.riskScore >= 50) {
        sponsor.verificationStatus = 'SUSPENDED';
      }
    }
  }

  logAudit(
    schoolId,
    'SAFEGUARDING_REPORT_LOGGED',
    reportedByUserId || 'usr-student-1',
    reportedByName || 'Reporter',
    (reportedByRole as RoleType) || 'Student',
    'SPONSOR',
    reportId,
    `Safeguarding report lodged against ${sponsorName || 'entity'}: ${reasonCategory}`
  );

  res.status(201).json(report);
});

// List Safeguarding Reports (School Admin only)
sponsorshipRouter.get('/safeguarding/reports', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const db = getSchoolDb(schoolId);
  res.json(db.safeguardingReports);
});

// Resolve Safeguarding Report
sponsorshipRouter.post('/safeguarding/reports/:id/resolve', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const reportId = req.params.id;
  const { status, actionTakenNotes, adminId, adminName } = req.body;
  const db = getSchoolDb(schoolId);

  const report = db.safeguardingReports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.status = status;
  report.actionTakenNotes = actionTakenNotes;
  report.resolvedByAdminId = adminId || 'usr-admin-1';
  report.resolvedAt = new Date().toISOString();

  logAudit(
    schoolId,
    `SAFEGUARDING_REPORT_${status}`,
    adminId || 'usr-admin-1',
    adminName || 'Administrator',
    'Super Administrator',
    'SPONSOR',
    reportId,
    `Safeguarding report resolved: ${status}. Action: ${actionTakenNotes || 'None'}`
  );

  res.json(report);
});

// Get Audit Logs (School Admin view)
sponsorshipRouter.get('/audit-logs', (req: Request, res: Response) => {
  const schoolId = resolveSchoolId(req);
  const db = getSchoolDb(schoolId);
  res.json(db.auditLogs);
});
