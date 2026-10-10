'use client';

import React, { useState, useEffect } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { updateTenant } from '../../../../../lib/tenant';
import {
  generateAiContent,
  getStoredGroqKey,
  setStoredGroqKey,
} from '../../../../../lib/ai-service';
import {
  Share2,
  Radio,
  Send,
  CheckCircle2,
  History,
  ExternalLink,
  Sparkles,
  Key,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';

export default function SocialStudioPage() {
  const { tenant, setTenant } = useTenant();
  const [broadcastText, setBroadcastText] = useState('');
  const [published, setPublished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);

  const [history, setHistory] = useState([
    {
      id: 'h_1',
      text: tenant.branding.announcementTicker || 'Live Queue System Operating · Zero Walk-in Waiting',
      time: 'Current Active',
    },
    {
      id: 'h_2',
      text: 'Heavy rain advisory: Priority windows extended by 45 minutes.',
      time: 'Yesterday',
    },
  ]);

  useEffect(() => {
    const k = getStoredGroqKey();
    if (k) {
      setGroqKeyInput(k);
      setHasCustomKey(true);
    }
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGroqKey(groqKeyInput);
    setHasCustomKey(Boolean(groqKeyInput.trim()));
    setShowKeyModal(false);
  };

  const handleAiSuggest = async (topic: string) => {
    setIsGenerating(true);
    try {
      const generated = await generateAiContent({
        prompt: topic,
        context: `Tenant: ${tenant.name}, Industry: ${tenant.industry}`,
      });
      setBroadcastText(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    const newTicker = broadcastText.trim();
    const updated = await updateTenant(tenant.slug, {
      branding: {
        ...tenant.branding,
        announcementTicker: newTicker,
      },
    });

    if (updated) {
      setTenant(updated);
    }

    setHistory((prev) => [
      { id: `h_${Date.now()}`, text: newTicker, time: 'Just now' },
      ...prev,
    ]);

    setPublished(true);
    setBroadcastText('');
    setTimeout(() => {
      setPublished(false);
    }, 4000);
  };

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Social Studio & Live Broadcasts
            </h1>
            <p className="text-xs text-slate-500">
              Publish instant live queue tickers, emergency announcements, and service broadcasts to {tenant.name}'s customer portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <Key className="h-3.5 w-3.5 text-[#FFA800]" />
              <span>{hasCustomKey ? 'Groq AI Active' : 'Configure Groq AI'}</span>
            </button>

            <Link
              href={`/tenant/${tenant.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              <span>View Public Ticker</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
            </Link>
          </div>
        </div>

        {/* Success Alert */}
        {published && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Success! Announcement ticker updated live on {tenant.slug}.luna.com.</span>
          </div>
        )}

        {/* Groq Key Modal */}
        {showKeyModal && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg space-y-4 max-w-md animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Key className="h-4 w-4 text-[#FFA800]" /> Groq AI API Key
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-xs text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Enter your free Groq API key for high-speed Llama 3 generation of broadcast copy and customer responses.
            </p>
            <form onSubmit={handleSaveKey} className="space-y-3 text-xs">
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKeyInput}
                onChange={(e) => setGroqKeyInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#291E29] px-4 py-2 font-bold text-white"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Composer Form */}
        <form
          onSubmit={handlePublish}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs"
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" /> Live Broadcast Message Ticker
              </label>
              <span className="text-[11px] text-slate-400">Appears directly above hero title</span>
            </div>

            {/* AI Generator Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 mb-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" /> AI Presets:
              </span>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => handleAiSuggest('Zero wait time advisory for cash deposit')}
                className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-100"
              >
                Zero-Wait Notice
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => handleAiSuggest('Heavy rain delay: 30 minutes arrival extension')}
                className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-100"
              >
                Weather Advisory
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => handleAiSuggest('Pre-clearance reminder to skip teller line')}
                className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-100"
              >
                Pre-Clearance Push
              </button>
            </div>

            <textarea
              rows={3}
              required
              placeholder="e.g. Priority Window 2 is operating with zero wait time for cash deposits."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-400 text-[11px]">
              Changes take effect immediately on public web pages.
            </span>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-transform hover:scale-105"
            >
              <Send className="h-3.5 w-3.5 text-[#FFA800]" />
              <span>Publish Broadcast Ticker</span>
            </button>
          </div>
        </form>

        {/* History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-sm text-slate-900">Broadcast History</h2>
          </div>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">{item.text}</p>
                  <p className="text-[11px] text-slate-400">{item.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBroadcastText(item.text)}
                  className="rounded-lg bg-white px-3 py-1 text-slate-600 border border-slate-200 hover:bg-slate-100 font-medium"
                >
                  Republish
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TenantStaffLayout>
  );
}
