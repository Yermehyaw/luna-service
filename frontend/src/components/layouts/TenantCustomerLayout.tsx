'use client';

import React from 'react';
import { Tenant } from '../../types/tenant';
import { TenantProvider } from '../../lib/tenant-context';
import Link from 'next/link';

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
      <div className="min-h-screen bg-[var(--tenant-bg,#F4F8FC)] text-[var(--tenant-text,#0B1D3A)] flex flex-col font-sans">
        <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href={basePath} className="flex items-center gap-2 font-display text-lg font-extrabold text-slate-900">
              <span className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: initialTenant.branding.primaryColor }}>
                {initialTenant.name[0]}
              </span>
              <span>{initialTenant.name}</span>
            </Link>

            <nav className="flex items-center gap-6 text-xs font-semibold text-slate-600">
              <Link href={`${basePath}`} className="hover:text-slate-900">Services</Link>
              <Link href={`${basePath}/book-queue`} className="hover:text-slate-900">Book Window</Link>
              <Link href={`${basePath}/track`} className="hover:text-slate-900">Track Position</Link>
              <Link href={`${basePath}/verify`} className="hover:text-slate-900">Verify Docs</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200/60 bg-white py-8 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-6xl px-6 space-y-2">
            <p>Powered by Luma Multi-Tenant Intelligent Queue System</p>
            <p className="text-[11px] text-slate-400">© 2026 {initialTenant.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </TenantProvider>
  );
}
