/**
 * GapGenius Core Diagnostic Engine
 * Evaluates performance, diagnoses cognitive misconceptions, computes metacognitive calibration,
 * and builds the Concept Mastery Graph.
 */

export class DiagnosticEngine {
  /**
   * Evaluates student's submission
   * @param {Array} questions - The diagnostic questions array (with ground truth)
   * @param {Array} userSubmissions - Array of { questionId, selectedOptionId, confidence: 'low'|'medium'|'high' }
   */
  static evaluateSubmission(questions, userSubmissions) {
    const questionMap = new Map();
    questions.forEach(q => questionMap.set(q.id, q));

    let correctCount = 0;
    const evaluatedQuestions = [];
    const conceptMap = new Map();

    const calibration = {
      rockSolidMastery: 0,
      dangerousMisconceptions: 0,
      luckyGuesses: 0,
      blindspots: 0
    };

    const identifiedGaps = [];

    userSubmissions.forEach(sub => {
      const originalQ = questionMap.get(sub.questionId);
      if (!originalQ) return;

      const selectedOpt = originalQ.options.find(o => o.id === sub.selectedOptionId);
      const correctOpt = originalQ.options.find(o => o.isCorrect);

      const isCorrect = Boolean(selectedOpt?.isCorrect);
      if (isCorrect) correctCount++;

      const confidence = (sub.confidence || 'medium').toLowerCase();

      // Metacognitive Calibration classification
      let calibrationType = '';
      if (isCorrect) {
        if (confidence === 'high') {
          calibrationType = 'rock_solid_mastery';
          calibration.rockSolidMastery++;
        } else {
          calibrationType = 'lucky_guess';
          calibration.luckyGuesses++;
        }
      } else {
        if (confidence === 'high') {
          calibrationType = 'dangerous_misconception';
          calibration.dangerousMisconceptions++;
        } else {
          calibrationType = 'blindspot';
          calibration.blindspots++;
        }
      }

      // Track by concept
      const conceptId = originalQ.conceptId || 'general';
      const conceptName = originalQ.conceptName || 'General Concept';
      const prereqId = originalQ.prereqId || null;

      if (!conceptMap.has(conceptId)) {
        conceptMap.set(conceptId, {
          conceptId,
          conceptName,
          prereqId,
          total: 0,
          correct: 0,
          score: 0,
          status: 'unknown',
          misconceptionsIdentified: []
        });
      }

      const cData = conceptMap.get(conceptId);
      cData.total++;
      if (isCorrect) cData.correct++;

      const misconceptionLabel = selectedOpt && !isCorrect ? selectedOpt.misconceptionLabel : null;
      const misconceptionExplanation = selectedOpt && !isCorrect ? selectedOpt.misconceptionExplanation : null;

      if (!isCorrect && misconceptionLabel) {
        cData.misconceptionsIdentified.push({
          questionId: originalQ.id,
          label: misconceptionLabel,
          explanation: misconceptionExplanation,
          calibrationType
        });
      }

      const evalItem = {
        questionId: originalQ.id,
        conceptId,
        conceptName,
        questionText: originalQ.question,
        code: originalQ.code || null,
        selectedOptionId: sub.selectedOptionId,
        selectedOptionText: selectedOpt ? selectedOpt.text : 'No option chosen',
        correctOptionId: correctOpt ? correctOpt.id : 'N/A',
        correctOptionText: correctOpt ? correctOpt.text : 'N/A',
        isCorrect,
        confidence,
        calibrationType,
        misconceptionLabel,
        misconceptionExplanation,
        remediation: originalQ.remediation || null
      };

      evaluatedQuestions.push(evalItem);

      if (!isCorrect) {
        identifiedGaps.push({
          conceptId,
          conceptName,
          questionId: originalQ.id,
          misconceptionLabel,
          misconceptionExplanation,
          remediation: originalQ.remediation,
          calibrationType
        });
      }
    });

    // Compute concept mastery scores
    const conceptMastery = {};
    conceptMap.forEach((val, key) => {
      const score = Math.round((val.correct / val.total) * 100);
      let status = 'critical_gap';
      if (score >= 80) status = 'mastered';
      else if (score >= 50) status = 'fragile';

      conceptMastery[key] = {
        ...val,
        score,
        status
      };
    });

    const totalQuestions = userSubmissions.length || questions.length;
    const overallScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Build Knowledge Graph
    const knowledgeGraph = this.buildKnowledgeGraph(conceptMastery, questions);

    return {
      overallScore,
      totalQuestions,
      correctCount,
      calibration,
      conceptMastery,
      identifiedGaps,
      evaluatedQuestions,
      knowledgeGraph
    };
  }

  /**
   * Generates interactive Knowledge Graph representation (nodes & directed prerequisite edges)
   */
  static buildKnowledgeGraph(conceptMastery, questions) {
    const nodes = [];
    const edges = [];
    const visitedConcepts = new Set();

    Object.values(conceptMastery).forEach((c, idx) => {
      visitedConcepts.add(c.conceptId);

      let color = '#ef4444'; // Red for critical gap
      if (c.status === 'mastered') color = '#22c55e'; // Green
      else if (c.status === 'fragile') color = '#f59e0b'; // Amber

      nodes.push({
        id: c.conceptId,
        label: c.conceptName,
        score: c.score,
        status: c.status,
        color,
        isRootCause: c.status !== 'mastered' && !c.prereqId,
        prereqId: c.prereqId || null
      });

      if (c.prereqId) {
        edges.push({
          from: c.prereqId,
          to: c.conceptId,
          label: 'Prerequisite for'
        });
      }
    });

    return { nodes, edges };
  }

  /**
   * Evaluates the follow-up adaptive practice question to measure mastery delta
   */
  static evaluateFollowUp(followUpQuestion, selectedOptionId, previousConceptScore = 30) {
    const selected = followUpQuestion.options.find(o => o.id === selectedOptionId);
    const isCorrect = Boolean(selected?.isCorrect);

    // If correct, mastery jumps significantly (closing the gap!)
    const postRemediationScore = isCorrect ? Math.min(100, previousConceptScore + 55) : previousConceptScore;
    const masteryGain = postRemediationScore - previousConceptScore;

    return {
      isCorrect,
      selectedOptionId,
      explanation: selected ? selected.explanation : 'Evaluation completed.',
      previousScore: previousConceptScore,
      postScore: postRemediationScore,
      masteryGain,
      gapFixed: isCorrect,
      status: isCorrect ? 'mastered' : 'needs_further_review'
    };
  }
}
