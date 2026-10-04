'use client';

import React from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { Users, Ticket, CheckCircle2, Clock, Play, SkipForward } from 'lucide-react';

export default function StaffOpsConsolePage() {
  const { tenant } = useTenant();

  return (
    <TenantStaffLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Branch Operations Console</h1>
          <p className="text-xs text-slate-500">Live ticket management & arrival triage for {tenant.name}.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold">Active Lobby Queue</span>
            <div className="text-2xl font-extrabold text-slate-900">14 Customers</div>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900">Live Ticket Serving Queue</h2>
          <div className="space-y-3">
            {[
              { id: 'A-101', name: 'Amara Okafor', service: 'Teller & Cash Deposit', window: '10:30 AM', status: 'In Waiting' },
              { id: 'A-102', name: 'Babajide Cole', service: 'Account & Card Advisory', window: '10:45 AM', status: 'Document Verified' },
              { id: 'A-103', name: 'Chidinma Vance', service: 'Teller & Cash Deposit', window: '11:00 AM', status: 'In Waiting' },
            ].map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 bg-slate-50 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-extrabold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{ticket.id}</span>
                  <div>
                    <h4 className="font-bold text-slate-900">{ticket.name}</h4>
                    <p className="text-[11px] text-slate-500">{ticket.service} · Window {ticket.window}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">{ticket.status}</span>
                  <button className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 font-bold text-white shadow-sm hover:bg-slate-800">
                    <Play className="h-3.5 w-3.5 fill-white" /> Call Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TenantStaffLayout>
  );
}
