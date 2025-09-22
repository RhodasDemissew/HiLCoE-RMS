import mongoose from 'mongoose';
import { projectRepo } from '../repositories/project.repository.js';
import { roleRepo, userRepo } from '../repositories/user.repository.js';
import { notify } from '../services/notificationService.js';

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
    if (project.current_stage === 'registration' || !project.current_stage) {
      project.current_stage = 'synopsis';
    }
    await projectRepo.save(project);

    try {
      await notify(advisorId, 'advisor_assigned', { projectId });
      if (project.researcher) await notify(project.researcher, 'advisor_assigned', { projectId, advisorId });
    } catch {}

    return { ok: true, current_stage: project.current_stage };
  }
};
