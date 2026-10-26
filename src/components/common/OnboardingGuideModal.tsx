import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  X,
  BookOpen,
  CreditCard,
  School,
  ShieldCheck,
  GraduationCap,
  Users,
  Compass,
  Check,
  Calendar,
  Image,
  Layers,
  Database,
  MessageSquare,
  Clock,
  Building,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';

export interface SetupChecklistItem {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  targetView: string;
  category: 'Foundation' | 'Academics' | 'Operations' | 'Finance';
}

export const SCHOOL_SETUP_11_STEPS: SetupChecklistItem[] = [
  {
    id: 'setup-profile',
    stepNumber: 1,
    title: 'School Profile & Contact Details',
    description: 'Verify school legal name, registration number, country identity, address, and phone.',
    targetView: 'settings',
    category: 'Foundation',
  },
  {
    id: 'setup-branding',
    stepNumber: 2,
    title: 'Logo & Institutional Branding',
    description: 'Upload institutional crest and letterhead badge for official receipts and transcripts.',
    targetView: 'settings',
    category: 'Foundation',
  },
  {
    id: 'setup-structure',
    stepNumber: 3,
    title: 'Educational Structure & Curriculum Terms',
    description: 'Configure active curriculum framework (CBC / UNEB / KNEC) and term dates.',
    targetView: 'settings',
    category: 'Academics',
  },
  {
    id: 'setup-classes',
    stepNumber: 4,
    title: 'Classes, Streams & Grade Levels',
    description: 'Set up class streams (e.g. Primary 1 - 7, S1 - S6, Grade 1 - 9) and classroom capacities.',
    targetView: 'classes',
    category: 'Academics',
  },
  {
    id: 'setup-staff',
    stepNumber: 5,
    title: 'Staff Directory & HR Role Permissions',
    description: 'Approve teacher profiles, assign subject heads, bursars, and departmental leaders.',
    targetView: 'users',
    category: 'Operations',
  },
  {
    id: 'setup-students',
    stepNumber: 6,
    title: 'Student Enrollment & Guardian Registers',
    description: 'Import or enroll learners with student IDs, guardian phone numbers, and medical notes.',
    targetView: 'students',
    category: 'Operations',
  },
  {
    id: 'setup-fees',
    stepNumber: 7,
    title: 'Fee Structures & Payment Gateways',
    description: 'Define term fees, boarding, uniform, and configure MTN/Airtel/Pesapal channels.',
    targetView: 'fee-structures',
    category: 'Finance',
  },
  {
    id: 'setup-attendance',
    stepNumber: 8,
    title: 'Attendance Schedules & Session Times',
    description: 'Configure morning/afternoon attendance periods and student QR scanning thresholds.',
    targetView: 'student-attendance',
    category: 'Operations',
  },
  {
    id: 'setup-communication',
    stepNumber: 9,
    title: 'Communication & SMS/Parent Channels',
    description: 'Test parent SMS broadcast templates, announcements, and direct messaging channels.',
    targetView: 'announcements',
    category: 'Operations',
  },
  {
    id: 'setup-backup',
    stepNumber: 10,
    title: 'Local Backup & Offline Resilience Test',
    description: 'Verify 30-day offline cache, test local JSON/CSV archive export, and verify LAN sync.',
    targetView: 'backup-restore',
    category: 'Foundation',
  },
  {
    id: 'setup-timetable',
    stepNumber: 11,
    title: 'School Year Calendar & Weekly Timetable',
    description: 'Generate teacher class schedules, term event calendars, and holiday periods.',
    targetView: 'timetable-engine',
    category: 'Academics',
  },
];

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  targetView: string;
}

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
  userName?: string;
  onNavigate: (view: string) => void;
}

