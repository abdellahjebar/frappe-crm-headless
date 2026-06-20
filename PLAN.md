# CRM UI — Backend Decoupling Plan

## What We're Doing

Frappe CRM has one of the best open-source CRM frontends available. The problem: it is locked to the Frappe framework. You can't use it unless you run a full Frappe/ERPNext bench — a heavy Python stack with its own database, server, and conventions.

We're forking it and removing that lock-in. The goal is a standalone Vue 3 frontend that any backend can power — Node.js, Django, ASP.NET Core, Laravel, Spring Boot, Go, or anything else — by writing a single adapter file.

**What changes:** the wiring layer (how data is fetched, how sockets connect, how auth works).  
**What doesn't change:** every single UI component, page, layout, style, and animation. The app looks and behaves identically.

---

## Numbers

| Category | Count |
|----------|-------|
| Total source files | 393 |
| Vue components + pages | 333 |
| Files touched by decoupling | ~53 |
| Files never touched (pure UI) | 340 (86%) |
| Python backend files removed | 406 |

---

## Architecture After Decoupling

```
┌─────────────────────────────────────────────┐
│               Vue 3 Frontend                │
│   333 components · 22 pages · Pinia stores  │
│         (untouched, pure UI layer)          │
└──────────────────┬──────────────────────────┘
                   │ calls
┌──────────────────▼──────────────────────────┐
│              Adapter Interface              │
│   request() · auth.login() · auth.logout()  │
└──────┬───────────────────┬──────────────────┘
       │                   │
┌──────▼──────┐     ┌──────▼──────────┐
│   Frappe    │     │  Your Backend   │
│  (default)  │     │  (30-line file) │
└─────────────┘     └─────────────────┘
```

Any backend implements one contract:

```js
{
  request(method, endpoint, data, params) → Promise<any>,
  auth: {
    login(email, password) → Promise<void>,
    logout()               → Promise<void>,
    getUser()              → string | null,
  }
}
```

---

## Phases

### Phase 0 — Repo Restructure
> Clean up the Python backend and prepare the repo for frontend-only distribution.

**Actions:**
- Delete `crm/` — 406-file Python/Frappe backend app
- Delete `pyproject.toml` — Python project config
- Remove `frappe-ui/` git submodule — use npm package only
- Rewrite root `package.json` — remove Frappe bench scripts, add standard OSS scripts
- Add `.env.example` — document every environment variable

**Files changed:** root config files only  
**Risk:** None

---

### Phase 1 — Central Config (`src/config.js`)
> Replace scattered Frappe globals with a single config object.

Currently, configuration lives in three places at once:
- `window.site_name`, `window.csrf_token` — injected by Frappe's Jinja template
- `../../../../sites/common_site_config.json` — read off Frappe's disk at build time
- Hardcoded strings scattered across files

After this phase, one file controls everything:

```js
// src/config.js
export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL ?? window.backendUrl ?? '',
  socketUrl:  import.meta.env.VITE_SOCKET_URL  ?? window.socketUrl  ?? '',
  siteName:   import.meta.env.VITE_SITE_NAME   ?? window.site_name  ?? '',
  csrfToken:  import.meta.env.VITE_CSRF_TOKEN  ?? window.csrf_token ?? '',
}
```

Frappe users: set nothing, it reads from `window.*` as before.  
Everyone else: set `.env` variables and it just works.

**Files changed:** `main.js`, `socket.js`, new `src/config.js`  
**Risk:** Low

---

### Phase 2 — Adapter Interface (`src/api/`)
> The core of the whole project. Make the HTTP layer pluggable.

New folder structure:

```
src/api/
  index.js            ← setAdapter(), getAdapter(), request()
  adapters/
    frappe.js         ← default adapter, keeps Frappe working unchanged
    rest.js           ← generic REST template for new integrations
  endpoints.js        ← maps CRM operations to backend routes
```

The global `resourceFetcher` that Frappe CRM sets in `main.js` via `setConfig('resourceFetcher', frappeRequest)` is already the single injection point for all 91 data-fetching files. We replace `frappeRequest` with our adapter's `request` method — and all 91 files work with any backend without being touched individually.

**Frappe adapter (default):**
```js
// src/api/adapters/frappe.js
import { frappeRequest } from 'frappe-ui'
export const FrappeAdapter = {
  request: (method, endpoint, data) =>
    frappeRequest({ url: endpoint, method, body: data }),
  auth: {
    login:   (email, pwd) => frappeRequest({ url: 'login', method: 'POST', body: { usr: email, pwd } }),
    logout:  ()           => frappeRequest({ url: 'logout' }),
    getUser: ()           => new URLSearchParams(document.cookie.split('; ').join('&')).get('user_id'),
  },
}
```

