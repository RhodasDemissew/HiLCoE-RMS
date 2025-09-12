import { Project } from '../models/Project.js';
import { Milestone } from '../models/Milestone.js';
import { VerificationJob } from '../models/VerificationJob.js';

export const reportsService = {
  async milestones() {
    const totalProjects = await Project.countDocuments();
    const byStatus = await Milestone.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    return { totalProjects, milestonesByStatus: byStatus };
  },
  async plagiarism() {
    const simJobs = await VerificationJob.aggregate([
      { $match: { kind: 'similarity', status: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$score' }, maxScore: { $max: '$score' }, count: { $sum: 1 } } },
    ]);
    return simJobs[0] || { avgScore: 0, maxScore: 0, count: 0 };
  }
};

