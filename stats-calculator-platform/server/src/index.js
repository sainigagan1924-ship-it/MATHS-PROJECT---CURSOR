import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import calculateRoutes from './routes/calculateRoutes.js';
import savedRoutes from './routes/savedRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: clientOrigin.split(',').map((s) => s.trim()),
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

await connectDb().catch(() => null);

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
