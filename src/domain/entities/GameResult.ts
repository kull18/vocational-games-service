export class GameResult {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly gameId: string,
    public readonly scores: Record<string, number>, // E.g., { "R": 2.0, "I": 1.3 }
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
