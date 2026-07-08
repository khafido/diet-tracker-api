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

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const existing = await db('food_presets').where({ id }).first();

  if (!existing) {
    res.status(404).json({ error: 'Preset not found' });
    return;
  }

  if (existing.user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (calories_per_100g !== undefined) updates.calories_per_100g = calories_per_100g;
  if (protein_per_100g !== undefined) updates.protein_per_100g = protein_per_100g;
  if (carbs_per_100g !== undefined) updates.carbs_per_100g = carbs_per_100g;
  if (fat_per_100g !== undefined) updates.fat_per_100g = fat_per_100g;

  const [updated] = await db('food_presets')
    .where({ id })
    .update(updates)
    .returning('*');

  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const existing = await db('food_presets').where({ id }).first();

  if (!existing) {
    res.status(404).json({ error: 'Preset not found' });
    return;
  }

  if (existing.user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await db('food_presets').where({ id }).del();

  res.json({ success: true });
});

export default router;
