import { userRepo, roleRepo } from '../repositories/user.repository.js';
import { hashPassword, verifyPassword, signJWT } from '../utils/crypto.js';
import { config } from '../config/env.js';

export const authService = {
  async login(email, password) {
    const user = await userRepo.findByEmail(String(email).toLowerCase());
    if (!user || !user.password) throw new Error('Invalid credentials');
    const ok = verifyPassword(password, user.password);
    if (!ok) throw new Error('Invalid credentials');
    if (user.status !== 'active') throw new Error('Account inactive');
    const token = signJWT({ sub: String(user._id), role: user.role?.name }, config.jwtSecret, 60 * 60 * 8);
    return { token, user: { id: user._id, email: user.email, name: user.name, role: user.role?.name } };
  },
  async invite(name, email, roleName) {
    const role = await roleRepo.findByName(roleName);
    if (!role) throw new Error('Invalid role');
    const crypto = await import('crypto');
    const token = crypto.randomBytes(24).toString('hex');
    const { User } = await import('../models/User.js');
    const user = await User.findOneAndUpdate(
      { email: String(email).toLowerCase() },
      { $set: { name, role: role._id, status: 'inactive', activation_token: token } },
      { upsert: true, new: true }
    );
    return { activation_token: user.activation_token };
  },
  async activate(token, password) {
    const { User } = await import('../models/User.js');
    const user = await User.findOne({ activation_token: token });
    if (!user) throw new Error('Invalid token');
    user.password = hashPassword(password);
    user.activation_token = null;
    user.status = 'active';
    await user.save();
    return { ok: true };
  }
};

