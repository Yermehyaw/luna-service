import { StaffAccount, StaffPrivilege } from '../types/user';

export interface PrivilegeMeta {
  id: StaffPrivilege;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
}

export const ALL_PRIVILEGES: PrivilegeMeta[] = [
  {
    id: 'ops_console',
    label: 'Ops Console & Live Queue',
    shortLabel: 'Ops Console',
    description: 'Call next tickets, serve waiting clients, assign chairs or bays',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'customer_directory',
    label: 'Customer Directory',
    shortLabel: 'Clients',
    description: 'Inspect client profiles, past visits, contact info and lookbooks',
    iconName: 'Users',
  },
  {
    id: 'approve_documents',
    label: 'Approve & Decline KYC Docs',
    shortLabel: 'Doc Review',
    description: 'Inspect client uploaded files and click to Approve or Decline',
    iconName: 'FileCheck2',
  },
  {
    id: 'manage_services',
    label: 'Services & Menu Pricing',
    shortLabel: 'Services',
    description: 'Edit service offerings, transparent pricing pills and station tags',
    iconName: 'Briefcase',
  },
  {
    id: 'manage_branches',
    label: 'Branches & Service Stations',
    shortLabel: 'Stations',
    description: 'Configure desk counters, chair stations, and branch hours',
    iconName: 'GitBranch',
  },
  {
    id: 'view_analytics',
    label: 'Business Analytics & SLA',
    shortLabel: 'Analytics',
    description: 'View wait time performance, peak hours and customer satisfaction',
    iconName: 'BarChart2',
  },
  {
    id: 'social_studio',
    label: 'Social Studio & Omnichannel Inbox',
    shortLabel: 'Social Studio',
    description: 'Unified inbox across Instagram, X, Facebook, TikTok & WhatsApp with AI drafting',
    iconName: 'MessageSquare',
  },
];

export const DEFAULT_TENANT_STAFF: Record<string, StaffAccount[]> = {
  'kemis-lounge': [
    {
      id: 'staff_kl_001',
      name: 'Kemi Adeleke',
      email: 'kemi@kemislounge.com',
      phone: '+234 809 445 5667',
      role: 'tenant_admin',
      tenantId: 'kemis-lounge',
      designation: 'Founder & Head Stylist',
      avatarColor: '#831843',
      status: 'active',
      lastLogin: 'Just now',
      privileges: ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'manage_branches', 'view_analytics', 'social_studio'],
      createdAt: '2025-02-18',
    },
    {
      id: 'staff_kl_002',
      name: 'Blessing Eze',
      email: 'blessing@kemislounge.com',
      phone: '+234 803 221 8899',
      role: 'staff',
      tenantId: 'kemis-lounge',
      designation: 'Lead Stylist & Braider (Chair 1)',
      avatarColor: '#D97706',
      status: 'active',
      lastLogin: '10 mins ago',
      privileges: ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'social_studio'],
      createdAt: '2025-02-20',
    },
    {
      id: 'staff_kl_003',
      name: 'Tunde Okafor',
      email: 'tunde@kemislounge.com',
      phone: '+234 814 556 7711',
      role: 'staff',
      tenantId: 'kemis-lounge',
      designation: 'Styling Apprentice (Chair 2)',
      avatarColor: '#2563EB',
      status: 'active',
      lastLogin: 'Today at 08:30 AM',
      privileges: ['ops_console'],
      createdAt: '2025-03-01',
    },
  ],
  'quickfix-auto': [
    {
      id: 'staff_qf_001',
      name: 'Emeka Nwosu',
      email: 'emeka@quickfix.ng',
      phone: '+234 802 334 5566',
      role: 'tenant_admin',
      tenantId: 'quickfix-auto',
      designation: 'Workshop Owner & Lead Diagnostician',
      avatarColor: '#1E293B',
      status: 'active',
      lastLogin: 'Just now',
      privileges: ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'manage_branches', 'view_analytics', 'social_studio'],
      createdAt: '2025-01-10',
    },
    {
      id: 'staff_qf_002',
      name: 'Aliyu Garba',
      email: 'aliyu@quickfix.ng',
      phone: '+234 805 778 9900',
      role: 'staff',
      tenantId: 'quickfix-auto',
      designation: 'Master Tech (Bay 1)',
      avatarColor: '#059669',
      status: 'active',
      lastLogin: '30 mins ago',
      privileges: ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'social_studio'],
      createdAt: '2025-01-15',
    },
    {
      id: 'staff_qf_003',
      name: 'Samuel Bassey',
      email: 'samuel@quickfix.ng',
      phone: '+234 812 667 3344',
      role: 'staff',
      tenantId: 'quickfix-auto',
      designation: 'Lube & Tire Specialist (Bay 2)',
      avatarColor: '#7C3AED',
      status: 'active',
      lastLogin: 'Yesterday',
      privileges: ['ops_console'],
      createdAt: '2025-02-01',
    },
  ],
  'acme-bank': [
    {
      id: 'staff_ab_001',
      name: 'Marcus Sterling',
      email: 'marcus.sterling@acmebank.com',
      phone: '+234 802 111 2233',
      role: 'tenant_admin',
      tenantId: 'acme-bank',
      designation: 'Branch Operations Director',
      avatarColor: '#0057B8',
      status: 'active',
      lastLogin: 'Just now',
      privileges: ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'manage_branches', 'view_analytics', 'social_studio'],
      createdAt: '2025-01-05',
    },
    {
      id: 'staff_ab_002',
      name: 'David Adeleke',
      email: 'david.a@acmebank.com',
      phone: '+234 803 778 2211',
      role: 'staff',
      tenantId: 'acme-bank',
      designation: 'Senior Teller Officer (Window 1)',
      avatarColor: '#0F766E',
      status: 'active',
      lastLogin: '1 hour ago',
      privileges: ['ops_console', 'customer_directory', 'approve_documents', 'view_analytics'],
      createdAt: '2025-01-12',
    },
    {
      id: 'staff_ab_003',
      name: 'Grace Oladipo',
      email: 'grace.o@acmebank.com',
      phone: '+234 816 443 9922',
      role: 'staff',
      tenantId: 'acme-bank',
      designation: 'Customer Care Rep (Desk 3)',
      avatarColor: '#BE185D',
      status: 'active',
      lastLogin: 'Today at 09:00 AM',
      privileges: ['ops_console'],
      createdAt: '2025-01-20',
    },
  ],
};

