'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '../../lib/tenant-context';
import { LunaLogo } from '../shared/LumaMark';
import { LayoutDashboard, Users, GitBranch, Settings, Share2, BarChart2, Briefcase, ExternalLink } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FCFBF4] flex font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
      <aside className="w-64 border-r border-[#341539] bg-[#291E29] text-[#FFF6E9] flex flex-col p-4 shadow-xl">
        <div className="px-3 py-3 border-b border-[#341539]/80 space-y-3">
          <Link href="/">
            <LunaLogo variant="light" size={28} />
          </Link>
          <div className="pt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFA800]">Tenant Console</span>
            <h2 className="text-base font-extrabold text-white truncate mt-0.5">{tenant.name}</h2>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5 text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                  isActive
                    ? 'bg-[#FFA800] text-[#291E29] font-extrabold shadow-md shadow-[#FFA800]/25'
                    : 'text-[#FFF6E9]/70 hover:bg-[#341539] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-[#341539]/80">
          <Link
            href={`/tenant/${tenant.slug}`}
            target="_blank"
            className="flex items-center justify-between rounded-xl bg-[#341539] p-3 text-xs font-bold text-[#FFF6E9] hover:bg-[#52215A] transition-colors"
          >
            <span>Customer Portal</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto bg-[#FCFBF4]">{children}</main>
    </div>
  );
}
