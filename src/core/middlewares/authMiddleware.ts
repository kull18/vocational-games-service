import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface UserPayload {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header is missing' });
    return;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Token format must be Bearer <token>' });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    const userId = decoded.sub || decoded.userId || decoded.id || decoded.user_id;

    if (!userId) {
      res.status(401).json({ error: 'Invalid token payload: missing user ID' });
      return;
    }

    req.user = {
      id: userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
