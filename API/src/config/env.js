import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function sanitizeBaseUrl(urlLike, def = 'http://localhost:5173') {
  const raw = (urlLike ?? def).toString().trim();
  // In case someone added inline comments like "http://... (the UI base URL ...)"
  const head = raw.split(/\s|\(/)[0];
  return head.replace(/\/$/, '');
}

function parseCorsOrigin(input) {
  if (!input) return '*';
  const raw = input.split(',').map(s => s.trim()).filter(Boolean);
  if (raw.length <= 1) return raw[0] || '*';
  return raw;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: requireEnv('MONGO_URI'),
  jwtSecret: requireEnv('JWT_SECRET', 'dev_secret_change_me'),
  storageDir: requireEnv('STORAGE_DIR', './storage'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN || '*'),
  appBaseUrl: sanitizeBaseUrl(process.env.APP_BASE_URL, 'http://localhost:5173'),
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '0', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpSecure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
  supervisorMaxStudents: parseInt(process.env.SUPERVISOR_MAX_STUDENTS || '10', 10),
  formatCheckerUrl: process.env.FORMAT_CHECKER_URL || '',
  formatPoliciesDir: process.env.FORMAT_POLICIES_DIR || '',
};

