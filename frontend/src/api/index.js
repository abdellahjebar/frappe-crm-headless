/**
 * Adapter registry — the single injection point for backend integrations.
 *
 * Usage:
 *   import { setAdapter } from '@/api'
 *   import { FrappeAdapter } from '@/api/adapters/frappe'
 *   setAdapter(FrappeAdapter)          // in main.js, before app.mount()
 *
 * To integrate a custom backend, implement the adapter interface (see adapters/rest.js)
 * and call setAdapter() with your implementation.
 */

let _adapter = null

/**
 * Register the backend adapter. Must be called before the app mounts.
 * @param {object} adapter - Object implementing the adapter interface
 */
export function setAdapter(adapter) {
  validateAdapter(adapter)
  _adapter = adapter
}

/**
 * Retrieve the active adapter. Throws if none has been registered.
 */
export function getAdapter() {
  if (!_adapter) {
    throw new Error(
      '[crm-ui] No adapter registered. Call setAdapter() in main.js before mounting the app.\n' +
      'See src/api/adapters/rest.js for an example.',
    )
  }
  return _adapter
}

/**
 * Make an HTTP request through the active adapter.
 * This is the single function all stores and composables use.
 *
 * @param {string} method   - HTTP method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
 * @param {string} endpoint - Backend endpoint (key from endpoints.js or raw path)
 * @param {object} [data]   - Request body (POST/PUT/PATCH)
 * @param {object} [params] - Query parameters (GET)
 * @returns {Promise<any>}
 */
export function request(method, endpoint, data, params) {
  return getAdapter().request(method, endpoint, data, params)
}

/**
 * Shorthand helpers
 */
export const http = {
  get:    (endpoint, params)  => request('GET',    endpoint, undefined, params),
  post:   (endpoint, data)    => request('POST',   endpoint, data),
  put:    (endpoint, data)    => request('PUT',    endpoint, data),
  patch:  (endpoint, data)    => request('PATCH',  endpoint, data),
  delete: (endpoint)          => request('DELETE', endpoint),
}

function validateAdapter(adapter) {
  const missing = []
  if (typeof adapter?.request !== 'function') missing.push('request(method, endpoint, data, params)')
  if (typeof adapter?.auth?.login   !== 'function') missing.push('auth.login(email, password)')
  if (typeof adapter?.auth?.logout  !== 'function') missing.push('auth.logout()')
  if (typeof adapter?.auth?.getUser !== 'function') missing.push('auth.getUser()')
  if (missing.length) {
    throw new Error(
      `[crm-ui] Adapter is missing required methods:\n  - ${missing.join('\n  - ')}\n` +
      'See src/api/adapters/rest.js for the full interface.',
    )
  }
}
