import { User } from '../models/User.js';
import { Role } from '../models/Role.js';

export const userRepo = {
  findByEmail: (email) => User.findOne({ email }).populate('role'),
  findById: (id) => User.findById(id).populate('role'),
  list: () => User.find().populate('role').limit(200),
  create: (data) => User.create(data),
  updateById: (id, data) => User.findByIdAndUpdate(id, data, { new: true }).populate('role'),
  findActiveByRoleName: async (roleName) => {
    const role = await Role.findOne({ name: roleName });
    if (!role) return [];
    return User.find({ role: role._id, status: 'active' }).populate('role');
  },
};

export const roleRepo = {
  findByName: (name) => Role.findOne({ name }),
};

