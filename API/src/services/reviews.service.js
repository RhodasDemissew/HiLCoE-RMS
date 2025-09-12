import mongoose from 'mongoose';
import { reviewRepo } from '../repositories/review.repository.js';

export const reviewsService = {
  list: () => reviewRepo.list(),
  async create({ milestoneId, decision, comments }, reviewerId) {
    if (!mongoose.isValidObjectId(milestoneId)) throw new Error('milestoneId and decision required');
    return reviewRepo.create({ milestone: milestoneId, decision, comments, reviewer: reviewerId });
  }
};

