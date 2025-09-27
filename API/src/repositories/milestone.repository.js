import { Milestone } from '../models/Milestone.js';

export const milestoneRepo = {
  create: (data) => Milestone.create(data),
  list: () => Milestone.find().sort({ sequence: 1, due_at: 1 }).limit(200),
  findById: (id) => Milestone.findById(id),
  findByProjectAndType: (projectId, type) => Milestone.findOne({ project: projectId, type }),
  findByProject: (projectId) => Milestone.find({ project: projectId }).sort({ sequence: 1, due_at: 1 }),
  save: (ms) => ms.save(),
};


