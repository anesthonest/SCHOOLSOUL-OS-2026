import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Command,
  ArrowRight,
  Shield,
  User,
  Settings,
  Database,
  Radio,
  Lightbulb,
  FileText,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  Sun,
  Moon,
  Wifi,
  CheckCircle2,
  BookOpen,
  Activity,
  Award,
  Lock,
  MessageSquare,
  Key,
  ShieldCheck,
  Smartphone,
  Rocket,
  Building2,
  CreditCard,
  GraduationCap,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Modules' | 'Actions' | 'Records' | 'Intelligence' | 'Settings';
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  const { navigateTo } = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const { triggerSyncNow } = useSync();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const commandList: CommandItem[] = useMemo(() => [
    // Modules
    {
      id: 'cmd-dashboard',
      title: 'Main Executive Dashboard',
      description: 'Overview of school operations, stats, and real-time activity',
      category: 'Modules',
      icon: Activity,
      action: () => navigateTo('dashboard'),
    },
    {
      id: 'cmd-user-guide',
      title: 'SchoolSoul OS 2026.1.0 Official User Guide (PDF)',
      description: 'Official operations and guideline manual for all 7 roles. Learn how to navigate workflows, School Market, payments, and security.',
      category: 'Modules',
      icon: BookOpen,
      shortcut: 'GUIDE',
      action: () => navigateTo('user-guide'),
    },
    {
      id: 'cmd-v26-final-system-integrity',
      title: 'Master System Integrity & Security Hardening Console (V26)',
      description: '68-point production audit, defense-in-depth security, RBAC enforcement, single-school tenant isolation, offline queue durability & financial idempotency',
      category: 'Modules',
      icon: Key,
      shortcut: 'V26',
      action: () => navigateTo('v26-final-system-integrity'),
    },
    {
      id: 'cmd-v25-learnguard',
      title: 'SchoolSoul LearnGuard — Controlled Student Phone & Digital Learning System',
      description: 'Transforms student phones into controlled learning tools. Teacher-controlled activities, fieldwork camera evidence, approved resources & digital portfolios',
      category: 'Modules',
      icon: Smartphone,
      shortcut: 'V25',
      action: () => navigateTo('v25-learnguard'),
    },
    {
      id: 'cmd-v24-final-pre-deployment-pilot',
      title: 'SchoolSoul OS Master Pre-Deployment Certification & Pilot Center',
      description: '46-point checklist verification, SurePay server-side payment audit, 20k-student database stress test & pilot staff tasks',
      category: 'Modules',
      icon: ShieldCheck,
      shortcut: 'V24',
      action: () => navigateTo('v24-final-pre-deployment-pilot'),
    },
    {
      id: 'cmd-v23-unified-education-os',
      title: 'SchoolSoul Vision 23 – Unified Education OS & Student-Based Subscription',
      description: 'Primary, Secondary, University & Vocational modes. One Plan — All Features. Configurable student population billing bands (100–10,000+ students)',
      category: 'Modules',
      icon: GraduationCap,
      shortcut: 'V23',
      action: () => navigateTo('v23-unified-education-os'),
    },
    {
      id: 'cmd-unified-subscription',
      title: 'SchoolSoul Unified Monthly Subscription System',
      description: 'One Plan — All Features: Monthly billing, RSA-4096 offline license package import, days remaining & VINEXSAH License Manager desk',
      category: 'Modules',
      icon: CreditCard,
      shortcut: 'SUB',
      action: () => navigateTo('unified-subscription'),
    },
    {
      id: 'cmd-v21-final-production-release',
      title: 'Vision 21 – Final Production Hardening & Enterprise Release Certification',
      description: 'Zero-gap architecture review, cryptographic security audit, chaos stress testing & official production certificate',
      category: 'Modules',
      icon: Award,
      shortcut: 'V21',
      action: () => navigateTo('v21-final-production-release'),
    },
    {
      id: 'cmd-v20-vinexsah-control-center',
      title: 'Vision 20 – VINEXSAH Control Center (VCC) Enterprise Console',
      description: 'Centralized administration for VINEXSAH staff: Multi-school registry, deployment tracker, Mobile License Manager sync & business reports',
      category: 'Modules',
      icon: Building2,
      shortcut: 'V20',
      action: () => navigateTo('v20-vinexsah-control-center'),
    },
    {
      id: 'cmd-v19-deployment-success',
      title: 'Vision 19 – Deployment, Support & Customer Success Platform',
      description: 'Guided deployment wizard, school onboarding, CSV migration, offline support center & readiness certification',
      category: 'Modules',
      icon: Rocket,
      shortcut: 'V19',
      action: () => navigateTo('v19-deployment-success'),
    },
    {
      id: 'cmd-v18-mobile-license',
      title: 'Vision 18 – Mobile License Manager & OS Integration Hub',
      description: 'Two-system offline licensing architecture, RSA-4096 signature verification, QR exchange & cloud readiness',
      category: 'Modules',
      icon: Smartphone,
      shortcut: 'V18',
      action: () => navigateTo('v18-mobile-license-integration'),
    },
    {
      id: 'cmd-v16-market-readiness',
      title: 'Vision 16 – Market Readiness & Enterprise Launch Center',
      description: 'Multi-role UX evaluation, PMF verification, 5k student scalability & pilot launch certificate',
      category: 'Modules',
      icon: ShieldCheck,
      shortcut: 'V16',
      action: () => navigateTo('v16-market-readiness'),
    },
    {
      id: 'cmd-pilot-release',
      title: 'Pilot Release Center & Windows Installer',
      description: 'Security hardening, Windows Server/Client installer wizard, LAN stress testing & certification report',
      category: 'Modules',
      icon: ShieldCheck,
      shortcut: 'PILOT',
      action: () => navigateTo('pilot-release-center'),
    },
    {
      id: 'cmd-v15-license',
      title: 'Enterprise License Management & Activation (ELMS)',
      description: 'Offline cryptographic keys, device binding, subscription renewal & feature control',
      category: 'Modules',
      icon: Key,
      shortcut: 'V15',
      action: () => navigateTo('v15-license-management'),
    },
    {
      id: 'cmd-v14-comms',
      title: 'Enterprise Communication & Mail Merge Suite',
      description: 'Internal messaging, EDMS docs, mail merge engine & official letters',
      category: 'Modules',
      icon: MessageSquare,
      shortcut: 'V14',
      action: () => navigateTo('v14-communication-suite'),
    },
    {
      id: 'cmd-v13-connect',
      title: 'SchoolSoul Connect (LAN Sync)',
      description: 'Multi-computer offline collaboration & local peer sync',
      category: 'Modules',
      icon: Radio,
      shortcut: 'V13',
      action: () => navigateTo('v13-connect'),
    },
    {
      id: 'cmd-v11-innovation',
      title: 'Student Innovation Hub & Marketplace',
      description: 'Student project incubators, STEM ideas & commerce',
      category: 'Modules',
      icon: Lightbulb,
      shortcut: 'V11',
      action: () => navigateTo('v11-student-innovation-hub'),
    },
    {
      id: 'cmd-admissions',
      title: 'Admissions & Student Registration',
      description: 'Process incoming student enrollment applications',
      category: 'Modules',
      icon: Users,
      action: () => navigateTo('admissions'),
    },
    {
      id: 'cmd-students',
      title: 'Student Passport Directory',
      description: 'Browse, manage, and view complete digital student profiles',
      category: 'Records',
      icon: User,
      action: () => navigateTo('students'),
    },
    {
      id: 'cmd-academics',
      title: 'Academics & Gradebook Hub',
      description: 'Manage timetables, report cards, and subject grading',
      category: 'Modules',
      icon: BookOpen,
      action: () => navigateTo('academics-hub'),
    },
    {
      id: 'cmd-finance',
      title: 'Finance & Fee Collection Hub',
      description: 'Process payments, fee structures, and financial ledgers',
      category: 'Modules',
      icon: DollarSign,
      action: () => navigateTo('finance-hub'),
    },
    {
      id: 'cmd-intelligence',
      title: 'V8 Intelligence & Growth Cockpit',
      description: 'Predictive analytics, board reports & AI insights',
      category: 'Intelligence',
      icon: Sparkles,
      action: () => navigateTo('v8-intelligence-hub'),
    },
    {
      id: 'cmd-backup',
      title: 'Enterprise Backup & Recovery Center',
      description: 'Manage automated backups, point-in-time restore & recycle bin',
      category: 'Settings',
      icon: Database,
      action: () => navigateTo('backup'),
    },

    // Actions & Utilities
    {
      id: 'cmd-toggle-theme',
      title: `Switch Theme to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`,
      description: 'Toggle visual appearance of the platform interface',
      category: 'Actions',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: 'Ctrl+Shift+T',
      action: () => toggleTheme(),
    },
    {
      id: 'cmd-trigger-sync',
      title: 'Trigger Instant Database Sync',
      description: 'Force immediate background synchronization with Cloud/LAN server',
      category: 'Actions',
      icon: Wifi,
      shortcut: 'Sync',
      action: () => triggerSyncNow(),
    },
    {
      id: 'cmd-school-settings',
      title: 'School Profile & System Settings',
      description: 'Update school details, logo, academic term, and policies',
      category: 'Settings',
      icon: Settings,
      action: () => navigateTo('settings'),
    },
    {
      id: 'cmd-user-roles',
      title: 'User Roles & Access Control (RBAC)',
      description: 'Configure staff permissions and security governance',
      category: 'Settings',
      icon: Shield,
      action: () => navigateTo('roles'),
    },
  ], [navigateTo, theme, toggleTheme, triggerSyncNow]);

  const filteredCommands = useMemo(() => {
    return commandList.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [commandList, activeCategory, query]);

  // Handle keyboard navigation within list
  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 text-xs transition-colors"
        title="Open Command Palette (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Quick Command...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-bold text-slate-600 dark:text-slate-300">
          Ctrl K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div
        id="command-palette-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Global Command Palette"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search modules, records, quick settings, or run commands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="px-2 py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-200/50 dark:bg-slate-800 rounded-md shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Category Filters Pill */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-100/40 dark:bg-slate-950/40 overflow-x-auto no-scrollbar">
          {['All', 'Modules', 'Actions', 'Records', 'Intelligence', 'Settings'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No matching modules or commands found for &quot;<span className="font-bold text-slate-700 dark:text-slate-200">{query}</span>&quot;.
            </div>
          ) : (
            filteredCommands.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-100 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-blue-600 dark:text-blue-400 translate-x-1' : 'opacity-0'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="font-bold">↑↓</kbd> Navigate</span>
            <span><kbd className="font-bold">↵</kbd> Select</span>
            <span><kbd className="font-bold">ESC</kbd> Close</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
            <Command className="w-3 h-3" />
            <span>SchoolSoul OS Smart Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};
