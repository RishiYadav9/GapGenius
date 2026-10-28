import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robustly locate and load .env from server dir, root dir, or cwd
const serverEnvPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB_NAME || 'gapgenius',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
};

// Runtime dynamic config updates (e.g. if user updates keys from UI)
export const updateRuntimeConfig = (newConfig) => {
  if (newConfig.geminiApiKey !== undefined) {
    config.geminiApiKey = newConfig.geminiApiKey;
  }
  if (newConfig.mongoUri !== undefined) {
    config.mongoUri = newConfig.mongoUri;
  }
  if (newConfig.mongoDbName !== undefined) {
    config.mongoDbName = newConfig.mongoDbName;
  }
  if (newConfig.geminiModel !== undefined) {
    config.geminiModel = newConfig.geminiModel;
  }
};
