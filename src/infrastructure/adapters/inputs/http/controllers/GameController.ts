import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../../core/middlewares/authMiddleware';
import { GetActiveGames } from '../../../../../application/use-cases/GetActiveGames';
import { GetGameWithQuestions } from '../../../../../application/use-cases/GetGameWithQuestions';
import { StartGameSession } from '../../../../../application/use-cases/StartGameSession';
import { SubmitAnswer } from '../../../../../application/use-cases/SubmitAnswer';
import { FinishGameSession } from '../../../../../application/use-cases/FinishGameSession';
import { GetUserResults } from '../../../../../application/use-cases/GetUserResults';

export class GameController {
  constructor(
    private readonly getActiveGamesUseCase: GetActiveGames,
    private readonly getGameWithQuestionsUseCase: GetGameWithQuestions,
    private readonly startGameSessionUseCase: StartGameSession,
    private readonly submitAnswerUseCase: SubmitAnswer,
    private readonly finishGameSessionUseCase: FinishGameSession,
    private readonly getUserResultsUseCase: GetUserResults
  ) {}

  getActiveGames = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const games = await this.getActiveGamesUseCase.execute();
      res.status(200).json(games);
    } catch (error) {
      next(error);
    }
  };

  getGameWithQuestions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { gameId } = req.params;
      if (!gameId) {
        res.status(400).json({ error: 'Parameter gameId is required' });
        return;
      }
      const data = await this.getGameWithQuestionsUseCase.execute(gameId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  startGameSession = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { gameId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User is not authenticated' });
        return;
      }

      if (!gameId) {
        res.status(400).json({ error: 'Parameter gameId is required' });
        return;
      }

      const sessionId = await this.startGameSessionUseCase.execute(userId, gameId);
      res.status(201).json({ sessionId });
    } catch (error) {
      next(error);
    }
  };

  submitAnswer = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { gameId } = req.params;
      const userId = req.user?.id;
      const { sessionId, questionId, selectedOptionId, rawData } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User is not authenticated' });
        return;
      }

      if (!sessionId || !questionId || !selectedOptionId) {
        res.status(400).json({
          error: 'Fields sessionId, questionId, and selectedOptionId are required in request body',
        });
        return;
      }

      await this.submitAnswerUseCase.execute(
        userId,
        sessionId,
        questionId,
        selectedOptionId,
        rawData
      );

      res.status(200).json({ message: 'Answer registered successfully' });
    } catch (error) {
      next(error);
    }
  };

  finishGameSession = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User is not authenticated' });
        return;
      }

      if (!sessionId) {
        res.status(400).json({ error: 'Field sessionId is required in request body' });
        return;
      }

      const result = await this.finishGameSessionUseCase.execute(userId, sessionId);
      res.status(200).json({
        message: 'Game session finished and results calculated',
        result,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserResults = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User is not authenticated' });
        return;
      }

      const results = await this.getUserResultsUseCase.execute(userId);
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };
}
