import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, ChevronRight, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function DiagnosticQuiz({ quiz, onSubmitAnswers, isSubmitting }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Store user selections: Map of questionId -> { selectedOptionId, confidence: 'low'|'medium'|'high' }
  const [answers, setAnswers] = useState({});

  const currentQ = quiz.questions[currentIndex];
  const total = quiz.questions.length;
  const currentAnswer = answers[currentQ.id] || { selectedOptionId: null, confidence: 'medium' };

  const handleSelectOption = (optionId) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOptionId: optionId,
        confidence: prev[currentQ.id]?.confidence || 'medium'
      }
    }));
  };

  const handleSetConfidence = (level) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        confidence: level
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Format submission payload
    const submissions = quiz.questions.map(q => ({
      questionId: q.id,
      selectedOptionId: answers[q.id]?.selectedOptionId || null,
      confidence: answers[q.id]?.confidence || 'medium'
    }));

    onSubmitAnswers(submissions);
  };

  const answeredCount = Object.values(answers).filter(a => a.selectedOptionId).length;
  const isAllAnswered = answeredCount === total;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Quiz Header & Notice */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {quiz.topic}
          </span>
          <span className="text-xs font-medium text-slate-400">
            Question {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Engine Notice Banner */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>{quiz.engineNotice || 'Diagnostic engine active'}</span>
          </div>
          <span className="text-[11px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">
            {quiz.difficulty}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 mb-6 shadow-xl">
        {/* Concept Tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium mb-4">
          <span>Target Concept:</span>
          <strong className="text-white">{currentQ.conceptName}</strong>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug mb-4">
          {currentQ.question}
        </h2>

        {/* Code Snippet Box (if provided) */}
        {currentQ.code && (
          <div className="mb-6 rounded-xl bg-slate-950 p-4 border border-slate-800/80 font-mono text-xs sm:text-sm text-indigo-200 overflow-x-auto shadow-inner leading-relaxed">
            <pre className="code-font whitespace-pre">{currentQ.code}</pre>
          </div>
        )}

        {/* Multiple Choice Options */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt) => {
            const isSelected = currentAnswer.selectedOptionId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-4 rounded-xl border text-sm cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {opt.id}
                </div>
                <div className="flex-1 font-medium leading-relaxed">
                  {opt.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Metacognitive Calibration Selector (Key Hackathon Innovation) */}
        <div className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Metacognitive Calibration — How confident are you?</span>
            </span>
            <span className="text-[11px] text-slate-500">Separates guessing from true mental mastery</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low', label: 'Guessing', desc: 'Unsure / 50-50 hunch', color: 'border-slate-700' },
              { id: 'medium', label: 'Somewhat Sure', desc: 'Reasonable intuition', color: 'border-slate-700' },
              { id: 'high', label: '100% Confident', desc: 'Can explain the mechanism', color: 'border-indigo-500' }
            ].map((lvl) => {
              const isSelected = currentAnswer.confidence === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleSetConfidence(lvl.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{lvl.label}</div>
                  <div className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{lvl.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center gap-1.5">
          {quiz.questions.map((q, idx) => {
            const hasAnswer = Boolean(answers[q.id]?.selectedOptionId);
            return (
              <div
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                  idx === currentIndex
                    ? 'ring-2 ring-indigo-400 bg-indigo-500'
                    : hasAnswer
                    ? 'bg-slate-600'
                    : 'bg-slate-800'
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>

        {currentIndex === total - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !currentAnswer.selectedOptionId}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Diagnose My Gaps</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!currentAnswer.selectedOptionId}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
