import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    area: { type: String, default: '' },
    researcher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    semester: { type: String, trim: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    current_stage: { type: String, default: 'registration' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'projects' }
);

projectSchema.index({ researcher: 1 }, { unique: true });

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema, 'projects');
