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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Platform & Infrastructure Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Active Status Overview */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`p-3 rounded-xl border ${isAiOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
              <span className="font-semibold block mb-0.5">AI Engine</span>
              <span>{isAiOnline ? 'Gemini 1.5 Flash' : 'Curated Bank (Fallback)'}</span>
            </div>
            <div className={`p-3 rounded-xl border ${isMongoOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}>
              <span className="font-semibold block mb-0.5">Database</span>
              <span>{isMongoOnline ? 'MongoDB Atlas' : 'Local Session Vault'}</span>
            </div>
          </div>

          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank to continue using the pre-calibrated expert fallback bank.
            </p>
          </div>

          {/* MongoDB Connection URI */}
          <div>
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>MongoDB Atlas Connection URI</span>
            </label>
            <input
              type="text"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              placeholder="mongodb+srv://user:pass@cluster0.mongodb.net/gapgenius"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank to persist data to the built-in Local Session Vault.
            </p>
          </div>

          {/* Zero-Failure Notice */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Failure Guarantee:</strong> If external keys or database endpoints are not configured, GapGenius operates with 100% functionality via its local diagnostic banks and JSON session vault.
            </span>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Apply Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
