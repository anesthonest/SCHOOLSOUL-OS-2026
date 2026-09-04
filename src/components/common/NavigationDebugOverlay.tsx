import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Shield, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Layers, Compass } from 'lucide-react';

interface NavigationDebugOverlayProps {
  currentView: string;
  onNavigate: (view: string) => void;
  knownViews: Set<string>;
}

export const NavigationDebugOverlay: React.FC<NavigationDebugOverlayProps> = ({
  currentView,
  onNavigate,
  knownViews,
}) => {
  const { activeRole, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isMatched = knownViews.has(currentView);

  // Map view IDs to human-readable component names
  const getComponentName = (view: string): string => {
    switch (view) {
      case 'dashboard': return 'Dashboard (<Dashboard />)';
      case 'v9-hub': return 'V9PublicEngagementHubPage (<V9PublicEngagementHubPage />)';
      case 'v9-student-voice': return 'StudentVoicePage (<StudentVoicePage />)';
      case 'v9-student-portfolio': return 'StudentPortfolioPage (<StudentPortfolioPage />)';
      case 'v9-innovation-hub': return 'InnovationHubPage (<InnovationHubPage />)';
      case 'v9-school-clubs': return 'SchoolClubsPage (<SchoolClubsPage />)';
      case 'v9-student-marketplace': return 'StudentMarketplacePage (<StudentMarketplacePage />)';
      case 'v9-public-website': return 'PublicWebsiteManagerPage (<PublicWebsiteManagerPage />)';
      case 'v9-news-media': return 'NewsMediaCentrePage (<NewsMediaCentrePage />)';
      case 'v9-school-gallery': return 'SchoolGalleryPage (<SchoolGalleryPage />)';
      case 'v9-alumni-network': return 'AlumniNetworkPage (<AlumniNetworkPage />)';
      case 'v9-partnerships': return 'PartnershipsPage (<PartnershipsPage />)';
      case 'v9-community-engagement': return 'CommunityEngagementPage (<CommunityEngagementPage />)';
      case 'v9-donations-fundraising': return 'DonationsFundraisingPage (<DonationsFundraisingPage />)';
      case 'v9-brand-management': return 'BrandManagementPage (<BrandManagementPage />)';
      case 'v9-recognition-awards': return 'RecognitionAwardsPage (<RecognitionAwardsPage />)';
      case 'v9-public-analytics': return 'PublicAnalyticsPage (<PublicAnalyticsPage />)';
      case 'v8-intelligence-hub': return 'SchoolIntelligenceHubPage (<SchoolIntelligenceHubPage />)';
      case 'executive-cockpit': return 'ExecutiveGrowthCockpitPage (<ExecutiveGrowthCockpitPage />)';
      case 'ai-assistant': return 'AiAssistantPage (<AiAssistantPage />)';
      case 'student-intelligence': return 'StudentSuccessIntelligencePage (<StudentSuccessIntelligencePage />)';
      case 'teacher-intelligence': return 'TeacherIntelligencePage (<TeacherIntelligencePage />)';
      case 'financial-intelligence': return 'FinancialIntelligencePage (<FinancialIntelligencePage />)';
      case 'performance-analytics': return 'SchoolPerformanceAnalyticsPage (<SchoolPerformanceAnalyticsPage />)';
      case 'improvement-tracker': return 'SchoolImprovementTrackerPage (<SchoolImprovementTrackerPage />)';
      case 'board-reporting': return 'BoardReportingCentrePage (<BoardReportingCentrePage />)';
      case 'knowledge-centre': return 'KnowledgeCentrePage (<KnowledgeCentrePage />)';
      case 'ai-governance': return 'AiGovernancePage (<AiGovernancePage />)';
      case 'safeguarding-centre': return 'SafeguardingCentrePage (<SafeguardingCentrePage />)';
      case 'student-welfare': return 'StudentWelfarePage (<StudentWelfarePage />)';
      case 'behaviour-discipline': return 'BehaviourDisciplinePage (<BehaviourDisciplinePage />)';
      case 'counselling-services': return 'CounsellingServicesPage (<CounsellingServicesPage />)';
      case 'school-health-centre': return 'SchoolHealthCentrePage (<SchoolHealthCentrePage />)';
      case 'incident-management': return 'IncidentManagementPage (<IncidentManagementPage />)';
      case 'staff-hr': return 'StaffHrManagementPage (<StaffHrManagementPage />)';
      case 'staff-leave': return 'StaffLeaveManagementPage (<StaffLeaveManagementPage />)';
      case 'staff-appraisals': return 'StaffPerformanceAppraisalPage (<StaffPerformanceAppraisalPage />)';
      case 'staff-cpd': return 'StaffCpdPage (<StaffCpdPage />)';
      case 'asset-management': return 'AssetManagementPage (<AssetManagementPage />)';
      case 'inventory-management': return 'InventoryManagementPage (<InventoryManagementPage />)';
      case 'policy-centre': return 'PolicyDocumentCentrePage (<PolicyDocumentCentrePage />)';
      case 'school-administration': return 'SchoolAdministrationPage (<SchoolAdministrationPage />)';
      case 'compliance-audit': return 'ComplianceAuditPage (<ComplianceAuditPage />)';
      case 'administration-dashboards': return 'AdministrationDashboardsPage (<AdministrationDashboardsPage />)';
      case 'parent-portal': return 'ParentPortalPage (<ParentPortalPage />)';
      case 'direct-messaging': return 'DirectMessagingPage (<DirectMessagingPage />)';
      case 'sms-engine': return 'SmsEnginePage (<SmsEnginePage />)';
      case 'whatsapp-integration': return 'WhatsAppIntegrationPage (<WhatsAppIntegrationPage />)';
      case 'announcements': return 'AnnouncementsPage (<AnnouncementsPage />)';
      case 'school-news': return 'SchoolNewsPage (<SchoolNewsPage />)';
      case 'events-management': return 'EventsManagementPage (<EventsManagementPage />)';
      case 'ptm-meetings': return 'ParentTeacherMeetingsPage (<ParentTeacherMeetingsPage />)';
      case 'consent-forms': return 'DigitalConsentFormsPage (<DigitalConsentFormsPage />)';
      case 'feedback-surveys': return 'FeedbackSurveysPage (<FeedbackSurveysPage />)';
      case 'help-centre': return 'SchoolHelpCentrePage (<SchoolHelpCentrePage />)';
      case 'community-groups': return 'CommunityGroupsPage (<CommunityGroupsPage />)';
      case 'emergency-alerts': return 'EmergencyAlertPage (<EmergencyAlertPage />)';
      case 'communication-dashboards': return 'CommunicationDashboardsPage (<CommunicationDashboardsPage />)';
      case 'communication-analytics': return 'CommunicationAnalyticsPage (<CommunicationAnalyticsPage />)';
      case 'academics-hub': return 'AcademicsHubPage (<AcademicsHubPage />)';
      case 'academic-structure': return 'AcademicStructurePage (<AcademicStructurePage />)';
      case 'subject-management': return 'SubjectManagementPage (<SubjectManagementPage />)';
      case 'timetable-engine': return 'TimetableEnginePage (<TimetableEnginePage />)';
      case 'lesson-planner': return 'LessonPlannerPage (<LessonPlannerPage />)';
      case 'homework-assignments': return 'HomeworkAssignmentsPage (<HomeworkAssignmentsPage />)';
      case 'assessment-exams': return 'AssessmentExamsPage (<AssessmentExamsPage />)';
      case 'teacher-gradebook': return 'TeacherGradebookPage (<TeacherGradebookPage />)';
      case 'report-cards': return 'ReportCardEnginePage (<ReportCardEnginePage />)';
      case 'academic-analytics': return 'AcademicAnalyticsPage (<AcademicAnalyticsPage />)';
      case 'certificates-transcripts': return 'CertificatesTranscriptsPage (<CertificatesTranscriptsPage />)';
      case 'finance-hub': return 'FinanceOperationsHubPage (<FinanceOperationsHubPage />)';
      case 'fee-structures': return 'FeeStructureManagementPage (<FeeStructureManagementPage />)';
      case 'student-fee-accounts': return 'StudentFeeAccountsPage (<StudentFeeAccountsPage />)';
      case 'payment-processing': return 'PaymentProcessingPage (<PaymentProcessingPage />)';
      case 'scholarships-discounts': return 'ScholarshipsDiscountsPage (<ScholarshipsDiscountsPage />)';
      case 'budget-management': return 'BudgetManagementPage (<BudgetManagementPage />)';
      case 'income-expenditure': return 'IncomeExpenditurePage (<IncomeExpenditurePage />)';
      case 'financial-reports': return 'FinancialReportingPage (<FinancialReportingPage />)';
      case 'financial-dashboards': return 'FinancialDashboardsPage (<FinancialDashboardsPage />)';
      case 'payment-reminders': return 'PaymentRemindersPage (<PaymentRemindersPage />)';
      case 'daily-operations': return 'DailyOperationsCentrePage (<DailyOperationsCentrePage />)';
      case 'student-attendance': return 'StudentAttendancePage (<StudentAttendancePage />)';
      case 'staff-attendance-leave': return 'StaffAttendanceAndLeavePage (<StaffAttendanceAndLeavePage />)';
      case 'daily-register': return 'DailySchoolRegisterPage (<DailySchoolRegisterPage />)';
      case 'visitor-management': return 'VisitorManagementPage (<VisitorManagementPage />)';
      case 'attendance-analytics': return 'AttendanceAnalyticsPage (<AttendanceAnalyticsPage />)';
      case 'academic-calendar': return 'AcademicCalendarPage (<AcademicCalendarPage />)';
      case 'admissions': return 'AdmissionsPage (<AdmissionsPage />)';
      case 'students': return 'StudentPassportListPage (<StudentPassportListPage />)';
      case 'student-detail': return 'StudentPassportDetailPage (<StudentPassportDetailPage />)';
      case 'users': return 'UserManagement (<UserManagement />)';
      case 'roles': return 'RolesAndPermissions (<RolesAndPermissions />)';
      case 'audit': return 'AuditLogs (<AuditLogs />)';
      case 'settings': return 'SchoolSettings (<SchoolSettings />)';
      case 'backup': return 'BackupRestore (<BackupRestore />)';
      case 'health': return 'SystemHealth (<SystemHealth />)';
      case 'profile': return 'ProfileSettings (<ProfileSettings />)';
      default: return `UNMAPPED (<FallbackView string="${view}" />)`;
    }
  };

  const registeredList: string[] = Array.from(knownViews);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-2xl backdrop-blur-md transition-all text-xs font-mono font-semibold hover:scale-105 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Nav Debugger: <span className="text-emerald-400 font-bold">{currentView}</span></span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      ) : (
        <div className="w-[360px] sm:w-[440px] rounded-2xl bg-slate-950/95 border border-slate-800 text-slate-200 shadow-2xl backdrop-blur-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Router Navigation Inspector
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Active View Key</span>
              <span className="font-bold text-emerald-400 truncate block">{currentView}</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Active Role</span>
              <span className="font-bold text-sky-400 truncate block">{activeRole || user?.role || 'Guest'}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Route Status:</span>
              {isMatched ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> MATCHED & READY
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> UNMAPPED ROUTE
                </span>
              )}
            </div>

            <div className="pt-1 text-[10px] text-slate-300">
              <span className="text-slate-500 block">Rendered Component:</span>
              <span className="font-semibold text-blue-300 break-all">{getComponentName(currentView)}</span>
            </div>
          </div>

          {/* Quick Route Switcher */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Test Launch Registered Dashboard ({registeredList.length} total)
            </label>
            <select
              value={currentView}
              onChange={(e) => onNavigate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
            >
              {registeredList.map((viewId) => (
                <option key={viewId} value={viewId}>
                  {viewId} — {getComponentName(viewId).split(' ')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