const getStorageKey = (tenantId: string) => `luna_staff_accounts_${tenantId}`;

export function getTenantStaff(tenantId: string): StaffAccount[] {
  if (typeof window === 'undefined') {
    return DEFAULT_TENANT_STAFF[tenantId] || DEFAULT_TENANT_STAFF['kemis-lounge'];
  }
  try {
    const raw = localStorage.getItem(getStorageKey(tenantId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading staff accounts from storage:', e);
  }

  // Fallback to default mock list
  const defaults = DEFAULT_TENANT_STAFF[tenantId] || [
    {
      id: `staff_${tenantId}_owner`,
      name: 'Business Owner',
      email: `admin@${tenantId}.com`,
      role: 'tenant_admin',
      tenantId,
      designation: 'Owner & General Manager',
      avatarColor: '#291E29',
      status: 'active',
      lastLogin: 'Just now',
      privileges: ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'manage_branches', 'view_analytics', 'social_studio'],
      createdAt: '2025-01-01',
    },
    {
      id: `staff_${tenantId}_staff1`,
      name: 'Lead Staff Specialist',
      email: `staff@${tenantId}.com`,
      role: 'staff',
      tenantId,
      designation: 'Senior Service Specialist',
      avatarColor: '#D97706',
      status: 'active',
      lastLogin: 'Today',
      privileges: ['ops_console', 'customer_directory', 'approve_documents'],
      createdAt: '2025-01-10',
    },
  ];

  try {
    localStorage.setItem(getStorageKey(tenantId), JSON.stringify(defaults));
  } catch (e) {
    console.warn('Error seeding default staff accounts:', e);
  }
  return defaults;
}

export function saveTenantStaff(tenantId: string, staffList: StaffAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(tenantId), JSON.stringify(staffList));
  } catch (e) {
    console.warn('Error saving staff accounts:', e);
  }
}

export function updateStaffPrivileges(
  tenantId: string,
  staffId: string,
  privileges: StaffPrivilege[]
): StaffAccount[] {
  const current = getTenantStaff(tenantId);
  const updated = current.map((s) => (s.id === staffId ? { ...s, privileges } : s));
  saveTenantStaff(tenantId, updated);
  return updated;
}

export function addStaffAccount(
  tenantId: string,
  accountData: Omit<StaffAccount, 'id' | 'createdAt'>
): StaffAccount {
  const current = getTenantStaff(tenantId);
  const newStaff: StaffAccount = {
    ...accountData,
    id: `staff_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  const updated = [newStaff, ...current];
  saveTenantStaff(tenantId, updated);
  return newStaff;
}

export function toggleStaffStatus(tenantId: string, staffId: string): StaffAccount[] {
  const current = getTenantStaff(tenantId);
  const updated: StaffAccount[] = current.map((s) => {
    if (s.id === staffId) {
      const nextStatus: 'active' | 'suspended' = s.status === 'active' ? 'suspended' : 'active';
      return { ...s, status: nextStatus };
    }
    return s;
  });
  saveTenantStaff(tenantId, updated);
  return updated;
}

export function deleteStaffAccount(tenantId: string, staffId: string): StaffAccount[] {
  const current = getTenantStaff(tenantId);
  const updated = current.filter((s) => s.id !== staffId);
  saveTenantStaff(tenantId, updated);
  return updated;
}
