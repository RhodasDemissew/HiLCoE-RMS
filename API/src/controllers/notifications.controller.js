import { notificationsService } from '../services/notifications.service.js';

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
};

