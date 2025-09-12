import mongoose from 'mongoose';
import { verificationRepo } from '../repositories/verification.repository.js';
import { queueVerification } from './verificationService.js';

export const verificationsService = {
  listForSubmission(submissionId) {
    if (!mongoose.isValidObjectId(submissionId)) throw new Error('invalid submissionId');
    return verificationRepo.listForSubmission(submissionId);
  },
  async queueBoth(submissionId) {
    if (!mongoose.isValidObjectId(submissionId)) throw new Error('invalid submissionId');
    const jobs = [];
    jobs.push(await queueVerification(submissionId, 'format'));
    jobs.push(await queueVerification(submissionId, 'similarity'));
    return jobs;
  }
};

