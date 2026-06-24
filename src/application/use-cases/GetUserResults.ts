import { GameResult } from '../../domain/entities/GameResult';
import { GameRepositoryPort } from '../ports/outputs/GameRepositoryPort';

export class GetUserResults {
  constructor(private readonly gameRepository: GameRepositoryPort) {}

  async execute(userId: string): Promise<GameResult[]> {
    return this.gameRepository.findResultsByUserId(userId);
  }
}
