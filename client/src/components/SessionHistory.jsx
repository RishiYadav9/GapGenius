import React, { useEffect, useState } from 'react';
import { X, History, Layers, CheckCircle2, AlertCircle, ArrowRight, Database } from 'lucide-react';
import { api } from '../services/api.js';

export default function SessionHistory({ isOpen, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await api.getSessions();
      setSessions(res.sessions || []);
    } catch (e) {
      console.warn('Failed to load sessions', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Diagnostic Session History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <span className="inline-block w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-2" />
              <div>Fetching history from storage...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              No diagnostic attempts recorded yet. Take your first quiz!
            </div>
          ) : (
            sessions.map((sess, idx) => (
              <div
                key={sess._id || sess.id || idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xs font-bold text-slate-900">{sess.topic}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                      {sess.difficulty || 'intermediate'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span>Score: <strong className="text-slate-900">{sess.overallScore}%</strong></span>
                    <span>•</span>
                    <span className="text-rose-600 font-semibold">{sess.gapsIdentified || 0} gaps found</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{sess.gapsFixed || 0} fixed</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 mb-1">
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {sess.engineUsed === 'gemini-ai' ? 'Gemini AI' : 'Heuristic'}
                  </span>
                </div>
              </div>
            ))
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
