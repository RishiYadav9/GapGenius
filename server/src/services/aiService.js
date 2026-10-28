import { config } from '../config/env.js';
import { FALLBACK_TOPICS, getFallbackTopicById } from '../data/fallbackBanks.js';

/**
 * Robust Gemini API Client using standard fetch (Node 18+)
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
      engineName: this.isConfigured() ? 'Gemini AI Engine' : 'Expert Curated Heuristic Engine (Fallback)',
      isFallbackMode: !this.isConfigured()
    };
  }

  /**
   * Helper to make Gemini REST API calls
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
        temperature: 0.2, // Low temperature for factual precision in pedagogical diagnosis
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
    const timeout = setTimeout(() => controller.abort(), 12000); // 12 second timeout

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
   * Generates diagnostic quiz questions for any custom or standard topic
   */
  static async generateDiagnosticQuiz(topicQuery, difficulty = 'intermediate', questionCount = 4) {
    // If not configured, immediately use fallback
    if (!this.isConfigured()) {
      const matched = FALLBACK_TOPICS.find(t => 
        t.title.toLowerCase().includes(topicQuery.toLowerCase()) || 
        t.id.toLowerCase().includes(topicQuery.toLowerCase())
      ) || FALLBACK_TOPICS[0];

      return {
        topic: matched.title,
        topicId: matched.id,
        difficulty,
        engineUsed: 'curated-diagnostic-bank',
        isAiGenerated: false,
        engineNotice: 'Pre-calibrated Expert Diagnostic Bank (AI Key not active). Full distractor taxonomy loaded.',
        concepts: matched.concepts,
        questions: matched.questions
      };
    }

    const systemPrompt = `You are the lead psychometrician and computer science pedagogical architect for GapGenius.
Your core mission: "Find the gap. Fix the gap."
You do NOT write superficial trivia questions. You design DIAGNOSTIC MULTIPLE-CHOICE QUESTIONS where EVERY incorrect option (distractor) isolates a specific named conceptual misunderstanding or mental model flaw.

JSON Schema format requirements:
{
  "topic": string,
  "concepts": [
    { "id": string (slug), "name": string, "prereq": string | null }
  ],
  "questions": [
    {
      "id": string,
      "conceptId": string (must match one of the concept ids above),
      "conceptName": string,
      "difficulty": "foundational" | "intermediate" | "advanced",
      "question": string,
      "code": string (optional, clean code snippet if relevant),
      "options": [
        {
          "id": "A" | "B" | "C" | "D",
          "text": string,
          "isCorrect": boolean,
          "misconceptionId": string | null,
          "misconceptionLabel": string | null (e.g. "Shallow Reference Sharing Blindspot"),
          "misconceptionExplanation": string (Explain the exact flaw in reasoning if chosen)
        }
      ],
      "remediation": {
        "conceptExplanation": string,
        "mentalModelFix": string (an intuitive analogy and rule-of-thumb),
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

    const userPrompt = `Generate a diagnostic quiz on "${topicQuery}" with difficulty "${difficulty}".
Create ${questionCount} questions. Ensure granular concepts with prerequisite relationships, exactly one correct answer per question, and 3 high-yield distractor options that map to real cognitive misconceptions.`;

    try {
      const result = await this.callGemini(userPrompt, systemPrompt);
      return {
        topic: result.topic || topicQuery,
        topicId: topicQuery.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        difficulty,
        engineUsed: 'gemini-ai',
        isAiGenerated: true,
        engineNotice: 'AI-Generated Dynamic Diagnostic Engine (Gemini Flash). Questions tailored in real time.',
        concepts: result.concepts || [],
        questions: result.questions || []
      };
    } catch (err) {
      console.warn('[AIService] Failed to generate with Gemini, gracefully degrading to fallback bank:', err.message);
      const fallback = FALLBACK_TOPICS[0];
      return {
        topic: `${topicQuery} (Heuristic Baseline)`,
        topicId: fallback.id,
        difficulty,
        engineUsed: 'curated-diagnostic-bank',
        isAiGenerated: false,
        engineNotice: `Heuristic Diagnostic Bank Activated. (Reason: AI Engine Offline / ${err.message}). Pre-calibrated questions used.`,
        concepts: fallback.concepts,
        questions: fallback.questions
      };
    }
  }

  /**
   * Generates dynamic tailored remediation explanation if the student needs a custom breakdown
   */
  static async explainMisconceptionInDepth(conceptName, questionText, studentSelectedText, misconceptionLabel) {
    if (!this.isConfigured()) {
      return {
        isAiGenerated: false,
        explanation: `Curated Diagnostic Insight: The choice "${studentSelectedText}" indicates a common confusion: ${misconceptionLabel}. Focus on understanding the core invariant before continuing.`,
        mentalModelFix: 'Break down the code step by step: trace what happens at each memory binding or execution frame.',
        engineNotice: 'Using Curated Pedagogical Model.'
      };
    }

    const prompt = `Student made this specific error:
Concept: ${conceptName}
Question: ${questionText}
Option Selected: "${studentSelectedText}"
Identified Misconception: ${misconceptionLabel}

In simple, crystal-clear language (max 3 short sentences):
1. Explain WHY the student made this mistake (what mental model they likely held).
2. Give a 1-sentence memorable analogy/rule that permanently prevents this mistake.
Return JSON with { "explanation": string, "mentalModelFix": string }`;

    try {
      const res = await this.callGemini(prompt);
      return {
        isAiGenerated: true,
        explanation: res.explanation,
        mentalModelFix: res.mentalModelFix,
        engineNotice: 'AI Personalized Diagnosis'
      };
    } catch (err) {
      return {
        isAiGenerated: false,
        explanation: `Analysis: Choosing this option indicates: ${misconceptionLabel}. Pay close attention to object references vs value copies.`,
        mentalModelFix: 'Remember: In Python and JS, variables are pointers to memory locations, not isolated boxes.',
        engineNotice: 'Using Curated Diagnostic Fallback'
      };
    }
  }
}
