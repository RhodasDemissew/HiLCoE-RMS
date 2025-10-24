import { Defense } from '../models/Defense.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { notify } from './notificationService.js';
import {
  parseLocalStart,
  ensureFuture,
  computeWindow,
  normalizeVenueAndLink,
  buildPersonSet,
  toIso,
  dayjs,
  DEFENSE_TZ,
} from './defense/utils.js';

async function assertUserIds(ids = []) {
  if (!ids.length) return [];
  const docs = await User.find({ _id: { $in: ids } }).select('_id name role email');
  if (docs.length !== ids.length) {
    throw new Error('One or more people not found');
  }
  return docs;
}

async function detectConflicts({ window, people, venue, excludeId = null }) {
  const { startUtc, endUtc, buffer } = window;
  const startBuffer = startUtc.clone().subtract(buffer, 'minute').toDate();
  const endBuffer = endUtc.clone().add(buffer, 'minute').toDate();
  const query = {
    status: { $ne: 'cancelled' },
    start_at: { $lt: endBuffer },
    end_at: { $gt: startBuffer },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const or = [];
  if (people.length) {
    or.push({ candidate: { $in: people } });
    or.push({ panelists: { $in: people } });
    or.push({ supervisor: { $in: people } });
  }
  if (venue) {
    or.push({ venue });
  }
  if (!or.length) return [];
  query.$or = or;

  const conflicts = await Defense.find(query).select('title start_at end_at buffer_mins candidate panelists supervisor venue');
  return conflicts;
}

function serialize(defense) {
  if (!defense) return null;
  return {
    id: String(defense._id),
    title: defense.title,
    candidateId: defense.candidate ? defense.candidate.toString() : null,
    panelistIds: (defense.panelists || []).map((id) => id.toString()),
    supervisorId: defense.supervisor ? defense.supervisor.toString() : null,
    startAt: toIso(defense.start_at),
    endAt: toIso(defense.end_at),
    durationMins: defense.duration_mins,
    bufferMins: defense.buffer_mins,
    venue: defense.venue || '',
    meetingLink: defense.meeting_link || '',
    modality: defense.modality,
    notes: defense.notes || '',
    status: defense.status,
    createdBy: defense.created_by ? defense.created_by.toString() : null,
    createdAt: toIso(defense.created_at),
    responses: defense.responses?.map((resp) => ({
      userId: resp.user?.toString(),
      status: resp.status,
      note: resp.note,
      respondedAt: toIso(resp.responded_at),
    })) || [],
    changeRequests: defense.change_requests?.map((req) => ({
      requestedBy: req.requested_by ? req.requested_by.toString() : null,
      reason: req.reason,
      preferredSlots: Array.isArray(req.preferred_slots) ? req.preferred_slots : [],
      requestedAt: toIso(req.requested_at),
    })) || [],
  };
}

export const defenseService = {
  serialize,

  async create(params) {
    const {
      actorId,
      title,
      researcherId,
      candidateId,
      examinerIds,
      supervisorId,
      date,
      startTime,
      durationMins = 60,
      bufferMins = 15,
      venue,
      meetingLink,
      modality,
      notes,
    } = params;
    if (!title) throw new Error('Title is required');
    const studentId = researcherId || candidateId;
    if (!studentId) throw new Error('Researcher is required');
    if (!Array.isArray(examinerIds) || !examinerIds.length) throw new Error('At least one examiner is required');

    const [candidate, panelists, supervisor] = await Promise.all([
      assertUserIds([studentId]),
      assertUserIds(examinerIds),
      supervisorId ? assertUserIds([supervisorId]) : Promise.resolve([]),
    ]);
    if (!candidate.length) throw new Error('Researcher not found');

    const startUtc = parseLocalStart(date, startTime);
    ensureFuture(startUtc);
    const window = computeWindow(startUtc, durationMins, bufferMins);
    const { venue: normalizedVenue, link: normalizedLink } = normalizeVenueAndLink(modality, venue, meetingLink);
    const people = buildPersonSet(studentId, examinerIds, supervisorId);
    const conflicts = await detectConflicts({ window, people, venue: normalizedVenue, excludeId: null });
    if (conflicts.length) {
      throw new Error(`Conflict with existing defense: ${conflicts[0].title}`);
    }

    const defense = await Defense.create({
      title: title.trim(),
      candidate: studentId,
      panelists: examinerIds,
      supervisor: supervisorId || null,
      start_at: window.startUtc.toDate(),
      end_at: window.endUtc.toDate(),
      duration_mins: window.duration,
      buffer_mins: window.buffer,
      venue: normalizedVenue,
      meeting_link: normalizedLink,
      modality,
      notes: notes || '',
      created_by: actorId,
      responses: [
        ...panelists.map((p) => ({ user: p._id, status: 'pending' })),
        ...(supervisor?.map((s) => ({ user: s._id, status: 'pending' })) || []),
      ],
    });

    try {
      const notifyTargets = [...panelists, ...(supervisor || [])];
      for (const target of notifyTargets) {
        await notify(target._id, 'defense_scheduled', {
          defenseId: String(defense._id),
          title: defense.title,
          startAt: toIso(defense.start_at),
        });
      }
    } catch {}

    return serialize(defense);
  },

  async update(id, payload = {}) {
    const defense = await Defense.findById(id);
    if (!defense) throw new Error('Defense not found');
    if (defense.status === 'cancelled') throw new Error('Cannot modify cancelled defense');

    const researcherId = payload.researcherId || payload.candidateId || defense.candidate;
    const examinerIds = payload.examinerIds?.length ? payload.examinerIds : defense.panelists;
    const supervisorId = payload.supervisorId !== undefined ? payload.supervisorId : defense.supervisor;

    await assertUserIds([researcherId]);
    await assertUserIds(examinerIds);
    if (supervisorId) await assertUserIds([supervisorId]);

    const baseLocal = dayjs(defense.start_at).tz(DEFENSE_TZ);
    const date = payload.date || baseLocal.format('YYYY-MM-DD');
    const time = payload.startTime || baseLocal.format('HH:mm');
    const startUtc = parseLocalStart(date, time);
    ensureFuture(startUtc);
    const window = computeWindow(
      startUtc,
      payload.durationMins ?? defense.duration_mins,
      payload.bufferMins ?? defense.buffer_mins,
    );
    const modality = payload.modality || defense.modality;
    const { venue: normalizedVenue, link: normalizedLink } = normalizeVenueAndLink(
      modality,
      payload.venue ?? defense.venue,
      payload.meetingLink ?? defense.meeting_link,
    );

    const conflicts = await detectConflicts({
      window,
      people: buildPersonSet(researcherId, examinerIds, supervisorId),
      venue: normalizedVenue,
      excludeId: defense._id,
    });
    if (conflicts.length) throw new Error('Conflict detected with existing defense');

    defense.title = (payload.title?.trim() || defense.title).trim();
    defense.candidate = researcherId;
    defense.panelists = examinerIds;
    defense.supervisor = supervisorId || null;
    defense.start_at = window.startUtc.toDate();
    defense.end_at = window.endUtc.toDate();
    defense.duration_mins = window.duration;
    defense.buffer_mins = window.buffer;
    defense.venue = normalizedVenue;
    defense.meeting_link = normalizedLink;
    defense.modality = modality;
    defense.notes = payload.notes ?? defense.notes;
    await defense.save();
    return serialize(defense);
  },

  async cancel(id) {
    const defense = await Defense.findById(id);
    if (!defense) throw new Error('Defense not found');
    defense.status = 'cancelled';
    await defense.save();
    try {
      const targets = buildPersonSet(defense.candidate, defense.panelists, defense.supervisor);
      for (const target of targets) {
        await notify(target, 'defense_cancelled', { defenseId: String(defense._id) });
      }
    } catch {}
    return serialize(defense);
  },

  async duplicate(id, actorId, overrides = {}) {
    const defense = await Defense.findById(id);
    if (!defense) throw new Error('Defense not found');
    const baseLocal = dayjs(defense.start_at).tz(DEFENSE_TZ);
    return this.create({
      actorId,
      title: overrides.title || `${defense.title} (Copy)`,
      researcherId: overrides.researcherId || overrides.candidateId || defense.candidate,
      examinerIds: overrides.examinerIds || defense.panelists,
      supervisorId: overrides.supervisorId ?? defense.supervisor,
      date: overrides.date || baseLocal.format('YYYY-MM-DD'),
      startTime: overrides.startTime || baseLocal.format('HH:mm'),
      durationMins: overrides.durationMins || defense.duration_mins,
      bufferMins: overrides.bufferMins ?? defense.buffer_mins,
      venue: overrides.venue ?? defense.venue,
      meetingLink: overrides.meetingLink ?? defense.meeting_link,
      modality: overrides.modality || defense.modality,
      notes: overrides.notes ?? defense.notes,
    });
  },

  async respond({ defenseId, userId, status, note }) {
    const defense = await Defense.findById(defenseId);
    if (!defense) throw new Error('Defense not found');
    if (!['accept', 'decline'].includes(status)) throw new Error('Invalid status');
    const response = defense.responses?.find((resp) => String(resp.user) === String(userId));
    if (!response) throw new Error('Not invited to this defense');
    response.status = status;
    response.note = note || '';
    response.responded_at = new Date();
    await defense.save();
    return serialize(defense);
  },

  async requestChange({ defenseId, userId, reason, preferredSlots }) {
    const defense = await Defense.findById(defenseId);
    if (!defense) throw new Error('Defense not found');
    if (String(defense.candidate) !== String(userId)) {
      throw new Error('Only the researcher may request a schedule change');
    }
    const cleanReason = (reason || '').trim();
    if (!cleanReason) throw new Error('Reason is required');
    const slots = Array.isArray(preferredSlots)
      ? preferredSlots.map((slot) => String(slot || '').trim()).filter(Boolean)
      : [];
    defense.change_requests = [
      ...(defense.change_requests || []),
      {
        requested_by: userId,
        reason: cleanReason,
        preferred_slots: slots,
        requested_at: new Date(),
      },
    ];
    await defense.save();

    try {
      const coordinatorRole = await Role.findOne({ name: /coordinator/i });
      if (coordinatorRole?._id) {
        const coordinators = await User.find({ role: coordinatorRole._id }).select('_id');
        const payload = {
          defenseId: String(defense._id),
          title: defense.title,
          requestedBy: String(userId),
          reason: cleanReason,
          preferredSlots: slots,
          startAt: toIso(defense.start_at),
        };
        for (const coordinator of coordinators) {
          await notify(coordinator._id, 'defense_reschedule_requested', payload);
        }
      }
    } catch {}

    return serialize(defense);
  },

  async list({ from, to, candidateId, panelistId, mineId, includeCancelled = false }) {
    const query = {};
    if (!includeCancelled) query.status = { $ne: 'cancelled' };
    if (from || to) {
      query.start_at = {};
      if (from) query.start_at.$gte = new Date(from);
      if (to) query.start_at.$lte = new Date(to);
    }
    if (candidateId) query.candidate = candidateId;
    if (panelistId) query.panelists = panelistId;
    if (mineId) {
      query.$or = [
        { candidate: mineId },
        { panelists: mineId },
        { supervisor: mineId },
      ];
    }
    const items = await Defense.find(query).sort({ start_at: 1 });
    return items.map(serialize);
  },

  async availability({ from, to, userIds = [] }) {
    if (!Array.isArray(userIds) || !userIds.length) return [];
    const query = {
      status: { $ne: 'cancelled' },
      $or: [
        { candidate: { $in: userIds } },
        { panelists: { $in: userIds } },
        { supervisor: { $in: userIds } },
      ],
    };
    if (from || to) {
      query.start_at = {};
      if (from) query.start_at.$gte = new Date(from);
      if (to) query.start_at.$lte = new Date(to);
    }
    const defenses = await Defense.find(query).select('candidate panelists supervisor start_at end_at buffer_mins');
    return defenses.map((item) => ({
      startAt: toIso(item.start_at),
      endAt: toIso(dayjs(item.end_at).utc().add(item.buffer_mins || 0, 'minute')),
      people: buildPersonSet(item.candidate, item.panelists, item.supervisor),
      bufferMins: item.buffer_mins,
    }));
  },
};
