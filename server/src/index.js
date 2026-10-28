import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB, getDBStatus } from './db/connection.js';
import { AIService } from './services/aiService.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Bulletproof Cross-Origin Resource Sharing (CORS) Configuration
app.use(cors({
  origin: true, // Reflects the requesting origin (e.g., localhost:3000, 5173, 127.0.0.1)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Explicit preflight handler for all routes
app.options('*', cors());

// Redundant CORS header fallback for full browser safety
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend build if available (Unified fullstack hosting)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static] Serving production frontend build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root fallback info if frontend build not generated yet
  app.get('/', (req, res) => {
    res.json({
      project: 'GapGenius',
      tagline: 'Find the gap. Fix the gap.',
      description: 'AI-Powered Personalized Learning Platform with Granular Concept & Misconception Diagnosis',
      status: 'online',
      endpoints: {
        health: '/api/health',
        topics: '/api/topics',
        diagnostic: '/api/diagnostic/generate',
        evaluate: '/api/diagnostic/evaluate',
        analytics: '/api/analytics'
      }
    });
  });
}

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Bootstrapping
const startServer = async () => {
  console.log('--------------------------------------------------');
  console.log('   GAPGENIUS - Find the gap. Fix the gap.');
  console.log('   Hackathon MVP Platform Engine Starting...');
  console.log('--------------------------------------------------');

  // Attempt DB connection (non-blocking fallback)
  await connectDB();

  const aiStatus = await AIService.getEngineStatus();
  console.log(`[AI Engine] ${aiStatus.engineName} (Model: ${aiStatus.model})`);

  return app.listen(config.port, () => {
    console.log(`[Server] GapGenius Backend listening on http://localhost:${config.port}`);
    console.log(`[Status] MongoDB: ${getDBStatus().mode} | AI: ${aiStatus.isFallbackMode ? 'Curated Bank (Fallback)' : (aiStatus.activeProvider === 'ollama' ? 'Ollama AI' : 'Gemini AI')}`);
  });
};

// Start automatically if run directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer();
}

export { app, startServer };
export default app;
