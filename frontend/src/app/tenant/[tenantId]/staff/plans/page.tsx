'use client';

import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import type { TenantPlan } from '../../../../../types/tenant';

const plans: { id: TenantPlan; name: string; summary: string; features: string[] }[] = [
  { id: 'free', name: 'Free', summary: 'Start building your customer workspace.', features: ['Branded business page and service listings', '10 social posts each month', 'Up to 2 connected social handles', '50 social credits each month'] },
  { id: 'basic', name: 'Basic', summary: 'For businesses ready to grow their customer reach.', features: ['More publishing capacity', 'More connected social handles', 'Core customer and service tools'] },
  { id: 'pro', name: 'Pro', summary: 'For teams handling messages across social accounts.', features: ['Messages in one inbox', 'Suggested reply drafts', 'Social post results'] },
  { id: 'enterprise', name: 'Enterprise', summary: 'For larger teams with many locations.', features: ['Manage several locations', 'Reports across your business', 'Help with setup'] },
];

function currentPlan(plan?: TenantPlan): TenantPlan {
  if (plan === 'free_subdomain') return 'free';
  if (plan === 'pro_sme') return 'pro';
  if (plan === 'enterprise_tier') return 'enterprise';
  return plan || 'free';
}

export default function PlansPage() {
  const { tenant } = useTenant();
  const activePlan = currentPlan(tenant.plan);

  return <TenantStaffLayout><div className="mx-auto max-w-6xl space-y-7"><header><p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-700">Workspace plans</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Choose the right Luna plan</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Your new workspace starts on Free automatically. Compare the four tiers here and move up when your business is ready.</p></header><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{plans.map(plan => { const selected = activePlan === plan.id; return <article key={plan.id} className={`flex flex-col rounded-xl border bg-white p-5 ${selected ? 'border-[#702D7B] ring-2 ring-[#702D7B]/10' : 'border-slate-200'}`}><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-900">{plan.name}</h2>{selected && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">Current plan</span>}</div><p className="mt-2 min-h-10 text-sm text-slate-600">{plan.summary}</p><ul className="mt-5 flex-1 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm text-slate-700"><span className="font-bold text-emerald-700">✓</span>{feature}</li>)}</ul><button type="button" disabled={!selected} className={`mt-6 rounded-md px-4 py-2.5 text-sm font-semibold ${selected ? 'bg-[#291e29] text-white' : 'cursor-not-allowed bg-slate-100 text-slate-500'}`}>{selected ? 'Your current plan' : 'Upgrade options coming soon'}</button></article>; })}</div><p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Plan changes and billing are not enabled yet. Your workspace remains on Free until upgrade checkout is connected.</p></div></TenantStaffLayout>;
}
