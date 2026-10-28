import React, { useState } from 'react';
import { Bot, Sparkles, BookOpen, CheckCircle2, AlertCircle, ArrowRight, Lightbulb, Code2, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';

export default function AITutorSection({
  topic,
  evaluatedQuestions = [],
  onLaunchPractice
}) {
  const incorrectQuestions = evaluatedQuestions.filter(q => !q.isCorrect);

  // Store loaded explanations by questionId
  const [tutorData, setTutorData] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const handleFetchTutor = async (q) => {
    setLoadingMap(prev => ({ ...prev, [q.questionId]: true }));
    try {
      const res = await api.getTutorExplanation({
        topic,
        conceptName: q.conceptName,
        questionText: q.questionText,
        selectedOptionText: `${q.selectedOptionId}: ${q.selectedOptionText}`,
        correctOptionText: `${q.correctOptionId}: ${q.correctOptionText}`,
        misconceptionLabel: q.misconceptionLabel,
        code: q.code
      });
      setTutorData(prev => ({ ...prev, [q.questionId]: res }));
    } catch (err) {
      console.error('Failed to load AI Tutor analysis:', err);
    } finally {
      setLoadingMap(prev => ({ ...prev, [q.questionId]: false }));
    }
  };

  if (incorrectQuestions.length === 0) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-base font-bold text-emerald-900 mb-1">
          Flawless Concept Mastery!
        </h3>
        <p className="text-xs text-emerald-700 max-w-md mx-auto">
          You answered all questions correctly with accurate conceptual schemas. The AI Tutor has verified zero cognitive misconceptions in this session.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                GapGenius AI Tutor Hub
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Cognitive Schema Analysis
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized breakdown of mental flaws, correct invariants, and concrete examples.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
          {incorrectQuestions.length} Misconception{incorrectQuestions.length > 1 ? 's' : ''} to Repair
        </span>
      </div>

      {/* Cards for Each Mistake */}
      <div className="space-y-6">
        {incorrectQuestions.map((q, idx) => {
          const tutor = tutorData[q.questionId];
          const isLoading = loadingMap[q.questionId];

          return (
            <div
              key={q.questionId || idx}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 transition-all hover:border-slate-300"
            >
              {/* Question Context */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  Concept: {q.conceptName}
                </span>
                <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Misconception: {q.misconceptionLabel || 'Schema Flaw'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-3">
                {q.questionText}
              </h4>

              {q.code && (
                <div className="mb-4 rounded-xl bg-slate-900 p-3.5 border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto shadow-inner">
                  <pre className="code-font whitespace-pre">{q.code}</pre>
                </div>
              )}

              {/* Your Answer vs Correct Answer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <span className="block font-bold uppercase tracking-wider text-[10px] text-rose-600 mb-0.5">
                    Your Selected Answer (Flawed Assumption):
                  </span>
                  <span className="font-medium">{q.selectedOptionId}: {q.selectedOptionText}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="block font-bold uppercase tracking-wider text-[10px] text-emerald-600 mb-0.5">
                    Correct Invariant Answer:
                  </span>
                  <span className="font-medium">{q.correctOptionId}: {q.correctOptionText}</span>
                </div>
              </div>

              {/* AI Tutor Breakdown Content */}
              {tutor ? (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-4 animate-fade-in">
                  {/* Engine Label */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{tutor.engineNotice || 'GapGenius Pedagogical Tutor'}</span>
                  </div>

                  {/* 1. Why selected was wrong */}
                  <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-xs shadow-sm">
                    <span className="font-bold text-rose-700 block mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Why your answer was incorrect:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {tutor.studentMistake}
                    </p>
                  </div>

                  {/* 2. Why correct is right */}
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs shadow-sm">
                    <span className="font-bold text-emerald-700 block mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Why the correct answer is true:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {tutor.whyCorrectIsRight}
                    </p>
                  </div>

                  {/* 3. Simple Concrete Example */}
                  {tutor.simpleExample && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-indigo-100 border border-slate-800 text-xs shadow-inner">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1.5">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Concrete Code / Logic Example:</span>
                      </div>
                      <pre className="code-font whitespace-pre leading-relaxed overflow-x-auto text-[11px]">
                        {tutor.simpleExample}
                      </pre>
                    </div>
                  )}

                  {/* 4. Mental Model Analogy */}
                  {tutor.mentalModelFix && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                      <span className="font-bold text-amber-800 block mb-0.5 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mental Model Rule of Thumb:</span>
                      </span>
                      <p className="text-amber-900 italic">
                        "{tutor.mentalModelFix}"
                      </p>
                    </div>
                  )}

                  {/* Launch Targeted Practice Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onLaunchPractice(q)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <span>Take Targeted Follow-Up Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    Get an in-depth breakdown of the cognitive flaw and illustrative example.
                  </p>
                  <button
                    onClick={() => handleFetchTutor(q)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    {isLoading ? (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                    <span>{isLoading ? 'Analyzing...' : 'Ask AI Tutor to Explain'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
