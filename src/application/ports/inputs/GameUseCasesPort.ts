import { Game } from '../../../domain/entities/Game';
import { Question } from '../../../domain/entities/Question';
import { GameSession } from '../../../domain/entities/GameSession';
import { GameResult } from '../../../domain/entities/GameResult';

export interface GameUseCasesPort {
  getActiveGames(): Promise<Game[]>;
  getGameWithQuestions(gameId: string): Promise<{ game: Game; questions: Question[] }>;
  startGameSession(userId: string, gameId: string): Promise<string>;
  submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    selectedOptionId: string,
    rawData?: any
  ): Promise<void>;
  finishGameSession(userId: string, sessionId: string): Promise<GameResult>;
  getUserResults(userId: string): Promise<GameResult[]>;
}
