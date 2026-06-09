import { AuthRequest, asyncHandler } from '../../middleware/auth.js';
import { authService } from './auth.service.js';
import { Response } from 'express';

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password);
  res.json(result);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);
  res.json(user);
});
