import { messagingService } from '../services/messaging.service.js';

export const conversationsController = {
  list: async (req, res) => {
    try {
      const items = await messagingService.listConversations(req.user.id);
      res.json({ items });
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to list conversations' });
    }
  },

  create: async (req, res) => {
    try {
      const { participants = [], subject = '' } = req.body || {};
      const participantIds = participants.map((p) => (typeof p === 'string' ? p : p?.id)).filter(Boolean);
      const convo = await messagingService.createDirectConversation(participantIds, req.user.id, subject);
      res.status(201).json(convo);
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to create conversation' });
    }
  },

  get: async (req, res) => {
    try {
      const convo = await messagingService.getConversation(req.params.id, req.user.id);
      res.json(convo);
    } catch (err) {
      res.status(404).json({ error: err.message || 'conversation not found' });
    }
  },

  messages: async (req, res) => {
    try {
      const { before, limit } = req.query;
      const payload = await messagingService.listMessages(req.params.id, req.user.id, {
        before,
        limit: limit ? Number(limit) : undefined,
      });
      res.json(payload);
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to load messages' });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { body, attachments, kind, meta } = req.body || {};
      const message = await messagingService.sendMessage(req.params.id, req.user.id, { body, attachments, kind, meta });
      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to send message' });
    }
  },

  markRead: async (req, res) => {
    try {
      const { messageId } = req.body || {};
      const result = await messagingService.markRead(req.params.id, req.user.id, messageId || null);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to mark read' });
    }
  },

  ensureProject: async (req, res) => {
    try {
      const convo = await messagingService.ensureProjectConversation(req.params.projectId, req.user.id);
      res.json(convo);
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to ensure project conversation' });
    }
  },

  listResearchers: async (req, res) => {
    try {
      const { q = '' } = req.query || {};
      const items = await messagingService.listResearcherTargets(req.user.id, q);
      res.json({ items });
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to list researchers' });
    }
  },

  ensureDirect: async (req, res) => {
    try {
      const convo = await messagingService.ensureDirectConversation(req.params.userId, req.user.id);
      res.json(convo);
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to ensure direct conversation' });
    }
  },

  cleanup: async (req, res) => {
    try {
      await messagingService.cleanupDirectConversations();
      res.json({ message: 'Direct conversations cleaned up successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to cleanup conversations' });
    }
  },

  deleteAll: async (req, res) => {
    try {
      const result = await messagingService.deleteAllMessages();
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message || 'failed to delete all messages' });
    }
  },

};
