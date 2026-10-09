'use client';

import React from 'react';
import { Tenant } from '../../types/tenant';
import { TenantProvider } from '../../lib/tenant-context';
import Link from 'next/link';
import { LunaIcon } from '../shared/LumaMark';

export function TenantCustomerLayout({
  children,
  initialTenant,
}: {
  children: React.ReactNode;
  initialTenant: Tenant;
}) {
  const basePath = `/tenant/${initialTenant.slug}`;

  return (
    <TenantProvider initialTenant={initialTenant}>
      <div className="min-h-screen bg-[var(--tenant-bg,#FFF6E9)] text-[var(--tenant-text,#291E29)] flex flex-col font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        <header className="border-b border-black/5 bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-xs">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href={basePath} className="flex items-center gap-3 font-display text-lg font-extrabold text-[#291E29]">
              <span
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: initialTenant.branding.primaryColor }}
              >
                {initialTenant.name[0]}
              </span>
              <div>
                <span className="block leading-tight">{initialTenant.name}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Digital Queue Portal</span>
              </div>
            </Link>

            <nav className="flex items-center gap-6 text-xs font-bold text-slate-700">
              <Link href={`${basePath}`} className="hover:text-[#FFA800] transition-colors">Services</Link>
              <Link href={`${basePath}/book-queue`} className="hover:text-[#FFA800] transition-colors">Book Window</Link>
              <Link href={`${basePath}/track`} className="hover:text-[#FFA800] transition-colors">Track Position</Link>
              <Link href={`${basePath}/verify`} className="hover:text-[#FFA800] transition-colors">Verify Docs</Link>
              <Link
                href={`${basePath}/book-queue`}
                className="hidden sm:inline-flex rounded-xl bg-[#FFA800] px-4 py-2 text-xs font-extrabold text-[#291E29] shadow-sm hover:bg-[#FFB11A] transition-all"
              >
                Book Ticket
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-black/5 bg-[#FFF6E9] py-8 text-center text-xs text-[#291E29]/70">
          <div className="mx-auto max-w-6xl px-6 space-y-2">
            <div className="flex items-center justify-center gap-2 font-bold text-[#291E29]">
              <LunaIcon size={18} variant="purple" />
              <span>Powered by Luna Multi-Tenant Infrastructure · Beyond the Expected</span>
            </div>
            <p className="text-[11px] text-[#291E29]/50">© 2026 {initialTenant.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </TenantProvider>
  );
}
