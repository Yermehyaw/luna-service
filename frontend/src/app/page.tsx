'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Ticket,
  FileCheck2,
  Building2,
  Network,
  Megaphone,
  Clock,
  Sparkles,
  CheckCircle2,
  Users,
  ShieldCheck,
  Radio,
  ExternalLink,
  ChevronRight,
  Zap,
  Globe,
  Palette,
  Bot,
  Laptop,
} from 'lucide-react';
import { LunaLogo } from '../components/shared/LunaMark';

const STATS = [
  { value: '480,000+', label: 'Tickets Issued' },
  { value: '3.8 mins', label: 'Average Wait Time' },
  { value: '94.2%', label: 'On-Time Arrival Rate' },
  { value: '100% Free', label: 'Custom Subdomain & Themes' },
];

const MODULES = [
  {
    id: 'queue',
    icon: Ticket,
    title: 'Smart Queuing & Timed Tickets',
    tag: 'Customer Arrival',
    desc: 'Customers reserve a timed 30-minute priority window from their phone. No crowded lobby lines, no dawn waiting, no wasted hours.',
    points: ['Timed arrival windows', 'Real-time queue tracking & audio caller', 'One-click walk-in triage'],
    href: '/tenant/acme-bank/book-queue',
    cta: 'Try Customer Booking',
    accentColor: '#FFA800',
  },
  {
    id: 'ops',
    icon: Users,
    title: 'Branch Operations Console',
    tag: 'Staff & Counter',
    desc: 'Counter officers triage arrivals, call tickets with audio announcements, monitor SLA duration, and skip no-shows in real-time.',
    points: ['Live WebSocket ticket feed', 'Instant audio chime broadcasts', 'Counter & window assignment'],
    href: '/tenant/acme-bank/staff/ops-console',
    cta: 'Open Staff Console',
    accentColor: '#BA68D7',
  },
  {
    id: 'verify',
    icon: FileCheck2,
    title: 'Instant Document Pre-Clearance',
    tag: 'Zero-Wait Desk',
    desc: 'Upload IDs, receipts, and proofs before visiting. Customers arrive pre-cleared and move straight to service execution.',
    points: ['Automated pre-triage scan', 'Instant document pass check', 'Integrated into queue ticket'],
    href: '/tenant/acme-bank/verify',
    cta: 'Pre-Clear Documents',
    accentColor: '#12A05A',
  },
  {
    id: 'social',
    icon: Megaphone,
    title: 'Social Studio & AI Broadcasts',
    tag: 'Live Announcements',
    desc: 'Publish instant ticker announcements directly to customer portals, and draft messages with built-in Groq AI presets.',
    points: ['Public portal announcement tickers', 'Groq AI response & copy generation', 'Broadcast history log'],
    href: '/tenant/acme-bank/staff/social-studio',
    cta: 'Launch Social Studio',
    accentColor: '#0057B8',
  },
];

const THEMES_PREVIEW = [
  { name: 'Luna Classic', primary: '#291E29', accent: '#FFA800', bg: '#FFF6E9' },
  { name: 'Emerald Hospital', primary: '#12A05A', accent: '#17B568', bg: '#F3FBF6' },
  { name: 'Royal Banking', primary: '#0057B8', accent: '#00A3E0', bg: '#F4F8FC' },
  { name: 'Solar Telecom', primary: '#FF8A00', accent: '#F45B16', bg: '#FFF8F0' },
  { name: 'Midnight Luxe', primary: '#0F172A', accent: '#38BDF8', bg: '#F8FAFC' },
  { name: 'Rose Quartz', primary: '#9D174D', accent: '#F43F5E', bg: '#FFF1F2' },
  { name: 'Slate Modern', primary: '#334155', accent: '#64748B', bg: '#F1F5F9' },
  { name: 'Sunset Crimson', primary: '#991B1B', accent: '#EF4444', bg: '#FEF2F2' },
];

