import { Router, Request, Response } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';
import { calculateGoals } from '../lib/calculateGoals';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const profile = await db('user_profile')
    .where({ user_id: req.userId })
    .first();

  res.json(profile || null);
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { age, sex, height_cm, weight_kg, activity_level, goal_type } = req.body;

  if (!age || !sex || !height_cm || !weight_kg || !activity_level || !goal_type) {
    res.status(400).json({ error: 'age, sex, height_cm, weight_kg, activity_level, and goal_type are required' });
    return;
  }

  const profile = {
    user_id: req.userId,
    age,
    sex,
    height_cm,
    weight_kg,
    activity_level,
    goal_type,
    updated_at: db.fn.now(),
  };

  await db('user_profile')
    .insert(profile)
    .onConflict('user_id')
    .merge();

  const goals = calculateGoals({ age, sex, height_cm, weight_kg, activity_level, goal_type });

  await db('user_goals')
    .insert({ user_id: req.userId, ...goals })
    .onConflict('user_id')
    .merge();

  res.json(goals);
});

export default router;
