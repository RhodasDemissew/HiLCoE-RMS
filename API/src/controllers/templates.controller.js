import { templatesService } from '../services/templates.service.js';
import { UpdateTemplateDto, TemplateIdParams } from '../dtos/templates.dto.js';

export const templatesController = {
  list: async (_req, res) => res.json(await templatesService.list()),
  create: async (req, res) => {
    try {
      const doc = await templatesService.create(req.body);
      res.status(201).json(doc);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  update: async (req, res) => {
    try {
      const doc = await templatesService.update(req.params.id, req.body);
      if (!doc) return res.status(404).json({ error: 'not_found' });
      res.json(doc);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  remove: async (req, res) => {
    try {
      const doc = await templatesService.remove(req.params.id);
      if (!doc) return res.status(404).json({ error: 'not_found' });
      res.status(204).send();
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

