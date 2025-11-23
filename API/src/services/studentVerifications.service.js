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

    // Enrich with User data (like Research Stats does) to get updated names
    const { User } = await import('../models/User.js');
    const { Role } = await import('../models/Role.js');
    
    // Get all student_ids from the items
    const studentIds = items.map(item => item.student_id).filter(Boolean);
    
    // Find Users by student_verification reference OR by student_id matching
    // This ensures we find Users even if the reference is missing
    let linkedUsers = [];
    if (studentIds.length > 0) {
      // First try by student_verification reference
      const verificationIds = items.map(item => item._id);
      const usersByRef = verificationIds.length > 0
        ? await User.find({ student_verification: { $in: verificationIds } })
            .select('_id name email first_name middle_name last_name student_verification student_id')
        : [];
      
      // Also find by student_id (case-insensitive matching)
      // Get Researcher role to filter properly
      const researcherRole = await Role.findOne({ name: /researcher/i });
      const usersByStudentId = researcherRole && studentIds.length > 0
        ? await User.find({ 
            role: researcherRole._id, 
            $or: studentIds.map(id => ({ 
              student_id: { $regex: `^${escapeRegExp(id)}$`, $options: 'i' } 
            }))
          }).select('_id name email first_name middle_name last_name student_verification student_id')
        : [];
      
      // Combine and deduplicate by User _id
      const userMapById = new Map();
      [...usersByRef, ...usersByStudentId].forEach(user => {
        if (!userMapById.has(String(user._id))) {
          userMapById.set(String(user._id), user);
        }
      });
      linkedUsers = Array.from(userMapById.values());
    }
    
    // Create a map of verification ID -> User
    const userMap = new Map();
    linkedUsers.forEach(user => {
      if (user.student_verification) {
        userMap.set(String(user.student_verification), user);
      }
    });
    
    // Also create a map by student_id (case-insensitive) - this is the key fallback
    const userByStudentId = new Map();
    linkedUsers.forEach(user => {
      if (user.student_id) {
        userByStudentId.set(String(user.student_id).toLowerCase().trim(), user);
      }
    });

    // Also enrich supervisor names - get all unique supervisor IDs
    const supervisorIds = new Set();
    items.forEach(item => {
      if (item.assigned_supervisor?.supervisor_id) {
        supervisorIds.add(String(item.assigned_supervisor.supervisor_id));
      }
    });
    
    // Fetch supervisor Users and Supervisor documents
    const supervisorUsers = Array.from(supervisorIds).length > 0
      ? await User.find({ _id: { $in: Array.from(supervisorIds) } })
          .select('_id name email first_name middle_name last_name')
      : [];
    
    const { Supervisor } = await import('../models/Supervisor.js');
    const supervisorDocs = Array.from(supervisorIds).length > 0
      ? await Supervisor.find({ _id: { $in: Array.from(supervisorIds) } })
          .populate('user', 'name email first_name middle_name last_name')
      : [];
    
    // Create maps for supervisors
    const supervisorUserMap = new Map();
    supervisorUsers.forEach(user => {
      supervisorUserMap.set(String(user._id), user);
    });
    
    const supervisorDocMap = new Map();
    supervisorDocs.forEach(doc => {
      supervisorDocMap.set(String(doc._id), doc);
      // Also map by user ID if Supervisor document has a linked user
      if (doc.user) {
        supervisorUserMap.set(String(doc.user._id), doc.user);
        supervisorUserMap.set(String(doc._id), doc.user); // Map Supervisor doc ID to User
      }
    });

    // Enrich items with User data - prefer User name if available
    const enrichedItems = items.map(item => {
      const itemObj = item.toObject();
      const linkedUser = userMap.get(String(item._id)) || 
                        userByStudentId.get(String(item.student_id || '').toLowerCase());
      
      let enrichedItem = { ...itemObj };
      
      if (linkedUser) {
        // Use User's 'name' field for display (contains updated name from settings)
        // Keep first_name/last_name from StudentVerification for verification purposes
        enrichedItem = {
          ...enrichedItem,
          // Keep original StudentVerification first/middle/last_name for verification
          // But add display_name from User.name for frontend display
          user: {
            id: linkedUser._id,
            name: linkedUser.name || '',
            email: linkedUser.email,
          },
          // Add display_name field from User.name - this is what frontend should use
          display_name: linkedUser.name || '',
        };
      }
      
      // Enrich assigned_supervisor name with User data if available
      if (enrichedItem.assigned_supervisor?.supervisor_id) {
        const supervisorId = String(enrichedItem.assigned_supervisor.supervisor_id);
        const supervisorUser = supervisorUserMap.get(supervisorId);
        const supervisorDoc = supervisorDocMap.get(supervisorId);
        
        if (supervisorUser) {
          enrichedItem.assigned_supervisor = {
            ...enrichedItem.assigned_supervisor,
            supervisor_name: supervisorUser.name || enrichedItem.assigned_supervisor.supervisor_name,
            supervisor_email: supervisorUser.email || enrichedItem.assigned_supervisor.supervisor_email,
          };
        } else if (supervisorDoc) {
          // Fallback to Supervisor document name
          const supervisorName = [
            supervisorDoc.first_name,
            supervisorDoc.middle_name,
            supervisorDoc.last_name
          ].filter(Boolean).join(' ');
          
          if (supervisorName) {
            enrichedItem.assigned_supervisor = {
              ...enrichedItem.assigned_supervisor,
              supervisor_name: supervisorName,
              supervisor_email: supervisorDoc.email || enrichedItem.assigned_supervisor.supervisor_email,
            };
          }
        }
      }
      
      return enrichedItem;
    });

    return {
      page: safePage,
      limit: safeLimit,
      total,
      items: enrichedItems,
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
