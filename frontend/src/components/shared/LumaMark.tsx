import React from 'react';

export function LunaLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 font-display font-extrabold text-slate-900 tracking-tight text-xl">
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 via-amber-400 to-amber-200 text-white shadow-md shadow-orange-500/20"
      >
        <span className="font-mono text-sm font-extrabold">L</span>
      </div>
      <span>Luna</span>
    </div>
  );
}

export const LumaLogo = LunaLogo;
