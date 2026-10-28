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
      // Trigger victory confetti!
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Targeted Micro-Remediation
                </span>
                <span className="text-xs text-slate-400">{conceptName}</span>
              </div>
              <h2 className="text-base font-bold text-white">
                Fixing Gap: {misconceptionLabel || 'Conceptual Model'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Phase 1: High-Yield Conceptual Fix Card */}
          <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>45-Second Schema Fix</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
              {remediation?.conceptExplanation || misconceptionExplanation || 'Re-examine how the language handles pointers vs values.'}
            </p>

            {remediation?.mentalModelFix && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs">
                <span className="font-bold text-indigo-300 block mb-1">
                  💡 Mental Model Analogy:
                </span>
                <span className="text-slate-300 italic leading-relaxed">
                  "{remediation.mentalModelFix}"
                </span>
              </div>
            )}
          </div>

          {/* Phase 2: Targeted Follow-Up Verification Question */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Follow-Up Practice Challenge</span>
              </span>
              <span className="text-[10px] text-slate-500">Verifies mental model repair</span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-100 mb-4">
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
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
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
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verificationResult.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Gap Fixed! Concept Mastered!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Still slightly shaky</span>
                      </>
                    )}
                  </div>

                  {verificationResult.isCorrect && (
                    <div className="flex items-center gap-1 font-mono text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{verificationResult.masteryGain}% Mastery Lift</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-300 leading-relaxed mb-3">
                  {verificationResult.explanation}
                </p>

                {/* Real-Time Mastery Delta Gauge */}
                {verificationResult.isCorrect && (
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Concept Mastery Delta:</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-rose-400 line-through">30%</span>
                      <span>➔</span>
                      <strong className="text-emerald-400 text-xs">85% (Proficient)</strong>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={handleVerify}
                  disabled={!selectedOptionId || isVerifying}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  {isVerifying ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            {verificationResult?.isCorrect ? 'Done — View Updated Dashboard' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
