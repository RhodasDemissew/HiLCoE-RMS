import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, default: '' },
  },
  { _id: false }
);

const readMarkerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    last_read_at: { type: Date, default: null },
    last_read_message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { _id: false }
);

const lastMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    preview: { type: String, default: '' },
    kind: { type: String, enum: ['text','system','feedback'], default: 'text' },
    created_at: { type: Date },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['project','direct','system'], default: 'project' },
    subject: { type: String, trim: true, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    participants: { type: [participantSchema], required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    read_markers: { type: [readMarkerSchema], default: [] },
    last_message: { type: lastMessageSchema, default: () => ({}) },
    last_message_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'conversations' }
);

conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ project: 1 });
conversationSchema.index({ last_message_at: -1 });

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema, 'conversations');
