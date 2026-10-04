'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { createTenant } from '../../../lib/tenant';
import { LumaLogo } from '../../../components/shared/LumaMark';
import { ArrowRight, Lock, Mail, User, Building2, Globe, Sparkles } from 'lucide-react';
import { TenantIndustry } from '../../../types/tenant';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState<TenantIndustry>('banking');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    if (!slug || slug === orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, -1)) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'luma.com';
  const customSubdomainPreview = `${slug || 'your-company'}.${platformDomain}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'new-business';

    const newTenant = await createTenant({
      name: orgName,
      slug: cleanSlug,
      industry,
      tagline: `Smart ${industry} customer queue and instant arrival window pre-clearance`,
      branding: {
        primaryColor: '#0057B8',
        secondaryColor: '#002F6C',
        accentColor: '#00A3E0',
        backgroundColor: '#F4F8FC',
        textColor: '#0B1D3A',
        fontFamily: 'Inter',
        heroTitle: `Welcome to ${orgName}`,
        heroSubtitle: `Reserve a 30-minute arrival window or pre-clear your paperwork online.`,
        announcementTicker: 'Live Customer Queue Operating · Zero Walk-in Waiting',
        ctaButtonText: 'Book a Timed Ticket',
        contactEmail: email,
      },
    });

    await login(email);
    setLoading(false);
    router.push(`/tenant/${newTenant.slug}/staff/ops-console`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF9F3] p-6 font-sans">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LumaLogo size={40} />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Register Your Business Subdomain</h2>
          <p className="text-xs text-slate-500">Get an instant custom subdomain & zero-wait digital queue platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Your Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Dr. Temitope Adebayo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Work Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="temitope@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Business / Organization Name</label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Apex Health Center"
                value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Subdomain Input */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Your Custom Subdomain</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Auto-Generated
              </span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
              <span className="px-3 text-xs font-bold text-slate-400 bg-slate-100 py-2.5 border-r border-slate-200">https://</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="apex-health"
                className="w-full bg-white px-3 py-2.5 text-xs font-bold font-mono text-slate-900 focus:outline-none"
              />
              <span className="px-3 text-xs font-bold text-slate-500 bg-slate-100 py-2.5 border-l border-slate-200">.{platformDomain}</span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <Globe className="h-3 w-3 text-sky-600" /> Your landing page: <span className="font-bold text-slate-800 font-mono">{customSubdomainPreview}</span>
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Industry Category</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as TenantIndustry)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 font-medium"
            >
              <option value="banking">Commercial Banking</option>
              <option value="healthcare">Healthcare & Hospitals</option>
              <option value="telecom">Telecom & Retail</option>
              <option value="education">University & Education</option>
              <option value="government">Government Agency</option>
              <option value="retail">Retail Business</option>
              <option value="other">Other Business</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Subdomain...' : 'Register Business & Create Subdomain'}</span>
            <ArrowRight className="h-4 w-4 text-sky-400" />
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-[#0057B8] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
