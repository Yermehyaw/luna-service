import React from 'react';
import { Check } from 'lucide-react';
import { Nav, Footer, CtaBand, Reveal, WRAP } from '@/components/marketing/Chrome';

const BOOKING = ['Your own address, yourbusiness.withluna.tech', 'Customers choose a service and a time', 'Secure online payment when they book', 'A live ticket they can follow and share on any platform', 'Your colours and logo on every page', 'A customer list that grows with every booking'];
const SOCIAL = ['Content ideas written for your kind of business', 'A post calendar that reminds you when to publish', 'One inbox for all your connected accounts', 'Suggested replies that you review and send', 'Analytics on what your audience responds to'];
const PLATFORMS = ['Facebook Pages', 'Instagram', 'Threads', 'X', 'TikTok', 'LinkedIn', 'WhatsApp'];

const List = ({ items }: { items: string[] }) => (
  <ul className="mt-6 space-y-3">{items.map((t) => <li key={t} className="flex gap-3"><Check size={18} className="mt-1 shrink-0" />{t}</li>)}</ul>
);

export default function Product() {
  return (
    <div className="min-h-screen bg-[#FFF6E9] font-primary text-[#291E29] antialiased">
      <Nav />
      <section className={`${WRAP} pb-10 pt-16`}>
        <Reveal><h1 className="max-w-3xl font-title text-4xl font-bold sm:text-6xl">One free page. One place for your posts and messages.</h1>
        <p className="mt-5 max-w-xl text-lg text-[#291E29]/75">Luna starts with booking, queues and Social Studio, with more tools coming.</p></Reveal>
      </section>

      <section id="booking" className={`${WRAP} grid items-center gap-12 py-16 lg:grid-cols-2`}>
        <Reveal>
          <h2 className="font-title text-3xl font-bold sm:text-4xl">Your booking page</h2>
          <p className="mt-3 text-[#291E29]/75">A page of your own that customers can open from any link, in your colours.</p>
          <List items={BOOKING} />
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-[#291E29]/10">
            <p className="text-xs text-[#291E29]/50">Example booking page</p>
            {['Braids · Saturday 10:30', 'Manicure · Saturday 12:00', 'Wash and style · Saturday 14:00'].map((s, i) => (
              <div key={s} className={`mt-3 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${i === 0 ? 'bg-[#FFE5B3]' : 'bg-[#291E29]/5'}`}>{s}{i === 0 && <Check size={16} />}</div>
            ))}
            <div className="mt-4 rounded-full bg-[#FFA800] py-3 text-center text-sm font-bold">Pay securely and get your ticket</div>
          </div>
        </Reveal>
      </section>

      <section id="social" className="bg-[#291E29] py-20 text-[#FFF6E9]">
        <div className={`${WRAP} grid items-center gap-12 lg:grid-cols-2`}>
          <Reveal delay={120}>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6">
              <p className="text-xs text-[#FFF6E9]/50">Post calendar, example</p>
              {['Monday · Behind the scenes at the salon', 'Wednesday · Before and after: box braids', 'Friday · Booking slots open for the weekend'].map((s) => (
                <div key={s} className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm">{s}<span className="ml-2 text-xs text-[#FFF6E9]/50">reminder on your phone</span></div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <h2 className="font-title text-3xl font-bold sm:text-4xl">Social Studio</h2>
            <p className="mt-3 text-[#FFF6E9]/75">Plan your posts and keep up with the people who message you.</p>
            <List items={SOCIAL} />
            <p className="mt-5 text-sm text-[#FFF6E9]/60">Luna reminds you when a post is due and hands it to your phone, so you publish it in the app. The inbox is part of Growth, with a 7-day free trial.</p>
          </Reveal>
        </div>
      </section>

      <section className={`${WRAP} py-16`}>
        <Reveal>
          <h2 className="font-title text-3xl font-bold">Connect the accounts your customers already use</h2>
          <div className="mt-6 flex flex-wrap gap-3">{PLATFORMS.map((p) => <span key={p} className="rounded-full bg-white px-5 py-2 text-sm font-semibold">{p}</span>)}</div>
          <p className="mt-4 text-sm text-[#291E29]/60">What each connection allows depends on that platform’s rules. We are onboarding businesses in small groups at first.</p>
          <div className="mt-10 rounded-2xl border border-dashed border-[#291E29]/30 px-6 py-5 text-sm"><span className="font-bold">Coming next: </span>tools for branches to work together, document checks before a visit, and a dashboard that shows how your whole business is doing.</div>
        </Reveal>
      </section>
      <CtaBand />
      <Footer />
    </div>
  );
}
