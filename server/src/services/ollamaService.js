import { config } from '../config/env.js';
import { generateTopicAwareQuiz } from '../data/fallbackBanks.js';

/**
 * Ollama Local AI Service
 * Connects to Ollama's local HTTP API (http://localhost:11434)
 * Supports configurable model via OLLAMA_MODEL
 */
export class OllamaService {
  /**
   * Checks if Ollama daemon is running locally and inspects installed models
   */
  static async checkAvailability() {
    const host = config.ollamaHost || 'http://localhost:11434';
    const targetModel = (config.ollamaModel || 'llama3').toLowerCase();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout for local ping

      const res = await fetch(`${host}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        return {
          available: false,
          host,
          model: config.ollamaModel,
          installedModels: [],
          hasSelectedModel: false,
          error: `Ollama returned HTTP ${res.status}`
        };
      }

      const data = await res.json();
      const models = Array.isArray(data.models) ? data.models.map(m => m.name) : [];
      const hasSelectedModel = models.some(m => m.toLowerCase().includes(targetModel) || targetModel.includes(m.toLowerCase()));

      return {
        available: true,
        host,
        model: config.ollamaModel,
        installedModels: models,
        hasSelectedModel,
        error: null
      };
    } catch (err) {
      return {
        available: false,
        host,
        model: config.ollamaModel,
        installedModels: [],
        hasSelectedModel: false,
        error: err.message
      };
    }
  }

  /**
   * Low-level API call to Ollama /api/chat with JSON format and timeout
   */
  static async callOllama(userPrompt, systemInstruction = '') {
    const host = config.ollamaHost || 'http://localhost:11434';
    const model = config.ollamaModel || 'llama3';

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: userPrompt });

    const payload = {
      model,
      messages,
      format: 'json',
      stream: false,
      options: {
        temperature: 0.2, // Low temperature for high factual accuracy
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout for local model inference

    try {
      const response = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const rawText = json.message?.content;
      if (!rawText) {
        throw new Error('Empty message content from Ollama API');
      }

      return JSON.parse(rawText);
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[OllamaService] Call failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Generates diagnostic MCQs using Ollama
   * Falls back gracefully to topic-aware fallback if Ollama is offline or uninstalled
   */
  static async generateDiagnosticQuiz(topicQuery, difficulty = 'intermediate', questionCount = 3) {
    const cleanTopic = (topicQuery || 'General Computer Science').trim();

    // Check availability first
    const status = await this.checkAvailability();
    if (!status.available) {
      console.log(`[OllamaService] Ollama not available at ${status.host} (${status.error}). Using topic-aware fallback.`);
      const fallback = generateTopicAwareQuiz(cleanTopic, difficulty, questionCount);
      fallback.engineNotice = `Topic-Aware Diagnostic Engine (Ollama local API offline at ${status.host}). Real-time tailored questions generated.`;
      return fallback;
    }

    const systemPrompt = `You are the lead psychometrician and computer science pedagogical architect for GapGenius.
Your core mission: "Find the gap. Fix the gap."
You do NOT write superficial trivia questions. You design DIAGNOSTIC MULTIPLE-CHOICE QUESTIONS where EVERY incorrect option (distractor) isolates a specific named conceptual misunderstanding or mental model flaw.

CRITICAL RULES:
1. ALL questions MUST be strictly relevant to the topic: "${cleanTopic}".
2. You must generate exactly ${questionCount} DISTINCT questions.
3. Every question must have EXACTLY 4 options with IDs 'A', 'B', 'C', 'D'.
4. EXACTLY ONE option must have "isCorrect": true.
5. Each distractor (isCorrect: false) must have a specific "misconceptionLabel" and "misconceptionExplanation".
6. Every question must include a "remediation" object with "conceptExplanation", "mentalModelFix", and an adaptive "followUpQuestion" with 3 options and 1 correct answer.

JSON Schema format:
{
  "topic": string,
  "concepts": [
    { "id": string, "name": string, "prereq": string | null }
  ],
  "questions": [
    {
      "id": string,
      "conceptId": string,
      "conceptName": string,
      "difficulty": "foundational" | "intermediate" | "advanced",
      "question": string,
      "code": string,
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

    const userPrompt = `Generate a diagnostic quiz on "${cleanTopic}" with difficulty "${difficulty}".
Create ${questionCount} distinct questions isolating core invariants, failure modes, and common misconceptions.`;

    try {
      const result = await this.callOllama(userPrompt, systemPrompt);

      // Validate question structure
      if (!Array.isArray(result.questions) || result.questions.length < 2) {
        throw new Error('Ollama response did not contain required question count');
      }

      return {
        topic: result.topic || cleanTopic,
        topicId: cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        difficulty,
        engineUsed: 'ollama-ai',
        modelName: config.ollamaModel,
        isAiGenerated: true,
        engineNotice: `Ollama Local AI Engine (${config.ollamaModel}). Real-time on-device generation for "${cleanTopic}".`,
        concepts: result.concepts || [],
        questions: result.questions.slice(0, questionCount)
      };
    } catch (err) {
      console.warn(`[OllamaService] Failed to generate with Ollama (${err.message}). Using topic-aware fallback.`);
      const fallback = generateTopicAwareQuiz(cleanTopic, difficulty, questionCount);
      fallback.engineNotice = `Topic-Aware Fallback Engine (Ollama inference failed: ${err.message}). Distinct questions generated for "${cleanTopic}".`;
      return fallback;
    }
  }

  /**
   * Generates AI Tutor Explanation using Ollama
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
    const status = await this.checkAvailability();
    if (!status.available) {
      return {
        isAiGenerated: false,
        engineUsed: 'heuristic-tutor-fallback',
        engineNotice: `GapGenius Pedagogical Tutor (Heuristic Mode — Ollama offline at ${status.host})`,
        conceptName: conceptName || topic,
        studentMistake: `You selected: "${selectedOptionText}". This occurs due to ${misconceptionLabel || 'a common mental model mismatch'}, assuming standard sequential execution or value copying.`,
        whyCorrectIsRight: `The correct answer "${correctOptionText}" is right because ${conceptName || topic} strictly preserves lifecycle invariants and reference rules.`,
        underlyingMisconception: misconceptionLabel || 'State Invariant Misconception',
        simpleExample: code 
          ? `// Concrete Rule for ${conceptName || topic}:\n${code}\n// Notice how the state transitions predictably.`
          : `// Memory & Execution Rule for ${conceptName || topic}:\nconst invariant = true; // Always verify reference vs value semantics!`,
        mentalModelFix: 'Always trace where variables live and when operations execute. Never assume assignment clones memory or that asynchronous operations run immediately.'
      };
    }

    const systemPrompt = `You are GapGenius AI Tutor. Provide a concise, crystal-clear pedagogical breakdown of a student's mistake.
Output ONLY JSON matching:
{
  "studentMistake": string (2 sentences explaining WHY they picked their answer and what flawed mental model caused it),
  "whyCorrectIsRight": string (2 sentences explaining why the correct answer is undeniably true),
  "underlyingMisconception": string (concise name of the mental flaw),
  "simpleExample": string (short 2-4 line code snippet or concrete analogy illustrating the difference),
  "mentalModelFix": string (1 memorable punchy rule of thumb)
}`;

    const userPrompt = `Topic: ${topic}
Concept: ${conceptName}
Question: ${questionText}
${code ? `Code:\n${code}\n` : ''}
Student Selected: "${selectedOptionText}"
Correct Answer: "${correctOptionText}"
Diagnosed Misconception: ${misconceptionLabel || 'Schema flaw'}`;

    try {
      const res = await this.callOllama(userPrompt, systemPrompt);
      return {
        isAiGenerated: true,
        engineUsed: 'ollama-ai',
        modelName: config.ollamaModel,
        engineNotice: `Ollama Local AI Tutor (${config.ollamaModel})`,
        conceptName: conceptName || topic,
        studentMistake: res.studentMistake,
        whyCorrectIsRight: res.whyCorrectIsRight,
        underlyingMisconception: res.underlyingMisconception || misconceptionLabel,
        simpleExample: res.simpleExample,
        mentalModelFix: res.mentalModelFix
      };
    } catch (err) {
      console.warn(`[OllamaService] Tutor inference failed (${err.message}). Using pedagogical fallback.`);
      return {
        isAiGenerated: false,
        engineUsed: 'heuristic-tutor-fallback',
        engineNotice: `GapGenius Pedagogical Tutor (Fallback Mode: Ollama error ${err.message})`,
        conceptName: conceptName || topic,
        studentMistake: `You selected "${selectedOptionText}". This reflects ${misconceptionLabel || 'an intuition trap'}, assuming sequential execution or independent state.`,
        whyCorrectIsRight: `The correct answer "${correctOptionText}" adheres to the formal invariants of ${conceptName || topic}.`,
        underlyingMisconception: misconceptionLabel || 'Intuition vs Specification Mismatch',
        simpleExample: code || `// In ${topic}:\n// Allocations occur once; references are shared.`,
        mentalModelFix: 'Think of variables as reference labels and async events as queued tasks.'
      };
    }
  }

  /**
   * Interactive Conversational AI Tutor
   * Answers student doubts, explains concepts simply, provides code walkthroughs
   */
  static async chatWithTutor({
    topic = 'Computer Science',
    conceptName,
    questionContext = '',
    history = [],
    message
  }) {
    const status = await this.checkAvailability();
    if (!status.available) {
      throw new Error(`Ollama daemon is offline at ${status.host}`);
    }

    const host = config.ollamaHost || 'http://localhost:11434';
    const model = config.ollamaModel || 'llama3';

    const systemPrompt = `You are GapGenius AI Tutor, an empathetic, expert computer science tutor.
Tagline: "Find the gap. Fix the gap."
Context:
- Topic: ${topic}
- Concept: ${conceptName || topic}
${questionContext ? `- Diagnostic Question Context: ${questionContext}` : ''}

Your mission:
Help the student build a rock-solid mental model. Answer their questions clearly, directly, and encouragingly. Use concise real-world analogies and short (2-6 lines) code snippets whenever relevant. Keep answers under 150 words unless writing a code example.`;

    const messages = [{ role: 'system', content: systemPrompt }];
    for (const h of history) {
      if (h.role && h.content) {
        messages.push({ role: h.role, content: h.content });
      }
    }
    messages.push({ role: 'user', content: message });

    const payload = {
      model,
      messages,
      stream: false,
      options: { temperature: 0.3 }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Ollama error ${response.status}: ${await response.text()}`);
      }

      const json = await response.json();
      const reply = json.message?.content || 'I am ready to help you fix any gap in this concept!';

      return {
        reply,
        isAiGenerated: true,
        engineUsed: 'ollama-ai',
        modelName: model,
        engineNotice: `Ollama Local AI Tutor (${model})`
      };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
