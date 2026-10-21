'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { updateTenant } from '../../../../../lib/tenant';
import { queueApi, BackendTicket } from '../../../../../lib/queue-api';
import { useBranchRealtime } from '../../../../../lib/use-realtime';
import { getTenantServices } from '../../../../../mock/services';
import {
  generateAiContent,
  getStoredGroqKey,
  setStoredGroqKey,
} from '../../../../../lib/ai-service';
import {
  LayoutDashboard,
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
  ExternalLink,
  Megaphone,
  Smartphone,
  Tv,
  MessageSquare,
  Share2,
  Sparkles,
  Key,
  Send,
  History,
  X,
  Trash2,
  AlertCircle,
  FileCheck2,
  ChevronDown,
  Calendar,
  Building,
  UserCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ClientDetailModal, ClientData } from '../../../../../components/shared/ClientDetailModal';
import Link from 'next/link';

export interface BroadcastHistoryItem {
  id: string;
  text: string;
  time: string;
  channel?: string;
  severity?: 'normal' | 'rush' | 'urgent';
}

export type QueueStatus =
  | 'BOOKED'
  | 'CHECKED-IN'
  | 'CALLED'
  | 'SERVING'
  | 'DONE'
  | 'NO-SHOW';

export interface OpsTicket {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  service: string;
  slotTime: string;
  windowTime: string;
  counterId?: string;
  status: QueueStatus;
  calledAt?: string;
  backendTicket?: BackendTicket;
}

export interface OpsCounter {
  id: string;
  name: string;
  status: 'ready' | 'serving' | 'closed';
  currentTicketCode?: string;
  currentCustomerName?: string;
}

