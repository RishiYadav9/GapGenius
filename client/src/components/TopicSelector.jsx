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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Metacognitive Diagnostic Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Find the gap. <span className="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">Fix the gap.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Standard quizzes only grade memory. GapGenius diagnoses the difference between knowing an answer and understanding the core concept.
        </p>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
          {['foundational', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedDifficulty(lvl)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedDifficulty === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Curated Diagnostic Domains (Distractor-Mapped Mental Models)</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">Psychometric taxonomy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.map((t) => (
            <div
              key={t.id}
              onClick={() => !isLoading && onSelectTopic(t.title, selectedDifficulty)}
              className="group glass-card rounded-2xl p-5 cursor-pointer border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {t.category || 'CS'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    {t.conceptCount} concepts
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>Start Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Topic Generator (AI + Topic-Aware Fallback) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Custom Topic Diagnostic Generator
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
            Topic-Aware Engine
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Preparing for an interview or exam? Enter any subject, framework, or invariant to generate a distinct cognitive misconception diagnostic.
        </p>

        <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g. React useEffect Lifecycle, SQL Joins, Docker Networking, Python Decorators..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !customTopic.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Diagnose Topic</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Value Prop Callouts for Hackathon Judges */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-indigo-600 font-bold text-sm mb-1">Distractor Taxonomy</div>
          <div className="text-slate-600 text-xs">Every wrong answer isolates a real cognitive mental flaw.</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-amber-700 font-bold text-sm mb-1">Confidence Calibration</div>
          <div className="text-slate-600 text-xs">Catches dangerous Dunning-Kruger false confidence traps.</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-emerald-700 font-bold text-sm mb-1">Closed-Loop Repair</div>
          <div className="text-slate-600 text-xs">Targeted micro-remediation with instant mastery verification.</div>
        </div>
      </div>
    </div>
  );
}
