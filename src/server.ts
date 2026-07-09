import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import db from './db';
import authRoutes from './routes/auth';
import entriesRoutes from './routes/entries';
import goalsRoutes from './routes/goals';
import profileRoutes from './routes/profile';
import presetsRoutes from './routes/presets';
import globalPresetsRoutes from './routes/globalPresets';
import weightsRoutes from './routes/weights';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from './swagger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
app.use('/api/goals', goalsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/presets', presetsRoutes);
app.use('/api/global-presets', globalPresetsRoutes);
app.use('/api/weights', weightsRoutes);

// if NODE_ENV is undefined, don't serve the docs (assume production)
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
