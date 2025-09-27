import mongoose from 'mongoose';
import { projectRepo } from '../repositories/project.repository.js';
import { milestoneRepo } from '../repositories/milestone.repository.js';
import { userRepo } from '../repositories/user.repository.js';
import { notify } from '../services/notificationService.js';
import { Milestone } from '../models/Milestone.js';

const MILESTONE_TYPES = ['registration','synopsis','proposal','progress1','progress2','thesis_precheck','defense','thesis_postdefense','journal'];

export const projectsService = {
  async create({ title, area, semester }, researcherId) {
    return projectRepo.create({ title, area, semester, researcher: researcherId });
  },
  async list() {
    return projectRepo.list();
  },
  async assignAdvisor(projectId, advisorId) {
    if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(advisorId)) throw new Error('invalid ids');
    const advisorUser = await userRepo.findById(advisorId);
    if (!advisorUser || advisorUser.role?.name !== 'Advisor') throw new Error('advisor not found or invalid role');
    const project = await projectRepo.findById(projectId);
    if (!project) throw new Error('project not found');
    const semester = project.semester || 'default';
    const alreadyAssigned = project.advisor && String(project.advisor) === String(advisorId);
    const adviseeCount = await projectRepo.countAdvisees(advisorId, semester);
    if (!alreadyAssigned && adviseeCount >= 10) throw new Error('advisor advisee limit reached for semester');

    project.advisor = advisorId;
    project.advisor_assigned_at = new Date();
    if (project.current_stage === 'registration' || !project.current_stage) {
      project.current_stage = 'synopsis';
    }
    await projectRepo.save(project);

    try {
      await notify(advisorId, 'advisor_assigned', { projectId });
      if (project.researcher) await notify(project.researcher, 'advisor_assigned', { projectId, advisorId });
    } catch {}

    return { ok: true, current_stage: project.current_stage };
  },
  async milestones(projectId) {
    if (!mongoose.isValidObjectId(projectId)) throw new Error('invalid project id');
    const project = await projectRepo.findById(projectId);
    if (!project) throw new Error('project not found');
    const milestones = await milestoneRepo.findByProject(projectId);
    return milestones;
  },
  async updateMilestoneSchedule(projectId, type, { window_start, window_end, due_at, notes }) {
    if (!mongoose.isValidObjectId(projectId)) throw new Error('invalid project id');
    if (!MilestoneTypes.includes(type)) throw new Error('invalid milestone type');
    const project = await projectRepo.findById(projectId);
    if (!project) throw new Error('project not found');
    const milestone = await milestoneRepo.findByProjectAndType(projectId, type);
    if (!milestone) throw new Error('milestone not found');

    const parseDate = (value, field) => {
      if (value === undefined) return milestone[field];
      if (value === null || value === '') return null;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) throw new Error(`${field} invalid`);
      return parsed;
    };

    const nextWindowStart = parseDate(window_start, 'window_start');
    const nextWindowEnd = parseDate(window_end, 'window_end');
    const nextDue = parseDate(due_at, 'due_at');

    if (nextWindowStart && nextWindowEnd && nextWindowStart > nextWindowEnd) {
      throw new Error('window_start must be before window_end');
    }
    if (nextWindowEnd && nextDue && nextWindowEnd > nextDue) {
      throw new Error('window_end must be on/before due_at');
    }

    milestone.window_start = nextWindowStart ?? milestone.window_start;
    milestone.window_end = nextWindowEnd ?? milestone.window_end;
    milestone.due_at = nextDue ?? milestone.due_at;
    if (notes !== undefined) {
      milestone.coordinator_notes = notes || '';
    }

    await milestoneRepo.save(milestone);
    return milestone;
  }
};



