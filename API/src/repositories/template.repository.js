import { DocumentTemplate } from '../models/DocumentTemplate.js';

export const templateRepo = {
  list: () => DocumentTemplate.find().limit(200),
  create: (data) => DocumentTemplate.create(data),
  updateById: (id, data) => DocumentTemplate.findByIdAndUpdate(id, data, { new: true }),
  deleteById: (id) => DocumentTemplate.findByIdAndDelete(id),
};

