import React, { useState } from 'react';
import { ChevronRight, Cpu, ArrowLeft } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-6">
      {/* Quiz Header & Progress */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between text-sm">
          <span className="font-semibold text-indigo-600">
            {quiz.topic}
          </span>
          <span className="font-medium text-slate-500">
            Question {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Clean Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        {/* Concept Badge */}
        <div>
          <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
            Concept: {currentQ.conceptName}
          </span>
        </div>

        {/* Question Text (Large, Clear) */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {currentQ.question}
        </h2>

        {/* Code Snippet Box */}
        {currentQ.code && (
          <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 text-sm font-mono text-indigo-200 overflow-x-auto leading-relaxed shadow-inner">
            <pre className="whitespace-pre">{currentQ.code}</pre>
          </div>
        )}

        {/* Multiple Choice Options */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((opt) => {
            const isSelected = currentAnswer.selectedOptionId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-4 sm:p-5 rounded-2xl border text-base cursor-pointer transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-600 text-slate-900 ring-1 ring-indigo-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {opt.id}
                </div>
                <div className="flex-1 leading-relaxed font-normal">
                  {opt.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Metacognitive Calibration Selector (Clean, Simple) */}
        <div className="pt-6 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              How confident are you in this answer?
            </span>
            <span className="text-xs text-slate-500">
              Helps calibrate true mastery vs guessing
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'low', label: 'Guessing', desc: 'Unsure / 50-50 hunch' },
              { id: 'medium', label: 'Somewhat Sure', desc: 'Reasonable intuition' },
              { id: 'high', label: 'Confident', desc: 'Can explain the mechanism' }
            ].map((lvl) => {
              const isSelected = currentAnswer.confidence === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleSetConfidence(lvl.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-sm mb-0.5">{lvl.label}</div>
                  <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {lvl.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex === total - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Diagnostic'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
