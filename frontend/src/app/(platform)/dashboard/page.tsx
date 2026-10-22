'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LunaLogo } from '../../../components/shared/LumaMark';
import { MOCK_TENANTS } from '../../../mock/tenants';
import {
  Building2,
  Plus,
  Users,
  ArrowRight,
  Radio,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  LayoutDashboard,
  Store,
  ExternalLink,
  Layers,
  Activity,
  Home,
  ShieldCheck,
} from 'lucide-react';

export default function PlatformDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scaleFilter, setScaleFilter] = useState<'all' | 'sme' | 'enterprise'>('all');

  const filteredTenants = MOCK_TENANTS.filter((t) => {
    if (scaleFilter === 'all') return true;
    return t.branding?.businessScale === scaleFilter;
  });

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6E9] text-[#291E29] font-sans selection:bg-[#FFA800] selection:text-[#291E29] flex flex-col">
      {/* Top Header with Universal Hamburger Menu */}
      <header className="border-b border-[#291E29]/10 bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#291E29]/5 text-[#291E29] hover:bg-[#FFA800] hover:text-[#291E29] active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              aria-label="Toggle platform navigation sidebar"
              title={sidebarOpen ? 'Collapse sidebar into hamburger menu' : 'Expand navigation sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <LunaLogo size={32} showTagline />
            </Link>

            <div className="hidden lg:flex items-center border-l border-[#291E29]/10 pl-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#702D7B] bg-[#702D7B]/10 px-2 py-0.5 rounded-full">
                Platform Admin
              </span>
            </div>

            {/* Desktop indicator when sidebar is collapsed */}
            <div className="hidden xl:flex items-center ml-2">
              {!sidebarOpen && (
                <span className="rounded-full bg-[#702D7B]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#702D7B] border border-[#702D7B]/20">
                  Sidebar Collapsed (Click ☰ to expand)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#291E29] text-[#FFA800] hover:bg-[#341539] text-xs font-bold transition-all shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#FFA800]" />
              <span className="hidden sm:inline">Admin Master Control</span>
              <span className="sm:hidden">Admin</span>
            </Link>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#291E29]/70 hover:text-[#291E29] px-2.5 py-1.5 rounded-lg hover:bg-black/5"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Landing Page</span>
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 rounded-xl bg-[#FFA800] px-3.5 sm:px-4 py-2 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Onboard Tenant</span>
            </Link>
          </div>
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
                  <span className="text-xs font-bold text-white">Platform Menu</span>
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
                  onClick={() => {
                    setScaleFilter('all');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    scaleFilter === 'all'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>All Portals ({MOCK_TENANTS.length})</span>
                </button>
                <button
                  onClick={() => {
                    setScaleFilter('sme');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    scaleFilter === 'sme'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  <span>SMEs &amp; Small Businesses</span>
                </button>
                <button
                  onClick={() => {
                    setScaleFilter('enterprise');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                    scaleFilter === 'enterprise'
                      ? 'bg-[#FFA800] text-[#291E29] font-extrabold'
                      : 'text-[#FFF6E9]/80 hover:bg-[#341539]'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Enterprise Organizations</span>
                </button>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[#FFA800] bg-[#FFA800]/10 font-bold"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Master Control</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[#FFF6E9]/80 hover:bg-[#341539]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Onboard New Tenant</span>
                </Link>
                <Link
                  href="/tenant/acme-bank/staff/ops-console"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[#FFF6E9]/80 hover:bg-[#341539]"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Staff Ops Demo (Acme Bank)</span>
                </Link>
              </nav>

              <div className="pt-4 border-t border-[#341539] mt-auto">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#341539] p-3 text-xs font-bold text-[#FFF6E9]"
                >
                  <span>Return to Landing Page</span>
                  <Home className="h-3.5 w-3.5 text-[#FFA800]" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-[#291E29]/10 bg-white/80 text-[#291E29] shadow-sm shrink-0 transition-all duration-300 ease-in-out backdrop-blur-md ${
            !sidebarOpen
              ? 'w-0 -ml-64 opacity-0 pointer-events-none p-0 overflow-hidden border-none'
              : 'w-64 p-4'
          }`}
        >
          <div className="pb-3 border-b border-[#291E29]/10 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#702D7B]">
              Navigation
            </span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#291E29] hover:bg-black/5 transition-colors"
              title="Collapse sidebar into hamburger menu"
              aria-label="Collapse sidebar into hamburger menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-4 flex-1 space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setScaleFilter('all')}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-all text-left ${
                scaleFilter === 'all'
                  ? 'bg-[#FFA800] text-[#291E29] font-extrabold shadow-sm'
                  : 'text-[#291E29]/75 hover:bg-black/5 hover:text-[#291E29]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" />
                <span>All Tenants</span>
              </div>
              <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">
                {MOCK_TENANTS.length}
              </span>
            </button>

            <button
              onClick={() => setScaleFilter('sme')}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-all text-left ${
                scaleFilter === 'sme'
                  ? 'bg-[#FFA800] text-[#291E29] font-extrabold shadow-sm'
                  : 'text-[#291E29]/75 hover:bg-black/5 hover:text-[#291E29]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="h-4 w-4" />
                <span>SMEs &amp; Shops</span>
              </div>
              <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">
                {MOCK_TENANTS.filter((t) => t.branding.businessScale === 'sme').length}
              </span>
            </button>

            <button
              onClick={() => setScaleFilter('enterprise')}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-all text-left ${
                scaleFilter === 'enterprise'
                  ? 'bg-[#FFA800] text-[#291E29] font-extrabold shadow-sm'
                  : 'text-[#291E29]/75 hover:bg-black/5 hover:text-[#291E29]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4" />
                <span>Enterprises</span>
              </div>
              <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">
                {MOCK_TENANTS.filter((t) => t.branding.businessScale === 'enterprise').length}
              </span>
            </button>

            <div className="pt-4 border-t border-[#291E29]/10 mt-3 space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#291E29]/50 px-2">
                Quick Shortcuts
              </span>
              <Link
                href="/admin"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-[#291E29] bg-[#FFA800]/20 hover:bg-[#FFA800]/30 font-extrabold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#702D7B]" />
                  <span>Admin Master Control</span>
                </div>
                <ArrowRight className="h-3 w-3 text-[#702D7B]" />
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[#702D7B] hover:bg-[#702D7B]/10 font-bold transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Onboard New Tenant</span>
              </Link>
              <Link
                href="/tenant/acme-bank/staff/ops-console"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-[#291E29]/75 hover:bg-black/5 hover:text-[#291E29] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="h-4 w-4 text-[#FFA800]" />
                  <span>Ops Console Demo</span>
                </div>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </nav>

          <div className="pt-4 border-t border-[#291E29]/10">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-[#291E29]/60 hover:text-[#291E29] transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse into Menu</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto min-w-0 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" /> Beyond the Expected
              </span>
              <h1 className="font-display text-2xl font-extrabold text-[#291E29] mt-1">
                Luna SaaS Platform Admin Dashboard
              </h1>
              <p className="text-xs text-[#291E29]/70">
                Global overview of multi-tenant small businesses (SMEs) and enterprise organizations.
              </p>
            </div>

            {/* Scale Filter Pills on Mobile/Main view */}
            <div className="flex items-center gap-1.5 bg-white/70 p-1 rounded-2xl border border-[#291E29]/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setScaleFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  scaleFilter === 'all'
                    ? 'bg-[#FFA800] text-[#291E29] shadow-xs'
                    : 'text-[#291E29]/70 hover:text-[#291E29]'
                }`}
              >
                All ({MOCK_TENANTS.length})
              </button>
              <button
                type="button"
                onClick={() => setScaleFilter('sme')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  scaleFilter === 'sme'
                    ? 'bg-[#FFA800] text-[#291E29] shadow-xs'
                    : 'text-[#291E29]/70 hover:text-[#291E29]'
                }`}
              >
                SMEs
              </button>
              <button
                type="button"
                onClick={() => setScaleFilter('enterprise')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  scaleFilter === 'enterprise'
                    ? 'bg-[#FFA800] text-[#291E29] shadow-xs'
                    : 'text-[#291E29]/70 hover:text-[#291E29]'
                }`}
              >
                Enterprises
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-5 shadow-sm space-y-2 backdrop-blur-sm">
              <span className="text-[#291E29]/70 font-semibold">Registered Portals (SMEs &amp; Enterprise)</span>
              <div className="text-2xl font-extrabold text-[#291E29]">{MOCK_TENANTS.length} Active Portals</div>
              <p className="text-[11px] text-[#702D7B] font-medium">
                {MOCK_TENANTS.filter((t) => t.branding.businessScale === 'sme').length} SMEs ·{' '}
                {MOCK_TENANTS.filter((t) => t.branding.businessScale === 'enterprise').length} Enterprises
              </p>
            </div>
            <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-5 shadow-sm space-y-2 backdrop-blur-sm">
              <span className="text-[#291E29]/70 font-semibold">Active Live Queues</span>
              <div className="text-2xl font-extrabold text-emerald-700">85 Active Queues</div>
              <p className="text-[11px] text-emerald-600 font-medium">Chairs, bays &amp; counter triage</p>
            </div>
            <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-5 shadow-sm space-y-2 backdrop-blur-sm">
              <span className="text-[#291E29]/70 font-semibold">Daily Customer Volume</span>
              <div className="text-2xl font-extrabold text-[#702D7B]">14,280 Served</div>
              <p className="text-[11px] text-[#291E29]/60 font-medium">Across all shops &amp; branches</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-6 shadow-sm space-y-4 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-sm text-[#291E29]">
                  {scaleFilter === 'all'
                    ? 'Active Tenant Applications'
                    : scaleFilter === 'sme'
                    ? 'Small Business (SME) Portals'
                    : 'Enterprise Organization Portals'}
                </h2>
                <p className="text-xs text-[#291E29]/65">
                  Salons, auto garages, bakeries, clinics, and banks running on Luna
                </p>
              </div>
              <span className="rounded-full bg-[#FFA800]/20 text-[#291E29] px-3 py-1 text-[11px] font-bold">
                All Systems Operational
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {filteredTenants.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-[#291E29]/10 p-5 bg-[#FFF6E9]/40 space-y-3 hover:border-[#FFA800]/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="rounded-full bg-white border border-[#291E29]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#291E29]">
                        {t.branding?.businessScale === 'sme' ? '🏪 SME' : '🏛️ Enterprise'} · {t.industry.replace('_', ' ')}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <Radio className="h-2.5 w-2.5 animate-pulse" /> Active
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#291E29]">{t.name}</h3>
                    <p className="text-[11px] text-[#291E29]/70 leading-relaxed line-clamp-2">{t.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-[#291E29]/10 flex justify-between items-center text-[11px]">
                    <Link href={`/tenant/${t.slug}`} className="font-mono text-[#702D7B] hover:underline">
                      {t.slug}.luna.com
                    </Link>
                    <Link
                      href={`/tenant/${t.slug}/staff/ops-console`}
                      className="font-extrabold text-[#291E29] hover:text-[#702D7B] flex items-center gap-1 bg-[#FFA800]/20 px-2.5 py-1 rounded-lg min-h-[32px]"
                    >
                      Console <ArrowRight className="h-3 w-3 text-[#FFA800]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
