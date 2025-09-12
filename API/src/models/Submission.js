import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true },
    version: { type: Number, default: 1 },
    files: { type: [fileSchema], default: [] },
    notes: { type: String, default: '' },
    submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'submissions' }
);

submissionSchema.index({ milestone: 1, version: -1 });

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema, 'submissions');

