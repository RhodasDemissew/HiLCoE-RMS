import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accept', 'decline'],
      default: 'pending',
    },
    note: { type: String, default: '' },
    responded_at: { type: Date, default: null },
  },
  { _id: false },
);

const defenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    panelists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    start_at: { type: Date, required: true },
    end_at: { type: Date, required: true },
    venue: { type: String, default: '' },
    meeting_link: { type: String, default: '' },
    modality: { type: String, enum: ['in-person', 'online', 'hybrid'], required: true },
    buffer_mins: { type: Number, default: 15 },
    duration_mins: { type: Number, default: 60 },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['scheduled', 'cancelled'], default: 'scheduled' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() },
    responses: { type: [responseSchema], default: [] },
    change_requests: {
      type: [
        {
          requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          reason: { type: String, default: '' },
          preferred_slots: { type: [String], default: [] },
          requested_at: { type: Date, default: () => new Date() },
        },
      ],
      default: [],
    },
  },
  {
    collection: 'defenses',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

defenseSchema.index({ candidate: 1, start_at: 1 });
defenseSchema.index({ panelists: 1, start_at: 1 });
defenseSchema.index({ supervisor: 1, start_at: 1 });
defenseSchema.index({ start_at: 1, end_at: 1 });

export const Defense = mongoose.models.Defense || mongoose.model('Defense', defenseSchema, 'defenses');
