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
  },
  async milestones(req, res) {
    try {
      const items = await projectsService.milestones(req.params.id);
      res.json(items);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async updateSchedule(req, res) {
    try {
      const item = await projectsService.updateMilestoneSchedule(req.params.id, req.params.type, req.body);
      res.json(item);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
