export type TenantIndustry = 
  | 'banking' 
  | 'healthcare' 
  | 'telecom' 
  | 'education' 
  | 'government' 
  | 'retail' 
  | 'other';

export interface TenantBranding {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  announcementTicker?: string;
  ctaButtonText?: string;
  bannerImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface TenantFeatures {
  queue: boolean;
  ticketing: boolean;
  social: boolean;
  messaging: boolean;
  notifications: boolean;
  analytics: boolean;
  verification: boolean;
  customerManagement: boolean;
  branchManagement: boolean;
  servicesManagement: boolean;
  appointments: boolean;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain?: string;
  subdomain?: string;
  industry: TenantIndustry;
  tagline: string;
  description: string;
  city: string;
  area: string;
  rating: number;
  reviewCount: number;
  branding: TenantBranding;
  features: TenantFeatures;
  createdAt: string;
}
