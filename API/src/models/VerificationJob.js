import mongoose from 'mongoose';

const verificationJobSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    kind: { type: String, enum: ['format','similarity'], required: true },
    status: { type: String, enum: ['queued','running','completed','failed'], default: 'queued' },
    score: { type: Number },
    report_url: { type: String, default: '' },
    reviewer_override: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'verification_jobs' }
);

verificationJobSchema.index({ submission: 1, kind: 1 });

export const VerificationJob = mongoose.models.VerificationJob || mongoose.model('VerificationJob', verificationJobSchema, 'verification_jobs');

