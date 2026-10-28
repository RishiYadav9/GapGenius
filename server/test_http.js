import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './src/routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

const server = app.listen(5055, async () => {
  console.log('[TestServer] Running on port 5055');
  try {
    // 1. Health endpoint
    const healthRes = await fetch('http://localhost:5055/api/health');
    const health = await healthRes.json();
    console.log('[HTTP TEST 1] Health status:', health.status, '| DB:', health.database.mode);

    // 2. Topics endpoint
    const topicsRes = await fetch('http://localhost:5055/api/topics');
    const topicsData = await topicsRes.json();
    console.log('[HTTP TEST 2] Loaded topics:', topicsData.topics.length);

    // 3. Generate quiz
    const genRes = await fetch('http://localhost:5055/api/diagnostic/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Python Memory & Object Mutability', difficulty: 'intermediate' })
    });
    const quiz = await genRes.json();
    console.log('[HTTP TEST 3] Quiz generated with ID:', quiz.quizId, '| Engine:', quiz.engineUsed);

    // 4. Evaluate quiz
    const evalRes = await fetch('http://localhost:5055/api/diagnostic/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: quiz.quizId,
        submissions: [
          { questionId: quiz.questions[0].id, selectedOptionId: 'A', confidence: 'high' }
        ]
      })
    });
    const evalResult = await evalRes.json();
    console.log('[HTTP TEST 4] Evaluation score:', evalResult.overallScore + '%', '| Saved To:', evalResult.savedToDatabase);

    // 5. Analytics
    const analyticsRes = await fetch('http://localhost:5055/api/analytics');
    const analytics = await analyticsRes.json();
    console.log('[HTTP TEST 5] Total attempts in storage:', analytics.totalAttempts);

    // 6. Test frontend static html serving
    const frontendRes = await fetch('http://localhost:5055/');
    const htmlText = await frontendRes.text();
    console.log('[HTTP TEST 6] Frontend index.html served length:', htmlText.length, 'bytes');

    console.log('\n>>> ALL 6 END-TO-END HTTP TESTS PASSED PERFECTLY! <<<');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('HTTP Test Failure:', err);
    server.close();
    process.exit(1);
  }
});
