'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { LunaLogo } from '../components/shared/LunaMark';

// Swap SIGN_UP to WAITLIST everywhere if self-service sign-up is not open yet.
const SIGN_UP = '/register';
const WAITLIST = 'https://bit.ly/LunaWaitlist';
const EXAMPLE = '/tenant/kemis-lounge';

const BTN = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition';
const PRIMARY = `${BTN} bg-[#FFA800] text-[#291E29] hover:bg-[#FFB11A]`;
const GHOST = `${BTN} border border-[#291E29]/25 text-[#291E29] hover:bg-[#291E29]/5`;
const WRAP = 'mx-auto max-w-6xl px-5';

const OUTCOMES = [
  {
    title: 'Be seen, week after week',
    body: 'Social Studio suggests post ideas, keeps a calendar and reminds you when a post is due, so your business stays visible without a full-time social media manager.',
  },
  {
    title: 'Be booked and paid',
    body: 'Customers choose a service, pick a time and pay securely on your page. They receive a ticket they can share and follow.',
  },
  {
    title: 'Keep your customers',
    body: 'Every booking adds to a customer list that belongs to you, with each person’s visits and payments beside their name.',
  },
];

const STEPS = [
  { title: 'Claim your page', body: 'Add your business name, colours, logo and services.' },
  { title: 'Share your link', body: 'Put it in your Instagram bio, WhatsApp status and posts.' },
  { title: 'Customers book and pay', body: 'They receive a ticket, and you see who is next.' },
  { title: 'Stay visible', body: 'Plan posts, answer messages and review your bookings.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '₦0',
    note: 'for as long as you like',
    items: [
      'Your page at yourbusiness.withluna.tech',
      'Online booking and live queue tickets',
      'Ticket sharing on any platform',
      'Content ideas and a post calendar with reminders',
      'Analytics on your social accounts',
    ],
    cta: 'Claim your free page',
    href: SIGN_UP,
    featured: false,
  },
  {
    name: 'Growth',
    price: '₦22,000',
    note: 'a month, VAT and card fees included',
    items: [
      'Everything in Free',
      'Social Studio inbox for all your connected accounts',
      'Suggested replies you review before sending',
      'Reply and AI credits, with top-ups when you need more',
      '7-day free trial',
    ],
    cta: 'Start your free trial',
    href: SIGN_UP,
    featured: true,
  },
  {
    name: 'Pro',
    price: 'Coming soon',
    note: 'for businesses with several branches',
    items: ['Everything in Growth', 'Tools for branches to work together'],
    cta: 'Join the waitlist',
    href: WAITLIST,
    featured: false,
  },
  {
    name: 'Enterprise',
    price: 'Talk to us',
    note: 'for large organisations',
    items: ['Set up around how you already work', 'Direct support from our team'],
    cta: 'Get in touch',
    href: WAITLIST,
    featured: false,
  },
];

const FAQ = [
  ['Is Luna really free?', 'Yes. Your booking and queue page, ticket sharing, content ideas, post calendar with reminders and analytics are free. Growth adds the Social Studio inbox, suggested replies and reply credits, with a 7-day free trial.'],
  ['Does Luna post for me?', 'Luna drafts ideas and reminds you when a post is due, then hands it to your phone so you publish it in the app. Replies are suggested for you to review. Nothing is sent without you.'],
  ['Which platforms can I connect?', 'Facebook Pages, Instagram, Threads, X, TikTok, LinkedIn and WhatsApp. What each connection allows depends on that platform’s rules, and we are onboarding businesses in small groups at first.'],
  ['What do I need to start the Growth trial?', 'A card. You are not charged during the 7 days. At the end of the trial the plan bills ₦22,000 a month.'],
  ['Who owns my customer list?', 'You do. Every booking adds the customer’s details and visits to your list. Luna is built to follow the Nigeria Data Protection Act 2023.'],
  ['Can I use Luna for more than one branch?', 'Tools for multi-branch teams are coming next. Join the waitlist and tell us how many branches you run.'],
];

const FOR = ['Salons and barbers', 'Caterers', 'Tutors and training centres', 'Photographers', 'Event planners', 'Clinics', 'Fitness studios'];

