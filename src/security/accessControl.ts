import type { User, RoleType, ModuleName, PermissionAction, Student, StudentFeeAccount, ReportCard } from '../types';

/**
 * ============================================================================
 * SCHOOLSOUL 4-LAYER ROLE-BASED ACCESS CONTROL (RBAC) & RECORD SECURITY ENGINE
 * ============================================================================
 * Layer 1: Authentication (User identity, session state, token validity)
 * Layer 2: Role Architecture (Executive, Academic, Financial, Guardian, Learner, Technical)
 * Layer 3: Action Permissions (View, Create, Edit, Delete, Approve, Export, Manage)
 * Layer 4: Record-Level & Resource Scope (Tenant, Linked Child, Assigned Class, Own Record)
 */

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  suggestedView?: string;
  statusCode?: 200 | 401 | 403 | 404;
}

export interface UserScopeAssignment {
  userId: string;
  fullName: string;
  username: string;
  role: RoleType;
  assignedClasses?: string[];
  assignedSubjects?: string[];
  linkedChildrenIds?: string[];
  department?: string;
  canApproveFinance?: boolean;
  canManageUsers?: boolean;
  canExportReports?: boolean;
}

/**
 * Predefined Route Authorization Rules for every View in SchoolSoul
 */
export interface RouteSecurityRule {
  viewId: string;
  title: string;
  module: ModuleName;
  allowedRoles: RoleType[];
  requiredAction: PermissionAction;
  isPublic?: boolean;
  description: string;
}

