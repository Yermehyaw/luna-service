import React from 'react';
import Image from 'next/image';

export function LunaLogo({
  size = 36,
  variant = 'dark',
  showTagline = false,
  className = '',
}: {
  size?: number;
  variant?: 'dark' | 'light' | 'flat';
  showTagline?: boolean;
  className?: string;
}) {
  const imgSrc =
    variant === 'light'
      ? '/brand/luna-wordmark-cream.png'
      : variant === 'flat'
      ? '/brand/luna-wordmark-flat.png'
      : '/brand/luna-wordmark-purple.png';

  const width = Math.round(size * 3.2);

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <Image
          src={imgSrc}
          alt="Luna — Beyond the Expected"
          width={width}
          height={size}
          priority
          className="h-auto object-contain transition-transform hover:scale-105"
          style={{ height: size, width: 'auto' }}
        />
      </div>
      {showTagline && (
        <span
          className={`text-[9px] font-semibold tracking-widest uppercase mt-0.5 ${
            variant === 'light' ? 'text-[#FFE5B3]' : 'text-[#702D7B]'
          }`}
        >
          Beyond the Expected
        </span>
      )}
    </div>
  );
}

export function LunaIcon({
  size = 32,
  variant = 'purple',
  className = '',
}: {
  size?: number;
  variant?: 'purple' | 'cream';
  className?: string;
}) {
  const imgSrc =
    variant === 'cream'
      ? '/brand/luna-icon-cream.png'
      : '/brand/luna-icon-purple.png';

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src={imgSrc}
        alt="Luna Icon"
        width={size}
        height={size}
        priority
        className="h-auto object-contain"
        style={{ maxHeight: size, maxWidth: size }}
      />
    </div>
  );
}

export const LumaLogo = LunaLogo;
