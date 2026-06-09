import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { signToken, sanitizeUser } from '../../lib/jwt.js';
import { parseBody, loginSchema } from '../../lib/validators.js';

export class AuthService {
  async login(email: string, password: string) {
    const data = parseBody(loginSchema, { email, password });

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.activo) {
      throw new Error('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new Error('Credenciales inválidas');
    }

    const token = signToken({ userId: user.id, email: user.email, rol: user.rol });
    return { token, user: sanitizeUser(user) };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');
    return sanitizeUser(user);
  }
}

export const authService = new AuthService();
