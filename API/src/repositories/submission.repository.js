import { Submission } from '../models/Submission.js';

export const submissionRepo = {
  lastForMilestone: (milestoneId) => Submission.findOne({ milestone: milestoneId }).sort({ version: -1 }),
  create: (data) => Submission.create(data),
  findById: (id) => Submission.findById(id),
};

