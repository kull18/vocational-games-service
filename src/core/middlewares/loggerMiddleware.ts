import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const loggerMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || 'anonymous';
    console.log(
      `[AuditLog] ${new Date().toISOString()} | IP: ${req.ip} | User: ${userId} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`
    );
  });
  next();
};
