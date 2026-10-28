import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-fade-in space-y-10">
      {/* Top Banner / Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-indigo-600 font-bold uppercase tracking-wider">
                Diagnostic Results
              </span>
              <span>•</span>
              <span>{savedToDatabase}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Gap Analysis: <span className="text-indigo-600">{topic}</span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
              {gapCount === 0 ? (
                <span>Excellent! All concepts mastered with no detected misconceptions.</span>
              ) : (
                <span>
                  We identified <strong className="text-slate-900 font-semibold">{gapCount} conceptual gap{gapCount !== 1 ? 's' : ''}</strong> in your mental model. Consult the AI Tutor below or take targeted practice to repair them.
                </span>
              )}
            </p>
          </div>

          {/* Clean Metric Counters */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[100px]">
              <div className="text-3xl font-extrabold text-slate-900">{overallScore}%</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Raw Score</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[100px]">
              <div className="text-3xl font-extrabold text-slate-900">{gapCount}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Gaps Found</div>
            </div>

            {dangerousCount > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[100px]">
                <div className="text-3xl font-extrabold text-rose-600">{dangerousCount}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">False Confidence</div>
              </div>
            )}
          </div>
        </div>

        {/* Priority Action: Fix First Gap */}
        {gapCount > 0 && (
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-600 font-medium">
              Start with the foundational gap: <strong className="text-slate-900">{identifiedGaps[0].conceptName}</strong>
            </p>
            <button
              onClick={() => onLaunchRemediation(identifiedGaps[0])}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition active:scale-95 flex items-center gap-2"
            >
              <span>Fix Priority Gap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Metacognitive Calibration Matrix (Clean, Uncluttered) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Confidence vs Accuracy Matrix
          </h2>
          <p className="text-sm text-slate-500">
            Identifies false confidence traps and fragile intuition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quadrant 1: True Mastery */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>True Mastery</span>
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {calibration?.rockSolidMastery || 0}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              High confidence and correct answer. Stable mental model.
            </p>
          </div>

          {/* Quadrant 2: Dangerous Misconception */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Misconceptions</span>
              </span>
              <span className="text-lg font-extrabold text-rose-600">
                {dangerousCount}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              High confidence but wrong answer. The Dunning-Kruger false confidence trap.
            </p>
          </div>

          {/* Quadrant 3: Lucky Guess */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Fragile Guesses</span>
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {luckyCount}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Low confidence and correct answer. Weak conviction needing reinforcement.
            </p>
          </div>

          {/* Quadrant 4: Blindspot */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Known Gaps</span>
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {calibration?.blindspots || 0}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Low confidence and wrong answer. Recognized knowledge gap.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Concept Dependency Graph */}
      {knowledgeGraph && (
        <KnowledgeGraphView
          graphData={knowledgeGraph}
          onFixConcept={(conceptId) => {
            const matchedGap = identifiedGaps.find(g => g.conceptId === conceptId) || identifiedGaps[0];
            if (matchedGap) onLaunchRemediation(matchedGap);
          }}
        />
      )}

      {/* AI TUTOR SECTION */}
      <AITutorSection
        topic={topic}
        evaluatedQuestions={evaluatedQuestions}
        onLaunchPractice={(q) => {
          const matchedGap = identifiedGaps.find(g => g.conceptId === q.conceptId) || q;
          onLaunchRemediation(matchedGap);
        }}
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBackToTopics}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
        >
          ← Choose Another Topic
        </button>

        <button
          onClick={onRetest}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Diagnostic</span>
        </button>
      </div>
    </div>
  );
}
