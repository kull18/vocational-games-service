import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { authMiddleware } from '../../../../../core/middlewares/authMiddleware';
import { validateRequest } from '../../../../../core/middlewares/validationMiddleware';
import {
  getGameWithQuestionsSchema,
  startGameSessionSchema,
  submitAnswerSchema,
  finishGameSessionSchema,
} from '../validations/gameSchemas';

export const createGameRouter = (controller: GameController): Router => {
  const router = Router();

  // Public endpoint
  router.get('/games', controller.getActiveGames);

  // Protected endpoints
  router.get(
    '/games/:gameId',
    authMiddleware as any,
    validateRequest(getGameWithQuestionsSchema),
    controller.getGameWithQuestions
  );
  router.post(
    '/games/:gameId/start',
    authMiddleware as any,
    validateRequest(startGameSessionSchema),
    controller.startGameSession
  );
  router.post(
    '/games/:gameId/answers',
    authMiddleware as any,
    validateRequest(submitAnswerSchema),
    controller.submitAnswer
  );
  router.post(
    '/games/:gameId/finish',
    authMiddleware as any,
    validateRequest(finishGameSessionSchema),
    controller.finishGameSession
  );

  // Student specific results endpoint
  router.get('/games/students/results', authMiddleware as any, controller.getUserResults);

  return router;
};

