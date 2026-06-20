/**
 * REST Adapter — connects the CRM UI to any backend that implements API_SPEC.md.
 *
 * Set VITE_BACKEND_URL in your .env file, implement the routes in API_SPEC.md,
 * and this adapter handles all the translation between the UI and your backend.
 *
 * This is the default adapter. No changes needed here unless your backend
 * deviates from the standard spec.
 */
import { config } from '@/config'

const TOKEN_KEY = 'crm_token'
const USER_KEY  = 'crm_user'

const getToken = () => localStorage.getItem(TOKEN_KEY)
const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
const clearAuth = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) }

// ─── Doctype → REST path ─────────────────────────────────────────────────────

const DOCTYPE_PATHS = {
  'CRM Lead':             'leads',
  'CRM Deal':             'deals',
  'Contact':              'contacts',
  'CRM Organization':     'organizations',
  'FCRM Note':            'notes',
  'CRM Task':             'tasks',
  'CRM Call Log':         'call-logs',
  'CRM View Settings':    'views',
  'CRM Notification':     'notifications',
  'CRM Fields Layout':    'fields-layouts',
  'CRM Dashboard':        'dashboards',
  'Assignment Rule':      'assignment-rules',
  'Email Account':        'email-accounts',
  'Email Template':       'email-templates',
  'CRM Telephony Agent':  'telephony-agents',
  'CRM Communication Status': 'communication-statuses',
  'CRM Lead Source':      'lead-sources',
  'CRM Lead Status':      'lead-statuses',
  'CRM Deal Status':      'deal-statuses',
  'CRM Lost Reason':      'lost-reasons',
  'CRM Industry':         'industries',
  'CRM Territory':        'territories',
}

function dtPath(doctype) {
  return DOCTYPE_PATHS[doctype] || doctype.toLowerCase().replace(/\s+/g, '-')
}

// ─── Frappe endpoint → REST route ────────────────────────────────────────────

