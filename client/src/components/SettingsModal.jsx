import React, { useState } from 'react';
import { X, Key, Database, CheckCircle2, AlertCircle, Sparkles, ExternalLink, ShieldCheck, Cpu, RefreshCw, Terminal } from 'lucide-react';
import { api } from '../services/api.js';

export default function SettingsModal({
  isOpen,
  onClose,
  systemHealth,
  onSaveConfig
}) {
  const currentEngine = systemHealth?.aiEngine;
  const [aiProvider, setAiProvider] = useState(currentEngine?.activeProvider === 'gemini' ? 'gemini' : 'ollama');
  const [ollamaHost, setOllamaHost] = useState(currentEngine?.ollama?.host || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(currentEngine?.ollama?.model || 'llama3');
  const [geminiKey, setGeminiKey] = useState('');
  const [mongoUri, setMongoUri] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(currentEngine?.ollama || null);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleTestOllama = async () => {
    setIsTestingOllama(true);
    try {
      const res = await api.getOllamaStatus();
      setOllamaStatus(res);
      if (res.available) {
        setMessage({
          type: 'success',
          text: `Connected to Ollama! Found models: ${res.installedModels.length ? res.installedModels.join(', ') : 'None pulled yet'}`
        });
      } else {
        setMessage({
          type: 'warning',
          text: `Ollama is offline at ${ollamaHost}. Falling back safely to Topic-Aware engine.`
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error pinging Ollama: ' + err.message });
    } finally {
      setIsTestingOllama(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await onSaveConfig({
        aiProvider,
        ollamaHost: ollamaHost.trim() || undefined,
        ollamaModel: ollamaModel.trim() || undefined,
        geminiApiKey: geminiKey.trim() || undefined,
        mongoUri: mongoUri.trim() || undefined
      });
      setMessage({ type: 'success', text: 'Configuration applied successfully!' });
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
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            System Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Active Status Overview */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-xs uppercase tracking-wider text-slate-500 block mb-1">AI Engine</span>
              <span className="font-medium text-slate-900">
                {currentEngine?.engineName || (isAiOnline ? 'AI Connected' : 'Topic-Aware Fallback')}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-xs uppercase tracking-wider text-slate-500 block mb-1">Persistence</span>
              <span className="font-medium text-slate-900">{isMongoOnline ? 'MongoDB Atlas' : 'Local Storage'}</span>
            </div>
          </div>

          {/* AI Provider Switcher */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 block">
              Primary AI Engine Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAiProvider('ollama')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  aiProvider === 'ollama'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>Ollama (Local)</span>
                  {aiProvider === 'ollama' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  On-device inference via localhost:11434
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAiProvider('gemini')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  aiProvider === 'gemini'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>Google Gemini</span>
                  {aiProvider === 'gemini' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Cloud inference via API key
                </div>
              </button>
            </div>
          </div>

          {/* Ollama Configuration Section */}
          {aiProvider === 'ollama' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  Ollama Settings
                </span>
                <button
                  type="button"
                  onClick={handleTestOllama}
                  disabled={isTestingOllama}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingOllama ? 'animate-spin' : ''}`} />
                  <span>{isTestingOllama ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Host URL
                  </label>
                  <input
                    type="text"
                    value={ollamaHost}
                    onChange={(e) => setOllamaHost(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Model (OLLAMA_MODEL)
                  </label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="llama3"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Gemini API Key */}
          {aiProvider === 'gemini' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900">
                  Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter Gemini API Key..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          )}

          {/* MongoDB Connection URI */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">
              MongoDB Atlas Connection URI
            </label>
            <input
              type="password"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              placeholder="mongodb+srv://user:pass@cluster0.mongodb.net/gapgenius"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
            />
            <p className="text-xs text-slate-500">
              Atlas connection is active. Leave blank to preserve current credentials.
            </p>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-2.5 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 
              message.type === 'warning' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
              'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Apply Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