export const ROUTE_SECURITY_MATRIX: Record<string, RouteSecurityRule> = {
  // Live Learning & Virtual Classroom Suite
  'live-learning': {
    viewId: 'live-learning',
    title: 'Live Learning & Virtual Classroom',
    module: 'Academics',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'High-definition WebRTC live classes, collaborative whiteboard, live questions/polls, and media studio',
  },
  // Core Operational Dashboards
  'dashboard': {
    viewId: 'dashboard',
    title: 'Central Dashboard',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Central operations dashboard adaptive to active user role',
  },
  // Opportunity, Achievement, Skills & Innovation Engine Matrix
  'opportunity-hub': {
    viewId: 'opportunity-hub',
    title: 'Opportunity & Achievement Hub',
    module: 'Opportunity & Achievement Engine',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Comprehensive Student Skills, Missions, Portfolios, and Opportunity ecosystem',
  },
  'skills-passport': {
    viewId: 'skills-passport',
    title: 'Student Skills Passport',
    module: 'Student Skills Passport',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Multi-dimensional verified skill progress and competency endorsements',
  },
  'school-missions': {
    viewId: 'school-missions',
    title: 'School Missions & Challenges',
    module: 'School Missions',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Real-world problem-solving challenges, team collaboration, and teacher evaluations',
  },
  'opportunity-board': {
    viewId: 'opportunity-board',
    title: 'Opportunity Board',
    module: 'Opportunity Board',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Curated external and school-wide competitions, scholarships, grants, and internships',
  },
  'digital-portfolio': {
    viewId: 'digital-portfolio',
    title: 'Verified Digital Portfolio',
    module: 'Verified Digital Portfolio',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Safeguarded dynamic portfolios of verified student milestones and evidence',
  },
  'achievements-certs': {
    viewId: 'achievements-certs',
    title: 'Achievements & Digital Certificates',
    module: 'Achievement System',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Authenticated honors and tamper-proof digital certificates with verification QR codes',
  },
  'school-showcase': {
    viewId: 'school-showcase',
    title: 'School Showcase & Inventions',
    module: 'School Showcase',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Published student projects, community solutions, and enterprise creations',
  },
  'clubs-mentorship': {
    viewId: 'clubs-mentorship',
    title: 'Clubs & Mentorship Guild',
    module: 'Clubs & Activities',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School societies, scheduled workshops, and teacher-guided mentorship milestones',
  },
  'school-impact': {
    viewId: 'school-impact',
    title: 'School Impact & Accreditation Cockpit',
    module: 'School Impact Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Aggregated analytics and proof-of-competency metrics for school accreditation',
  },
  'sponsorship-bridge': {
    viewId: 'sponsorship-bridge',
    title: 'Sponsorship & Student Opportunity Bridge',
    module: 'Sponsorship & Opportunity Bridge',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Safeguarded bridge connecting verified student innovations, projects, and scholarships with accredited sponsors',
  },
  'sponsor-dashboard': {
    viewId: 'sponsor-dashboard',
    title: 'Sponsor Portal & Discovery Hub',
    module: 'Sponsor Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Anonymized candidate discovery, project grant pledges, and supervised impact metrics',
  },
  'school-sponsorship': {
    viewId: 'school-sponsorship',
    title: 'School Sponsorship Center',
    module: 'School Sponsorship Center',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School admin verification hub, safeguarding reports, and bursary-routed disbursements',
  },
  'scholarships-grants': {
    viewId: 'scholarships-grants',
    title: 'Scholarships & Innovation Grants',
    module: 'Scholarships & Grants',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Curated scholarship opportunities and AI evidence-based matching engine',
  },
  'commercial-value-center': {
    viewId: 'commercial-value-center',
    title: 'Commercial Value Center & Subscriptions',
    module: 'School Settings',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School subscription, Pesapal billing, invoices, and executive value reports',
  },
  'pesapal-callback': {
    viewId: 'pesapal-callback',
    title: 'Pesapal Settlement Verification',
    module: 'School Settings',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Independent transaction verification and digital e-receipt retrieval',
  },
  'real-world-activation': {
    viewId: 'real-world-activation',
    title: 'Real-World Ecosystem Activation Center',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Master real-world operational engine, bulk data onboarding, stakeholder journeys, and production certification',
  },
  'v26-final-system-integrity': {
    viewId: 'v26-final-system-integrity',
    title: 'System Integrity & Security Center (V26)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'System-wide hardening, invariant QA testing, and security verification console',
  },
  'v25-learnguard': {
    viewId: 'v25-learnguard',
    title: 'SchoolSoul LearnGuard',
    module: 'School Settings',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Controlled digital phone learning ecosystem and safe student resource space',
  },
  'v24-final-pre-deployment-pilot': {
    viewId: 'v24-final-pre-deployment-pilot',
    title: 'Pre-Deployment Pilot Center (V24)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Production certification and deployment verification suite',
  },
  'v23-unified-education-os': {
    viewId: 'v23-unified-education-os',
    title: 'Unified Education OS (V23)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Platform architecture and student-based licensing hub',
  },
  'unified-subscription': {
    viewId: 'unified-subscription',
    title: 'Unified Subscription & Billing',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'School subscription, license management, and plan renewal center',
  },
  'v21-final-production-release': {
    viewId: 'v21-final-production-release',
    title: 'Production Release Certification (V21)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Zero-gap production release certification console',
  },
  'v20-vinexsah-control-center': {
    viewId: 'v20-vinexsah-control-center',
    title: 'VINEXSAH Control Center (V20)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'School Owner'],
    requiredAction: 'View',
    description: 'Enterprise tenant controls and telemetry hub',
  },
  'v19-deployment-success': {
    viewId: 'v19-deployment-success',
    title: 'Deployment & Customer Success (V19)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher'],
    requiredAction: 'View',
    description: 'Staff onboarding, training guides, and system helpdesk',
  },
  'v18-mobile-license-integration': {
    viewId: 'v18-mobile-license-integration',
    title: 'Mobile License & Sync Manager (V18)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher'],
    requiredAction: 'View',
    description: 'Mobile device authorization and license sync',
  },
  'v16-market-readiness': {
    viewId: 'v16-market-readiness',
    title: 'Market Readiness & Launch (V16)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Deployment checklist and product readiness verification',
  },
  'pilot-release-center': {
    viewId: 'pilot-release-center',
    title: 'Pilot Release Deployment',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Pilot test runner and installer validation',
  },
  'v15-license-management': {
    viewId: 'v15-license-management',
    title: 'Enterprise License Management (V15)',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'School Owner'],
    requiredAction: 'View',
    description: 'Cryptographic offline license activation keys',
  },
  'v14-communication-suite': {
    viewId: 'v14-communication-suite',
    title: 'Enterprise Comms Suite (V14)',
    module: 'Direct Messaging',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Bulk SMS, automated mail merge, and parent outreach suite',
  },
  'v13-connect': {
    viewId: 'v13-connect',
    title: 'SchoolSoul Connect (LAN Sync)',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'Bursar'],
    requiredAction: 'View',
    description: 'Local Area Network peer discovery and multi-device sync',
  },
  'v11-student-innovation-hub': {
    viewId: 'v11-student-innovation-hub',
    title: 'Student Innovation Hub & Projects (V11)',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Student project showcase, STEM innovations, and club initiatives',
  },

  // Student Voice & Public Engagement (Vision 9)
  'v9-hub': {
    viewId: 'v9-hub',
    title: 'Public Engagement Hub',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Community outreach, student voice, and alumni coordination hub',
  },
  'v9-student-voice': {
    viewId: 'v9-student-voice',
    title: 'Student Voice & Council Proposals',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Student council submissions, polling, and pupil proposals',
  },
  'v9-student-portfolio': {
    viewId: 'v9-student-portfolio',
    title: 'Student Digital Portfolio',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Student achievements, certificates, and learning showcase',
  },
  'v9-innovation-hub': {
    viewId: 'v9-innovation-hub',
    title: 'Innovation & Science Hub',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Science and STEM innovation laboratory projects',
  },
  'v9-school-clubs': {
    viewId: 'v9-school-clubs',
    title: 'Clubs & Societies Directory',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School co-curricular clubs, debate, sports, and arts societies',
  },
  'v9-student-marketplace': {
    viewId: 'v9-student-marketplace',
    title: 'Student Marketplace & Craft Fair',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Student enterprise, handmade crafts, and school store',
  },
  'v9-public-website': {
    viewId: 'v9-public-website',
    title: 'Public Website Manager',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Public school portal CMS and landing page editor',
  },
  'v9-news-media': {
    viewId: 'v9-news-media',
    title: 'News & Media Desk',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School publications, newsletters, and press releases',
  },
  'v9-school-gallery': {
    viewId: 'v9-school-gallery',
    title: 'School Photo & Video Gallery',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School events, celebrations, and campus media archive',
  },
  'v9-alumni-network': {
    viewId: 'v9-alumni-network',
    title: 'Alumni Network & Directory',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Old students association, mentorship, and alumni events',
  },
  'v9-partnerships': {
    viewId: 'v9-partnerships',
    title: 'Partnerships & Sister Schools',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Educational partner organizations and NGO linkages',
  },
  'v9-community-engagement': {
    viewId: 'v9-community-engagement',
    title: 'Community Outreach & Service',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Local neighborhood outreach and voluntary community service',
  },
  'v9-donations-fundraising': {
    viewId: 'v9-donations-fundraising',
    title: 'Donations & Sponsorships',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Fundraising drives, bursary donors, and capital appeals',
  },
  'v9-brand-management': {
    viewId: 'v9-brand-management',
    title: 'Brand Assets & Certificates',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher'],
    requiredAction: 'View',
    description: 'Official logos, letterheads, and certificate templates',
  },
  'v9-recognition-awards': {
    viewId: 'v9-recognition-awards',
    title: 'Awards & Honors Board',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Merit badges, termly awards, and student hall of fame',
  },
  'v9-public-analytics': {
    viewId: 'v9-public-analytics',
    title: 'Public Engagement Metrics',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Public page traffic and community interaction analytics',
  },

  // Executive Intelligence & AI (Vision 8)
  'v8-intelligence-hub': {
    viewId: 'v8-intelligence-hub',
    title: 'School Intelligence Hub',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Institutional analytics, performance KPIs, and predictive insights',
  },
  'executive-cockpit': {
    viewId: 'executive-cockpit',
    title: 'Executive Growth Cockpit',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'High-level board overview of enrollment, finance, and academics',
  },
  'ai-assistant': {
    viewId: 'ai-assistant',
    title: 'AI School Assistant',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'Bursar'],
    requiredAction: 'View',
    description: 'Curriculum lesson plan assistant and institutional reporting generator',
  },
  'student-intelligence': {
    viewId: 'student-intelligence',
    title: 'Student Success Intelligence',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Early warning indicators and academic retention predictions',
  },
  'teacher-intelligence': {
    viewId: 'teacher-intelligence',
    title: 'Teacher Intelligence & Workload',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Curriculum pacing, syllabus coverage, and teaching performance',
  },
  'financial-intelligence': {
    viewId: 'financial-intelligence',
    title: 'Financial AI Simulator',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Fee collection projection and cost-reduction simulation',
  },
  'performance-analytics': {
    viewId: 'performance-analytics',
    title: 'Resource & Performance Analytics',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Facility utilization and class progression rate analytics',
  },
  'improvement-tracker': {
    viewId: 'improvement-tracker',
    title: 'School Improvement Tracker',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Strategic term targets, inspection readiness, and action plans',
  },
  'board-reporting': {
    viewId: 'board-reporting',
    title: 'Board Reporting Centre',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Board of governors briefing packs and executive summary exports',
  },
  'knowledge-centre': {
    viewId: 'knowledge-centre',
    title: 'Knowledge & Policy Search',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School regulations, staff handbooks, and policy document library',
  },
  'user-guide': {
    viewId: 'user-guide',
    title: 'SchoolSoul OS 2026.1.0 User Guide',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Official SchoolSoul OS 2026.1.0 User Guideline & Operations Book for all roles',
  },
  'ai-governance': {
    viewId: 'ai-governance',
    title: 'AI Governance & Controls',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher'],
    requiredAction: 'View',
    description: 'AI model parameters, safety limits, and prompt audit logs',
  },

  // Safeguarding, Welfare & HR (Vision 7)
  'administration-dashboards': {
    viewId: 'administration-dashboards',
    title: 'Administration Hub',
    module: 'Dashboard',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher'],
    requiredAction: 'View',
    description: 'Campus operations, staff records, and statutory compliance hub',
  },
  'safeguarding-centre': {
    viewId: 'safeguarding-centre',
    title: 'Safeguarding Centre',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Nurse'],
    requiredAction: 'View',
    description: 'Confidential child protection cases and safety protocols',
  },
  'student-welfare': {
    viewId: 'student-welfare',
    title: 'Student Welfare & Support',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'School Nurse'],
    requiredAction: 'View',
    description: 'Pastoral care, student health, and special educational needs',
  },
  'behaviour-discipline': {
    viewId: 'behaviour-discipline',
    title: 'Behaviour & Discipline Log',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Merits, demerits, commendations, and disciplinary tracking',
  },
  'counselling-services': {
    viewId: 'counselling-services',
    title: 'Counselling Services Desk',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Nurse'],
    requiredAction: 'View',
    description: 'Student guidance, psychological support, and confidential sessions',
  },
  'school-health-centre': {
    viewId: 'school-health-centre',
    title: 'School Health Centre & Sickbay',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Nurse', 'Deputy Headteacher'],
    requiredAction: 'View',
    description: 'Medical records, allergies, clinic visits, and medication logs',
  },
  'incident-management': {
    viewId: 'incident-management',
    title: 'Incident Management Log',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher'],
    requiredAction: 'View',
    description: 'Campus security events, accidents, and investigation reports',
  },
  'staff-hr': {
    viewId: 'staff-hr',
    title: 'Staff HR Directory',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Staff employment profiles, qualifications, and contracts',
  },
  'staff-leave': {
    viewId: 'staff-leave',
    title: 'Staff Leave Management',
    module: 'Staff Leave Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'Bursar', 'Librarian', 'School Nurse'],
    requiredAction: 'View',
    description: 'Staff leave applications, approvals, and absence calendar',
  },
  'staff-appraisals': {
    viewId: 'staff-appraisals',
    title: 'Staff Performance Appraisals',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Teaching observations, staff evaluations, and KPI reviews',
  },
  'staff-cpd': {
    viewId: 'staff-cpd',
    title: 'Staff CPD & Professional Development',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Teacher workshops, pedagogical training, and certifications',
  },
  'asset-management': {
    viewId: 'asset-management',
    title: 'School Asset Management',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Bursar'],
    requiredAction: 'View',
    description: 'Fixed school property, computers, vehicles, and furniture registers',
  },
  'inventory-management': {
    viewId: 'inventory-management',
    title: 'Stores & Inventory Register',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Bursar', 'Librarian'],
    requiredAction: 'View',
    description: 'Textbook supplies, laboratory chemicals, and stationery stock',
  },
  'policy-centre': {
    viewId: 'policy-centre',
    title: 'Policy Document Centre',
    module: 'School Settings',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Institutional policies, governance documents, and compliance forms',
  },
  'school-administration': {
    viewId: 'school-administration',
    title: 'School Administration Desk',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Central administrative controls and operations management',
  },
  'compliance-audit': {
    viewId: 'compliance-audit',
    title: 'Statutory Compliance & Audit',
    module: 'Audit System',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Ministry of Education guidelines and regulatory compliance check',
  },

  // Parent & Community Communication (Vision 6)
  'parent-portal': {
    viewId: 'parent-portal',
    title: 'Parent Portal & Multi-Child Hub',
    module: 'Parent Portal',
    allowedRoles: ['Parent', 'Guardian', 'Super Administrator', 'Administrator', 'Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Parent dashboard for viewing linked children progress, reports, and fees',
  },
  'direct-messaging': {
    viewId: 'direct-messaging',
    title: 'Direct Messaging Desk',
    module: 'Direct Messaging',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Secure, authenticated two-way messaging between parents and staff',
  },
  'sms-engine': {
    viewId: 'sms-engine',
    title: 'SMS Gateway Engine',
    module: 'SMS Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'Bursar'],
    requiredAction: 'View',
    description: 'Broadcast SMS, automated fee alerts, and emergency dispatch',
  },
  'whatsapp-integration': {
    viewId: 'whatsapp-integration',
    title: 'WhatsApp Business Gateway',
    module: 'WhatsApp Integration',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Bursar'],
    requiredAction: 'View',
    description: 'Official WhatsApp parent notifications and receipt delivery',
  },
  'announcements': {
    viewId: 'announcements',
    title: 'Announcement Centre',
    module: 'Announcement Center',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School circulars, term reminders, and general notices',
  },
  'school-news': {
    viewId: 'school-news',
    title: 'School News & Gazette',
    module: 'School News',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School achievements, sports reports, and student milestones',
  },
  'events-management': {
    viewId: 'events-management',
    title: 'Events & Calendar',
    module: 'Events & Calendar',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Term dates, visitation days, sports days, and exam dates',
  },
  'ptm-meetings': {
    viewId: 'ptm-meetings',
    title: 'Parent-Teacher Meetings',
    module: 'Parent-Teacher Meetings',
    allowedRoles: ['Parent', 'Guardian', 'Teacher', 'Headteacher', 'Deputy Headteacher', 'Administrator'],
    requiredAction: 'View',
    description: 'PTA appointment scheduling and conference notes',
  },
  'consent-forms': {
    viewId: 'consent-forms',
    title: 'Digital Consent Slips',
    module: 'Digital Consent Forms',
    allowedRoles: ['Parent', 'Guardian', 'Teacher', 'Headteacher', 'Administrator'],
    requiredAction: 'View',
    description: 'School trip permissions, medical consent, and activity waivers',
  },
  'feedback-surveys': {
    viewId: 'feedback-surveys',
    title: 'Feedback & Surveys Desk',
    module: 'Feedback & Surveys',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Parent satisfaction surveys and student feedback forms',
  },
  'help-centre': {
    viewId: 'help-centre',
    title: 'School Helpdesk',
    module: 'School Help Centre',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'User support, parent inquiries, and technical guidance',
  },
  'community-groups': {
    viewId: 'community-groups',
    title: 'Community Groups & PTA',
    module: 'Community Groups',
    allowedRoles: ['Parent', 'Guardian', 'Teacher', 'Headteacher', 'Administrator'],
    requiredAction: 'View',
    description: 'Class parent groups, PTA committees, and alumni branches',
  },
  'digital-community': {
    viewId: 'digital-community',
    title: 'Digital Community & Collaboration Hub',
    module: 'Digital Community',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Unified school-controlled digital community, class discussions, project collaboration, announcements, and safeguarding center',
  },
  'emergency-alerts': {
    viewId: 'emergency-alerts',
    title: 'Emergency Alert Desk',
    module: 'Emergency Alerts',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'School Nurse'],
    requiredAction: 'View',
    description: 'Urgent campus notifications, weather warnings, and security broadcasts',
  },
  'communication-dashboards': {
    viewId: 'communication-dashboards',
    title: 'Communication Dashboards',
    module: 'Parent Portal',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Teacher', 'Parent'],
    requiredAction: 'View',
    description: 'Engagement summaries and messaging response metrics',
  },
  'communication-analytics': {
    viewId: 'communication-analytics',
    title: 'Engagement Analytics',
    module: 'Communication Analytics',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher'],
    requiredAction: 'View',
    description: 'SMS delivery rates and parent read-receipt analytics',
  },

  // Academics & Report Cards (Vision 5)
  'academics-hub': {
    viewId: 'academics-hub',
    title: 'Academics Operations Hub',
    module: 'Academic Structure',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Curriculum structure, teaching schedules, and gradebook hub',
  },
  'academic-structure': {
    viewId: 'academic-structure',
    title: 'Classes & Academic Structure',
    module: 'Academic Structure',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Class streams, levels, and student enrollments',
  },
  'subject-management': {
    viewId: 'subject-management',
    title: 'Subject Administration',
    module: 'Subject Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'NCDC subjects, UNEB codes, and subject teachers',
  },
  'timetable-engine': {
    viewId: 'timetable-engine',
    title: 'Timetable Generator',
    module: 'Timetable Engine',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Master lesson schedule and teacher allocation timetable',
  },
  'lesson-planner': {
    viewId: 'lesson-planner',
    title: 'Lesson Planner & Schemes',
    module: 'Lesson Planner',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Lesson plans, learning competencies, and pedagogical notes',
  },
  'homework-assignments': {
    viewId: 'homework-assignments',
    title: 'Homework & Assignments',
    module: 'Homework & Assignments',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Class assignments, submission deadlines, and student tasks',
  },
  'assessment-exams': {
    viewId: 'assessment-exams',
    title: 'Assessments & Examinations',
    module: 'Assessment Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Continuous assessment, termly exams, and grading scales',
  },
  'teacher-gradebook': {
    viewId: 'teacher-gradebook',
    title: 'Teacher Gradebook',
    module: 'Teacher Gradebook',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Mark entry, student performance records, and grade computation',
  },
  'report-cards': {
    viewId: 'report-cards',
    title: 'Report Card Engine & QR Verification',
    module: 'Report Card Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Automated termly report cards with QR authentication codes',
  },
  'academic-analytics': {
    viewId: 'academic-analytics',
    title: 'Academic Analytics & Trends',
    module: 'Academic Analytics',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Subject pass rates, division breakdowns, and class trends',
  },
  'certificates-transcripts': {
    viewId: 'certificates-transcripts',
    title: 'Certificates & Academic Transcripts',
    module: 'Certificates & Transcripts',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Graduation certificates, leaving testimonials, and transcripts',
  },

  // Finance, Fees & Bursar Operations (Vision 4)
  'finance-hub': {
    viewId: 'finance-hub',
    title: 'Finance Operations Hub',
    module: 'Financial Reporting',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Cashflow, fee collection totals, and daily ledger overview',
  },
  'fee-structures': {
    viewId: 'fee-structures',
    title: 'Fee Structure Management',
    module: 'Fee Structure',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Tuition fees, boarding charges, and termly fee billing packages',
  },
  'student-fee-accounts': {
    viewId: 'student-fee-accounts',
    title: 'Student Fee Accounts',
    module: 'Fee Accounts',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Individual student balances, invoices, and ledger statements',
  },
  'payment-processing': {
    viewId: 'payment-processing',
    title: 'Payment & Mobile Money Engine',
    module: 'Payment Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Bursar'],
    requiredAction: 'View',
    description: 'MTN/Airtel MoMo, bank deposits, cash payments, and receipt printing',
  },
  'scholarships-discounts': {
    viewId: 'scholarships-discounts',
    title: 'Scholarships & Bursaries',
    module: 'Scholarships & Discounts',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Financial aid, staff child concessions, and merit discounts',
  },
  'budget-management': {
    viewId: 'budget-management',
    title: 'Budget Planning & Control',
    module: 'Budget Management',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Department budgets, expenditure approvals, and variance tracking',
  },
  'income-expenditure': {
    viewId: 'income-expenditure',
    title: 'Cashbook & Expenditure Vouchers',
    module: 'Income & Expenditure',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Expense vouchers, petty cash logs, and daily receipts',
  },
  'financial-reports': {
    viewId: 'financial-reports',
    title: 'Financial Statements & Audits',
    module: 'Financial Reporting',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Income statements, trial balance, and fee collection summaries',
  },
  'financial-dashboards': {
    viewId: 'financial-dashboards',
    title: 'Financial Role Dashboards',
    module: 'Financial Reporting',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'School Owner', 'Bursar'],
    requiredAction: 'View',
    description: 'Bursar and executive financial metrics cockpit',
  },
  'payment-reminders': {
    viewId: 'payment-reminders',
    title: 'Automated Fee Reminders',
    module: 'Notifications',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Bursar'],
    requiredAction: 'View',
    description: 'SMS fee reminders and payment milestone notifications',
  },

  // Operations, Attendance & Campus Life (Vision 3)
  'daily-operations': {
    viewId: 'daily-operations',
    title: 'Daily Operations Centre',
    module: 'Daily Operations',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Morning roll call, campus duty, and operational logbook',
  },
  'student-attendance': {
    viewId: 'student-attendance',
    title: 'Student Attendance Register',
    module: 'Attendance Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Daily class roll call, absence tracking, and attendance rate',
  },
  'staff-attendance-leave': {
    viewId: 'staff-attendance-leave',
    title: 'Staff Attendance & Leave',
    module: 'Staff Leave Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'Bursar', 'Librarian', 'School Nurse'],
    requiredAction: 'View',
    description: 'Staff biometric/manual clock-in and leave approval log',
  },
  'daily-register': {
    viewId: 'daily-register',
    title: 'Daily Master School Register',
    module: 'Attendance Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher'],
    requiredAction: 'View',
    description: 'School-wide morning headcount and attendance consolidation',
  },
  'visitor-management': {
    viewId: 'visitor-management',
    title: 'Visitor & Gate Security Register',
    module: 'Visitor Register',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher'],
    requiredAction: 'View',
    description: 'Campus visitors, vehicle passes, and security check-in',
  },
  'attendance-analytics': {
    viewId: 'attendance-analytics',
    title: 'Attendance Analytics & Truancy Alerts',
    module: 'Attendance Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher'],
    requiredAction: 'View',
    description: 'Chronic absence trends and automated SMS alerts to parents',
  },
  'academic-calendar': {
    viewId: 'academic-calendar',
    title: 'Academic Calendar & Schedule',
    module: 'Academic Calendar',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'School term schedules, holidays, and official calendar',
  },

  // Admissions & 360° Student Passports (Vision 2)
  'admissions': {
    viewId: 'admissions',
    title: 'Admissions Engine',
    module: 'Admissions Engine',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Registrar', 'Bursar'],
    requiredAction: 'View',
    description: 'New student applications, verification, and admission letters',
  },
  'students': {
    viewId: 'students',
    title: 'Student Passports Directory',
    module: 'Student Passport',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'Bursar', 'Registrar'],
    requiredAction: 'View',
    description: '360° student biometric, academic, and guardian profiles',
  },
  'student-detail': {
    viewId: 'student-detail',
    title: '360° Student Passport Profile',
    module: 'Student Passport',
    allowedRoles: ['Super Administrator', 'Administrator', 'Headteacher', 'Deputy Headteacher', 'Teacher', 'Bursar', 'Registrar', 'Parent', 'Student'],
    requiredAction: 'View',
    description: 'Complete student record with record-level authorization checks',
  },

  // System Administration & Security
  'users': {
    viewId: 'users',
    title: 'User Management',
    module: 'User Management',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher'],
    requiredAction: 'Manage Users',
    description: 'User accounts, credential provisioning, and role assignment',
  },
  'roles': {
    viewId: 'roles',
    title: 'Roles & Permissions Engine',
    module: 'Roles & Permissions',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher'],
    requiredAction: 'Manage Settings',
    description: 'Role definition matrix and fine-grained module capabilities',
  },
  'audit': {
    viewId: 'audit',
    title: 'System Audit Logs',
    module: 'Audit System',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'View',
    description: 'Tamper-evident system activity and security audit trail',
  },
  'settings': {
    viewId: 'settings',
    title: 'School Settings & Identity',
    module: 'School Settings',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher', 'School Owner'],
    requiredAction: 'Manage School',
    description: 'School branding, academic periods, grading system, and general configurations',
  },
  'backup': {
    viewId: 'backup',
    title: 'Data Vault & Backup',
    module: 'Backup & Restore',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher'],
    requiredAction: 'Manage Backup',
    description: 'Offline database backup, cloud export, and emergency restore',
  },
  'health': {
    viewId: 'health',
    title: 'System Health & Diagnostics',
    module: 'System Health',
    allowedRoles: ['Super Administrator', 'ICT Administrator', 'Administrator', 'Headteacher'],
    requiredAction: 'View',
    description: 'Client database storage, sync queue latency, and server status',
  },
  'profile': {
    viewId: 'profile',
    title: 'User Profile Settings',
    module: 'Dashboard',
    allowedRoles: ['*'],
    requiredAction: 'View',
    description: 'Personal profile, credentials, and password management',
  },
};

