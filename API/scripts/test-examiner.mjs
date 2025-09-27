import mongoose from 'mongoose';
import { connectMongo } from '../src/config/mongo.js';
import { authService } from '../src/services/auth.service.js';
import { StudentVerification } from '../src/models/StudentVerification.js';

const email = 'test-researcher@hilcoe.local';
const studentId = 'RMS-TEST-001';

(async () => {
  try {
    await connectMongo();
    const record = await StudentVerification.findOneAndUpdate(
      { student_id: studentId },
      {
        $setOnInsert: {
          first_name: 'Test',
          middle_name: '',
          last_name: 'Researcher',
          program: 'MSc Project'
        },
        $set: { verified_at: null, verified_email: null }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('Verification record prepared', record.student_id);

    const verified = await authService.verifyStudent({
      first_name: 'Test',
      middle_name: '',
      last_name: 'Researcher',
      student_id: studentId
    });
    console.log('Verify token', verified.verification_token);

    const registered = await authService.register({
      verification_token: verified.verification_token,
      email,
      phone: '+251900000000',
      password: 'Researcher123'
    });
    console.log('Registered user', registered.user.email);

    const login = await authService.login(email, 'Researcher123');
    console.log('Login ok', login.user.email);
  } catch (err) {
    console.error('Error', err);
  } finally {
    await mongoose.disconnect();
  }
})();
