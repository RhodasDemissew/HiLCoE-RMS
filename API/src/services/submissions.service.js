import mongoose from 'mongoose';
import { submissionRepo } from '../repositories/submission.repository.js';
import { milestoneRepo } from '../repositories/milestone.repository.js';
import { saveBase64File, getFileStream } from '../services/storageService.js';
import { projectRepo } from '../repositories/project.repository.js';
import { queueVerification } from '../services/verificationService.js';
import { notify } from '../services/notificationService.js';

export const submissionsService = {
  async create({ milestoneId, files = [], notes }, userId) {
    if (!mongoose.isValidObjectId(milestoneId)) throw new Error('invalid milestoneId');
    const ms = await milestoneRepo.findById(milestoneId);
    if (!ms) throw new Error('milestone not found');
    const savedFiles = [];
    for (const f of files) {
      if (!f?.filename || !f?.content) continue;
      const meta = await saveBase64File(ms.project, f.filename, f.content, f.mimetype || 'application/octet-stream');
      savedFiles.push(meta);
    }
    const last = await submissionRepo.lastForMilestone(milestoneId);
    const version = (last?.version || 0) + 1;
    const sub = await submissionRepo.create({ milestone: milestoneId, version, files: savedFiles, notes, submitted_by: userId });
    queueVerification(sub._id, 'format');
    queueVerification(sub._id, 'similarity');
    try {
      const proj = await projectRepo.findById(ms.project);
      if (proj?.advisor) await notify(proj.advisor, 'milestone_submitted', { milestoneId, projectId: String(proj._id) });
    } catch {}
    return sub;
  },
  async fileStream(id, index) {
    const sub = await submissionRepo.findById(id);
    if (!sub) throw new Error('not found');
    const file = sub.files[Number(index)];
    if (!file) throw new Error('file not found');
    return { file, stream: getFileStream(file.path) };
  }
};

