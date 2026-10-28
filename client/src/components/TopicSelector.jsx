import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers, Compass, Search } from 'lucide-react';

export default function TopicSelector({ topics = [], onSelectTopic, isLoading }) {
  const [customTopic, setCustomTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    onSelectTopic(customTopic.trim(), selectedDifficulty);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-fade-in space-y-12">
      {/* Clean Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find the gap. <span className="text-indigo-600">Fix the gap.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Conventional tests measure what you memorized. GapGenius diagnoses what you fundamentally misunderstand and helps you fix it.
        </p>

        {/* Clean Difficulty Tabs */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            {['foundational', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  selectedDifficulty === lvl
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Topic Generator Search Bar */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-3">
          <label className="block text-base font-bold text-slate-900">
            Learn Any Custom Topic
          </label>
          <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter any subject (e.g. React useEffect, SQL Joins, Docker Networking)..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !customTopic.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition active:scale-95 disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Generating...' : 'Start Diagnostic'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-slate-500">
            Generates 3 diagnostic questions mapped directly to underlying cognitive invariants.
          </p>
        </div>
      </div>

      {/* Curated Diagnostic Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <span>Curated Topics</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {topics.length} diagnostic domains available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topics.map((t) => (
            <div
              key={t.id}
              onClick={() => !isLoading && onSelectTopic(t.title, selectedDifficulty)}
              className="bg-white rounded-2xl p-6 cursor-pointer border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-wider text-indigo-600">
                    {t.category || 'Topic'}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    {t.conceptCount} concepts
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {t.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>Start Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
