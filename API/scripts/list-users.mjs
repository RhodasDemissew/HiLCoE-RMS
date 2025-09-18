import mongoose from 'mongoose';
import { connectMongo } from '../src/config/mongo.js';
import { User } from '../src/models/User.js';

(async () => {
  try {
    await connectMongo();
    const users = await User.find({}, { name: 1, email: 1, status: 1 }).sort({ created_at: -1 }).limit(10).lean();
    console.log(users);
  } catch (err) {
    console.error('Query error', err);
  } finally {
    await mongoose.disconnect();
  }
})();
