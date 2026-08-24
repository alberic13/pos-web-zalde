import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'KASIR' | 'GUDANG' | 'ADMIN';

export interface RoleConfig {
  role: UserRole;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  avatarBg: string;
  defaultName: string;
  allowedRoutes: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  ADMIN: {
    role: 'ADMIN',
    label: 'Admin Toko (Akses Penuh)',
    shortLabel: 'Admin Toko',
    badgeBg: 'bg-purple-500/10 hover:bg-purple-500/20',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/30',
    avatarBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    defaultName: 'Admin Zalde',
    allowedRoutes: ['*'], // Admin has access to ALL features
  },
  KASIR: {
    role: 'KASIR',
    label: 'Penjaga Toko Depan (Kasir)',
    shortLabel: 'Kasir / Toko Depan',
    badgeBg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    defaultName: 'Kasir Toko Depan',
    allowedRoutes: ['/pos', '/products', '/orders'],
  },
  GUDANG: {
    role: 'GUDANG',
    label: 'Staff Gudang',
    shortLabel: 'Staff Gudang',
    badgeBg: 'bg-amber-500/10 hover:bg-amber-500/20',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    avatarBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    defaultName: 'Staff Gudang',
    allowedRoutes: ['/inventory', '/categories', '/products'],
  },
};

interface RoleContextType {
  isAuthenticated: boolean;
  activeRole: UserRole;
  activeName: string;
  token: string | null;
  roleConfig: RoleConfig;
  setActiveRole: (role: UserRole) => void;
  setActiveName: (name: string) => void;
  loginSuccess: (role: UserRole, name?: string, token?: string) => void;
  logout: () => void;
  hasAccessToRoute: (path: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pos_zalde_authenticated';
const ROLE_STORAGE_KEY = 'pos_zalde_active_role';
const NAME_STORAGE_KEY = 'pos_zalde_active_name';
const TOKEN_STORAGE_KEY = 'pos_zalde_auth_token';

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved && (saved === 'KASIR' || saved === 'GUDANG' || saved === 'ADMIN')) {
      return saved as UserRole;
    }
    return 'ADMIN';
  });

  const [activeName, setActiveNameState] = useState<string>(() => {
    const saved = localStorage.getItem(NAME_STORAGE_KEY);
    return saved || ROLE_CONFIGS.ADMIN.defaultName;
  });

  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    const defaultNames = ['Kasir Toko Depan', 'Staff Gudang', 'Admin Zalde', 'Penjaga Toko'];
    if (defaultNames.includes(activeName)) {
      const newName = ROLE_CONFIGS[role].defaultName;
      setActiveNameState(newName);
      localStorage.setItem(NAME_STORAGE_KEY, newName);
    }
  };

  const setActiveName = (name: string) => {
    const trimmed = name.trim() || ROLE_CONFIGS[activeRole].defaultName;
    setActiveNameState(trimmed);
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
  };

  const loginSuccess = (role: UserRole, name?: string, authToken?: string) => {
    const chosenName = name || ROLE_CONFIGS[role].defaultName;
    const generatedToken = authToken || `token-${role.toLowerCase()}-${Date.now()}`;
    
    setIsAuthenticated(true);
    setActiveRoleState(role);
    setActiveNameState(chosenName);
    setTokenState(generatedToken);

    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.setItem(NAME_STORAGE_KEY, chosenName);
    localStorage.setItem(TOKEN_STORAGE_KEY, generatedToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setTokenState(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const hasAccessToRoute = (path: string): boolean => {
    if (activeRole === 'ADMIN') return true; // Admin has 100% full access to all features
    const config = ROLE_CONFIGS[activeRole];
    if (!config) return false;
    if (config.allowedRoutes.includes('*')) return true;
    return config.allowedRoutes.includes(path);
  };

  return (
    <RoleContext.Provider
      value={{
        isAuthenticated,
        activeRole,
        activeName,
        token,
        roleConfig: ROLE_CONFIGS[activeRole],
        setActiveRole,
        setActiveName,
        loginSuccess,
        logout,
        hasAccessToRoute,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
