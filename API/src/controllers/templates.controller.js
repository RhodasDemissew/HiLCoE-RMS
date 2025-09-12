import { templatesService } from '../services/templates.service.js';

export const templatesController = {
  list: async (_req, res) => res.json(await templatesService.list()),
  create: async (req, res) => {
    try {
      const doc = await templatesService.create(req.body);
      res.status(201).json(doc);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

