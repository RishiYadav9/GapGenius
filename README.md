# GapGenius 🎯
> **Tagline:** *Find the gap. Fix the gap.*

[![Node.js](https://img.shields.io/badge/Node.js-v24.22.1-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3.1-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4.svg)](https://aistudio.google.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Supported-47A248.svg)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Executive Summary & Rubric Alignment

Over **40 teams** at this hackathon are presenting educational quiz apps. Most build a conventional testing flow: answer 5 questions, see a percentage score like "60%", and read a generic text summary.

**GapGenius takes an entirely different, scientifically grounded approach:**
1. **Raw scores do not equal understanding.** A student with 60% might have made lucky guesses, or they might hold a deep-seated mental model flaw that will cause severe bugs in production.
2. **Distractor-Mapped Cognitive Taxonomy.** Every incorrect answer option (distractor) isolates a specific named misconception.
3. **Metacognitive Calibration.** Evaluates student confidence alongside answer correctness to identify the **Dunning-Kruger Trap** (High Confidence + Wrong Answer).
4. **Visual Knowledge Dependency Graph.** Traces failed concepts to their broken foundational prerequisites.
5. **Closed-Loop Remediation.** Fixes the schema with a 45-second micro-explanation, delivers an adaptive follow-up challenge, and quantifies the **Real-Time Mastery Delta (+55% lift)**.

### 🏆 Hackathon Judging Rubric Alignment

| Criterion | Weight | GapGenius Implementation |
|---|:---:|---|
| **Technical Execution & Working MVP** | **25%** | Full-stack monorepo with Express backend, Vite + React frontend, zero-install unified production server, automated test suites, secure server-side answer evaluation. |
| **Problem Understanding & Relevance** | **20%** | Tackles the core educational limitation of raw score reporting by decomposing performance into granular prerequisite concepts and diagnosing why mistakes occur. |
| **Innovation & Originality** | **20%** | Metacognitive Calibration Matrix (Confidence vs Accuracy quadrant), automated Dunning-Kruger trap detection, interactive Concept Dependency Graph, real-time Mastery Delta Gauge. |
| **Practicality & Real-World Impact** | **15%** | Zero-failure resilient architecture: full offline diagnostic banks and local JSON vault ensure 100% uptime even if API quotas or internet drop. Runtime settings modal for live key injection. |
| **Use of AI & Technology** | **10%** | Google Gemini 1.5 Flash structured JSON schema generation for on-the-fly custom syllabi + automated psychometric distractor generation. |
| **Demo & Clarity** | **10%** | Dedicated **1-Click Judge Demo** preset loads an instant misconception scenario in 5 seconds; complete 2-minute pitch script included in `demo_script.md`. |

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        GAPGENIUS CLIENT (React + Vite)                 │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌─────────────┐  │
│  │ Topic & Difficulty    │  │ Metacognitive Quiz   │  │ Gap Radar   │  │
│  │ Selector (Curated/AI) │  │ (Confidence Slider)  │  │ Dashboard   │  │
│  └───────────┬───────────┘  └──────────┬───────────┘  └──────▲──────┘  │
└──────────────┼─────────────────────────┼─────────────────────┼─────────┘
               │                         │                     │
               ▼                         ▼                     │
┌──────────────────────────────────────────────────────────────┴─────────┐
│                     GAPGENIUS ENGINE (Express.js API)                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   Diagnostic & Evaluation Engine                 │  │
│  │  • Prerequisite Graph Traversal   • Metacognitive Calibration    │  │
│  │  • Distractor Misconception Map   • Real-Time Mastery Delta Calc │  │
│  └──────────────────┬───────────────────────────────┬───────────────┘  │
│                     │                               │                  │
│                     ▼                               ▼                  │
│  ┌───────────────────────────────────┐  ┌───────────────────────────┐  │
│  │        AI Generation Layer        │  │     Persistence Layer     │  │
│  │  • Primary: Google Gemini Flash   │  │  • Primary: MongoDB Atlas │  │
│  │  • Fallback: Expert Domain Banks  │  │  • Fallback: Local Vault  │  │
│  └───────────────────────────────────┘  └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Features

### 1. Metacognitive Calibration Matrix (2×2 Quadrant)
Before submitting each answer, students tag their confidence level (*Guessing*, *Somewhat Sure*, *100% Confident*). This reveals the cognitive state behind the score:

| Quadrant | Psychological State | Pedagogical Intervention |
|---|---|---|
| **High Conf + Correct** | **Rock-Solid Mastery** | Advance to higher difficulty tier. |
| **High Conf + Incorrect** | **Dangerous Misconception (Dunning-Kruger)** | Immediate priority remediation; student is confident in a flawed mental model. |
| **Low Conf + Correct** | **Lucky Guess / Fragile Intuition** | Deliver reinforcing conceptual analogies. |
| **Low Conf + Incorrect** | **Acknowledged Knowledge Gap** | Student recognizes unknown concepts; high learning receptivity. |

### 2. Interactive Concept Dependency Graph
Visualizes knowledge as a directed acyclic graph (DAG). Concepts glow **Green (Mastered)**, **Amber (Fragile)**, or **Red (Critical Gap)**. The engine traverses prerequisite pointers to indicate when an advanced topic failure is caused by an unmastered prerequisite.

### 3. Closed-Loop "Fix the Gap" Engine
- **45-Second Schema Fix**: Accessible mental model analogy (e.g. *sticky notes on a shared box vs cloned box*).
- **Adaptive Follow-Up Challenge**: Specifically tests the repaired schema with a fresh, non-identical problem.
- **Mastery Delta Gauge**: Quantifies the learning gain (e.g. `30% ➔ 85% (+55% Gain)`) with celebration animations.

### 4. Zero-Failure Resilience & Transparency
- If `GEMINI_API_KEY` is present: Uses dynamic AI generation for any topic.
- If `GEMINI_API_KEY` is absent: Uses curated expert diagnostic banks across Computer Science, Data Structures, and Web Architecture.
- If `MONGODB_URI` is present: Automatically saves sessions to MongoDB Atlas.
- If `MONGODB_URI` is absent: Persists sessions to in-memory store and `server/data/session_vault.json`.
- **Honest UI Indicators**: Top header badges clearly communicate whether the system is running in live cloud mode or offline fallback mode.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm 9+

### Option A: Unified Full-Stack Run (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/gapgenius.git
   cd gapgenius
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Build client assets:
   ```bash
   npm run build:client
   ```

4. Start the unified server (serves API and Frontend on port 5000):
   ```bash
   npm start
   ```

5. Open your browser at:
   ```text
   http://localhost:5000
   ```

---

### Option B: Development Mode (Hot Reloading)

Run the backend and frontend in separate terminals:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend with Vite HMR):**
```bash
cd client
npm run dev
# Running on http://localhost:3000 (proxies /api to :5000)
```

---

## ⚙️ Environment Variables (Optional)

Create a `.env` file in `server/.env` (see `server/.env.example`):

```ini
PORT=5000
NODE_ENV=development

# Optional: MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/gapgenius?retryWrites=true&w=majority

# Optional: Google Gemini API Key (https://aistudio.google.com/)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
```

> **Note:** Both variables are completely optional! If omitted, GapGenius defaults seamlessly to its local diagnostic banks and JSON session vault. You can also paste keys live during runtime using the in-app **Settings (⚙️)** modal.

---

## 🧪 Automated Testing

GapGenius includes verified test suites:

```bash
# Test Core Diagnostic Engine & Misconception Taxonomy
cd server
node test_engine.js

# Test All HTTP Endpoints & Production Static Hosting
node test_http.js
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check, AI status, and MongoDB connection mode. |
| `GET` | `/api/topics` | Returns curated diagnostic domains with concept hierarchies. |
| `POST` | `/api/diagnostic/generate` | Generates diagnostic questions for any topic (Gemini or Curated). |
| `POST` | `/api/diagnostic/evaluate` | Evaluates student answers, confidence ratings, and builds the knowledge graph. |
| `POST` | `/api/remediation/verify` | Verifies follow-up question answer and calculates mastery lift delta. |
| `GET` | `/api/sessions` | Retrieves past diagnostic attempts from Atlas or Local Vault. |
| `GET` | `/api/analytics` | Returns platform-wide learning stats and misconception trends. |
| `POST` | `/api/config/update` | Updates Gemini API key or Mongo URI dynamically at runtime. |

---

## 📂 Project Structure

```text
gapgenius/
├── client/                      # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx             # Live engine badges & quick actions
│   │   │   ├── TopicSelector.jsx      # Curated topics & dynamic AI generator
│   │   │   ├── DiagnosticQuiz.jsx     # Metacognitive confidence test
│   │   │   ├── GapDashboard.jsx       # Mastery matrix & misconception breakdown
│   │   │   ├── KnowledgeGraphView.jsx # Visual concept dependency map
│   │   │   ├── RemediationModal.jsx   # Micro-remediation & mastery lift gauge
│   │   │   ├── SettingsModal.jsx      # Runtime key & database configuration
│   │   │   ├── AnalyticsModal.jsx     # Platform-level learning analytics
│   │   │   └── SessionHistory.jsx     # Saved diagnostic attempts
│   │   ├── services/
│   │   │   └── api.js                 # API communication client
│   │   ├── App.jsx                    # State coordinator & view router
│   │   ├── main.jsx                   # Entry mount
│   │   └── index.css                  # Tailwind styles & glassmorphism
│   ├── vite.config.js                 # Dev proxy configuration
│   └── package.json
│
├── server/                      # Express.js backend
│   ├── data/
│   │   └── session_vault.json         # Local offline session persistence
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                 # Environment configuration
│   │   ├── db/
│   │   │   └── connection.js          # MongoDB Atlas + Local Vault fallback
│   │   ├── models/
│   │   │   └── Session.js             # Mongoose schema & repository pattern
│   │   ├── services/
│   │   │   ├── aiService.js           # Gemini API integration & fallbacks
│   │   │   └── diagnosticEngine.js    # Metacognitive & misconception engine
│   │   ├── data/
│   │   │   └── fallbackBanks.js       # Curated distractor-tagged question bank
│   │   ├── routes/
│   │   │   └── api.js                 # REST API endpoints
│   │   └── index.js                   # Express server & unified static host
│   ├── test_engine.js                 # Diagnostic engine test suite
│   ├── test_http.js                   # End-to-end HTTP test suite
│   └── package.json
│
├── demo_script.md               # 2-minute winning pitch & judge walkthrough
├── package.json                 # Monorepo scripts
└── README.md
```

---

## 🏆 Standout Competitive Advantages

1. **Not Just Another Quiz App**: Identifies *why* a student picked option B, isolating the flawed schema.
2. **The Dunning-Kruger Detector**: Catches students who are confidently wrong before it damages real projects.
3. **True Closed-Loop Learning**: Verifies that the gap was actually repaired, showing quantified before/after mastery improvement.
4. **Zero-Crash Reliability**: Designed to never fail during a live judge demonstration.

---

**GapGenius — Find the gap. Fix the gap.**
Built with ❤️ for Hackathon Excellence.
