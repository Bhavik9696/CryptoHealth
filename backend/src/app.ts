import express, { Express, Request, Response } from 'express';
import { corsMiddleware, helmetMiddleware } from './middleware/security.middleware.js';
import { standardLimiter } from './middleware/rate-limit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import reportRoutes from './routes/report.routes.js';
import sharingRoutes from './routes/sharing.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import auditRoutes from './routes/audit.routes.js';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiter
  app.use(standardLimiter);

  // Health endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'crypto-health-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Root endpoint info
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'Crypto Health API',
      version: '1.0.0',
      description: 'Patient-controlled diagnostic-record locker & sharing platform API',
      documentation: '/api/v1/docs',
    });
  });

  // Mount API v1 routes
  const apiV1 = express.Router();
  apiV1.use('/auth', authRoutes);
  apiV1.use('/users', authRoutes); // /users/me alias for compatibility
  apiV1.use('/patients', patientRoutes);
  apiV1.use('/hospitals', hospitalRoutes);
  apiV1.use('/doctors', doctorRoutes);
  apiV1.use('/reports', reportRoutes);
  apiV1.use('/sharing', sharingRoutes);
  apiV1.use('/verification', verificationRoutes);
  apiV1.use('/audit', auditRoutes);

  app.use('/api/v1', apiV1);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API route was not found',
      },
    });
  });

  // Central error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
