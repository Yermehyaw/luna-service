'use client';

import React from 'react';
import Link from 'next/link';
import { LunaLogo } from '../../../components/shared/LumaMark';
import { MOCK_TENANTS } from '../../../mock/tenants';
import { Building2, Plus, Users, ArrowRight, Radio } from 'lucide-react';

export default function PlatformDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <LunaLogo size={36} />
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard New Tenant</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Luna SaaS Platform Admin Dashboard</h1>
          <p className="text-xs text-slate-500">Global overview of multi-tenant enterprise organizations and live system status.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold">Registered Enterprise Tenants</span>
            <div className="text-2xl font-extrabold text-slate-900">{MOCK_TENANTS.length} Tenants</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold">Active Lobby Queues</span>
            <div className="text-2xl font-extrabold text-emerald-600">85 Active Queues</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold">Daily Customer Volume</span>
            <div className="text-2xl font-extrabold text-blue-600">14,280 Served</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900">Active Tenant Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {MOCK_TENANTS.map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{t.name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" /> Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{t.tagline}</p>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-mono text-[10px] text-slate-400">{t.slug}.luna.com</span>
                  <Link href={`/tenant/${t.slug}`} className="font-bold text-[var(--tenant-primary,#0057B8)] flex items-center gap-1">
                    Manage <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
