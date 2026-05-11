# MATHS-PROJECT — Cursor

This repository contains the **StatsCalc Pro** full-stack statistics calculator application.

## Deploy on Vercel (fixes blank / `NOT_FOUND`)

1. Import this repo in [Vercel](https://vercel.com/new).
2. **Root Directory** — leave **empty** (use the repository root). Do **not** set it to `stats-calculator-platform`; `vercel.json` and `api/` live at the repo root on purpose.
3. Set env vars `MONGODB_URI` (optional) and optionally `CLIENT_ORIGIN` (see app README).
4. Redeploy.

## Project layout

| Path | Description |
|------|-------------|
| [`vercel.json`](./vercel.json), [`api/`](./api/) | Vercel build + serverless API |
| [`stats-calculator-platform/`](./stats-calculator-platform/) | React client, Express API source, MongoDB models, documentation |

Install and run instructions: **[stats-calculator-platform/README.md](./stats-calculator-platform/README.md)**.
