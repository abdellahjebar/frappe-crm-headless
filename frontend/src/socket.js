import { io } from 'socket.io-client'
import { config } from './config'

/**
 * Resolve the socket server URL.
 *
 * Priority:
 *  1. VITE_SOCKET_URL / config.socketUrl  — explicit override (any backend)
 *  2. Frappe convention                   — reconstructed from window.* globals
 *  3. null                                — no socket, real-time features disabled
 */
function resolveSocketUrl() {
  if (config.socketUrl) return config.socketUrl

  // Frappe fallback: build URL from injected window globals
  if (window.site_name && window.socketio_port) {
    const host = window.location.hostname
    const port = window.location.port ? `:${window.socketio_port}` : ''
    const protocol = port ? 'http' : 'https'
    return `${protocol}://${host}${port}/${window.site_name}`
  }

  return null
}

const NOOP_SOCKET = { on() {}, off() {}, emit() {} }

export function initSocket() {
  // No real-time features in mock mode — return a no-op so socket.on/off calls
  // in Notifications.vue don't crash when $socket is assigned.
  if (import.meta.env.VITE_MOCK === 'true') return NOOP_SOCKET

  const url = resolveSocketUrl()
  if (!url) return NOOP_SOCKET

  const socket = io(url, {
    withCredentials: true,
    reconnectionAttempts: 5,
  })

  // Phase D: wire adapter.realtime?.handleEvent(eventName, data) here so adapters
  // can subscribe to backend-specific socket events without importing frappe-ui.

  return socket
}
