import React from 'react';
import { Target, Database, Cpu, Settings, BarChart2, History, Zap } from 'lucide-react';

export default function Header({
  systemHealth,
  onOpenSettings,
  onOpenAnalytics,
  onOpenHistory,
  onTriggerDemo,
  onReset
}) {
  const aiEngine = systemHealth?.aiEngine;
  const isAiOnline = aiEngine?.available;
  const isMongoOnline = systemHealth?.database?.connected;

  let aiBadgeText = 'Fallback Engine';
  if (aiEngine?.activeProvider === 'ollama') {
    aiBadgeText = `Ollama: ${aiEngine.model || 'llama3'}`;
  } else if (aiEngine?.activeProvider === 'gemini') {
    aiBadgeText = `Gemini: ${aiEngine.model || '1.5-flash'}`;
  } else if (isAiOnline) {
    aiBadgeText = 'AI Active';
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between py-3">
        {/* Brand / Logo */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">
                GapGenius
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Find the gap. Fix the gap.
            </p>
          </div>
        </div>

        {/* Status Pills: Clean & Subtle */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
            <span className={`w-2 h-2 rounded-full ${isAiOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>{aiBadgeText}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
            <span className={`w-2 h-2 rounded-full ${isMongoOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>{isMongoOnline ? 'MongoDB Atlas' : 'Local Storage'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onTriggerDemo}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            title="Instant 1-Click Judge Demo"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Demo</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Learning Analytics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHistory}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
