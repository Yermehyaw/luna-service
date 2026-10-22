'use client';

export interface AiGenerationOptions {
  prompt: string;
  context?: string;
  tone?: 'professional' | 'urgent' | 'friendly' | 'informative';
}

const GROQ_STORAGE_KEY = 'luna_groq_api_key';

export function getStoredGroqKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GROQ_STORAGE_KEY) || '';
}

export function setStoredGroqKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GROQ_STORAGE_KEY, key.trim());
}

export async function generateAiContent(options: AiGenerationOptions): Promise<string> {
  const { prompt, context = '', tone = 'informative' } = options;
  const groqKey = getStoredGroqKey();

  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for Luna, a modern multi-tenant queue and operations platform. Generate concise, engaging announcement copy or responses for business tenants. Tone: ${tone}. Keep announcement broadcasts under 120 characters when suitable. Context: ${context}`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content.replace(/^["']|["']$/g, '');
      } else {
        console.warn('[AI] Groq API returned status', response.status);
      }
    } catch (err) {
      console.warn('[AI] Groq call failed, falling back:', err);
    }
  }

  // Built-in intelligent fallback
  const p = prompt.toLowerCase();
  if (p.includes('rain') || p.includes('weather') || p.includes('storm')) {
    return '🌧️ Weather Advisory: Lounge priority windows extended by 30 mins. Track your live turn online before arriving.';
  }
  if (p.includes('zero') || p.includes('fast') || p.includes('rush') || p.includes('low')) {
    return '⚡ Fast-Track Advisory: Counter 1 & 2 are currently operating with 0-minute wait for deposits and quick triage.';
  }
  if (p.includes('holiday') || p.includes('weekend') || p.includes('closing')) {
    return '⏰ Special Hours: Flagship branch open until 6:00 PM today. Book your arrival window to guarantee your desk time.';
  }
  if (p.includes('system') || p.includes('maintenance')) {
    return '🛠️ Notice: Scheduled systems optimization active. Digital queue appointments operate normally without interruption.';
  }

  return `📢 Live Update: ${prompt}. Reserve your 30-min priority window on Luna to skip all lobby waiting!`;
}
