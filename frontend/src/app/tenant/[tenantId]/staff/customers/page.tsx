'use client';

import React, { useState } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import {
  ClientDetailModal,
  ClientData,
} from '../../../../../components/shared/ClientDetailModal';
import { SentimentBadge } from '../../../../../components/shared/SentimentBadge';
import { CommentSentiment, classifySentiment } from '../../../../../types/feedback';
import {
  Users,
  Search,
  Mail,
  Phone,
  Ticket,
  Star,
  Sparkles,
  ArrowRight,
  Filter,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export default function StaffCustomersPage() {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'VIP Diamond' | 'Gold Regular' | 'Frequent Client' | 'New Client'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isSme = tenant?.businessScale === 'sme';
  const prefix = tenant?.slug ? tenant.slug.substring(0, 3).toUpperCase() : 'LUN';
  const serviceUnit = tenant?.branding?.serviceUnitName || (isSme ? 'Chair / Bay' : 'Window');

  // Rich, realistic client list tailored to business type
  const [clients, setClients] = useState<ClientData[]>([
    {
      id: 'c_1',
      name: 'Amara Okafor',
      email: 'amara.okafor@example.com',
      phone: '+234 802 123 4567',
      avatarColor: '#702D7B',
      tier: 'VIP Diamond',
      visits: 14,
      totalSpend: isSme ? '₦145,000' : '$28,400',
      avgServiceDuration: '22 mins',
      onTimeScore: 99.2,
      lastVisit: 'Today at 11:30 AM',
      memberSince: 'March 2024',
      preferences: isSme
        ? [
            'Prefers warm green tea upon arrival',
            'Always books Chair 1 with lead stylist',
            'Sensitive to high-heat blowdrying',
          ]
        : [
            'Priority commercial cash intake',
            'Prefers Window 2 private corporate teller',
            'Requires duplicate stamped physical slips',
          ],
      notes: [
        {
          id: 'n_1',
          author: 'Business Owner',
          text: 'Loyal VIP customer. Always give complimentary styling spray / dedicated express slot.',
          timestamp: 'Yesterday',
        },
        {
          id: 'n_2',
          author: 'Senior Specialist',
          text: 'Prefers early morning priority windows around 10:00 AM.',
          timestamp: '3 weeks ago',
        },
      ],
      history: [
        {
          id: `${prefix}-101`,
          date: 'Today',
          service: isSme ? 'VIP Braiding & Scalp Care' : 'Commercial Cash Deposit',
          specialist: `${serviceUnit} 1`,
          status: 'Completed',
          durationMins: 24,
          waitTimeMins: 1.5,
        },
        {
          id: `${prefix}-088`,
          date: 'Last Week',
          service: isSme ? 'Deep Conditioning Treatment' : 'International Wire Triage',
          specialist: `${serviceUnit} 1`,
          status: 'Completed',
          durationMins: 20,
          waitTimeMins: 2.1,
        },
        {
          id: `${prefix}-072`,
          date: '3 Weeks Ago',
          service: isSme ? 'Lookbook Consultation' : 'Account Re-verification',
          specialist: `${serviceUnit} 2`,
          status: 'Completed',
          durationMins: 18,
          waitTimeMins: 1.8,
        },
      ],
      review: {
        rating: 5.0,
        comment: 'Zero wait time from my phone. I arrive and sit right down immediately!',
        date: 'Today',
      },
    },
    {
      id: 'c_2',
      name: 'Babajide Cole',
      email: 'babajide.cole@example.com',
      phone: '+234 803 987 6543',
      avatarColor: '#0057B8',
      tier: 'Gold Regular',
      visits: 8,
      totalSpend: isSme ? '₦82,000' : '$14,200',
      avgServiceDuration: '18 mins',
      onTimeScore: 97.8,
      lastVisit: '3 days ago',
      memberSince: 'July 2024',
      preferences: isSme
        ? [
            'Prefers organic coconut pomade',
            'Likes haircut combined with beard trim',
          ]
        : [
            'Corporate foreign exchange window',
            'High-volume cash deposit window',
          ],
      notes: [
        {
          id: 'n_3',
          author: 'Staff Officer',
          text: 'Very punctual client. Usually books during lunch break.',
          timestamp: '1 week ago',
        },
      ],
      history: [
        {
          id: `${prefix}-094`,
          date: '3 days ago',
          service: isSme ? 'Beard Grooming & Shapeup' : 'Priority FX Exchange',
          specialist: `${serviceUnit} 2`,
          status: 'Completed',
          durationMins: 18,
          waitTimeMins: 2.4,
        },
        {
          id: `${prefix}-065`,
          date: '2 weeks ago',
          service: isSme ? 'Express Haircut & Wash' : 'Cheque Clearance',
          specialist: `${serviceUnit} 1`,
          status: 'Completed',
          durationMins: 15,
          waitTimeMins: 1.9,
        },
      ],
      review: {
        rating: 4.9,
        comment: 'Fast and efficient triage. Best customer service around.',
        date: '3 days ago',
      },
    },
    {
      id: 'c_3',
      name: 'Chidinma Vance',
      email: 'chidinma.v@example.com',
      phone: '+254 712 345 678',
      avatarColor: '#12A05A',
      tier: 'Frequent Client',
      visits: 6,
      totalSpend: isSme ? '₦64,000' : '$8,900',
      avgServiceDuration: '25 mins',
      onTimeScore: 96.5,
      lastVisit: '1 week ago',
      memberSince: 'November 2024',
      preferences: [
        'Prefers SMS notification updates',
        'Weekend priority booking slots',
      ],
      notes: [
        {
          id: 'n_4',
          author: 'Front Desk',
          text: 'Prefers text message confirmation over email.',
          timestamp: '2 weeks ago',
        },
      ],
      history: [
        {
          id: `${prefix}-079`,
          date: '1 week ago',
          service: isSme ? 'Nails & Pedicure Spa' : 'Card Replacement',
          specialist: `${serviceUnit} 3`,
          status: 'Completed',
          durationMins: 28,
          waitTimeMins: 3.0,
        },
      ],
      review: {
        rating: 4.8,
        comment: 'Very polite specialists and fast processing.',
        date: '1 week ago',
      },
    },
    {
      id: 'c_4',
      name: 'David Mensah',
      email: 'david.mensah@example.com',
      phone: '+233 24 555 1234',
      avatarColor: '#FF8A00',
      tier: 'New Client',
      visits: 2,
      totalSpend: isSme ? '₦18,000' : '$2,400',
      avgServiceDuration: '16 mins',
      onTimeScore: 98.0,
      lastVisit: '2 weeks ago',
      memberSince: 'January 2025',
      preferences: [
        'First-time customer walk-in referral',
      ],
      notes: [],
      history: [
        {
          id: `${prefix}-041`,
          date: '2 weeks ago',
          service: isSme ? 'Quick Wash & Blowout' : 'New Account Setup',
          specialist: `${serviceUnit} 1`,
          status: 'Completed',
          durationMins: 16,
          waitTimeMins: 2.0,
        },
      ],
      review: {
        rating: 2.5,
        comment: 'Actual wait time was 18 mins longer than estimated on my phone. Needs better schedule sync.',
        date: '2 weeks ago',
        sentiment: 'negative',
      },
    },
    {
      id: 'c_5',
      name: 'Fatima Bello',
      email: 'fatima.bello@example.com',
      phone: '+234 810 999 8888',
      avatarColor: '#0F766E',
      tier: 'Gold Regular',
      visits: 9,
      totalSpend: isSme ? '₦95,000' : '$19,800',
      avgServiceDuration: '20 mins',
      onTimeScore: 99.0,
      lastVisit: 'Yesterday',
      memberSince: 'April 2024',
      preferences: [
        'Prefers quiet corner window/chair',
        'Allergic to synthetic fragrance',
      ],
      notes: [
        {
          id: 'n_5',
          author: 'Owner',
          text: 'Use fragrance-free products only.',
          timestamp: '1 month ago',
        },
      ],
      history: [
        {
          id: `${prefix}-098`,
          date: 'Yesterday',
          service: isSme ? 'Silk Press & Treatment' : 'Priority Advisory Triage',
          specialist: `${serviceUnit} 1`,
          status: 'Completed',
          durationMins: 22,
          waitTimeMins: 1.7,
        },
      ],
      review: {
        rating: 5.0,
        comment: 'They remembered all my preferences without me having to repeat them!',
        date: 'Yesterday',
        sentiment: 'positive',
      },
    },
    {
      id: 'c_6',
      name: 'Emeka Okafor',
      email: 'emeka.okafor@example.com',
      phone: '+234 809 111 2233',
      avatarColor: '#2563EB',
      tier: 'Frequent Client',
      visits: 5,
      totalSpend: isSme ? '₦52,000' : '$6,400',
      avgServiceDuration: '24 mins',
      onTimeScore: 94.5,
      lastVisit: '4 days ago',
      memberSince: 'October 2024',
      preferences: ['Prefers morning slots before 11 AM'],
      notes: [],
      history: [
        {
          id: `${prefix}-053`,
          date: '4 days ago',
          service: isSme ? 'Beard Grooming & Shapeup' : 'Priority Advisory Triage',
          specialist: `${serviceUnit} 2`,
          status: 'Completed',
          durationMins: 22,
          waitTimeMins: 6.2,
        },
      ],
      review: {
        rating: 3.2,
        comment: 'Wash and grooming were good, but waiting area was a bit noisy during afternoon rush.',
        date: '4 days ago',
        sentiment: 'neutral',
      },
    },
  ]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const positiveCount = clients.filter((c) => (c.review?.sentiment || (c.review?.rating ? classifySentiment(c.review.rating) : 'positive')) === 'positive').length;
  const neutralCount = clients.filter((c) => (c.review?.sentiment || (c.review?.rating ? classifySentiment(c.review.rating) : 'positive')) === 'neutral').length;
  const negativeCount = clients.filter((c) => (c.review?.sentiment || (c.review?.rating ? classifySentiment(c.review.rating) : 'positive')) === 'negative').length;

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    const clientSentiment: CommentSentiment =
      c.review?.sentiment ||
      (c.review?.rating ? classifySentiment(c.review.rating) : 'positive');
    const matchesSentiment = sentimentFilter === 'all' || clientSentiment === sentimentFilter;
    return matchesSearch && matchesTier && matchesSentiment;
  });

  const getTierColor = (tier: ClientData['tier']) => {
    switch (tier) {
      case 'VIP Diamond':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Gold Regular':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Frequent Client':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <TenantStaffLayout>
      <div className="space-y-6 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 rounded-2xl bg-[#291E29] text-white px-4 py-2.5 shadow-2xl border border-[#FFA800]/40 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top">
            <CheckCircle2 className="h-4 w-4 text-[#FFA800]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Page Title & Instructions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFA800] bg-[#291E29] px-2.5 py-0.5 rounded-full">
                Business Owner CRM
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {clients.length} Total Registered Clients
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
              Client Directory &amp; Profiles
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Click on any client below to inspect their complete profile, service history, preferences, and staff notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerToast('Exported customer list to CSV.')}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-xs"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Search & Tier Filters Bar */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/15 text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] bg-white min-h-[44px]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'VIP Diamond', 'Gold Regular', 'Frequent Client'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  tierFilter === tier
                    ? 'bg-[#FFA800] text-[#291E29] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tier === 'all' ? 'All Clients' : tier}
              </button>
            ))}
          </div>
        </div>

        {/* 💬 Comment Sentiment Categorization Filter Strip */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white border border-black/10 text-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mr-1 flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-slate-400" /> Sentiment:
          </span>
          <button
            type="button"
            onClick={() => setSentimentFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition min-h-[36px] ${
              sentimentFilter === 'all'
                ? 'bg-[#291E29] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Feedback ({clients.length})
          </button>
          <button
            type="button"
            onClick={() => setSentimentFilter('positive')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 min-h-[36px] ${
              sentimentFilter === 'positive'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>😊 Positive</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${sentimentFilter === 'positive' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
              {positiveCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSentimentFilter('neutral')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 min-h-[36px] ${
              sentimentFilter === 'neutral'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>😐 Neutral</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${sentimentFilter === 'neutral' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'}`}>
              {neutralCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSentimentFilter('negative')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 min-h-[36px] ${
              sentimentFilter === 'negative'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>🙁 Negative / Needs Care</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${sentimentFilter === 'negative' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-900'}`}>
              {negativeCount}
            </span>
          </button>
        </div>

        {/* Client Cards Grid for Mobile & Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 space-y-2">
              <Users className="h-8 w-8 text-slate-300 mx-auto" />
              <p>No clients match &ldquo;{search}&rdquo; with the selected sentiment filter.</p>
            </div>
          ) : (
            filtered.map((client) => {
              const clientSentiment: CommentSentiment =
                client.review?.sentiment ||
                (client.review?.rating ? classifySentiment(client.review.rating) : 'positive');

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`group relative rounded-3xl border bg-white p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 active:scale-[0.99] ${
                    clientSentiment === 'negative'
                      ? 'border-rose-300 hover:border-rose-400'
                      : clientSentiment === 'neutral'
                      ? 'border-amber-200 hover:border-amber-400'
                      : 'border-black/10 hover:border-[#FFA800]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: client.avatarColor || '#291E29' }}
                        >
                          {client.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#291E29] group-hover:text-[#702D7B] transition-colors truncate">
                            {client.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-mono">{client.phone}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${getTierColor(
                          client.tier
                        )}`}
                      >
                        {client.tier}
                      </span>
                    </div>

                    {/* Summary Metric Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 text-center text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">Visits</span>
                        <strong className="text-[#291E29]">{client.visits}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">On-Time</span>
                        <strong className="text-emerald-700">{client.onTimeScore}%</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">Spend</span>
                        <strong className="text-[#702D7B]">{client.totalSpend}</strong>
                      </div>
                    </div>

                    {/* Latest Customer Comment Snippet with Categorized Sentiment */}
                    {client.review && (
                      <div
                        className={`p-2.5 rounded-2xl border text-[11px] space-y-1.5 ${
                          clientSentiment === 'negative'
                            ? 'bg-rose-50/70 border-rose-200'
                            : clientSentiment === 'neutral'
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-slate-50/80 border-black/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 font-bold text-amber-600 text-[10px]">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                            <span>{client.review.rating.toFixed(1)}</span>
                          </div>
                          <SentimentBadge sentiment={clientSentiment} size="sm" showEmoji />
                        </div>
                        <p className="text-slate-700 line-clamp-2 italic leading-relaxed">
                          &ldquo;{client.review.comment}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Top Preference Preview */}
                    {client.preferences.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded-xl border border-amber-200/40">
                        <Sparkles className="h-3.5 w-3.5 text-[#FFA800] shrink-0" />
                        <span className="truncate">{client.preferences[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Action Banner */}
                  <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Last: <strong className="text-slate-700">{client.lastVisit}</strong>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#702D7B] group-hover:text-[#FFA800] transition-colors">
                      <span>Inspect Client File</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Client Modal */}
        {selectedClient && (
          <ClientDetailModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            businessScale={tenant?.businessScale}
            serviceUnitName={serviceUnit}
            onIssueTicket={(c) => {
              triggerToast(`Created priority arrival ticket for ${c.name}!`);
            }}
          />
        )}
      </div>
    </TenantStaffLayout>
  );
}
