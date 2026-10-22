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
  UserCheck,
  Building2,
  Sparkles,
  Users,
  Store,
  ChevronRight,
} from 'lucide-react';
import { DEFAULT_TENANT_STAFF } from '../../../mock/staff';
import { StaffAccount, StaffPrivilege } from '../../../types/user';

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
    <div className="flex min-h-screen items-center justify-center bg-[#FCFBF4] p-4 sm:p-6 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white/95 p-6 sm:p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <LunaLogo size={42} showTagline />
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-800 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Better-Auth Active (FOSS · SQLite · Multi-Tenant Org)
          </div>
          <h2 className="font-extrabold text-2xl text-[#291E29] tracking-tight">
            Sign in to Luna Console
          </h2>
          <p className="text-xs text-slate-500">
            Dedicated portal access for Business Owners and Staff Members
          </p>
        </div>

        {/* 1. Login Type Selector: Business Owner vs Staff */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#FFF6E9] rounded-2xl border border-amber-200">
          <button
            type="button"
            onClick={() => handleTypeChange('business_owner')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all min-h-[44px] ${
              loginType === 'business_owner'
                ? 'bg-[#291E29] text-white shadow-md'
                : 'text-[#291E29]/70 hover:text-[#291E29] hover:bg-amber-100/50'
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${loginType === 'business_owner' ? 'text-[#FFA800]' : 'text-slate-500'}`} />
            <span>Business Owner</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('staff')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all min-h-[44px] ${
              loginType === 'staff'
                ? 'bg-[#291E29] text-white shadow-md'
                : 'text-[#291E29]/70 hover:text-[#291E29] hover:bg-amber-100/50'
            }`}
          >
            <Users className={`h-4 w-4 ${loginType === 'staff' ? 'text-[#FFA800]' : 'text-slate-500'}`} />
            <span>Staff Member</span>
          </button>
        </div>

        {/* Scope Explainer Alert */}
        {loginType === 'business_owner' ? (
          <div className="text-left text-xs bg-amber-500/10 border border-amber-300 rounded-xl p-3 text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[11px] uppercase tracking-wider text-amber-800">
                Full Business Admin Privileges
              </p>
              <p className="text-[11px] text-amber-900/80 mt-0.5">
                Full authority over <strong>Storefront Branding & Themes</strong>, <strong>Logo uploads</strong>, and assigning <strong>Staff Logins & Task Privileges</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-left text-xs bg-blue-500/10 border border-blue-300 rounded-xl p-3 text-blue-900 flex items-start gap-2.5">
            <Users className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[11px] uppercase tracking-wider text-blue-800">
                Staff Operations Access
              </p>
              <p className="text-[11px] text-blue-900/80 mt-0.5">
                Access assigned operational tasks (Ops Console, KYC verification, queue management). <strong>Branding & Settings are restricted to Business Admin.</strong>
              </p>
            </div>
          </div>
        )}

        {/* 2. Business / Tenant Selector */}
        <div className="text-left space-y-1.5">
          <label className="text-xs font-extrabold text-[#291E29] flex items-center justify-between">
            <span>Select Business / Storefront</span>
            <span className="text-[10px] text-slate-500 font-normal">Choose tenant workspace</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { slug: 'kemis-lounge', name: "Kemi's Lounge", type: 'SME Boutique Salon' },
              { slug: 'quickfix-auto', name: 'QuickFix Auto', type: 'SME Auto Garage' },
              { slug: 'acme-bank', name: 'Acme Bank', type: 'Enterprise Bank' },
            ].map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => handleTenantChange(t.slug)}
                className={`p-2 rounded-xl text-left border transition-all text-xs min-h-[44px] ${
                  selectedTenantSlug === t.slug
                    ? 'border-[#291E29] bg-[#291E29] text-white shadow-xs font-bold'
                    : 'border-black/10 bg-black/[0.02] text-[#291E29] hover:bg-black/5'
                }`}
              >
                <div className="font-extrabold text-[11px] truncate">{t.name}</div>
                <div className={`text-[9px] truncate ${selectedTenantSlug === t.slug ? 'text-[#FFA800]' : 'text-slate-500'}`}>
                  {t.type}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 1-Click Fast Switch Demo Cards */}
        <div className="text-left space-y-2 pt-2 border-t border-black/10">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            1-Click Demo Profiles ({selectedTenantSlug})
          </p>
          <div className="space-y-1.5">
            {loginType === 'business_owner' && activeOwner && (
              <button
                type="button"
                onClick={() => handleQuickSignIn(activeOwner)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/80 transition text-left group min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                    style={{ backgroundColor: activeOwner.avatarColor || '#291E29' }}
                  >
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-[#291E29] truncate flex items-center gap-1.5">
                      <span>{activeOwner.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                        Owner
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{activeOwner.designation} · {activeOwner.email}</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  Sign In <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </button>
            )}

            {loginType === 'staff' && activeStaffMembers.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => handleQuickSignIn(staff)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition text-left group min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                    style={{ backgroundColor: staff.avatarColor || '#D97706' }}
                  >
                    👔
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-[#291E29] truncate flex items-center gap-1.5">
                      <span>{staff.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-900 border border-blue-300">
                        {staff.privileges.length} Tasks
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{staff.designation} · {staff.email}</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  Sign In <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Standard Form Sign-In */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs pt-2 border-t border-black/10">
          <div>
            <label className="font-extrabold text-[#291E29]">Work Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-[#FCFBF4] py-3 pl-10 pr-3 text-base sm:text-xs text-[#291E29] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="font-extrabold text-[#291E29]">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-[#FCFBF4] py-3 pl-10 pr-3 text-base sm:text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#291E29] py-3.5 text-xs font-extrabold text-[#FFF6E9] shadow-md hover:bg-[#341539] active:scale-98 transition min-h-[48px]"
          >
            <span>
              {loginType === 'business_owner'
                ? 'Sign In as Business Owner'
                : 'Sign In as Staff Member'}
            </span>
            <ArrowRight className="h-4 w-4 text-[#FFA800]" />
          </button>
        </form>

        <p className="text-xs text-slate-500 pt-2 border-t border-black/10">
          Need a new business subdomain?{' '}
          <Link href="/register" className="font-extrabold text-[#831843] hover:underline">
            Register Business
          </Link>
        </p>
      </div>
    </div>
  );
}
