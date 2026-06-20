# Adapter Guide

An adapter is the only thing you need to write to connect CRM UI to your backend. It's a plain JavaScript object with two properties: `request` and `auth`.

---

## Interface

```ts
interface Adapter {
  request(
    method: string,       // 'GET' | 'POST' | 'PUT' | 'DELETE'
    endpoint: string,     // The Frappe-style endpoint name, e.g. 'frappe.client.get_list'
    data?: object,        // Request body
    params?: object       // Query string parameters
  ): Promise<{ message: any }>

  auth: {
    login(email: string, password: string): Promise<void>
    logout(): Promise<void>
    getUser(): string | null   // Returns current user email or null
  }
}
```

The `request` method must return `{ message: <your data> }`. This is the envelope frappe-ui expects. Everything else is up to you.

---

## Registering Your Adapter

```js
// frontend/src/main.js
import { setAdapter } from './api'
import { MyAdapter } from './api/adapters/my-adapter'

setAdapter(MyAdapter)
```

---

## Example Adapters

### Express (Node.js)

```js
// frontend/src/api/adapters/express.js
const BASE = import.meta.env.VITE_BACKEND_URL

export const ExpressAdapter = {
  async request(method, endpoint, data, params) {
    const url = new URL(`${BASE}/api/${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, v)
      })
    }

    const res = await fetch(url.toString(), {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('crm_token')}`,
      },
      body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    })

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const json = await res.json()
    return { message: json }
  },

  auth: {
    async login(email, password) {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const { token, user } = await res.json()
      localStorage.setItem('crm_token', token)
      localStorage.setItem('crm_user', user)
    },
    async logout() {
      await fetch(`${BASE}/auth/logout`, { method: 'POST' })
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    },
    getUser() {
      return localStorage.getItem('crm_user')
    },
  },
}
```

---

### Django (Python)

```js
// frontend/src/api/adapters/django.js
const BASE = import.meta.env.VITE_BACKEND_URL

function getCsrfToken() {
  return document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? ''
}

export const DjangoAdapter = {
  async request(method, endpoint, data, params) {
    const url = new URL(`${BASE}/api/${endpoint}/`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, v)
      })
    }

    const res = await fetch(url.toString(), {
      method: method || 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    })

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const json = await res.json()
    return { message: json }
  },

  auth: {
    async login(email, password) {
      const res = await fetch(`${BASE}/auth/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const { user } = await res.json()
      localStorage.setItem('crm_user', user)
    },
    async logout() {
      await fetch(`${BASE}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCsrfToken() },
      })
      localStorage.removeItem('crm_user')
    },
    getUser() {
      return localStorage.getItem('crm_user')
    },
  },
}
```

---

### Laravel (PHP)

```js
// frontend/src/api/adapters/laravel.js
const BASE = import.meta.env.VITE_BACKEND_URL

export const LaravelAdapter = {
  async request(method, endpoint, data, params) {
    const url = new URL(`${BASE}/api/${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, v)
      })
    }

    const res = await fetch(url.toString(), {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('crm_token')}`,
      },
      body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    })

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const json = await res.json()
    return { message: json }
  },

  auth: {
    async login(email, password) {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const { token, user } = await res.json()
      localStorage.setItem('crm_token', token)
      localStorage.setItem('crm_user', user.email)
    },
    async logout() {
      await fetch(`${BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crm_token')}` },
      })
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    },
    getUser() {
      return localStorage.getItem('crm_user')
    },
  },
}
```

---

### ASP.NET Core (C#)

```js
// frontend/src/api/adapters/dotnet.js
const BASE = import.meta.env.VITE_BACKEND_URL

export const DotNetAdapter = {
  async request(method, endpoint, data, params) {
    const url = new URL(`${BASE}/api/${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, v)
      })
    }

    const res = await fetch(url.toString(), {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('crm_token')}`,
      },
      body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    })

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const json = await res.json()
    return { message: json }
  },

  auth: {
    async login(email, password) {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const { token, email: userEmail } = await res.json()
      localStorage.setItem('crm_token', token)
      localStorage.setItem('crm_user', userEmail)
    },
    async logout() {
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    },
    getUser() {
      return localStorage.getItem('crm_user')
    },
  },
}
```

---

### Spring Boot (Java)

```js
// frontend/src/api/adapters/spring.js
const BASE = import.meta.env.VITE_BACKEND_URL

export const SpringAdapter = {
  async request(method, endpoint, data, params) {
    const url = new URL(`${BASE}/api/${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, v)
      })
    }

    const res = await fetch(url.toString(), {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('crm_token')}`,
      },
      body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    })

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const json = await res.json()
    return { message: json }
  },

  auth: {
    async login(email, password) {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const { token, username } = await res.json()
      localStorage.setItem('crm_token', token)
      localStorage.setItem('crm_user', username)
    },
    async logout() {
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    },
    getUser() {
      return localStorage.getItem('crm_user')
    },
  },
}
```

---

## Endpoint Reference

All endpoints the CRM uses are catalogued in [`frontend/src/api/endpoints.js`](./frontend/src/api/endpoints.js).

The key ones for a minimal working CRM:

| Key | Frappe endpoint | What it does |
|---|---|---|
| `getUsers` | `crm.api.session.get_users` | List of CRM users |
| `getData` | `crm.api.doc.get_data` | Paginated list of any doctype |
| `getFields` | `crm.api.doc.get_fields` | Field definitions for a doctype |
| `getFilterableFields` | `crm.api.doc.get_filterable_fields` | Fields available as filters |
| `getSortOptions` | `crm.api.doc.sort_options` | Fields available for sorting |
| `getQuickFilters` | `crm.api.doc.get_quick_filters` | Pinned quick-filter fields |
| `getViews` | `crm.api.views.get_views` | Saved views (list/kanban/group-by) |
| `getFieldsLayout` | `crm.fcrm.doctype.crm_fields_layout...` | Form field layout |
| `getDoc` | `frappe.client.get` | Fetch single record |
| `insertDoc` | `frappe.client.insert` | Create new record |
| `setValue` | `frappe.client.set_value` | Update a field |
| `deleteDoc` | `frappe.client.delete` | Delete a record |

---

## Response Format

frappe-ui expects all responses wrapped in `{ message: <data> }`.

```js
// List of records
{ message: [{ name: 'LEAD-001', first_name: 'John', ... }] }

// Single record
{ message: { name: 'LEAD-001', first_name: 'John', ... } }

// Boolean
{ message: true }

// Error — throw instead of returning
throw new Error('Not found')
```

Your adapter's `request()` method is responsible for this wrapping. The components never see raw HTTP responses.
