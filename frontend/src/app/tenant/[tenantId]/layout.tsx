'use client';

import React, { use, useEffect, useState } from 'react';
import { TenantProvider } from '../../../lib/tenant-context';
import { getTenantBySlug } from '../../../lib/tenant';
import { MOCK_TENANTS } from '../../../mock/tenants';
import { Tenant } from '../../../types/tenant';

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const fallback =
    MOCK_TENANTS.find((t) => t.slug.toLowerCase() === resolvedParams.tenantId.toLowerCase()) ||
    MOCK_TENANTS[0];

  const [tenant, setTenant] = useState<Tenant>(fallback);

  useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then((found) => {
      if (found) {
        setTenant(found);
      }
    });
  }, [resolvedParams.tenantId]);

  return <TenantProvider initialTenant={tenant}>{children}</TenantProvider>;
}