**REST adapter (template):**
```js
// src/api/adapters/rest.js
import { config } from '../config'
export const RestAdapter = {
  request: (method, endpoint, data) =>
    fetch(`${config.backendUrl}/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: data ? JSON.stringify(data) : undefined,
    }).then(r => r.json()),
  auth: {
    login:   (email, pwd) => { /* set token in localStorage */ },
    logout:  ()           => { /* clear token */ },
    getUser: ()           => localStorage.getItem('user'),
  },
}
```

**Files changed:** `main.js` (one line swap) + new `src/api/` files  
**Risk:** Low

---

### Phase 3 — Endpoint Registry (`src/api/endpoints.js`)
> Map every CRM operation to a backend route. The bridge between frontend and backend.

Every API call in the app currently has a hardcoded Frappe dot-notation string like `crm.api.session.get_users` or `crm.fcrm.doctype.crm_lead.api.get_leads`. We extract all of them into one registry:

```js
// src/api/endpoints.js
export const endpoints = {
  // Session
  getUsers:           'crm.api.session.get_users',
  // Leads
  getLeads:           'crm.fcrm.doctype.crm_lead.api.get_leads',
  createLead:         'crm.fcrm.doctype.crm_lead.api.create_lead',
  updateLead:         'crm.fcrm.doctype.crm_lead.api.update_lead',
  deleteLead:         'crm.fcrm.doctype.crm_lead.api.delete_lead',
  convertLead:        'crm.fcrm.doctype.crm_lead.api.convert_to_deal',
  // Deals
  getDeals:           'crm.fcrm.doctype.crm_deal.api.get_deals',
  createDeal:         'crm.fcrm.doctype.crm_deal.api.create_deal',
  // Contacts
  getContacts:        'crm.api.contact.get_contacts',
  // ... all endpoints
}
```

For a Django backend, the integrator creates:
```js
// my-django-adapter/endpoints.js
import { setEndpoints } from 'crm-ui'
setEndpoints({
  getUsers:  'users/',
  getLeads:  'leads/',
  createLead: 'leads/',
  // ...
})
```

**Files changed:** 91 files (automated string replacement of hardcoded URLs → endpoint keys)  
**Risk:** Medium — large surface area, but mechanical

---

### Phase 4 — Socket Abstraction (`src/socket.js`)
> Remove the Frappe filesystem dependency from the real-time layer.

Currently `socket.js` does this:
```js
import { socketio_port } from '../../../../sites/common_site_config.json'
```
This imports a file that only exists inside a Frappe bench. It breaks immediately outside Frappe.

After:
```js
// src/socket.js
import { config } from './config'
import { io } from 'socket.io-client'
import { getCachedListResource, getCachedResource } from 'frappe-ui'

export function initSocket() {
  if (!config.socketUrl) return null  // socket is optional
  const socket = io(config.socketUrl, { withCredentials: true, reconnectionAttempts: 5 })
  socket.on('refetch_resource', (data) => {
    if (data.cache_key) {
      const resource = getCachedResource(data.cache_key) || getCachedListResource(data.cache_key)
      if (resource) resource.reload()
    }
  })
  return socket
}
```

Socket becomes opt-in: set `VITE_SOCKET_URL` to enable it, omit it to run without real-time.

**Files changed:** `socket.js` only  
**Risk:** Low

---

### Phase 5 — Boot Sequence (`src/main.js`)
> Remove the Frappe dev-context API call. Make startup work without a Frappe server.

Currently in development mode, the app calls `crm.www.crm.get_context_for_dev` — a Python method — before mounting. This populates `window.site_name`, `window.csrf_token`, etc. Without a running Frappe server, the app never boots.

After: the app reads from `.env` in dev mode, from `window.*` in production (Frappe still works), or from any other config source.

```js
// src/main.js — after
import { config } from './config'
import { setAdapter } from './api'
import { FrappeAdapter } from './api/adapters/frappe'

setAdapter(FrappeAdapter)  // swap this line to change backends

const socket = initSocket()
app.config.globalProperties.$socket = socket
app.mount('#app')
```

No API call before mount. No Frappe dependency to boot.

**Files changed:** `main.js` only  
**Risk:** Low

---

### Phase 6 — Auth Abstraction (`src/api/auth/`)
> Make login/logout/session pluggable.

New structure:
```
src/api/auth/
  index.js      ← setAuthStrategy(), login(), logout(), getUser()
  cookie.js     ← Frappe strategy (reads user_id cookie)
  token.js      ← Bearer token strategy (localStorage)
