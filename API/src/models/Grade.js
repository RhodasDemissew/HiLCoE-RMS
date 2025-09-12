import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    components: { type: Object, default: {} },
    total: { type: Number, default: 0 },
    finalized: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'grades' }
);

export const Grade = mongoose.models.Grade || mongoose.model('Grade', gradeSchema, 'grades');
