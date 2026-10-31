'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { createTenant } from '../../../lib/tenant';
import { LunaLogo } from '../../../components/shared/LumaMark';
import { ArrowLeft, ArrowRight, Building2, Check, ChevronRight, Globe2, ImagePlus, Lock, Mail, MapPin, Palette, Phone, Sparkles, Store, User, X } from 'lucide-react';
import { TenantIndustry } from '../../../types/tenant';

type BusinessScale = 'sme' | 'enterprise';

const industries: { value: TenantIndustry; label: string; icon: string }[] = [
  { value: 'salon_beauty', label: 'Salon, beauty or spa', icon: '✦' },
  { value: 'auto_repair', label: 'Auto repair or garage', icon: '◈' },
  { value: 'cafe_bakery', label: 'Cafe, bakery or restaurant', icon: '●' },
  { value: 'boutique_clinic', label: 'Private clinic or practice', icon: '✚' },
  { value: 'retail', label: 'Retail or boutique', icon: '◇' },
  { value: 'professional', label: 'Professional services', icon: '□' },
  { value: 'banking', label: 'Banking or finance', icon: '▣' },
  { value: 'healthcare', label: 'Hospital or healthcare', icon: '✚' },
  { value: 'telecom', label: 'Telecom or technology', icon: '◌' },
  { value: 'education', label: 'Education', icon: '▤' },
  { value: 'government', label: 'Government or civic service', icon: '⌂' },
  { value: 'other', label: 'Other business', icon: '○' },
];

