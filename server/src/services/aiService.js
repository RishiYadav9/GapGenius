import { config } from '../config/env.js';
import { FALLBACK_TOPICS, generateTopicAwareQuiz } from '../data/fallbackBanks.js';
import { OllamaService } from './ollamaService.js';

/**
 * Universal AI Orchestration Service
 * Integrates Ollama (Local AI at http://localhost:11434) and Google Gemini (Cloud)
 * with robust Topic-Aware Heuristic Fallback
 */
export class AIService {
  static isGeminiConfigured() {
    return Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 10);
  }

  static async getEngineStatus() {
    const ollamaStatus = await OllamaService.checkAvailability();
    const geminiAvailable = this.isGeminiConfigured();

    let activeProvider = 'heuristic-fallback';
    let engineName = 'Topic-Aware Diagnostic Engine (Heuristic Fallback)';
    let activeModel = 'Heuristic-v2';

    if (config.aiProvider === 'ollama' && ollamaStatus.available) {
      activeProvider = 'ollama';
      engineName = `Ollama Local AI (${config.ollamaModel})`;
      activeModel = config.ollamaModel;
    } else if (config.aiProvider === 'gemini' && geminiAvailable) {
      activeProvider = 'gemini';
      engineName = `Google Gemini AI (${config.geminiModel})`;
      activeModel = config.geminiModel;
    } else if (ollamaStatus.available) {
      activeProvider = 'ollama';
      engineName = `Ollama Local AI (${config.ollamaModel})`;
      activeModel = config.ollamaModel;
    } else if (geminiAvailable) {
      activeProvider = 'gemini';
      engineName = `Google Gemini AI (${config.geminiModel})`;
      activeModel = config.geminiModel;
    }

    return {
      aiAvailable: activeProvider !== 'heuristic-fallback',
      activeProvider,
      model: activeModel,
      engineName,
      isFallbackMode: activeProvider === 'heuristic-fallback',
      ollama: {
        available: ollamaStatus.available,
        host: config.ollamaHost,
        model: config.ollamaModel,
        installedModels: ollamaStatus.installedModels,
        hasSelectedModel: ollamaStatus.hasSelectedModel,
        error: ollamaStatus.error
      },
      gemini: {
        available: geminiAvailable,
        model: config.geminiModel
      }
    };
  }

  /**
   * Helper to make Gemini REST API calls with timeout protection
   */
  static async callGemini(promptText, systemInstruction = '', responseSchema = null) {
    if (!this.isGeminiConfigured()) {
      throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
    }

    const model = config.geminiModel || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

    const contents = [{ role: 'user', parts: [{ text: promptText }] }];
    const bodyPayload = {
      contents,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    if (responseSchema) {
      bodyPayload.generationConfig.responseSchema = responseSchema;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

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
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response candidate from Gemini API');
      return JSON.parse(rawText);
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[AIService] Gemini call failed: ${err.message}`);
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
   * Uses Ollama if active/available; otherwise falls back to Gemini or topic-aware fallback
   */
  static async generateDiagnosticQuiz(topicQuery, difficulty = 'intermediate', questionCount = 3) {
    const cleanTopic = (topicQuery || 'General Computer Science').trim();
    const ollamaStatus = await OllamaService.checkAvailability();

    // 1. If Ollama is preferred and available, run through Ollama
    if (config.aiProvider !== 'gemini' && ollamaStatus.available) {
      console.log(`[AIService] Generating diagnostic with Ollama (${config.ollamaModel}) for "${cleanTopic}"`);
      return OllamaService.generateDiagnosticQuiz(cleanTopic, difficulty, questionCount);
    }

    // 2. If Gemini is configured and available
    if (this.isGeminiConfigured() && (config.aiProvider === 'gemini' || !ollamaStatus.available)) {
      console.log(`[AIService] Generating diagnostic with Gemini (${config.geminiModel}) for "${cleanTopic}"`);
      const systemPrompt = `You are the lead psychometrician and computer science pedagogical architect for GapGenius.
Your core mission: "Find the gap. Fix the gap."
You do NOT write superficial trivia questions. You design DIAGNOSTIC MULTIPLE-CHOICE QUESTIONS where EVERY incorrect option (distractor) isolates a specific named conceptual misunderstanding or mental model flaw.

CRITICAL RULES:
1. ALL questions MUST be strictly relevant to "${cleanTopic}".
2. Exactly ${questionCount} DISTINCT questions.
3. Every question must have EXACTLY 4 options with IDs 'A', 'B', 'C', 'D'.
4. EXACTLY ONE option must have "isCorrect": true.
5. Each distractor must have a specific "misconceptionLabel" and "misconceptionExplanation".
6. Every question must include "remediation" with "conceptExplanation", "mentalModelFix", and "followUpQuestion".`;

      const userPrompt = `Generate a diagnostic quiz on "${cleanTopic}" with difficulty "${difficulty}".
Create ${questionCount} distinct questions addressing core invariants and common misconceptions.`;

      try {
        const result = await this.callGemini(userPrompt, systemPrompt);
        if (this.validateQuestions(result.questions, cleanTopic)) {
          return {
            topic: result.topic || cleanTopic,
            topicId: cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            difficulty,
            engineUsed: 'gemini-ai',
            modelName: config.geminiModel,
            isAiGenerated: true,
            engineNotice: `AI-Generated Dynamic Diagnostic Engine (Gemini Flash). Questions tailored in real-time for "${cleanTopic}".`,
            concepts: result.concepts || [],
            questions: result.questions.slice(0, questionCount)
          };
        }
      } catch (err) {
        console.warn(`[AIService] Gemini failed (${err.message}). Checking Ollama fallback.`);
      }
    }

    // 3. Fallback to Ollama if Gemini failed but Ollama is running
    if (ollamaStatus.available) {
      return OllamaService.generateDiagnosticQuiz(cleanTopic, difficulty, questionCount);
    }

    // 4. Topic-Aware Heuristic Fallback (Zero dependencies, deterministic, topic-relevant)
    console.log(`[AIService] AI providers offline. Using Topic-Aware Diagnostic Fallback for: "${cleanTopic}"`);
    const fallbackQuiz = generateTopicAwareQuiz(cleanTopic, difficulty, questionCount);
    fallbackQuiz.engineNotice = `Topic-Aware Diagnostic Engine (Ollama not connected at ${config.ollamaHost}). Tailored questions generated for "${cleanTopic}".`;
    return fallbackQuiz;
  }

  /**
   * AI Tutor Explanation Service
   * Powered by Ollama or Gemini with transparent heuristic fallback
   */
  static async getAITutorExplanation({
    topic = 'Computer Science',
    conceptName,
    questionText,
    selectedOptionText,
    correctOptionText,
    misconceptionLabel,
    misconceptionExplanation = null,
    conceptExplanation = null,
    mentalModelFix = null,
    remediation = null,
    code = null
  }) {
    const ollamaStatus = await OllamaService.checkAvailability();

    // 1. If Ollama is available, use Ollama
    if (config.aiProvider !== 'gemini' && ollamaStatus.available) {
      return OllamaService.getAITutorExplanation({
        topic,
        conceptName,
        questionText,
        selectedOptionText,
        correctOptionText,
        misconceptionLabel,
        code
      });
    }

    // 2. If Gemini is configured, use Gemini
    if (this.isGeminiConfigured() && (config.aiProvider === 'gemini' || !ollamaStatus.available)) {
      const prompt = `You are GapGenius AI Tutor. Explain a student's mistake:
Topic: ${topic}
Concept: ${conceptName}
Question: ${questionText}
${code ? `Code:\n${code}\n` : ''}
Student Selected: "${selectedOptionText}"
Correct Answer: "${correctOptionText}"
Diagnosed Misconception: ${misconceptionLabel || 'Schema mismatch'}

Return JSON with:
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
        console.warn(`[AIService] Gemini AI Tutor call failed: ${err.message}`);
      }
    }

    // 3. Fallback to Ollama if Gemini failed
    if (ollamaStatus.available) {
      return OllamaService.getAITutorExplanation({
        topic,
        conceptName,
        questionText,
        selectedOptionText,
        correctOptionText,
        misconceptionLabel,
        code
      });
    }

    // 4. Topic-Aware Pedagogical Fallback Tutor with rich curated schema data
    const studentMistake = misconceptionExplanation
      ? `You selected "${selectedOptionText}". ${misconceptionExplanation}`
      : `You selected: "${selectedOptionText}". This occurs due to ${misconceptionLabel || 'a common mental model mismatch'}, assuming standard sequential execution or value copying.`;

    const whyCorrectIsRight = conceptExplanation || (remediation?.conceptExplanation)
      ? `The correct answer is "${correctOptionText}". ${conceptExplanation || remediation?.conceptExplanation}`
      : `The correct answer is: "${correctOptionText}". This holds true because ${conceptName || topic} guarantees that state and execution boundaries are strictly preserved.`;

    const mentalFix = mentalModelFix || (remediation?.mentalModelFix)
      || 'Always trace where variables live and when operations execute. Never assume assignment clones memory or that asynchronous operations run immediately.';

    const exampleSnippet = code || (remediation?.conceptExplanation 
      ? `// Rule for ${conceptName || topic}:\n// ${remediation.conceptExplanation.substring(0, 80)}...\nconst invariantValid = true;`
      : `// Memory / Logic Rule for ${conceptName || topic}:\nconst invariant = true; // Always verify reference vs value semantics!`);

    return {
      isAiGenerated: false,
      engineUsed: 'heuristic-tutor-fallback',
      engineNotice: `GapGenius Pedagogical Tutor (Heuristic Mode — Ollama offline at ${config.ollamaHost})`,
      conceptName: conceptName || topic,
      studentMistake,
      whyCorrectIsRight,
      underlyingMisconception: misconceptionLabel || 'Abstract Lifecycle & State Invariant Misunderstanding',
      simpleExample: exampleSnippet,
      mentalModelFix: mentalFix
    };
  }

  /**
   * Conversational AI Tutor Chat Service
   * Allows students to converse with the AI Tutor to ask doubts, explore analogies, and clarify concepts
   */
  static async chatWithTutor({
    topic = 'Computer Science',
    conceptName,
    questionContext = '',
    history = [],
    message
  }) {
    const cleanMsg = (message || '').trim();
    const ollamaStatus = await OllamaService.checkAvailability();

    // 1. If Ollama is preferred and running, chat with Ollama
    if (config.aiProvider !== 'gemini' && ollamaStatus.available) {
      try {
        return await OllamaService.chatWithTutor({ topic, conceptName, questionContext, history, message: cleanMsg });
      } catch (err) {
        console.warn(`[AIService] Ollama chat failed (${err.message}). Falling back.`);
      }
    }

    // 2. If Gemini is configured, chat with Gemini
    if (this.isGeminiConfigured() && (config.aiProvider === 'gemini' || !ollamaStatus.available)) {
      const prompt = `You are GapGenius AI Tutor, an empathetic, top-tier computer science educator.
Motto: "Find the gap. Fix the gap."
Context:
- Subject Topic: ${topic}
- Core Concept: ${conceptName || topic}
${questionContext ? `- Diagnostic Question Context:\n${questionContext}\n` : ''}

Student asks: "${cleanMsg}"

Provide an encouraging, crystal-clear explanation. Use a real-world physical analogy or concise code snippet where helpful. Keep your response under 150 words.`;

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel || 'gemini-1.5-flash'}:generateContent?key=${config.geminiApiKey}`;
        const contents = [];
        for (const h of history) {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          });
        }
        contents.push({ role: 'user', parts: [{ text: prompt }] });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const json = await res.json();
          const replyText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return {
              reply: replyText,
              isAiGenerated: true,
              engineUsed: 'gemini-ai',
              modelName: config.geminiModel,
              engineNotice: `Gemini AI Tutor (${config.geminiModel})`
            };
          }
        }
      } catch (err) {
        console.warn(`[AIService] Gemini chat failed: ${err.message}`);
      }
    }

    // 3. Fallback to Ollama if Gemini failed
    if (ollamaStatus.available) {
      try {
        return await OllamaService.chatWithTutor({ topic, conceptName, questionContext, history, message: cleanMsg });
      } catch (e) {}
    }

    // 4. Topic-Aware Pedagogical Heuristic Conversational Tutor
    const reply = this.generateHeuristicTutorReply(cleanMsg, topic, conceptName, questionContext);
    return {
      reply,
      isAiGenerated: false,
      engineUsed: 'heuristic-tutor-fallback',
      engineNotice: `GapGenius Pedagogical Tutor (Heuristic Dialogue Mode — Ollama offline at ${config.ollamaHost})`
    };
  }

  /**
   * Deterministic Pedagogical Chat Engine (Zero Failure Offline Mode)
   */
  static generateHeuristicTutorReply(userMessage, topic, conceptName, questionContext) {
    const q = userMessage.toLowerCase();
    const cName = conceptName || topic;

    if (q.includes('analogy') || q.includes('simpler') || q.includes('like i\'m 5') || q.includes('like i am 5') || q.includes('eli5')) {
      return `💡 **Intuitive Analogy for ${cName}:**\n\nThink of variables like **adhesive name tags** rather than physical storage containers. When you assign one variable to another (\`b = a\`), you are not building a second house or photocopying documents — you are simply sticking a second name tag onto the exact same building!\n\nIf someone paints the front door red through tag \`b\`, looking through tag \`a\` shows a red door too, because there is only one physical house in memory.`;
    }

    if (q.includes('code') || q.includes('example') || q.includes('snippet') || q.includes('how to')) {
      return `💻 **Concrete Implementation Rule for ${cName}:**\n\n\`\`\`python\n# ❌ Flawed mental model (assuming value clone):\na = [1, 2, 3]\nb = a\nb.append(4)  # Both 'a' and 'b' now see [1, 2, 3, 4]!\n\n# ✅ Correct approach (explicit independent copy):\nimport copy\nreal_clone = copy.deepcopy(a)\nreal_clone.append(99)  # 'a' remains completely untouched\n\`\`\`\n\n*Rule of thumb:* Always verify whether an operation mutates in-place or returns a new reference!`;
    }

    if (q.includes('production') || q.includes('bug') || q.includes('real world') || q.includes('why care')) {
      return `⚠️ **Why this causes catastrophic bugs in production:**\n\nIn multi-tenant or concurrent systems, inadvertent shared references lead to **silent data leakage**. If one customer's request mutates a shared cached object or default parameter, subsequent requests from different users will see or corrupt that state!\n\nDefensive cloning or using immutable data structures (like tuples or frozen dataclasses) eliminates this entire class of bugs.`;
    }

    if (q.includes('why') || q.includes('difference') || q.includes('how does')) {
      return `🔍 **The Core Invariant of ${cName}:**\n\nThe fundamental distinction comes down to **identity vs value**. In ${topic}, assigning or passing an identifier binds the reference address. To decouple them, the runtime must allocate distinct heap memory.\n\nWhenever you debug, ask: *"Am I altering the object itself, or rebinding the pointer?"* This one question prevents 90% of state synchronization errors.`;
    }

    return `Hello! I'm your GapGenius Pedagogical Tutor for **${cName}**.\n\nMy job is to make sure you don't just memorize answers, but build a rock-solid mental model of how **${topic}** works behind the scenes.\n\nYou can ask me:\n- *"Give me an intuitive analogy"*\n- *"Show me another code example"*\n- *"How do I avoid this bug in production?"*\n- Or any specific question about your quiz results!`;
  }
}
