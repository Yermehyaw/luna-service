import { TenantBranding } from '../../types/tenant';

export type AiProviderId = 'groq' | 'openai' | 'gemini' | 'anthropic' | 'kimi';

export interface AiProviderConfig {
  id: AiProviderId;
  name: string;
  badge: string;
  model: string;
  placeholder: string;
  docsUrl: string;
}

export const AI_PROVIDERS: AiProviderConfig[] = [
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'LLaMA 3.3 (Ultra Fast)',
    model: 'llama-3.3-70b-versatile',
    placeholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'GPT-4o Mini',
    model: 'gpt-4o-mini',
    placeholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Gemini 1.5 Flash',
    model: 'gemini-1.5-flash',
    placeholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'Claude 3.5 Haiku',
    model: 'claude-3-5-haiku-20241022',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'kimi',
    name: 'Moonshot Kimi',
    badge: 'Moonshot v1 8K',
    model: 'moonshot-v1-8k',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
];

const STORAGE_PREFIX = 'luna_ai_key_';
const ACTIVE_PROVIDER_KEY = 'luna_ai_active_provider';

export function getStoredAiKey(provider: AiProviderId): string {
  if (typeof window === 'undefined') return '';
  if (provider === 'groq') {
    return (
      localStorage.getItem(`${STORAGE_PREFIX}groq`) ||
      localStorage.getItem('luna_groq_api_key') ||
      ''
    );
  }
  return localStorage.getItem(`${STORAGE_PREFIX}${provider}`) || '';
}

export function saveStoredAiKey(provider: AiProviderId, key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim();
  localStorage.setItem(`${STORAGE_PREFIX}${provider}`, clean);
  if (provider === 'groq') {
    localStorage.setItem('luna_groq_api_key', clean);
  }
}

export function removeStoredAiKey(provider: AiProviderId): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
  if (provider === 'groq') {
    localStorage.removeItem('luna_groq_api_key');
  }
}

export function getAllStoredAiKeys(): Record<AiProviderId, string> {
  const result: any = {};
  for (const p of AI_PROVIDERS) {
    result[p.id] = getStoredAiKey(p.id);
  }
  return result;
}

export function getActiveAiRouting(): string {
  if (typeof window === 'undefined') return 'auto';
  return localStorage.getItem(ACTIVE_PROVIDER_KEY) || 'auto';
}

export function setActiveAiRouting(choice: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_PROVIDER_KEY, choice);
}

export interface TestKeyResult {
  success: boolean;
  latencyMs?: number;
  message: string;
}

/**
 * Live test of an API key against provider health/ping endpoint
 */
export async function testAiKey(provider: AiProviderId, rawKey: string): Promise<TestKeyResult> {
  const key = rawKey.trim();
  if (!key) {
    return { success: false, message: 'Please provide an API key to test' };
  }

  const startTime = Date.now();

  try {
    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });
      const latency = Date.now() - startTime;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          message: err?.error?.message || `Groq error HTTP ${res.status}`,
        };
      }
      return { success: true, latencyMs: latency, message: `Connected! Response in ${latency}ms` };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });
      const latency = Date.now() - startTime;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          message: err?.error?.message || `OpenAI error HTTP ${res.status}`,
        };
      }
      return { success: true, latencyMs: latency, message: `Connected! Response in ${latency}ms` };
    }

    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'ping' }] }],
          }),
        }
      );
      const latency = Date.now() - startTime;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          message: err?.error?.message || `Gemini error HTTP ${res.status}`,
        };
      }
      return { success: true, latencyMs: latency, message: `Connected! Response in ${latency}ms` };
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      const latency = Date.now() - startTime;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          message: err?.error?.message || `Anthropic error HTTP ${res.status}`,
        };
      }
      return { success: true, latencyMs: latency, message: `Connected! Response in ${latency}ms` };
    }

    if (provider === 'kimi') {
      const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });
      const latency = Date.now() - startTime;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          message: err?.error?.message || `Moonshot error HTTP ${res.status}`,
        };
      }
      return { success: true, latencyMs: latency, message: `Connected! Response in ${latency}ms` };
    }

    return { success: false, message: 'Unsupported provider' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection network failure' };
  }
}

