import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ObjectId = z.string().regex(objectIdRegex, 'Invalid id');

export const DefenseIdParams = z.object({ id: ObjectId });

const baseCreate = {
  title: z.string().trim().min(1),
  researcherId: ObjectId,
  examinerIds: z.array(ObjectId).min(1, 'At least one examiner required'),
  supervisorId: ObjectId.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'Start time must be HH:mm'),
  durationMins: z.number().int().min(15).max(8 * 60).default(60),
  bufferMins: z.number().int().min(0).max(8 * 60).default(15),
  venue: z.string().trim().optional(),
  meetingLink: z.string().trim().url().optional(),
  modality: z.enum(['in-person', 'online', 'hybrid']),
  notes: z.string().trim().max(2000).optional(),
};

export const DefenseCreateDto = z.object(baseCreate);

export const DefenseUpdateDto = z.object({
  title: baseCreate.title.optional(),
  researcherId: baseCreate.researcherId.optional(),
  examinerIds: baseCreate.examinerIds.optional(),
  supervisorId: baseCreate.supervisorId,
  date: baseCreate.date.optional(),
  startTime: baseCreate.startTime.optional(),
  durationMins: baseCreate.durationMins.optional(),
  bufferMins: baseCreate.bufferMins.optional(),
  venue: baseCreate.venue,
  meetingLink: baseCreate.meetingLink,
  modality: baseCreate.modality.optional(),
  notes: baseCreate.notes,
}).refine((data) => !data.examinerIds || data.examinerIds.length > 0, {
  message: 'At least one examiner required',
  path: ['examinerIds'],
});

export const DefenseDuplicateDto = z.object({
  title: baseCreate.title.optional(),
  researcherId: baseCreate.researcherId.optional(),
  examinerIds: baseCreate.examinerIds.optional(),
  supervisorId: baseCreate.supervisorId,
  date: baseCreate.date.optional(),
  startTime: baseCreate.startTime.optional(),
  durationMins: baseCreate.durationMins.optional(),
  bufferMins: baseCreate.bufferMins.optional(),
  venue: baseCreate.venue,
  meetingLink: baseCreate.meetingLink,
  modality: baseCreate.modality.optional(),
  notes: baseCreate.notes,
});

export const DefenseRespondDto = z.object({
  status: z.enum(['accept', 'decline']),
  note: z.string().trim().max(1000).optional(),
});

export const DefenseListQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  candidateId: ObjectId.optional(),
  panelistId: ObjectId.optional(),
  mine: z.enum(['true', 'false']).optional(),
  includeCancelled: z.enum(['true', 'false']).optional(),
});

export const DefenseAvailabilityQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  userIds: z.union([z.string(), z.array(ObjectId)]).optional(),
});


