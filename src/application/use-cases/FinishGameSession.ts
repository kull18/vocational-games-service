import * as crypto from 'crypto';
import { GameRepositoryPort } from '../ports/outputs/GameRepositoryPort';
import { GameResult } from '../../domain/entities/GameResult';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export class FinishGameSession {
  constructor(private readonly gameRepository: GameRepositoryPort) {}

  async execute(userId: string, sessionId: string): Promise<GameResult> {
    const session = await this.gameRepository.findSessionById(sessionId);

    if (!session) {
      throw new BusinessException('Session not found');
    }

    if (session.userId !== userId) {
      throw new BusinessException('Unauthorized access to this session');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new BusinessException('Session is not in progress');
    }

    // Get all answers submitted for this session
    const answers = await this.gameRepository.findAnswersBySessionId(sessionId);
    if (answers.length === 0) {
      throw new BusinessException('Cannot finish a session with no answers');
    }

    // Get all questions for the game to map options and weights
    const questions = await this.gameRepository.findQuestionsByGameId(session.gameId);
    const questionsMap = new Map(questions.map((q) => [q.id, q]));

    const scores: Record<string, number> = {};

    for (const answer of answers) {
      const question = questionsMap.get(answer.questionId);
      if (!question) {
        // Question might have been deleted or database is inconsistent
        continue;
      }

      // Find the option selected
      const selectedOption = question.options.find((opt) => opt.id === answer.selectedOptionId);
      if (!selectedOption || !selectedOption.weights) {
        continue;
      }

      // Sum weights
      for (const [trait, weight] of Object.entries(selectedOption.weights)) {
        scores[trait] = (scores[trait] || 0) + weight;
      }
    }

    // Create the final result
    const resultId = crypto.randomUUID();
    const result = new GameResult(
      resultId,
      sessionId,
      userId,
      session.gameId,
      scores,
      new Date(),
      new Date()
    );

    // Save the result and update session status to COMPLETED
    await this.gameRepository.saveResult(result);
    await this.gameRepository.updateSessionStatus(sessionId, 'COMPLETED', new Date());

    return result;
  }
}