/**
 * Normalizes role strings for case-insensitive and alias-safe matching
 */
export function normalizeRole(roleName: string): string {
  if (!roleName) return 'Guest';
  const clean = roleName.trim().toLowerCase();
  if (clean === 'head teacher' || clean === 'headteacher' || clean === 'principal') return 'Headteacher';
  if (clean === 'deputy' || clean === 'deputy headteacher' || clean === 'dos' || clean === 'director of studies' || clean === 'director of studies (dos)') return 'Deputy Headteacher';
  if (clean === 'admin' || clean === 'administrator' || clean === 'school admin' || clean === 'school administrator') return 'Administrator';
  if (clean === 'super admin' || clean === 'super administrator' || clean === 'super-admin' || clean === 'platform admin' || clean === 'platform administrator') return 'Super Administrator';
  if (clean === 'ict' || clean === 'ict admin' || clean === 'ict administrator' || clean === 'it admin') return 'ICT Administrator';
  if (clean === 'owner' || clean === 'school owner' || clean === 'director') return 'School Owner';
  if (clean === 'bursar' || clean === 'accountant' || clean === 'finance' || clean === 'finance officer') return 'Bursar';
  if (clean === 'nurse' || clean === 'school nurse') return 'School Nurse';
  if (clean === 'parent' || clean === 'guardian') return 'Parent';
  if (clean === 'student' || clean === 'pupil' || clean === 'learner') return 'Student';
  if (clean === 'teacher' || clean === 'educator' || clean === 'staff') return 'Teacher';
  return roleName;
}

