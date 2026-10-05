'use client';

import React from 'react';
import { TenantFeatures } from '../types/tenant';
import { useTenant } from './tenant-context';

export function isFeatureEnabled(features: TenantFeatures, featureName: keyof TenantFeatures): boolean {
  return !!features[featureName];
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: keyof TenantFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { tenant } = useTenant();
  const enabled = isFeatureEnabled(tenant.features, feature);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
