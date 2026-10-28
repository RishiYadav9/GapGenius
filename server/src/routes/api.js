import express from 'express';
import { getDBStatus, connectDB } from '../db/connection.js';
import { AIService } from '../services/aiService.js';
import { OllamaService } from '../services/ollamaService.js';
import { DiagnosticEngine } from '../services/diagnosticEngine.js';
import { SessionRepository } from '../models/Session.js';
import { FALLBACK_TOPICS } from '../data/fallbackBanks.js';
import { config, updateRuntimeConfig } from '../config/env.js';

const router = express.Router();

// In-memory cache for active quiz generation to secure evaluation on backend
const activeQuizzes = new Map();

/**
 * Health & Infrastructure Status Check
 */
router.get('/health', async (req, res) => {
  const dbStatus = getDBStatus();
  const aiStatus = await AIService.getEngineStatus();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-hackathon-mvp',
    database: {
      connected: dbStatus.connected,
      mode: dbStatus.mode,
      databaseName: dbStatus.databaseName,
      lastError: dbStatus.lastError
    },
    aiEngine: {
      available: aiStatus.aiAvailable,
      activeProvider: aiStatus.activeProvider,
      engineName: aiStatus.engineName,
      model: aiStatus.model,
      isFallbackMode: aiStatus.isFallbackMode,
      ollama: aiStatus.ollama,
      gemini: aiStatus.gemini
    }
  });
});

/**
 * Ollama Local Daemon Inspection & Status
 */
