import mongoose from 'mongoose';
import { connectMongo } from '../src/config/mongo.js';
import { authService } from '../src/services/auth.service.js';

const email = 'test-examiner@hilcoe.local';

(async () => {
  try {
    await connectMongo();
    const invite = await authService.invite('Test Examiner', email, 'Examiner');
    console.log('Invite', invite);
    const act = await authService.activate(invite.activation_token, 'Examiner123');
    console.log('Activate', act);
    const login = await authService.login(email, 'Examiner123');
    console.log('Login ok', login.user.email);
  } catch (err) {
    console.error('Error', err);
  } finally {
    await mongoose.disconnect();
  }
})();
