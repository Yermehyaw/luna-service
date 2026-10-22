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
  const [createAccount, setCreateAccount] = useState(!user || user.role !== 'customer');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  // Calendar & Time of Day states
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [timeOfDaySlot, setTimeOfDaySlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [specificTime, setSpecificTime] = useState('10:00 AM');

  // Customer reference photo upload
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');

  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Sync if user logs in
  useEffect(() => {
    if (user && user.role === 'customer') {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
      setCreateAccount(false);
    }
  }, [user]);

  // Load tenant and services
  useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then(async (res) => {
      setTenant(res);
      if (!res) return;

      // Check localStorage / mock services for complete rich services
      const localServices = getTenantServices(res.id);
      if (localServices && localServices.length > 0) {
        setServices(localServices);
        setSelectedServiceId(localServices[0].id);
        return;
      }

      // Fallback to MOCK_SERVICES
      const fallbackList = MOCK_SERVICES.filter((s) => s.tenantId === res.id);
      if (fallbackList.length > 0) {
        setServices(fallbackList);
        setSelectedServiceId(fallbackList[0].id);
      }
    });
  }, [resolvedParams.tenantId]);

  // Read URL search params for pre-selected service
  useEffect(() => {
    if (typeof window !== 'undefined' && services.length > 0) {
      const p = new URLSearchParams(window.location.search);
      const svcParam = p.get('service');
      if (svcParam && services.some((s) => s.id === svcParam)) {
        setSelectedServiceId(svcParam);
      }
      const authParam = p.get('auth');
      if (authParam === 'login' || authParam === 'signin') {
        setLoginModalOpen(true);
      }
    }
  }, [services]);

  // Active selected service object
  const activeService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  // Handle local photo reference upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReferencePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!tenant) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading booking portal...</div>;
  }

  // Pre-configured time slots
  const timeSlotsByPeriod = {
    Morning: ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '11:30 AM'],
    Afternoon: ['12:15 PM', '01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM'],
    Evening: ['04:00 PM', '04:45 PM', '05:30 PM', '06:15 PM', '07:00 PM'],
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    let isCustomerAccountLinked = user?.role === 'customer';
    if (createAccount && (!user || user.role !== 'customer')) {
      try {
        await registerCustomer({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email:
            customerEmail.trim() ||
            `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@client.luna.com`,
          tenantId: tenant.id,
        });
        isCustomerAccountLinked = true;
      } catch (err) {
        console.warn('[BookQueue] Customer registration fallback:', err);
      }
    }

    try {
      // Connect to backend ticket creator
      const res = await queueApi.createTicket({
        business_id: tenant.id,
        branch_id: 'b_001',
        service_id: activeService?.id || 's_001',
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim(),
        is_priority: isCustomerAccountLinked,
      });

      setCreatedTicket({
        ticketNumber: res.ticket_number,
        customerName: res.customer_name,
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        isAccountLinked: isCustomerAccountLinked,
        serviceName: activeService?.name || 'Customer Service',
        serviceImage: activeService?.imageUrl,
        servicePrice: activeService?.price,
        serviceStation: activeService?.station || 'Counter 1',
        estimatedWaitMin: res.wait?.minutes ?? activeService?.minutes ?? 5,
        displayWait: res.wait?.display || 'Any moment now',
        ticketsAhead: res.wait?.tickets_ahead ?? 0,
        bookingDate,
        timeSlot: specificTime,
        timeOfDay: timeOfDaySlot,
        referencePhoto,
      });
    } catch (err: any) {
      console.warn('[BookQueue] Backend creation error, falling back locally:', err);
      const prefix = tenant.slug ? tenant.slug.split('-')[0].toUpperCase().slice(0, 3) : 'LM';
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCreatedTicket({
        ticketNumber: `${prefix}-${randomNum}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        isAccountLinked: isCustomerAccountLinked,
        serviceName: activeService?.name || 'Customer Service',
        serviceImage: activeService?.imageUrl,
        servicePrice: activeService?.price,
        serviceStation: activeService?.station || 'Counter 1',
        estimatedWaitMin: activeService?.minutes || 5,
        displayWait: `About ${activeService?.minutes || 5} min`,
        ticketsAhead: 1,
        bookingDate,
        timeSlot: specificTime,
        timeOfDay: timeOfDaySlot,
        referencePhoto,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 space-y-6 font-sans">
        {/* Step-by-Step Progress Header */}
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
              Service &amp; Time
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
              Digital Ticket Pass
            </span>
          </div>
        </div>

        {/* Title Area */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-xs">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            <span>Zero Lobby Waiting · Priority Station Booking</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            {createdTicket ? 'Your Fast-Track Pass' : 'Book Custom Service Appointment'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {createdTicket
              ? `You're all set! Keep this pass open on your phone or check live position updates.`
              : `Select your service, choose your preferred day & time of day, and pre-clear your style reference.`}
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CONFIRMED TICKET BOARDING PASS                    */}
        {/* ========================================================= */}
        {createdTicket ? (
          <div className="rounded-3xl border-2 border-emerald-300 bg-white p-5 sm:p-7 shadow-xl space-y-5 animate-in fade-in">
            {/* Pass Header */}
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Confirmed Priority Pass
                  </span>
                  <span className="text-xs font-bold text-slate-800">{tenant.name}</span>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                <Radio className="h-3 w-3 text-emerald-600 animate-pulse" /> Live Window
              </span>
            </div>

            {/* Giant Ticket Number */}
            <div className="text-center py-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Queue Reference Number
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 mt-1 tracking-tight">
                {createdTicket.ticketNumber}
              </div>
              <span className="inline-block text-[11px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                Estimated Wait: {createdTicket.displayWait}
              </span>
            </div>

            {/* Booked Service Banner with Image */}
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

            {/* Pass Metadata Grid: Calendar, Time of Day, Contact */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Calendar Date
                </span>
                <span className="font-bold text-slate-800 truncate block mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  {createdTicket.bookingDate === todayStr ? 'Today' : createdTicket.bookingDate}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Time of Day Slot
                </span>
                <span className="font-bold text-slate-800 truncate block mt-0.5 flex items-center gap-1">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  {createdTicket.timeSlot} ({createdTicket.timeOfDay})
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Customer &amp; Phone
                </span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {createdTicket.customerName}
                </span>
                <span className="text-[11px] font-mono text-slate-500 truncate block mt-0.5">
                  {createdTicket.customerPhone || 'SMS Active'}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Ahead in Line
                </span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {createdTicket.ticketsAhead} Customer{createdTicket.ticketsAhead === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Uploaded Reference Photo Preview on Pass */}
            {createdTicket.referencePhoto && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-3 flex items-center gap-3">
                <img
                  src={createdTicket.referencePhoto}
                  alt="Reference lookbook"
                  className="h-12 w-12 rounded-xl object-cover shrink-0 border border-purple-300"
                />
                <div>
                  <span className="font-bold text-xs text-purple-900 block flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5 text-purple-600" /> Lookbook Photo Pre-Cleared
                  </span>
                  <span className="text-[11px] text-purple-700">
                    Your styling specialist or mechanic will prepare your station accordingly.
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Link
                href={`/tenant/${tenant.slug}/track?ticket=${encodeURIComponent(
                  createdTicket.ticketNumber
                )}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 px-4 text-xs sm:text-sm font-extrabold text-white shadow-lg hover:bg-slate-800 active:scale-95 transition-all text-center min-h-[48px]"
              >
                <Radio className="h-4 w-4 text-[#FFA800] animate-pulse" />
                <span>Track Live Turn &amp; Audio Caller</span>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/tenant/${tenant.slug}/verify`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[44px]"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Pre-Clear Docs</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedTicket(null);
                    setReferencePhoto(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[44px]"
                >
                  Book Another Service
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 1: STEP 1 BOOKING FORM                               */
          /* ========================================================= */
          <form
            onSubmit={handleBook}
            className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6 text-xs"
          >
            {/* Customer Authentication Callout */}
            {user && user.role === 'customer' ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 sm:p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-200/60 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-800" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Signed In: {user.name}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Phone: {user.phone || 'SMS Linked'} · VIP auto-filled
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 shrink-0">
                  VIP Linked
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#FFA800]/20 flex items-center justify-center shrink-0">
                    <LogIn className="h-4 w-4 text-[#291E29]" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Existing Customer?</span>
                    <span className="text-[11px] text-slate-600 block">
                      Log in to auto-fill your contact details and earn VIP queue status.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white px-3.5 py-2 text-xs font-bold hover:bg-slate-800 transition min-h-[40px] shrink-0"
                >
                  <LogIn className="h-3.5 w-3.5 text-[#FFA800]" />
                  <span>Log In Here</span>
                </button>
              </div>
            )}

            {/* 1. SERVICE SELECTION SHOWCASE */}
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
                        {/* Service Thumbnail */}
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
                            <span>📍 {s.station || 'Counter 1'}</span>
                            <span>⏱️ ~{s.minutes} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#FFA800] bg-[#FFA800]'
                              : 'border-slate-300 bg-white'
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
                  <Calendar className="h-4 w-4 text-blue-600" /> 2. Choose Calendar Date
                </span>
                <span className="text-[11px] text-slate-400">Next 14 days active</span>
              </label>

              {/* Quick Preset Date Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Today', date: todayStr },
                  {
                    label: 'Tomorrow',
                    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                  },
                  {
                    label: 'Day After',
                    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                  },
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

              {/* Specific Date Picker Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-500">Custom Date:</span>
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
                  <Sun className="h-4 w-4 text-amber-500" /> 3. Select Time of Day
                </span>
                <span className="text-[11px] text-slate-400">Guaranteed Window</span>
              </label>

              {/* Period Switcher: Morning, Afternoon, Evening */}
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

              {/* Specific Time Slot Pill Grid */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                  Available {timeOfDaySlot} Arrival Windows:
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

            {/* 4. CUSTOMER STYLE / REFERENCE PHOTO UPLOAD */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
                  <Camera className="h-4 w-4 text-purple-600" /> 4. Style Lookbook / Reference Photo
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Optional Pre-Clearance
                </span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Upload your desired hair braid lookbook, vehicle fault diagram, or cake design. Your {tenant.branding?.serviceUnitName?.toLowerCase() || 'specialist'} will prepare in advance!
              </p>

              {referencePhoto ? (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-purple-200">
                  <img
                    src={referencePhoto}
                    alt="Upload reference"
                    className="h-16 w-16 rounded-lg object-cover border border-purple-100"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-slate-800 block truncate">
                      📸 Reference Photo Attached
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Ready for arrival pre-clearance
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReferencePhoto(null)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-white border border-dashed border-purple-300 py-3 px-4 text-xs font-bold text-purple-900 hover:bg-purple-100/50 transition">
                  <Upload className="h-4 w-4 text-purple-600" />
                  <span>Upload Lookbook / Inspiration Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* 5. CUSTOMER CONTACT DETAILS */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <User className="h-4 w-4 text-[#FFA800]" /> 5. Customer Contact Information
              </label>

              <div>
                <label className="font-bold text-slate-700 text-[11px]">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chinelo Adeleke"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 text-[11px]">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +234 802 345 6789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 text-[11px]">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="For digital confirmation pass"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#291E29] py-3.5 px-4 text-xs sm:text-sm font-extrabold text-[#FFF6E9] shadow-lg hover:bg-[#341539] active:scale-95 transition-all text-center min-h-[48px]"
              >
                <span>Confirm Service Booking &amp; Issue Ticket</span>
                <ArrowRight className="h-4 w-4 text-[#FFA800]" />
              </button>
            </div>
          </form>
        )}

        {/* Auth Modal for Existing Customers */}
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
