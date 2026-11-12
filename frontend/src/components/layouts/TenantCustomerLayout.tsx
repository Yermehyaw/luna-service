'use client';

import React, { useState, useEffect } from 'react';
import { Tenant } from '../../types/tenant';
import { useTenant } from '../../lib/tenant-context';
import { useAuth } from '../../lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LunaIcon } from '../shared/LumaMark';
import {
  Home,
  Ticket,
  Radio,
  Trophy,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  User,
  Bell,
  Calendar,
  Smartphone,
  CheckCircle2,
  Share2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CustomerAuthModal } from '../shared/CustomerAuthModal';

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function TenantCustomerLayout({
  children,
  initialTenant,
}: {
  children: React.ReactNode;
  initialTenant?: Tenant;
}) {
  const pathname = usePathname();
  const { tenant: contextTenant } = useTenant();
  const { user, login } = useAuth();
  const tenant = initialTenant || contextTenant;
  const basePath = `/tenant/${tenant.slug}`;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifsModalOpen, setNotifsModalOpen] = useState(false);

  // Customer Profile State
  const [socialHandle, setSocialHandle] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Customer Notifications State (PWA alerts & broadcasts)
  const [customerNotifs, setCustomerNotifs] = useState([
    {
      id: 'cn-1',
      title: 'Appointment Confirmed',
      message: `Your booking at ${tenant.name} is confirmed. We will send an alert 30 minutes before your slot!`,
      time: '10m ago',
      unread: true,
    },
    {
      id: 'cn-2',
      title: 'Exclusive Client Offer',
      message: 'Show this PWA pass on your visit today for a complimentary beverage while waiting.',
      time: '2h ago',
      unread: true,
    },
    {
      id: 'cn-3',
      title: 'On-Time Schedule Notice',
      message: 'All styling stations and counters are running on exact time today.',
      time: '4h ago',
      unread: false,
    },
  ]);

  // PWA Installation Hook
  const [isInstalled, setIsInstalled] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
      const checkInstalled = () => {
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
        setIsInstalled(isStandalone);
      };
      checkInstalled();

      const onPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as InstallPrompt);
      };
      window.addEventListener('beforeinstallprompt', onPrompt);
      window.addEventListener('appinstalled', checkInstalled);

      // Load saved customer social handle from localStorage if available
      try {
        const savedHandle = localStorage.getItem(`luna_customer_handle_${tenant.slug}`);
        if (savedHandle) setSocialHandle(savedHandle);
      } catch {}

      return () => {
        window.removeEventListener('beforeinstallprompt', onPrompt);
        window.removeEventListener('appinstalled', checkInstalled);
      };
    }
  }, [tenant.slug]);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      alert('To install this app on your phone: Tap your browser Share/Menu button (⋮ or ⎙) and select "Add to Home Screen".');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(`luna_customer_handle_${tenant.slug}`, socialHandle);
      if (user) {
        login(
          user.email,
          customerPhone || user.phone,
          'customer',
          tenant?.id || user.tenantId,
          customerName || user.name
        );
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {}
  };

  const navLinks = [
    { name: 'Services', href: basePath, icon: Home },
    { name: 'Book Window', href: `${basePath}/book-queue`, icon: Ticket },
    { name: 'My Bookings', href: `${basePath}/track`, icon: Calendar },
    { name: 'Leaderboard', href: `${basePath}/leaderboard`, icon: Trophy },
  ];

  const unreadNotifsCount = customerNotifs.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-[var(--tenant-bg,#f7f6f2)] text-[var(--tenant-text,#291E29)] flex flex-col font-sans selection:bg-[#ead9f1] selection:text-[#291E29]">
      {/* Top Prominent PWA Marketing Install Banner */}
      {!isInstalled && !bannerDismissed && (
        <div className="bg-gradient-to-r from-[#291E29] via-[#4a264e] to-[#291E29] text-white px-3 sm:px-4 py-2.5 text-xs shadow-md border-b border-amber-400/20">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFA800] text-[#291E29] font-black text-xs shrink-0 shadow-xs">
                📲
              </span>
              <p className="font-medium text-white/95 text-[11px] sm:text-xs">
                <strong className="text-[#FFA800] font-bold">Install {tenant.name} App:</strong> Receive automatic 30-min booking alerts, live schedule updates &amp; rebook anytime without waiting!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 rounded-lg bg-[#FFA800] hover:bg-amber-400 text-[#291E29] px-3 py-1 text-[11px] font-extrabold shadow-sm transition active:scale-95"
              >
                <span>Install PWA</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="text-white/60 hover:text-white text-xs px-1"
                aria-label="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header with Brand, Notifications & Profile */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href={basePath}
            className="flex items-center gap-2.5 sm:gap-3 font-display text-base sm:text-lg font-extrabold text-[#291E29] max-w-[200px] sm:max-w-none"
          >
            {tenant.branding?.logoUrl ? (
              <img
                src={tenant.branding.logoUrl}
                alt={tenant.name}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain bg-white shadow-xs border border-black/10 shrink-0 p-0.5"
              />
            ) : (
              <span
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm transition-transform hover:scale-105 shrink-0 text-sm sm:text-base"
                style={{ backgroundColor: tenant.branding?.primaryColor || '#291E29' }}
              >
                {tenant.name[0]}
              </span>
            )}
            <div className="truncate">
              <span className="block leading-tight truncate">{tenant.name}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Appointment &amp; Service Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-700">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    isActive ? 'text-[#702D7B] font-extrabold' : 'hover:text-[#702D7B]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href={`${basePath}/book-queue`}
              className="rounded-xl bg-[#291E29] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#4a264e]"
            >
              Book Appointment
            </Link>

            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() => setNotifsModalOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs"
              title="Customer Alerts & Updates"
            >
              <Bell className="h-4 w-4 text-[#FFA800]" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white" />
              )}
            </button>

            {/* Customer Profile Icon */}
            <button
              type="button"
              onClick={() => (user ? setProfileModalOpen(true) : setAuthModalOpen(true))}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition shadow-xs"
              title="Customer Account & Social Handles"
            >
              <User className="h-3.5 w-3.5 text-[#702D7B]" />
              <span>{user && user.role === 'customer' ? `${user.name.split(' ')[0]} 👑` : 'My Account'}</span>
            </button>

            <Link
              href={`${basePath}/staff/ops-console`}
              className="rounded-xl bg-[#291E29] text-[#FFF6E9] px-3.5 py-2 text-xs font-bold hover:bg-[#341539] transition-all flex items-center gap-1.5"
            >
              <span>Operations</span>
              <ExternalLink className="h-3 w-3 text-[#FFA800]" />
            </Link>
          </nav>

          {/* Mobile Right Controls: Bell + Account + Menu */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => setNotifsModalOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-95 transition"
              aria-label="Alerts"
            >
              <Bell className="h-4 w-4 text-[#FFA800]" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => (user ? setProfileModalOpen(true) : setAuthModalOpen(true))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-95 transition"
              aria-label="Account"
            >
              <User className="h-4 w-4 text-[#702D7B]" />
            </button>

            <Link
              href={`${basePath}/book-queue`}
              className="rounded-xl bg-[#291E29] px-2.5 py-2 text-[11px] font-extrabold text-white shadow-xs"
            >
              Book
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-95 transition"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Customer Notifications Drawer */}
      {notifsModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setNotifsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white text-slate-800 p-5 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-purple-100 text-[#702D7B] flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{tenant.name} Alerts</h3>
                  <p className="text-[10px] text-slate-500">PWA appointment updates</p>
                </div>
              </div>
              <button onClick={() => setNotifsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 py-3">
              {customerNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    notif.unread
                      ? 'bg-amber-50/60 border-amber-200/80'
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900">{notif.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setCustomerNotifs((prev) => prev.map((n) => ({ ...n, unread: false })))}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2 text-xs font-bold text-slate-700 transition"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile & Social Handles Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-[#702D7B]/10 text-[#702D7B] flex items-center justify-center font-bold">
                  👑
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Your VIP Profile</h3>
                  <p className="text-[10px] text-slate-500">Links your bookings to social media channels</p>
                </div>
              </div>
              <button onClick={() => setProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {profileSaved && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold">
                Profile and social handles updated! You now receive priority tracking on all channels.
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  placeholder="e.g. Amara Kalu"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number (WhatsApp Alerts)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Social Handle (Instagram, X, or TikTok)
                </label>
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  placeholder="@your_username"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  When you DM or comment on {tenant.name}&apos;s socials, you are immediately identified as a booked VIP customer!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#702D7B] hover:bg-[#52215A] px-5 py-2 text-xs font-extrabold text-white shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-xs bg-white text-[#291E29] p-5 flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-sm font-extrabold text-slate-900 truncate">{tenant.name}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-2 text-xs font-bold">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                      isActive ? 'bg-[#702D7B]/10 text-[#702D7B] font-extrabold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                href={`${basePath}/staff/ops-console`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-[#291E29] p-3 text-xs font-bold text-[#FFF6E9]"
              >
                <span>Staff Operations</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
              </Link>
              <div className="pt-2 text-center">
                <Link
                  href="/register"
                  className="text-[11px] font-bold text-[#702D7B] hover:underline"
                >
                  Create your own booking page for free →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20 sm:pb-8">{children}</main>

      {/* Viral Booking Loop Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-600 pb-24 sm:pb-8">
        <div className="mx-auto max-w-6xl px-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 font-bold text-[#291E29]">
            <div className="flex items-center gap-1.5">
              <LunaIcon size={18} variant="purple" />
              <span>Powered by Luna</span>
            </div>
            <span className="hidden sm:inline text-slate-300">·</span>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 text-[#702D7B] font-extrabold hover:underline bg-purple-50 px-3 py-1 rounded-full border border-purple-200"
            >
              <span>Get your own business booking page for free</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">
            © 2026 {tenant.name}. Appointments, live tracking &amp; customer care via Luna.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Thumb Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[#702D7B] font-extrabold scale-105'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#702D7B]' : ''}`} />
                {link.name === 'My Bookings' && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-[#702D7B] font-bold' : ''}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
        >
          <Menu className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        tenant={tenant}
      />
    </div>
  );
}
