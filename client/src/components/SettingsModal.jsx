import React, { useState } from 'react';
import { X, Key, Database, CheckCircle2, AlertCircle, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  systemHealth,
  onSaveConfig
}) {
  const [geminiKey, setGeminiKey] = useState('');
  const [mongoUri, setMongoUri] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await onSaveConfig({
        geminiApiKey: geminiKey.trim() || undefined,
        mongoUri: mongoUri.trim() || undefined
      });
      setMessage({ type: 'success', text: 'Settings updated successfully! Engine re-calibrated.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const isAiOnline = systemHealth?.aiEngine?.available;
  const isMongoOnline = systemHealth?.database?.connected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Platform & Infrastructure Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Active Status Overview */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`p-3 rounded-xl border ${isAiOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              <span className="font-bold block mb-0.5">AI Engine</span>
              <span>{isAiOnline ? 'Gemini 1.5 Flash' : 'Topic-Aware Fallback'}</span>
            </div>
            <div className={`p-3 rounded-xl border ${isMongoOnline ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <span className="font-bold block mb-0.5">Database</span>
              <span>{isMongoOnline ? 'MongoDB Atlas' : 'Local Session Vault'}</span>
            </div>
          </div>

          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Google Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={isAiOnline ? "••••••••••••••••••••••••" : "Paste AI Studio key for live custom topics"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank to continue using the topic-aware heuristic diagnostic engine.
            </p>
          </div>

          {/* MongoDB Connection URI */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>MongoDB Atlas Connection URI</span>
            </label>
            <input
              type="text"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              placeholder="mongodb+srv://user:pass@cluster0.mongodb.net/gapgenius"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank to persist data to the built-in Local Session Vault.
            </p>
          </div>

          {/* Zero-Failure Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-800">Zero-Failure Guarantee:</strong> If external keys or database endpoints are not configured, GapGenius operates with 100% functionality via its topic-aware diagnostic banks and JSON session vault.
            </span>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Apply Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
