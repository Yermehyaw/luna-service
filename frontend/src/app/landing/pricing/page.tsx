import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Nav, Footer, CtaBand, Reveal, PRIMARY, SIGN_UP, WAITLIST, WRAP } from '@/components/marketing/Chrome';

const PLANS = [
  { name: 'Free', price: '₦0', note: 'for as long as you like', items: ['Your page at yourbusiness.withluna.tech', 'Online booking and live queue tickets', 'Ticket sharing on any platform', 'Content ideas and a post calendar with reminders', 'Analytics on your social accounts'], cta: 'Claim your free page', href: SIGN_UP, hot: false },
  { name: 'Growth', price: '₦22,000', note: 'a month, VAT and card fees included', items: ['Everything in Free', 'Social Studio inbox for all your connected accounts', 'Suggested replies you review before sending', 'Reply and AI credits, with top-ups when you need more', '7-day free trial'], cta: 'Start your free trial', href: SIGN_UP, hot: true },
  { name: 'Pro', price: 'Coming soon', note: 'for businesses with several branches', items: ['Everything in Growth', 'Tools for branches to work together'], cta: 'Join the waitlist', href: WAITLIST, hot: false },
  { name: 'Enterprise', price: 'Talk to us', note: 'for large organisations', items: ['Set up around how you already work', 'Direct support from our team'], cta: 'Get in touch', href: WAITLIST, hot: false },
];
const FAQ = [
  ['Is Luna really free?', 'Yes. Your booking and queue page, ticket sharing, content ideas, post calendar with reminders and analytics are free. Growth adds the Social Studio inbox, suggested replies and reply credits, with a 7-day free trial.'],
  ['Does Luna post for me?', 'Luna drafts ideas and reminds you when a post is due, then hands it to your phone so you publish it in the app. Replies are suggested for you to review. Nothing is sent without you.'],
  ['What do I need to start the Growth trial?', 'A card. You are not charged during the 7 days. At the end of the trial the plan bills ₦22,000 a month.'],
  ['Who owns my customer list?', 'You do. Every booking adds the customer’s details and visits to your list. Luna is built to follow the Nigeria Data Protection Act 2023.'],
  ['Can I use Luna for more than one branch?', 'Tools for multi-branch teams are coming next. Join the waitlist and tell us how many branches you run.'],
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#FFF6E9] font-primary text-[#291E29] antialiased">
      <Nav />
      <section className={`${WRAP} pb-6 pt-16`}>
        <Reveal><h1 className="max-w-3xl font-title text-4xl font-bold sm:text-6xl">Start free. Pay when it earns its place.</h1></Reveal>
      </section>
      <section className={`${WRAP} py-10`}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 90}>
              <div className={`flex h-full flex-col rounded-3xl p-7 transition duration-300 hover:-translate-y-2 ${p.hot ? 'bg-[#291E29] text-[#FFF6E9] shadow-2xl' : 'bg-white'}`}>
                <h2 className="font-bold">{p.name}</h2>
                <p className="mt-3 font-title text-3xl font-bold">{p.price}</p>
                <p className="mt-1 text-sm opacity-60">{p.note}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">{p.items.map((t) => <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0" />{t}</li>)}</ul>
                <Link href={p.href} className={`mt-6 ${p.hot ? PRIMARY : 'inline-flex justify-center rounded-full border border-[#291E29]/25 px-6 py-3 text-sm font-bold hover:bg-[#291E29]/5'}`}>{p.cta}</Link>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-[#291E29]/60">A card is needed to start the Growth trial. Prices are in naira.</p>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-16">
        <Reveal>
          <h2 className="font-title text-3xl font-bold sm:text-4xl">Questions, answered</h2>
          <div className="mt-8 divide-y divide-[#291E29]/15 border-y border-[#291E29]/15">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold">{q}<span className="ml-4 text-xl transition group-open:rotate-45">+</span></summary>
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
