import React, { useEffect, useState } from 'react';
import { X, BarChart2, TrendingUp, Target, Flame, Brain, Database } from 'lucide-react';
import { api } from '../services/api.js';

export default function AnalyticsModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (e) {
      console.warn('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Platform Learning Analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <span className="inline-block w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-2" />
              <div>Aggregating diagnostic logs...</div>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xl font-black text-white">{data?.totalAttempts || 0}</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-400">Total Attempts</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
                  <div className="text-xl font-black text-rose-400">{data?.totalGapsFound || 0}</div>
                  <div className="text-[10px] font-semibold uppercase text-rose-300">Gaps Isolated</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <div className="text-xl font-black text-emerald-400">{data?.totalGapsFixed || 0}</div>
                  <div className="text-[10px] font-semibold uppercase text-emerald-300">Gaps Fixed</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                  <div className="text-xl font-black text-indigo-400">{data?.fixRate || 0}%</div>
                  <div className="text-[10px] font-semibold uppercase text-indigo-300">Remediation Rate</div>
                </div>
              </div>

              {/* Dunning-Kruger Insight */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Brain className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-amber-300 mb-0.5">
                    {data?.dangerousMisconceptionsCaught || 0} False Confidence Traps Defused
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Students who answered incorrectly with 100% confidence were steered away from persistent cognitive blindspots before final exams.
                  </p>
                </div>
              </div>

              {/* Persistence storage source */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Active Persistence Backend:</span>
                </span>
                <span className="font-bold text-white">{data?.storageBackend || 'Local Session Vault'}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
