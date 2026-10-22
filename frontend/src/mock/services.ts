export interface ServiceItem {
  id: string;
  tenantId: string;
  name: string;
  minutes: number;
  description: string;
  price?: string;
  station?: string;
  imageUrl?: string;
  category?: string;
  availableDays?: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  timeOfDay?: ('Morning' | 'Afternoon' | 'Evening')[];
  startTime?: string; // e.g. '09:00'
  endTime?: string;   // e.g. '18:00'
  requiresImageUpload?: boolean;
  isActive?: boolean;
}

export const MOCK_SERVICES: ServiceItem[] = [
  // Acme Bank (tenant_001)
  {
    id: 's_001',
    tenantId: 'tenant_001',
    name: 'Teller & Cash Deposit',
    minutes: 5,
    description: 'Instant cash deposit, withdrawal, and teller window services.',
    price: 'Free Account Service',
    station: 'Counter 1 · Teller Desk',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    category: 'Teller Services',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '08:30',
    endTime: '16:00',
    isActive: true,
  },
  {
    id: 's_002',
    tenantId: 'tenant_001',
    name: 'Account & Card Advisory',
    minutes: 15,
    description: 'New account opening, debit/credit card issuance, and compliance.',
    price: 'Free Consultation',
    station: 'Counter 2 · Advisory Desk',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    category: 'Advisory & KYC',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '09:00',
    endTime: '16:00',
    isActive: true,
  },
  {
    id: 's_003',
    tenantId: 'tenant_001',
    name: 'Corporate Foreign Exchange',
    minutes: 20,
    description: 'Business foreign currency, trade finance, and wire transfers.',
    price: 'Commercial Rates',
    station: 'Window 3 · FX Specialist',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    category: 'Corporate Finance',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '09:00',
    endTime: '15:30',
    isActive: true,
  },

  // City General Hospital (tenant_002)
  {
    id: 's_004',
    tenantId: 'tenant_002',
    name: 'Outpatient Triage & Consultation',
    minutes: 25,
    description: 'General doctor consultation, vital checks, and clinical triage.',
    price: '$75 Consultation',
    station: 'Room 102 · General Triage',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    category: 'Consultation',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon', 'Evening'],
    startTime: '08:00',
    endTime: '20:00',
    isActive: true,
  },
  {
    id: 's_005',
    tenantId: 'tenant_002',
    name: 'Laboratory Diagnostics & Blood Work',
    minutes: 10,
    description: 'Rapid blood sample collection, X-ray pre-clearance, and diagnostics.',
    price: '$40 Lab Panel',
    station: 'Lab Bay B · Diagnostics',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    category: 'Diagnostics',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '07:30',
    endTime: '15:00',
    isActive: true,
  },

  // Luna Mobile & Fiber (tenant_003)
  {
    id: 's_006',
    tenantId: 'tenant_003',
    name: 'SIM Replacement & Biometrics',
    minutes: 8,
    description: 'Instant SIM swap, biometric re-registration, and e-SIM activation.',
    price: 'Free Replacement',
    station: 'Desk 1 · Biometrics Counter',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    category: 'Biometrics & Telecom',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon', 'Evening'],
    startTime: '09:00',
    endTime: '19:00',
    isActive: true,
  },

  // Kemi's Hair & Beauty Lounge (tenant_004) - Salon SME
  {
    id: 's_007',
    tenantId: 'tenant_004',
    name: 'Signature Knotless Braids & Twists',
    minutes: 90,
    description: 'Dedicated styling chair, scalp hydration, precision parting, and custom extension blending.',
    price: '₦18,000',
    station: 'Chair 1 · Lead Stylist',
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
    category: 'Hair Braiding',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon', 'Evening'],
    startTime: '09:00',
    endTime: '19:00',
    requiresImageUpload: true,
    isActive: true,
  },
  {
    id: 's_008',
    tenantId: 'tenant_004',
    name: 'Silk Press & Deep Moisture Steam Treatment',
    minutes: 45,
    description: 'Clarifying wash, deep conditioning ultrasonic steam infusion, and salon high-shine silk press.',
    price: '₦12,500',
    station: 'Chair 2 · Treatment Station',
    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
    category: 'Hair Treatments',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '09:30',
    endTime: '17:00',
    requiresImageUpload: false,
    isActive: true,
  },
  {
    id: 's_009',
    tenantId: 'tenant_004',
    name: 'Express Gel Manicure & Deluxe Pedicure',
    minutes: 35,
    description: 'Quick cut and file, cuticle nourishment, exfoliating scrub, and chip-free gel polish.',
    price: '₦8,500',
    station: 'Nail Bar Station 3',
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80',
    category: 'Nails & Spa',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    timeOfDay: ['Morning', 'Afternoon', 'Evening'],
    startTime: '10:00',
    endTime: '18:30',
    requiresImageUpload: true,
    isActive: true,
  },

  // QuickFix AutoCare Garage (tenant_005) - Auto Repair SME
  {
    id: 's_010',
    tenantId: 'tenant_005',
    name: 'Express Synthetic Oil & Filter Service',
    minutes: 20,
    description: 'Full synthetic oil change, OEM filter replacement, and 15-point fluid & tire inspection.',
    price: '₦22,000',
    station: 'Service Bay 1 · Express Lube',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    category: 'Express Maintenance',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '08:00',
    endTime: '17:00',
    requiresImageUpload: false,
    isActive: true,
  },
  {
    id: 's_011',
    tenantId: 'tenant_005',
    name: 'Brake Inspection & Ceramic Pad Replacement',
    minutes: 40,
    description: 'Brake rotor inspection, caliper check, fluid flush, and premium ceramic pad replacement.',
    price: '₦35,000',
    station: 'Service Bay 2 · Mechanical',
    imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80',
    category: 'Brakes & Suspension',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '08:30',
    endTime: '16:30',
    requiresImageUpload: true,
    isActive: true,
  },
  {
    id: 's_012',
    tenantId: 'tenant_005',
    name: 'OBD-II Computer Diagnostics & Battery Health',
    minutes: 15,
    description: 'Full ECU computer scan, electrical alternator health check, and instant fault printout.',
    price: '₦10,000',
    station: 'Diagnostic Bay 3',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    category: 'Diagnostics',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon', 'Evening'],
    startTime: '08:00',
    endTime: '18:00',
    requiresImageUpload: true,
    isActive: true,
  },

  // The Daily Grind Cafe & Bakery (tenant_006) - Cafe & Bakery SME
  {
    id: 's_013',
    tenantId: 'tenant_006',
    name: 'Express Coffee & Fresh Pastry Window',
    minutes: 4,
    description: 'Fast-track specialty espresso, iced cold brew, and hot artisan croissants.',
    price: '₦4,200',
    station: 'Express Counter 1',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    category: 'Coffee & Drinks',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '07:00',
    endTime: '15:00',
    requiresImageUpload: false,
    isActive: true,
  },
  {
    id: 's_014',
    tenantId: 'tenant_006',
    name: 'Artisan Sourdough Loaf Pickup',
    minutes: 3,
    description: 'Pick up your reserved fresh-baked sourdough batch, brioche, or seeded baguette.',
    price: '₦5,500',
    station: 'Bakery Rack A',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    category: 'Fresh Bakes',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '07:30',
    endTime: '16:00',
    requiresImageUpload: false,
    isActive: true,
  },
  {
    id: 's_015',
    tenantId: 'tenant_006',
    name: 'Custom Celebration Cake Consultation',
    minutes: 15,
    description: 'Tasting samples, tier design review, and delivery scheduling with our head pastry chef.',
    price: 'Free Tasting',
    station: 'Chef Table Suite',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    category: 'Custom Orders',
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Afternoon', 'Evening'],
    startTime: '12:00',
    endTime: '18:00',
    requiresImageUpload: true,
    isActive: true,
  },

  // Apex Dental & Vision Boutique (tenant_007) - Boutique Clinic SME
  {
    id: 's_016',
    tenantId: 'tenant_007',
    name: 'Routine Dental Cleaning & Air-Polishing',
    minutes: 30,
    description: 'Gentle ultrasonic scaling, stain removal, and fluoride enamel protection.',
    price: '₦25,000',
    station: 'Suite 1 · Dental Hygiene',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    category: 'Dental Hygiene',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon'],
    startTime: '09:00',
    endTime: '16:30',
    requiresImageUpload: false,
    isActive: true,
  },
  {
    id: 's_017',
    tenantId: 'tenant_007',
    name: 'Comprehensive Eye Exam & Frame Fitting',
    minutes: 25,
    description: 'Digital visual acuity test, retinal imaging, and curated designer frame fitting.',
    price: '₦18,000',
    station: 'Suite 2 · Optometry',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    category: 'Optometry',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: ['Morning', 'Afternoon', 'Evening'],
    startTime: '09:00',
    endTime: '18:00',
    requiresImageUpload: false,
    isActive: true,
  },
];

