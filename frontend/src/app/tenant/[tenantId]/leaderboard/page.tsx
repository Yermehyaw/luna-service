'use client';

import React, { useState, useEffect, use } from 'react';
import { getTenantBySlug } from '../../../../lib/tenant';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import { MOCK_SERVICES } from '../../../../mock/services';
import { MOCK_BRANCHES } from '../../../../mock/branches';
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
  Sparkles,
  Flame,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function TenantLeaderboardPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then((res) => setTenant(res));
  }, [resolvedParams.tenantId]);

  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-xs text-slate-500 font-semibold">
        Loading service leaderboard...
      </div>
    );
  }

  const basePath = `/tenant/${tenant.slug}`;
  const isSme = tenant.businessScale === 'sme';

  // Ranked service units / specialists
  const specialists = [
    {
      rank: 1,
      name: isSme ? 'Chairs 1 & 2 (VIP Stylists)' : 'Priority Triage Window 1',
      operator: isSme ? 'Lead Stylist Amara & Kemi' : 'Senior Officer Marcus Sterling',
      score: 99.4,
      avgMins: '3.1 mins',
      rating: 4.98,
      reviews: 148,
      servedToday: 42,
      badge: 'Fastest Service 🏆',
    },
    {
      rank: 2,
      name: isSme ? 'Chairs 3 & 4 (Express Cut & Braids)' : 'Express Deposit Window 2',
      operator: isSme ? 'Stylist Chioma & Tunde' : 'Officer Folake Adeyemi',
      score: 98.2,
      avgMins: '4.2 mins',
      rating: 4.92,
      reviews: 112,
      servedToday: 38,
      badge: 'Top Customer Loved ⭐',
    },
    {
      rank: 3,
      name: isSme ? 'Nails & Spa Suite' : 'Customer Enquiries Desk 3',
      operator: isSme ? 'Therapist Blessing' : 'Officer Chidi Okafor',
      score: 97.5,
      avgMins: '5.0 mins',
      rating: 4.88,
      reviews: 86,
      servedToday: 29,
      badge: 'Zero-Wait Champ ⚡',
    },
  ];

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="space-y-8 pb-16">
        {/* Top Hero Banner */}
        <section className="bg-gradient-to-b from-white/90 to-transparent py-10 px-4 sm:px-6 border-b border-black/5">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFA800]/15 px-4 py-1.5 text-xs font-bold text-[#291E29] border border-[#FFA800]/30 shadow-xs">
              <Trophy className="h-4 w-4 text-[#FFA800]" />
              <span>Real-Time Performance Leaderboard</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#291E29] tracking-tight">
              {tenant.name} Leaderboard &amp; Top Rankings
            </h1>

            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every day our {tenant.branding?.serviceUnitName || 'counter'} specialists compete to deliver the
              fastest arrival windows, highest 5-star customer ratings, and zero waiting room delays.
            </p>

            <div className="pt-2 flex justify-center">
              <Link
                href={`${basePath}/book-queue`}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FFA800] px-6 py-3.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-105"
              >
                <Ticket className="h-4 w-4" />
                <span>Book Priority Window with Top Specialist</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Top 3 Podium Highlights */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {specialists.map((item) => (
              <div
                key={item.rank}
                className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  item.rank === 1
                    ? 'bg-gradient-to-b from-amber-500/10 via-white to-white border-[#FFA800] shadow-md'
                    : 'bg-white/80 border-black/10 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-9 w-9 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-xs ${
                        item.rank === 1
                          ? 'bg-[#FFA800] text-[#291E29]'
                          : item.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
                    </span>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#291E29]/5 text-[#291E29]">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-[#291E29]">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.operator}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs border-t border-black/5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#FFA800]" /> Avg Wait:
                      </span>
                      <span className="font-extrabold text-[#291E29]">{item.avgMins}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-[#FFA800] fill-[#FFA800]" /> Rating:
                      </span>
                      <span className="font-extrabold text-[#291E29]">
                        ★ {item.rating} ({item.reviews})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" /> Served Today:
                      </span>
                      <span className="font-extrabold text-emerald-700">{item.servedToday} Served</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-black/5">
                  <Link
                    href={`${basePath}/book-queue`}
                    className="w-full flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFF6E9] text-xs font-bold transition-all"
                  >
                    <span>Reserve Arrival</span>
                    <ArrowRight className="h-3 w-3 text-[#FFA800]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Platform Leaderboard Link */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-r from-[#291E29] via-[#341539] to-[#52215A] text-[#FFF6E9] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFA800] flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Platform Rankings
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                How does {tenant.name} compare across all registered businesses?
              </h3>
              <p className="text-xs text-white/70">
                Explore the global SME and Enterprise leaderboard ranking the top customer service operations.
              </p>
            </div>

            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FFA800] px-5 py-3 text-xs font-extrabold text-[#291E29] shadow-md hover:bg-[#FFB11A] transition-all shrink-0"
            >
              <Trophy className="h-4 w-4" />
              <span>Global Leaderboard</span>
            </Link>
          </div>
        </section>
      </div>
    </TenantCustomerLayout>
  );
}
