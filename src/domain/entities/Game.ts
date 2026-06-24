export class Game {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly category: string,
    public readonly isActive: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
