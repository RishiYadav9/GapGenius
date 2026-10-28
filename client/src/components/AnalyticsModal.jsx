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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Platform Learning Analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <span className="inline-block w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-2" />
              <div>Aggregating diagnostic logs...</div>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                  <div className="text-2xl font-extrabold text-slate-900">{data?.totalAttempts || 0}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Attempts</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                  <div className="text-2xl font-extrabold text-slate-900">{data?.totalGapsFound || 0}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Gaps Found</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                  <div className="text-2xl font-extrabold text-emerald-600">{data?.totalGapsFixed || 0}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Gaps Fixed</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                  <div className="text-2xl font-extrabold text-indigo-600">{data?.fixRate || 0}%</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Repair Rate</div>
                </div>
              </div>

              {/* Dunning-Kruger Insight */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Brain className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold text-slate-900 mb-1">
                    {data?.dangerousMisconceptionsCaught || 0} False Confidence Traps Defused
                  </div>
                  <p className="text-slate-600 leading-relaxed font-normal">
                    Students who answered incorrectly with high confidence were diagnosed and steered away from persistent cognitive blindspots.
                  </p>
                </div>
              </div>

              {/* Persistence storage source */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>Storage Backend:</span>
                </span>
                <span className="font-semibold text-slate-900">{data?.storageBackend || 'Local Vault'}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
