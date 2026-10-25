export type TenantIndustry = 
  | 'banking' 
  | 'healthcare' 
  | 'telecom' 
  | 'education' 
  | 'government' 
  | 'retail' 
  | 'salon_beauty'     // SME: Hair salons, barbershops, nail bars, spas
  | 'auto_repair'      // SME: Auto mechanics, oil lube, auto detailing, tire shops
  | 'cafe_bakery'      // SME: Bakeries, specialty cafes, artisan diners
  | 'boutique_clinic'  // SME: Dental, optometrist, physical therapy, veterinary
  | 'professional'     // SME: Law boutiques, tax/accounting, photography studios
  | 'other';

export type BusinessScale = 'sme' | 'enterprise';

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
  businessScale?: BusinessScale;
  serviceUnitName?: string; // e.g. "Window", "Styling Chair", "Service Bay", "Pickup Counter"
  staffTitle?: string;       // e.g. "Counter Officer", "Stylist", "Technician", "Barista"
  templateLayout?: 'sme_boutique' | 'enterprise_institutional';
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

export type TenantStatus = 'active' | 'pending' | 'suspended';
export type TenantPlan = 'free_subdomain' | 'pro_sme' | 'enterprise_tier';

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
  businessScale?: BusinessScale;
  branding: TenantBranding;
  features: TenantFeatures;
  createdAt: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
  queueCount?: number;
  monthlyActiveVisitors?: number;
}
