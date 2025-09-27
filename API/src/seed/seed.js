import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/crypto.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('Set MONGO_URI in your environment before running the seed script');
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB for seeding');

  // Roles
  const roles = [
    { name: 'Admin', description: 'System administrator' },
    { name: 'Coordinator', description: 'Coordinates research activities' },
    { name: 'Advisor', description: 'Advises researchers' },
    { name: 'Examiner', description: 'Evaluates defenses, grading' },
    { name: 'Researcher', description: 'Conducts research' },
  ];

  for (const r of roles) {
    await Role.updateOne({ name: r.name }, { $setOnInsert: r }, { upsert: true });
  }
  const allRoles = await Role.find();
  console.log('Roles ensured:', allRoles.map(r => r.name));

  const roleMap = {};
  allRoles.forEach(r => roleMap[r.name] = r._id);

  // Ensure Admin user with default password (change after first login!)
  const adminEmail = 'admin@hilcoe.local';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const pwd = hashPassword('admin123');
    admin = await User.create({
      first_name: 'Admin',
      middle_name: '',
      last_name: 'User',
      name: 'Admin User',
      email: adminEmail,
      role: roleMap['Admin'],
      status: 'active',
      phone: '',
      student_id: 'ADMIN-000',
      password: pwd,
      verified_at: new Date(),
    });
    console.log('Seeded admin user admin@hilcoe.local / admin123');
  } else {
    admin.first_name ||= 'Admin';
    admin.last_name ||= 'User';
    admin.name = [admin.first_name, admin.middle_name, admin.last_name].filter(Boolean).join(' ') || 'Admin User';
    admin.role = roleMap['Admin'];
    admin.status = 'active';
    if (!admin.password) {
      admin.password = hashPassword('admin123');
      console.log('Admin password reset to default (change immediately).');
    }
    await admin.save();
    console.log('Admin user already exists');
  }

  await mongoose.disconnect();
  console.log('Seeding complete');
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
