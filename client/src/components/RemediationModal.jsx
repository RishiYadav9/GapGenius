import React, { useState } from 'react';
import { X, Flame, CheckCircle2, AlertCircle, ArrowRight, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RemediationModal({
  gap,
  sessionId,
  onClose,
  onVerifyRemediation,
  isVerifying
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

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
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                  Targeted Micro-Remediation
                </span>
                <span className="text-xs font-semibold text-slate-500">{conceptName}</span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Fixing Gap: {misconceptionLabel || 'Conceptual Model'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Phase 1: High-Yield Conceptual Fix Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>45-Second Schema Fix</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-4 font-medium">
              {remediation?.conceptExplanation || misconceptionExplanation || 'Re-examine how the language handles pointers vs values.'}
            </p>

            {remediation?.mentalModelFix && (
              <div className="p-3.5 rounded-xl bg-white border border-indigo-200 text-xs shadow-sm">
                <span className="font-bold text-indigo-700 block mb-1">
                  💡 Mental Model Analogy:
                </span>
                <span className="text-slate-700 italic leading-relaxed">
                  "{remediation.mentalModelFix}"
                </span>
              </div>
            )}
          </div>

          {/* Phase 2: Targeted Follow-Up Verification Question */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Follow-Up Practice Challenge</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500">Verifies mental model repair</span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-900 mb-4">
              {followUpQ.question}
            </p>

            {/* Options */}
            <div className="space-y-2.5 mb-5">
              {followUpQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => !verificationResult && setSelectedOptionId(opt.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {opt.id}
                    </div>
                    <div className="flex-1 font-medium">{opt.text}</div>
                  </div>
                );
              })}
            </div>

            {/* Verification Result Feedback & Mastery Lift */}
            {verificationResult ? (
              <div
                className={`p-4 rounded-xl border text-xs ${
                  verificationResult.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verificationResult.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Gap Fixed! Concept Mastered!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Still slightly shaky</span>
                      </>
                    )}
                  </div>

                  {verificationResult.isCorrect && (
                    <div className="flex items-center gap-1 font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{verificationResult.masteryGain}% Mastery Lift</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-700 leading-relaxed mb-3">
                  {verificationResult.explanation}
                </p>

                {/* Real-Time Mastery Delta Gauge */}
                {verificationResult.isCorrect && (
                  <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">Concept Mastery Delta:</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-rose-600 line-through">30%</span>
                      <span>➔</span>
                      <strong className="text-emerald-700 text-xs font-bold">85% (Proficient)</strong>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={handleVerify}
                  disabled={!selectedOptionId || isVerifying}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  {isVerifying ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Understanding</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            {verificationResult?.isCorrect ? 'Done — View Updated Dashboard' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
