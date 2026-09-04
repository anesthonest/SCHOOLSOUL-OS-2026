import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface BreadcrumbItem {
  view: string;
  label: string;
  params?: Record<string, any>;
}

export interface NavigationEntry {
  view: string;
  label: string;
  params?: Record<string, any>;
  scrollY?: number;
  timestamp: number;
}

export interface UnsavedChangesConfig {
  message?: string;
  onSave?: () => Promise<boolean | void> | boolean | void;
}

interface NavigationContextType {
  currentView: string;
  historyStack: NavigationEntry[];
  canGoBack: boolean;
  breadcrumbs: BreadcrumbItem[];
  hasUnsavedChanges: boolean;
  unsavedConfig: UnsavedChangesConfig | null;
  showUnsavedModal: boolean;
  navigateTo: (view: string, options?: { replace?: boolean; params?: Record<string, any> }) => void;
  goBack: () => void;
  setHasUnsavedChanges: (isDirty: boolean, config?: UnsavedChangesConfig) => void;
  confirmLeaveWithoutSaving: () => void;
  confirmSaveAndLeave: () => Promise<void>;
  cancelLeave: () => void;
  currentParams: Record<string, any>;
  getPreviousViewLabel: () => string;
}

// Master view metadata & hierarchy mapping for all 60+ views
const BREADCRUMB_HIERARCHY: Record<string, BreadcrumbItem[]> = {
  'dashboard': [{ view: 'dashboard', label: 'Dashboard' }],
  'v13-connect': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v13-connect', label: 'SchoolSoul Connect (LAN)' }],
  'v11-student-innovation-hub': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v11-student-innovation-hub', label: 'Student Innovation Hub' }],
  
  // Vision 9
  'v9-hub': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement Hub' }],
  'v9-student-voice': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-student-voice', label: 'Student Voice & Ideas' }],
  'v9-student-portfolio': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-student-portfolio', label: 'Student Portfolios' }],
  'v9-innovation-hub': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-innovation-hub', label: 'Innovation Projects' }],
  'v9-school-clubs': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-school-clubs', label: 'Clubs & Societies' }],
  'v9-student-marketplace': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-student-marketplace', label: 'Student Marketplace' }],
  'v9-public-website': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-public-website', label: 'Public Website Manager' }],
  'v9-news-media': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-news-media', label: 'News & Media' }],
  'v9-school-gallery': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-school-gallery', label: 'School Gallery' }],
  'v9-alumni-network': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-alumni-network', label: 'Alumni Network' }],
  'v9-partnerships': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-partnerships', label: 'Partnerships' }],
  'v9-community-engagement': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-community-engagement', label: 'Community Engagement' }],
  'v9-donations-fundraising': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-donations-fundraising', label: 'Donations & Fundraising' }],
  'v9-brand-management': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-brand-management', label: 'Brand Management' }],
  'v9-recognition-awards': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-recognition-awards', label: 'Recognition & Awards' }],
  'v9-public-analytics': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v9-hub', label: 'Public Engagement' }, { view: 'v9-public-analytics', label: 'Public Analytics' }],

  // Admissions & Students
  'admissions': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'admissions', label: 'Admissions Centre' }],
  'students': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'students', label: 'Student Passports' }],
  'student-detail': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'students', label: 'Student Passports' }, { view: 'student-detail', label: 'Passport Profile' }],

  // Operations
  'daily-operations': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'daily-operations', label: 'Daily Operations Centre' }],
  'student-attendance': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'daily-operations', label: 'Operations' }, { view: 'student-attendance', label: 'Student Attendance' }],
  'staff-attendance-leave': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'daily-operations', label: 'Operations' }, { view: 'staff-attendance-leave', label: 'Staff Attendance' }],
  'daily-register': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'daily-operations', label: 'Operations' }, { view: 'daily-register', label: 'Daily Register' }],
  'visitor-management': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'daily-operations', label: 'Operations' }, { view: 'visitor-management', label: 'Visitor Management' }],
  'attendance-analytics': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'daily-operations', label: 'Operations' }, { view: 'attendance-analytics', label: 'Attendance Analytics' }],
  'academic-calendar': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academic-calendar', label: 'Academic Calendar' }],

  // Academics
  'academics-hub': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics Hub' }],
  'academic-structure': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'academic-structure', label: 'Academic Structure' }],
  'subject-management': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'subject-management', label: 'Subjects' }],
  'timetable-engine': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'timetable-engine', label: 'Timetable Engine' }],
  'lesson-planner': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'lesson-planner', label: 'Lesson Planner' }],
  'homework-assignments': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'homework-assignments', label: 'Homework & Assignments' }],
  'assessment-exams': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'assessment-exams', label: 'Assessments & Exams' }],
  'teacher-gradebook': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'teacher-gradebook', label: 'Teacher Gradebook' }],
  'report-cards': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'report-cards', label: 'Report Cards' }],
  'academic-analytics': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'academic-analytics', label: 'Academic Analytics' }],
  'certificates-transcripts': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'academics-hub', label: 'Academics' }, { view: 'certificates-transcripts', label: 'Certificates & Transcripts' }],

  // Finance
  'finance-hub': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance Hub' }],
  'fee-structures': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'fee-structures', label: 'Fee Structures' }],
  'student-fee-accounts': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'student-fee-accounts', label: 'Student Fee Accounts' }],
  'payment-processing': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'payment-processing', label: 'Payment Processing' }],
  'scholarships-discounts': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'scholarships-discounts', label: 'Scholarships & Discounts' }],
  'budget-management': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'budget-management', label: 'Budget Management' }],
  'income-expenditure': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'income-expenditure', label: 'Income & Expenditure' }],
  'financial-reports': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'financial-reports', label: 'Financial Reports' }],
  'financial-dashboards': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'financial-dashboards', label: 'Financial Dashboards' }],
  'payment-reminders': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'finance-hub', label: 'Finance' }, { view: 'payment-reminders', label: 'Payment Reminders' }],

  // Communication
  'communication-dashboards': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication Hub' }],
  'parent-portal': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'parent-portal', label: 'Parent Portal' }],
  'direct-messaging': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'direct-messaging', label: 'Direct Messaging' }],
  'sms-engine': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'sms-engine', label: 'SMS Engine' }],
  'whatsapp-integration': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'whatsapp-integration', label: 'WhatsApp' }],
  'announcements': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'announcements', label: 'Announcements' }],
  'school-news': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'school-news', label: 'School News' }],
  'events-management': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'events-management', label: 'Events' }],
  'ptm-meetings': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'ptm-meetings', label: 'PTM Meetings' }],
  'consent-forms': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'consent-forms', label: 'Consent Forms' }],
  'feedback-surveys': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'feedback-surveys', label: 'Feedback & Surveys' }],
  'help-centre': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'help-centre', label: 'Help Centre' }],
  'community-groups': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'community-groups', label: 'Community Groups' }],
  'emergency-alerts': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'emergency-alerts', label: 'Emergency Alerts' }],
  'communication-analytics': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'communication-dashboards', label: 'Communication' }, { view: 'communication-analytics', label: 'Communication Analytics' }],

  // Admin & HR
  'administration-dashboards': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Administration Hub' }],
  'safeguarding-centre': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'safeguarding-centre', label: 'Safeguarding Centre' }],
  'student-welfare': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'student-welfare', label: 'Student Welfare' }],
  'behaviour-discipline': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'behaviour-discipline', label: 'Behaviour & Discipline' }],
  'counselling-services': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'counselling-services', label: 'Counselling Services' }],
  'school-health-centre': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'school-health-centre', label: 'Health Centre' }],
  'incident-management': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'incident-management', label: 'Incident Management' }],
  'staff-hr': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'staff-hr', label: 'Staff HR' }],
  'staff-leave': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'staff-leave', label: 'Staff Leave' }],
  'staff-appraisals': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'staff-appraisals', label: 'Staff Appraisals' }],
  'staff-cpd': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'staff-cpd', label: 'Staff CPD' }],
  'asset-management': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'asset-management', label: 'Asset Management' }],
  'inventory-management': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'inventory-management', label: 'Inventory' }],
  'policy-centre': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'policy-centre', label: 'Policy Documents' }],
  'school-administration': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'school-administration', label: 'School Admin' }],
  'compliance-audit': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'administration-dashboards', label: 'Admin' }, { view: 'compliance-audit', label: 'Compliance Audit' }],

  // Intelligence
  'v8-intelligence-hub': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence Hub' }],
  'executive-cockpit': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'executive-cockpit', label: 'Executive Growth Cockpit' }],
  'ai-assistant': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'ai-assistant', label: 'AI Assistant' }],
  'student-intelligence': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'student-intelligence', label: 'Student Intelligence' }],
  'teacher-intelligence': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'teacher-intelligence', label: 'Teacher Intelligence' }],
  'financial-intelligence': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'financial-intelligence', label: 'Financial Intelligence' }],
  'performance-analytics': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'performance-analytics', label: 'Performance Analytics' }],
  'improvement-tracker': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'improvement-tracker', label: 'Improvement Tracker' }],
  'board-reporting': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'board-reporting', label: 'Board Reporting' }],
  'knowledge-centre': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'knowledge-centre', label: 'Knowledge Centre' }],
  'ai-governance': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'v8-intelligence-hub', label: 'Intelligence' }, { view: 'ai-governance', label: 'AI Governance' }],

  // Settings & Core
  'users': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'users', label: 'User Management' }],
  'roles': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'roles', label: 'Roles & Permissions' }],
  'audit': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'audit', label: 'Audit Trail' }],
  'settings': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'settings', label: 'School Settings' }],
  'backup': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'backup', label: 'Enterprise Backup & Recovery' }],
  'health': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'health', label: 'System Health Diagnostics' }],
  'profile': [{ view: 'dashboard', label: 'Dashboard' }, { view: 'profile', label: 'My Account Profile' }],
};

