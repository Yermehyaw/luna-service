'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { LunaLogo } from '../../../components/shared/LumaMark';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email);
    router.push('/tenant/acme-bank/staff/ops-console');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF6E9] p-6 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
      <div className="w-full max-w-md rounded-3xl border border-[#291E29]/10 bg-white/90 p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
        <div className="flex justify-center">
          <LunaLogo size={44} showTagline />
        </div>

        <div className="space-y-1">
          <h2 className="font-display text-2xl font-extrabold text-[#291E29]">Sign in to Luna Platform</h2>
          <p className="text-xs text-[#291E29]/70">Multi-Tenant Platform Staff & Customer Care Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
          <div>
            <label className="font-bold text-[#291E29]">Work Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#702D7B]" />
              <input
                type="email"
                required
                placeholder="staff@acmebank.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 py-2.5 pl-9 pr-3 text-[#291E29] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              />
            </div>
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFA800] py-3.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-[1.02]"
          >
            <span>Sign In to Console</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-xs text-[#291E29]/70 pt-2 border-t border-[#291E29]/10">
          Need a business subdomain?{' '}
          <Link href="/register" className="font-extrabold text-[#702D7B] hover:text-[#291E29] hover:underline">
            Register Business
          </Link>
        </p>
      </div>
    </div>
  );
}
