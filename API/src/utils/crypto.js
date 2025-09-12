import crypto from 'crypto';

const ITERATIONS = 100000;
const KEYLEN = 32;
const DIGEST = 'sha256';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return { salt, hash, iterations: ITERATIONS, algo: DIGEST };
}

export function verifyPassword(password, { salt, hash, iterations = ITERATIONS, algo = DIGEST }) {
  const candidate = crypto.pbkdf2Sync(password, salt, iterations, KEYLEN, algo).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
}

// Minimal HS256 JWT implementation (no external deps)
function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function signJWT(payload, secret, expiresInSec = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expiresInSec, ...payload };
  const encHeader = b64url(JSON.stringify(header));
  const encPayload = b64url(JSON.stringify(body));
  const data = `${encHeader}.${encPayload}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  const encSig = b64url(sig);
  return `${data}.${encSig}`;
}

export function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  const encSig = b64url(sig);
  if (!crypto.timingSafeEqual(Buffer.from(encSig), Buffer.from(s))) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) throw new Error('Token expired');
  return payload;
}

