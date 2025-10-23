import dayjs from 'dayjs';
import { Defense } from '../../models/Defense.js';
import { StageSubmission } from '../../models/StageSubmission.js';
import { toIso } from '../defense/utils.js';

const TYPES = {
  defense: 'defense',
  synopsis: 'synopsis',
};

function normalizeDefense(defense) {
  return {
    id: `defense:${defense._id}`,
    type: TYPES.defense,
    title: defense.title,
    startAt: toIso(defense.start_at),
    endAt: toIso(defense.end_at),
    people: [
      { id: String(defense.candidate), role: 'Candidate' },
      ...(defense.panelists || []).map((id) => ({ id: String(id), role: 'Panelist' })),
      defense.supervisor ? { id: String(defense.supervisor), role: 'Supervisor' } : null,
    ].filter(Boolean),
    venue: defense.venue || '',
    link: defense.meeting_link || '',
    status: defense.status,
    notes: defense.notes || '',
  };
}

function normalizeSynopsis(submission) {
  const end = submission.scheduled_end_at
    ? dayjs(submission.scheduled_end_at)
    : dayjs(submission.scheduled_at).add(60, 'minute');
  return {
    id: `synopsis:${submission._id}`,
    type: TYPES.synopsis,
    title: `${submission.researcher?.name || 'Researcher'} – Synopsis`,
    startAt: toIso(submission.scheduled_at),
    endAt: toIso(end),
    people: [
      submission.researcher ? { id: String(submission.researcher._id || submission.researcher), role: 'Researcher' } : null,
      submission.reviewer ? { id: String(submission.reviewer._id || submission.reviewer), role: 'Reviewer' } : null,
    ].filter(Boolean),
    venue: submission.scheduled_venue || '',
    link: submission.scheduled_meeting_link || '',
    status: submission.status,
  };
}

export const calendarService = {
  async list({
    from,
    to,
    types = [],
    roleFilter,
    peopleFilter,
    includeCancelled = false,
    mine,
    venue,
  }) {
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
      const defenses = await Defense.find(query).select('title candidate panelists supervisor start_at end_at venue meeting_link status notes buffer_mins');
      defenses.forEach((def) => events.push(normalizeDefense(def)));
    }

    if (wantSynopsis) {
      const query = { stage_index: 0, scheduled_at: { $ne: null } };
      if (Object.keys(range).length) query.scheduled_at = range;
      if (venue) query.scheduled_venue = venue;
      const synopsis = await StageSubmission.find(query).select('researcher reviewer scheduled_at scheduled_end_at scheduled_venue scheduled_meeting_link status');
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

    return filtered;
  },
};
