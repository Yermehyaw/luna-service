'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '../../lib/tenant-context';
import { LayoutDashboard, Users, GitBranch, Settings, Share2, BarChart2, Briefcase } from 'lucide-react';

export function TenantStaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const basePath = `/tenant/${tenant.slug}/staff`;

  const navItems = [
    { name: 'Ops Console', href: `${basePath}/ops-console`, icon: LayoutDashboard },
    { name: 'Customers', href: `${basePath}/customers`, icon: Users },
    { name: 'Branches', href: `${basePath}/branches`, icon: GitBranch },
    { name: 'Services', href: `${basePath}/services`, icon: Briefcase },
    { name: 'Social Studio', href: `${basePath}/social-studio`, icon: Share2 },
    { name: 'Analytics', href: `${basePath}/analytics`, icon: BarChart2 },
    { name: 'Branding & Settings', href: `${basePath}/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <aside className="w-64 border-r border-slate-200 bg-slate-900 text-white flex flex-col p-4">
        <div className="px-3 py-4 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Staff Portal</span>
          <h2 className="text-lg font-extrabold text-white truncate mt-0.5">{tenant.name}</h2>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5 text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  isActive
                    ? 'bg-[var(--tenant-primary,#0057B8)] text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
