import mongoose from 'mongoose';

const researchProgressSchema = new mongoose.Schema(
  {
    researcher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    current_stage_index: { type: Number, default: 0 },
    resubmit_until: { type: Date, default: null },
    template_urls: {
      proposal: { type: String, default: '' },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'researcher_progress' }
);

export const ResearchProgress = mongoose.models.ResearchProgress || mongoose.model('ResearchProgress', researchProgressSchema, 'researcher_progress');
