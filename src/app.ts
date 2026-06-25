import express from 'express';
import helmet from 'helmet';
import { createGameRouter } from './infrastructure/adapters/inputs/http/routes/gameRoutes';
import { gameController } from './core/config/container';
import { errorHandler } from './core/middlewares/errorHandler';
import { loggerMiddleware } from './core/middlewares/loggerMiddleware';
import { corsMiddleware } from './core/middlewares/corsMiddleware';
import { globalRateLimiter } from './core/middlewares/rateLimitMiddleware';

const app = express();

// Disable standard Express header
app.disable('x-powered-by');

// Global Security Headers (Helmet)
app.use(helmet());

// Configure strict CORS origins
app.use(corsMiddleware);

// Global Request JSON Parser
app.use(express.json());

// Audit Logger Middleware
app.use(loggerMiddleware as any);

// Rate Limiting Config
app.use(globalRateLimiter);

// Base Route Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Register API Routes
app.use('/api/v1', createGameRouter(gameController));

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
