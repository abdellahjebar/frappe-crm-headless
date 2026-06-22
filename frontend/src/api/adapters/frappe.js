/**
 * Frappe Adapter — default adapter, keeps the original Frappe CRM working unchanged.
 *
 * Uses frappe-ui's frappeRequest under the hood, which hits /api/method/* endpoints
 * and handles Frappe's response envelope ({ message: ... }), CSRF tokens, and cookies.
 *
 * Frappe users: this is already wired up in main.js. Nothing to configure.
 */
import { frappeRequest } from 'frappe-ui'

export const FrappeAdapter = {
  /**
   * Make a request to a Frappe method endpoint.
   * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} method
   * @param {string} endpoint - Frappe dot-notation method path (e.g. 'crm.api.session.get_users')
   *                            or short alias (e.g. 'login', 'logout')
   * @param {object} [data]   - POST body / method params
   * @param {object} [params] - Additional query params
   */
  request(method, endpoint, data, params) {
    return frappeRequest({
      url: endpoint,
      method,
      params,
      body: data,
    })
  },

  /**
   * Upload a file using Frappe's /api/method/upload_file endpoint.
   * options: { doctype, docname, private, fieldname }
   */
  async upload(file, options = {}) {
    const form = new FormData()
    form.append('file', file, file.name)
    if (options.doctype)  form.append('doctype',  options.doctype)
    if (options.docname)  form.append('docname',  options.docname)
    if (options.fieldname) form.append('fieldname', options.fieldname)
    form.append('is_private', options.private ? '1' : '0')

    const res = await frappeRequest({
      url: 'upload_file',
      method: 'POST',
      body: form,
    })
    return res?.message ?? res
  },

  auth: {
    /**
     * Log in using Frappe's cookie-based session.
     * Sets the user_id cookie on success.
     */
    login(email, password) {
      return frappeRequest({
        url: 'login',
        method: 'POST',
        body: { usr: email, pwd: password },
      })
    },

    /**
     * Log out of the Frappe session.
     */
    logout() {
      return frappeRequest({ url: 'logout' })
    },

    /**
     * Read the current user from Frappe's session cookie.
     * Returns null if not logged in or if user is Guest.
     */
    getUser() {
      const cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
      const userId = cookies.get('user_id')
      return userId && userId !== 'Guest' ? userId : null
    },
  },
}
