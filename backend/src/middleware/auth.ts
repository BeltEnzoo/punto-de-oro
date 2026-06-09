import { Request, Response, NextFunction } from 'express';
import { Rol } from '@prisma/client';
import { verifyToken, JwtPayload } from '../lib/jwt.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  try {
    const token = authHeader.slice(7);
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function authorize(...roles: Rol[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (roles.length > 0 && !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'No autorizado' });
      return;
    }
    next();
  };
}

export function asyncHandler(
  fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  const message = err.message || 'Error interno del servidor';
  const status = message.includes('no encontrad') ? 404
    : message.includes('Ya existe') || message.includes('Cupo') ? 409
    : message.includes('inválid') || message.includes('requerid') ? 400
    : 500;
  res.status(status).json({ error: message });
}
