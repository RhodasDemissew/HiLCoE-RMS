import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectMongo() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
}

