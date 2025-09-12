import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import './models/Role.js';
import './models/User.js';
import './models/Feedback.js';
// loose models import ensures collections register
import './models/Advisor.js';
import './models/AuditLog.js';
import './models/Coordinator.js';
import './models/Defense.js';
import './models/DocumentTemplate.js';
import './models/ExaminerAssignment.js';
import './models/Examiner.js';
import './models/ExtensionRequest.js';
import './models/Grade.js';
import './models/Notification.js';
import './models/Project.js';
import './models/Researcher.js';
import './models/Schedule.js';
import './models/Submission.js';

import genericRouter from './routes/generic.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hilcoe_rms';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'hilcoe-rms-backend', timestamp: new Date().toISOString() });
});

// Mount generic CRUD router
app.use('/api', genericRouter);

// Global error safeguard
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});