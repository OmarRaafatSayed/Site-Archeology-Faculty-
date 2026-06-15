import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
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

// ─── Routes (Phase 1+) ────────────────────────────────────────────────────────
import authRoutes from './modules/auth/auth.routes';

app.use('/api/auth', authRoutes);

// TODO: Phase 2+ routes will be added here

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
