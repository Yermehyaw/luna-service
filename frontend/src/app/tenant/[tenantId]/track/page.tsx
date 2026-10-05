'use client';

import React, { useState, use } from 'react';
import { getTenantBySlug } from '../../../../lib/tenant';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import { Radio, Search, Ticket } from 'lucide-react';

export default function TrackTicketPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const [tenant, setTenant] = useState<any>(null);
  const [ticketNum, setTicketNum] = useState('');
  const [searched, setSearched] = useState(false);

  React.useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then((res) => setTenant(res));
  }, [resolvedParams.tenantId]);

  if (!tenant) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading tracker...</div>;
  }

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-xl py-12 px-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-slate-900">Track Live Queue Position</h1>
          <p className="text-xs text-slate-500">Enter your ticket reference to see your real-time lobby order for {tenant.name}.</p>
        </div>

        <form onSubmit={handleTrack} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Ticket Reference Number</label>
            <div className="relative mt-1">
              <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. A-101"
                value={ticketNum}
                onChange={(e) => setTicketNum(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-800 font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800"
          >
            <Search className="h-4 w-4" />
            <span>Search Live Position</span>
          </button>
        </form>

        {searched && (
          <div className="rounded-2xl border border-blue-200 bg-white p-6 text-center space-y-3 shadow-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <Radio className="h-3.5 w-3.5 animate-pulse text-blue-500" />
              Ticket {ticketNum} Found
            </span>
            <div className="text-3xl font-extrabold text-slate-900">Position #2 in Queue</div>
            <p className="text-xs text-slate-500">Estimated wait: ~6 minutes. Please remain in the lobby lounge.</p>
          </div>
        )}
      </div>
    </TenantCustomerLayout>
  );
}
