import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { Feedback } from '../models/Feedback.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hilcoe_rms';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to DB for seeding');

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
  console.log('✅ Roles ensured:', allRoles.map(r => r.name));

  const roleMap = {};
  allRoles.forEach(r => roleMap[r.name] = r._id);

  // Users
  if (await User.countDocuments() === 0) {
    await User.create([
      { name: 'Admin User', email: 'admin@hilcoe.local', role: roleMap['Admin'] },
      { name: 'Advisor Alice', email: 'advisor@hilcoe.local', role: roleMap['Advisor'] },
      { name: 'Coordinator Carl', email: 'coordinator@hilcoe.local', role: roleMap['Coordinator'] },
      { name: 'Researcher Raya', email: 'researcher@hilcoe.local', role: roleMap['Researcher'] },
    ]);
    console.log('✅ Seeded initial users');
  } else {
    console.log('ℹ️ Users already exist');
  }

  // Feedback (one sample)
  const admin = await User.findOne({ email: 'admin@hilcoe.local' });
  if (admin && !await Feedback.findOne({ subject: 'Welcome feedback' })) {
    await Feedback.create({
      subject: 'Welcome feedback',
      message: 'Starter feedback to verify the pipeline works. Replace me with real data.',
      created_by: admin._id
    });
    console.log('✅ Inserted sample feedback');
  } else {
    console.log('ℹ️ Sample feedback already exists or admin missing');
  }

  await mongoose.disconnect();
  console.log('🌱 Seeding complete');
}

main().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});