export interface MultiAiDesignResponse {
  replyMessage: string;
  updatedBranding?: Partial<TenantBranding>;
  tagline?: string;
  usedProvider: string;
  latencyMs?: number;
}

function buildSystemPrompt(businessName: string, industry: string, branding: TenantBranding): string {
  return `You are the Luna AI Site Architect (elite site builder and design generator similar to Lovable and Replit).
You customize multi-tenant digital arrival and queue portals on Luna (e.g. victor.luna.com).

Business Context:
Name: "${businessName}"
Industry: "${industry}"
Current Primary: "${branding.primaryColor}"
Current Background: "${branding.backgroundColor}"

Output requirements:
1. A friendly explanation of the visual and tonal styling choices you made (2-3 sentences).
2. A strict JSON block enclosed in \`\`\`json ... \`\`\` with the exact branding updates.

Available JSON properties:
{
  "primaryColor": "#hex (strong brand anchor)",
  "secondaryColor": "#hex",
  "accentColor": "#hex (vibrant CTA button)",
  "backgroundColor": "#hex (clean, accessible)",
  "textColor": "#hex",
  "fontFamily": "Inter" or "Sora" or "Playfair Display",
  "heroTitle": "Catchy headline for the business",
  "heroSubtitle": "Engaging description of priority timed arrival queues",
  "announcementTicker": "Short live announcement ticker",
  "ctaButtonText": "Action-oriented button copy e.g. 'Reserve Fast-Track Ticket'",
  "tagline": "Brief slogan"
}`;
}

