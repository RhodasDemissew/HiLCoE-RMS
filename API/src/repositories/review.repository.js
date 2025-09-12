import { Review } from '../models/Review.js';

export const reviewRepo = {
  list: () => Review.find().limit(200),
  create: (data) => Review.create(data),
};

