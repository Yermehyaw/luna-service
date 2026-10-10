'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTenantBySlug } from '../../../../lib/tenant';
import { queueApi, BackendTicket } from '../../../../lib/queue-api';
import { useTicketRealtime } from '../../../../lib/use-realtime';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import {
  Radio,
  Search,
  Ticket,
  CheckCircle2,
  Clock,
  MapPin,
  BellRing,
  Volume2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

function TrackTicketContent({ tenantId }: { tenantId: string }) {
  const searchParams = useSearchParams();
  const initialTicketParam = searchParams.get('ticket') || '';

  const [tenant, setTenant] = useState<any>(null);
  const [ticketNum, setTicketNum] = useState(initialTicketParam.toUpperCase());
  const [activeTicketNumber, setActiveTicketNumber] = useState<string>(initialTicketParam.toUpperCase());
  const [ticketData, setTicketData] = useState<BackendTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calledAlert, setCalledAlert] = useState<string | null>(null);

  useEffect(() => {
    getTenantBySlug(tenantId).then((res) => setTenant(res));
  }, [tenantId]);

  // Audio chime for when ticket is called
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
    } catch (e) {
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
        setCalledAlert(`🔔 Ticket ${number} is being called now to Counter 1!`);
      }
    } catch (err: any) {
      console.warn('[Track] Backend lookup failed, using simulated tracking:', err);
      // Fallback ticket
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
          minutes: 4,
          tickets_ahead: 1,
          service_duration_mins: 5,
          display: 'About 4 min',
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

  // Connect live WebSocket to this ticket
  const { isConnected, liveTicket } = useTicketRealtime({
    ticketNumber: activeTicketNumber || undefined,
    enabled: Boolean(activeTicketNumber),
    onSnapshot: (snap) => {
      setTicketData(snap);
      if (snap.status === 'called') {
        playAlertChime();
        setCalledAlert(`🔔 Your Ticket ${snap.ticket_number} is being called to Counter 1!`);
      }
    },
    onStatusChanged: (updated) => {
      setTicketData(updated);
      if (updated.status === 'called') {
        playAlertChime();
        setCalledAlert(`🔔 NOW CALLING: Please proceed to Counter 1 immediately!`);
      } else if (updated.status === 'done') {
        setCalledAlert(`✅ Your service window has been marked complete. Thank you!`);
      }
    },
    onWaitUpdated: (updated) => {
      setTicketData((prev) => (prev ? { ...prev, wait: updated.wait } : updated));
    },
    onReconnect: () => {
      if (activeTicketNumber) loadTicket(activeTicketNumber);
    },
  });

  // Use liveTicket data if newer
  const currentTicket = liveTicket || ticketData;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNum.trim()) return;
    loadTicket(ticketNum.trim().toUpperCase());
  };

  if (!tenant) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading tracker...</div>;
  }

  // Determine active step
  const status = currentTicket?.status || 'booked';
  const isCalled = status === 'called';
  const isDone = status === 'done';
  const isWaiting = status === 'booked';

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-xl py-12 px-6 space-y-6 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-slate-900">Track Live Queue Position</h1>
          <p className="text-xs text-slate-500">
            Real-time lobby position and priority audio call broadcasts for {tenant.name}.
          </p>
        </div>

        {/* Search Input */}
        <form
          onSubmit={handleTrack}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs"
        >
          <div>
            <label className="font-semibold text-slate-700">Ticket Reference Number</label>
            <div className="relative mt-1.5">
              <Ticket className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. AC-9BY3B or AC-101"
                value={ticketNum}
                onChange={(e) => setTicketNum(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-transform hover:scale-[1.02]"
          >
            <Search className="h-4 w-4 text-[#FFA800]" />
            <span>{loading ? 'Locating Ticket...' : 'Search Live Position'}</span>
          </button>
        </form>

        {/* Live Audio Call Alert */}
        {calledAlert && (
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500 p-4 text-xs font-extrabold text-[#291E29] shadow-lg animate-bounce">
            <Volume2 className="h-6 w-6 shrink-0" />
            <span className="flex-1">{calledAlert}</span>
          </div>
        )}

        {/* Ticket Found Card */}
        {currentTicket && (
          <div className="rounded-3xl border border-emerald-200 bg-white p-6 text-center space-y-6 shadow-lg animate-in fade-in">
            {/* Realtime Status Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                Live Ticket: <span className="font-mono">{currentTicket.ticket_number}</span>
              </span>

              {isConnected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  WebSocket Stream Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Connecting Stream...
                </span>
              )}
            </div>

            {/* Position Display */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Live Turn</span>
              <div className="text-4xl font-extrabold text-slate-900 mt-1">
                {isDone
                  ? 'Completed'
                  : isCalled
                  ? 'Now Calling!'
                  : currentTicket.wait
                  ? `Position #${currentTicket.wait.tickets_ahead + 1} in Queue`
                  : 'In Waiting Lounge'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isDone
                  ? 'Service completed at desk.'
                  : isCalled
                  ? 'Please proceed immediately to Counter 1.'
                  : currentTicket.wait
                  ? `${currentTicket.wait.tickets_ahead} customer(s) ahead of you.`
                  : 'Waiting for desk assignment.'}
              </p>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] font-bold">
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-700">1. Booked</span>
              </div>
              <div className="space-y-1">
                <div
                  className={`h-2 rounded-full ${
                    isWaiting || isCalled || isDone ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
                <span className={isWaiting || isCalled || isDone ? 'text-emerald-700' : 'text-slate-400'}>
                  2. In Lounge
                </span>
              </div>
              <div className="space-y-1">
                <div
                  className={`h-2 rounded-full ${
                    isCalled ? 'bg-[#FFA800] animate-pulse' : isDone ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
                <span className={isCalled ? 'text-[#291E29]' : isDone ? 'text-emerald-700' : 'text-slate-400'}>
                  3. Called
                </span>
              </div>
              <div className="space-y-1">
                <div className={`h-2 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <span className={isDone ? 'text-emerald-700' : 'text-slate-400'}>4. Done</span>
              </div>
            </div>

            {/* Estimated Wait Details */}
            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-left space-y-2 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Estimated Service Wait:
                </span>
                <span className="font-bold text-slate-900">
                  {isCalled ? (
                    <span className="text-[#FFA800] font-extrabold uppercase">At Counter Now</span>
                  ) : currentTicket.wait ? (
                    `${currentTicket.wait.display}`
                  ) : (
                    '~5 minutes'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Service Location:
                </span>
                <span className="font-bold text-slate-900">{tenant.name} Lekki Flagship</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/tenant/${tenant.slug}/verify`}
                className="flex-1 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 text-center"
              >
                Pre-Clear ID & Documents
              </Link>
              <button
                type="button"
                onClick={() => {
                  setTicketData(null);
                  setActiveTicketNumber('');
                  setTicketNum('');
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Search Another Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </TenantCustomerLayout>
  );
}

export default function TrackTicketPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading tracker...</div>}>
      <TrackTicketContent tenantId={resolvedParams.tenantId} />
    </Suspense>
  );
}
