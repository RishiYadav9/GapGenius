import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import TopicSelector from './components/TopicSelector.jsx';
import DiagnosticQuiz from './components/DiagnosticQuiz.jsx';
import GapDashboard from './components/GapDashboard.jsx';
import RemediationModal from './components/RemediationModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import AnalyticsModal from './components/AnalyticsModal.jsx';
import SessionHistory from './components/SessionHistory.jsx';
import { api } from './services/api.js';

export default function App() {
  const [view, setView] = useState('topic'); // 'topic' | 'quiz' | 'dashboard'
  const [systemHealth, setSystemHealth] = useState(null);
  const [topics, setTopics] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [activeRemediationGap, setActiveRemediationGap] = useState(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load initial health & curated topics
  useEffect(() => {
    checkHealth();
    loadTopics();
  }, []);

  const checkHealth = async () => {
    try {
      const health = await api.getHealth();
      setSystemHealth(health);
    } catch (e) {
      console.warn('Health check failed', e);
    }
  };

  const loadTopics = async () => {
    try {
      const data = await api.getTopics();
      setTopics(data.topics || []);
    } catch (e) {
      console.warn('Failed to load topics', e);
    }
  };

  // Launch diagnostic quiz
  const handleSelectTopic = async (topicTitle, difficulty) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const quiz = await api.generateQuiz(topicTitle, difficulty, 3);
      setActiveQuiz(quiz);
      setView('quiz');
    } catch (err) {
      setErrorMessage('Failed to generate diagnostic quiz: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit diagnostic quiz answers
  const handleSubmitQuiz = async (submissions) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await api.evaluateQuiz(activeQuiz.quizId, submissions);
      setEvaluationResult(result);
      setView('dashboard');
    } catch (err) {
      setErrorMessage('Evaluation failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Follow-up remediation verification
  const handleVerifyRemediation = async (payload) => {
    setIsVerifying(true);
    try {
      const res = await api.verifyRemediation({
        ...payload,
        sessionId: evaluationResult?.sessionId
      });

      // Update local evaluation result so the dashboard and graph reflect the repaired gap
      if (res?.isCorrect && evaluationResult) {
        setEvaluationResult(prev => {
          const updatedGaps = prev.identifiedGaps.filter(g => g.conceptId !== payload.conceptId);
          const updatedNodes = prev.knowledgeGraph.nodes.map(n => {
            if (n.id === payload.conceptId) {
              return { ...n, status: 'mastered', score: res.postScore, color: '#22c55e' };
            }
            return n;
          });

          return {
            ...prev,
            identifiedGaps: updatedGaps,
            knowledgeGraph: {
              ...prev.knowledgeGraph,
              nodes: updatedNodes
            }
          };
        });
      }

      return res;
    } catch (err) {
      console.error('Failed to verify remediation', err);
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  // Instant 1-Click Judge Demo (Showcases Dunning-Kruger trap & closed-loop remediation immediately)
  const handleTriggerJudgeDemo = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const quiz = await api.generateQuiz('Python Memory & Object Mutability', 'intermediate', 3);
      setActiveQuiz(quiz);

      // Pre-engineered submissions that trigger a Dunning-Kruger trap (Question 1 answered with Option A with HIGH confidence)
      const demoSubmissions = [
        { questionId: quiz.questions[0].id, selectedOptionId: 'A', confidence: 'high' },
        { questionId: quiz.questions[1].id, selectedOptionId: 'B', confidence: 'medium' },
        { questionId: quiz.questions[2].id, selectedOptionId: 'A', confidence: 'low' }
      ];

      const result = await api.evaluateQuiz(quiz.quizId, demoSubmissions);
      setEvaluationResult(result);
      setView('dashboard');
    } catch (err) {
      setErrorMessage('Judge demo failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('topic');
    setActiveQuiz(null);
    setEvaluationResult(null);
    setActiveRemediationGap(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <Header
        systemHealth={systemHealth}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onTriggerDemo={handleTriggerJudgeDemo}
        onReset={handleReset}
      />

      {/* Error alert */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-sm">
            <span className="font-medium">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="font-semibold underline ml-3 text-rose-900">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {view === 'topic' && (
          <TopicSelector
            topics={topics}
            onSelectTopic={handleSelectTopic}
            isLoading={isLoading}
          />
        )}

        {view === 'quiz' && activeQuiz && (
          <DiagnosticQuiz
            quiz={activeQuiz}
            onSubmitAnswers={handleSubmitQuiz}
            isSubmitting={isSubmitting}
          />
        )}

        {view === 'dashboard' && evaluationResult && (
          <GapDashboard
            result={evaluationResult}
            onLaunchRemediation={(gap) => setActiveRemediationGap(gap)}
            onRetest={() => setView('quiz')}
            onBackToTopics={handleReset}
          />
        )}
      </main>

      {/* Remediation Modal (The "Fix the Gap" phase) */}
      <RemediationModal
        gap={activeRemediationGap}
        sessionId={evaluationResult?.sessionId}
        onClose={() => setActiveRemediationGap(null)}
        onVerifyRemediation={handleVerifyRemediation}
        isVerifying={isVerifying}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemHealth={systemHealth}
        onSaveConfig={async (cfg) => {
          const res = await api.updateConfig(cfg);
          await checkHealth();
          return res;
        }}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* Session History Modal */}
      <SessionHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-600">GapGenius — AI-Powered Personalized Diagnostic Engine</span>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Find the gap. Fix the gap.
          </span>
        </div>
      </footer>
    </div>
  );
}