function StaffOpsConsoleContent() {
  const { tenant, setTenant } = useTenant();
  const searchParams = useSearchParams();
  const router = useRouter();
  const branchId = 'b_001';
  const basePath = `/tenant/${tenant.slug}/staff`;

  // Read initial tab if broadcast tab requested via query param
  const initialTab = searchParams.get('tab') || searchParams.get('section');
  const [activeTab, setActiveTab] = useState<'console' | 'broadcast'>(
    initialTab === 'broadcast' ? 'broadcast' : 'console'
  );

  useEffect(() => {
    const t = searchParams.get('tab') || searchParams.get('section');
    if (t === 'broadcast') {
      setActiveTab('broadcast');
    } else {
      setActiveTab('console');
    }
  }, [searchParams]);

  const ticketPrefix =
    tenant?.slug === 'access-bank'
      ? 'AC'
      : tenant?.slug === 'metrotrust-bank'
      ? 'VI'
      : tenant?.slug
      ? tenant.slug.substring(0, 2).toUpperCase()
      : 'TK';

  const serviceUnit = tenant?.branding?.serviceUnitName || 'Counter';
  const tenantServices = getTenantServices(tenant.id);
  const defaultServiceName =
    tenantServices[0]?.name ||
    (tenant?.businessScale === 'sme' ? 'Standard Styling & Service' : 'Account opening & KYC');

  // Selected date and branch
  const [selectedBranch, setSelectedBranch] = useState(
    tenant.businessScale === 'sme'
      ? `${tenant.name} · Main Studio`
      : `${tenant.name} · Victoria Island HQ`
  );
  const [selectedDate, setSelectedDate] = useState('20/10/2026');

  // Operational Counters Grid (12 counters / stations)
  const [counters, setCounters] = useState<OpsCounter[]>([
    { id: 'C1', name: 'C1', status: 'serving', currentTicketCode: `${ticketPrefix}-021`, currentCustomerName: 'Ngozi Adeyemi' },
    { id: 'C2', name: 'C2', status: 'ready' },
    { id: 'C3', name: 'C3', status: 'ready' },
    { id: 'C4', name: 'C4', status: 'ready' },
    { id: 'C5', name: 'C5', status: 'ready' },
    { id: 'C6', name: 'C6', status: 'ready' },
    { id: 'C7', name: 'C7', status: 'ready' },
    { id: 'C8', name: 'C8', status: 'ready' },
    { id: 'C9', name: 'C9', status: 'ready' },
    { id: 'C10', name: 'C10', status: 'closed' },
    { id: 'C11', name: 'C11', status: 'closed' },
    { id: 'C12', name: 'C12', status: 'closed' },
  ]);

  // Initial Operational Queue Tickets
  const [tickets, setTickets] = useState<OpsTicket[]>([
    {
      id: 't-1',
      code: `${ticketPrefix}-022`,
      customerName: 'Blessing Udo',
      phone: '0814 229 9901',
      service: tenantServices[0]?.name || defaultServiceName,
      slotTime: '08:10',
      windowTime: '08:00–08:30',
      status: 'BOOKED',
    },
    {
      id: 't-2',
      code: `${ticketPrefix}-021`,
      customerName: 'Ngozi Adeyemi',
      phone: '0807 332 1109',
      service: tenantServices[1]?.name || 'Cards & e-channels',
      slotTime: '09:40',
      windowTime: '09:30–10:00',
      counterId: 'C1',
      status: 'CALLED',
      calledAt: '09:41',
    },
    {
      id: 't-3',
      code: `${ticketPrefix}-024`,
      customerName: 'Funke Adeleke',
      phone: '0802 998 7711',
      service: tenantServices[2]?.name || 'Loans & advisory desk',
      slotTime: '10:10',
      windowTime: '10:00–10:30',
      status: 'CHECKED-IN',
    },
    {
      id: 't-4',
      code: `${ticketPrefix}-020`,
      customerName: 'Adaeze Okafor',
      phone: '0803 214 8890',
      service: tenantServices[2]?.name || 'Loans & advisory desk',
      slotTime: '11:20',
      windowTime: '11:00–11:30',
      counterId: 'C2',
      status: 'SERVING',
      calledAt: '11:22',
    },
    {
      id: 't-5',
      code: `${ticketPrefix}-025`,
      customerName: 'Fatima Bello',
      phone: '0812 900 4455',
      service: tenantServices[0]?.name || defaultServiceName,
      slotTime: '11:50',
      windowTime: '11:30–12:00',
      status: 'BOOKED',
    },
    {
      id: 't-6',
      code: `${ticketPrefix}-023`,
      customerName: 'Mariam Yusuf',
      phone: '0708 334 7788',
      service: tenantServices[0]?.name || defaultServiceName,
      slotTime: '13:20',
      windowTime: '13:00–13:30',
      status: 'BOOKED',
    },
  ]);

  // Queue table filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | QueueStatus>('All');

  // Announcement state
  const [callAnnouncement, setCallAnnouncement] = useState<string | null>(null);
  const [quickAnnouncementInput, setQuickAnnouncementInput] = useState('');
  const [activeBroadcastNotice, setActiveBroadcastNotice] = useState(
    tenant?.branding?.announcementTicker || 'Counters 4–6 now open for SME deposits'
  );
  const [broadcastMeta, setBroadcastMeta] = useState('Broadcast 42m ago · displays + SMS');

  // Audio & Speech Synthesis
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  // Walk-in modal
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServiceId, setWalkinServiceId] = useState('');

  // Groq modal state
  const [showGroqModal, setShowGroqModal] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [hasGroqKey, setHasGroqKey] = useState(false);

  // Broadcast Studio State
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastHistoryItem[]>([

    { id: 'bh-1', text: 'Counters 4–6 now open for commercial accounts & SME deposits', time: '42m ago', channel: 'Displays + Trackers', severity: 'normal' },
    { id: 'bh-2', text: 'Lunch hour rush: Door wait time under 4 minutes across all windows', time: '2h ago', channel: 'All Channels', severity: 'rush' },
    { id: 'bh-3', text: 'Fast-track KYC: Upload ID on phone while seated to skip intake queue', time: 'Yesterday', channel: 'Trackers + TV', severity: 'normal' },
  ]);

  const [broadcastInput, setBroadcastInput] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'normal' | 'rush' | 'urgent'>('normal');
  const [targetChannels, setTargetChannels] = useState({
    trackers: true,
    lobbyTv: true,
    sms: false,
  });
  const [playChimeOnBroadcast, setPlayChimeOnBroadcast] = useState(true);
  const [voiceOnBroadcast, setVoiceOnBroadcast] = useState(false);

  const handlePublishStudioBroadcast = (textToPublish?: string) => {
    const cleanText = (textToPublish || broadcastInput).trim();
    if (!cleanText) return;

    setActiveBroadcastNotice(cleanText);
    setBroadcastMeta(`Broadcast Just now · ${targetChannels.lobbyTv ? 'TV ' : ''}${targetChannels.trackers ? '+ Trackers ' : ''}${targetChannels.sms ? '+ SMS' : ''}`.trim());
    setBroadcastHistory((prev) => [
      {
        id: `bh-${Date.now()}`,
        text: cleanText,
        time: 'Just now',
        channel: `${targetChannels.lobbyTv ? 'TV ' : ''}${targetChannels.trackers ? '+ Trackers' : ''}`,
        severity: broadcastSeverity,
      },
      ...prev,
    ]);
    setBroadcastInput('');

    if (setTenant) {
      setTenant({
        ...tenant,
        branding: {
          ...tenant.branding,
          announcementTicker: cleanText,
        },
      });
    }

    if (playChimeOnBroadcast) {
      playChime();
    }
    if (voiceOnBroadcast && voiceEnabled) {
      speakAnnouncement(`Announcement: ${cleanText}`);
    }

    setCallAnnouncement(`📢 Broadcast live on customer trackers and lobby displays!`);
    setTimeout(() => setCallAnnouncement(null), 4000);
  };

  const handleClearBroadcast = () => {
    setActiveBroadcastNotice('Welcome! Please take a seat, your ticket will be called shortly.');
    setBroadcastMeta('Default Lobby Welcome Notice');
    setCallAnnouncement('Cleared active ticker broadcast');
    setTimeout(() => setCallAnnouncement(null), 3000);
  };

  useEffect(() => {
    const k = getStoredGroqKey();
    if (k) {
      setGroqKeyInput(k);
      setHasGroqKey(true);
    }
  }, []);

  // Audio PA Chime
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
      // Audio fallback
    }
  };

  // Browser Speech Synthesis
  const speakAnnouncement = (text: string) => {
    if (!voiceEnabled) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('[OpsConsole] Speech synthesis error:', e);
      }
    }
  };

  // Connect WebSocket realtime
  const { isConnected } = useBranchRealtime({
    businessId: tenant?.id,
    branchId,
    enabled: Boolean(tenant?.id),
    onTicketCreated: (created) => {
      const newTicket: OpsTicket = {
        id: `t-${Date.now()}`,
        code: created.ticket_number,
        customerName: created.customer_name,
        phone: '0800 000 0000',
        service: defaultServiceName,
        slotTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        windowTime: 'Immediate',
        status: 'CHECKED-IN',
        backendTicket: created,
      };
      setTickets((prev) => [newTicket, ...prev]);
      playChime();
      setCallAnnouncement(`🔔 New arrival: Ticket ${newTicket.code} (${newTicket.customerName}) checked in!`);
      setTimeout(() => setCallAnnouncement(null), 5000);
    },
    onTicketStatusChanged: (updated) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.code === updated.ticket_number) {
            let nextStatus: QueueStatus = 'CHECKED-IN';
            if (updated.status === 'called') nextStatus = 'CALLED';
            if (updated.status === 'done') nextStatus = 'DONE';
            if (updated.status === 'cancelled' || updated.status === 'no_show') nextStatus = 'NO-SHOW';
            return { ...t, status: nextStatus };
          }
          return t;
        })
      );
    },
  });

  // Calculate Operational Metrics
  const scheduledCount = tickets.length;
  const waitingCount = tickets.filter((t) => t.status === 'BOOKED' || t.status === 'CHECKED-IN').length;
  const atCountersCount = tickets.filter((t) => t.status === 'CALLED' || t.status === 'SERVING').length;
  const servedCount = tickets.filter((t) => t.status === 'DONE').length;
  const noShowCount = tickets.filter((t) => t.status === 'NO-SHOW').length;
  const openCountersCount = counters.filter((c) => c.status !== 'closed').length;

  // Next Up Ticket (first checked-in or booked ticket)
  const nextUpTicket = useMemo(() => {
    return (
      tickets.find((t) => t.status === 'CHECKED-IN') ||
      tickets.find((t) => t.status === 'BOOKED') ||
      null
    );
  }, [tickets]);

  // Call Next Ticket Handler
  const handleCallTicket = (ticket: OpsTicket) => {
    playChime();

    // Find first ready counter
    const readyCounter = counters.find((c) => c.status === 'ready') || counters[0];
    const assignedCounterId = readyCounter?.id || 'C1';

    // Update tickets
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              status: 'CALLED',
              counterId: assignedCounterId,
              calledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      )
    );

    // Update counter status
    setCounters((prev) =>
      prev.map((c) =>
        c.id === assignedCounterId
          ? {
              ...c,
              status: 'serving',
              currentTicketCode: ticket.code,
              currentCustomerName: ticket.customerName,
            }
          : c
      )
    );

    const announcement = `Ticket ${ticket.code}, ${ticket.customerName}, please proceed to ${serviceUnit} ${assignedCounterId.replace('C', '')}.`;
    setCallAnnouncement(`📢 Calling ${ticket.code} (${ticket.customerName}) to ${serviceUnit} ${assignedCounterId}!`);
    speakAnnouncement(announcement);

    setTimeout(() => setCallAnnouncement(null), 6000);
  };

  // Serve Ticket
  const handleServeTicket = (ticketId: string, counterId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'SERVING', counterId } : t))
    );
    setCallAnnouncement(`👨‍💼 Now serving at ${serviceUnit} ${counterId.replace('C', '')}`);
    setTimeout(() => setCallAnnouncement(null), 3000);
  };

  // Complete Ticket
  const handleCompleteTicket = (ticketId: string) => {
    const t = tickets.find((tk) => tk.id === ticketId);
    if (t?.counterId) {
      // Free up counter
      setCounters((prev) =>
        prev.map((c) =>
          c.id === t.counterId
            ? { ...c, status: 'ready', currentTicketCode: undefined, currentCustomerName: undefined }
            : c
        )
      );
    }
    setTickets((prev) =>
      prev.map((tk) => (tk.id === ticketId ? { ...tk, status: 'DONE' } : tk))
    );
    playChime();
    setCallAnnouncement(`✅ Ticket ${t?.code || ''} marked Complete.`);
    setTimeout(() => setCallAnnouncement(null), 3500);
  };

  // No-Show Ticket
  const handleNoShowTicket = (ticketId: string) => {
    const t = tickets.find((tk) => tk.id === ticketId);
    if (t?.counterId) {
      setCounters((prev) =>
        prev.map((c) =>
          c.id === t.counterId
            ? { ...c, status: 'ready', currentTicketCode: undefined, currentCustomerName: undefined }
            : c
        )
      );
    }
    setTickets((prev) =>
      prev.map((tk) => (tk.id === ticketId ? { ...tk, status: 'NO-SHOW' } : tk))
    );
    setCallAnnouncement(`⏭️ Ticket ${t?.code || ''} recorded as No-Show.`);
    setTimeout(() => setCallAnnouncement(null), 3500);
  };

  // Check In Ticket
  const handleCheckInTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'CHECKED-IN' } : t))
    );
    setCallAnnouncement(`🎫 Customer verified & checked into waiting queue.`);
    setTimeout(() => setCallAnnouncement(null), 3000);
  };

  // Toggle Counter
  const handleToggleCounter = (counterId: string) => {
    setCounters((prev) =>
      prev.map((c) => {
        if (c.id === counterId) {
          if (c.status === 'closed') return { ...c, status: 'ready' };
          if (c.status === 'ready') return { ...c, status: 'closed' };
          if (c.status === 'serving') {
            return { ...c, status: 'ready', currentTicketCode: undefined, currentCustomerName: undefined };
          }
        }
        return c;
      })
    );
  };

  // Publish Quick Announcement
  const handleSendQuickAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAnnouncementInput.trim()) return;

    const text = quickAnnouncementInput.trim();
    setActiveBroadcastNotice(text);
    setBroadcastMeta('Broadcast Just now · displays + SMS');
    setBroadcastHistory((prev) => [{ id: `bh-${Date.now()}`, text, time: 'Just now', channel: 'Displays + SMS', severity: 'normal' }, ...prev]);
    setQuickAnnouncementInput('');

    playChime();
    setCallAnnouncement(`📢 Branch Broadcast Sent: "${text}"`);
    setTimeout(() => setCallAnnouncement(null), 5000);

    // Save to tenant branding
    await updateTenant(tenant.slug, {
      branding: {
        ...tenant.branding,
        announcementTicker: text,
      },
    });
  };

  // Open Client Details
  const handleOpenClient = (ticket: OpsTicket) => {
    const isSme = tenant.businessScale === 'sme';
    const found: ClientData = {
      id: `c_${ticket.code}`,
      name: ticket.customerName,
      email: `${ticket.customerName.toLowerCase().replace(/[^a-z]/g, '.')}@example.com`,
      phone: ticket.phone,
      avatarColor: isSme ? '#702D7B' : '#0057B8',
      tier: 'VIP Diamond',
      visits: 6,
      totalSpend: isSme ? '₦65,000' : '$12,400',
      avgServiceDuration: '20 mins',
      onTimeScore: 99.0,
      lastVisit: 'Today',
      memberSince: 'March 2024',
      preferences: isSme
        ? ['Priority arrival window', 'Prefers Lead specialist', 'Zero lobby waiting']
        : ['Priority counter window', 'Commercial account slip requests'],
      notes: [
        {
          id: 'n_1',
          author: 'Business Owner',
          text: `Ticket #${ticket.code} scheduled for ${ticket.service}.`,
          timestamp: 'Today',
        },
      ],
      history: [
        {
          id: ticket.code,
          date: 'Today',
          service: ticket.service,
          specialist: `${serviceUnit} 1`,
          status: ticket.status === 'SERVING' ? 'In Progress' : 'Priority Window',
          durationMins: 20,
          waitTimeMins: 1.8,
        },
      ],
      review: {
        rating: 5.0,
        comment: 'Fast queue calling and zero lobby waiting! Clean digital check-in.',
        date: 'Today',
        sentiment: 'positive',
      },
      documents: [
        {
          id: `doc_${ticket.code}_1`,
          name: isSme ? 'Service Style Reference / Photo' : 'Government Photo ID / Passport',
          type: 'Identity & Intake',
          fileSize: '3.1 MB JPG',
          uploadedAt: 'Today at 08:05 AM',
          status: 'Pending',
          previewNote: isSme
            ? 'Uploaded style reference photo for specialist'
            : 'National identity document uploaded via mobile check-in',
        },
        {
          id: `doc_${ticket.code}_2`,
          name: isSme ? 'Intake Checklist' : 'Proof of Address & Utility Bill',
          type: 'Pre-Clearance Form',
          fileSize: '1.4 MB PDF',
          uploadedAt: 'Yesterday',
          status: 'Approved',
          previewNote: 'Customer acknowledged safety and service terms',
        },
      ],
    };
    setSelectedClient(found);
  };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = t.code.toLowerCase().includes(q);
        const matchesName = t.customerName.toLowerCase().includes(q);
        const matchesPhone = t.phone.toLowerCase().includes(q);
        const matchesService = t.service.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesPhone && !matchesService) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, searchQuery]);

  return (
    <TenantStaffLayout>
      <div className="space-y-6 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        {/* ========================================================= */}
        {/* TOP HEADER WITH BRANCH SELECTOR & DATE                    */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#291E29] text-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                <LayoutDashboard className="h-3.5 w-3.5 text-[#FFA800]" />
                Operations Console
              </span>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold border border-emerald-300">
                  <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
                  Live WebSocket
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-medium border border-slate-200">
                  <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                  Synced
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-display">
              Run today&apos;s queues
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Call tickets, manage counters and keep every branch flowing &mdash; with voice announcements built in.
            </p>
          </div>

          {/* Right Header Selectors: Branch Picker & Date */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {/* Branch Selector */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
                <Building className="h-4 w-4 text-[#FFA800]" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent pr-6 focus:outline-none cursor-pointer appearance-none text-xs font-bold text-slate-800"
                >
                  <option value={`${tenant.name} · Victoria Island HQ`}>
                    {tenant.name} &middot; Victoria Island HQ
                  </option>
                  <option value={`${tenant.name} · Ikeja Branch`}>
                    {tenant.name} &middot; Ikeja Branch
                  </option>
                  <option value={`${tenant.name} · Lekki Phase 1`}>
                    {tenant.name} &middot; Lekki Phase 1
                  </option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>{selectedDate}</span>
            </div>

            {/* PA Voice Toggle */}
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold transition shadow-2xs border ${
                voiceEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title="Toggle Browser Voice Synthesis PA Announcements"
            >
              <Volume2 className={`h-4 w-4 ${voiceEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{voiceEnabled ? 'PA Voice On' : 'Voice Off'}</span>
            </button>
          </div>
        </div>

        {/* Live Audio / Announcement Toast */}
        {callAnnouncement && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#FFA800] p-4 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 animate-in fade-in">
            <BellRing className="h-5 w-5 animate-bounce shrink-0" />
            <span className="flex-1">{callAnnouncement}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TOP TAB SWITCHER: CONSOLE VS LIVE BROADCASTS              */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="inline-flex rounded-2xl bg-slate-200/60 p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('console');
                router.push(`${basePath}/ops-console`);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                activeTab === 'console'
                  ? 'bg-[#291E29] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-[#FFA800]" />
              <span>Queue Operations</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('broadcast');
                router.push(`${basePath}/ops-console?tab=broadcast`);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all relative ${
                activeTab === 'broadcast'
                  ? 'bg-[#FFA800] text-[#291E29] shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Share2 className="h-4 w-4" />
              <span>Live Broadcasts & Tickers</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'console' ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('broadcast');
                  router.push(`${basePath}/ops-console?tab=broadcast`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition shadow-2xs"
              >
                <Megaphone className="h-3.5 w-3.5 text-[#FFA800]" />
                <span>Open Full Broadcast Studio &rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('console');
                  router.push(`${basePath}/ops-console`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-600" />
                <span>&larr; Back to Queue Operations</span>
              </button>
            )}
          </div>
        </div>

        {/* Render Queue Operations Tab */}
        {activeTab === 'console' ? (
          <>
            {/* ========================================================= */}
            {/* TOP METRICS KPI BAR (6 TILES)                             */}
            {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              SCHEDULED
            </span>
            <div className="text-2xl font-extrabold text-slate-900">{scheduledCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">tickets today</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              WAITING
            </span>
            <div className="text-2xl font-extrabold text-[#FFA800]">{waitingCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">in queue</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              AT COUNTERS
            </span>
            <div className="text-2xl font-extrabold text-blue-600">{atCountersCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">called + serving</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              SERVED
            </span>
            <div className="text-2xl font-extrabold text-emerald-600">{servedCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">
              {scheduledCount > 0 ? Math.round((servedCount / scheduledCount) * 100) : 0}% complete
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              NO-SHOW
            </span>
            <div className="text-2xl font-extrabold text-slate-400">{noShowCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">missed / cancelled</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              NETWORK LIVE
            </span>
            <div className="text-2xl font-extrabold text-purple-700">173</div>
            <span className="text-[10px] text-slate-500 font-medium">across branches</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* OPERATIONAL HERO TRIAGE GRID (3 CARDS)                    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* ------------------------------------------------------- */}
          {/* CARD 1: NEXT UP HERO CARD (4 COLS)                      */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-4 rounded-3xl border border-[#291E29]/15 bg-gradient-to-br from-[#291E29] to-[#341539] p-5 sm:p-6 text-white shadow-lg flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#FFA800]">
                  <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                  Next Up
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  {nextUpTicket ? nextUpTicket.windowTime : 'Queue Clear'}
                </span>
              </div>

              {nextUpTicket ? (
                <div className="space-y-2">
                  <div className="font-mono text-3xl sm:text-4xl font-black text-[#FFA800] tracking-tight">
                    {nextUpTicket.code}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white truncate">
                      {nextUpTicket.customerName}
                    </h3>
                    <p className="text-xs text-slate-300 truncate">
                      {nextUpTicket.service}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Slot {nextUpTicket.slotTime} &middot; window {nextUpTicket.windowTime}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-white">All Scheduled Tickets Called</p>
                  <p>Issue a walk-in below to summon new customers.</p>
                </div>
              )}
            </div>

            {nextUpTicket ? (
              <button
                type="button"
                onClick={() => handleCallTicket(nextUpTicket)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFA800] hover:bg-[#ffb61a] active:scale-95 text-[#291E29] py-3.5 px-4 text-xs font-extrabold shadow-md transition-all"
              >
                <BellRing className="h-4 w-4" />
                <span>Call this ticket</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowWalkinModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white py-3 px-4 text-xs font-bold transition"
              >
                <Plus className="h-4 w-4 text-[#FFA800]" />
                <span>Issue Walk-in Ticket</span>
              </button>
            )}
          </div>

          {/* ------------------------------------------------------- */}
          {/* CARD 2: BRANCH ANNOUNCEMENTS (4 COLS)                   */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Megaphone className="h-3.5 w-3.5 text-[#FFA800]" />
                  Branch Announcements
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Composer */}
              <form onSubmit={handleSendQuickAnnouncement} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Counter 3 closed for 15 min..."
                  value={quickAnnouncementInput}
                  onChange={(e) => setQuickAnnouncementInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFA800] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!quickAnnouncementInput.trim()}
                  className="rounded-xl bg-[#291E29] hover:bg-[#341539] text-white px-4 py-2 text-xs font-bold disabled:opacity-40 transition shadow-2xs shrink-0"
                >
                  Send
                </button>
              </form>

              {/* Active Broadcast Display Card */}
              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50 p-3.5 space-y-1">
                <p className="font-bold text-xs text-slate-900 leading-snug">
                  {activeBroadcastNotice}
                </p>
                <p className="text-[10px] text-slate-500">
                  {broadcastMeta}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <button
                type="button"
                onClick={playChime}
                className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
              >
                <Volume2 className="h-3.5 w-3.5 text-[#FFA800]" /> Test PA Chime
              </button>
              <Link
                href={`/tenant/${tenant.slug}/staff/social-studio`}
                className="text-amber-700 hover:underline font-bold flex items-center gap-1"
              >
                Social Studio &rarr;
              </Link>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* CARD 3: COUNTERS GRID (4 COLS)                          */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-[#FFA800]" />
                  {serviceUnit}s ({openCountersCount}/12 open)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">tap to toggle</span>
              </div>

              {/* 12 Counters Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-3">
                {counters.map((c) => {
                  const isServing = c.status === 'serving';
                  const isReady = c.status === 'ready';
                  const isClosed = c.status === 'closed';

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleCounter(c.id)}
                      className={`rounded-xl border p-2 text-left transition-all ${
                        isServing
                          ? 'border-blue-300 bg-blue-50/60 shadow-2xs'
                          : isReady
                          ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 shadow-2xs'
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                      title={
                        isServing
                          ? `${c.name}: Serving ${c.currentTicketCode} (${c.currentCustomerName}). Tap to free up.`
                          : isReady
                          ? `${c.name}: Ready for next customer. Tap to close.`
                          : `${c.name}: Closed. Tap to open.`
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">{c.name}</span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isServing
                              ? 'bg-blue-600 animate-pulse'
                              : isReady
                              ? 'bg-emerald-500'
                              : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <div className="text-[10px] font-bold mt-1 truncate">
                        {isServing ? (
                          <span className="text-blue-700">{c.currentTicketCode}</span>
                        ) : isReady ? (
                          <span className="text-emerald-700">Ready</span>
                        ) : (
                          <span className="text-slate-400">Closed</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Calling a ticket automatically routes to the first open {serviceUnit.toLowerCase()}.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: MAIN QUEUE FEED + INTELLIGENCE SIDEBARS   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ------------------------------------------------------- */}
          {/* LEFT COLUMN: LIVE TICKET QUEUE TABLE (8 COLS)           */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search code, name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFA800] focus:bg-white"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'BOOKED', 'CHECKED-IN', 'CALLED', 'SERVING', 'DONE'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all ${
                        statusFilter === st
                          ? 'bg-[#291E29] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'All' ? 'All' : st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Ticket Table Rows */}
            <div className="space-y-2.5">
              {filteredTickets.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No tickets match your search or filter.
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  return (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 transition hover:bg-white hover:border-[#FFA800]/60 hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      {/* Ticket Code, Time, Name, Service */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-center shrink-0">
                          <span className="font-mono text-sm sm:text-base font-black text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs block">
                            {ticket.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            {ticket.slotTime}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenClient(ticket)}
                              className="font-extrabold text-slate-900 hover:text-[#FFA800] truncate text-left transition flex items-center gap-1 group"
                              title="Click to inspect customer KYC documents & profile"
                            >
                              <span className="truncate">{ticket.customerName}</span>
                              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#FFA800] shrink-0" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {ticket.service} &middot;{' '}
                            <span className="font-mono">{ticket.phone}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status & Dynamic Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                        {/* Status Badge */}
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                            ticket.status === 'BOOKED'
                              ? 'bg-slate-200 text-slate-700'
                              : ticket.status === 'CHECKED-IN'
                              ? 'bg-purple-100 text-purple-800'
                              : ticket.status === 'CALLED'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : ticket.status === 'SERVING'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : ticket.status === 'DONE'
                              ? 'bg-slate-100 text-slate-400 line-through'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {ticket.status}
                        </span>

                        {/* Contextual Action Buttons */}
                        {ticket.status === 'BOOKED' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCheckInTicket(ticket.id)}
                              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                            >
                              Check in
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNoShowTicket(ticket.id)}
                              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition"
                            >
                              No-show
                            </button>
                          </div>
                        )}

                        {ticket.status === 'CHECKED-IN' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCallTicket(ticket)}
                              className="rounded-xl bg-[#291E29] px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-[#341539] transition shadow-xs flex items-center gap-1"
                            >
                              <Play className="h-3 w-3 fill-white" /> Call
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNoShowTicket(ticket.id)}
                              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition"
                            >
                              No-show
                            </button>
                          </div>
                        )}

                        {ticket.status === 'CALLED' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleServeTicket(ticket.id, ticket.counterId || 'C1')
                              }
                              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-xs flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" /> Serve &middot;{' '}
                              {ticket.counterId || 'C1'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNoShowTicket(ticket.id)}
                              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition"
                            >
                              Skip
                            </button>
                          </div>
                        )}

                        {ticket.status === 'SERVING' && (
                          <button
                            type="button"
                            onClick={() => handleCompleteTicket(ticket.id)}
                            className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-700 transition shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* RIGHT COLUMN: OPERATIONAL INTELLIGENCE (4 COLS)         */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-4">
            {/* Widget 1: Document Desk Clearance Alert */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
                  <FileCheck2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Document desk</h3>
                  <span className="text-[10px] text-slate-400">KYC &amp; intake pre-clearance</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                3 customers waiting on verification. Clear them before their windows.
              </p>

              <Link
                href={`/tenant/${tenant.slug}/verify`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition hover:underline"
              >
                <span>Open verification</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Widget 2: Today's Pace Tracker */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#FFA800]" /> Today&apos;s pace
                </span>
                <span className="text-[11px] text-slate-400 font-mono">08:00 &ndash; 16:00</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#FFA800] rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      scheduledCount > 0 ? Math.round((servedCount / scheduledCount) * 100) : 0
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {servedCount} of {scheduledCount} served
                </span>
                <span>avg wait ~9 min</span>
              </div>
            </div>

            {/* Widget 3: Quick Action Launchpad */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Quick Actions
              </h4>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#FFA800]" /> Issue Walk-in Ticket
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">+1</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowGroqModal(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  <span className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#FFA800]" /> Groq AI Broadcast Key
                  </span>
                  <span className="text-[10px] text-emerald-600 font-extrabold">
                    {hasGroqKey ? 'Active' : 'Set Key'}
                  </span>
                </button>

                <Link
                  href={`/tenant/${tenant.slug}`}
                  target="_blank"
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-[#FFA800]" /> Public Customer Portal
                  </span>
                  <span className="text-[10px] text-slate-400">&nearr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        </>
        ) : (
          /* ========================================================= */
          /* DEDICATED LIVE BROADCASTS & TICKER CONTROL STUDIO VIEW    */
          /* ========================================================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#291E29] via-[#341539] to-[#291E29] p-6 sm:p-8 text-white shadow-xl">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-[#FFA800]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FFA800] border border-white/10 text-xs font-extrabold uppercase tracking-widest">
                  <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <span>Omnichannel Live Broadcast Center</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Reach Every Customer Screen Instantly.
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Publish real-time announcements, branch delay advisories, and queue promotions. Messages broadcast instantaneously across customer mobile web trackers, lobby wall displays, and SMS feeds.
                </p>

                {/* Quick stats strip */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                    <Tv className="h-4 w-4 text-[#FFA800]" />
                    <span className="font-bold text-white">3 Lobby Displays Connected</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white">24 Active Mobile Trackers</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-300" />
                    <span className="font-bold text-white">&lt; 1s Real-time WebSocket Latency</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Grid: Interactive Preview & Broadcast Composer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Screen Previews (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-[#FFA800]" />
                        <span>Live Customer Screen Preview</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Real-time mock of the customer mobile web tracker</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Feed
                    </span>
                  </div>

                  {/* Mock Phone Frame */}
                  <div className="mx-auto max-w-[280px] rounded-3xl border-4 border-slate-800 bg-[#FCFBF4] p-3 shadow-xl space-y-3">
                    {/* Phone Top Notch */}
                    <div className="flex justify-between items-center px-1 text-[9px] text-slate-400">
                      <span>9:41 AM</span>
                      <div className="h-3 w-12 bg-slate-800 rounded-full" />
                      <span>5G 100%</span>
                    </div>

                    {/* App Header */}
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/80">
                      <div className="h-5 w-5 rounded-lg bg-[#291E29] flex items-center justify-center text-[10px] font-bold text-[#FFA800]">
                        L
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-800 truncate">{tenant.name}</span>
                    </div>

                    {/* LIVE TICKER BANNER ON PHONE */}
                    <div className="rounded-xl bg-gradient-to-r from-[#291E29] to-[#341539] p-2.5 text-white shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-black tracking-wider text-[#FFA800] uppercase">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>LIVE BROADCAST</span>
                      </div>
                      <p className="text-[11px] font-bold leading-tight line-clamp-3 text-white">
                        {activeBroadcastNotice}
                      </p>
                    </div>

                    {/* Mock Ticket Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2 shadow-xs">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span>YOUR TURN TICKET</span>
                        <span className="text-emerald-600">IN QUEUE</span>
                      </div>
                      <div className="text-xl font-black text-slate-900 tracking-tight">
                        {ticketPrefix}-022
                      </div>
                      <p className="text-[10px] text-slate-500">2 customers ahead &middot; Est. 4 mins</p>
                    </div>
                  </div>

                  {/* Smart TV Marquee Display Preview */}
                  <div className="rounded-2xl bg-[#291E29] p-4 text-white space-y-2 shadow-sm border border-white/10">
                    <div className="flex items-center justify-between text-[10px] text-[#FFA800] font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Tv className="h-3.5 w-3.5" />
                        <span>Lobby TV Marquee Display</span>
                      </span>
                      <span className="text-slate-400">Screen 1 &middot; Active</span>
                    </div>
                    <div className="overflow-hidden whitespace-nowrap bg-black/40 rounded-xl p-2.5 border border-white/10">
                      <div className="text-xs font-bold text-white flex items-center gap-4">
                        <span className="text-[#FFA800] font-black uppercase tracking-wider text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                          ANNOUNCEMENT
                        </span>
                        <span>{activeBroadcastNotice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleClearBroadcast}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Active Ticker</span>
                    </button>
                    <Link
                      href={`/tenant/${tenant.slug}/track`}
                      target="_blank"
                      className="text-xs text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open Customer Tracker &nearr;</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Multi-Channel Composer & Presets (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-[#FFA800]" />
                        <span>Compose Live Announcement</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Broadcast custom copy or choose a high-velocity template</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGroqModal(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" />
                      <span>AI Copilot</span>
                    </button>
                  </div>

                  {/* Target Delivery Channels */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Target Delivery Channels
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                          targetChannels.trackers
                            ? 'bg-amber-50/60 border-amber-300 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={targetChannels.trackers}
                          onChange={(e) =>
                            setTargetChannels({ ...targetChannels, trackers: e.target.checked })
                          }
                          className="rounded text-[#FFA800] focus:ring-[#FFA800]"
                        />
                        <Smartphone className="h-4 w-4 text-[#FFA800]" />
                        <span className="text-xs font-bold">Mobile Trackers</span>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                          targetChannels.lobbyTv
                            ? 'bg-amber-50/60 border-amber-300 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={targetChannels.lobbyTv}
                          onChange={(e) =>
                            setTargetChannels({ ...targetChannels, lobbyTv: e.target.checked })
                          }
                          className="rounded text-[#FFA800] focus:ring-[#FFA800]"
                        />
                        <Tv className="h-4 w-4 text-[#FFA800]" />
                        <span className="text-xs font-bold">Lobby Smart TVs</span>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                          targetChannels.sms
                            ? 'bg-amber-50/60 border-amber-300 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={targetChannels.sms}
                          onChange={(e) =>
                            setTargetChannels({ ...targetChannels, sms: e.target.checked })
                          }
                          className="rounded text-[#FFA800] focus:ring-[#FFA800]"
                        />
                        <MessageSquare className="h-4 w-4 text-[#FFA800]" />
                        <span className="text-xs font-bold">SMS Priority Push</span>
                      </label>
                    </div>
                  </div>

                  {/* 1-Tap Broadcast Presets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        High-Velocity Presets (Tap to Load)
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">1-click insert</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Counters 4–6 Open', text: 'Counters 4–6 now open for commercial accounts and SME deposits.' },
                        { label: 'Lunch Rush Speed', text: 'Lunch hour rush: All service windows running at peak velocity. Wait under 4 mins.' },
                        { label: 'Fast-Track KYC', text: 'Skip intake queue: Upload ID on your phone while seated to get fast-tracked.' },
                        { label: 'Sanitizing Break', text: 'Station 2 temporarily sanitizing: resuming in 5 minutes. Thank you.' },
                        { label: 'Closing Intake', text: 'Queue intake closes at 4:30 PM. Active ticket holders will all be served.' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setBroadcastInput(preset.text)}
                          className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-950 px-2.5 py-1 text-xs font-semibold text-slate-700 transition"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea Composer */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <label htmlFor="broadcast-text">Broadcast Announcement Text</label>
                      <span className={`text-[11px] ${broadcastInput.length > 140 ? 'text-amber-600 font-extrabold' : 'text-slate-400'}`}>
                        {broadcastInput.length} / 160 characters
                      </span>
                    </div>
                    <textarea
                      id="broadcast-text"
                      rows={3}
                      placeholder="e.g. Attention visitors: All service counters are operating at peak speed. Please check your phone for counter calls..."
                      value={broadcastInput}
                      onChange={(e) => setBroadcastInput(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFA800] focus:border-transparent"
                    />
                  </div>

                  {/* Audio Chime & Speech Options */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={playChimeOnBroadcast}
                          onChange={(e) => setPlayChimeOnBroadcast(e.target.checked)}
                          className="rounded text-[#FFA800] focus:ring-[#FFA800]"
                        />
                        <Volume2 className="h-3.5 w-3.5 text-[#FFA800]" />
                        <span>Play 2-Tone PA Chime</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={voiceOnBroadcast}
                          onChange={(e) => setVoiceOnBroadcast(e.target.checked)}
                          className="rounded text-[#FFA800] focus:ring-[#FFA800]"
                        />
                        <BellRing className="h-3.5 w-3.5 text-blue-500" />
                        <span>Read with Voice PA</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={playChime}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Test Speaker</span>
                    </button>
                  </div>

                  {/* Publish Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={!broadcastInput.trim()}
                      onClick={() => handlePublishStudioBroadcast()}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#FFA800] hover:bg-[#ffb41f] text-[#291E29] font-black text-sm transition shadow-md shadow-[#FFA800]/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Send className="h-4 w-4" />
                      <span>Publish Live Broadcast to All Displays</span>
                    </button>
                  </div>
                </div>

                {/* Broadcast History & Logs */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <History className="h-4 w-4 text-[#FFA800]" />
                      <span>Broadcast Log & Previous Advisories</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-bold">{broadcastHistory.length} sent</span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {broadcastHistory.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          idx === 0
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFA800] text-[#291E29]">
                                Active Now
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-500">{item.time}</span>
                            <span className="text-[10px] text-slate-400">&middot; {item.channel || 'All Screens'}</span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 leading-snug">
                            {item.text}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePublishStudioBroadcast(item.text)}
                          className="shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-xs font-bold text-slate-800 transition shadow-2xs self-start sm:self-center"
                        >
                          Re-broadcast &nearr;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Walk-in Ticket Modal */}
        {showWalkinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 w-full max-w-md">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Ticket className="h-4 w-4 text-[#FFA800]" /> Issue Walk-in Ticket
                </h3>
                <button
                  onClick={() => setShowWalkinModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!walkinName.trim()) return;

                  const newCode = `${ticketPrefix}-${Math.floor(100 + Math.random() * 900)}`;
                  const selectedService =
                    tenantServices.find((s) => s.id === walkinServiceId) || tenantServices[0];

                  const newT: OpsTicket = {
                    id: `t-${Date.now()}`,
                    code: newCode,
                    customerName: walkinName.trim(),
                    phone: walkinPhone.trim() || '0800 000 0000',
                    service: selectedService ? selectedService.name : defaultServiceName,
                    slotTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    windowTime: 'Immediate',
                    status: 'CHECKED-IN',
                  };

                  setTickets((prev) => [newT, ...prev]);
                  setWalkinName('');
                  setWalkinPhone('');
                  setShowWalkinModal(false);
                  playChime();
                  setCallAnnouncement(`🎟️ Issued Walk-in Ticket ${newCode} for ${newT.customerName}`);
                  setTimeout(() => setCallAnnouncement(null), 4000);
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babajide Cole"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 0803 123 4567"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                </div>

                {tenantServices.length > 0 && (
                  <div>
                    <label className="font-bold text-slate-700">Service Department</label>
                    <select
                      value={walkinServiceId || tenantServices[0].id}
                      onChange={(e) => setWalkinServiceId(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] bg-white"
                    >
                      {tenantServices.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (~{s.minutes} mins)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWalkinModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#291E29] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#341539]"
                  >
                    Issue &amp; Check-In
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Groq Key Modal */}
        {showGroqModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Key className="h-4 w-4 text-[#FFA800]" /> Groq AI API Key
                </h3>
                <button
                  onClick={() => setShowGroqModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Enter your free Groq API key for high-speed Llama 3 generation of broadcast copy and customer responses.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStoredGroqKey(groqKeyInput);
                  setHasGroqKey(Boolean(groqKeyInput.trim()));
                  setShowGroqModal(false);
                }}
                className="space-y-4 text-xs"
              >
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGroqModal(false)}
                    className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#291E29] px-5 py-2 font-bold text-white"
                  >
                    Save Key
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Client Detail Modal */}
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          businessScale={tenant?.businessScale}
          serviceUnitName={serviceUnit}
        />
      </div>
    </TenantStaffLayout>
  );
}

export default function StaffOpsConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Loading Operations Console...
        </div>
      }
    >
      <StaffOpsConsoleContent />
    </Suspense>
  );
}