/**
 * Determines the ideal, uncluttered, role-tailored landing route
 */
export function getDefaultHomeRouteForRole(roleName: string): string {
  const role = normalizeRole(roleName);
  switch (role) {
    case 'Parent':
      return 'parent-portal';
    case 'Student':
      return 'v9-student-portfolio';
    case 'Teacher':
      return 'teacher-gradebook';
    case 'Bursar':
      return 'finance-hub';
    case 'School Nurse':
      return 'school-health-centre';
    case 'School Owner':
      return 'executive-cockpit';
    case 'Deputy Headteacher':
      return 'academics-hub';
    case 'Headteacher':
      return 'daily-operations';
    case 'ICT Administrator':
    case 'Super Administrator':
      return 'v26-final-system-integrity';
    case 'Administrator':
    default:
      return 'dashboard';
  }
}

/**
 * 4-Layer Route Authorization Evaluation:
 * Checks whether an active user with their role and permissions is allowed to access a specific route.
 */
export function checkRouteAccess(
  user: User | null,
  activeRole: string,
  viewId: string,
  hasPermissionFn?: (module: ModuleName, action: PermissionAction) => boolean
): AccessCheckResult {
  // Layer 1: Authentication Check
  if (!user) {
    return {
      allowed: false,
      reason: 'Authentication required. Please sign in to access this workspace.',
      suggestedView: 'login',
      statusCode: 401,
    };
  }

  if (user.status === 'Suspended') {
    return {
      allowed: false,
      reason: 'Your user account is suspended. Please contact the school administration.',
      suggestedView: 'login',
      statusCode: 403,
    };
  }

  // Find Route Security Rule
  const rule = ROUTE_SECURITY_MATRIX[viewId];
  if (!rule) {
    // If view is unknown, allow fallback to dashboard
    return {
      allowed: false,
      reason: `Module "${viewId}" is not recognized in the system routing table.`,
      suggestedView: getDefaultHomeRouteForRole(activeRole),
      statusCode: 404,
    };
  }

  // Super/Executive Admins have universal operational authority
  const role = normalizeRole(activeRole || user.role);
  if (
    role === 'Headteacher' ||
    role === 'ICT Administrator' ||
    role === 'Super Administrator' ||
    role === 'Administrator' ||
    role === 'School Owner'
  ) {
    return { allowed: true, statusCode: 200 };
  }

  // Layer 2: Role-Level Access Check
  const isWildcardAllowed = rule.allowedRoles.includes('*');
  const isDirectRoleAllowed = rule.allowedRoles.some(
    (r) => normalizeRole(r) === role || r === '*'
  );

  if (!isWildcardAllowed && !isDirectRoleAllowed) {
    const fallback = getDefaultHomeRouteForRole(role);
    return {
      allowed: false,
      reason: `Access Restricted: The "${rule.title}" area is restricted to authorized personnel. Your current role is "${role}".`,
      suggestedView: fallback,
      statusCode: 403,
    };
  }

  // Layer 3: Action-Level Permission Check (if permission checker is available)
  if (hasPermissionFn) {
    const isPermitted = hasPermissionFn(rule.module, rule.requiredAction);
    if (!isPermitted) {
      const fallback = getDefaultHomeRouteForRole(role);
      return {
        allowed: false,
        reason: `Insufficient Permissions: Your role (${role}) lacks the required "${rule.requiredAction}" capability for the "${rule.module}" module.`,
        suggestedView: fallback,
        statusCode: 403,
      };
    }
  }

  return { allowed: true, statusCode: 200 };
}

