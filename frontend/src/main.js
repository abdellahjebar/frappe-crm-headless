import './index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createDialog } from './utils/dialogs'
import { initSocket } from './socket'
import router from './router'
import translationPlugin from './translation'
import App from './App.vue'
import { setAdapter } from './api'
import { setTranslations } from './translation'
import { RESTAdapter } from './api/adapters/rest'
import { MockAdapter } from './api/adapters/mock/index.js'

import { FrappeUI, Button, Input, TextInput, FormControl, ErrorMessage, Dialog, Alert, Badge, setConfig, frappeRequest, FeatherIcon } from 'frappe-ui'

import { useQuery } from '@/composables/useQuery'

const globalComponents = {
  Button,
  TextInput,
  Input,
  FormControl,
  ErrorMessage,
  Dialog,
  Alert,
  Badge,
  FeatherIcon,
}

// In dev mode, seed the user_id cookie so FrappeAdapter.getUser() and
// frappe-ui components that read it directly see a valid user identity.
if (import.meta.env.VITE_DEV_USER) {
  document.cookie = `user_id=${import.meta.env.VITE_DEV_USER}; path=/`
}

// Frappe normally injects window.frappe.boot at page load. frappe-ui's
// formatDate and numberFormat helpers read sysdefaults from it — without this
// every date/currency cell in the list throws "Cannot read 'date_format'".
if (import.meta.env.VITE_MOCK === 'true') {
  // CRM's own src/utils/index.js reads window.sysdefaults directly (not frappe.boot).
  window.sysdefaults = {
    date_format: 'yyyy-mm-dd',
    time_format: 'HH:mm:ss',
    number_format: '#,###.##',
    currency: 'USD',
    float_precision: 2,
  }

  // frappe-ui's call() uses frappeRequest which calls window.fetch directly.
  // Intercept all /api/method/* requests so they hit our mock adapter instead
  // of the missing backend — prevents 500 errors from unhandled API calls.
  const _originalFetch = window.fetch
  window.fetch = async function mockFetch(resource, init) {
    const url = typeof resource === 'string' ? resource
      : resource instanceof URL ? resource.href
      : resource.url
    const m = url.match(/\/api\/method\/([^?]+)/)
    if (m) {
      const endpoint = decodeURIComponent(m[1])
      let body = {}
      if (init?.body) {
        try {
          body = typeof init.body === 'string'
            ? Object.fromEntries(new URLSearchParams(init.body))
            : JSON.parse(init.body)
        } catch {}
      }
      try {
        const result = await MockAdapter.request('POST', endpoint, body, {})
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (e) {
        return new Response(
          JSON.stringify({ exc_type: 'ValidationError', exception: e.message }),
          { status: 417, headers: { 'Content-Type': 'application/json' } },
        )
      }
    }
    return _originalFetch(resource, init)
  }
}

// Set VITE_MOCK=true to run with in-memory fake data (no backend needed).
// Set VITE_BACKEND_URL in your .env and implement the routes from API_SPEC.md for production.
const activeAdapter = import.meta.env.VITE_MOCK === 'true' ? MockAdapter : RESTAdapter

setAdapter(activeAdapter)

setConfig('resourceFetcher', async (options) => {
  const result = await activeAdapter.request(
    options.method || 'GET',
    options.url,
    options.body,
    options.params,
  )
  // frappe-ui's built-in frappeRequest returns data.message already unwrapped.
  // A custom resourceFetcher must do the same — createResource passes the
  // fetcher's return value directly to transform() without any unwrapping.
  return result?.message ?? result
})

const pinia = createPinia()
const app = createApp(App)

// Disable frappe-ui's built-in socket (socketio.js hardcodes port 9000).
// We manage $socket ourselves in mountApp() via src/socket.js.
app.use(FrappeUI, { socketio: false })
app.use(pinia)
app.use(router)
app.use(translationPlugin)

for (const key in globalComponents) {
  app.component(key, globalComponents[key])
}

app.config.globalProperties.$dialog = createDialog

const _noopSocket = { on() {}, off() {}, emit() {} }

function mountApp() {
  const socket = initSocket() || _noopSocket
  app.config.globalProperties.$socket = socket
  app.mount('#app')

  window.addEventListener('crm:auth:expired', () => {
    router.replace({ name: 'Login' })
  })

  if (import.meta.env.DEV) {
    window.$dialog = createDialog
  }
}

app.config.errorHandler = (err) => {
  console.error('[Vue Error]', err)
}

if (import.meta.env.DEV && window.frappe_dev_context_url) {
  frappeRequest({ url: window.frappe_dev_context_url }).then((values) => {
    for (const key in values) window[key] = values[key]
    // Feed Frappe's boot translations into our agnostic translation layer
    if (values.__messages) setTranslations(values.__messages)
    mountApp()
  })
} else {
  mountApp()
}
