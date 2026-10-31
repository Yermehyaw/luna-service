'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { LunaLogo } from '../../../components/shared/LumaMark';
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Users,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_TENANT_STAFF } from '../../../mock/staff';
import { StaffAccount } from '../../../types/user';

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'business_owner' | 'staff'>('business_owner');
  const [selectedTenantSlug, setSelectedTenantSlug] = useState('kemis-lounge');
  const [email, setEmail] = useState('kemi@kemislounge.com');
  const [password, setPassword] = useState('password123');
  const { login, loginAsStaffMember } = useAuth();
  const router = useRouter();

  const tenantStaffList = DEFAULT_TENANT_STAFF[selectedTenantSlug] || [];
  const activeStaffMembers = tenantStaffList.filter((s) => s.role === 'staff');
  const activeOwner = tenantStaffList.find((s) => s.role === 'tenant_admin');

  // Handle switching tenant
  const handleTenantChange = (slug: string) => {
    setSelectedTenantSlug(slug);
    const list = DEFAULT_TENANT_STAFF[slug] || [];
    if (loginType === 'business_owner') {
      const owner = list.find((s) => s.role === 'tenant_admin');
      if (owner) {
        setEmail(owner.email);
      }
    } else {
      const firstStaff = list.find((s) => s.role === 'staff');
      if (firstStaff) {
        setEmail(firstStaff.email);
      }
    }
  };

  // Handle switching login type
  const handleTypeChange = (type: 'business_owner' | 'staff') => {
    setLoginType(type);
    if (type === 'business_owner' && activeOwner) {
      setEmail(activeOwner.email);
    } else if (type === 'staff' && activeStaffMembers.length > 0) {
      setEmail(activeStaffMembers[0].email);
    }
  };

  // Direct 1-click quick sign-in using predefined staff profile
  const handleQuickSignIn = (staff: StaffAccount) => {
    loginAsStaffMember(staff);
    router.push(`/tenant/${staff.tenantId}/staff/ops-console`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === 'business_owner') {
      await login(
        email,
        undefined,
        'tenant_admin',
        selectedTenantSlug,
        activeOwner?.name || email.split('@')[0],
        ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'manage_branches', 'view_analytics', 'social_studio'],
        'Business Owner',
        '#831843'
      );
    } else {
      // Find matching staff or create staff session
      const matchedStaff = tenantStaffList.find((s) => s.email.toLowerCase() === email.toLowerCase());
      if (matchedStaff) {
        loginAsStaffMember(matchedStaff);
      } else {
        await login(
          email,
          undefined,
          'staff',
          selectedTenantSlug,
          email.split('@')[0],
          ['ops_console', 'customer_directory'],
          'Staff Member',
          '#D97706'
        );
      }
    }
    router.push(`/tenant/${selectedTenantSlug}/staff/ops-console`);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f6f2] px-4 py-8 font-sans selection:bg-[#d9a4ff] selection:text-[#291E29] sm:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#ead9f1]/70 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-[#ffe1a8]/45 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#291E29]/10 bg-white shadow-[0_32px_80px_rgba(41,30,41,0.16)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[#291E29] p-10 text-white lg:flex lg:flex-col">
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative">
            <LunaLogo size={42} variant="light" showTagline />
          </div>

          <div className="relative my-auto py-16">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFA800] text-[#291E29] shadow-lg shadow-black/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#FFC453]">Luna workspace</p>
            <h1 className="max-w-sm text-4xl font-black leading-[1.04] tracking-tight">The calm way to run a busy business.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">Everything your team needs to keep queues moving, customers informed, and each day on track.</p>
          </div>

          <div className="relative space-y-3 border-t border-white/10 pt-6 text-xs text-white/70">
            {['Live queue operations', 'Multi-branch visibility', 'Private team access'].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[#FFC453]"><Check className="h-3 w-3" /></span>
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="p-6 sm:p-9 lg:p-11">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 lg:hidden"><LunaLogo size={34} showTagline /></div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8a7190]">Secure workspace access</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#291E29]">Welcome back</h2>
                <p className="mt-1.5 text-sm text-slate-500">Choose your workspace and continue to Luna.</p>
              </div>
              <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-800 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Secure
              </div>
            </div>

            <div className="border-y border-[#eeeaf0] py-4">
              <div className="flex items-center justify-between border-b border-[#eeeaf0] pb-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8a7190]">Sign in as</p>
                  <p className="mt-1 text-xs text-slate-500">{loginType === 'business_owner' ? 'Full access to your business' : 'Access to assigned operations'}</p>
                </div>
                <div className="flex rounded-lg bg-[#f2eef3] p-0.5">
                <button
                  type="button"
                  onClick={() => handleTypeChange('business_owner')}
                  className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-extrabold transition-all ${loginType === 'business_owner' ? 'bg-white text-[#291E29] shadow-sm' : 'text-[#291E29]/50 hover:text-[#291E29]'}`}
                >
                  <ShieldCheck className={`h-3 w-3 ${loginType === 'business_owner' ? 'text-[#702D7B]' : 'text-slate-400'}`} /> Owner
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('staff')}
                  className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-extrabold transition-all ${loginType === 'staff' ? 'bg-white text-[#291E29] shadow-sm' : 'text-[#291E29]/50 hover:text-[#291E29]'}`}
                >
                  <Users className={`h-3 w-3 ${loginType === 'staff' ? 'text-[#702D7B]' : 'text-slate-400'}`} /> Staff
                </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-[#291E29]">Workspace</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">Where do you want to work today?</p>
                </div>
                <span className="text-[10px] font-bold text-[#702D7B]">{selectedTenantSlug}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { slug: 'kemis-lounge', name: "Kemi's Lounge", type: 'Salon' },
                  { slug: 'quickfix-auto', name: 'QuickFix Auto', type: 'Garage' },
                  { slug: 'acme-bank', name: 'Acme Bank', type: 'Enterprise' },
                ].map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => handleTenantChange(t.slug)}
                    className={`min-h-[54px] rounded-lg border px-2.5 py-2 text-left transition-all ${selectedTenantSlug === t.slug ? 'border-[#291E29] bg-[#291E29] text-white shadow-sm' : 'border-[#e7e2e8] bg-white text-[#291E29] hover:border-[#bba9bf]'}`}
                  >
                    <div className="truncate text-[11px] font-extrabold">{t.name}</div>
                    <div className={`mt-1 text-[9px] font-medium ${selectedTenantSlug === t.slug ? 'text-[#FFC453]' : 'text-slate-400'}`}>{t.type}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 border-t border-[#eeeaf0] pt-3">
            {loginType === 'business_owner' && activeOwner && (
              <button
                type="button"
                onClick={() => handleQuickSignIn(activeOwner)}
                className="group flex min-h-[48px] w-full items-center justify-between rounded-lg border border-[#eadcf0] bg-white px-3 py-2 text-left transition hover:border-[#b77dcc] hover:bg-[#fcf8fe]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold text-white"
                    style={{ backgroundColor: activeOwner.avatarColor || '#291E29' }}
                  >
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate text-xs font-extrabold text-[#291E29]">
                      <span>{activeOwner.name}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-500">Demo owner account</div>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#291E29] px-2.5 py-1.5 text-[10px] font-bold text-white transition-transform group-hover:translate-x-0.5">
                  Use demo <ChevronRight className="h-3 w-3 text-[#FFC453]" />
                </span>
              </button>
            )}

            {loginType === 'staff' && activeStaffMembers.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => handleQuickSignIn(staff)}
                className="group mt-2 flex min-h-[48px] w-full items-center justify-between rounded-lg border border-blue-200 bg-white px-3 py-2 text-left transition hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold text-white"
                    style={{ backgroundColor: staff.avatarColor || '#D97706' }}
                  >
                    👔
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate text-xs font-extrabold text-[#291E29]">
                      <span>{staff.name}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-500">{staff.privileges.length} assigned tasks</div>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-md bg-blue-700 px-2.5 py-1.5 text-[10px] font-bold text-white transition-transform group-hover:translate-x-0.5">
                  Use demo <ChevronRight className="h-3 w-3" />
                </span>
              </button>
            ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left text-xs">
          <div>
            <label className="font-extrabold text-[#291E29]">Work email</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9b88a0]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-[#ded8e0] bg-[#fcfbfc] py-3 pl-10 pr-3 text-base font-medium text-[#291E29] outline-none transition placeholder:text-slate-400 focus:border-[#702D7B] focus:bg-white focus:ring-4 focus:ring-[#702D7B]/10 sm:text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-extrabold text-[#291E29]">Password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9b88a0]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-[#ded8e0] bg-[#fcfbfc] py-3 pl-10 pr-3 text-base text-[#291E29] outline-none transition focus:border-[#702D7B] focus:bg-white focus:ring-4 focus:ring-[#702D7B]/10 sm:text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#291E29] py-3.5 text-xs font-extrabold text-white shadow-lg shadow-[#291E29]/20 transition hover:-translate-y-0.5 hover:bg-[#4a264e] hover:shadow-xl active:translate-y-0"
          >
            <span>
              {loginType === 'business_owner'
                ? 'Sign In as Business Owner'
                : 'Sign In as Staff Member'}
            </span>
            <ArrowRight className="h-4 w-4 text-[#FFC453]" />
          </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              New to Luna?{' '}
              <Link href="/register" className="font-extrabold text-[#702D7B] underline-offset-4 hover:underline">Create your business workspace</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
