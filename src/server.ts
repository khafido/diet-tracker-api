import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import db from './db';
import authRoutes from './routes/auth';
import entriesRoutes from './routes/entries';

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

app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
