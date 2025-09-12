import { Milestone } from '../models/Milestone.js';

export const milestoneRepo = {
  create: (data) => Milestone.create(data),
  list: () => Milestone.find().limit(200),
  findById: (id) => Milestone.findById(id),
  save: (ms) => ms.save(),
};

