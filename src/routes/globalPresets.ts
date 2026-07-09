import { Router, Request, Response } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const presets = await db('global_food_presets').orderBy('name', 'asc');
  res.json(presets);
});

export default router;
