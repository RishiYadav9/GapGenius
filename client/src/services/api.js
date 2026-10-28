const API_BASE = '/api';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      return {
        status: 'offline',
        database: { connected: false, mode: 'network-unavailable' },
        aiEngine: { available: false, isFallbackMode: true, engineName: 'Offline Fallback Engine' }
      };
    }
  },

  async getTopics() {
    const res = await fetch(`${API_BASE}/topics`);
    if (!res.ok) throw new Error('Failed to load topics');
    return await res.json();
  },

  async generateQuiz(topic, difficulty = 'intermediate', questionCount = 3) {
    const res = await fetch(`${API_BASE}/diagnostic/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty, questionCount })
    });
    if (!res.ok) throw new Error('Failed to generate diagnostic quiz');
    return await res.json();
  },

  async evaluateQuiz(quizId, submissions) {
    const res = await fetch(`${API_BASE}/diagnostic/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, submissions })
    });
    if (!res.ok) throw new Error('Failed to evaluate diagnostic submission');
    return await res.json();
  },

  async verifyRemediation(data) {
    const res = await fetch(`${API_BASE}/remediation/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to verify remediation answer');
    return await res.json();
  },

  async getSessions() {
    const res = await fetch(`${API_BASE}/sessions`);
    if (!res.ok) throw new Error('Failed to fetch session history');
    return await res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  },

  async updateConfig(config) {
    const res = await fetch(`${API_BASE}/config/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to update config');
    return await res.json();
  }
};
