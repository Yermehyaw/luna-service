'use client';

import React from 'react';
import Link from 'next/link';
import { LunaLogo } from '../../../components/shared/LumaMark';
import { MOCK_TENANTS } from '../../../mock/tenants';
import { Building2, Plus, Users, ArrowRight, Radio, Sparkles } from 'lucide-react';

export default function PlatformDashboardPage() {
  return (
    <div className="min-h-screen bg-[#FFF6E9] text-[#291E29] font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
      <header className="border-b border-[#291E29]/10 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <LunaLogo size={36} showTagline />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-[#FFA800] px-4 py-2.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard New Tenant</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" /> Beyond the Expected
          </span>
          <h1 className="font-display text-2xl font-extrabold text-[#291E29] mt-1">Luna SaaS Platform Admin Dashboard</h1>
          <p className="text-xs text-[#291E29]/70">Global overview of multi-tenant enterprise organizations and live system status.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-5 shadow-sm space-y-2 backdrop-blur-sm">
            <span className="text-[#291E29]/70 font-semibold">Registered Enterprise Tenants</span>
            <div className="text-2xl font-extrabold text-[#291E29]">{MOCK_TENANTS.length} Tenants</div>
          </div>
          <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-5 shadow-sm space-y-2 backdrop-blur-sm">
            <span className="text-[#291E29]/70 font-semibold">Active Lobby Queues</span>
            <div className="text-2xl font-extrabold text-emerald-700">85 Active Queues</div>
          </div>
          <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-5 shadow-sm space-y-2 backdrop-blur-sm">
            <span className="text-[#291E29]/70 font-semibold">Daily Customer Volume</span>
            <div className="text-2xl font-extrabold text-[#702D7B]">14,280 Served</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-6 shadow-sm space-y-4 backdrop-blur-sm">
          <h2 className="font-bold text-sm text-[#291E29]">Active Tenant Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {MOCK_TENANTS.map((t) => (
              <div key={t.id} className="rounded-xl border border-[#291E29]/10 p-4 bg-[#FFF6E9]/40 space-y-3 hover:border-[#FFA800]/50 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#291E29]">{t.name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" /> Active
                  </span>
                </div>
                <p className="text-[11px] text-[#291E29]/70">{t.tagline}</p>
                <div className="pt-2 border-t border-[#291E29]/10 flex justify-between items-center">
                  <span className="font-mono text-[10px] text-[#702D7B]">{t.slug}.luna.com</span>
                  <Link href={`/tenant/${t.slug}`} className="font-extrabold text-[#291E29] hover:text-[#702D7B] flex items-center gap-1">
                    Manage <ArrowRight className="h-3 w-3 text-[#FFA800]" />
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
