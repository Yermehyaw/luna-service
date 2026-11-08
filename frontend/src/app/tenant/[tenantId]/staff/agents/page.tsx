'use client';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';

export default function AgentsPage() {
  return <TenantStaffLayout><div className="mx-auto max-w-5xl space-y-6"><div><p className="text-xs font-semibold uppercase tracking-widest text-purple-700">Coming soon</p><h1 className="mt-2 text-3xl font-semibold">AI agents</h1><p className="mt-2 text-slate-600">Purpose built assistants for the work behind every customer relationship.</p></div><div className="grid gap-3 md:grid-cols-2">{['Marketing agent','Prospecting and lead generation agent','Automated reply agent','Content agent','Insights agent'].map(name => <div key={name} className="rounded-xl border border-slate-200 bg-white p-6"><span className="text-xs font-semibold text-purple-700">COMING SOON</span><h2 className="mt-2 text-lg font-semibold">{name}</h2><p className="mt-1 text-sm text-slate-500">We&apos;re building this for a future Luna release.</p></div>)}</div></div></TenantStaffLayout>;
}
