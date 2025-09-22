import mongoose from 'mongoose';
import { defenseRepo } from '../repositories/defense.repository.js';
import { projectRepo } from '../repositories/project.repository.js';
import { milestoneRepo } from '../repositories/milestone.repository.js';
import { notify } from '../services/notificationService.js';

export const defenseService = {
  async assignExaminer(projectId, { examinerId, due_at }) {
    if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(examinerId)) throw new Error('invalid ids');
    const ee = await defenseRepo.createAssignment({ project: projectId, examiner: examinerId, due_at });
    try { await notify(examinerId, 'examiner_assigned', { projectId }); } catch {}
    return ee;
  },
  async schedule(projectId, { start_at, end_at, location, virtual_link }) {
    if (!mongoose.isValidObjectId(projectId) || !start_at) throw new Error('invalid');
    const start = new Date(start_at);
    if (Number.isNaN(start.getTime())) throw new Error('start_at invalid');
    const end = end_at ? new Date(end_at) : undefined;
    if (end_at && Number.isNaN(end.getTime())) throw new Error('end_at invalid');
    const sched = await defenseRepo.createSchedule({ project: projectId, start_at: start, end_at: end, location, virtual_link });
    try {
      const defenseMilestone = await milestoneRepo.findByProjectAndType(projectId, 'defense');
      if (defenseMilestone) {
        defenseMilestone.window_start = start;
        defenseMilestone.window_end = end || null;
        defenseMilestone.status = 'scheduled';
        await milestoneRepo.save(defenseMilestone);
      }
    } catch {}
    try {
      const proj = await projectRepo.findById(projectId);
      if (proj?.researcher) await notify(proj.researcher, 'defense_scheduled', { scheduleId: String(sched._id), projectId });
      if (proj?.advisor) await notify(proj.advisor, 'defense_scheduled', { scheduleId: String(sched._id), projectId });
    } catch {}
    return sched;
  },
  async grade(projectId, { components = {}, total = 0, finalized = false }) {
    if (!mongoose.isValidObjectId(projectId)) throw new Error('invalid');
    const grade = await defenseRepo.upsertGrade(projectId, { components, total, finalized });
    try {
      const proj = await projectRepo.findById(projectId);
      if (proj?.researcher) await notify(proj.researcher, 'defense_graded', { projectId, total, finalized });
    } catch {}
    return grade;
  }
};
