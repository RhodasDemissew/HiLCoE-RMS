import mongoose from 'mongoose';
import { projectRepo } from '../repositories/project.repository.js';
import { roleRepo, userRepo } from '../repositories/user.repository.js';

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
    const adviseeCount = await projectRepo.countAdvisees(advisorId, semester);
    if (adviseeCount >= 10) throw new Error('advisor advisee limit reached for semester');
    project.advisor = advisorId;
    await projectRepo.save(project);
    return { ok: true };
  }
};

