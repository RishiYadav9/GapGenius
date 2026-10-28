import React from 'react';
import { Target, Sparkles, Database, Cpu, Settings, BarChart2, History, Zap } from 'lucide-react';

export default function Header({
  systemHealth,
  onOpenSettings,
  onOpenAnalytics,
  onOpenHistory,
  onTriggerDemo,
  onReset
}) {
  const isAiOnline = systemHealth?.aiEngine?.available;
  const isMongoOnline = systemHealth?.database?.connected;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                GapGenius
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                MVP
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
              Find the gap. Fix the gap.
            </p>
          </div>
        </div>

        {/* Live System Badges (Priorities 1 & 10 Compliance) */}
        <div className="hidden md:flex items-center gap-2">
          {/* AI Badge */}
          <div 
            title={isAiOnline ? "Gemini AI Engine Active" : "Fallback Heuristic Diagnostic Bank Active"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isAiOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isAiOnline ? 'Gemini AI Active' : 'Heuristic Engine (Offline Bank)'}</span>
          </div>

          {/* Database Badge */}
          <div 
            title={isMongoOnline ? "MongoDB Atlas Connected" : "Local In-Memory & JSON Vault Active"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isMongoOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isMongoOnline ? 'MongoDB Atlas' : 'Local Session Vault'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 hover:from-amber-400 hover:to-orange-400 transition-all active:scale-95"
            title="Instant 1-Click Judge Demo (High-Impact Misconception Showcase)"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Judge Demo</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Global Learning Analytics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHistory}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Diagnostic Session History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="API Keys & Database Config"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
