import mongoose from 'mongoose';
import { conversationRepo } from '../repositories/conversation.repository.js';
import { messageRepo } from '../repositories/message.repository.js';
import { projectRepo } from '../repositories/project.repository.js';
import { userRepo } from '../repositories/user.repository.js';
import { notify } from './notificationService.js';

const MAX_BODY_LENGTH = 4000;

const toId = (value) => (typeof value === 'string' || value instanceof mongoose.Types.ObjectId)
  ? String(value)
  : String(value?._id || value?.id || value);

function sanitizeBody(body) {
  return typeof body === 'string' ? body.trim() : '';
}

function buildPreview(body, attachments = []) {
  if (body) return body.length > 160 ? `${body.slice(0, 157)}...` : body;
  if (attachments.length > 0) return `Attachment: ${attachments[0].name}`;
  return '';
}

function presentParticipant(raw) {
  if (!raw) return null;
  const userDoc = raw.user && raw.user.name !== undefined ? raw.user : raw;
  const userId = toId(raw.user || raw);
  return {
    id: userId,
    role: raw.role || userDoc?.role?.name || '',
    user: {
      id: userId,
      name: userDoc?.name || '',
      email: userDoc?.email || '',
      role: userDoc?.role?.name || '',
    },
  };
}

function isValidObjectId(value) {
  return mongoose.isValidObjectId(value);
}

async function loadParticipants(userIds) {
  const uniqueIds = [...new Set(userIds.map((id) => String(id)))];
  const participants = [];
  for (const id of uniqueIds) {
    if (!isValidObjectId(id)) continue;
    const user = await userRepo.findById(id);
    if (user) {
      participants.push({ user: user._id, role: user.role?.name || '' });
    }
  }
  return participants;
}

function findMarkerForUser(conversation, userId) {
  return (conversation.read_markers || []).find((marker) => String(marker.user) === String(userId));
}

async function computeUnreadCount(conversation, userId) {
  if (!conversation.last_message_at) return 0;
  const marker = findMarkerForUser(conversation, userId);
  if (marker?.last_read_at && marker.last_read_at >= conversation.last_message_at) return 0;
  const since = marker?.last_read_at || null;
  return messageRepo.countAfter(conversation._id, since);
}

async function ensureCoordinatorParticipants() {
  const coordinators = await userRepo.findActiveByRoleName('Coordinator');
  return coordinators.map((user) => ({ user: user._id, role: user.role?.name || '' }));
}


function dedupeParticipantEntries(list = []) {
  const seen = new Set();
  const result = [];
  for (const part of list) {
    if (!part) continue;
    const rawUser = part.user?._id || part.user;
    if (!rawUser) continue;
    const key = String(rawUser);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ user: rawUser, role: part.role || part.user?.role?.name || '' });
  }
  return result;
}

