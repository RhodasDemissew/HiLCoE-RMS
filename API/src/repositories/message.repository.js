import { Message } from '../models/Message.js';

export const messageRepo = {
  create: (data) => Message.create(data),
  listForConversation: (conversationId, { limit = 50, before } = {}) => {
    const query = { conversation: conversationId };
    if (before) query.created_at = { $lt: before };
    return Message.find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .populate({ path: 'sender', select: 'name email role' });
  },
  countAfter: (conversationId, sinceDate) => {
    if (!sinceDate) return Message.countDocuments({ conversation: conversationId });
    return Message.countDocuments({ conversation: conversationId, created_at: { $gt: sinceDate } });
  },
  findLatest: (conversationId) => Message.findOne({ conversation: conversationId })
    .sort({ created_at: -1 })
    .populate({ path: 'sender', select: 'name email role' }),
};
