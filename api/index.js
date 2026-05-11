/**
 * Vercel serverless: Express API (paths are /api/...).
 */
import serverless from 'serverless-http';
import { connectDb } from '../stats-calculator-platform/server/src/config/db.js';
import { createApp } from '../stats-calculator-platform/server/src/app.js';

await connectDb().catch(() => null);

const app = createApp();
export default serverless(app);
