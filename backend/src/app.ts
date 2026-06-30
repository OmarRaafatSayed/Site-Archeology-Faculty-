import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { env } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';

const app = express();

// ─── Ensure upload directories exist ─────────────────────────────────────────
['photos', 'materials', 'publications', 'temp'].forEach((dir) => {
  const fullPath = path.join(env.UPLOAD_PATH, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        env.FRONTEND_URL,
      ].filter(Boolean);
      // allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowed.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(env.UPLOAD_PATH));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const dbStatus = await prisma
    .$queryRaw`SELECT 1`
    .then(() => 'ok')
    .catch(() => 'error');

  const redisStatus = await redis
    .ping()
    .then(() => 'ok')
    .catch(() => 'error');

  const allHealthy = dbStatus === 'ok' && redisStatus === 'ok';

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from './modules/auth/auth.routes';
import adminUsersRoutes from './modules/admin/users/users.routes';
import departmentsRoutes from './modules/departments/departments.routes';
import facultyRoutes from './modules/faculty/faculty.routes';
import studentsRoutes from './modules/students/students.routes';

// Phase 1 — Auth
app.use('/api/auth', authRoutes);

// Phase 1 — Admin: User Management
app.use('/api/admin/users', adminUsersRoutes);

// Phase 2 — Core Entities
app.use('/api/departments', departmentsRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentsRoutes);

// Phase 3 — Academic System
import programsRoutes from './modules/programs/programs.routes';
import coursesRoutes from './modules/courses/courses.routes';
import { schedulesRouter, examSchedulesRouter } from './modules/schedules/schedules.routes';
import resultsRoutes from './modules/results/results.routes';

app.use('/api/programs', programsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/schedules', schedulesRouter);
app.use('/api/exam-schedules', examSchedulesRouter);
app.use('/api/results', resultsRoutes);

// Phase 4 — Content System
import newsRoutes from './modules/news/news.routes';
import pagesRoutes from './modules/pages/pages.routes';
import publicationsRoutes from './modules/publications/publications.routes';
import libraryRoutes from './modules/library/library.routes';
import adminStatsRoutes from './modules/admin/stats/stats.routes';

app.use('/api/news', newsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/admin', adminStatsRoutes);

// Phase 5 — Conferences + Search
import conferencesRoutes from './modules/conferences/conferences.routes';
import searchRoutes from './modules/search/search.routes';

app.use('/api/conferences', conferencesRoutes);
app.use('/api/search', searchRoutes);

// Phase 6 — Missing Features (New Modules)
import qualityRoutes from './modules/quality/quality.routes';
import studentServicesRoutes from './modules/student-services/student-services.routes';
import excavationsRoutes from './modules/excavations/excavations.routes';
import communityRoutes from './modules/community/community.routes';
import specialProgramsRoutes from './modules/special-programs/special-programs.routes';
import agreementsRoutes from './modules/agreements/agreements.routes';
import centersRoutes from './modules/centers/centers.routes';
import externalLinksRoutes from './modules/external-links/external-links.routes';

app.use('/api/quality', qualityRoutes);
app.use('/api/student-services', studentServicesRoutes);
app.use('/api/excavations', excavationsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/special-programs', specialProgramsRoutes);
app.use('/api/agreements', agreementsRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/external-links', externalLinksRoutes);

// TODO: Phase 7+ (Frontend) routes will be added here

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
import { AppError } from './shared/errors/AppError';

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);

  // AppError — error متوقع
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Unknown error
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Server Startup ───────────────────────────────────────────────────────────
async function startServer() {
  // اتصال Redis
  await redis.connect().catch((err: Error) => {
    console.error('❌ Failed to connect to Redis:', err.message);
  });

  // اتصال PostgreSQL عبر Prisma
  await prisma.$connect().catch((err: Error) => {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  });

  console.log('✅ PostgreSQL connected');

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${env.PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received — shutting down gracefully...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received — shutting down gracefully...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

startServer();

export default app;
