import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectMongo } from './config/mongo.js';
import swaggerUi from 'swagger-ui-express';
import { openapi } from './docs/openapi.js';
import { authOptional } from './middleware/auth.js';
import { ensureStorage } from './services/storageService.js';
import { auditLogger } from './middleware/audit.js';

// Register models early
import './models/Role.js';
import './models/User.js';
import './models/Project.js';
import './models/Milestone.js';
import './models/Submission.js';
import './models/Review.js';
import './models/StudentVerification.js';
import './models/ResearchProgress.js';
import './models/StageSubmission.js';
import './models/Supervisor.js';
import './models/ExaminerAssignment.js';
import './models/Schedule.js';
import './models/Grade.js';
import './models/DocumentTemplate.js';
import './models/Notification.js';
import './models/ExtensionRequest.js';
import './models/VerificationJob.js';
import './models/AuditLog.js';

// Routers
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import projectsRouter from './routes/projects.js';
import milestonesRouter from './routes/milestones.js';
import submissionsRouter from './routes/submissions.js';
import reviewsRouter from './routes/reviews.js';
import defenseRouter from './routes/defense.js';
import extensionsRouter from './routes/extensions.js';
import templatesRouter from './routes/templates.js';
import notificationsRouter from './routes/notifications.js';
import reportsRouter from './routes/reports.js';
import verificationsRouter from './routes/verifications.js';
import stageSubmissionsRouter from './routes/stageSubmissions.js';
import studentVerificationsRouter from './routes/studentVerifications.js';
import supervisorsRouter from './routes/supervisors.js';
import studentsRouter from './routes/students.js';

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use(authOptional);
app.use(auditLogger);

// Swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/openapi.json', (_req, res) => res.json(openapi));

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'hilcoe-rms-backend', docs: ['/health','/auth/login','/projects','/milestones'] });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'hilcoe-rms-backend', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/milestones', milestonesRouter);
app.use('/submissions', submissionsRouter);
app.use('/reviews', reviewsRouter);
app.use('/defense', defenseRouter);
app.use('/extensions', extensionsRouter);
app.use('/templates', templatesRouter);
app.use('/notifications', notificationsRouter);
app.use('/reports', reportsRouter);
app.use('/verifications', verificationsRouter);
app.use('/student-verifications', studentVerificationsRouter);
app.use('/supervisors', supervisorsRouter);
app.use('/students', studentsRouter);
// Stage-gated researcher submissions (mounted under /stages to avoid conflicts with legacy /submissions)
app.use('/stages', stageSubmissionsRouter);

// Global error safeguard
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

connectMongo().then(() => {
  if (!config.storageDir) {
    throw new Error('Storage directory is not defined in the configuration.');
  }
  ensureStorage();
  app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`));
});








