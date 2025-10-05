import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const stageSubmissionSchema = new mongoose.Schema(
  {
    researcher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stage_index: { type: Number, required: true },
    stage_key: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['under_review', 'awaiting_coordinator', 'needs_changes', 'approved', 'rejected'],
      default: 'under_review',
    },
    file: { type: fileSchema, required: true },
    submitted_at: { type: Date, default: () => new Date() },
    reviewed_at: { type: Date, default: null },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decision_notes: { type: String, default: '' },
    version: { type: Number, default: 1 },
    analysis: {
      status: {
        type: String,
        enum: ['idle', 'queued', 'running', 'completed', 'failed'],
        default: 'idle',
      },
      progress: { type: Number, default: 0 },
      score: { type: Number, default: null },
      updated_at: { type: Date, default: null },
    },
    format_check: {
      status: {
        type: String,
        enum: ['idle', 'queued', 'running', 'pass', 'issues', 'failed'],
        default: 'idle',
      },
      overall_pass: { type: Boolean, default: null },
      score: { type: Number, default: null }, // 0..1
      policy_name: { type: String, default: '' },
      policy_version: { type: String, default: '' },
      checked_at: { type: Date, default: null },
      findings: { type: [Object], default: [] }, // { rule, pass, details }
      error: { type: String, default: '' },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'stage_submissions' }
);

stageSubmissionSchema.index({ researcher: 1, stage_index: 1, version: -1 });

export const StageSubmission = mongoose.models.StageSubmission || mongoose.model('StageSubmission', stageSubmissionSchema, 'stage_submissions');
