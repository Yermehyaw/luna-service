'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LunaLogo, LunaIcon } from '../../components/shared/LumaMark';
import { MOCK_TENANTS } from '../../mock/tenants';
import { Tenant } from '../../types/tenant';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Clock,
  CheckCircle2,
  Users,
  Ticket,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Flame,
  TrendingUp,
  Search,
  Filter,
  Menu,
  X,
  Radio,
  Building2,
  Store,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface RankedBusiness {
  rank: number;
  tenant: Tenant;
  score: number;
  avgWaitMins: number;
  rating: number;
  reviewCount: number;
  volumeServed: number;
  onTimeRate: number;
  badge: string;
}

// Generate realistic performance rankings based on mock tenants
const RANKED_DATA: RankedBusiness[] = [
  {
    rank: 1,
    tenant: MOCK_TENANTS.find((t) => t.slug === 'kemis-lounge') || MOCK_TENANTS[3],
    score: 99.6,
    avgWaitMins: 1.8,
    rating: 4.98,
    reviewCount: 342,
    volumeServed: 1820,
    onTimeRate: 99.4,
    badge: '🏆 #1 SME in Africa',
  },
  {
    rank: 2,
    tenant: MOCK_TENANTS.find((t) => t.slug === 'apex-dental') || MOCK_TENANTS[6],
    score: 98.9,
    avgWaitMins: 2.1,
    rating: 4.95,
    reviewCount: 164,
    volumeServed: 1250,
    onTimeRate: 98.8,
    badge: '⚡ Fastest Clinic Window',
  },
  {
    rank: 3,
    tenant: MOCK_TENANTS.find((t) => t.slug === 'acme-bank') || MOCK_TENANTS[0],
    score: 98.4,
    avgWaitMins: 3.2,
    rating: 4.88,
    reviewCount: 512,
    volumeServed: 34200,
    onTimeRate: 98.2,
    badge: '🏛️ #1 Enterprise Banking',
  },
  {
    rank: 4,
    tenant: MOCK_TENANTS.find((t) => t.slug === 'daily-grind') || MOCK_TENANTS[5],
    score: 97.9,
    avgWaitMins: 2.4,
    rating: 4.92,
    reviewCount: 382,
    volumeServed: 3100,
    onTimeRate: 97.6,
    badge: '☕ Customer Favorite Bakery',
  },
  {
    rank: 5,
    tenant: MOCK_TENANTS.find((t) => t.slug === 'quickfix-auto') || MOCK_TENANTS[4],
    score: 97.2,
    avgWaitMins: 3.6,
    rating: 4.85,
    reviewCount: 196,
    volumeServed: 940,
    onTimeRate: 96.8,
    badge: '🚗 Best Express Auto Bay',
  },
  {
    rank: 6,
    tenant: MOCK_TENANTS.find((t) => t.slug === 'city-hospital') || MOCK_TENANTS[1],
    score: 96.8,
    avgWaitMins: 4.1,
    rating: 4.91,
    reviewCount: 512,
    volumeServed: 18500,
    onTimeRate: 97.0,
    badge: '🏥 Top Outpatient Triage',
  },
  {
    rank: 7,
    tenant: MOCK_TENANTS.find((t) => t.slug === 'luna-telecom') || MOCK_TENANTS[2],
    score: 96.2,
    avgWaitMins: 4.5,
    rating: 4.78,
    reviewCount: 428,
    volumeServed: 48900,
    onTimeRate: 95.9,
    badge: '📱 Largest Queue Throughput',
  },
];

