import { templateRepo } from '../repositories/template.repository.js';

export const templatesService = {
  list: () => templateRepo.list(),
  create: ({ type, version, url }) => templateRepo.create({ type, version, url }),
  update: (id, { type, version, url }) => templateRepo.updateById(id, { type, version, url }),
  remove: (id) => templateRepo.deleteById(id),
};

