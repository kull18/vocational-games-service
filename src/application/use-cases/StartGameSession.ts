import * as crypto from 'crypto';
import { GameSession } from '../../domain/entities/GameSession';
import { GameRepositoryPort } from '../ports/outputs/GameRepositoryPort';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export class StartGameSession {
  constructor(private readonly gameRepository: GameRepositoryPort) {}

  async execute(userId: string, gameId: string): Promise<string> {
    const game = await this.gameRepository.findGameById(gameId);

    if (!game || !game.isActive) {
      throw new BusinessException('Game not found or is inactive');
    }

    const sessionId = crypto.randomUUID();
    const session = new GameSession(
      sessionId,
      userId,
      gameId,
      'IN_PROGRESS',
      new Date(),
      null
    );

    await this.gameRepository.createSession(session);
    return sessionId;
  }
}
