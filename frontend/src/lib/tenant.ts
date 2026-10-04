import { Tenant } from '../types/tenant';
import { MOCK_TENANTS } from '../mock/tenants';

export interface TenantRepository {
  getTenants(): Promise<Tenant[]>;
  getTenantBySlug(slug: string): Promise<Tenant | null>;
  getTenantByDomain(domain: string): Promise<Tenant | null>;
  createTenant(tenant: Partial<Tenant>): Promise<Tenant>;
  updateTenant(slug: string, updates: Partial<Tenant>): Promise<Tenant | null>;
}

let dynamicTenants: Tenant[] = [...MOCK_TENANTS];

export class MockTenantRepository implements TenantRepository {
  async getTenants(): Promise<Tenant[]> {
    return Promise.resolve(dynamicTenants);
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const found = dynamicTenants.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
    return Promise.resolve(found || null);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const found = dynamicTenants.find((t) => t.domain?.toLowerCase() === domain.toLowerCase());
    return Promise.resolve(found || dynamicTenants[0]);
  }

  async createTenant(newTenantData: Partial<Tenant>): Promise<Tenant> {
    const slug = newTenantData.slug || (newTenantData.name || 'new-tenant').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'luma.com';
    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      slug,
      subdomain: slug,
      name: newTenantData.name || 'New Business',
      domain: `${slug}.${platformDomain}`,
      industry: newTenantData.industry || 'other',
      tagline: newTenantData.tagline || 'Custom intelligent queue and arrival management',
      description: newTenantData.description || 'Welcome to our digital queue customer service portal.',
      city: newTenantData.city || 'Lagos',
      area: newTenantData.area || 'Central District',
      rating: 5.0,
      reviewCount: 1,
      branding: {
        primaryColor: newTenantData.branding?.primaryColor || '#0057B8',
        secondaryColor: newTenantData.branding?.secondaryColor || '#002F6C',
        accentColor: newTenantData.branding?.accentColor || '#00A3E0',
        backgroundColor: newTenantData.branding?.backgroundColor || '#F4F8FC',
        textColor: newTenantData.branding?.textColor || '#0B1D3A',
        fontFamily: 'Inter',
        heroTitle: newTenantData.branding?.heroTitle || `Welcome to ${newTenantData.name || 'Our Portal'}`,
        heroSubtitle: newTenantData.branding?.heroSubtitle || newTenantData.tagline || 'Reserve a 30-minute arrival window or pre-clear your documents online.',
        announcementTicker: newTenantData.branding?.announcementTicker || 'Live Queue System Operating · Zero Walk-in Waiting',
        ctaButtonText: newTenantData.branding?.ctaButtonText || 'Book a Timed Ticket',
        bannerImageUrl: newTenantData.branding?.bannerImageUrl,
        contactEmail: newTenantData.branding?.contactEmail,
        contactPhone: newTenantData.branding?.contactPhone,
      },
      features: newTenantData.features || {
        queue: true,
        ticketing: true,
        social: true,
        messaging: true,
        notifications: true,
        analytics: true,
        verification: true,
        customerManagement: true,
        branchManagement: true,
        servicesManagement: true,
        appointments: false,
      },
      createdAt: new Date().toISOString(),
    };

    dynamicTenants = [newTenant, ...dynamicTenants];
    return Promise.resolve(newTenant);
  }

  async updateTenant(slug: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const index = dynamicTenants.findIndex((t) => t.slug.toLowerCase() === slug.toLowerCase());
    if (index === -1) return Promise.resolve(null);

    const existing = dynamicTenants[index];
    const updated: Tenant = {
      ...existing,
      ...updates,
      branding: {
        ...existing.branding,
        ...updates?.branding,
      },
      features: {
        ...existing.features,
        ...updates?.features,
      },
    };
    dynamicTenants[index] = updated;
    return Promise.resolve(updated);
  }
}

export const tenantRepository: TenantRepository = new MockTenantRepository();

export async function getAllTenants(): Promise<Tenant[]> {
  return tenantRepository.getTenants();
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  return tenantRepository.getTenantBySlug(slug);
}

export async function createTenant(tenant: Partial<Tenant>): Promise<Tenant> {
  return tenantRepository.createTenant(tenant);
}

export async function updateTenant(slug: string, updates: Partial<Tenant>): Promise<Tenant | null> {
  return tenantRepository.updateTenant(slug, updates);
}

export function resolveTenant(host: string | null, pathname: string | null): string {
  if (!host) return 'acme-bank';

  // 1. Local path development resolution: /tenant/[slug]
  if (pathname && pathname.startsWith('/tenant/')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return parts[1];
    }
  }

  // 2. Subdomain host resolution: acme-bank.luma.com or acme-bank.localhost
  const cleanHost = host.split(':')[0].toLowerCase();
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'luma.com';

  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1' || cleanHost === platformDomain || cleanHost === `app.${platformDomain}`) {
    return 'acme-bank';
  }

  if (cleanHost.endsWith(`.${platformDomain}`)) {
    const subdomain = cleanHost.replace(`.${platformDomain}`, '');
    if (subdomain !== 'app' && subdomain !== 'www') {
      return subdomain;
    }
  } else if (cleanHost.endsWith('.localhost')) {
    const subdomain = cleanHost.replace('.localhost', '');
    if (subdomain !== 'app' && subdomain !== 'www') {
      return subdomain;
    }
  }

  // Fallback default demo tenant
  return 'acme-bank';
}
