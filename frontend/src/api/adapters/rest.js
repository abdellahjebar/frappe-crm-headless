/**
 * Generic REST Adapter — template for integrating any REST backend.
 *
 * Copy this file, fill in the implementation details for your backend,
 * then call setAdapter(MyAdapter) in main.js.
 *
 * For a full integration guide see: ADAPTERS.md
 */
import { config } from '@/config'

// Token storage key — change to whatever your backend uses
const TOKEN_KEY = 'crm_auth_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export const RestAdapter = {
  /**
   * Make an HTTP request to your backend.
   *
   * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} method
   * @param {string} endpoint - Value from endpoints.js (e.g. 'users', 'leads')
   * @param {object} [data]   - Request body
   * @param {object} [params] - Query string params
   *
   * Adjust the URL construction, headers, and response parsing to match your backend.
   */
  async request(method, endpoint, data, params) {
    const url = new URL(`${config.backendUrl}/api/${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const headers = {
      'Content-Type': 'application/json',
    }

    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw err
    }

    return res.json()
  },

  auth: {
    /**
     * Log in — POST credentials, store the returned token.
     * Adjust the response field (here: `token`) to match your backend.
     */
    async login(email, password) {
      const res = await fetch(`${config.backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw await res.json()
      const data = await res.json()
      setToken(data.token)           // adjust field name to match your API
      localStorage.setItem('crm_user', data.user.email)
    },

    /**
     * Log out — clear the token and notify the backend if needed.
     */
    async logout() {
      const token = getToken()
      if (token) {
        await fetch(`${config.backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => {})
      }
      clearToken()
      localStorage.removeItem('crm_user')
    },

    /**
     * Return the current user's email/identifier, or null if not logged in.
     */
    getUser() {
      return localStorage.getItem('crm_user')
    },
  },
}
