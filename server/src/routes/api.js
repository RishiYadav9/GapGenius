import express from 'express';
import { getDBStatus, connectDB } from '../db/connection.js';
import { AIService } from '../services/aiService.js';
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
router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  const aiStatus = AIService.getEngineStatus();

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
      engineName: aiStatus.engineName,
      model: aiStatus.model,
      isFallbackMode: aiStatus.isFallbackMode
    }
  });
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
    const { topic = 'Python Memory & Object Mutability', difficulty = 'intermediate', questionCount = 3 } = req.body;

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
      modelName: activeQuiz.isAiGenerated ? config.geminiModel : 'Heuristic-Engine-v1',
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
router.post('/tutor/explain', async (req, res) => {
  try {
    const {
      topic,
      conceptName,
      questionText,
      selectedOptionText,
      correctOptionText,
      misconceptionLabel,
      code
    } = req.body;

    const explanation = await AIService.getAITutorExplanation({
      topic,
      conceptName,
      questionText,
      selectedOptionText,
      correctOptionText,
      misconceptionLabel,
      code
    });

    res.json(explanation);
  } catch (err) {
    console.error('[API /tutor/explain] Error:', err);
    res.status(500).json({ error: 'Failed to generate tutor explanation', details: err.message });
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
 * Allows judges to input their own Gemini API key or MongoDB connection string
 */
router.post('/config/update', async (req, res) => {
  try {
    const { geminiApiKey, mongoUri } = req.body;

    updateRuntimeConfig({ geminiApiKey, mongoUri });

    if (mongoUri) {
      await connectDB();
    }

    res.json({
      message: 'Runtime configuration updated successfully',
      dbStatus: getDBStatus(),
      aiStatus: AIService.getEngineStatus()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update configuration', details: err.message });
  }
});

export default router;
