import { getAdapter } from '@/api'

/**
 * Drop-in replacement for frappe-ui's `call()`.
 * Routes through the active adapter instead of making a direct XHR to Frappe.
 *
 * Usage matches frappe-ui: call(endpoint, args, { onSuccess, onError })
 * Returns a Promise that resolves to the unwrapped message value.
 */
export async function call(endpoint, args = {}, callbacks = {}) {
  try {
    const result = await getAdapter().request('POST', endpoint, args, args)
    const value = Object.prototype.hasOwnProperty.call(result ?? {}, 'message')
      ? result.message
      : result
    callbacks.onSuccess?.(value)
    return value
  } catch (err) {
    callbacks.onError?.(err)
    throw err
  }
}
