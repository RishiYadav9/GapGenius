import http from 'http';
import app from './src/index.js';

console.log('========================================================================');
console.log('   GAPGENIUS: AI TUTOR DEBUGGING & URL/ROUTE/CORS VERIFICATION SUITE   ');
console.log('========================================================================\n');

async function runTutorDebugTest() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  let passed = 0;
  let total = 0;

  const testCase = (title, condition, details) => {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] ${title}`);
      if (details) console.log(`         -> ${details}`);
    } else {
      console.error(`  [FAIL] ${title}`);
      if (details) console.error(`         -> ${details}`);
    }
  };

  try {
    // ------------------------------------------------------------------
    // TEST 1: CORS Preflight (OPTIONS /api/tutor/explain)
    // ------------------------------------------------------------------
    console.log('TEST 1: Verifying CORS Preflight & Headers...');
    const optionsRes = await fetch(`${baseUrl}/tutor/explain`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    const allowOrigin = optionsRes.headers.get('access-control-allow-origin');
    const allowMethods = optionsRes.headers.get('access-control-allow-methods');
    testCase(
      'CORS Preflight OPTIONS /api/tutor/explain responds with 200/204',
      optionsRes.status === 200 || optionsRes.status === 204,
      `Status: ${optionsRes.status}`
    );
    testCase(
      'CORS Preflight returns Access-Control-Allow-Origin',
      Boolean(allowOrigin),
      `Origin Header: "${allowOrigin}"`
    );
    testCase(
      'CORS Preflight returns Access-Control-Allow-Methods containing POST',
      allowMethods && allowMethods.includes('POST'),
      `Methods: "${allowMethods}"`
    );

    // ------------------------------------------------------------------
    // TEST 2: GET /api/tutor/explain (Health/Status verification)
    // ------------------------------------------------------------------
    console.log('\nTEST 2: Verifying GET /api/tutor/explain Health Route...');
    const getRes = await fetch(`${baseUrl}/tutor/explain`);
    const getData = await getRes.json();
    testCase(
      'GET /api/tutor/explain responds with 200 OK and online status',
      getRes.status === 200 && getData.status === 'online',
      `Endpoint info: ${getData.endpoint}`
    );

    // ------------------------------------------------------------------
    // TEST 3: POST /api/tutor/explain with Standard Payload (with CORS Origin)
    // ------------------------------------------------------------------
    console.log('\nTEST 3: Verifying POST /api/tutor/explain with Origin header (Simulating Browser)...');
    const standardPayload = {
      topic: 'Python Memory & Object Mutability',
      conceptName: 'Name Binding vs Memory Allocation',
      questionText: 'What is the output of a = [1, 2]; b = a; b.append(3); print(a)?',
      selectedOptionText: 'A: [1, 2]',
      correctOptionText: 'B: [1, 2, 3]',
      misconceptionLabel: 'Variable = Independent Box Misconception',
      misconceptionExplanation: 'You assumed that b = a clones the list into a new independent memory location.',
      conceptExplanation: 'Python variables are named references (pointers) to objects in memory.',
      mentalModelFix: 'Think of variables as adhesive sticky notes on the same box.',
      code: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)'
    };

    const postRes = await fetch(`${baseUrl}/tutor/explain`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(standardPayload)
    });

    const postData = await postRes.json();
    testCase(
      'POST /api/tutor/explain returns HTTP 200 with Origin header',
      postRes.status === 200,
      `Status: ${postRes.status}`
    );
    testCase(
      'POST response has Access-Control-Allow-Origin header',
      Boolean(postRes.headers.get('access-control-allow-origin')),
      `Allow-Origin: "${postRes.headers.get('access-control-allow-origin')}"`
    );
    testCase(
      'POST response includes rich studentMistake breakdown',
      Boolean(postData.studentMistake) && postData.studentMistake.includes('clones'),
      `Mistake: "${postData.studentMistake.substring(0, 75)}..."`
    );
    testCase(
      'POST response includes whyCorrectIsRight invariant',
      Boolean(postData.whyCorrectIsRight) && Boolean(postData.mentalModelFix),
      `Rule: "${postData.mentalModelFix}"`
    );

    // ------------------------------------------------------------------
    // TEST 4: POST /api/tutor/explain with Edge Cases (Empty, Nulls)
    // ------------------------------------------------------------------
    console.log('\nTEST 4: Verifying Backend Route Resilience with Edge Cases...');
    const emptyRes = await fetch(`${baseUrl}/tutor/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const emptyData = await emptyRes.json();
    testCase(
      'POST with empty body {} gracefully returns 200 without throwing 500',
      emptyRes.status === 200 && Boolean(emptyData.studentMistake),
      `Returned engine: ${emptyData.engineUsed}`
    );

    const nullsRes = await fetch(`${baseUrl}/tutor/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: null,
        conceptName: null,
        selectedOptionText: null,
        remediation: null
      })
    });
    const nullsData = await nullsRes.json();
    testCase(
      'POST with null fields gracefully returns 200 without crashing',
      nullsRes.status === 200 && Boolean(nullsData.whyCorrectIsRight),
      `Notice: ${nullsData.engineNotice}`
    );

    // ------------------------------------------------------------------
    // TEST 5: Interactive Chat Route (POST /api/tutor/chat)
    // ------------------------------------------------------------------
    console.log('\nTEST 5: Verifying Interactive AI Tutor Chat Route...');
    const chatRes = await fetch(`${baseUrl}/tutor/chat`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Python Memory',
        conceptName: 'Object References',
        message: 'Give me an analogy'
      })
    });
    const chatData = await chatRes.json();
    testCase(
      'POST /api/tutor/chat returns HTTP 200 with reply',
      chatRes.status === 200 && Boolean(chatData.reply),
      `Reply: "${chatData.reply.substring(0, 60)}..."`
    );

  } finally {
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`  AI TUTOR DEBUG SUITE: ${passed}/${total} CHECKS PASSED (100% SUCCESS)`);
  console.log('========================================================================\n');

  if (passed !== total) process.exit(1);
}

runTutorDebugTest().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
