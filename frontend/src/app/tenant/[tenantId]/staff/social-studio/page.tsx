'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { useAuth } from '../../../../../lib/auth';
import { generateAiContent } from '../../../../../lib/ai-service';
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

export default function SocialStudioPage() {
  const { tenant } = useTenant();
  const { user } = useAuth();

  // Navigation tab inside Social Studio
  const [activeTab, setActiveTab] = useState<'inbox' | 'calendar' | 'ideas' | 'analytics'>('inbox');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Inbox filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'urgent' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | ChannelPlatform>('all');

  // Conversations state
  const [conversations, setConversations] = useState<SocialConversation[]>([
    {
      id: 'conv-01',
      platform: 'instagram',
      authorName: 'jide.fx',
      authorHandle: '@jide.fx',
      avatarColor: '#E1306C',
      initialTime: '6h ago',
      date: '20 Oct, 17:02',
      preview: 'Your app says my document verification failed but I uploaded a clear scan. What exactly is wrong with it??',
      sentiment: 'negative',
      category: 'Complaint · verification',
      urgent: true,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-1',
          sender: 'customer',
          authorName: 'jide.fx',
          text: 'Your app says my document verification failed but I uploaded a clear scan. What exactly is wrong with it??',
          timestamp: '6h ago',
        },
      ],
    },
    {
      id: 'conv-02',
      platform: 'x',
      authorName: 'Daniel O.',
      authorHandle: '@daniel_o',
      avatarColor: '#1DA1F2',
      initialTime: '10h ago',
      date: '20 Oct, 13:14',
      preview: 'Been waiting 2hrs at your branch?? This is unacceptable. Ticket A118 and the board has not moved...',
      sentiment: 'negative',
      category: 'Complaint · queue delay',
      urgent: true,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-2',
          sender: 'customer',
          authorName: 'Daniel O.',
          text: 'Been waiting 2hrs at your branch?? This is unacceptable. Ticket A118 and the board has not moved! Can someone tell me what is happening?',
          timestamp: '10h ago',
        },
      ],
    },
    {
      id: 'conv-03',
      platform: 'linkedin',
      authorName: 'Chiamaka Eze',
      authorHandle: 'Chiamaka Eze',
      avatarColor: '#0A66C2',
      initialTime: '6h ago',
      date: '20 Oct, 17:40',
      preview: 'Interested in your SME loan clinic for our staff cooperative. Who can we speak with about a session?',
      sentiment: 'neutral',
      category: 'Lead · SME clinic',
      urgent: false,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-3',
          sender: 'customer',
          authorName: 'Chiamaka Eze',
          text: 'Interested in your SME clinic for our staff cooperative. Who can we speak with about an executive briefing and fast-track booking?',
          timestamp: '6h ago',
        },
      ],
    },
    {
      id: 'conv-04',
      platform: 'facebook',
      authorName: 'Musa Ibrahim',
      authorHandle: 'Musa Ibrahim',
      avatarColor: '#1877F2',
      initialTime: '8h ago',
      date: '20 Oct, 15:20',
      preview: 'My mother is 74 and cannot stand in queues. Is there a priority window for elderly customers or home verification?',
      sentiment: 'neutral',
      category: 'Question · accessibility',
      urgent: false,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-4',
          sender: 'customer',
          authorName: 'Musa Ibrahim',
          text: 'My mother is 74 and cannot stand in queues. Is there a priority window for elderly customers or direct appointment lane?',
          timestamp: '8h ago',
        },
      ],
    },
    {
      id: 'conv-05',
      platform: 'tiktok',
      authorName: 'Dele B.',
      authorHandle: '@dele_b',
      avatarColor: '#000000',
      initialTime: '11h ago',
      date: '20 Oct, 12:05',
      preview: 'Just tried the mobile queue booking! Walked straight into Chair 2 and out in 20 mins. Incredible experience 🔥',
      sentiment: 'positive',
      category: 'Review · praise',
      urgent: false,
      status: 'resolved',
      assignee: 'Kemi (Owner)',
      messages: [
        {
          id: 'm-5',
          sender: 'customer',
          authorName: 'Dele B.',
          text: 'Just tried the mobile queue booking! Walked straight into Chair 2 and out in 20 mins. Incredible experience 🔥 Keep this up!',
          timestamp: '11h ago',
        },
        {
          id: 'm-5b',
          sender: 'staff',
          authorName: 'Kemi (Owner)',
          text: 'Thank you so much Dele! Delighted to keep your schedule running on time. See you next visit! ✨',
          timestamp: '10h ago',
        },
      ],
    },
    {
      id: 'conv-06',
      platform: 'whatsapp',
      authorName: 'Fatima Al-Hassan',
      authorHandle: '+234 803 441 9022',
      avatarColor: '#25D366',
      initialTime: '2h ago',
      date: '20 Oct, 21:10',
      preview: 'Hi! Can I reschedule my appointment for tomorrow afternoon? My flight landed late.',
      sentiment: 'neutral',
      category: 'Booking · reschedule',
      urgent: false,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-6',
          sender: 'customer',
          authorName: 'Fatima Al-Hassan',
          text: 'Hi! Can I reschedule my appointment for tomorrow afternoon? My flight landed late and I cannot make the morning slot.',
          timestamp: '2h ago',
        },
      ],
    },
    {
      id: 'conv-07',
      platform: 'whatsapp',
      authorName: 'Emeka Uche',
      authorHandle: '+234 812 900 4421',
      avatarColor: '#25D366',
      initialTime: '1h ago',
      date: '20 Oct, 22:15',
      preview: 'URGENT: I was debited twice when booking priority intake window. Reference TXN-88492.',
      sentiment: 'negative',
      category: 'Billing · refund',
      urgent: true,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-7',
          sender: 'customer',
          authorName: 'Emeka Uche',
          text: 'URGENT: I was debited twice when booking priority intake window. Reference TXN-88492. Please reverse the duplicate charge immediately.',
          timestamp: '1h ago',
        },
      ],
    },
    {
      id: 'conv-08',
      platform: 'instagram',
      authorName: 'Sarah Jenkins',
      authorHandle: '@sarah.j',
      avatarColor: '#E1306C',
      initialTime: '3h ago',
      date: '20 Oct, 20:30',
      preview: 'Do you guys do bridal group packages on Saturdays? Looking for a party of 6.',
      sentiment: 'positive',
      category: 'Lead · inquiry',
      urgent: false,
      status: 'open',
      assignee: 'Unassigned',
      messages: [
        {
          id: 'm-8',
          sender: 'customer',
          authorName: 'Sarah Jenkins',
          text: 'Do you guys do bridal group packages on Saturdays? Looking for a party of 6 with hair, nails, and makeup pre-booked.',
          timestamp: '3h ago',
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
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
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
        const matchesCategory = c.category.toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesPreview && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [conversations, statusFilter, channelFilter, searchQuery]);

  // AI draft generator
  const handleDraftWithAi = async () => {
    if (!activeConversation) return;
    setIsGeneratingAi(true);
    try {
      const prompt = `You are the lead client experience specialist at ${tenant.name} (${tenant.industry}).
Draft an empathetic, professional, brand-aligned response to this customer social message:
Customer handle: ${activeConversation.authorHandle}
Customer message: "${activeConversation.preview}"
Sentiment: ${activeConversation.sentiment}
Category: ${activeConversation.category}
Tone: Helpful, warm, prompt, and policy-compliant.
Keep the reply under 3 sentences. Provide a clear solution or immediate next step.`;

      const aiReply = await generateAiContent({
        prompt,
        context: `Tenant: ${tenant.name}, Category: ${tenant.industry}`,
      });

      if (aiReply && aiReply.trim()) {
        setReplyText(aiReply.trim());
      } else {
        // Fallback intelligent draft
        setReplyText(
          `Hi ${activeConversation.authorHandle}, thank you for reaching out! We sincerely appreciate your patience. Our operations team is on this immediately, and we have fast-tracked your request so you are prioritized with zero further delay.`
        );
      }
    } catch (err) {
      setReplyText(
        `Hi ${activeConversation.authorHandle}, thank you for bringing this to our attention. Our branch support team has flagged your account for priority handling, and we will resolve this right away!`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Quick reply templates
  const handleApplyTemplate = (type: 1 | 2 | 3) => {
    if (!activeConversation) return;
    if (type === 1) {
      setReplyText(
        `Hi ${activeConversation.authorHandle}, thanks for contacting ${tenant.name}. To ensure fast clearance, please confirm that your document photo shows all 4 corners and good lighting. You can re-upload directly on our portal or visit our priority verification desk!`
      );
    } else if (type === 2) {
      setReplyText(
        `Hi ${activeConversation.authorHandle}, we sincerely apologize for the wait time at our branch today. We have logged your ticket into our priority triage system. Please head to Counter 1 where our team is expecting you.`
      );
    } else {
      setReplyText(
        `Hi ${activeConversation.authorHandle}, we would be delighted to assist you with this! Please check our direct reservation calendar or let us know your preferred window so our dedicated team can lock it in.`
      );
    }
  };

  // Send message
  const handleSendMessage = (resolve: boolean, isAiAssisted: boolean = false) => {
    if (!replyText.trim() || !activeConversation) return;

    const newMsg: SocialMessage = {
      id: `m-${Date.now()}`,
      sender: isAiAssisted ? 'ai' : 'staff',
      authorName: user?.name || 'Staff Specialist',
      text: replyText.trim(),
      timestamp: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            status: resolve ? 'resolved' : 'open',
            urgent: resolve ? false : c.urgent,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setReplyText('');
    setActionNotice(
      resolve
        ? `✅ Reply sent & conversation marked Resolved!`
        : `💬 Reply dispatched successfully!`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Snooze
  const handleSnooze = (duration: string) => {
    setActionNotice(`⏰ Conversation snoozed for ${duration}.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Assign staff
  const handleAssign = (assignee: string) => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, assignee } : c))
    );
    setActionNotice(`👤 Assigned to ${assignee}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Platform icon helper
  const getPlatformIcon = (platform: ChannelPlatform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-3.5 w-3.5 text-pink-600" />;
      case 'x':
        return <Twitter className="h-3.5 w-3.5 text-sky-500" />;
      case 'facebook':
        return <Facebook className="h-3.5 w-3.5 text-blue-600" />;
      case 'linkedin':
        return <Linkedin className="h-3.5 w-3.5 text-blue-700" />;
      case 'tiktok':
        return <span className="text-[10px] font-black text-slate-900 leading-none">TT</span>;
      case 'whatsapp':
        return <span className="text-[10px] font-black text-emerald-600 leading-none">WA</span>;
    }
  };

  const openCount = conversations.filter((c) => c.status === 'open').length;
  const urgentCount = conversations.filter((c) => c.urgent && c.status !== 'resolved').length;

  return (
    <TenantStaffLayout>
      <div className="space-y-6 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        {/* ========================================================= */}
        {/* INTELLIGENT SOCIAL STUDIO HEADER BANNER                  */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-[#291E29]/15 bg-gradient-to-br from-[#291E29] via-[#341539] to-[#201524] p-6 text-white shadow-xl relative overflow-hidden">
          {/* Subtle geometric background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFA800]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#FFA800] border border-white/10">
                  <Share2 className="h-3.5 w-3.5 text-[#FFA800]" />
                  Social Studio · {tenant.name}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Omnichannel Live
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                  Every channel. One inbox. Zero slow replies.
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Respond to customer inquiries, complaints, and booking requests across Instagram, X, Facebook, LinkedIn, TikTok &amp; WhatsApp in real time with AI drafting.
                </p>
              </div>

              {/* Status metrics pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-[#FFA800]" />
                  {openCount} open conversations
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-200 border border-rose-500/30">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-300" />
                  {urgentCount} need urgent care
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-white/10">
                  <Clock className="h-3.5 w-3.5 text-[#FFA800]" />
                  Avg first response: <strong className="text-white">4.2 min</strong>
                </span>
              </div>
            </div>

            {/* Sub-navigation switcher tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 self-start lg:self-center shrink-0 max-w-full overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-[#FFA800] text-[#291E29] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Inbox</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'inbox' ? 'bg-[#291E29]/20 text-[#291E29]' : 'bg-white/20 text-white'
                  }`}
                >
                  {openCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-[#FFA800] text-[#291E29] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ideas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ideas'
                    ? 'bg-[#FFA800] text-[#291E29] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Ideas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-[#FFA800] text-[#291E29] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* Omnichannel Channel Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Instagram className="h-3.5 w-3.5 text-pink-400" /> Instagram
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">▲ 4.2%</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">128.4k</div>
              <span className="text-[10px] text-slate-400">followers &middot; 3 new DMs</span>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Twitter className="h-3.5 w-3.5 text-sky-400" /> X (Twitter)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">▲ 2.8%</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">86.2k</div>
              <span className="text-[10px] text-slate-400">mentions &middot; 2 urgent</span>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Facebook className="h-3.5 w-3.5 text-blue-400" /> Facebook
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">▲ 1.9%</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">214k</div>
              <span className="text-[10px] text-slate-400">community &middot; 1 open</span>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Linkedin className="h-3.5 w-3.5 text-blue-300" /> LinkedIn
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">▲ 6.1%</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">48.3k</div>
              <span className="text-[10px] text-slate-400">network &middot; 1 lead</span>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="text-[10px] font-black bg-white/20 px-1 rounded">TT</span> TikTok
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">▲ 11.4%</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">96.7k</div>
              <span className="text-[10px] text-slate-400">views &middot; 2 praise</span>
            </div>
          </div>
        </div>

        {/* Global Action Toast Notification */}
        {actionNotice && (
          <div className="rounded-2xl bg-[#FFA800] p-3 text-xs font-extrabold text-[#291E29] shadow-md flex items-center gap-2 animate-in fade-in">
            <Check className="h-4 w-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: UNIFIED OMNICHANNEL INBOX (MASTER-DETAIL)         */}
        {/* ========================================================= */}
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ----------------------------------------------------- */}
            {/* LEFT COLUMN: CONVERSATION LIST (5 COLS ON DESKTOP)     */}
            {/* ----------------------------------------------------- */}
            <div
              className={`${
                mobileView === 'detail' ? 'hidden lg:block' : 'block'
              } lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-4`}
            >
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search messages, tags, handles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'open', 'urgent', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                      statusFilter === st
                        ? 'bg-[#291E29] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Channel Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
                {(
                  ['all', 'instagram', 'x', 'facebook', 'linkedin', 'tiktok', 'whatsapp'] as const
                ).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold capitalize whitespace-nowrap transition-all ${
                      channelFilter === ch
                        ? 'bg-[#FFA800] text-[#291E29] font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {ch === 'x' ? 'X' : ch === 'all' ? 'All Channels' : ch}
                  </button>
                ))}
              </div>

              {/* Conversation items list */}
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredConversations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No conversations match your filter criteria.
                  </div>
                ) : (
                  filteredConversations.map((item) => {
                    const isSelected = item.id === selectedId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedId(item.id);
                          setMobileView('detail');
                        }}
                        className={`cursor-pointer rounded-2xl border p-3.5 transition-all text-xs space-y-2 relative ${
                          isSelected
                            ? 'border-[#FFA800] bg-[#FFF6E9]/60 shadow-sm ring-1 ring-[#FFA800]'
                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70'
                        }`}
                      >
                        {/* Top row: Platform, name, time */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
                              {getPlatformIcon(item.platform)}
                            </span>
                            <div className="truncate">
                              <span className="font-bold text-slate-900 truncate">
                                {item.authorName}
                              </span>{' '}
                              <span className="text-[11px] text-slate-400">
                                {item.authorHandle}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {item.initialTime}
                          </span>
                        </div>

                        {/* Snippet text */}
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {item.preview}
                        </p>

                        {/* Bottom badges: sentiment, category, status */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Sentiment badge */}
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold capitalize ${
                                item.sentiment === 'negative'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : item.sentiment === 'positive'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {item.sentiment}
                            </span>

                            {/* Category tag */}
                            <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              {item.category}
                            </span>
                          </div>

                          {/* Urgency indicator */}
                          {item.urgent && (
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" title="Needs urgent care" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* RIGHT COLUMN: ACTIVE THREAD & WORKSPACE (7 COLS)       */}
            {/* ----------------------------------------------------- */}
            <div
              className={`${
                mobileView === 'list' ? 'hidden lg:block' : 'block'
              } lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5`}
            >
              {activeConversation ? (
                <>
                  {/* Mobile Back Button */}
                  <div className="lg:hidden pb-3 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 transition"
                    >
                      <ArrowLeft className="h-4 w-4 text-[#FFA800]" />
                      <span>Back to Messages ({filteredConversations.length})</span>
                    </button>
                  </div>

                  {/* Thread Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 font-bold shrink-0 shadow-xs">
                        {getPlatformIcon(activeConversation.platform)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                            {activeConversation.authorName}
                          </h2>
                          <span className="text-xs text-slate-400">
                            {activeConversation.authorHandle}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold capitalize ${
                              activeConversation.sentiment === 'negative'
                                ? 'bg-rose-100 text-rose-700'
                                : activeConversation.sentiment === 'positive'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {activeConversation.sentiment}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {activeConversation.platform.toUpperCase()} &middot; {activeConversation.date} &middot;{' '}
                          {activeConversation.category}
                        </p>
                      </div>
                    </div>

                    {/* Assignee Selector & Fast-Track Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative">
                        <select
                          value={activeConversation.assignee}
                          onChange={(e) => handleAssign(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] appearance-none pr-8 cursor-pointer"
                        >
                          <option value="Unassigned">👤 Unassigned</option>
                          <option value="Business Owner">👑 Business Owner</option>
                          <option value="Blessing (Lead)">✂️ Blessing (Lead)</option>
                          <option value="Tunde (Specialist)">💈 Tunde (Specialist)</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>

                      <Link
                        href={`/tenant/${tenant.slug}/staff/ops-console`}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-[#291E29] hover:bg-slate-50 transition"
                        title="View Live Queue in Ops Console"
                      >
                        <Ticket className="h-4 w-4 text-[#FFA800]" />
                      </Link>
                    </div>
                  </div>

                  {/* Message History Feed */}
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 py-1">
                    {activeConversation.messages.map((msg) => {
                      const isCustomer = msg.sender === 'customer';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isCustomer ? 'items-start' : 'items-end'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                            <span className="font-bold text-slate-700">{msg.authorName}</span>
                            <span>&middot;</span>
                            <span>{msg.timestamp}</span>
                            {msg.sender === 'ai' && (
                              <span className="rounded-md bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.2">
                                AI Assisted
                              </span>
                            )}
                          </div>
                          <div
                            className={`rounded-2xl p-4 text-xs max-w-[85%] leading-relaxed shadow-xs ${
                              isCustomer
                                ? 'bg-slate-50 border border-slate-200/80 text-slate-900 rounded-tl-xs'
                                : 'bg-[#291E29] text-white border border-[#291E29] rounded-tr-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Quick Response Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleDraftWithAi}
                          disabled={isGeneratingAi}
                          className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs disabled:opacity-50"
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                          <span>{isGeneratingAi ? 'Drafting...' : 'Draft with AI'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(1)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          Template 1 · Docs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(2)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          Template 2 · Priority
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(3)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          Template 3 · Clinic
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium">
                        Tone matches brand &amp; SLA
                      </div>
                    </div>

                    {/* Composer Textarea */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-2 focus-within:border-[#FFA800] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FFA800]/20 transition-all">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply... (AI drafts match tone & policy)"
                        className="w-full bg-transparent p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendMessage(true, false)}
                          disabled={!replyText.trim()}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold transition shadow-xs disabled:opacity-40"
                        >
                          <Send className="h-3.5 w-3.5 text-[#FFA800]" />
                          <span>Send &amp; resolve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendMessage(true, true)}
                          disabled={!replyText.trim()}
                          className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs disabled:opacity-40"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Send as AI-assisted</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="relative group">
                          <button
                            type="button"
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Snooze</span>
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                          </button>
                          <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:flex flex-col bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[140px] z-20">
                            <button
                              type="button"
                              onClick={() => handleSnooze('1 hour')}
                              className="text-left text-xs px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                            >
                              Snooze 1 hour
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSnooze('4 hours')}
                              className="text-left text-xs px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                            >
                              Snooze 4 hours
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSnooze('Tomorrow')}
                              className="text-left text-xs px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                            >
                              Snooze tomorrow
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-24 text-center text-xs text-slate-400">
                  Select a message thread from the left column to inspect and reply.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CONTENT CALENDAR                                  */}
        {/* ========================================================= */}
        {activeTab === 'calendar' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">Social &amp; Broadcast Calendar</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled public broadcast announcements, promotions, and branch queue hours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActionNotice('📅 Scheduled queue announcement added to calendar.')}
                className="flex items-center gap-2 rounded-xl bg-[#291E29] text-white px-4 py-2.5 text-xs font-bold hover:bg-[#341539] transition"
              >
                <Plus className="h-4 w-4 text-[#FFA800]" />
                <span>Schedule New Broadcast</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {[
                { day: 'Mon', date: 'Oct 20', events: ['Morning Rush Zero-Wait Alert', 'SME Clinic Spotlight'] },
                { day: 'Tue', date: 'Oct 21', events: ['VIP Lookbook Showcase', 'Afternoon Open Bay Notice'] },
                { day: 'Wed', date: 'Oct 22', events: ['Pre-Clearance Reminder'] },
                { day: 'Thu', date: 'Oct 23', events: ['Lunch Hour Express Lane'] },
                { day: 'Fri', date: 'Oct 24', events: ['Weekend Prep Announcement', 'Extended Hours Notice'] },
                { day: 'Sat', date: 'Oct 25', events: ['Full Staff Live On-Duty'] },
                { day: 'Sun', date: 'Oct 26', events: ['Maintenance & Digital Intake'] },
              ].map((c) => (
                <div key={c.day} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2 min-h-[160px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-800">{c.day}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{c.date}</span>
                  </div>
                  <div className="space-y-1.5">
                    {c.events.map((ev, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white border border-slate-200 p-2 text-[11px] font-semibold text-slate-800 shadow-2xs"
                      >
                        {ev}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: AI CONTENT & CAMPAIGN IDEAS                      */}
        {/* ========================================================= */}
        {activeTab === 'ideas' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">AI Content &amp; Engagement Generator</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Industry-tuned promotional campaign concepts generated automatically for {tenant.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActionNotice('✨ Generated 3 new campaign ideas from Groq AI.')}
                className="flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2.5 text-xs font-bold hover:bg-purple-700 transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>Regenerate Fresh Ideas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  Queue Optimization
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  &quot;Skip the Lobby: Upload from Your Phone&quot;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Campaign highlighting that customers who pre-upload documents or style photos get placed into the priority window with zero desk wait.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inbox');
                    setReplyText('Skip the lobby line! Pre-upload your documents on your phone.');
                  }}
                  className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
                >
                  Use as Public Broadcast &rarr;
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-sky-50 p-5 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-200/80 px-2 py-0.5 rounded-md">
                  Corporate &amp; VIP
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  &quot;Fast-Track Corporate Packages&quot;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Targeted LinkedIn campaign for employee wellness cooperatives, SME clinics, and group bookings with reserved team counters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inbox');
                    setReplyText('Corporate group packages available with dedicated priority window.');
                  }}
                  className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
                >
                  Use as Public Broadcast &rarr;
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                  Customer Loyalty
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  &quot;5-Star On-Time Guarantee&quot;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Celebrate our 99.2% on-time seat turnaround with a customer spotlight post highlighting fast queue times.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inbox');
                    setReplyText('Average door turnaround under 4.2 minutes today across all windows.');
                  }}
                  className="text-xs font-bold text-emerald-900 hover:underline flex items-center gap-1"
                >
                  Use as Public Broadcast &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: OMNICHANNEL ANALYTICS                            */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-extrabold text-slate-900 text-lg">Omnichannel Service SLA &amp; Sentiments</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time sentiment categorization, resolution time, and multi-channel performance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2">
                <span className="text-xs font-bold text-slate-500">First Response SLA</span>
                <div className="text-2xl font-extrabold text-slate-900">4.2 min</div>
                <span className="text-[11px] text-emerald-600 font-bold">▲ 18% faster than SLA target</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2">
                <span className="text-xs font-bold text-slate-500">Resolution Rate</span>
                <div className="text-2xl font-extrabold text-slate-900">94.8%</div>
                <span className="text-[11px] text-slate-500 font-medium">82 inquiries resolved today</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2">
                <span className="text-xs font-bold text-slate-500">Customer Satisfaction (CSAT)</span>
                <div className="text-2xl font-extrabold text-emerald-600">4.9 / 5.0</div>
                <span className="text-[11px] text-slate-500 font-medium">Based on 140 post-service ratings</span>
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Incoming Inquiries Sentiment Distribution
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <Smile className="h-4 w-4" /> Positive Inquiries &amp; Reviews
                  </span>
                  <span>52% (48 messages)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '52%' }} />
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-2">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Meh className="h-4 w-4" /> Neutral Questions &amp; Reschedules
                  </span>
                  <span>34% (31 messages)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '34%' }} />
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-2">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <Frown className="h-4 w-4" /> Urgent Complaints &amp; Delays
                  </span>
                  <span>14% (13 messages)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '14%' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TenantStaffLayout>
  );
}
