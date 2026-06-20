import './index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createDialog } from './utils/dialogs'
import { initSocket } from './socket'
import router from './router'
import translationPlugin from './translation'
import App from './App.vue'
import { setAdapter } from './api'
import { RESTAdapter } from './api/adapters/rest'

import {
  FrappeUI,
  Button,
  Input,
  TextInput,
  FormControl,
  ErrorMessage,
  Dialog,
  Alert,
  Badge,
  setConfig,
  frappeRequest,
  FeatherIcon,
} from 'frappe-ui'

import { telemetryPlugin } from 'frappe-ui/frappe'

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

// In dev mode, seed the user_id cookie so frappe-ui's internal sessionUser()
// (which reads document.cookie directly) sees a valid user. Without this,
// useOnboarding() returns undefined and AppSidebar destructures it → crash.
if (import.meta.env.VITE_DEV_USER) {
  document.cookie = `user_id=${import.meta.env.VITE_DEV_USER}; path=/`
}

// Wire up the REST adapter — translates all UI calls to your backend's REST API.
// Set VITE_BACKEND_URL in your .env and implement the routes from API_SPEC.md.
setAdapter(RESTAdapter)

setConfig('resourceFetcher', (options) =>
  RESTAdapter.request(options.method || 'GET', options.url, options.body, options.params),
)

const pinia = createPinia()
const app = createApp(App)

app.use(FrappeUI)
app.use(pinia)
app.use(router)
app.use(translationPlugin)
app.use(telemetryPlugin, { app_name: 'crm' })

for (const key in globalComponents) {
  app.component(key, globalComponents[key])
}

app.config.globalProperties.$dialog = createDialog

function mountApp() {
  const socket = initSocket()
  app.config.globalProperties.$socket = socket
  app.mount('#app')

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
    mountApp()
  })
} else {
  mountApp()
}
