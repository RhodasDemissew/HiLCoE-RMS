import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    type: { type: String, enum: ['defense'], default: 'defense' },
    start_at: { type: Date, required: true },
    end_at: { type: Date },
    location: { type: String, default: '' },
    virtual_link: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'schedules' }
);

export const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema, 'schedules');
