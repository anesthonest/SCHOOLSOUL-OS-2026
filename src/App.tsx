import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SyncProvider, useSync } from './context/SyncContext';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider } from './context/NavigationContext';
import { SchoolSetupWizard } from './pages/SchoolSetupWizard';
import { Login } from './pages/Login';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { RolesAndPermissions } from './pages/RolesAndPermissions';
import { AuditLogs } from './pages/AuditLogs';
import { SchoolSettings } from './pages/SchoolSettings';
import { BackupRestore } from './pages/BackupRestore';
import { SystemHealth } from './pages/SystemHealth';
import { ProfileSettings } from './pages/ProfileSettings';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { StudentPassportListPage } from './pages/StudentPassportListPage';
import { StudentPassportDetailPage } from './pages/StudentPassportDetailPage';
import { DailyOperationsCentrePage } from './pages/DailyOperationsCentrePage';
import { StudentAttendancePage } from './pages/StudentAttendancePage';
import { StaffAttendanceAndLeavePage } from './pages/StaffAttendanceAndLeavePage';
import { DailySchoolRegisterPage } from './pages/DailySchoolRegisterPage';
import { VisitorManagementPage } from './pages/VisitorManagementPage';
import { AttendanceAnalyticsPage } from './pages/AttendanceAnalyticsPage';
import { AcademicCalendarPage } from './pages/AcademicCalendarPage';
import { FinanceOperationsHubPage } from './pages/FinanceOperationsHubPage';
import { FeeStructureManagementPage } from './pages/FeeStructureManagementPage';
import { StudentFeeAccountsPage } from './pages/StudentFeeAccountsPage';
import { PaymentProcessingPage } from './pages/PaymentProcessingPage';
import { ScholarshipsDiscountsPage } from './pages/ScholarshipsDiscountsPage';
import { BudgetManagementPage } from './pages/BudgetManagementPage';
import { IncomeExpenditurePage } from './pages/IncomeExpenditurePage';
import { FinancialReportingPage } from './pages/FinancialReportingPage';
import { FinancialDashboardsPage } from './pages/FinancialDashboardsPage';
import { PaymentRemindersPage } from './pages/PaymentRemindersPage';
import { AcademicsHubPage } from './pages/AcademicsHubPage';
import { AcademicStructurePage } from './pages/AcademicStructurePage';
import { SubjectManagementPage } from './pages/SubjectManagementPage';
import { TimetableEnginePage } from './pages/TimetableEnginePage';
import { LessonPlannerPage } from './pages/LessonPlannerPage';
import { HomeworkAssignmentsPage } from './pages/HomeworkAssignmentsPage';
import { AssessmentExamsPage } from './pages/AssessmentExamsPage';
import { TeacherGradebookPage } from './pages/TeacherGradebookPage';
import { ReportCardEnginePage } from './pages/ReportCardEnginePage';
import { AcademicAnalyticsPage } from './pages/AcademicAnalyticsPage';
import { CertificatesTranscriptsPage } from './pages/CertificatesTranscriptsPage';
import { ParentPortalPage } from './pages/ParentPortalPage';
import { DirectMessagingPage } from './pages/DirectMessagingPage';
import { SmsEnginePage } from './pages/SmsEnginePage';
import { WhatsAppIntegrationPage } from './pages/WhatsAppIntegrationPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { SchoolNewsPage } from './pages/SchoolNewsPage';
import { EventsManagementPage } from './pages/EventsManagementPage';
import { ParentTeacherMeetingsPage } from './pages/ParentTeacherMeetingsPage';
import { DigitalConsentFormsPage } from './pages/DigitalConsentFormsPage';
import { FeedbackSurveysPage } from './pages/FeedbackSurveysPage';
import { AdminFeedbackCentrePage } from './pages/AdminFeedbackCentrePage';
import { SchoolHelpCentrePage } from './pages/SchoolHelpCentrePage';
import { DigitalCommunityPage } from './pages/DigitalCommunityPage';
import { CommunityGroupsPage } from './pages/CommunityGroupsPage';
import { EmergencyAlertPage } from './pages/EmergencyAlertPage';
import { CommunicationDashboardsPage } from './pages/CommunicationDashboardsPage';
import { CommunicationAnalyticsPage } from './pages/CommunicationAnalyticsPage';
import { SafeguardingCentrePage } from './pages/SafeguardingCentrePage';
import { StudentWelfarePage } from './pages/StudentWelfarePage';
import { BehaviourDisciplinePage } from './pages/BehaviourDisciplinePage';
import { CounsellingServicesPage } from './pages/CounsellingServicesPage';
import { SchoolHealthCentrePage } from './pages/SchoolHealthCentrePage';
import { IncidentManagementPage } from './pages/IncidentManagementPage';
import { StaffHrManagementPage } from './pages/StaffHrManagementPage';
import { StaffLeaveManagementPage } from './pages/StaffLeaveManagementPage';
import { StaffPerformanceAppraisalPage } from './pages/StaffPerformanceAppraisalPage';
import { StaffCpdPage } from './pages/StaffCpdPage';
import { AssetManagementPage } from './pages/AssetManagementPage';
import { InventoryManagementPage } from './pages/InventoryManagementPage';
import { PolicyDocumentCentrePage } from './pages/PolicyDocumentCentrePage';
import { SchoolAdministrationPage } from './pages/SchoolAdministrationPage';
import { ComplianceAuditPage } from './pages/ComplianceAuditPage';
import { AdministrationDashboardsPage } from './pages/AdministrationDashboardsPage';
import { SchoolIntelligenceHubPage } from './pages/SchoolIntelligenceHubPage';
import { ExecutiveGrowthCockpitPage } from './pages/ExecutiveGrowthCockpitPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { StudentSuccessIntelligencePage } from './pages/StudentSuccessIntelligencePage';
import { TeacherIntelligencePage } from './pages/TeacherIntelligencePage';
import { FinancialIntelligencePage } from './pages/FinancialIntelligencePage';
import { SchoolPerformanceAnalyticsPage } from './pages/SchoolPerformanceAnalyticsPage';
import { SchoolImprovementTrackerPage } from './pages/SchoolImprovementTrackerPage';
import { BoardReportingCentrePage } from './pages/BoardReportingCentrePage';
import { KnowledgeCentrePage } from './pages/KnowledgeCentrePage';
import { UserGuidePage } from './pages/UserGuidePage';
import { AiGovernancePage } from './pages/AiGovernancePage';

