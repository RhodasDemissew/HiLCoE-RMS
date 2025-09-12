import { milestonesService } from '../services/milestones.service.js';

export const milestonesController = {
  async create(req, res) {
    try {
      const ms = await milestonesService.create(req.body);
      res.status(201).json(ms);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async list(_req, res) {
    const items = await milestonesService.list();
    res.json(items);
  },
  async transition(req, res) {
    try {
      const ms = await milestonesService.transition(req.params.id, req.body.to, req.user);
      res.json(ms);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

