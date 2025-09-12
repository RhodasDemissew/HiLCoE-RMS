import { projectsService } from '../services/projects.service.js';

export const projectsController = {
  async create(req, res) {
    try {
      const project = await projectsService.create(req.body, req.user.id);
      res.status(201).json(project);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async list(_req, res) {
    const items = await projectsService.list();
    res.json(items);
  },
  async assignAdvisor(req, res) {
    try {
      const result = await projectsService.assignAdvisor(req.params.id, req.body.advisorId);
      res.json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

