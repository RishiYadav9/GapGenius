import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, ChevronRight, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function DiagnosticQuiz({ quiz, onSubmitAnswers, isSubmitting }) {
  const [currentIndex, setCurrentIndex] = useState(0);
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
    const submissions = quiz.questions.map(q => ({
      questionId: q.id,
      selectedOptionId: answers[q.id]?.selectedOptionId || null,
      confidence: answers[q.id]?.confidence || 'medium'
    }));

    onSubmitAnswers(submissions);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Quiz Header & Notice */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            {quiz.topic}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Question {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Engine Notice Banner */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-medium">{quiz.engineNotice || 'Diagnostic engine active'}</span>
          </div>
          <span className="text-[11px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
            {quiz.difficulty}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-600 to-teal-500 h-2 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md mb-6">
        {/* Concept Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold mb-4">
          <span>Target Concept:</span>
          <strong className="text-slate-900">{currentQ.conceptName}</strong>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-4">
          {currentQ.question}
        </h2>

        {/* Code Snippet Box */}
        {currentQ.code && (
          <div className="mb-6 rounded-xl bg-slate-900 p-4 border border-slate-800 font-mono text-xs sm:text-sm text-indigo-200 overflow-x-auto shadow-inner leading-relaxed">
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
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
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

        {/* Metacognitive Calibration Selector */}
        <div className="pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Metacognitive Calibration — How confident are you?</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500">Separates guessing from true mastery</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'low', label: 'Guessing', desc: 'Unsure / 50-50 hunch' },
              { id: 'medium', label: 'Somewhat Sure', desc: 'Reasonable intuition' },
              { id: 'high', label: '100% Confident', desc: 'Can explain the mechanism' }
            ].map((lvl) => {
              const isSelected = currentAnswer.confidence === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleSetConfidence(lvl.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{lvl.label}</div>
                  <div className="text-[10px] text-slate-500 hidden sm:block mt-0.5">{lvl.desc}</div>
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
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
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
                    ? 'ring-2 ring-indigo-600 bg-indigo-600'
                    : hasAnswer
                    ? 'bg-slate-400'
                    : 'bg-slate-200'
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
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
