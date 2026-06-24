export class GameSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly gameId: string,
    public readonly status: string, // 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
    public readonly startedAt: Date,
    public readonly finishedAt: Date | null
  ) {}
}