const STORAGE_KEY_PREFIX = 'luna_tenant_services_';

/**
 * Retrieve services for a tenant, checking localStorage first.
 */
export function getTenantServices(tenantId: string): ServiceItem[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tenantId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[mock/services] Error reading localStorage services:', e);
    }
  }

  // Filter default mock services
  const filtered = MOCK_SERVICES.filter((s) => s.tenantId === tenantId);
  return filtered.length > 0 ? filtered : [];
}

/**
 * Persist services for a tenant to localStorage.
 */
export function saveTenantServices(tenantId: string, services: ServiceItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${tenantId}`, JSON.stringify(services));
  } catch (e) {
    console.warn('[mock/services] Error saving services to localStorage:', e);
  }
}

/**
 * Add a custom service with image, calendar availability, and time of day.
 */
export function addCustomService(
  tenantId: string,
  serviceData: Omit<ServiceItem, 'id' | 'tenantId'>
): ServiceItem {
  const current = getTenantServices(tenantId);
  const newId = `s_custom_${Date.now()}`;
  const newService: ServiceItem = {
    ...serviceData,
    id: newId,
    tenantId,
    availableDays: serviceData.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeOfDay: serviceData.timeOfDay || ['Morning', 'Afternoon'],
    startTime: serviceData.startTime || '09:00',
    endTime: serviceData.endTime || '18:00',
    isActive: serviceData.isActive ?? true,
  };

  const updated = [newService, ...current];
  saveTenantServices(tenantId, updated);
  return newService;
}

/**
 * Delete a service for a tenant.
 */
export function deleteTenantService(tenantId: string, serviceId: string): void {
  const current = getTenantServices(tenantId);
  const updated = current.filter((s) => s.id !== serviceId);
  saveTenantServices(tenantId, updated);
}

/**
 * Update an existing service.
 */
export function updateTenantService(
  tenantId: string,
  serviceId: string,
  updates: Partial<ServiceItem>
): ServiceItem | null {
  const current = getTenantServices(tenantId);
  let updatedItem: ServiceItem | null = null;
  const nextList = current.map((s) => {
    if (s.id === serviceId) {
      updatedItem = { ...s, ...updates };
      return updatedItem;
    }
    return s;
  });

  if (updatedItem) {
    saveTenantServices(tenantId, nextList);
  }
  return updatedItem;
}

/**
 * Industry Image Presets for 1-click photo selection during custom service creation
 */
export const SERVICE_IMAGE_PRESETS: Record<string, { label: string; url: string }[]> = {
  salon_beauty: [
    {
      label: 'Knotless Braids',
      url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Silk Press Hair',
      url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Gel Nail Polish',
      url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Scalp & Spa Wash',
      url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    },
  ],
  auto_repair: [
    {
      label: 'Synthetic Oil & Lube',
      url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Ceramic Brake Pads',
      url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Computer Diagnostics',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Wheel Alignment',
      url: 'https://images.unsplash.com/photo-1558441719-868615a1336c?auto=format&fit=crop&w=600&q=80',
    },
  ],
  cafe_bakery: [
    {
      label: 'Espresso & Drinks',
      url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Fresh Sourdough Bread',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Celebration Cake',
      url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Breakfast Pastries',
      url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    },
  ],
  boutique_clinic: [
    {
      label: 'Dental Hygiene & Polish',
      url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Eye Exam & Optics',
      url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Clinical Consultation',
      url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    },
  ],
  default: [
    {
      label: 'Customer Counter Window',
      url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Priority Advisory Desk',
      url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Executive Client Desk',
      url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80',
    },
  ],
};
