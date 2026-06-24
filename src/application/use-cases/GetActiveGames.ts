import { Game } from '../../domain/entities/Game';
import { GameRepositoryPort } from '../ports/outputs/GameRepositoryPort';

export class GetActiveGames {
  constructor(private readonly gameRepository: GameRepositoryPort) {}

  async execute(): Promise<Game[]> {
    return this.gameRepository.findActiveGames();
  }
}
