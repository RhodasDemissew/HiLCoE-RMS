import { StudentVerification } from '../models/StudentVerification.js';

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeString(value, { required = false } = {}) {
  const normalized = (value ?? '').toString().trim();
  if (required && !normalized) throw new Error('This field is required');
  return normalized;
}

function normalizeEntry(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid payload');
  const studentId = normalizeString(payload.student_id ?? payload.studentId, { required: true });
  const firstName = normalizeString(payload.first_name ?? payload.firstName, { required: true });
  const middleName = normalizeString(payload.middle_name ?? payload.middleName ?? '');
  const lastName = normalizeString(payload.last_name ?? payload.lastName, { required: true });
  const program = normalizeString(payload.program ?? payload.department ?? '');
  return {
    student_id: studentId,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    program,
  };
}

async function checkExistingByStudentId(studentId) {
  const query = { student_id: { $regex: `^${escapeRegExp(studentId)}$`, $options: 'i' } };
  return StudentVerification.findOne(query);
}

export const studentVerificationsService = {
  async list({ page = 1, limit = 25, search = '' } = {}) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;
    const filter = {};
    const safeSearch = normalizeString(search || '');
    if (safeSearch) {
      const regex = new RegExp(escapeRegExp(safeSearch), 'i');
      filter.$or = [
        { first_name: regex },
        { middle_name: regex },
        { last_name: regex },
        { student_id: regex },
        { program: regex },
      ];
    }

    const [items, total] = await Promise.all([
      StudentVerification.find(filter).sort({ created_at: -1 }).skip(skip).limit(safeLimit),
      StudentVerification.countDocuments(filter),
    ]);

    return {
      page: safePage,
      limit: safeLimit,
      total,
      items,
    };
  },

  async create(payload) {
    const entry = normalizeEntry(payload);
    const existing = await checkExistingByStudentId(entry.student_id);
    if (existing) throw new Error('Student ID already exists');
    const doc = await StudentVerification.create(entry);
    return doc;
  },

  async update(id, payload) {
    if (!id) throw new Error('Missing record id');
    const entry = normalizeEntry(payload);
    const doc = await StudentVerification.findById(id);
    if (!doc) throw new Error('Record not found');

    const incomingId = entry.student_id.toLowerCase();
    const currentId = doc.student_id.toLowerCase();
    if (incomingId !== currentId) {
      const existing = await checkExistingByStudentId(entry.student_id);
      if (existing) throw new Error('Student ID already exists');
    }

    doc.student_id = entry.student_id;
    doc.first_name = entry.first_name;
    doc.middle_name = entry.middle_name;
    doc.last_name = entry.last_name;
    doc.program = entry.program;
    await doc.save();
    return doc;
  },

  async remove(id) {
    if (!id) throw new Error('Missing record id');
    const doc = await StudentVerification.findByIdAndDelete(id);
    if (!doc) throw new Error('Record not found');
    return { ok: true };
  },

  async bulkImport(rawEntries = []) {
    if (!Array.isArray(rawEntries)) throw new Error('Entries must be an array');
    const errors = [];
    const sanitized = [];
    const seen = new Set();

    rawEntries.forEach((raw, index) => {
      try {
        const entry = normalizeEntry(raw);
        const key = entry.student_id.toLowerCase();
        if (seen.has(key)) {
          errors.push({ index, student_id: entry.student_id, error: 'Duplicate student ID in file' });
          return;
        }
        seen.add(key);
        sanitized.push({ entry, index });
      } catch (err) {
        errors.push({ index, error: err.message || 'Invalid row' });
      }
    });

    if (!sanitized.length) {
      return { inserted: 0, duplicates: [], errors, processed: rawEntries.length };
    }

    const conflictChecks = await Promise.all(
      sanitized.map(async ({ entry }) => ({ entry, exists: await checkExistingByStudentId(entry.student_id) }))
    );

    const duplicates = conflictChecks
      .filter((item) => item.exists)
      .map(({ entry }) => entry.student_id);

    const toInsert = conflictChecks
      .filter((item) => !item.exists)
      .map((item) => item.entry);

    let inserted = 0;
    if (toInsert.length) {
      try {
        const insertedDocs = await StudentVerification.insertMany(toInsert, { ordered: false });
        inserted = insertedDocs.length;
      } catch (err) {
        if (err?.writeErrors?.length) {
          err.writeErrors.forEach((writeError) => {
            const studentId = writeError.err?.op?.student_id;
            if (studentId) duplicates.push(studentId);
          });
        } else {
          throw err;
        }
      }
    }

    const uniqueDuplicates = [...new Set(duplicates.map((value) => value.toString()))];

    return {
      inserted,
      duplicates: uniqueDuplicates,
      errors,
      processed: rawEntries.length,
    };
  },
};
