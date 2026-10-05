'use client';

import React from 'react';
import Link from 'next/link';
import { LunaLogo } from '../../components/shared/LumaMark';
import { ArrowRight, Radio } from 'lucide-react';
import { MOCK_TENANTS } from '../../mock/tenants';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F3] text-slate-900 flex flex-col font-sans">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <LunaLogo size={36} />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-bold text-slate-700 hover:text-slate-900">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
            >
              Register Business Subdomain
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-20 pb-20">
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl px-6 pt-16 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            <Radio className="h-3.5 w-3.5 animate-pulse text-amber-600" />
            Multi-Tenant Next.js Architecture v2.0
          </span>

          <h1 className="font-display text-4xl font-extrabold text-slate-900 sm:text-6xl leading-tight">
            Customer Service & Intelligent Queues for the Digital Economy
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-slate-600 leading-relaxed">
            One unified platform powering timed arrival windows, home document pre-clearance, branch collaboration, and customer care for banks, hospitals, universities, and telecom operations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/tenant/acme-bank"
              className="flex items-center gap-2 rounded-2xl bg-[#0057B8] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
            >
              <span>Demo Acme Bank Tenant</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tenant/city-hospital"
              className="flex items-center gap-2 rounded-2xl bg-[#12A05A] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
            >
              <span>Demo City Hospital Tenant</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Live Tenant Directory */}
        <section className="mx-auto max-w-6xl px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-slate-900">Organizations Live on Luna</h2>
            <p className="text-xs text-slate-500">Every tenant uses the same unified frontend code with custom branding & features.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_TENANTS.map((tenant) => (
              <div key={tenant.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 capitalize">
                    {tenant.industry}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <Radio className="h-3 w-3 animate-pulse" /> Live Tenant
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{tenant.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tenant.tagline}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Rating: ★ {tenant.rating}</span>
                  <Link
                    href={`/tenant/${tenant.slug}`}
                    className="font-bold text-[var(--tenant-primary,#0057B8)] flex items-center gap-1 hover:underline"
                  >
                    View Tenant App <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
