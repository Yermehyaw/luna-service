'use client';

import React, { useState } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { Share2, Radio, Send, CheckCircle2 } from 'lucide-react';

export default function SocialStudioPage() {
  const { tenant } = useTenant();
  const [broadcastText, setBroadcastText] = useState('');
  const [published, setPublished] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setPublished(true);
    setTimeout(() => {
      setBroadcastText('');
      setPublished(false);
    }, 3000);
  };

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Social Studio & Broadcasts</h1>
          <p className="text-xs text-slate-500">Publish live queue tickers, emergency announcements, and customer care broadcasts for {tenant.name}.</p>
        </div>

        {published && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Broadcast broadcasted live to tenant customer portal ticker!</span>
          </div>
        )}

        <form onSubmit={handlePublish} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-emerald-500 animate-pulse" /> Live Broadcast Message Ticker
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Priority Window 2 is operating with zero wait time for cash deposits."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800"
          >
            <Send className="h-4 w-4 text-sky-400" />
            <span>Publish Broadcast Announcement</span>
          </button>
        </form>
      </div>
    </TenantStaffLayout>
  );
}
