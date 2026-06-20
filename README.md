# The Cut — Health Tracker

A discipline / cut protocol tracker: daily non-negotiables (steps, protein, water),
an hour-by-hour timeline, a weekly training split, and weight + consistency progress
charts. Built with **React + Vite**, charts by **Recharts**, icons by **lucide-react**.

## Data & privacy

Each user's data is stored in a **per-device local database** (the browser's
`localStorage`) on their own phone or computer:

- Persists across refreshes and app restarts.
- Stays on the device — nothing is uploaded to any server.
- Is isolated per device/browser (it does **not** sync across devices).

Stored keys are namespaced under `thecut:` (e.g. `thecut:profile`,
`thecut:weightLog`, `thecut:summary`, `thecut:day:YYYY-MM-DD`). If `localStorage`
is unavailable (private mode / SSR), it falls back to in-memory storage for the
current session. An optional native `window.storage` bridge is used first when
present (e.g. inside a webview host).

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

## Deploy to Vercel

This repo is Vercel-ready via [`vercel.json`](./vercel.json) (framework: `vite`,
output: `dist`, SPA rewrite to `index.html`).

1. Go to [vercel.com/new](https://vercel.com/new) and import this GitHub repo.
2. Vercel auto-detects the Vite settings — just click **Deploy**.

Or via the CLI:

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

## Project structure

```
index.html          app shell
src/main.jsx        React entry
src/App.jsx         the entire app (UI + per-device storage layer)
vercel.json         Vercel deployment config
vite.config.js      Vite + React plugin
```
