'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, User as UserIcon, Store } from 'lucide-react';
import { LunaLogo } from '@/components/shared/LunaMark';
import { useAuth } from '@/lib/auth';

// Swap SIGN_UP for WAITLIST if self-service sign-up is not open yet.
export const SIGN_UP = '/register';
export const WAITLIST = 'https://bit.ly/LunaWaitlist';
const BTN = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition duration-300';
export const PRIMARY = `${BTN} bg-[#FFA800] text-[#291E29] hover:-translate-y-0.5 hover:bg-[#FFB11A] hover:shadow-lg hover:shadow-[#FFA800]/30`;
export const GHOST = `${BTN} border border-white/30 text-[#FFF6E9] hover:bg-white/10`;
export const WRAP = 'mx-auto max-w-6xl px-5';

const CSS = `
.lu-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
.lu-reveal.in{opacity:1;transform:none}
@keyframes lu-float{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-14px) rotate(var(--r,0deg))}}
@keyframes lu-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.15)}}
@keyframes lu-marquee{to{transform:translateX(-50%)}}
.lu-float{animation:lu-float 6s ease-in-out infinite}
.lu-drift{animation:lu-drift 14s ease-in-out infinite}
.lu-marquee{display:flex;width:max-content;animation:lu-marquee 32s linear infinite}
.lu-marquee:hover{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.lu-float,.lu-drift,.lu-marquee{animation:none}.lu-reveal{opacity:1;transform:none}}
`;

export function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`lu-reveal ${className}`}>{children}</div>;
}

export function Nav() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tenantSlug = user?.tenantId || 'kemis-lounge';
  const dashboardHref =
    user?.role === 'customer'
      ? `/tenant/${tenantSlug}/track`
      : `/tenant/${tenantSlug}/staff/ops-console`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#291E29]/10 bg-[#FFF6E9]/85 backdrop-blur-xl">
      <style>{CSS}</style>
      <div className={`${WRAP} flex h-16 items-center justify-between`}>
        <Link href="/" aria-label="Luna home"><LunaLogo size={32} variant="dark" /></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold sm:flex">
          <Link href="/product" className="hover:opacity-60">Product</Link>
          <Link href="/how-it-works" className="hover:opacity-60">How it works</Link>
          <Link href="/pricing" className="hover:opacity-60">Pricing</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative flex items-center gap-2" ref={menuRef}>
              <Link
                href={dashboardHref}
                className={`${PRIMARY} !px-4 !py-2 text-xs font-black shadow-sm`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>

              {/* Profile Avatar Trigger Button */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full border border-[#291E29]/20 bg-white/80 py-1.5 pl-2 pr-3 text-xs font-bold transition hover:bg-white active:scale-95 shadow-xs"
                aria-label="User Profile and Dashboard Menu"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow-xs"
                  style={{ backgroundColor: user.avatarColor || '#291E29' }}
                >
                  {user.role === 'tenant_admin' || user.role === 'super_admin' ? '👑' : user.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden font-extrabold sm:inline max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-[#291E29]/60 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Card */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#291E29]/15 bg-white p-3 text-[#291E29] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-[#291E29]/10 pb-2.5 mb-2 px-1">
                    <p className="text-xs font-black truncate">{user.name}</p>
                    <p className="text-[11px] text-[#291E29]/60 truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFE5B3] text-[#291E29]">
                      {user.role === 'tenant_admin'
                        ? '👑 Business Owner'
                        : user.role === 'staff'
                        ? 'Staff Specialist'
                        : 'Customer'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={dashboardHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl bg-[#291E29] text-[#FFA800] text-xs font-bold hover:bg-[#341539] transition"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href={`/tenant/${tenantSlug}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#291E29]/5 transition"
                    >
                      <Store className="h-4 w-4 text-[#291E29]/70" />
                      <span>Storefront Portal</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-semibold hover:opacity-60 sm:block">Sign in</Link>
              <Link href={SIGN_UP} className={`${PRIMARY} !px-5 !py-2`}>Claim your free page</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function CtaBand() {
  return (
    <section className="px-3 pb-3 sm:px-5">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#52215A] via-[#341539] to-[#291E29] px-6 py-20 text-center text-[#FFF6E9]">
        <div className="lu-drift pointer-events-none absolute left-1/4 top-0 h-64 w-64 rounded-full bg-[#BA68D7]/40 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-title text-3xl font-bold sm:text-5xl">Your business can do more. Make it happen with Luna.</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={SIGN_UP} className={PRIMARY}>Claim your free page <ArrowRight size={16} /></Link>
            <a href={WAITLIST} className={GHOST}>Join the waitlist</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mt-3 bg-[#291E29] py-12 text-sm text-[#FFF6E9]/70">
      <div className={`${WRAP} flex flex-col gap-8 md:flex-row md:justify-between`}>
        <div>
          <LunaLogo size={32} variant="light" showTagline />
          <p className="mt-4 max-w-xs">Customer service for the digital economy.</p>
        </div>
        <div className="flex gap-12">
          <ul className="space-y-2">
            <li><Link href="/product" className="hover:text-white">Product</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/pricing" className="hover:text-white">Pricing and FAQ</Link></li>
          </ul>
          <ul className="space-y-2">
            <li><Link href={SIGN_UP} className="hover:text-white">Claim your free page</Link></li>
            <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
            <li><a href={WAITLIST} className="hover:text-white">Join the waitlist</a></li>
          </ul>
        </div>
      </div>
      <p className={`${WRAP} mt-10 text-xs text-[#FFF6E9]/50`}>© 2026 Luna. Beyond the Expected. withluna.tech</p>
    </footer>
  );
}
