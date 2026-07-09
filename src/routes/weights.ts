import { Router, Request, Response } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { date, from, to } = req.query as Record<string, string | undefined>;

  if (date) {
    if (!DATE_RE.test(date)) {
      res.status(400).json({ error: 'Query param "date" must be YYYY-MM-DD' });
      return;
    }

    const entry = await db('weight_entries')
      .where({ user_id: req.userId, date })
      .first();

    res.json(entry ?? null);
    return;
  }

  if (from || to) {
    let query = db('weight_entries')
      .where({ user_id: req.userId })
      .orderBy('date', 'desc');

    if (from && DATE_RE.test(from)) {
      query = query.where('date', '>=', from);
    }
    if (to && DATE_RE.test(to)) {
      query = query.where('date', '<=', to);
    }

    const entries = await query;
    res.json(entries);
    return;
  }

  res.status(400).json({ error: 'Provide "date" or "from"/"to" query params' });
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { date, weight_kg } = req.body;

  if (!date || weight_kg == null) {
    res.status(400).json({ error: 'date and weight_kg are required' });
    return;
  }

  if (typeof weight_kg !== 'number' || weight_kg <= 0) {
    res.status(400).json({ error: 'weight_kg must be a positive number' });
    return;
  }

  const [entry] = await db('weight_entries')
    .insert({ user_id: req.userId, date, weight_kg })
    .onConflict(['user_id', 'date'])
    .merge({ weight_kg })
    .returning('*');

  await db('user_profile')
    .where({ user_id: req.userId })
    .update({ weight_kg, updated_at: db.fn.now() });

  res.status(201).json(entry);
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const existing = await db('weight_entries').where({ id }).first();

  if (!existing) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  if (existing.user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await db('weight_entries').where({ id }).del();

  res.json({ success: true });
});

export default router;
