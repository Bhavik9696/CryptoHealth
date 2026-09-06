/**
 * Express Application Setup.
 * Configures middleware, routes, and error handling.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { env } = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const hospitalRoutes = require('./routes/hospital.routes');

const app = express();

// --- Global Middleware ---

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiting
app.use(generalLimiter);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Crypto Health API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Future route registrations:
// app.use('/api/doctors', doctorRoutes);
// app.use('/api/patient-links', patientLinkRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/access-grants', accessGrantRoutes);
// app.use('/api/access-tokens', accessTokenRoutes);
// app.use('/api/audit', auditRoutes);
// app.use('/api/admin', adminRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// --- Global Error Handler (must be last) ---
app.use(errorHandler);

module.exports = app;
