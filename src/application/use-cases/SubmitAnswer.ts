import { GameRepositoryPort } from '../ports/outputs/GameRepositoryPort';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export class SubmitAnswer {
  constructor(private readonly gameRepository: GameRepositoryPort) {}

  async execute(
    userId: string,
    sessionId: string,
    questionId: string,
    selectedOptionId: string,
    rawData?: any
  ): Promise<void> {
    const session = await this.gameRepository.findSessionById(sessionId);

    if (!session) {
      throw new BusinessException('Session not found');
    }

    if (session.userId !== userId) {
      throw new BusinessException('Unauthorized access to this session');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new BusinessException('Session is already completed or abandoned');
    }

    const question = await this.gameRepository.findQuestionById(questionId);
    if (!question) {
      throw new BusinessException('Question not found');
    }

    if (question.gameId !== session.gameId) {
      throw new BusinessException('Question does not belong to this game session');
    }

    // Verify option is valid
    const optionExists = question.options.some((opt) => opt.id === selectedOptionId);
    if (!optionExists) {
      throw new BusinessException(`Invalid option selected: ${selectedOptionId}`);
    }

    await this.gameRepository.saveAnswer(sessionId, questionId, selectedOptionId, rawData);
  }
}
