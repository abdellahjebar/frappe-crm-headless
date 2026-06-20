# Contributing

Thank you for your interest in contributing to CRM UI.

---

## Ways to Contribute

- **Report bugs** — open an issue with steps to reproduce
- **Write an adapter** — for a backend not yet covered (Go, Ruby on Rails, FastAPI, etc.)
- **Improve docs** — clarify the adapter guide or endpoint reference
- **Fix bugs** — pick an open issue and submit a PR
- **Shape v0.2** — join the discussion on the REST spec design

---

## Development Setup

```bash
git clone https://github.com/abdellahjebar/frappe-crm-headless.git
cd frappe-crm-headless/frontend
yarn install

# Set dev user so you can see the UI without a backend
echo "VITE_DEV_USER=dev@example.com" > .env.development
echo "VITE_BASE_URL=/" >> .env.development

yarn dev
```

---

## Project Structure

```
crm-ui/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── index.js          # Adapter registry
│   │   │   ├── endpoints.js      # All API endpoints
│   │   │   └── adapters/
│   │   │       ├── frappe.js     # Default Frappe adapter
│   │   │       └── rest.js       # Template for custom adapters
│   │   ├── components/           # All UI components (unchanged from Frappe CRM)
│   │   ├── pages/                # Route-level page components
│   │   ├── stores/               # Pinia stores
│   │   ├── config.js             # Central config
│   │   ├── router.js             # Vue Router
│   │   ├── socket.js             # WebSocket (optional)
│   │   └── main.js               # App entry point
│   ├── .env.example
│   └── vite.config.js
├── README.md
├── ADAPTERS.md
└── CONTRIBUTING.md
```

---

## Submitting a PR

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-change`
3. Make your change
4. Test it: `yarn dev` and verify the UI works
5. Open a PR with a clear description of what changed and why

---

## Writing an Adapter PR

If you're contributing a new adapter:

1. Create `frontend/src/api/adapters/<backend-name>.js`
2. Follow the interface in [ADAPTERS.md](./ADAPTERS.md)
3. Add it to the example adapters section in `ADAPTERS.md`
4. Include a minimal backend example showing what routes to implement

---

## Principles

- **Zero visual changes** — the UI must remain pixel-identical to Frappe CRM
- **No new dependencies** unless clearly justified
- **Adapters are external** — the core repo ships no backend-specific code beyond the Frappe adapter
- **Document the why** — if you change something non-obvious, explain it in the PR
