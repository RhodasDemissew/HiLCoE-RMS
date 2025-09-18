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
  mongoUri: requireEnv('MONGO_URI', 'mongodb+srv://rhodas:Killedward99@rmscluster.9x7mji2.mongodb.net/hilcoe_rms?retryWrites=true&w=majority&appName=RMSCluster'),
  jwtSecret: requireEnv('JWT_SECRET', 'dev_secret_change_me'),
  storageDir: requireEnv('STORAGE_DIR', './storage'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};


