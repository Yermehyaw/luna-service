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
