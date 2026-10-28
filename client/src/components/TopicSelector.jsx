import React, { useState } from 'react';
import { BookOpen, Sparkles, ArrowRight, Layers, ShieldCheck, Flame, Compass, HelpCircle } from 'lucide-react';

export default function TopicSelector({ topics = [], onSelectTopic, isLoading }) {
  const [customTopic, setCustomTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    onSelectTopic(customTopic.trim(), selectedDifficulty);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Metacognitive Diagnostic Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Find the gap. <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Fix the gap.</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Standard quizzes only grade memory. GapGenius diagnoses the difference between knowing an answer and understanding the core concept.
        </p>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
          {['foundational', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedDifficulty(lvl)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedDifficulty === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Curated Diagnostic Topics */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Curated Diagnostic Domains (High-Yield Concept Models)</span>
          </h2>
          <span className="text-xs text-slate-500">Distractor-mapped</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.map((t) => (
            <div
              key={t.id}
              onClick={() => !isLoading && onSelectTopic(t.title, selectedDifficulty)}
              className="group glass-card rounded-2xl p-5 cursor-pointer hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {t.category || 'CS'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    {t.conceptCount} concepts
                  </span>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors mb-2">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>Start Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Topic Generator (AI Powered) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <h2 className="text-sm font-semibold text-white">
            Custom Topic Diagnostic Generator
          </h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
            Dynamic AI
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Have an exam coming up? Enter any subject, framework, or algorithm to generate an on-the-fly misconception diagnostic.
        </p>

        <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g. React useEffect Lifecycle, Docker Networking, SQL Joins..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !customTopic.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Diagnose Topic</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Value Prop Callout for Hackathon Judges */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
          <div className="text-indigo-400 font-bold text-sm mb-1">Distractor Taxonomy</div>
          <div className="text-slate-400 text-xs">Every wrong answer isolates a real cognitive mental flaw.</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
          <div className="text-amber-400 font-bold text-sm mb-1">Confidence Calibration</div>
          <div className="text-slate-400 text-xs">Catches dangerous Dunning-Kruger false confidence traps.</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
          <div className="text-emerald-400 font-bold text-sm mb-1">Closed-Loop Repair</div>
          <div className="text-slate-400 text-xs">Targeted micro-remediation with instant mastery verification.</div>
        </div>
      </div>
    </div>
  );
}
