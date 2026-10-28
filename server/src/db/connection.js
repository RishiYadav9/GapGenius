import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_FILE = path.resolve(__dirname, '../../data/session_vault.json');

// Ensure data directory exists
const dataDir = path.dirname(VAULT_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbStatus = {
  connected: false,
  mode: 'in-memory-fallback',
  lastError: null,
  databaseName: null,
};

// In-Memory Fallback Store with file persistence
class LocalSessionStore {
  constructor() {
    this.sessions = [];
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(VAULT_FILE)) {
        const raw = fs.readFileSync(VAULT_FILE, 'utf-8');
        this.sessions = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[SessionVault] Failed to load local backup:', err.message);
      this.sessions = [];
    }
  }

  saveToDisk() {
    try {
      fs.writeFileSync(VAULT_FILE, JSON.stringify(this.sessions, null, 2), 'utf-8');
    } catch (err) {
      console.error('[SessionVault] Failed to write local backup:', err.message);
    }
  }

  async save(sessionData) {
    const session = {
      _id: sessionData._id || 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      ...sessionData,
    };
    this.sessions.unshift(session);
    // Keep max 100 sessions
    if (this.sessions.length > 100) this.sessions.pop();
    this.saveToDisk();
    return session;
  }

  async find(query = {}) {
    return this.sessions;
  }

  async findById(id) {
    return this.sessions.find(s => s._id === id || s.id === id) || null;
  }

  async count() {
    return this.sessions.length;
  }
}

export const localStore = new LocalSessionStore();

export const connectDB = async () => {
  if (!config.mongoUri) {
    console.log('[DB] No MONGODB_URI configured. Running in Local Vault Fallback Mode.');
    dbStatus = {
      connected: false,
      mode: 'local-vault',
      lastError: 'No MONGODB_URI provided',
      databaseName: 'Local Memory & JSON Vault',
    };
    return false;
  }

  try {
    console.log('[DB] Attempting connection to MongoDB Atlas...');
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000, // Do not hang indefinitely
    });

    dbStatus = {
      connected: true,
      mode: 'mongodb-atlas',
      lastError: null,
      databaseName: mongoose.connection.name || 'gapgenius',
    };
    console.log(`[DB] Connected successfully to MongoDB Atlas (${dbStatus.databaseName})`);
    return true;
  } catch (error) {
    console.warn(`[DB] MongoDB Atlas connection failed: ${error.message}`);
    console.log('[DB] Safely falling back to Local Session Vault.');
    dbStatus = {
      connected: false,
      mode: 'local-vault-fallback',
      lastError: error.message,
      databaseName: 'Local Memory & JSON Vault',
    };
    return false;
  }
};

export const getDBStatus = () => dbStatus;
