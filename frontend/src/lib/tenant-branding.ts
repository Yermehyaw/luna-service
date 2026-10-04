import { TenantBranding } from '../types/tenant';

export function applyTenantBranding(branding: TenantBranding) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--tenant-primary', branding.primaryColor);
  root.style.setProperty('--tenant-secondary', branding.secondaryColor);
  root.style.setProperty('--tenant-accent', branding.accentColor);
  root.style.setProperty('--tenant-bg', branding.backgroundColor);
  root.style.setProperty('--tenant-text', branding.textColor);

  if (branding.fontFamily) {
    root.style.setProperty('--font-tenant', branding.fontFamily);
  }
}
