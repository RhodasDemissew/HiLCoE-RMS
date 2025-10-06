import { Notification } from '../models/Notification.js';

// In-memory SSE client registry: userId -> Set<res>
const sseClients = new Map();

function getClientSet(userId) {
  const key = String(userId);
  if (!sseClients.has(key)) sseClients.set(key, new Set());
  return sseClients.get(key);
}

function writeSSE(res, { event, data }) {
  try {
    if (event) res.write(`event: ${event}\n`);
    const payload = typeof data === 'string' ? data : JSON.stringify(data || {});
    res.write(`data: ${payload}\n\n`);
  } catch (_) {
    // ignore write errors (likely disconnected)
  }
}

export function subscribeNotificationsStream(userId, res) {
  const clients = getClientSet(userId);
  clients.add(res);
  // Heartbeat to keep the connection alive
  const heartbeat = setInterval(() => writeSSE(res, { event: 'ping', data: {} }), 25000);
  res.on('close', () => {
    clearInterval(heartbeat);
    try { res.end(); } catch {}
    clients.delete(res);
  });
}

function broadcastToUser(userId, notification) {
  const clients = sseClients.get(String(userId));
  if (!clients || clients.size === 0) return;
  for (const res of clients) {
    writeSSE(res, { event: 'notification', data: notification });
  }
}

export async function notify(userId, type, payload) {
  try {
    const doc = await Notification.create({ user: userId, type, payload });
    // Push to active SSE subscribers for this user
    broadcastToUser(userId, doc);
  } catch {}
}