// Vision 9 Imports
import { V9PublicEngagementHubPage } from './pages/v9/V9PublicEngagementHubPage';
import { StudentVoicePage } from './pages/v9/StudentVoicePage';
import { StudentPortfolioPage } from './pages/v9/StudentPortfolioPage';
import { InnovationHubPage } from './pages/v9/InnovationHubPage';
import { SchoolClubsPage } from './pages/v9/SchoolClubsPage';
import { StudentMarketplacePage } from './pages/v9/StudentMarketplacePage';
import { PublicWebsiteManagerPage } from './pages/v9/PublicWebsiteManagerPage';
import { NewsMediaCentrePage } from './pages/v9/NewsMediaCentrePage';
import { SchoolGalleryPage } from './pages/v9/SchoolGalleryPage';
import { AlumniNetworkPage } from './pages/v9/AlumniNetworkPage';
import { PartnershipsPage } from './pages/v9/PartnershipsPage';
import { CommunityEngagementPage } from './pages/v9/CommunityEngagementPage';
import { DonationsFundraisingPage } from './pages/v9/DonationsFundraisingPage';
import { BrandManagementPage } from './pages/v9/BrandManagementPage';
import { RecognitionAwardsPage } from './pages/v9/RecognitionAwardsPage';
import { PublicAnalyticsPage } from './pages/v9/PublicAnalyticsPage';
import { Vision11StudentInnovationHubPage } from './pages/v11/Vision11StudentInnovationHubPage';
import { SchoolSoulConnectPage } from './pages/v13/SchoolSoulConnectPage';
import { EnterpriseCommunicationSuitePage } from './pages/v14/EnterpriseCommunicationSuitePage';
import { EnterpriseLicenseManagementPage } from './pages/v15/EnterpriseLicenseManagementPage';
import { MarketReadinessLaunchPage } from './pages/v16/MarketReadinessLaunchPage';
import { MobileLicenseIntegrationPage } from './pages/v18/MobileLicenseIntegrationPage';
import { DeploymentCustomerSuccessPage } from './pages/v19/DeploymentCustomerSuccessPage';
import { VinexsahControlCenterPage } from './pages/v20/VinexsahControlCenterPage';
import { FinalProductionReleasePage } from './pages/v21/FinalProductionReleasePage';
import { UnifiedSubscriptionPage } from './pages/subscription/UnifiedSubscriptionPage';
import { SchoolCommercialValueCenterPage } from './pages/subscription/SchoolCommercialValueCenterPage';
import { UnifiedEducationOSPage } from './pages/v23/UnifiedEducationOSPage';
import { FinalPreDeploymentPilotPage } from './pages/v24/FinalPreDeploymentPilotPage';
import { SchoolSoulLearnGuardPage } from './pages/v25/SchoolSoulLearnGuardPage';
import { FinalSystemIntegrityHardeningPage } from './pages/v26/FinalSystemIntegrityHardeningPage';
import { PilotReleaseCenterPage } from './pages/pilot/PilotReleaseCenterPage';
import { RealWorldActivationPage } from './pages/pilot/RealWorldActivationPage';
import { PesapalCallbackPage } from './pages/billing/PesapalCallbackPage';
import { LiveLearningPage } from './pages/LiveLearningPage';
import { OpportunityHubPage } from './pages/opportunity/OpportunityHubPage';
import { SchoolSponsorshipPage } from './pages/sponsorship/SchoolSponsorshipPage';
import { GlobalEducationFrameworkPage } from './pages/GlobalEducationFrameworkPage';

