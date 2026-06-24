import { PostgresGameRepository } from '../../infrastructure/adapters/outputs/db/PostgresGameRepository';
import { GetActiveGames } from '../../application/use-cases/GetActiveGames';
import { GetGameWithQuestions } from '../../application/use-cases/GetGameWithQuestions';
import { StartGameSession } from '../../application/use-cases/StartGameSession';
import { SubmitAnswer } from '../../application/use-cases/SubmitAnswer';
import { FinishGameSession } from '../../application/use-cases/FinishGameSession';
import { GetUserResults } from '../../application/use-cases/GetUserResults';
import { GameController } from '../../infrastructure/adapters/inputs/http/controllers/GameController';

// 1. Output Adapters (Infrastructure -> Database)
const gameRepository = new PostgresGameRepository();

// 2. Use Cases (Application Layer)
const getActiveGamesUseCase = new GetActiveGames(gameRepository);
const getGameWithQuestionsUseCase = new GetGameWithQuestions(gameRepository);
const startGameSessionUseCase = new StartGameSession(gameRepository);
const submitAnswerUseCase = new SubmitAnswer(gameRepository);
const finishGameSessionUseCase = new FinishGameSession(gameRepository);
const getUserResultsUseCase = new GetUserResults(gameRepository);

// 3. Input Adapters (Infrastructure HTTP -> Controller) wired with Use Cases
export const gameController = new GameController(
  getActiveGamesUseCase,
  getGameWithQuestionsUseCase,
  startGameSessionUseCase,
  submitAnswerUseCase,
  finishGameSessionUseCase,
  getUserResultsUseCase
);
export { gameRepository };
