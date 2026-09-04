import React, { useState } from 'react';
import { Lock, LogOut, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const InactivityLockModal: React.FC = () => {
  const { user, isLockedDueToInactivity, unlockSession, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLockedDueToInactivity || !user) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await unlockSession(password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Incorrect password.');
    } else {
      setPassword('');
    }
  };

  return (
    <div id="inactivity-lock-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Session Locked</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your session was locked after inactivity to protect school records.
        </p>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            {user.fullName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.role} • @{user.username}</p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/50 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="mt-4 space-y-3">
          <input
            id="lock-password-input"
            type="password"
            placeholder="Enter password to unlock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <button
            id="unlock-session-btn"
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Unlocking...' : 'Unlock Session'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            id="lock-logout-btn"
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out completely
          </button>
        </div>
      </div>
    </div>
  );
};
