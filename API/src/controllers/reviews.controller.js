import { reviewsService } from '../services/reviews.service.js';

export const reviewsController = {
  list: async (_req, res) => res.json(await reviewsService.list()),
  create: async (req, res) => {
    try {
      const r = await reviewsService.create(req.body, req.user.id);
      res.status(201).json(r);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

