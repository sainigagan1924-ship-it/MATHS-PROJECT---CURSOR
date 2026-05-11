import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import calculateRoutes from './routes/calculateRoutes.js';
import savedRoutes from './routes/savedRoutes.js';

/**
 * Allowed CORS origins: CLIENT_ORIGIN (comma-separated), plus this deployment on Vercel.
 */
function resolveCorsOrigins() {
  const fromEnv = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (process.env.VERCEL_URL) {
    fromEnv.push(`https://${process.env.VERCEL_URL}`);
  }
  return fromEnv;
}

/**
 * Creates the Express app (no listen). Used locally and on Vercel serverless.
 */
export function createApp() {
  const app = express();
  const origins = resolveCorsOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (origins.length === 0) return callback(null, true);
        if (origins.some((o) => origin === o || origin.startsWith(o))) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'stats-calculator-api' });
  });

  app.use('/api/calculate', calculateRoutes);
  app.use('/api/saved', savedRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
