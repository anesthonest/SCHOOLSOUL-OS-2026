# SCHOOLSOUL OS 2026.1.0
## FINAL NAVIGATION MATRIX

**Release Version:** SchoolSoul OS 2026.1.0  
**Navigation Structure:** Desktop Sticky Sidebar, Top Header Breadcrumbs, Mobile Responsive Drawer, Hash & SessionStorage Sync

---

### Master Navigation Traceability Matrix

| Navigation Item | Source (Sidebar / Hub) | Destination (View ID) | Route Exists | Role Authorization | Screen Loads | Refresh Works | Back Works | Mobile Works | API Works | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | Sidebar: Core | `dashboard` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Central dashboard widget render verified |
| **Global Education Framework** | Sidebar: Core | `global-framework` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Framework & EMIS export module loaded |
| **Real-World Activation** | Sidebar: Core | `real-world-activation` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Pilot activation center loaded |
| **Opportunity & Achievement Hub**| Sidebar: Opportunity | `opportunity-hub` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Skills passport & board tabs active |
| **Student Skills Passport** | Sidebar: Opportunity | `skills-passport` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Mapped to `opportunity-hub` passport tab |
| **School Missions & Challenges** | Sidebar: Opportunity | `school-missions` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Mapped to `opportunity-hub` missions tab |
| **Opportunity Board & Match** | Sidebar: Opportunity | `opportunity-board` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Mapped to `opportunity-hub` board tab |
| **Verified Digital Portfolio** | Sidebar: Opportunity | `digital-portfolio` | YES | Student, Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | Mapped to `opportunity-hub` portfolio tab |
| **Achievements & Digital Certs** | Sidebar: Opportunity | `achievements-certs` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Mapped to `opportunity-hub` achievements tab |
| **School Showcase & Innovation** | Sidebar: Opportunity | `school-showcase` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Mapped to `opportunity-hub` showcase tab |
| **Clubs & Mentorship Guild** | Sidebar: Opportunity | `clubs-mentorship` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Mapped to `opportunity-hub` clubs tab |
| **School Impact & Accreditation** | Sidebar: Opportunity | `school-impact` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Mapped to `opportunity-hub` impact tab |
| **Sponsorship Bridge** | Sidebar: Sponsorship | `sponsorship-bridge` | YES | All Authorized | YES | YES | YES | YES | YES | **PASS** | Sponsorship & Student Opportunity Bridge active |
| **Sponsor Portal & Discovery** | Sidebar: Sponsorship | `sponsor-dashboard` | YES | Sponsor, Admin | YES | YES | YES | YES | YES | **PASS** | Privacy-masked student matching active |
| **School Sponsorship Oversight** | Sidebar: Sponsorship | `school-sponsorship` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | School sponsorship financial ledger loaded |
| **Scholarships & Grants Board** | Sidebar: Sponsorship | `scholarships-grants` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Scholarships application board active |
| **System Integrity & Security (V26)**| Sidebar: Security | `v26-final-system-integrity`| YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Master security console rendered |
| **SchoolSoul LearnGuard** | Sidebar: Digital Learning | `v25-learnguard` | YES | Admin, Teacher, Parent | YES | YES | YES | YES | YES | **PASS** | Student phone lockdown & safe browser active |
| **Pre-Deployment Certification** | Sidebar: Hardening | `v24-final-pre-deployment-pilot`| YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Zero-gap pilot audit certification loaded |
| **Unified Education OS (V23)** | Sidebar: OS Engine | `v23-unified-education-os` | YES | Admin, Super Admin | YES | YES | YES | YES | YES | **PASS** | Unified subscription & feedback console active |
| **Commercial & Value Center** | Sidebar: Commercial | `commercial-value-center`| YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Commercial metrics & ROI dashboard rendered |
| **Unified Subscription** | Sidebar: Commercial | `unified-subscription` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Subscription tiers & billing active |
| **V21 Release Certification** | Sidebar: Production | `v21-final-production-release`| YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Final production validation center active |
| **V20 VINEXSAH Control Center** | Sidebar: Enterprise | `v20-vinexsah-control-center`| YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Enterprise multi-tenant console rendered |
| **V19 Customer Success** | Sidebar: Support | `v19-deployment-success` | YES | Admin, Support | YES | YES | YES | YES | YES | **PASS** | Deployment & ticket tracker active |
| **V18 Mobile License Sync** | Sidebar: Mobile | `v18-mobile-license-integration`| YES | Admin, Tech | YES | YES | YES | YES | YES | **PASS** | Mobile license synchronization active |
| **V16 Market Readiness** | Sidebar: Launch | `v16-market-readiness` | YES | Admin, Tech | YES | YES | YES | YES | YES | **PASS** | Product validation & launch matrix loaded |
| **Pilot Release Center** | Sidebar: Deployment | `pilot-release-center` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Installer package & diagnostics active |
| **V15 License Management** | Sidebar: Licensing | `v15-license-management` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Cryptographic license validator active |
| **V14 Comms & Mail Merge** | Sidebar: Comms | `v14-communication-suite` | YES | Admin, Teacher | YES | YES | YES | YES | YES | **PASS** | Enterprise bulk mail merge suite active |
| **SchoolSoul Connect (LAN)** | Sidebar: LAN | `v13-connect` | YES | Tech, Admin | YES | YES | YES | YES | YES | **PASS** | Multi-computer local network synchronization active |
| **V11 Student Innovation Hub** | Sidebar: Innovation | `v11-student-innovation-hub`| YES | Student, Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | Student STEM ideas & project workspace loaded |
| **V9 Engagement Hub** | Sidebar: Vision 9 | `v9-hub` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Public engagement central cockpit loaded |
| **Student Voice & Proposals** | Sidebar: Vision 9 | `v9-student-voice` | YES | Student, Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | Democratic student voting & petition engine active |
| **Student Portfolio** | Sidebar: Vision 9 | `v9-student-portfolio` | YES | Student, Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | Student work showcase & skill badges active |
| **Innovation & STEM Hub** | Sidebar: Vision 9 | `v9-innovation-hub` | YES | Student, Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | STEM robotics & coding repository active |
| **Clubs & Societies** | Sidebar: Vision 9 | `v9-school-clubs` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Student clubs directory & event tracker active |
| **Student Marketplace** | Sidebar: Vision 9 | `v9-student-marketplace` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | School Market catalog, cart & checkout active |
| **Public Website CMS** | Sidebar: Vision 9 | `v9-public-website` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | School public website visual builder active |
| **News & Media Desk** | Sidebar: Vision 9 | `v9-news-media` | YES | Admin, Teacher | YES | YES | YES | YES | YES | **PASS** | School editorial desk & press releases active |
| **Media Gallery** | Sidebar: Vision 9 | `v9-school-gallery` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Photo & event album repository active |
| **Alumni Network** | Sidebar: Vision 9 | `v9-alumni-network` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Alumni registry & mentorship connections active |
| **Partnership Desk** | Sidebar: Vision 9 | `v9-partnerships` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Corporate & NGO partnership pipeline active |
| **Community Outreach** | Sidebar: Vision 9 | `v9-community-engagement`| YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Local community service projects active |
| **Donations & Sponsorships** | Sidebar: Vision 9 | `v9-donations-fundraising`| YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Fundraising campaigns & donations active |
| **Brand & Certificates** | Sidebar: Vision 9 | `v9-brand-management` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | School brand assets & templates active |
| **Recognition & Badges** | Sidebar: Vision 9 | `v9-recognition-awards` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Digital badge minting & awards showcase active |
| **Public Analytics** | Sidebar: Vision 9 | `v9-public-analytics` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | Public portal traffic & engagement analytics active |
| **V8 Intelligence Hub** | Sidebar: Vision 8 | `v8-intelligence-hub` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Predictive analytics & AI cockpit loaded |
| **Executive Growth Cockpit** | Sidebar: Vision 8 | `executive-cockpit` | YES | Admin, Board | YES | YES | YES | YES | YES | **PASS** | Strategic school enrollment & revenue KPIs loaded |
| **AI Assistant & Reports** | Sidebar: Vision 8 | `ai-assistant` | YES | Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | Gemini-powered assistant & lesson generator active |
| **Student Risk Analytics** | Sidebar: Vision 8 | `student-intelligence` | YES | Admin, Teacher | YES | YES | YES | YES | YES | **PASS** | Early warning attendance & grade drop model active |
| **Teacher Intelligence** | Sidebar: Vision 8 | `teacher-intelligence` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Teacher workload & syllabus coverage KPIs active |
| **Financial AI & Simulator** | Sidebar: Vision 8 | `financial-intelligence` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Fee collection cash-flow forecasting engine active |
| **Performance & Resources** | Sidebar: Vision 8 | `performance-analytics` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Departmental performance comparisons active |
| **School Improvement Plan** | Sidebar: Vision 8 | `improvement-tracker` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Goal milestone tracker & evidence vault active |
| **Board & Executive Packs** | Sidebar: Vision 8 | `board-reporting` | YES | Admin, Board | YES | YES | YES | YES | YES | **PASS** | Board-ready PDF report generation active |
| **Knowledge & Policy Search** | Sidebar: Vision 8 | `knowledge-centre` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Semantic institutional document search active |
| **AI Controls & Audit Logs** | Sidebar: Vision 8 | `ai-governance` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | AI safety controls & prompt audit logs active |
| **Admin Executive Hub** | Sidebar: Admin | `administration-dashboards`| YES | Admin | YES | YES | YES | YES | YES | **PASS** | Executive school administration overview loaded |
| **Safeguarding Centre** | Sidebar: Welfare | `safeguarding-centre` | YES | Admin, Counsellor | YES | YES | YES | YES | YES | **PASS** | Child protection & confidential concerns active |
| **Student Welfare** | Sidebar: Welfare | `student-welfare` | YES | Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | Pastoral care & student support logs active |
| **Behaviour & Discipline** | Sidebar: Welfare | `behaviour-discipline` | YES | Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | Demerits & positive commendations active |
| **Counselling Services** | Sidebar: Welfare | `counselling-services` | YES | Counsellor, Admin | YES | YES | YES | YES | YES | **PASS** | Counselling appointments & case notes active |
| **School Health Centre** | Sidebar: Welfare | `school-health-centre` | YES | Nurse, Admin | YES | YES | YES | YES | YES | **PASS** | Clinic visits & student medical alerts active |
| **Incident Management** | Sidebar: Welfare | `incident-management` | YES | Admin, Teacher | YES | YES | YES | YES | YES | **PASS** | Emergency & disciplinary incident reports active |
| **Staff HR Directory** | Sidebar: HR | `staff-hr` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Staff contracts & profiles active |
| **Staff Leave Engine** | Sidebar: HR | `staff-leave` | YES | Staff, Admin | YES | YES | YES | YES | YES | **PASS** | Leave requests & approval workflow active |
| **Staff Appraisals** | Sidebar: HR | `staff-appraisals` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Annual teacher reviews & feedback active |
| **Staff CPD & Training** | Sidebar: HR | `staff-cpd` | YES | Staff, Admin | YES | YES | YES | YES | YES | **PASS** | Professional development certificates active |
| **Asset Management** | Sidebar: Assets | `asset-management` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Fixed school asset register active |
| **Stores & Inventory** | Sidebar: Assets | `inventory-management` | YES | Storekeeper, Admin | YES | YES | YES | YES | YES | **PASS** | Stationery & textbook stock levels active |
| **Policy Document Centre** | Sidebar: Admin | `policy-centre` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Official school handbook & policies active |
| **School Administration** | Sidebar: Admin | `school-administration` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | Operational school governance settings active |
| **Compliance & Audit** | Sidebar: Admin | `compliance-audit` | YES | Admin, Auditor | YES | YES | YES | YES | YES | **PASS** | Ministry of Education compliance check active |
| **Parent Portal Hub** | Sidebar: Comms | `parent-portal` | YES | Parent, Admin | YES | YES | YES | YES | YES | **PASS** | Parent child dashboard active |
| **School Messaging** | Sidebar: Comms | `direct-messaging` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Direct messaging threads active |
| **SMS Gateway Engine** | Sidebar: Comms | `sms-engine` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Bulk SMS delivery & templates active |
| **WhatsApp Business** | Sidebar: Comms | `whatsapp-integration` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | WhatsApp alert broadcast active |
| **Announcement Centre** | Sidebar: Comms | `announcements` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | School-wide broadcast noticeboard active |
| **School News & Articles** | Sidebar: Comms | `school-news` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | School editorial bulletin active |
| **Events & Calendar** | Sidebar: Comms | `events-management` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Term dates & extracurricular calendar active |
| **Parent-Teacher Meetings** | Sidebar: Comms | `ptm-meetings` | YES | Parent, Teacher | YES | YES | YES | YES | YES | **PASS** | PTM booking slots active |
| **Digital Consent Slips** | Sidebar: Comms | `consent-forms` | YES | Parent, Teacher | YES | YES | YES | YES | YES | **PASS** | Trip & activity digital signature consent active |
| **Feedback & Surveys** | Sidebar: Comms | `feedback-surveys` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Anonymous student & parent surveys active |
| **School Helpdesk** | Sidebar: Comms | `help-centre` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | IT & fee support tickets active |
| **Digital Community Hub** | Sidebar: Comms | `digital-community` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Social campus activity feed active |
| **Community Groups** | Sidebar: Comms | `community-groups` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Departmental & student clubs groups active |
| **Emergency Alerts** | Sidebar: Comms | `emergency-alerts` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | High-priority SMS/Push lockdown alerts active |
| **Role Dashboards (Comms)** | Sidebar: Comms | `communication-dashboards`| YES | Admin | YES | YES | YES | YES | YES | **PASS** | Communication overview dashboard loaded |
| **Engagement Analytics** | Sidebar: Comms | `communication-analytics` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | Open rates & response latency analytics active |
| **Live Virtual Classroom** | Sidebar: Academics | `live-learning` | YES | Teacher, Student | YES | YES | YES | YES | YES | **PASS** | WebRTC live video & interactive whiteboard active |
| **Academics Hub** | Sidebar: Academics | `academics-hub` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Academic operations central cockpit loaded |
| **Classes & Structure** | Sidebar: Academics | `academic-structure` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Streams, grades & class setup active |
| **Subject Admin** | Sidebar: Academics | `subject-management` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | National curriculum subjects active |
| **Timetable Generator** | Sidebar: Academics | `timetable-engine` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Conflict-free lesson timetable scheduler active |
| **Lesson Planner** | Sidebar: Academics | `lesson-planner` | YES | Teacher, DOS | YES | YES | YES | YES | YES | **PASS** | Teacher scheme of work & lesson plans active |
| **Homework & Tasks** | Sidebar: Academics | `homework-assignments` | YES | Teacher, Student | YES | YES | YES | YES | YES | **PASS** | Assignment upload & student submissions active |
| **Assessments & Exams** | Sidebar: Academics | `assessment-exams` | YES | Teacher, DOS | YES | YES | YES | YES | YES | **PASS** | Mid-term & end-of-term exam schedules active |
| **Teacher Gradebook** | Sidebar: Academics | `teacher-gradebook` | YES | Teacher, DOS | YES | YES | YES | YES | YES | **PASS** | Continuous assessment gradebook matrix active |
| **Report Cards & QR** | Sidebar: Academics | `report-cards` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Printable student term report cards with QR active |
| **Academic Analytics** | Sidebar: Academics | `academic-analytics` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Subject pass rates & grade distribution graphs active |
| **Transcripts & Certs** | Sidebar: Academics | `certificates-transcripts`| YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Official transcript minting active |
| **Finance Operations Hub** | Sidebar: Finance | `finance-hub` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Financial operations central hub loaded |
| **Fee Structures** | Sidebar: Finance | `fee-structures` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Class fee schedules & optional items active |
| **Student Fee Accounts** | Sidebar: Finance | `student-fee-accounts` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Individual student balances & statements active |
| **Payment & MoMo Engine** | Sidebar: Finance | `payment-processing` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Pesapal 3.0 commercial gateway checkout active |
| **Scholarships & Bursaries** | Sidebar: Finance | `scholarships-discounts`| YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Need-based fee discounts & waivers active |
| **Budget Management** | Sidebar: Finance | `budget-management` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Departmental budget allocation vs actuals active |
| **Cashbook & Expenses** | Sidebar: Finance | `income-expenditure` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Petty cash & operational expenses ledger active |
| **Financial Reports** | Sidebar: Finance | `financial-reports` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Balance sheets & audit trial balance active |
| **Role Dashboards (Finance)**| Sidebar: Finance | `financial-dashboards` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Bursar financial KPI dashboard active |
| **Fee Reminders** | Sidebar: Finance | `payment-reminders` | YES | Admin, Bursar | YES | YES | YES | YES | YES | **PASS** | Automated SMS/WhatsApp fee overdue alerts active |
| **Operations Hub** | Sidebar: Operations | `daily-operations` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Operations daily cockpit loaded |
| **Student Register** | Sidebar: Operations | `student-attendance` | YES | Teacher, Admin | YES | YES | YES | YES | YES | **PASS** | Morning/afternoon class roll-call active |
| **Staff & Leave Engine** | Sidebar: Operations | `staff-attendance-leave`| YES | Staff, Admin | YES | YES | YES | YES | YES | **PASS** | Biometric/manual staff clock-in active |
| **Daily Master Register** | Sidebar: Operations | `daily-register` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | School-wide aggregated attendance summary active |
| **Visitor Register** | Sidebar: Operations | `visitor-management` | YES | Security, Admin | YES | YES | YES | YES | YES | **PASS** | Campus gate visitor log & badge issuance active |
| **Analytics & Alerts** | Sidebar: Operations | `attendance-analytics` | YES | Admin, DOS | YES | YES | YES | YES | YES | **PASS** | Chronic absenteeism risk alerts active |
| **Academic Calendar** | Sidebar: Operations | `academic-calendar` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | Term dates, holidays & exam schedule active |
| **Admissions Engine** | Sidebar: Admissions | `admissions` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | Student applicant intake & onboarding active |
| **Student Passports** | Sidebar: Admissions | `students` | YES | All Authorized | YES | YES | YES | YES | YES | **PASS** | Student directory & comprehensive passports active |
| **Student Detail View** | Deep Link / Router | `student-detail` | YES | All Authorized | YES | YES | YES | YES | YES | **PASS** | Comprehensive student 360-degree profile active |
| **User Management** | Sidebar: System | `users` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | User accounts & credential reset active |
| **Roles & Permissions** | Sidebar: System | `roles` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | 7-tier granular RBAC matrix active |
| **Audit Logs** | Sidebar: System | `audit` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Immutable security & financial audit ledger active |
| **School Settings** | Sidebar: System | `settings` | YES | Admin | YES | YES | YES | YES | YES | **PASS** | School profile, branding & term dates active |
| **Backup & Restore** | Sidebar: System | `backup` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Automated daily database snapshots & restore active |
| **System Health** | Sidebar: System | `health` | YES | Super Admin | YES | YES | YES | YES | YES | **PASS** | Memory, database latency & disk probes active |
| **Profile Settings** | Sidebar: System | `profile` | YES | All Roles | YES | YES | YES | YES | YES | **PASS** | User password change & 2FA preferences active |