export default function PlatformLeaderboardPage() {
  const [scaleFilter, setScaleFilter] = useState<'all' | 'sme' | 'enterprise'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'wait' | 'rating' | 'volume'>('score');

  const filteredData = RANKED_DATA.filter((item) => {
    const matchesScale =
      scaleFilter === 'all' || item.tenant.branding?.businessScale === scaleFilter;
    const matchesSearch =
      item.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tenant.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tenant.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tenant.ownerName &&
        item.tenant.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesScale && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'wait') return a.avgWaitMins - b.avgWaitMins;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'volume') return b.volumeServed - a.volumeServed;
    return b.score - a.score;
  });

  const top3 = RANKED_DATA.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FFF6E9] text-[#291E29] font-sans selection:bg-[#FFA800] selection:text-[#291E29] flex flex-col overflow-x-hidden">
      {/* Sticky Header with Universal Hamburger Menu */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#291E29]/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <LunaLogo size={34} variant="dark" showTagline />
            </Link>
            <div className="hidden lg:flex items-center border-l border-[#291E29]/10 pl-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#702D7B] bg-[#702D7B]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Trophy className="h-3 w-3 text-[#FFA800]" /> Live Platform Leaderboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-[#291E29] hover:bg-[#291E29]/5 rounded-xl transition"
            >
              Admin Master
            </Link>
            <Link
              href="/register"
              className="px-4 sm:px-5 py-2.5 text-xs font-extrabold bg-[#291E29] text-[#FFF6E9] hover:bg-[#341539] rounded-xl shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <span>Join Leaderboard</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-[#291E29] hover:bg-black/10 active:scale-95 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#291E29] text-[#FFF6E9] p-6 flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#341539]">
              <LunaLogo variant="light" size={28} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex-1 space-y-2 text-sm font-bold">
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-[#FFA800] bg-[#FFA800]/10"
              >
                🏆 Platform Leaderboard
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-white/80 hover:bg-[#341539] hover:text-[#FFA800]"
              >
                Admin Master Control
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-white/80 hover:bg-[#341539] hover:text-[#FFA800]"
              >
                Platform Dashboard
              </Link>
              <Link
                href="/tenant/acme-bank"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-white/80 hover:bg-[#341539] hover:text-[#FFA800]"
              >
                Acme Bank Portal
              </Link>
              <Link
                href="/tenant/kemis-lounge"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-white/80 hover:bg-[#341539] hover:text-[#FFA800]"
              >
                Kemi&apos;s Lounge Salon (SME)
              </Link>
            </nav>

            <div className="pt-4 border-t border-[#341539] mt-auto space-y-2">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#FFA800] text-xs font-extrabold text-[#291E29] shadow-md"
              >
                <span>Claim Free Subdomain</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6 text-center">
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFA800]/20 border border-[#FFA800]/40 px-4 py-1.5 text-xs font-bold text-[#291E29] shadow-xs">
              <Flame className="h-4 w-4 text-[#FFA800]" />
              <span>Real-Time Business Performance &amp; Zero-Wait Leaderboard</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#291E29] tracking-tight leading-[1.15]">
              Who delivers the <span className="text-[#702D7B]">fastest service</span> with{' '}
              <span className="text-[#FFA800]">zero line waiting</span>?
            </h1>

            <p className="mx-auto max-w-2xl text-xs sm:text-base text-[#291E29]/75 leading-relaxed font-normal">
              Every small business (SME), salon, auto garage, clinic, and tier-1 bank on Luna is scored in real-time
              based on customer arrival punctuality, low wait duration, and verified 5-star ratings.
            </p>
          </div>
        </section>

        {/* Top 3 Podium Cards */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#702D7B]">
              Top 3 Leaders This Month
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* #2 Silver (Placed Left on desktop) */}
            <div className="order-2 md:order-1 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center font-extrabold text-xl shadow-xs">
                    🥈 2
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                    {top3[1].badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#291E29]">{top3[1].tenant.name}</h3>
                  <span className="text-xs text-[#702D7B] font-mono font-bold">
                    {top3[1].tenant.slug}.luna.com
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Owner: {top3[1].tenant.ownerName}</p>
                </div>
                <div className="pt-2 border-t border-black/5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Performance Score:</span>
                    <span className="font-extrabold text-[#291E29]">{top3[1].score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Average Wait:</span>
                    <span className="font-bold text-emerald-700">{top3[1].avgWaitMins} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Rating:</span>
                    <span className="font-bold text-[#FFA800]">★ {top3[1].rating}</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/tenant/${top3[1].tenant.slug}/book-queue`}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#291E29] text-white hover:bg-[#341539] text-xs font-bold transition"
              >
                <span>Book Priority Ticket</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
              </Link>
            </div>

            {/* #1 Gold (Center, Elevated) */}
            <div className="order-1 md:order-2 rounded-3xl border-2 border-[#FFA800] bg-gradient-to-b from-[#FFF6E9] via-white to-white p-7 sm:p-8 shadow-xl space-y-4 flex flex-col justify-between relative transform md:-translate-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FFA800] text-[#291E29] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                👑 Platform Champion
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="h-12 w-12 rounded-2xl bg-[#FFA800] text-[#291E29] flex items-center justify-center font-extrabold text-2xl shadow-md">
                    🥇 1
                  </span>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#FFA800]/20 text-[#291E29] border border-[#FFA800]/30">
                    {top3[0].badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#291E29]">{top3[0].tenant.name}</h3>
                  <span className="text-xs text-[#702D7B] font-mono font-bold">
                    {top3[0].tenant.slug}.luna.com
                  </span>
                  <p className="text-xs text-slate-600 mt-1">Owner: {top3[0].tenant.ownerName}</p>
                </div>
                <div className="pt-3 border-t border-[#FFA800]/20 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-semibold">Performance Score:</span>
                    <span className="font-extrabold text-2xl text-[#291E29]">{top3[0].score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Average Wait Time:</span>
                    <span className="font-extrabold text-emerald-700">{top3[0].avgWaitMins} mins (Zero Line)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Customer Rating:</span>
                    <span className="font-bold text-[#FFA800]">★ {top3[0].rating} (342 reviews)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Served:</span>
                    <span className="font-bold text-[#291E29]">{top3[0].volumeServed.toLocaleString()} Guests</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/tenant/${top3[0].tenant.slug}/book-queue`}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FFA800] text-[#291E29] hover:bg-[#FFB11A] text-xs font-extrabold shadow-md shadow-[#FFA800]/30 transition-transform hover:scale-105"
              >
                <span>Book Top-Ranked Window</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* #3 Bronze (Placed Right on desktop) */}
            <div className="order-3 md:order-3 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-extrabold text-xl shadow-xs">
                    🥉 3
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    {top3[2].badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#291E29]">{top3[2].tenant.name}</h3>
                  <span className="text-xs text-[#0057B8] font-mono font-bold">
                    {top3[2].tenant.slug}.luna.com
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Owner: {top3[2].tenant.ownerName}</p>
                </div>
                <div className="pt-2 border-t border-black/5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Performance Score:</span>
                    <span className="font-extrabold text-[#291E29]">{top3[2].score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Average Wait:</span>
                    <span className="font-bold text-emerald-700">{top3[2].avgWaitMins} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Rating:</span>
                    <span className="font-bold text-[#FFA800]">★ {top3[2].rating}</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/tenant/${top3[2].tenant.slug}/book-queue`}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#291E29] text-white hover:bg-[#341539] text-xs font-bold transition"
              >
                <span>Book Priority Ticket</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#FFA800]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Filter and Full Leaderboard Table */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          <div className="rounded-2xl border border-[#291E29]/10 bg-white/80 p-4 shadow-xs backdrop-blur-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search businesses, owners, cities, or industries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#291E29]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFA800] bg-white"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#291E29]/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setScaleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scaleFilter === 'all'
                      ? 'bg-[#FFA800] text-[#291E29] shadow-xs'
                      : 'text-[#291E29]/70'
                  }`}
                >
                  All ({RANKED_DATA.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScaleFilter('sme')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scaleFilter === 'sme'
                      ? 'bg-[#FFA800] text-[#291E29] shadow-xs'
                      : 'text-[#291E29]/70'
                  }`}
                >
                  SMEs
                </button>
                <button
                  type="button"
                  onClick={() => setScaleFilter('enterprise')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scaleFilter === 'enterprise'
                      ? 'bg-[#FFA800] text-[#291E29] shadow-xs'
                      : 'text-[#291E29]/70'
                  }`}
                >
                  Enterprises
                </button>
              </div>

              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#291E29]/15 text-xs font-bold bg-white text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              >
                <option value="score">Sort by Overall Score</option>
                <option value="wait">Sort by Fastest Wait Time</option>
                <option value="rating">Sort by Highest Rating</option>
                <option value="volume">Sort by Volume Served</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="rounded-3xl border border-[#291E29]/10 bg-white/90 shadow-sm overflow-hidden backdrop-blur-sm">
            <div className="p-4 sm:p-5 border-b border-[#291E29]/10 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#291E29]">
                Live Platform Performance Standings ({filteredData.length} Ranked)
              </h3>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse" /> Live Telemetry
              </span>
            </div>

            <div className="divide-y divide-[#291E29]/10">
              {filteredData.map((item) => (
                <div
                  key={item.tenant.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FFF6E9]/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center font-extrabold text-sm sm:text-base shrink-0 shadow-xs ${
                        item.rank === 1
                          ? 'bg-[#FFA800] text-[#291E29] ring-2 ring-[#FFA800]/40'
                          : item.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : item.rank === 3
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-[#291E29]/5 text-[#291E29]'
                      }`}
                    >
                      #{item.rank}
                    </div>

                    {/* Business Avatar & Info */}
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                      style={{ backgroundColor: item.tenant.branding.primaryColor || '#291E29' }}
                    >
                      {item.tenant.name[0]}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-[#291E29] truncate">
                          {item.tenant.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.tenant.branding.businessScale === 'sme'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {item.tenant.branding.businessScale === 'sme' ? '🏪 SME' : '🏛️ Enterprise'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono text-[#702D7B] font-semibold">
                          {item.tenant.slug}.luna.com
                        </span>
                        <span>·</span>
                        <span>Owner: {item.tenant.ownerName}</span>
                        <span>·</span>
                        <span>{item.tenant.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 self-start lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#291E29]/10">
                    <div className="grid grid-cols-3 gap-3 text-right text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Avg Wait</span>
                        <span className="font-extrabold text-emerald-700">{item.avgWaitMins}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Rating</span>
                        <span className="font-extrabold text-[#FFA800]">★ {item.rating}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Score</span>
                        <span className="font-extrabold text-[#291E29]">{item.score}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tenant/${item.tenant.slug}/book-queue`}
                        className="px-3.5 py-2 rounded-xl bg-[#FFA800] text-[#291E29] hover:bg-[#FFB11A] text-xs font-extrabold shadow-xs transition"
                      >
                        Book Ticket
                      </Link>
                      <Link
                        href={`/tenant/${item.tenant.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl border border-black/10 hover:bg-black/5 text-[#291E29] transition"
                        title="View Portal"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-r from-[#291E29] via-[#341539] to-[#52215A] text-[#FFF6E9] p-8 sm:p-12 text-center space-y-4 shadow-xl">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Want your small business or organization on the leaderboard?
            </h3>
            <p className="text-xs sm:text-sm text-white/75 max-w-xl mx-auto leading-relaxed">
              Claim your free business subdomain (`yourname.luna.com`) in under 60 seconds. Provide priority arrival windows
              and eliminate lobby lines today.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FFA800] px-7 py-3.5 text-xs font-extrabold text-[#291E29] shadow-lg shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-105"
              >
                <span>Claim Free Subdomain &amp; Join</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#291E29]/10 bg-[#FFF6E9] py-8 text-center text-xs text-[#291E29]/60">
        <div className="mx-auto max-w-6xl px-6 space-y-2">
          <div className="flex justify-center">
            <LunaLogo size={28} />
          </div>
          <p>© 2026 Luna. Beyond the Expected. Multi-Tenant Intelligent Queue Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}
