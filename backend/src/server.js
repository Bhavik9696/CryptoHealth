/**
 * Server Entry Point.
 * Validates environment, then starts the Express server.
 */
const { validateEnv, env } = require('./config/env');

// Validate environment variables before anything else
validateEnv();

const app = require('./app');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          CRYPTO HEALTH API SERVER                ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Environment : ${env.NODE_ENV.padEnd(33)}║`);
  console.log(`║  Port        : ${String(PORT).padEnd(33)}║`);
  console.log(`║  Health      : http://localhost:${PORT}/api/health`.padEnd(51) + '║');
  console.log(`║  Auth API    : http://localhost:${PORT}/api/auth`.padEnd(51) + '║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