export const OnboardingGuideModal: React.FC<OnboardingGuideModalProps> = ({
  isOpen,
  onClose,
  role,
  userName = 'Colleague',
  onNavigate,
}) => {
  const isLeadership = ['Headteacher', 'Super Administrator', 'Administrator', 'Deputy Headteacher'].includes(role);
  const [activeTab, setActiveTab] = useState<'checklist' | 'role'>(isLeadership ? 'checklist' : 'role');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('schoolsoul_setup_checklist_progress');
      if (stored) {
        setCompletedSteps(JSON.parse(stored));
      } else {
        // Default initial items marked
        const defaults: Record<string, boolean> = {
          'setup-profile': true,
          'setup-structure': true,
        };
        setCompletedSteps(defaults);
      }
    } catch {
      // Safe fallback
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleStep = (stepId: string) => {
    const next = { ...completedSteps, [stepId]: !completedSteps[stepId] };
    setCompletedSteps(next);
    try {
      localStorage.setItem('schoolsoul_setup_checklist_progress', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const completedCount = SCHOOL_SETUP_11_STEPS.filter((s) => completedSteps[s.id]).length;
  const progressPercentage = Math.round((completedCount / SCHOOL_SETUP_11_STEPS.length) * 100);

  // Role-specific tailored checklists
  const getRoleChecklist = (r: string): { subtitle: string; icon: React.ReactNode; items: OnboardingItem[] } => {
    switch (r) {
      case 'Headteacher':
      case 'Super Administrator':
      case 'Administrator':
      case 'Deputy Headteacher':
        return {
          subtitle: 'Institutional Leadership & Governance Checklist',
          icon: <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          items: [
            {
              id: 'ht-1',
              title: 'Review School Profile & Academic Year',
              description: 'Verify term dates, grading standards, and institutional contacts.',
              targetView: 'settings',
            },
            {
              id: 'ht-2',
              title: 'Commission Staff & User Roles',
              description: 'Inspect pending staff join requests and set permission levels.',
              targetView: 'users',
            },
            {
              id: 'ht-3',
              title: 'Inspect Central Operations Dashboard',
              description: 'Monitor daily attendance trends, enrollment metrics, and school health.',
              targetView: 'dashboard',
            },
            {
              id: 'ht-4',
              title: 'Review Safeguarding & Welfare Incident Log',
              description: 'Ensure student protection and confidentiality protocols are active.',
              targetView: 'safeguarding-centre',
            },
          ],
        };

      case 'Bursar':
      case 'Finance Officer':
        return {
          subtitle: 'Financial Operations & Fee Accounting Checklist',
          icon: <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          items: [
            {
              id: 'bur-1',
              title: 'Configure Term Fee Structures',
              description: 'Set tuition, boarding, uniform, and exam fees by grade level.',
              targetView: 'fee-structures',
            },
            {
              id: 'bur-2',
              title: 'Manage Student Fee Accounts',
              description: 'Inspect individual student balances, statements, and payment records.',
              targetView: 'student-fee-accounts',
            },
            {
              id: 'bur-3',
              title: 'Verify Payment Processing & Gateways',
              description: 'Ensure MTN Mobile Money, Airtel Money, and Pesapal are connected.',
              targetView: 'payment-processing',
            },
            {
              id: 'bur-4',
              title: 'Track Institutional Budgets & Vouchers',
              description: 'Manage departmental expense requisitions and financial reports.',
              targetView: 'budget-management',
            },
          ],
        };

      case 'Teacher':
      case 'Class Teacher':
      case 'Director of Studies':
        return {
          subtitle: 'Teaching, Grading & Classroom Operations Checklist',
          icon: <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          items: [
            {
              id: 'tch-1',
              title: 'Open Teacher Gradebook',
              description: 'Enter continuous assessment (CBC) marks and examination scores.',
              targetView: 'teacher-gradebook',
            },
            {
              id: 'tch-2',
              title: 'Take Daily Student Attendance',
              description: 'Mark morning, afternoon, or lesson presence in real-time.',
              targetView: 'student-attendance',
            },
            {
              id: 'tch-3',
              title: 'Check Timetable & Schedule',
              description: 'View weekly teaching assignments, stream rooms, and free periods.',
              targetView: 'timetable-engine',
            },
            {
              id: 'tch-4',
              title: 'Assign Digital Homework',
              description: 'Publish assignments, project briefs, and review student submissions.',
              targetView: 'homework-assignments',
            },
          ],
        };

      case 'Parent':
        return {
          subtitle: 'Parent & Guardian Portal Checklist',
          icon: <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          items: [
            {
              id: 'par-1',
              title: 'View Child Academic Report Cards',
              description: 'Inspect term assessments, teacher comments, and performance summaries.',
              targetView: 'parent-portal',
            },
            {
              id: 'par-2',
              title: 'Check Attendance Records',
              description: 'Verify daily school attendance and arrival times.',
              targetView: 'parent-portal',
            },
            {
              id: 'par-3',
              title: 'Clear Term Fees Online',
              description: 'Pay fee balances securely with MTN/Airtel Mobile Money or Card.',
              targetView: 'parent-portal',
            },
            {
              id: 'par-4',
              title: 'Message Class Teachers',
              description: 'Send direct queries regarding your child\'s academic welfare.',
              targetView: 'direct-messaging',
            },
          ],
        };

      case 'Student':
        return {
          subtitle: 'Learner Skills & Academic Dashboard Checklist',
          icon: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          items: [
            {
              id: 'std-1',
              title: 'Explore Skills & Opportunity Passport',
              description: 'Track extracurricular achievements, certifications, and badges.',
              targetView: 'opportunity-hub',
            },
            {
              id: 'std-2',
              title: 'View Assigned Homework',
              description: 'Check active homework tasks, instructions, and due dates.',
              targetView: 'homework-assignments',
            },
            {
              id: 'std-3',
              title: 'Join Live Virtual Classes',
              description: 'Participate in WebRTC live learning streams and digital whiteboards.',
              targetView: 'live-learning',
            },
          ],
        };

      default:
        return {
          subtitle: 'Getting Started with SchoolSoul OS',
          icon: <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          items: [
            {
              id: 'def-1',
              title: 'Explore Central Operations Dashboard',
              description: 'Review system alerts, active modules, and daily metrics.',
              targetView: 'dashboard',
            },
            {
              id: 'def-2',
              title: 'Review Knowledge Centre & User Guide',
              description: 'Consult standard operational procedures and best practice guides.',
              targetView: 'user-guide',
            },
          ],
        };
    }
  };

  const checklistData = getRoleChecklist(role);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`School Onboarding & Setup Guide — ${userName}`}
      maxWidth="2xl"
      id="onboarding-guide-modal"
    >
      <div className="space-y-4 text-slate-900 dark:text-slate-100">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            School Setup Checklist (11 Steps)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('role')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'role'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {role} Quickstart
          </button>
        </div>

        {activeTab === 'checklist' ? (
          /* 11-Step Setup Checklist Tab */
          <div className="space-y-4">
            {/* Progress Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/40 border border-blue-200 dark:border-blue-900/60">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Institutional Deployment Progress
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {completedCount} of {SCHOOL_SETUP_11_STEPS.length} core setup milestones verified.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {SCHOOL_SETUP_11_STEPS.map((step) => {
                const isDone = !!completedSteps[step.id];
                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isDone
                        ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleStep(step.id)}
                        aria-label={`Toggle ${step.title}`}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-500'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            Step {step.stepNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {step.category}
                          </span>
                          {isDone && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                        <h5 className={`text-xs sm:text-sm font-bold mt-0.5 truncate ${isDone ? 'line-through text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                          {step.title}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate(step.targetView);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 shrink-0 transition cursor-pointer min-h-[36px]"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Role Quickstart Tab */
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shrink-0">
                {checklistData.icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-100">
                  {role} Workspace Guide
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  {checklistData.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Recommended actions to help you get the most out of your SchoolSoul workspace today:
            </p>

            <div className="space-y-2.5">
              {checklistData.items.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onClose();
                    onNavigate(item.targetView);
                  }}
                  className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
          >
            Dismiss
          </button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Got it, Continue Working
          </Button>
        </div>
      </div>
    </Modal>
  );
};
