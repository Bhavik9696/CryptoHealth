/**
 * Express application setup.
 * Configures security middleware, health checks, and API routes.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { env } = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const doctorRoutes = require('./routes/doctor.routes');
const patientLinkRoutes = require('./routes/patientLink.routes');
const reportRoutes = require('./routes/report.routes');
const auditRoutes = require('./routes/audit.routes');
const verificationRoutes = require('./routes/verification.routes');
const sharingRoutes = require('./routes/sharing.routes');
const patientRoutes = require('./routes/patient.routes');
const { grantRouter, tokenRouter } = require('./routes/accessGrant.routes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Crypto Health API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patient-links', patientLinkRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/access-grants', grantRouter);
app.use('/api/access-tokens', tokenRouter);
app.use('/api/audit', auditRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/patients', patientRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;
