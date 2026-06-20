import { io } from 'socket.io-client'
import { getCachedListResource, getCachedResource } from 'frappe-ui'
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

export function initSocket() {
  const url = resolveSocketUrl()
  if (!url) return null   // socket is optional — app works without it

  const socket = io(url, {
    withCredentials: true,
    reconnectionAttempts: 5,
  })

  socket.on('refetch_resource', (data) => {
    if (data.cache_key) {
      const resource =
        getCachedResource(data.cache_key) ||
        getCachedListResource(data.cache_key)
      if (resource) resource.reload()
    }
  })

  return socket
}
