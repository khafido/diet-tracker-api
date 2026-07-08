import { Router, Request, Response } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const presets = await db('food_presets')
    .where({ user_id: req.userId })
    .orderBy('name', 'asc');

  res.json(presets);
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g } = req.body;

  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  const [preset] = await db('food_presets')
    .insert({
      user_id: req.userId,
      name,
      calories_per_100g: calories_per_100g ?? null,
      protein_per_100g: protein_per_100g ?? null,
      carbs_per_100g: carbs_per_100g ?? null,
      fat_per_100g: fat_per_100g ?? null,
    })
    .returning('*');

  res.status(201).json(preset);
});

export default router;
