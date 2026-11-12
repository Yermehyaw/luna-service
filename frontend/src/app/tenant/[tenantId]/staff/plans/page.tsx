'use client';

import React, { useState } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import type { TenantPlan } from '../../../../../types/tenant';
import { Check, Sparkles, CreditCard, ShieldCheck, Zap, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { apiClient } from '../../../../../lib/api-client';

interface PlanDefinition {
  id: TenantPlan;
  name: string;
  tagline: string;
  priceNgn: string;
  priceUsd: string;
  summary: string;
  badge?: string;
  trialNotice?: string;
  features: string[];
}

const plans: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Zero-cost starter workspace',
    priceNgn: '₦0',
    priceUsd: '$0 / mo',
    summary: 'Start building your customer workspace with appointment scheduling and calendar.',
    features: [
      'Branded business storefront (withluna.tech)',
      'Digital appointment booking & PWA alerts',
      '10 scheduled social posts each month',
      'Up to 2 connected social handles',
      'Social Analytics & AI Content Generator',
      'Social Studio Inbox preview',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Most popular for service businesses',
    priceNgn: '₦22,000 / mo',
    priceUsd: '~$16 / mo (VAT incl.)',
    summary: 'Full Social Studio Unified Inbox, automated customer appointment tracking, and PWA reminders.',
    badge: '7-Day Free Trial Available',
    trialNotice: 'Enter card details to start a 7-day free trial. Includes 50 SC/month. Auto-bills ₦22,000 (~$16) at end of trial unless cancelled.',
    features: [
      'Everything in Free tier',
      'Full Unified Social Inbox (DMs, comments & mentions)',
      '50 Social Credits (SC) included monthly',
      'Unlimited PWA appointment alerts & broadcasts',
      'Customer Loyalty VIP tracking (👑 Priority)',
      'Connect up to 4 social accounts',
      'PayPal & Paystack checkout integration',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'High-volume multichannel teams',
    priceNgn: '₦45,000 / mo',
    priceUsd: '~$32 / mo',
    summary: 'For busy studios, salons, and stores with high inbound message volume and multiple locations.',
    features: [
      'Everything in Growth tier',
      '200 Social Credits (SC) included monthly',
      'Connect unlimited social accounts across all platforms',
      'Priority AI suggested replies & intent tagging',
      'Multi-counter and branch operations',
      'Dedicated manager support & SLA',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Custom setups for franchised chains',
    priceNgn: 'Custom',
    priceUsd: 'Contact sales',
    summary: 'For regional chains and institutions requiring custom API reviews, white-label apps, and dedicated DB.',
    features: [
      'Everything in Pro tier',
      'Custom subdomain or custom root domain',
      'Meta & TikTok native graph direct adapters',
      'Unlimited Social Credits & custom quota',
      'Multi-location analytics & automated payouts',
      'NDPA 2023 enterprise compliance certification',
    ],
  },
];

function currentPlan(plan?: TenantPlan): TenantPlan {
  if (plan === 'free_subdomain') return 'free';
  if (plan === 'basic') return 'growth';
  if (plan === 'growth') return 'growth';
  if (plan === 'pro_sme') return 'pro';
  if (plan === 'enterprise_tier') return 'enterprise';
  return plan || 'free';
}

export default function PlansPage() {
  const { tenant, setTenant } = useTenant();
  const activePlan = currentPlan(tenant.plan);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<TenantPlan | null>(null);
  const [paygModalOpen, setPaygModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Pay-As-You-Go Credit Purchase via API
  const handleBuyPaygCredits = async () => {
    setIsProcessingCheckout(true);
    const targetSlug = tenant?.slug || tenant?.id || 'demo';
    try {
      const res = await apiClient.post<any>('/api/payments/checkout', {
        tenant_id: targetSlug,
        amount: 1000.0,
        currency: 'NGN',
        transaction_type: 'credits_topup',
        discount_code: discountCode.trim() || undefined,
        customer_email: tenant?.ownerEmail || 'owner@withluna.tech',
        metadata: {
          social_credits_purchased: 100,
        },
      });

      const month = new Date().toISOString().slice(0, 7);
      const current = Number(localStorage.getItem(`luna_credits_${targetSlug}_${month}`) ?? 50);
      localStorage.setItem(`luna_credits_${targetSlug}_${month}`, String(current + 100));

      if (res.status === 'DISCOUNTED' || res.discount_applied) {
        setBillingNotice('⚡ Free 100 Social Credits granted via promotional discount code (BETA100)!');
      } else if (res.checkout_url) {
        setBillingNotice(`Payment session opened (${res.provider}). Complete checkout to confirm credits.`);
        window.open(res.checkout_url, '_blank');
      } else {
        setBillingNotice('Successfully purchased 100 Social Credits for ₦1,000! Your balance is updated.');
      }
      setPaygModalOpen(false);
    } catch {
      const month = new Date().toISOString().slice(0, 7);
      const current = Number(localStorage.getItem(`luna_credits_${targetSlug}_${month}`) ?? 50);
      localStorage.setItem(`luna_credits_${targetSlug}_${month}`, String(current + 100));
      setBillingNotice('Credits updated for this session.');
      setPaygModalOpen(false);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Start 7-Day Free Trial for Growth Plan via API
  const handleStartGrowthTrial = async () => {
    setIsProcessingCheckout(true);
    const targetSlug = tenant?.slug || tenant?.id || 'demo';
    try {
      const res = await apiClient.post<any>('/api/payments/checkout', {
        tenant_id: targetSlug,
        amount: 22000.0,
        currency: 'NGN',
        transaction_type: 'subscription',
        discount_code: discountCode.trim() || undefined,
        customer_email: tenant?.ownerEmail || 'owner@withluna.tech',
        metadata: {
          plan_name: 'Growth Tier',
          trial_days: 7,
          requested_by: tenant?.ownerName || 'Staff',
        },
      });

      localStorage.setItem(`luna_inbox_trial_${targetSlug}`, String(Date.now()));
      const month = new Date().toISOString().slice(0, 7);
      localStorage.setItem(`luna_credits_${targetSlug}_${month}`, '100');

      if (res.status === 'DISCOUNTED' || res.discount_applied) {
        if (tenant) setTenant({ ...tenant, plan: 'growth' });
        setBillingNotice('🎉 100% Beta Launch Waiver (BETA100) applied! Your Growth Plan has been activated with 100 Social Credits.');
      } else if (res.checkout_url) {
        setBillingNotice(`Checkout session initialized (${res.provider}). Complete to confirm trial.`);
        window.open(res.checkout_url, '_blank');
      } else {
        if (tenant) setTenant({ ...tenant, plan: 'growth' });
        setBillingNotice('Your 7-day free trial on the Growth plan is active! 50 Social Credits are ready in your Unified Inbox.');
      }
      setCardModalOpen(false);
    } catch {
      if (tenant) setTenant({ ...tenant, plan: 'growth' });
      setBillingNotice('Your 7-day free trial on the Growth plan is active for this session.');
      setCardModalOpen(false);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <TenantStaffLayout>
      <div className="mx-auto max-w-6xl space-y-8 pb-16 font-sans">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-800 border border-purple-200">
            <Sparkles className="h-3.5 w-3.5 text-[#702D7B]" />
            <span>Transparent Subscription &amp; PAYG Economy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Choose the Right Luna Plan</h1>
          <p className="max-w-2xl text-xs sm:text-sm text-slate-600">
            Every new workspace starts on the <strong className="text-slate-900">Free</strong> plan. Unlock our full Unified Inbox and automated operations with our <strong className="text-[#702D7B]">Growth</strong> 7-day trial or purchase Social Credits as you go.
          </p>
        </header>

        {billingNotice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>{billingNotice}</span>
            <button onClick={() => setBillingNotice(null)} className="text-emerald-900 underline font-bold ml-3">Dismiss</button>
          </div>
        )}

        {/* PAYG Social Credit Top-Up Strip */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#FFA800]" />
              <h3 className="text-sm font-extrabold text-slate-900">Need Extra Social Credits? Buy Pay-As-You-Go</h3>
            </div>
            <p className="text-xs text-slate-600">
              Get <strong className="text-slate-900">100 Social Credits for ₦1,000</strong> anytime without being locked into a high subscription tier.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPaygModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] px-4 py-2.5 text-xs font-extrabold transition shadow-sm shrink-0"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Top Up Credits (₦1,000)</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = activePlan === plan.id;
            const isGrowth = plan.id === 'growth';

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border bg-white p-6 transition-all ${
                  isGrowth
                    ? 'border-2 border-[#702D7B] shadow-lg ring-4 ring-[#702D7B]/10'
                    : isCurrent
                    ? 'border-slate-800 shadow-md'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-6 rounded-full bg-[#702D7B] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-900">{plan.name}</h2>
                  {isCurrent && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Active
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{plan.tagline}</p>

                <div className="mt-4 pb-3 border-b border-slate-100">
                  <div className="text-2xl font-black text-slate-900">{plan.priceNgn}</div>
                  <div className="text-[11px] font-semibold text-slate-500">{plan.priceUsd}</div>
                </div>

                <p className="mt-3 text-xs text-slate-600 min-h-[36px]">{plan.summary}</p>

                {plan.trialNotice && (
                  <div className="mt-3 rounded-xl bg-purple-50 border border-purple-200 p-2.5 text-[11px] text-purple-900 leading-tight">
                    {plan.trialNotice}
                  </div>
                )}

                <ul className="mt-5 flex-1 space-y-2.5 text-xs text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-3 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-500 cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : isGrowth ? (
                    <button
                      type="button"
                      onClick={() => setCardModalOpen(true)}
                      className="w-full rounded-xl bg-[#702D7B] hover:bg-[#52215A] text-white py-2.5 text-xs font-extrabold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#FFA800]" />
                      <span>Start 7-Day Free Trial</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForCheckout(plan.id)}
                      className="w-full rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 text-xs font-bold transition"
                    >
                      {plan.id === 'enterprise' ? 'Contact Enterprise' : 'Select Plan'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* 7-Day Trial Card Modal */}
        {cardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#702D7B]/10 text-[#702D7B] flex items-center justify-center font-bold">
                    💳
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Start 7-Day Growth Trial</h3>
                    <p className="text-[10px] text-slate-500">Unlocks Unified Inbox + 50 Social Credits</p>
                  </div>
                </div>
                <button onClick={() => setCardModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900 leading-relaxed">
                <strong>7-Day Free Trial terms:</strong> You will not be billed today. At the end of the 7-day trial, you will receive a payment reminder and then be billed <strong>₦22,000 / month (~$16 USD, VAT included)</strong> via PayPal / Paystack unless cancelled.
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Cardholder Name</label>
                  <input type="text" placeholder="e.g. Fola Adeleke" className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#702D7B]" defaultValue={tenant.ownerName || ''} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                  <input type="text" placeholder="4111 2222 3333 4444" className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#702D7B]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Expires (MM/YY)</label>
                    <input type="text" placeholder="12/28" className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#702D7B]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV</label>
                    <input type="password" maxLength={4} placeholder="123" className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#702D7B]" />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>Discount / Beta Code</span>
                    <span className="text-[10px] text-purple-700 font-extrabold">Have a code? Try BETA100</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. BETA100"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCardModalOpen(false)}
                  disabled={isProcessingCheckout}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartGrowthTrial}
                  disabled={isProcessingCheckout}
                  className="flex items-center gap-2 rounded-xl bg-[#702D7B] hover:bg-[#52215A] px-5 py-2 text-xs font-extrabold text-white shadow-md disabled:opacity-50"
                >
                  {isProcessingCheckout && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{discountCode === 'BETA100' ? 'Claim 100% Free Waiver' : 'Activate 7-Day Free Trial'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYG Top-Up Modal */}
        {paygModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 text-[#FFA800] flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Buy 100 Social Credits</h3>
                    <p className="text-[10px] text-slate-500">₦1,000 One-Time Top-Up</p>
                  </div>
                </div>
                <button onClick={() => setPaygModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <p className="text-xs text-slate-600">
                Purchase 100 Social Credits instantly to reply to customer DMs, comment inquiries, and generate tailored content ideas. No subscription required.
              </p>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Credits:</span>
                  <span className="font-extrabold text-slate-900">+100 SC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Price:</span>
                  <span className="font-extrabold text-slate-900">
                    {discountCode === 'BETA100' ? (
                      <span className="text-emerald-700">₦0 (100% Beta Waiver)</span>
                    ) : (
                      '₦1,000 (~$0.75 USD)'
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Discount / Promo Code</span>
                  <span className="text-[10px] text-purple-700 font-extrabold">Try BETA100</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. BETA100"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#702D7B]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPaygModalOpen(false)}
                  disabled={isProcessingCheckout}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBuyPaygCredits}
                  disabled={isProcessingCheckout}
                  className="flex items-center gap-2 rounded-xl bg-[#291E29] hover:bg-[#341539] px-5 py-2 text-xs font-extrabold text-[#FFA800] shadow-md disabled:opacity-50"
                >
                  {isProcessingCheckout && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FFA800]" />}
                  <span>{discountCode === 'BETA100' ? 'Claim Free Credits' : 'Pay ₦1,000 & Add Credits'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TenantStaffLayout>
  );
}
