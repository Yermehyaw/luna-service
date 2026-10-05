'use client';

import React from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { BarChart2, TrendingUp, Clock, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const { tenant } = useTenant();

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Branch Performance & Queue Analytics</h1>
          <p className="text-xs text-slate-500">Real-time metrics, throughput, and customer wait times for {tenant.name}.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-500" /> Peak Lobby Throughput
            </span>
            <div className="text-2xl font-extrabold text-slate-900">42 Cust / Hr</div>
            <p className="text-[11px] text-emerald-600 font-semibold">↑ 14% vs yesterday</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" /> Avg Wait Duration
            </span>
            <div className="text-2xl font-extrabold text-slate-900">4.8 Minutes</div>
            <p className="text-[11px] text-emerald-600 font-semibold">↓ 3.2 min lower than SLA target</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Customer Satisfaction Index
            </span>
            <div className="text-2xl font-extrabold text-slate-900">98.4%</div>
            <p className="text-[11px] text-slate-400">Based on 342 verified ratings</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Service Window Performance Breakdown</h3>
          <div className="space-y-3 text-xs">
            {[
              { name: 'Teller & Cash Deposit', volume: '142 Served', avgTime: '4.2 mins', satisfaction: '99%' },
              { name: 'Account & Card Advisory', volume: '68 Served', avgTime: '12.5 mins', satisfaction: '96%' },
              { name: 'Corporate Foreign Exchange', volume: '24 Served', avgTime: '18.1 mins', satisfaction: '97%' },
            ].map((row) => (
              <div key={row.name} className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{row.name}</h4>
                  <p className="text-[11px] text-slate-500">{row.volume}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-800">{row.avgTime}</span>
                  <p className="text-[11px] text-emerald-600 font-bold">{row.satisfaction} csat</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TenantStaffLayout>
  );
}
