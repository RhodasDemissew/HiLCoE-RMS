import dayjs from 'dayjs';
import { Defense } from '../../models/Defense.js';
import { StageSubmission } from '../../models/StageSubmission.js';
import { toIso } from '../defense/utils.js';

const TYPES = {
  defense: 'defense',
  synopsis: 'synopsis',
};

function toPerson(entry, fallbackRole) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    return { id: entry, role: fallbackRole };
  }
  const id = entry._id ? String(entry._id) : String(entry);
  const name = entry.name || entry.full_name || entry.fullName || undefined;
  return {
    id,
    role: fallbackRole,
    name,
  };
}

function toId(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id ? String(value._id) : String(value);
}

function normalizeDefense(defense) {
  const candidate = toPerson(defense.candidate, 'Candidate');
  const panelists = Array.isArray(defense.panelists)
    ? defense.panelists.map((panelist) => toPerson(panelist, 'Panelist')).filter(Boolean)
    : [];
  const supervisor = toPerson(defense.supervisor, 'Supervisor');

  return {
    id: `defense:${defense._id}`,
    type: TYPES.defense,
    title: defense.title,
    startAt: toIso(defense.start_at),
    endAt: toIso(defense.end_at),
    durationMins: defense.duration_mins,
    bufferMins: defense.buffer_mins,
    defenseId: String(defense._id),
    people: [candidate, ...panelists, supervisor].filter(Boolean),
    responses: (defense.responses || []).map((resp) => ({
      userId: toId(resp.user),
      userName: resp.user && typeof resp.user === 'object' ? resp.user.name : undefined,
      status: resp.status,
      note: resp.note,
      respondedAt: toIso(resp.responded_at),
    })),
    changeRequests: (defense.change_requests || []).map((req) => ({
      requestedBy: toId(req.requested_by),
      requestedByName: req.requested_by && typeof req.requested_by === 'object' ? req.requested_by.name : undefined,
      reason: req.reason,
      preferredSlots: Array.isArray(req.preferred_slots) ? req.preferred_slots : [],
      requestedAt: toIso(req.requested_at),
    })),
    venue: defense.venue || '',
    link: defense.meeting_link || '',
    status: defense.status,
    notes: defense.notes || '',
  };
}

function normalizeSynopsis(submission) {
  const start = submission.scheduled_at ? dayjs(submission.scheduled_at) : null;
  const end = submission.scheduled_end_at ? dayjs(submission.scheduled_end_at) : start ? start.add(60, 'minute') : null;
  const researcher = toPerson(submission.researcher, 'Researcher');
  const reviewer = toPerson(submission.reviewer, 'Reviewer');
  const researcherName = researcher && researcher.name ? researcher.name : 'Researcher';

  return {
    id: `synopsis:${submission._id}`,
    type: TYPES.synopsis,
    title: `${researcherName} - Synopsis`,
    startAt: toIso(submission.scheduled_at),
    endAt: toIso(end),
    durationMins: end && start ? end.diff(start, 'minute') : 60,
    venue: submission.scheduled_venue || '',
    link: submission.scheduled_meeting_link || '',
    status: submission.status,
    notes: '',
    people: [researcher, reviewer].filter(Boolean),
    responses: [],
    changeRequests: [],
  };
}

export const calendarService = {
  async list({ from, to, types = [], roleFilter, peopleFilter, includeCancelled = false, mine, venue }) {
    const range = {};
    if (from) range.$gte = new Date(from);
    if (to) range.$lte = new Date(to);
    const wantDefense = !types.length || types.includes(TYPES.defense);
    const wantSynopsis = !types.length || types.includes(TYPES.synopsis);

    const events = [];

    if (wantDefense) {
      const query = {};
      if (Object.keys(range).length) query.start_at = range;
      if (!includeCancelled) query.status = { $ne: 'cancelled' };
      if (peopleFilter?.length) {
        query.$or = [
          { candidate: { $in: peopleFilter } },
          { panelists: { $in: peopleFilter } },
          { supervisor: { $in: peopleFilter } },
        ];
      } else if (mine) {
        query.$or = [
          { candidate: mine },
          { panelists: mine },
          { supervisor: mine },
        ];
      }
      if (venue) query.venue = venue;
      const defenses = await Defense.find(query)
        .select('title candidate panelists supervisor start_at end_at venue meeting_link status notes buffer_mins duration_mins responses change_requests')
        .populate('candidate', 'name email')
        .populate('panelists', 'name email')
        .populate('supervisor', 'name email')
        .populate('responses.user', 'name email')
        .populate('change_requests.requested_by', 'name email')
        .sort({ start_at: 1 });
      defenses.forEach((def) => events.push(normalizeDefense(def)));
    }

    if (wantSynopsis) {
      const query = { stage_index: 0, scheduled_at: { $ne: null } };
      if (Object.keys(range).length) query.scheduled_at = range;
      if (venue) query.scheduled_venue = venue;
      const synopsis = await StageSubmission.find(query)
        .select('researcher reviewer scheduled_at scheduled_end_at scheduled_venue scheduled_meeting_link status')
        .populate('researcher', 'name email')
        .populate('reviewer', 'name email')
        .sort({ scheduled_at: 1 });
      synopsis.forEach((item) => events.push(normalizeSynopsis(item)));
    }

    const filtered = events.filter((event) => {
      if (roleFilter) {
        const matchRole = event.people?.some((person) => person.role?.toLowerCase().includes(roleFilter.toLowerCase()));
        if (!matchRole) return false;
      }
      if (peopleFilter?.length) {
        const matchPerson = event.people?.some((person) => peopleFilter.includes(person.id));
        if (!matchPerson) return false;
      } else if (mine) {
        const matchMine = event.people?.some((person) => person.id === mine);
        if (!matchMine) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  },
};
