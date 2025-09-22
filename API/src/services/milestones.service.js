import mongoose from 'mongoose';
import { milestoneRepo } from '../repositories/milestone.repository.js';
import { projectRepo } from '../repositories/project.repository.js';
import { canTransition } from '../utils/state.js';
import { notify } from '../services/notificationService.js';
import { DEFAULT_SEQUENCES, getPreviousRequirement, getNextStage, requiresAdvisorForApproval } from '../utils/milestoneFlow.js';

const SUBMITTABLE_TYPES = new Set(['synopsis','proposal','progress1','progress2','thesis_precheck','thesis_postdefense','journal']);

async function ensurePreviousCompleted(projectId, type) {
  const requirement = getPreviousRequirement(type);
  if (!requirement) return;
  const prev = await milestoneRepo.findByProjectAndType(projectId, requirement.type);
  if (!prev) throw new Error(`Previous milestone ${requirement.type} not found`);
  if (!requirement.statuses.includes(prev.status)) {
    throw new Error(`Previous milestone ${requirement.type} not completed`);
  }
}

export const milestonesService = {
  async create({ projectId, type, due_at }) {
    if (!mongoose.isValidObjectId(projectId)) throw new Error('projectId invalid');
    const project = await projectRepo.findById(projectId);
    if (!project) throw new Error('project not found');

    const sequence = DEFAULT_SEQUENCES[type] ?? 0;
    const payload = { project: projectId, type, sequence };
    if (due_at) {
      const parsed = new Date(due_at);
      if (Number.isNaN(parsed.getTime())) throw new Error('due_at invalid');
      payload.due_at = parsed;
    }

    return milestoneRepo.create(payload);
  },

  async list() {
    return milestoneRepo.list();
  },

  async transition(id, to, actor) {
    if (!mongoose.isValidObjectId(id)) throw new Error('invalid');
    const ms = await milestoneRepo.findById(id);
    if (!ms) throw new Error('not found');
    if (!canTransition(actor.role, ms.type, ms.status, to)) throw new Error('transition not allowed');

    if (to === 'submitted') {
      await ensurePreviousCompleted(ms.project, ms.type);
    }

    if (ms.status === to) return ms;

    ms.status = to;
    if (to === 'submitted' && SUBMITTABLE_TYPES.has(ms.type)) {
      ms.submitted_at = new Date();
    }
    if (to === 'approved') {
      await ensurePreviousCompleted(ms.project, ms.type);
      const proj = await projectRepo.findById(ms.project);
      if (!proj) throw new Error('project not found');
      if (requiresAdvisorForApproval(ms.type) && !proj.advisor) {
        throw new Error('Advisor assignment required before approval');
      }
      ms.approved_by = actor?.id ? actor.id : actor?._id;
      const nextStage = getNextStage(ms.type);
      if (nextStage) {
        proj.current_stage = nextStage;
        await projectRepo.save(proj);
      }
    }
    if (to !== 'approved' && to !== 'under_review') {
      ms.approved_by = null;
    }

    await milestoneRepo.save(ms);

    try {
      const proj = await projectRepo.findById(ms.project);
      if (!proj) return ms;

      if (to === 'submitted' && proj?.advisor) {
        await notify(proj.advisor, 'milestone_submitted', { milestoneId: String(ms._id), projectId: String(proj._id), type: ms.type });
      }

      if ((to === 'approved' || to === 'changes_requested') && proj?.researcher) {
        await notify(proj.researcher, 'milestone_reviewed', { milestoneId: String(ms._id), status: to, type: ms.type });
      }

      if (to === 'scheduled') {
        const targets = [proj.researcher, proj.advisor].filter(Boolean);
        for (const userId of targets) {
          await notify(userId, 'milestone_scheduled', { milestoneId: String(ms._id), projectId: String(proj._id) });
        }
      }

      if (ms.type === 'defense' && to === 'graded') {
        const nextStage = getNextStage('defense');
        if (nextStage) {
          proj.current_stage = nextStage;
          await projectRepo.save(proj);
        }
      }
    } catch {}

    return ms;
  }
};
