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
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  KASIR: {
    role: 'KASIR',
    label: 'Penjaga Toko Depan (Kasir)',
    shortLabel: 'Kasir / Toko Depan',
    badgeBg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    defaultName: 'Kasir Toko Depan',
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
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Admin Toko',
    shortLabel: 'Admin Toko',
    badgeBg: 'bg-purple-500/10 hover:bg-purple-500/20',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/30',
    avatarBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    defaultName: 'Admin Zalde',
  },
};

interface RoleContextType {
  activeRole: UserRole;
  activeName: string;
  roleConfig: RoleConfig;
  setActiveRole: (role: UserRole) => void;
  setActiveName: (name: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'pos_zalde_active_role';
const NAME_STORAGE_KEY = 'pos_zalde_active_name';

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved && (saved === 'KASIR' || saved === 'GUDANG' || saved === 'ADMIN')) {
      return saved as UserRole;
    }
    return 'KASIR';
  });

  const [activeName, setActiveNameState] = useState<string>(() => {
    const saved = localStorage.getItem(NAME_STORAGE_KEY);
    return saved || ROLE_CONFIGS.KASIR.defaultName;
  });

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    // If name is default, update default name to match new role
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

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        activeName,
        roleConfig: ROLE_CONFIGS[activeRole],
        setActiveRole,
        setActiveName,
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
