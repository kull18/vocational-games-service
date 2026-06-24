import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { authMiddleware } from '../../../../../core/middlewares/authMiddleware';

export const createGameRouter = (controller: GameController): Router => {
  const router = Router();

  // Public endpoint
  router.get('/games', controller.getActiveGames);

  // Protected endpoints
  router.get('/games/:gameId', authMiddleware as any, controller.getGameWithQuestions);
  router.post('/games/:gameId/start', authMiddleware as any, controller.startGameSession);
  router.post('/games/:gameId/answers', authMiddleware as any, controller.submitAnswer);
  router.post('/games/:gameId/finish', authMiddleware as any, controller.finishGameSession);

  // Student specific results endpoint
  router.get('/games/students/results', authMiddleware as any, controller.getUserResults);

  return router;
};

