import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import db from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'unreachable' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
