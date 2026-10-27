import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Wallet,
  Menu,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UniversalQRScannerModal } from '../common/UniversalQRScannerModal';

interface MobileBottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenMenu,
}) => {
  const { activeRole } = useAuth();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <>
      <nav
        id="mobile-bottom-navigation"
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* 1. Home */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl text-center transition-colors cursor-pointer ${
              activeView === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeView === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">Home</span>
          </button>

          {/* 2. Operations / Portal */}
          <button
            onClick={() =>
              onNavigate(
                activeRole === 'Parent'
                  ? 'parent-portal'
                  : activeRole === 'Teacher'
                  ? 'teacher-gradebook'
                  : 'student-attendance'
              )
            }
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl text-center transition-colors cursor-pointer ${
              ['student-attendance', 'parent-portal', 'teacher-gradebook'].includes(activeView)
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
              {activeRole === 'Parent' ? 'Children' : activeRole === 'Teacher' ? 'Grades' : 'Attendance'}
            </span>
          </button>

          {/* 3. Centrally Accessible QR Scanner Action */}
          <button
            id="mobile-center-qr-scan-btn"
            onClick={() => setIsScannerOpen(true)}
            aria-label="Open Universal QR Scanner"
            className="flex-1 flex flex-col items-center justify-center relative -mt-5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-white dark:border-slate-900 group-hover:scale-105 transition-all">
              <QrCode className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1 tracking-tight">
              Scan QR
            </span>
          </button>

          {/* 4. Fees / Finance */}
          <button
            onClick={() =>
              onNavigate(activeRole === 'Parent' ? 'student-fee-accounts' : 'finance-hub')
            }
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl text-center transition-colors cursor-pointer ${
              ['finance-hub', 'student-fee-accounts', 'payment-processing', 'fee-structures'].includes(activeView)
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Wallet className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">Fees</span>
          </button>

          {/* 5. Menu Drawer */}
          <button
            onClick={onOpenMenu}
            aria-label="Open All Modules Menu"
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
          </button>
        </div>
      </nav>

      {/* Universal Scanner Modal for Mobile */}
      {isScannerOpen && (
        <UniversalQRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onSelectStudent={(id) => onNavigate('students')}
        />
      )}
    </>
  );
};
