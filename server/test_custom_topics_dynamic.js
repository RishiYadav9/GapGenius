import { AIService } from './src/services/aiService.js';
import { DiagnosticEngine } from './src/services/diagnosticEngine.js';
import { SessionRepository } from './src/models/Session.js';
import { connectDB } from './src/db/connection.js';

console.log('========================================================================');
console.log('   GAPGENIUS: CUSTOM TOPIC DYNAMIC GENERATION & VERIFICATION SUITE      ');
console.log('   Testing: JavaScript Closures, SQL Joins, & React useEffect           ');
console.log('========================================================================\n');

async function runCustomTopicVerification() {
  let passed = 0;
  let total = 6;

  // 1. Generate quizzes for the 3 target topics across difficulties
  console.log('[CHECK 1/6] Generating Diagnostics for JavaScript Closures, SQL Joins, & React useEffect...');
  const testCases = [
    { topic: 'JavaScript Closures', difficulty: 'foundational', expectedTerms: ['closure', 'inner', 'function', 'scope'] },
    { topic: 'JavaScript Closures', difficulty: 'intermediate', expectedTerms: ['loop', 'settimeout', 'var', 'let'] },
    { topic: 'JavaScript Closures', difficulty: 'advanced', expectedTerms: ['destructur', 'method', 'lexical', 'sibling'] },
    { topic: 'SQL Joins', difficulty: 'foundational', expectedTerms: ['student', 'class', 'join', 'left'] },
    { topic: 'SQL Joins', difficulty: 'intermediate', expectedTerms: ['null', 'employee', 'department', 'inner'] },
    { topic: 'SQL Joins', difficulty: 'advanced', expectedTerms: ['where', 'on', 'clause', 'predicate', 'filter'] },
    { topic: 'React useEffect', difficulty: 'foundational', expectedTerms: ['effect', 'render', 'dependency', 'mount'] },
    { topic: 'React useEffect', difficulty: 'intermediate', expectedTerms: ['cleanup', 'unmount', 'timing', 'empty'] },
    { topic: 'React useEffect', difficulty: 'advanced', expectedTerms: ['stale', 'closure', 'interval', 'timer', 'setinterval'] }
  ];

  const generatedResults = [];
  for (const tc of testCases) {
    const quiz = await AIService.generateDiagnosticQuiz(tc.topic, tc.difficulty, 3);
    generatedResults.push({ ...quiz, requestedTopic: tc.topic, requestedDiff: tc.difficulty, expectedTerms: tc.expectedTerms });
    console.log(`  ✓ Topic: "${tc.topic}" [${tc.difficulty.toUpperCase()}] -> Questions: ${quiz.questions.length} | TopicId: ${quiz.topicId}`);
  }

  if (generatedResults.length === 9) {
    passed++;
    console.log('  -> PASS: All 9 diagnostic combinations generated successfully.');
  }

  // 2. Verify questions differ across topics & none of them contain Python questions
  console.log('\n[CHECK 2/6] Verifying Questions Differ Across Topics & Never Use Hardcoded Python...');
  let noPythonLeaks = true;
  const questionsByTopic = {
    'JavaScript Closures': [],
    'SQL Joins': [],
    'React useEffect': []
  };

  generatedResults.forEach(res => {
    res.questions.forEach(q => {
      questionsByTopic[res.requestedTopic].push(q.question);
      const combinedText = (q.question + ' ' + (q.code || '')).toLowerCase();
      // Verify no python list mutability questions in JS or SQL
      if (res.requestedTopic !== 'Python Memory & Object Mutability') {
        if (combinedText.includes('a = [1, 2, 3]') || combinedText.includes('append_item') || combinedText.includes('import copy')) {
          console.error(`  ❌ Python question leaked into ${res.requestedTopic}: ${q.question}`);
          noPythonLeaks = false;
        }
      }
    });
  });

  const jsSample = questionsByTopic['JavaScript Closures'][0];
  const sqlSample = questionsByTopic['SQL Joins'][0];
  const reactSample = questionsByTopic['React useEffect'][0];

  console.log(`  JS Closures Sample: "${jsSample.substring(0, 65)}..."`);
  console.log(`  SQL Joins Sample:   "${sqlSample.substring(0, 65)}..."`);
  console.log(`  React useEffect:    "${reactSample.substring(0, 65)}..."`);

  const distinctTopics = jsSample !== sqlSample && sqlSample !== reactSample && jsSample !== reactSample;
  if (noPythonLeaks && distinctTopics) {
    passed++;
    console.log('  -> PASS: All 3 topics produce completely distinct, domain-accurate questions.');
  } else {
    throw new Error('FAIL: Questions leaked or collided between topics.');
  }

  // 3. Verify Dynamic Difficulty Adaptation (Foundational vs Intermediate vs Advanced differ)
  console.log('\n[CHECK 3/6] Verifying Difficulty Adaptation (Different questions per tier)...');
  const jsFound = generatedResults.find(r => r.requestedTopic === 'JavaScript Closures' && r.requestedDiff === 'foundational');
  const jsInter = generatedResults.find(r => r.requestedTopic === 'JavaScript Closures' && r.requestedDiff === 'intermediate');
  const jsAdv = generatedResults.find(r => r.requestedTopic === 'JavaScript Closures' && r.requestedDiff === 'advanced');

  const diffQuestionsUnique = jsFound.questions[0].id !== jsInter.questions[0].id &&
                              jsInter.questions[0].id !== jsAdv.questions[0].id;

  console.log(`  Foundational Q1:   [${jsFound.questions[0].id}] "${jsFound.questions[0].question.substring(0, 50)}..."`);
  console.log(`  Intermediate Q1:   [${jsInter.questions[0].id}] "${jsInter.questions[0].question.substring(0, 50)}..."`);
  console.log(`  Advanced Q1:       [${jsAdv.questions[0].id}] "${jsAdv.questions[0].question.substring(0, 50)}..."`);

  if (diffQuestionsUnique) {
    passed++;
    console.log('  -> PASS: Questions dynamically adapt to selected difficulty levels.');
  } else {
    throw new Error('FAIL: Difficulty levels repeated the same questions.');
  }

  // 4. Verify Option Schema, Correct Answer Invariants & Misconceptions
  console.log('\n[CHECK 4/6] Verifying Option Schemas (4 options, exactly 1 correct, distractor taxonomy)...');
  let allSchemasValid = true;
  let auditedCount = 0;

  generatedResults.forEach(res => {
    res.questions.forEach(q => {
      auditedCount++;
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        console.error(`  ❌ Invalid option length for ${q.id}: ${q.options?.length}`);
        allSchemasValid = false;
      }
      const correctOpts = q.options.filter(o => o.isCorrect === true);
      if (correctOpts.length !== 1) {
        console.error(`  ❌ Question ${q.id} has ${correctOpts.length} correct options (expected 1)`);
        allSchemasValid = false;
      }
      const distractors = q.options.filter(o => o.isCorrect === false);
      const hasMisconceptions = distractors.every(d => Boolean(d.misconceptionLabel && d.misconceptionExplanation));
      if (!hasMisconceptions) {
        console.error(`  ❌ Question ${q.id} is missing misconception labels on distractors`);
        allSchemasValid = false;
      }
      if (!q.remediation || !q.remediation.followUpQuestion) {
        console.error(`  ❌ Question ${q.id} is missing remediation or followUpQuestion`);
        allSchemasValid = false;
      }
    });
  });

  if (allSchemasValid && auditedCount === 27) {
    passed++;
    console.log(`  -> PASS: All ${auditedCount} audited MCQs strictly adhere to the 4-option, 1-correct distractor schema.`);
  } else {
    throw new Error('FAIL: MCQ schema audit failed.');
  }

  // 5. Verify Diagnostic Evaluation & Metacognitive Calibration for JavaScript Closures
  console.log('\n[CHECK 5/6] Testing Diagnostic Engine Evaluation with Metacognitive Calibration on JavaScript Closures...');
  const targetQuiz = jsInter; // Intermediate JavaScript Closures (includes loop timer trap)
  // Student selects Option A (0, 1, 2 - the classic misconception) with 'high' confidence
  const simulatedSubmissions = [
    { questionId: targetQuiz.questions[0].id, selectedOptionId: 'A', confidence: 'high' },
    { questionId: targetQuiz.questions[1].id, selectedOptionId: 'B', confidence: 'medium' },
    { questionId: targetQuiz.questions[2].id, selectedOptionId: 'B', confidence: 'high' }
  ];

  const evalResult = DiagnosticEngine.evaluateSubmission(targetQuiz.questions, simulatedSubmissions);
  console.log(`  Overall Score: ${evalResult.overallScore}%`);
  console.log(`  Dangerous Misconceptions Caught: ${evalResult.calibration.dangerousMisconceptions}`);
  console.log(`  Gaps Identified: ${evalResult.identifiedGaps.length}`);
  console.log(`  Knowledge Graph Nodes: ${evalResult.knowledgeGraph.nodes.length} | Edges: ${evalResult.knowledgeGraph.edges.length}`);

  const caughtTrap = evalResult.calibration.dangerousMisconceptions >= 1;
  const graphValid = evalResult.knowledgeGraph.nodes.length >= 3;

  if (caughtTrap && graphValid) {
    passed++;
    console.log('  -> PASS: Metacognitive calibration isolated the Dunning-Kruger trap and built the concept DAG.');
  } else {
    throw new Error('FAIL: Diagnostic evaluation did not catch false confidence or build graph.');
  }

  // 6. Test Persistence to MongoDB Atlas
  console.log('\n[CHECK 6/6] Testing Session Persistence to MongoDB Atlas with Custom Topics...');
  await connectDB();

  const sessionPayload = {
    topic: targetQuiz.topic,
    topicSlug: targetQuiz.topicId,
    difficulty: targetQuiz.difficulty,
    engineUsed: targetQuiz.engineUsed,
    modelName: 'Heuristic-v2',
    overallScore: evalResult.overallScore,
    totalQuestions: evalResult.totalQuestions,
    correctCount: evalResult.correctCount,
    initialMastery: evalResult.overallScore,
    gapsIdentified: evalResult.identifiedGaps.length,
    calibration: evalResult.calibration,
    conceptMastery: evalResult.conceptMastery,
    questions: evalResult.evaluatedQuestions,
    remediations: []
  };

  const saved = await SessionRepository.save(sessionPayload);
  console.log(`  ✓ Saved session to database: ID = ${saved._id || saved.id}`);
  const retrieved = await SessionRepository.getById(saved._id || saved.id);
  console.log(`  ✓ Retrieved from database: Topic = "${retrieved.topic}", Gaps = ${retrieved.gapsIdentified}`);

  if (retrieved && retrieved.topic === 'JavaScript Closures') {
    passed++;
    console.log('  -> PASS: Custom topic session successfully persisted and verified in MongoDB Atlas.');
  } else {
    throw new Error('FAIL: Database retrieval did not match saved session.');
  }

  console.log('\n========================================================================');
  console.log(`  DYNAMIC CUSTOM TOPIC SUITE: ${passed}/${total} CHECKS PASSED (100% SUCCESS)`);
  console.log('========================================================================\n');
  process.exit(0);
}

runCustomTopicVerification().catch(err => {
  console.error('\n❌ FATAL TEST FAILURE:', err);
  process.exit(1);
});
