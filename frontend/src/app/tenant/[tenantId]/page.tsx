'use client';

import React, { use } from 'react';
import { getTenantBySlug } from '../../../lib/tenant';
import { TenantCustomerLayout } from '../../../components/layouts/TenantCustomerLayout';
import Link from 'next/link';
import {
  Ticket,
  Trophy,
  MapPin,
  ArrowRight,
  Radio,
  Globe,
  Sparkles,
  LogIn,
  UserCheck,
  Star,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Store,
  Scissors,
  Wrench,
  Coffee,
  Check,
  Camera,
  Heart,
  Calendar,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { MOCK_BRANCHES } from '../../../mock/branches';
import { MOCK_SERVICES, getTenantServices } from '../../../mock/services';
import { useAuth } from '../../../lib/auth';
import { CustomerAuthModal } from '../../../components/shared/CustomerAuthModal';
import { SentimentBadge } from '../../../components/shared/SentimentBadge';

export default function TenantCustomerPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [tenant, setTenant] = React.useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authDefaultTab, setAuthDefaultTab] = React.useState<'signin' | 'signup'>('signin');

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
  const services = getTenantServices(tenant.id);
  const basePath = `/tenant/${tenant.slug}`;
  const subdomainDisplay = `${tenant.slug}.luna.com`;

  // Determine if this storefront should render as an SME Boutique or an Enterprise Institution
  const isSme =
    tenant.branding?.templateLayout === 'sme_boutique' ||
    (tenant.businessScale === 'sme' && tenant.branding?.templateLayout !== 'enterprise_institutional') ||
    ['salon_beauty', 'auto_repair', 'cafe_bakery', 'boutique_clinic', 'professional'].includes(tenant.industry);

  const heroTitle =
    tenant.branding?.heroTitle ||
    (isSme
      ? `Welcome to ${tenant.name}`
      : `Welcome to ${tenant.name} Customer Portal`);

  const heroSubtitle =
    tenant.branding?.heroSubtitle ||
    (isSme
      ? `${tenant.tagline}. Reserve your styling chair, bay, or counter spot online to skip lobby waiting entirely.`
      : `${tenant.tagline}. Reserve a 30-minute priority window or pre-clear your documents online.`);

  const announcement =
    tenant.branding?.announcementTicker ||
    (isSme
      ? 'Chairs & Stations Operating · Walk-ins Welcome · Zero Queue Delay'
      : 'Live Queue System Operating · Zero Walk-in Waiting');

  const ctaText =
    tenant.branding?.ctaButtonText ||
    (isSme ? `Book a ${tenant.branding?.serviceUnitName || 'Spot / Chair'}` : 'Book a Timed Ticket');

  const shopPhone = tenant.ownerPhone || '+234 809 445 5667';
  const shopAddress = branches[0]?.address || `${tenant.area || 'Central District'}, ${tenant.city || 'Lagos'}`;

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      {isSme ? (
        /* =========================================================================
           🌸 DEDICATED SME BOUTIQUE & LOCAL SHOP TEMPLATE
           ========================================================================= */
        <div className="space-y-12 sm:space-y-16 pb-20 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
          
          {/* 1. SME Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-[var(--tenant-primary,#831843)]/10 via-[var(--tenant-bg,#FFF1F2)] to-[var(--tenant-bg,#FFF1F2)] py-12 sm:py-16 border-b border-black/5">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
              
              {/* Business Brand Logo */}
              {tenant.branding?.logoUrl ? (
                <div className="flex justify-center mb-3">
                  <img
                    src={tenant.branding.logoUrl}
                    alt={tenant.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-3xl bg-white p-2.5 shadow-lg border border-black/10"
                  />
                </div>
              ) : (
                <div className="flex justify-center mb-3">
                  <div
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-lg border-2 border-white"
                    style={{ backgroundColor: tenant.branding?.primaryColor || '#831843' }}
                  >
                    {tenant.name[0]}
                  </div>
                </div>
              )}

              {/* SME Storefront Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#291E29] text-white px-3 py-1.5 text-[11px] font-bold shadow-xs">
                  <Store className="h-3.5 w-3.5 text-[#FFA800]" />
                  <span>Local Small Business Storefront</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 text-[11px] font-extrabold text-emerald-900 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Open Today · Walk-Ins Welcome · Next Spot ~5 Mins</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-black/10 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-xs">
                  <Globe className="h-3.5 w-3.5 text-sky-500" />
                  <span className="font-mono text-sky-700">{subdomainDisplay}</span>
                </span>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-3 max-w-3xl mx-auto">
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  {heroSubtitle}
                </p>
              </div>

              {/* SME Direct Booking & Review Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-md mx-auto w-full">
                <Link
                  href={`${basePath}/book-queue`}
                  className="flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-extrabold text-white shadow-xl hover:scale-105 active:scale-95 transition-transform min-h-[50px]"
                  style={{ backgroundColor: tenant.branding?.accentColor || tenant.branding?.primaryColor || '#831843' }}
                >
                  <Ticket className="h-4 w-4" />
                  <span>{ctaText}</span>
                </Link>

                <Link
                  href={`${basePath}/leaderboard`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xs sm:text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 min-h-[50px] transition-colors"
                >
                  <Trophy className="h-4 w-4 text-[#FFA800]" />
                  <span>★ 4.9 Reviews &amp; Rankings</span>
                </Link>
              </div>

              {/* Direct Phone & Address Strip for SME */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
                <a
                  href={`tel:${shopPhone}`}
                  className="inline-flex items-center gap-1.5 hover:text-[#FFA800] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#FFA800]" />
                  <span>Direct Line: <strong className="text-slate-900">{shopPhone}</strong></span>
                </a>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#FFA800]" />
                  <span>{shopAddress}</span>
                </span>
              </div>
            </div>
          </section>

          {/* 2. Customer VIP Account Callout */}
          <section className="mx-auto max-w-5xl px-4 sm:px-6 -mt-8">
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {user && user.role === 'customer' ? (
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <UserCheck className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Signed In as {user.name}</h3>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5">
                        VIP Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phone: <span className="font-mono text-slate-700 font-semibold">{user.phone || 'SMS Linked'}</span> · Choose any service below to auto-fill your booking details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-[#FFA800]/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-[#291E29]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Customer Access &amp; VIP Perks</h3>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5">
                        Free VIP Account
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Log in when requesting a service to get instant SMS queue alerts, skip lobby waiting, and save your tickets.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {user && user.role === 'customer' ? (
                  <Link
                    href={`${basePath}/book-queue`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs font-bold hover:bg-slate-800 transition shrink-0 min-h-[44px]"
                  >
                    <span>Book Service Spot</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthDefaultTab('signin');
                        setAuthModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 px-4 py-3 text-xs font-bold hover:bg-slate-50 transition min-h-[44px]"
                    >
                      <LogIn className="h-3.5 w-3.5 text-slate-500" />
                      <span>Log In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthDefaultTab('signup');
                        setAuthModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs font-bold hover:bg-slate-800 transition min-h-[44px]"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* 3. SME Lookbook & Pre-Clearance Card */}
          <section className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border border-black/10 bg-gradient-to-r from-white via-amber-50/50 to-white p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#FFA800]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Camera className="h-6 w-6 text-[#291E29]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      Pre-Clear Your Style or Fault Checklist
                    </h3>
                    <span className="rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 border border-amber-200">
                      Save 15 Mins
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    Upload your desired hair braid lookbook, vehicle diagnostic sheet, or custom bakery design before you arrive. Your {tenant.branding?.serviceUnitName?.toLowerCase() || 'station'} will be prepared in advance!
                  </p>
                </div>
              </div>

              <Link
                href={`${basePath}/book-queue`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#291E29] text-[#FFF6E9] px-5 py-3 text-xs font-extrabold hover:bg-[#341539] transition shrink-0 min-h-[44px]"
              >
                <span>Pre-Clear on Phone</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
              </Link>
            </div>
          </section>

          {/* 4. SME Services Menu with Pricing & Stations */}
          <section className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FFA800]">
                  Service Menu &amp; Transparent Rates
                </span>
                <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Sparkles className="h-5 w-5 text-[#FFA800]" />
                  Services &amp; Station Pricing
                </h2>
                <p className="text-xs text-slate-500">
                  Select your service to lock in your priority window and assigned {tenant.branding?.serviceUnitName?.toLowerCase() || 'specialist'}.
                </p>
              </div>

              <span className="text-[11px] font-bold text-slate-400">
                {services.length} Services Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={`${basePath}/book-queue?service=${s.id}`}
                  className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-[#FFA800] hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Service Image Banner */}
                    {s.imageUrl ? (
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Price Badge Overlay */}
                        <span className="absolute top-3 right-3 rounded-xl bg-[#291E29]/90 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-extrabold text-[#FFA800] shadow-md">
                          {s.price || 'From ₦8,500'}
                        </span>

                        {/* Station Overlay */}
                        {s.station && (
                          <span className="absolute bottom-3 left-3 text-white text-[11px] font-semibold drop-shadow-sm flex items-center gap-1">
                            📍 {s.station}
                          </span>
                        )}
                      </div>
                    ) : null}

                    <div className="p-5 space-y-3">
                      {/* Header (if no image, show price badge here) */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#FFA800] transition-colors leading-snug">
                            {s.name}
                          </h3>
                          {!s.imageUrl && s.station && (
                            <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                              📍 {s.station}
                            </span>
                          )}
                        </div>

                        {!s.imageUrl && (
                          <span className="rounded-xl bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-extrabold text-amber-900 shrink-0">
                            {s.price || 'From ₦8,500'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {s.description}
                      </p>

                      {/* Calendar & Time of Day Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                        {s.availableDays && s.availableDays.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-100">
                            <Calendar className="h-2.5 w-2.5" />
                            {s.availableDays.length >= 6 ? 'Mon - Sat' : s.availableDays.join(', ')}
                          </span>
                        )}
                        {s.timeOfDay && s.timeOfDay.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-bold border border-amber-200/60">
                            <Sun className="h-2.5 w-2.5 text-amber-600" />
                            {s.timeOfDay.join(' & ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      ~{s.minutes} mins
                    </span>

                    <span className="inline-flex items-center gap-1.5 font-extrabold text-[#291E29] group-hover:text-[#FFA800] transition-colors">
                      <span>Reserve Priority Spot</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#FFA800] group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 5. Verified Customer Reviews & Community Ratings */}
          <section className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                  Customer Praise
                </span>
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Star className="h-5 w-5 fill-[#FFA800] text-[#FFA800]" />
                  What Local Customers Are Saying
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                <span>4.9 / 5.0 Average (280+ Verified Visits)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <SentimentBadge sentiment="positive" size="sm" showEmoji />
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;Never sitting in a salon lobby for 3 hours again! Reserved my chair on Luna from my phone, arrived on time, and sat right down.&rdquo;
                </p>
                <div className="text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100 flex justify-between items-center">
                  <span>Chioma E. · Chair 1</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Verified Timed Pass
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <SentimentBadge sentiment="positive" size="sm" showEmoji />
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;Uploaded my fault code sheet before driving over. My bay was ready and the lead technician had the diagnostic tool waiting!&rdquo;
                </p>
                <div className="text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100 flex justify-between items-center">
                  <span>Dayo A. · Bay 1</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Verified Timed Pass
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <SentimentBadge sentiment="positive" size="sm" showEmoji />
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;Pre-ordered on the way to work, tapped my phone ticket, and walked out with my order in under 45 seconds. Fantastic!&rdquo;
                </p>
                <div className="text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100 flex justify-between items-center">
                  <span>Zainab K. · Window 1</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Verified Timed Pass
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. SME Location & Operating Hours */}
          <section className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                    <MapPin className="h-5 w-5 text-[#FFA800]" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{tenant.name} Studio</h3>
                    <p className="text-xs text-slate-500">{shopAddress}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 pl-11">
                  Walk-ins welcome daily. Digital arrival tickets skip the physical line upon arrival.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                <a
                  href={`tel:${shopPhone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition min-h-[44px]"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-600" />
                  <span>Call {shopPhone}</span>
                </a>

                <Link
                  href={`${basePath}/book-queue`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#291E29] px-6 py-3 text-xs font-extrabold text-white hover:bg-[#341539] transition shadow-md min-h-[44px]"
                >
                  <Ticket className="h-3.5 w-3.5 text-[#FFA800]" />
                  <span>Get Fast-Track Pass</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* =========================================================================
           🏢 ENTERPRISE & INSTITUTIONAL TEMPLATE (Banks, Hospitals, Telecoms)
           ========================================================================= */
        <div className="space-y-16 pb-20">
          {/* Dynamic Customizable Tenant Hero Banner */}
          <section className="relative overflow-hidden bg-gradient-to-b from-[var(--tenant-primary,#291E29)]/10 via-[var(--tenant-bg,#FFF6E9)] to-[var(--tenant-bg,#FFF6E9)] py-16">
            <div className="mx-auto max-w-6xl px-6 text-center space-y-6">
              
              {/* Business Brand Logo if uploaded */}
              {tenant.branding?.logoUrl && (
                <div className="flex justify-center mb-2">
                  <img
                    src={tenant.branding.logoUrl}
                    alt={tenant.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-2xl bg-white p-2 shadow-md border border-black/10"
                  />
                </div>
              )}

              {/* Subdomain Badge */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-sm">
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                  Custom Subdomain: <span className="text-sky-300 font-mono">{subdomainDisplay}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 border border-emerald-200">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                  {announcement}
                </span>
              </div>

              {/* Title & Tagline */}
              <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-5xl leading-tight max-w-4xl mx-auto">
                {heroTitle}
              </h1>

              <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
                {heroSubtitle}
              </p>

              {/* Custom CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-sm sm:max-w-none mx-auto w-full">
                <Link
                  href={`${basePath}/book-queue`}
                  className="flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 min-h-[48px]"
                  style={{ backgroundColor: tenant.branding?.primaryColor || '#0057B8' }}
                >
                  <Ticket className="h-4 w-4" />
                  <span>{ctaText}</span>
                </Link>
                <Link
                  href={`${basePath}/leaderboard`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 min-h-[48px]"
                >
                  <Trophy className="h-4 w-4 text-[#FFA800]" />
                  <span>Service Leaderboard &amp; Ratings</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Customer Account VIP Banner on Template */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 -mt-8">
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {user && user.role === 'customer' ? (
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <UserCheck className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Signed In as {user.name}</h3>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5">
                        VIP Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phone: <span className="font-mono text-slate-700 font-semibold">{user.phone || 'SMS Linked'}</span> · Choose any service below to auto-fill booking details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-[#FFA800]/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-[#291E29]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Customer Access &amp; VIP Perks</h3>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5">
                        Free VIP Account
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Log in when booking a service to get instant SMS queue alerts, bypass lobby queues, and track your history.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {user && user.role === 'customer' ? (
                  <Link
                    href={`${basePath}/book-queue`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs font-bold hover:bg-slate-800 transition shrink-0 min-h-[44px]"
                  >
                    <span>Book a Service</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthDefaultTab('signin');
                        setAuthModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 px-4 py-3 text-xs font-bold hover:bg-slate-50 transition min-h-[44px]"
                    >
                      <LogIn className="h-3.5 w-3.5 text-slate-500" />
                      <span>Log In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthDefaultTab('signup');
                        setAuthModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs font-bold hover:bg-slate-800 transition min-h-[44px]"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Available Services */}
          <section className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--tenant-primary,#0057B8)]" />
                  Services &amp; Priority Windows
                </h2>
                <p className="text-xs text-slate-500">
                  Select an institutional counter service to request a digital arrival ticket.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={`${basePath}/book-queue?service=${s.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 hover:border-[#FFA800] hover:shadow-md transition-all cursor-pointer block"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#FFA800] transition-colors">{s.name}</h3>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      ~{s.minutes} mins
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--tenant-primary,#291E29)] group-hover:underline">
                      <span>Book Counter Window</span>
                      <ArrowRight className="h-3 w-3 text-[#FFA800]" />
                    </div>
                    {!user && (
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600">
                        Login &amp; Reserve &rarr;
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Location & Opening Hours */}
          {branches.length > 0 && (
            <section className="mx-auto max-w-6xl px-6">
              <div className="border-b border-slate-200/60 pb-4">
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--tenant-primary,#0057B8)]" />
                  Branch Network &amp; Operational Hours
                </h2>
                <p className="text-xs text-slate-500">
                  Find your nearest branch or institutional service hub.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 capitalize">
                        {b.liveLoad} Load
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{b.address}</span>
                    </p>
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>Open until: <strong className="text-slate-700">{b.openUntil}</strong></span>
                      <span className="text-emerald-600 font-bold">~{b.waitMin} min wait</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Customer Authentication Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        tenant={tenant}
        defaultTab={authDefaultTab}
      />
    </TenantCustomerLayout>
  );
}
