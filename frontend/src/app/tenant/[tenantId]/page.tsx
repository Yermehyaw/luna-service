'use client';

import React, { use } from 'react';
import { getTenantBySlug } from '../../../lib/tenant';
import { TenantCustomerLayout } from '../../../components/layouts/TenantCustomerLayout';
import Link from 'next/link';
import { Ticket, ShieldCheck, MapPin, ArrowRight, Radio, Globe, Sparkles } from 'lucide-react';
import { MOCK_BRANCHES } from '../../../mock/branches';
import { MOCK_SERVICES } from '../../../mock/services';

export default function TenantCustomerPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const [tenant, setTenant] = React.useState<any>(null);

  React.useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then((res) => setTenant(res));
  }, [resolvedParams.tenantId]);

  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xs text-slate-500 font-semibold">
        Loading Tenant Portal...
      </div>
    );
  }

  const branches = MOCK_BRANCHES.filter((b) => b.tenantId === tenant.id);
  const services = MOCK_SERVICES.filter((s) => s.tenantId === tenant.id);
  const basePath = `/tenant/${tenant.slug}`;
  const subdomainDisplay = `${tenant.slug}.luma.com`;

  const heroTitle = tenant.branding?.heroTitle || `Welcome to ${tenant.name}`;
  const heroSubtitle = tenant.branding?.heroSubtitle || `${tenant.tagline}. Reserve a 30-minute arrival window or pre-clear your documents from home to bypass lobby queues entirely.`;
  const announcement = tenant.branding?.announcementTicker || 'Live Queue System Operating · Zero Walk-in Waiting';
  const ctaText = tenant.branding?.ctaButtonText || 'Book a Timed Ticket';

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="space-y-16 pb-20">
        {/* Dynamic Customizable Tenant Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[var(--tenant-primary,#0057B8)]/10 via-[var(--tenant-bg,#F4F8FC)] to-[var(--tenant-bg,#F4F8FC)] py-16">
          <div className="mx-auto max-w-6xl px-6 text-center space-y-6">
            
            {/* Subdomain Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <Globe className="h-3.5 w-3.5 text-sky-400" />
                Custom Subdomain: <span className="text-sky-300 font-mono">{subdomainDisplay}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                {announcement}
              </span>
            </div>

            {/* Title & Tagline */}
            <h1 className="font-display text-4xl font-extrabold text-slate-900 sm:text-5xl leading-tight max-w-4xl mx-auto">
              {heroTitle}
            </h1>

            <p className="mx-auto max-w-2xl text-sm text-slate-600 leading-relaxed">
              {heroSubtitle}
            </p>

            {/* Custom CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href={`${basePath}/book-queue`}
                className="flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: tenant.branding.primaryColor }}
              >
                <Ticket className="h-4 w-4" />
                <span>{ctaText}</span>
              </Link>
              <Link
                href={`${basePath}/verify`}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Pre-Verify Documents</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Available Services */}
        <section className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--tenant-primary,#0057B8)]" />
                Services & Priority Windows
              </h2>
              <p className="text-xs text-slate-500">Select a service to request a digital arrival ticket.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    ~{s.minutes} mins
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </TenantCustomerLayout>
  );
}
