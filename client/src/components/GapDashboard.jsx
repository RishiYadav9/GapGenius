import React from 'react';
import { Target, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Flame, ArrowRight, Brain, RotateCcw } from 'lucide-react';
import KnowledgeGraphView from './KnowledgeGraphView.jsx';
import AITutorSection from './AITutorSection.jsx';

export default function GapDashboard({
  result,
  onLaunchRemediation,
  onRetest,
  onBackToTopics
}) {
  const {
    topic,
    overallScore,
    totalQuestions,
    correctCount,
    calibration,
    identifiedGaps = [],
    evaluatedQuestions = [],
    knowledgeGraph,
    savedToDatabase
  } = result;

  const dangerousCount = calibration?.dangerousMisconceptions || 0;
  const luckyCount = calibration?.luckyGuesses || 0;
  const gapCount = identifiedGaps.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      {/* Top Banner / Hero Summary */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Diagnostic Complete
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {savedToDatabase}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Gap Analysis: <span className="text-indigo-600">{topic}</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              We identified <strong className="text-rose-600">{gapCount} conceptual gap{gapCount !== 1 ? 's' : ''}</strong> in your mental model. Consult the AI Tutor below or take targeted remediation to achieve 100% mastery.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[90px] shadow-sm">
              <div className="text-2xl font-black text-slate-900">{overallScore}%</div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Raw Score</div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center min-w-[90px] shadow-sm">
              <div className="text-2xl font-black text-rose-600">{gapCount}</div>
              <div className="text-[10px] font-bold uppercase text-rose-700">Gaps Found</div>
            </div>

            {dangerousCount > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[90px] shadow-sm">
                <div className="text-2xl font-black text-amber-700">{dangerousCount}</div>
                <div className="text-[10px] font-bold uppercase text-amber-800">False Confidence</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Fix First Gap */}
        {gapCount > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
              <span>Priority Recommendation: Address the foundational broken prerequisite first.</span>
            </div>
            <button
              onClick={() => onLaunchRemediation(identifiedGaps[0])}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Fix Priority Gap: {identifiedGaps[0].conceptName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Metacognitive Calibration Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Metacognitive Calibration Matrix (Confidence vs Accuracy)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Psychometric schema</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Quadrant 1: True Mastery */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>True Mastery</span>
              </span>
              <span className="font-mono text-xs font-black text-emerald-900">
                {calibration?.rockSolidMastery || 0}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed">
              High confidence + Correct answer. Strong conceptual schema and stable mental model.
            </p>
          </div>

          {/* Quadrant 2: Dangerous Misconception */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Dangerous Misconception</span>
              </span>
              <span className="font-mono text-xs font-black text-rose-900">
                {dangerousCount}
              </span>
            </div>
            <p className="text-[11px] text-rose-800/80 leading-relaxed">
              High confidence + Wrong answer. The Dunning-Kruger trap: confident in a flawed premise!
            </p>
          </div>

          {/* Quadrant 3: Lucky Guess */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Fragile / Lucky Guess</span>
              </span>
              <span className="font-mono text-xs font-black text-amber-900">
                {luckyCount}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 leading-relaxed">
              Low confidence + Correct answer. Weak conviction; requires conceptual reinforcement.
            </p>
          </div>

          {/* Quadrant 4: Blindspot */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-600" />
                <span>Acknowledged Gap</span>
              </span>
              <span className="font-mono text-xs font-black text-slate-900">
                {calibration?.blindspots || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Low confidence + Wrong answer. Student knows they do not know; high receptivity to learning.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Concept Dependency Graph */}
      {knowledgeGraph && (
        <div>
          <KnowledgeGraphView
            graphData={knowledgeGraph}
            onFixConcept={(conceptId) => {
              const matchedGap = identifiedGaps.find(g => g.conceptId === conceptId) || identifiedGaps[0];
              if (matchedGap) onLaunchRemediation(matchedGap);
            }}
          />
        </div>
      )}

      {/* AI TUTOR SECTION (BUG 2) */}
      <div>
        <AITutorSection
          topic={topic}
          evaluatedQuestions={evaluatedQuestions}
          onLaunchPractice={(q) => {
            const matchedGap = identifiedGaps.find(g => g.conceptId === q.conceptId) || q;
            onLaunchRemediation(matchedGap);
          }}
        />
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBackToTopics}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Choose Another Topic
        </button>

        <button
          onClick={onRetest}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-2 border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Diagnostic</span>
        </button>
      </div>
    </div>
  );
}
