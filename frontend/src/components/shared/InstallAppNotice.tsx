'use client';

import { useEffect, useState } from 'react';

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallAppNotice() {
  const [installed, setInstalled] = useState(true);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const check = () => setInstalled(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    check();
    const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', check);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', check); };
  }, []);

  if (installed || dismissed) return null;
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d9c9db] bg-[#f5eef6] px-4 py-3 text-sm text-[#38263d]">
    <div><strong>Install Luna for the best publishing experience.</strong><span className="ml-1">The app is required to publish posts and keeps your social workspace close at hand.</span></div>
    <div className="flex items-center gap-3">
      {prompt ? <button type="button" className="rounded-md bg-[#291e29] px-3 py-2 font-semibold text-white" onClick={async () => { await prompt.prompt(); await prompt.userChoice; setPrompt(null); }}>Install app</button> : <span className="text-xs">Use your browser menu → Install app</span>}
      <button type="button" onClick={() => setDismissed(true)} className="text-xs underline">Later</button>
    </div>
  </div>;
}