async function callProviderChat(
  provider: AiProviderId,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (provider === 'groq') {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });
    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'gemini') {
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  if (provider === 'kimi') {
    const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });
    if (!res.ok) throw new Error(`Moonshot HTTP ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

function parseAiContent(raw: string, usedProvider: string, latencyMs?: number): MultiAiDesignResponse {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let parsedBranding: any = null;
  let replyText = raw;

  if (jsonMatch && jsonMatch[1]) {
    try {
      parsedBranding = JSON.parse(jsonMatch[1].trim());
      replyText = raw.replace(/```(?:json)?\s*[\s\S]*?\s*```/, '').trim();
    } catch (e) {
      console.warn('[MultiAI] JSON parse failed, returning raw text');
    }
  }

  return {
    replyMessage: replyText || 'Website design parameters generated successfully.',
    updatedBranding: parsedBranding || undefined,
    tagline: parsedBranding?.tagline,
    usedProvider,
    latencyMs,
  };
}

/**
 * Intelligent fallback simulator when no keys are entered or providers fail
 */
export function simulateSmartAiDesign(
  prompt: string,
  branding: TenantBranding,
  businessName: string
): MultiAiDesignResponse {
  const p = prompt.toLowerCase();

  if (p.includes('dark') || p.includes('luxury') || p.includes('obsidian') || p.includes('gold')) {
    return {
      replyMessage: `🌙 Crafted a sleek, midnight luxury experience for ${businessName}. Featuring deep obsidian surfaces, rich gold CTA accents, and prestigious typography.`,
      updatedBranding: {
        primaryColor: '#0F172A',
        secondaryColor: '#1E293B',
        accentColor: '#F59E0B',
        backgroundColor: '#090D16',
        textColor: '#F8FAFC',
        heroTitle: `Exclusive Priority Concierge at ${businessName}`,
        heroSubtitle: 'Bypass all lobby waiting with VIP reserved arrival suites and dedicated advisory.',
        announcementTicker: 'VIP Fast-Track Suites Active · Zero Public Waiting',
        ctaButtonText: 'Reserve VIP Window',
      },
      tagline: 'Precision & Prestige in Every Visit',
      usedProvider: 'Luna Smart Engine (Simulation)',
    };
  }

  if (p.includes('clinic') || p.includes('health') || p.includes('hospital') || p.includes('friendly') || p.includes('kids')) {
    return {
      replyMessage: `🌿 Transformed ${businessName} with soothing eucalyptus and mint tones, welcoming rounded aesthetics, and compassionate arrival messaging.`,
      updatedBranding: {
        primaryColor: '#0D9488',
        secondaryColor: '#115E59',
        accentColor: '#14B8A6',
        backgroundColor: '#F0FDFA',
        textColor: '#134E4A',
        heroTitle: `Gentle Care & Zero-Wait Consultations at ${businessName}`,
        heroSubtitle: 'Pre-clear patient vitals and health documents online to walk straight to your doctor.',
        announcementTicker: 'Triage Rooms & Express Diagnostic Counters Operating',
        ctaButtonText: 'Book Gentle Consultation',
      },
      tagline: 'Compassionate Care, Scheduled for You',
      usedProvider: 'Luna Smart Engine (Simulation)',
    };
  }

  if (p.includes('bank') || p.includes('fintech') || p.includes('corporate') || p.includes('royal') || p.includes('blue')) {
    return {
      replyMessage: `🏛️ Engineered a commanding institutional look for ${businessName}. Bold royal cobalt anchor with crisp sky-blue action highlights.`,
      updatedBranding: {
        primaryColor: '#0057B8',
        secondaryColor: '#002F6C',
        accentColor: '#00A3E0',
        backgroundColor: '#F4F8FC',
        textColor: '#0B1D3A',
        heroTitle: `Smart Financial Access at ${businessName}`,
        heroSubtitle: 'Book instant teller windows or pre-clear wire documents to bypass branch lobby queues.',
        announcementTicker: 'Priority Teller & Foreign Exchange Windows Active',
        ctaButtonText: 'Book Banking Window',
      },
      tagline: 'Smart Branch Banking, Zero Lobby Queues',
      usedProvider: 'Luna Smart Engine (Simulation)',
    };
  }

  return {
    replyMessage: `✨ Customized ${businessName} following the official Luna Tangerine & Plum brand identity. High contrast, high accessibility, and instant conversion.`,
    updatedBranding: {
      primaryColor: '#291E29',
      secondaryColor: '#341539',
      accentColor: '#FFA800',
      backgroundColor: '#FFF6E9',
      textColor: '#291E29',
      heroTitle: `Welcome to ${businessName}`,
      heroSubtitle: 'Reserve a 30-minute priority arrival window or pre-clear your paperwork online.',
      announcementTicker: 'Live Queue System Operating · Zero Walk-in Waiting',
      ctaButtonText: 'Book a Timed Ticket',
    },
    tagline: 'Beyond the Expected',
    usedProvider: 'Luna Smart Engine (Simulation)',
  };
}

/**
 * Main Multi-Provider & Combined AI Router
 */
export async function generateSiteCustomizationMultiAi(
  userPrompt: string,
  branding: TenantBranding,
  businessName: string,
  industry: string
): Promise<MultiAiDesignResponse> {
  const routing = getActiveAiRouting();
  const keys = getAllStoredAiKeys();
  const systemPrompt = buildSystemPrompt(businessName, industry, branding);

  // If a specific provider was chosen:
  if (routing !== 'auto' && routing in keys && keys[routing as AiProviderId]) {
    const pId = routing as AiProviderId;
    const key = keys[pId];
    try {
      const start = Date.now();
      const raw = await callProviderChat(pId, key, systemPrompt, userPrompt);
      const latency = Date.now() - start;
      const provName = AI_PROVIDERS.find((p) => p.id === pId)?.name || pId;
      return parseAiContent(raw, provName, latency);
    } catch (err: any) {
      console.warn(`[MultiAI] Specific provider ${pId} failed:`, err);
      // Fall through to auto routing
    }
  }

  // Smart Combined AI Routing (Cascade in priority order)
  const priorityOrder: AiProviderId[] = ['groq', 'openai', 'gemini', 'anthropic', 'kimi'];
  for (const pId of priorityOrder) {
    const key = keys[pId];
    if (key && key.trim()) {
      try {
        const start = Date.now();
        const raw = await callProviderChat(pId, key, systemPrompt, userPrompt);
        const latency = Date.now() - start;
        const provName = AI_PROVIDERS.find((p) => p.id === pId)?.name || pId;
        return parseAiContent(raw, `${provName} (Auto-Routed)`, latency);
      } catch (err) {
        console.warn(`[MultiAI] Provider ${pId} error in auto-cascade:`, err);
        // Continue to next available provider
      }
    }
  }

  // Fallback to Luna Smart Engine simulation
  return simulateSmartAiDesign(userPrompt, branding, businessName);
}
