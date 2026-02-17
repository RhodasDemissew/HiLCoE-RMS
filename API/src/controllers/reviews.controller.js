import { reviewsService } from '../services/reviews.service.js';

export const reviewsController = {
  list: async (_req, res) => {
    try {
      const reviews = await reviewsService.list();
      res.json(reviews);
    } catch (e) {
      res.status(500).json({ error: e.message || 'Failed to fetch reviews' });
    }
  },
  create: async (req, res) => {
    try {
      const r = await reviewsService.create(req.body, req.user.id);
      res.status(201).json(r);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

