import mongoose from 'mongoose';
import { connectMongo } from '../src/config/mongo.js';
import { User } from '../src/models/User.js';

const email = process.argv[2];

(async () => {
  await connectMongo();
  const user = await User.findOne({ email }).lean();
  console.log(user);
  await mongoose.disconnect();
})();
