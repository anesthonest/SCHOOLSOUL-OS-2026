import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User, SchoolProfile, RoleDefinition, PermissionAction, ModuleName } from '../types';
import { db } from '../db/indexedDB';
import { fetchSchoolProfile, logAuditEvent, initializeLocalStoreDefaults, fetchAllRoles, isServerOnline, API_BASE } from '../services/api';
import bcrypt from 'bcryptjs';

interface AuthContextType {
  user: User | null;
  activeRole: string;
  setActiveRole: (role: string) => void;
  schoolProfile: SchoolProfile | null;
  roles: RoleDefinition[];
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  isLoading: boolean;
  loading: boolean;
  isLockedDueToInactivity: boolean;
  isLocked: boolean;
  lockSession: () => void;
  login: (usernameOrEmail: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  unlockSession: (password: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (module: ModuleName, action: PermissionAction) => boolean;
  refreshSchoolProfile: () => Promise<void>;
  refreshUsersAndRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<string>('');
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLockedDueToInactivity, setIsLockedDueToInactivity] = useState<boolean>(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSchoolProfile = useCallback(async () => {
    const data = await fetchSchoolProfile();
    setSchoolProfile(data.schoolProfile);
  }, []);

  const refreshUsersAndRoles = useCallback(async () => {
    const fetchedRoles = await fetchAllRoles();
    setRoles(fetchedRoles);
  }, []);

  // Initialize Session & Local DB
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await initializeLocalStoreDefaults();
      await refreshSchoolProfile();
      await refreshUsersAndRoles();

      // Check saved token / local session
      const savedUserStr = localStorage.getItem('schoolsoul_user') || sessionStorage.getItem('schoolsoul_user');
      if (savedUserStr) {
        try {
          const parsedUser: User = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setActiveRole(parsedUser.role);
        } catch {
          localStorage.removeItem('schoolsoul_user');
        }
      }
      setIsLoading(false);
    }
    init();
  }, [refreshSchoolProfile, refreshUsersAndRoles]);

  // Inactivity Lock Timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (user && !isLockedDueToInactivity) {
      // 15 Minutes Inactivity Timeout
      inactivityTimerRef.current = setTimeout(() => {
        setIsLockedDueToInactivity(true);
      }, 15 * 60 * 1000);
    }
  }, [user, isLockedDueToInactivity]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetInactivityTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  // Login handler
  const login = async (usernameOrEmail: string, password: string, rememberMe: boolean) => {
    try {
      const online = await isServerOnline();
      if (online) {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail, password, rememberMe }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || 'Login failed' };
        }

        const loggedUser: User = data.user;
        setUser(loggedUser);
        setActiveRole(loggedUser.role);
        setIsLockedDueToInactivity(false);

        if (rememberMe) {
          localStorage.setItem('schoolsoul_user', JSON.stringify(loggedUser));
          localStorage.setItem('schoolsoul_token', data.token);
        } else {
          sessionStorage.setItem('schoolsoul_user', JSON.stringify(loggedUser));
          sessionStorage.setItem('schoolsoul_token', data.token);
        }

        // Cache user in IndexedDB
        await db.users.put(loggedUser);
        return { success: true };
      } else {
        // Offline Local Login
        const localUsers = await db.users.toArray();
        const found = localUsers.find(
          (u) =>
            u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
            (u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase())
        );

        if (!found) {
          return { success: false, error: 'User not found in local database.' };
        }

        if (found.status === 'Suspended') {
          return { success: false, error: 'Account is suspended.' };
        }

        // For local offline admin default or password validation
        setUser(found);
        setActiveRole(found.role);
        setIsLockedDueToInactivity(false);

        if (rememberMe) {
          localStorage.setItem('schoolsoul_user', JSON.stringify(found));
        } else {
          sessionStorage.setItem('schoolsoul_user', JSON.stringify(found));
        }

        await logAuditEvent(found.id, found.username, found.role, 'LOGIN_SUCCESS', 'Offline session initiated');
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login attempt failed' };
    }
  };

  // Unlock session with password
  const unlockSession = async (password: string) => {
    if (!user) return { success: false, error: 'No active session' };
    try {
      if (await isServerOnline()) {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail: user.username, password }),
        });
        if (!res.ok) return { success: false, error: 'Invalid password' };
      }
      setIsLockedDueToInactivity(false);
      resetInactivityTimer();
      return { success: true };
    } catch {
      setIsLockedDueToInactivity(false);
      return { success: true };
    }
  };

  // Logout handler
  const logout = async () => {
    if (user) {
      await logAuditEvent(user.id, user.username, user.role, 'LOGOUT', 'User logged out');
    }
    setUser(null);
    setActiveRole('');
    setIsLockedDueToInactivity(false);
    localStorage.removeItem('schoolsoul_user');
    localStorage.removeItem('schoolsoul_token');
    sessionStorage.removeItem('schoolsoul_user');
    sessionStorage.removeItem('schoolsoul_token');
  };

  // RBAC Permission checking
  const hasPermission = (module: ModuleName, action: PermissionAction): boolean => {
    if (!user) return false;

    // Super & Executive roles check
    if (
      activeRole === 'Headteacher' ||
      activeRole === 'ICT Administrator' ||
      activeRole === 'Super Administrator' ||
      activeRole === 'Administrator' ||
      activeRole === 'Deputy Headteacher'
    ) {
      return true;
    }

    const currentRoleDef = roles.find((r) => r.name === activeRole);
    if (!currentRoleDef) return true; // Fallback permit if undefined role

    const modulePerm = currentRoleDef.permissions.find((p) => p.module === module);
    if (!modulePerm) {
      // Default allow View action for general operational modules across staff/parent/student roles
      if (
        action === 'View' &&
        module !== 'Audit System' &&
        module !== 'Backup & Restore' &&
        module !== 'Roles & Permissions' &&
        module !== 'School Settings'
      ) {
        return true;
      }
      return false;
    }

    return modulePerm.actions.includes(action);
  };

  const lockSession = useCallback(() => {
    setIsLockedDueToInactivity(true);
  }, []);

  const isSetupComplete = Boolean(schoolProfile && schoolProfile.isConfigured);

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        setActiveRole,
        schoolProfile,
        roles,
        isAuthenticated: Boolean(user),
        isSetupComplete,
        isLoading,
        loading: isLoading,
        isLockedDueToInactivity,
        isLocked: isLockedDueToInactivity,
        lockSession,
        login,
        logout,
        unlockSession,
        hasPermission,
        refreshSchoolProfile,
        refreshUsersAndRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
