import mongoose from 'mongoose';
import { milestoneRepo } from '../repositories/milestone.repository.js';
import { projectRepo } from '../repositories/project.repository.js';
import { canTransition } from '../utils/state.js';
import { notify } from '../services/notificationService.js';

export const milestonesService = {
  async create({ projectId, type, due_at }) {
    if (!mongoose.isValidObjectId(projectId)) throw new Error('projectId invalid');
    const project = await projectRepo.findById(projectId);
    if (!project) throw new Error('project not found');
    return milestoneRepo.create({ project: projectId, type, due_at });
  },
  async list() {
    return milestoneRepo.list();
  },
  async transition(id, to, actor) {
    if (!mongoose.isValidObjectId(id)) throw new Error('invalid');
    const ms = await milestoneRepo.findById(id);
    if (!ms) throw new Error('not found');
    if (!canTransition(actor.role, ms.type, ms.status, to)) throw new Error('transition not allowed');
    ms.status = to;
    if (to === 'submitted') ms.submitted_at = new Date();
    await milestoneRepo.save(ms);
    try {
      const proj = await projectRepo.findById(ms.project);
      if (to === 'submitted' && proj?.advisor) await notify(proj.advisor, 'milestone_submitted', { milestoneId: String(ms._id), projectId: String(proj._id) });
      if ((to === 'approved' || to === 'changes_requested') && proj?.researcher) await notify(proj.researcher, 'milestone_reviewed', { milestoneId: String(ms._id), status: to });
    } catch {}
    return ms;
  }
};

