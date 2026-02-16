import mongoose from 'mongoose';
import dns from 'dns';
import { config } from './env.js';

// Configure DNS servers for better mobile hotspot compatibility
// Using Google DNS and Cloudflare DNS as fallbacks
const DNS_SERVERS = [
  '8.8.8.8',      // Google DNS
  '8.8.4.4',      // Google DNS secondary
  '1.1.1.1',      // Cloudflare DNS
  '1.0.0.1'       // Cloudflare DNS secondary
];

// Set DNS servers for Node.js
try {
  dns.setServers(DNS_SERVERS);
  console.log('DNS servers configured:', DNS_SERVERS);
} catch (err) {
  console.warn('Failed to set DNS servers:', err.message);
}

export async function connectMongo(retries = 5, delay = 2000) {
  mongoose.set('strictQuery', true);
  
  // Configure mongoose connection options for better mobile network compatibility
  const mongooseOptions = {
    serverSelectionTimeoutMS: 30000, // 30 seconds (increased from default 5s)
    socketTimeoutMS: 45000,         // 45 seconds
    connectTimeoutMS: 30000,        // 30 seconds
    maxPoolSize: 10,
    retryWrites: true,
    retryReads: true,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting MongoDB connection (${attempt}/${retries})...`);
      await mongoose.connect(config.mongoUri, mongooseOptions);
      console.log('✅ Successfully connected to MongoDB!');
      return;
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        console.error('\n⚠️  All connection attempts failed.');
        console.error('💡 Troubleshooting tips:');
        console.error('   1. Check your internet connection');
        console.error('   2. Verify MONGO_URI in .env file');
        console.error('   3. Try switching DNS servers in Windows network settings');
        console.error('   4. Check if your mobile carrier is blocking MongoDB Atlas');
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts: ${error.message}`);
      }
      
      // Exponential backoff: delay increases with each attempt
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

