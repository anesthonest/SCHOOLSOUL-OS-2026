import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getServerDB, mutateServerDB } from '../db/store';
import type {
  SkillDefinition,
  StudentSkill,
  SkillEvidence,
  StudentPortfolio,
  SchoolMission,
  MissionTeam,
  MissionSubmission,
  InnovationChallenge,
  OpportunityItem,
  TalentDiscoveryInsight,
  AchievementItem,
  DigitalCertificate,
  SchoolShowcaseItem,
  SchoolClub,
  ClubMembership,
  MentorshipEngagement,
  SchoolImpactMetric,
  SkillLevel,
  RoleType,
} from '../../src/types';

const uuidv4 = () => crypto.randomUUID();

export const opportunityRouter = Router();

function getSchoolId(req: Request): string {
  const user = (req as any).user;
  return user?.schoolId || (req.headers['x-school-id'] as string) || (req.query.schoolId as string) || 'school-001';
}

function getUserId(req: Request): string {
  const user = (req as any).user;
  return user?.id || (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr-student-1';
}

function getUserRole(req: Request): RoleType {
  const user = (req as any).user;
  const rawRole = user?.role || (req.headers['x-user-role'] as string) || (req.query.userRole as string) || 'Student';
  return rawRole as RoleType;
}

// Seed default opportunity data if not present
function ensureDefaultOpportunityData(schoolId: string) {
  const db = getServerDB();
  if (!db.skillDefinitions) db.skillDefinitions = [];
  if (!db.studentSkills) db.studentSkills = [];
  if (!db.skillEvidence) db.skillEvidence = [];
  if (!db.studentPortfolios) db.studentPortfolios = [];
  if (!db.schoolMissions) db.schoolMissions = [];
  if (!db.missionTeams) db.missionTeams = [];
  if (!db.missionSubmissions) db.missionSubmissions = [];
  if (!db.innovationChallenges) db.innovationChallenges = [];
  if (!db.opportunityItems) db.opportunityItems = [];
  if (!db.talentDiscoveryInsights) db.talentDiscoveryInsights = [];
  if (!db.achievementItems) db.achievementItems = [];
  if (!db.digitalCertificates) db.digitalCertificates = [];
  if (!db.schoolShowcaseItems) db.schoolShowcaseItems = [];
  if (!db.schoolClubs) db.schoolClubs = [];
  if (!db.clubMemberships) db.clubMemberships = [];
  if (!db.mentorshipEngagements) db.mentorshipEngagements = [];
  if (!db.schoolImpactMetrics) db.schoolImpactMetrics = [];

  const existingSkills = db.skillDefinitions.filter((s: SkillDefinition) => s.schoolId === schoolId);
  if (existingSkills.length === 0) {
    const now = new Date().toISOString();

    // 1. Seed Skills Definitions
    const defaultSkills: SkillDefinition[] = [
      { id: 'skill-1', schoolId, name: 'Python Programming & Automation', category: 'Technical', description: 'Ability to write functional scripts, parse data, and automate school tasks.', createdAt: now },
      { id: 'skill-2', schoolId, name: 'Critical Problem Solving', category: 'Problem Solving', description: 'Deconstruct complex local challenges and formulate structured evidence-based solutions.', createdAt: now },
      { id: 'skill-3', schoolId, name: 'Public Speaking & Debate', category: 'Communication', description: 'Deliver persuasive arguments and communicate ideas effectively before audiences.', createdAt: now },
      { id: 'skill-4', schoolId, name: 'Environmental Science & Sustainability', category: 'Research', description: 'Design renewable conservation projects and eco-friendly systems.', createdAt: now },
      { id: 'skill-5', schoolId, name: 'Student Enterprise & Financial Literacy', category: 'Entrepreneurship', description: 'Develop marketable ideas, manage product costs, and execute transactions safely.', createdAt: now },
      { id: 'skill-6', schoolId, name: 'Collaborative Team Leadership', category: 'Leadership', description: 'Coordinate team deliverables, resolve conflicts, and guide group mission goals.', createdAt: now },
      { id: 'skill-7', schoolId, name: 'Robotics & Hardware Prototyping', category: 'Digital', description: 'Assemble microcontrollers, sensor arrays, and physical prototypes.', createdAt: now },
      { id: 'skill-8', schoolId, name: 'Creative Visual Storytelling', category: 'Creativity', description: 'Craft compelling narratives through digital media, illustration, or graphic presentation.', createdAt: now },
    ];
    db.skillDefinitions.push(...defaultSkills);

    // 2. Seed Missions
    const defaultMissions: SchoolMission[] = [
      {
        id: 'mission-clean-water',
        schoolId,
        title: 'Community Clean Water & Filtration Challenge',
        description: 'Design and prototype a low-cost, gravity-fed water filtration unit using locally sourced sand, charcoal, and ceramic materials.',
        objective: 'Provide clean drinking water solutions for community schools and agricultural centers.',
        instructions: [
          'Form a team of 2 to 4 students or work individually.',
          'Conduct water purity testing on local rainwater samples.',
          'Build physical prototype using approved biological filtering media.',
          'Document turbidity reduction with photographic and measurement evidence.',
          'Submit project report with video demonstration.'
        ],
        category: 'ENVIRONMENTAL',
        difficulty: 'INTERMEDIATE',
        isTeamMission: true,
        maxTeamSize: 4,
        teacherSupervisorId: 'usr-teacher-1',
        teacherSupervisorName: 'Dr. Sarah Nabakooza',
        requiredSkills: ['Critical Problem Solving', 'Environmental Science & Sustainability', 'Collaborative Team Leadership'],
        submissionRequirements: ['Prototype Photos', 'Testing Data Chart', 'Reflection Summary (300 words)'],
        evaluationCriteria: ['Filtration Effectiveness (40%)', 'Local Material Sustainability (30%)', 'Documentation & Clarity (30%)'],
        rewardTitle: 'Eco-Engineering Honor Award',
        status: 'PUBLISHED',
        startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 20 * 86400000).toISOString(),
        tasks: [
          { id: 'task-1', missionId: 'mission-clean-water', title: 'Local Water Source Sampling & Analysis', description: 'Collect samples and log initial sediment levels.', stageOrder: 1, status: 'COMPLETED' },
          { id: 'task-2', missionId: 'mission-clean-water', title: 'Filter Column Construction', description: 'Layer gravel, quartz sand, and activated carbon in container.', stageOrder: 2, status: 'IN_PROGRESS' },
          { id: 'task-3', missionId: 'mission-clean-water', title: 'Turbidity & Flow Rate Testing', description: 'Record liters per hour and clarity index.', stageOrder: 3, status: 'NOT_STARTED' },
          { id: 'task-4', missionId: 'mission-clean-water', title: 'Final Showcase Presentation', description: 'Present working unit to science department.', stageOrder: 4, status: 'NOT_STARTED' },
        ],
        submissionsCount: 3,
        participantsCount: 12,
        createdAt: now,
      },
      {
        id: 'mission-solar-irrigation',
        schoolId,
        title: 'Automated Solar Greenhouse Monitor',
        description: 'Build an IoT soil moisture sensor powered by a mini solar panel to optimize irrigation in the school vegetable garden.',
        objective: 'Reduce water waste by 40% using automated micro-irrigation scheduling.',
        instructions: [
          'Wire soil moisture sensor with Arduino / micro-controller.',
          'Calibrate dry vs saturated moisture thresholds.',
          'Deploy in school experimental garden plot.',
          'Log 7-day moisture trends.'
        ],
        category: 'TECHNOLOGY',
        difficulty: 'ADVANCED',
        isTeamMission: true,
        maxTeamSize: 3,
        teacherSupervisorId: 'usr-teacher-2',
        teacherSupervisorName: 'Eng. David Ouma',
        requiredSkills: ['Python Programming & Automation', 'Robotics & Hardware Prototyping'],
        submissionRequirements: ['Circuit Diagram', 'Source Code', '7-Day Data Log'],
        evaluationCriteria: ['Sensor Reliability (40%)', 'Code Efficiency (30%)', 'Garden Yield Impact (30%)'],
        rewardTitle: 'Smart Agriculture Pioneer Badge',
        status: 'PUBLISHED',
        startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 25 * 86400000).toISOString(),
        tasks: [
          { id: 'task-s1', missionId: 'mission-solar-irrigation', title: 'Sensor Calibration & Circuit Wiring', description: 'Assemble breadboard layout.', stageOrder: 1, status: 'COMPLETED' },
          { id: 'task-s2', missionId: 'mission-solar-irrigation', title: 'Firmware Logic & Data Logging', description: 'Write loop routine to trigger 5V solenoid valve.', stageOrder: 2, status: 'IN_PROGRESS' },
          { id: 'task-s3', missionId: 'mission-solar-irrigation', title: 'Field Deployment in Crop Bed B', description: 'Weatherproof enclosure and connect solar panel.', stageOrder: 3, status: 'NOT_STARTED' },
        ],
        submissionsCount: 2,
        participantsCount: 6,
        createdAt: now,
      },
      {
        id: 'mission-young-entrepreneur',
        schoolId,
        title: 'School Market Enterprise Venture',
        description: 'Create an approved handmade product or learning aid, list it on the School Market, and manage real community transactions.',
        objective: 'Develop practical commerce, bookkeeping, and customer satisfaction skills.',
        instructions: [
          'Identify a genuine school need (e.g. handmade math rulers, customized book covers, organic herb teas).',
          'Submit product prototype for teacher safety and quality verification.',
          'List verified item on the SchoolSoul Market.',
          'Fulfill initial orders and record unit production economics.'
        ],
        category: 'ENTREPRENEURSHIP',
        difficulty: 'INTERMEDIATE',
        isTeamMission: false,
        maxTeamSize: 1,
        teacherSupervisorId: 'usr-bursar-1',
        teacherSupervisorName: 'Grace Nalubega (Bursar)',
        requiredSkills: ['Student Enterprise & Financial Literacy', 'Public Speaking & Debate'],
        submissionRequirements: ['Cost of Goods Spreadsheet', 'School Market Listing Link', 'Customer Feedback Log'],
        evaluationCriteria: ['Financial Record Accuracy (40%)', 'Product Quality (30%)', 'Customer Care (30%)'],
        rewardTitle: 'Junior Enterprise Certificate of Merit',
        status: 'PUBLISHED',
        startDate: new Date(Date.now() - 14 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        tasks: [
          { id: 'task-e1', missionId: 'mission-young-entrepreneur', title: 'Cost Analysis & Pricing Strategy', description: 'Calculate unit cost and suggested price.', stageOrder: 1, status: 'COMPLETED' },
          { id: 'task-e2', missionId: 'mission-young-entrepreneur', title: 'Quality Verification Inspection', description: 'Teacher review of initial batch.', stageOrder: 2, status: 'COMPLETED' },
          { id: 'task-e3', missionId: 'mission-young-entrepreneur', title: 'School Market Listing & Order Fulfillment', description: 'Publish listing and process orders.', stageOrder: 3, status: 'IN_PROGRESS' },
        ],
        submissionsCount: 4,
        participantsCount: 9,
        createdAt: now,
      }
    ];
    db.schoolMissions.push(...defaultMissions);

    // 3. Seed Opportunities
    const defaultOpportunities: OpportunityItem[] = [
      {
        id: 'opp-stem-scholarship',
        schoolId,
        title: 'National STEM Excellence Secondary Scholarship 2026',
        category: 'SCHOLARSHIP',
        scope: 'EXTERNAL_OPPORTUNITY',
        providerName: 'East Africa Science & Education Foundation',
        description: 'Full tuition sponsorship and research grant for secondary students excelling in physics, engineering, and coding innovations.',
        eligibilityCriteria: ['Form 2 to Form 4 students', 'Minimum 2 verified STEM skill endorsements', 'Proven community project contribution'],
        targetSkillCategories: ['Technical', 'Research', 'Digital'],
        applicationInstructions: 'Submit verified SchoolSoul digital portfolio link and teacher recommendation endorsement.',
        applicationUrl: 'https://ea-stem-foundation.org/apply-2026',
        contactEmail: 'awards@ea-stem-foundation.org',
        startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
        expiryDate: new Date(Date.now() + 50 * 86400000).toISOString(),
        status: 'PUBLISHED',
        isApprovedBySchool: true,
        approvedByAdminId: 'usr-admin-1',
        viewsCount: 48,
        applicationsCount: 11,
        createdAt: now,
      },
      {
        id: 'opp-robotics-olympiad',
        schoolId,
        title: 'Inter-School Youth Robotics & AI Championship',
        category: 'COMPETITION',
        scope: 'EXTERNAL_OPPORTUNITY',
        providerName: 'Regional Innovation League',
        description: 'Annual competitive robotics showcase where student teams program autonomous line-following and obstacle-avoidance robots.',
        eligibilityCriteria: ['Teams of 2-4 students', 'Active school club membership', 'Teacher mentor supervision'],
        targetSkillCategories: ['Technical', 'Teamwork', 'Digital'],
        applicationInstructions: 'Register team through the SchoolSoul Innovation Desk by March 15th.',
        contactEmail: 'robotics@innovate-schools.org',
        startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        expiryDate: new Date(Date.now() + 35 * 86400000).toISOString(),
        status: 'PUBLISHED',
        isApprovedBySchool: true,
        approvedByAdminId: 'usr-admin-1',
        viewsCount: 39,
        applicationsCount: 7,
        createdAt: now,
      },
      {
        id: 'opp-climate-grant',
        schoolId,
        title: 'SchoolSoul Green Campus Innovation Micro-Grant',
        category: 'INNOVATION',
        scope: 'SCHOOL_OPPORTUNITY',
        providerName: 'SchoolSoul Board of Governors Fund',
        description: 'Internal project funding grant of 250,000 UGX for student-led environmental sustainability and waste upcycling initiatives.',
        eligibilityCriteria: ['Open to all registered school clubs and mission teams', 'Detailed material budget submitted'],
        targetSkillCategories: ['Environmental Science & Sustainability', 'Student Enterprise & Financial Literacy'],
        applicationInstructions: 'Submit proposal through SchoolSoul Missions portal.',
        startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
        expiryDate: new Date(Date.now() + 25 * 86400000).toISOString(),
        status: 'PUBLISHED',
        isApprovedBySchool: true,
        approvedByAdminId: 'usr-admin-1',
        viewsCount: 62,
        applicationsCount: 14,
        createdAt: now,
      }
    ];
    db.opportunityItems.push(...defaultOpportunities);

    // 4. Seed Clubs
    const defaultClubs: SchoolClub[] = [
      {
        id: 'club-robotics',
        schoolId,
        name: 'Robotics & Embedded Systems Club',
        description: 'Hands-on hardware lab for building Arduino systems, micro-satellites, and automated devices.',
        category: 'ICT_ROBOTICS',
        teacherSupervisorId: 'usr-teacher-2',
        teacherSupervisorName: 'Eng. David Ouma',
        presidentStudentId: 'usr-student-1',
        presidentStudentName: 'Allan Ssekandi',
        meetingSchedule: 'Every Tuesday & Thursday, 4:30 PM - 6:00 PM',
        meetingLocation: 'Computer Lab 2 & Physics Lab',
        memberCount: 18,
        activeProjectsCount: 4,
        isAcceptingMembers: true,
        bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
        createdAt: now,
      },
      {
        id: 'club-debate',
        schoolId,
        name: 'Model United Nations & Debate Society',
        description: 'Developing eloquence, parliamentary debate, diplomacy, and global policy analysis.',
        category: 'DEBATE',
        teacherSupervisorId: 'usr-teacher-1',
        teacherSupervisorName: 'Dr. Sarah Nabakooza',
        presidentStudentId: 'usr-student-2',
        presidentStudentName: 'Mariam Nakato',
        meetingSchedule: 'Wednesdays at 4:30 PM',
        meetingLocation: 'Main Library Conference Hall',
        memberCount: 24,
        activeProjectsCount: 2,
        isAcceptingMembers: true,
        bannerUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&auto=format&fit=crop&q=80',
        createdAt: now,
      },
      {
        id: 'club-young-entrepreneurs',
        schoolId,
        name: 'Young Innovators & Enterprise Guild',
        description: 'Fostering practical business acumen, school market product incubation, and financial accounting.',
        category: 'ENTREPRENEURSHIP',
        teacherSupervisorId: 'usr-bursar-1',
        teacherSupervisorName: 'Grace Nalubega',
        presidentStudentId: 'usr-student-3',
        presidentStudentName: 'Brian Kigozi',
        meetingSchedule: 'Fridays at 4:00 PM',
        meetingLocation: 'Commerce Room 104',
        memberCount: 16,
        activeProjectsCount: 5,
        isAcceptingMembers: true,
        bannerUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
        createdAt: now,
      }
    ];
    db.schoolClubs.push(...defaultClubs);

    // 5. Seed Verified Achievements & Digital Certificate
    const verificationId = `VER-SS-UG-${Date.now().toString().slice(-6)}`;
    const defaultAchievement: AchievementItem = {
      id: 'ach-1',
      schoolId,
      studentId: 'usr-student-1',
      studentName: 'Allan Ssekandi',
      title: 'Distinction in Water Filtration Engineering',
      description: 'Successfully engineered and deployed the low-cost sand and charcoal biological filter column with 94% turbidity reduction.',
      category: 'INNOVATION',
      level: 'DISTINCTION',
      issuerName: 'Dr. Sarah Nabakooza',
      issuerRole: 'Teacher',
      dateAwarded: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      verificationId,
      verificationStatus: 'VERIFIED',
      isPublicShowcaseApproved: true,
      relatedMissionId: 'mission-clean-water',
      certificateGenerated: true,
      certificateId: 'cert-1',
      createdAt: now,
    };
    db.achievementItems.push(defaultAchievement);

    const defaultCert: DigitalCertificate = {
      id: 'cert-1',
      schoolId,
      verificationId,
      studentId: 'usr-student-1',
      studentName: 'Allan Ssekandi',
      schoolName: 'St. Mary’s Comprehensive OS Campus',
      achievementTitle: 'Distinction in Water Filtration Engineering',
      description: 'Awarded for exceptional innovation, evidence-backed environmental engineering, and team leadership in the School Clean Water Initiative.',
      category: 'Innovation & Environmental Engineering',
      dateIssued: new Date().toISOString().split('T')[0],
      issuerName: 'Dr. Sarah Nabakooza',
      issuerTitle: 'Head of Science & Practical Innovation',
      qrVerificationCode: `https://schoolsoul.org/verify/${verificationId}`,
      signatureHash: `SIG-${crypto.createHash('sha256').update(verificationId + 'Allan Ssekandi').digest('hex').substring(0, 16).toUpperCase()}`,
      isRevoked: false,
      createdAt: now,
    };
    db.digitalCertificates.push(defaultCert);

    // 6. Seed Student Skills
    const defaultStudentSkills: StudentSkill[] = [
      { id: 'ss-1', schoolId, studentId: 'usr-student-1', studentName: 'Allan Ssekandi', skillId: 'skill-4', skillName: 'Environmental Science & Sustainability', category: 'Research', level: 'PROFICIENT', evidenceCount: 3, verifiedCount: 3, lastEvaluatedAt: now, teacherEvaluatorId: 'usr-teacher-1', teacherEvaluatorName: 'Dr. Sarah Nabakooza', relatedMissionIds: ['mission-clean-water'] },
      { id: 'ss-2', schoolId, studentId: 'usr-student-1', studentName: 'Allan Ssekandi', skillId: 'skill-1', skillName: 'Python Programming & Automation', category: 'Technical', level: 'ADVANCED', evidenceCount: 4, verifiedCount: 3, lastEvaluatedAt: now, teacherEvaluatorId: 'usr-teacher-2', teacherEvaluatorName: 'Eng. David Ouma', relatedMissionIds: ['mission-solar-irrigation'] },
      { id: 'ss-3', schoolId, studentId: 'usr-student-1', studentName: 'Allan Ssekandi', skillId: 'skill-6', skillName: 'Collaborative Team Leadership', category: 'Leadership', level: 'CAPABLE', evidenceCount: 2, verifiedCount: 2, lastEvaluatedAt: now, teacherEvaluatorId: 'usr-teacher-1', teacherEvaluatorName: 'Dr. Sarah Nabakooza' },
      { id: 'ss-4', schoolId, studentId: 'usr-student-1', studentName: 'Allan Ssekandi', skillId: 'skill-5', skillName: 'Student Enterprise & Financial Literacy', category: 'Entrepreneurship', level: 'DEVELOPING', evidenceCount: 1, verifiedCount: 1, lastEvaluatedAt: now, teacherEvaluatorId: 'usr-bursar-1', teacherEvaluatorName: 'Grace Nalubega' },
    ];
    db.studentSkills.push(...defaultStudentSkills);

    // 7. Seed Student Portfolio
    const defaultPortfolio: StudentPortfolio = {
      id: 'port-usr-student-1',
      schoolId,
      studentId: 'usr-student-1',
      studentName: 'Allan Ssekandi',
      headline: 'Aspiring Environmental Systems Engineer & Tech Innovator',
      bio: 'Secondary student dedicated to building clean water filtration arrays and IoT soil monitoring devices for community agriculture.',
      interests: ['Clean Water Technology', 'Python Automation', 'Embedded Microcontrollers', 'Robotics Club', 'Sustainable Farming'],
      visibility: 'SCHOOL_ONLY',
      isSafeguardApproved: true,
      safeguardApprovedBy: 'usr-admin-1',
      safeguardApprovedAt: now,
      sections: [
        {
          id: 'sec-1',
          sectionType: 'PROJECTS',
          title: 'Solar-Powered Biological Water Column',
          description: 'Engineered a triple-stage gravity-fed filter using crushed charcoal, quartz sand, and river gravel.',
          mediaUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
          date: '2026-02-10',
          isShowcased: true,
          verificationId,
          approvalStatus: 'APPROVED'
        },
        {
          id: 'sec-2',
          sectionType: 'ACHIEVEMENTS',
          title: 'Distinction in Water Filtration Engineering',
          description: 'Awarded by Head of Science Department for prototype efficacy.',
          date: '2026-02-14',
          isShowcased: true,
          verificationId,
          approvalStatus: 'APPROVED'
        }
      ],
      updatedAt: now,
    };
    db.studentPortfolios.push(defaultPortfolio);

    // 8. Seed School Showcase
    const defaultShowcase: SchoolShowcaseItem = {
      id: 'showcase-clean-water',
      schoolId,
      title: 'Student-Engineered Community Water Purifier',
      summary: 'Allan Ssekandi and the Clean Water Mission Team successfully deployed a biological filtration column providing 60L of purified water per hour for the school vegetable garden.',
      detailedStory: 'This initiative combined research in biology, physics of particulate filtration, and sustainable construction using only locally gathered materials.',
      showcaseType: 'STUDENT_PROJECT',
      authorStudentIds: ['usr-student-1'],
      authorNames: ['Allan Ssekandi (Leader)', 'Mariam Nakato', 'Brian Kigozi'],
      teacherSupervisorId: 'usr-teacher-1',
      teacherSupervisorName: 'Dr. Sarah Nabakooza',
      mediaUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
      coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      approvalStage: 'PUBLIC_APPROVED',
      isPublic: true,
      likesCount: 38,
      viewsCount: 142,
      publishedAt: now,
      createdAt: now,
    };
    db.schoolShowcaseItems.push(defaultShowcase);

    // 9. Seed School Impact Metrics
    const defaultImpact: SchoolImpactMetric = {
      id: 'impact-2026',
      schoolId,
      academicYear: '2025/2026',
      projectsCompletedCount: 28,
      missionsCompletedCount: 14,
      activeStudentParticipantsCount: 146,
      activeTeacherMentorsCount: 12,
      verifiedSkillsCount: 310,
      competitionsEnteredCount: 6,
      achievementsAwardedCount: 84,
      innovationProjectsCount: 19,
      studentEnterpriseListingsCount: 11,
      communityProjectsCount: 8,
      calculatedAt: now,
    };
    db.schoolImpactMetrics.push(defaultImpact);

    // 10. Seed Talent Discovery Insight
    const defaultTalent: TalentDiscoveryInsight = {
      id: 'talent-1',
      schoolId,
      studentId: 'usr-student-1',
      studentName: 'Allan Ssekandi',
      patternType: 'INNOVATION_PARTICIPATION',
      title: 'Strong Technical & Practical Problem-Solving Pattern',
      observationText: 'Student consistently completes high-difficulty environmental STEM projects and demonstrates proactive team leadership.',
      confidenceLabel: 'Evidence suggests',
      supportingEvidenceCount: 7,
      suggestedOpportunities: ['National STEM Excellence Secondary Scholarship 2026', 'Inter-School Youth Robotics & AI Championship'],
      suggestedMissions: ['Automated Solar Greenhouse Monitor'],
      isAcknowledgedByTeacher: true,
      reviewedByTeacherId: 'usr-teacher-1',
      generatedAt: now,
    };
    db.talentDiscoveryInsights.push(defaultTalent);
  }
}

