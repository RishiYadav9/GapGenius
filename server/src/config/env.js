import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
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
  if (newConfig.geminiModel !== undefined) {
    config.geminiModel = newConfig.geminiModel;
  }
};
