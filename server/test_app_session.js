import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SessionRepository } from './src/models/Session.js';
import { connectDB, getDBStatus } from './src/db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('=== GapGenius App-Level Atlas Session Persistence Test ===');

const testSessionPersistence = async () => {
  try {
    const isConnected = await connectDB();
    console.log(`DB Connected?: ${isConnected}`);
    console.log(`DB Status:`, getDBStatus());

    if (!isConnected) {
      throw new Error('Failed to connect to MongoDB Atlas');
    }

    // Create a realistic diagnostic session record
    const mockSession = {
      topic: 'Python Memory & Object Mutability',
      topicSlug: 'python-memory',
      difficulty: 'intermediate',
      engineUsed: 'curated-diagnostic-bank',
      modelName: 'Heuristic-Engine-v1',
      overallScore: 66,
      totalQuestions: 3,
      correctCount: 2,
      initialMastery: 66,
      gapsIdentified: 1,
      gapsFixed: 1,
      masteryGain: 34,
      postRemediationMastery: 100,
      calibration: {
        rockSolidMastery: 2,
        dangerousMisconceptions: 0,
        luckyGuesses: 0,
        blindspots: 1
      },
      conceptMastery: {
        'var-binding': {
          conceptId: 'var-binding',
          conceptName: 'Name Binding vs Memory Allocation',
          score: 100,
          status: 'mastered'
        }
      },
      questions: [
        {
          questionId: 'py-q1',
          conceptId: 'var-binding',
          conceptName: 'Name Binding vs Memory Allocation',
          questionText: 'What is the output of b.append(4)?',
          selectedOptionId: 'B',
          selectedOptionText: '[1, 2, 3, 4]',
          correctOptionId: 'B',
          isCorrect: true,
          confidence: 'high',
          calibrationType: 'rock_solid_mastery'
        }
      ],
      remediations: [
        {
          conceptId: 'var-binding',
          conceptName: 'Name Binding vs Memory Allocation',
          studentAnswer: 'A',
          improved: true,
          masteryLift: 34
        }
      ]
    };

    console.log('\n[1/3] Saving diagnostic session via SessionRepository...');
    const saved = await SessionRepository.save(mockSession);
    console.log(`✓ Session saved to Atlas! MongoDB _id: ${saved._id}`);

    console.log('\n[2/3] Fetching session back from MongoDB Atlas by ID...');
    const fetched = await SessionRepository.getById(saved._id);
    console.log(`✓ Session retrieved successfully:`);
    console.log(`  - Topic: ${fetched.topic}`);
    console.log(`  - Overall Score: ${fetched.overallScore}%`);
    console.log(`  - Gaps Fixed: ${fetched.gapsFixed}`);

    console.log('\n[3/3] Querying platform analytics aggregated from Atlas...');
    const analytics = await SessionRepository.getAnalytics();
    console.log(`✓ Aggregated Analytics:`);
    console.log(`  - Total Attempts: ${analytics.totalAttempts}`);
    console.log(`  - Storage Backend: ${analytics.storageBackend}`);
    console.log(`  - Total Gaps Found: ${analytics.totalGapsFound}`);
    console.log(`  - Total Gaps Fixed: ${analytics.totalGapsFixed}`);
    console.log(`  - Fix Rate: ${analytics.fixRate}%`);

    console.log('\n==================================================');
    console.log('   FULL APPLICATION ATLAS PERSISTENCE VERIFIED!   ');
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    const sanitizedError = (err.message || String(err)).replace(/:([^@]+)@/g, ':****@');
    console.error('Test Failed:', sanitizedError);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

testSessionPersistence();
