import { defenseService } from '../services/defense.service.js';

export const defenseController = {
  assignExaminer: async (req, res) => {
    try { res.status(201).json(await defenseService.assignExaminer(req.params.projectId, req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  },
  schedule: async (req, res) => {
    try { res.status(201).json(await defenseService.schedule(req.params.projectId, req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  },
  grade: async (req, res) => {
    try { res.json(await defenseService.grade(req.params.projectId, req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  },
};

