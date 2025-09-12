import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    decision: { type: String, enum: ['approve','request_changes','reject'], required: true },
    comments: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'reviews' }
);

reviewSchema.index({ milestone: 1, reviewer: 1 });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema, 'reviews');

