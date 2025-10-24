import { defenseService } from '../services/defense.service.js';

export const defenseController = {
  async list(req, res) {
    try {
      const { from, to, candidateId, panelistId, mine, includeCancelled } = req.query || {};
      const mineId = mine === 'true' ? req.user.id : undefined;
      const payload = await defenseService.list({
        from,
        to,
        candidateId,
        panelistId,
        mineId,
        includeCancelled: includeCancelled === 'true',
      });
      res.json({ items: payload });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const defense = await defenseService.create({ actorId: req.user.id, ...req.body });
      res.status(201).json(defense);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const defense = await defenseService.update(req.params.id, req.body || {});
      res.json(defense);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async cancel(req, res) {
    try {
      const defense = await defenseService.cancel(req.params.id, req.user.id);
      res.json(defense);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async duplicate(req, res) {
    try {
      const defense = await defenseService.duplicate(req.params.id, req.user.id, req.body || {});
      res.status(201).json(defense);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async respond(req, res) {
    try {
      const defense = await defenseService.respond({
        defenseId: req.params.id,
        userId: req.user.id,
        status: req.body?.status,
        note: req.body?.note,
      });
      res.json(defense);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async requestChange(req, res) {
    try {
      const defense = await defenseService.requestChange({
        defenseId: req.params.id,
        userId: req.user.id,
        reason: req.body?.reason,
        preferredSlots: req.body?.preferredSlots,
      });
      res.json(defense);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async availability(req, res) {
    try {
      const { date, from, to, userIds } = req.query || {};
      const ids = typeof userIds === 'string' ? userIds.split(',').filter(Boolean) : Array.isArray(userIds) ? userIds : [];
      const rangeFrom = date ? `${date}T00:00:00Z` : from;
      const rangeTo = date ? `${date}T23:59:59Z` : to;
      const slots = await defenseService.availability({
        from: rangeFrom,
        to: rangeTo,
        userIds: ids,
      });
      res.json({ items: slots });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
