import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { IUser } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'eventx-super-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Authentication token is required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.getUsers().find((u) => u._id === decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User associated with token not found' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Account has been suspended by an administrator' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.getUsers().find((u) => u._id === decoded.id);
    if (user && user.status !== 'suspended') {
      req.user = user;
    }
  } catch (err) {
    // Ignore optional auth failure
  }
  next();
};

export const requireRole = (allowedRoles: Array<'user' | 'organizer' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] permissions. You are '${req.user.role}'`,
      });
      return;
    }

    next();
  };
};

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
