'use client';

import React, { useState, use } from 'react';
import { getTenantBySlug } from '../../../../lib/tenant';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import {
  Trophy,
  Ticket,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const [tenant, setTenant] = useState<any>(null);

  React.useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then((res) => setTenant(res));
  }, [resolvedParams.tenantId]);

  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-xs text-slate-500 font-semibold">
        Loading...
      </div>
    );
  }

  const basePath = `/tenant/${tenant.slug}`;

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-16 space-y-6 font-sans">
        <div className="rounded-3xl border border-black/10 bg-white p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
            <Trophy className="h-8 w-8 text-[#FFA800]" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Zero Document Friction Enabled</span>
            </span>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29]">
              Document Verification Removed
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              We have eliminated document uploads for <strong>{tenant.name}</strong> to make queue booking 100% instant and frictionless. No paperwork or photo uploads are required.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`${basePath}/book-queue`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFA800] px-6 py-3.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-all"
            >
              <Ticket className="h-4 w-4" />
              <span>Book Priority Window</span>
            </Link>

            <Link
              href={`${basePath}/leaderboard`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-xs font-bold text-[#291E29] hover:bg-slate-100 transition-all"
            >
              <Trophy className="h-4 w-4 text-[#FFA800]" />
              <span>View Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>
    </TenantCustomerLayout>
  );
}
