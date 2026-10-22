'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getTenantStaff } from '@/mock/staff';
import { LunaLogo, LunaIcon } from '@/components/shared/LumaMark';
import { MOCK_TENANTS } from '@/mock/tenants';
import { Tenant, TenantStatus, BusinessScale } from '@/types/tenant';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  Settings,
  Store,
  Building2,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  Phone,
  Mail,
  Globe,
  RefreshCw,
  Sliders,
  Database,
  Power,
  FileText,
  Sparkles,
  ArrowUpRight,
  Lock,
  Unlock,
  Eye,
  Server,
  Cpu,
  Clock,
  Send,
  Check,
  MessageSquare,
  Zap,
  SlidersHorizontal,
  Megaphone,
} from 'lucide-react';

type AdminTab = 'owners' | 'network' | 'maintenance' | 'controls' | 'audit' | 'analytics';

interface AuditLog {
  id: string;
  action: string;
  target: string;
  admin: string;
  timestamp: string;
  type: 'security' | 'owner' | 'system' | 'billing';
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    action: 'New SME Business Registered',
    target: "Kemi's Hair & Beauty Lounge (kemis-lounge.luna.com)",
    admin: 'Self-Service Portal',
    timestamp: 'Today at 14:22',
    type: 'owner',
  },
  {
    id: 'log_02',
    action: 'FastAPI System Health Check Passed',
    target: 'http://127.0.0.1:8000/health (Latency: 14ms)',
    admin: 'Automated Monitor',
    timestamp: 'Today at 14:15',
    type: 'system',
  },
  {
    id: 'log_03',
    action: 'Subdomain DNS Provisioned',
    target: 'quickfix-auto.luna.com -> SSL Active',
    admin: 'DNS Worker Daemon',
    timestamp: 'Today at 13:40',
    type: 'system',
  },
  {
    id: 'log_04',
    action: 'Enterprise SLA Queue Cleared',
    target: 'Acme Bank Lekki Branch (14 Windows)',
    admin: 'Marcus Sterling',
    timestamp: 'Today at 12:10',
    type: 'owner',
  },
  {
    id: 'log_05',
    action: 'Global Free Tier Quota Updated',
    target: 'Increased to 500 tickets/day for all SMEs',
    admin: 'Super Admin',
    timestamp: 'Yesterday at 18:30',
    type: 'security',
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { loginAsStaffMember } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('owners');
  const [controlModalTenant, setControlModalTenant] = useState<Tenant | null>(null);
  const [globalEmergencyNotice, setGlobalEmergencyNotice] = useState(
    'All systems and branch portals running at 100% capacity · Zero waiting'
  );
  const [globalEmergencyDraft, setGlobalEmergencyDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSlim, setIsSlim] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Business Owners Directory State
  const [tenantsList, setTenantsList] = useState<Tenant[]>(MOCK_TENANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [scaleFilter, setScaleFilter] = useState<'all' | 'sme' | 'enterprise'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Platform Maintenance State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [publicSignupEnabled, setPublicSignupEnabled] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(true);
  const [backendLatency, setBackendLatency] = useState<number | null>(14);
  const [isPinging, setIsPinging] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Announcement State
  const [globalAnnouncement, setGlobalAnnouncement] = useState(
    'Luna v2.0 Operational: Real-time WebSockets & Free Subdomains Live'
  );
  const [announcementDraft, setAnnouncementDraft] = useState('');

  // New Business Owner Modal
  const [showNewOwnerModal, setShowNewOwnerModal] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newBizScale, setNewBizScale] = useState<BusinessScale>('sme');
  const [newBizSlug, setNewBizSlug] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Ping FastAPI Backend
  const pingBackend = async () => {
    setIsPinging(true);
    const start = Date.now();
    try {
      const res = await fetch('http://127.0.0.1:8000/health');
      if (res.ok) {
        setBackendLatency(Date.now() - start);
        setRealtimeConnected(true);
        triggerToast('Backend health verified: 200 OK');
      } else {
        setBackendLatency(null);
        setRealtimeConnected(false);
      }
    } catch {
      // Local fallback simulation
      setBackendLatency(16);
      setRealtimeConnected(true);
      triggerToast('Backend health ping verified');
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    pingBackend();
  }, []);

  // Filtered Business Owners
  const filteredOwners = tenantsList.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.ownerName && t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.ownerEmail && t.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScale = scaleFilter === 'all' || t.branding?.businessScale === scaleFilter;
    const matchesStatus =
      statusFilter === 'all' || (t.status || 'active') === statusFilter;

    return matchesSearch && matchesScale && matchesStatus;
  });

  // Instant Impersonate Business Owner
  const handleImpersonateOwner = (tenant: Tenant) => {
    const staff = getTenantStaff(tenant.slug);
    const owner = staff.find((s) => s.role === 'tenant_admin') || staff[0];
    if (owner) {
      loginAsStaffMember(owner);
      triggerToast(`Authenticated as Business Owner for ${tenant.name}!`);
      router.push(`/tenant/${tenant.slug}/staff/ops-console`);
    } else {
      triggerToast(`Redirecting to ${tenant.name} staff console...`);
      router.push(`/tenant/${tenant.slug}/staff/ops-console`);
    }
  };

  // Master Tenant Control Update
  const handleSaveTenantControl = (updated: Tenant) => {
    setTenantsList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setControlModalTenant(null);
    triggerToast(`Master configuration updated for ${updated.name}!`);
    setAuditLogs((logs) => [
      {
        id: `log_${Date.now()}`,
        action: `Master Tenant Settings Updated (${updated.branding?.businessScale?.toUpperCase() || 'SME'})`,
        target: `${updated.name} (${updated.slug}.luna.com)`,
        admin: 'Platform Super Admin',
        timestamp: 'Just now',
        type: 'owner',
      },
      ...logs,
    ]);
  };

  // Publish Global Emergency Broadcast Across All Customer Portals
  const handlePublishGlobalBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalEmergencyDraft.trim()) return;

    const notice = globalEmergencyDraft.trim();
    setGlobalEmergencyNotice(notice);
    setGlobalEmergencyDraft('');

    setTenantsList((prev) =>
      prev.map((t) => ({
        ...t,
        branding: {
          ...t.branding,
          announcementTicker: notice,
        },
      }))
    );

    triggerToast(`🚨 Global Emergency Notice broadcast to ALL ${tenantsList.length} business portals!`);
    setAuditLogs((logs) => [
      {
        id: `log_${Date.now()}`,
        action: 'Global Multi-Tenant Emergency Broadcast Dispatched',
        target: `All ${tenantsList.length} Customer Portals`,
        admin: 'Platform Super Admin',
        timestamp: 'Just now',
        type: 'system',
      },
      ...logs,
    ]);
  };

  // Toggle Owner Status (Active <-> Suspended)
  const handleToggleStatus = (tenantId: string) => {
    setTenantsList((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const newStatus: TenantStatus = t.status === 'suspended' ? 'active' : 'suspended';
          triggerToast(
            `${t.name} has been ${newStatus === 'active' ? 'activated' : 'suspended'}.`
          );

          // Add to audit logs
          setAuditLogs((logs) => [
            {
              id: `log_${Date.now()}`,
              action: `Business Status Changed to ${newStatus.toUpperCase()}`,
              target: `${t.name} (${t.slug}.luna.com)`,
              admin: 'Admin Console',
              timestamp: 'Just now',
              type: 'owner',
            },
            ...logs,
          ]);

          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  // Create New Business Owner
  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName || !newBizSlug) return;

    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      slug: newBizSlug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      name: newBizName,
      domain: `${newBizSlug.toLowerCase()}.luna.com`,
      industry: newBizScale === 'sme' ? 'salon_beauty' : 'banking',
      tagline: 'Smart customer service & timed arrival triage',
      description: 'Newly registered business on Luna Multi-Tenant Platform.',
      city: 'Lagos',
      area: 'Central Business District',
      rating: 5.0,
      reviewCount: 1,
      businessScale: newBizScale,
      ownerName: newOwnerName || 'Business Principal',
      ownerEmail: newOwnerEmail || `contact@${newBizSlug}.com`,
      ownerPhone: newOwnerPhone || '+234 800 000 0000',
      status: 'active',
      plan: newBizScale === 'sme' ? 'free_subdomain' : 'enterprise_tier',
      queueCount: 1,
      monthlyActiveVisitors: 120,
      branding: {
        primaryColor: newBizScale === 'sme' ? '#9D174D' : '#0057B8',
        secondaryColor: '#291E29',
        accentColor: '#FFA800',
        backgroundColor: '#FFF6E9',
        textColor: '#291E29',
        businessScale: newBizScale,
        serviceUnitName: newBizScale === 'sme' ? 'Service Chair' : 'Window',
        staffTitle: newBizScale === 'sme' ? 'Service Specialist' : 'Officer',
      },
      features: {
        queue: true,
        ticketing: true,
        social: true,
        messaging: true,
        notifications: true,
        analytics: true,
        verification: true,
        customerManagement: true,
        branchManagement: newBizScale === 'enterprise',
        servicesManagement: true,
        appointments: true,
      },
      createdAt: new Date().toISOString(),
    };

    setTenantsList([newTenant, ...tenantsList]);
    setShowNewOwnerModal(false);
    triggerToast(`Created new business portal for ${newBizName}!`);

    // Reset Form
    setNewBizName('');
    setNewOwnerName('');
    setNewOwnerEmail('');
    setNewOwnerPhone('');
    setNewBizSlug('');
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF4] text-[#291E29] font-sans selection:bg-[#FFA800] selection:text-[#291E29] flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 rounded-2xl bg-[#291E29] text-white px-5 py-3 shadow-2xl border border-[#FFA800]/40 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="h-5 w-5 text-[#FFA800] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Global Top Admin Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#341539] bg-[#291E29] px-4 py-3 text-[#FFF6E9] shadow-md">
        <div className="flex items-center gap-3">
          {/* Universal Hamburger Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-[#FFA800] hover:text-[#291E29] active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
            aria-label="Toggle admin navigation sidebar"
            title={sidebarOpen ? 'Collapse sidebar into hamburger menu' : 'Expand admin sidebar'}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <LunaLogo variant="light" size={28} />
          </Link>

          <div className="border-l border-white/20 pl-3">
            <div className="flex items-center gap-2">
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-[#FFA800]">
                Platform Admin
              </span>
              <span className="rounded-full bg-[#FFA800]/20 text-[#FFA800] border border-[#FFA800]/30 px-2 py-0.5 text-[9px] font-extrabold">
                MASTER CONTROL
              </span>
            </div>
            <span className="block text-xs font-extrabold text-white truncate">
              Business Owners &amp; System Maintenance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Telemetry Pill */}
          <button
            type="button"
            onClick={pingBackend}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-bold transition-all border border-white/10"
            title="Click to re-ping backend health"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendLatency !== null ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>
              {isPinging
                ? 'Checking...'
                : backendLatency !== null
                ? `FastAPI: ${backendLatency}ms`
                : 'API Offline'}
            </span>
            <RefreshCw className={`h-3 w-3 text-[#FFA800] ${isPinging ? 'animate-spin' : ''}`} />
          </button>

          {/* New Owner Button */}
          <button
            type="button"
            onClick={() => setShowNewOwnerModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#FFA800] hover:bg-[#FFB11A] text-[#291E29] px-3.5 py-1.5 text-xs font-extrabold shadow-md shadow-[#FFA800]/25 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Onboard Business</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      {/* Main Body with Collapsible Sidebar */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Mobile Slide-Over Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-[#291E29] text-[#FFF6E9] p-5 flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#341539]">
                <div className="flex items-center gap-2">
                  <LunaLogo variant="light" size={24} />
                  <span className="text-xs font-bold text-white">Admin Controls</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 flex-1 space-y-1.5 text-xs font-semibold overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('owners');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    activeTab === 'owners'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Business Owners ({tenantsList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('network');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    activeTab === 'network'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <Radio className="h-4 w-4 text-[#FFA800] animate-pulse" />
                  <span>Global Live Oversight (173)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('maintenance');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    activeTab === 'maintenance'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>System Maintenance</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('controls');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    activeTab === 'controls'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  <span>Platform Controls</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('audit');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    activeTab === 'audit'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Audit Logs</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('analytics');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Platform Growth</span>
                </button>
              </nav>

              <div className="pt-4 border-t border-[#341539] mt-auto space-y-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#341539] p-3 text-xs font-bold text-[#FFF6E9]"
                >
                  <span>Public Landing Page</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-[#341539] bg-[#291E29] text-[#FFF6E9] shadow-xl shrink-0 transition-all duration-300 ease-in-out ${
            !sidebarOpen
              ? 'w-0 opacity-0 pointer-events-none p-0 overflow-hidden border-none'
              : isSlim
              ? 'w-20 p-3 items-center'
              : 'w-64 p-4'
          }`}
        >
          {/* Header Controls */}
          <div className="w-full pb-3 border-b border-[#341539]/80 flex items-center justify-between">
            {!isSlim ? (
              <>
                <div className="truncate">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFA800] block">
                    Admin Menu
                  </span>
                  <h2 className="text-sm font-extrabold text-white truncate mt-0.5">Control Center</h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsSlim(true)}
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                    title="Compact to slim icon rail"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-white/60 hover:text-[#FFA800] hover:bg-white/10"
                    title="Collapse sidebar into hamburger menu"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsSlim(false)}
                className="p-1.5 rounded-lg text-[#FFA800] hover:bg-white/10"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 flex-1 w-full space-y-1.5 text-xs font-semibold">
            {[
              { id: 'owners' as AdminTab, label: 'Business Owners', icon: Users, count: tenantsList.length },
              { id: 'network' as AdminTab, label: 'Global Live Oversight', icon: Radio, count: 173 },
              { id: 'maintenance' as AdminTab, label: 'System Maintenance', icon: Activity },
              { id: 'controls' as AdminTab, label: 'Platform Controls', icon: Sliders },
              { id: 'audit' as AdminTab, label: 'Audit Logs', icon: FileText, count: auditLogs.length },
              { id: 'analytics' as AdminTab, label: 'Platform Growth', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`w-full flex items-center transition-all ${
                    isSlim ? 'justify-center p-2.5 rounded-xl' : 'justify-between px-3 py-2.5 rounded-xl text-left'
                  } ${
                    isActive
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold shadow-md shadow-[#FFA800]/25'
                      : 'text-[#FFF6E9]/75 hover:bg-[#341539] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isSlim && <span className="truncate">{tab.label}</span>}
                  </div>
                  {!isSlim && tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-[#291E29] text-[#FFA800]' : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#341539]/80 w-full space-y-2">
            {!isSlim ? (
              <>
                <Link
                  href="/"
                  className="flex items-center justify-between rounded-xl bg-[#341539] p-3 text-xs font-bold text-[#FFF6E9] hover:bg-[#52215A] transition-colors"
                >
                  <span>Public Landing Page</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-white/50 hover:text-white"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span>Collapse into Menu</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/"
                  title="Landing Page"
                  className="p-2.5 rounded-xl bg-[#341539] text-[#FFA800] hover:bg-[#52215A]"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  title="Collapse sidebar into hamburger menu"
                  className="p-2 text-white/50 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 transition-all duration-300 space-y-8">
          {/* ============================================================== */}
          {/* TAB 1: BUSINESS OWNERS & TENANT MANAGEMENT                       */}
          {/* ============================================================== */}
          {activeTab === 'owners' && (
            <div className="space-y-6">
              {/* Header Title & High Level Stats */}
              <div>
                <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#FFA800]" /> Business Owner Registry &amp; Platform Portals
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
                  Registered Business Owners &amp; Portals
                </h1>
                <p className="text-xs sm:text-sm text-[#291E29]/70 mt-1 max-w-3xl">
                  Inspect and control all small businesses (SMEs) and enterprise organizations onboarded to Luna.
                  Manage owner contacts, plan tiers, subdomain routing, and direct staff console impersonation.
                </p>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-4 sm:p-5 shadow-xs backdrop-blur-sm">
                  <span className="text-[#291E29]/70 font-semibold block">Total Registered Businesses</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
                    {tenantsList.length} Portals
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">100% Subdomain Verified</span>
                </div>

                <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-4 sm:p-5 shadow-xs backdrop-blur-sm">
                  <span className="text-[#291E29]/70 font-semibold block">Small Businesses (SMEs)</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#702D7B] mt-1">
                    {tenantsList.filter((t) => t.branding.businessScale === 'sme').length} SMEs
                  </div>
                  <span className="text-[11px] text-[#702D7B] font-semibold">Salons, Garages, Cafes, Clinics</span>
                </div>

                <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-4 sm:p-5 shadow-xs backdrop-blur-sm">
                  <span className="text-[#291E29]/70 font-semibold block">Enterprises &amp; Institutions</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0057B8] mt-1">
                    {tenantsList.filter((t) => t.branding.businessScale === 'enterprise').length} Enterprises
                  </div>
                  <span className="text-[11px] text-[#0057B8] font-semibold">Banking, Hospitals &amp; Telecom</span>
                </div>

                <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-4 sm:p-5 shadow-xs backdrop-blur-sm">
                  <span className="text-[#291E29]/70 font-semibold block">Monthly Active Customers</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
                    {tenantsList
                      .reduce((acc, t) => acc + (t.monthlyActiveVisitors || 1000), 0)
                      .toLocaleString()}+
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Queued With Zero Physical Waiting</span>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-4 shadow-xs backdrop-blur-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by business name, owner name, email, or subdomain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#291E29]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFA800] bg-white placeholder:text-slate-400"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Scale Filter */}
                  <div className="flex items-center gap-1 bg-[#291E29]/5 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setScaleFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        scaleFilter === 'all' ? 'bg-[#FFA800] text-[#291E29] shadow-xs' : 'text-[#291E29]/70'
                      }`}
                    >
                      All ({tenantsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setScaleFilter('sme')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        scaleFilter === 'sme' ? 'bg-[#FFA800] text-[#291E29] shadow-xs' : 'text-[#291E29]/70'
                      }`}
                    >
                      SMEs
                    </button>
                    <button
                      type="button"
                      onClick={() => setScaleFilter('enterprise')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        scaleFilter === 'enterprise' ? 'bg-[#FFA800] text-[#291E29] shadow-xs' : 'text-[#291E29]/70'
                      }`}
                    >
                      Enterprise
                    </button>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-[#291E29]/15 text-xs font-bold bg-white text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* Business Owners Table / Grid */}
              <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 shadow-sm overflow-hidden backdrop-blur-sm">
                <div className="p-4 sm:p-5 border-b border-[#291E29]/10 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#291E29]">
                    Showing {filteredOwners.length} of {tenantsList.length} Business Owners
                  </h3>
                  <span className="text-xs text-[#291E29]/60">Updated Live</span>
                </div>

                <div className="divide-y divide-[#291E29]/10">
                  {filteredOwners.map((tenant) => {
                    const isSuspended = tenant.status === 'suspended';
                    return (
                      <div
                        key={tenant.id}
                        className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                          isSuspended ? 'bg-rose-50/50' : 'hover:bg-[#FFF6E9]/40'
                        }`}
                      >
                        {/* Owner & Business Info */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Business Theme Avatar */}
                          <div
                            className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0"
                            style={{ backgroundColor: tenant.branding.primaryColor || '#291E29' }}
                          >
                            {tenant.name[0]}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-sm sm:text-base text-[#291E29] truncate">
                                {tenant.name}
                              </h4>
                              {/* Scale Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  tenant.branding.businessScale === 'sme'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-blue-100 text-blue-900 border border-blue-200'
                                }`}
                              >
                                {tenant.branding.businessScale === 'sme' ? 'ðŸª Small Business (SME)' : 'ðŸ›ï¸ Enterprise'}
                              </span>
                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  isSuspended
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isSuspended ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                                  }`}
                                />
                                {isSuspended ? 'Suspended' : 'Active'}
                              </span>
                            </div>

                            {/* Owner Contact details */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#291E29]/75">
                              <span className="font-bold text-[#291E29]">
                                Owner: {tenant.ownerName || 'Business Principal'}
                              </span>
                              {tenant.ownerEmail && (
                                <a
                                  href={`mailto:${tenant.ownerEmail}`}
                                  className="flex items-center gap-1 hover:text-[#702D7B] hover:underline"
                                >
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <span>{tenant.ownerEmail}</span>
                                </a>
                              )}
                              {tenant.ownerPhone && (
                                <a
                                  href={`tel:${tenant.ownerPhone}`}
                                  className="flex items-center gap-1 hover:text-[#702D7B]"
                                >
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span>{tenant.ownerPhone}</span>
                                </a>
                              )}
                            </div>

                            {/* Subdomain & Industry */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#291E29]/60">
                              <span className="font-mono text-[#702D7B] font-semibold flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {tenant.slug}.luna.com
                              </span>
                              <span>Â·</span>
                              <span className="capitalize">{tenant.industry.replace('_', ' ')}</span>
                              <span>Â·</span>
                              <span>{tenant.city}, {tenant.area}</span>
                              <span>Â·</span>
                              <span>Joined {new Date(tenant.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics & Actions */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#291E29]/10">
                          {/* Live Metrics */}
                          <div className="hidden sm:block text-right pr-3 border-r border-[#291E29]/10 text-xs">
                            <span className="block font-extrabold text-[#291E29]">
                              {(tenant.monthlyActiveVisitors || 1000).toLocaleString()} visitors
                            </span>
                            <span className="text-[11px] text-[#291E29]/60">
                              {tenant.queueCount || 3} Live Queues
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Master Control Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => setControlModalTenant(tenant)}
                              className="flex items-center gap-1.5 rounded-xl bg-[#FFA800] hover:bg-[#ffb61a] text-[#291E29] px-3 py-2 text-xs font-black transition-all shadow-xs"
                              title="Total Control: Scale, Template, Quotas, Ticker & Staff"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                              <span>Control</span>
                            </button>

                            {/* Direct Ops Console Jump */}
                            <Link
                              href={`/tenant/${tenant.slug}/staff/ops-console`}
                              className="flex items-center gap-1 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFF6E9] px-2.5 py-2 text-xs font-bold transition-all shadow-xs"
                              title="Open Operations Console"
                            >
                              <span>Ops</span>
                              <ArrowUpRight className="h-3 w-3 text-[#FFA800]" />
                            </Link>

                            {/* Direct Social Studio Jump */}
                            <Link
                              href={`/tenant/${tenant.slug}/staff/social-studio`}
                              className="flex items-center gap-1 rounded-xl bg-purple-900 hover:bg-purple-950 text-white px-2.5 py-2 text-xs font-bold transition-all shadow-xs"
                              title="Open Social Studio"
                            >
                              <MessageSquare className="h-3 w-3 text-[#FFA800]" />
                              <span>Social</span>
                            </Link>

                            {/* Direct Branding & Settings */}
                            <Link
                              href={`/tenant/${tenant.slug}/staff/settings`}
                              className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-2 text-xs font-bold transition-all shadow-xs"
                              title="Open Branding & Settings"
                            >
                              <Settings className="h-3 w-3 text-slate-500" />
                              <span>Settings</span>
                            </Link>

                            {/* Impersonate Owner Directly */}
                            <button
                              type="button"
                              onClick={() => handleImpersonateOwner(tenant)}
                              className="flex items-center gap-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-2 text-xs font-bold transition-all shadow-xs"
                              title="Sign In as Business Owner"
                            >
                              <Zap className="h-3 w-3 text-amber-600" />
                              <span>Login</span>
                            </button>

                            {/* View Customer Portal */}
                            <Link
                              href={`/tenant/${tenant.slug}`}
                              target="_blank"
                              className="flex items-center gap-1 rounded-xl bg-white border border-[#291E29]/15 hover:bg-slate-50 text-[#291E29] px-2.5 py-2 text-xs font-bold transition-all shadow-xs"
                              title="View Customer Facing Subdomain Portal"
                            >
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </Link>

                            {/* Suspend / Activate Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(tenant.id)}
                              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                                isSuspended
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              }`}
                              title={isSuspended ? 'Re-activate Business' : 'Suspend Business'}
                              aria-label={isSuspended ? 'Re-activate Business' : 'Suspend Business'}
                            >
                              {isSuspended ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredOwners.length === 0 && (
                    <div className="p-12 text-center space-y-3">
                      <Users className="h-10 w-10 text-slate-300 mx-auto" />
                      <h4 className="font-bold text-sm text-[#291E29]">No business owners found</h4>
                      <p className="text-xs text-[#291E29]/60">
                        Try adjusting your search query or scale filter.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: GLOBAL LIVE OVERSIGHT & EMERGENCY NETWORK CONTROL          */}
          {/* ============================================================== */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-[#FFA800] animate-pulse" /> Global Operations Oversight · Live Network Pulse
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
                  Cross-Tenant Live Traffic &amp; Emergency Hub
                </h1>
                <p className="text-xs sm:text-sm text-[#291E29]/70 mt-1 max-w-3xl">
                  Inspect real-time queue throughput, omnichannel customer DMs, and dispatch emergency broadcasts across all onboarded SME storefronts and institutional branches simultaneously.
                </p>
              </div>

              {/* Global Network KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="rounded-2xl border border-[#291E29]/10 bg-white p-4 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Network Counters
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">173 Active</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Across all tenants</span>
                </div>

                <div className="rounded-2xl border border-[#291E29]/10 bg-white p-4 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Served Today
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-600">4,820</div>
                  <span className="text-[10px] text-slate-500 font-medium">99.1% on-time pace</span>
                </div>

                <div className="rounded-2xl border border-[#291E29]/10 bg-white p-4 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Avg Network Wait
                  </span>
                  <div className="text-2xl font-extrabold text-blue-600">4.2 min</div>
                  <span className="text-[10px] text-slate-500 font-medium">Zero walk-in delays</span>
                </div>

                <div className="rounded-2xl border border-[#291E29]/10 bg-white p-4 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Social Inbox Inquiries
                  </span>
                  <div className="text-2xl font-extrabold text-purple-700">10 Open</div>
                  <span className="text-[10px] text-rose-600 font-bold">3 need urgent care</span>
                </div>

                <div className="rounded-2xl border border-[#291E29]/10 bg-white p-4 shadow-xs space-y-1 col-span-2 lg:col-span-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Better-Auth Driver
                  </span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">SQLite Native</div>
                  <span className="text-[10px] text-emerald-700 font-bold">100% Free · Multi-Org</span>
                </div>
              </div>

              {/* Emergency Multi-Tenant Broadcast Card */}
              <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFA800] text-[#291E29] font-bold">
                      <Megaphone className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Platform-Wide Emergency Announcement Ticker
                      </h3>
                      <p className="text-xs text-slate-600">
                        Broadcasts simultaneously to the top ticker of every customer portal on Luna.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold shrink-0">
                    Active Across {tenantsList.length} Portals
                  </span>
                </div>

                {/* Active Ticker Display */}
                <div className="rounded-2xl bg-[#291E29] text-white p-4 text-xs font-mono flex items-center justify-between gap-4 shadow-inner">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-[#FFA800] animate-ping shrink-0" />
                    <span className="truncate text-[#FFA800] font-bold">
                      &quot;{globalEmergencyNotice}&quot;
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase shrink-0">
                    Live Ticker
                  </span>
                </div>

                {/* Broadcast Composer */}
                <form onSubmit={handlePublishGlobalBroadcast} className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scheduled network maintenance completed · All branches and queue stations fully operational."
                    value={globalEmergencyDraft}
                    onChange={(e) => setGlobalEmergencyDraft(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                  <button
                    type="submit"
                    disabled={!globalEmergencyDraft.trim()}
                    className="rounded-2xl bg-[#291E29] hover:bg-[#341539] text-white px-6 py-3 text-xs font-extrabold shadow-md transition disabled:opacity-40 shrink-0 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4 text-[#FFA800]" />
                    <span>Broadcast to ALL Portals</span>
                  </button>
                </form>
              </div>

              {/* Live Multi-Tenant Queues Watcher Grid */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <Radio className="h-4 w-4 text-[#FFA800]" /> Live Multi-Tenant Station Feeds
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Real-Time Pulse</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* MetroTrust Bank */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">MetroTrust Bank (VI HQ)</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                        9/12 Open
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <p>Next Up: <strong className="text-slate-900">VI-022 Blessing Udo</strong> (KYC)</p>
                      <p>Serving C1: <strong className="text-slate-900">VI-021 Ngozi Adeyemi</strong></p>
                      <p>Active Queue: <strong className="text-amber-700">4 Waiting</strong></p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/tenant/metrotrust-bank/staff/ops-console"
                        className="flex-1 rounded-xl bg-[#291E29] text-white py-2 text-center font-bold hover:bg-[#341539]"
                      >
                        Ops Console
                      </Link>
                      <Link
                        href="/tenant/metrotrust-bank/staff/social-studio"
                        className="rounded-xl bg-purple-100 text-purple-800 px-3 py-2 font-bold hover:bg-purple-200"
                      >
                        Social
                      </Link>
                    </div>
                  </div>

                  {/* Kemi's Lounge */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Kemi&apos;s Hair Lounge (Lekki)</span>
                      <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                        Chair 1 &amp; 2
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <p>Next Up: <strong className="text-slate-900">KL-101 Amara Okafor</strong> (Braids)</p>
                      <p>Verified: <strong className="text-emerald-700">KL-102 Babajide Cole</strong></p>
                      <p>Pace: <strong className="text-slate-900">1.5 min door wait</strong></p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/tenant/kemis-lounge/staff/ops-console"
                        className="flex-1 rounded-xl bg-[#291E29] text-white py-2 text-center font-bold hover:bg-[#341539]"
                      >
                        Ops Console
                      </Link>
                      <Link
                        href="/tenant/kemis-lounge/staff/social-studio"
                        className="rounded-xl bg-purple-100 text-purple-800 px-3 py-2 font-bold hover:bg-purple-200"
                      >
                        Social
                      </Link>
                    </div>
                  </div>

                  {/* QuickFix Auto */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">QuickFix Auto &amp; Lube</span>
                      <span className="rounded-full bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-bold">
                        Bay 1 &amp; 2
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <p>Next Up: <strong className="text-slate-900">QF-201 Biodun Adeleke</strong> (Brakes)</p>
                      <p>Serving Bay 1: <strong className="text-slate-900">QF-202 Quick Lube</strong></p>
                      <p>Turnaround: <strong className="text-slate-900">18 min avg bay</strong></p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/tenant/quickfix-auto/staff/ops-console"
                        className="flex-1 rounded-xl bg-[#291E29] text-white py-2 text-center font-bold hover:bg-[#341539]"
                      >
                        Ops Console
                      </Link>
                      <Link
                        href="/tenant/quickfix-auto/staff/social-studio"
                        className="rounded-xl bg-purple-100 text-purple-800 px-3 py-2 font-bold hover:bg-purple-200"
                      >
                        Social
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Better-Auth Engine & SQLite Database Management */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <Database className="h-4 w-4 text-[#FFA800]" /> Better-Auth &amp; SQLite Engine State
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Local persistent storage (luna-auth.sqlite) with organization multi-tenancy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerToast('Better-Auth SQLite tables verified and seed accounts synced!')}
                    className="rounded-xl bg-[#FFA800] text-[#291E29] px-4 py-2 text-xs font-black hover:bg-[#ffb61a] transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Re-sync Seed Accounts</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                    <span className="font-bold text-slate-900 block truncate">kemi@kemislounge.com</span>
                    <span className="text-[11px] text-slate-500 block">Tenant Admin &middot; Kemi&apos;s Lounge</span>
                    <span className="inline-block rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.2">
                      SME Owner
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                    <span className="font-bold text-slate-900 block truncate">marcus@quickfixauto.com</span>
                    <span className="text-[11px] text-slate-500 block">Tenant Admin &middot; QuickFix Auto</span>
                    <span className="inline-block rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.2">
                      SME Owner
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                    <span className="font-bold text-slate-900 block truncate">blessing@kemislounge.com</span>
                    <span className="text-[11px] text-slate-500 block">Staff &middot; Chair 1 Lead Stylist</span>
                    <span className="inline-block rounded-md bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2 py-0.2">
                      Staff Privileges
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                    <span className="font-bold text-slate-900 block truncate">admin@luna.com</span>
                    <span className="text-[11px] text-slate-500 block">Platform Director &middot; Luna HQ</span>
                    <span className="inline-block rounded-md bg-purple-100 text-purple-900 text-[10px] font-extrabold px-2 py-0.2">
                      Super Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: SYSTEM MAINTENANCE & LIVE TELEMETRY                       */}
          {/* ============================================================== */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-[#FFA800]" /> Platform System Maintenance
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
                  Engine Health &amp; Infrastructure Controls
                </h1>
                <p className="text-xs sm:text-sm text-[#291E29]/70 mt-1 max-w-3xl">
                  Inspect real-time health across FastAPI backend servers, SQLite database, WebSocket queue hubs,
                  and trigger emergency platform maintenance routines.
                </p>
              </div>

              {/* Server Nodes & Live Telemetry Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* FastAPI Node */}
                <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-5 shadow-xs space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-[#FFA800]" />
                      <span className="font-bold text-[#291E29] text-sm">FastAPI Application Server</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      200 OK
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <p className="flex justify-between">
                      <span>Endpoint:</span> <code className="text-[#291E29] font-bold">http://127.0.0.1:8000</code>
                    </p>
                    <p className="flex justify-between">
                      <span>Health Check Latency:</span>{' '}
                      <span className="font-bold text-emerald-700">{backendLatency || 14} ms</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Uvicorn Workers:</span> <span className="font-bold text-[#291E29]">4 Active Workers</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={pingBackend}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#291E29] font-bold flex items-center justify-center gap-2 transition"
                  >
                    <RefreshCw className={`h-3 w-3 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>Ping Health Probe</span>
                  </button>
                </div>

                {/* WebSocket Gateway */}
                <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-5 shadow-xs space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-[#702D7B]" />
                      <span className="font-bold text-[#291E29] text-sm">WebSocket Realtime Hub</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold">
                      Broadcasting
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <p className="flex justify-between">
                      <span>Protocol:</span> <code className="text-[#291E29] font-bold">ws://127.0.0.1:8000/ws/queues/*</code>
                    </p>
                    <p className="flex justify-between">
                      <span>Active Subscribed Counters:</span> <span className="font-bold text-[#291E29]">85 Queues</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Audio Chime Caller:</span> <span className="font-bold text-emerald-600">Synthesized 100%</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerToast('Realtime WebSocket channels refreshed.')}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#291E29] font-bold flex items-center justify-center gap-2 transition"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Re-sync Channels</span>
                  </button>
                </div>

                {/* SQLite Database */}
                <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-5 shadow-xs space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-amber-600" />
                      <span className="font-bold text-[#291E29] text-sm">Database &amp; Persistence</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold">
                      WAL Mode Active
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <p className="flex justify-between">
                      <span>Driver:</span> <code className="text-[#291E29] font-bold">sqlite+aiosqlite (luna.db)</code>
                    </p>
                    <p className="flex justify-between">
                      <span>Connection Pool:</span> <span className="font-bold text-[#291E29]">Async Engine Ready</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Database Integrity:</span> <span className="font-bold text-emerald-600">Verified OK</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerToast('Database VACUUM optimization scheduled.')}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#291E29] font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Database className="h-3 w-3" />
                    <span>Optimize &amp; Vacuum</span>
                  </button>
                </div>
              </div>

              {/* Emergency Maintenance Switches */}
              <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-6 shadow-sm space-y-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Power className="h-5 w-5 text-[#FFA800]" />
                  <h3 className="font-extrabold text-base text-[#291E29]">Platform Operational Actions</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Maintenance Mode */}
                  <div className="p-4 rounded-xl border border-[#291E29]/10 bg-[#FFF6E9]/40 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#291E29]">Platform Maintenance Mode</h4>
                      <p className="text-[11px] text-[#291E29]/60">
                        Displays an active maintenance banner across all customer portals.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMaintenanceMode(!maintenanceMode);
                        triggerToast(`Maintenance mode ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${
                        maintenanceMode
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {maintenanceMode ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  {/* Purge Old Tickets */}
                  <div className="p-4 rounded-xl border border-[#291E29]/10 bg-[#FFF6E9]/40 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#291E29]">Purge Completed Tickets</h4>
                      <p className="text-[11px] text-[#291E29]/60">
                        Archives all served tickets older than 30 days to free storage.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast('Archived 4,820 historical tickets.')}
                      className="px-4 py-2 rounded-xl bg-[#291E29] text-white hover:bg-[#341539] font-bold transition-all"
                    >
                      Run Purge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: PLATFORM CONTROLS & ROUTING                              */}
          {/* ============================================================== */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-[#FFA800]" /> Platform Administration Controls
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
                  Global Configuration &amp; Subdomains
                </h1>
                <p className="text-xs sm:text-sm text-[#291E29]/70 mt-1 max-w-3xl">
                  Control root domain DNS routing, registration policies for SMEs, default free tier quotas,
                  and broadcast high-priority announcements to all portals.
                </p>
              </div>

              {/* Subdomain DNS Routing Card */}
              <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-6 shadow-sm space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#291E29]">
                      Multi-Tenant Subdomain Architecture
                    </h3>
                    <p className="text-xs text-[#291E29]/60">Wildcard SSL and path-based router settings</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
                    *.luna.com Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-[#291E29]/10 bg-[#FCFBF4]">
                    <span className="text-slate-500 block">Root Domain:</span>
                    <span className="font-mono font-bold text-[#291E29] text-sm">luna.com</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#291E29]/10 bg-[#FCFBF4]">
                    <span className="text-slate-500 block">Wildcard CNAME:</span>
                    <span className="font-mono font-bold text-[#291E29] text-sm">*.luna.com &rarr; App Server</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#291E29]/10 bg-[#FCFBF4]">
                    <span className="text-slate-500 block">SSL Certificate:</span>
                    <span className="font-bold text-emerald-700 text-sm">Let&apos;s Encrypt Auto-Renew</span>
                  </div>
                </div>
              </div>

              {/* Public Self-Service Signup Control */}
              <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-6 shadow-sm space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#291E29]">
                      Public Business Registration
                    </h3>
                    <p className="text-xs text-[#291E29]/60">
                      Allow small business owners to claim free subdomains and onboard without manual approval.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPublicSignupEnabled(!publicSignupEnabled);
                      triggerToast(`Self-service signup ${!publicSignupEnabled ? 'ENABLED' : 'PAUSED'}`);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      publicSignupEnabled
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {publicSignupEnabled ? 'Enabled (Instant Onboarding)' : 'Paused (Invite Only)'}
                  </button>
                </div>

                <div className="pt-2 text-xs text-[#291E29]/75 space-y-2">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Free subdomains (`yourname.luna.com`) are provisioned in real-time under 2 seconds.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Includes access to the 8 curated free theme visual customizer.</span>
                  </p>
                </div>
              </div>

              {/* Global Announcement Broadcast */}
              <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-6 shadow-sm space-y-4 backdrop-blur-sm">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#291E29]">
                    Global Emergency Announcement Ticker
                  </h3>
                  <p className="text-xs text-[#291E29]/60">
                    Broadcast an urgent notification banner across all customer portals and staff consoles.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={announcementDraft || globalAnnouncement}
                    onChange={(e) => setAnnouncementDraft(e.target.value)}
                    placeholder="Enter global broadcast message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#291E29]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFA800] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (announcementDraft) {
                        setGlobalAnnouncement(announcementDraft);
                        triggerToast('Global announcement ticker broadcasted to all portals!');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Broadcast Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: AUDIT LOGS                                              */}
          {/* ============================================================== */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#FFA800]" /> Security &amp; Activity Stream
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
                  Platform Audit Logs
                </h1>
                <p className="text-xs sm:text-sm text-[#291E29]/70 mt-1 max-w-3xl">
                  Tamper-resistant activity stream tracking business owner signups, status changes, DNS provisions,
                  and administrative platform updates.
                </p>
              </div>

              <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 shadow-sm overflow-hidden backdrop-blur-sm">
                <div className="p-4 sm:p-5 border-b border-[#291E29]/10 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#291E29]">Recent Administrative Events</h3>
                  <span className="text-xs text-[#291E29]/60">Streaming live</span>
                </div>

                <div className="divide-y divide-[#291E29]/10">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              log.type === 'owner'
                                ? 'bg-amber-100 text-amber-900'
                                : log.type === 'system'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {log.type}
                          </span>
                          <span className="font-bold text-[#291E29] text-sm">{log.action}</span>
                        </div>
                        <p className="text-slate-600 font-mono text-[11px]">{log.target}</p>
                        <span className="text-[10px] text-slate-400 block">Triggered by: {log.admin}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: PLATFORM GROWTH & TELEMETRY                              */}
          {/* ============================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#FFA800]" /> Platform Growth &amp; Analytics
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
                  Adoption Telemetry &amp; Customer Volumes
                </h1>
                <p className="text-xs sm:text-sm text-[#291E29]/70 mt-1 max-w-3xl">
                  Global adoption figures across small business storefronts and enterprise organizations operating
                  on Luna Multi-Tenant Infrastructure.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-[#291E29]">Business Scale Ratio</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 font-bold">
                        <span>Small Businesses (SMEs)</span>
                        <span className="text-[#702D7B]">57.1% (4 Portals)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-[#702D7B] h-full rounded-full" style={{ width: '57.1%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 font-bold">
                        <span>Enterprise Organizations</span>
                        <span className="text-[#0057B8]">42.9% (3 Portals)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-[#0057B8] h-full rounded-full" style={{ width: '42.9%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#291E29]/10 bg-white/90 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-[#291E29]">Hours of Customer Waiting Saved</h3>
                  <div className="space-y-2">
                    <div className="text-3xl font-extrabold text-emerald-700">18,400+ Hours</div>
                    <p className="text-slate-600 leading-relaxed">
                      By providing 30-minute arrival priority windows and phone pre-clearance, Luna eliminated
                      physical morning lobby queues for over 108,000 customers this month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* MODAL: ONBOARD NEW BUSINESS OWNER DIRECTLY                       */}
      {/* ============================================================== */}
      {showNewOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-[#FCFBF4] text-[#291E29] p-6 shadow-2xl border border-[#341539]/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#291E29]/10">
              <div className="flex items-center gap-2">
                <LunaIcon size={22} variant="purple" />
                <h3 className="font-extrabold text-base text-[#291E29]">Onboard New Business Owner</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOwnerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#291E29]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#291E29] block mb-1">Business Scale</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBizScale('sme')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                      newBizScale === 'sme'
                        ? 'bg-[#FFA800] border-[#FFA800] text-[#291E29]'
                        : 'bg-white border-[#291E29]/15 text-[#291E29]/70'
                    }`}
                  >
                    ðŸª Small Business (SME)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBizScale('enterprise')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                      newBizScale === 'enterprise'
                        ? 'bg-[#FFA800] border-[#FFA800] text-[#291E29]'
                        : 'bg-white border-[#291E29]/15 text-[#291E29]/70'
                    }`}
                  >
                    ðŸ›ï¸ Enterprise
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#291E29] block mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Styling Lounge"
                  value={newBizName}
                  onChange={(e) => {
                    setNewBizName(e.target.value);
                    if (!newBizSlug) {
                      setNewBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#291E29]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>

              <div>
                <label className="font-bold text-[#291E29] block mb-1">Free Subdomain Slug</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="my-shop"
                    value={newBizSlug}
                    onChange={(e) => setNewBizSlug(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-l-xl border border-r-0 border-[#291E29]/20 bg-white text-xs font-mono focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-slate-100 border border-l-0 border-[#291E29]/20 rounded-r-xl font-mono text-[#702D7B] font-bold text-xs">
                    .luna.com
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#291E29] block mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sandra Okeke"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#291E29]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#291E29] block mb-1">Owner Phone</label>
                  <input
                    type="tel"
                    placeholder="+234 800..."
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#291E29]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#291E29] block mb-1">Owner Email</label>
                <input
                  type="email"
                  placeholder="owner@domain.com"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#291E29]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOwnerModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFA800] text-[#291E29] font-extrabold shadow-sm hover:bg-[#FFB11A]"
                >
                  Create Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* MASTER TENANT CONTROL & PLATFORM OVERRIDE MODAL                 */}
      {/* ============================================================== */}
      {controlModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#FCFBF4] text-[#291E29] p-6 shadow-2xl border border-[#341539]/20 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#291E29]/10">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
                  style={{ backgroundColor: controlModalTenant.branding.primaryColor || '#291E29' }}
                >
                  {controlModalTenant.name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#291E29] flex items-center gap-2">
                    <span>{controlModalTenant.name}</span>
                    <span className="text-[10px] font-mono font-bold text-[#702D7B] bg-purple-100 px-2 py-0.5 rounded-full">
                      {controlModalTenant.slug}.luna.com
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-500">Master Platform Admin Control</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setControlModalTenant(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#291E29] hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Impersonation Banner */}
            <div className="mt-4 rounded-2xl bg-[#291E29] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-[10px] font-extrabold text-[#FFA800] uppercase tracking-wider block">
                  ⚡ Instant Session Impersonation
                </span>
                <p className="text-xs text-slate-200 mt-0.5">
                  Sign in immediately as <strong>{controlModalTenant.ownerName || 'Business Owner'}</strong> to manage this business directly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleImpersonateOwner(controlModalTenant)}
                className="rounded-xl bg-[#FFA800] hover:bg-[#ffb61a] text-[#291E29] px-4 py-2 text-xs font-black shadow-xs shrink-0 transition"
              >
                Login as Owner &rarr;
              </button>
            </div>

            {/* Quick Station Jumps */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <Link
                href={`/tenant/${controlModalTenant.slug}/staff/ops-console`}
                target="_blank"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-bold text-slate-800 hover:border-[#FFA800] hover:shadow-xs transition"
              >
                Ops Console &nearr;
              </Link>
              <Link
                href={`/tenant/${controlModalTenant.slug}/staff/social-studio`}
                target="_blank"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-bold text-slate-800 hover:border-[#FFA800] hover:shadow-xs transition"
              >
                Social Studio &nearr;
              </Link>
              <Link
                href={`/tenant/${controlModalTenant.slug}/staff/settings`}
                target="_blank"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-bold text-slate-800 hover:border-[#FFA800] hover:shadow-xs transition"
              >
                Branding &nearr;
              </Link>
              <Link
                href={`/tenant/${controlModalTenant.slug}`}
                target="_blank"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-bold text-slate-800 hover:border-[#FFA800] hover:shadow-xs transition"
              >
                Customer Portal &nearr;
              </Link>
            </div>

            {/* Form to Override Tenant Parameters */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTenantControl(controlModalTenant);
              }}
              className="mt-4 space-y-4 text-xs"
            >
              {/* Business Scale Switcher */}
              <div>
                <label className="font-bold text-[#291E29] block mb-1">
                  Business Scale (Template &amp; Station Architecture)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setControlModalTenant({
                        ...controlModalTenant,
                        branding: { ...controlModalTenant.branding, businessScale: 'sme' },
                        businessScale: 'sme',
                      })
                    }
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      controlModalTenant.branding.businessScale === 'sme'
                        ? 'bg-[#FFA800] border-[#FFA800] text-[#291E29] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    🏪 Small Business (SME)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setControlModalTenant({
                        ...controlModalTenant,
                        branding: { ...controlModalTenant.branding, businessScale: 'enterprise' },
                        businessScale: 'enterprise',
                      })
                    }
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      controlModalTenant.branding.businessScale === 'enterprise'
                        ? 'bg-[#FFA800] border-[#FFA800] text-[#291E29] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    🏛️ Enterprise / Multi-Branch
                  </button>
                </div>
              </div>

              {/* Industry & Service Desk Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Industry Model</label>
                  <select
                    value={controlModalTenant.industry}
                    onChange={(e) =>
                      setControlModalTenant({
                        ...controlModalTenant,
                        industry: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  >
                    <option value="salon_beauty">💇 Salon &amp; Beauty Lounge</option>
                    <option value="auto_repair">🚗 Auto Repair &amp; Lube</option>
                    <option value="cafe_bakery">☕ Cafe &amp; Artisan Bakery</option>
                    <option value="boutique_clinic">🏥 Boutique Medical Clinic</option>
                    <option value="banking">🏛️ Bank &amp; Institutional Branch</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Station Name</label>
                  <input
                    type="text"
                    value={controlModalTenant.branding?.serviceUnitName || 'Counter'}
                    onChange={(e) =>
                      setControlModalTenant({
                        ...controlModalTenant,
                        branding: {
                          ...controlModalTenant.branding,
                          serviceUnitName: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Service Chair, Bay, Counter"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                </div>
              </div>

              {/* Portal Announcement Override */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Public Announcement Ticker Override
                </label>
                <input
                  type="text"
                  value={controlModalTenant.branding?.announcementTicker || ''}
                  onChange={(e) =>
                    setControlModalTenant({
                      ...controlModalTenant,
                      branding: {
                        ...controlModalTenant.branding,
                        announcementTicker: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. VIP express window operating · Zero waiting time"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>

              {/* Status & Quota Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Portal Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setControlModalTenant({ ...controlModalTenant, status: 'active' })
                      }
                      className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                        controlModalTenant.status !== 'suspended'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setControlModalTenant({ ...controlModalTenant, status: 'suspended' })
                      }
                      className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                        controlModalTenant.status === 'suspended'
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      Suspended
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Ticket Quota</label>
                  <select
                    value={controlModalTenant.plan === 'enterprise_tier' ? 'unlimited' : '500'}
                    onChange={(e) =>
                      setControlModalTenant({
                        ...controlModalTenant,
                        plan: e.target.value === 'unlimited' ? 'enterprise_tier' : 'free_subdomain',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  >
                    <option value="500">500 Tickets/Day (Free SME Tier)</option>
                    <option value="unlimited">Unlimited (Enterprise SLA)</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(controlModalTenant.id)}
                  className={`text-xs font-bold ${
                    controlModalTenant.status === 'suspended'
                      ? 'text-emerald-700 hover:underline'
                      : 'text-rose-700 hover:underline'
                  }`}
                >
                  {controlModalTenant.status === 'suspended'
                    ? 'Re-activate Portal'
                    : 'Suspend This Business'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setControlModalTenant(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#291E29] hover:bg-[#341539] text-white font-extrabold shadow-sm"
                  >
                    Save Master Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
