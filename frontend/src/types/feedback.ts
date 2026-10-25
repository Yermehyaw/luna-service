export type CommentSentiment = 'positive' | 'neutral' | 'negative';

export interface CustomerComment {
  id: string;
  customerName: string;
  customerEmail?: string;
  avatarColor?: string;
  rating: number; // 1 to 5
  sentiment: CommentSentiment;
  comment: string;
  date: string;
  serviceName: string;
  waitTimeMins: number;
  verifiedPass: boolean;
  status?: 'reviewed' | 'escalated' | 'resolved';
}

export function classifySentiment(rating: number, text?: string): CommentSentiment {
  if (rating >= 4.0) return 'positive';
  if (rating >= 3.0) return 'neutral';
  return 'negative';
}

export function getSentimentMeta(sentiment: CommentSentiment) {
  switch (sentiment) {
    case 'positive':
      return {
        label: 'Positive',
        emoji: '😊',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500',
        barColor: '#10B981',
        description: 'Satisfied customer praising wait time, staff, or service quality.',
      };
    case 'neutral':
      return {
        label: 'Neutral',
        emoji: '😐',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
        barColor: '#F59E0B',
        description: 'Balanced feedback with suggestions or minor friction noted.',
      };
    case 'negative':
      return {
        label: 'Negative',
        emoji: '🙁',
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-300',
        dot: 'bg-rose-500',
        barColor: '#EF4444',
        description: 'Critique regarding delays, scheduling, or service needing attention.',
      };
  }
}
