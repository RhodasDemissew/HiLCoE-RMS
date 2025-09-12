import { verificationsService } from '../services/verifications.service.js';

export const verificationsController = {
  list: async (req, res) => {
    try { res.json(await verificationsService.listForSubmission(req.params.submissionId)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  },
  queue: async (req, res) => {
    try { res.status(201).json(await verificationsService.queueBoth(req.params.submissionId)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  },
};

