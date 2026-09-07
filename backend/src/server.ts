import { app } from './app.js';
import { env } from './config/env.js';
import { isSupabaseConfigured } from './config/supabase.js';

const server = app.listen(env.PORT, () => {
  console.log(`=========================================`);
  console.log(`🏥 ${env.APP_NAME} running on port ${env.PORT}`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health Check: ${env.APP_URL}/health`);
  console.log(`🚀 API Base: ${env.APP_URL}/api/v1`);
  console.log(
    `🗄️ Database: ${
      isSupabaseConfigured ? 'Connected to Supabase PostgreSQL & Storage' : 'In-Memory Secure Store (Local Mode)'
    }`
  );
  console.log(`=========================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
