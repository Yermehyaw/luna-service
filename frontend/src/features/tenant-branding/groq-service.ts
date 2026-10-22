import { TenantBranding } from '../../types/tenant';

const STORAGE_KEY = 'luna_groq_api_key';

export interface GroqAiDesignResponse {
  replyMessage: string;
  updatedBranding?: Partial<TenantBranding>;
  tagline?: string;
}

export function getGroqApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY) || null;
}

export function saveGroqApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function clearGroqApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function generateSiteCustomizationWithGroq(
  userPrompt: string,
  currentBranding: TenantBranding,
  currentBusinessName: string,
  currentIndustry: string,
  customApiKey?: string
): Promise<GroqAiDesignResponse> {
  const apiKey = (customApiKey || getGroqApiKey() || '').trim();

  // If no Groq API key is configured, return an intelligent simulation with guidance
  if (!apiKey) {
    return simulateAiGeneration(userPrompt, currentBranding, currentBusinessName);
  }

  const systemPrompt = `You are the Luna AI Website Architect, an elite UI/UX designer and site customization engine similar to Lovable and Replit.
You help businesses personalize their multi-tenant digital arrival & queue portal on Luna (e.g. victor.luna.com).

The user is customizing their portal:
Business Name: "${currentBusinessName}"
Industry: "${currentIndustry}"
Current Primary Color: "${currentBranding.primaryColor}"
Current Background: "${currentBranding.backgroundColor}"

Analyze the user's natural language request. You must output:
1. An encouraging, friendly explanation of the visual and tonal changes you created (2-4 sentences).
2. A strict JSON block enclosed in \`\`\`json ... \`\`\` containing the exact branding updates.

Available branding JSON fields to return:
{
  "primaryColor": "#hex (main brand anchor, header accents, deep cards)",
  "secondaryColor": "#hex (secondary shade)",
  "accentColor": "#hex (call-to-action button or vibrant highlight)",
  "backgroundColor": "#hex (page background, keep clean & accessible)",
  "textColor": "#hex (primary readable text)",
  "fontFamily": "Inter" or "Sora" or "Playfair Display",
  "heroTitle": "Captivating headline tailored to the business",
  "heroSubtitle": "Engaging description explaining digital arrival or priority queues",
  "announcementTicker": "Short status ticker e.g. 'Live Fast-Track Queues Active'",
  "ctaButtonText": "High-converting button text e.g. 'Reserve VIP Window'",
  "tagline": "Brief inspiring brand slogan"
}

Ensure the hex color combinations have high contrast and look world-class. Only return valid JSON inside the code fence.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `Groq API Error (${res.status})`;
      throw new Error(errMsg);
    }

    const data = await res.json();
    const rawContent: string = data?.choices?.[0]?.message?.content || '';

    // Extract JSON block
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let parsedBranding: any = null;
    let replyText = rawContent;

    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedBranding = JSON.parse(jsonMatch[1]);
        // Remove the JSON code fence from the friendly reply text
        replyText = rawContent.replace(/```(?:json)?\s*[\s\S]*?\s*```/, '').trim();
      } catch (err) {
        console.warn('Failed to parse JSON from Groq response:', err);
      }
    }

    if (!parsedBranding) {
      // Fallback regex extraction if pure text
      return {
        replyMessage: rawContent,
        updatedBranding: {},
      };
    }

    const { tagline, ...brandingFields } = parsedBranding;

    return {
      replyMessage: replyText || '✨ I have updated your website design based on your prompt!',
      updatedBranding: brandingFields,
      tagline,
    };
  } catch (err: any) {
    console.error('Groq AI API Call failed:', err);
    throw err;
  }
}

function simulateAiGeneration(
  prompt: string,
  current: TenantBranding,
  businessName: string
): GroqAiDesignResponse {
  const lower = prompt.toLowerCase();

  if (lower.includes('dark') || lower.includes('black') || lower.includes('luxury') || lower.includes('obsidian')) {
    return {
      replyMessage: `🌙 Switched ${businessName} into a prestigious Obsidian Noir luxury theme. Applied midnight black cards, titanium slate typography, and electric cyan call-to-actions. (Simulated Demo · Connect your Groq API key for custom dynamic LLaMA 3.3 generation!)`,
      updatedBranding: {
        primaryColor: '#0F172A',
        secondaryColor: '#1E293B',
        accentColor: '#38BDF8',
        backgroundColor: '#090D16',
        textColor: '#F8FAFC',
        heroTitle: `Exclusive Concierge Service at ${businessName}`,
        heroSubtitle: 'Direct priority windows, frictionless VIP pre-clearance, and zero lobby queues.',
        announcementTicker: 'VIP Digital Concierge Live · Zero Wait Time',
        ctaButtonText: 'Reserve Concierge Window',
      },
      tagline: 'Precision · Prestige · Beyond Expectation',
    };
  }

  if (lower.includes('health') || lower.includes('clinic') || lower.includes('green') || lower.includes('hospital') || lower.includes('care')) {
    return {
      replyMessage: `🌿 Transformed ${businessName} with a soothing Emerald Wellness palette. Calming botanical greens and clean mint highlights foster clinical trust. (Simulated Demo · Add your Groq API key to prompt any custom style!)`,
      updatedBranding: {
        primaryColor: '#12A05A',
        secondaryColor: '#0E7A44',
        accentColor: '#17B568',
        backgroundColor: '#F3FBF6',
        textColor: '#0A2E1A',
        heroTitle: `Patient-First Care & Triage at ${businessName}`,
        heroSubtitle: 'Pre-clear medical documents and book your specialist arrival window online from home.',
        announcementTicker: 'Clinical Priority Queues Active · Zero-Crowd Waiting',
        ctaButtonText: 'Book Consultation Window',
      },
      tagline: 'Compassionate Care · Seamless Digital Arrival',
    };
  }

  if (lower.includes('warm') || lower.includes('orange') || lower.includes('retail') || lower.includes('food') || lower.includes('cafe')) {
    return {
      replyMessage: `🔥 Infused ${businessName} with high-energy Tangerine Spark accents. Radiant amber tones drive high conversion for retail checkouts and arrival slots! (Simulated Demo · Connect Groq key for unlimited AI prompting!)`,
      updatedBranding: {
        primaryColor: '#FF8A00',
        secondaryColor: '#D97300',
        accentColor: '#F45B16',
        backgroundColor: '#FFF8F0',
        textColor: '#2E1800',
        heroTitle: `Welcome to ${businessName} Priority Hub`,
        heroSubtitle: 'Instant express checkout windows, timed arrival tickets, and zero store congestion.',
        announcementTicker: 'Express Counters Open · Immediate Window Tickets',
        ctaButtonText: 'Claim Priority Ticket',
      },
      tagline: 'Instant Energy · Zero Waiting',
    };
  }

  // Default intelligent adaptation
  return {
    replyMessage: `✨ Crafted a personalized visual theme for ${businessName}! Adjusted color balances for maximum contrast, updated your hero messaging, and streamlined the booking CTA. (Simulated Demo · Connect your Groq API key for live LLaMA 3.3 generation!)`,
    updatedBranding: {
      primaryColor: '#291E29',
      secondaryColor: '#341539',
      accentColor: '#FFA800',
      backgroundColor: '#FFF6E9',
      textColor: '#291E29',
      heroTitle: `Welcome to ${businessName}`,
      heroSubtitle: 'Experience fast, frictionless arrivals with digital queue tickets and instant document pre-clearance.',
      announcementTicker: 'Priority Digital Queue Live · Zero Lobby Delay',
      ctaButtonText: 'Book Timed Arrival Ticket',
    },
    tagline: 'Intelligent Service · Beyond the Expected',
  };
}
