'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { updateTenant } from '../../../../../lib/tenant';
import { useAuth } from '../../../../../lib/auth';
import { getTenantStaff } from '../../../../../mock/staff';
import { StaffPrivilegesManager } from '../../../../../features/tenant-staff/StaffPrivilegesManager';
import { FREE_THEME_PRESETS, ThemePreset } from '../../../../../features/tenant-branding/themes';
import {
  Globe,
  Palette,
  Check,
  Copy,
  ExternalLink,
  Save,
  Eye,
  Smartphone,
  Monitor,
  CheckCircle2,
  Radio,
  Ticket,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Trash2,
  Store,
  Building2,
  Sparkles,
  Lock,
  Users,
} from 'lucide-react';

export default function TenantBrandingSettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const { tenant, setTenant } = useTenant();
  const { user, loginAsStaffMember } = useAuth();
  const [activeTab, setActiveTab] = useState<'branding' | 'team_privileges'>('branding');

  // Subdomain & Basic Info
  const [subdomain, setSubdomain] = useState(tenant?.slug || resolvedParams.tenantId || '');
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Logo & Active Customization State
  const [logoUrl, setLogoUrl] = useState(tenant?.branding?.logoUrl || '');
  const [templateLayout, setTemplateLayout] = useState<'sme_boutique' | 'enterprise_institutional'>(
    tenant?.branding?.templateLayout || (tenant?.businessScale === 'sme' ? 'sme_boutique' : 'enterprise_institutional')
  );
  const [primaryColor, setPrimaryColor] = useState(tenant?.branding?.primaryColor || '#291E29');
  const [secondaryColor, setSecondaryColor] = useState(tenant?.branding?.secondaryColor || '#341539');
  const [accentColor, setAccentColor] = useState(tenant?.branding?.accentColor || '#FFA800');
  const [backgroundColor, setBackgroundColor] = useState(tenant?.branding?.backgroundColor || '#FFF6E9');
  const [textColor, setTextColor] = useState(tenant?.branding?.textColor || '#291E29');
  const [heroTitle, setHeroTitle] = useState(tenant?.branding?.heroTitle || `Welcome to ${tenant?.name || 'Our Portal'}`);
  const [heroSubtitle, setHeroSubtitle] = useState(
    tenant?.branding?.heroSubtitle || 'Reserve a 30-minute arrival window or pre-clear your documents online.'
  );
  const [announcementTicker, setAnnouncementTicker] = useState(
    tenant?.branding?.announcementTicker || 'Live Queue System Operating · Zero Walk-in Waiting'
  );
  const [ctaButtonText, setCtaButtonText] = useState(tenant?.branding?.ctaButtonText || 'Book a Timed Ticket');
  const [activeThemeId, setActiveThemeId] = useState<string>('luna-classic');

  // Preview Mode: desktop vs mobile
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update form fields when tenant loads
  useEffect(() => {
    if (tenant) {
      setSubdomain(tenant.slug);
      setLogoUrl(tenant.branding?.logoUrl || '');
      setTemplateLayout(
        tenant.branding?.templateLayout || (tenant.businessScale === 'sme' ? 'sme_boutique' : 'enterprise_institutional')
      );
      setPrimaryColor(tenant.branding?.primaryColor || '#291E29');
      setSecondaryColor(tenant.branding?.secondaryColor || '#341539');
      setAccentColor(tenant.branding?.accentColor || '#FFA800');
      setBackgroundColor(tenant.branding?.backgroundColor || '#FFF6E9');
      setTextColor(tenant.branding?.textColor || '#291E29');
      setHeroTitle(tenant.branding?.heroTitle || `Welcome to ${tenant.name}`);
      setHeroSubtitle(
        tenant.branding?.heroSubtitle ||
          'Reserve a 30-minute arrival window or pre-clear your documents online.'
      );
      setAnnouncementTicker(
        tenant.branding?.announcementTicker || 'Live Queue System Operating · Zero Walk-in Waiting'
      );
      setCtaButtonText(tenant.branding?.ctaButtonText || 'Book a Timed Ticket');
    }
  }, [tenant]);

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'luna.com';
  const fullSubdomainUrl = `https://${subdomain}.${platformDomain}`;

  const handleCopyDomain = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(fullSubdomainUrl);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply one of the 8 Free Theme Presets
  const handleApplyPreset = (theme: ThemePreset) => {
    setActiveThemeId(theme.id);
    setPrimaryColor(theme.primaryColor);
    setSecondaryColor(theme.secondaryColor);
    setAccentColor(theme.accentColor);
    setBackgroundColor(theme.backgroundColor);
    setTextColor(theme.textColor);
    setHeroTitle(theme.heroTitle);
    setHeroSubtitle(theme.heroSubtitle);
    setAnnouncementTicker(theme.announcementTicker);
    setCtaButtonText(theme.ctaButtonText);
    if (theme.category.includes('SME') || theme.category.includes('Universal')) {
      setTemplateLayout('sme_boutique');
    } else if (theme.category.includes('Enterprise')) {
      setTemplateLayout('enterprise_institutional');
    }
  };

  // Save all changes to repository
  const handleSaveAll = async () => {
    const updated = await updateTenant(tenant.slug, {
      slug: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '') || tenant.slug,
      subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '') || tenant.slug,
      branding: {
        ...tenant.branding,
        logoUrl,
        templateLayout,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        heroTitle,
        heroSubtitle,
        announcementTicker,
        ctaButtonText,
      },
    });

    if (updated) {
      setTenant(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const isOwner = user?.role === 'tenant_admin' || user?.role === 'super_admin';

  if (!isOwner) {
    const tenantStaff = getTenantStaff(tenant?.slug || resolvedParams.tenantId);
    const ownerAccount = tenantStaff.find((s) => s.role === 'tenant_admin') || tenantStaff[0];

    return (
      <TenantStaffLayout>
        <div className="max-w-2xl mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-white border border-amber-300 shadow-xl space-y-6 text-center font-sans">
          <div className="h-16 w-16 rounded-3xl bg-amber-100 border border-amber-200 text-amber-900 mx-auto flex items-center justify-center shadow-xs">
            <Lock className="h-8 w-8 text-amber-800" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Business Admin Protected</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#291E29]">
              Business Admin Authorization Required
            </h1>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Storefront branding, logo uploads, theme styling, and staff privilege management are strictly reserved for the <strong>Business Owner (Business Admin)</strong>.
            </p>
          </div>

          {/* Current User Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-black/10 text-left flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-xs"
              style={{ backgroundColor: user?.avatarColor || '#D97706' }}
            >
              👔
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#291E29] truncate">{user?.name || 'Staff Member'}</p>
              <p className="text-[11px] text-slate-500 truncate">
                Role: <strong>Staff Member</strong> · {user?.designation || 'Staff Specialist'} · {user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {ownerAccount && (
              <button
                type="button"
                onClick={() => loginAsStaffMember(ownerAccount)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFF6E9] text-xs font-extrabold shadow-md flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>👑 Switch to Business Owner ({ownerAccount.name})</span>
              </button>
            )}

            <Link
              href={`/tenant/${tenant?.slug || resolvedParams.tenantId}/staff/ops-console`}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-black/15 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Return to Ops Console</span>
            </Link>
          </div>
        </div>
      </TenantStaffLayout>
    );
  }

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans pb-16 selection:bg-[#FFA800] selection:text-[#291E29]">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#291E29]/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFA800]/20 text-[#291E29] text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                Business Admin Console
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1">
                <Check className="h-3 w-3" /> Free Subdomain Active
              </span>
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[#291E29] mt-1">
              Storefront Branding &amp; Team Management
            </h1>
            <p className="text-xs text-[#291E29]/70">
              Customize website themes, logo &amp; templates, and assign logins &amp; task privileges to your staff members.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/tenant/${tenant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-[#291E29]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#291E29] shadow-sm hover:bg-[#FFF6E9] transition-colors min-h-[44px]"
            >
              <span>Visit Live Portal</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
            </a>

            {activeTab === 'branding' && (
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-2 rounded-xl bg-[#FFA800] px-5 py-2.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-105 min-h-[44px]"
              >
                <Save className="h-4 w-4" />
                <span>Save & Publish</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation: Storefront Branding vs Team Logins & Privileges */}
        <div className="flex items-center gap-2 border-b border-black/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all min-h-[44px] ${
              activeTab === 'branding'
                ? 'bg-[#291E29] text-white shadow-md'
                : 'text-slate-600 hover:bg-black/5 hover:text-[#291E29]'
            }`}
          >
            <Palette className={`h-4 w-4 ${activeTab === 'branding' ? 'text-[#FFA800]' : 'text-slate-400'}`} />
            <span>Storefront Branding &amp; Themes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team_privileges')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all min-h-[44px] ${
              activeTab === 'team_privileges'
                ? 'bg-[#291E29] text-white shadow-md'
                : 'text-slate-600 hover:bg-black/5 hover:text-[#291E29]'
            }`}
          >
            <Users className={`h-4 w-4 ${activeTab === 'team_privileges' ? 'text-[#FFA800]' : 'text-slate-400'}`} />
            <span>Team Logins &amp; Staff Privileges</span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-400/20 text-[#FFA800] border border-amber-400/30">
              Admin Only
            </span>
          </button>
        </div>

        {activeTab === 'team_privileges' ? (
          <StaffPrivilegesManager
            tenantId={tenant?.slug || resolvedParams.tenantId}
            tenantName={tenant?.name || 'Storefront'}
          />
        ) : (
          <>
            {/* Save Notification */}
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Success! All changes to your website and themes have been published live to {fullSubdomainUrl}.</span>
              </div>
            )}

        {/* 1. Free Domain Management Card */}
        <section className="rounded-3xl border border-[#291E29]/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#291E29] text-[#FFA800]">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#291E29]">Your Free Business Subdomain</h3>
                <p className="text-xs text-[#291E29]/65">
                  Included free on all Luna accounts. Automatically provisioned with SSL and DDoS shield.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDomain}
                className="flex items-center gap-1.5 rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/40 px-3 py-2 text-xs font-bold text-[#291E29] hover:bg-[#FFF6E9]"
              >
                {copiedDomain ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedDomain ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="flex flex-1 items-center rounded-xl border border-[#291E29]/15 bg-[#FFF6E9]/30 overflow-hidden">
              <span className="px-3.5 text-xs font-bold text-[#291E29]/60 bg-[#291E29]/5 py-2.5 border-r border-[#291E29]/10">
                https://
              </span>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full bg-transparent px-3 py-2.5 text-xs font-bold font-mono text-[#291E29] focus:outline-none"
                placeholder="victor"
              />
              <span className="px-3.5 text-xs font-extrabold text-[#702D7B] bg-[#291E29]/5 py-2.5 border-l border-[#291E29]/10">
                .{platformDomain}
              </span>
            </div>
            <button
              onClick={handleSaveAll}
              className="rounded-xl bg-[#291E29] px-4 py-2.5 text-xs font-bold text-[#FFF6E9] hover:bg-[#341539] whitespace-nowrap"
            >
              Update Subdomain
            </button>
          </div>
        </section>

        {/* 2. Business Brand Logo Upload for Template */}
        <section className="rounded-3xl border border-[#291E29]/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFA800] text-[#291E29] shadow-sm">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#291E29]">Business Brand Logo Upload</h3>
                <p className="text-xs text-[#291E29]/65">
                  Upload your custom business logo to display across your website template header, hero banner, and digital ticket passes.
                </p>
              </div>
            </div>

            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs font-bold transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Logo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Logo Preview */}
            <div className="rounded-2xl border border-dashed border-[#291E29]/20 bg-[#FFF6E9]/40 p-4 flex flex-col items-center justify-center text-center min-h-[140px]">
              {logoUrl ? (
                <div className="space-y-2 flex flex-col items-center">
                  <img
                    src={logoUrl}
                    alt="Uploaded Logo"
                    className="h-16 w-auto max-w-[180px] object-contain rounded-xl shadow-xs border border-white"
                  />
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Custom Logo Active
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5 flex flex-col items-center">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {tenant?.name?.[0] || 'B'}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Default Letter Mark</span>
                  <span className="text-[10px] text-slate-400">No custom logo uploaded yet</span>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="md:col-span-2 flex flex-col justify-center space-y-3">
              <label
                htmlFor="logo-file-upload"
                className="cursor-pointer rounded-2xl border-2 border-dashed border-[#291E29]/20 hover:border-[#FFA800] bg-white p-5 text-center transition-all hover:bg-[#FFF6E9]/30 flex flex-col items-center justify-center gap-2 group min-h-[140px]"
              >
                <Upload className="h-6 w-6 text-[#702D7B] group-hover:text-[#FFA800] transition-colors" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-[#291E29] block">
                    Click to browse or drag &amp; drop your logo file
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Supports PNG, JPG, SVG, WebP (Transparent PNG recommended, Max 5MB)
                  </span>
                </div>
                <input
                  id="logo-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>

        {/* 3. Storefront Template Layout: SME Boutique vs Enterprise Institutional */}
        <section className="rounded-3xl border border-[#291E29]/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#291E29]/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFA800]/20 text-[#291E29]">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#291E29]">Storefront Layout &amp; Industry Template</h3>
                <p className="text-xs text-[#291E29]/65">
                  Choose between our dedicated <strong>SME Boutique Template</strong> (salons, auto repair, cafes, bakeries, clinics) or <strong>Enterprise Template</strong> (banks, hospitals, telecom).
                </p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              {templateLayout === 'sme_boutique' ? 'SME Boutique Active' : 'Enterprise Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* SME Boutique Card */}
            <div
              onClick={() => setTemplateLayout('sme_boutique')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all shadow-xs space-y-3 ${
                templateLayout === 'sme_boutique'
                  ? 'border-[#FFA800] bg-[#FFF6E9]/60 ring-2 ring-[#FFA800] shadow-md'
                  : 'border-[#291E29]/10 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#FFA800]/20 text-[#291E29]">
                    <Store className="h-4 w-4" />
                  </span>
                  <span className="font-extrabold text-sm text-[#291E29]">
                    SME Boutique &amp; Local Storefront
                  </span>
                </div>
                {templateLayout === 'sme_boutique' && (
                  <span className="flex items-center gap-1 rounded-full bg-[#FFA800] px-2.5 py-0.5 text-[10px] font-extrabold text-[#291E29]">
                    <Check className="h-3 w-3" /> Selected
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored for hair salons, barbershops, auto mechanics, bakeries, cafes, boutique clinics &amp; photography studios.
              </p>

              <ul className="space-y-1.5 text-[11px] text-slate-600 pt-1">
                <li className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#FFA800]" />
                  <span><strong>Dedicated Specialist / Chair / Bay booking</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#FFA800]" />
                  <span><strong>Transparent price tags on every service menu</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#FFA800]" />
                  <span><strong>Live &ldquo;Walk-Ins Welcome &amp; Next Spot&rdquo; badge</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#FFA800]" />
                  <span><strong>Customer testimonials &amp; verified 5-star reviews</strong></span>
                </li>
              </ul>
            </div>

            {/* Enterprise Institutional Card */}
            <div
              onClick={() => setTemplateLayout('enterprise_institutional')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all shadow-xs space-y-3 ${
                templateLayout === 'enterprise_institutional'
                  ? 'border-[#FFA800] bg-[#FFF6E9]/60 ring-2 ring-[#FFA800] shadow-md'
                  : 'border-[#291E29]/10 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#291E29]/10 text-[#291E29]">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <span className="font-extrabold text-sm text-[#291E29]">
                    Enterprise Institutional Storefront
                  </span>
                </div>
                {templateLayout === 'enterprise_institutional' && (
                  <span className="flex items-center gap-1 rounded-full bg-[#FFA800] px-2.5 py-0.5 text-[10px] font-extrabold text-[#291E29]">
                    <Check className="h-3 w-3" /> Selected
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored for commercial banks, hospital clinical triage, national telecom flagships, and civic centers.
              </p>

              <ul className="space-y-1.5 text-[11px] text-slate-600 pt-1">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span><strong>Multi-branch lobby network with peak indicators</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span><strong>Formal counter / window assignment triage</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span><strong>Strict corporate handling time &amp; SLA compliance</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span><strong>KYC and cryptographic paperwork clearances</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Choose From 8 Free Theme Options */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-extrabold text-[#291E29] flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#FFA800]" />
                8 Free Theme Options
              </h2>
              <p className="text-xs text-[#291E29]/70">
                Select any curated color and typography theme. Click to apply instantly, then customize to your liking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FREE_THEME_PRESETS.map((preset) => {
              const isSelected = activeThemeId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`group relative cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:scale-[1.02] ${
                    isSelected
                      ? 'border-[#FFA800] bg-[#FFF6E9]/60 ring-2 ring-[#FFA800] shadow-md'
                      : 'border-[#291E29]/10 bg-white hover:border-[#291E29]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#702D7B] uppercase tracking-wider">
                      {preset.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 rounded-full bg-[#FFA800] px-2 py-0.5 text-[10px] font-extrabold text-[#291E29]">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-[#291E29] mt-1">{preset.name}</h3>
                  <p className="text-[11px] text-[#291E29]/70 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[#291E29]/5">
                    <div
                      className="h-6 w-6 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: preset.primaryColor }}
                      title={`Primary: ${preset.primaryColor}`}
                    />
                    <div
                      className="h-6 w-6 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: preset.secondaryColor }}
                      title={`Secondary: ${preset.secondaryColor}`}
                    />
                    <div
                      className="h-6 w-6 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: preset.accentColor }}
                      title={`Accent: ${preset.accentColor}`}
                    />
                    <div
                      className="h-6 w-6 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: preset.backgroundColor }}
                      title={`Background: ${preset.backgroundColor}`}
                    />
                    <div
                      className="h-6 w-6 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: preset.textColor }}
                      title={`Text: ${preset.textColor}`}
                    />
                    <span className="text-[10px] font-mono text-[#291E29]/50 ml-auto">
                      {preset.fontFamily}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`mt-3 w-full rounded-xl py-2 text-center text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#FFA800] text-[#291E29]'
                        : 'bg-[#291E29]/5 text-[#291E29] group-hover:bg-[#291E29] group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Theme Applied' : 'Apply Theme'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Fine-Tuning Controls & Real-Time Live Preview */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Manual Color & Copy Customizer (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-[#291E29]/10 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-display text-base font-extrabold text-[#291E29] flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#FFA800]" />
              Fine-Tune Colors & Copy
            </h3>

            {/* Color Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#291E29] flex justify-between">
                  <span>Primary Brand Color</span>
                  <span className="font-mono text-[#702D7B]">{primaryColor}</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 p-2 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#291E29] flex justify-between">
                  <span>Accent Color (Buttons & CTAs)</span>
                  <span className="font-mono text-[#702D7B]">{accentColor}</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 p-2 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#291E29] flex justify-between">
                  <span>Background Color</span>
                  <span className="font-mono text-[#702D7B]">{backgroundColor}</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 p-2 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#291E29] flex justify-between">
                  <span>Text Color</span>
                  <span className="font-mono text-[#702D7B]">{textColor}</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 p-2 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Copy & Messaging */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label className="font-bold text-[#291E29]">Hero Headline</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs font-semibold min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-[#291E29]">Hero Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#291E29]">Live Announcement Ticker</label>
                <input
                  type="text"
                  value={announcementTicker}
                  onChange={(e) => setAnnouncementTicker(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs font-medium min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-[#291E29]">Primary CTA Button Text</label>
                <input
                  type="text"
                  value={ctaButtonText}
                  onChange={(e) => setCtaButtonText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs font-bold min-h-[44px]"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAll}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#291E29] py-3 text-xs font-bold text-[#FFF6E9] hover:bg-[#341539] transition-colors"
            >
              <Save className="h-4 w-4 text-[#FFA800]" />
              <span>Apply & Save Customization</span>
            </button>
          </div>

          {/* Right Column: Live Interactive Preview (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-[#291E29]/10 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#FFA800]" />
                <span className="font-bold text-xs text-[#291E29]">Real-Time Portal Preview</span>
                <span className="text-[10px] text-slate-400 font-mono">({subdomain}.{platformDomain})</span>
              </div>

              {/* Viewport switch */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 text-slate-600">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" /> Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </button>
              </div>
            </div>

            {/* Live Render Container */}
            <div
              className={`mx-auto rounded-2xl border border-slate-200 p-6 shadow-inner transition-all overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm' : 'w-full'
              }`}
              style={{ backgroundColor, color: textColor }}
            >
              {/* Header simulation */}
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Brand Logo"
                      className="h-8 w-8 rounded-lg object-contain border border-black/10 shadow-xs bg-white/80"
                    />
                  ) : (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg font-extrabold text-white text-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {tenant?.name?.[0] || '✦'}
                    </div>
                  )}
                  <span className="font-display font-extrabold text-sm" style={{ color: textColor }}>
                    {tenant?.name || 'Your Company'}
                  </span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {subdomain}.{platformDomain}
                </span>
              </div>

              {/* Hero Banner simulation */}
              <div className="py-8 text-center space-y-4">
                {logoUrl && (
                  <div className="flex justify-center mb-1">
                    <img
                      src={logoUrl}
                      alt="Brand Logo"
                      className="h-14 w-14 rounded-2xl object-contain bg-white/90 p-1.5 shadow-sm border border-black/10"
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold">
                    <Globe className="h-3 w-3" style={{ color: primaryColor }} />
                    Subdomain: <span className="font-mono">{subdomain}.{platformDomain}</span>
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{ backgroundColor: `${accentColor}20`, color: textColor }}
                  >
                    <Radio className="h-3 w-3 animate-pulse" style={{ color: accentColor }} />
                    {announcementTicker}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">
                  {heroTitle}
                </h1>

                <p className="text-xs max-w-md mx-auto opacity-80 leading-relaxed">
                  {heroSubtitle}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>{ctaButtonText}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-xl border border-black/15 bg-white/70 px-5 py-2.5 text-xs font-bold text-slate-800 shadow-sm"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Pre-Verify Paperwork</span>
                  </button>
                </div>
              </div>

              {/* Sample Service Cards */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/10">
                <div className="rounded-xl border border-black/10 bg-white/50 p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px]" style={{ color: textColor }}>
                      Priority Window 1
                    </span>
                    <span className="rounded bg-black/5 px-1.5 py-0.5 text-[9px] font-bold">
                      ~5 mins
                    </span>
                  </div>
                  <p className="text-[10px] opacity-70">Document dropoff and express intake</p>
                </div>
                <div className="rounded-xl border border-black/10 bg-white/50 p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px]" style={{ color: textColor }}>
                      Consultation Desk
                    </span>
                    <span className="rounded bg-black/5 px-1.5 py-0.5 text-[9px] font-bold">
                      ~15 mins
                    </span>
                  </div>
                  <p className="text-[10px] opacity-70">Dedicated specialist consultation</p>
                </div>
              </div>
            </div>
          </div>
        </section>
          </>
        )}
      </div>
    </TenantStaffLayout>
  );
}
