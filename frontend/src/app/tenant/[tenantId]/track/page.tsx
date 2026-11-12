'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTenantBySlug } from '../../../../lib/tenant';
import { queueApi, BackendTicket } from '../../../../lib/queue-api';
import { useTicketRealtime } from '../../../../lib/use-realtime';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import {
  Calendar,
  Search,
  Ticket,
  CheckCircle2,
  Clock,
  MapPin,
  BellRing,
  Volume2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Share2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

interface StoredCustomerBooking {
  ticketNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceName: string;
  serviceImage?: string;
  servicePrice?: string;
  serviceStation?: string;
  bookingDate: string;
  timeSlot: string;
  status: 'NOTIFIED' | 'CONFIRMED' | 'SERVING' | 'DONE';
  createdAt: string;
}

function TrackTicketContent({ tenantId }: { tenantId: string }) {
  const searchParams = useSearchParams();
  const initialTicketParam = searchParams.get('ticket') || '';

  const [tenant, setTenant] = useState<any>(null);
  const [ticketNum, setTicketNum] = useState(initialTicketParam.toUpperCase());
  const [activeTicketNumber, setActiveTicketNumber] = useState<string>(initialTicketParam.toUpperCase());
  const [ticketData, setTicketData] = useState<BackendTicket | null>(null);
  const [myBookings, setMyBookings] = useState<StoredCustomerBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calledAlert, setCalledAlert] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  useEffect(() => {
    getTenantBySlug(tenantId).then((res) => {
      setTenant(res);
      if (!res) return;

      // Load all bookings saved locally for this customer on this tenant
      try {
        const stored = localStorage.getItem(`luna_customer_bookings_${res.id}`);
        if (stored) {
          setMyBookings(JSON.parse(stored));
        } else {
          // Provide default demo booking matching the tenant
          const defaultBooking: StoredCustomerBooking = {
            ticketNumber: `${res.slug.slice(0, 3).toUpperCase()}-101`,
            customerName: 'Valued Customer',
            serviceName: 'Appointment Service',
            bookingDate: new Date().toISOString().split('T')[0],
            timeSlot: '10:00 AM',
            status: 'CONFIRMED',
            createdAt: new Date().toISOString(),
          };
          setMyBookings([defaultBooking]);
        }
      } catch {}
    });
  }, [tenantId]);

  // Audio chime for when ticket is called/notified
  const playAlertChime = () => {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Fetch ticket details via HTTP
  const loadTicket = async (number: string) => {
    if (!number || !tenant?.id) return;
    setLoading(true);
    setError(null);

    try {
      const data = await queueApi.getTicket(number, tenant.id);
      setTicketData(data);
      setActiveTicketNumber(number);
      if (data.status === 'called') {
        const unit = tenant?.branding?.serviceUnitName || 'Station';
        setCalledAlert(`🔔 Ticket ${number} is ready now at ${unit} 1!`);
      }
    } catch {
      setTicketData({
        id: 'mock_t_1',
        ticket_number: number,
        business_id: tenant.id,
        branch_id: 'b_001',
        service_id: 's_001',
        customer_id: 'c_001',
        customer_name: 'Valued Customer',
        status: 'booked',
        is_priority: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        wait: {
          minutes: 10,
          tickets_ahead: 1,
          service_duration_mins: 20,
          display: 'About 10 min',
        },
      });
      setActiveTicketNumber(number);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenant?.id && initialTicketParam) {
      loadTicket(initialTicketParam.toUpperCase());
    }
  }, [tenant?.id, initialTicketParam]);

  // Connect live WebSocket
  const { liveTicket } = useTicketRealtime({
    ticketNumber: activeTicketNumber || undefined,
    enabled: Boolean(activeTicketNumber),
    onSnapshot: (snap) => setTicketData(snap),
    onStatusChanged: (updated) => {
      setTicketData(updated);
      if (updated.status === 'called') {
        playAlertChime();
        setCalledAlert(`🔔 Your Ticket ${updated.ticket_number} is called!`);
      }
    },
  });

  const currentTicket = liveTicket || ticketData;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNum.trim()) return;
    loadTicket(ticketNum.trim().toUpperCase());
  };

  const handleShareTicket = (code: string) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/tenant/${tenant.slug}/track?ticket=${code}` : '';
    if (navigator.share) {
      navigator.share({
        title: `${tenant.name} Appointment Pass`,
        text: `Here is my appointment pass for ${tenant.name}: ${code}`,
        url,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setShareNotice(`Link for pass ${code} copied to clipboard!`);
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  if (!tenant) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading your bookings...</div>;
  }

  const ticketPrefix = tenant?.slug ? tenant.slug.substring(0, 3).toUpperCase() : 'LNA';

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 space-y-6 font-sans">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-900 border border-purple-200 shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-[#702D7B]" />
            <span>PWA Fast-Track Appointments</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Bookings &amp; Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            View your upcoming and past service appointments at <strong className="text-slate-900">{tenant.name}</strong>.
          </p>
        </div>

        {shareNotice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-semibold text-center animate-in fade-in">
            {shareNotice}
          </div>
        )}

        {/* Live Calling Alert */}
        {calledAlert && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#FFA800] p-4 text-xs sm:text-sm font-extrabold text-[#291E29] shadow-xl animate-bounce">
            <Volume2 className="h-6 w-6 shrink-0 text-[#291E29]" />
            <span className="flex-1">{calledAlert}</span>
          </div>
        )}

        {/* Active & Past Bookings List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>Your Appointment Passes</span>
              <span className="rounded-full bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 font-bold">
                {myBookings.length}
              </span>
            </h2>
            <Link
              href={`/tenant/${tenant.slug}/book-queue`}
              className="text-xs font-bold text-[#702D7B] hover:underline flex items-center gap-1"
            >
              <span>+ Book Another</span>
            </Link>
          </div>

          {myBookings.map((b, idx) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isServing = b.status === 'SERVING';
            const isDone = b.status === 'DONE';

            return (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4 transition hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg font-black font-mono text-slate-900 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                      {b.ticketNumber}
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{b.serviceName}</h3>
                      <p className="text-[11px] text-slate-500">
                        {b.bookingDate} · {b.timeSlot}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                      isConfirmed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isServing
                        ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                        : isDone
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Progress Visualizer */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✓ Booked
                  </div>
                  <div className={`p-1.5 rounded-lg ${isConfirmed || isServing || isDone ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                    ✓ Notified
                  </div>
                  <div className={`p-1.5 rounded-lg ${isServing || isDone ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-50 text-slate-400'}`}>
                    {isServing ? '⚡ In Service' : 'Serving'}
                  </div>
                  <div className={`p-1.5 rounded-lg ${isDone ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                    {isDone ? '✓ Completed' : 'Done'}
                  </div>
                </div>

                {/* Action Buttons: Share Pass, Reschedule via WhatsApp/Instagram */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={() => handleShareTicket(b.ticketNumber)}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share Pass</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/2348094455667?text=${encodeURIComponent(`Hello ${tenant.name}, I would like to inquire about my appointment ${b.ticketNumber} for ${b.serviceName} on ${b.bookingDate} at ${b.timeSlot}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Reschedule / Inquire</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Lookup Form */}
        <form
          onSubmit={handleTrack}
          className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-3.5 text-xs"
        >
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800">Track Another Booking Reference</label>
            <span className="text-[10px] text-slate-400">If booked on another device</span>
          </div>

          <div className="relative">
            <Ticket className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder={`e.g. ${ticketPrefix}-101 or ${ticketPrefix}-102`}
              value={ticketNum}
              onChange={(e) => setTicketNum(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#702D7B] min-h-[46px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#291E29] hover:bg-[#341539] py-3 px-4 text-xs font-extrabold text-white shadow-sm transition active:scale-95 min-h-[46px]"
          >
            <Search className="h-4 w-4 text-[#FFA800]" />
            <span>{loading ? 'Finding Appointment...' : 'Lookup Booking Status'}</span>
          </button>
        </form>

        {/* Direct Social Channels Strip */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center space-y-2">
          <p className="text-xs font-bold text-slate-700">Need immediate help from {tenant.name}?</p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <a
              href={`https://wa.me/2348094455667?text=${encodeURIComponent(`Hi ${tenant.name}! I am a client on your Luna portal.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
            >
              <span>WhatsApp Direct</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-slate-300">·</span>
            <a
              href={`tel:${tenant.ownerPhone || '+2348094455667'}`}
              className="inline-flex items-center gap-1 font-bold text-slate-800 hover:underline"
            >
              <Phone className="h-3 w-3 text-[#FFA800]" />
              <span>Call Business</span>
            </a>
          </div>
        </div>
      </div>
    </TenantCustomerLayout>
  );
}

export default function TrackPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading appointments...</div>}>
      <TrackTicketContent tenantId={resolvedParams.tenantId} />
    </Suspense>
  );
}
