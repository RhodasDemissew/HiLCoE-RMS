// Mongo prep script for verification-first auth (researcher roster only).
const dbName = 'hilcoe_rms';
const roster = [
  { student_id: 'RMS2025-001', first_name: 'Rhea', middle_name: '', last_name: 'Researcher', program: 'Software Engineering' },
  { student_id: 'RMS2025-002', first_name: 'Helena', middle_name: 'S.', last_name: 'Bekele', program: 'Computer Science' },
  { student_id: 'RMS2025-003', first_name: 'Jonas', middle_name: 'A.', last_name: 'Worku', program: 'Information Systems' },
  { student_id: 'RMS2025-004', first_name: 'Marta', middle_name: '', last_name: 'Tesfaye', program: 'Software Engineering' },
  { student_id: 'RMS2025-005', first_name: 'Samuel', middle_name: 'K.', last_name: 'Wolde', program: 'Computer Science' },
  { student_id: 'RMS2025-006', first_name: 'Lulit', middle_name: 'G.', last_name: 'Mengistu', program: 'Information Systems' },
  { student_id: 'RMS2025-007', first_name: 'Eyob', middle_name: '', last_name: 'Hailu', program: 'Software Engineering' },
  { student_id: 'RMS2025-008', first_name: 'Selam', middle_name: 'T.', last_name: 'Kidane', program: 'Computer Science' },
  { student_id: 'RMS2025-009', first_name: 'Nahom', middle_name: '', last_name: 'Abera', program: 'Information Systems' },
  { student_id: 'RMS2025-010', first_name: 'Hermela', middle_name: 'M.', last_name: 'Fekadu', program: 'Software Engineering' }
];

const now = new Date();
const targetDb = db.getSiblingDB(dbName);

function ensureIndex(coll, keys, options = {}) {
  const serialized = JSON.stringify(keys);
  const existing = coll.getIndexes().find((idx) => JSON.stringify(idx.key) === serialized);
  if (!existing) {
    coll.createIndex(keys, options);
  }
}

if (!targetDb.getCollectionNames().includes('student_verifications')) {
  targetDb.createCollection('student_verifications');
  print('➕ created student_verifications collection');
}

// Hard reset researcher verification roster
ensureIndex(targetDb.student_verifications, { student_id: 1 }, { unique: true, name: 'ux_student_verifications_student_id' });
targetDb.student_verifications.deleteMany({});
targetDb.student_verifications.insertMany(roster.map((student) => ({
  ...student,
  verified_email: null,
  verified_at: null,
  signup_token: null,
  signup_token_expires_at: null,
  created_at: now,
  updated_at: now,
})));

ensureIndex(targetDb.users, { email: 1 }, { unique: true, name: 'ux_users_email' });

print(`✅ student_verifications count: ${targetDb.student_verifications.countDocuments()}`);
