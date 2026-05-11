/**
 * Vercel serverless entry: Express app (rewrites send /api/* here).
 */
import serverless from 'serverless-http';
import { connectDb } from '../server/src/config/db.js';
import { createApp } from '../server/src/app.js';

await connectDb().catch(() => null);

const app = createApp();
export default serverless(app);
