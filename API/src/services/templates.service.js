import { templateRepo } from '../repositories/template.repository.js';

export const templatesService = {
  list: () => templateRepo.list(),
  create: ({ type, version, url }) => templateRepo.create({ type, version, url })
};

