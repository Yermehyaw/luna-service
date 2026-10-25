'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Tenant } from '../../types/tenant';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  Ticket,
  Clock,
  ShieldCheck,
  LogOut,
  ArrowRight,
} from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  defaultTab?: 'signup' | 'signin';
}

export function CustomerAuthModal({
  isOpen,
  onClose,
  tenant,
  defaultTab = 'signup',
}: CustomerAuthModalProps) {
  const { user, login, registerCustomer, logout } = useAuth();
  const [tab, setTab] = useState<'signup' | 'signin'>(defaultTab);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCustomerLoggedIn = user && user.role === 'customer' && (user.tenantId === tenant.id || user.tenantId === 'tenant_001');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;

    setLoading(true);
    try {
      await registerCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        tenantId: tenant.id,
      });
      setSuccessMsg(`Welcome to ${tenant.name}! Your VIP customer account is ready.`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.warn('Customer signup fallback error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await login(email.trim(), phone || undefined, 'customer', tenant.id, name || email.split('@')[0]);
      setSuccessMsg('Signed in successfully.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Customer signin fallback error:', err);
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = tenant.branding?.primaryColor || '#291E29';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div
          className="p-5 sm:p-6 text-white relative flex items-start justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
              <Sparkles className="h-3 w-3 text-[#FFA800]" />
              {tenant.name} · Customer Portal
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display leading-tight">
              {isCustomerLoggedIn ? 'My Customer Account' : tab === 'signup' ? 'Create Customer Account' : 'Sign In to Portal'}
            </h2>
            <p className="text-xs text-white/80">
              {isCustomerLoggedIn
                ? 'Manage your priority tickets, visit history, and arrival alerts.'
                : 'Track tickets, bypass lobby lines, and receive audio & SMS call alerts.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition active:scale-95 shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {successMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isCustomerLoggedIn ? (
            /* Logged In Customer Profile View */
            <div className="space-y-5">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{user?.name}</h3>
                    <span className="rounded-full bg-[#FFA800]/20 text-[#291E29] px-2 py-0.5 text-[9px] font-black border border-[#FFA800]/40">
                      VIP Member
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                  {user?.phone && (
                    <p className="text-[11px] font-mono text-slate-600 truncate">{user.phone}</p>
                  )}
                </div>
              </div>

              {/* Loyalty & Window Benefits */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier Status</span>
                  <span className="text-sm font-extrabold text-[#702D7B]">VIP Diamond</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fast-Track</span>
                  <span className="text-sm font-extrabold text-emerald-600">Active</span>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 p-4 space-y-2 bg-[#FFF6E9]/40">
                <span className="font-bold text-slate-800 block text-xs">Customer Account Benefits</span>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Auto-saved tickets with real-time SMS position updates</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>Guaranteed arrival windows &amp; zero lobby waiting</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-slate-900 text-white font-bold py-3 text-xs hover:bg-slate-800 transition min-h-[44px]"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setSuccessMsg('Logged out.');
                    setTimeout(() => {
                      setSuccessMsg(null);
                      onClose();
                    }, 1000);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-3 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50 transition min-h-[44px]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Tabs (Sign Up vs Sign In) */
            <div className="space-y-4">
              <div className="flex rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className={`flex-1 rounded-xl py-2 font-bold text-xs transition ${
                    tab === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className={`flex-1 rounded-xl py-2 font-bold text-xs transition ${
                    tab === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {tab === 'signup' ? (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700">Your Full Name</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ada Okafor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span>Mobile Phone Number</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        For SMS Alerts
                      </span>
                    </label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+234 802 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Email Address</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="ada@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Choose Password</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
                    <Sparkles className="h-4 w-4 text-[#FFA800] shrink-0" />
                    <span>Free account · Earns VIP perks on repeat visits</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-extrabold text-white shadow-md active:scale-95 transition min-h-[44px] mt-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>{loading ? 'Creating Account...' : 'Create Customer Account'}</span>
                    <ArrowRight className="h-4 w-4 text-[#FFA800]" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700">Email or Mobile Phone</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="ada@example.com or +234..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Password</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-extrabold text-white shadow-md active:scale-95 transition min-h-[44px] mt-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>{loading ? 'Signing In...' : 'Sign In to Customer Account'}</span>
                    <ArrowRight className="h-4 w-4 text-[#FFA800]" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
