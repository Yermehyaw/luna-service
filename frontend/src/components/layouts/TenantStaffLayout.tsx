'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTenant } from '../../lib/tenant-context';
import { useAuth } from '../../lib/auth';
import { LunaLogo } from '../shared/LumaMark';
import { getTenantStaff, DEFAULT_TENANT_STAFF } from '../../mock/staff';
import { StaffAccount, StaffPrivilege } from '../../types/user';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Settings,
  Share2,
  BarChart2,
  Briefcase,
  ExternalLink,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Lock,
  UserCheck,
  User,
  ArrowRightLeft,
  Check,
  MessageSquare,
} from 'lucide-react';

export function TenantStaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant } = useTenant();
  const { user, loginAsStaffMember, hasPrivilege } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSlim, setIsSlim] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchAccountOpen, setSwitchAccountOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      setCurrentTab(p.get('tab'));
    }
  }, [pathname]);

  // Load staff list for this tenant
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);

  useEffect(() => {
    if (tenant?.slug) {
      setStaffList(getTenantStaff(tenant.slug));
    }
  }, [tenant?.slug]);

  // If no user is logged in, auto-initialize as the tenant business owner
  useEffect(() => {
    if (!user && tenant?.slug) {
      const staff = getTenantStaff(tenant.slug);
      const owner = staff.find((s) => s.role === 'tenant_admin') || staff[0];
      if (owner) {
        loginAsStaffMember(owner);
      }
    }
  }, [user, tenant?.slug, loginAsStaffMember]);

  const isOwner = user?.role === 'tenant_admin' || user?.role === 'super_admin';
  const basePath = `/tenant/${tenant.slug}/staff`;

  const navItems: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    privilege?: StaffPrivilege;
    adminOnly?: boolean;
  }[] = [
    { name: 'Ops Console', href: `${basePath}/ops-console`, icon: LayoutDashboard, privilege: 'ops_console' },
    { name: 'Social Studio', href: `${basePath}/social-studio`, icon: MessageSquare, privilege: 'social_studio' },
    { name: 'Live Broadcasts', href: `${basePath}/ops-console?tab=broadcast`, icon: Share2, privilege: 'ops_console' },
    { name: 'Customers', href: `${basePath}/customers`, icon: Users, privilege: 'customer_directory' },
    { name: 'Branches', href: `${basePath}/branches`, icon: GitBranch, privilege: 'manage_branches' },
    { name: 'Services', href: `${basePath}/services`, icon: Briefcase, privilege: 'manage_services' },
    { name: 'Analytics', href: `${basePath}/analytics`, icon: BarChart2, privilege: 'view_analytics' },
    { name: 'Branding & Settings', href: `${basePath}/settings`, icon: Settings, adminOnly: true },
  ];

  // Primary items for mobile bottom bar
  const bottomBarItems = [
    { name: 'Ops', href: `${basePath}/ops-console`, icon: LayoutDashboard },
    { name: 'Social', href: `${basePath}/social-studio`, icon: MessageSquare },
    { name: 'Broadcast', href: `${basePath}/ops-console?tab=broadcast`, icon: Share2 },
    { name: 'Services', href: `${basePath}/services`, icon: Briefcase },
    isOwner
      ? { name: 'Settings', href: `${basePath}/settings`, icon: Settings }
      : { name: 'Clients', href: `${basePath}/customers`, icon: Users },
  ];

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setIsSlim((prev) => !prev);
    }
  };

  const handleSwitchUser = (staff: StaffAccount) => {
    loginAsStaffMember(staff);
    setSwitchAccountOpen(false);
    // If switched to staff and currently on admin-only settings page, redirect to ops-console
    if (staff.role === 'staff' && pathname.includes('/staff/settings')) {
      router.push(`${basePath}/ops-console`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF4] flex flex-col font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
      {/* Universal Sticky Top Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#341539] bg-[#291E29] px-3 sm:px-4 py-2.5 sm:py-3 text-[#FFF6E9] shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-[#FFA800] hover:text-[#291E29] active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800] shrink-0"
            aria-label="Toggle navigation sidebar"
            title={sidebarOpen ? 'Collapse sidebar into hamburger menu' : 'Expand navigation sidebar'}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <LunaLogo variant="light" size={26} />
          </Link>

          <div className="border-l border-white/20 pl-2.5 sm:pl-3 min-w-0">
            <span className="block text-[9px] font-extrabold uppercase tracking-widest text-[#FFA800] truncate">
              {tenant.businessScale === 'sme' ? 'SME Storefront' : 'Staff Console'}
            </span>
            <span className="block text-xs font-extrabold text-white truncate max-w-[120px] sm:max-w-xs">
              {tenant.name}
            </span>
          </div>
        </div>

        {/* Right Header: Active Logged In User & Quick Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active User Pill with Click-to-Switch */}
          <button
            type="button"
            onClick={() => setSwitchAccountOpen(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-left transition active:scale-95 group"
            title="Click to switch between Business Owner and Staff accounts"
          >
            <div
              className="h-7 w-7 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-xs"
              style={{ backgroundColor: user?.avatarColor || (isOwner ? '#831843' : '#D97706') }}
            >
              {isOwner ? '👑' : '👔'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[11px] font-extrabold text-white leading-tight flex items-center gap-1">
                <span className="truncate max-w-[100px]">{user?.name || 'User'}</span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                    isOwner
                      ? 'bg-amber-400/20 text-[#FFA800] border-amber-400/30'
                      : 'bg-blue-400/20 text-blue-300 border-blue-400/30'
                  }`}
                >
                  {isOwner ? 'Owner' : 'Staff'}
                </span>
              </div>
              <div className="text-[9px] text-[#FFA800]/80 flex items-center gap-0.5 group-hover:text-white transition">
                <span>Switch Role</span>
                <ArrowRightLeft className="h-2.5 w-2.5 ml-0.5" />
              </div>
            </div>
          </button>

          <Link
            href={`/tenant/${tenant.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-[#341539] hover:bg-[#52215A] px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-[#FFA800] transition-colors shadow-sm shrink-0"
          >
            <span className="hidden sm:inline">Storefront</span>
            <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Body with Collapsible Sidebar and Main Content */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Mobile Slide-Over Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-4/5 max-w-xs bg-[#291E29] text-[#FFF6E9] p-5 flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#341539]">
                <div className="flex items-center gap-2">
                  <LunaLogo variant="light" size={24} />
                  <span className="text-xs font-bold text-white truncate">{tenant.name}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
                  aria-label="Close navigation drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Active User Card in Drawer */}
              <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-[#FFA800]/20 flex items-center justify-center text-xs">
                    {isOwner ? '👑' : '👔'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-[#FFA800] font-bold">
                      {isOwner ? 'Business Owner' : 'Staff Member'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSwitchAccountOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 text-white text-[10px] font-bold"
                >
                  Switch
                </button>
              </div>

              <nav className="mt-4 flex-1 space-y-1.5 text-xs font-semibold overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isBroadcastItem = item.name.includes('Broadcast');
                  const isOpsItem = item.name === 'Ops Console' || item.name === 'Ops';
                  const isCurrentBroadcast = currentTab === 'broadcast';
                  const isActive = isBroadcastItem
                    ? pathname.includes('/ops-console') && isCurrentBroadcast
                    : isOpsItem
                    ? pathname.includes('/ops-console') && !isCurrentBroadcast
                    : pathname === item.href;
                  const hasAccess = item.adminOnly ? isOwner : item.privilege ? hasPrivilege(item.privilege) : true;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition-all min-h-[44px] ${
                        isActive
                          ? 'bg-[#FFA800] text-[#291E29] font-extrabold shadow-md shadow-[#FFA800]/25'
                          : 'text-[#FFF6E9]/80 hover:bg-[#341539] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {!hasAccess && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-amber-300 border border-white/10 flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          <span>{item.adminOnly ? 'Admin Only' : 'No Access'}</span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-[#341539] mt-auto">
                <Link
                  href={`/tenant/${tenant.slug}`}
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#341539] p-3 text-xs font-bold text-[#FFF6E9] hover:bg-[#52215A]"
                >
                  <span>View Customer Portal</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-[#341539] bg-[#291E29] text-[#FFF6E9] shadow-xl shrink-0 transition-all duration-300 ease-in-out ${
            isSlim ? 'w-20 p-3 items-center' : 'w-64 p-4'
          }`}
        >
          {/* Sidebar Top Header & Collapse Controls */}
          <div className="w-full pb-3 border-b border-[#341539]/80 flex items-center justify-between">
            {!isSlim ? (
              <>
                <div className="truncate">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFA800] block">
                    {tenant.businessScale === 'sme' ? 'SME Boutique' : 'Enterprise'} Console
                  </span>
                  <h2 className="text-sm font-extrabold text-white truncate mt-0.5">{tenant.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSlim(true)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-[#FFA800] hover:bg-white/10 transition-colors"
                  title="Collapse sidebar to icon rail"
                  aria-label="Collapse sidebar to icon rail"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsSlim(false)}
                  className="p-2 rounded-xl bg-white/10 text-[#FFA800] hover:bg-[#FFA800] hover:text-[#291E29] transition-all group relative shadow-xs"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#291E29] text-white text-xs font-bold rounded-lg shadow-2xl border border-white/15 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Expand Sidebar
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Account Role Card inside Sidebar */}
          {!isSlim ? (
            <div className="mt-3 w-full p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                  style={{ backgroundColor: user?.avatarColor || (isOwner ? '#831843' : '#D97706') }}
                >
                  {isOwner ? '👑' : '👔'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-white truncate">{user?.name || 'Active User'}</p>
                  <p className="text-[10px] text-[#FFA800] font-bold truncate">
                    {isOwner ? 'Business Owner' : user?.designation || 'Staff Member'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSwitchAccountOpen(true)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-[#FFA800] hover:text-[#291E29] transition text-white"
                title="Switch Account / Role"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="mt-3 w-full flex justify-center">
              <button
                type="button"
                onClick={() => setSwitchAccountOpen(true)}
                className="group relative h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shadow-xs transition hover:scale-105 active:scale-95"
                style={{ backgroundColor: user?.avatarColor || (isOwner ? '#831843' : '#D97706') }}
                title={`Switch User (${user?.name})`}
              >
                <span>{isOwner ? '👑' : '👔'}</span>
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#291E29] text-white text-xs font-bold rounded-lg shadow-2xl border border-white/15 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <span>{user?.name} ({isOwner ? 'Owner' : 'Staff'})</span>
                </div>
              </button>
            </div>
          )}

          {/* Nav Items */}
          <nav className="mt-4 flex-1 w-full space-y-1.5 text-xs font-semibold overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isBroadcastItem = item.name.includes('Broadcast');
                  const isOpsItem = item.name === 'Ops Console' || item.name === 'Ops';
                  const isCurrentBroadcast = currentTab === 'broadcast';
                  const isActive = isBroadcastItem
                    ? pathname.includes('/ops-console') && isCurrentBroadcast
                    : isOpsItem
                    ? pathname.includes('/ops-console') && !isCurrentBroadcast
                    : pathname === item.href;
              const hasAccess = item.adminOnly ? isOwner : item.privilege ? hasPrivilege(item.privilege) : true;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center transition-all ${
                    isSlim ? 'justify-center p-2.5 rounded-xl' : 'justify-between px-3 py-2.5 rounded-xl'
                  } ${
                    isActive
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold shadow-md shadow-[#FFA800]/25'
                      : 'text-[#FFF6E9]/70 hover:bg-[#341539] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isSlim && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isSlim && !hasAccess && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-amber-300 border border-white/10 flex items-center gap-1 shrink-0">
                      <Lock className="h-2.5 w-2.5" />
                      <span>{item.adminOnly ? 'Admin' : 'Lock'}</span>
                    </span>
                  )}

                  {/* Floating Tooltip in Slim Mode */}
                  {isSlim && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#291E29] text-white text-xs font-bold rounded-lg shadow-2xl border border-white/15 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {!hasAccess && (
                        <span className="text-[9px] text-[#FFA800] bg-white/10 px-1 py-0.2 rounded border border-white/10">
                          {item.adminOnly ? 'Admin' : 'Locked'}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-[#341539]/80 w-full space-y-2">
            {!isSlim ? (
              <>
                <Link
                  href={`/tenant/${tenant.slug}`}
                  target="_blank"
                  className="flex items-center justify-between rounded-xl bg-[#341539] p-3 text-xs font-bold text-[#FFF6E9] hover:bg-[#52215A] transition-colors"
                >
                  <span className="truncate">Storefront Preview</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#FFA800] shrink-0" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSlim(true)}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-[#FFA800] transition text-xs font-bold"
                >
                  <PanelLeftClose className="h-3.5 w-3.5 text-[#FFA800]" />
                  <span>Collapse Sidebar</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link
                  href={`/tenant/${tenant.slug}`}
                  target="_blank"
                  className="group relative p-2.5 rounded-xl bg-[#341539] text-[#FFA800] hover:bg-[#52215A] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#291E29] text-white text-xs font-bold rounded-lg shadow-2xl border border-white/15 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Storefront Preview
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSlim(false)}
                  className="group relative p-2 text-white/50 hover:text-[#FFA800] transition-colors"
                  title="Expand Sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#291E29] text-white text-xs font-bold rounded-lg shadow-2xl border border-white/15 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Expand Sidebar
                  </div>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto bg-[#FCFBF4] min-w-0 transition-all duration-300">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#291E29]/95 backdrop-blur-md border-t border-[#341539] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isBroadcastItem = item.name.includes('Broadcast');
                  const isOpsItem = item.name === 'Ops Console' || item.name === 'Ops';
                  const isCurrentBroadcast = currentTab === 'broadcast';
                  const isActive = isBroadcastItem
                    ? pathname.includes('/ops-console') && isCurrentBroadcast
                    : isOpsItem
                    ? pathname.includes('/ops-console') && !isCurrentBroadcast
                    : pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-[#FFA800] font-extrabold scale-105' : 'text-[#FFF6E9]/60 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#FFF6E9]/60 hover:text-white transition-all"
        >
          <Menu className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* Quick Switch User / Role Modal */}
      {switchAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#FCFBF4] text-[#291E29] shadow-2xl border border-black/10 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#291E29]">Switch Account & Role</h3>
                  <p className="text-[10px] text-slate-500">Test platform as Business Owner or Staff</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSwitchAccountOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Team Logins for {tenant.name}
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {staffList.map((s) => {
                  const isCurrent = user?.id === s.id || user?.email === s.email;
                  const isAccountOwner = s.role === 'tenant_admin';

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSwitchUser(s)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        isCurrent
                          ? 'border-[#291E29] bg-[#291E29] text-white shadow-md'
                          : 'border-black/10 bg-white hover:bg-amber-50/60 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                          style={{ backgroundColor: s.avatarColor || (isAccountOwner ? '#831843' : '#D97706') }}
                        >
                          {isAccountOwner ? '👑' : '👔'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs truncate flex items-center gap-1.5">
                            <span>{s.name}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                isAccountOwner
                                  ? isCurrent
                                    ? 'bg-amber-400/20 text-[#FFA800] border-amber-400/30'
                                    : 'bg-amber-100 text-amber-900 border-amber-200'
                                  : isCurrent
                                  ? 'bg-blue-400/20 text-blue-300 border-blue-400/30'
                                  : 'bg-blue-100 text-blue-900 border-blue-200'
                              }`}
                            >
                              {isAccountOwner ? 'Business Owner' : 'Staff'}
                            </span>
                          </div>
                          <div className={`text-[10px] truncate ${isCurrent ? 'text-white/70' : 'text-slate-500'}`}>
                            {s.designation} · {s.email}
                          </div>
                          {s.role === 'staff' && (
                            <div className={`text-[9px] mt-0.5 truncate ${isCurrent ? 'text-[#FFA800]' : 'text-amber-800 font-bold'}`}>
                              {s.privileges.length} Assigned Privileges
                            </div>
                          )}
                        </div>
                      </div>

                      {isCurrent ? (
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#FFA800] shrink-0">
                          <Check className="h-4 w-4" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#291E29] shrink-0">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-black/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSwitchAccountOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-black/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
