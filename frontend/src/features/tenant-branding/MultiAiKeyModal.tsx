'use client';

import React, { useState, useEffect } from 'react';
import {
  AI_PROVIDERS,
  AiProviderId,
  getStoredAiKey,
  saveStoredAiKey,
  removeStoredAiKey,
  testAiKey,
  getActiveAiRouting,
  setActiveAiRouting,
  TestKeyResult,
} from './multi-ai-service';
import {
  Key,
  Check,
  X,
  ExternalLink,
  Bot,
  Zap,
  ShieldCheck,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function MultiAiKeyModal({
  isOpen,
  onClose,
  onKeysChanged,
}: {
  isOpen: boolean;
  onClose: () => void;
  onKeysChanged?: () => void;
}) {
  const [keys, setKeys] = useState<Record<AiProviderId, string>>({
    groq: '',
    openai: '',
    gemini: '',
    anthropic: '',
    kimi: '',
  });

  const [testResults, setTestResults] = useState<Record<AiProviderId, TestKeyResult | null>>({
    groq: null,
    openai: null,
    gemini: null,
    anthropic: null,
    kimi: null,
  });

  const [testingProvider, setTestingProvider] = useState<AiProviderId | null>(null);
  const [activeRouting, setActiveRouting] = useState<string>('auto');
  const [activeTab, setActiveTab] = useState<AiProviderId>('groq');

  useEffect(() => {
    if (isOpen) {
      const initialKeys: any = {};
      for (const p of AI_PROVIDERS) {
        initialKeys[p.id] = getStoredAiKey(p.id);
      }
      setKeys(initialKeys);
      setActiveRouting(getActiveAiRouting());
      setTestResults({
        groq: null,
        openai: null,
        gemini: null,
        anthropic: null,
        kimi: null,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyChange = (provider: AiProviderId, val: string) => {
    setKeys((prev) => ({ ...prev, [provider]: val }));
  };

  const handleSaveKey = (provider: AiProviderId) => {
    const val = keys[provider];
    if (val.trim()) {
      saveStoredAiKey(provider, val);
    } else {
      removeStoredAiKey(provider);
    }
    if (onKeysChanged) onKeysChanged();
  };

  const handleTestKey = async (provider: AiProviderId) => {
    const val = keys[provider];
    setTestingProvider(provider);
    setTestResults((prev) => ({ ...prev, [provider]: null }));

    try {
      const res = await testAiKey(provider, val);
      setTestResults((prev) => ({ ...prev, [provider]: res }));
      if (res.success) {
        saveStoredAiKey(provider, val);
        if (onKeysChanged) onKeysChanged();
      }
    } finally {
      setTestingProvider(null);
    }
  };

  const handleRoutingChange = (choice: string) => {
    setActiveRouting(choice);
    setActiveAiRouting(choice);
    if (onKeysChanged) onKeysChanged();
  };

  const configuredCount = Object.values(keys).filter((k) => k && k.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#291E29] text-[#FFF6E9]">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FFA800] p-2 text-[#291E29]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-white">
                Multi-Provider AI Studio & Key Router
              </h2>
              <p className="text-xs text-[#FFF6E9]/70">
                Connect Groq, OpenAI, Google Gemini, Anthropic Claude, or Moonshot Kimi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#FFF6E9]/70 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* AI Routing Selector */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#FFA800]" /> AI Execution & Smart Routing Strategy
              </span>
              <span className="text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5">
                {configuredCount} Key{configuredCount === 1 ? '' : 's'} Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  activeRouting === 'auto'
                    ? 'border-[#FFA800] bg-[#FFF6E9] shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="routingChoice"
                  checked={activeRouting === 'auto'}
                  onChange={() => handleRoutingChange('auto')}
                  className="mt-1 accent-[#291E29]"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-[#FFA800]" />
                    <span>Combined AI Smart Routing (Recommended)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tries fast Groq first &rarr; falls back to OpenAI &rarr; Gemini &rarr; Claude &rarr; Kimi.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  activeRouting !== 'auto'
                    ? 'border-[#FFA800] bg-[#FFF6E9] shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="routingChoice"
                  checked={activeRouting !== 'auto'}
                  onChange={() => handleRoutingChange(activeTab)}
                  className="mt-1 accent-[#291E29]"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Dedicated Single Provider</div>
                  <p className="text-[11px] text-slate-500">
                    Directs all design requests exclusively to your currently selected model.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Provider Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
            {AI_PROVIDERS.map((provider) => {
              const isSaved = Boolean(keys[provider.id]?.trim());
              return (
                <button
                  key={provider.id}
                  onClick={() => setActiveTab(provider.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                    activeTab === provider.id
                      ? 'border-[#291E29] text-[#291E29]'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <span>{provider.name}</span>
                  {isSaved && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                </button>
              );
            })}
          </div>

          {/* Selected Provider Form */}
          {(() => {
            const current = AI_PROVIDERS.find((p) => p.id === activeTab) || AI_PROVIDERS[0];
            const result = testResults[current.id];
            const isTesting = testingProvider === current.id;
            const currentVal = keys[current.id] || '';

            return (
              <div className="space-y-4 rounded-2xl border border-slate-100 p-5 bg-white shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{current.name}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-mono">
                        {current.badge}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Default Model: {current.model}</p>
                  </div>

                  <a
                    href={current.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={current.placeholder}
                      value={currentVal}
                      onChange={(e) => handleKeyChange(current.id, e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 p-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                    />
                    <button
                      type="button"
                      disabled={isTesting || !currentVal.trim()}
                      onClick={() => handleTestKey(current.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition shadow-xs"
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5 text-[#FFA800]" />
                          <span>Test Key</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveKey(current.id)}
                      className="rounded-xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Test Feedback Notice */}
                {result && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl border animate-in fade-in ${
                      result.success
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-semibold text-[11px]">{result.message}</span>
                  </div>
                )}

                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Client-Side Security Notice</span>
                  </div>
                  <p>
                    Keys are stored exclusively in your browser's local sandbox (`localStorage`) and
                    dispatched directly to {current.name}'s official inference API. They are never recorded on Luna's backend.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
          <span className="text-[11px] text-slate-500 font-medium">
            Active Strategy:{' '}
            <strong className="text-slate-800">
              {activeRouting === 'auto' ? 'Combined Smart Routing' : `Direct ${activeRouting.toUpperCase()}`}
            </strong>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#291E29] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#341539] transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
