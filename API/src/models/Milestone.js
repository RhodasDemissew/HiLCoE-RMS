import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    type: { type: String, enum: ['registration','synopsis','proposal','progress1','progress2','thesis_precheck','thesis_postdefense','defense','journal'], required: true },
    status: { type: String, enum: ['draft','submitted','under_review','changes_requested','approved','scheduled','graded','archived'], default: 'draft' },
    sequence: { type: Number, default: 0 },
    window_start: { type: Date, default: null },
    window_end: { type: Date, default: null },
    due_at: { type: Date, default: null },
    submitted_at: { type: Date, default: null },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'milestones' }
);

milestoneSchema.index({ project: 1, type: 1 }, { unique: true });

export const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema, 'milestones');

