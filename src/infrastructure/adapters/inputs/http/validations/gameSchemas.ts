import { z } from 'zod';

export const getGameWithQuestionsSchema = {
  params: z.object({
    gameId: z.string().uuid({ message: 'gameId must be a valid UUID' }),
  }),
};

export const startGameSessionSchema = {
  params: z.object({
    gameId: z.string().uuid({ message: 'gameId must be a valid UUID' }),
  }),
};

export const submitAnswerSchema = {
  params: z.object({
    gameId: z.string().uuid({ message: 'gameId must be a valid UUID' }),
  }),
  body: z.object({
    sessionId: z.string().uuid({ message: 'sessionId must be a valid UUID' }),
    questionId: z.string().uuid({ message: 'questionId must be a valid UUID' }),
    selectedOptionId: z.string().uuid({ message: 'selectedOptionId must be a valid UUID' }),
    rawData: z.record(z.string(), z.any()).optional(),
  }),
};

export const finishGameSessionSchema = {
  params: z.object({
    gameId: z.string().uuid({ message: 'gameId must be a valid UUID' }),
  }),
  body: z.object({
    sessionId: z.string().uuid({ message: 'sessionId must be a valid UUID' }),
  }),
};
