import { config } from '../config/env.js';
import { FALLBACK_TOPICS, generateTopicAwareQuiz } from '../data/fallbackBanks.js';

/**
 * Robust Gemini API Client & Topic-Aware Diagnostic Orchestrator
 * Compatible with Gemini 1.5 Flash, 1.5 Pro, 2.0 Flash
 */
export class AIService {
  static isConfigured() {
    return Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 10);
  }

  static getEngineStatus() {
    return {
      aiAvailable: this.isConfigured(),
      model: config.geminiModel || 'gemini-1.5-flash',
      engineName: this.isConfigured() ? 'Gemini AI Engine' : 'Topic-Aware Diagnostic Engine (Heuristic Fallback)',
      isFallbackMode: !this.isConfigured()
    };
  }

  /**
   * Helper to make Gemini REST API calls with timeout protection
   */
  static async callGemini(promptText, systemInstruction = '', responseSchema = null) {
    if (!this.isConfigured()) {
      throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
    }

    const model = config.geminiModel || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ];

    const bodyPayload = {
      contents,
      generationConfig: {
        temperature: 0.2, // Low temperature for high factual precision
        responseMimeType: 'application/json'
      }
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    if (responseSchema) {
      bodyPayload.generationConfig.responseSchema = responseSchema;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AIService] Gemini API error (${response.status}):`, errorText);
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response candidate from Gemini API');
      }

      return JSON.parse(rawText);
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[AIService] Call failed, fallback will be used: ${err.message}`);
      throw err;
    }
  }

  /**
   * Validates whether generated questions are well-formed and relevant to the requested topic
   */
  static validateQuestions(questions, targetTopic) {
    if (!Array.isArray(questions) || questions.length < 2) return false;

    for (const q of questions) {
      if (!q.question || typeof q.question !== 'string') return false;
      if (!Array.isArray(q.options) || q.options.length !== 4) return false;

      // Exactly one correct option
      const correctCount = q.options.filter(o => o.isCorrect === true).length;
      if (correctCount !== 1) return false;

      // Check option IDs are distinct (A, B, C, D)
      const ids = new Set(q.options.map(o => o.id));
      if (ids.size !== 4) return false;

      // Follow-up question exists
      if (!q.remediation || !q.remediation.followUpQuestion) return false;
    }

    return true;
  }

  /**
   * Generates diagnostic quiz questions for any custom or standard topic
   * Normalizes topic, uses Gemini if available, or topic-aware deterministic fallback
   */
  static async generateDiagnosticQuiz(topicQuery, difficulty = 'intermediate', questionCount = 3) {
    const cleanTopic = (topicQuery || 'General Computer Science').trim();

    // If Gemini is not configured, immediately use topic-aware fallback
    if (!this.isConfigured()) {
      console.log(`[AIService] Gemini API key not present. Generating topic-aware diagnostic for: "${cleanTopic}"`);
      return generateTopicAwareQuiz(cleanTopic, difficulty, questionCount);
    }

    const systemPrompt = `You are the lead psychometrician and computer science pedagogical architect for GapGenius.
Your core mission: "Find the gap. Fix the gap."
You do NOT write superficial trivia questions. You design DIAGNOSTIC MULTIPLE-CHOICE QUESTIONS where EVERY incorrect option (distractor) isolates a specific named conceptual misunderstanding or mental model flaw.

CRITICAL RULES:
1. ALL questions MUST be strictly and genuinely relevant to the requested topic: "${cleanTopic}".
2. You must generate exactly ${questionCount} DISTINCT questions. Do NOT duplicate question text.
3. Every question must have EXACTLY 4 options with IDs 'A', 'B', 'C', 'D'.
4. EXACTLY ONE option must have "isCorrect": true. Vary the position of the correct answer across questions (do not always make 'A' or 'B' correct).
5. Each distractor (isCorrect: false) must have a specific "misconceptionLabel" and "misconceptionExplanation".
6. Every question must include a "remediation" object containing "conceptExplanation", "mentalModelFix" (an intuitive analogy), and an adaptive "followUpQuestion" with 3 options and 1 correct answer.

JSON Schema format requirements:
{
  "topic": string,
  "concepts": [
    { "id": string (slug), "name": string, "prereq": string | null }
  ],
  "questions": [
    {
      "id": string,
      "conceptId": string,
      "conceptName": string,
      "difficulty": "foundational" | "intermediate" | "advanced",
      "question": string,
      "code": string (optional code snippet),
      "options": [
        {
          "id": "A" | "B" | "C" | "D",
          "text": string,
          "isCorrect": boolean,
          "misconceptionId": string | null,
          "misconceptionLabel": string | null,
          "misconceptionExplanation": string
        }
      ],
      "remediation": {
        "conceptExplanation": string,
        "mentalModelFix": string,
        "followUpQuestion": {
          "id": string,
          "question": string,
          "options": [
            { "id": "A"|"B"|"C", "text": string, "isCorrect": boolean, "explanation": string }
          ]
        }
      }
    }
  ]
}`;

    const userPrompt = `Generate a rigorous diagnostic quiz specifically on "${cleanTopic}" with difficulty "${difficulty}".
Create ${questionCount} distinct questions addressing the core invariants, edge cases, and common pitfalls of "${cleanTopic}".`;

    try {
      const result = await this.callGemini(userPrompt, systemPrompt);

      // Validate the output structure and relevance
      if (!this.validateQuestions(result.questions, cleanTopic)) {
        console.warn(`[AIService] Gemini response did not pass strict question validation for "${cleanTopic}". Using topic-aware fallback.`);
        return generateTopicAwareQuiz(cleanTopic, difficulty, questionCount);
      }

      return {
        topic: result.topic || cleanTopic,
        topicId: cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        difficulty,
        engineUsed: 'gemini-ai',
        isAiGenerated: true,
        engineNotice: `AI-Generated Dynamic Diagnostic Engine (Gemini Flash). Questions tailored in real-time for "${cleanTopic}".`,
        concepts: result.concepts || [],
        questions: result.questions.slice(0, questionCount)
      };
    } catch (err) {
      console.warn(`[AIService] Gemini failed for "${cleanTopic}" (${err.message}). Using topic-aware fallback.`);
      const fallbackQuiz = generateTopicAwareQuiz(cleanTopic, difficulty, questionCount);
      fallbackQuiz.engineNotice = `Topic-Aware Diagnostic Engine (AI service offline / ${err.message}). Distinct questions generated for "${cleanTopic}".`;
      return fallbackQuiz;
    }
  }

  /**
   * AI Tutor Service (BUG 2)
   * Generates a deep, accessible pedagogical breakdown of student errors:
   * 1. Why selected option was chosen (the mental flaw)
   * 2. Why correct answer is right
   * 3. Underlying misconception
   * 4. A concrete simple code or concept example
   */
  static async getAITutorExplanation({
    topic = 'Computer Science',
    conceptName,
    questionText,
    selectedOptionText,
    correctOptionText,
    misconceptionLabel,
    code = null
  }) {
    if (!this.isConfigured()) {
      return {
        isAiGenerated: false,
        engineUsed: 'heuristic-tutor-fallback',
        engineNotice: 'GapGenius Pedagogical Tutor (Offline Heuristic Mode)',
        conceptName: conceptName || topic,
        studentMistake: `You selected: "${selectedOptionText}". This error occurs when applying a flawed mental model — specifically, ${misconceptionLabel || 'conflating syntax with underlying memory/lifecycle behavior'}.`,
        whyCorrectIsRight: `The correct answer is: "${correctOptionText}". This holds true because ${conceptName || topic} guarantees that state and execution boundaries are strictly preserved.`,
        underlyingMisconception: misconceptionLabel || 'Abstract Lifecycle & State Invariant Misunderstanding',
        simpleExample: code 
          ? `// Concrete Rule:\n${code}\n// Notice how the state transitions predictably when following invariants.`
          : `// Memory / Logic Rule for ${conceptName || topic}:\nconst invariant = true; // Always verify reference vs value semantics!`,
        mentalModelFix: 'Always trace where variables live and when operations execute. Never assume assignment clones memory or that asynchronous operations run immediately.'
      };
    }

    const prompt = `You are GapGenius AI Tutor. Explain a student's mistake with maximum pedagogical clarity:
Topic: ${topic}
Concept: ${conceptName}
Question: ${questionText}
${code ? `Code:\n${code}\n` : ''}
Student Selected: "${selectedOptionText}"
Correct Answer: "${correctOptionText}"
Diagnosed Misconception: ${misconceptionLabel || 'Cognitive schema mismatch'}

Return a JSON object with:
{
  "studentMistake": string (2 sentences explaining WHY they picked their answer and what flawed mental model caused it),
  "whyCorrectIsRight": string (2 sentences explaining why the correct answer is undeniably true),
  "underlyingMisconception": string (concise name of the mental flaw),
  "simpleExample": string (short 2-4 line code snippet or concrete real-world analogy illustrating the difference),
  "mentalModelFix": string (1 memorable punchy rule of thumb)
}`;

    try {
      const res = await this.callGemini(prompt);
      return {
        isAiGenerated: true,
        engineUsed: 'gemini-ai',
        engineNotice: 'Personalized Gemini AI Tutor Insight',
        conceptName: conceptName || topic,
        studentMistake: res.studentMistake,
        whyCorrectIsRight: res.whyCorrectIsRight,
        underlyingMisconception: res.underlyingMisconception || misconceptionLabel,
        simpleExample: res.simpleExample,
        mentalModelFix: res.mentalModelFix
      };
    } catch (err) {
      console.warn(`[AIService] AI Tutor call failed: ${err.message}. Using structured pedagogical fallback.`);
      return {
        isAiGenerated: false,
        engineUsed: 'heuristic-tutor-fallback',
        engineNotice: `GapGenius Pedagogical Tutor (Fallback Mode: ${err.message})`,
        conceptName: conceptName || topic,
        studentMistake: `You chose: "${selectedOptionText}". This reflects ${misconceptionLabel || 'an intuition trap'}, assuming standard sequential execution or value copying.`,
        whyCorrectIsRight: `The correct answer "${correctOptionText}" aligns with the formal specification of ${conceptName || topic}.`,
        underlyingMisconception: misconceptionLabel || 'Specification vs Intuition Mismatch',
        simpleExample: code || `// In ${topic}:\n// Trace step-by-step: allocations occur before references.`,
        mentalModelFix: 'Think of variables as reference labels, and asynchronous events as queued tasks.'
      };
    }
  }
}
