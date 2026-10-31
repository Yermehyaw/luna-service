'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Megaphone,
  Plus,
  Sparkles,
  TicketCheck,
  TrendingUp,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { useAuth } from '../../../../../lib/auth';

const week = [
  { day: 'Mon', value: 58 },
  { day: 'Tue', value: 76 },
  { day: 'Wed', value: 64 },
  { day: 'Thu', value: 88 },
  { day: 'Fri', value: 72 },
  { day: 'Sat', value: 44 },
  { day: 'Sun', value: 26 },
];

const queue = [
  { code: 'KE-024', name: 'Funke Adeleke', service: 'Gel manicure & pedicure', time: '10:10', status: 'Ready' },
  { code: 'KE-025', name: 'Fatima Bello', service: 'Knotless braids', time: '11:50', status: 'Booked' },
  { code: 'KE-023', name: 'Mariam Yusuf', service: 'Knotless braids', time: '13:20', status: 'Booked' },
];

export default function StaffDashboardPage() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const basePath = `/tenant/${tenant.slug}/staff`;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <TenantStaffLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-[#291E29] px-6 py-7 text-white shadow-xl sm:px-8 sm:py-8">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-10 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#FFC453]">Business home</span>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All systems operational
                </span>
              </div>
              <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Good morning, {firstName}.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Here is what is happening across {tenant.name} today. Your next guest is ready and the team is on pace.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <CalendarDays className="h-5 w-5 text-[#FFC453]" />
              <div><p className="text-[10px] uppercase tracking-wider text-white/45">Today</p><p className="text-xs font-extrabold">Friday, 31 October</p></div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Guests today', value: '24', note: '+12% from yesterday', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Waiting now', value: '4', note: 'Average wait 9 min', icon: Clock3, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Being served', value: '2', note: '9 chairs available', icon: UserRoundCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Completed', value: '18', note: '75% of today’s queue', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((metric) => {
            const Icon = metric.icon;
            return <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{metric.label}</p><p className="mt-2 text-3xl font-black text-slate-900">{metric.value}</p></div><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${metric.bg} ${metric.color}`}><Icon className="h-4 w-4" /></span></div><p className="mt-3 text-[11px] font-medium text-slate-500">{metric.note}</p></div>;
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8a7190]">Immediate attention</p><h2 className="mt-1 text-xl font-black text-slate-900">Next guest is ready</h2></div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Checked in 3 min ago</span>
            </div>
            <div className="mt-5 grid gap-5 rounded-2xl bg-[#f8f6f8] p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#291E29] font-mono text-sm font-black text-[#FFC453]">024</span><div><p className="font-mono text-[10px] font-bold text-slate-400">KE-024 · 10:00–10:30</p><h3 className="mt-1 text-lg font-black text-slate-900">Funke Adeleke</h3><p className="mt-0.5 text-xs text-slate-500">Express gel manicure & deluxe pedicure</p></div></div>
              <Link href={`${basePath}/ops-console`} className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#FFA800] px-5 text-xs font-extrabold text-[#291E29] shadow-lg shadow-amber-200 transition hover:-translate-y-0.5 hover:bg-[#ffb521]"><BellRing className="h-4 w-4" /> Call next guest</Link>
            </div>
            <div className="mt-6 flex items-center justify-between"><div><h3 className="text-sm font-black text-slate-900">Today&apos;s queue</h3><p className="mt-0.5 text-[11px] text-slate-500">Upcoming appointments and walk-ins</p></div><Link href={`${basePath}/ops-console`} className="flex items-center gap-1 text-[11px] font-bold text-[#702D7B]">View full queue <ArrowRight className="h-3.5 w-3.5" /></Link></div>
            <div className="mt-3 divide-y divide-slate-100">
              {queue.map((item) => <div key={item.code} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3"><span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-black text-slate-700">{item.code}</span><div className="min-w-0"><p className="truncate text-xs font-extrabold text-slate-900">{item.name}</p><p className="truncate text-[10px] text-slate-500">{item.time} · {item.service}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${item.status === 'Ready' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span></div>)}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Branch health</p><h2 className="mt-1 text-base font-black text-slate-900">Victoria Island HQ</h2></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" /></div>
              <div className="mt-5 space-y-4">{[
                ['Styling chairs', '9 of 12 open', '75%'], ['Team online', '7 of 8', '88%'], ['On-time arrivals', '94%', '94%']
              ].map(([label, value, width]) => <div key={label}><div className="mb-1.5 flex justify-between text-[11px]"><span className="font-medium text-slate-500">{label}</span><span className="font-extrabold text-slate-800">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width }} /></div></div>)}</div>
              <Link href={`${basePath}/branches`} className="mt-5 flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50">Manage branches <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="rounded-[24px] border border-[#eadcf0] bg-[#fcf9fe] p-5">
              <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ead9f1] text-[#702D7B]"><Sparkles className="h-4 w-4" /></span><div><p className="text-xs font-black text-[#291E29]">Luna insight</p><p className="mt-1 text-[11px] leading-5 text-slate-600">Friday demand peaks between 11:30 and 13:00. Opening one extra chair could reduce average wait by 4 minutes.</p></div></div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">This week</p><h2 className="mt-1 text-lg font-black text-slate-900">Guest volume</h2></div><span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><TrendingUp className="h-3 w-3" /> 12.4%</span></div>
            <div className="mt-6 flex h-44 items-end gap-3 sm:gap-5">{week.map((item, index) => <div key={item.day} className="flex h-full flex-1 flex-col justify-end gap-2"><div className={`w-full rounded-t-lg ${index === 4 ? 'bg-[#FFA800]' : 'bg-[#291E29]/15'}`} style={{ height: `${item.value}%` }} /><span className="text-center text-[9px] font-bold text-slate-400">{item.day}</span></div>)}</div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Quick actions</p><h2 className="mt-1 text-lg font-black text-slate-900">Move faster</h2></div>
            <div className="mt-5 grid grid-cols-2 gap-3">{[
              { label: 'Open queue', href: `${basePath}/ops-console`, icon: TicketCheck },
              { label: 'New walk-in', href: `${basePath}/ops-console`, icon: Plus },
              { label: 'Broadcast', href: `${basePath}/ops-console?tab=broadcast`, icon: Megaphone },
              { label: 'Analytics', href: `${basePath}/analytics`, icon: BarChart3 },
            ].map((action) => { const Icon = action.icon; return <Link key={action.label} href={action.href} className="group rounded-2xl border border-slate-200 p-4 transition hover:border-[#bba9bf] hover:bg-[#fcf9fe]"><Icon className="h-4 w-4 text-[#702D7B]" /><p className="mt-3 text-[11px] font-extrabold text-slate-800">{action.label}</p><ArrowRight className="mt-2 h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#702D7B]" /></Link>; })}</div>
            <Link href={`/tenant/${tenant.slug}`} target="_blank" className="mt-3 flex items-center justify-between rounded-xl bg-[#291E29] px-4 py-3 text-[11px] font-bold text-white"><span>Preview customer storefront</span><ExternalLink className="h-3.5 w-3.5 text-[#FFC453]" /></Link>
          </div>
        </section>
      </div>
    </TenantStaffLayout>
  );
}
