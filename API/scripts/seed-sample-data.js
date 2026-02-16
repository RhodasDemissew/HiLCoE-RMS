import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Role } from '../src/models/Role.js';
import { User } from '../src/models/User.js';
import { StudentVerification } from '../src/models/StudentVerification.js';
import { Supervisor } from '../src/models/Supervisor.js';
import { StageSubmission } from '../src/models/StageSubmission.js';
import { hashPassword } from '../src/utils/crypto.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('Set MONGO_URI in your environment before running the seed script');
}

// Sample data
const sampleStudents = [
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

const sampleSupervisors = [
  { first_name: 'Bukayo', middle_name: 'S', last_name: 'Saka', email: 'bukayo.saka@hilcoe.local', supervisor_id: 'SUP-001', specializations: ['AI/ML', 'Data Science'] },
  { first_name: 'Dr.', middle_name: '', last_name: 'Mesfin', email: 'dr.mesfin@hilcoe.local', supervisor_id: 'SUP-002', specializations: ['Networks', 'Cybersecurity'] },
  { first_name: 'Prof.', middle_name: 'A', last_name: 'Teshome', email: 'prof.teshome@hilcoe.local', supervisor_id: 'SUP-003', specializations: ['Software Engineering', 'HCI'] }
];

const stages = [
  'Synopsis',
  'Proposal', 
  'Progress Report 1',
  'Progress Report 2',
  'Thesis Report',
  'Final Draft (Pre-Defense)',
  'Final Draft (Post-Defense)',
  'Journal Article'
];

const statuses = ['under_review', 'awaiting_coordinator', 'needs_changes', 'approved', 'rejected'];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB for seeding');

  // Ensure roles exist
  const roles = [
    { name: 'Admin', description: 'System administrator' },
    { name: 'Coordinator', description: 'Coordinates research activities' },
    { name: 'Supervisor', description: 'Supervises researchers' },
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

  // Create admin user
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
  }

  // Create coordinator user
  const coordinatorEmail = 'coordinator@hilcoe.local';
  let coordinator = await User.findOne({ email: coordinatorEmail });
  if (!coordinator) {
    const pwd = hashPassword('coordinator123');
    coordinator = await User.create({
      first_name: 'Dr.',
      middle_name: '',
      last_name: 'Mesfin',
      name: 'Dr. Mesfin',
      email: coordinatorEmail,
      role: roleMap['Coordinator'],
      status: 'active',
      phone: '',
      password: pwd,
      verified_at: new Date(),
    });
    console.log('Seeded coordinator user coordinator@hilcoe.local / coordinator123');
  }

  // Create supervisors and their user accounts
  const createdSupervisors = [];
  for (const supData of sampleSupervisors) {
    let supervisor = await Supervisor.findOne({ email: supData.email });
    if (!supervisor) {
      // Create user account for supervisor
      const pwd = hashPassword('supervisor123');
      const user = await User.create({
        first_name: supData.first_name,
        middle_name: supData.middle_name,
        last_name: supData.last_name,
        name: `${supData.first_name} ${supData.middle_name} ${supData.last_name}`.trim(),
        email: supData.email,
        role: roleMap['Supervisor'],
        status: 'active',
        password: pwd,
        verified_at: new Date(),
      });

      supervisor = await Supervisor.create({
        ...supData,
        user: user._id
      });
      console.log(`Created supervisor: ${supData.first_name} ${supData.last_name}`);
    }
    createdSupervisors.push(supervisor);
  }

  // Create student verifications
  const createdStudents = [];
  for (const studentData of sampleStudents) {
    let student = await StudentVerification.findOne({ student_id: studentData.student_id });
    if (!student) {
      student = await StudentVerification.create(studentData);
      console.log(`Created student verification: ${studentData.first_name} ${studentData.last_name}`);
    }
    createdStudents.push(student);
  }

  // Assign students to supervisors
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const supervisor = createdSupervisors[i % createdSupervisors.length];
    
    if (!student.assigned_supervisor) {
      student.assigned_supervisor = {
        supervisor_id: supervisor.user,
        supervisor_name: `${supervisor.first_name} ${supervisor.last_name}`,
        supervisor_email: supervisor.email,
      };
      await student.save();
      console.log(`Assigned ${student.first_name} ${student.last_name} to ${supervisor.first_name} ${supervisor.last_name}`);
    }
  }

  // Create researcher user accounts for students
  const researcherUsers = [];
  for (const student of createdStudents) {
    let researcher = await User.findOne({ student_verification: student._id });
    if (!researcher) {
      const pwd = hashPassword('researcher123');
      researcher = await User.create({
        first_name: student.first_name,
        middle_name: student.middle_name,
        last_name: student.last_name,
        name: `${student.first_name} ${student.middle_name} ${student.last_name}`.trim(),
        email: `${student.student_id.toLowerCase()}@hilcoe.local`,
        role: roleMap['Researcher'],
        status: 'active',
        student_id: student.student_id,
        student_verification: student._id,
        password: pwd,
        verified_at: new Date(),
      });
      console.log(`Created researcher user: ${researcher.name}`);
    }
    researcherUsers.push(researcher);
  }

  // Create sample stage submissions
  const submissionTitles = {
    'Proposal': ['Research Proposal on Machine Learning', 'Software Engineering Proposal', 'Data Science Research Proposal'],
    'Progress Report 1': ['First Progress Report', 'Initial Research Progress', 'Mid-term Progress Report'],
    'Progress Report 2': ['Second Progress Report', 'Advanced Research Progress', 'Final Progress Report'],
    'Thesis Report': ['Master Thesis Report', 'Research Thesis Document', 'Final Thesis Submission'],
    'Final Draft (Pre-Defense)': ['Pre-Defense Draft', 'Final Draft Submission', 'Thesis Final Version'],
    'Final Draft (Post-Defense)': ['Post-Defense Revision', 'Final Corrected Draft', 'Thesis Final Version'],
    'Journal Article': ['Research Journal Article', 'Academic Paper Submission', 'Publication Draft']
  };

  let submissionCount = 0;
  for (const researcher of researcherUsers) {
    // Create 2-4 submissions per researcher
    const numSubmissions = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numSubmissions; i++) {
      const stageIndex = Math.floor(Math.random() * (stages.length - 1)) + 1; // Skip Synopsis (index 0)
      const stage = stages[stageIndex];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const titleOptions = submissionTitles[stage] || ['Research Document'];
      const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
      
      const submission = await StageSubmission.create({
        researcher: researcher._id,
        stage_index: stageIndex,
        stage_key: stage.toLowerCase().replace(/\s+/g, '_'),
        title: title,
        notes: `Sample submission for ${stage}`,
        status: status,
        file: {
          filename: `${stage.replace(/\s+/g, '_')}_${researcher.student_id}.pdf`,
          path: `/storage/submissions/${researcher.student_id}/${stage.replace(/\s+/g, '_')}.pdf`,
          mimetype: 'application/pdf',
          size: Math.floor(Math.random() * 5000000) + 1000000 // 1-6MB
        },
        submitted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        reviewed_at: status !== 'under_review' ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) : null,
        reviewer: status !== 'under_review' ? createdSupervisors[Math.floor(Math.random() * createdSupervisors.length)].user : null,
        decision_notes: status !== 'under_review' ? `Sample review notes for ${stage}` : '',
        version: 1,
        analysis: {
          status: Math.random() > 0.5 ? 'completed' : 'idle',
          progress: Math.floor(Math.random() * 100),
          score: Math.floor(Math.random() * 100),
          updated_at: new Date()
        },
        format_check: {
          status: Math.random() > 0.3 ? 'pass' : 'issues',
          overall_pass: Math.random() > 0.3,
          score: Math.random(),
          policy_name: 'MSC Policy',
          policy_version: '1.0',
          checked_at: new Date(),
          findings: []
        }
      });
      
      submissionCount++;
    }
  }

  console.log(`Created ${submissionCount} stage submissions`);

  await mongoose.disconnect();
  console.log('Sample data seeding complete!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@hilcoe.local / admin123');
  console.log('Coordinator: coordinator@hilcoe.local / coordinator123');
  console.log('Supervisors: bukayo.saka@hilcoe.local / supervisor123');
  console.log('Researchers: rms2025-001@hilcoe.local / researcher123');
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});

