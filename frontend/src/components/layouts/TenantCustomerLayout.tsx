'use client';

import React, { useState } from 'react';
import { Tenant } from '../../types/tenant';
import { useTenant } from '../../lib/tenant-context';
import { useAuth } from '../../lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LunaIcon } from '../shared/LumaMark';
import { Home, Ticket, Radio, Trophy, Menu, X, ExternalLink, Sparkles, User } from 'lucide-react';
import { CustomerAuthModal } from '../shared/CustomerAuthModal';

export function TenantCustomerLayout({
  children,
  initialTenant,
}: {
  children: React.ReactNode;
  initialTenant?: Tenant;
}) {
  const pathname = usePathname();
  const { tenant: contextTenant } = useTenant();
  const { user } = useAuth();
  const tenant = initialTenant || contextTenant;
  const basePath = `/tenant/${tenant.slug}`;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    { name: 'Services', href: basePath, icon: Home },
    { name: 'Book Window', href: `${basePath}/book-queue`, icon: Ticket },
    { name: 'Track Position', href: `${basePath}/track`, icon: Radio },
    { name: 'Leaderboard', href: `${basePath}/leaderboard`, icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[var(--tenant-bg,#FFF6E9)] text-[var(--tenant-text,#291E29)] flex flex-col font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
      {/* Sticky Header with Hamburger Menu */}
      <header className="border-b border-black/5 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4">
          <Link
            href={basePath}
            className="flex items-center gap-2.5 sm:gap-3 font-display text-base sm:text-lg font-extrabold text-[#291E29] max-w-[200px] sm:max-w-none"
          >
            {tenant.branding?.logoUrl ? (
              <img
                src={tenant.branding.logoUrl}
                alt={tenant.name}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain bg-white shadow-xs border border-black/10 shrink-0 p-0.5"
              />
            ) : (
              <span
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm transition-transform hover:scale-105 shrink-0 text-sm sm:text-base"
                style={{ backgroundColor: tenant.branding?.primaryColor || '#291E29' }}
              >
                {tenant.name[0]}
              </span>
            )}
            <div className="truncate">
              <span className="block leading-tight truncate">{tenant.name}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Digital Queue Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    isActive ? 'text-[#FFA800] font-extrabold border-b-2 border-[#FFA800]' : 'hover:text-[#FFA800]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href={`${basePath}/book-queue`}
              className="rounded-xl bg-[#FFA800] px-4 py-2 text-xs font-extrabold text-[#291E29] shadow-sm hover:bg-[#FFB11A] transition-all"
            >
              Book Ticket
            </Link>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition shadow-xs"
            >
              <User className="h-3.5 w-3.5 text-[#FFA800]" />
              <span>{user && user.role === 'customer' ? `${user.name.split(' ')[0]} (VIP)` : 'Sign In / Account'}</span>
            </button>
            <Link
              href={`${basePath}/staff/ops-console`}
              className="rounded-xl bg-[#291E29] text-[#FFF6E9] px-3.5 py-2 text-xs font-bold hover:bg-[#341539] transition-all flex items-center gap-1.5"
            >
              <span>Staff</span>
              <ExternalLink className="h-3 w-3 text-[#FFA800]" />
            </Link>
          </nav>

          {/* Mobile Right Controls: Customer Account + Book Ticket + Hamburger Menu */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-95 transition"
              title="Customer Account"
              aria-label="Customer Account"
            >
              <User className="h-4 w-4 text-[#FFA800]" />
            </button>
            <Link
              href={`${basePath}/book-queue`}
              className="rounded-xl bg-[#FFA800] px-3 py-1.5 text-xs font-extrabold text-[#291E29] shadow-xs active:scale-95 transition min-h-[36px] flex items-center"
            >
              Book
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-[#291E29] hover:bg-black/10 active:scale-95 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Drawer Menu for Customer Portal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white text-[#291E29] p-5 flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <div className="flex items-center gap-2.5">
                {tenant.branding?.logoUrl ? (
                  <img
                    src={tenant.branding.logoUrl}
                    alt={tenant.name}
                    className="h-8 w-8 rounded-xl object-contain bg-white shadow-xs border border-black/10 shrink-0 p-0.5"
                  />
                ) : (
                  <span
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm shrink-0"
                    style={{ backgroundColor: tenant.branding?.primaryColor || '#291E29' }}
                  >
                    {tenant.name[0]}
                  </span>
                )}
                <div className="truncate">
                  <h3 className="text-xs font-bold text-[#291E29] truncate">{tenant.name}</h3>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Customer Menu
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Account Box in Drawer */}
            <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#FFA800]/20 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-[#291E29]" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      {user && user.role === 'customer' ? user.name : 'Customer Account'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {user && user.role === 'customer' ? 'VIP Status Active' : 'Sign up for VIP perks'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                >
                  {user && user.role === 'customer' ? 'Manage' : 'Sign Up'}
                </button>
              </div>
            </div>

            <nav className="mt-3 flex-1 space-y-1.5 text-xs font-semibold overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-[#FFA800] text-[#291E29] font-extrabold shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#291E29]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#FFA800]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-black/10 mt-auto space-y-2">
              <Link
                href={`${basePath}/staff/ops-console`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-[#291E29] p-3 text-xs font-bold text-[#FFF6E9] hover:bg-[#341539] transition-colors"
              >
                <span>Staff Operations Console</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
              </Link>
              <p className="text-[10px] text-center text-slate-400">
                Powered by Luna Multi-Tenant Infrastructure
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with bottom padding for mobile bar */}
      <main className="flex-1 pb-20 sm:pb-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-[#FFF6E9] py-8 text-center text-xs text-[#291E29]/70 pb-24 sm:pb-8">
        <div className="mx-auto max-w-6xl px-6 space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-[#291E29]">
            <LunaIcon size={18} variant="purple" />
            <span>Powered by Luna Multi-Tenant Infrastructure · Beyond the Expected</span>
          </div>
          <p className="text-[11px] text-[#291E29]/50">© 2026 {tenant.name}. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Customer Thumb Navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[#291E29] font-extrabold scale-105'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#FFA800]' : ''}`} />
                {link.name === 'Track Position' && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-[#291E29] font-bold' : ''}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
        >
          <Menu className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>

      {/* Customer Account Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        tenant={tenant}
      />
    </div>
  );
}
