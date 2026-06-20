# CRM UI

**A production-grade CRM frontend that works with any backend.**

Built on top of [Frappe CRM](https://github.com/frappe/crm) — one of the most polished open-source CRM interfaces available — with the backend completely decoupled. Point it at your own API and get a fully functional CRM in minutes.

> **v0.1 — Adapter Release.** The UI is complete and backend-agnostic via a pluggable adapter pattern. See the [roadmap](#roadmap) for the planned zero-adapter REST spec approach.

---

## Why

Frappe CRM has an exceptional UI. But running it requires the full Frappe framework — a heavy Python stack with its own database conventions, deployment model, and learning curve.

This project strips that requirement. Keep the UI. Bring your own backend.

| | Frappe CRM | CRM UI |
|---|---|---|
| Backend required | Frappe + MariaDB + Redis | Any — Express, Django, Laravel, ASP.NET, Spring |
| Auth | Frappe sessions | Your own auth |
| Deployment | bench CLI | `yarn build` → static files |
| UI | ✅ | ✅ identical |

---

## Features

- **Leads** — list, kanban, group-by views with filters and sorting
- **Deals** — pipeline management with stage tracking
- **Contacts & Organizations** — full relationship management
- **Activities** — calls, emails, notes, tasks in a unified timeline
- **Dashboard** — charts and KPIs
- **Calendar** — event and task scheduling
- **Notifications** — real-time updates via WebSocket
- **Dark / Light mode** — built-in theme switching
- **Mobile responsive** — dedicated mobile layouts
- **PWA** — installable on desktop and mobile

---

## Quick Start

```bash
git clone https://github.com/abdellahjebar/frappe-crm-headless.git
cd frappe-crm-headless/frontend
yarn install
cp .env.example .env.development
# Edit .env.development — set VITE_BACKEND_URL to your API
yarn dev
```

Visit `http://localhost:5173`.

---

## Connecting Your Backend

The frontend communicates with your backend through an **adapter** — a small object that maps CRM operations to your API.

### Step 1 — Write your adapter

Create `frontend/src/api/adapters/my-backend.js`:

```js
export const MyBackendAdapter = {
  async request(method, endpoint, data, params) {
    const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/${endpoint}`)
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

    const res = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    const json = await res.json()
    // Wrap your response so frappe-ui can consume it
    return { message: json }
  },

  auth: {
    async login(email, password) {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const { token, user } = await res.json()
      localStorage.setItem('token', token)
      localStorage.setItem('user', user)
    },
    async logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    getUser() {
      return localStorage.getItem('user')
    },
  },
}
```

### Step 2 — Register it

In `frontend/src/main.js`:

```js
import { MyBackendAdapter } from './api/adapters/my-backend'
setAdapter(MyBackendAdapter)
```

### Step 3 — Configure your backend URL

In `.env.development`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

See [ADAPTERS.md](./ADAPTERS.md) for the full guide including the complete endpoint reference and example adapters for Express, Django, Laravel, ASP.NET Core, and Spring Boot.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Vue 3 Frontend                  │
│                                                  │
│   Pages → Components → Stores → API Layer       │
│                                   │              │
│                           setAdapter()           │
│                                   │              │
│           ┌───────────────────────┴───────────┐  │
│           │          Your Adapter             │  │
│           │  request()  auth.login()          │  │
│           │  auth.logout()  auth.getUser()    │  │
│           └───────────────────────┬───────────┘  │
└───────────────────────────────────┼─────────────┘
                                    │
               ┌────────────────────┴───────────────┐
               │            Your Backend             │
               │  Express · Django · Laravel         │
               │  ASP.NET Core · Spring Boot · Go   │
               └─────────────────────────────────────┘
```

### Key files

| File | Purpose |
|---|---|
| `frontend/src/api/index.js` | Adapter registry — `setAdapter()`, `getAdapter()`, `request()` |
| `frontend/src/api/adapters/frappe.js` | Default Frappe adapter |
| `frontend/src/api/adapters/rest.js` | Template — copy this to write your own adapter |
| `frontend/src/api/endpoints.js` | All ~60 API endpoints the CRM uses, named and documented |
| `frontend/src/config.js` | Central config — backend URL, socket URL, site name |
| `frontend/src/stores/session.js` | Auth state — reads from `adapter.auth.getUser()` |

---

## Environment Variables

```env
# Required
VITE_BACKEND_URL=http://localhost:8000     # Your API base URL

# Optional
VITE_SOCKET_URL=http://localhost:9000      # WebSocket server for real-time notifications
VITE_BASE_URL=/                            # Router base path (default: /crm in production)

# Dev only — bypasses login for UI development without a backend
VITE_DEV_USER=dev@example.com
```

---

## Development Without a Backend

To explore the full UI without running any backend:

```env
# frontend/.env.development
VITE_DEV_USER=dev@example.com
```

This bypasses the login check so all components render. API calls fail silently — the full UI structure, navigation, and layout are explorable.

---

## Building for Production

```bash
cd frontend
yarn build
```

Output in `frontend/dist/` — static files you can serve from any CDN, Nginx, or web server.

```nginx
server {
  root /var/www/crm-ui/dist;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://your-backend:3000;
  }
}
```

---

## Roadmap

### v0.1 — Current
- ✅ Complete CRM UI decoupled from Frappe backend
- ✅ Pluggable adapter pattern
- ✅ Default Frappe-compatible adapter
- ✅ Vue-native login page
- ✅ Dev mode — full UI without any backend
- ✅ All ~60 endpoints documented in one file

### v0.2 — Planned
- [ ] Standardized REST spec — no adapter needed, just implement the URL contract
- [ ] Response normalization layer — adapters handle field mapping automatically
- [ ] Example adapters — Express, Django, Laravel, ASP.NET Core, Spring Boot
- [ ] Mock adapter — complete UI with realistic fake data

### v0.3 — Future
- [ ] Replace frappe-ui data primitives with backend-agnostic composables
- [ ] Plugin system for custom pages and fields
- [ ] Theme customization API

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Acknowledgements

This project is a fork of [Frappe CRM](https://github.com/frappe/crm) by [Frappe Technologies](https://frappe.io). All UI components and design are their work. This project only decouples the backend layer.

## License

MIT. The original Frappe CRM is also MIT licensed.

This project is not affiliated with or endorsed by Frappe Technologies.
