import React, { useState } from 'react';
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
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';

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
  if (!isOpen) return null;

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
      title={`Welcome to SchoolSoul, ${userName}!`}
      maxWidth="lg"
      id="onboarding-guide-modal"
    >
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
          Here are key recommended actions to help you get the most out of your SchoolSoul workspace today:
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

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
          >
            Don't show again
          </button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Got it, Start Working
          </Button>
        </div>
      </div>
    </Modal>
  );
};