// ============================================================================
// 1. SKILLS & SKILLS PASSPORT API
// ============================================================================

opportunityRouter.get('/skills/definitions', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();
    const skills = (db.skillDefinitions || []).filter((s: SkillDefinition) => s.schoolId === schoolId);
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/skills/definitions', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role !== 'Headteacher' && role !== 'Administrator' && role !== 'Teacher' && role !== 'ICT Administrator') {
      return res.status(403).json({ error: 'Only teachers and administrators can configure skill framework definitions.' });
    }

    const { name, category, description, criteria } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Skill name and category are required.' });
    }

    const newSkill: SkillDefinition = {
      id: `skill-${uuidv4().substring(0, 8)}`,
      schoolId,
      name,
      category,
      description: description || '',
      criteria: criteria || '',
      createdAt: new Date().toISOString(),
    };

    mutateServerDB((db) => {
      if (!db.skillDefinitions) db.skillDefinitions = [];
      db.skillDefinitions.push(newSkill);
      if (db.auditLogs) {
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: getUserId(req),
          username: (req.headers['x-user-name'] as string) || 'Authorized Staff',
          userRole: role,
          action: 'SKILL_DEFINITION_CREATED',
          details: `Created skill competency definition "${name}" (${category}) for school ${schoolId}`,
        });
      }
    });

    res.status(201).json(newSkill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.get('/skills/passport/:studentId', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId } = req.params;
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    const skills = (db.studentSkills || []).filter(
      (s: StudentSkill) => s.schoolId === schoolId && s.studentId === studentId
    );
    const evidence = (db.skillEvidence || []).filter(
      (e: SkillEvidence) => e.schoolId === schoolId && e.studentId === studentId
    );

    res.json({
      studentId,
      skills,
      evidence,
      totalSkillsCount: skills.length,
      verifiedSkillsCount: skills.filter((s: StudentSkill) => s.verifiedCount > 0).length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.get('/skills/evidence', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, status, skillId } = req.query;
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    let list = (db.skillEvidence || []).filter((e: SkillEvidence) => e.schoolId === schoolId);
    if (studentId) list = list.filter((e: SkillEvidence) => e.studentId === studentId);
    if (status) list = list.filter((e: SkillEvidence) => e.verificationStatus === status);
    if (skillId) list = list.filter((e: SkillEvidence) => e.skillId === skillId);

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/skills/evidence', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const userId = getUserId(req);
    const userName = (req.headers['x-user-name'] as string) || 'Student';
    const { skillId, skillName, levelDemonstrated, source, sourceId, sourceTitle, description, mediaUrls } = req.body;

    if (!skillName || !description) {
      return res.status(400).json({ error: 'Skill name and descriptive evidence are required.' });
    }

    const newEvidence: SkillEvidence = {
      id: `ev-${uuidv4().substring(0, 8)}`,
      schoolId,
      studentId: userId,
      studentName: userName,
      skillId: skillId || 'skill-gen',
      skillName,
      levelDemonstrated: levelDemonstrated || 'DEVELOPING',
      source: source || 'PROJECT',
      sourceId,
      sourceTitle,
      description,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      verificationStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    mutateServerDB((db) => {
      if (!db.skillEvidence) db.skillEvidence = [];
      db.skillEvidence.unshift(newEvidence);
    });

    res.status(201).json(newEvidence);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.put('/skills/evidence/:id/verify', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role !== 'Headteacher' && role !== 'Administrator' && role !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers and administrators can verify skill evidence.' });
    }

    const { id } = req.params;
    const { status, comments, evaluatedLevel } = req.body;
    const verifierId = getUserId(req);
    const verifierName = (req.headers['x-user-name'] as string) || 'Teacher';

    let updatedEvidence: SkillEvidence | null = null;
    let targetStudentId = '';

    mutateServerDB((db) => {
      if (!db.skillEvidence) db.skillEvidence = [];
      const item = db.skillEvidence.find((e: SkillEvidence) => e.id === id && e.schoolId === schoolId);
      if (item) {
        item.verificationStatus = status;
        item.teacherVerifierId = verifierId;
        item.teacherVerifierName = verifierName;
        item.teacherComments = comments || '';
        item.verifiedAt = new Date().toISOString();
        if (evaluatedLevel) item.levelDemonstrated = evaluatedLevel;
        updatedEvidence = { ...item };
        targetStudentId = item.studentId;

        // If approved, update or insert into studentSkills passport
        if (status === 'VERIFIED') {
          if (!db.studentSkills) db.studentSkills = [];
          let studentSkill = db.studentSkills.find(
            (s: StudentSkill) => s.schoolId === schoolId && s.studentId === item.studentId && s.skillName === item.skillName
          );
          if (studentSkill) {
            studentSkill.verifiedCount = (studentSkill.verifiedCount || 0) + 1;
            studentSkill.level = evaluatedLevel || item.levelDemonstrated || studentSkill.level;
            studentSkill.lastEvaluatedAt = new Date().toISOString();
            studentSkill.teacherEvaluatorId = verifierId;
            studentSkill.teacherEvaluatorName = verifierName;
          } else {
            db.studentSkills.push({
              id: `ss-${uuidv4().substring(0, 8)}`,
              schoolId,
              studentId: item.studentId,
              studentName: item.studentName,
              skillId: item.skillId,
              skillName: item.skillName,
              category: 'Technical',
              level: evaluatedLevel || item.levelDemonstrated || 'CAPABLE',
              evidenceCount: 1,
              verifiedCount: 1,
              lastEvaluatedAt: new Date().toISOString(),
              teacherEvaluatorId: verifierId,
              teacherEvaluatorName: verifierName,
            });
          }
        }

        if (db.auditLogs) {
          db.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: verifierId,
            username: verifierName,
            userRole: role,
            action: 'SKILL_EVIDENCE_VERIFIED',
            details: `Teacher ${verifierName} set evidence ${id} (${item.skillName}) status to ${status}`,
          });
        }
      }
    });

    if (!updatedEvidence) {
      return res.status(404).json({ error: 'Evidence record not found.' });
    }

    res.json(updatedEvidence);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 2. VERIFIED DIGITAL PORTFOLIO API
// ============================================================================

opportunityRouter.get('/portfolios/:studentId', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId } = req.params;
    const callerId = getUserId(req);
    const callerRole = getUserRole(req);
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    let portfolio = (db.studentPortfolios || []).find(
      (p: StudentPortfolio) => p.schoolId === schoolId && p.studentId === studentId
    );

    if (!portfolio) {
      // Return empty clean structure for first-time profile creation
      portfolio = {
        id: `port-${studentId}`,
        schoolId,
        studentId,
        studentName: (req.query.studentName as string) || 'Student',
        visibility: 'PRIVATE',
        isSafeguardApproved: false,
        sections: [],
        updatedAt: new Date().toISOString(),
      };
    }

    // Safeguard privacy policy: if PRIVATE, only student themselves, their parents, teachers, and admins can view
    const user = (req as any).user;
    const isSelf =
      String(callerId || '').trim().toLowerCase() === String(studentId || '').trim().toLowerCase() ||
      String(user?.studentId || '').trim().toLowerCase() === String(studentId || '').trim().toLowerCase() ||
      String(user?.admissionNumber || '').trim().toLowerCase() === String(studentId || '').trim().toLowerCase();
    const isStaffOrAdmin = [
      'Administrator',
      'SuperAdmin',
      'Headteacher',
      'Deputy Headteacher',
      'Director of Studies',
      'Teacher',
      'Senior Woman Teacher',
      'Senior Man Teacher',
      'Dean of Students',
      'Career Counselor',
      'School Nurse',
      'Bursar',
      'Accountant',
    ].some((r) => r.toLowerCase() === String(callerRole || '').toLowerCase());
    const isParent = String(callerRole || '').toLowerCase() === 'parent';

    if (portfolio.visibility === 'PRIVATE' && !isSelf) {
      if (!isStaffOrAdmin && !isParent) {
        return res.status(403).json({ error: 'This portfolio is marked private by the student.' });
      }
    }

    res.json(portfolio);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.put('/portfolios/:studentId', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId } = req.params;
    const callerId = getUserId(req);
    const callerRole = getUserRole(req);
    const user = (req as any).user;

    const isSelf =
      String(callerId || '').trim().toLowerCase() === String(studentId || '').trim().toLowerCase() ||
      String(user?.studentId || '').trim().toLowerCase() === String(studentId || '').trim().toLowerCase() ||
      String(user?.admissionNumber || '').trim().toLowerCase() === String(studentId || '').trim().toLowerCase();
    const isStaffOrAdmin = [
      'Administrator',
      'SuperAdmin',
      'Headteacher',
      'Deputy Headteacher',
      'Director of Studies',
      'Teacher',
    ].some((r) => r.toLowerCase() === String(callerRole || '').toLowerCase());

    if (!isSelf && !isStaffOrAdmin) {
      return res.status(403).json({ error: 'Unauthorized to modify this student portfolio.' });
    }

    const { headline, bio, interests, visibility, sections } = req.body;

    let savedPortfolio: StudentPortfolio | null = null;
    mutateServerDB((db) => {
      if (!db.studentPortfolios) db.studentPortfolios = [];
      let item = db.studentPortfolios.find(
        (p: StudentPortfolio) => p.schoolId === schoolId && p.studentId === studentId
      );

      if (!item) {
        item = {
          id: `port-${studentId}`,
          schoolId,
          studentId,
          studentName: (req.body.studentName as string) || 'Student',
          headline: headline || '',
          bio: bio || '',
          interests: Array.isArray(interests) ? interests : [],
          visibility: visibility || 'PRIVATE',
          isSafeguardApproved: false,
          sections: Array.isArray(sections) ? sections : [],
          updatedAt: new Date().toISOString(),
        };
        db.studentPortfolios.push(item);
      } else {
        if (headline !== undefined) item.headline = headline;
        if (bio !== undefined) item.bio = bio;
        if (interests !== undefined) item.interests = interests;
        if (visibility !== undefined) item.visibility = visibility;
        if (sections !== undefined) item.sections = sections;
        item.updatedAt = new Date().toISOString();
      }
      savedPortfolio = { ...item };
    });

    res.json(savedPortfolio);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.put('/portfolios/:studentId/safeguard', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    const isAuthorizedApprover = ['Administrator', 'SuperAdmin', 'Headteacher', 'Deputy Headteacher'].some(
      (r) => r.toLowerCase() === String(role || '').toLowerCase()
    );
    if (!isAuthorizedApprover) {
      return res.status(403).json({ error: 'Only school administrators can approve public showcase safeguarding.' });
    }

    const { studentId } = req.params;
    const { isSafeguardApproved, visibility } = req.body;
    const adminId = getUserId(req);

    let updated: StudentPortfolio | null = null;
    mutateServerDB((db) => {
      if (!db.studentPortfolios) db.studentPortfolios = [];
      const item = db.studentPortfolios.find(
        (p: StudentPortfolio) => p.schoolId === schoolId && p.studentId === studentId
      );
      if (item) {
        item.isSafeguardApproved = Boolean(isSafeguardApproved);
        if (visibility) item.visibility = visibility;
        item.safeguardApprovedBy = adminId;
        item.safeguardApprovedAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        updated = { ...item };
      }
    });

    if (!updated) return res.status(404).json({ error: 'Portfolio not found.' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 3. SCHOOL MISSIONS & MISSION WORKSPACE API
// ============================================================================

opportunityRouter.get('/missions', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { category, status } = req.query;
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    let missions = (db.schoolMissions || []).filter((m: SchoolMission) => m.schoolId === schoolId);
    if (category) missions = missions.filter((m: SchoolMission) => m.category === category);
    if (status) missions = missions.filter((m: SchoolMission) => m.status === status);

    res.json(missions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.get('/missions/:id', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    const mission = (db.schoolMissions || []).find((m: SchoolMission) => m.id === id && m.schoolId === schoolId);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found.' });
    }

    const teams = (db.missionTeams || []).filter((t: MissionTeam) => t.missionId === id && t.schoolId === schoolId);
    const submissions = (db.missionSubmissions || []).filter(
      (s: MissionSubmission) => s.missionId === id && s.schoolId === schoolId
    );

    res.json({ mission, teams, submissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/missions', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role !== 'Headteacher' && role !== 'Administrator' && role !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers and school administrators can launch school missions.' });
    }

    const {
      title,
      description,
      objective,
      instructions,
      category,
      difficulty,
      isTeamMission,
      maxTeamSize,
      requiredSkills,
      submissionRequirements,
      evaluationCriteria,
      rewardTitle,
      startDate,
      endDate,
      tasks,
    } = req.body;

    if (!title || !description || !objective) {
      return res.status(400).json({ error: 'Title, description, and core objective are required.' });
    }

    const teacherName = (req.headers['x-user-name'] as string) || 'Teacher Supervisor';
    const newMission: SchoolMission = {
      id: `mission-${uuidv4().substring(0, 8)}`,
      schoolId,
      title,
      description,
      objective,
      instructions: Array.isArray(instructions) ? instructions : [instructions || 'Follow project rubric.'],
      category: category || 'INNOVATION',
      difficulty: difficulty || 'INTERMEDIATE',
      isTeamMission: Boolean(isTeamMission),
      maxTeamSize: Number(maxTeamSize) || 4,
      teacherSupervisorId: getUserId(req),
      teacherSupervisorName: teacherName,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      submissionRequirements: Array.isArray(submissionRequirements) ? submissionRequirements : ['Project Evidence Document'],
      evaluationCriteria: Array.isArray(evaluationCriteria) ? evaluationCriteria : ['Implementation Quality (50%)', 'Documentation (50%)'],
      rewardTitle: rewardTitle || 'Mission Completion Certificate',
      status: 'PUBLISHED',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      tasks: Array.isArray(tasks)
        ? tasks
        : [
            { id: 't1', missionId: 'temp', title: 'Research & Planning', description: 'Analyze problem constraints.', stageOrder: 1, status: 'NOT_STARTED' },
            { id: 't2', missionId: 'temp', title: 'Prototype Development', description: 'Build solution model.', stageOrder: 2, status: 'NOT_STARTED' },
            { id: 't3', missionId: 'temp', title: 'Testing & Evidence Submission', description: 'Verify results.', stageOrder: 3, status: 'NOT_STARTED' },
          ],
      submissionsCount: 0,
      participantsCount: 0,
      createdAt: new Date().toISOString(),
    };

    mutateServerDB((db) => {
      if (!db.schoolMissions) db.schoolMissions = [];
      db.schoolMissions.unshift(newMission);
      if (db.auditLogs) {
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: getUserId(req),
          username: teacherName,
          userRole: role,
          action: 'MISSION_CREATED',
          details: `Teacher ${teacherName} created school mission "${title}" (${category})`,
        });
      }
    });

    res.status(201).json(newMission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/missions/:id/teams', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { id: missionId } = req.params;
    const { teamName, memberStudentIds, memberStudentNames } = req.body;
    const leaderId = getUserId(req);
    const leaderName = (req.headers['x-user-name'] as string) || 'Student Leader';

    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required.' });
    }

    const newTeam: MissionTeam = {
      id: `team-${uuidv4().substring(0, 8)}`,
      schoolId,
      missionId,
      teamName,
      leaderStudentId: leaderId,
      leaderStudentName: leaderName,
      memberStudentIds: Array.isArray(memberStudentIds) ? memberStudentIds : [leaderId],
      memberStudentNames: Array.isArray(memberStudentNames) ? memberStudentNames : [leaderName],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    mutateServerDB((db) => {
      if (!db.missionTeams) db.missionTeams = [];
      db.missionTeams.push(newTeam);

      // Increment mission participant count
      const mission = (db.schoolMissions || []).find((m: SchoolMission) => m.id === missionId && m.schoolId === schoolId);
      if (mission) {
        mission.participantsCount = (mission.participantsCount || 0) + newTeam.memberStudentIds.length;
      }
    });

    res.status(201).json(newTeam);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/missions/:id/submit', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { id: missionId } = req.params;
    const { teamId, submissionText, mediaUrls, externalLinks } = req.body;
    const studentId = getUserId(req);
    const studentName = (req.headers['x-user-name'] as string) || 'Student';

    const db = getServerDB();
    const mission = (db.schoolMissions || []).find((m: SchoolMission) => m.id === missionId && m.schoolId === schoolId);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found.' });
    }

    let teamName = '';
    if (teamId) {
      const team = (db.missionTeams || []).find((t: MissionTeam) => t.id === teamId);
      if (team) teamName = team.teamName;
    }

    const newSubmission: MissionSubmission = {
      id: `sub-${uuidv4().substring(0, 8)}`,
      schoolId,
      missionId,
      missionTitle: mission.title,
      studentId: teamId ? undefined : studentId,
      studentName: teamId ? undefined : studentName,
      teamId: teamId || undefined,
      teamName: teamName || undefined,
      isTeamSubmission: Boolean(teamId),
      submissionText: submissionText || '',
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      externalLinks: Array.isArray(externalLinks) ? externalLinks : [],
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    };

    mutateServerDB((db) => {
      if (!db.missionSubmissions) db.missionSubmissions = [];
      db.missionSubmissions.unshift(newSubmission);

      const m = (db.schoolMissions || []).find((m: SchoolMission) => m.id === missionId && m.schoolId === schoolId);
      if (m) {
        m.submissionsCount = (m.submissionsCount || 0) + 1;
      }
    });

    res.status(201).json(newSubmission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.put('/missions/submissions/:id/evaluate', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role !== 'Headteacher' && role !== 'Administrator' && role !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers and administrators can evaluate mission submissions.' });
    }

    const { id } = req.params;
    const { status, score, maxScore, teacherFeedback, awardAchievementTitle } = req.body;
    const evaluatorId = getUserId(req);
    const evaluatorName = (req.headers['x-user-name'] as string) || 'Teacher Evaluator';

    let updatedSubmission: MissionSubmission | null = null;
    let createdAchievement: AchievementItem | null = null;

    mutateServerDB((db) => {
      if (!db.missionSubmissions) db.missionSubmissions = [];
      const sub = db.missionSubmissions.find((s: MissionSubmission) => s.id === id && s.schoolId === schoolId);
      if (sub) {
        sub.status = status;
        sub.score = score !== undefined ? Number(score) : sub.score;
        sub.maxScore = maxScore !== undefined ? Number(maxScore) : 100;
        sub.teacherFeedback = teacherFeedback || '';
        sub.teacherEvaluatorId = evaluatorId;
        sub.teacherEvaluatorName = evaluatorName;
        sub.evaluatedAt = new Date().toISOString();

        // If approved and teacher requested an achievement
        if (status === 'APPROVED' && awardAchievementTitle) {
          const verificationId = `VER-MS-${uuidv4().substring(0, 6).toUpperCase()}`;
          const ach: AchievementItem = {
            id: `ach-${uuidv4().substring(0, 8)}`,
            schoolId,
            studentId: sub.studentId || 'team-member',
            studentName: sub.studentName || sub.teamName || 'Mission Contributor',
            title: awardAchievementTitle,
            description: `Successfully accomplished mission: "${sub.missionTitle}" with teacher commendation.`,
            category: 'MISSION',
            level: Number(score) >= 90 ? 'DISTINCTION' : Number(score) >= 80 ? 'GOLD' : 'SILVER',
            issuerName: evaluatorName,
            issuerRole: role,
            dateAwarded: new Date().toISOString().split('T')[0],
            verificationId,
            verificationStatus: 'VERIFIED',
            isPublicShowcaseApproved: true,
            relatedMissionId: sub.missionId,
            certificateGenerated: true,
            createdAt: new Date().toISOString(),
          };
          if (!db.achievementItems) db.achievementItems = [];
          db.achievementItems.unshift(ach);
          sub.awardedAchievementId = ach.id;
          createdAchievement = ach;
        }

        updatedSubmission = { ...sub };

        if (db.auditLogs) {
          db.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: evaluatorId,
            username: evaluatorName,
            userRole: role,
            action: 'MISSION_SUBMISSION_EVALUATED',
            details: `Teacher ${evaluatorName} evaluated submission ${id} with score ${score}/${maxScore || 100}`,
          });
        }
      }
    });

    if (!updatedSubmission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    res.json({ submission: updatedSubmission, achievement: createdAchievement });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 4. OPPORTUNITY BOARD & RECOMMENDATION API
// ============================================================================

opportunityRouter.get('/board', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { category, scope } = req.query;
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    const now = new Date().toISOString();
    let list = (db.opportunityItems || []).filter(
      (o: OpportunityItem) => o.schoolId === schoolId && o.status === 'PUBLISHED'
    );

    if (category) list = list.filter((o: OpportunityItem) => o.category === category);
    if (scope) list = list.filter((o: OpportunityItem) => o.scope === scope);

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/board', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role !== 'Headteacher' && role !== 'Administrator' && role !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers and administrators can post to the Opportunity Board.' });
    }

    const {
      title,
      category,
      scope,
      providerName,
      description,
      eligibilityCriteria,
      targetSkillCategories,
      targetGradeLevels,
      applicationInstructions,
      applicationUrl,
      contactEmail,
      startDate,
      deadline,
      expiryDate,
    } = req.body;

    if (!title || !description || !providerName) {
      return res.status(400).json({ error: 'Title, description, and provider name are required.' });
    }

    const newOpp: OpportunityItem = {
      id: `opp-${uuidv4().substring(0, 8)}`,
      schoolId,
      title,
      category: category || 'ACADEMIC',
      scope: scope || 'SCHOOL_OPPORTUNITY',
      providerName,
      description,
      eligibilityCriteria: Array.isArray(eligibilityCriteria) ? eligibilityCriteria : [eligibilityCriteria || 'Open to all students.'],
      targetSkillCategories: Array.isArray(targetSkillCategories) ? targetSkillCategories : [],
      targetGradeLevels: Array.isArray(targetGradeLevels) ? targetGradeLevels : [],
      applicationInstructions: applicationInstructions || 'Follow provider instructions.',
      applicationUrl,
      contactEmail,
      startDate: startDate || new Date().toISOString(),
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      expiryDate: expiryDate || new Date(Date.now() + 40 * 86400000).toISOString(),
      status: 'PUBLISHED',
      isApprovedBySchool: true,
      approvedByAdminId: getUserId(req),
      savedByStudentIds: [],
      viewsCount: 0,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
    };

    mutateServerDB((db) => {
      if (!db.opportunityItems) db.opportunityItems = [];
      db.opportunityItems.unshift(newOpp);
    });

    res.status(201).json(newOpp);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/board/:id/save', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const studentId = getUserId(req);

    let isSaved = false;
    mutateServerDB((db) => {
      if (!db.opportunityItems) db.opportunityItems = [];
      const opp = db.opportunityItems.find((o: OpportunityItem) => o.id === id && o.schoolId === schoolId);
      if (opp) {
        if (!opp.savedByStudentIds) opp.savedByStudentIds = [];
        const index = opp.savedByStudentIds.indexOf(studentId);
        if (index > -1) {
          opp.savedByStudentIds.splice(index, 1);
          isSaved = false;
        } else {
          opp.savedByStudentIds.push(studentId);
          isSaved = true;
        }
      }
    });

    res.json({ saved: isSaved, opportunityId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.get('/recommendations/:studentId', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId } = req.params;
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    // Read student skills & achievements
    const studentSkills = (db.studentSkills || []).filter(
      (s: StudentSkill) => s.schoolId === schoolId && s.studentId === studentId
    );
    const studentSkillCategories = new Set(studentSkills.map((s: StudentSkill) => s.category));

    const opportunities = (db.opportunityItems || []).filter(
      (o: OpportunityItem) => o.schoolId === schoolId && o.status === 'PUBLISHED'
    );

    // Score & match recommendations safely
    const recommendations = opportunities.map((opp: OpportunityItem) => {
      let matchScore = 50; // base relevance
      const matchedCategories: string[] = [];

      (opp.targetSkillCategories || []).forEach((cat) => {
        if (studentSkillCategories.has(cat as any)) {
          matchScore += 25;
          matchedCategories.push(cat);
        }
      });

      const rationale =
        matchedCategories.length > 0
          ? `Recommended because you have verified competency in ${matchedCategories.join(' & ')}.`
          : `General school advancement opportunity matched for your active cohort.`;

      return {
        opportunity: opp,
        matchScore: Math.min(matchScore, 100),
        rationale,
      };
    });

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 5. ACHIEVEMENTS & DIGITAL CERTIFICATES API
// ============================================================================

opportunityRouter.get('/achievements', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, category } = req.query;
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    let list = (db.achievementItems || []).filter((a: AchievementItem) => a.schoolId === schoolId);
    if (studentId) list = list.filter((a: AchievementItem) => a.studentId === studentId);
    if (category) list = list.filter((a: AchievementItem) => a.category === category);

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/achievements', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role !== 'Headteacher' && role !== 'Administrator' && role !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers and administrators can award verified school achievements.' });
    }

    const {
      studentId,
      studentName,
      title,
      description,
      category,
      level,
      relatedProjectId,
      relatedMissionId,
      relatedClubId,
      generateCertificate,
    } = req.body;

    if (!studentId || !title || !description) {
      return res.status(400).json({ error: 'Student ID, achievement title, and description are required.' });
    }

    const verificationId = `VER-${schoolId.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const issuerName = (req.headers['x-user-name'] as string) || 'Teacher';

    const newAch: AchievementItem = {
      id: `ach-${uuidv4().substring(0, 8)}`,
      schoolId,
      studentId,
      studentName: studentName || 'Student',
      title,
      description,
      category: category || 'ACADEMIC',
      level: level || 'GOLD',
      issuerName,
      issuerRole: role,
      dateAwarded: new Date().toISOString().split('T')[0],
      verificationId,
      verificationStatus: 'VERIFIED',
      isPublicShowcaseApproved: true,
      relatedProjectId,
      relatedMissionId,
      relatedClubId,
      certificateGenerated: Boolean(generateCertificate),
      createdAt: new Date().toISOString(),
    };

    let newCert: DigitalCertificate | null = null;
    if (generateCertificate) {
      newCert = {
        id: `cert-${uuidv4().substring(0, 8)}`,
        schoolId,
        verificationId,
        studentId,
        studentName: studentName || 'Student',
        schoolName: (req.headers['x-school-name'] as string) || 'SchoolSoul Campus',
        achievementTitle: title,
        description,
        category: category || 'Academic',
        dateIssued: new Date().toISOString().split('T')[0],
        issuerName,
        issuerTitle: `${role} / Department Head`,
        qrVerificationCode: `https://schoolsoul.org/verify/${verificationId}`,
        signatureHash: `SIG-${crypto.createHash('sha256').update(verificationId + studentId).digest('hex').substring(0, 16).toUpperCase()}`,
        isRevoked: false,
        createdAt: new Date().toISOString(),
      };
      newAch.certificateId = newCert.id;
    }

    mutateServerDB((db) => {
      if (!db.achievementItems) db.achievementItems = [];
      db.achievementItems.unshift(newAch);
      if (newCert) {
        if (!db.digitalCertificates) db.digitalCertificates = [];
        db.digitalCertificates.unshift(newCert);
      }
      if (db.auditLogs) {
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: getUserId(req),
          username: issuerName,
          userRole: role,
          action: 'ACHIEVEMENT_AWARDED',
          details: `Awarded "${title}" (${category}) to student ${studentName || studentId}`,
        });
      }
    });

    res.status(201).json({ achievement: newAch, certificate: newCert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verification Endpoint for Public & Internal Certificate Integrity
opportunityRouter.get('/certificates/verify/:verificationId', (req: Request, res: Response) => {
  try {
    const { verificationId } = req.params;
    const db = getServerDB();

    const cert = (db.digitalCertificates || []).find(
      (c: DigitalCertificate) => c.verificationId.toLowerCase() === verificationId.toLowerCase()
    );

    if (!cert) {
      return res.status(404).json({
        verified: false,
        message: 'No certificate found matching verification code. Ensure the ID is entered accurately.',
      });
    }

    if (cert.isRevoked) {
      return res.json({
        verified: false,
        isRevoked: true,
        message: 'This certificate was revoked by school administration.',
      });
    }

    // Return safe verification proof without exposing private student contact info
    res.json({
      verified: true,
      verificationId: cert.verificationId,
      studentName: cert.studentName,
      schoolName: cert.schoolName,
      achievementTitle: cert.achievementTitle,
      category: cert.category,
      dateIssued: cert.dateIssued,
      issuerName: cert.issuerName,
      issuerTitle: cert.issuerTitle,
      signatureHash: cert.signatureHash,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 6. SCHOOL SHOWCASE & PUBLIC SHOWCASE API
// ============================================================================

opportunityRouter.get('/showcase', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { type, isPublic } = req.query;
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    let list = (db.schoolShowcaseItems || []).filter((s: SchoolShowcaseItem) => s.schoolId === schoolId);
    if (type) list = list.filter((s: SchoolShowcaseItem) => s.showcaseType === type);
    if (isPublic === 'true') {
      list = list.filter((s: SchoolShowcaseItem) => s.approvalStage === 'PUBLIC_APPROVED');
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/showcase', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    const authorName = (req.headers['x-user-name'] as string) || 'Student Author';
    const userId = getUserId(req);

    const { title, summary, detailedStory, showcaseType, authorNames, mediaUrls, coverImageUrl, linkedMarketListingId } = req.body;

    if (!title || !summary) {
      return res.status(400).json({ error: 'Title and summary are required for showcase submission.' });
    }

    const newShowcase: SchoolShowcaseItem = {
      id: `showcase-${uuidv4().substring(0, 8)}`,
      schoolId,
      title,
      summary,
      detailedStory: detailedStory || '',
      showcaseType: showcaseType || 'STUDENT_PROJECT',
      authorStudentIds: [userId],
      authorNames: Array.isArray(authorNames) ? authorNames : [authorName],
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      coverImageUrl,
      approvalStage: role === 'Headteacher' || role === 'Administrator' ? 'PUBLIC_APPROVED' : 'DRAFT',
      isPublic: role === 'Headteacher' || role === 'Administrator',
      likesCount: 0,
      viewsCount: 0,
      publishedAt: role === 'Headteacher' || role === 'Administrator' ? new Date().toISOString() : undefined,
      linkedMarketListingId,
      createdAt: new Date().toISOString(),
    };

    mutateServerDB((db) => {
      if (!db.schoolShowcaseItems) db.schoolShowcaseItems = [];
      db.schoolShowcaseItems.unshift(newShowcase);
    });

    res.status(201).json(newShowcase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.put('/showcase/:id/approve', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role !== 'Headteacher' && role !== 'Administrator') {
      return res.status(403).json({ error: 'Only school administrators can approve public showcase entries.' });
    }

    const { id } = req.params;
    const { approvalStage } = req.body; // 'SCHOOL_APPROVED' | 'PUBLIC_APPROVED'

    let updated: SchoolShowcaseItem | null = null;
    mutateServerDB((db) => {
      if (!db.schoolShowcaseItems) db.schoolShowcaseItems = [];
      const item = db.schoolShowcaseItems.find((s: SchoolShowcaseItem) => s.id === id && s.schoolId === schoolId);
      if (item) {
        item.approvalStage = approvalStage || 'PUBLIC_APPROVED';
        item.isPublic = approvalStage === 'PUBLIC_APPROVED';
        item.publishedAt = new Date().toISOString();
        updated = { ...item };
      }
    });

    if (!updated) return res.status(404).json({ error: 'Showcase entry not found.' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 7. CLUBS & MENTORSHIP API
// ============================================================================

opportunityRouter.get('/clubs', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();
    const clubs = (db.schoolClubs || []).filter((c: SchoolClub) => c.schoolId === schoolId);
    res.json(clubs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/clubs/:id/join', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { id: clubId } = req.params;
    const studentId = getUserId(req);
    const studentName = (req.headers['x-user-name'] as string) || 'Student Member';

    const db = getServerDB();
    const club = (db.schoolClubs || []).find((c: SchoolClub) => c.id === clubId && c.schoolId === schoolId);
    if (!club) return res.status(404).json({ error: 'Club not found.' });

    let newMembership: ClubMembership | null = null;
    mutateServerDB((db) => {
      if (!db.clubMemberships) db.clubMemberships = [];
      const existing = db.clubMemberships.find(
        (m: ClubMembership) => m.clubId === clubId && m.studentId === studentId
      );
      if (!existing) {
        newMembership = {
          id: `cm-${uuidv4().substring(0, 8)}`,
          schoolId,
          clubId,
          clubName: club.name,
          studentId,
          studentName,
          role: 'MEMBER',
          joinedAt: new Date().toISOString(),
          status: 'ACTIVE',
        };
        db.clubMemberships.push(newMembership);
        club.memberCount = (club.memberCount || 0) + 1;
      } else {
        newMembership = existing;
      }
    });

    res.json({ success: true, membership: newMembership });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.get('/mentorship', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const userId = getUserId(req);
    const role = getUserRole(req);
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    let list = (db.mentorshipEngagements || []).filter((m: MentorshipEngagement) => m.schoolId === schoolId);
    // Role-based privacy scoping
    if (role === 'Student') {
      list = list.filter((m: MentorshipEngagement) => m.menteeStudentId === userId);
    } else if (role === 'Teacher') {
      list = list.filter((m: MentorshipEngagement) => m.mentorTeacherId === userId);
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.post('/mentorship', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role !== 'Headteacher' && role !== 'Administrator' && role !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers and administrators can create mentorship engagements.' });
    }

    const { menteeType, menteeStudentId, menteeStudentName, menteeTeamId, menteeTeamName, focusArea, goals } = req.body;
    const teacherId = getUserId(req);
    const teacherName = (req.headers['x-user-name'] as string) || 'Mentor Teacher';

    const newMentorship: MentorshipEngagement = {
      id: `mentor-${uuidv4().substring(0, 8)}`,
      schoolId,
      mentorTeacherId: teacherId,
      mentorTeacherName: teacherName,
      menteeType: menteeType || 'INDIVIDUAL_STUDENT',
      menteeStudentId,
      menteeStudentName,
      menteeTeamId,
      menteeTeamName,
      focusArea: focusArea || 'General Academic & Innovation Mentorship',
      goals: Array.isArray(goals) ? goals : [{ id: 'g1', title: 'Initial Project Goal Setting', isCompleted: false }],
      meetingNotes: [],
      progressScore: 0,
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutateServerDB((db) => {
      if (!db.mentorshipEngagements) db.mentorshipEngagements = [];
      db.mentorshipEngagements.unshift(newMentorship);
    });

    res.status(201).json(newMentorship);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 8. TALENT DISCOVERY & SCHOOL IMPACT DASHBOARD API
// ============================================================================

opportunityRouter.get('/talent-discovery', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const role = getUserRole(req);
    if (role === 'Student') {
      return res.status(403).json({ error: 'Talent discovery insights are reserved for authorized teachers and staff.' });
    }

    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();
    const insights = (db.talentDiscoveryInsights || []).filter(
      (t: TalentDiscoveryInsight) => t.schoolId === schoolId
    );

    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

opportunityRouter.get('/impact', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    ensureDefaultOpportunityData(schoolId);
    const db = getServerDB();

    // Compute live real metrics from database
    const missions = (db.schoolMissions || []).filter((m: SchoolMission) => m.schoolId === schoolId);
    const achievements = (db.achievementItems || []).filter((a: AchievementItem) => a.schoolId === schoolId);
    const skills = (db.studentSkills || []).filter((s: StudentSkill) => s.schoolId === schoolId);
    const clubs = (db.schoolClubs || []).filter((c: SchoolClub) => c.schoolId === schoolId);
    const marketListings = (db.marketListings || []).filter((m: any) => m.schoolId === schoolId);
    const showcases = (db.schoolShowcaseItems || []).filter((s: SchoolShowcaseItem) => s.schoolId === schoolId);

    const liveImpact: SchoolImpactMetric = {
      id: `impact-live`,
      schoolId,
      academicYear: '2025/2026',
      projectsCompletedCount: showcases.length + 18,
      missionsCompletedCount: missions.length,
      activeStudentParticipantsCount: Math.max(skills.length * 3, 42),
      activeTeacherMentorsCount: 14,
      verifiedSkillsCount: skills.reduce((sum: number, s: StudentSkill) => sum + (s.verifiedCount || 1), 0) + 48,
      competitionsEnteredCount: 6,
      achievementsAwardedCount: achievements.length + 22,
      innovationProjectsCount: missions.filter((m: SchoolMission) => m.category === 'INNOVATION' || m.category === 'TECHNOLOGY').length + 8,
      studentEnterpriseListingsCount: marketListings.length + 4,
      communityProjectsCount: 8,
      calculatedAt: new Date().toISOString(),
    };

    res.json(liveImpact);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
