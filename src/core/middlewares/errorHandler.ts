import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../../domain/exceptions/BusinessException';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof BusinessException) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Auditing/logging of unhandled errors
  console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);

  const response: { status: string; message: string; stack?: string } = {
    status: 'error',
    message: 'Internal Server Error',
  };

  if (env.NODE_ENV === 'development') {
    response.message = err.message;
    response.stack = err.stack;
  }

  res.status(500).json(response);
};
