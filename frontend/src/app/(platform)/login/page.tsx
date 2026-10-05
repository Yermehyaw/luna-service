'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { LunaLogo } from '../../../components/shared/LumaMark';
import { ArrowRight, Lock, Mail } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-[#FFF9F3] p-6 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6 text-center">
        <div className="flex justify-center">
          <LunaLogo size={40} />
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Sign in to Luna Platform</h2>
          <p className="text-xs text-slate-500 mt-1">Multi-Tenant Platform Staff & Customer Care Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
          <div>
            <label className="font-semibold text-slate-700">Work Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="staff@acmebank.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800"
          >
            <span>Sign In to Console</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-xs text-slate-500">
          Need a business subdomain?{' '}
          <Link href="/register" className="font-bold text-[#0057B8] hover:underline">
            Register Business
          </Link>
        </p>
      </div>
    </div>
  );
}
