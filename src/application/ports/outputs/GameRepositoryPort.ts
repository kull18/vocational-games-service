import { Game } from '../../../domain/entities/Game';
import { Question } from '../../../domain/entities/Question';
import { GameSession } from '../../../domain/entities/GameSession';
import { GameResult } from '../../../domain/entities/GameResult';

export interface GameRepositoryPort {
  findActiveGames(): Promise<Game[]>;
  findGameById(id: string): Promise<Game | null>;
  findQuestionsByGameId(gameId: string): Promise<Question[]>;
  findQuestionById(id: string): Promise<Question | null>;
  createSession(session: GameSession): Promise<void>;
  findSessionById(id: string): Promise<GameSession | null>;
  saveAnswer(
    sessionId: string,
    questionId: string,
    selectedOptionId: string,
    rawData?: any
  ): Promise<void>;
  findAnswersBySessionId(sessionId: string): Promise<{ questionId: string; selectedOptionId: string; rawData?: any }[]>;
  saveResult(result: GameResult): Promise<void>;
  updateSessionStatus(sessionId: string, status: string, finishedAt: Date | null): Promise<void>;
  findResultsByUserId(userId: string): Promise<GameResult[]>;
}