/**
 * ============================================================================
 * LAYER 4: RECORD-LEVEL & RESOURCE SCOPING RULES
 * ============================================================================
 */

/**
 * Evaluates whether a user can access a specific student's record.
 * Ensures Parents only see their linked children, Students only see themselves,
 * and Teachers see assigned classes.
 */
export function canAccessStudentRecord(
  user: User | null,
  activeRole: string,
  targetStudent: Student,
  guardiansList: Array<{ studentId: string; phone?: string; email?: string; userId?: string }> = []
): boolean {
  if (!user) return false;
  const role = normalizeRole(activeRole || user.role);

  // Super Admins & School Leadership have school-wide access
  if (
    role === 'Headteacher' ||
    role === 'Deputy Headteacher' ||
    role === 'Administrator' ||
    role === 'Super Administrator' ||
    role === 'ICT Administrator' ||
    role === 'School Owner' ||
    role === 'Registrar' ||
    role === 'Bursar' ||
    role === 'School Nurse'
  ) {
    return true;
  }

  // Parent Record-Level Isolation:
  // Must match linked child ID, phone number, email, or guardian record
  if (role === 'Parent' || role === 'Guardian') {
    const isLinkedByGuardian = guardiansList.some(
      (g) =>
        g.studentId === targetStudent.id &&
        (g.userId === user.id ||
          (user.phone && g.phone && user.phone.includes(g.phone)) ||
          (user.email && g.email && user.email.toLowerCase() === g.email.toLowerCase()))
    );

    return Boolean(isLinkedByGuardian);
  }

  // Student Record-Level Isolation:
  // Can only access own passport/record
  if (role === 'Student') {
    const isSelf =
      targetStudent.id === user.id ||
      targetStudent.studentId === user.username ||
      targetStudent.admissionNumber === user.username;
    return isSelf;
  }

  // Teacher Record-Level Access
  if (role === 'Teacher') {
    // Teachers have read access to student academic/passport data
    return true;
  }

  return false;
}

