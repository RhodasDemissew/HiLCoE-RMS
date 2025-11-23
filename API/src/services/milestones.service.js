import mongoose from 'mongoose';
import { milestoneRepo } from '../repositories/milestone.repository.js';
import { projectRepo } from '../repositories/project.repository.js';
import { User } from '../models/User.js';
import { canTransition } from '../utils/state.js';
import { notify } from '../services/notificationService.js';
import { messagingService } from './messaging.service.js';
import {
  DEFAULT_SEQUENCES,
  getPreviousRequirement,
  getNextStage,
  requiresAdvisorForApproval,
  defaultAssignmentRequired,
  defaultReviewerRoles,
} from '../utils/milestoneFlow.js';

const SUBMITTABLE_TYPES = new Set([
  'synopsis',
  'proposal',
  'progress1',
  'progress2',
  'thesis_precheck',
  'thesis_postdefense',
  'journal',
]);

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
    const payload = {
      project: projectId,
      type,
      sequence,
      assignment_required: defaultAssignmentRequired(type),
      reviewer_roles: defaultReviewerRoles(type),
    };
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
    if (ms.assignment_required === undefined) ms.assignment_required = defaultAssignmentRequired(ms.type);
    if (!ms.reviewer_roles || ms.reviewer_roles.length === 0) ms.reviewer_roles = defaultReviewerRoles(ms.type);
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
      const needsAdvisor = ms.assignment_required ?? defaultAssignmentRequired(ms.type);
      if (needsAdvisor && !proj.advisor) {
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
        let actorName = '';
        try {
          if (proj?.researcher) {
            const u = await User.findById(proj.researcher).select('name');
            actorName = u?.name || '';
          }
        } catch {}
        await notify(proj.advisor, 'milestone_submitted', {
          milestoneId: String(ms._id),
          projectId: String(proj._id),
          type: ms.type,
          actor_id: proj?.researcher ? String(proj.researcher) : undefined,
          actor_name: actorName,
        });
      }

      if ((to === 'approved' || to === 'changes_requested') && proj?.researcher) {
        let actorName = '';
        try {
          if (actor?.id || actor?._id) {
            const u = await User.findById(actor.id || actor._id).select('name');
            actorName = u?.name || '';
          }
        } catch {}
        await notify(proj.researcher, 'milestone_reviewed', {
          milestoneId: String(ms._id),
          status: to,
          type: ms.type,
          actor_id: actor?.id || actor?._id,
          actor_name: actorName,
        });
        if (to === 'changes_requested') {
          try {
            const body = ms.coordinator_notes
              ? `Milestone ${ms.type} needs changes: ${ms.coordinator_notes}`
              : `Milestone ${ms.type} needs changes.`;
            await messagingService.emitSystemMessageForProject(proj._id, {
              body,
              meta: {
                milestoneId: String(ms._id),
                type: ms.type,
                status: to,
                actorId: actor?.id || actor?._id ? String(actor?.id || actor?._id) : undefined,
              },
              kind: 'feedback',
              actorId: actor?.id || actor?._id,
            });
          } catch (err) {
            console.warn('[messaging] milestone feedback emit failed', err?.message || err);
          }
        }
      }
      if (to === 'scheduled') {
        // Notify the Researcher for scheduling and include actor details when available
        let actorName = '';
        try {
          if (actor?.id || actor?._id) {
            const u = await User.findById(actor.id || actor._id).select('name');
            actorName = u?.name || '';
          }
        } catch {}
        const targets = [proj.researcher].filter(Boolean);
        for (const userId of targets) {
          await notify(userId, 'milestone_scheduled', {
            milestoneId: String(ms._id),
            projectId: String(proj._id),
            type: ms.type,
            actor_id: actor?.id || actor?._id,
            actor_name: actorName,
          });
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
  },
};



