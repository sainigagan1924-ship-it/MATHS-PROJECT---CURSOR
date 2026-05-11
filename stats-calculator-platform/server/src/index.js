import 'dotenv/config';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;

const app = createApp();

await connectDb().catch(() => null);

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
