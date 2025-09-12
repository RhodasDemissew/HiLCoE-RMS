import { userRepo, roleRepo } from '../repositories/user.repository.js';

export const usersService = {
  async list() {
    const users = await userRepo.list();
    return users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role?.name, status: u.status }));
  },
  async create({ name, email, roleName }) {
    const role = await roleRepo.findByName(roleName);
    if (!role) throw new Error('Invalid role');
    const u = await userRepo.create({ name, email: String(email).toLowerCase(), role: role._id, status: 'inactive' });
    return { id: u._id };
  }
};

