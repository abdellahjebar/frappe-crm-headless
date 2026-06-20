# frappe-crm-headless — Roadmap

## What This Is

A fork of Frappe CRM with the backend completely removed. The UI is identical. Anyone who needs a CRM frontend clones this, points it at their own backend, and ships.

**Current state (v0.1):** UI decoupled, adapter pattern in place, dev mode works. The user still has to write a small adapter file to connect their backend.

**End goal:** clone → set `VITE_BACKEND_URL` → implement a REST spec → full CRM works. No adapter code. No JavaScript to touch.

---

## v0.2 — REST Spec

**Goal:** user sets one env var and implements a documented REST contract. Zero adapter code on their side.

### What changes
- Define clean REST routes for every CRM operation (`GET /api/leads`, `POST /api/deals/:id`, etc.)
- Build a mapping layer inside the default adapter that translates Frappe-style calls → clean REST automatically — no component code changes needed
- Make the REST adapter the default — user never sees "adapter" in the docs
- Write `API_SPEC.md` — every endpoint, method, request body, response shape, documented

### What the user does
1. Clone the repo
2. Set `VITE_BACKEND_URL=https://their-api.com` in `.env`
3. Implement ~30 routes from the spec in any language
4. Done — full CRM works

### Files changed
- `frontend/src/api/index.js` — REST mapping layer
- `frontend/src/api/adapters/rest.js` — clean REST adapter (becomes default)
- `frontend/main.js` — swap default adapter
- `API_SPEC.md` — new file
- `README.md` — update quick start

---

## v0.3 — Fix Broken UI

**Goal:** every panel and interaction works end to end.

### What's broken right now
- Create lead / deal panels — crash without backend response
- Profile dropdown — needs user data
- Filters and saved views — need backend
- Notifications — need backend

### What changes
- Audit every panel and interaction
- Fix each one to handle missing/loading/error states gracefully
- No crashes, no blank panels — either works or shows a clean empty state

---

## v0.4 — Mock Adapter

**Goal:** full interactive CRM with zero backend, zero setup.

### What it does
- Ships with realistic fake data — leads, deals, contacts, organizations, activities, notes
- All CRUD works in memory (create a lead → it appears in the list)
- Toggle with `VITE_MOCK=true` in the env file
- Useful for: demos, client presentations, UI contributions, evaluating the project

### What the user does
```env
# .env.development
VITE_MOCK=true
```
Full CRM, no backend.

---

## v0.5 — Reference Backend

**Goal:** a backend that already implements the REST spec, ready to fork and use.

### What it is
- Express + SQLite — zero cloud dependency, runs anywhere Node runs
- JWT auth
- Every endpoint from the v0.2 spec implemented
- Swap SQLite → Postgres with one config change
- Lives in `/backend` in the same repo

### What the user does
- Want a working CRM without building a backend: fork `/backend`, run it, done
- Want their own backend: use it as a reference for what to implement

---

## v0.6 — Docker + Deploy

**Goal:** one command, full working CRM.

### What ships
- `Dockerfile` for frontend (Nginx serving built static files)
- `Dockerfile` for backend (Node)
- `docker-compose.yml` — starts both together, wired up

```bash
docker compose up
# → CRM running at localhost:3000
```

### Deployment guides
- Railway — push to deploy
- Render — free tier
- VPS — Nginx + PM2 setup

---

## Summary

| Version | What it delivers |
|---|---|
| v0.1 ✅ | UI decoupled, adapter pattern, dev mode, docs |
| v0.2 | REST spec — set URL, implement contract, done |
| v0.3 | Every panel works, no crashes |
| v0.4 | Full CRM demo with zero backend |
| v0.5 | Reference backend ready to fork |
| v0.6 | `docker compose up` → working CRM |

---

## Non-goals

- Replacing frappe-ui's component library — the UI stays identical to Frappe CRM
- Building AI features — out of scope until the core is solid
- Multi-tenancy — that's the backend's responsibility
