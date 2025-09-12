import { extensionsService } from '../services/extensions.service.js';

export const extensionsController = {
  async create(req, res) {
    try {
      const er = await extensionsService.create(req.body, req.user.id);
      res.status(201).json(er);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async decide(req, res) {
    try {
      const er = await extensionsService.decide(req.params.id, req.body.decision, req.user.id);
      res.json(er);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

