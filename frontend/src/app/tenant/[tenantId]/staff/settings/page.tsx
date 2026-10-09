'use client';

import React, { useState, useEffect, use } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { updateTenant } from '../../../../../lib/tenant';
import { FREE_THEME_PRESETS, ThemePreset } from '../../../../../features/tenant-branding/themes';
import {
  getGroqApiKey,
  saveGroqApiKey,
  clearGroqApiKey,
  generateSiteCustomizationWithGroq,
} from '../../../../../features/tenant-branding/groq-service';
import {
  Globe,
  Palette,
  Sparkles,
  Bot,
  Key,
  Check,
  Copy,
  ExternalLink,
  Save,
  Undo2,
  Send,
  Eye,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Radio,
  Ticket,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  appliedTheme?: any;
}

export default function TenantBrandingSettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const { tenant, setTenant } = useTenant();

  // Subdomain & Basic Info
  const [subdomain, setSubdomain] = useState(tenant?.slug || resolvedParams.tenantId || '');
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Active Customization State
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

  // Groq API Key State
  const [groqKey, setGroqKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>('');

  // AI Chat State (Lovable & Replit style)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 Hi! I am your Luna AI Site Architect (similar to Lovable & Replit). Tell me how you'd like your website styled, or describe your brand vibe, and I will redesign your colors, hero copy, and buttons instantly!`,
      timestamp: 'Just now',
    },
  ]);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Initialize Groq Key
  useEffect(() => {
    const saved = getGroqApiKey();
    if (saved) {
      setGroqKey(saved);
      setIsKeySaved(true);
    }
  }, []);

  // Update form fields when tenant loads
  useEffect(() => {
    if (tenant) {
      setSubdomain(tenant.slug);
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

  const handleSaveGroqKey = () => {
    if (!keyInput.trim()) return;
    saveGroqApiKey(keyInput);
    setGroqKey(keyInput.trim());
    setIsKeySaved(true);
    setShowKeyModal(false);
    setKeyInput('');
  };

  const handleClearGroqKey = () => {
    clearGroqApiKey();
    setGroqKey('');
    setIsKeySaved(false);
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

    // Add notification in AI chat
    setChatMessages((prev) => [
      ...prev,
      {
        id: `theme-${Date.now()}`,
        sender: 'ai',
        text: `🎨 Applied the preset theme "${theme.name}" (${theme.category}). You can now fine-tune colors or chat with me to personalize further!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Submit AI Prompt
  const handleSendAiPrompt = async (promptToSend?: string) => {
    const text = promptToSend || aiPromptInput;
    if (!text.trim() || aiLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setAiPromptInput('');
    setAiLoading(true);
    setAiError(null);

    try {
      const currentBranding = {
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        heroTitle,
        heroSubtitle,
        announcementTicker,
        ctaButtonText,
      };

      const result = await generateSiteCustomizationWithGroq(
        text,
        currentBranding,
        tenant?.name || 'Our Business',
        tenant?.industry || 'retail',
        groqKey
      );

      // Apply returned branding updates to state
      if (result.updatedBranding) {
        if (result.updatedBranding.primaryColor) setPrimaryColor(result.updatedBranding.primaryColor);
        if (result.updatedBranding.secondaryColor) setSecondaryColor(result.updatedBranding.secondaryColor);
        if (result.updatedBranding.accentColor) setAccentColor(result.updatedBranding.accentColor);
        if (result.updatedBranding.backgroundColor) setBackgroundColor(result.updatedBranding.backgroundColor);
        if (result.updatedBranding.textColor) setTextColor(result.updatedBranding.textColor);
        if (result.updatedBranding.heroTitle) setHeroTitle(result.updatedBranding.heroTitle);
        if (result.updatedBranding.heroSubtitle) setHeroSubtitle(result.updatedBranding.heroSubtitle);
        if (result.updatedBranding.announcementTicker) setAnnouncementTicker(result.updatedBranding.announcementTicker);
        if (result.updatedBranding.ctaButtonText) setCtaButtonText(result.updatedBranding.ctaButtonText);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: result.replyMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          appliedTheme: result.updatedBranding,
        },
      ]);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate design with Groq');
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Groq Error: ${err.message || 'Could not connect to Groq'}. Please check your API key or try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Save all changes to repository
  const handleSaveAll = async () => {
    const updated = await updateTenant(tenant.slug, {
      slug: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '') || tenant.slug,
      subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '') || tenant.slug,
      branding: {
        ...tenant.branding,
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

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans pb-16 selection:bg-[#FFA800] selection:text-[#291E29]">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#291E29]/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFA800]/20 text-[#291E29] text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                Website & Theme Studio
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1">
                <Check className="h-3 w-3" /> Free Subdomain Active
              </span>
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[#291E29] mt-1">
              Website Customizer & AI Studio
            </h1>
            <p className="text-xs text-[#291E29]/70">
              Customize your free <span className="font-bold font-mono">{subdomain}.{platformDomain}</span> portal, choose from 8 themes, or chat with AI to personalize your look.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/tenant/${tenant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-[#291E29]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#291E29] shadow-sm hover:bg-[#FFF6E9] transition-colors"
            >
              <span>Visit Live Portal</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
            </a>

            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 rounded-xl bg-[#FFA800] px-5 py-2.5 text-xs font-extrabold text-[#291E29] shadow-md shadow-[#FFA800]/25 hover:bg-[#FFB11A] transition-transform hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span>Save & Publish</span>
            </button>
          </div>
        </div>

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

        {/* 2. Choose From 8 Free Theme Options */}
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

        {/* 3. AI Personalization Studio (Lovable & Replit Style) with Groq API Key */}
        <section className="rounded-3xl border border-[#702D7B]/20 bg-gradient-to-br from-[#291E29] via-[#341539] to-[#291E29] p-6 text-[#FFF6E9] shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FFF6E9]/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFA800] text-[#291E29] shadow-lg shadow-[#FFA800]/25">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-extrabold text-white">
                    Luna AI Site Studio (Lovable & Replit Experience)
                  </h3>
                  <span className="rounded-full bg-[#FFA800]/20 text-[#FFA800] border border-[#FFA800]/30 text-[10px] font-bold px-2 py-0.5">
                    LLaMA 3.3
                  </span>
                </div>
                <p className="text-xs text-[#FFF6E9]/75">
                  Chat with AI to personalize your site with any design vision, color aesthetic, or high-converting copy.
                </p>
              </div>
            </div>

            {/* Groq Key Status & Setup */}
            <div className="flex items-center gap-2">
              {isKeySaved ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 px-3 py-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold">Groq Key Connected</span>
                  <button
                    onClick={handleClearGroqKey}
                    className="text-[11px] text-emerald-400 hover:text-white underline ml-1"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#FFA800] px-3.5 py-2 text-xs font-bold text-[#291E29] shadow-md hover:bg-[#FFB11A]"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Enter Groq API Key</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Input Modal / Inline Prompt */}
          {showKeyModal && (
            <div className="rounded-2xl border border-[#FFA800]/30 bg-black/40 p-4 space-y-3 backdrop-blur-md">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#FFA800] flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5" /> Configure Your Free Groq API Key
                  </h4>
                  <p className="text-[11px] text-[#FFF6E9]/70 mt-0.5">
                    We use Groq's lightning-fast LLaMA 3.3 model for AI website personalization. You can get a free key in 30 seconds from{' '}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FFA800] underline font-bold"
                    >
                      console.groq.com/keys
                    </a>.
                  </p>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-xs text-[#FFF6E9]/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
                <button
                  onClick={handleSaveGroqKey}
                  className="rounded-xl bg-[#FFA800] px-4 py-2 text-xs font-bold text-[#291E29] hover:bg-[#FFB11A]"
                >
                  Save Key
                </button>
              </div>
            </div>
          )}

          {/* Quick Prompt Ideas */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#FFA800] uppercase tracking-wider">
              Try a 1-Click AI Redesign Prompt:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                '🌸 Friendly pediatric clinic with pastel tones and welcoming copy',
                '🖤 Luxury obsidian black and gold for a private VIP salon',
                '⚡ High-energy retail sale with electric tangerine and urgent ticker',
                '🏛️ Authoritative corporate banking with cobalt trust colors',
              ].map((promptText) => (
                <button
                  key={promptText}
                  onClick={() => handleSendAiPrompt(promptText)}
                  disabled={aiLoading}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-[#FFF6E9] hover:bg-[#FFA800] hover:text-[#291E29] transition-colors"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 max-h-64 overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFA800] text-[#291E29] font-bold text-[10px]">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#FFA800] text-[#291E29] font-bold'
                      : 'bg-white/10 text-white backdrop-blur-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      msg.sender === 'user' ? 'text-[#291E29]/70 text-right' : 'text-white/50'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-[#FFA800] font-bold animate-pulse">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Luna AI is designing your custom theme with Groq LLaMA 3.3...</span>
              </div>
            )}
          </div>

          {/* AI Prompt Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAiPrompt();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              placeholder="e.g. 'Make my website warm with coffee tones and write a welcoming headline for a boutique bakery'"
              disabled={aiLoading}
              className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiPromptInput.trim()}
              className="flex items-center gap-2 rounded-2xl bg-[#FFA800] px-5 py-3 text-xs font-extrabold text-[#291E29] shadow-lg shadow-[#FFA800]/25 hover:bg-[#FFB11A] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>Redesign with AI</span>
            </button>
          </form>
        </section>

        {/* 4. Fine-Tuning Controls & Real-Time Live Preview */}
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
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#291E29]">Hero Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#291E29]">Live Announcement Ticker</label>
                <input
                  type="text"
                  value={announcementTicker}
                  onChange={(e) => setAnnouncementTicker(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#291E29]">Primary CTA Button Text</label>
                <input
                  type="text"
                  value={ctaButtonText}
                  onChange={(e) => setCtaButtonText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
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
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg font-extrabold text-white text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ✦
                  </div>
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
      </div>
    </TenantStaffLayout>
  );
}
