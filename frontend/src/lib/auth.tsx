'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, StaffPrivilege, StaffAccount } from '../types/user';
import { authClient } from './auth-client';

interface AuthContextType extends AuthState {
  login: (
    email: string,
    phone?: string,
    role?: User['role'],
    tenantId?: string,
    name?: string,
    privileges?: StaffPrivilege[],
    designation?: string,
    avatarColor?: string,
    password?: string
  ) => Promise<void>;
  loginAsStaffMember: (staff: StaffAccount) => void;
  hasPrivilege: (privilege: StaffPrivilege) => boolean;
  registerCustomer: (customerData: {
    name: string;
    email: string;
    phone: string;
    tenantId: string;
    password?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  isBetterAuthActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBetterAuthActive, setIsBetterAuthActive] = useState<boolean>(true);

  // 1. Rehydrate session on mount from Better-Auth or fallback to localStorage
  useEffect(() => {
    let mounted = true;

    async function checkBetterAuthSession() {
      try {
        const sessionRes = await authClient.getSession();
        if (mounted && sessionRes?.data?.user) {
          const u = sessionRes.data.user as any;
          const restoredUser: User = {
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role || 'customer',
            phone: u.phone,
            tenantId: u.tenantId || 'kemis-lounge',
            designation: u.designation,
            avatarColor: u.avatarColor || '#291E29',
            privileges: u.privileges
              ? typeof u.privileges === 'string'
                ? JSON.parse(u.privileges)
                : u.privileges
              : u.role === 'tenant_admin'
              ? [
                  'ops_console',
                  'customer_directory',
                  'approve_documents',
                  'manage_services',
                  'manage_branches',
                  'view_analytics',
                  'social_studio',
                ]
              : ['ops_console'],
            memberTier: u.memberTier || (u.role === 'customer' ? 'VIP Diamond' : undefined),
            visitsCount: u.visitsCount || (u.role === 'customer' ? 1 : undefined),
          };
          setUser(restoredUser);
          localStorage.setItem('luna_mock_user', JSON.stringify(restoredUser));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[BetterAuth] Session check fallback:', err);
      }

      // Fallback to local storage if no Better-Auth server session yet
      if (mounted) {
        const savedUser = localStorage.getItem('luna_mock_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem('luna_mock_user');
          }
        }
        setIsLoading(false);
      }
    }

    checkBetterAuthSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (
    email: string,
    phone?: string,
    role: User['role'] = 'tenant_admin',
    tenantId: string = 'kemis-lounge',
    name?: string,
    privileges?: StaffPrivilege[],
    designation?: string,
    avatarColor?: string,
    password: string = 'password123'
  ) => {
    setIsLoading(true);

    const defaultPrivileges =
      privileges ||
      (role === 'tenant_admin'
        ? [
            'ops_console',
            'customer_directory',
            'approve_documents',
            'manage_services',
            'manage_branches',
            'view_analytics',
            'social_studio',
          ]
        : ['ops_console']);

    const resolvedName = name || email.split('@')[0];

    // Try Better-Auth sign-in / sign-up via API
    try {
      // First attempt sign-in
      const signInRes = await authClient.signIn.email({
        email,
        password,
      });

      if (signInRes?.error) {
        // If account doesn't exist yet, automatically register in Better Auth
        await authClient.signUp.email({
          email,
          password,
          name: resolvedName,
          // Custom fields recognized by Better-Auth schema
          role,
          phone,
          privileges: JSON.stringify(defaultPrivileges),
          designation,
          avatarColor,
          tenantId,
        } as any);
      }
    } catch (err) {
      console.warn('[BetterAuth] Live API signin fallback to client session:', err);
    }

    const authUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      email,
      phone,
      name: resolvedName,
      role,
      tenantId,
      designation:
        designation ||
        (role === 'tenant_admin'
          ? 'Business Owner'
          : role === 'staff'
          ? 'Staff Specialist'
          : undefined),
      avatarColor: avatarColor || (role === 'tenant_admin' ? '#291E29' : '#D97706'),
      privileges: defaultPrivileges,
      memberTier: role === 'customer' ? 'VIP Diamond' : undefined,
      visitsCount: role === 'customer' ? 1 : undefined,
    };

    setUser(authUser);
    localStorage.setItem('luna_mock_user', JSON.stringify(authUser));
    setIsLoading(false);
  };

  const loginAsStaffMember = async (staff: StaffAccount) => {
    const staffUser: User = {
      id: staff.id,
      email: staff.email,
      phone: staff.phone,
      name: staff.name,
      role: staff.role,
      tenantId: staff.tenantId,
      designation: staff.designation,
      avatarColor: staff.avatarColor || (staff.role === 'tenant_admin' ? '#291E29' : '#D97706'),
      privileges: staff.privileges,
    };

    try {
      await authClient.signIn.email({
        email: staff.email,
        password: 'password123',
      });
    } catch (e) {
      // Fallback
    }

    setUser(staffUser);
    localStorage.setItem('luna_mock_user', JSON.stringify(staffUser));
  };

  const hasPrivilege = (privilege: StaffPrivilege): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'tenant_admin') return true;
    if (user.role === 'staff') {
      return !!user.privileges?.includes(privilege);
    }
    return false;
  };

  const registerCustomer = async (customerData: {
    name: string;
    email: string;
    phone: string;
    tenantId: string;
    password?: string;
  }): Promise<User> => {
    setIsLoading(true);

    // Call Better Auth signUp API
    try {
      await authClient.signUp.email({
        email: customerData.email,
        password: customerData.password || 'password123',
        name: customerData.name,
        role: 'customer',
        phone: customerData.phone,
        tenantId: customerData.tenantId,
        memberTier: 'VIP Diamond',
        visitsCount: 1,
      } as any);
    } catch (err) {
      console.warn('[BetterAuth] Customer registration API fallback:', err);
    }

    const customerUser: User = {
      id: `cust_${Date.now().toString(36)}`,
      email: customerData.email,
      phone: customerData.phone,
      name: customerData.name,
      role: 'customer',
      tenantId: customerData.tenantId,
      memberTier: 'VIP Diamond',
      visitsCount: 1,
    };

    setUser(customerUser);
    localStorage.setItem('luna_mock_user', JSON.stringify(customerUser));

    // Also save in customer tenant storage
    try {
      const tenantCustomersKey = `luna_registered_customers_${customerData.tenantId}`;
      const existing = JSON.parse(localStorage.getItem(tenantCustomersKey) || '[]');
      existing.unshift(customerUser);
      localStorage.setItem(tenantCustomersKey, JSON.stringify(existing));
    } catch (e) {
      console.warn('Customer storage fallback:', e);
    }

    setIsLoading(false);
    return customerUser;
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.warn('[BetterAuth] SignOut fallback:', e);
    }
    setUser(null);
    localStorage.removeItem('luna_mock_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsStaffMember,
        hasPrivilege,
        registerCustomer,
        logout,
        isBetterAuthActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
