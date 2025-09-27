import { userRepo, roleRepo } from '../repositories/user.repository.js';

export const usersService = {
  async list() {
    const users = await userRepo.list();
    return users.map(u => ({
      id: u._id,
      name: u.name,
      first_name: u.first_name,
      middle_name: u.middle_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      role: u.role?.name,
      status: u.status,
      student_id: u.student_id,
    }));
  },
  async create({ name, email, roleName }) {
    const role = await roleRepo.findByName(roleName);
    if (!role) throw new Error('Invalid role');
    const u = await userRepo.create({ name, email: String(email).toLowerCase(), role: role._id, status: 'inactive' });
    return { id: u._id };
  }
};
