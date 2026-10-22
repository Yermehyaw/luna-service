'use client';

import React, { useState } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { MOCK_SERVICES } from '../../../../../mock/services';
import { getTenantComments, getSentimentCounts } from '../../../../../mock/comments';
import { SentimentBadge } from '../../../../../components/shared/SentimentBadge';
import { CommentSentiment, getSentimentMeta } from '../../../../../types/feedback';
import {
  BarChart2,
  TrendingUp,
  Clock,
  Users,
  MessageSquare,
  Star,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Search,
  Filter,
  Check,
  Send,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { tenant } = useTenant();
  const [sentimentFilter, setSentimentFilter] = useState<'all' | CommentSentiment>('all');
  const [commentSearch, setCommentSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const comments = getTenantComments(tenant.slug);
  const counts = getSentimentCounts(comments);

  const tenantServices = MOCK_SERVICES.filter((s) => s.tenantId === tenant.id);
  const rows = tenantServices.length > 0
    ? tenantServices.map((s, idx) => ({
        name: s.name,
        volume: `${84 - idx * 18} Served`,
        avgTime: `${s.minutes || 10} mins`,
        satisfaction: `${98 - idx}%`,
      }))
    : [
        { name: 'General Inquiries & Intake', volume: '142 Served', avgTime: '4.2 mins', satisfaction: '99%' },
        { name: 'Priority Service Window', volume: '68 Served', avgTime: '12.5 mins', satisfaction: '96%' },
        { name: 'Specialist Consultation', volume: '24 Served', avgTime: '18.1 mins', satisfaction: '97%' },
      ];

  const filteredComments = comments.filter((c) => {
    const matchesFilter = sentimentFilter === 'all' || c.sentiment === sentimentFilter;
    const matchesSearch =
      c.comment.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.customerName.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.serviceName.toLowerCase().includes(commentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans pb-16 selection:bg-[#FFA800] selection:text-[#291E29]">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 rounded-2xl bg-[#291E29] text-white px-4 py-2.5 shadow-2xl border border-[#FFA800]/40 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top">
            <CheckCircle2 className="h-4 w-4 text-[#FFA800]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#291E29] text-[#FFA800] text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
              Telemetry &amp; CSAT
            </span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
              <Check className="h-3 w-3" /> Live Feed
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#291E29] mt-1">
            {tenant.businessScale === 'sme' ? 'Business Analytics & Customer Sentiment' : 'Branch Analytics & Feedback Intelligence'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time throughput, SLA wait times, and categorized customer reviews for <strong>{tenant.name}</strong>.
          </p>
        </div>

        {/* 1. High-Level Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs space-y-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" /> {tenant.businessScale === 'sme' ? 'Peak Hour Throughput' : 'Peak Lobby Throughput'}
            </span>
            <div className="text-2xl font-extrabold text-[#291E29]">42 Cust / Hr</div>
            <p className="text-[11px] text-emerald-700 font-bold">↑ 14% vs yesterday</p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs space-y-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" /> Avg Wait Duration
            </span>
            <div className="text-2xl font-extrabold text-[#291E29]">4.8 Minutes</div>
            <p className="text-[11px] text-emerald-700 font-bold">↓ 3.2 min lower than SLA target</p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs space-y-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Customer Satisfaction Index
            </span>
            <div className="text-2xl font-extrabold text-[#291E29]">98.4%</div>
            <p className="text-[11px] text-slate-400">Based on {counts.total * 48} verified ratings</p>
          </div>
        </div>

        {/* 🌟 2. COMMENTS CATEGORIZATION: POSITIVE, NEUTRAL & NEGATIVE INTELLIGENCE */}
        <section className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-xl bg-amber-100 items-center justify-center text-amber-800">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#291E29]">
                  Customer Comments &amp; Sentiment Categorization
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Reviews and feedback automatically categorized into <strong>Positive</strong>, <strong>Neutral</strong>, and <strong>Negative</strong> sentiment buckets.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-black/10 self-start sm:self-auto">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>4.9 Overall CSAT Average</span>
            </div>
          </div>

          {/* Sentiment Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Positive */}
            <div
              onClick={() => setSentimentFilter('positive')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                sentimentFilter === 'positive'
                  ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-300'
                  : 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Smile className="h-4 w-4 text-emerald-600" /> Positive Sentiment
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  {counts.positivePct}%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-950 mt-2">
                {counts.positive} <span className="text-xs font-semibold text-emerald-800">Comments</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 leading-snug">
                Praising zero wait times, friendly styling chairs, and lookbook accuracy.
              </p>
              <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-3">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${counts.positivePct}%` }} />
              </div>
            </div>

            {/* Neutral */}
            <div
              onClick={() => setSentimentFilter('neutral')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                sentimentFilter === 'neutral'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300'
                  : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                  <Meh className="h-4 w-4 text-amber-600" /> Neutral Sentiment
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {counts.neutralPct}%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-amber-950 mt-2">
                {counts.neutral} <span className="text-xs font-semibold text-amber-800">Comments</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1 leading-snug">
                Satisfied overall with suggestions on parking, waiting room amenities, or noise.
              </p>
              <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-3">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${counts.neutralPct}%` }} />
              </div>
            </div>

            {/* Negative */}
            <div
              onClick={() => setSentimentFilter('negative')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                sentimentFilter === 'negative'
                  ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-300'
                  : 'border-rose-200 bg-rose-50/40 hover:bg-rose-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                  <Frown className="h-4 w-4 text-rose-600" /> Negative / Escalated
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                  {counts.negativePct}%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-rose-950 mt-2">
                {counts.negative} <span className="text-xs font-semibold text-rose-800">Comments</span>
              </div>
              <p className="text-[11px] text-rose-800 mt-1 leading-snug">
                Issues with timing delays, walk-in overruns, or equipment temperature.
              </p>
              <div className="w-full bg-rose-200/60 rounded-full h-1.5 mt-3">
                <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: `${counts.negativePct}%` }} />
              </div>
            </div>
          </div>

          {/* Full Distribution Visual Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-black/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700">Sentiment Distribution Spectrum</span>
              <span className="text-slate-500 font-semibold">{comments.length} verified reviews</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200">
              <div style={{ width: `${counts.positivePct}%` }} className="bg-emerald-500" title={`Positive: ${counts.positivePct}%`} />
              <div style={{ width: `${counts.neutralPct}%` }} className="bg-amber-500" title={`Neutral: ${counts.neutralPct}%`} />
              <div style={{ width: `${counts.negativePct}%` }} className="bg-rose-500" title={`Negative: ${counts.negativePct}%`} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-semibold">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Positive ({counts.positivePct}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Neutral ({counts.neutralPct}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Negative ({counts.negativePct}%)
              </span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'positive', 'neutral', 'negative'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSentimentFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[36px] ${
                    sentimentFilter === s
                      ? 'bg-[#291E29] text-white shadow-xs'
                      : 'bg-black/[0.04] text-slate-600 hover:bg-black/10'
                  }`}
                >
                  {s === 'all'
                    ? `All Comments (${comments.length})`
                    : s === 'positive'
                    ? `😊 Positive (${counts.positive})`
                    : s === 'neutral'
                    ? `😐 Neutral (${counts.neutral})`
                    : `🙁 Negative (${counts.negative})`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search comments..."
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-black/15 text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] bg-[#FCFBF4]"
              />
            </div>
          </div>

          {/* Filtered Comments Stream */}
          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                No customer comments match &ldquo;{commentSearch}&rdquo; in the {sentimentFilter} category.
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    comment.sentiment === 'positive'
                      ? 'bg-emerald-50/20 border-emerald-200'
                      : comment.sentiment === 'neutral'
                      ? 'bg-amber-50/20 border-amber-200'
                      : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: comment.avatarColor || '#291E29' }}
                      >
                        {comment.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-[#291E29]">{comment.customerName}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold">· {comment.serviceName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-500 mt-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i <= Math.round(comment.rating)
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-extrabold text-slate-700 ml-1">
                            {comment.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <SentimentBadge sentiment={comment.sentiment} size="sm" showEmoji />
                      <span className="text-[10px] text-slate-400">{comment.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 italic leading-relaxed pl-10">
                    &ldquo;{comment.comment}&rdquo;
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5 pl-10 text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> ~{comment.waitTimeMins}m wait
                      </span>
                      <span>·</span>
                      <span className="capitalize">{comment.status}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast(`Acknowledged comment from ${comment.customerName}.`)}
                      className="px-2.5 py-1 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-slate-700 font-bold transition"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3. Service Performance Breakdown */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#291E29]">
            {tenant.branding?.serviceUnitName ? `${tenant.branding.serviceUnitName} Performance Breakdown` : 'Service Performance Breakdown'}
          </h3>
          <div className="space-y-3 text-xs">
            {rows.map((row) => (
              <div key={row.name} className="flex items-center justify-between border-b border-black/5 pb-3">
                <div>
                  <h4 className="font-extrabold text-[#291E29]">{row.name}</h4>
                  <p className="text-[11px] text-slate-500">{row.volume}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-slate-800">{row.avgTime}</span>
                  <p className="text-[11px] text-emerald-700 font-extrabold">{row.satisfaction} csat</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TenantStaffLayout>
  );
}
