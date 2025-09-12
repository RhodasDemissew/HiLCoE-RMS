import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'feedback' }
);

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema, 'feedback');