export const messagingService = {
  async ensureProjectConversation(projectId, actorId) {
    if (!isValidObjectId(projectId)) throw new Error('invalid project id');
    const project = await projectRepo.findById(projectId).populate('researcher advisor');
    if (!project) throw new Error('project not found');

    const participants = [];
    if (project.researcher) participants.push({ user: project.researcher._id, role: project.researcher.role?.name || 'Researcher' });
    if (project.advisor) participants.push({ user: project.advisor._id, role: project.advisor.role?.name || 'Advisor' });
    
    // Only add coordinators to project conversations, not direct conversations
    const coordinators = await ensureCoordinatorParticipants();
    participants.push(...coordinators);

    const filtered = dedupeParticipantEntries(participants);

    let conversation = await conversationRepo.findProjectConversation(projectId);
    if (conversation) {
      const existing = new Set(conversation.participants.map((p) => String(p.user)));
      let changed = false;
      for (const part of filtered) {
        if (!existing.has(String(part.user))) {
          conversation.participants.push(part);
          changed = true;
        }
      }
      if (changed) await conversation.save();
      return conversation;
    }

    const creator = actorId && isValidObjectId(actorId) ? actorId : filtered[0]?.user;
    conversation = await conversationRepo.create({
      type: 'project',
      subject: project.title || 'Project messaging',
      project: project._id,
      participants: filtered,
      created_by: creator,
    });
    return conversationRepo.findByIdForUser(conversation._id, creator || filtered[0]?.user);
  },

  async ensureDirectConversation(targetUserId, actorId) {
    if (!isValidObjectId(targetUserId)) throw new Error('invalid user id');
    if (!isValidObjectId(actorId)) throw new Error('invalid actor id');

    const [targetUser, actorUser] = await Promise.all([
      userRepo.findById(targetUserId),
      userRepo.findById(actorId),
    ]);

    if (!targetUser) throw new Error('user not found');
    if (!actorUser) throw new Error('actor not found');
    if (String(targetUser._id) === String(actorUser._id)) throw new Error('cannot start a conversation with yourself');
    if (targetUser.status && targetUser.status !== 'active') throw new Error('user is not active');

    // Role-based messaging rules
    const actorRole = (actorUser.role?.name || '').toLowerCase();
    const targetRole = (targetUser.role?.name || '').toLowerCase();
    
    // Researchers can only talk to supervisors/advisors
    if (actorRole === 'researcher') {
      if (targetRole !== 'supervisor' && targetRole !== 'advisor') {
        throw new Error('Researchers can only message their supervisors');
      }
    }
    
    // Coordinators and Supervisors can talk to each other and researchers
    if (actorRole === 'coordinator' || actorRole === 'supervisor' || actorRole === 'advisor') {
      if (targetRole !== 'researcher' && targetRole !== 'coordinator' && targetRole !== 'supervisor' && targetRole !== 'advisor') {
        throw new Error('Invalid messaging target for your role');
      }
    }

    // Build participants for direct conversation only
    let participants = [
      { user: targetUser._id, role: targetUser.role?.name || '' },
      { user: actorUser._id, role: actorUser.role?.name || '' },
    ];

    const dedupedParticipants = dedupeParticipantEntries(participants);

    let conversation = await conversationRepo.findDirectBetween([actorId, targetUserId]);
    if (conversation) {
      // For direct conversations, ensure we only have the two participants
      const expectedParticipants = new Set([String(actorId), String(targetUserId)]);
      const currentParticipants = new Set(conversation.participants.map((p) => String(p.user)));
      
      // If conversation has extra participants, clean it up
      if (currentParticipants.size > 2 || !expectedParticipants.has(String(actorId)) || !expectedParticipants.has(String(targetUserId))) {
        conversation.participants = dedupedParticipants;
        await conversation.save();
      }
      
      return conversationRepo.findByIdForUser(conversation._id, actorId);
    }

    conversation = await conversationRepo.create({
      type: 'direct',
      subject: '',
      participants: dedupedParticipants,
      created_by: participants.find((p) => String(p.user) === String(actorId))?.user || participants[0].user,
    });

    return conversationRepo.findByIdForUser(conversation._id, actorId);
  },

  async createDirectConversation(participantIds, createdBy, subject = '') {
    const participants = await loadParticipants([...participantIds, createdBy]);
    if (participants.length < 2) throw new Error('at least two participants required');

    const conversation = await conversationRepo.create({
      type: participants.length === 2 ? 'direct' : 'system',
      subject: subject.trim(),
      participants,
      created_by: participants.find((p) => String(p.user) === String(createdBy))?.user || participants[0].user,
    });
    return conversationRepo.findByIdForUser(conversation._id, createdBy);
  },

  async listResearcherTargets(actorId, searchTerm = '') {
    const actorUser = await userRepo.findById(actorId);
    if (!actorUser) throw new Error('actor not found');
    
    const actorRole = (actorUser.role?.name || '').toLowerCase();
    const q = (searchTerm || '').trim().toLowerCase();
    const actorIdStr = actorId ? String(actorId) : '';
    
    let targetUsers = [];
    
    // Role-based target selection
    if (actorRole === 'researcher') {
      // Researchers can only see supervisors/advisors
      const supervisors = await userRepo.findActiveByRoleName('Supervisor');
      const advisors = await userRepo.findActiveByRoleName('Advisor');
      targetUsers = [...supervisors, ...advisors];
    } else if (actorRole === 'coordinator' || actorRole === 'supervisor' || actorRole === 'advisor') {
      // Coordinators and supervisors can see researchers and other coordinators/supervisors
      const researchers = await userRepo.findActiveByRoleName('Researcher');
      const supervisors = await userRepo.findActiveByRoleName('Supervisor');
      const advisors = await userRepo.findActiveByRoleName('Advisor');
      const coordinators = await userRepo.findActiveByRoleName('Coordinator');
      targetUsers = [...researchers, ...supervisors, ...advisors, ...coordinators];
    } else {
      // Default to researchers for unknown roles
      targetUsers = await userRepo.findActiveByRoleName('Researcher');
    }
    
    const filtered = targetUsers
      .filter((user) => String(user._id) !== actorIdStr)
      .filter((user) => {
        if (!q) return true;
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const studentId = (user.student_id || '').toLowerCase();
        return name.includes(q) || email.includes(q) || studentId.includes(q);
      });
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'en', { sensitivity: 'base' }));
    return filtered.map((user) => ({
      id: String(user._id),
      name: user.name || '',
      email: user.email || '',
      role: user.role?.name || '',
      studentId: user.student_id || '',
    }));
  },

  async listConversations(userId) {
    const conversations = await conversationRepo.listForUser(userId);
    const result = [];
    for (const conv of conversations) {
      const unread = await computeUnreadCount(conv, userId);
      result.push({
        id: String(conv._id),
        type: conv.type,
        subject: conv.subject,
        project: conv.project ? {
          id: String(conv.project._id || conv.project),
          title: conv.project.title,
        } : null,
        participants: conv.participants.map(presentParticipant).filter(Boolean),
        last_message: conv.last_message?.created_at ? {
          sender: conv.last_message.sender ? {
            id: toId(conv.last_message.sender),
            name: conv.last_message.sender?.name || '',
            role: conv.last_message.sender?.role?.name || '',
          } : null,
          preview: conv.last_message.preview || '',
          kind: conv.last_message.kind || 'text',
          created_at: conv.last_message.created_at,
        } : null,
        last_message_at: conv.last_message_at,
        unread_count: unread,
      });
    }
    return result;
  },

  async getConversation(conversationId, userId) {
    const conversation = await conversationRepo.findByIdForUser(conversationId, userId);
    if (!conversation) throw new Error('conversation not found');
    const unread = await computeUnreadCount(conversation, userId);
    return {
      id: String(conversation._id),
      type: conversation.type,
      subject: conversation.subject,
      project: conversation.project ? {
        id: String(conversation.project._id || conversation.project),
        title: conversation.project.title,
      } : null,
      participants: conversation.participants.map(presentParticipant).filter(Boolean),
      last_message_at: conversation.last_message_at,
      unread_count: unread,
    };
  },

  async listMessages(conversationId, userId, { before, limit = 50 } = {}) {
    const conversation = await conversationRepo.findByIdForUser(conversationId, userId);
    if (!conversation) throw new Error('conversation not found');
    const beforeDate = before ? new Date(before) : undefined;
    const messages = await messageRepo.listForConversation(conversationId, { before: beforeDate, limit });
    const items = messages.reverse().map((msg) => ({
      id: String(msg._id),
      conversation: String(msg.conversation),
      body: msg.body,
      kind: msg.kind,
      attachments: msg.attachments || [],
      meta: msg.meta,
      sender: msg.sender ? {
        id: String(msg.sender._id || msg.sender),
        name: msg.sender.name || '',
        role: msg.sender.role?.name || '',
      } : null,
      created_at: msg.created_at,
    }));
    return {
      conversation: String(conversationId),
      items,
      next_cursor: items.length === limit ? items[0]?.created_at : null,
    };
  },

  async sendMessage(conversationId, userId, { body, attachments = [], kind = 'text', meta = null }) {
    const conversation = await conversationRepo.findByIdForUser(conversationId, userId);
    if (!conversation) throw new Error('conversation not found');
    const text = sanitizeBody(body);
    if (!text && (!attachments || attachments.length === 0)) throw new Error('message body required');
    if (text.length > MAX_BODY_LENGTH) throw new Error('message too long');

    const normalizedAttachments = (attachments || []).map((att) => ({
      name: att.name,
      url: att.url,
      size: att.size || 0,
      content_type: att.content_type || att.mime || '',
    })).filter((att) => att.name && att.url);

    const created = await messageRepo.create({
      conversation: conversationId,
      sender: userId,
      body: text,
      attachments: normalizedAttachments,
      kind,
      meta,
    });
    await created.populate({ path: 'sender', select: 'name email role' });

    const preview = buildPreview(text, normalizedAttachments);
    await conversationRepo.touchLastMessage(conversationId, {
      sender: created.sender?._id || created.sender,
      preview,
      kind,
      created_at: created.created_at,
    });
    await conversationRepo.addReadMarker(conversationId, {
      user: userId,
      last_read_at: created.created_at,
      last_read_message: created._id,
    });

    const participantIds = conversation.participants.map((p) => String(p.user));
    const notifyTargets = participantIds.filter((id) => id !== String(userId));
    await Promise.all(notifyTargets.map((targetId) => notify(targetId, 'message_received', {
      conversationId: String(conversationId),
      senderId: String(userId),
      preview,
    })));

    return {
      id: String(created._id),
      conversation: String(conversationId),
      body: created.body,
      kind: created.kind,
      attachments: created.attachments,
      meta: created.meta,
      sender: {
        id: String(created.sender._id || created.sender),
        name: created.sender.name || '',
        role: created.sender.role?.name || '',
      },
      created_at: created.created_at,
    };
  },

  async markRead(conversationId, userId, messageId = null) {
    const conversation = await conversationRepo.findByIdForUser(conversationId, userId);
    if (!conversation) throw new Error('conversation not found');
    let markerMessageId = messageId;
    let readAt = new Date();
    if (!markerMessageId) {
      const latest = await messageRepo.findLatest(conversationId);
      if (!latest) {
        await conversationRepo.addReadMarker(conversationId, { user: userId, last_read_at: readAt, last_read_message: null });
        return { ok: true };
      }
      markerMessageId = latest._id;
      readAt = latest.created_at || readAt;
    }
    await conversationRepo.addReadMarker(conversationId, {
      user: userId,
      last_read_at: readAt,
      last_read_message: markerMessageId,
    });
    return { ok: true };
  },

  async emitSystemMessageForProject(projectId, { body, meta = null, kind = 'system', actorId = null }) {
    const conversation = await this.ensureProjectConversation(projectId, actorId);
    const sender = actorId || conversation.created_by;
    return this.sendMessage(conversation._id, sender, {
      body,
      attachments: [],
      kind,
      meta,
    });
  },

  async cleanupDirectConversations() {
    // Find all direct conversations that have more than 2 participants
    const conversations = await conversationRepo.listForUser(null);
    const directConversations = conversations.filter(conv => conv.type === 'direct');
    
    for (const conv of directConversations) {
      if (conv.participants.length > 2) {
        // Keep only the first two participants (original participants)
        const originalParticipants = conv.participants.slice(0, 2);
        conv.participants = originalParticipants;
        await conv.save();
      }
    }
  },

  async deleteAllMessages() {
    // Delete all messages
    await messageRepo.deleteAll();
    
    // Delete all conversations
    await conversationRepo.deleteAll();
    
    return { message: 'All messages and conversations deleted successfully' };
  },
};

