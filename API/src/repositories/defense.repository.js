import { ExaminerAssignment } from '../models/ExaminerAssignment.js';
import { Schedule } from '../models/Schedule.js';
import { Grade } from '../models/Grade.js';

export const defenseRepo = {
  createAssignment: (data) => ExaminerAssignment.create(data),
  createSchedule: (data) => Schedule.create(data),
  upsertGrade: (projectId, set) => Grade.findOneAndUpdate({ project: projectId }, { $set: set }, { new: true, upsert: true }),
};

