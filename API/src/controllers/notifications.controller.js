import { notificationsService } from '../services/notifications.service.js';
import { subscribeNotificationsStream } from '../services/notificationService.js';

export const notificationsController = {
  list: async (req, res) => res.json(await notificationsService.listForUser(req.user.id)),
  markRead: async (req, res) => res.json(await notificationsService.markRead(req.user.id, req.params.id)),
  markAllRead: async (req, res) => {
    await notificationsService.markAllRead(req.user.id);
    res.json({ ok: true });
  },
  clear: async (req, res) => {
    await notificationsService.clearAll(req.user.id);
    res.json({ ok: true });
  },
  // Server-Sent Events stream for real-time notifications
  stream: async (req, res) => {
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // flush initial padding and a hello event
    res.flushHeaders?.();
    res.write(': connected\n\n');
    subscribeNotificationsStream(req.user.id, res);
  },
};

