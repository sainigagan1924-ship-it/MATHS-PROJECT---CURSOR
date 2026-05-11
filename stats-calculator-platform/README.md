# StatsCalc Pro

Full-stack statistics calculator platform: **React + Tailwind**, **Node + Express**, **MongoDB**, **Recharts**, **KaTeX**, and **jStat** for distribution math.

## Features

- Hypothesis testing flows (1–3), Z-tests, T-tests (one/two/paired), chi-square independence, one-way ANOVA
- Step-by-step manual working plus jStat-based p-values and critical values
- Distribution plots (density, rejection shading, p-value tail, critical and test statistic markers)
- Reference tables (Z, t, χ², F) in a searchable modal when working on a test
- Save runs to MongoDB, optional share token, PDF export, copy summary, dark mode, compare two tests side-by-side

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas) if you want **saved calculations**; the API still runs without it (saves return 503 until connected)

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env: MONGODB_URI, PORT (default 5000), CLIENT_ORIGIN (e.g. http://localhost:5173)
npm install
npm run dev
```

### 2. Frontend

```bash
cd client
cp .env.example .env   # optional; leave empty to use Vite proxy to /api
npm install
npm run dev
```

Open **http://localhost:5173**. API requests go to `/api`, proxied to the Express server in development.

## Production build (frontend)

```bash
cd client
npm run build
npm run preview   # optional local preview of static build
```

Serve the `client/dist` folder with any static host and point `VITE_API_URL` (at build time) to your public API URL, or put the API behind the same origin reverse proxy.

## Deploy on Vercel ([Vercel dashboard](https://vercel.com))

`vercel.json` and `api/` are at the **repository root** (parent of this folder). The **Vite** build and **Express** serverless handler deploy on the same origin (`/api/...` needs no `VITE_API_URL`).

1. In [Vercel](https://vercel.com/new), **Import** the GitHub repository.
2. **Root Directory** — leave **empty** (repository root). If you previously set `stats-calculator-platform`, clear it and redeploy.
3. **Environment variables** (Production + Preview as needed):
   - `MONGODB_URI` — MongoDB Atlas connection string (optional; saves disabled if empty).
   - `CLIENT_ORIGIN` — Your live URL(s), comma-separated (optional; `VERCEL_URL` is added for CORS automatically).
4. Deploy. Vercel runs root `npm ci`, installs client + server, builds `stats-calculator-platform/client`, serves `client/dist`, and routes `/api/*` to `api/index.js`.

Local: from the **repo root**, run `vercel dev` ([Vercel CLI](https://vercel.com/docs/cli)).

## API overview

| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/health` | Health check |
| GET | `/api/calculate/tests` | List supported `testId` values |
| POST | `/api/calculate/:testId` | Run calculation (JSON body) |
| GET | `/api/saved?limit=30` | List saved calculations |
| POST | `/api/saved` | Save (`testId`, `testLabel`, `inputs`, optional `resultSnapshot`, `generateShare`) |
| DELETE | `/api/saved/:id` | Delete saved item |
| GET | `/api/saved/share/:token` | Load shared snapshot |

## Deployment (other hosts)

If you do **not** use Vercel’s combined static + serverless setup:

1. Deploy MongoDB (Atlas recommended) and set `MONGODB_URI`.
2. Deploy API (e.g. Railway, Render, Fly.io): set env vars, `npm install`, `npm start` in `server/`.
3. Build client with `VITE_API_URL=https://your-api.example.com` so the browser calls the deployed API.
4. Configure CORS: set `CLIENT_ORIGIN` to your frontend origin(s), comma-separated if multiple.

## Project layout

```
repo root/
├── vercel.json      # Vercel (see parent README)
├── api/index.js     # Serverless Express entry
stats-calculator-platform/
├── client/          # Vite + React
│   └── src/
│       ├── components/   # Charts, KaTeX, tables, results
│       ├── pages/        # Home, Test, About, Formulas, History, Compare, Share
│       ├── data/         # Test definitions & table builders
│       └── utils/        # API client, PDF export
└── server/        # Express API
    └── src/
        ├── controllers/
        ├── routes/
        ├── services/     # statsService.js, distributionPlots.js
        └── models/       # SavedCalculation (MongoDB)
```

## License

Educational use. Verify critical coursework with your instructor or textbook.
