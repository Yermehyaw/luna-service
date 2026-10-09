'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LunaLogo } from '../../components/shared/LumaMark';
import { ArrowRight, Radio, Sparkles, ShieldCheck, Ticket, Users, Clock, Globe } from 'lucide-react';
import { MOCK_TENANTS } from '../../mock/tenants';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#FFF6E9] text-[#291E29] flex flex-col font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
      {/* Sticky Header with Luna Branding */}
      <header className="border-b border-[#291E29]/10 bg-[#FFF6E9]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <LunaLogo size={40} showTagline />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-bold text-[#291E29] hover:text-[#702D7B] transition-colors"
            >
              Staff Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#FFA800] px-4 py-2.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-105"
            >
              Register Business Subdomain
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-24 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-12 px-6">
          <div className="mx-auto max-w-5xl text-center space-y-6">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#341539]/10 px-4 py-1.5 text-xs font-bold text-[#341539] border border-[#341539]/20 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" />
              <span className="font-semibold">Beyond the Expected</span>
              <span className="text-slate-300">·</span>
              <span className="text-[#702D7B]">Intelligent Queue Architecture v2.0</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#291E29] tracking-tight leading-[1.15]">
              Customer Service & Digital Queues{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#291E29] via-[#702D7B] to-[#FFA800]">
                Built for Africa & the World
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-[#291E29]/80 leading-relaxed font-normal">
              One unified platform powering timed arrival windows, home document pre-clearance, branch collaboration, and zero-wait counter service for banks, hospitals, universities, and telecom flagships.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-2xl bg-[#FFA800] px-7 py-4 text-sm font-extrabold text-[#291E29] shadow-xl shadow-[#FFA800]/30 hover:bg-[#FFB11A] hover:scale-105 transition-all"
              >
                <span>Get Your Business Subdomain</span>
                <ArrowRight className="h-4 w-4 text-[#291E29]" />
              </Link>
              <Link
                href="/tenant/acme-bank"
                className="flex items-center gap-2 rounded-2xl bg-[#291E29] px-7 py-4 text-sm font-bold text-[#FFF6E9] shadow-lg hover:bg-[#341539] hover:scale-105 transition-all"
              >
                <span>Explore Live Acme Bank Demo</span>
                <Globe className="h-4 w-4 text-[#FFA800]" />
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left text-xs">
              <div className="rounded-2xl border border-[#291E29]/10 bg-white/70 p-4 shadow-sm backdrop-blur-sm space-y-1">
                <span className="font-bold text-[#291E29] flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#FFA800]" /> 30-Min Arrival Windows
                </span>
                <p className="text-[#291E29]/70 text-[11px]">Customers book timed slots from home, bypassing lobby crowds.</p>
              </div>

              <div className="rounded-2xl border border-[#291E29]/10 bg-white/70 p-4 shadow-sm backdrop-blur-sm space-y-1">
                <span className="font-bold text-[#291E29] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#702D7B]" /> Paperwork Pre-Clearance
                </span>
                <p className="text-[#291E29]/70 text-[11px]">Upload IDs and forms online for instant verification at the desk.</p>
              </div>

              <div className="rounded-2xl border border-[#291E29]/10 bg-white/70 p-4 shadow-sm backdrop-blur-sm space-y-1">
                <span className="font-bold text-[#291E29] flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-[#FFA800]" /> Dedicated Subdomains
                </span>
                <p className="text-[#291E29]/70 text-[11px]">Instant branded portal with custom theme colors and live tracking.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Multi-Tenant Showcase */}
        <section className="mx-auto max-w-6xl px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#702D7B] uppercase tracking-widest">Multi-Tenant Engine</span>
            <h2 className="font-display text-3xl font-extrabold text-[#291E29]">Organizations Operating on Luna</h2>
            <p className="text-xs text-[#291E29]/70 max-w-xl mx-auto">
              Every organization runs on the same unified frontend codebase with custom branding, dynamic colors, and tailored feature modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_TENANTS.map((tenant) => (
              <div
                key={tenant.id}
                className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-6 shadow-sm space-y-4 hover:shadow-xl hover:border-[#FFA800]/50 transition-all backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#341539]/10 px-3 py-1 text-[11px] font-bold text-[#341539] capitalize">
                    {tenant.industry}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Radio className="h-3 w-3 animate-pulse text-emerald-600" /> Live Tenant
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-[#291E29] text-lg">{tenant.name}</h3>
                  <p className="text-xs text-[#291E29]/70 mt-1 leading-relaxed">{tenant.tagline}</p>
                </div>

                <div className="pt-3 border-t border-[#291E29]/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#291E29]/70">Rating: ★ {tenant.rating}</span>
                  <Link
                    href={`/tenant/${tenant.slug}`}
                    className="font-extrabold text-[#291E29] hover:text-[#702D7B] flex items-center gap-1.5 group"
                  >
                    <span>View Portal</span>
                    <ArrowRight className="h-3 w-3 text-[#FFA800] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Promise Section - Beyond the Expected */}
        <section className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl bg-gradient-to-r from-[#291E29] via-[#341539] to-[#52215A] text-[#FFF6E9] p-10 sm:p-14 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#FFA800] tracking-wider uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" /> Luna Brand Promise
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFF6E9] tracking-tight">
                Move Beyond the Expected.
              </h3>
              <p className="text-sm text-[#FFF6E9]/80 leading-relaxed">
                Empowering businesses and institutions with structure, oversight, and warmth. Create human experiences in digital environments with zero waiting line friction.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FFA800] px-6 py-3 text-xs font-extrabold text-[#291E29] shadow-lg shadow-[#FFA800]/30 hover:bg-[#FFB11A] transition-all"
                >
                  <span>Launch Your Portal Today</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#291E29]/10 bg-[#FFF6E9] py-10 text-center text-xs text-[#291E29]/60">
        <div className="mx-auto max-w-6xl px-6 space-y-3">
          <div className="flex justify-center">
            <LunaLogo size={32} />
          </div>
          <p>© 2026 Luna. Beyond the Expected. Multi-Tenant Intelligent Queue Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}
