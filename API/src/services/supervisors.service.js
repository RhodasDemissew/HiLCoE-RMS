import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { StudentVerification } from '../models/StudentVerification.js';
import { Supervisor } from '../models/Supervisor.js';
import { config } from '../config/env.js';
import { notify } from './notificationService.js';

const DEFAULT_SPECIALIZATIONS = ['AI/ML','Data Science','Networks','Cybersecurity','SE','DB','HCI'];

function formatSupervisorName(first = '', middle = '', last = '') {
  return [first, middle, last].filter((part) => part && part.trim()).join(' ').trim();
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

function normalizeString(value, { required = false } = {}) {
  const normalized = (value ?? '').toString().trim();
  if (required && !normalized) throw new Error('This field is required');
  return normalized;
}

function normalizeEmail(value) {
  const email = normalizeString(value, { required: true }).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error('Invalid email address');
  return email;
}

function normalizeSpecializations(values = []) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => (item || '').toString().trim())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, ' '));
}

async function ensureSupervisorRole() {
  let role = await Role.findOne({ name: /supervisor/i });
  if (!role) {
    role = await Role.create({ name: 'Supervisor', description: 'Supervisor' });
  }
  return role;
}

function buildUserName(entry) {
  return [entry.first_name, entry.middle_name, entry.last_name]
    .filter((part) => part && part.trim())
    .join(' ')
    .trim();
}

async function syncSupervisorUser(entry, existingSupervisor = null) {
  const role = await ensureSupervisorRole();
  let user = null;
  if (existingSupervisor?.user) {
    user = await User.findById(existingSupervisor.user);
  }
  if (!user) {
    user = await User.findOne({ email: entry.email });
  }
  if (user) {
    if (user.email !== entry.email) {
      const other = await User.findOne({ email: entry.email });
      if (other && String(other._id) !== String(user._id)) {
        throw new Error('Email already exists');
      }
      user.email = entry.email;
    }
  } else {
    user = new User({ email: entry.email });
  }
  user.first_name = entry.first_name;
  user.middle_name = entry.middle_name;
  user.last_name = entry.last_name;
  user.name = buildUserName(entry);
  user.status = 'active';
  user.role = role._id;
  await user.save();
  return user;
}

function buildSupervisorPayload(payload = {}) {
  const firstName = normalizeString(payload.firstName ?? payload.first_name, { required: true });
  const middleName = normalizeString(payload.middleName ?? payload.middle_name ?? '');
  const lastName = normalizeString(payload.lastName ?? payload.last_name, { required: true });
  const email = normalizeEmail(payload.email);
  const supervisorId = normalizeString(payload.supervisorId ?? payload.supervisor_id, { required: true });
  const specializationInput = payload.specializations ?? payload.specialization ?? [];
  const specializations = Array.isArray(specializationInput)
    ? normalizeSpecializations(specializationInput)
    : normalizeSpecializations((specializationInput || '').split(/[,|]/));

  if (!specializations.length) throw new Error('At least one specialization is required');

  return {
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    email,
    supervisor_id: supervisorId,
    specializations,
  };
}