const palettes = [
  { name: 'Luna plum', primary: '#291E29', accent: '#FFA800', background: '#FFF6E9' },
  { name: 'Royal blue', primary: '#164E9B', accent: '#38BDF8', background: '#F0F7FF' },
  { name: 'Forest', primary: '#14532D', accent: '#84CC16', background: '#F7FEE7' },
  { name: 'Rose', primary: '#831843', accent: '#FB7185', background: '#FFF1F2' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [businessScale, setBusinessScale] = useState<BusinessScale>('sme');
  const [industry, setIndustry] = useState<TenantIndustry>('salon_beauty');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [palette, setPalette] = useState(palettes[0]);
  const [loading, setLoading] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const { login } = useAuth();
  const router = useRouter();
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'luna.com';
  const initials = orgName.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase() || 'YN';
  const deriveSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const updateOrgName = (value: string) => {
    setOrgName(value);
    setSlug((current) => (!current || current === deriveSlug(orgName) ? deriveSlug(value) : current));
  };

  const uploadLogo = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const validForStep = (targetStep: number) => targetStep === 1
    ? Boolean(name.trim() && email.trim() && phone.trim() && password.length >= 6)
    : targetStep === 2 ? Boolean(orgName.trim() && slug.trim() && city.trim()) : true;

  const details = () => {
    const defaults: Partial<Record<TenantIndustry, { unit: string; title: string; cta: string }>> = {
      salon_beauty: { unit: 'Styling Chair', title: 'Lead Stylist', cta: 'Reserve a Chair' },
      auto_repair: { unit: 'Service Bay', title: 'Bay Lead', cta: 'Book a Service Bay' },
      cafe_bakery: { unit: 'Pickup Counter', title: 'Barista', cta: 'Reserve Pickup' },
      boutique_clinic: { unit: 'Consultation Suite', title: 'Specialist', cta: 'Book a Consultation' },
      banking: { unit: 'Teller Window', title: 'Bank Officer', cta: 'Get a Priority Ticket' },
    };
    return defaults[industry] || { unit: businessScale === 'sme' ? 'Service Station' : 'Counter Window', title: 'Service Officer', cta: 'Book a Timed Ticket' };
  };

  const createWorkspace = async () => {
    setLoading(true);
    const config = details();
    const cleanSlug = slug || deriveSlug(orgName) || 'new-business';
    const resolvedTagline = tagline.trim() || `A better way to visit ${orgName}`;
    const tenant = await createTenant({
      name: orgName.trim(), slug: cleanSlug, city: city.trim(), area: city.trim(), industry, businessScale,
      ownerName: name.trim(), ownerEmail: email.trim(), ownerPhone: phone.trim(), tagline: resolvedTagline,
      description: `${resolvedTagline}. Book ahead and keep every visit moving.`,
      branding: {
        logoUrl: logoUrl || undefined, primaryColor: palette.primary, secondaryColor: palette.primary,
        accentColor: palette.accent, backgroundColor: palette.background, textColor: '#291E29', fontFamily: 'Sora',
        heroTitle: `Welcome to ${orgName.trim()}`, heroSubtitle: resolvedTagline,
        announcementTicker: `${orgName.trim()} is now welcoming guests`, ctaButtonText: config.cta,
        contactEmail: email.trim(), contactPhone: phone.trim(), businessScale,
        serviceUnitName: config.unit, staffTitle: config.title,
        templateLayout: businessScale === 'sme' ? 'sme_boutique' : 'enterprise_institutional',
      },
    });
    await login(email.trim(), phone.trim(), 'tenant_admin', tenant.id, name.trim(),
      ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'manage_branches', 'view_analytics', 'social_studio'],
      'Business Owner', palette.primary, password);
    router.push(`/tenant/${tenant.slug}/staff/ops-console`);
  };

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-8 font-sans text-[#291E29] sm:p-8">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#291E29]/10 bg-white shadow-[0_32px_80px_rgba(41,30,41,0.14)] lg:grid lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative overflow-hidden bg-[#291E29] px-7 py-8 text-white sm:px-10 lg:flex lg:min-h-[760px] lg:flex-col lg:p-11">
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative"><LunaLogo size={42} variant="light" showTagline /></div>
          <div className="relative mt-12 hidden lg:block">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FFC453]">Business setup</p>
            <h1 className="mt-4 max-w-sm text-4xl font-black leading-[1.06] tracking-tight">Your business, ready to welcome people.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">Create a polished customer portal and an operations workspace that feels like your brand from day one.</p>
          </div>
          <div className="relative mt-8 grid grid-cols-3 gap-2 lg:mt-auto lg:block lg:space-y-5">
            {['Owner details', 'Business setup', 'Brand your portal'].map((label, index) => {
              const number = index + 1; const active = step === number; const complete = step > number;
              return <div key={label} className="flex items-center gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${active ? 'bg-[#FFA800] text-[#291E29]' : complete ? 'bg-white/15 text-[#FFC453]' : 'border border-white/20 text-white/45'}`}>{complete ? <Check className="h-3.5 w-3.5" /> : number}</span><span className={`hidden text-xs font-bold lg:block ${active ? 'text-white' : 'text-white/45'}`}>{label}</span></div>;
            })}
          </div>
        </aside>

        <section className="p-6 sm:p-9 lg:p-11">
          <div className="mx-auto max-w-xl">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8a7190]">Step {step} of 3</p><h2 className="mt-2 text-3xl font-black tracking-tight">{step === 1 ? 'Let’s meet the owner.' : step === 2 ? 'Set up your business.' : 'Make it feel like yours.'}</h2><p className="mt-1.5 text-sm text-slate-500">{step === 1 ? 'Your secure sign-in and account contact details.' : step === 2 ? 'These details power your public booking portal.' : 'You can refine every detail later in Branding & Settings.'}</p></div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3e8fa] text-[#702D7B]"><Sparkles className="h-4 w-4" /></div>
            </div>
            <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-[#f1edf2]"><div className="h-full rounded-full bg-[#702D7B] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} /></div>

            {step === 1 && <div className="space-y-5">
              <Field label="Your name" icon={<User className="h-4 w-4" />}><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kemi Adebayo" className="input" /></Field>
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Work email" icon={<Mail className="h-4 w-4" />}><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className="input" /></Field><Field label="Phone number" icon={<Phone className="h-4 w-4" />}><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className="input" /></Field></div>
              <Field label="Create a password" hint="At least 6 characters" icon={<Lock className="h-4 w-4" />}><input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input" /></Field>
            </div>}

            {step === 2 && <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">{(['sme', 'enterprise'] as BusinessScale[]).map((scale) => <button key={scale} type="button" onClick={() => setBusinessScale(scale)} className={`rounded-2xl border p-4 text-left transition ${businessScale === scale ? 'border-[#702D7B] bg-[#fcf8fe] ring-2 ring-[#702D7B]/10' : 'border-[#e7e2e8] hover:border-[#bba9bf]'}`}><span className="text-lg">{scale === 'sme' ? '🏪' : '🏛️'}</span><span className="mt-2 block text-xs font-extrabold">{scale === 'sme' ? 'Small business' : 'Enterprise'}</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">{scale === 'sme' ? 'Single or local locations' : 'Multi-branch operations'}</span></button>)}</div>
              <Field label="Business name" icon={<Building2 className="h-4 w-4" />}><input required value={orgName} onChange={(e) => updateOrgName(e.target.value)} placeholder="e.g. Kemi’s Hair Lounge" className="input" /></Field>
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Business type" icon={<Store className="h-4 w-4" />}><select value={industry} onChange={(e) => setIndustry(e.target.value as TenantIndustry)} className="input appearance-none">{industries.map((item) => <option key={item.value} value={item.value}>{item.icon} {item.label}</option>)}</select></Field><Field label="City" icon={<MapPin className="h-4 w-4" />}><input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lagos" className="input" /></Field></div>
              <Field label="Your Luna web address" hint="You can change it later" icon={<Globe2 className="h-4 w-4" />}><div className="flex overflow-hidden rounded-xl border border-[#ded8e0] bg-[#fcfbfc] focus-within:border-[#702D7B] focus-within:ring-4 focus-within:ring-[#702D7B]/10"><span className="flex items-center border-r border-[#e8e2e9] px-3 text-[11px] font-bold text-slate-400">https://</span><input required value={slug} onChange={(e) => setSlug(deriveSlug(e.target.value))} placeholder="my-business" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-xs font-bold outline-none" /><span className="flex items-center border-l border-[#e8e2e9] px-3 text-[11px] font-bold text-[#702D7B]">.{platformDomain}</span></div></Field>
              <p className="rounded-xl bg-[#f5f2f6] px-3 py-2.5 text-[11px] text-[#715d75]">Your customer portal will be live at <strong className="font-mono text-[#291E29]">{slug || 'your-business'}.{platformDomain}</strong></p>
            </div>}

            {step === 3 && <div className="space-y-6">
              <div><div className="mb-2 flex items-baseline justify-between"><label className="text-xs font-extrabold">Business logo</label><span className="text-[10px] text-slate-400">PNG, JPG or WebP</span></div><input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} /><div className="flex items-center gap-4 rounded-2xl border border-dashed border-[#cbb9d2] bg-[#fcf9fe] p-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm" style={{ color: palette.primary }}>{logoUrl ? <img src={logoUrl} alt="Logo preview" className="h-full w-full object-contain p-1.5" /> : <span className="text-lg font-black">{initials}</span>}</div><div className="min-w-0 flex-1"><p className="text-xs font-extrabold">{logoUrl ? 'Your logo is ready' : 'Add your logo'}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">It will appear in your customer portal and staff dashboard.</p></div><button type="button" onClick={() => logoInput.current?.click()} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#291E29] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#4a264e]"><ImagePlus className="h-3.5 w-3.5" /> {logoUrl ? 'Replace' : 'Upload'}</button>{logoUrl && <button type="button" aria-label="Remove logo" onClick={() => setLogoUrl('')} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-[#702D7B]"><X className="h-4 w-4" /></button>}</div></div>
              <div><div className="mb-3 flex items-center gap-2"><Palette className="h-4 w-4 text-[#702D7B]" /><label className="text-xs font-extrabold">Choose a starting palette</label></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{palettes.map((option) => <button key={option.name} type="button" onClick={() => setPalette(option)} className={`rounded-xl border p-2 text-left transition ${palette.name === option.name ? 'border-[#702D7B] ring-2 ring-[#702D7B]/15' : 'border-[#e7e2e8] hover:border-[#bba9bf]'}`}><span className="mb-2 flex h-7 overflow-hidden rounded-lg">{[option.primary, option.accent, option.background].map((color) => <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />)}</span><span className="block truncate text-[10px] font-bold">{option.name}</span></button>)}</div></div>
              <Field label="A short welcome message" hint="Optional" icon={<Sparkles className="h-4 w-4" />}><input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder={`e.g. A better way to visit ${orgName || 'your business'}`} className="input" /></Field>
              <div className="overflow-hidden rounded-2xl border border-[#e7e2e8] bg-white shadow-sm"><div className="flex items-center justify-between px-4 py-2.5 text-[10px] font-bold" style={{ backgroundColor: palette.primary, color: '#fff' }}><span className="flex items-center gap-2">{logoUrl ? <img src={logoUrl} alt="" className="h-4 w-4 rounded object-contain" /> : <span className="flex h-4 w-4 items-center justify-center rounded bg-white/15 text-[8px]">{initials}</span>}{orgName || 'Your business'}</span><span className="opacity-60">Customer portal</span></div><div className="p-5" style={{ backgroundColor: palette.background }}><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: palette.accent }}>Welcome</p><p className="mt-2 text-lg font-black" style={{ color: palette.primary }}>{tagline || `A better way to visit ${orgName || 'your business'}`}</p><button type="button" className="mt-4 rounded-lg px-3 py-2 text-[10px] font-bold text-white" style={{ backgroundColor: palette.primary }}>Book a timed visit</button></div></div>
            </div>}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#eeeaf0] pt-5">
              {step > 1 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-[#f5f2f6] hover:text-[#291E29]"><ArrowLeft className="h-4 w-4" /> Back</button> : <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-[#702D7B]">Already registered?</Link>}
              {step < 3 ? <button type="button" onClick={() => validForStep(step) && setStep((current) => current + 1)} disabled={!validForStep(step)} className="ml-auto flex min-h-[46px] items-center gap-2 rounded-xl bg-[#291E29] px-5 text-xs font-extrabold text-white shadow-lg shadow-[#291E29]/15 transition hover:bg-[#4a264e] disabled:cursor-not-allowed disabled:opacity-40">Continue <ArrowRight className="h-4 w-4 text-[#FFC453]" /></button> : <button type="button" onClick={createWorkspace} disabled={loading} className="ml-auto flex min-h-[46px] items-center gap-2 rounded-xl bg-[#FFA800] px-5 text-xs font-extrabold text-[#291E29] shadow-lg shadow-[#FFA800]/20 transition hover:bg-[#ffb51d] disabled:opacity-50">{loading ? 'Creating workspace…' : 'Create my workspace'} <ChevronRight className="h-4 w-4" /></button>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, icon, hint, children }: { label: string; icon: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return <div><div className="mb-1.5 flex items-baseline justify-between"><label className="text-xs font-extrabold">{label}</label>{hint && <span className="text-[10px] text-slate-400">{hint}</span>}</div><div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#9b88a0]">{icon}</span>{children}</div></div>;
}