import { InactivityLockModal } from './components/common/InactivityLockModal';
import { NavigationDebugOverlay } from './components/common/NavigationDebugOverlay';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { RouteAccessDenied } from './components/common/RouteAccessDenied';
import { checkRouteAccess } from './security/accessControl';

// Master Array of registered views for route validation & navigation sync
export const KNOWN_VIEWS = new Set([
  'dashboard', 'live-learning', 'pesapal-callback', 'real-world-activation', 'commercial-value-center',
  'global-framework', 'country-frameworks', 'curriculum-config', 'emis-export', 'cross-border-transfer',
  'opportunity-hub', 'skills-passport', 'school-missions', 'opportunity-board', 'digital-portfolio', 'achievements-certs', 'school-showcase', 'clubs-mentorship', 'school-impact',
  'sponsorship-bridge', 'sponsor-dashboard', 'school-sponsorship', 'scholarships-grants',
  'v26-final-system-integrity', 'v25-learnguard', 'v24-final-pre-deployment-pilot', 'v23-unified-education-os', 'unified-subscription', 'v21-final-production-release', 'v20-vinexsah-control-center', 'v19-deployment-success', 'v18-mobile-license-integration', 'v16-market-readiness', 'pilot-release-center', 'v15-license-management', 'v14-communication-suite', 'v13-connect', 'v11-student-innovation-hub', 'v9-hub', 'v9-student-voice', 'v9-student-portfolio', 'v9-innovation-hub',
  'v9-school-clubs', 'v9-student-marketplace', 'v9-public-website', 'v9-news-media',
  'v9-school-gallery', 'v9-alumni-network', 'v9-partnerships', 'v9-community-engagement',
  'v9-donations-fundraising', 'v9-brand-management', 'v9-recognition-awards', 'v9-public-analytics',
  'v8-intelligence-hub', 'executive-cockpit', 'ai-assistant', 'student-intelligence',
  'teacher-intelligence', 'financial-intelligence', 'performance-analytics', 'improvement-tracker',
  'board-reporting', 'knowledge-centre', 'user-guide', 'ai-governance', 'safeguarding-centre', 'student-welfare',
  'behaviour-discipline', 'counselling-services', 'school-health-centre', 'incident-management',
  'staff-hr', 'staff-leave', 'staff-appraisals', 'staff-cpd', 'asset-management',
  'inventory-management', 'policy-centre', 'school-administration', 'compliance-audit',
  'administration-dashboards', 'parent-portal', 'direct-messaging', 'sms-engine',
  'whatsapp-integration', 'announcements', 'school-news', 'events-management', 'ptm-meetings',
  'consent-forms', 'feedback-surveys', 'help-centre', 'digital-community', 'community-groups', 'emergency-alerts',
  'communication-dashboards', 'communication-analytics', 'academics-hub', 'academic-structure',
  'subject-management', 'timetable-engine', 'lesson-planner', 'homework-assignments',
  'assessment-exams', 'teacher-gradebook', 'report-cards', 'academic-analytics',
  'certificates-transcripts', 'finance-hub', 'fee-structures', 'student-fee-accounts',
  'payment-processing', 'scholarships-discounts', 'budget-management', 'income-expenditure',
  'financial-reports', 'financial-dashboards', 'payment-reminders', 'daily-operations',
  'student-attendance', 'staff-attendance-leave', 'daily-register', 'visitor-management',
  'attendance-analytics', 'academic-calendar', 'admissions', 'students', 'student-detail',
  'users', 'roles', 'audit', 'settings', 'backup', 'health', 'profile', 'admin-feedback', 'feedback-centre'
]);

