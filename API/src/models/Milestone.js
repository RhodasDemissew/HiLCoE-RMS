import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    type: { type: String, enum: ['registration','synopsis','proposal','progress','thesis','defense','journal'], required: true },
    status: { type: String, enum: ['draft','submitted','under_review','changes_requested','approved','scheduled','graded','archived'], default: 'draft' },
    due_at: { type: Date },
    submitted_at: { type: Date },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'milestones' }
);

milestoneSchema.index({ project: 1, type: 1 }, { unique: true });

export const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema, 'milestones');

