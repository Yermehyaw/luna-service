'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { createTenant } from '../../../lib/tenant';
import { LunaLogo } from '../../../components/shared/LumaMark';
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

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'luna.com';
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
        primaryColor: '#291E29',
        secondaryColor: '#341539',
        accentColor: '#FFA800',
        backgroundColor: '#FFF6E9',
        textColor: '#291E29',
        fontFamily: 'Allen Sans',
        heroTitle: `Welcome to ${orgName}`,
        heroSubtitle: `Reserve a 30-minute arrival window or pre-clear your paperwork online.`,
        announcementTicker: 'Live Customer Queue Operating · Zero Walk-in Waiting',
        ctaButtonText: 'Book a Timed Ticket',
        contactEmail: email,
      },
    });

    await login(email);
    setLoading(false);
    // Route directly to the Website Customizer & AI Studio to select from 8 free themes
    router.push(`/tenant/${newTenant.slug}/staff/settings`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF6E9] p-6 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
      <div className="w-full max-w-lg rounded-3xl border border-[#291E29]/10 bg-white/90 p-8 shadow-2xl space-y-6 backdrop-blur-md">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LunaLogo size={44} showTagline />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[11px] font-extrabold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" />
            Free Subdomain · 8 Free Themes · AI Site Studio
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[#291E29]">Create Your Free Business Portal</h2>
          <p className="text-xs text-[#291E29]/70">
            Claim your free <span className="font-bold font-mono">yourname.luna.com</span> website, customize with 8 free themes, or chat with AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#291E29]">Your Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[#702D7B]" />
                <input
                  type="text"
                  required
                  placeholder="Dr. Temitope Adebayo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-2.5 pl-9 pr-3 text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#291E29]">Work Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#702D7B]" />
                <input
                  type="email"
                  required
                  placeholder="temitope@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-2.5 pl-9 pr-3 text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#291E29]">Business / Organization Name</label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-[#702D7B]" />
              <input
                type="text"
                required
                placeholder="e.g. Apex Health Center"
                value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-2.5 pl-9 pr-3 text-[#291E29] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              />
            </div>
          </div>

          {/* Subdomain Input */}
          <div className="space-y-1">
            <label className="font-bold text-[#291E29] flex items-center justify-between">
              <span>Your Custom Subdomain</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                <Sparkles className="h-3 w-3 text-[#FFA800]" /> Auto-Generated
              </span>
            </label>
            <div className="flex items-center rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/50 overflow-hidden focus-within:ring-2 focus-within:ring-[#FFA800]">
              <span className="px-3 text-xs font-bold text-[#291E29]/60 bg-[#291E29]/5 py-2.5 border-r border-[#291E29]/10">https://</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="apex-health"
                className="w-full bg-transparent px-3 py-2.5 text-xs font-bold font-mono text-[#291E29] focus:outline-none"
              />
              <span className="px-3 text-xs font-bold text-[#702D7B] bg-[#291E29]/5 py-2.5 border-l border-[#291E29]/10">.{platformDomain}</span>
            </div>
            <p className="text-[11px] text-[#291E29]/70 flex items-center gap-1 mt-1">
              <Globe className="h-3 w-3 text-[#FFA800]" /> Live Portal: <span className="font-bold text-[#291E29] font-mono">{customSubdomainPreview}</span>
            </p>
          </div>

          <div>
            <label className="font-bold text-[#291E29]">Industry Category</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as TenantIndustry)}
              className="mt-1 w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 p-2.5 text-[#291E29] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
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
            <label className="font-bold text-[#291E29]">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#702D7B]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-2.5 pl-9 pr-3 text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFA800] py-3.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <span>{loading ? 'Creating Subdomain...' : 'Register Business & Create Subdomain'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-xs text-[#291E29]/70 text-center pt-2 border-t border-[#291E29]/10">
          Already registered?{' '}
          <Link href="/login" className="font-extrabold text-[#702D7B] hover:text-[#291E29] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