export default function Home() {
  const [name, setName] = useState('');
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);

  return (
    <div className="min-h-screen bg-[#FFF6E9] font-primary text-[#291E29] antialiased">
      <header className="sticky top-0 z-50 border-b border-[#291E29]/10 bg-[#FFF6E9]/90 backdrop-blur">
        <div className={`${WRAP} flex h-16 items-center justify-between`}>
          <Link href="/" aria-label="Luna home">
            <LunaLogo size={32} variant="dark" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#product" className="hover:opacity-70">Product</a>
            <a href="#how" className="hover:opacity-70">How it works</a>
            <a href="#pricing" className="hover:opacity-70">Pricing</a>
            <a href="#faq" className="hover:opacity-70">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-semibold hover:opacity-70 sm:block">Sign in</Link>
            <Link href={SIGN_UP} className={`${PRIMARY} !px-5 !py-2`}>Claim your free page</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pb-20 pt-14 lg:pt-20">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#D8AAE0]/30 blur-3xl" />
        <div className={`${WRAP} relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]`}>
          <div>
            <h1 className="font-title text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Get booked, stay visible and answer customers faster.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#291E29]/75">
              Luna gives your business a free page where customers book, pay and follow their place in the queue. Social Studio helps you plan posts and handle customer messages from one place.
            </p>
            <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center rounded-full border border-[#291E29]/20 bg-white pl-5 pr-3 text-sm">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="yourbusiness"
                  aria-label="Your business name"
                  className="min-w-0 flex-1 bg-transparent py-3 font-semibold outline-none placeholder:font-normal"
                />
                <span className="text-[#291E29]/50">.withluna.tech</span>
              </div>
              <Link href={`${SIGN_UP}?subdomain=${encodeURIComponent(slug || 'mybusiness')}`} className={PRIMARY}>
                Claim your free page <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#291E29]/60">
              Free to start. Built in Nigeria, and now onboarding our first businesses in Benin City.
            </p>
            <Link href={EXAMPLE} className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">
              See an example booking page <ArrowRight size={14} />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-md" aria-label="Illustration of a booking ticket and a suggested reply">
            <div className="rounded-3xl border border-[#291E29]/10 bg-white p-6 shadow-xl shadow-[#291E29]/10">
              <p className="text-xs text-[#291E29]/50">Kemi’s Hair &amp; Beauty Lounge</p>
              <p className="mt-1 font-title text-xl font-bold">Braids, Saturday at 10:30</p>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#FFE5B3]/60 px-4 py-3">
                <div>
                  <p className="text-xs text-[#291E29]/60">Your ticket</p>
                  <p className="text-lg font-bold">B-014</p>
                </div>
                <p className="text-sm font-semibold">You are 3rd in line</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 font-semibold"><Check size={15} /> Paid securely</span>
                <span className="font-semibold underline underline-offset-4">Share ticket</span>
              </div>
            </div>
            <div className="-mt-4 ml-8 rounded-3xl bg-[#291E29] p-6 text-[#FFF6E9] shadow-xl">
              <p className="text-xs text-[#FFF6E9]/60">Message from a customer</p>
              <p className="mt-1 text-sm">“Do you have a slot on Saturday morning?”</p>
              <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm">
                <p className="text-xs text-[#FFF6E9]/60">Suggested reply</p>
                <p className="mt-1">Yes, we have 10:30 and 11:30. You can book here: kemis-lounge.withluna.tech</p>
                <div className="mt-3 flex gap-2 text-xs font-bold">
                  <span className="rounded-full border border-white/30 px-3 py-1">Edit</span>
                  <span className="rounded-full bg-[#FFA800] px-3 py-1 text-[#291E29]">Send</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#FFF6E9]/60">You review every reply before it is sent.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section className="border-y border-[#291E29]/10 bg-white py-6">
        <div className={`${WRAP} flex flex-wrap items-center gap-x-3 gap-y-2 text-sm`}>
          <span className="font-bold">Made for</span>
          {FOR.map((f) => (
            <span key={f} className="rounded-full bg-[#FFE5B3]/60 px-3 py-1 font-semibold">{f}</span>
          ))}
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-20">
        <div className={WRAP}>
          <h2 className="max-w-2xl font-title text-3xl font-bold sm:text-4xl">
            Three jobs Luna takes off your hands.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {OUTCOMES.map((o) => (
              <div key={o.title} className="border-t-2 border-[#291E29] pt-5">
                <h3 className="text-lg font-bold">{o.title}</h3>
                <p className="mt-3 leading-relaxed text-[#291E29]/75">{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product */}
      <section id="product" className="bg-white py-20">
        <div className={`${WRAP} grid gap-14 lg:grid-cols-2`}>
          <div>
            <h2 className="font-title text-3xl font-bold">Your booking page</h2>
            <p className="mt-3 max-w-md text-[#291E29]/75">A page of your own that customers can open from any link, with your colours and logo.</p>
            <ul className="mt-6 space-y-3">
              {[
                'Your own address, yourbusiness.withluna.tech',
                'Customers choose a service and a time',
                'Secure online payment when they book',
                'A live ticket they can follow and share on any platform',
                'A customer list that grows with every booking',
              ].map((t) => (
                <li key={t} className="flex gap-3"><Check size={18} className="mt-1 shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-title text-3xl font-bold">Social Studio</h2>
            <p className="mt-3 max-w-md text-[#291E29]/75">One place to plan your posts and keep up with the people who message you.</p>
            <ul className="mt-6 space-y-3">
              {[
                'Content ideas written for your kind of business',
                'A post calendar that reminds you when to publish',
                'One inbox for Facebook, Instagram, Threads, X, TikTok, LinkedIn and WhatsApp',
                'Suggested replies that you review and send',
                'Analytics on what your audience responds to',
              ].map((t) => (
                <li key={t} className="flex gap-3"><Check size={18} className="mt-1 shrink-0" />{t}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-[#291E29]/60">The inbox is part of Growth, with a 7-day free trial.</p>
          </div>
        </div>
        <div className={`${WRAP} mt-14`}>
          <div className="rounded-2xl border border-dashed border-[#291E29]/30 px-6 py-5 text-sm">
            <span className="font-bold">Coming next: </span>
            tools for branches to work together, document checks before a visit, and a dashboard that shows how your whole business is doing.
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className={WRAP}>
          <h2 className="font-title text-3xl font-bold sm:text-4xl">How it works</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#291E29] text-sm font-bold text-[#FFF6E9]">{i + 1}</span>
                <h3 className="mt-4 font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#291E29]/75">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#291E29] py-20 text-[#FFF6E9]">
        <div className={WRAP}>
          <h2 className="font-title text-3xl font-bold sm:text-4xl">Start free. Pay when it earns its place.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col rounded-2xl p-6 ${p.featured ? 'bg-[#FFF6E9] text-[#291E29]' : 'border border-white/15 bg-white/5'}`}
              >
                <h3 className="font-bold">{p.name}</h3>
                <p className="mt-3 font-title text-3xl font-bold">{p.price}</p>
                <p className={`mt-1 text-sm ${p.featured ? 'text-[#291E29]/60' : 'text-[#FFF6E9]/60'}`}>{p.note}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {p.items.map((t) => (
                    <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0" />{t}</li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`mt-6 ${p.featured ? PRIMARY : `${BTN} border border-white/30 hover:bg-white/10`}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#FFF6E9]/60">A card is needed to start the Growth trial. Prices are in naira.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="font-title text-3xl font-bold sm:text-4xl">Questions, answered</h2>
          <div className="mt-10 divide-y divide-[#291E29]/15 border-y border-[#291E29]/15">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                  {q}
                  <span className="ml-4 text-xl transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-[#291E29]/75">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-[#52215A] py-20 text-center text-[#FFF6E9]">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="font-title text-3xl font-bold sm:text-4xl">Your business can do more. Make it happen with Luna.</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={SIGN_UP} className={PRIMARY}>Claim your free page <ArrowRight size={16} /></Link>
            <a href={WAITLIST} className={`${BTN} border border-white/30 hover:bg-white/10`}>Join the waitlist</a>
          </div>
        </div>
      </section>

      <footer className="bg-[#291E29] py-12 text-sm text-[#FFF6E9]/70">
        <div className={`${WRAP} flex flex-col gap-8 md:flex-row md:justify-between`}>
          <div>
            <LunaLogo size={32} variant="light" showTagline />
            <p className="mt-4 max-w-xs">Customer service for the digital economy.</p>
          </div>
          <div className="flex gap-12">
            <ul className="space-y-2">
              <li><a href="#product" className="hover:text-white">Product</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            </ul>
            <ul className="space-y-2">
              <li><Link href={SIGN_UP} className="hover:text-white">Claim your free page</Link></li>
              <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
              <li><a href={WAITLIST} className="hover:text-white">Join the waitlist</a></li>
            </ul>
          </div>
        </div>
        <p className={`${WRAP} mt-10 text-xs text-[#FFF6E9]/50`}>© 2026 Luna. Beyond the Expected. withluna.tech</p>
      </footer>
    </div>
  );
}
