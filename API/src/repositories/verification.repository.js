import { VerificationJob } from '../models/VerificationJob.js';

export const verificationRepo = {
  listForSubmission: (submissionId) => VerificationJob.find({ submission: submissionId }).sort({ created_at: -1 }),
};

