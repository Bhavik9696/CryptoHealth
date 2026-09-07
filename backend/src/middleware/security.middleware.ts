import cors from 'cors';
import helmet from 'helmet';
import { env } from '../config/env.js';

const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (e.g. mobile apps, curl, postman) or matching origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});
