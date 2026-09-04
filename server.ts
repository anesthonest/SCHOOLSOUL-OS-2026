import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { applySecurityHeaders, authenticateJWT } from './server/middleware/authMiddleware';
import { validateEnvironment, logSystemStartupBanner } from './server/config/environmentValidator';
import { initServerDatabase } from './server/db/store';
import { closePostgresPool } from './server/db/postgresStore';
import { backgroundWorker } from './server/services/backgroundWorker';

import healthRoutes from './server/routes/health';
import schoolRoutes from './server/routes/school';
import authRoutes from './server/routes/auth';
import usersRoutes from './server/routes/users';
import rolesRoutes from './server/routes/roles';
import auditRoutes from './server/routes/audit';
import syncRoutes from './server/routes/sync';
import backupRoutes from './server/routes/backup';
import settingsRoutes from './server/routes/settings';
import admissionsRoutes from './server/routes/admissions';
import studentsRoutes from './server/routes/students';
import attendanceRoutes from './server/routes/attendance';
import aiIntelligenceRoutes from './server/routes/aiIntelligence';
import billingRoutes from './server/routes/billing';
import { communityRouter } from './server/routes/community';
import { liveLearningRouter } from './server/routes/liveLearning';
import { opportunityRouter } from './server/routes/opportunityEngine';
import { sponsorshipRouter } from './server/routes/sponsorshipBridge';
import { globalFrameworkRouter } from './server/routes/globalFramework';
import { marketRouter } from './server/routes/market';
import { docsRouter } from './server/routes/docs';
import { qrRouter } from './server/routes/qr';
import { feedbackRouter } from './server/routes/feedback';
import { setupLiveLearningWebSocket } from './server/services/liveLearningSocket';

async function startServer() {
  const app = express();
  
  // Standard Container Port (3000)
  const PORT = 3000;

  // Validate Production Environment Configuration
  const configReport = validateEnvironment();
  logSystemStartupBanner(configReport);

  // Initialize Database (PostgreSQL if DATABASE_URL configured, or local file store)
  await initServerDatabase();

  // Start background reconciliation worker
  if (process.env.DISABLE_WORKER !== 'true') {
    backgroundWorker.start(60000);
  }

  // Security headers & body parsers with size limits
  app.use(applySecurityHeaders);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(authenticateJWT);

  // Health and Readiness probes (Available at root /health & /ready and /api/health & /api/ready)
  app.use(healthRoutes);

  // Primary API Routes
  app.use('/api', healthRoutes);
  app.use('/api/school', schoolRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/roles', rolesRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/sync', syncRoutes);
  app.use('/api/backup', backupRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/admissions', admissionsRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/ai', aiIntelligenceRoutes);
  app.use('/api/billing', billingRoutes);
  // Alias for Payment Gateway & Pesapal webhooks
  app.use('/api/payments/pesapal', billingRoutes);
  app.use('/api/payments', billingRoutes);
  app.use('/api/community', communityRouter);
  app.use('/api/opportunity', opportunityRouter);
  app.use('/api/sponsorship', sponsorshipRouter);
  app.use('/api/framework', globalFrameworkRouter);
  app.use('/api/market', marketRouter);
  app.use('/api/marketplace', marketRouter);
  app.use('/api/docs', docsRouter);
  app.use('/api/qr', qrRouter);
  app.use('/api/feedback', feedbackRouter);
  app.use('/api', liveLearningRouter);

  // Serve PWA manifest and static assets
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Development vs Production setup for Vite Single Page Application
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Production Safe Error Handler (Never expose raw stack traces or internal secrets to client)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Server Error] ${req.method} ${req.path}:`, err);
    if (res.headersSent) {
      return next(err);
    }
    const isProd = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
      error: isProd ? 'An internal server error occurred. Please contact School Administrator.' : err.message,
      code: err.code || 'SERVER_ERROR',
      timestamp: new Date().toISOString(),
    });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SchoolSoul Production Server online & listening at http://0.0.0.0:${PORT}`);
  });

  // Attach Real-Time Live Learning & Virtual Classroom WebSocket Engine
  setupLiveLearningWebSocket(server);

  // Graceful shutdown handling for Render deployments
  const handleShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Gracefully terminating SchoolSoul server...`);
    backgroundWorker.stop();
    await closePostgresPool();
    server.close(() => {
      console.log('HTTP server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start SchoolSoul server:', err);
  process.exit(1);
});
