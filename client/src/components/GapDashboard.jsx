import React from 'react';
import { Target, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Flame, ArrowRight, Brain, RotateCcw } from 'lucide-react';
import KnowledgeGraphView from './KnowledgeGraphView.jsx';

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
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Banner / Hero Summary */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 mb-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Diagnostic Complete
              </span>
              <span className="text-xs text-slate-400">
                {savedToDatabase}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Gap Analysis: <span className="text-indigo-400">{topic}</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              We identified <strong className="text-rose-400">{gapCount} conceptual gaps</strong> in your mental model. Follow the targeted remediation plan below to achieve 100% mastery.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
              <div className="text-2xl font-black text-white">{overallScore}%</div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">Raw Score</div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center min-w-[90px]">
              <div className="text-2xl font-black text-rose-400">{gapCount}</div>
              <div className="text-[10px] font-semibold uppercase text-rose-300">Gaps Found</div>
            </div>

            {dangerousCount > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center min-w-[90px]">
                <div className="text-2xl font-black text-amber-400">{dangerousCount}</div>
                <div className="text-[10px] font-semibold uppercase text-amber-300">False Confidence</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Fix First Gap */}
        {gapCount > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span>Priority: Start with the foundational broken prerequisite.</span>
            </div>
            <button
              onClick={() => onLaunchRemediation(identifiedGaps[0])}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Fix Priority Gap: {identifiedGaps[0].conceptName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Metacognitive Calibration Matrix (Key Hackathon Differentiator) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Metacognitive Calibration Matrix (Confidence vs Accuracy)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Psychometric schema</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Quadrant 1: True Mastery */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>True Mastery</span>
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {calibration?.rockSolidMastery || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              High confidence + Correct answer. Strong conceptual schema and stable mental model.
            </p>
          </div>

          {/* Quadrant 2: Dangerous Misconception */}
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/30 shadow-sm shadow-rose-500/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Dangerous Misconception</span>
              </span>
              <span className="font-mono text-xs font-bold text-rose-300">
                {dangerousCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              High confidence + Wrong answer. The Dunning-Kruger trap: confident in a flawed premise!
            </p>
          </div>

          {/* Quadrant 3: Lucky Guess */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Fragile / Lucky Guess</span>
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {luckyCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Low confidence + Correct answer. Weak conviction; requires conceptual reinforcement.
            </p>
          </div>

          {/* Quadrant 4: Blindspot */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-400" />
                <span>Acknowledged Gap</span>
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {calibration?.blindspots || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Low confidence + Wrong answer. Student knows they do not know; high receptivity to learning.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Concept Dependency Graph */}
      {knowledgeGraph && (
        <div className="mb-8">
          <KnowledgeGraphView
            graphData={knowledgeGraph}
            onFixConcept={(conceptId) => {
              const matchedGap = identifiedGaps.find(g => g.conceptId === conceptId) || identifiedGaps[0];
              if (matchedGap) onLaunchRemediation(matchedGap);
            }}
          />
        </div>
      )}

      {/* Detailed Cognitive Breakdown of Diagnosed Errors */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Cognitive Misconception Breakdown (Why You Made Each Error)</span>
        </h2>

        <div className="space-y-4">
          {evaluatedQuestions.map((eq, idx) => {
            const isCorrect = eq.isCorrect;
            return (
              <div
                key={eq.questionId || idx}
                className={`glass-panel rounded-2xl p-5 sm:p-6 border transition-all ${
                  isCorrect
                    ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                    : 'border-rose-500/30 bg-rose-500/[0.03]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isCorrect ? '✓' : '✕'}
                    </span>
                    <span className="text-xs font-bold text-white">
                      Concept: {eq.conceptName}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      isCorrect
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    Confidence: {eq.confidence} • {eq.calibrationType.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-200 mb-3">
                  {eq.questionText}
                </p>

                {eq.code && (
                  <div className="mb-3 p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-200 border border-slate-800/80 overflow-x-auto">
                    <pre className="code-font whitespace-pre">{eq.code}</pre>
                  </div>
                )}

                {/* Selected vs Correct */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs">
                  <div className={`p-2.5 rounded-xl border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                    <span className="font-semibold block text-[10px] uppercase tracking-wider text-slate-400">
                      Your Answer:
                    </span>
                    <span>{eq.selectedOptionId}: {eq.selectedOptionText}</span>
                  </div>

                  {!isCorrect && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      <span className="font-semibold block text-[10px] uppercase tracking-wider text-slate-400">
                        Correct Answer:
                      </span>
                      <span>{eq.correctOptionId}: {eq.correctOptionText}</span>
                    </div>
                  )}
                </div>

                {/* Diagnosed Mental Model Flaw */}
                {!isCorrect && eq.misconceptionExplanation && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/20 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Diagnosed Misconception: {eq.misconceptionLabel}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {eq.misconceptionExplanation}
                    </p>
                  </div>
                )}

                {/* Action to fix if incorrect */}
                {!isCorrect && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onLaunchRemediation(eq)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Repair Mental Model</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBackToTopics}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← Choose Another Topic
        </button>

        <button
          onClick={onRetest}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Diagnostic</span>
        </button>
      </div>
    </div>
  );
}
