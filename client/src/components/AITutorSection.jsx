import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Lightbulb, 
  Code2, 
  RefreshCw, 
  MessageSquare, 
  Send 
} from 'lucide-react';
import { api } from '../services/api.js';

export default function AITutorSection({
  topic,
  evaluatedQuestions = [],
  onLaunchPractice
}) {
  const incorrectQuestions = evaluatedQuestions.filter(q => !q.isCorrect);

  // Tabs: 'analysis' | 'chat'
  const [activeTab, setActiveTab] = useState('analysis');

  // Store loaded explanations and status by questionId
  const [tutorData, setTutorData] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  // Question-Specific Chat States
  const [openChatMap, setOpenChatMap] = useState({});
  const [chatMessages, setChatMessages] = useState({});
  const [chatInputs, setChatInputs] = useState({});
  const [chatLoading, setChatLoading] = useState({});

  // Global Topic Chat State
  const [globalMessages, setGlobalMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your AI Tutor for **${topic}**.\n\nI diagnose why you made a mistake and what mental model caused it.\n\nAsk me any doubt or choose a suggested question below.`,
      engineNotice: 'AI Tutor Ready'
    }
  ]);
  const [globalInput, setGlobalInput] = useState('');
  const [globalLoading, setGlobalLoading] = useState(false);
  const globalChatEndRef = useRef(null);

  // Auto-fetch tutor analysis for incorrect questions on mount
  useEffect(() => {
    incorrectQuestions.forEach(q => {
      if (!tutorData[q.questionId] && !loadingMap[q.questionId]) {
        fetchTutorExplanation(q);
      }
    });
  }, [evaluatedQuestions]);

  useEffect(() => {
    if (activeTab === 'chat') {
      globalChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalMessages, activeTab]);

  const fetchTutorExplanation = async (q) => {
    setLoadingMap(prev => ({ ...prev, [q.questionId]: true }));
    setErrorMap(prev => ({ ...prev, [q.questionId]: null }));
    try {
      const res = await api.getTutorExplanation({
        topic,
        conceptName: q.conceptName,
        questionText: q.questionText,
        selectedOptionText: `${q.selectedOptionId}: ${q.selectedOptionText}`,
        correctOptionText: `${q.correctOptionId}: ${q.correctOptionText}`,
        misconceptionLabel: q.misconceptionLabel,
        misconceptionExplanation: q.misconceptionExplanation,
        conceptExplanation: q.remediation?.conceptExplanation,
        mentalModelFix: q.remediation?.mentalModelFix,
        remediation: q.remediation,
        code: q.code
      });
      setTutorData(prev => ({ ...prev, [q.questionId]: res }));
    } catch (err) {
      console.error('Failed to load AI Tutor analysis:', err);
      setErrorMap(prev => ({
        ...prev,
        [q.questionId]: err.message || 'Could not load explanation.'
      }));
    } finally {
      setLoadingMap(prev => ({ ...prev, [q.questionId]: false }));
    }
  };

  const handleSendQuestionChat = async (q, customMsg = null) => {
    const textToSend = customMsg || chatInputs[q.questionId];
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = textToSend.trim();
    setChatInputs(prev => ({ ...prev, [q.questionId]: '' }));

    const currentHistory = chatMessages[q.questionId] || [];
    const updatedWithUser = [...currentHistory, { role: 'user', content: userMsg }];
    setChatMessages(prev => ({ ...prev, [q.questionId]: updatedWithUser }));
    setChatLoading(prev => ({ ...prev, [q.questionId]: true }));

    try {
      const res = await api.chatWithTutor({
        topic,
        conceptName: q.conceptName,
        questionContext: `Question: ${q.questionText}\nStudent Choice: ${q.selectedOptionId}: ${q.selectedOptionText}\nCorrect: ${q.correctOptionId}: ${q.correctOptionText}`,
        history: currentHistory.map(m => ({ role: m.role, content: m.content })),
        message: userMsg
      });

      setChatMessages(prev => ({
        ...prev,
        [q.questionId]: [
          ...updatedWithUser,
          { role: 'assistant', content: res.reply, engineNotice: res.engineNotice }
        ]
      }));
    } catch (err) {
      setChatMessages(prev => ({
        ...prev,
        [q.questionId]: [
          ...updatedWithUser,
          { role: 'assistant', content: `⚠️ Could not reach tutor: ${err.message}` }
        ]
      }));
    } finally {
      setChatLoading(prev => ({ ...prev, [q.questionId]: false }));
    }
  };

  const handleSendGlobalChat = async (customMsg = null) => {
    const textToSend = customMsg || globalInput;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = textToSend.trim();
    setGlobalInput('');

    const updatedWithUser = [...globalMessages, { role: 'user', content: userMsg }];
    setGlobalMessages(updatedWithUser);
    setGlobalLoading(true);

    try {
      const res = await api.chatWithTutor({
        topic,
        conceptName: topic,
        questionContext: `Session evaluation: ${evaluatedQuestions.length} questions answered on ${topic}.`,
        history: globalMessages.slice(1).map(m => ({ role: m.role, content: m.content })),
        message: userMsg
      });

      setGlobalMessages([
        ...updatedWithUser,
        { role: 'assistant', content: res.reply, engineNotice: res.engineNotice }
      ]);
    } catch (err) {
      setGlobalMessages([
        ...updatedWithUser,
        { role: 'assistant', content: `⚠️ Could not reach tutor: ${err.message}` }
      ]);
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              AI Tutor
            </h3>
            <p className="text-sm text-slate-500">
              Root-cause cognitive explanations and interactive practice.
            </p>
          </div>
        </div>

        {/* Clean Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-sm font-medium">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'analysis'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mistakes ({incorrectQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COGNITIVE SCHEMA BREAKDOWN */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {incorrectQuestions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                All Concepts Mastered!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                You answered every question correctly with accurate conceptual schemas. Zero misconceptions detected.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {incorrectQuestions.map((q, idx) => {
                const tutor = tutorData[q.questionId];
                const isLoading = loadingMap[q.questionId];
                const isChatOpen = openChatMap[q.questionId];
                const qMessages = chatMessages[q.questionId] || [];
                const isQChatLoading = chatLoading[q.questionId];

                return (
                  <div
                    key={q.questionId || idx}
                    className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm"
                  >
                    {/* Concept Label */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">
                        Concept: {q.conceptName}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {q.misconceptionLabel || 'Misconception diagnosed'}
                      </span>
                    </div>

                    {/* Question Text */}
                    <h4 className="text-lg font-bold text-slate-900 leading-snug">
                      {q.questionText}
                    </h4>

                    {q.code && (
                      <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 text-sm font-mono text-indigo-200 overflow-x-auto leading-relaxed shadow-inner">
                        <pre className="whitespace-pre">{q.code}</pre>
                      </div>
                    )}

                    {/* Side-by-Side: Student Choice vs Invariant Truth */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-slate-900 space-y-1">
                        <span className="block text-xs font-bold uppercase tracking-wider text-rose-700">
                          Your Selected Answer:
                        </span>
                        <p className="font-medium text-sm text-slate-800">{q.selectedOptionId}: {q.selectedOptionText}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-slate-900 space-y-1">
                        <span className="block text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Correct Invariant Answer:
                        </span>
                        <p className="font-medium text-sm text-slate-800">{q.correctOptionId}: {q.correctOptionText}</p>
                      </div>
                    </div>

                    {/* AI Tutor Breakdown Content */}
                    {isLoading ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-3 text-sm text-slate-600 font-medium">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>Formulating explanation...</span>
                      </div>
                    ) : tutor ? (
                      <div className="space-y-4 pt-3 border-t border-slate-100">
                        {/* 1. Why selected was wrong */}
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span>Why your answer was incorrect</span>
                          </span>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal pl-5">
                            {tutor.studentMistake}
                          </p>
                        </div>

                        {/* 2. Why correct is right */}
                        <div className="space-y-1 pt-2">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Why the correct answer is true</span>
                          </span>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal pl-5">
                            {tutor.whyCorrectIsRight}
                          </p>
                        </div>

                        {/* 3. Simple Concrete Example */}
                        {tutor.simpleExample && (
                          <div className="rounded-2xl bg-slate-900 text-indigo-200 p-5 border border-slate-800 text-sm font-mono overflow-x-auto leading-relaxed mt-3">
                            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                              <Code2 className="w-4 h-4 text-indigo-400" />
                              <span>Concrete Invariant Example</span>
                            </div>
                            <pre className="whitespace-pre">{tutor.simpleExample}</pre>
                          </div>
                        )}

                        {/* 4. Mental Model Rule */}
                        {tutor.mentalModelFix && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm flex items-start gap-3 mt-3">
                            <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">Rule of thumb:</span>
                              <p className="text-slate-800 font-medium italic">"{tutor.mentalModelFix}"</p>
                            </div>
                          </div>
                        )}

                        {/* Interactive Tutor Chat Drawer for this Specific Question */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setOpenChatMap(prev => ({ ...prev, [q.questionId]: !prev[q.questionId] }))}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 py-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>
                              {isChatOpen ? 'Hide Chat' : 'Ask a follow-up question to the tutor'}
                            </span>
                          </button>

                          {isChatOpen && (
                            <div className="mt-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                              {/* Prompt chips */}
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSendQuestionChat(q, "Can you explain this with an intuitive analogy?")}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition"
                                >
                                  Intuitive Analogy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendQuestionChat(q, "Show me a code example of how to fix this.")}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition"
                                >
                                  Code Example
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendQuestionChat(q, "Explain this like I'm 10 years old.")}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition"
                                >
                                  Explain Simply
                                </button>
                              </div>

                              {/* Chat message bubbles */}
                              {qMessages.length > 0 && (
                                <div className="space-y-3 max-h-60 overflow-y-auto p-3 bg-white rounded-xl border border-slate-200">
                                  {qMessages.map((m, mIdx) => (
                                    <div
                                      key={mIdx}
                                      className={`flex text-sm ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div
                                        className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                                          m.role === 'user'
                                            ? 'bg-indigo-600 text-white font-normal'
                                            : 'bg-slate-50 text-slate-800 border border-slate-200'
                                        }`}
                                      >
                                        {m.content}
                                      </div>
                                    </div>
                                  ))}
                                  {isQChatLoading && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium p-2">
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                                      <span>Tutor is replying...</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Input box */}
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={chatInputs[q.questionId] || ''}
                                  onChange={(e) => setChatInputs({ ...chatInputs, [q.questionId]: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSendQuestionChat(q)}
                                  placeholder="Type your question..."
                                  className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSendQuestionChat(q)}
                                  disabled={isQChatLoading}
                                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition active:scale-95 disabled:opacity-50"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => fetchTutorExplanation(q)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Re-run analysis</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onLaunchPractice(q)}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2 active:scale-95"
                          >
                            <span>Take Follow-Up Practice</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                          Explanation ready.
                        </p>
                        <button
                          type="button"
                          onClick={() => fetchTutorExplanation(q)}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition active:scale-95"
                        >
                          View Breakdown
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE TUTOR CHAT */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          {/* Quick Prompt Ideas */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSendGlobalChat("Give me an intuitive analogy for this concept.")}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              💡 Intuitive Analogy
            </button>
            <button
              onClick={() => handleSendGlobalChat("Show me a before and after code example fixing the most common pitfall.")}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              💻 Code Example
            </button>
            <button
              onClick={() => handleSendGlobalChat("Explain this concept simply like I am 10 years old.")}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              👶 Explain Simply
            </button>
          </div>

          {/* Conversation Window */}
          <div className="h-[380px] overflow-y-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            {globalMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-sm leading-relaxed ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white font-normal'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {globalLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium p-3">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI Tutor is thinking...</span>
              </div>
            )}
            <div ref={globalChatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={globalInput}
              onChange={(e) => setGlobalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendGlobalChat()}
              placeholder={`Ask the AI Tutor anything about ${topic}...`}
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            <button
              onClick={() => handleSendGlobalChat()}
              disabled={globalLoading || !globalInput.trim()}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