export const supervisorsService = {
  async listForAssignment() {
    const role = await Role.findOne({ name: /supervisor/i });
    const users = role
      ? await User.find({ role: role._id, status: 'active' })
          .sort({ name: 1 })
          .select('name email role')
      : [];
    const supervisorsFromUsers = users.map(sanitizeUser);

    const supervisorsFromCollection = await Supervisor.find({})
      .sort({ created_at: -1 })
      .select('first_name middle_name last_name email user');

    // Deduplicate by email first to avoid duplicates across User and Supervisor collections
    const byEmail = new Map();

    const pushUnique = (entry) => {
      if (!entry || !entry.email) return;
      const emailKey = String(entry.email).toLowerCase();
      if (byEmail.has(emailKey)) return;
      byEmail.set(emailKey, entry);
    };

    supervisorsFromUsers.forEach((item) => {
      pushUnique({ id: String(item.id), name: item.name, email: item.email });
    });

    supervisorsFromCollection.forEach((doc) => {
      if (!doc?.email) return;
      const id = String(doc.user || doc._id);
      pushUnique({ id, name: formatSupervisorName(doc.first_name, doc.middle_name, doc.last_name), email: doc.email });
    });

    const list = Array.from(byEmail.values());

    // Capacity filtering: remove supervisors who already reached max supervisees
    try {
      const counters = await StudentVerification.aggregate([
        { $match: { 'assigned_supervisor.supervisor_id': { $ne: null } } },
        { $group: { _id: '$assigned_supervisor.supervisor_id', count: { $sum: 1 } } },
      ]);
      const countMap = new Map(counters.map((c) => [String(c._id), c.count]));
      const max = Math.max(parseInt(config.supervisorMaxStudents || 10, 10), 1);
      return list.filter((s) => (countMap.get(String(s.id)) || 0) < max);
    } catch {
      // On failure, fall back to unfiltered list so UI still works, server will enforce on assign
      return list;
    }
  },

  async assign({ studentId, supervisorId, actorId = null }) {
    if (!studentId) throw new Error('studentId is required');
    if (!supervisorId) throw new Error('supervisorId is required');

    const student = await StudentVerification.findById(studentId);
    if (!student) throw new Error('Student not found');

    // If already assigned to the same supervisor, keep as-is
    const existingId = student.assigned_supervisor?.supervisor_id ? String(student.assigned_supervisor.supervisor_id) : '';
    const targetId = String(supervisorId);
    if (existingId && existingId === targetId) {
      return student;
    }

    // Enforce capacity before assigning
    const max = Math.max(parseInt(config.supervisorMaxStudents || 10, 10), 1);
    const currentCount = await StudentVerification.countDocuments({ 'assigned_supervisor.supervisor_id': supervisorId });
    if (currentCount >= max) {
      throw new Error(`Supervisor has reached the maximum of ${max} researchers`);
    }

    const userSupervisor = await User.findById(supervisorId).select('name email');
    const actor = actorId ? await User.findById(actorId).select('name') : null;
    if (userSupervisor) {
      student.assigned_supervisor = {
        supervisor_id: userSupervisor._id,
        supervisor_name: userSupervisor.name,
        supervisor_email: userSupervisor.email,
      };
      await student.save();
      try { await notify(userSupervisor._id, 'student_assigned', { studentId: String(student._id), name: `${student.first_name} ${student.last_name}`, actor_id: actorId, actor_name: actor?.name || '' }); } catch {}
      return student;
    }

    const docSupervisor = await Supervisor.findById(supervisorId);
    if (!docSupervisor) throw new Error('Supervisor not found');

    student.assigned_supervisor = {
      supervisor_id: docSupervisor._id,
      supervisor_name: formatSupervisorName(
        docSupervisor.first_name,
        docSupervisor.middle_name,
        docSupervisor.last_name
      ),
      supervisor_email: docSupervisor.email,
    };

    await student.save();
    if (docSupervisor.user) {
      try { await notify(docSupervisor.user, 'student_assigned', { studentId: String(student._id), name: `${student.first_name} ${student.last_name}`, actor_id: actorId, actor_name: actor?.name || '' }); } catch {}
    }
    return student;
  },

  async unassign({ studentId, actorId = null }) {
    if (!studentId) throw new Error('studentId is required');
    const student = await StudentVerification.findById(studentId);
    if (!student) throw new Error('Student not found');
    const prev = student.assigned_supervisor;
    student.assigned_supervisor = null;
    await student.save();
    if (prev?.supervisor_id) {
      const actor = actorId ? await User.findById(actorId).select('name') : null;
      try { await notify(prev.supervisor_id, 'student_unassigned', { studentId: String(student._id), name: `${student.first_name} ${student.last_name}`, actor_id: actorId, actor_name: actor?.name || '' }); } catch {}
    }
    return student;
  },

  async listSupervisors({ search = '', page = 1, limit = 25 } = {}) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;
    const filter = {};
    const trimmedSearch = normalizeString(search);
    if (trimmedSearch) {
      const regex = new RegExp(trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { first_name: regex },
        { middle_name: regex },
        { last_name: regex },
        { email: regex },
        { supervisor_id: regex },
        { specializations: regex },
      ];
    }

    const [items, total] = await Promise.all([
      Supervisor.find(filter).sort({ created_at: -1 }).skip(skip).limit(safeLimit),
      Supervisor.countDocuments(filter),
    ]);

    return {
      page: safePage,
      limit: safeLimit,
      total,
      items,
    };
  },

  async createSupervisor(payload) {
    const entry = buildSupervisorPayload(payload);
    const [existingEmail, existingId] = await Promise.all([
      Supervisor.findOne({ email: entry.email }),
      Supervisor.findOne({ supervisor_id: entry.supervisor_id }),
    ]);
    if (existingEmail) throw new Error('Email already exists');
    if (existingId) throw new Error('Supervisor ID already exists');
    const user = await syncSupervisorUser(entry);
    const doc = await Supervisor.create({ ...entry, user: user._id });
    return doc;
  },

  async updateSupervisor(id, payload) {
    if (!id) throw new Error('Missing supervisor id');
    const entry = buildSupervisorPayload(payload);
    const supervisor = await Supervisor.findById(id);
    if (!supervisor) throw new Error('Supervisor not found');

    if (entry.email !== supervisor.email) {
      const duplicateEmail = await Supervisor.findOne({ email: entry.email });
      if (duplicateEmail && String(duplicateEmail._id) !== String(supervisor._id)) {
        throw new Error('Email already exists');
      }
    }

    if (entry.supervisor_id !== supervisor.supervisor_id) {
      const duplicateId = await Supervisor.findOne({ supervisor_id: entry.supervisor_id });
      if (duplicateId && String(duplicateId._id) !== String(supervisor._id)) {
        throw new Error('Supervisor ID already exists');
      }
    }

    const user = await syncSupervisorUser(entry, supervisor);
    supervisor.first_name = entry.first_name;
    supervisor.middle_name = entry.middle_name;
    supervisor.last_name = entry.last_name;
    supervisor.email = entry.email;
    supervisor.supervisor_id = entry.supervisor_id;
    supervisor.specializations = entry.specializations;
    supervisor.user = user._id;
    await supervisor.save();
    return supervisor;
  },

  async deleteSupervisor(id) {
    if (!id) throw new Error('Missing supervisor id');
    const doc = await Supervisor.findByIdAndDelete(id);
    if (!doc) throw new Error('Supervisor not found');

    if (doc.user) {
      const other = await Supervisor.findOne({ user: doc.user });
      if (!other) {
        await User.findByIdAndDelete(doc.user).catch(() => {});
      }
    }

    return { ok: true };
  },

  async importSupervisors(entries = [], { mode = 'strict' } = {}) {
    if (!Array.isArray(entries) || !entries.length) {
      throw new Error('Import payload is empty');
    }
    const normalized = [];
    const errors = [];
    const seenEmails = new Set();
    const seenIds = new Set();

    entries.forEach((row, index) => {
      try {
        const entry = buildSupervisorPayload(row);
        const emailKey = entry.email;
        const idKey = entry.supervisor_id.toLowerCase();
        if (seenEmails.has(emailKey) || seenIds.has(idKey)) {
          throw new Error('Duplicate entry in file');
        }
        seenEmails.add(emailKey);
        seenIds.add(idKey);
        normalized.push({ entry, index });
      } catch (err) {
        errors.push({ row: index + 2, reason: err.message || 'Invalid row' });
      }
    });

    if (!normalized.length) {
      return { ok: false, insertedCount: 0, skipped: errors };
    }

    const results = { ok: true, insertedCount: 0, skipped: [...errors], processed: entries.length };

    for (const { entry, index } of normalized) {
      const existingByEmail = await Supervisor.findOne({ email: entry.email });
      const existingById = await Supervisor.findOne({ supervisor_id: entry.supervisor_id });

      if (existingByEmail && existingByEmail.supervisor_id !== entry.supervisor_id) {
        results.skipped.push({ row: index + 2, reason: 'Email already exists' });
        continue;
      }
      if (existingById && existingById.email !== entry.email && mode !== 'upsert') {
        results.skipped.push({ row: index + 2, reason: 'Supervisor ID already exists' });
        continue;
      }

      if (existingById && mode === 'upsert') {
        const user = await syncSupervisorUser(entry, existingById);
        existingById.first_name = entry.first_name;
        existingById.middle_name = entry.middle_name;
        existingById.last_name = entry.last_name;
        existingById.email = entry.email;
        existingById.specializations = entry.specializations;
        existingById.user = user._id;
        await existingById.save();
        results.insertedCount += 1;
      } else if (!existingById && !existingByEmail) {
        const user = await syncSupervisorUser(entry);
        await Supervisor.create({ ...entry, user: user._id });
        results.insertedCount += 1;
      } else {
        results.skipped.push({ row: index + 2, reason: 'Duplicate supervisor' });
      }
    }

    return results;
  },

  async listSpecializations() {
    const existing = await Supervisor.distinct('specializations');
    const merged = new Set([...DEFAULT_SPECIALIZATIONS, ...existing.map((item) => item || '')]);
    return Array.from(merged).filter(Boolean).sort((a, b) => a.localeCompare(b));
  },
};

