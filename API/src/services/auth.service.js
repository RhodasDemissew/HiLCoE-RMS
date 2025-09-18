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
  },
  async register(name, email, student_id) {
    const role = await roleRepo.findByName('Researcher');
    if (!role) throw new Error('Role not configured');
    const crypto = await import('crypto');
    const token = crypto.randomBytes(24).toString('hex');
    const { User } = await import('../models/User.js');
    const lower = String(email).toLowerCase();
    const existing = await userRepo.findByEmail(lower);
    if (existing) throw new Error('Email already registered');
    const user = await User.create({
      name,
      email: lower,
      role: role._id,
      status: 'pending',
      student_id: student_id || '',
      activation_token: token,
      password: null,
    });
    return { id: user._id, status: user.status, activation_token: token };
  },
  async requestReset(email) {
    const { User } = await import('../models/User.js');
    const lower = String(email).toLowerCase();
    const user = await User.findOne({ email: lower });
    if (user) {
      const crypto = await import('crypto');
      const token = crypto.randomBytes(24).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      user.reset_token = token;
      user.reset_expires_at = expires;
      await user.save();
      return { ok: true, reset_token: token, expires_at: expires.toISOString() };
    }
    return { ok: true };
  },
  async resetPassword(token, password) {
    const { User } = await import('../models/User.js');
    const now = new Date();
    const user = await User.findOne({ reset_token: token, reset_expires_at: { $gt: now } });
    if (!user) throw new Error('Invalid or expired token');
    user.password = hashPassword(password);
    user.reset_token = null;
    user.reset_expires_at = null;
    await user.save();
    return { ok: true };
  }
};
