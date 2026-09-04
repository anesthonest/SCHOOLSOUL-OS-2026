import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { OfflineBanner } from '../common/OfflineBanner';
import { UniversalBreadcrumbHeader } from './UniversalBreadcrumbHeader';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';
import { useNavigation } from '../../context/NavigationContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activeView, onNavigate, onViewChange }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigation = useNavigation();
  const handleNavigate = (view: string) => {
    if (navigation?.navigateTo) {
      navigation.navigateTo(view);
    } else if (onNavigate) {
      onNavigate(view);
    } else if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <Navbar
          onToggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activeView={activeView}
          onNavigate={handleNavigate}
        />

        {/* Offline Status & Sync Alert Banner */}
        <OfflineBanner />

        {/* Page Content View */}
        <main id="app-main-content" className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {/* Universal Back Navigation & Breadcrumbs Header */}
          <UniversalBreadcrumbHeader />
          
          {children}
        </main>

        {/* Global Footer Attribution */}
        <footer id="schoolsoul-app-footer" className="py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs mt-auto">
          <p className="font-medium text-slate-600 dark:text-slate-300">© 2026 SchoolSoul OS. All Rights Reserved.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Developed under the VINEXSAH TECHNOLOGIES project.
          </p>
        </footer>
      </div>

      {/* Global Unsaved Changes Warning Modal */}
      <UnsavedChangesModal />
    </div>
  );
};
