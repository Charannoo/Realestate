# Urbanova — Hyderabad metropolitan marketplace

This repo implements the **Urbanova.** SPA — branded real estate tooling for Hyderabad’s metro corridors.

- GHMC core, **Secunderabad / Cyberabad** tech belts  
- Outer Ring (**ORR**) growth neighbourhoods  
- Peri‑urban **Ranga Reddy**, **Medchal**, and **Sangareddy** style corridors aligned with plausible **500xxx / 501xxx** postal bands  

The **public catalogue** defaults to **Hyderabad‑metro‑scoped listings** on `GET /api/properties`. Administrators can retrieve the **full Supabase table** with `GET /api/properties?scope=all` and a valid admin JWT (`token: Bearer …` header).

---

## Monorepo layout

```
real-estate-platform/
├── client/          React 19 · Vite 7 · React Router · Framer Motion
├── server/          Express 5 · Supabase JS · JWT auth · uploads/
├── sql/             Schema (`schema.sql`) + migrations & Supabase helpers
├── docs/            Design / prompt notes (e.g. `FRONTEND_LOVABLE.md`, `MASTER_PROMPT.md`)
├── scripts/         Local setup (`setup.ps1`) & dev helpers (HTML key tester, CLI smoke tests)
└── …                Root `package.json` orchestrates `client` / `server` workflows
```

---

## Prerequisites

- **Node.js** 18+
- **Supabase** project (`SUPABASE_URL` or `VITE_SUPABASE_URL`, plus `SUPABASE_SERVICE_ROLE_KEY` for server inserts or permissive dev RLS — see [`server/scripts/checkEnv.js`](server/scripts/checkEnv.js))
- **`server/config/supabase.js`** uses **`SUPABASE_SERVICE_ROLE_KEY`** when set, otherwise **`VITE_SUPABASE_PUBLISHABLE_KEY`**; URL from **`SUPABASE_URL`** or **`VITE_SUPABASE_URL`**.

Optional:

- **`OPENROUTER_API_KEY`** — `/api/ai/chat` & `/api/ai/negotiate` (otherwise those routes return HTTP 503)
- **`OPENROUTER_SITE_URL`** — public SPA origin passed to OpenRouter as `HTTP-Referer` (defaults to `http://localhost:5173`)
- **`NOMINATIM_CONTACT_EMAIL`** — respectful usage of OSM Nominatim for geo tooling

---

## Quick start (repo root)

**Windows (recommended):**

```powershell
.\scripts\setup.ps1
```

**Manual:**

```bash
npm install
cd server && npm install && cd ../client && npm install
```

Create **`server/.env`** (copied from `server/.env.example` if present), then validate:

```bash
npm run check:env
```

Run **both** tiers:

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:5000 |
| Vite SPA | http://localhost:5173 (or next free port — see terminal) |

---

## Hyderabad demo seed

Upsert fourteen curated **Hyderabad‑locality** placeholders (repeatable):

```bash
npm run seed:hyderabad
```

Requires DB columns per **`sql/migrate_hyderabad_geo_feed.sql`** for `external_id`, `source`, geo fields (`upsert` on `external_id`).

Admin UI can also mint additional **metro-only demos** via *Generate Properties* (templates are **Greater Hyderabad**, not statewide).

---

## Notable HTTP routes

- **Public catalogue (metro‑filtered):** `GET /api/properties`
- **Full catalogue (admin):** `GET /api/properties?scope=all` + admin `token`
- Single listing: `GET /api/properties/:uuid`
- Auth: `/api/auth/*`
- Hyderabad geo / enrichment: `/api/geo/*`
- Assistant: `/api/ai/chat`, `/api/ai/negotiate`

---

## Front-end routes

`/`, `/properties`, `/property/:id`, `/add`, `/seller`, marketing pages, `/bvy-estate` → `/admin`, `/api-test`.

---

## Legal / product reality

Demo listings use illustrative **Hyderabad-linked** Wikimedia Commons photography (with optional `image_credit` when that column exists). Verified live inventory should use **your own** media plus consent and any **RERA / regional** disclaimers for your jurisdictions; persist provenance via **`source`** / **`external_id`**.

---

## Contributing workflow

From repo root, lint + build the SPA:

```bash
npm run verify
```

Or manually: `cd client && npm run lint && npm run build`

---

Urbanova HYDERABAD scope is enforced in **`server/routes/properties.js`** via `HYDERABAD_METRO_OR`. Adjust predicates there if your commercial definition of “metro” evolves.
