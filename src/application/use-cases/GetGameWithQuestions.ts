import { Game } from '../../domain/entities/Game';
import { Question } from '../../domain/entities/Question';
import { GameRepositoryPort } from '../ports/outputs/GameRepositoryPort';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export class GetGameWithQuestions {
  constructor(private readonly gameRepository: GameRepositoryPort) {}

  async execute(gameId: string): Promise<{ game: Game; questions: Question[] }> {
    const game = await this.gameRepository.findGameById(gameId);

    if (!game || !game.isActive) {
      throw new BusinessException('Game not found or is inactive');
    }

    const questions = await this.gameRepository.findQuestionsByGameId(gameId);
    return { game, questions };
  }
}
