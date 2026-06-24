import app from './app';
import { env } from './core/config/env';

const PORT = env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Vocational Games Service running in ${env.NODE_ENV} mode`);
  console.log(` Listening on port: http://localhost:${PORT}`);
  console.log(` Healthcheck: http://localhost:${PORT}/health`);
  console.log(`==================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
