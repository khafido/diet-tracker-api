import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const existing = await db('users').where({ username }).first();
  if (existing) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);

  const [{ id: userId }] = await db('users')
    .insert({ username, password_hash })
    .returning('id');

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '365d' });

  res.status(201).json({ token });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = await db('users').where({ username }).first();
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '365d' });

  res.json({ token });
});

export default router;
