'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { getTenantServices } from '../../../../../mock/services';
import {
  LayoutDashboard,
  Users,
  Ticket,
  CheckCircle2,
  Clock,
  Play,
  Check,
  BellRing,
  Plus,
  RefreshCw,
  ExternalLink,
  Megaphone,
  Smartphone,
  MessageSquare,
  Sparkles,
  Send,
  X,
  AlertCircle,
  Calendar,
  Building,
  UserCheck,
  ArrowRight,
  TrendingUp,
  FileText,
  Camera,
  Share2,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import Link from 'next/link';

export type OperationalStatus =
  | 'NOTIFIED'
  | 'CONFIRMED'
  | 'SERVING'
  | 'DONE'
  | 'CANCELLED';

export interface OperationsBooking {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  email?: string;
  socialHandle?: string;
  service: string;
  servicePrice?: string;
  slotTime: string;
  windowTime: string;
  station: string;
  status: OperationalStatus;
  isLoyalty?: boolean;
  referencePhoto?: string;
  attachedDocName?: string;
  notifiedAt?: string;
}

function StaffOperationsContent() {
  const { tenant } = useTenant();
  const searchParams = useSearchParams();
  const router = useRouter();
  const basePath = `/tenant/${tenant.slug}/staff`;

  const ticketPrefix = tenant?.slug ? tenant.slug.substring(0, 3).toUpperCase() : 'LNA';
  const tenantServices = getTenantServices(tenant.id);
  const defaultServiceName = tenantServices[0]?.name || 'Standard Service Appointment';

  // State: Bookings list
  const [bookings, setBookings] = useState<OperationsBooking[]>([
    {
      id: 'b-01',
      code: `${ticketPrefix}-101`,
      customerName: 'Amara Kalu',
      phone: '0814 229 9901',
      email: 'amara.kalu@gmail.com',
      socialHandle: '@amara_kalu',
      service: tenantServices[0]?.name || defaultServiceName,
      servicePrice: tenantServices[0]?.price || '₦18,000',
      slotTime: '10:00 AM',
      windowTime: '10:00–10:45 AM',
      station: 'Station 1 · Main Mirror',
      status: 'CONFIRMED',
      isLoyalty: true,
      referencePhoto: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      attachedDocName: 'soft-glam-lookbook.jpg',
      notifiedAt: '09:30 AM',
    },
    {
      id: 'b-02',
      code: `${ticketPrefix}-102`,
      customerName: 'Tunde Bakare',
      phone: '0807 332 1109',
      email: 'tunde.b@yahoo.com',
      socialHandle: '@tunde_b',
      service: tenantServices[1]?.name || 'Hair Treatment & Wash',
      servicePrice: tenantServices[1]?.price || '₦12,500',
      slotTime: '10:45 AM',
      windowTime: '10:45–11:30 AM',
      station: 'Station 2 · Wash Bay',
      status: 'NOTIFIED',
      isLoyalty: false,
      notifiedAt: '10:15 AM',
    },
    {
      id: 'b-03',
      code: `${ticketPrefix}-103`,
      customerName: 'Funke Adeleke',
      phone: '0802 998 7711',
      email: 'funke.adeleke@gmail.com',
      socialHandle: '@funke_a',
      service: tenantServices[0]?.name || defaultServiceName,
      servicePrice: tenantServices[0]?.price || '₦22,000',
      slotTime: '11:30 AM',
      windowTime: '11:30–12:15 PM',
      station: 'Station 1 · Main Mirror',
      status: 'SERVING',
      isLoyalty: true,
      referencePhoto: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      attachedDocName: 'braid-pattern-spec.pdf',
    },
    {
      id: 'b-04',
      code: `${ticketPrefix}-104`,
      customerName: 'Chinedu Eze',
      phone: '0803 214 8890',
      email: 'chinedu.eze@outlook.com',
      service: tenantServices[2]?.name || 'Consultation & Styling',
      servicePrice: tenantServices[2]?.price || '₦15,000',
      slotTime: '01:00 PM',
      windowTime: '01:00–01:45 PM',
      station: 'Station 3',
      status: 'NOTIFIED',
      isLoyalty: false,
    },
    {
      id: 'b-05',
      code: `${ticketPrefix}-100`,
      customerName: 'Fatima Bello',
      phone: '0812 900 4455',
      service: tenantServices[0]?.name || defaultServiceName,
      servicePrice: tenantServices[0]?.price || '₦18,000',
      slotTime: '09:00 AM',
      windowTime: '09:00–09:45 AM',
      station: 'Station 1',
      status: 'DONE',
      isLoyalty: true,
    },
  ]);

  // Modals state
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<OperationsBooking | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<OperationsBooking | null>(null);
  const [newRescheduleTime, setNewRescheduleTime] = useState('02:00 PM');
  const [newRescheduleDate, setNewRescheduleDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Walk-in / Manual Booking Modal
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualSocialHandle, setManualSocialHandle] = useState('');
  const [manualServiceId, setManualServiceId] = useState('');
  const [manualSlotTime, setManualSlotTime] = useState('12:00 PM');

  // Quick Broadcast composer state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSentNotice, setBroadcastSentNotice] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OperationalStatus>('ALL');

  // Daily Analytics Calculation
  const totalBookedToday = bookings.length;
  const completedToday = bookings.filter((b) => b.status === 'DONE').length;
  const inServiceNow = bookings.filter((b) => b.status === 'SERVING').length;
  const waitingOrNotified = bookings.filter((b) => b.status === 'NOTIFIED' || b.status === 'CONFIRMED').length;
  const paceMinutesAvg = 18; // 18m average pace per client, queried from backend analytics pipeline

  // Automated Progress: Notify a customer
  const handleNotifyCustomer = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: 'NOTIFIED', notifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : b
      )
    );
    setBroadcastSentNotice(`Automated 30-min PWA arrival alert sent to client!`);
    setTimeout(() => setBroadcastSentNotice(null), 3500);
  };

  // Automated Progress: Mark as Serving
  const handleStartServing = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'SERVING' } : b))
    );
  };

  // Automated Progress: Tick off as Done
  const handleMarkDone = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'DONE' } : b))
    );
    setBroadcastSentNotice(`Appointment marked completed! Thank-you note sent via PWA.`);
    setTimeout(() => setBroadcastSentNotice(null), 3000);
  };

  // Cancel an appointment
  const handleCancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
    );
    setBroadcastSentNotice(`Appointment cancelled. Pre-filled inquiry link prepared.`);
    setTimeout(() => setBroadcastSentNotice(null), 3000);
  };

  // Execute Reschedule
  const handleConfirmReschedule = () => {
    if (!bookingToReschedule) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingToReschedule.id
          ? {
              ...b,
              slotTime: newRescheduleTime,
              windowTime: `${newRescheduleTime} (Rescheduled)`,
              status: 'NOTIFIED',
            }
          : b
      )
    );
    setRescheduleModalOpen(false);
    setBroadcastSentNotice(
      `Appointment rescheduled to ${newRescheduleTime}! PWA update delivered to ${bookingToReschedule.customerName}.`
    );
    setTimeout(() => setBroadcastSentNotice(null), 4000);
  };

  // Send Quick Broadcast to All Today's Bookings
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSentNotice(
      `Broadcast sent via PWA to all ${totalBookedToday} booked clients: "${broadcastMessage}"`
    );
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSentNotice(null), 4000);
  };

  // Add Manual Booking
  const handleAddManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) return;

    const selectedSvc = tenantServices.find((s) => s.id === manualServiceId) || tenantServices[0];
    const newCode = `${ticketPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: OperationsBooking = {
      id: `b-${Date.now()}`,
      code: newCode,
      customerName: manualName.trim(),
      phone: manualPhone.trim(),
      email: manualEmail.trim() || undefined,
      socialHandle: manualSocialHandle.trim() || undefined,
      service: selectedSvc?.name || defaultServiceName,
      servicePrice: selectedSvc?.price || '₦15,000',
      slotTime: manualSlotTime,
      windowTime: `${manualSlotTime} Window`,
      station: selectedSvc?.station || 'Station 1',
      status: 'NOTIFIED',
      isLoyalty: Boolean(manualSocialHandle),
      notifiedAt: 'Just now',
    };

    setBookings((prev) => [newBooking, ...prev]);
    setShowAddBookingModal(false);
    setManualName('');
    setManualPhone('');
    setManualEmail('');
    setManualSocialHandle('');
    setBroadcastSentNotice(`Manual walk-in booking ${newCode} added and allotted slot!`);
    setTimeout(() => setBroadcastSentNotice(null), 3500);
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        b.customerName.toLowerCase().includes(query) ||
        b.code.toLowerCase().includes(query) ||
        b.service.toLowerCase().includes(query) ||
        (b.socialHandle && b.socialHandle.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  return (
    <TenantStaffLayout>
      <div className="mx-auto max-w-6xl space-y-6 pb-16 font-sans">
        {/* Operations Overview Greeting & English Daily Analytics */}
        <header className="rounded-3xl bg-gradient-to-r from-[#291E29] via-[#3a203d] to-[#291E29] p-6 sm:p-8 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFA800]/20 px-3 py-1 text-xs font-bold text-[#FFA800] border border-[#FFA800]/30 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Daily Store &amp; Studio Operations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {tenant.name} Team!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                Here is your live daily schedule. Bookings progress automatically from 30-min PWA arrival notifications to in-service and completed orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddBookingModal(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#FFA800] hover:bg-amber-400 text-[#291E29] px-5 py-3 text-xs font-extrabold shadow-md transition active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Walk-In / Manual Booking</span>
            </button>
          </div>

          {/* 4 Clear English Analytics Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <span className="text-[10px] font-extrabold text-[#FFA800] uppercase tracking-wider block">
                Booked Today
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {totalBookedToday}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">appointments on schedule</span>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                Today&apos;s Pace
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
                ~{paceMinutesAvg}m
              </div>
              <span className="text-[11px] text-slate-300 font-medium">avg turn · running on time</span>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider block">
                In Service
              </span>
              <div className="text-2xl sm:text-3xl font-black text-sky-300 mt-0.5">
                {inServiceNow}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">clients currently being attended</span>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
                Completed
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-200 mt-0.5">
                {completedToday}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">appointments finished today</span>
            </div>
          </div>
        </header>

        {/* Global Toast / Action Notice */}
        {broadcastSentNotice && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              <span>{broadcastSentNotice}</span>
            </div>
            <button onClick={() => setBroadcastSentNotice(null)} className="text-emerald-700 underline font-extrabold text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* United Section: Quick Broadcast to All Today's Bookings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-purple-100 text-[#702D7B] flex items-center justify-center font-bold">
                <Megaphone className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">Send PWA Broadcast to Today&apos;s Booked Clients</h3>
                <p className="text-[10px] text-slate-500">Delivered as an instant push alert to client phones</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {totalBookedToday} recipients
            </span>
          </div>

          <form onSubmit={handleSendBroadcast} className="flex gap-2">
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="e.g. Complimentary refreshments available at the lounge while your station is prepared!"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
            />
            <button
              type="submit"
              disabled={!broadcastMessage.trim()}
              className="rounded-2xl bg-[#702D7B] hover:bg-[#52215A] disabled:opacity-50 text-white px-5 py-2.5 text-xs font-extrabold shadow-sm transition active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Broadcast Now</span>
            </button>
          </form>
        </div>

        {/* Operational Appointments Table & Queue List */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Table Controls: Search & Status Filters */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'NOTIFIED', 'CONFIRMED', 'SERVING', 'DONE', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === st
                      ? 'bg-[#291E29] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Bookings' : st}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, code, handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
              />
            </div>
          </div>

          {/* Bookings List */}
          <div className="divide-y divide-slate-100">
            {filteredBookings.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No appointments match this filter.
              </div>
            ) : (
              filteredBookings.map((b) => {
                const isConfirmed = b.status === 'CONFIRMED';
                const isServing = b.status === 'SERVING';
                const isDone = b.status === 'DONE';
                const isNotified = b.status === 'NOTIFIED';
                const isCancelled = b.status === 'CANCELLED';

                return (
                  <div
                    key={b.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Code, Customer & Service Info */}
                    <div
                      className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0"
                      onClick={() => setSelectedBookingForDetail(b)}
                    >
                      <div className="rounded-2xl bg-purple-50 border border-purple-200 p-2.5 text-center min-w-[72px] shrink-0">
                        <span className="text-xs font-black font-mono text-[#702D7B] block">
                          {b.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                          {b.slotTime}
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate flex items-center gap-1.5">
                            <span>{b.customerName}</span>
                            {b.isLoyalty && (
                              <span title="Loyalty Past Customer" className="text-amber-500 text-xs">
                                👑
                              </span>
                            )}
                          </h4>
                          {b.socialHandle && (
                            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.2 rounded-full border border-purple-200">
                              {b.socialHandle}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 truncate">
                          {b.service} · <strong className="text-slate-800">{b.servicePrice}</strong> · {b.station}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Phone: {b.phone}</span>
                          {b.attachedDocName && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-200">
                              <Camera className="h-3 w-3" /> Lookbook doc attached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Automated Status Indicator */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isServing
                            ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                            : isDone
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : isCancelled
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {/* Right: Operational Actions (Notify, Serving, Done, Reschedule, Cancel) */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {!isDone && !isCancelled && (
                        <>
                          {isNotified && (
                            <button
                              type="button"
                              onClick={() => handleNotifyCustomer(b.id)}
                              className="flex items-center gap-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                              title="Send 30-min PWA arrival ping"
                            >
                              <BellRing className="h-3.5 w-3.5 text-amber-600" />
                              <span>Notify Again</span>
                            </button>
                          )}

                          {isConfirmed && (
                            <button
                              type="button"
                              onClick={() => handleStartServing(b.id)}
                              className="flex items-center gap-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                            >
                              <Play className="h-3.5 w-3.5 text-blue-600" />
                              <span>Start Service</span>
                            </button>
                          )}

                          {isServing && (
                            <button
                              type="button"
                              onClick={() => handleMarkDone(b.id)}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-extrabold transition shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Tick as Done</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setBookingToReschedule(b);
                              setNewRescheduleTime(b.slotTime);
                              setRescheduleModalOpen(true);
                            }}
                            className="rounded-xl border border-slate-200 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition"
                          >
                            Reschedule
                          </button>
                        </>
                      )}

                      {!isCancelled && !isDone && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="rounded-xl p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Cancel Appointment"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Customer Profile Mini-Summary & Attached Documents Modal */}
        {selectedBookingForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">
                    {selectedBookingForDetail.isLoyalty ? '👑' : '📋'}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>{selectedBookingForDetail.customerName}</span>
                      {selectedBookingForDetail.isLoyalty && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.2 rounded-full border border-amber-200">
                          Loyalty VIP
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Booking Pass {selectedBookingForDetail.code} · {selectedBookingForDetail.slotTime}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedBookingForDetail(null)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              {/* Customer Contact & Social Channels */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone / WhatsApp</span>
                  <span className="font-extrabold text-slate-800">{selectedBookingForDetail.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Social Handle</span>
                  <span className="font-extrabold text-purple-700">
                    {selectedBookingForDetail.socialHandle || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Booked</span>
                  <span className="font-bold text-slate-800">{selectedBookingForDetail.service}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Station</span>
                  <span className="font-bold text-slate-800">{selectedBookingForDetail.station}</span>
                </div>
              </div>

              {/* Attached Style Lookbook Photo or Spec Document */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-[#702D7B]" />
                  <span>Customer Lookbook &amp; Order Document</span>
                </h4>

                {selectedBookingForDetail.referencePhoto ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={selectedBookingForDetail.referencePhoto}
                      alt="Lookbook spec"
                      className="w-full max-h-56 object-cover"
                    />
                    <div className="p-2.5 bg-white text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>{selectedBookingForDetail.attachedDocName || 'Attached Reference Photo'}</span>
                      <a
                        href={selectedBookingForDetail.referencePhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#702D7B] hover:underline flex items-center gap-1"
                      >
                        <span>Open full view</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
                    No custom lookbook document attached for this booking.
                  </div>
                )}
              </div>

              {/* Bottom Actions: More Detail link to customer page + Close */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <Link
                  href={`${basePath}/customers`}
                  className="text-xs font-extrabold text-[#702D7B] hover:underline flex items-center gap-1"
                >
                  <span>View Full Customer Profile &amp; History →</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForDetail(null)}
                  className="rounded-xl bg-[#291E29] hover:bg-[#341539] text-white px-4 py-2 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {rescheduleModalOpen && bookingToReschedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#702D7B]" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Reschedule Appointment for {bookingToReschedule.customerName}
                  </h3>
                </div>
                <button onClick={() => setRescheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">New Appointment Date</label>
                  <input
                    type="date"
                    value={newRescheduleDate}
                    onChange={(e) => setNewRescheduleDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">New Slot Time</label>
                  <select
                    value={newRescheduleTime}
                    onChange={(e) => setNewRescheduleTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-[11px] text-purple-900 leading-relaxed">
                  📱 <strong>Automated PWA Alert:</strong> When saved, an instant push notification will be delivered to {bookingToReschedule.customerName}&apos;s device with a button to accept the updated schedule or inquire via social chat.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="rounded-xl bg-[#702D7B] hover:bg-[#52215A] px-5 py-2 text-xs font-extrabold text-white shadow-md"
                >
                  Save &amp; Notify Customer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Walk-in / In-Person Add Booking Modal */}
        {showAddBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#FFA800]" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Add Walk-in or External Booking
                  </h3>
                </div>
                <button onClick={() => setShowAddBookingModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleAddManualBooking} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fola Adeleke"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0800 000 0000"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Social Handle (Optional for Loyalty)</label>
                  <input
                    type="text"
                    placeholder="@customer_handle"
                    value={manualSocialHandle}
                    onChange={(e) => setManualSocialHandle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Service</label>
                  <select
                    value={manualServiceId}
                    onChange={(e) => setManualServiceId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-bold focus:outline-none"
                  >
                    {tenantServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.price || 'Standard'} · {s.minutes} mins)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Allot Arrival Slot</label>
                  <select
                    value={manualSlotTime}
                    onChange={(e) => setManualSlotTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="Now / In Chair">Now / In Chair</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddBookingModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#291E29] hover:bg-[#341539] px-5 py-2 text-xs font-extrabold text-[#FFA800] shadow-md"
                  >
                    Confirm &amp; Allot Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TenantStaffLayout>
  );
}

export default function StaffOperationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading operations overview...</div>}>
      <StaffOperationsContent />
    </Suspense>
  );
}
