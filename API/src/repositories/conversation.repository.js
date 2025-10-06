import { Conversation } from '../models/Conversation.js';

export const conversationRepo = {
  create: (data) => Conversation.create(data),
  findById: (id) => Conversation.findById(id),
  findByIdForUser: (id, userId) => Conversation.findOne({ _id: id, 'participants.user': userId })
    .populate({ path: 'participants.user', select: 'name email role' })
    .populate({ path: 'last_message.sender', select: 'name email role' })
    .populate({ path: 'project', select: 'title researcher advisor' }),
  findProjectConversation: (projectId) => Conversation.findOne({ project: projectId, type: 'project' })
    .populate({ path: 'participants.user', select: 'name email role' })
    .populate({ path: 'last_message.sender', select: 'name email role' })
    .populate({ path: 'project', select: 'title researcher advisor' }),
  listForUser: (userId) => Conversation.find({ 'participants.user': userId })
    .populate({ path: 'participants.user', select: 'name email role' })
    .populate({ path: 'last_message.sender', select: 'name email role' })
    .populate({ path: 'project', select: 'title researcher advisor' })
    .sort({ last_message_at: -1, updated_at: -1 })
    .limit(200),
  addReadMarker: async (conversationId, marker) => {
    await Conversation.updateOne({ _id: conversationId }, { $pull: { read_markers: { user: marker.user } } });
    return Conversation.updateOne({ _id: conversationId }, { $push: { read_markers: marker } });
  },
  touchLastMessage: (conversationId, payload) => Conversation.updateOne(
    { _id: conversationId },
    {
      $set: {
        last_message_at: payload.created_at,
        last_message: payload,
      },
    }
  ),
};
