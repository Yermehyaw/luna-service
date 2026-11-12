'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Nav, Footer, CtaBand, Reveal, PRIMARY, SIGN_UP, WRAP } from '@/components/Chrome';
import { useAuth } from '@/lib/auth';

const FOR = ['Salons and barbers', 'Caterers', 'Tutors and training centres', 'Photographers', 'Event planners', 'Clinics', 'Fitness studios'];
const OUTCOMES = [
  ['Be seen, week after week', 'Social Studio suggests post ideas, keeps a calendar and reminds you when a post is due, so your business stays visible without a full-time social media manager.', 'bg-[#FFE5B3]'],
  ['Be booked and paid', 'Customers choose a service, pick a time and pay securely on your page. They receive a ticket they can share and follow.', 'bg-[#D8AAE0]/60'],
  ['Keep your customers', 'Every booking adds to a customer list that belongs to you, with each person’s visits and payments beside their name.', 'bg-[#FBF6A3]'],
];
const STEPS = ['Claim your page', 'Share your link', 'Customers book and pay', 'Stay visible'];

export default function Home() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
  return (
    <div className="min-h-screen bg-[#FFF6E9] font-primary text-[#291E29] antialiased">
      <Nav />

      <section className="px-3 pt-3 sm:px-5">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#291E29] via-[#341539] to-[#52215A] px-6 py-16 text-[#FFF6E9] sm:px-12 lg:py-24">
          <div className="lu-drift pointer-events-none absolute -left-24 top-8 h-80 w-80 rounded-full bg-[#BA68D7]/40 blur-3xl" />
          <div className="lu-drift pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-[#FFA800]/25 blur-3xl" style={{ animationDelay: '-7s' }} />
          <div className="relative grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="font-title text-4xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">Get booked, stay visible and answer customers faster.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#FFF6E9]/80">
                Luna gives your business a free page where customers book, pay and follow their place in the queue. Social Studio helps you plan posts and handle customer messages from one place.
              </p>
              {user ? (
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={
                      user.role === 'customer'
                        ? `/tenant/${user.tenantId || 'kemis-lounge'}/track`
                        : `/tenant/${user.tenantId || 'kemis-lounge'}/staff/ops-console`
                    }
                    className={PRIMARY}
                  >
                    Go to your Dashboard <ArrowRight size={16} />
                  </Link>
                  <Link
                    href={`/tenant/${user.tenantId || 'kemis-lounge'}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition"
                  >
                    <span>View Storefront Portal</span>
                  </Link>
                </div>
              ) : (
                <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
                  <div className="flex flex-1 items-center rounded-full bg-white pl-5 pr-3 text-sm text-[#291E29]">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="yourbusiness" aria-label="Your business name" className="min-w-0 flex-1 bg-transparent py-3 font-semibold outline-none placeholder:font-normal" />
                    <span className="text-[#291E29]/50">.withluna.tech</span>
                  </div>
                  <Link href={`${SIGN_UP}?subdomain=${encodeURIComponent(slug || 'mybusiness')}`} className={PRIMARY}>Claim your free page <ArrowRight size={16} /></Link>
                </div>
              )}
              <p className="mt-4 text-sm text-[#FFF6E9]/60">Free to start. Built in Nigeria, and now onboarding our first businesses in Benin City.</p>
              <Link href="/tenant/kemis-lounge" className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">See an example booking page <ArrowRight size={14} /></Link>
            </div>
            <div className="relative mx-auto h-[26rem] w-full max-w-sm" aria-label="Illustration of a booking ticket and a suggested reply">
              <div className="lu-float absolute left-0 top-0 w-[92%] rounded-3xl bg-white p-6 text-[#291E29] shadow-2xl" style={{ ['--r' as string]: '-3deg' }}>
                <p className="text-xs text-[#291E29]/50">Kemi’s Hair &amp; Beauty Lounge</p>
                <p className="mt-1 font-title text-xl font-bold">Braids, Saturday at 10:30</p>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#FFE5B3]/70 px-4 py-3">
                  <div><p className="text-xs text-[#291E29]/60">Your ticket</p><p className="text-lg font-bold">B-014</p></div>
                  <p className="text-sm font-semibold">You are 3rd in line</p>
                </div>
              </div>
              <div className="lu-float absolute bottom-0 right-0 w-[92%] rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md" style={{ ['--r' as string]: '2.5deg', animationDelay: '-3s' }}>
                <p className="text-xs text-[#FFF6E9]/60">Message from a customer</p>
                <p className="mt-1 text-sm">“Do you have a slot on Saturday morning?”</p>
                <div className="mt-3 rounded-2xl bg-white/10 p-3 text-sm"><p className="text-xs text-[#FFF6E9]/60">Suggested reply</p><p className="mt-1">Yes, we have 10:30 and 11:30. Book here: kemis-lounge.withluna.tech</p></div>
                <p className="mt-3 text-xs text-[#FFF6E9]/60">You review every reply before it is sent.</p>
              </div>
              <span className="lu-float absolute right-2 top-24 rounded-full bg-[#FFE5B3] px-4 py-2 text-xs font-bold text-[#291E29] shadow-lg" style={{ animationDelay: '-1.5s' }}><Check size={13} className="mr-1 inline" />Paid securely</span>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden py-8" aria-label="Businesses Luna is made for">
        <div className="lu-marquee gap-3 text-sm font-semibold">
          {[...FOR, ...FOR].map((f, i) => <span key={i} className="mr-3 whitespace-nowrap rounded-full border border-[#291E29]/15 bg-white px-5 py-2">{f}</span>)}
        </div>
      </div>

      <section className="py-16">
        <div className={WRAP}>
          <Reveal><h2 className="max-w-2xl font-title text-3xl font-bold sm:text-5xl">Three jobs Luna takes off your hands.</h2></Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {OUTCOMES.map(([t, b, c], i) => (
              <Reveal key={t} delay={i * 120}>
                <div className={`h-full rounded-3xl ${c} p-8 transition duration-300 hover:-translate-y-2 hover:rotate-[-1deg] hover:shadow-xl`}>
                  <h3 className="font-title text-2xl font-bold">{t}</h3>
                  <p className="mt-4 leading-relaxed text-[#291E29]/80">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className={`${WRAP} grid gap-5 lg:grid-cols-2`}>
          <Reveal>
            <Link href="/product#booking" className="group block h-full rounded-3xl bg-white p-10 transition hover:shadow-2xl">
              <h3 className="font-title text-3xl font-bold">Your booking page</h3>
              <p className="mt-3 text-[#291E29]/75">Your own address, your colours, secure payment and a live ticket customers can follow and share.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold">Explore the booking page <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/product#social" className="group block h-full rounded-3xl bg-[#291E29] p-10 text-[#FFF6E9] transition hover:shadow-2xl">
              <h3 className="font-title text-3xl font-bold">Social Studio</h3>
              <p className="mt-3 text-[#FFF6E9]/75">Content ideas, a post calendar with reminders, and one inbox for your customers’ messages.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold">Explore Social Studio <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className={WRAP}>
          <Reveal>
            <div className="flex flex-col gap-8 rounded-3xl border border-[#291E29]/15 p-8 md:flex-row md:items-center md:justify-between">
              <ol className="flex flex-1 flex-wrap gap-x-8 gap-y-4">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#291E29] text-sm text-[#FFF6E9]">{i + 1}</span>{s}</li>
                ))}
              </ol>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 font-bold underline underline-offset-4">See how it works <ArrowRight size={16} /></Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-8"><p className="font-bold">Free</p><p className="mt-2 font-title text-4xl font-bold">₦0</p><p className="mt-2 text-[#291E29]/70">Booking page, queue tickets, content ideas and a post calendar.</p></div>
              <div className="rounded-3xl bg-[#FFE5B3] p-8"><p className="font-bold">Growth</p><p className="mt-2 font-title text-4xl font-bold">₦22,000 <span className="text-base font-normal">a month</span></p><p className="mt-2 text-[#291E29]/70">Adds the Social Studio inbox and suggested replies, with a 7-day free trial.</p></div>
            </div>
            <Link href="/pricing" className="mt-5 inline-flex items-center gap-2 font-bold underline underline-offset-4">Compare all plans <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      <CtaBand />
      <Footer />
    </div>
  );
}
