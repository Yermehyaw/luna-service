'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { useAuth } from '../../../../../lib/auth';
import { generateAiContent } from '../../../../../lib/ai-service';
import { getTenantServices } from '../../../../../mock/services';
import {
  MessageSquare,
  Search,
  Filter,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
  ChevronDown,
  Calendar,
  Lightbulb,
  BarChart3,
  ExternalLink,
  Plus,
  RefreshCw,
  Share2,
  Ticket,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Radio,
  FileCheck2,
  Check,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  ArrowLeft,
  Copy,
  Lock,
  Zap,
  Globe,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

export type ChannelPlatform =
  | 'instagram'
  | 'x'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'whatsapp';

export type SentimentType = 'negative' | 'neutral' | 'positive';
export type ConversationStatus = 'open' | 'urgent' | 'resolved';
export type ConversationKind = 'all' | 'dm' | 'comment' | 'mention';

export interface SocialMessage {
  id: string;
  sender: 'customer' | 'staff' | 'ai';
  authorName: string;
  text: string;
  timestamp: string;
}

export interface SocialConversation {
  id: string;
  platform: ChannelPlatform;
  kind: 'dm' | 'comment' | 'mention';
  canReply?: boolean;
  replyRestrictionReason?: string;
  isLoyalty?: boolean;
  authorName: string;
  authorHandle: string;
  avatarColor: string;
  initialTime: string;
  date: string;
  preview: string;
  sentiment: SentimentType;
  category: string;
  urgent: boolean;
  status: ConversationStatus;
  assignee: string;
  messages: SocialMessage[];
}

type ScheduledSocialPost = {
  id: string;
  text: string;
  mediaName: string;
  mediaUrl: string;
  handles: string[];
  scheduledAt: string;
  status: 'scheduled' | 'posted';
};

export default function SocialStudioPage() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const tenantServices = getTenantServices(tenant.id);

  // Navigation tab inside Social Studio
  const [activeTab, setActiveTab] = useState<'inbox' | 'calendar' | 'ideas' | 'analytics'>('inbox');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Inbox filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'urgent' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | ChannelPlatform>('all');
  const [kindFilter, setKindFilter] = useState<ConversationKind>('all');

  // Gating & Trial & Social Credits
  const [trialStarted, setTrialStarted] = useState(false);
  const [credits, setCredits] = useState(50);
  const isFreePlan = !tenant.plan || tenant.plan === 'free' || tenant.plan === 'free_subdomain';

  // State: Bio link nudge & refresh
  const [bioCopied, setBioCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // State: "Pay in the Conversation" / Send Booking Ticket Modal
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedTicketServiceId, setSelectedTicketServiceId] = useState('');

  // State: Connected Platform Accounts
  const [connectAccountModalOpen, setConnectAccountModalOpen] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, string>>({
    instagram: '@folashair_studio',
    whatsapp: '+234 809 445 5667',
  });
  const [newPlatformToConnect, setNewPlatformToConnect] = useState<ChannelPlatform>('x');
  const [newPlatformUsername, setNewPlatformUsername] = useState('');

  // State: PAYG top-up modal
  const [paygModalOpen, setPaygModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);

  // Scheduled Posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledSocialPost[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [postEditorOpen, setPostEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postText, setPostText] = useState('');
  const [postHandles, setPostHandles] = useState<string[]>([]);
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('09:00');
  const [postMediaName, setPostMediaName] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postSaving, setPostSaving] = useState(false);

  // Conversation Threads with Loyalty VIPs and Mentions Policy Restrictions
  const [conversations, setConversations] = useState<SocialConversation[]>([
    {
      id: 'conv-01',
      platform: 'instagram',
      kind: 'dm',
      canReply: true,
      isLoyalty: true,
      authorName: 'Amara Kalu',
      authorHandle: '@amara_kalu',
      avatarColor: '#E1306C',
      initialTime: '15m ago',
      date: 'Today, 10:45',
      preview: 'Hi! Can I add a hydration treatment to my silk press booking for today?',
      sentiment: 'positive',
      category: 'Booking · add-on service',
      urgent: false,
      status: 'open',
      assignee: 'Business Owner',
      messages: [
        {
          id: 'm-1',
          sender: 'customer',
          authorName: 'Amara Kalu',
          text: 'Hi! Can I add a hydration treatment to my silk press booking for today?',
          timestamp: '15m ago',
        },
      ],
    },
    {
      id: 'conv-02',
      platform: 'instagram',
      kind: 'mention',
      canReply: false,
      replyRestrictionReason: 'Mentions cannot be replied to due to strict social media API usage policies.',
      isLoyalty: false,
      authorName: 'chioma.styles',
      authorHandle: '@chioma.styles',
      avatarColor: '#E1306C',
      initialTime: '45m ago',
      date: 'Today, 10:15',
      preview: 'Obsessed with my new knotless braids from @folashair_studio! Best salon in Lagos 🔥✨',
      sentiment: 'positive',
      category: 'Mention · shoutout',
      urgent: false,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-2',
          sender: 'customer',
          authorName: 'chioma.styles',
          text: 'Obsessed with my new knotless braids from @folashair_studio! Best salon in Lagos 🔥✨ Check them out girls!',
          timestamp: '45m ago',
        },
      ],
    },
    {
      id: 'conv-03',
      platform: 'x',
      kind: 'mention',
      canReply: false,
      replyRestrictionReason: 'Mentions cannot be replied to due to strict social media API usage policies.',
      isLoyalty: false,
      authorName: 'Daniel O.',
      authorHandle: '@daniel_o',
      avatarColor: '#1DA1F2',
      initialTime: '2h ago',
      date: 'Today, 08:30',
      preview: 'Does anyone know if @folashair_studio has open appointments this afternoon??',
      sentiment: 'neutral',
      category: 'Mention · inquiry',
      urgent: false,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-3',
          sender: 'customer',
          authorName: 'Daniel O.',
          text: 'Does anyone know if @folashair_studio has open appointments this afternoon?? Need a wash and re-twist urgently.',
          timestamp: '2h ago',
        },
      ],
    },
    {
      id: 'conv-04',
      platform: 'whatsapp',
      kind: 'dm',
      canReply: true,
      isLoyalty: true,
      authorName: 'Funke Adeleke',
      authorHandle: '+234 802 998 7711',
      avatarColor: '#25D366',
      initialTime: '1h ago',
      date: 'Today, 09:30',
      preview: 'Good morning! Just confirming my 11:30 appointment. Can I send a reference picture?',
      sentiment: 'positive',
      category: 'Booking · lookbook upload',
      urgent: false,
      status: 'open',
      assignee: 'Blessing (Lead)',
      messages: [
        {
          id: 'm-4',
          sender: 'customer',
          authorName: 'Funke Adeleke',
          text: 'Good morning! Just confirming my 11:30 appointment. Can I send a reference picture?',
          timestamp: '1h ago',
        },
      ],
    },
    {
      id: 'conv-05',
      platform: 'facebook',
      kind: 'comment',
      canReply: true,
      isLoyalty: false,
      authorName: 'Musa Ibrahim',
      authorHandle: 'Musa Ibrahim',
      avatarColor: '#1877F2',
      initialTime: '4h ago',
      date: 'Today, 06:20',
      preview: 'How much is the VIP bridal package and do you take card payment at the studio?',
      sentiment: 'neutral',
      category: 'Comment · pricing',
      urgent: false,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-5',
          sender: 'customer',
          authorName: 'Musa Ibrahim',
          text: 'How much is the VIP bridal package and do you take card payment at the studio?',
          timestamp: '4h ago',
        },
      ],
    },
    {
      id: 'conv-06',
      platform: 'tiktok',
      kind: 'comment',
      canReply: true,
      isLoyalty: true,
      authorName: 'Dele B.',
      authorHandle: '@dele_b',
      avatarColor: '#000000',
      initialTime: '1d ago',
      date: 'Yesterday, 14:05',
      preview: 'Walked in with zero waiting! Smooth booking link in bio 🔥',
      sentiment: 'positive',
      category: 'Comment · review',
      urgent: false,
      status: 'resolved',
      assignee: 'Business Owner',
      messages: [
        {
          id: 'm-6',
          sender: 'customer',
          authorName: 'Dele B.',
          text: 'Walked in with zero waiting! Smooth booking link in bio 🔥',
          timestamp: '1d ago',
        },
      ],
    },
  ]);

  // Selected conversation
  const [selectedId, setSelectedId] = useState<string>('conv-01');
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || conversations[0],
    [conversations, selectedId]
  );

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    try {
      const trial = localStorage.getItem(`luna_inbox_trial_${tenant.slug}`);
      setTrialStarted(Boolean(trial && Date.now() - Number(trial) < 7 * 86400000));
      const month = new Date().toISOString().slice(0, 7);
      setCredits(Number(localStorage.getItem(`luna_credits_${tenant.slug}_${month}`) ?? 50));
      setScheduledPosts(JSON.parse(localStorage.getItem(`luna_scheduled_posts_${tenant.slug}`) || '[]'));
    } catch {}
  }, [tenant.slug]);

  const useCredit = () => {
    if (credits < 1) {
      setActionNotice('No social credits remain this month. Top up 100 credits for ₦1,000!');
      setPaygModalOpen(true);
      return false;
    }
    const next = credits - 1;
    setCredits(next);
    try {
      localStorage.setItem(`luna_credits_${tenant.slug}_${new Date().toISOString().slice(0, 7)}`, String(next));
    } catch {}
    return true;
  };

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Kind filter (All, DMs, Comments, Mentions)
      if (kindFilter !== 'all' && c.kind !== kindFilter) return false;

      // Status filter
      if (statusFilter === 'open' && c.status !== 'open') return false;
      if (statusFilter === 'urgent' && !c.urgent) return false;
      if (statusFilter === 'resolved' && c.status !== 'resolved') return false;

      // Channel filter
      if (channelFilter !== 'all' && c.platform !== channelFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.authorName.toLowerCase().includes(q);
        const matchesHandle = c.authorHandle.toLowerCase().includes(q);
        const matchesPreview = c.preview.toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesPreview) return false;
      }

      return true;
    });
  }, [conversations, kindFilter, statusFilter, channelFilter, searchQuery]);

  // Copy Bio Link
  const handleCopyBioLink = () => {
    const bioUrl = `https://${tenant.slug}.withluna.tech`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bioUrl);
      setBioCopied(true);
      setTimeout(() => setBioCopied(false), 2500);
    }
  };

  // Manual DM Refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setActionNotice('Unified Inbox refreshed! All DMs, comments, and mentions are up to date.');
      setTimeout(() => setActionNotice(null), 3000);
    }, 700);
  };

  // AI draft generator
  const handleDraftWithAi = async () => {
    if (!activeConversation) return;
    if (!useCredit()) return;
    setIsGeneratingAi(true);
    try {
      const prompt = `You are the lead customer support specialist at ${tenant.name} (${tenant.industry}).
Draft an empathetic, prompt, brand-aligned response to this customer:
Customer handle: ${activeConversation.authorHandle}
Message: "${activeConversation.preview}"
Keep the reply under 3 sentences. Provide a clear solution or immediate booking link.`;

      const aiReply = await generateAiContent({
        prompt,
        context: `Tenant: ${tenant.name}, Category: ${tenant.industry}`,
      });

      if (aiReply && aiReply.trim()) {
        setReplyText(aiReply.trim());
      } else {
        setReplyText(
          `Hi ${activeConversation.authorHandle}! Thank you for reaching out to ${tenant.name}. We have prioritized your request and would love to accommodate you right away! ✨`
        );
      }
    } catch {
      setReplyText(
        `Hi ${activeConversation.authorHandle}! Thank you for messaging ${tenant.name}. Our team has marked your inquiry for priority attention and will assist you immediately!`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // "Pay in the Conversation" / Send Booking Ticket
  const handleSendBookingTicketInConversation = () => {
    if (!activeConversation) return;
    const selectedSvc = tenantServices.find((s) => s.id === selectedTicketServiceId) || tenantServices[0];
    const bookingUrl = `https://${tenant.slug}.withluna.tech/book-queue?service=${selectedSvc?.id || 'all'}&handle=${encodeURIComponent(
      activeConversation.authorHandle
    )}&platform=${activeConversation.platform}`;

    const ticketMsg = `🎟️ Here is your priority appointment pass for ${selectedSvc?.name || 'our services'}! Tap here to select your time slot and finalize your booking: ${bookingUrl}`;
    setReplyText(ticketMsg);
    setTicketModalOpen(false);
  };

  // Send reply
  const handleSendMessage = () => {
    if (!replyText.trim() || !activeConversation) return;
    if (!useCredit()) return;

    const newMsg: SocialMessage = {
      id: `m-${Date.now()}`,
      sender: 'staff',
      authorName: user?.name || 'Business Staff',
      text: replyText.trim(),
      timestamp: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              status: 'resolved',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setReplyText('');
    setActionNotice('Message dispatched to customer!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Connect new account per platform
  const handleConnectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatformUsername.trim()) return;
    setConnectedPlatforms((prev) => ({
      ...prev,
      [newPlatformToConnect]: newPlatformUsername.trim().startsWith('@')
        ? newPlatformUsername.trim()
        : `@${newPlatformUsername.trim()}`,
    }));
    setConnectAccountModalOpen(false);
    setNewPlatformUsername('');
    setActionNotice(`Connected 1 account for ${newPlatformToConnect.toUpperCase()}!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const getPlatformIcon = (platform: ChannelPlatform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'x':
        return <Twitter className="h-4 w-4 text-sky-500" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'tiktok':
        return <span className="text-[10px] font-black text-slate-900 leading-none">TT</span>;
      case 'whatsapp':
        return <span className="text-[10px] font-black text-emerald-600 leading-none">WA</span>;
    }
  };

  return (
    <TenantStaffLayout>
      <div className="space-y-6 font-sans">
        {/* NUDGE BANNER: ADD LUNA AS 'BOOK FROM MY BIO' */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 p-4 sm:p-5 text-white shadow-md border border-purple-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFA800] text-[#291E29] font-black text-base shrink-0 shadow-sm">
              ✨
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span>Turn Social Followers into Booked Appointments</span>
                <span className="text-[10px] bg-amber-400/20 text-[#FFA800] px-2 py-0.2 rounded-full font-bold border border-amber-400/30">
                  Viral Bio Link
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-purple-200 mt-0.5">
                Add Luna to your Instagram &amp; TikTok bios as <strong className="text-[#FFA800]">&quot;Book from my bio: {tenant.slug}.withluna.tech&quot;</strong>. Each visitor sees your menu and locks in a slot!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyBioLink}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FFA800] hover:bg-amber-400 text-[#291E29] px-4 py-2 text-xs font-extrabold shadow-sm transition active:scale-95 shrink-0"
          >
            {bioCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{bioCopied ? 'Bio Link Copied!' : 'Copy Bio Link'}</span>
          </button>
        </div>

        {/* Global Toast / Action Notice */}
        {actionNotice && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-900 shadow-sm flex items-center justify-between animate-in fade-in">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 underline text-xs">Dismiss</button>
          </div>
        )}

        {/* Navigation Tabs Bar + Top Right Controls */}
        <div className="rounded-3xl bg-[#291E29] text-[#FFF6E9] p-5 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#FFA800] mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Omnichannel Social Inbox &amp; Calendar</span>
              </div>
              <h1 className="text-2xl font-black text-white">{tenant.name} Social Studio</h1>
            </div>

            {/* Top Right Action Strip: Social Credits + Connect Account + Refresh */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Credits Pill with Top-up Trigger */}
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-1.5 border border-white/10 text-xs">
                <Zap className="h-3.5 w-3.5 text-[#FFA800]" />
                <span className="font-bold">{credits} SC</span>
                <button
                  type="button"
                  onClick={() => setPaygModalOpen(true)}
                  className="text-[10px] text-[#FFA800] hover:underline font-extrabold ml-1"
                >
                  + Top Up
                </button>
              </div>

              {/* Connect Accounts Button */}
              <button
                type="button"
                onClick={() => setConnectAccountModalOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 text-xs font-bold transition border border-white/10"
              >
                <Globe className="h-3.5 w-3.5 text-sky-400" />
                <span>Connected Accounts</span>
              </button>

              {/* Refresh Icon (Desktop & Mobile) */}
              <button
                type="button"
                onClick={handleManualRefresh}
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFA800] hover:bg-amber-400 text-[#291E29] transition active:scale-95 shadow-sm"
                title="Refresh DMs &amp; Inquiries"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Module Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
            {[
              { id: 'inbox', label: 'Unified Inbox', icon: MessageSquare },
              { id: 'calendar', label: 'Reminder Calendar', icon: Calendar },
              { id: 'ideas', label: 'AI Content Generator', icon: Lightbulb },
              { id: 'analytics', label: 'Social Analytics', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileView('list');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFA800] text-[#291E29] shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: UNIFIED INBOX (DROPDOWN SELECTOR & MENTIONS CHECK)*/}
        {/* ========================================================= */}
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: CONVERSATION LIST */}
            <div
              className={`${
                mobileView === 'detail' ? 'hidden lg:block' : 'block'
              } lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-4`}
            >
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search messages, handles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                />
              </div>

              {/* DROPDOWN SELECTOR: Conversation Type (All, DMs, Comments, Mentions) */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-purple-50/80 border border-purple-200">
                <span className="text-[11px] font-extrabold text-[#702D7B]">Conversation Feed:</span>
                <select
                  value={kindFilter}
                  onChange={(e) => setKindFilter(e.target.value as any)}
                  className="rounded-xl border border-purple-300 bg-white px-3 py-1 text-xs font-extrabold text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                >
                  <option value="all">📥 All Conversations</option>
                  <option value="dm">💬 Direct Messages (DMs)</option>
                  <option value="comment">💭 Comments</option>
                  <option value="mention">📣 Mentions (@tags)</option>
                </select>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'open', 'urgent', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-xl px-3 py-1 text-[11px] font-bold capitalize transition-all ${
                      statusFilter === st
                        ? 'bg-[#291E29] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Platform Selector Pills */}
              <div className="flex items-center gap-1 pb-1 overflow-x-auto no-scrollbar">
                {(['all', 'instagram', 'x', 'facebook', 'tiktok', 'whatsapp'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannelFilter(ch)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold capitalize shrink-0 transition ${
                      channelFilter === ch
                        ? 'bg-[#702D7B] text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              {/* Conversations Feed */}
              <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No conversations match this view.
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isSelected = activeConversation?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedId(c.id);
                          setMobileView('detail');
                        }}
                        className={`p-3 rounded-2xl cursor-pointer transition-all space-y-1.5 my-1 ${
                          isSelected
                            ? 'bg-[#FFF6E9] border-2 border-[#FFA800] shadow-sm'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {getPlatformIcon(c.platform)}
                            <h4 className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1">
                              <span>{c.authorName}</span>
                              {c.isLoyalty && (
                                <span title="Loyalty Repeat Customer" className="text-amber-500 text-xs">
                                  👑
                                </span>
                              )}
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{c.initialTime}</span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {c.preview}
                        </p>

                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.2 rounded-md border border-purple-200">
                            {c.kind}
                          </span>
                          {c.isLoyalty && (
                            <span className="text-[9px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.2 rounded-md border border-amber-200">
                              VIP Loyalty 👑
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 truncate">{c.authorHandle}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: CHAT WINDOW & REPLY COMPOSER */}
            <div
              className={`${
                mobileView === 'list' ? 'hidden lg:block' : 'block'
              } lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4`}
            >
              {activeConversation ? (
                <>
                  {/* Mobile Back Button */}
                  <div className="lg:hidden pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#702D7B]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Messages</span>
                    </button>
                  </div>

                  {/* Conversation Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                        {getPlatformIcon(activeConversation.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900">{activeConversation.authorName}</h3>
                          {activeConversation.isLoyalty && (
                            <span title="Loyalty VIP Customer" className="text-amber-500">
                              👑
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {activeConversation.authorHandle} &middot; {activeConversation.platform.toUpperCase()} ({activeConversation.kind})
                        </p>
                      </div>
                    </div>

                    {/* Fast Action: Send Booking Ticket */}
                    <button
                      type="button"
                      onClick={() => setTicketModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] px-3 py-1.5 text-xs font-extrabold shadow-sm transition active:scale-95 shrink-0"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      <span>Pay in Conversation</span>
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 py-1">
                    {activeConversation.messages.map((msg) => {
                      const isCustomer = msg.sender === 'customer';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                            <span className="font-bold text-slate-700">{msg.authorName}</span>
                            <span>&middot;</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <div
                            className={`rounded-2xl p-3.5 text-xs max-w-[85%] leading-relaxed ${
                              isCustomer
                                ? 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-xs'
                                : 'bg-[#702D7B] text-white rounded-tr-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* MENTIONS RESTRICTION BANNER OR COMPOSER */}
                  {activeConversation.canReply === false || activeConversation.kind === 'mention' ? (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-950 font-extrabold">
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                        <span>Mentions cannot be replied to due to strict usage policies</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        Public social media mentions cannot be directly replied to via third-party APIs. To convert this customer, invite them via your bio link or prompt them to send a direct message (DM).
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleCopyBioLink}
                          className="rounded-xl bg-[#291E29] text-[#FFA800] px-3.5 py-1.5 text-[11px] font-bold"
                        >
                          Copy Bio Link to Share
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Active Composer for DMs & Comments */
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleDraftWithAi}
                          disabled={isGeneratingAi}
                          className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs disabled:opacity-50"
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                          <span>{isGeneratingAi ? 'Drafting with AI...' : 'Draft with AI (1 SC)'}</span>
                        </button>
                        <span className="text-[10px] text-slate-400">1 SC consumed on outbound reply</span>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#702D7B]">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Write your reply to ${activeConversation.authorHandle}...`}
                          className="w-full bg-transparent p-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setTicketModalOpen(true)}
                          className="flex items-center gap-1 text-xs font-bold text-[#702D7B] hover:underline"
                        >
                          <Ticket className="h-3.5 w-3.5 text-[#FFA800]" />
                          <span>Attach Booking Pass Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSendMessage}
                          disabled={!replyText.trim()}
                          className="flex items-center gap-1.5 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFF6E9] px-4 py-2 text-xs font-extrabold shadow-sm transition active:scale-95 disabled:opacity-40"
                        >
                          <Send className="h-3.5 w-3.5 text-[#FFA800]" />
                          <span>Send Reply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-xs text-slate-400">
                  Select a message to view the conversation.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: REMINDER MODE CALENDAR                           */}
        {/* ========================================================= */}
        {activeTab === 'calendar' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">PWA Reminder Mode Calendar</h2>
                <p className="text-xs text-slate-500">Plan social campaigns and receive PWA reminders to post on your phone</p>
              </div>
              <button
                type="button"
                onClick={() => setPostEditorOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] px-4 py-2 text-xs font-bold"
              >
                <Plus className="h-4 w-4" />
                <span>Schedule New Reminder</span>
              </button>
            </div>

            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-sm">Reminder Mode Operating</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Posts scheduled here trigger background PWA reminders on your mobile device at the exact target time.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: INDUSTRY-TUNED AI CONTENT GENERATOR               */}
        {/* ========================================================= */}
        {activeTab === 'ideas' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  AI Content Ideas for {tenant.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Custom-tailored promotional ideas generated for your {tenant.industry.replace('_', ' ')} business.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionNotice('Generated 3 tailored concepts based on your business offerings!');
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 text-white px-4 py-2 text-xs font-bold hover:bg-purple-700"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" />
                <span>Generate Fresh Concepts</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-2.5">
                <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider bg-amber-200 px-2 py-0.5 rounded-md">
                  Spotlight Post
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  &quot;Skip the Waiting Room: Book from Bio&quot;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Educate your followers that they can select their treatment, choose an exact time window, and pre-clear lookbook photos online with zero lobby waiting.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inbox');
                    setReplyText(`Did you know you can book your slot in 30 seconds? Tap the link in our bio: https://${tenant.slug}.withluna.tech!`);
                  }}
                  className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
                >
                  Use as Template &rarr;
                </button>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 space-y-2.5">
                <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider bg-purple-200 px-2 py-0.5 rounded-md">
                  Loyalty &amp; VIP
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  &quot;Tag Your Look &amp; Get VIP Crown Status&quot;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Invite clients to drop their Instagram/TikTok handle when booking to unlock gold crown 👑 priority across all inquiries.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inbox');
                    setReplyText(`Drop your social handle on our booking portal to get verified VIP crown priority on all visits!`);
                  }}
                  className="text-xs font-bold text-purple-900 hover:underline flex items-center gap-1"
                >
                  Use as Template &rarr;
                </button>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-2.5">
                <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider bg-emerald-200 px-2 py-0.5 rounded-md">
                  On-Time Guarantee
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  &quot;Automated 30-Minute Arrival Alerts&quot;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Highlight {tenant.name}&apos;s new PWA alert system that pings clients 30 minutes before their appointment so their station is waiting for them.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inbox');
                    setReplyText(`Our PWA alerts you 30 mins before your appointment so you walk straight into your chair!`);
                  }}
                  className="text-xs font-bold text-emerald-900 hover:underline flex items-center gap-1"
                >
                  Use as Template &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: SOCIAL ANALYTICS                                  */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-base">Inbound Messages &amp; Audience Analytics</h2>
              <p className="text-xs text-slate-500">Live inquiry sentiment and channel performance across all connected profiles</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Response Time</span>
                <div className="text-xl font-black text-slate-900 mt-1">~4.2 mins</div>
                <span className="text-[10px] text-emerald-600 font-bold">▲ 18% faster than SLA</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Resolution Rate</span>
                <div className="text-xl font-black text-slate-900 mt-1">94.8%</div>
                <span className="text-[10px] text-slate-500 font-medium">82 inquiries resolved</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Inbound Inquiries</span>
                <div className="text-xl font-black text-slate-900 mt-1">214</div>
                <span className="text-[10px] text-purple-700 font-bold">Free inbound ingestion</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Customer CSAT</span>
                <div className="text-xl font-black text-emerald-600 mt-1">4.9 / 5.0</div>
                <span className="text-[10px] text-emerald-600 font-bold">★ 140 ratings</span>
              </div>
            </div>
          </div>
        )}

        {/* "PAY IN THE CONVERSATION" / SEND BOOKING TICKET MODAL */}
        {ticketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-purple-100 text-[#702D7B] flex items-center justify-center font-bold">
                    🎟️
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Send Booking Pass in Chat</h3>
                    <p className="text-[10px] text-slate-500">Auto-prefills service and client&apos;s social handle</p>
                  </div>
                </div>
                <button onClick={() => setTicketModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Service to Dispatch</label>
                  <select
                    value={selectedTicketServiceId}
                    onChange={(e) => setSelectedTicketServiceId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="">All Services Menu (Client Chooses)</option>
                    {tenantServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.price || 'Standard'} · {s.minutes} mins)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900 leading-relaxed">
                  💡 <strong>How it works:</strong> The customer receives an interactive link. When they click, they land on {tenant.name}&apos;s customer booking page with this service selected and their handle (<strong className="text-slate-900">{activeConversation?.authorHandle}</strong>) pre-populated!
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendBookingTicketInConversation}
                  className="rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] px-5 py-2 text-xs font-extrabold shadow-md"
                >
                  Insert Pass Link into Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONNECT SOCIAL ACCOUNTS MODAL */}
        {connectAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#291E29] text-[#FFA800] flex items-center justify-center font-bold">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Connected Social Profiles</h3>
                    <p className="text-[10px] text-slate-500">1 account per platform on Free / Growth plan</p>
                  </div>
                </div>
                <button onClick={() => setConnectAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {/* Currently Connected Accounts List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Connections:</span>
                {Object.entries(connectedPlatforms).map(([plat, handle]) => (
                  <div key={plat} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(plat as ChannelPlatform)}
                      <span className="font-extrabold capitalize">{plat}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{handle}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-md font-bold">
                      Connected
                    </span>
                  </div>
                ))}
              </div>

              {/* Connect New Platform Form */}
              <form onSubmit={handleConnectAccount} className="space-y-3 text-xs pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Connect Additional Channel:</span>
                <div className="flex gap-2">
                  <select
                    value={newPlatformToConnect}
                    onChange={(e: any) => setNewPlatformToConnect(e.target.value)}
                    className="rounded-xl border border-slate-200 p-2 text-xs font-bold text-slate-700"
                  >
                    <option value="x">X (Twitter)</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="@account_handle"
                    value={newPlatformUsername}
                    onChange={(e) => setNewPlatformUsername(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] px-4 py-2 text-xs font-extrabold"
                  >
                    Connect Platform Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PAYG Social Credit Top-Up Modal */}
        {paygModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 text-[#FFA800] flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Buy 100 Social Credits</h3>
                    <p className="text-[10px] text-slate-500">₦1,000 (~$0.75 USD) One-Time Top-Up</p>
                  </div>
                </div>
                <button onClick={() => setPaygModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <p className="text-xs text-slate-600">
                Purchase 100 Social Credits to reply to customer DMs, answer inquiries, and generate content. No monthly subscription required!
              </p>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPaygModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const month = new Date().toISOString().slice(0, 7);
                    const updated = credits + 100;
                    setCredits(updated);
                    localStorage.setItem(`luna_credits_${tenant.slug}_${month}`, String(updated));
                    setPaygModalOpen(false);
                    setActionNotice('Successfully purchased 100 Social Credits for ₦1,000!');
                    setTimeout(() => setActionNotice(null), 3000);
                  }}
                  className="rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] px-5 py-2 text-xs font-extrabold shadow-md"
                >
                  Pay ₦1,000 &amp; Add Credits
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TenantStaffLayout>
  );
}
