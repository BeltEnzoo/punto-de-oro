import { Response } from 'express';
import { AuthRequest, asyncHandler } from '../../middleware/auth.js';
import { dashboardService } from './dashboard.service.js';

export const getStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await dashboardService.getStats();
  res.json(stats);
});
