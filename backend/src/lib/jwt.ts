import jwt from 'jsonwebtoken';
import { Rol } from '@prisma/client';
import { env } from '../config/env.js';

export interface JwtPayload {
  userId: string;
  email: string;
  rol: Rol;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function sanitizeUser<T extends { password?: string }>(user: T): Omit<T, 'password'> {
  const { password: _, ...rest } = user;
  return rest;
}
