import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../../domain/exceptions/BusinessException';

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

  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
