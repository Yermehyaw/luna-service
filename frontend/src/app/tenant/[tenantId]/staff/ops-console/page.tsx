'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { queueApi, BackendTicket } from '../../../../../lib/queue-api';
import { useBranchRealtime } from '../../../../../lib/use-realtime';
import {
  Users,
  Ticket,
  CheckCircle2,
  Clock,
  Play,
  SkipForward,
  Check,
  BellRing,
  Plus,
  Volume2,
  Radio,
  RefreshCw,
} from 'lucide-react';

interface QueueTicket {
  id: string;
  name: string;
  service: string;
  window: string;
  status: 'In Waiting' | 'Now Serving' | 'Completed' | 'Document Verified' | 'Skipped';
  callTime?: string;
  backendTicket?: BackendTicket;
}

export default function StaffOpsConsolePage() {
  const { tenant } = useTenant();
  const branchId = 'b_001';

  const [tickets, setTickets] = useState<QueueTicket[]>([
    { id: 'AC-101', name: 'Amara Okafor', service: 'Teller & Cash Deposit', window: 'Counter 1', status: 'In Waiting' },
    { id: 'AC-102', name: 'Babajide Cole', service: 'Account & Card Advisory', window: 'Counter 1', status: 'Document Verified' },
    { id: 'AC-103', name: 'Chidinma Vance', service: 'Teller & Cash Deposit', window: 'Counter 1', status: 'In Waiting' },
    { id: 'AC-104', name: 'David Mensah', service: 'Foreign Currency Exchange', window: 'Counter 1', status: 'In Waiting' },
  ]);

  const [servingTicket, setServingTicket] = useState<QueueTicket | null>(null);
  const [callAnnouncement, setCallAnnouncement] = useState<string | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Map backend ticket to UI QueueTicket
  const mapBackendToUi = (bt: BackendTicket): QueueTicket => {
    let uiStatus: QueueTicket['status'] = 'In Waiting';
    if (bt.status === 'called') uiStatus = 'Now Serving';
    else if (bt.status === 'done') uiStatus = 'Completed';
    else if (bt.status === 'cancelled' || bt.status === 'no_show') uiStatus = 'Skipped';

    return {
      id: bt.ticket_number,
      name: bt.customer_name,
      service: bt.service_id === 's_001' ? 'Teller & Cash Deposit' : bt.service_id === 's_002' ? 'Account & Card Advisory' : 'General Service',
      window: 'Counter 1',
      status: uiStatus,
      backendTicket: bt,
      callTime: bt.called_at ? new Date(bt.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    };
  };

  // Reconcile tickets over HTTP
  const fetchTickets = useCallback(async () => {
    if (!tenant?.id) return;
    try {
      setIsLoading(true);
      const res = await queueApi.listTickets({
        businessId: tenant.id,
        branchId,
        limit: 50,
      });
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        const mapped = res.items.map(mapBackendToUi);
        setTickets(mapped);
        const currentServing = mapped.find((t) => t.status === 'Now Serving');
        if (currentServing) {
          setServingTicket(currentServing);
        }
      }
    } catch (err) {
      console.warn('[OpsConsole] Using cached/local queue tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id, branchId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Hook up Realtime WebSocket
  const { status: wsStatus, isConnected } = useBranchRealtime({
    businessId: tenant?.id,
    branchId,
    enabled: Boolean(tenant?.id),
    onTicketCreated: (created) => {
      const uiItem = mapBackendToUi(created);
      setTickets((prev) => {
        const exists = prev.some((t) => t.id === uiItem.id);
        if (exists) return prev;
        return [uiItem, ...prev];
      });
      setCallAnnouncement(`🔔 New arrival: Ticket ${uiItem.id} (${uiItem.name}) added to queue!`);
      setTimeout(() => setCallAnnouncement(null), 5000);
    },
    onTicketStatusChanged: (updated, prevStatus) => {
      const uiItem = mapBackendToUi(updated);
      setTickets((prev) =>
        prev.map((t) => (t.id === uiItem.id ? { ...t, status: uiItem.status, callTime: uiItem.callTime } : t))
      );
      if (uiItem.status === 'Now Serving') {
        setServingTicket(uiItem);
        playChime();
        setCallAnnouncement(`🔔 Realtime Broadcast: Calling Ticket ${uiItem.id} (${uiItem.name}) to Counter 1!`);
        setTimeout(() => setCallAnnouncement(null), 5000);
      } else if (uiItem.status === 'Completed' || uiItem.status === 'Skipped') {
        if (servingTicket?.id === uiItem.id) {
          setServingTicket(null);
        }
      }
    },
    onReconnect: () => {
      fetchTickets();
    },
  });

  const playChime = () => {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const handleCallTicket = async (ticket: QueueTicket) => {
    playChime();
    setServingTicket({ ...ticket, status: 'Now Serving', callTime: 'Just now' });
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, status: 'Now Serving' } : t))
    );
    setCallAnnouncement(`🔔 Now Calling Ticket ${ticket.id} (${ticket.name}) to Service Window 1!`);
    setTimeout(() => setCallAnnouncement(null), 5000);

    try {
      if (tenant?.id) {
        await queueApi.updateTicketStatus(ticket.id, 'called', tenant.id);
      }
    } catch (err) {
      console.warn('[OpsConsole] Backend status update fallback:', err);
    }
  };

  const handleCompleteServing = async (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    if (servingTicket?.id === id) {
      setServingTicket(null);
    }
    setCallAnnouncement(`✅ Ticket ${id} marked as Completed.`);
    setTimeout(() => setCallAnnouncement(null), 4000);

    try {
      if (tenant?.id) {
        await queueApi.updateTicketStatus(id, 'done', tenant.id);
      }
    } catch (err) {
      console.warn('[OpsConsole] Backend status update fallback:', err);
    }
  };

  const handleSkipTicket = async (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    if (servingTicket?.id === id) {
      setServingTicket(null);
    }
    setCallAnnouncement(`⏭️ Ticket ${id} was marked as No-Show / Skipped.`);
    setTimeout(() => setCallAnnouncement(null), 4000);

    try {
      if (tenant?.id) {
        await queueApi.updateTicketStatus(id, 'no_show', tenant.id);
      }
    } catch (err) {
      console.warn('[OpsConsole] Backend status update fallback:', err);
    }
  };

  const handleAddWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const custName = newCustomerName.trim();
    setNewCustomerName('');
    setShowWalkinModal(false);

    try {
      if (tenant?.id) {
        const created = await queueApi.createTicket({
          business_id: tenant.id,
          branch_id: branchId,
          service_id: 's_001',
          customer_name: custName,
          is_priority: true,
        });
        const uiItem = mapBackendToUi(created);
        setTickets((prev) => [uiItem, ...prev]);
        setCallAnnouncement(`🎟️ Issued Backend Walk-in Ticket ${uiItem.id} for ${uiItem.name}.`);
      } else {
        throw new Error('Tenant ID not set');
      }
    } catch (err) {
      const fallbackId = `AC-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackTicket: QueueTicket = {
        id: fallbackId,
        name: custName,
        service: 'Priority Walk-in Intake',
        window: 'Immediate',
        status: 'In Waiting',
      };
      setTickets((prev) => [fallbackTicket, ...prev]);
      setCallAnnouncement(`🎟️ Issued Walk-in Ticket ${fallbackId} for ${custName}.`);
    }
    setTimeout(() => setCallAnnouncement(null), 4000);
  };

  const activeWaitingCount = tickets.filter(
    (t) => t.status === 'In Waiting' || t.status === 'Document Verified'
  ).length;

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#291E29]/10 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-extrabold text-[#291E29]">
                Branch Operations & Queue Console
              </h1>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-300 shadow-xs">
                  <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
                  Live WebSocket (Port 8000)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 border border-amber-300">
                  <RefreshCw className="h-3 w-3 text-amber-600 animate-spin" />
                  Connecting Realtime...
                </span>
              )}
            </div>
            <p className="text-xs text-[#291E29]/70 mt-1">
              Live ticket caller, arrival triage, and counter assignments for {tenant.name} (Branch: Lekki Flagship).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTickets}
              disabled={isLoading}
              title="Refresh queue from backend"
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowWalkinModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#291E29] px-4 py-2.5 text-xs font-bold text-[#FFF6E9] shadow-sm hover:bg-[#341539] transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4 text-[#FFA800]" />
              <span>Issue Walk-in Ticket</span>
            </button>
          </div>
        </div>

        {/* Live Audio / Chime Announcement Banner */}
        {callAnnouncement && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#FFA800] p-4 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 animate-in fade-in">
            <BellRing className="h-5 w-5 animate-bounce shrink-0" />
            <span className="flex-1">{callAnnouncement}</span>
          </div>
        )}

        {/* Walk-in Ticket Modal */}
        {showWalkinModal && (
          <div className="rounded-2xl border border-[#291E29]/15 bg-white p-5 shadow-lg space-y-4 max-w-md animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#291E29]">Issue Walk-in Digital Ticket</h3>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="text-xs text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddWalkin} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Bello"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FFA800] px-4 py-2 font-extrabold text-[#291E29]"
                >
                  Confirm & Issue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Live Active Counter Banner */}
        {servingTicket ? (
          <div className="rounded-3xl border-2 border-[#FFA800] bg-gradient-to-r from-[#291E29] to-[#341539] p-6 text-[#FFF6E9] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#FFA800] text-[#291E29] text-[10px] font-extrabold uppercase px-3 py-1 flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 animate-pulse" /> Counter 1 · Now Serving
              </span>
              <span className="text-xs text-[#FFF6E9]/60 font-mono">
                Started: {servingTicket.callTime || 'Just now'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-3xl font-extrabold text-[#FFA800] bg-black/30 px-4 py-2 rounded-2xl border border-white/10">
                  {servingTicket.id}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">{servingTicket.name}</h3>
                  <p className="text-xs text-[#FFF6E9]/70">
                    {servingTicket.service} · Window {servingTicket.window}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSkipTicket(servingTicket.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10"
                >
                  <SkipForward className="h-4 w-4" /> No-Show / Skip
                </button>
                <button
                  onClick={() => handleCompleteServing(servingTicket.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-600"
                >
                  <Check className="h-4 w-4" /> Complete Service
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#291E29]/20 bg-[#FFF6E9]/30 p-6 text-center space-y-2">
            <p className="font-bold text-sm text-[#291E29]">No Customer Currently at Counter 1</p>
            <p className="text-xs text-[#291E29]/60">
              Select "Call Ticket" below to bring the next waiting customer to your desk.
            </p>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold">Active Lobby Queue</span>
            <div className="text-2xl font-extrabold text-slate-900">{activeWaitingCount} Customers</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold">Pre-Cleared Documents</span>
            <div className="text-2xl font-extrabold text-emerald-600">9 Uploaded</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold">Avg Door-to-Counter</span>
            <div className="text-2xl font-extrabold text-blue-600">4.2 Minutes</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold">Served Today</span>
            <div className="text-2xl font-extrabold text-slate-900">128 Customers</div>
          </div>
        </div>

        {/* Live Serving List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900">Live Ticket Serving Queue</h2>
            <span className="text-[11px] text-slate-500">
              {tickets.filter((t) => t.status !== 'Completed').length} active tickets
            </span>
          </div>

          {tickets.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Queue is currently clear. No pending tickets.
            </p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`flex items-center justify-between rounded-xl border p-4 text-xs transition-colors ${
                    ticket.status === 'Now Serving'
                      ? 'border-[#FFA800] bg-[#FFF6E9]/60'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-base font-extrabold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      {ticket.id}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">{ticket.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {ticket.service} · Window {ticket.window}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        ticket.status === 'Now Serving'
                          ? 'bg-[#FFA800] text-[#291E29]'
                          : ticket.status === 'Document Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'Completed'
                          ? 'bg-slate-200 text-slate-500 line-through'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {ticket.status}
                    </span>

                    {ticket.status === 'Now Serving' ? (
                      <button
                        onClick={() => handleCompleteServing(ticket.id)}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 font-bold text-white shadow-sm hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" /> Complete
                      </button>
                    ) : ticket.status !== 'Completed' ? (
                      <button
                        onClick={() => handleCallTicket(ticket)}
                        className="flex items-center gap-1 rounded-xl bg-[#291E29] px-3.5 py-2 font-bold text-white shadow-sm hover:bg-[#341539]"
                      >
                        <Play className="h-3.5 w-3.5 fill-white" /> Call Ticket
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TenantStaffLayout>
  );
}
