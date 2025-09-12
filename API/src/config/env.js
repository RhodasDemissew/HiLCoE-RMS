import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: requireEnv('MONGO_URI', 'mongodb://localhost:27017/hilcoe_rms'),
  jwtSecret: requireEnv('JWT_SECRET', 'dev_secret_change_me'),
  storageDir: requireEnv('STORAGE_DIR', './storage'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

