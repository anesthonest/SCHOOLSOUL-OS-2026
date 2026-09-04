import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock, RefreshCw, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDefaultHomeRouteForRole, ROUTE_SECURITY_MATRIX } from '../../security/accessControl';

interface RouteAccessDeniedProps {
  attemptedView: string;
  onNavigate: (view: string) => void;
  customReason?: string;
}

export const RouteAccessDenied: React.FC<RouteAccessDeniedProps> = ({
  attemptedView,
  onNavigate,
  customReason,
}) => {
  const { user, activeRole, logout } = useAuth();
  const rule = ROUTE_SECURITY_MATRIX[attemptedView];
  const safeHome = getDefaultHomeRouteForRole(activeRole || user?.role || '');

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Restricted Access
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {rule ? rule.title : 'Restricted Section'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            {customReason ||
              `You do not have administrative permission to access this area with your current "${activeRole || user?.role}" role.`}
          </p>
        </div>

        {/* Active Account Details */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left text-xs space-y-1.5 max-w-md mx-auto">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Signed in as:</span>
            <span className="font-semibold text-white">{user?.fullName || 'User'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Active Role:</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
              {activeRole || user?.role}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Target Module:</span>
            <span className="font-mono text-slate-300">#{attemptedView}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate(safeHome)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Return to My {activeRole || 'Role'} Workspace
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Main Dashboard
          </button>
        </div>

        {/* Support Note */}
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          Need access? Contact your School Administrator to adjust your role permissions.
        </p>
      </div>
    </div>
  );
};
