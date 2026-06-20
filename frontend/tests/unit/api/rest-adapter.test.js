import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mock config so tests don't need env vars ─────────────────────────────────
vi.mock('@/config', () => ({
  config: { backendUrl: 'http://localhost:8000' },
}))

// ─── Mock schemas so we test the adapter in isolation ────────────────────────
vi.mock('@/api/schemas', () => ({
  validate: (endpoint, data) => data,
}))

// ─── Import after mocks ───────────────────────────────────────────────────────
// We test mapToREST indirectly through the adapter's request() by mocking fetch.
// For mapToREST directly, we extract it via a re-export trick in the test.

describe('mapToREST — endpoint mapping', () => {
  // We test mapping by checking what URL fetch is called with.

  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ name: 'TEST-001' }),
    })
    globalThis.fetch = fetchMock
    globalThis.localStorage = {
      _store: {},
      getItem: (k) => globalThis.localStorage._store[k] ?? null,
      setItem: (k, v) => { globalThis.localStorage._store[k] = v },
      removeItem: (k) => { delete globalThis.localStorage._store[k] },
    }
    globalThis.localStorage._store = {}
    globalThis.window = globalThis.window || {}
    globalThis.window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  async function callAdapter(endpoint, data, params) {
    const { RESTAdapter } = await import('@/api/adapters/rest')
    return RESTAdapter.request('POST', endpoint, data, params)
  }

  it('frappe.client.get → GET /api/{doctype}/{name}', async () => {
    await callAdapter('frappe.client.get', { doctype: 'CRM Lead', name: 'LEAD-001' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/leads/LEAD-001',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('frappe.client.insert → POST /api/{doctype}', async () => {
    await callAdapter('frappe.client.insert', { doc: { doctype: 'CRM Lead', first_name: 'John' } })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/leads',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('frappe.client.set_value → PATCH /api/{doctype}/{name}', async () => {
    await callAdapter('frappe.client.set_value', {
      doctype: 'CRM Lead', name: 'LEAD-001', fieldname: 'status', value: 'Open',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/leads/LEAD-001',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('frappe.client.delete → DELETE /api/{doctype}/{name}', async () => {
    await callAdapter('frappe.client.delete', { doctype: 'CRM Deal', name: 'DEAL-001' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/deals/DEAL-001',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('crm.api.doc.get_data → GET /api/{doctype}/data', async () => {
    await callAdapter('crm.api.doc.get_data', { doctype: 'CRM Lead', order_by: 'modified desc' })
    const url = fetchMock.mock.calls[0][0]
    expect(url).toContain('/api/leads/data')
    expect(fetchMock).toHaveBeenCalledWith(url, expect.objectContaining({ method: 'GET' }))
  })

  it('crm.api.session.get_users → GET /api/users', async () => {
    await callAdapter('crm.api.session.get_users', {})
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/users',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('crm.api.views.get_views → GET /api/views', async () => {
    await callAdapter('crm.api.views.get_views', { doctype: 'CRM Lead' })
    const url = fetchMock.mock.calls[0][0]
    expect(url).toContain('/api/views')
    expect(url).toContain('doctype=CRM+Lead')
  })

  it('crm.api.activities.get_activities → GET /api/{doctype}/{name}/activities', async () => {
    await callAdapter('crm.api.activities.get_activities', { doctype: 'CRM Lead', name: 'LEAD-001' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/leads/LEAD-001/activities',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('crm.api.notifications.get_notifications → GET /api/notifications', async () => {
    await callAdapter('crm.api.notifications.get_notifications', {})
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/notifications',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('no-op endpoints return { message: null } without fetching', async () => {
    const result = await callAdapter('frappe.apps.get_apps', {})
    expect(result).toEqual({ message: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('unknown endpoint throws with helpful message', async () => {
    await expect(callAdapter('some.unknown.endpoint', {}))
      .rejects.toThrow('Unmapped endpoint: "some.unknown.endpoint"')
  })

  it('doctype path falls back for unknown doctypes', async () => {
    await callAdapter('frappe.client.get', { doctype: 'Custom DocType', name: 'DOC-001' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/custom-doctype/DOC-001',
      expect.objectContaining({ method: 'GET' }),
    )
  })
})

describe('RESTAdapter — 401 handling', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    })
    globalThis.localStorage = {
      _store: { crm_token: 'old-token', crm_user: 'user@test.com' },
      getItem: (k) => globalThis.localStorage._store[k] ?? null,
      setItem: (k, v) => { globalThis.localStorage._store[k] = v },
      removeItem: (k) => { delete globalThis.localStorage._store[k] },
    }
    globalThis.window = globalThis.window || {}
    globalThis.window.dispatchEvent = vi.fn()
  })

  it('clears auth on 401', async () => {
    const { RESTAdapter } = await import('@/api/adapters/rest')
    await expect(RESTAdapter.request('GET', 'crm.api.session.get_users', {}))
      .rejects.toThrow('Session expired')
    expect(globalThis.localStorage.getItem('crm_token')).toBeNull()
    expect(globalThis.localStorage.getItem('crm_user')).toBeNull()
  })

  it('fires crm:auth:expired event on 401', async () => {
    const { RESTAdapter } = await import('@/api/adapters/rest')
    await expect(RESTAdapter.request('GET', 'crm.api.session.get_users', {}))
      .rejects.toThrow()
    expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'crm:auth:expired' }),
    )
  })
})

describe('RESTAdapter — auth', () => {
  beforeEach(() => {
    globalThis.localStorage = {
      _store: {},
      getItem: (k) => globalThis.localStorage._store[k] ?? null,
      setItem: (k, v) => { globalThis.localStorage._store[k] = v },
      removeItem: (k) => { delete globalThis.localStorage._store[k] },
    }
    globalThis.localStorage._store = {}
    globalThis.document = { cookie: '' }
    globalThis.window = globalThis.window || {}
    globalThis.window.dispatchEvent = vi.fn()
  })

  it('login stores token and user', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'abc123', user: 'user@test.com' }),
    })
    const { RESTAdapter } = await import('@/api/adapters/rest')
    await RESTAdapter.auth.login('user@test.com', 'password')
    expect(globalThis.localStorage.getItem('crm_token')).toBe('abc123')
    expect(globalThis.localStorage.getItem('crm_user')).toBe('user@test.com')
  })

  it('login throws on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    })
    const { RESTAdapter } = await import('@/api/adapters/rest')
    await expect(RESTAdapter.auth.login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('getUser returns stored user', async () => {
    globalThis.localStorage._store = { crm_user: 'user@test.com' }
    const { RESTAdapter } = await import('@/api/adapters/rest')
    expect(RESTAdapter.auth.getUser()).toBe('user@test.com')
  })

  it('getUser returns null when not logged in', async () => {
    const { RESTAdapter } = await import('@/api/adapters/rest')
    expect(RESTAdapter.auth.getUser()).toBeNull()
  })
})
