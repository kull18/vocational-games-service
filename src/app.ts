import express from 'express';
import cors from 'cors';
import { createGameRouter } from './infrastructure/adapters/inputs/http/routes/gameRoutes';
import { gameController } from './core/config/container';
import { errorHandler } from './core/middlewares/errorHandler';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Base Route Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Register API Routes
app.use('/api/v1', createGameRouter(gameController));

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
