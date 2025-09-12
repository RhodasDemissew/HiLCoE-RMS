import { ExtensionRequest } from '../models/ExtensionRequest.js';

export const extensionRepo = {
  create: (data) => ExtensionRequest.create(data),
  findByIdAndUpdate: (id, update) => ExtensionRequest.findByIdAndUpdate(id, update, { new: true }),
};