const NavigationContext = createContext<NavigationContextType | null>(null);

interface NavigationProviderProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children, activeView, onNavigate }) => {
  const [historyStack, setHistoryStack] = useState<NavigationEntry[]>(() => [
    { view: 'dashboard', label: 'Dashboard', timestamp: Date.now() },
    ...(activeView !== 'dashboard' ? [{ view: activeView, label: BREADCRUMB_HIERARCHY[activeView]?.[BREADCRUMB_HIERARCHY[activeView].length - 1]?.label || activeView, timestamp: Date.now() }] : [])
  ]);

  const [currentParams, setCurrentParams] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChangesState] = useState<boolean>(false);
  const [unsavedConfig, setUnsavedConfig] = useState<UnsavedChangesConfig | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Sync state when activeView changes from external source
  useEffect(() => {
    setHistoryStack((prev) => {
      const top = prev[prev.length - 1];
      if (top?.view === activeView) return prev;
      
      const label = BREADCRUMB_HIERARCHY[activeView]?.[BREADCRUMB_HIERARCHY[activeView].length - 1]?.label || activeView;
      return [...prev, { view: activeView, label, timestamp: Date.now() }];
    });
  }, [activeView]);

  // Handle browser tab reload / leave warning if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = unsavedConfig?.message || 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, unsavedConfig]);

  const setHasUnsavedChanges = useCallback((isDirty: boolean, config?: UnsavedChangesConfig) => {
    setHasUnsavedChangesState(isDirty);
    if (isDirty && config) {
      setUnsavedConfig(config);
    } else if (!isDirty) {
      setUnsavedConfig(null);
    }
  }, []);

  const performNavigation = useCallback((targetView: string, params?: Record<string, any>) => {
    if (params) setCurrentParams(params);
    
    // Push or update history stack
    setHistoryStack((prev) => {
      // Avoid duplicate consecutive entries
      if (prev[prev.length - 1]?.view === targetView) return prev;
      const label = BREADCRUMB_HIERARCHY[targetView]?.[BREADCRUMB_HIERARCHY[targetView].length - 1]?.label || targetView;
      return [...prev, { view: targetView, label, params, timestamp: Date.now() }];
    });

    onNavigate(targetView);
  }, [onNavigate]);

  const navigateTo = useCallback((view: string, options?: { replace?: boolean; params?: Record<string, any> }) => {
    const action = () => performNavigation(view, options?.params);

    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowUnsavedModal(true);
      return;
    }

    action();
  }, [hasUnsavedChanges, performNavigation]);

  const goBack = useCallback(() => {
    const action = () => {
      if (historyStack.length > 1) {
        const updatedStack = [...historyStack];
        updatedStack.pop(); // remove current view
        const prevEntry = updatedStack[updatedStack.length - 1];
        setHistoryStack(updatedStack);
        if (prevEntry) {
          if (prevEntry.params) setCurrentParams(prevEntry.params);
          onNavigate(prevEntry.view);
          return;
        }
      }

      // Fallback: Check parent view in hierarchy or go to Dashboard
      const currentHierarchy = BREADCRUMB_HIERARCHY[activeView];
      if (currentHierarchy && currentHierarchy.length > 1) {
        const parent = currentHierarchy[currentHierarchy.length - 2];
        onNavigate(parent.view);
      } else {
        onNavigate('dashboard');
      }
    };

    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowUnsavedModal(true);
      return;
    }

    action();
  }, [activeView, hasUnsavedChanges, historyStack, onNavigate]);

  const confirmLeaveWithoutSaving = useCallback(() => {
    setHasUnsavedChangesState(false);
    setUnsavedConfig(null);
    setShowUnsavedModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const confirmSaveAndLeave = useCallback(async () => {
    if (unsavedConfig?.onSave) {
      try {
        const result = await unsavedConfig.onSave();
        if (result === false) {
          // Save failed or was cancelled by form validator
          return;
        }
      } catch (err) {
        console.error('Error auto-saving before navigation:', err);
        return;
      }
    }
    confirmLeaveWithoutSaving();
  }, [confirmLeaveWithoutSaving, unsavedConfig]);

  const cancelLeave = useCallback(() => {
    setShowUnsavedModal(false);
    setPendingAction(null);
  }, []);

  const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const defaultHierarchy = BREADCRUMB_HIERARCHY[activeView];
    if (defaultHierarchy) return defaultHierarchy;

    // Fallback if view not in hierarchy map
    return [
      { view: 'dashboard', label: 'Dashboard' },
      { view: activeView, label: activeView.replace('-', ' ') }
    ];
  }, [activeView]);

  const getPreviousViewLabel = useCallback((): string => {
    if (historyStack.length > 1) {
      return historyStack[historyStack.length - 2].label;
    }
    const breadcrumbs = BREADCRUMB_HIERARCHY[activeView];
    if (breadcrumbs && breadcrumbs.length > 1) {
      return breadcrumbs[breadcrumbs.length - 2].label;
    }
    return 'Dashboard';
  }, [activeView, historyStack]);

  const canGoBack = activeView !== 'dashboard';

  return (
    <NavigationContext.Provider
      value={{
        currentView: activeView,
        historyStack,
        canGoBack,
        breadcrumbs: getBreadcrumbs(),
        hasUnsavedChanges,
        unsavedConfig,
        showUnsavedModal,
        navigateTo,
        goBack,
        setHasUnsavedChanges,
        confirmLeaveWithoutSaving,
        confirmSaveAndLeave,
        cancelLeave,
        currentParams,
        getPreviousViewLabel,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