router.get('/ollama/status', async (req, res) => {
  try {
    const status = await OllamaService.checkAvailability();
    res.json({
      ...status,
      instructions: !status.available ? [
        "1. Download and install Ollama from https://ollama.com",
        "2. Start the Ollama daemon: `ollama serve` (default at http://localhost:11434)",
        `3. Pull your target model in a terminal: \`ollama pull ${config.ollamaModel || 'llama3'}\``
      ] : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get Available Pre-calibrated Topics
 */
router.get('/topics', (req, res) => {
  const topics = FALLBACK_TOPICS.map(t => ({
    id: t.id,
    title: t.title,
    category: t.category,
    description: t.description,
    conceptCount: t.concepts.length,
    concepts: t.concepts
  }));

  res.json({ topics });
});

/**
 * Generate Diagnostic Quiz
 * Evaluates with Gemini AI if key is present; otherwise utilizes expert fallback bank.
 * Answers are stored securely on server; sanitized questions sent to client.
 */
router.post('/diagnostic/generate', async (req, res) => {
  try {
    const rawTopic = req.body?.topic || req.body?.topicQuery || req.body?.subject || req.body?.title || '';
    const topic = typeof rawTopic === 'string' && rawTopic.trim().length > 0 ? rawTopic.trim() : 'Python Memory & Object Mutability';
    const difficulty = (req.body?.difficulty || 'intermediate').toLowerCase().trim();
    const questionCount = parseInt(req.body?.questionCount, 10) || 3;

    const quizData = await AIService.generateDiagnosticQuiz(topic, difficulty, questionCount);
    const quizId = 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // Cache full questions (including ground truth answers & remediation) securely on server
    activeQuizzes.set(quizId, {
      ...quizData,
      quizId,
      createdAt: Date.now()
    });

    // Clean up old active quizzes (> 1 hour old)
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, q] of activeQuizzes.entries()) {
      if (q.createdAt < oneHourAgo) activeQuizzes.delete(id);
    }

    // Sanitize questions for client: Strip `isCorrect` & `misconception` to prevent inspection
    const sanitizedQuestions = quizData.questions.map(q => ({
      id: q.id,
      conceptId: q.conceptId,
      conceptName: q.conceptName,
      difficulty: q.difficulty,
      question: q.question,
      code: q.code || null,
      options: q.options.map(o => ({
        id: o.id,
        text: o.text
      }))
    }));

    res.json({
      quizId,
      topic: quizData.topic,
      topicId: quizData.topicId,
      difficulty: quizData.difficulty,
      engineUsed: quizData.engineUsed,
      isAiGenerated: quizData.isAiGenerated,
      engineNotice: quizData.engineNotice,
      concepts: quizData.concepts,
      questions: sanitizedQuestions
    });
  } catch (err) {
    console.error('[API /diagnostic/generate] Error:', err);
    res.status(500).json({ error: 'Failed to generate quiz', details: err.message });
  }
});

/**
 * Secure Backend Diagnostic Evaluation
 */
router.post('/diagnostic/evaluate', async (req, res) => {
  try {
    const { quizId, submissions = [] } = req.body;

    const activeQuiz = activeQuizzes.get(quizId);
    if (!activeQuiz) {
      return res.status(404).json({ error: 'Quiz session expired or not found. Please regenerate.' });
    }

    // Perform diagnostic evaluation
    const evalResult = DiagnosticEngine.evaluateSubmission(activeQuiz.questions, submissions);

    // Calculate initial mastery
    const initialMastery = evalResult.overallScore;

    // Create session record
    const sessionData = {
      topic: activeQuiz.topic,
      topicSlug: activeQuiz.topicId,
      difficulty: activeQuiz.difficulty,
      engineUsed: activeQuiz.engineUsed,
      modelName: activeQuiz.isAiGenerated
        ? (activeQuiz.engineUsed === 'ollama-ai' ? (activeQuiz.modelName || config.ollamaModel) : config.geminiModel)
        : 'Heuristic-Engine-v1',
      overallScore: evalResult.overallScore,
      totalQuestions: evalResult.totalQuestions,
      correctCount: evalResult.correctCount,
      initialMastery,
      gapsIdentified: evalResult.identifiedGaps.length,
      calibration: evalResult.calibration,
      conceptMastery: evalResult.conceptMastery,
      questions: evalResult.evaluatedQuestions,
      remediations: []
    };

    // Save to MongoDB Atlas / Local Vault
    const savedSession = await SessionRepository.save(sessionData);

    res.json({
      sessionId: savedSession._id || savedSession.id,
      quizId,
      topic: activeQuiz.topic,
      engineUsed: activeQuiz.engineUsed,
      isAiGenerated: activeQuiz.isAiGenerated,
      engineNotice: activeQuiz.engineNotice,
      overallScore: evalResult.overallScore,
      totalQuestions: evalResult.totalQuestions,
      correctCount: evalResult.correctCount,
      calibration: evalResult.calibration,
      conceptMastery: evalResult.conceptMastery,
      identifiedGaps: evalResult.identifiedGaps,
      evaluatedQuestions: evalResult.evaluatedQuestions,
      knowledgeGraph: evalResult.knowledgeGraph,
      savedToDatabase: getDBStatus().connected ? 'MongoDB Atlas' : 'Local Session Vault (Fallback)'
    });
  } catch (err) {
    console.error('[API /diagnostic/evaluate] Error:', err);
    res.status(500).json({ error: 'Failed to evaluate submission', details: err.message });
  }
});

/**
 * Verify Follow-Up Remediation Question
 * Checks whether the student fixed the gap and calculates Mastery Lift!
 */
router.post('/remediation/verify', async (req, res) => {
  try {
    const { sessionId, conceptId, followUpQuestion, selectedOptionId, previousScore = 30 } = req.body;

    if (!followUpQuestion || !selectedOptionId) {
      return res.status(400).json({ error: 'Missing follow-up question or selected option' });
    }

    const verification = DiagnosticEngine.evaluateFollowUp(followUpQuestion, selectedOptionId, previousScore);

    // Update session record if sessionId provided
    if (sessionId) {
      const session = await SessionRepository.getById(sessionId);
      if (session) {
        if (!session.remediations) session.remediations = [];
        session.remediations.push({
          conceptId,
          studentAnswer: selectedOptionId,
          improved: verification.isCorrect,
          masteryLift: verification.masteryGain,
          verifiedAt: new Date()
        });

        if (verification.isCorrect) {
          session.gapsFixed = (session.gapsFixed || 0) + 1;
        }

        // Recalculate post remediation mastery
        session.masteryGain = (session.masteryGain || 0) + verification.masteryGain;
        session.postRemediationMastery = Math.min(100, (session.overallScore || 0) + session.masteryGain);

        await SessionRepository.save(session);
      }
    }

    res.json(verification);
  } catch (err) {
    console.error('[API /remediation/verify] Error:', err);
    res.status(500).json({ error: 'Failed to verify remediation', details: err.message });
  }
});

/**
 * AI Tutor In-Depth Explanation Service (BUG 2)
 * Provides targeted pedagogical breakdown of student errors
 */
router.get('/tutor/explain', (req, res) => {
  res.json({
    status: 'online',
    endpoint: '/api/tutor/explain',
    method: 'POST',
    description: 'GapGenius AI Tutor Explanation Service'
  });
});

router.post('/tutor/explain', async (req, res) => {
  try {
    const body = req.body || {};
    const {
      topic = 'Computer Science',
      conceptName,
      questionText,
      selectedOptionText,
      correctOptionText,
      misconceptionLabel,
      misconceptionExplanation,
      conceptExplanation,
      mentalModelFix,
      remediation,
      code
    } = body;

    const explanation = await AIService.getAITutorExplanation({
      topic,
      conceptName: conceptName || topic,
      questionText: questionText || 'Diagnostic Question',
      selectedOptionText: selectedOptionText || 'Selected Option',
      correctOptionText: correctOptionText || 'Correct Option',
      misconceptionLabel: misconceptionLabel || 'Cognitive Mismatch',
      misconceptionExplanation: misconceptionExplanation || null,
      conceptExplanation: conceptExplanation || null,
      mentalModelFix: mentalModelFix || null,
      remediation: remediation || null,
      code: code || null
    });

    res.json(explanation);
  } catch (err) {
    console.error('[API /tutor/explain] Handled Error:', err);
    // Never fail with 500; always return a pedagogical breakdown
    const body = req.body || {};
    res.json({
      isAiGenerated: false,
      engineUsed: 'heuristic-tutor-fallback',
      engineNotice: 'GapGenius Pedagogical Tutor (Safety Fallback Mode)',
      conceptName: body.conceptName || body.topic || 'Concept Schema',
      studentMistake: body.misconceptionExplanation 
        ? `You selected "${body.selectedOptionText || 'this option'}". ${body.misconceptionExplanation}`
        : `You selected "${body.selectedOptionText || 'an answer'}". This reflects an intuition trap assuming sequential execution or pass-by-value semantics.`,
      whyCorrectIsRight: body.conceptExplanation 
        ? `The correct answer is "${body.correctOptionText || 'the correct option'}". ${body.conceptExplanation}`
        : `The correct answer "${body.correctOptionText || 'the correct option'}" strictly adheres to the core invariants of ${body.conceptName || body.topic || 'the language'}.`,
      underlyingMisconception: body.misconceptionLabel || 'State Invariant Misconception',
      simpleExample: body.code || '// Invariants must be preserved across lifecycle steps.',
      mentalModelFix: body.mentalModelFix || 'Always trace where variables live in memory and when operations execute.'
    });
  }
});

/**
 * Interactive Conversational AI Tutor Chat Route
 * Allows students to ask doubts, request analogies, code examples, or explanations
 */
router.get('/tutor/chat', (req, res) => {
  res.json({
    status: 'online',
    endpoint: '/api/tutor/chat',
    method: 'POST',
    description: 'GapGenius Interactive AI Tutor Chat Service'
  });
});

router.post('/tutor/chat', async (req, res) => {
  try {
    const body = req.body || {};
    const {
      topic = 'Computer Science',
      conceptName,
      questionContext = '',
      history = [],
      message
    } = body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const reply = await AIService.chatWithTutor({
      topic,
      conceptName: conceptName || topic,
      questionContext,
      history,
      message: message.trim()
    });

    res.json(reply);
  } catch (err) {
    console.error('[API /tutor/chat] Handled Error:', err);
    res.json({
      reply: `💡 **Tutor Guidance:** In programming, state and references must strictly adhere to language invariants. Trace pointer addresses and execution queues carefully!`,
      isAiGenerated: false,
      engineUsed: 'heuristic-tutor-fallback',
      engineNotice: 'GapGenius Pedagogical Tutor (Safety Fallback)'
    });
  }
});

/**
 * Session History
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await SessionRepository.getAll();
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions', details: err.message });
  }
});

/**
 * Session Details by ID
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await SessionRepository.getById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session', details: err.message });
  }
});

/**
 * Global Learning Analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await SessionRepository.getAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
});

/**
 * Dynamic Runtime Configuration Updates
 * Allows configuring Gemini API key, MongoDB URI, or Ollama local settings
 */
router.post('/config/update', async (req, res) => {
  try {
    const { geminiApiKey, mongoUri, mongoDbName, ollamaHost, ollamaModel, aiProvider } = req.body;

    updateRuntimeConfig({ geminiApiKey, mongoUri, mongoDbName, ollamaHost, ollamaModel, aiProvider });

    if (mongoUri) {
      await connectDB();
    }

    const aiStatus = await AIService.getEngineStatus();

    res.json({
      message: 'Runtime configuration updated successfully',
      dbStatus: getDBStatus(),
      aiStatus
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update configuration', details: err.message });
  }
});

export default router;