```

The `session.js` store calls `auth.login()` and `auth.logout()` — it doesn't care how they work.

**Files changed:** `stores/session.js` + new auth files  
**Risk:** Medium

---

### Phase 7 — Translation Layer (`src/i18n/`)
> Replace Frappe's injected `__()` with a real i18n solution.

Frappe injects a global `__()` function via its Jinja template. Outside Frappe, `__` is undefined and the app crashes.

After: we register `__` ourselves as a pass-through by default (strings render as-is, no translation needed to run), and make it pluggable for anyone who wants real i18n:

```js
// src/i18n/index.js
export function setupI18n(translationMap = {}) {
  window.__ = (str, args, context) => {
    const translated = translationMap[str] ?? str
    // handle arg substitution the same way Frappe does
    return args ? translated.replace(/\{(\d+)\}/g, (_, i) => args[i] ?? '') : translated
  }
}
```

Frappe users: nothing changes, Frappe still injects `__` before the app loads.  
Everyone else: call `setupI18n()` with no args and it works. Pass a translation map for real i18n.

**Files changed:** `translation.js` only  
**Risk:** Low

---

### Phase 8 — Vite Config Cleanup (`vite.config.js`)
> Remove Frappe-specific build plugin. Make it build like a normal Vite app.

The current `vite.config.js` imports `frappe-ui/vite` — a Frappe-specific Vite plugin that handles Jinja boot-data injection and copies the build output to Frappe's bench folder. It also reads from the local `frappe-ui/` submodule if present.

After: standard Vite config with a dev proxy to route `/api` calls to the backend:

```js
// vite.config.js — after
export default defineConfig({
  plugins: [vue(), vueJsx(), VitePWA(pwaConfig)],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: {
    proxy: {
      '/api': { target: process.env.VITE_BACKEND_URL, changeOrigin: true },
    }
  },
  build: {
    outDir: 'dist',
  }
})
```

**Files changed:** `vite.config.js`, `package.json`  
**Risk:** Medium — build output paths change

---

### Phase 9 — OSS Documentation
> Make it usable by the world.

| File | Content |
|------|---------|
| `README.md` | What it is, screenshots, quickstart, integration guide |
| `ADAPTERS.md` | Full guide to writing an adapter — the key integration doc |
| `examples/adapters/frappe.js` | Default Frappe adapter (reference) |
| `examples/adapters/express.js` | Node.js + Express |
| `examples/adapters/django.js` | Django REST Framework |
| `examples/adapters/aspnet.js` | ASP.NET Core |
| `examples/adapters/laravel.js` | Laravel |
| `examples/adapters/spring.js` | Spring Boot |
| `CONTRIBUTING.md` | How to contribute |

---

## Execution Order

| # | Phase | Files Changed | Risk |
|---|-------|--------------|------|
| 0 | Repo restructure | Python files deleted, root configs | None |
| 1 | Central config | 3 files + 1 new | Low |
| 2 | Adapter interface | 1 file + new `src/api/` | Low |
| 3 | Endpoint registry | 91 files (automated) | Medium |
| 4 | Socket abstraction | 1 file | Low |
| 5 | Boot sequence | 1 file | Low |
| 6 | Auth abstraction | 1 store + new files | Medium |
| 7 | Translation layer | 1 file | Low |
| 8 | Vite config | 2 files | Medium |
| 9 | Documentation | New files only | None |

**Total: ~100 files changed. 340 UI files untouched. Zero visual changes.**

---

## What Backend Integrators Do

After this project is done, integrating any backend takes one file and one config:

**Step 1 — Install**
```bash
npm install crm-ui  # or clone and build
```

**Step 2 — Write your adapter (~30 lines)**
```js
// my-adapter.js
export const MyAdapter = {
  request: async (method, endpoint, data) => {
    const res = await fetch(`/api/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: data ? JSON.stringify(data) : undefined,
    })
    return res.json()
  },
  auth: {
    login:   (email, pwd) => fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, pwd }) }),
    logout:  ()           => fetch('/api/auth/logout', { method: 'POST' }),
    getUser: ()           => localStorage.getItem('user_email'),
  },
}
```

**Step 3 — Wire it up**
```js
// main.js
import { setAdapter } from 'crm-ui'
import { MyAdapter } from './my-adapter'
setAdapter(MyAdapter)
```

**Step 4 — Map your endpoints**
```js
import { setEndpoints } from 'crm-ui'
setEndpoints({
  getUsers:  'users',
  getLeads:  'leads',
  getDeals:  'deals',
  // ...
})
```

That's it. Full CRM UI, your backend.
