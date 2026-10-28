import mongoose from 'mongoose';
import { getDBStatus, localStore } from '../db/connection.js';

const SessionSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  topicSlug: { type: String },
  difficulty: { type: String, default: 'intermediate' },
  engineUsed: { type: String, enum: ['gemini-ai', 'ollama-ai', 'curated-diagnostic-bank', 'topic-aware-fallback'], required: true },
  modelName: { type: String },
  overallScore: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  initialMastery: { type: Number, required: true },
  postRemediationMastery: { type: Number },
  masteryGain: { type: Number, default: 0 },
  gapsIdentified: { type: Number, default: 0 },
  gapsFixed: { type: Number, default: 0 },
  calibration: {
    rockSolidMastery: { type: Number, default: 0 },
    dangerousMisconceptions: { type: Number, default: 0 },
    luckyGuesses: { type: Number, default: 0 },
    blindspots: { type: Number, default: 0 }
  },
  conceptMastery: { type: mongoose.Schema.Types.Mixed },
  questions: [{
    questionId: String,
    conceptId: String,
    conceptName: String,
    questionText: String,
    selectedOptionId: String,
    selectedOptionText: String,
    correctOptionId: String,
    isCorrect: Boolean,
    confidence: String,
    misconceptionDiagnosed: String,
    calibrationType: String
  }],
  remediations: [{
    conceptId: String,
    conceptName: String,
    coreMisconception: String,
    targetedExplanation: String,
    mentalModelFix: String,
    followUpQuestion: mongoose.Schema.Types.Mixed,
    studentAnswer: String,
    improved: Boolean,
    masteryLift: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

const MongoSession = mongoose.model('Session', SessionSchema);

export const SessionRepository = {
  async save(sessionData) {
    const status = getDBStatus();
    if (status.connected) {
      try {
        const doc = new MongoSession(sessionData);
        return await doc.save();
      } catch (err) {
        console.warn('[SessionRepository] Failed to save to MongoDB Atlas, writing to local vault:', err.message);
        return await localStore.save(sessionData);
      }
    } else {
      return await localStore.save(sessionData);
    }
  },

  async getAll() {
    const status = getDBStatus();
    if (status.connected) {
      try {
        return await MongoSession.find().sort({ createdAt: -1 }).limit(50);
      } catch (err) {
        return await localStore.find();
      }
    }
    return await localStore.find();
  },

  async getById(id) {
    const status = getDBStatus();
    if (status.connected) {
      try {
        const found = await MongoSession.findById(id);
        if (found) return found;
      } catch (err) {
        // Fall back to local
      }
    }
    return await localStore.findById(id);
  },

  async getAnalytics() {
    const sessions = await this.getAll();
    let totalAttempts = sessions.length;
    let totalGapsFound = 0;
    let totalGapsFixed = 0;
    let totalScoreSum = 0;
    let dangerousMisconceptionsCaught = 0;
    let topicCounts = {};

    sessions.forEach(s => {
      totalGapsFound += s.gapsIdentified || 0;
      totalGapsFixed += s.gapsFixed || 0;
      totalScoreSum += s.overallScore || 0;
      if (s.calibration?.dangerousMisconceptions) {
        dangerousMisconceptionsCaught += s.calibration.dangerousMisconceptions;
      }
      if (s.topic) {
        topicCounts[s.topic] = (topicCounts[s.topic] || 0) + 1;
      }
    });

    return {
      totalAttempts,
      totalGapsFound,
      totalGapsFixed,
      fixRate: totalGapsFound > 0 ? Math.round((totalGapsFixed / totalGapsFound) * 100) : 0,
      averageScore: totalAttempts > 0 ? Math.round(totalScoreSum / totalAttempts) : 0,
      dangerousMisconceptionsCaught,
      popularTopics: Object.entries(topicCounts).map(([topic, count]) => ({ topic, count })),
      storageBackend: getDBStatus().connected ? 'MongoDB Atlas' : 'Local Fallback Vault'
    };
  }
};
