'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles, Globe, Share2, Ticket, MessageSquare } from 'lucide-react';
import { Nav, Footer, CtaBand, Reveal, PRIMARY, SIGN_UP, WAITLIST, WRAP } from '@/components/marketing/Chrome';

const DETAILED_STEPS = [
  {
    step: '01',
    title: 'Claim your business address',
    subtitle: 'Takes less than 2 minutes',
    icon: Globe,
    desc: 'Pick your free web address at yourbusiness.withluna.tech. Add your brand colours, upload your logo, and enter your services and prices.',
    points: [
      'No complex website setup or hosting required',
      'Choose your industry styling and palette in 1 tap',
      'Add services with exact slot durations and pricing',
    ],
    accent: 'bg-[#FFE5B3]',
    border: 'border-[#FFA800]/40',
  },
  {
    step: '02',
    title: 'Share your booking bio link',
    subtitle: 'Turn followers into paying clients',
    icon: Share2,
    desc: 'Copy your short link and put it in your Instagram bio, TikTok bio, and WhatsApp status with the message "Book from my bio".',
    points: [
      'Single link for all your services and passes',
      'Viral booking loop — clients share tickets on WhatsApp',
      'Pay in conversation deep-links for direct DM booking',
    ],
    accent: 'bg-[#D8AAE0]/50',
    border: 'border-[#702D7B]/30',
  },
  {
    step: '03',
    title: 'Customers book, pay, and get notified',
    subtitle: 'Zero waiting room congestion',
    icon: Ticket,
    desc: 'Customers pick their service and time slot, pay securely online, and receive a live digital ticket on their phone with automated 30-min PWA arrival alerts.',
    points: [
      'Online payment via Paystack card, bank transfer, or PayPal',
      'Live queue ticket with real-time status updates',
      'PWA push notifications alert clients 30 mins before time',
    ],
    accent: 'bg-[#FBF6A3]',
    border: 'border-[#FFA800]/50',
  },
  {
    step: '04',
    title: 'Stay visible and run operations smoothly',
    subtitle: 'Social Studio + Front-Desk Operations',
    icon: MessageSquare,
    desc: 'Use Social Studio’s reminder calendar to plan posts across Instagram, TikTok, and WhatsApp with AI-drafted ideas. Answer all customer DMs from one unified inbox.',
    points: [
      'Interactive monthly calendar with PWA mobile publishing reminders',
      'Unified inbox for Instagram, X, TikTok, and WhatsApp inquiries',
      'Operations dashboard tracks today’s queue pace from call to done',
    ],
    accent: 'bg-[#FFE5B3]',
    border: 'border-[#FFA800]/40',
  },
];

const FAQS = [
  [
    'Do I need technical skills or a domain to get started?',
    'No. Luna gives you a free withluna.tech page out of the box with zero setup. You can also connect a custom root domain if you are on the Growth plan.',
  ],
  [
    'How do my customers receive notifications without SMS costs?',
    'Luna uses modern Progressive Web App (PWA) push notifications. When your customer opens your booking page, they install the lightweight pass and receive instant arrival alerts 30 minutes before their appointment.',
  ],
  [
    'How do I receive payments from clients?',
    'Online bookings are processed securely via Paystack (for local cards and bank transfers) and PayPal (for international clients). Funds settle straight into your business bank account.',
  ],
  [
    'Can my staff also use Luna?',
    'Yes. You can add staff specialists, assign them individual chairs or windows, and switch between Owner and Staff views with one click.',
  ],
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FFF6E9] font-primary text-[#291E29] antialiased">
      <Nav />

      {/* Hero */}
      <section className={`${WRAP} pb-12 pt-16 sm:pt-20`}>
        <Reveal>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#291E29] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#FFA800]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simple 4-Step Flow</span>
          </span>
          <h1 className="mt-5 max-w-3xl font-title text-4xl font-bold leading-tight sm:text-6xl">
            How Luna works for your business.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#291E29]/75">
            From the moment you claim your free address to your first automated booking,
            here is how Luna takes the friction out of appointments and customer visibility.
          </p>
        </Reveal>
      </section>

      {/* 4 Steps Section */}
      <section className={`${WRAP} py-10`}>
        <div className="grid gap-8 md:grid-cols-2">
          {DETAILED_STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.step} delay={idx * 100}>
                <div
                  className={`flex h-full flex-col justify-between rounded-3xl border ${s.border} ${s.accent} p-8 sm:p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-title text-3xl font-black text-[#291E29]">
                        {s.step}
                      </span>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#291E29] text-[#FFA800] shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    <h2 className="mt-6 font-title text-2xl font-bold sm:text-3xl">
                      {s.title}
                    </h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#291E29]/60">
                      {s.subtitle}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-[#291E29]/80 sm:text-base">
                      {s.desc}
                    </p>
                  </div>

                  <ul className="mt-8 space-y-2.5 border-t border-[#291E29]/15 pt-6 text-xs sm:text-sm">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 font-semibold text-[#291E29]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#291E29]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Customer Journey Graphic Preview */}
      <section className={`${WRAP} py-16`}>
        <Reveal>
          <div className="rounded-3xl bg-[#291E29] p-8 sm:p-12 text-[#FFF6E9] shadow-2xl">
            <h2 className="font-title text-2xl font-bold sm:text-4xl text-center">
              The complete loop from bio link to repeat visit.
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-6 border border-white/10">
                <span className="text-xs font-black text-[#FFA800]">Phase 1</span>
                <h3 className="mt-2 text-lg font-bold">Discovery &amp; Link</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70">
                  Follower taps your bio link on Instagram or WhatsApp, sees your service menu, and locks in a chair slot in 30 seconds.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-6 border border-white/10">
                <span className="text-xs font-black text-[#FFA800]">Phase 2</span>
                <h3 className="mt-2 text-lg font-bold">Arrival &amp; Service</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70">
                  Client receives a PWA push alert 30 mins before their appointment. Your front desk calls them up with one tap.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-6 border border-white/10">
                <span className="text-xs font-black text-[#FFA800]">Phase 3</span>
                <h3 className="mt-2 text-lg font-bold">Retention &amp; Rebooking</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70">
                  Client is saved in your directory with a VIP crown 👑. Social Studio reminds you when to post to bring them back.
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link href={SIGN_UP} className={`${PRIMARY} !px-8 !py-3.5`}>
                Claim your free business page <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <Reveal>
          <h2 className="font-title text-3xl font-bold sm:text-4xl">Common questions</h2>
          <div className="mt-8 divide-y divide-[#291E29]/15 border-y border-[#291E29]/15">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                  {q}
                  <span className="ml-4 text-xl transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-[#291E29]/75">{a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <CtaBand />
      <Footer />
    </div>
  );
}
