/**
 * Central config — single source of truth for all environment-dependent values.
 *
 * Priority order (first defined wins):
 *   1. VITE_* environment variables  (.env files, CI, Docker)
 *   2. window.*  globals             (Frappe Jinja template injection)
 *   3. Empty string fallback         (app boots, features degrade gracefully)
 *
 * Frappe users: set nothing — Frappe populates window.* before the app loads.
 * Everyone else: create frontend/.env.development from .env.example and fill in your values.
 */
export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL ?? window.backendUrl ?? '',
  socketUrl:  import.meta.env.VITE_SOCKET_URL  ?? window.socketUrl  ?? '',
  siteName:   import.meta.env.VITE_SITE_NAME   ?? window.site_name  ?? '',
  csrfToken:  import.meta.env.VITE_CSRF_TOKEN  ?? window.csrf_token ?? '',
}