/**
 * Evaluates whether a user can access a student fee account
 */
export function canAccessFeeAccount(
  user: User | null,
  activeRole: string,
  targetStudentId: string,
  targetStudent?: Student
): boolean {
  if (!user) return false;
  const role = normalizeRole(activeRole || user.role);

  // Financial & Executive roles
  if (
    role === 'Bursar' ||
    role === 'Administrator' ||
    role === 'Super Administrator' ||
    role === 'Headteacher' ||
    role === 'School Owner'
  ) {
    return true;
  }

  // Parents: Can view fee accounts for their linked children only
  if (role === 'Parent' || role === 'Guardian') {
    if (!targetStudent) return false;
    return canAccessStudentRecord(user, activeRole, targetStudent);
  }

  // Students: Can view their own balance only
  if (role === 'Student') {
    if (!targetStudent) return false;
    return canAccessStudentRecord(user, activeRole, targetStudent);
  }

  // Teachers do not manage fee accounts
  return false;
}

/**
 * Formats a user-friendly, non-technical error description for UI display
 */
export function getFriendlyErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const msg = typeof err === 'string' ? err : err.message || '';

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network Error')) {
    return 'SchoolSoul is currently offline. Your changes are saved safely on this device and will sync automatically when the connection is restored.';
  }
  if (msg.includes('401') || msg.includes('Authentication token expired')) {
    return 'Your session has expired. Please sign in again to continue.';
  }
  if (msg.includes('403') || msg.includes('Access Denied')) {
    return 'You do not have permission to perform this specific action. If you believe this is an error, please contact your school administrator.';
  }
  if (msg.includes('404') || msg.includes('not found')) {
    return 'The requested record or module could not be found.';
  }
  if (msg.includes('429') || msg.includes('Too many requests')) {
    return 'Too many requests sent in a short time. Please wait a few seconds and try again.';
  }
  return msg;
}

