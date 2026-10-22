'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { createTenant } from '../../../lib/tenant';
import { LunaLogo } from '../../../components/shared/LumaMark';
import { ArrowRight, Lock, Mail, User, Building2, Globe, Sparkles, Phone } from 'lucide-react';
import { TenantIndustry } from '../../../types/tenant';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessScale, setBusinessScale] = useState<'sme' | 'enterprise'>('sme');
  const [industry, setIndustry] = useState<TenantIndustry>('salon_beauty');
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

  // Helper defaults based on industry and scale
  const getIndustryDefaults = (ind: TenantIndustry, scale: 'sme' | 'enterprise') => {
    switch (ind) {
      case 'salon_beauty':
        return {
          serviceUnit: 'Styling Chair',
          staffTitle: 'Lead Stylist',
          ctaText: 'Reserve Styling Chair',
          heroTitle: `Welcome to ${orgName || 'Our Salon'}`,
          heroSubtitle: 'Reserve a styling chair or upload your hairstyle reference before your visit.',
          announcement: 'Chairs Active · Zero Walk-in Waiting',
          primary: '#831843',
          accent: '#F43F5E',
          bg: '#FFF1F2',
        };
      case 'auto_repair':
        return {
          serviceUnit: 'Service Bay',
          staffTitle: 'Mechanic / Bay Lead',
          ctaText: 'Book Service Bay',
          heroTitle: `Welcome to ${orgName || 'Our Auto Garage'}`,
          heroSubtitle: 'Reserve an express service bay or upload your vehicle fault checklist online.',
          announcement: 'Service Bays Operating · Fast-Track Intake Live',
          primary: '#1E293B',
          accent: '#F59E0B',
          bg: '#F8FAFC',
        };
      case 'cafe_bakery':
        return {
          serviceUnit: 'Pickup Counter',
          staffTitle: 'Barista / Chef',
          ctaText: 'Reserve Pickup Window',
          heroTitle: `Welcome to ${orgName || 'Our Cafe & Bakery'}`,
          heroSubtitle: 'Reserve an express order pickup window or schedule a custom catering tasting.',
          announcement: 'Fresh Batches Ready · Express Pickup Window Live',
          primary: '#3C2A21',
          accent: '#D97706',
          bg: '#FEF3C7',
        };
      case 'boutique_clinic':
        return {
          serviceUnit: 'Consultation Suite',
          staffTitle: 'Doctor / Specialist',
          ctaText: 'Book Private Suite',
          heroTitle: `Welcome to ${orgName || 'Our Clinic'}`,
          heroSubtitle: 'Pre-clear your medical documents or insurance online for prompt consultation.',
          announcement: 'Private Suites Operating · Zero-Wait Triage',
          primary: '#0F766E',
          accent: '#14B8A6',
          bg: '#F0FDFA',
        };
      case 'banking':
        return {
          serviceUnit: 'Teller Window',
          staffTitle: 'Bank Officer',
          ctaText: 'Get Priority Window Ticket',
          heroTitle: `Welcome to ${orgName || 'Acme Bank'}`,
          heroSubtitle: 'Reserve a 30-minute arrival window or pre-clear your paperwork online.',
          announcement: 'Live Queue System Operating · Zero Walk-in Waiting',
          primary: '#0057B8',
          accent: '#00A3E0',
          bg: '#F4F8FC',
        };
      default:
        return {
          serviceUnit: scale === 'sme' ? 'Service Station' : 'Counter Window',
          staffTitle: scale === 'sme' ? 'Shop Associate' : 'Officer',
          ctaText: 'Book a Timed Ticket',
          heroTitle: `Welcome to ${orgName || 'Our Business'}`,
          heroSubtitle: 'Reserve a timed arrival window or pre-clear your documents online.',
          announcement: 'Live Queue Operating · Zero Walk-in Waiting',
          primary: '#291E29',
          accent: '#FFA800',
          bg: '#FFF6E9',
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'new-business';
    const def = getIndustryDefaults(industry, businessScale);

    const newTenant = await createTenant({
      name: orgName,
      slug: cleanSlug,
      industry,
      tagline: `Smart ${industry.replace('_', ' ')} customer queue and instant arrival window pre-clearance`,
      branding: {
        primaryColor: def.primary,
        secondaryColor: '#341539',
        accentColor: def.accent,
        backgroundColor: def.bg,
        textColor: '#291E29',
        fontFamily: 'Sora',
        heroTitle: def.heroTitle,
        heroSubtitle: def.heroSubtitle,
        announcementTicker: def.announcement,
        ctaButtonText: def.ctaText,
        contactEmail: email,
        contactPhone: phone,
        businessScale,
        serviceUnitName: def.serviceUnit,
        staffTitle: def.staffTitle,
      },
    });

    await login(email, phone, 'tenant_admin', newTenant.id, name);
    setLoading(false);
    // Route directly to the Website Customizer to select from 8 free themes
    router.push(`/tenant/${newTenant.slug}/staff/settings`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF6E9] p-4 sm:p-6 font-sans selection:bg-[#FFA800] selection:text-[#291E29] overflow-x-hidden">
      <div className="w-full max-w-lg rounded-3xl border border-[#291E29]/10 bg-white/95 p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LunaLogo size={42} showTagline />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[11px] font-extrabold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" />
            Free Subdomain · SMEs & Enterprises · 8 Free Themes
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[#291E29]">Create Your Free Business Portal</h2>
          <p className="text-xs text-[#291E29]/70">
            Claim your free <span className="font-bold font-mono">yourname.luna.com</span> site. Run your entire shop queue from any smartphone or tablet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Business Scale Selection (SME vs Enterprise) */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#291E29] flex items-center justify-between">
              <span>Business Size / Scale</span>
              <span className="text-[10px] text-slate-500 font-normal">Select your operation type</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBusinessScale('sme')}
                className={`flex flex-col p-3 rounded-2xl border text-left transition-all ${
                  businessScale === 'sme'
                    ? 'border-[#FFA800] bg-[#FFF6E9] ring-2 ring-[#FFA800]/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🏪</span>
                  {businessScale === 'sme' && (
                    <span className="h-2 w-2 rounded-full bg-[#FFA800]" />
                  )}
                </div>
                <span className="font-bold text-xs text-slate-900 mt-1">Small Business (SME)</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Salons, cafes, mechanics, clinics & local shops
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBusinessScale('enterprise')}
                className={`flex flex-col p-3 rounded-2xl border text-left transition-all ${
                  businessScale === 'enterprise'
                    ? 'border-[#FFA800] bg-[#FFF6E9] ring-2 ring-[#FFA800]/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🏛️</span>
                  {businessScale === 'enterprise' && (
                    <span className="h-2 w-2 rounded-full bg-[#FFA800]" />
                  )}
                </div>
                <span className="font-bold text-xs text-slate-900 mt-1">Enterprise / Multi-Branch</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Banks, hospitals, telecoms & government
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#291E29]">Your Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#702D7B]" />
                <input
                  type="text"
                  required
                  placeholder="Kemi Adebayo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-3 pl-10 pr-3 text-base sm:text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#291E29]">Work Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#702D7B]" />
                <input
                  type="email"
                  required
                  placeholder="owner@mybusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-3 pl-10 pr-3 text-base sm:text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#291E29] flex items-center justify-between">
                <span>Phone Number</span>
                <span className="text-[10px] text-slate-500 font-normal">SMS Alerts</span>
              </label>
              <div className="relative mt-1">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#702D7B]" />
                <input
                  type="tel"
                  required
                  placeholder="+234 802 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-3 pl-10 pr-3 text-base sm:text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#291E29]">Business / Shop Name</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[#702D7B]" />
                <input
                  type="text"
                  required
                  placeholder={businessScale === 'sme' ? "e.g. Kemi's Hair Lounge" : "e.g. Acme Bank"}
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-3 pl-10 pr-3 text-base sm:text-xs text-[#291E29] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                />
              </div>
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
            <div className="flex items-center rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/50 overflow-hidden focus-within:ring-2 focus-within:ring-[#FFA800] min-h-[44px]">
              <span className="px-3 text-xs font-bold text-[#291E29]/60 bg-[#291E29]/5 py-3 border-r border-[#291E29]/10">https://</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-shop"
                className="w-full bg-transparent px-3 py-3 text-base sm:text-xs font-bold font-mono text-[#291E29] focus:outline-none"
              />
              <span className="px-3 text-xs font-bold text-[#702D7B] bg-[#291E29]/5 py-3 border-l border-[#291E29]/10">.{platformDomain}</span>
            </div>
            <p className="text-[11px] text-[#291E29]/70 flex items-center gap-1 mt-1">
              <Globe className="h-3 w-3 text-[#FFA800]" /> Live Portal: <span className="font-bold text-[#291E29] font-mono">{customSubdomainPreview}</span>
            </p>
          </div>

          <div>
            <label className="font-bold text-[#291E29]">Business Industry Category</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as TenantIndustry)}
              className="mt-1 w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 p-3 text-base sm:text-xs text-[#291E29] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
            >
              <optgroup label="Small Businesses & Local Shops (SMEs)">
                <option value="salon_beauty">💇 Salons, Barbershops, Nails & Spas</option>
                <option value="auto_repair">🚗 Auto Repair, Mechanics & Oil Bays</option>
                <option value="cafe_bakery">🥐 Bakery, Specialty Coffee & Diners</option>
                <option value="boutique_clinic">🦷 Dental, Optical & Private Clinics</option>
                <option value="retail">🛍️ Retail Boutiques, Electronics & Fashion</option>
                <option value="professional">💼 Law, Tax, Accounting & Photo Studios</option>
              </optgroup>
              <optgroup label="Enterprises & Large Institutions">
                <option value="banking">🏦 Commercial & Microfinance Banking</option>
                <option value="healthcare">🏥 General & Specialist Hospitals</option>
                <option value="telecom">📱 Telecom & Internet Flagships</option>
                <option value="education">🎓 Colleges & University Registrars</option>
                <option value="government">🏛️ Government & Civic Centers</option>
              </optgroup>
              <option value="other">📦 Other Business</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#291E29]">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#702D7B]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-3 pl-10 pr-3 text-base sm:text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFA800] py-3.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-[1.02] disabled:opacity-50 min-h-[48px]"
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
