'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Tenant } from '../types/tenant';
import { applyTenantBranding } from './tenant-branding';

interface TenantContextType {
  tenant: Tenant;
  setTenant: (tenant: Tenant) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({
  children,
  initialTenant,
}: {
  children: React.ReactNode;
  initialTenant: Tenant;
}) {
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const tenantSlug = pathParts[0] === 'tenant' ? pathParts[1] : undefined;
      const savedTenants = JSON.parse(localStorage.getItem('luna_dynamic_tenants') || '[]') as Tenant[];
      const savedTenant = savedTenants.find((item) => item.slug === tenantSlug);
      if (savedTenant) setTenant(savedTenant);
    } catch {
      // The mock repository remains the fallback when local storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (tenant) {
      applyTenantBranding(tenant.branding);
    }
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

import { MOCK_TENANTS } from '../mock/tenants';

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    return {
      tenant: MOCK_TENANTS[0],
      setTenant: () => {},
      isLoading: false,
    };
  }
  return context;
}
