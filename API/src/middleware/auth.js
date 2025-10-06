import { verifyJWT } from '../utils/crypto.js';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export async function authOptional(req, _res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyJWT(token, config.jwtSecret);
    const user = await User.findById(payload.sub).populate('role');
    if (user) req.user = { id: user._id, role: user.role?.name, email: user.email, name: user.name };
  } catch (_e) {}
  next();
}

export async function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyJWT(token, config.jwtSecret);
    const user = await User.findById(payload.sub).populate('role');
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: user._id, role: user.role?.name, email: user.email, name: user.name };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Allows auth via Authorization header OR `?token=` query (for SSE/EventSource which lacks headers)
export async function authRequiredAny(req, res, next) {
  const header = req.headers.authorization || '';
  const headerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  const queryToken = typeof req.query?.token === 'string' ? req.query.token : null;
  const token = headerToken || queryToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyJWT(token, config.jwtSecret);
    const user = await User.findById(payload.sub).populate('role');
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: user._id, role: user.role?.name, email: user.email, name: user.name };
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