const TENANTS = [
  {
    name: 'Acme Bank',
    slug: 'acme-bank',
    industry: 'Retail & Business Banking',
    desc: 'Priority teller windows, timed cash deposit intake, and foreign exchange queues.',
    badge: 'Banking Flagship',
    color: '#0057B8',
  },
  {
    name: 'City General Hospital',
    slug: 'city-hospital',
    industry: 'Healthcare & Clinical Triage',
    desc: 'Outpatient consultation windows, pre-cleared lab diagnostics, and emergency triage.',
    badge: 'Healthcare Hub',
    color: '#12A05A',
  },
  {
    name: 'Luna Mobile & Fiber',
    slug: 'luna-telecom',
    industry: 'Telecom & High-Speed Internet',
    desc: 'Express SIM replacement, biometric re-registration, and device pickup appointments.',
    badge: 'Telecom Retail',
    color: '#FF8A00',
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'queue' | 'ops' | 'verify' | 'social'>('queue');
  const [claimedName, setClaimedName] = useState('');

  const currentModule = MODULES.find((m) => m.id === activeTab) || MODULES[0];

  return (
    <div className="min-h-screen bg-[#FFF6E9] text-[#291E29] selection:bg-[#FFA800] selection:text-[#291E29] font-sans">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-[#291E29] text-[#FFF6E9] py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 border-b border-[#341539]">
        <span className="flex h-2 w-2 rounded-full bg-[#FFA800] animate-pulse" />
        <span>
          <strong>Luna 2.0 is Live:</strong> Multi-tenant real-time queue WebSockets, FastAPI backend, and free subdomains (`yourname.luna.com`).
        </span>
        <Link href="/register" className="underline font-bold text-[#FFA800] hover:text-white ml-1">
          Claim Free Subdomain &rarr;
        </Link>
      </div>

      {/* 2. NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#FFF6E9]/90 backdrop-blur-md border-b border-[#291E29]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <LunaLogo size={34} variant="dark" showTagline />
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#291E29]/80">
              <a href="#features" className="hover:text-[#291E29] transition-colors">
                Solutions
              </a>
              <a href="#subdomains" className="hover:text-[#291E29] transition-colors">
                Free Subdomains
              </a>
              <a href="#themes" className="hover:text-[#291E29] transition-colors">
                8 Themes
              </a>
              <a href="#tenants" className="hover:text-[#291E29] transition-colors">
                Live Portals
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-[#291E29] hover:bg-[#291E29]/5 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-xs font-extrabold bg-[#291E29] text-[#FFF6E9] hover:bg-[#341539] rounded-xl shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#291E29]/5 border border-[#291E29]/10 px-4 py-1.5 text-xs font-bold text-[#291E29]">
                <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" />
                <span>Next-Gen Enterprise Queue & Operations Infrastructure</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#291E29] leading-[1.08] tracking-tight">
                Integrated customer service.{' '}
                <span className="text-[#FFA800]">Never queue again.</span>{' '}
                Keep your day.
              </h1>

              <p className="text-base sm:text-lg text-[#291E29]/75 max-w-2xl leading-relaxed">
                Luna provides banks, hospitals, telecoms, and enterprises with an intelligent customer service delivery system.
                Timed arrival tickets, document pre-clearance from home, real-time counter triage, and instant AI broadcasts—all from your dedicated <strong>free subdomain</strong> (`yourname.luna.com`).
              </p>

              {/* Subdomain Quick Claim Input */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-[#291E29]/15 shadow-xl flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 rounded-xl text-xs font-mono">
                  <span className="text-slate-400 select-none">https://</span>
                  <input
                    type="text"
                    placeholder="your-business"
                    value={claimedName}
                    onChange={(e) => setClaimedName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-transparent font-bold text-[#291E29] focus:outline-none w-full px-1"
                  />
                  <span className="text-slate-400 select-none font-semibold">.luna.com</span>
                </div>
                <Link
                  href={`/register?subdomain=${encodeURIComponent(claimedName || 'mybusiness')}`}
                  className="rounded-xl bg-[#291E29] px-6 py-3 text-xs font-extrabold text-[#FFF6E9] hover:bg-[#341539] transition flex items-center justify-center gap-2 shadow-md shrink-0"
                >
                  <Globe className="h-4 w-4 text-[#FFA800]" />
                  <span>Claim Free Domain</span>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/tenant/acme-bank"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#291E29] px-5 py-3 text-xs font-extrabold text-[#FFF6E9] shadow-md hover:bg-[#341539] transition"
                >
                  <Ticket className="h-4 w-4 text-[#FFA800]" />
                  <span>Explore Acme Bank Portal</span>
                </Link>
                <Link
                  href="/tenant/acme-bank/staff/ops-console"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#291E29]/20 bg-white px-5 py-3 text-xs font-bold text-[#291E29] shadow-xs hover:bg-slate-50 transition"
                >
                  <Laptop className="h-4 w-4 text-[#BA68D7]" />
                  <span>Open Staff Ops Console</span>
                </Link>
              </div>

              {/* Stat badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#291E29]/10">
                {STATS.map((s, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-xl sm:text-2xl font-extrabold text-[#291E29] font-display">
                      {s.value}
                    </div>
                    <div className="text-[11px] text-[#291E29]/65 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive App Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border-2 border-[#291E29] bg-[#291E29] text-[#FFF6E9] p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFA800]/10 rounded-full blur-3xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Acme Bank · Lekki Flagship</h4>
                      <p className="text-[11px] text-[#FFF6E9]/60 font-mono">acme-bank.luna.com</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FFA800] text-[#291E29] text-[10px] font-extrabold px-2.5 py-0.5 uppercase">
                    Live Queue
                  </span>
                </div>

                {/* Live Counter Display */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#FFA800] font-bold flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 animate-pulse" /> Counter 1 · Now Serving
                    </span>
                    <span className="text-white/60 font-mono text-[10px]">Just Now</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-3xl font-extrabold text-[#FFA800] bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                      AC-9BY3B
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">Ada Lovelace</div>
                      <div className="text-[11px] text-[#FFF6E9]/70">Teller & Cash Deposit (~5 min)</div>
                    </div>
                  </div>
                </div>

                {/* Live Waiting Queue List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-white/70 flex justify-between">
                    <span>Up Next in Lobby</span>
                    <span className="text-[#FFA800]">2 Waiting</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-xs border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg">
                        AC-102
                      </span>
                      <span>Babajide Cole</span>
                    </div>
                    <span className="text-[11px] text-white/60">~4 mins wait</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-xs border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-300 bg-white/10 px-2 py-1 rounded-lg">
                        AC-103
                      </span>
                      <span>Chidinma Vance</span>
                    </div>
                    <span className="text-[11px] text-white/60">~9 mins wait</span>
                  </div>
                </div>

                {/* Quick Action Links inside Hero Preview */}
                <div className="pt-2 flex gap-3">
                  <Link
                    href="/tenant/acme-bank/book-queue"
                    className="flex-1 rounded-xl bg-[#FFA800] py-2.5 text-xs font-extrabold text-[#291E29] text-center shadow-md hover:bg-[#ffb31a] transition"
                  >
                    Book Priority Ticket
                  </Link>
                  <Link
                    href="/tenant/acme-bank/track"
                    className="flex-1 rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white text-center hover:bg-white/15 transition border border-white/10"
                  >
                    Track Live Position
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM MODULES / SOLUTIONS */}
      <section id="features" className="py-20 bg-white border-y border-[#291E29]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFA800] bg-[#291E29] px-3.5 py-1 rounded-full">
              Full-Stack Platform
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#291E29]">
              Everything businesses need to eliminate queues and delight customers
            </h2>
            <p className="text-xs sm:text-sm text-[#291E29]/70">
              Each module is fully interactive, multi-tenant enabled, and synchronizes live via WebSocket.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  className="rounded-3xl border border-[#291E29]/10 bg-[#FFF6E9]/40 p-6 flex flex-col justify-between hover:border-[#291E29]/30 transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="rounded-2xl p-3 text-white shadow-md"
                        style={{ backgroundColor: m.accentColor }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-200 text-[#291E29]">
                        {m.tag}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-[#291E29]">{m.title}</h3>
                    <p className="text-xs text-[#291E29]/75 leading-relaxed">{m.desc}</p>

                    <ul className="space-y-2 pt-2 border-t border-[#291E29]/10 text-xs">
                      {m.points.map((pt, i) => (
                        <li key={i} className="flex items-center gap-2 text-[#291E29]/80 text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={m.href}
                      className="w-full flex items-center justify-between rounded-xl bg-[#291E29] px-4 py-2.5 text-xs font-bold text-[#FFF6E9] hover:bg-[#341539] transition group-hover:scale-[1.02]"
                    >
                      <span>{m.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FREE SUBDOMAINS & 8 THEMES SHOWCASE */}
      <section id="subdomains" className="py-20 bg-[#FFF6E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Subdomain Feature Info */}
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#291E29] bg-[#FFA800] px-3.5 py-1 rounded-full">
                Zero Setup Cost
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#291E29] leading-tight">
                Every business gets a free branded domain:{' '}
                <span className="text-[#BA68D7]">yourname.luna.com</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#291E29]/75 leading-relaxed">
                When you create an account, you instantly claim your own dedicated subdomain. Your customers visit your clean URL to book appointments and track arrival times, while your staff manage queues on private operations consoles.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#291E29]/10">
                  <Globe className="h-5 w-5 text-[#FFA800] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#291E29]">Automatic DNS & Multi-Tenant Routing</h4>
                    <p className="text-slate-500 text-[11px]">Instant provisioning with zero manual setup. Handled transparently by Next.js edge routing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#291E29]/10">
                  <Palette className="h-5 w-5 text-[#BA68D7] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#291E29]">8 Free Curated Themes + AI Styler</h4>
                    <p className="text-slate-500 text-[11px]">Switch between 8 palettes instantly or chat with AI to generate a custom look for your brand.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#291E29] px-6 py-3 text-xs font-extrabold text-[#FFF6E9] hover:bg-[#341539] transition shadow-md"
                >
                  <span>Claim Your Free Subdomain</span>
                  <ArrowRight className="h-4 w-4 text-[#FFA800]" />
                </Link>
              </div>
            </div>

            {/* 8 Themes Grid Preview */}
            <div id="themes" className="rounded-3xl border border-[#291E29]/15 bg-white p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#291E29] flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[#FFA800]" /> 8 Free Theme Presets
                  </h3>
                  <p className="text-slate-400 text-[11px]">One-click theme switching in Settings</p>
                </div>
                <span className="text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 px-3 py-1">
                  100% Free
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {THEMES_PREVIEW.map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 p-3 space-y-2 hover:border-[#FFA800] transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: t.primary }} />
                      <div className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: t.accent }} />
                      <div className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: t.bg }} />
                    </div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-800 group-hover:text-[#291E29]">
                        {t.name}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">{t.primary}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#BA68D7]" />
                  <span className="font-semibold text-slate-700">Need a unique look?</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Chat with <strong>Groq AI Studio</strong> inside Tenant Settings
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LIVE TENANTS PORTAL DIRECTORY */}
      <section id="tenants" className="py-20 bg-white border-t border-[#291E29]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BA68D7] bg-[#291E29] px-3.5 py-1 rounded-full">
              Live Interactive Demos
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#291E29]">
              Explore sample business tenants
            </h2>
            <p className="text-xs text-[#291E29]/70">
              Test customer booking, document clearance, and staff ops consoles on pre-configured enterprise portals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TENANTS.map((tenant) => (
              <div
                key={tenant.slug}
                className="rounded-3xl border border-[#291E29]/15 bg-[#FFF6E9]/50 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="rounded-full bg-white border border-[#291E29]/10 px-3 py-1 text-[11px] font-bold text-[#291E29]">
                      {tenant.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{tenant.slug}.luna.com</span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-[#291E29]">{tenant.name}</h3>
                    <p className="text-[11px] font-semibold text-[#BA68D7] mt-0.5">{tenant.industry}</p>
                  </div>

                  <p className="text-xs text-[#291E29]/70 leading-relaxed">{tenant.desc}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#291E29]/10 text-xs">
                  <Link
                    href={`/tenant/${tenant.slug}`}
                    className="w-full flex items-center justify-between rounded-xl bg-[#291E29] px-4 py-2.5 font-bold text-[#FFF6E9] hover:bg-[#341539] transition"
                  >
                    <span>View Customer Portal</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/tenant/${tenant.slug}/book-queue`}
                      className="rounded-xl border border-[#291E29]/20 bg-white py-2 text-center text-[11px] font-bold text-[#291E29] hover:bg-slate-50 transition"
                    >
                      Book Ticket
                    </Link>
                    <Link
                      href={`/tenant/${tenant.slug}/staff/ops-console`}
                      className="rounded-xl border border-[#291E29]/20 bg-white py-2 text-center text-[11px] font-bold text-[#291E29] hover:bg-slate-50 transition"
                    >
                      Staff Console
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#291E29] text-[#FFF6E9] py-14 border-t border-[#341539]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4 md:col-span-2">
              <LunaLogo size={36} variant="light" showTagline />
              <p className="text-xs text-[#FFF6E9]/65 max-w-sm leading-relaxed">
                Luna is the next-generation multi-tenant platform for queue triage, arrival ticketing, and automated customer operations.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Backend: FastAPI @ 127.0.0.1:8000</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#FFA800] uppercase tracking-wider text-[11px]">Solutions</h4>
              <ul className="space-y-2 text-[#FFF6E9]/75">
                <li><Link href="/tenant/acme-bank" className="hover:text-white">Banking & Financial</Link></li>
                <li><Link href="/tenant/city-hospital" className="hover:text-white">Healthcare & Clinics</Link></li>
                <li><Link href="/tenant/luna-telecom" className="hover:text-white">Telecom & Flagships</Link></li>
                <li><Link href="/tenant/acme-bank/staff/ops-console" className="hover:text-white">Staff Ops Console</Link></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#FFA800] uppercase tracking-wider text-[11px]">Platform</h4>
              <ul className="space-y-2 text-[#FFF6E9]/75">
                <li><Link href="/register" className="hover:text-white">Claim Subdomain</Link></li>
                <li><Link href="/login" className="hover:text-white">Staff Login</Link></li>
                <li><Link href="/tenant/acme-bank/staff/settings" className="hover:text-white">8 Theme Customizer</Link></li>
                <li><Link href="/tenant/acme-bank/staff/social-studio" className="hover:text-white">Groq AI Studio</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFF6E9]/50 gap-4">
            <div>&copy; {new Date().getFullYear()} Luna Platform. All rights reserved.</div>
            <div className="flex gap-4">
              <span>Beyond the Expected</span>
              <span>&middot;</span>
              <span>FastAPI + Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
