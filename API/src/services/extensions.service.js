import mongoose from 'mongoose';
import { extensionRepo } from '../repositories/extension.repository.js';
import { milestoneRepo } from '../repositories/milestone.repository.js';
import { projectRepo } from '../repositories/project.repository.js';
import { notify } from '../services/notificationService.js';

export const extensionsService = {
  async create({ milestoneId, reason, new_due_at }, userId) {
    if (!mongoose.isValidObjectId(milestoneId) || !reason) throw new Error('invalid');
    const er = await extensionRepo.create({ milestone: milestoneId, reason, requested_by: userId, status: 'pending', new_due_at });
    try {
      const ms = await milestoneRepo.findById(milestoneId);
      const proj = await projectRepo.findById(ms?.project);
      if (proj?.advisor) await notify(proj.advisor, 'extension_requested', { extensionId: String(er._id), milestoneId });
    } catch {}
    return er;
  },
  async decide(id, decision, actorId) {
    if (!mongoose.isValidObjectId(id) || !['approved','rejected'].includes(decision)) throw new Error('invalid');
    const er = await extensionRepo.findByIdAndUpdate(id, { $set: { status: decision, decided_by: actorId } });
    try {
      const ms = await milestoneRepo.findById(er?.milestone);
      const proj = await projectRepo.findById(ms?.project);
      if (proj?.researcher) await notify(proj.researcher, 'extension_decided', { extensionId: String(er._id), decision });
    } catch {}
    return er;
  }
};

