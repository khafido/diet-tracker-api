import { Router, Request, Response } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const date = req.query.date as string | undefined;

  if (!date || !DATE_RE.test(date)) {
    res.status(400).json({ error: 'Query param "date" is required and must be YYYY-MM-DD' });
    return;
  }

  const entries = await db('food_entries')
    .where({ user_id: req.userId, date })
    .orderBy('time', 'asc');

  res.json(entries);
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { date, time, meal_type, name, weight_g, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g } = req.body;

  if (!date || !time || !meal_type || !name || weight_g == null) {
    res.status(400).json({ error: 'date, time, meal_type, name, and weight_g are required' });
    return;
  }

  if (!MEAL_TYPES.includes(meal_type)) {
    res.status(400).json({ error: `meal_type must be one of: ${MEAL_TYPES.join(', ')}` });
    return;
  }

  if (typeof weight_g !== 'number' || weight_g < 0) {
    res.status(400).json({ error: 'weight_g must be a non-negative number' });
    return;
  }

  const [entry] = await db('food_entries')
    .insert({
      user_id: req.userId,
      date,
      time,
      meal_type,
      name,
      weight_g,
      calories_per_100g: calories_per_100g ?? null,
      protein_per_100g: protein_per_100g ?? null,
      carbs_per_100g: carbs_per_100g ?? null,
      fat_per_100g: fat_per_100g ?? null,
    })
    .returning('*');

  res.status(201).json(entry);
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const existing = await db('food_entries').where({ id }).first();

  if (!existing) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  if (existing.user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { date, time, meal_type, name, weight_g, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g } = req.body;

  if (meal_type && !MEAL_TYPES.includes(meal_type)) {
    res.status(400).json({ error: `meal_type must be one of: ${MEAL_TYPES.join(', ')}` });
    return;
  }

  if (weight_g !== undefined && (typeof weight_g !== 'number' || weight_g < 0)) {
    res.status(400).json({ error: 'weight_g must be a non-negative number' });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (date !== undefined) updates.date = date;
  if (time !== undefined) updates.time = time;
  if (meal_type !== undefined) updates.meal_type = meal_type;
  if (name !== undefined) updates.name = name;
  if (weight_g !== undefined) updates.weight_g = weight_g;
  if (calories_per_100g !== undefined) updates.calories_per_100g = calories_per_100g;
  if (protein_per_100g !== undefined) updates.protein_per_100g = protein_per_100g;
  if (carbs_per_100g !== undefined) updates.carbs_per_100g = carbs_per_100g;
  if (fat_per_100g !== undefined) updates.fat_per_100g = fat_per_100g;

  const [updated] = await db('food_entries')
    .where({ id })
    .update(updates)
    .returning('*');

  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const existing = await db('food_entries').where({ id }).first();

  if (!existing) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  if (existing.user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await db('food_entries').where({ id }).del();

  res.json({ success: true });
});

export default router;
