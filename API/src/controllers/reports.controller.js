import { reportsService } from '../services/reports.service.js';

export const reportsController = {
  milestones: async (_req, res) => res.json(await reportsService.milestones()),
  plagiarism: async (_req, res) => res.json(await reportsService.plagiarism()),
};

