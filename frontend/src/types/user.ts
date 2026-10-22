export type UserRole = 'super_admin' | 'tenant_admin' | 'staff' | 'customer';

export type StaffPrivilege =
  | 'ops_console'          // Live Queue & Serving Tickets
  | 'customer_directory'    // View Customer List & History
  | 'approve_documents'    // Review, Approve & Decline KYC / Intake Files
  | 'manage_services'      // Update Services, Prices & Stations
  | 'manage_branches'      // Manage Counters & Branch Stations
  | 'view_analytics'       // Business Reports & SLA Metrics
  | 'social_studio';       // Social Broadcasts & Customer SMS

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'tenant_admin' | 'staff';
  tenantId: string;
  designation: string;
  avatarColor?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  privileges: StaffPrivilege[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  tenantId?: string;
  avatarUrl?: string;
  avatarColor?: string;
  designation?: string;
  memberTier?: 'Member' | 'Silver' | 'Gold' | 'VIP Diamond';
  visitsCount?: number;
  privileges?: StaffPrivilege[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
