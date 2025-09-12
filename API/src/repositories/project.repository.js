import { Project } from '../models/Project.js';

export const projectRepo = {
  create: (data) => Project.create(data),
  list: () => Project.find().limit(200).populate('researcher advisor'),
  findById: (id) => Project.findById(id),
  countAdvisees: (advisorId, semester) => Project.countDocuments({ advisor: advisorId, semester }),
  save: (project) => project.save(),
};