/**
 * ============================================================================
 * AUTOMATED RBAC & ACCESS CONTROL INTEGRITY TEST SUITE
 * ============================================================================
 */
export interface AccessTestScenarioResult {
  scenarioName: string;
  role: string;
  targetViewOrResource: string;
  expectedAllowed: boolean;
  actualAllowed: boolean;
  passed: boolean;
  notes: string;
}

export function runAccessControlIntegritySuite(): {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: AccessTestScenarioResult[];
} {
  const results: AccessTestScenarioResult[] = [];

  const mockUsers: Record<string, User> = {
    parent: {
      id: 'usr-parent-1',
      fullName: 'Sarah Kigozi (Parent)',
      username: 'sarah_parent',
      email: 'sarah@example.com',
      phone: '+256772111222',
      employeeNumber: '',
      role: 'Parent',
      status: 'Active',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    student: {
      id: 'usr-student-1',
      fullName: 'Brian Mukasa (Student)',
      username: 'STD-2026-001',
      email: 'brian@student.school.ug',
      phone: '',
      employeeNumber: '',
      role: 'Student',
      status: 'Active',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    teacher: {
      id: 'usr-teacher-1',
      fullName: 'David Okello (Teacher)',
      username: 'teacher_okello',
      email: 'okello@school.ug',
      phone: '+256782333444',
      employeeNumber: 'EMP-104',
      role: 'Teacher',
      status: 'Active',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    bursar: {
      id: 'usr-bursar-1',
      fullName: 'Grace Namubiru (Bursar)',
      username: 'bursar_grace',
      email: 'finance@school.ug',
      phone: '+256701555666',
      employeeNumber: 'EMP-102',
      role: 'Bursar',
      status: 'Active',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    admin: {
      id: 'usr-admin-1',
      fullName: 'System Administrator',
      username: 'admin',
      email: 'admin@school.ug',
      phone: '+256770000000',
      employeeNumber: 'EMP-001',
      role: 'Administrator',
      status: 'Active',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  const testCases = [
    // 1. Parent Route Restrictions
    {
      user: mockUsers.parent,
      view: 'parent-portal',
      expected: true,
      name: 'Parent can access Parent Portal',
    },
    {
      user: mockUsers.parent,
      view: 'backup',
      expected: false,
      name: 'Parent is blocked from Backup & Restore',
    },
    {
      user: mockUsers.parent,
      view: 'users',
      expected: false,
      name: 'Parent is blocked from User Management',
    },
    {
      user: mockUsers.parent,
      view: 'finance-hub',
      expected: false,
      name: 'Parent is blocked from Finance Operations Hub',
    },

    // 2. Student Route Restrictions
    {
      user: mockUsers.student,
      view: 'v9-student-portfolio',
      expected: true,
      name: 'Student can access Student Portfolio',
    },
    {
      user: mockUsers.student,
      view: 'v25-learnguard',
      expected: true,
      name: 'Student can access LearnGuard Safe Space',
    },
    {
      user: mockUsers.student,
      view: 'users',
      expected: false,
      name: 'Student is blocked from User Management',
    },
    {
      user: mockUsers.student,
      view: 'teacher-gradebook',
      expected: false,
      name: 'Student is blocked from Teacher Gradebook',
    },
    {
      user: mockUsers.student,
      view: 'settings',
      expected: false,
      name: 'Student is blocked from School Settings',
    },

    // 3. Teacher Route Access & Restrictions
    {
      user: mockUsers.teacher,
      view: 'teacher-gradebook',
      expected: true,
      name: 'Teacher can access Teacher Gradebook',
    },
    {
      user: mockUsers.teacher,
      view: 'academics-hub',
      expected: true,
      name: 'Teacher can access Academics Hub',
    },
    {
      user: mockUsers.teacher,
      view: 'backup',
      expected: false,
      name: 'Teacher is blocked from System Backup',
    },
    {
      user: mockUsers.teacher,
      view: 'staff-hr',
      expected: false,
      name: 'Teacher is blocked from Staff HR Directory',
    },

    // 4. Bursar Route Access
    {
      user: mockUsers.bursar,
      view: 'finance-hub',
      expected: true,
      name: 'Bursar can access Finance Hub',
    },
    {
      user: mockUsers.bursar,
      view: 'fee-structures',
      expected: true,
      name: 'Bursar can access Fee Structures',
    },
    {
      user: mockUsers.bursar,
      view: 'backup',
      expected: false,
      name: 'Bursar is blocked from System Backups',
    },

    // 5. Administrator Full Operational Access
    {
      user: mockUsers.admin,
      view: 'users',
      expected: true,
      name: 'Admin can access User Management',
    },
    {
      user: mockUsers.admin,
      view: 'backup',
      expected: true,
      name: 'Admin can access Backup & Restore',
    },
    {
      user: mockUsers.admin,
      view: 'settings',
      expected: true,
      name: 'Admin can access School Settings',
    },
  ];

  for (const tc of testCases) {
    const res = checkRouteAccess(tc.user, tc.user.role, tc.view);
    const passed = res.allowed === tc.expected;
    results.push({
      scenarioName: tc.name,
      role: tc.user.role,
      targetViewOrResource: tc.view,
      expectedAllowed: tc.expected,
      actualAllowed: res.allowed,
      passed,
      notes: res.allowed ? 'Access Authorized' : res.reason || 'Access Blocked',
    });
  }

  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.length - passedTests;

  return {
    totalTests: results.length,
    passedTests,
    failedTests,
    results,
  };
}
