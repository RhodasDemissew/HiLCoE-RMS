import { userRepo, roleRepo } from '../repositories/user.repository.js';
import { studentVerificationRepo } from '../repositories/studentVerification.repository.js';
import { hashPassword, verifyPassword, signJWT } from '../utils/crypto.js';
import { config } from '../config/env.js';
import { sendMail } from './mailer.js';
import { projectsService } from './projects.service.js';

const VERIFY_TOKEN_WINDOW_MINUTES = 30;

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function namesMatch(record, payload) {
  const firstMatch = normalize(record.first_name) === normalize(payload.first_name);
  const lastMatch = normalize(record.last_name) === normalize(payload.last_name);
  const middleRecord = normalize(record.middle_name);
  const middlePayload = normalize(payload.middle_name || '');
  const middleMatch = !middleRecord || middleRecord === middlePayload;
  return firstMatch && lastMatch && middleMatch;
}

export const authService = {
  async login(email, password, rememberMe = false) {
    const user = await userRepo.findByEmail(String(email).toLowerCase());
    if (!user || !user.password) throw new Error('Invalid credentials');
    const ok = verifyPassword(password, user.password);
    if (!ok) throw new Error('Invalid credentials');
    if (user.status !== 'active') throw new Error('Account inactive');
    // If remember me is checked, extend token to 30 days (2592000 seconds), otherwise 8 hours (28800 seconds)
    const expiresIn = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
    const token = signJWT({ sub: String(user._id), role: user.role?.name }, config.jwtSecret, expiresIn);
    return { token, user: { id: user._id, email: user.email, name: user.name, role: user.role?.name } };
  },

  async verifyStudent({ first_name, middle_name = '', last_name, student_id }) {
    const record = await studentVerificationRepo.findByStudentId(student_id);
    if (!record) throw new Error('Student record not found');
    if (!namesMatch(record, { first_name, middle_name, last_name })) {
      throw new Error('Provided details do not match our records');
    }

    const alreadyRegistered = Boolean(record.verified_email);
    const student = {
      first_name: record.first_name,
      middle_name: record.middle_name,
      last_name: record.last_name,
      student_id: record.student_id,
      program: record.program,
      already_registered: alreadyRegistered,
      verified_email: record.verified_email,
    };

    if (alreadyRegistered) {
      return {
        verification_token: null,
        expires_at: null,
        login_hint: record.verified_email,
        already_registered: true,
        student,
      };
    }

    const crypto = await import('crypto');
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_WINDOW_MINUTES * 60 * 1000);
    await studentVerificationRepo.markToken(record, token, expiresAt);

    return {
      verification_token: token,
      expires_at: expiresAt.toISOString(),
      login_hint: null,
      already_registered: false,
      student,
    };
  },

  async register({ verification_token, email, phone = '', password }) {
    const record = await studentVerificationRepo.findByToken(verification_token);
    if (!record) throw new Error('Invalid or expired verification token');
    if (!record.signup_token_expires_at || record.signup_token_expires_at < new Date()) {
      throw new Error('Verification token expired');
    }

    const normalizedEmail = String(email).toLowerCase();
    const existingEmailUser = await userRepo.findByEmail(normalizedEmail);
    if (existingEmailUser) throw new Error('Email already registered');

    const { User } = await import('../models/User.js');
    const existingStudent = await User.findOne({ student_id: record.student_id });
    if (existingStudent) throw new Error('Student already registered');

    const role = await roleRepo.findByName('Researcher');
    if (!role) throw new Error('Role not configured');

    const passwordHash = hashPassword(password);
    const fullName = [record.first_name, record.middle_name, record.last_name].filter(Boolean).join(' ');

    const user = await User.create({
      first_name: record.first_name,
      middle_name: record.middle_name,
      last_name: record.last_name,
      name: fullName,
      email: normalizedEmail,
      phone,
      role: role._id,
      status: 'active',
      student_id: record.student_id,
      student_verification: record._id,
      password: passwordHash,
      verified_at: new Date(),
    });

    await studentVerificationRepo.markVerified(record, normalizedEmail);

    // Auto-create a default project for the newly registered researcher so they appear in scheduling
    try {
      await projectsService.create({
        title: 'Research Project',
        area: record.program || '',
        semester: record.semester || undefined,
      }, user._id);
    } catch (e) {
      // Non-fatal; coordinator can still create later
      console.warn('auto-create project failed:', e?.message);
    }

    const roleName = role.name;
    const token = signJWT({ sub: String(user._id), role: roleName }, config.jwtSecret, 60 * 60 * 8);
    return { token, user: { id: user._id, email: user.email, name: user.name, role: roleName } };
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
      const link = `${config.appBaseUrl.replace(/\/$/, '')}/reset?token=${encodeURIComponent(token)}`;
      try {
        await sendMail({
          to: user.email,
          subject: 'HiLCoE RMS – Set your password',
          text: `Use the link to set your password: ${link} (expires in 60 minutes)`,
          html: `<p>Hello ${user.name || ''},</p><p>Click the link below to set your password. This link expires in 60 minutes.</p><p><a href="${link}">Set Password</a></p><p>If the link doesn't work, copy and paste this URL into your browser:</p><p>${link}</p>`,
        });
      } catch (e) {
        console.warn('sendMail failed', e?.message);
      }
      return { ok: true, reset_token: config.nodeEnv === 'development' ? token : undefined, link: config.nodeEnv === 'development' ? link : undefined, expires_at: expires.toISOString() };
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
