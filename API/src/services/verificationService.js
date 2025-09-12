import { VerificationJob } from '../models/VerificationJob.js';

export async function queueVerification(submissionId, kind) {
  const job = await VerificationJob.create({ submission: submissionId, kind, status: 'queued' });
  // Minimal fake worker: mark as completed quickly with a pseudo score
  setTimeout(async () => {
    try {
      const score = kind === 'similarity' ? Math.floor(Math.random() * 20) : 0;
      await VerificationJob.findByIdAndUpdate(job._id, { status: 'completed', score });
    } catch {}
  }, 100);
  return job;
}

