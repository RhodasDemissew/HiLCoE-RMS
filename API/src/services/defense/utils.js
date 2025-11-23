import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const DEFENSE_TZ = 'Africa/Addis_Ababa';
export const MIN_DURATION = 15;

export function parseLocalStart(dateStr, timeStr) {
  if (!dateStr) throw new Error('Date is required');
  if (!timeStr) throw new Error('Start time required');
  const dt = dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', DEFENSE_TZ);
  if (!dt.isValid()) throw new Error('Invalid start datetime');
  return dt.utc();
}

export function ensureFuture(startUtc) {
  if (!startUtc || !startUtc.isValid()) throw new Error('Invalid datetime');
  if (startUtc.isBefore(dayjs().utc().subtract(1, 'minute'))) {
    throw new Error('Start time must be in the future');
  }
}

export function computeWindow(startUtc, durationMins = 60, bufferMins = 15) {
  const duration = Math.max(Number.isFinite(durationMins) ? durationMins : 60, MIN_DURATION);
  const buffer = Math.max(Number.isFinite(bufferMins) ? bufferMins : 0, 0);
  const endUtc = startUtc.add(duration, 'minute');
  return {
    startUtc,
    endUtc,
    duration,
    buffer,
  };
}

export function normalizeVenueAndLink(modality, rawVenue = '', rawMeetingLink = '') {
  const venue = (rawVenue || '').trim();
  const link = (rawMeetingLink || '').trim();

  if (modality === 'in-person') {
    if (!venue) throw new Error('Venue is required for in-person defenses');
  } else if (modality === 'online') {
    if (!link) throw new Error('Meeting link is required for online defenses');
  } else if (modality === 'hybrid') {
    if (!venue && !link) throw new Error('Venue or meeting link required for hybrid defenses');
  }
  return { venue, link };
}

export function buildPersonSet(candidateId, panelistIds = [], supervisorId) {
  const set = new Set();
  if (candidateId) set.add(String(candidateId));
  (panelistIds || []).forEach((id) => set.add(String(id)));
  if (supervisorId) set.add(String(supervisorId));
  return Array.from(set);
}

export function hasOverlap(existingEvents, startUtc, endUtc, bufferMins = 0) {
  const start = startUtc.subtract(bufferMins, 'minute');
  const end = endUtc.add(bufferMins, 'minute');
  return existingEvents.some((event) => {
    const eventStart = dayjs(event.start_at || event.startAt).utc();
    const eventEnd = dayjs(event.end_at || event.endAt).utc();
    if (!eventStart.isValid() || !eventEnd.isValid()) return false;
    const eventBuffer = Number.isFinite(event.buffer_mins) ? event.buffer_mins : (event.bufferMins || 0);
    const bufferedStart = eventStart.subtract(eventBuffer, 'minute');
    const bufferedEnd = eventEnd.add(eventBuffer, 'minute');
    return bufferedStart.isBefore(end) && bufferedEnd.isAfter(start);
  });
}

export function toIso(value) {
  return value ? dayjs(value).utc().toISOString() : null;
}

export { dayjs };