const AppContent: React.FC = () => {
  const { isSetupComplete, isAuthenticated, isLocked, lockSession, unlockSession, loading, user, activeRole, hasPermission } = useAuth();
  
  // Persistent Navigation State (Synced with Hash & SessionStorage)
  const [currentView, setCurrentViewState] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && KNOWN_VIEWS.has(hash)) return hash;
    const stored = sessionStorage.getItem('schoolsoul_current_view');
    if (stored && KNOWN_VIEWS.has(stored)) return stored;
    return 'dashboard';
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    sessionStorage.setItem('schoolsoul_current_view', view);
    if (window.location.hash !== `#${view}`) {
      window.history.pushState(null, '', `#${view}`);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash && KNOWN_VIEWS.has(hash)) {
        setCurrentViewState(hash);
        sessionStorage.setItem('schoolsoul_current_view', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-detail');
  };

  // Inactivity Detection Timer (15 Minutes)
  useEffect(() => {
    if (!isAuthenticated || isLocked) return;

    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_MS = 15 * 60 * 1000; // 15 mins

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lockSession();
      }, INACTIVITY_MS);
    };

    // Listen to user interaction events
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [isAuthenticated, isLocked, lockSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-slate-300">
          Loading SchoolSoul Operating System...
        </p>
      </div>
    );
  }

  // 0. Pesapal Callback Direct Route Check
  const isPesapalCallbackUrl = window.location.pathname.startsWith('/billing/pesapal') || 
                               window.location.search.includes('OrderTrackingId') ||
                               window.location.hash.includes('pesapal-callback');
  if (isPesapalCallbackUrl) {
    return <PesapalCallbackPage />;
  }

  // 1. First-time Setup Wizard if no school profile is configured
  if (!isSetupComplete) {
    return <SchoolSetupWizard />;
  }

  // 2. Authentication Screen
  if (!isAuthenticated) {
    return <Login />;
  }

  // 3. Main Operational App Layout
  const routeAccess = checkRouteAccess(user, activeRole, currentView, hasPermission);

  return (
    <NavigationProvider activeView={currentView} onNavigate={setCurrentView}>
      <AppLayout activeView={currentView} onNavigate={setCurrentView} onViewChange={setCurrentView}>
        <ErrorBoundary>
          {!routeAccess.allowed ? (
            <RouteAccessDenied
              attemptedView={currentView}
              onNavigate={setCurrentView}
              customReason={routeAccess.reason}
            />
          ) : (
            <>
              {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}

              {/* SchoolSoul Live Learning & Virtual Classroom Suite */}
              {currentView === 'live-learning' && <LiveLearningPage />}

              {/* SchoolSoul Pesapal Payment Verification Route */}
              {currentView === 'pesapal-callback' && <PesapalCallbackPage />}

              {/* SchoolSoul Real-World Ecosystem Activation Center */}
              {currentView === 'real-world-activation' && <RealWorldActivationPage />}

              {/* SchoolSoul Opportunity, Achievement, Skills & Innovation Engine */}
              {currentView === 'opportunity-hub' && <OpportunityHubPage initialTab="passport" />}
              {currentView === 'skills-passport' && <OpportunityHubPage initialTab="passport" />}
              {currentView === 'school-missions' && <OpportunityHubPage initialTab="missions" />}
              {currentView === 'opportunity-board' && <OpportunityHubPage initialTab="board" />}
              {currentView === 'digital-portfolio' && <OpportunityHubPage initialTab="portfolio" />}
              {currentView === 'achievements-certs' && <OpportunityHubPage initialTab="achievements" />}
              {currentView === 'school-showcase' && <OpportunityHubPage initialTab="showcase" />}
              {currentView === 'clubs-mentorship' && <OpportunityHubPage initialTab="clubs" />}
              {currentView === 'school-impact' && <OpportunityHubPage initialTab="impact" />}

              {/* SchoolSoul Sponsorship & Student Opportunity Bridge */}
              {currentView === 'sponsorship-bridge' && (
                <SchoolSponsorshipPage
                  currentUserId={user?.id}
                  currentUserName={user?.fullName}
                  currentUserRole={activeRole as any}
                />
              )}
              {currentView === 'sponsor-dashboard' && (
                <SchoolSponsorshipPage
                  currentUserId={user?.id}
                  currentUserName={user?.fullName}
                  currentUserRole={activeRole as any}
                />
              )}
              {currentView === 'school-sponsorship' && (
                <SchoolSponsorshipPage
                  currentUserId={user?.id}
                  currentUserName={user?.fullName}
                  currentUserRole={activeRole as any}
                />
              )}
              {currentView === 'scholarships-grants' && (
                <SchoolSponsorshipPage
                  currentUserId={user?.id}
                  currentUserName={user?.fullName}
                  currentUserRole={activeRole as any}
                />
              )}

              {/* SchoolSoul Global Education Framework: Multi-Country & Multi-Curriculum Core */}
              {(currentView === 'global-framework' ||
                currentView === 'country-frameworks' ||
                currentView === 'curriculum-config' ||
                currentView === 'emis-export' ||
                currentView === 'cross-border-transfer') && (
                <GlobalEducationFrameworkPage />
              )}

              {/* SchoolSoul OS Master System Integrity & Hardening Audit Console */}
              {currentView === 'v26-final-system-integrity' && <FinalSystemIntegrityHardeningPage />}

              {/* SchoolSoul LearnGuard: Controlled Student Phone & Digital Learning System */}
              {currentView === 'v25-learnguard' && <SchoolSoulLearnGuardPage />}

          {/* SchoolSoul OS Master Pre-Deployment Certification & Pilot Center */}
          {currentView === 'v24-final-pre-deployment-pilot' && <FinalPreDeploymentPilotPage />}

          {/* SchoolSoul Vision 23: Unified Education OS, Student-Based Subscription & Feedback Platform */}
          {currentView === 'v23-unified-education-os' && <UnifiedEducationOSPage />}

          {/* Vision 21: Final Production Hardening & Release Certification */}
          {currentView === 'v21-final-production-release' && <FinalProductionReleasePage />}

          {/* SchoolSoul Commercial Operating System & Recurring Value Center */}
          {currentView === 'commercial-value-center' && <SchoolCommercialValueCenterPage onNavigate={setCurrentView} />}

          {/* SchoolSoul Unified Monthly Subscription System */}
          {currentView === 'unified-subscription' && <UnifiedSubscriptionPage />}

          {/* Vision 20: VINEXSAH Control Center (VCC) Enterprise Console */}
          {currentView === 'v20-vinexsah-control-center' && <VinexsahControlCenterPage />}

          {/* Vision 19: Deployment, Support & Customer Success Platform */}
          {currentView === 'v19-deployment-success' && <DeploymentCustomerSuccessPage />}

          {/* Vision 18: Mobile License Manager & OS Integration */}
          {currentView === 'v18-mobile-license-integration' && <MobileLicenseIntegrationPage />}

          {/* Vision 16: Market Readiness, Product Validation & Launch Hardening */}
          {currentView === 'v16-market-readiness' && <MarketReadinessLaunchPage />}

          {/* Pilot Release Center: Hardening, Installer & Certification */}
          {currentView === 'pilot-release-center' && <PilotReleaseCenterPage />}

          {/* Vision 15: Enterprise License Management & Activation Platform */}
          {currentView === 'v15-license-management' && <EnterpriseLicenseManagementPage />}

          {/* Vision 14: Enterprise Communication, Collaboration & Mail Merge Suite */}
          {currentView === 'v14-communication-suite' && <EnterpriseCommunicationSuitePage />}

          {/* Vision 13: Enterprise LAN & Multi-Computer Collaboration */}
          {currentView === 'v13-connect' && <SchoolSoulConnectPage />}

          {/* Vision 11: Student Innovation Hub & Marketplace */}
          {currentView === 'v11-student-innovation-hub' && <Vision11StudentInnovationHubPage />}

        {/* Vision 9: Student Voice, Innovation Hub, Marketplace, Alumni & Public Engagement */}
        {currentView === 'v9-hub' && <V9PublicEngagementHubPage onNavigate={setCurrentView} />}
        {currentView === 'v9-student-voice' && <StudentVoicePage />}
        {currentView === 'v9-student-portfolio' && <StudentPortfolioPage />}
        {currentView === 'v9-innovation-hub' && <InnovationHubPage />}
        {currentView === 'v9-school-clubs' && <SchoolClubsPage />}
        {currentView === 'v9-student-marketplace' && <StudentMarketplacePage onNavigate={setCurrentView} />}
        {currentView === 'v9-public-website' && <PublicWebsiteManagerPage />}
        {currentView === 'v9-news-media' && <NewsMediaCentrePage />}
        {currentView === 'v9-school-gallery' && <SchoolGalleryPage />}
        {currentView === 'v9-alumni-network' && <AlumniNetworkPage />}
        {currentView === 'v9-partnerships' && <PartnershipsPage />}
        {currentView === 'v9-community-engagement' && <CommunityEngagementPage />}
        {currentView === 'v9-donations-fundraising' && <DonationsFundraisingPage />}
        {currentView === 'v9-brand-management' && <BrandManagementPage />}
        {currentView === 'v9-recognition-awards' && <RecognitionAwardsPage />}
        {currentView === 'v9-public-analytics' && <PublicAnalyticsPage />}

        {/* Vision 8: School Intelligence, Growth Cockpit, AI Assistant & Advanced Analytics */}
        {currentView === 'v8-intelligence-hub' && <SchoolIntelligenceHubPage onNavigate={setCurrentView} />}
        {currentView === 'executive-cockpit' && <ExecutiveGrowthCockpitPage onNavigate={setCurrentView} />}
        {currentView === 'ai-assistant' && <AiAssistantPage />}
        {currentView === 'student-intelligence' && <StudentSuccessIntelligencePage />}
        {currentView === 'teacher-intelligence' && <TeacherIntelligencePage />}
        {currentView === 'financial-intelligence' && <FinancialIntelligencePage />}
        {currentView === 'performance-analytics' && <SchoolPerformanceAnalyticsPage />}
        {currentView === 'improvement-tracker' && <SchoolImprovementTrackerPage />}
        {currentView === 'board-reporting' && <BoardReportingCentrePage />}
        {currentView === 'knowledge-centre' && <KnowledgeCentrePage />}
        {currentView === 'user-guide' && <UserGuidePage />}
        {currentView === 'ai-governance' && <AiGovernancePage />}

        {/* Vision 7: Safeguarding, Student Welfare, HR & School Administration */}
        {currentView === 'safeguarding-centre' && <SafeguardingCentrePage />}
        {currentView === 'student-welfare' && <StudentWelfarePage />}
        {currentView === 'behaviour-discipline' && <BehaviourDisciplinePage />}
        {currentView === 'counselling-services' && <CounsellingServicesPage />}
        {currentView === 'school-health-centre' && <SchoolHealthCentrePage />}
        {currentView === 'incident-management' && <IncidentManagementPage />}
        {currentView === 'staff-hr' && <StaffHrManagementPage />}
        {currentView === 'staff-leave' && <StaffLeaveManagementPage />}
        {currentView === 'staff-appraisals' && <StaffPerformanceAppraisalPage />}
        {currentView === 'staff-cpd' && <StaffCpdPage />}
        {currentView === 'asset-management' && <AssetManagementPage />}
        {currentView === 'inventory-management' && <InventoryManagementPage />}
        {currentView === 'policy-centre' && <PolicyDocumentCentrePage />}
        {currentView === 'school-administration' && <SchoolAdministrationPage />}
        {currentView === 'compliance-audit' && <ComplianceAuditPage />}
        {currentView === 'administration-dashboards' && <AdministrationDashboardsPage onNavigate={setCurrentView} />}

        {/* Vision 6: Parent Communication & Engagement */}
        {currentView === 'parent-portal' && <ParentPortalPage />}
        {currentView === 'direct-messaging' && <DirectMessagingPage />}
        {currentView === 'sms-engine' && <SmsEnginePage />}
        {currentView === 'whatsapp-integration' && <WhatsAppIntegrationPage />}
        {currentView === 'announcements' && <AnnouncementsPage />}
        {currentView === 'school-news' && <SchoolNewsPage />}
        {currentView === 'events-management' && <EventsManagementPage />}
        {currentView === 'ptm-meetings' && <ParentTeacherMeetingsPage />}
        {currentView === 'consent-forms' && <DigitalConsentFormsPage />}
        {currentView === 'feedback-surveys' && <FeedbackSurveysPage />}
        {currentView === 'help-centre' && <SchoolHelpCentrePage />}
        {currentView === 'digital-community' && <DigitalCommunityPage currentUser={user || undefined} />}
        {currentView === 'community-groups' && <CommunityGroupsPage />}
        {currentView === 'emergency-alerts' && <EmergencyAlertPage />}
        {currentView === 'communication-dashboards' && <CommunicationDashboardsPage />}
        {currentView === 'communication-analytics' && <CommunicationAnalyticsPage />}

        {/* Vision 5: Academics & Report Cards */}
        {currentView === 'academics-hub' && <AcademicsHubPage onNavigate={setCurrentView} />}
        {currentView === 'academic-structure' && <AcademicStructurePage />}
        {currentView === 'subject-management' && <SubjectManagementPage />}
        {currentView === 'timetable-engine' && <TimetableEnginePage />}
        {currentView === 'lesson-planner' && <LessonPlannerPage />}
        {currentView === 'homework-assignments' && <HomeworkAssignmentsPage />}
        {currentView === 'assessment-exams' && <AssessmentExamsPage />}
        {currentView === 'teacher-gradebook' && <TeacherGradebookPage />}
        {currentView === 'report-cards' && <ReportCardEnginePage />}
        {currentView === 'academic-analytics' && <AcademicAnalyticsPage />}
        {currentView === 'certificates-transcripts' && <CertificatesTranscriptsPage />}
        {currentView === 'finance-hub' && <FinanceOperationsHubPage onNavigate={setCurrentView} />}
        {currentView === 'fee-structures' && <FeeStructureManagementPage />}
        {currentView === 'student-fee-accounts' && <StudentFeeAccountsPage />}
        {currentView === 'payment-processing' && <PaymentProcessingPage />}
        {currentView === 'scholarships-discounts' && <ScholarshipsDiscountsPage />}
        {currentView === 'budget-management' && <BudgetManagementPage />}
        {currentView === 'income-expenditure' && <IncomeExpenditurePage />}
        {currentView === 'financial-reports' && <FinancialReportingPage />}
        {currentView === 'financial-dashboards' && <FinancialDashboardsPage onNavigate={setCurrentView} />}
        {currentView === 'payment-reminders' && <PaymentRemindersPage />}
        {currentView === 'daily-operations' && <DailyOperationsCentrePage onNavigate={setCurrentView} />}
        {currentView === 'student-attendance' && <StudentAttendancePage />}
        {currentView === 'staff-attendance-leave' && <StaffAttendanceAndLeavePage />}
        {currentView === 'daily-register' && <DailySchoolRegisterPage />}
        {currentView === 'visitor-management' && <VisitorManagementPage />}
        {currentView === 'attendance-analytics' && <AttendanceAnalyticsPage />}
        {currentView === 'academic-calendar' && <AcademicCalendarPage />}
        {currentView === 'admissions' && <AdmissionsPage onNavigateToStudent={handleSelectStudent} />}
        {currentView === 'students' && <StudentPassportListPage onSelectStudent={handleSelectStudent} />}
        {currentView === 'student-detail' && (
          selectedStudentId ? (
            <StudentPassportDetailPage
              studentId={selectedStudentId}
              onBack={() => setCurrentView('students')}
            />
          ) : (
            <StudentPassportListPage onSelectStudent={handleSelectStudent} />
          )
        )}
        {currentView === 'users' && <UserManagement />}
        {currentView === 'roles' && <RolesAndPermissions />}
        {currentView === 'audit' && <AuditLogs />}
        {currentView === 'settings' && <SchoolSettings />}
        {currentView === 'backup' && <BackupRestore />}
        {currentView === 'health' && <SystemHealth />}
        {currentView === 'profile' && <ProfileSettings />}
        {(currentView === 'admin-feedback' || currentView === 'feedback-centre') && <AdminFeedbackCentrePage />}

        {/* Unmapped View Safety Fallback */}
        {!KNOWN_VIEWS.has(currentView) && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Dashboard Module: "{currentView}"</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This module route target is registered in navigation and mapped to the central operations hub.
            </p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
            >
              Return to Master Dashboard
            </button>
          </div>
        )}
            </>
          )}
        </ErrorBoundary>
      </AppLayout>

      {/* Inactivity Security Lock Screen Overlay */}
      <InactivityLockModal />

      {/* Developer Navigation Inspector & Route Debug Overlay */}
      <NavigationDebugOverlay
        currentView={currentView}
        onNavigate={setCurrentView}
        knownViews={KNOWN_VIEWS}
      />
    </NavigationProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <AppContent />
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
