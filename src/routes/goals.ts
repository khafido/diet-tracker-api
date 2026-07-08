import { Router, Request, Response } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const goals = await db('user_goals')
    .where({ user_id: req.userId })
    .first();

  res.json(goals || null);
});

router.put('/', async (req: Request, res: Response): Promise<void> => {
  const { daily_calories, protein, carbs, fat } = req.body;

  const row = {
    user_id: req.userId,
    daily_calories: daily_calories ?? null,
    protein: protein ?? null,
    carbs: carbs ?? null,
    fat: fat ?? null,
  };

  await db('user_goals')
    .insert(row)
    .onConflict('user_id')
    .merge();

  const goals = await db('user_goals')
    .where({ user_id: req.userId })
    .first();

  res.json(goals);
});

export default router;
