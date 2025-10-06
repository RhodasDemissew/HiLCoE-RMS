import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, default: 0 },
    content_type: { type: String, default: '' },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, trim: true, default: '' },
    kind: { type: String, enum: ['text','system','feedback'], default: 'text' },
    attachments: { type: [attachmentSchema], default: [] },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'messages' }
);

messageSchema.index({ conversation: 1, created_at: 1 });

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema, 'messages');
