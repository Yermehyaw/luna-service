'use client';

import React from 'react';
import { CommentSentiment, getSentimentMeta } from '../../types/feedback';
import { Smile, Meh, Frown, AlertCircle, Sparkles } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: CommentSentiment;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function SentimentBadge({
  sentiment,
  size = 'md',
  showEmoji = true,
  showIcon = false,
  className = '',
}: SentimentBadgeProps) {
  const meta = getSentimentMeta(sentiment);

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2 font-extrabold',
  }[size];

  const renderIcon = () => {
    if (showEmoji) {
      return <span className="shrink-0">{meta.emoji}</span>;
    }
    if (showIcon) {
      if (sentiment === 'positive') return <Smile className="h-3.5 w-3.5 text-emerald-600 shrink-0" />;
      if (sentiment === 'neutral') return <Meh className="h-3.5 w-3.5 text-amber-600 shrink-0" />;
      return <Frown className="h-3.5 w-3.5 text-rose-600 shrink-0" />;
    }
    return <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} shrink-0`} />;
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-extrabold border ${meta.bg} ${meta.text} ${meta.border} ${sizeClasses} ${className}`}
      title={meta.description}
    >
      {renderIcon()}
      <span>{meta.label}</span>
    </span>
  );
}
