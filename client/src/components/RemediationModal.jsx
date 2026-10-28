import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';

export default function RemediationModal({
  gap,
  sessionId,
  onClose,
  onVerifyRemediation,
  isVerifying
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [tutorHint, setTutorHint] = useState(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  if (!gap) return null;

  const {
    conceptId,
    conceptName,
    misconceptionLabel,
    misconceptionExplanation,
    remediation
  } = gap;

  const followUpQ = remediation?.followUpQuestion || {
    question: `Follow-up verification check for ${conceptName}: Did the underlying schema change?`,
    options: [
      { id: 'A', text: 'Yes, because the variable rebinds to a new object entirely.', isCorrect: true, explanation: 'Correct! You have successfully resolved this misconception.' },
      { id: 'B', text: 'No, because both variables mutate in tandem permanently.', isCorrect: false, explanation: 'Remember: Reassignment breaks the reference link.' }
    ]
  };

  const handleGetHint = async () => {
    setIsLoadingHint(true);
    try {
      const res = await api.chatWithTutor({
        topic: conceptName,
        conceptName,
        questionContext: followUpQ.question,
        message: 'Give me a brief 1-2 sentence pedagogical hint or rule of thumb for this verification question without giving away the exact option letter.'
      });
      setTutorHint(res.reply);
    } catch (err) {
      setTutorHint(remediation?.mentalModelFix || 'Remember: Trace pointer references vs independent objects in memory.');
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedOptionId) return;

    const payload = {
      sessionId,
      conceptId,
      followUpQuestion: followUpQ,
      selectedOptionId,
      previousScore: 30
    };

    const res = await onVerifyRemediation(payload);
    setVerificationResult(res);

    if (res?.isCorrect) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
              Micro-Remediation • {conceptName}
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Fixing Gap: {misconceptionLabel || 'Conceptual Invariant'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Phase 1: High-Yield Conceptual Fix Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Core Invariant Rule
            </span>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
              {remediation?.conceptExplanation || misconceptionExplanation || 'Re-examine how the language handles pointers vs values.'}
            </p>
          </div>

          {/* Phase 2: Targeted Follow-Up Verification Question */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Practice Challenge
              </span>
              <span className="text-xs text-slate-500">
                Verifies understanding
              </span>
            </div>

            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {followUpQ.question}
            </p>

            {/* AI Tutor Hint Button & Card */}
            <div>
              {!tutorHint ? (
                <button
                  type="button"
                  onClick={handleGetHint}
                  disabled={isLoadingHint}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition disabled:opacity-50"
                >
                  {isLoadingHint ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading hint...</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Get a Hint</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-sm text-indigo-950 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 block">Hint:</span>
                    <p className="leading-relaxed font-normal">{tutorHint}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {followUpQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => !verificationResult && setSelectedOptionId(opt.id)}
                    className={`p-4 sm:p-5 rounded-2xl border text-base cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 text-slate-900 ring-1 ring-indigo-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {opt.id}
                    </div>
                    <div className="flex-1 font-normal leading-relaxed">{opt.text}</div>
                  </div>
                );
              })}
            </div>

            {/* Verification Result Feedback */}
            {verificationResult && (
              <div
                className={`p-5 rounded-2xl border text-sm ${
                  verificationResult.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-slate-900'
                    : 'bg-rose-50 border-rose-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-base">
                    {verificationResult.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-900">Gap Fixed! Concept Mastered</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                        <span className="text-rose-900">Not quite right</span>
                      </>
                    )}
                  </div>

                  {verificationResult.isCorrect && (
                    <div className="flex items-center gap-1 font-bold text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{verificationResult.masteryGain}% Mastery</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-700 leading-relaxed font-normal">
                  {verificationResult.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white"
          >
            {verificationResult ? 'Close' : 'Cancel'}
          </button>

          {!verificationResult ? (
            <button
              onClick={handleVerify}
              disabled={!selectedOptionId || isVerifying}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Understanding'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
