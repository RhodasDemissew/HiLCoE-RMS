import { User } from '../models/User.js';
import { Role } from '../models/Role.js';

export const userRepo = {
  findByEmail: (email) => User.findOne({ email }).populate('role'),
  findById: (id) => User.findById(id).populate('role'),
  list: () => User.find().populate('role').limit(200),
  create: (data) => User.create(data),
};

export const roleRepo = {
  findByName: (name) => Role.findOne({ name }),
};

