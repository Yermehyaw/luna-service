'use client';

import React from 'react';
import { UserRole } from '../types/user';
import { useAuth } from './auth';

export type Permission = 
  | 'queue.view'
  | 'queue.manage'
  | 'customers.view'
  | 'customers.manage'
  | 'social.view'
  | 'social.create'
  | 'social.publish'
  | 'analytics.view'
  | 'settings.manage';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'queue.view', 'queue.manage',
    'customers.view', 'customers.manage',
    'social.view', 'social.create', 'social.publish',
    'analytics.view', 'settings.manage'
  ],
  tenant_admin: [
    'queue.view', 'queue.manage',
    'customers.view', 'customers.manage',
    'social.view', 'social.create', 'social.publish',
    'analytics.view', 'settings.manage'
  ],
  staff: [
    'queue.view', 'queue.manage',
    'customers.view',
    'social.view', 'social.create',
    'analytics.view'
  ],
  customer: [
    'queue.view'
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  if (!hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
