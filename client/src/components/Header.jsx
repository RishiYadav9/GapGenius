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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-[1px] shadow-sm shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
            <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                GapGenius
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                MVP
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
              Find the gap. Fix the gap.
            </p>
          </div>
        </div>

        {/* Live System Badges */}
        <div className="hidden md:flex items-center gap-2">
          {/* AI Badge */}
          <div 
            title={isAiOnline ? "Gemini AI Engine Active" : "Topic-Aware Heuristic Diagnostic Engine Active"}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isAiOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isAiOnline ? 'Gemini AI Active' : 'Heuristic Engine (Offline)'}</span>
          </div>

          {/* Database Badge */}
          <div 
            title={isMongoOnline ? "MongoDB Atlas Connected" : "Local In-Memory & JSON Vault Active"}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isMongoOnline 
                ? 'bg-teal-50 text-teal-700 border-teal-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
            title="Instant 1-Click Judge Demo (High-Impact Misconception Showcase)"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Judge Demo</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Global Learning Analytics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHistory}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Diagnostic Session History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="API Keys & Database Config"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
