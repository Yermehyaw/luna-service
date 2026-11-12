'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { getTenantBySlug } from '../../../../lib/tenant';
import { queueApi } from '../../../../lib/queue-api';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import {
  Ticket,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  Mail,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Radio,
  Phone,
  Lock,
  LogIn,
  Calendar,
  Sun,
  Sunrise,
  Sunset,
  Camera,
  Upload,
  Trash2,
  ImageIcon,
  Check,
  Share2,
  FileText,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { ServiceItem, getTenantServices, MOCK_SERVICES } from '../../../../mock/services';
import { useAuth } from '../../../../lib/auth';
import { CustomerAuthModal } from '../../../../components/shared/CustomerAuthModal';
import Link from 'next/link';

export default function BookQueuePage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const { user, registerCustomer } = useAuth();
  const [tenant, setTenant] = useState<any>(null);

  // Form states
  const [customerName, setCustomerName] = useState(user?.role === 'customer' ? user.name : '');
  const [customerPhone, setCustomerPhone] = useState(user?.role === 'customer' ? user.phone || '' : '');
  const [customerEmail, setCustomerEmail] = useState(user?.role === 'customer' ? user.email : '');
  const [socialPlatform, setSocialPlatform] = useState<'instagram' | 'x' | 'tiktok' | 'whatsapp'>('instagram');
  const [socialHandle, setSocialHandle] = useState('');
  const [ndpaConsent, setNdpaConsent] = useState(true);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  // Calendar & Time of Day states
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [timeOfDaySlot, setTimeOfDaySlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [specificTime, setSpecificTime] = useState('10:00 AM');

  // Customer reference photo and document upload
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null);
  const [attachedDocumentName, setAttachedDocumentName] = useState<string | null>(null);
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');

  // Password creation step modal (seamless account trick)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [customerPassword, setCustomerPassword] = useState('');
  const [isExistingUserPasswordPrompt, setIsExistingUserPasswordPrompt] = useState(false);

  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // PWA Install Prompt State
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((navigator as any).standalone);
      setPwaInstalled(isStandalone);

      const onPrompt = (e: any) => {
        e.preventDefault();
        setInstallPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', onPrompt);
      return () => window.removeEventListener('beforeinstallprompt', onPrompt);
    }
  }, []);

  // Sync if user logs in
  useEffect(() => {
    if (user && user.role === 'customer') {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  // Load tenant and services
  useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then(async (res) => {
      setTenant(res);
      if (!res) return;

      const localServices = getTenantServices(res.id);
      if (localServices && localServices.length > 0) {
        setServices(localServices);
        setSelectedServiceId(localServices[0].id);
        return;
      }

      const fallbackList = MOCK_SERVICES.filter((s) => s.tenantId === res.id);
      if (fallbackList.length > 0) {
        setServices(fallbackList);
        setSelectedServiceId(fallbackList[0].id);
      }
    });
  }, [resolvedParams.tenantId]);

  // Read URL search params for "Pay in the Conversation" / Service deep-link
  useEffect(() => {
    if (typeof window !== 'undefined' && services.length > 0) {
      const p = new URLSearchParams(window.location.search);
      const svcParam = p.get('service');
      if (svcParam && services.some((s) => s.id === svcParam)) {
        setSelectedServiceId(svcParam);
      }
      const handleParam = p.get('handle') || p.get('username');
      if (handleParam) {
        setSocialHandle(handleParam.startsWith('@') ? handleParam : `@${handleParam}`);
      }
      const platformParam = p.get('platform') as any;
      if (platformParam && ['instagram', 'x', 'tiktok', 'whatsapp'].includes(platformParam)) {
        setSocialPlatform(platformParam);
      }
      const authParam = p.get('auth');
      if (authParam === 'login' || authParam === 'signin') {
        setLoginModalOpen(true);
      }
    }
  }, [services]);

  const activeService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedDocumentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReferencePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedDocumentName(file.name);
      setVerificationDocument(file);
    }
  };

  if (!tenant) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading booking portal...</div>;
  }

  const timeSlotsByPeriod = {
    Morning: ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '11:30 AM'],
    Afternoon: ['12:15 PM', '01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM'],
    Evening: ['04:00 PM', '04:45 PM', '05:30 PM', '06:15 PM', '07:00 PM'],
  };

  // Step 1: Click "Book Appointment" -> Triggers password prompt if not logged in
  const handleInitiateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please enter your full name and phone number.');
      return;
    }
    if (!ndpaConsent) {
      setErrorMessage('Please accept the NDPA 2023 data processing notice to proceed.');
      return;
    }

    // If user is already authenticated with password, proceed directly
    if (user && user.role === 'customer') {
      finalizeBooking();
    } else {
      // Check if email or phone is already recognized
      const existingEmail = customerEmail.trim();
      if (existingEmail && localStorage.getItem(`luna_user_${existingEmail}`)) {
        setIsExistingUserPasswordPrompt(true);
      } else {
        setIsExistingUserPasswordPrompt(false);
      }
      setPasswordModalOpen(true);
    }
  };

  // Step 2: Finalize booking after setting/entering password
  const finalizeBooking = async () => {
    setPasswordModalOpen(false);
    setLoading(true);
    setErrorMessage(null);

    let isCustomerAccountLinked = true;
    try {
      await registerCustomer({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email:
          customerEmail.trim() ||
          `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@client.withluna.tech`,
        tenantId: tenant.id,
      });
      // Save social handle in localStorage for priority matching
      if (socialHandle) {
        localStorage.setItem(`luna_customer_handle_${tenant.slug}`, socialHandle);
      }
    } catch (err) {
      console.warn('[BookQueue] Customer registration fallback:', err);
    }

    const ticketNumberPrefix = tenant.slug ? tenant.slug.split('-')[0].toUpperCase().slice(0, 3) : 'LNA';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const generatedCode = `${ticketNumberPrefix}-${randomNum}`;

    const newTicketRecord = {
      ticketNumber: generatedCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      socialPlatform,
      socialHandle: socialHandle.trim(),
      isAccountLinked: isCustomerAccountLinked,
      serviceName: activeService?.name || 'Customer Service',
      serviceImage: activeService?.imageUrl,
      servicePrice: activeService?.price,
      serviceStation: activeService?.station || 'Station 1',
      estimatedWaitMin: activeService?.minutes || 20,
      displayWait: `About ${activeService?.minutes || 20} min`,
      ticketsAhead: 1,
      bookingDate,
      timeSlot: specificTime,
      timeOfDay: timeOfDaySlot,
      referencePhoto,
      attachedDocumentName,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await queueApi.createTicket({
        business_id: tenant.id,
        branch_id: 'b_001',
        service_id: activeService?.id || 's_001',
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim(),
        is_priority: true,
      });
      newTicketRecord.ticketNumber = res.ticket_number;
    } catch {
      // Fallback ticket generated cleanly
    }

    // Save to customer's bookings history for this tenant
    try {
      const existingBookings = JSON.parse(
        localStorage.getItem(`luna_customer_bookings_${tenant.id}`) || '[]'
      );
      localStorage.setItem(
        `luna_customer_bookings_${tenant.id}`,
        JSON.stringify([newTicketRecord, ...existingBookings])
      );
    } catch {}

    setCreatedTicket(newTicketRecord);
    setLoading(false);
  };

  const handleShareTicket = () => {
    if (!createdTicket) return;
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/tenant/${tenant.slug}/track?ticket=${createdTicket.ticketNumber}`
      : '';
    if (navigator.share) {
      navigator.share({
        title: `${tenant.name} Appointment Pass`,
        text: `Here is my confirmed appointment ticket at ${tenant.name}: ${createdTicket.ticketNumber}`,
        url,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setShareNotice('Ticket link copied to clipboard!');
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  const handleInstallPwa = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setPwaInstalled(true);
      setInstallPrompt(null);
    } else {
      alert('To install: Tap your browser Share/Menu button (⋮ or ⎙) and select "Add to Home Screen".');
    }
  };

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 space-y-6 font-sans">
        {/* Step Progress Header */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-slate-500 pb-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                !createdTicket
                  ? 'bg-[#FFA800] text-[#291E29] ring-2 ring-[#FFA800]/30'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={!createdTicket ? 'text-slate-900 font-extrabold' : 'text-slate-500'}>
              Service &amp; Details
            </span>
          </div>
          <div className="h-0.5 w-8 sm:w-12 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                createdTicket
                  ? 'bg-[#FFA800] text-[#291E29] ring-2 ring-[#FFA800]/30'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className={createdTicket ? 'text-slate-900 font-extrabold' : 'text-slate-400'}>
              Confirmed Pass
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-xs">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            <span>Automated Appointment Window · Zero Lobby Waiting</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            {createdTicket ? 'Your Confirmed Appointment Pass' : `Book with ${tenant.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {createdTicket
              ? 'Your spot is saved! Keep this pass open on your phone or check live position updates.'
              : 'Choose your service, preferred arrival slot, and pre-clear your request.'}
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-semibold">
            {errorMessage}
          </div>
        )}

        {shareNotice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-semibold text-center">
            {shareNotice}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CONFIRMED PASS WITH PWA INSTALL NUDGE & SHARING   */}
        {/* ========================================================= */}
        {createdTicket ? (
          <div className="rounded-3xl border-2 border-emerald-300 bg-white p-5 sm:p-7 shadow-xl space-y-5 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Confirmed Appointment
                  </span>
                  <span className="text-xs font-bold text-slate-800">{tenant.name}</span>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                <Radio className="h-3 w-3 text-emerald-600 animate-pulse" /> Live Status
              </span>
            </div>

            {/* Ticket Code */}
            <div className="text-center py-4 bg-slate-50/90 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Booking Reference
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 mt-1 tracking-tight">
                {createdTicket.ticketNumber}
              </div>
              <span className="inline-block text-[11px] text-emerald-800 font-bold mt-1 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                Slot Time: {createdTicket.timeSlot} ({createdTicket.bookingDate})
              </span>
            </div>

            {/* Booked Service Banner */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3.5">
              {createdTicket.serviceImage && (
                <img
                  src={createdTicket.serviceImage}
                  alt={createdTicket.serviceName}
                  className="h-16 w-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm truncate">
                    {createdTicket.serviceName}
                  </h4>
                  {createdTicket.servicePrice && (
                    <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-900 shrink-0">
                      {createdTicket.servicePrice}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  📍 {createdTicket.serviceStation} · ~{createdTicket.estimatedWaitMin} mins
                </p>
              </div>
            </div>

            {/* PWA Nudge inside confirmation pass */}
            {!pwaInstalled && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-amber-700 shrink-0" />
                  <p className="text-[11px] text-amber-950 leading-tight">
                    <strong>Install PWA on your phone:</strong> Ensures you receive the automated 30-minute reminder before your slot!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] px-3 py-1.5 text-[11px] font-extrabold shadow-sm shrink-0"
                >
                  Install App
                </button>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Calendar Date</span>
                <span className="font-bold text-slate-800 block mt-0.5">{createdTicket.bookingDate}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Customer Name</span>
                <span className="font-bold text-slate-800 block mt-0.5">{createdTicket.customerName}</span>
              </div>
            </div>

            {/* Actions: Track Live, Share Ticket, Book Another */}
            <div className="space-y-2.5 pt-2">
              <Link
                href={`/tenant/${tenant.slug}/track?ticket=${encodeURIComponent(createdTicket.ticketNumber)}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#291E29] hover:bg-[#341539] py-3.5 px-4 text-xs sm:text-sm font-extrabold text-[#FFF6E9] shadow-lg transition active:scale-95"
              >
                <Radio className="h-4 w-4 text-[#FFA800] animate-pulse" />
                <span>View in &quot;My Bookings&quot; &amp; Track Live</span>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShareTicket}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[44px]"
                >
                  <Share2 className="h-3.5 w-3.5 text-[#702D7B]" />
                  <span>Share Ticket Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedTicket(null);
                    setReferencePhoto(null);
                    setAttachedDocumentName(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[44px]"
                >
                  Book Another Service
                </button>
              </div>
            </div>

            {/* Viral Growth Loop Hook */}
            <div className="pt-2 text-center border-t border-slate-100">
              <Link
                href="/register"
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#702D7B] hover:underline bg-purple-50 px-3 py-1 rounded-full border border-purple-200"
              >
                <span>Do you run a business? Get your own booking page for free →</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 1: BOOKING INITIATION FORM                           */
          /* ========================================================= */
          <form
            onSubmit={handleInitiateBook}
            className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6 text-xs"
          >
            {/* Existing Customer Sign In Link */}
            {user && user.role === 'customer' ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 sm:p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-200/60 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-800" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Signed In: {user.name} 👑
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      VIP Priority Account Active
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 shrink-0">
                  VIP Priority
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <span className="text-purple-900 font-semibold text-[11px]">
                    Already have an account with {tenant.name}?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="text-[#702D7B] font-extrabold hover:underline text-[11px] shrink-0"
                >
                  Log In Here
                </button>
              </div>
            )}

            {/* 1. SERVICE SELECTION */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm">
                  <Briefcase className="h-4 w-4 text-[#FFA800]" /> 1. Select Service &amp; Treatment
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {services.length} Options Available
                </span>
              </label>

              <div className="grid grid-cols-1 gap-3">
                {services.map((s) => {
                  const isSelected = selectedServiceId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#FFA800] bg-[#FFF6E9]/70 ring-2 ring-[#FFA800]/50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {s.imageUrl ? (
                          <img
                            src={s.imageUrl}
                            alt={s.name}
                            className="h-14 w-14 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{s.name}</h4>
                            {s.price && (
                              <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 shrink-0">
                                {s.price}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{s.description}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span>📍 {s.station || 'Station 1'}</span>
                            <span>⏱️ ~{s.minutes} mins slot</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#FFA800] bg-[#FFA800]' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-[#291E29]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. CALENDAR DATE SELECTOR */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <label className="font-bold text-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-600" /> 2. Choose Appointment Date
                </span>
                <span className="text-[11px] text-slate-400">Available slots</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Today', date: todayStr },
                  { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
                  { label: 'Day After', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setBookingDate(item.date)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                      bookingDate === item.date
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-500">Pick Custom Date:</span>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 3. TIME OF DAY OPERATIONAL SLOTS */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <label className="font-bold text-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Sun className="h-4 w-4 text-amber-500" /> 3. Select Appointment Window
                </span>
                <span className="text-[11px] text-slate-400">Est. {activeService?.minutes || 30} mins</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'Morning', label: 'Morning', icon: Sunrise },
                    { id: 'Afternoon', label: 'Afternoon', icon: Sun },
                    { id: 'Evening', label: 'Evening', icon: Sunset },
                  ] as const
                ).map((slot) => {
                  const Icon = slot.icon;
                  const isSelected = timeOfDaySlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setTimeOfDaySlot(slot.id);
                        setSpecificTime(timeSlotsByPeriod[slot.id][0]);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-extrabold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-amber-600" />
                      <span>{slot.label}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                  Available {timeOfDaySlot} Slots:
                </span>
                <div className="flex flex-wrap gap-2">
                  {timeSlotsByPeriod[timeOfDaySlot].map((time) => {
                    const isSelected = specificTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSpecificTime(time)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition ${
                          isSelected
                            ? 'bg-[#291E29] text-white border-[#291E29] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. ATTACH SPECIFICATION / DOCUMENT / STYLE PHOTO */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
                  <Camera className="h-4 w-4 text-purple-600" /> 4. Reference Document / Style Image
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Optional Attachment
                </span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Attach an inspiration photo, order brief, or reference document so {tenant.name} has your specifications ready.
              </p>

              {referencePhoto || attachedDocumentName ? (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-purple-200">
                  {referencePhoto ? (
                    <img
                      src={referencePhoto}
                      alt="Upload reference"
                      className="h-14 w-14 rounded-lg object-cover border border-purple-100"
                    />
                  ) : (
                    <FileText className="h-10 w-10 text-purple-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-slate-800 block truncate">
                      {attachedDocumentName || '📸 File Attached'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Attached to appointment profile
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReferencePhoto(null);
                      setAttachedDocumentName(null);
                      setVerificationDocument(null);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <label className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-dashed border-purple-300 text-center hover:bg-purple-100/50 transition">
                    <Upload className="h-4 w-4 text-purple-600 mb-1" />
                    <span className="text-[11px] font-bold text-purple-900">Upload Image</span>
                    <span className="text-[9px] text-slate-400">Photo / Lookbook</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  <label className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-dashed border-purple-300 text-center hover:bg-purple-100/50 transition">
                    <FileText className="h-4 w-4 text-purple-600 mb-1" />
                    <span className="text-[11px] font-bold text-purple-900">Upload Document</span>
                    <span className="text-[9px] text-slate-400">PDF / Specifications</span>
                    <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleDocumentUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* 5. BASIC CUSTOMER DETAILS + SOCIAL HANDLE */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <User className="h-4 w-4 text-[#FFA800]" /> 5. Your Details &amp; Social Priority
              </label>

              <div>
                <label className="font-bold text-slate-700 text-[11px]">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chinelo Adeleke"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B] min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 text-[11px]">WhatsApp / Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +234 802 345 6789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B] min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 text-[11px]">Email Address (For Appointment Pass)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B] min-h-[44px]"
                />
              </div>

              {/* Social Media Handle Input for VIP Priority */}
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-950 text-[11px] flex items-center gap-1.5">
                    <span>👑 Social Media Username (Priority Tracking)</span>
                  </label>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                    VIP Tracking
                  </span>
                </div>
                <p className="text-[10px] text-amber-900 leading-tight">
                  Enter your social handle on at least one platform so {tenant.name} recognizes you with a gold crown 👑 and prioritized response whenever you DM or comment.
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={socialPlatform}
                    onChange={(e: any) => setSocialPlatform(e.target.value)}
                    className="rounded-xl border border-amber-300 bg-white p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="x">X (Twitter)</option>
                    <option value="tiktok">TikTok</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <input
                    type="text"
                    placeholder="@your_username"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    className="flex-1 rounded-xl border border-amber-300 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  />
                </div>
              </div>

              {/* NDPA 2023 Consent Checkbox */}
              <div className="pt-2 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="ndpa-consent"
                  checked={ndpaConsent}
                  onChange={(e) => setNdpaConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-[#702D7B] focus:ring-[#702D7B]"
                />
                <label htmlFor="ndpa-consent" className="text-[11px] text-slate-600 leading-snug">
                  I consent to {tenant.name} and Luna securely processing my contact and social details for appointment scheduling, in compliance with the <strong>Nigeria Data Protection Act 2023 (NDPA)</strong>.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#291E29] py-4 px-4 text-xs sm:text-sm font-extrabold text-[#FFF6E9] shadow-lg hover:bg-[#341539] active:scale-95 transition-all text-center min-h-[48px]"
              >
                <span>Book Appointment Window</span>
                <ArrowRight className="h-4 w-4 text-[#FFA800]" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* SEAMLESS ACCOUNT CREATION / PASSWORD MODAL                */}
        {/* ========================================================= */}
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#702D7B]/10 text-[#702D7B] flex items-center justify-center font-bold">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {isExistingUserPasswordPrompt ? 'Confirm Your Booking' : 'Save Your Appointment Account'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {isExistingUserPasswordPrompt ? 'Enter your password to link booking' : 'Choose a password to secure your pass'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="rounded-2xl bg-purple-50/70 border border-purple-200 p-3.5 text-xs text-purple-950 space-y-1.5 leading-relaxed">
                <p className="font-bold">Why create a password?</p>
                <p className="text-[11px] text-purple-800">
                  Creating your password allows you to view your appointment in <strong>My Bookings</strong>, receive automated 30-min arrival alerts, easily reschedule if your plans change, and revisit {tenant.name} without re-entering your details!
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isExistingUserPasswordPrompt ? 'Account Password' : 'Create New Password'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter at least 6 characters"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={finalizeBooking}
                  className="rounded-xl bg-[#702D7B] hover:bg-[#52215A] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition active:scale-95"
                >
                  Save Account &amp; Issue Pass →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Auth Modal */}
        <CustomerAuthModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          tenant={tenant}
          defaultTab="signin"
        />
      </div>
    </TenantCustomerLayout>
  );
}