function mapToREST(endpoint, data, params) {
  const d = data || {}
  const p = params || {}

  switch (endpoint) {

    // ── Auth ──────────────────────────────────────────────────────────────────
    case 'login':
      return { method: 'POST', path: '/auth/login', body: { email: d.usr, password: d.pwd } }
    case 'logout':
      return { method: 'POST', path: '/auth/logout' }

    // ── Generic document CRUD ─────────────────────────────────────────────────
    case 'frappe.client.get':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}` }

    case 'frappe.client.insert':
      return {
        method: 'POST',
        path: `/${dtPath((d.doc || d).doctype)}`,
        body: d.doc || d,
      }

    case 'frappe.client.set_value': {
      const dt = d.doctype || p.doctype
      const name = d.name || p.name
      const body = typeof (d.fieldname || p.fieldname) === 'object'
        ? (d.fieldname || p.fieldname)
        : { [d.fieldname || p.fieldname]: d.value ?? p.value }
      return { method: 'PATCH', path: `/${dtPath(dt)}/${name}`, body }
    }

    case 'frappe.client.delete':
      return { method: 'DELETE', path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}` }

    case 'frappe.client.get_list':
      return {
        method: 'GET',
        path: `/${dtPath(d.doctype || p.doctype)}`,
        query: {
          filters: d.filters || p.filters,
          fields:  d.fields  || p.fields,
          limit:   d.limit   || p.limit,
          order_by: d.order_by || p.order_by,
          ...p,
        },
      }

    case 'frappe.client.rename_doc':
      return {
        method: 'PATCH',
        path: `/${dtPath(d.doctype || p.doctype)}/${d.old_name || p.old_name}/rename`,
        body: { new_name: d.new_name || p.new_name },
      }

    case 'frappe.client.get_doc_permissions':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}/permissions` }

    case 'frappe.desk.form.load.getdoctype':
      return { method: 'GET', path: `/meta/${dtPath(d.doctype || p.doctype)}` }

    // ── List data (main list/kanban/group-by view) ────────────────────────────
    case 'crm.api.doc.get_data': {
      const doctype = d.doctype || p.doctype
      return {
        method: 'GET',
        path: `/${dtPath(doctype)}/data`,
        query: {
          filters:         d.filters,
          order_by:        d.order_by,
          page_length:     d.page_length,
          page_size:       d.page_size,
          columns:         d.columns,
          rows:            d.rows,
          view_type:       d.view_type,
          group_by_field:  d.group_by_field,
          column_field:    d.column_field,
          title_field:     d.title_field,
          kanban_columns:  d.kanban_columns,
          kanban_fields:   d.kanban_fields,
        },
      }
    }

    // ── Field metadata ────────────────────────────────────────────────────────
    case 'crm.api.doc.get_fields':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/fields` }

    case 'crm.api.doc.get_filterable_fields':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/fields/filterable` }

    case 'crm.api.doc.get_group_by_fields':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/fields/group-by` }

    case 'crm.api.doc.sort_options':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/fields/sortable` }

    // ── Quick filters ─────────────────────────────────────────────────────────
    case 'crm.api.doc.get_quick_filters':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/quick-filters` }

    case 'crm.api.doc.update_quick_filters':
      return {
        method: 'PUT',
        path: `/${dtPath(d.doctype || p.doctype)}/quick-filters`,
        body: { filters: d.quick_filters || p.quick_filters },
      }

    // ── Assignments ───────────────────────────────────────────────────────────
    case 'crm.api.doc.get_assigned_users':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}/assigned-users` }

    case 'crm.api.doc.remove_assignments':
      return { method: 'DELETE', path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}/assignments` }

    case 'frappe.desk.form.assign_to.add':
      return {
        method: 'POST',
        path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}/assign`,
        body: { users: d.assign_to || p.assign_to },
      }

    // ── Linked docs ───────────────────────────────────────────────────────────
    case 'crm.api.doc.get_linked_docs_of_document':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}/linked-docs` }

    // ── Fields layout ─────────────────────────────────────────────────────────
    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_fields_layout':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/layout` }

    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_sidepanel_sections':
      return { method: 'GET', path: `/${dtPath(d.doctype || p.doctype)}/layout/sidepanel` }

    // ── Views ─────────────────────────────────────────────────────────────────
    case 'crm.api.views.get_views':
      return { method: 'GET', path: '/views', query: { doctype: d.doctype || p.doctype } }

    // ── Users & session ───────────────────────────────────────────────────────
    case 'crm.api.session.get_users':
      return { method: 'GET', path: '/users' }

    case 'crm.api.session.get_organizations':
      return { method: 'GET', path: '/organizations/list' }

    case 'crm.api.invite_by_email':
      return { method: 'POST', path: '/users/invite', body: { email: d.email || p.email } }

    case 'crm.api.user.add_existing_users':
      return { method: 'POST', path: '/users/add', body: d }

    case 'crm.api.user.change_password':
      return { method: 'POST', path: '/users/change-password', body: d }

    case 'crm.api.get_user_signature':
      return { method: 'GET', path: '/users/me/signature' }

    case 'frappe.model.utils.user_settings.save':
      return { method: 'POST', path: '/user-settings', body: d }

    case 'frappe.core.doctype.user.user.get_timezones':
      return { method: 'GET', path: '/timezones' }

    // ── Notifications ─────────────────────────────────────────────────────────
    case 'crm.api.notifications.get_notifications':
      return { method: 'GET', path: '/notifications' }

    case 'crm.api.notifications.mark_as_read':
      return { method: 'PATCH', path: `/notifications/${d.name || p.name}/read` }

    // ── Activities ────────────────────────────────────────────────────────────
    case 'crm.api.activities.get_activities':
      return {
        method: 'GET',
        path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}/activities`,
      }

    // ── Contacts ──────────────────────────────────────────────────────────────
    case 'crm.api.contact.search_emails':
      return { method: 'GET', path: '/contacts/search', query: { query: d.txt || p.txt } }

    case 'crm.api.contact.get_linked_deals':
      return { method: 'GET', path: `/contacts/${d.contact || p.contact}/deals` }

    // ── Deals ─────────────────────────────────────────────────────────────────
    case 'crm.fcrm.doctype.crm_deal.crm_deal.create_deal':
      return { method: 'POST', path: '/deals', body: d }

    case 'crm.fcrm.doctype.crm_deal.api.get_deal_contacts':
      return { method: 'GET', path: `/deals/${d.deal || p.deal}/contacts` }

    // ── Call logs ─────────────────────────────────────────────────────────────
    case 'crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log':
      return { method: 'GET', path: `/call-logs/${d.name || p.name}` }

    // ── Dashboard ─────────────────────────────────────────────────────────────
    case 'crm.api.dashboard.get_dashboard':
      return { method: 'GET', path: `/dashboards/${d.name || p.name}` }

    case 'crm.api.dashboard.get_chart':
      return {
        method: 'GET',
        path: `/dashboards/${d.dashboard || p.dashboard}/charts/${d.chart_name || p.chart_name}`,
      }

    case 'crm.api.dashboard.reset_to_default':
      return { method: 'POST', path: `/dashboards/${d.name || p.name}/reset` }

    // ── Assignment rules ──────────────────────────────────────────────────────
    case 'crm.api.assignment_rule.get_assignment_rules_list':
      return { method: 'GET', path: '/assignment-rules' }

    case 'crm.api.assignment_rule.duplicate_assignment_rule':
      return { method: 'POST', path: `/assignment-rules/${d.name || p.name}/duplicate` }

    // ── Files ─────────────────────────────────────────────────────────────────
    case 'crm.api.delete_attachment':
      return { method: 'DELETE', path: `/files/${d.name || p.name}` }

    case 'crm.api.get_file_uploader_defaults':
      return { method: 'GET', path: '/files/defaults' }

    // ── Search ────────────────────────────────────────────────────────────────
    case 'frappe.desk.search.search_link':
      return {
        method: 'GET',
        path: '/search',
        query: { doctype: d.doctype || p.doctype, query: d.txt || p.txt, filters: d.filters || p.filters },
      }

    // ── Like ──────────────────────────────────────────────────────────────────
    case 'frappe.desk.like.toggle_like':
      return {
        method: 'POST',
        path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}/like`,
        body: { liked: (d.add || p.add) === 'Yes' },
      }

    // ── Settings ──────────────────────────────────────────────────────────────
    case 'crm.api.settings.create_email_account':
      return { method: 'POST', path: '/settings/email-accounts', body: d }

    // ── WhatsApp (optional integration) ───────────────────────────────────────
    case 'crm.api.whatsapp.is_whatsapp_enabled':
      return { method: 'GET', path: '/integrations/whatsapp/status' }

    case 'crm.api.whatsapp.is_whatsapp_installed':
      return { method: 'GET', path: '/integrations/whatsapp/installed' }

    case 'crm.api.whatsapp.get_whatsapp_messages':
      return {
        method: 'GET',
        path: `/${dtPath(d.doctype || p.doctype)}/${d.name || p.name}/whatsapp`,
      }

    case 'crm.api.whatsapp.create_whatsapp_message':
      return { method: 'POST', path: '/whatsapp/messages', body: d }

    case 'crm.api.whatsapp.react_on_whatsapp_message':
      return { method: 'POST', path: `/whatsapp/messages/${d.message_id || p.message_id}/react`, body: d }

    case 'crm.api.whatsapp.send_whatsapp_template':
      return { method: 'POST', path: '/whatsapp/templates/send', body: d }

    // ── Telephony (optional integration) ──────────────────────────────────────
    case 'crm.integrations.api.is_call_integration_enabled':
      return { method: 'GET', path: '/integrations/telephony/status' }

    case 'crm.integrations.api.get_contact_by_phone_number':
      return { method: 'GET', path: `/contacts/by-phone/${d.phone_number || p.phone_number}` }

    case 'crm.integrations.api.add_note_to_call_log':
      return { method: 'POST', path: `/call-logs/${d.call_log || p.call_log}/notes`, body: d }

    case 'crm.integrations.api.add_task_to_call_log':
      return { method: 'POST', path: `/call-logs/${d.call_log || p.call_log}/tasks`, body: d }

    case 'crm.integrations.exotel.handler.make_a_call':
      return { method: 'POST', path: '/integrations/exotel/call', body: d }

    // ── No-ops (Frappe-specific, not applicable) ──────────────────────────────
    case 'frappe.apps.get_apps':
    case 'frappe.integrations.frappe_providers.frappecloud_billing.current_site_info':
    case 'crm.demo.api.clear_demo_data':
      return null

    // ── Unknown — pass through ────────────────────────────────────────────────
    default:
      console.warn(`[crm-ui] Unmapped endpoint: "${endpoint}" — passing through as-is`)
      return { method: method || 'POST', path: `/${endpoint}`, body: data }
  }
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

export const RESTAdapter = {
  async request(method, endpoint, data, params) {
    const mapped = mapToREST(endpoint, data, params)

    if (!mapped) {
      return { message: null }
    }

    const url = new URL(`${config.backendUrl}/api${mapped.path}`)

    if (mapped.query) {
      Object.entries(mapped.query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
        }
      })
    }

    const token = getToken()
    const res = await fetch(url.toString(), {
      method: mapped.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: mapped.body && mapped.method !== 'GET' ? JSON.stringify(mapped.body) : undefined,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || res.statusText)
    }

    const json = await res.json()
    return { message: json }
  },

  auth: {
    async login(email, password) {
      const res = await fetch(`${config.backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Invalid credentials')
      }
      const { token, user } = await res.json()
      setToken(token)
      localStorage.setItem(USER_KEY, user)
      document.cookie = `user_id=${user}; path=/`
    },

    async logout() {
      const token = getToken()
      await fetch(`${config.backendUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      }).catch(() => {})
      clearAuth()
    },

    getUser() {
      return localStorage.getItem(USER_KEY)
    },
  },
}
