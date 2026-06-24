export interface QuestionOption {
  id: string;
  text: string;
  weights: Record<string, number>; // E.g., { "R": 1.0, "I": 0.8 }
}

export class Question {
  constructor(
    public readonly id: string,
    public readonly gameId: string,
    public readonly text: string,
    public readonly type: string,
    public readonly options: QuestionOption[],
    public readonly createdAt?: Date
  ) {}
}
